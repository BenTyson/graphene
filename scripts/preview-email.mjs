#!/usr/bin/env node
/**
 * Render a Listmonk transactional template locally with a real digest payload
 * so you can eyeball it in a browser before pasting into Listmonk admin.
 *
 * Usage:
 *   node scripts/preview-email.mjs --type weekly --user <userId>      > out.html
 *   node scripts/preview-email.mjs --type due-tomorrow --user <id>    > out.html
 *   node scripts/preview-email.mjs --type overdue --user <id>         > out.html
 *   node scripts/preview-email.mjs --type weekly --email me@x.com     > out.html
 *   node scripts/preview-email.mjs --type weekly --user <id> --mock   > out.html
 *
 * --mock skips the DB and substitutes a fixture payload — useful when you
 * just want to sanity-check template HTML without seeding data.
 *
 * Implements a tiny subset of Go templates (what Listmonk uses): {{ .path }},
 * {{ if EXPR }}/{{ else }}/{{ end }}, {{ range EXPR }}/{{ end }}, {{ with EXPR }},
 * {{ eq A B }}, and {{ . }} / {{ .field }} inside ranges.
 */

import { PrismaClient } from '@prisma/client';
import {
  listEligibleUsers,
  buildWeeklyDigest,
  buildDueTomorrow,
  buildOverduePayloads,
} from '../server/services/emailDigest.js';
import { emailTemplates } from '../shared/emailTemplates.js';

// ---- arg parsing -----------------------------------------------------------

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

// ---- minimal Go-template renderer ------------------------------------------

function tokenize(tpl) {
  const tokens = [];
  let i = 0;
  while (i < tpl.length) {
    const start = tpl.indexOf('{{', i);
    if (start === -1) {
      tokens.push({ type: 'text', value: tpl.slice(i) });
      break;
    }
    if (start > i) tokens.push({ type: 'text', value: tpl.slice(i, start) });
    const end = tpl.indexOf('}}', start);
    if (end === -1) throw new Error('Unclosed {{ at offset ' + start);
    tokens.push({ type: 'action', value: tpl.slice(start + 2, end).trim() });
    i = end + 2;
  }
  return tokens;
}

function parse(tokens, pos = 0) {
  const nodes = [];
  while (pos < tokens.length) {
    const t = tokens[pos];
    if (t.type === 'text') { nodes.push(t); pos++; continue; }
    const v = t.value;
    const head = v.split(/\s+/)[0];
    if (head === 'end' || head === 'else') {
      return { nodes, pos: pos + 1, stopper: head };
    }
    if (head === 'if' || head === 'with' || head === 'range') {
      const expr = v.slice(head.length).trim();
      const a = parse(tokens, pos + 1);
      let b = { nodes: [], pos: a.pos };
      if (a.stopper === 'else') {
        b = parse(tokens, a.pos);
      }
      nodes.push({ type: head, expr, thenNodes: a.nodes, elseNodes: b.nodes });
      pos = b.pos;
      continue;
    }
    nodes.push({ type: 'expr', expr: v });
    pos++;
  }
  return { nodes, pos, stopper: null };
}

function walk(obj, parts) {
  let v = obj;
  for (const p of parts) {
    if (v == null) return undefined;
    v = v[p];
  }
  return v;
}

function evalExpr(expr, scope, root) {
  expr = expr.trim();

  // eq A B
  const m = expr.match(/^eq\s+(.+?)\s+(.+)$/);
  if (m) {
    // eslint-disable-next-line eqeqeq
    return evalExpr(m[1], scope, root) == evalExpr(m[2], scope, root);
  }

  if (/^-?\d+(\.\d+)?$/.test(expr)) return Number(expr);
  if (/^"[^"]*"$/.test(expr)) return expr.slice(1, -1);

  if (expr === '.') return scope;
  if (expr.startsWith('.')) {
    const parts = expr.slice(1).split('.');
    // Absolute paths begin with Tx or Subscriber per Listmonk; everything else
    // is relative to the current scope (e.g. inside a {{ range }}).
    if (parts[0] === 'Tx' || parts[0] === 'Subscriber') return walk(root, parts);
    return walk(scope, parts);
  }
  return undefined;
}

function isTruthy(v) {
  if (v == null) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v).length > 0;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return v.length > 0;
  return Boolean(v);
}

function renderNodes(nodes, scope, root) {
  let out = '';
  for (const n of nodes) {
    if (n.type === 'text') {
      out += n.value;
    } else if (n.type === 'expr') {
      const v = evalExpr(n.expr, scope, root);
      out += v == null ? '<no value>' : String(v);
    } else if (n.type === 'if') {
      const v = evalExpr(n.expr, scope, root);
      out += isTruthy(v)
        ? renderNodes(n.thenNodes, scope, root)
        : renderNodes(n.elseNodes, scope, root);
    } else if (n.type === 'with') {
      const v = evalExpr(n.expr, scope, root);
      out += isTruthy(v)
        ? renderNodes(n.thenNodes, v, root)
        : renderNodes(n.elseNodes, scope, root);
    } else if (n.type === 'range') {
      const v = evalExpr(n.expr, scope, root);
      if (Array.isArray(v) && v.length) {
        for (const item of v) out += renderNodes(n.thenNodes, item, root);
      } else {
        out += renderNodes(n.elseNodes, scope, root);
      }
    }
  }
  return out;
}

