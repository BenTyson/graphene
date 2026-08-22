# CHIP-W1-CHECK-SUITE

- **Lane:** A (implementation)
- **Model tier used:** opus
- **Owned files:** `package.json`, `scripts/check/**`, `notes/W1-CHECK-SUITE.md`
- **Wave:** 1 (re-run)
- **Base:** branch `staging`, HEAD `c9486de` at spawn. Shared working directory (D-010) — four
  siblings editing concurrently.

## What I was asked to do

Build `npm run check`: the automated verification floor that D-007 says does not yet exist.
Three gates:

1. **Syntax** — `node --check` over `client/src/js/**`, `server/**`, `shared/**`, `scripts/**`,
   excluding `node_modules`, `dist`, `dist-*`, and the 14 root-level `test-*.js` one-offs.
   Report the file count so it is auditable.
2. **Build** — the Vite build, to *my own* output directory so I do not clobber a sibling's
   `dist/`. Non-zero exit fails. The pre-existing ~1.2 MB chunk-size warning must stay visible
   but must not fail the check.
3. **Duplicate object keys** — **REPORT-ONLY this wave.** Must not fail the check.
   W1-APP-DEDUPE is fixing the existing instances in `app-refactored.js` concurrently, so a
   failing gate would block the wave on a race. Measure the real distribution first
   (CHIP-PROTOCOL.md §6) so a later wave can decide when to promote it.

Also: do not modify any source file; do not fix what the detector finds.

## Status log

<!-- appended as I go, per §5a -->

- Read CHIP-PROTOCOL.md and DECISIONS.md in full. Confirmed `"type": "module"` in package.json
  (ESM), Node v20.20.2, npm 10.8.2.
- Notes skeleton created before building anything.
- **Parser available without a new dependency:** `rollup/parseAst` (rollup 4.46.2, already
  installed as a hard dependency of vite). `node -p "Object.keys(require('rollup/package.json').exports)"`
  → `[".", "./loadConfigFile", "./getLogFilter", "./parseAst", "./dist/*", "./package.json"]`.
  So the dup-key detector gets a real ESTree AST and **no devDependency is added**. `acorn` is
  NOT present standalone.
- **`node --check` handles ESM fine on Node 20.20.2.** Probed with a fixture using top-level
  `await` + `import.meta.url`, both with and without a `type: module` package.json: exit 0 both
  ways. So no `--input-type` juggling is needed.
- **Salvage reviewed.** 8 files from the aborted run. Its author *did* know the dup-key gate must
  be report-only and said so in comments. Two real defects found, see "What I did".
- **Verified the salvage's `known-broken.json` claims against the live tree (do not trust notes,
  §6):** both files genuinely fail `node --check` with backslash-escaped backticks —
  `client/src/js/components/cards/NewsWidget.js:156` and
  `graphene-news/backend/jobs/NewsScheduler.js:44`. §7 dead-code check run on both: `grep -rn`
  by basename across js/html/md finds only their own self-references (`NewsWidget.js:2,104,183`;
  `NewsScheduler.js:5`). Claim accepted.
- **Verified `graphene-news` belongs in the syntax roots:** `server/routes/news.js` reaches it via
  `await import('../../graphene-news/backend/services/ContentAcquisitionService.js')` at 7 call
  sites (lines 376, 407, 428, 482, 513, 583, 629). Nothing bundles that tree, so a syntax error
  there surfaces only when a user hits the news refresh route. It is in scope.

## What I did

`npm run check` now exists. It runs **five gates in 1.8 s** and adds **zero dependencies**.

| # | Gate | File | Blocks a merge? | Clean-tree time |
|---|---|---|---|---|
| 1 | self-test — do the detectors still fire? | `self-test.js` | **yes** | 44 ms |
| 2 | syntax — `node --check` × 215 files | `syntax.js` | **yes** | 430 ms |
| 3 | imports — every relative import resolves | `imports.js` | **yes** | 72 ms |
| 4 | duplicate object keys | `dup-keys.js` | **no — REPORT ONLY** | 75 ms |
| 5 | build — `vite build` | `build.js` | **yes** | 1.1 s |

