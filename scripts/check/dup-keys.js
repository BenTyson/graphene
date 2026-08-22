/**
 * dup-keys.js — find keys defined twice in the same object literal.
 *
 * Why this exists
 * ---------------
 * In a JS object literal the last definition of a key wins, silently. There is no
 * warning from Node, from vite, or from anything else this repo runs. The main Alpine
 * object in client/src/js/app-refactored.js is one object literal thousands of lines
 * long, so a method redefined 900 lines below its first definition is invisible to a
 * reader. One such collision disabled 12 of 13 "Export CSV" buttons for months.
 *
 * How it works
 * ------------
 * Real parsing, not regex. A line-based regex cannot tell a method key
 * (`    saveTask() {`) from a control-flow statement (`    if (x) {`), and cannot tell
 * code from the inside of a template literal — of which this repo has thousands of
 * lines, since every tab is an HTML template string. The measured false-positive rate
 * of the regex approach is in notes/W1-CHECK-SUITE.md; it is not close.
 *
 * The parser is `rollup/parseAst`, already installed as a hard dependency of vite
 * (which `npm run build` requires). No new package is added. If it is ever absent this
 * gate reports SKIPPED loudly rather than silently passing.
 *
 * Status: REPORT-ONLY. It never fails the check. See scripts/check/index.js for why,
 * and notes/W1-CHECK-SUITE.md for the baseline and the promotion criterion.
 */

import fs from 'node:fs';
import { listFiles, abs } from './files.js';

// ---------------------------------------------------------------------------
// parser
// ---------------------------------------------------------------------------

let parseAst = null;
let parserError = null;
try {
  ({ parseAst } = await import('rollup/parseAst'));
} catch (err) {
  parserError = err;
}

export const PARSER_AVAILABLE = parseAst !== null;

// ---------------------------------------------------------------------------
// position helpers
// ---------------------------------------------------------------------------

function lineIndex(src) {
  const starts = [0];
  for (let i = 0; i < src.length; i++) {
    if (src.charCodeAt(i) === 10) starts.push(i + 1);
  }
  return starts;
}

function toLine(starts, offset) {
  let lo = 0;
  let hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid] <= offset) lo = mid;
    else hi = mid - 1;
  }
  return { line: lo + 1, column: offset - starts[lo] + 1 };
}

// ---------------------------------------------------------------------------
// key normalisation
// ---------------------------------------------------------------------------

/**
 * `{ a: 1 }`, `{ 'a': 2 }` and `{ "a": 3 }` are the same key. `{ [a]: 1 }` is not
 * statically knowable and is skipped entirely — a computed key is never reported.
 *
 * @returns {string|null} normalised key, or null if this property has no static key
 */
function staticKeyName(prop) {
  if (prop.computed) return null;
  const key = prop.key;
  if (!key) return null;
  if (key.type === 'Identifier') return key.name;
  if (key.type === 'Literal') {
    if (key.value === null && key.raw !== 'null') return null;
    return String(key.value);
  }
  if (key.type === 'PrivateIdentifier') return `#${key.name}`;
  return null;
}

/**
 * `{ get a() {}, set a() {} }` defines the key once, in two halves. Legal, intentional,
 * and NOT a duplicate. Anything else that repeats a name is.
 */
function isAccessorPair(occurrences) {
  if (occurrences.length !== 2) return false;
  const kinds = occurrences.map((o) => o.kind).sort();
  return kinds[0] === 'get' && kinds[1] === 'set';
}

// ---------------------------------------------------------------------------
// AST walk
// ---------------------------------------------------------------------------

const SKIP_WALK_KEYS = new Set(['start', 'end', 'type', 'loc', 'range', 'parent']);

/**
 * Generic ESTree walk. Calls visit(node, ctx) for each ObjectExpression, where ctx
 * carries the object-literal nesting depth and a breadcrumb of enclosing named scopes.
 */
function walk(node, ctx, visit) {
  if (node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const child of node) walk(child, ctx, visit);
    return;
  }
  if (typeof node.type !== 'string') return;

  let childCtx = ctx;

  if (node.type === 'ObjectExpression') {
    visit(node, ctx);
    childCtx = { ...ctx, depth: ctx.depth + 1 };
  }

  const name = enclosingName(node);
  if (name) childCtx = { ...childCtx, path: [...childCtx.path, name] };

  for (const key of Object.keys(node)) {
    if (SKIP_WALK_KEYS.has(key)) continue;
    walk(node[key], childCtx, visit);
  }
}

/** A human-readable breadcrumb, so a reported line can be located by eye. */
function enclosingName(node) {
  switch (node.type) {
    case 'VariableDeclarator':
      return node.id?.type === 'Identifier' ? node.id.name : null;
    case 'FunctionDeclaration':
    case 'ClassDeclaration':
      return node.id?.type === 'Identifier' ? `${node.id.name}()` : null;
    case 'Property':
      return node.computed ? null : staticKeyName(node);
    case 'MethodDefinition':
      return node.computed ? null : `${staticKeyName(node)}()`;
    case 'AssignmentExpression':
      // `window.grapheneApp = function () { return { ... } }` — the whole Alpine app
      // object lives under one of these, so without this case every finding in
      // app-refactored.js would report its container as "(top level)".
      return memberName(node.left);
    default:
      return null;
  }
}