function renderGoTemplate(tpl, root) {
  const tokens = tokenize(tpl);
  const { nodes } = parse(tokens);
  return renderNodes(nodes, root, root);
}

// ---- mock fixtures ---------------------------------------------------------

const MOCK = {
  weekly: {
    user_name: 'Ben Tyson',
    week_label: 'Week of 2026-04-27',
    overdue: [
      { id: 'a', title: 'Submit Q1 supercap test results', priority: 'HIGH', days_overdue: 4, due_date: '2026-04-23', goal: { id: 'g1', title: 'Supercap milestone' } },
      { id: 'b', title: 'Reply to MIT collaboration email', priority: 'MEDIUM', days_overdue: 2, due_date: '2026-04-25', goal: null },
    ],
    overdue_count: 2,
    due_this_week: [
      { id: 'c', title: 'Calibrate XRD machine', priority: 'MEDIUM', due_date: '2026-04-29', goal: { id: 'g2', title: 'Lab capacity' } },
      { id: 'd', title: 'Order hemp shipment for May run', priority: 'HIGH', due_date: '2026-05-01', goal: null },
    ],
    due_this_week_count: 2,
    recently_done: [
      { id: 'e', title: 'Finalize investor deck v3' },
      { id: 'f', title: 'Onboard new science team member' },
    ],
    recently_done_count: 2,
    goal_progress: [
      { id: 'g1', title: 'Supercap milestone', total: 8, done: 5, pct: 63 },
      { id: 'g2', title: 'Lab capacity', total: 4, done: 1, pct: 25 },
    ],
    goal_progress_count: 2,
    upcoming_due_soon_count: 6,
    total_count: 4,
  },
  'due-tomorrow': {
    user_name: 'Ben Tyson',
    tasks: [
      { id: 'a', title: 'Calibrate XRD machine', priority: 'HIGH', due_date: '2026-04-28', goal: { id: 'g2', title: 'Lab capacity' } },
      { id: 'b', title: 'Submit MCB shipment manifest', priority: 'MEDIUM', due_date: '2026-04-28', goal: null },
    ],
    count: 2,
    title: null,
    due_date_label: '2026-04-28',
  },
  overdue: {
    user_name: 'Ben Tyson',
    days: 3,
    tasks: [
      { id: 'a', title: 'Submit Q1 supercap test results', priority: 'HIGH', due_date: '2026-04-24', goal: { id: 'g1', title: 'Supercap milestone' } },
    ],
    count: 1,
    title: 'Submit Q1 supercap test results',
  },
};

// ---- payload assembly ------------------------------------------------------

async function findUser(prisma, args) {
  if (args.user) return prisma.user.findUnique({ where: { id: args.user } });
  if (args.email) return prisma.user.findUnique({ where: { email: args.email } });
  return null;
}

async function buildPayload(type, args) {
  if (args.mock) {
    return { data: MOCK[type] };
  }
  const prisma = new PrismaClient();
  try {
    const user = await findUser(prisma, args);
    if (!user) throw new Error('User not found (use --user <id> or --email <addr>)');
    const allUsers = await listEligibleUsers();
    const eligible = allUsers.find((u) => u.id === user.id);
    if (!eligible) throw new Error('User is not eligible (inactive or no email)');

    if (type === 'weekly') return buildWeeklyDigest(eligible);
    if (type === 'due-tomorrow') return buildDueTomorrow(eligible);
    if (type === 'overdue') {
      const list = await buildOverduePayloads(eligible);
      if (!list.length) return null;
      return list[0];
    }
    throw new Error(`Unknown type: ${type}`);
  } finally {
    await prisma.$disconnect();
  }
}

// ---- main ------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv);
  const type = args.type;
  if (!type || !['weekly', 'due-tomorrow', 'overdue'].includes(type)) {
    process.stderr.write('Usage: preview-email.mjs --type weekly|due-tomorrow|overdue [--user <id> | --email <addr> | --mock]\n');
    process.exit(2);
  }

  const tplKey = type === 'weekly' ? 'weeklyDigest'
    : type === 'due-tomorrow' ? 'dueTomorrow'
    : 'overdue';
  const template = emailTemplates[tplKey];

  let payload;
  try {
    payload = await buildPayload(type, args);
  } catch (err) {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exit(1);
  }

  if (!payload) {
    process.stderr.write('No payload — user opted out, has no qualifying tasks, or list was empty.\n');
    process.stderr.write('Try --mock for a fixture render.\n');
    process.exit(1);
  }

  const root = {
    Subscriber: {
      Email: payload.to || (args.email || 'preview@example.com'),
      Name: payload.data.user_name || '',
    },
    Tx: { Data: payload.data },
  };

  const subject = renderGoTemplate(template.subject, root);
  const html = renderGoTemplate(template.html, root);

  process.stderr.write(`Subject: ${subject}\n`);
  process.stdout.write(html);
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err.stack || err.message}\n`);
  process.exit(1);
});