`scripts/check/files.js` holds the single definition of "first-party JS" that gates 2–4
share, so their reported counts are comparable and auditable. Every gate also runs
standalone (`node scripts/check/dup-keys.js --json`). `npm run check:quick` skips the build.

**`package.json`: two script lines added, dependency lists untouched** (17 deps / 9
devDeps, unchanged).

### Design decisions worth arguing with

**Zero new dependencies — the parser was already here.** The duplicate-key detector needs a
real JS parser; a regex cannot do this job (M3). `rollup/parseAst` is a public export of
rollup 4.46.2, which is already a hard dependency of vite, which `npm run build` already
requires. So there was nothing to justify: no install-size trade, no new supply-chain
surface, no spending of the repo's 9-devDependency simplicity. If the parser ever
disappears the gate reports `SKIPPED` loudly rather than passing quietly.

**The build gate does NOT run `npm run build`.** It runs
`npx vite build --outDir <tmpdir>/graphene-check-build --emptyOutDir` — same binary, same
config, same rollup inputs, same plugins, one flag different. Two reasons: under D-010 two
chips running the check at once would race on the same `dist/`, and a command called
`check` should not have side effects — running it must not invalidate the `dist/` a
developer already had. Verified: repo `dist/` mtime is unchanged after a full run.
Override with `CHECK_OUT_DIR` to inspect artefacts.

**Two files are baselined as known-broken, not silently excluded.** They are named in the
output on every run, and the gate **fails if a listed file starts parsing**, which forces
a stale entry to be deleted rather than left to rot. The baseline can only shrink. Silent
exclusion would have been one line shorter and would have buried two real defects.

**dup-keys reports but cannot fail.** Per the brief. The exact promotion steps are written
into the header of `index.js` so the next chip does not have to reverse-engineer them:
delete one string from `REPORT_ONLY`, flip `ok` in `dup-keys.js`.

### On the salvaged prior-run files

I read all 8 and kept the shape of 6. The author had clearly understood the problem — the
AST approach, the report-only constraint, and the known-broken reasoning were all sound,
and I verified each claim against the live tree rather than adopting it (§6). **I found and
fixed two real defects in it:**

1. **`build.js` ran plain `npm run build`** — writing to the shared `dist/` with
   `emptyOutDir: true`. Exactly the sibling-clobbering the brief warned about. Rewritten.
2. **`files.js` did not exclude `dist-*` or `.claude`.** Harness worktrees under
   `.claude/worktrees/` are whole copies of the repo; had one existed during a run, every
   count in this document would have been multiplied. Not currently triggered — but a
   latent multiplier is worth closing.

Smaller fixes: the syntax gate hard-coded its root list in its own output (drifts from
`ROOTS`); the build gate's asset table printed full tmpdir paths that pushed the numbers
off-screen; added a self-test case for duplicated *state properties*, which M3 showed are
the majority of real findings and which a method-only detector would miss.

## How I verified it

Lane A bar (CHIP-PROTOCOL.md §4): build passes with output read, `node --check` on every
changed file, and the change actually **run**. My change *is* a runnable command, so
"exercise it for real" means running it against both a clean tree and a deliberately
broken one, and checking the exit codes.

### 1. `node --check` on every file I wrote

```
OK  scripts/check/build.js      OK  scripts/check/index.js
OK  scripts/check/dup-keys.js   OK  scripts/check/self-test.js
OK  scripts/check/files.js      OK  scripts/check/syntax.js
OK  scripts/check/imports.js
```

`package.json` re-parsed via `require()`: `scripts.check = node scripts/check/index.js`,
dependency counts unchanged.

### 2. Full run on the clean tree — exit 0, 1.8 s

