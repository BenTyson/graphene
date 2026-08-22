/**
 * self-test.js — proves the checker still catches the things it claims to catch.
 *
 * A check suite that has never been shown to fail is indistinguishable from a script that
 * prints "PASS". This gate feeds known-bad input to each detector and fails if the
 * detector stays quiet, and feeds known-good input and fails if it cries wolf.
 *
 * It runs first, and it CAN block a merge. That is deliberate: if the checker is broken,
 * every green result after it is worthless, so the right response is to stop rather than
 * to keep reporting reassuring numbers.
 *
 * This exists because the alternative is a chip pasting "I tested it by hand once" into a
 * notes file and the guarantee decaying from there. Fixtures live in memory or in
 * os.tmpdir(); nothing is ever written inside the repo.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { analyseSource, PARSER_AVAILABLE } from './dup-keys.js';
import { resolves } from './imports.js';

const cases = [];
function check(label, fn) {
  cases.push({ label, fn });
}

// --------------------------------------------------------------------------
// duplicate-key detector: true positives
// --------------------------------------------------------------------------

check('dup-keys flags a method redefined later in the same object literal', () => {
  const src = `
    window.app = function () {
      return {
        exportData() { return 'first'; },
        somethingElse: 1,
        exportData() { return 'second'; },
      };
    };
  `;
  const { findings } = analyseSource(src, 'fixture.js');
  if (findings.length !== 1) throw new Error(`expected 1 finding, got ${findings.length}`);
  if (findings[0].key !== 'exportData') throw new Error(`wrong key: ${findings[0].key}`);
  if (findings[0].deadLines.length !== 1) throw new Error('expected exactly one dead definition');
  if (findings[0].winningLine <= findings[0].deadLines[0]) {
    throw new Error('the LAST definition must be reported as the winner');
  }
});

check('dup-keys flags a duplicated plain state property, not just methods', () => {
  // More than half the real findings in app-refactored.js are `key: value` state
  // properties rather than methods. A detector that only saw methods would miss them.
  const src = `const o = { expanded: {}, other: 1, expanded: {} };`;
  const { findings } = analyseSource(src, 'fixture.js');
  if (findings.length !== 1) throw new Error(`expected 1 finding, got ${findings.length}`);
  if (findings[0].allMethods) throw new Error('should not be classified as methods');
});

check('dup-keys treats a quoted key and a bare key as the same key', () => {
  const { findings } = analyseSource(`const o = { alpha: 1, 'alpha': 2 };`, 'fixture.js');
  if (findings.length !== 1) throw new Error(`expected 1 finding, got ${findings.length}`);
});

check('dup-keys finds duplicates in a nested object literal', () => {
  const { findings } = analyseSource(`const o = { outer: { inner: 1, x: 2, inner: 3 } };`, 'f.js');
  if (findings.length !== 1) throw new Error(`expected 1 finding, got ${findings.length}`);
  if (findings[0].depth !== 1) throw new Error(`expected depth 1, got ${findings[0].depth}`);
});

check('dup-keys groups three occurrences into one finding with two dead lines', () => {
  const { findings } = analyseSource(`const o = { a: 1, a: 2, a: 3 };`, 'fixture.js');
  if (findings.length !== 1) throw new Error('expected 1 grouped finding');
  if (findings[0].occurrences.length !== 3) throw new Error('expected 3 occurrences');
  if (findings[0].deadLines.length !== 2) throw new Error('expected 2 dead definitions');
});

// --------------------------------------------------------------------------
// duplicate-key detector: the false positives a regex would produce
// --------------------------------------------------------------------------

check('dup-keys does NOT flag repeated `if (` at method indentation', () => {
  // The measured worst case for a line regex: `if` matched 372 times in
  // app-refactored.js. At four-space indent, `if (cond) {` is shaped exactly like
  // `methodName() {`.
  const src = `
    const o = {
      a() {
        if (x) { return 1; }
        if (y) { return 2; }
      },
      b() {
        if (x) { return 3; }
      },
    };
  `;
  const { findings } = analyseSource(src, 'fixture.js');
  if (findings.length !== 0) throw new Error(`false positive: ${JSON.stringify(findings)}`);
});

check('dup-keys does NOT flag identical keys in two DIFFERENT object literals', () => {
  const { findings } = analyseSource(`const a = { name: 1 }; const b = { name: 2 };`, 'f.js');
  if (findings.length !== 0) throw new Error('false positive across separate literals');
});

check('dup-keys does NOT flag a getter/setter pair', () => {
  const src = `const o = { get value() { return 1; }, set value(v) {} };`;
  const { findings } = analyseSource(src, 'fixture.js');
  if (findings.length !== 0) throw new Error('getter/setter pairs are legal, not duplicates');
});

check('dup-keys does NOT flag computed keys', () => {
  const { findings } = analyseSource(`const k = 'x'; const o = { [k]: 1, [k]: 2 };`, 'f.js');
  if (findings.length !== 0) throw new Error('computed keys are not statically knowable');
});

check('dup-keys does NOT parse the inside of a template-literal HTML string', () => {
  // This repo builds every tab as an HTML template string. Those strings are full of
  // `foo: bar` and `x() {` shaped text that must never be read as code.
  const src = [
    'const html = `',
    '  <div style="color: red; color: blue">',
    '    <span onclick="save() { }">a: 1, a: 2</span>',
    '  </div>',
    '`;',
    'const o = { real: 1 };',
  ].join('\n');
  const { findings } = analyseSource(src, 'fixture.js');
  if (findings.length !== 0) throw new Error('template-literal text must not be parsed as code');
});

check('dup-keys does NOT flag spread or shorthand that only looks repeated', () => {
  const src = `const base = {}; const a = 1; const o = { ...base, a, ...base };`;
  const { findings } = analyseSource(src, 'fixture.js');
  if (findings.length !== 0) throw new Error('spread elements are not keys');
});

check('dup-keys surfaces a parse error instead of silently finding nothing', () => {
  const { parseError } = analyseSource('const a = ;', 'fixture.js');
  if (!parseError) throw new Error('unparseable source must surface a parseError');
});

// --------------------------------------------------------------------------
// syntax gate
// --------------------------------------------------------------------------

check('node --check rejects a syntax error and accepts valid ESM', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'graphene-check-'));
  try {
    const bad = path.join(dir, 'bad.mjs');
    const good = path.join(dir, 'good.mjs');
    fs.writeFileSync(bad, 'export const a = ;\n');
    // Top-level await + import.meta: the ESM features this repo actually uses.
    fs.writeFileSync(good, 'export const a = 1;\nawait Promise.resolve(import.meta.url);\n');

    let rejected = false;
    try {
      execFileSync(process.execPath, ['--check', bad], { stdio: 'pipe' });
    } catch {
      rejected = true;
    }
    if (!rejected) throw new Error('node --check accepted a file with a syntax error');

    execFileSync(process.execPath, ['--check', good], { stdio: 'pipe' });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// --------------------------------------------------------------------------
// import resolution
// --------------------------------------------------------------------------

check('import resolver rejects a specifier with no file behind it', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'graphene-check-'));
  try {
    const from = path.join(dir, 'entry.js');
    fs.writeFileSync(from, '');
    fs.writeFileSync(path.join(dir, 'real.js'), '');
    fs.mkdirSync(path.join(dir, 'pkg'));
    fs.writeFileSync(path.join(dir, 'pkg', 'index.js'), '');

    if (resolves(from, './nope')) throw new Error('resolved a path that does not exist');
    if (!resolves(from, './real')) throw new Error('failed to resolve an extensionless import');
    if (!resolves(from, './real.js')) throw new Error('failed to resolve an explicit .js import');
    if (!resolves(from, './pkg')) throw new Error('failed to resolve a directory index import');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// --------------------------------------------------------------------------
// gate entry point
// --------------------------------------------------------------------------

export async function runSelfTest() {
  const started = Date.now();
  const lines = [];
  const failures = [];

  if (!PARSER_AVAILABLE) {
    return {
      name: 'self-test (does the checker still work?)',
      ok: false,
      ms: Date.now() - started,
      lines: [
        'FAIL: `rollup/parseAst` is unavailable, so the duplicate-key detector cannot be',
        '      exercised. Run `npm install` and try again.',
      ],
    };
  }

  for (const c of cases) {
    try {
      c.fn();
    } catch (err) {
      failures.push({ label: c.label, message: err.message });
    }
  }

  lines.push(`${cases.length} self-test case(s) against known-bad and known-good input`);

  if (failures.length) {
    lines.push('');
    lines.push(`FAIL: ${failures.length} self-test case(s) failed — the CHECKER is broken,`);
    lines.push('      so treat every gate below as unreliable until this is green.');
    for (const f of failures) {
      lines.push(`  ${f.label}`);
      lines.push(`    ${f.message}`);
    }
  } else {
    lines.push('all pass: each detector fires on bad input and stays quiet on good input.');
  }

  return {
    name: 'self-test (does the checker still work?)',
    ok: failures.length === 0,
    ms: Date.now() - started,
    lines,
  };
}

const isMain =
  process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`;

if (isMain) {
  const result = await runSelfTest();
  for (const line of result.lines) console.log(line);
  process.exit(result.ok ? 0 : 1);
}
