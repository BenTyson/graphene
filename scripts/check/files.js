/**
 * files.js — the one definition of "first-party JavaScript" used by every gate.
 *
 * Kept in one place on purpose: if the syntax gate and the duplicate-key gate
 * disagree about which files exist, their reported counts stop being comparable
 * and nobody can audit either number. Every gate prints the count it worked on.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), '../../..');

/** Directory trees walked recursively. */
export const ROOTS = [
  'client/src/js',
  'server',
  'shared',
  'scripts',
  // graphene-news is first-party and is NOT bundled by vite. server/routes/news.js
  // reaches it through `await import('../../graphene-news/backend/services/...')` at
  // seven call sites, so a syntax error in that tree surfaces only when a user hits
  // the news refresh route in production. That is exactly what this gate is for.
  'graphene-news',
];

/** Individual files outside the trees above that still break the toolchain if malformed. */
export const EXTRA_FILES = ['vite.config.js', 'tailwind.config.js', 'postcss.config.js'];

/**
 * Directory names never descended into.
 * `dist` is build output; `uploads` and `public/news-images` are runtime-written and
 * gitignored; `.claude` can contain harness worktrees, which are entire copies of this
 * repo and would multiply every count (CHIP-PROTOCOL.md §9).
 */
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'coverage',
  'uploads',
  'backups',
  '.git',
  '.claude',
]);

/** `dist-<chip-name>/` — per-chip build output under D-010. Never first-party source. */
function isSkippedDir(name) {
  return SKIP_DIRS.has(name) || name.startsWith('dist-');
}

const JS_EXT = new Set(['.js', '.mjs', '.cjs']);

/**
 * Root-level `test-*.js` files are ad-hoc one-off scripts, not a test suite
 * (DECISIONS.md D-007: "Do not cite them as verification"). They sit at the repo root,
 * which is not under any ROOT, so this is belt-and-braces against someone adding '.'
 * to ROOTS later.
 */
function isExcludedFile(relPath) {
  return /^test-[^/]*\.(js|mjs|cjs)$/.test(relPath);
}

function walk(absDir, relDir, out) {
  let entries;
  try {
    entries = fs.readdirSync(absDir, { withFileTypes: true });
  } catch {
    return; // root missing in this checkout — surfaced by listFiles() as missingRoots
  }
  for (const entry of entries) {
    const rel = relDir ? `${relDir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (isSkippedDir(entry.name)) continue;
      walk(path.join(absDir, entry.name), rel, out);
    } else if (entry.isFile()) {
      if (!JS_EXT.has(path.extname(entry.name))) continue;
      if (isExcludedFile(rel)) continue;
      out.push(rel);
    }
  }
}

/**
 * @returns {{ files: string[], missingRoots: string[] }}
 *   files are repo-relative POSIX paths, sorted.
 */
export function listFiles() {
  const out = [];
  const missingRoots = [];

  for (const root of ROOTS) {
    const absRoot = path.join(REPO_ROOT, root);
    if (!fs.existsSync(absRoot)) {
      missingRoots.push(root);
      continue;
    }
    walk(absRoot, root, out);
  }

  for (const extra of EXTRA_FILES) {
    if (fs.existsSync(path.join(REPO_ROOT, extra))) out.push(extra);
  }

  out.sort();
  return { files: out, missingRoots };
}

export function abs(relPath) {
  return path.join(REPO_ROOT, relPath);
}