```
npm run check — 5 gate(s)

[1/5] self-test (does the checker still work?)
14 self-test case(s) against known-bad and known-good input
all pass: each detector fires on bad input and stays quiet on good input.

[2/5] syntax (node --check)
node --check on 215 file(s), 12-way parallel
  roots: client/src/js, server, shared, scripts, graphene-news (+3 root config files)
  excluded: node_modules, dist, dist-*, .claude, uploads, and root test-*.js

2 known-broken file(s) still failing (baselined in scripts/check/known-broken.json, NOT counted as failures):
  client/src/js/components/cards/NewsWidget.js — SyntaxError: Invalid or unexpected token (line 156)
  graphene-news/backend/jobs/NewsScheduler.js — SyntaxError: Invalid or unexpected token (line 44)

213 file(s) parse cleanly.

[3/5] relative import resolution
249 relative specifier(s) across 213 of 215 JS file(s) and 2 HTML entry point(s)
  2 file(s) unparseable — their imports were NOT checked
all resolve to a file on disk.

[4/5] duplicate object keys
parsed 213 of 215 file(s)
2 file(s) not parseable as ESM — NOT scanned for duplicate keys:
  client/src/js/components/cards/NewsWidget.js: Unexpected eof
  graphene-news/backend/jobs/NewsScheduler.js: Expected unicode escape
no duplicate object keys found.

[5/5] build (vite build)
npx vite build --outDir /var/folders/.../T/graphene-check-build --emptyOutDir
exited 0 — ✓ built in 848ms
6 asset(s) emitted; largest assets/index-Cr91abIV.js at 1198.02 kB
  proforma-embed.html                               2.08 kB  gzip 0.96 kB
  index.html                                       88.88 kB  gzip 12.25 kB
  assets/ProformaService-H_MqgESj.css              70.58 kB  gzip 11.39 kB
  assets/proforma-embed-CNIrPliu.js                 7.76 kB  gzip 2.61 kB
  assets/ProformaService-Bv2z0a8R.js              283.22 kB  gzip 61.01 kB
  assets/index-Cr91abIV.js                       1198.02 kB  gzip 183.39 kB

2 pre-existing build warning(s) — shown, NOT failed on:
  Browserslist: browsers data (caniuse-lite) is 12 months old. Please run:
  Some chunks are larger than 500 kB after minification. Consider:

================================================================
  PASS    self-test (does the checker still work?)        44ms
  PASS    syntax (node --check)                          430ms
  PASS    relative import resolution                      72ms
  REPORT  duplicate object keys                           75ms
  PASS    build (vite build)                              1.1s
================================================================
check PASSED in 1.7s.
This does not satisfy DECISIONS.md D-007 on its own. D-007 also requires that the
change was actually RUN — curl against a locally started server, or the UI driven
in a browser — with the observed values recorded.
```

The chunk-size warning is **visible and did not fail the run**, as required.

### 3. Proof it catches things — injected defects

Two temporary fixtures written into `scripts/check/` (a path I own), containing a syntax
error, an unresolvable import, and a duplicate method key:

```js
// __proof-syntax.js
export function broken( {        // <- syntax error
  return 1;
}

// __proof-dupkey.js
import { thisDoesNotExist } from './no-such-module.js';   // <- broken import
export const config = {
  exportCsv() { return 'FIRST — silently dead'; },
  label: 'x',
  exportCsv() { return 'SECOND — this one wins'; },        // <- duplicate key
};
```

All three were caught:

```
FAIL: 1 file(s) do not parse:
  scripts/check/__proof-syntax.js
    scripts/check/__proof-syntax.js:3 — SyntaxError: Unexpected number

FAIL: 1 import(s) do not resolve:
  scripts/check/__proof-dupkey.js:2  ->  ./no-such-module.js

1 duplicate key(s) across 1 file(s) — REPORT ONLY, does not fail the check:
  scripts/check/__proof-dupkey.js
    exportCsv  L5, L7  ->  L7 wins, L5 dead   [depth 0: config]

  PASS    self-test          FAIL  syntax          FAIL  imports
  REPORT  duplicate object keys
check FAILED — 2 gate(s) failed in 636ms.
```

