/**
 * imports.js — does every relative import actually point at a file that exists?
 *
 * Why this earns its place
 * ------------------------
 * `node --check` parses one file in isolation and never follows an import, so a typo'd or
 * stale relative path sails through it. Vite would fail the build for a broken import in
 * the *client* graph — but `server/**` and `graphene-news/**` are never bundled by
 * anything, so nothing in this repo checks their imports until the route is hit at
 * runtime and returns a 500. This gate closes that hole for the cost of a few hundred
 * `statSync` calls.
 *
 * Scope, deliberately narrow — a gate that fails must never be wrong:
 *   - Relative specifiers only (`./x`, `../y`). Bare specifiers like `express` or the
 *     `@shared` alias depend on node_modules layout, vite alias config and conditional
 *     exports; resolving those properly is a package resolver's job, not this file's, and
 *     guessing would produce exactly the false failure this gate cannot afford.
 *   - Static `import` / `export ... from`, plus `import()` with a literal argument. A
 *     computed `import(someVar)` is not statically knowable and is skipped.
 *   - The `<script type="module" src>` tags in the two HTML entry points, because this
 *     repo mounts its entry modules from HTML rather than from JS.
 */

import fs from 'node:fs';
import path from 'node:path';
import { listFiles, abs, REPO_ROOT } from './files.js';

let parseAst = null;
try {
  ({ parseAst } = await import('rollup/parseAst'));
} catch {
  /* reported by the gate below */
}

const HTML_ENTRIES = ['client/index.html', 'client/proforma-embed.html'];

/** Vite and Node both allow an extensionless specifier or a directory with index.js. */
const CANDIDATE_SUFFIXES = ['', '.js', '.mjs', '.cjs', '.json', '/index.js', '/index.mjs'];

export function resolves(fromFileAbs, specifier) {
  const base = path.resolve(path.dirname(fromFileAbs), specifier);
  for (const suffix of CANDIDATE_SUFFIXES) {
    try {
      if (fs.statSync(base + suffix).isFile()) return base + suffix;
    } catch {
      /* next candidate */
    }
  }
  return null;
}

function isRelative(spec) {
  return typeof spec === 'string' && (spec.startsWith('./') || spec.startsWith('../'));
}

/** Collect every relative specifier in a parsed module, with its line number. */
function collectSpecifiers(src) {
  const ast = parseAst(src);
  const starts = [0];
  for (let i = 0; i < src.length; i++) if (src.charCodeAt(i) === 10) starts.push(i + 1);
  const lineOf = (offset) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };

  const found = [];
  const visit = (node) => {
    if (node === null || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeof node.type !== 'string') return;

    if (
      (node.type === 'ImportDeclaration' ||
        node.type === 'ExportNamedDeclaration' ||
        node.type === 'ExportAllDeclaration') &&
      node.source?.type === 'Literal'
    ) {
      found.push({ spec: node.source.value, line: lineOf(node.source.start) });
    }
    if (node.type === 'ImportExpression' && node.source?.type === 'Literal') {
      found.push({ spec: node.source.value, line: lineOf(node.source.start) });
    }
    // Some parser versions emit dynamic import as CallExpression{callee:{type:'Import'}}.
    // Handle both shapes rather than guessing which one rollup produces today.
    if (
      node.type === 'CallExpression' &&
      node.callee?.type === 'Import' &&
      node.arguments?.[0]?.type === 'Literal'
    ) {
      found.push({ spec: node.arguments[0].value, line: lineOf(node.arguments[0].start) });
    }

    for (const key of Object.keys(node)) {
      if (key === 'start' || key === 'end' || key === 'type') continue;
      visit(node[key]);
    }
  };
  visit(ast);
  return found.filter((f) => isRelative(f.spec));
}

function htmlScriptSources(html) {
  const out = [];
  const re = /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (/^(https?:)?\/\//.test(m[1])) continue; // CDN
    out.push(m[1]);
  }
  return out;
}

export async function runImports() {
  const started = Date.now();

  if (!parseAst) {
    return {
      name: 'relative import resolution',
      ok: true,
      ms: Date.now() - started,
      lines: ['SKIPPED — `rollup/parseAst` unavailable; run `npm install`.'],
    };
  }

  const { files } = listFiles();
  const broken = [];
  let scannedFiles = 0;
  let scannedSpecifiers = 0;

  for (const rel of files) {
    const absPath = abs(rel);
    let specs;
    try {
      specs = collectSpecifiers(fs.readFileSync(absPath, 'utf8'));
    } catch {
      continue; // unparseable — the syntax gate owns that, and names the file
    }
    scannedFiles++;
    for (const { spec, line } of specs) {
      scannedSpecifiers++;
      if (!resolves(absPath, spec)) broken.push({ file: rel, line, spec });
    }
  }

  // HTML entry points: this repo mounts modules from <script> tags, so a stale src here
  // breaks the app without breaking any JS file.
  let scannedHtml = 0;
  for (const htmlRel of HTML_ENTRIES) {
    const htmlAbs = path.join(REPO_ROOT, htmlRel);
    if (!fs.existsSync(htmlAbs)) continue;
    scannedHtml++;
    const html = fs.readFileSync(htmlAbs, 'utf8');
    for (const src of htmlScriptSources(html)) {
      scannedSpecifiers++;
      const spec = src.startsWith('/') ? `.${src}` : src.startsWith('.') ? src : `./${src}`;
      if (!resolves(htmlAbs, spec)) broken.push({ file: htmlRel, line: null, spec: src });
    }
  }

  const lines = [];
  const unread = files.length - scannedFiles;
  lines.push(
    `${scannedSpecifiers} relative specifier(s) across ${scannedFiles} of ${files.length} ` +
      `JS file(s) and ${scannedHtml} HTML entry point(s)`
  );
  if (unread) {
    lines.push(`  ${unread} file(s) unparseable — their imports were NOT checked`);
  }

  if (broken.length === 0) {
    lines.push('all resolve to a file on disk.');
  } else {
    lines.push('');
    lines.push(`FAIL: ${broken.length} import(s) do not resolve:`);
    for (const b of broken) {
      lines.push(`  ${b.file}${b.line ? `:${b.line}` : ''}  ->  ${b.spec}`);
    }
  }

  return {
    name: 'relative import resolution',
    ok: broken.length === 0,
    ms: Date.now() - started,
    lines,
  };
}

const isMain =
  process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`;

if (isMain) {
  const result = await runImports();
  for (const line of result.lines) console.log(line);
  process.exit(result.ok ? 0 : 1);
}
