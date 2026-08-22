/**
 * build.js — runs the real Vite build and reads its output.
 *
 * Why not `npm run build`
 * ----------------------
 * `npm run build` is `vite build`, and vite.config.js sets `outDir: '../dist'` with
 * `emptyOutDir: true`. So `npm run build` *deletes and rewrites the repo's dist/*.
 * That is fine for a deploy and wrong for a check:
 *
 *   1. Under DECISIONS.md D-010 chips share one working directory, so two chips running
 *      the check at once would race on the same dist/ and each would see the other's
 *      half-written output.
 *   2. A command called `check` should not have side effects. Running it must not
 *      invalidate the dist/ a developer already had.
 *
 * So this gate invokes the same binary with the same config and the same rollup inputs,
 * changing exactly one thing: `--outDir`. Everything that could actually fail — module
 * resolution, the multi-entry rollup graph, PostCSS/Tailwind, minification — is
 * identical to the deploy path.
 *
 * The output directory defaults to a path under os.tmpdir(), NOT to a `dist-check`
 * directory inside the repo. .gitignore line 8 carries a trailing `#` comment after its
 * pattern, and gitignore has no trailing-comment syntax, so that per-chip build-output
 * pattern does not actually ignore anything (measured — see notes/W1-CHECK-SUITE.md).
 * Building outside the repo makes this gate independent of that bug rather than another
 * victim of it. Override with CHECK_OUT_DIR if you want to inspect the artefacts.
 *
 * Warnings are surfaced, never failed on. The build emits a chunk-size advisory on the
 * ~1.2 MB main bundle. It is pre-existing; failing on it would make the gate unpassable
 * on a clean tree on day one, which is how check suites get bypassed. It is printed on
 * every run so it stays visible.
 */

import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO_ROOT } from './files.js';

const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx';

export const OUT_DIR =
  process.env.CHECK_OUT_DIR || path.join(os.tmpdir(), 'graphene-check-build');

function runBuild() {
  return new Promise((resolve) => {
    // --emptyOutDir is required because outDir sits outside vite's root (./client);
    // without it vite refuses to clear the directory and warns instead.
    const args = ['vite', 'build', '--outDir', OUT_DIR, '--emptyOutDir'];
    const child = spawn(NPX, args, {
      cwd: REPO_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('error', (err) =>
      resolve({ code: -1, stdout, stderr: `${stderr}\nfailed to spawn npx: ${err.message}`, args })
    );
    child.on('close', (code) => resolve({ code, stdout, stderr, args }));
  });
}

/**
 * Vite colours its asset table even with FORCE_COLOR=0 / NO_COLOR=1, and the escape
 * sequences sit in the middle of the numbers. Strip them before parsing — without this
 * the gate silently matches nothing and reports itself blind.
 */
const ANSI = new RegExp(String.fromCharCode(27) + String.raw`\[[0-9;]*m`, 'g');
function stripAnsi(text) {
  return text.replace(ANSI, '');
}

/** Pull the `<dir>/assets/index-abc.js   1,179.99 kB | gzip: 178.59 kB` rows out. */
function emittedAssets(text) {
  const rows = [];
  for (const raw of text.split('\n')) {
    const m = raw.match(/^\s*(\S+\.(?:js|css|html))\s+([\d,.]+)\s*kB(?:\s*\S*\s*gzip:\s*([\d,.]+)\s*kB)?/);
    if (m) {
      rows.push({
        file: m[1],
        kb: Number(m[2].replace(/,/g, '')),
        gzipKb: m[3] ? Number(m[3].replace(/,/g, '')) : null,
      });
    }
  }
  return rows;
}

/** Vite prefixes advisories with `(!)`. Also catch the browserslist notice. */
function warnings(text) {
  const out = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('(!)')) out.push(line.replace(/^\(!\)\s*/, ''));
    if (/^Browserslist:/.test(line)) out.push(line);
  }
  return out;
}

export async function runBuildGate() {
  const started = Date.now();
  const { code, stdout, stderr, args } = await runBuild();
  const combined = stripAnsi(`${stdout}\n${stderr}`);
  const ms = Date.now() - started;

  const lines = [];
  const shown = `npx ${args.join(' ')}`;

  if (code !== 0) {
    lines.push(`FAIL: \`${shown}\` exited ${code}. Full output:`);
    lines.push('');
    for (const l of combined.split('\n')) lines.push(`  ${l}`);
    return { name: 'build (vite build)', ok: false, ms, lines };
  }

  const assets = emittedAssets(combined);
  const warns = warnings(combined);
  const builtIn = combined.split('\n').find((l) => /built in /.test(l));

  lines.push(`${shown}`);
  lines.push(`exited 0${builtIn ? ` — ${builtIn.trim()}` : ''}`);

  if (assets.length === 0) {
    // The build "passed" but produced nothing recognisable. Say so rather than printing
    // a reassuring green line: a parser that matches nothing looks identical to success.
    lines.push('WARNING: could not parse any emitted asset from the build output.');
    lines.push('         Vite\'s output format may have changed; this gate is now blind.');
  } else {
    // Vite prints the full outDir path on each row; that is a long tmpdir path here and
    // pushes the numbers off the screen. Show each asset relative to the outDir.
    const short = (f) => {
      const rel = path.relative(OUT_DIR, f);
      return rel && !rel.startsWith('..') ? rel : path.basename(f);
    };
    const biggest = assets.reduce((a, b) => (b.kb > a.kb ? b : a));
    lines.push(
      `${assets.length} asset(s) emitted; largest ${short(biggest.file)} at ${biggest.kb} kB`
    );
    for (const a of assets) {
      lines.push(
        `  ${short(a.file).padEnd(44)} ${String(a.kb).padStart(9)} kB` +
          (a.gzipKb !== null ? `  gzip ${a.gzipKb} kB` : '')
      );
    }
  }

  if (warns.length) {
    lines.push('');
    lines.push(`${warns.length} pre-existing build warning(s) — shown, NOT failed on:`);
    for (const w of warns) lines.push(`  ${w}`);
  }

  return { name: 'build (vite build)', ok: true, ms, lines };
}

const isMain =
  process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`;

if (isMain) {
  const result = await runBuildGate();
  for (const line of result.lines) console.log(line);
  process.exit(result.ok ? 0 : 1);
}