`echo $?` → **1**. Note the duplicate key was reported and the gate still shows `REPORT`,
not `FAIL` — the report-only constraint holds under a real positive, which is the only
place it could have been got wrong.

**Both fixtures were then deleted.** `ls scripts/check/` afterwards shows only the 8
intended files, and a clean re-run gives `echo $?` → **0**.

### 4. No collateral damage

- Repo `dist/` mtime unchanged after a full run — the build gate wrote only to tmpdir.
- `git status --short` after all my work shows exactly my three owned paths modified
  (`package.json`, `scripts/check/`, `notes/W1-CHECK-SUITE.md`). Everything else in the
  status belongs to siblings.
- Runs correctly from any cwd (paths derive from `import.meta.url`, verified from `/tmp`).

### 5. Runtime — well under the "people stop running it" threshold

Three consecutive full runs: **1.83 s, 1.82 s, 1.82 s** wall clock. `check:quick` is
0.64 s. The brief's concern was ~30 s; this is 6% of that, so nobody has a reason to skip
it. The single largest cost is the vite build at 1.1 s.

## Measurements

### M1 — file inventory (the auditable count)

`listFiles()` over roots `client/src/js`, `server`, `shared`, `scripts`, `graphene-news`
plus `vite.config.js`, `tailwind.config.js`, `postcss.config.js`:

| Root | Files |
|---|---|
| `client/src/js` | 127 |
| `server` | 46 |
| `scripts` | 17 (+3 as I added mine) |
| `graphene-news` | 10 |
| `shared` | 6 |
| config files at root | 3 |
| **total** | **209** at first measure, **213** once my own 4 scripts existed |

Excluded and verified excluded: `node_modules`, `dist`, `dist-*` (per-chip build output
under D-010), `build`, `coverage`, `uploads`, `backups`, `.git`, `.claude` (harness
worktrees are whole copies of the repo — including them would multiply every count), and
the 14 root-level `test-*.js` one-offs.

### M2 — duplicate-key baseline

**Measured 2026-08-22T01:14:17Z, at `fd15257`, with `client/src/js/app-refactored.js` at
6,274 lines, md5 `b426d549df33be5ab258f505c075cac6`.** This is a moving target:
W1-APP-DEDUPE is editing that exact file concurrently, so the number below is a snapshot,
not a stable fact. Anyone promoting this gate must re-measure.

**17 duplicate keys, in 1 file, all at object-literal depth 0 inside `window.grapheneApp`.**
Zero duplicates anywhere else in the other 207 parseable files.

| Key | Dead | Wins |
|---|---|---|
| `init` | 230 | 1228 |
| `compoundBatches` | 433 | 1810 |
| `compoundBatchRecords` | 434 | 682 |
| `expandedCompoundBatches` | 548 | 664 |
| `compoundBatchRelatedData` | 549 | 676 |
| `loadingCompoundBatchRelated` | 550 | 679 |
| `compoundBatchSearch` | 565 | 683 |
| `searchCompoundBatches` | 1598 | 2203 |
| `closeSemModal` | 2165 | 2405 |
| `handleSemFileChange` | 2169 | 2373 |
| `hasActiveFilters` | 4277 | 4596 |
| `refreshNewsFeed` | 4448 | 4524 |
| `nextNewsPage` | 4473 | 4497 |
| `previousNewsPage` | 4478 | 4504 |
| `goToNewsPage` | 4483 | 4511 |
| `loadMoreNews` | 4488 | 4518 |
| `shareArticle` | 4618 | 4744 |

Distribution facts that matter for choosing a threshold later:

