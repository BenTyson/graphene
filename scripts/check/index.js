/**
 * `npm run check` — the project's check suite.
 *
 * Built by W1-CHECK-SUITE against DECISIONS.md D-007, which set the interim merge bar as:
 * the build passes with its output read, `node --check` passes on every changed JS file,
 * and the change has actually been run. This script automates the first two and adds two
 * checks neither of them can perform. It does NOT replace the "actually run it" half of
 * D-007 — nothing here starts a server or opens a browser, and the footer says so on
 * every green run so the distinction cannot quietly erode.
 *
 * Gates, in order — cheapest and most localising first, so a broken tree fails fast and
 * tells you where rather than handing you a bundler stack trace:
 *
 *   1. self-test  the detectors below still fire on known-bad input.        FAILS
 *   2. syntax     node --check on every first-party JS file.                FAILS
 *   3. imports    every relative import points at a real file.              FAILS
 *   4. dup-keys   keys defined twice in one object literal.            REPORT ONLY
 *   5. build      vite build, to its own out dir.                           FAILS
 *
 * Why dup-keys does not fail
 * --------------------------
 * When this was written the repo had 17 duplicate keys, all in app-refactored.js, and a
 * sibling chip (W1-APP-DEDUPE) was fixing them concurrently — the file was changing under
 * this measurement. A failing gate would have blocked the whole wave on that race.
 *
 * Promotion is deliberately left to a later wave and a different chip. The baseline, the
 * measured distribution, and the promotion criterion are in notes/W1-CHECK-SUITE.md. The
 * change itself is one line: delete 'duplicate object keys' from REPORT_ONLY below, and
 * flip `ok` in dup-keys.js to `findings.length === 0`.
 *
 * Usage:
 *   npm run check                        all gates
 *   npm run check -- --quick             skip the build (the other four only)
 *   node scripts/check/dup-keys.js       any gate standalone
 *   node scripts/check/dup-keys.js --json   machine-readable findings
 */

import { runSelfTest } from './self-test.js';
import { runSyntax } from './syntax.js';
import { runImports } from './imports.js';
import { runDupKeys } from './dup-keys.js';
import { runBuildGate } from './build.js';

const args = process.argv.slice(2);
const QUICK = args.includes('--quick');

/**
 * Gates that report but never fail. Kept as an explicit list here rather than a flag
 * buried in each module, so "what can actually block a merge" is one line to read.
 */
const REPORT_ONLY = new Set(['duplicate object keys']);

function fmtMs(ms) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

async function main() {
  const started = Date.now();
  const gates = [
    ['self-test', runSelfTest],
    ['syntax', runSyntax],
    ['imports', runImports],
    ['dup-keys', runDupKeys],
  ];
  if (!QUICK) gates.push(['build', runBuildGate]);

  console.log(
    `npm run check — ${gates.length} gate(s)${QUICK ? '  (--quick: build skipped)' : ''}`
  );

  const results = [];
  for (let i = 0; i < gates.length; i++) {
    const [key, fn] = gates[i];
    let result;
    try {
      result = await fn();
    } catch (err) {
      // A gate that crashes must fail loudly. Swallowing it would turn a broken checker
      // into a green check, which is strictly worse than having no checker at all.
      //
      // Note this uses the short key, not the gate's display name, so it deliberately
      // misses the REPORT_ONLY set: a report-only gate that THROWS still fails the check.
      // Reporting nothing because you crashed is not the same as reporting nothing
      // because there was nothing to report.
      result = {
        name: key,
        ok: false,
        ms: 0,
        lines: ['FAIL: the gate itself threw:', `  ${err.stack ?? err.message}`],
      };
    }
    results.push(result);
    console.log(`\n[${i + 1}/${gates.length}] ${result.name}\n${'-'.repeat(64)}`);
    for (const line of result.lines) console.log(line);
  }

  const totalMs = Date.now() - started;

  console.log(`\n${'='.repeat(64)}`);
  let failed = 0;
  for (const r of results) {
    let status;
    if (REPORT_ONLY.has(r.name)) status = 'REPORT';
    else if (r.ok) status = 'PASS  ';
    else {
      status = 'FAIL  ';
      failed++;
    }
    console.log(`  ${status}  ${r.name.padEnd(44)} ${fmtMs(r.ms).padStart(7)}`);
  }
  console.log('='.repeat(64));

  if (failed === 0) {
    console.log(`check PASSED in ${fmtMs(totalMs)}.`);
    if (QUICK) console.log('NOTE: --quick was used, so the build did NOT run.');
    console.log(
      'This does not satisfy DECISIONS.md D-007 on its own. D-007 also requires that the\n' +
        'change was actually RUN — curl against a locally started server, or the UI driven\n' +
        'in a browser — with the observed values recorded.'
    );
  } else {
    console.log(`check FAILED — ${failed} gate(s) failed in ${fmtMs(totalMs)}.`);
  }

  process.exit(failed === 0 ? 0 : 1);
}

await main();