function memberName(node) {
  if (!node) return null;
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'MemberExpression' && !node.computed) {
    const object = memberName(node.object);
    const prop = node.property?.type === 'Identifier' ? node.property.name : null;
    if (object && prop) return `${object}.${prop}`;
    return prop;
  }
  return null;
}

// ---------------------------------------------------------------------------
// per-file analysis
// ---------------------------------------------------------------------------

/**
 * @returns {{ findings: Array, parseError: string|null }}
 */
export function analyseSource(src, relPath) {
  if (!PARSER_AVAILABLE) return { findings: [], parseError: null };

  let ast;
  try {
    ast = parseAst(src);
  } catch (err) {
    // A file that will not parse is the syntax gate's problem, not ours. But say so —
    // returning an empty finding list for an unreadable file is a silent blind spot.
    return { findings: [], parseError: err.message };
  }

  const starts = lineIndex(src);
  const findings = [];

  walk(ast, { depth: 0, path: [] }, (objNode, ctx) => {
    /** @type {Map<string, Array>} */
    const seen = new Map();

    for (const prop of objNode.properties) {
      if (prop.type !== 'Property') continue; // SpreadElement etc. are not keys
      const name = staticKeyName(prop);
      if (name === null) continue;
      if (!seen.has(name)) seen.set(name, []);
      seen.get(name).push({
        kind: prop.kind, // 'init' | 'get' | 'set'
        method: prop.method === true,
        ...toLine(starts, prop.key.start),
      });
    }

    for (const [name, occurrences] of seen) {
      if (occurrences.length < 2) continue;
      if (isAccessorPair(occurrences)) continue;
      findings.push({
        file: relPath,
        key: name,
        depth: ctx.depth,
        container: ctx.path.length ? ctx.path.join(' > ') : '(top level)',
        occurrences,
        deadLines: occurrences.slice(0, -1).map((o) => o.line),
        winningLine: occurrences[occurrences.length - 1].line,
        allMethods: occurrences.every((o) => o.method),
      });
    }
  });

  return { findings, parseError: null };
}

// ---------------------------------------------------------------------------
// gate entry point
// ---------------------------------------------------------------------------

export async function runDupKeys() {
  const started = Date.now();

  if (!PARSER_AVAILABLE) {
    return {
      name: 'duplicate object keys',
      ok: true, // report-only; never fails the check
      skipped: true,
      ms: Date.now() - started,
      lines: [
        'SKIPPED — could not load `rollup/parseAst`.',
        `  ${parserError?.message ?? 'unknown error'}`,
        '  rollup ships as a dependency of vite; run `npm install` and re-run.',
      ],
      findings: [],
    };
  }

  const { files } = listFiles();
  const findings = [];
  let parsed = 0;
  const unparseable = [];

  for (const rel of files) {
    const src = fs.readFileSync(abs(rel), 'utf8');
    const { findings: f, parseError } = analyseSource(src, rel);
    if (parseError) {
      unparseable.push({ file: rel, message: parseError.split('\n')[0] });
      continue;
    }
    parsed++;
    findings.push(...f);
  }

  const byFile = new Map();
  for (const f of findings) byFile.set(f.file, (byFile.get(f.file) ?? 0) + 1);

  const lines = [];
  lines.push(`parsed ${parsed} of ${files.length} file(s)`);

  // Named, never just counted: a file this gate cannot read is a hole in its coverage,
  // and an unnamed hole is indistinguishable from a clean result.
  if (unparseable.length) {
    lines.push(
      `${unparseable.length} file(s) not parseable as ESM — NOT scanned for duplicate keys:`
    );
    for (const u of unparseable) lines.push(`  ${u.file}: ${u.message}`);
  }

  if (findings.length === 0) {
    lines.push('no duplicate object keys found.');
  } else {
    lines.push(
      `${findings.length} duplicate key(s) across ${byFile.size} file(s) ` +
        '— REPORT ONLY, does not fail the check:'
    );
    lines.push('');
    let currentFile = null;
    for (const f of findings) {
      if (f.file !== currentFile) {
        currentFile = f.file;
        lines.push(`  ${currentFile}`);
      }
      const spots = f.occurrences.map((o) => `L${o.line}`).join(', ');
      lines.push(
        `    ${f.key}  ${spots}  ->  L${f.winningLine} wins, ` +
          `L${f.deadLines.join('/')} dead   [depth ${f.depth}: ${f.container}]`
      );
    }
  }

  return {
    name: 'duplicate object keys',
    ok: true, // report-only by design. See the header comment and index.js.
    skipped: false,
    ms: Date.now() - started,
    lines,
    findings,
  };
}

// ---------------------------------------------------------------------------
// standalone CLI:  node scripts/check/dup-keys.js [--json]
// ---------------------------------------------------------------------------

const isMain =
  process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`;

if (isMain) {
  const result = await runDupKeys();
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(result.findings, null, 2));
  } else {
    for (const line of result.lines) console.log(line);
  }
}