- **Nesting depth: every single one is depth 0.** Not one duplicate exists in a nested
  object literal anywhere in the codebase. A promoted gate does not need a depth cutoff.
- **File spread: 1 of 208 parseable files.** The problem is entirely a symptom of one
  6,274-line object literal, not a codebase-wide habit. That is a strong argument that
  the gate can be promoted to failing as soon as `app-refactored.js` is clean — there is
  no long tail to grind through.
- **2 files could not be parsed** and are therefore NOT scanned:
  `client/src/js/components/cards/NewsWidget.js` and
  `graphene-news/backend/jobs/NewsScheduler.js`. Both are the known-broken syntax files
  (M4). They are named in the output every run rather than silently skipped.
- `init` at L230 being dead is the highest-consequence one: an Alpine component's `init()`
  is its entire startup hook.

### M3 — parsing vs. regex: the measured false-positive rate

The brief asked whether a naive line regex would do, and predicted that `if (` at
four-space indent would be the false positive. Measured, not asserted, over
`app-refactored.js` (6,274 lines), scored against the 17 AST-confirmed duplicates:

| Approach | Candidate lines | Dup groups reported | False pos. | Real ones missed | Precision | Recall |
|---|---|---|---|---|---|---|
| A: `^\s{4}(\w+)\s*\(` — method-shaped | 414 | 9 | 1 | **9 of 17** | 89% | 47% |
| B: `^\s+(\w+)\s*[:(]` — keys + methods | 1,705 | 118 | 104 | 3 of 17 | **12%** | 82% |
| `rollup/parseAst` AST | — | 17 | 0 | 0 | 100% | 100% |

**I guessed these numbers before running them and I was wrong in both directions**, which
is the whole reason §6 says to measure. The correction is worth recording:

- The predicted `if (` false positive is real but *small* in regex A — one group, 7 hits.
  Regex A's actual problem is **recall, not precision**: it misses 9 of the 17 real
  duplicates, because more than half of them are plain state properties
  (`compoundBatches`, `expandedCompoundBatches`, `compoundBatchSearch`, …) written as
  `key: value`, which a method-shaped pattern cannot see at all. A gate that finds 8 of 17
  problems and reports itself as clean is worse than no gate.
- Regex B recovers the recall and then drowns it: 104 false groups against 14 true ones.
  `if` alone fires **372 times**. The rest are exactly the template-literal and nested-data
  hits predicted — `year`, `month`, `day`, `source`, `value`, `testType` — keys that
  legitimately repeat across *different* object literals, which a line scanner has no way
  to distinguish because it has no concept of which literal a line is inside.

**Conclusion: parse, don't regex — and here it costs nothing.** `rollup/parseAst` is
already installed as a hard dependency of vite, so the choice is 100%/100% for **zero new
packages** versus a regex that is either half-blind or 12% precise. There is no trade to make.

### M4 — the syntax baseline

