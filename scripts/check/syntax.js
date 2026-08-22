/**
 * syntax.js — `node --check` over every first-party JS file.
 *
 * This is the floor named in DECISIONS.md D-007. It answers exactly one question: will
 * Node parse this file? It says nothing about whether the code is correct. That is worth
 * having anyway, because most of this repo is never bundled — vite only walks the client
 * graph, so a syntax error in server/ or graphene-news/ is discovered by a user hitting
 * the route.
 *
 * Node 20 parses ESM here without help: probed with a fixture using top-level `await` and
 * `import.meta.url`, `node --check` exits 0 with or without a type:module package.json.
 *
 * Two files in this repo already fail. They are baselined in known-broken.json so that
 * the check passes on a clean tree; see that file for the reasoning and the evidence.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { listFiles, abs, REPO_ROOT, ROOTS } from './files.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function loadKnownBroken() {
  const file = path.join(HERE, 'known-broken.json');
  try {
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    return new Map((json.files ?? []).map((e) => [e.path, e]));
  } catch (err) {
    // A malformed baseline must not silently become an empty baseline — that would turn
    // "two known failures" into "two new failures" or, worse, hide a real one.
    throw new Error(`could not read scripts/check/known-broken.json: ${err.message}`);
  }
}

function checkOne(relPath) {
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      ['--check', abs(relPath)],
      { cwd: REPO_ROOT, maxBuffer: 1024 * 1024 },
      (err, _stdout, stderr) => {
        if (!err) return resolve({ file: relPath, ok: true });
        resolve({ file: relPath, ok: false, stderr: String(stderr).trim() });
      }
    );
  });
}

/**
 * `node --check` is one process per file, so 200+ files serially is dead time. Measured on
 * this repo (212 files, 18 cores): 4,510 ms serial vs 483 ms at 12-way — a 9.3x saving,
 * and the difference between a check people run and one they skip. The pool is bounded
 * rather than unbounded so this does not fork 212 node processes at once.
 */
async function runPool(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await worker(items[i]);
    }
  });
  await Promise.all(runners);
  return results;
}

/** Trim node's syntax-error dump to the two lines a human needs. */
function briefError(stderr) {
  const lines = stderr.split('\n');
  const errLine = lines.find((l) => /^\w*(Error|Warning):/.test(l.trim()));
  const locLine = lines.find((l) => /^\/.*:\d+$/.test(l.trim()));
  const loc = locLine ? path.relative(REPO_ROOT, locLine.trim()) : null;
  return [loc, errLine?.trim()].filter(Boolean).join(' — ') || lines[0];
}

export async function runSyntax() {
  const started = Date.now();
  const { files, missingRoots } = listFiles();
  const knownBroken = loadKnownBroken();

  const concurrency = Math.max(2, Math.min(os.cpus().length, 12));
  const results = await runPool(files, concurrency, checkOne);

  const failures = [];
  const knownStillBroken = [];
  const knownNowFixed = [];

  for (const r of results) {
    const isKnown = knownBroken.has(r.file);
    if (!r.ok && isKnown) knownStillBroken.push(r);
    else if (!r.ok) failures.push(r);
    else if (isKnown) knownNowFixed.push(r.file);
  }

  const lines = [];
  lines.push(`node --check on ${files.length} file(s), ${concurrency}-way parallel`);
  lines.push(`  roots: ${ROOTS.join(', ')} (+3 root config files)`);
  lines.push('  excluded: node_modules, dist, dist-*, .claude, uploads, and root test-*.js');

  if (missingRoots.length) {
    lines.push(`WARNING: configured root(s) not present: ${missingRoots.join(', ')}`);
  }

  if (knownStillBroken.length) {
    lines.push('');
    lines.push(
      `${knownStillBroken.length} known-broken file(s) still failing ` +
        '(baselined in scripts/check/known-broken.json, NOT counted as failures):'
    );
    for (const r of knownStillBroken) {
      lines.push(`  ${r.file} — ${knownBroken.get(r.file).error}`);
    }
  }

  let ok = true;

  if (knownNowFixed.length) {
    ok = false;
    lines.push('');
    lines.push('FAIL: file(s) listed in scripts/check/known-broken.json now parse cleanly.');
    lines.push('      Delete their entries from that file — the baseline must only shrink.');
    for (const f of knownNowFixed) lines.push(`  ${f}`);
  }

  if (failures.length) {
    ok = false;
    lines.push('');
    lines.push(`FAIL: ${failures.length} file(s) do not parse:`);
    for (const r of failures) {
      lines.push(`  ${r.file}`);
      lines.push(`    ${briefError(r.stderr)}`);
    }
  }

  if (ok) {
    lines.push('');
    lines.push(`${files.length - knownStillBroken.length} file(s) parse cleanly.`);
  }

  return { name: 'syntax (node --check)', ok, ms: Date.now() - started, lines };
}

const isMain =
  process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`;

if (isMain) {
  const result = await runSyntax();
  for (const line of result.lines) console.log(line);
  process.exit(result.ok ? 0 : 1);
}