`node --check` over 215 files: **213 parse cleanly, 2 fail.** Both failures are the same
defect — backslash-escaped backticks inside template literals, `` \`...\` ``, which is not
valid JavaScript and looks like a file written through a shell heredoc:

| File | Line | Reachable? |
|---|---|---|
| `client/src/js/components/cards/NewsWidget.js` | 156 | **no** — grep by basename finds only its own definitions (L2, L104, L183); its one global `window.newsWidgetFunctions` has no consumers |
| `graphene-news/backend/jobs/NewsScheduler.js` | 44 | **no** — grep finds only its own class declaration (L5) |

Both checked per CHIP-PROTOCOL.md §7 (basename, relative path, across js/html/md, plus
dynamic-import and `window.*` reference checks). Neither is bundled, which is why
`npm run build` has always passed despite them. They are baselined in
`scripts/check/known-broken.json`, **not excluded**, and are named on every run.

I did not fix them: my brief says do not modify source files. They are trivially fixable
(unescape the backticks) and I have proposed a chip for it below.

### M5 — parallelism threshold for the syntax gate

`node --check` is one process per file, so the pool width is a number that gates behavior
and therefore gets measured, not guessed. On this machine (18 cores, 212 files at the time):

| Mode | Wall clock |
|---|---|
| serial, one `node --check` at a time | **4,510 ms** |
| pooled, 12-way | **483 ms** |

**9.3× saving.** The pool is capped at `min(cpus, 12)` rather than unbounded so the gate
does not fork 212 node processes at once on a big machine. 12 was chosen because it is
below this machine's 18 cores while still capturing essentially all of the win — the gate
is 430 ms inside a 1.8 s suite, so widening further would buy tens of milliseconds against
a real risk of process-storm on a small CI box.

### M6 — runtime of the whole suite

Three consecutive full runs: **1.83 s / 1.82 s / 1.82 s**. Breakdown: build 1.1 s, syntax
430 ms, dup-keys 75 ms, imports 72 ms, self-test 44 ms. `--quick` (no build): 0.64 s.

Relevant because the brief set "over ~30 seconds and people stop running it" as the
usability bar. At 1.8 s the suite is cheap enough to run on every save.

## Handoff: changes needed in files I do not own

**None outstanding.** One was identified and has already been fixed by another party
mid-run — recorded here because the reasoning matters:

`.gitignore:7-8` read `dist-*/          # per-chip build outputs (see D-010)`. Gitignore
has **no trailing-comment syntax**, so the pattern was the entire line including the
comment text, and `dist-*/` matched nothing. D-010 states per-chip build dirs are
gitignored; they were not. Observed live at 01:16Z: `git status` showed
`?? dist-matrixwrite/` — a sibling chip's build output sitting untracked in the shared
tree, which is exactly the noise D-010's post-wave `git status` check relies on being
absent. Probed directly: `git check-ignore -v dist-probe/x.js` → not ignored.

Fixed independently by the Command Center at `98b5167`
("fix(gitignore): dist-*/ pattern was broken by an inline comment") while I was working.
Re-probed at 01:20Z: now matches `.gitignore:9:dist-*/`. **No action needed.** My build
gate writes to `os.tmpdir()` and never depended on this either way.

## Reflections

| Severity | Finding | Where | Status |
|---|---|---|---|
| high | `init()` at L230 was entirely dead — shadowed by `async init()` at L1228. An Alpine component's `init()` is its whole startup hook | `client/src/js/app-refactored.js:230` (pre-dedupe) | reported only — fixed by W1-APP-DEDUPE concurrently; verified gone |
| high | 17 duplicate object keys, all in one file, silently discarding the earlier definition | `client/src/js/app-refactored.js` @ `fd15257` | measured + reported (M2); **now 0** — W1-APP-DEDUPE landed mid-run, confirmed by my detector and independently by grep |
| medium | 2 files fail `node --check` — backslash-escaped backticks; unreferenced dead code | `client/src/js/components/cards/NewsWidget.js:156`, `graphene-news/backend/jobs/NewsScheduler.js:44` | left, why: brief forbids modifying source. Baselined + named every run; proposed as CHIP-UNESCAPE-BACKTICKS |
| medium | Salvaged `build.js` ran plain `npm run build` → would have clobbered every sibling's `dist/` | prior-run salvage | fixed here — builds to `os.tmpdir()` |
| medium | `.gitignore` `dist-*/` pattern was inert (inline comment); a sibling's `dist-matrixwrite/` was untracked in the shared tree | `.gitignore:7` | found here; fixed independently by Command Center at `98b5167` before I could hand it off |
| low | Salvaged `files.js` did not exclude `.claude/` or `dist-*`; a harness worktree would have multiplied every count | prior-run salvage | fixed here |
| low | `graphene-news/` is loaded by `await import()` from `server/routes/news.js` (7 sites) and is bundled by nothing — its syntax was previously unchecked by anything | `server/routes/news.js:376,407,428,482,513,583,629` | fixed here — added to the syntax roots |
| low | The 14 root-level `test-*.js` files are still present and still look like a test suite to a newcomer | repo root | left, why: not owned. D-007 already says not to cite them; archiving proposed below |

### What I saw outside my scope

**The duplicate-key problem was entirely one file.** 17 findings, 1 of 208 parseable files,
every single one at object-literal depth 0. Not one duplicate anywhere else in the
codebase. This is worth saying plainly because it reframes the risk: this is not a codebase
with a sloppy habit, it is a codebase with one 6,274-line object literal that no human can
hold in their head. The fix is not vigilance, it is D-001's note that reducing
`app-refactored.js` is a roadmap item. The check suite is a smoke alarm, not a solution.

**The two `node --check` failures share one cause** — `` \` `` inside template literals —
which is a signature of files generated through a shell heredoc. Worth a glance at whether
anything still generates files that way, because it will happen again.

**`git status` during a wave is noisy in a way that undercuts D-010's safety story.** D-010
says the mitigation for losing worktree isolation is that "any unowned change shows up in
`git status` and is revertable". That only works if `git status` is otherwise quiet. For
most of my run it contained an untracked sibling build directory. The gitignore fix landed,
but the general point stands: anything that pollutes `git status` degrades the wave's only
collision detector.

**I benefited from a sibling's work landing mid-run and it nearly fooled me.** My gate went
from 17 findings to 0 between two runs 5 minutes apart. The honest reading is "the sibling
fixed it"; a lazier reading available to me was "my detector regressed". I checked with an
independent grep rather than trusting my own tool. A chip measuring a file another chip is
editing should assume the number is a snapshot and say so — I have timestamped and
md5-stamped M2 for that reason.

### Risks in what I built

**The known-broken baseline is the weakest part.** It is a mechanism for making a red check
green. I constrained it — entries are named on every run, and the gate *fails* if a listed
file starts parsing so entries cannot rot — but the failure mode is real: a future chip
under time pressure adds a third entry instead of fixing a genuine break, and the gate
quietly stops covering that file. There is no enforcement of "adding requires a ruling"
beyond a comment in the JSON. **What would expose it:** the baseline growing past two
entries. If a Wave 2 chip adds one, that is the signal to make additions require a
DECISIONS.md entry.

**The build gate parses vite's human-readable stdout.** If vite changes its asset-table
format on upgrade, `emittedAssets()` matches nothing. I handled the obvious version of this
— it prints "this gate is now blind" rather than a reassuring green line — but the *warning*
extractor has no such guard: if vite stops prefixing advisories with `(!)`, the chunk-size
warning silently stops being surfaced and nobody notices, because absence of a warning
looks like good news. **What would expose it:** a vite major upgrade. A regression test
pinning a captured vite output sample would close it.

**The import gate could produce a false failure on an unusual specifier.** It only resolves
relative paths and it tries 7 suffixes, so a valid import through a resolution path I did
not model (a vite alias that starts with `./`, an `exports`-map subpath) would be reported
broken and would fail the check. Measured 249 specifiers with zero false positives on the
current tree, which is why I let it fail rather than report — but that is a measurement on
today's code, not a proof. **What would expose it:** someone adding a resolve alias to
`vite.config.js`. If that happens, the gate should learn to read the alias config or be
demoted to report-only.

**The dup-key walker builds a fresh context object per named node** (`{...ctx, path: [...]}`).
Fine at this repo's size — 75 ms for 213 files — but it is O(depth) allocation per node and
would degrade on a much larger tree. Not worth fixing now; worth knowing before someone
points it at `node_modules`.

**What I did *not* verify:** that the check catches anything semantic. It does not run the
app, does not hit a route, does not render a tab. D-007's "the change has been *run*" half
is untouched by this work, and I made the suite print that on every green run so the
distinction cannot quietly erode into "check passed, therefore shipped".

### Proposed follow-up chips

| Name | Job | Owns | Lane | Tier |
|---|---|---|---|---|
| **CHIP-DUPKEY-PROMOTE** | Re-measure the dup-key baseline; if 0, promote the gate to failing (delete one string from `REPORT_ONLY` in `index.js`, flip `ok` in `dup-keys.js`). Baseline was 0 as of `32f856e` — this may be a 10-minute chip. | `scripts/check/index.js`, `scripts/check/dup-keys.js` | A | fable |
| **CHIP-UNESCAPE-BACKTICKS** | Fix the backslash-escaped backticks in the 2 known-broken files, then delete their `known-broken.json` entries (the gate will fail until they are removed, which is the intended forcing function). Both files are unreferenced, so risk is near zero — but apply §7 again first rather than trusting my check. | the 2 files + `scripts/check/known-broken.json` | A | sonnet |
| **CHIP-CHECK-SMOKE** | Add a 6th gate that actually *runs* things: boot `node server/index.js` on an assigned port, `curl` a handful of routes for expected status codes, shut down. This is the half of D-007 the current suite explicitly does not cover. Needs a ruling on read-only DB use (D-005) first. | `scripts/check/smoke.js`, `scripts/check/index.js` | A | opus |
| **CHIP-TESTFILE-ARCHIVE** | Move the 14 root-level `test-*.js` one-offs to `docs/archive/` or delete them. They are the reason D-007 needs a sentence disclaiming them, and they will keep confusing newcomers. Apply §7; prefer moving to deleting. | the 14 files | B→A | sonnet |

### Harness improvements

**The salvage was worth reading, and the framing "treat skeptically" was exactly right.**
It saved me perhaps 40 minutes of design work, and it contained two defects that would have
damaged siblings. Both halves of that mattered. If future waves recover aborted work, keep
pairing it with an explicit instruction to verify rather than adopt — I would have been
tempted to trust `known-broken.json` on its face, and re-deriving it myself is what let me
state it with evidence.

**The one thing that cost me real time was my own doing, and the protocol already warned
about it.** Twice I wrote a number into a document before measuring it — an invented
false-positive table in M3, and an invented "~11s serial vs ~1s pooled" in a code comment.
Both were wrong: the real regex numbers told a *different story* than my guess (the tight
regex's problem is recall, not precision — it misses 9 of 17), and the real parallelism
number was 4,510→483 ms, not 11s→1s. §6 says measure before choosing a threshold; the
sharper phrasing would be **"never let a number reach the page before it reaches the
terminal."** Guessing plausibly is the specific failure mode of a model writing prose
alongside code, and plausible-but-wrong is worse than absent, because it reads as measured.
I would suggest that exact sentence be added to §6.

**A suggestion for the merge bar.** D-007's floor is now automatable in 1.8 s, but the
suite deliberately does not cover D-007's third clause ("the change has been *run*"). I
would recommend the Command Center state the bar as **"`npm run check` green, plus evidence
the change was run"** rather than replacing the ruling — otherwise the cheap half will
crowd out the expensive half, which is the classic way a green check becomes theatre. The
suite prints this on every passing run, but a footer is a weak defense against a busy human.

**Model tier: correct at opus, but only just.** The mechanical parts — file walking,
subprocess pooling, output formatting — are sonnet work. What justified opus was the
judgment: deciding the salvaged build gate was dangerous, noticing the gitignore comment
bug from a one-line status anomaly, recognising that my own regex measurement contradicted
my prediction and rewriting the conclusion instead of the data, and reasoning about the
known-broken baseline as a *mechanism that can be abused* rather than a config file. A
follow-up chip that only promotes the dup-key gate is a fable-tier task.

**Ports 3012/5185 were assigned and unused**, as the brief anticipated. Nothing to fix —
just confirming the guess was right, so a future check-suite chip need not be given them
unless it is the smoke-test chip above, which genuinely will need a port.
