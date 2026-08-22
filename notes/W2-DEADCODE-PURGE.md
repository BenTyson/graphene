# CHIP-W2-DEADCODE-PURGE

- **Lane:** A (implementation)
- **Model tier used:** sonnet
- **Owned files:** client/src/js/components/tabs/proforma/ProductionPulse.js, client/src/js/app.js, client/src/js/app-original.js, client/src/js/components/modals/DealModal.js, client/src/js/components/modals/DealDetailPanel.js, client/src/js/components/tabs/NewsTab_backup.js, notes/W2-DEADCODE-PURGE.md
- **Wave:** 2

## What I was asked to do

Delete six candidate dead-code files, but only after independently re-running the four-way
dead-code search from CHIP-PROTOCOL.md §7 on each one myself — explicitly *not* inheriting
W1-RECON-DEAD's conclusion, per D-012's instruction ("the deleting chip must still re-run the
four-way search itself"). Special care on `app.js`/`app-original.js` (confirm `client/index.html`
loads only `app-refactored.js`, check `vite.config.js` for extra entries) and on
`ProductionPulse.js` (confirm `ProductionSection.js` doesn't import it, confirm no proforma
component references it). If any file turns out referenced, leave it and report rather than
delete. After deleting, keep `npm run check` green and run `npx vite build --outDir
../dist-deadcode`. Draft (not apply) doc corrections for `docs/features/PROFORMA-SYSTEM.md` lines
23/170/209, the two broken links in `docs/README.md`, and one clause on `CLAUDE.md` line 139.
Report total lines removed.

## What I did

Ran all four searches independently on each of the six files (commands + results below), found
all six genuinely unreferenced by any import, `<script>` tag, `x-html`/`window.*` dynamic
reference, or `switchTab()`/route allowlist. Zero files were referenced-but-mislabeled — no
"leave it" cases this run, unlike W1-RECON-DEAD's own caveat that three dead-code reports in the
origin project were wrong.

Deleted via `git rm` (staged, not committed — Command Center commits):
- `client/src/js/components/tabs/proforma/ProductionPulse.js` (313 lines)
- `client/src/js/app.js` (828 lines)
- `client/src/js/app-original.js` (828 lines, byte-identical to `app.js` — confirmed with `diff`)
- `client/src/js/components/modals/DealModal.js` (89 lines)
- `client/src/js/components/modals/DealDetailPanel.js` (160 lines)
- `client/src/js/components/tabs/NewsTab_backup.js` (1 line)

**Total lines removed: 2,219.**

Did not touch `client/src/js/utils/constants.js` (not owned; the `TASK_CATEGORY_TAGS`/
`TASK_INSTITUTION_TAGS` un-exporting is proposed as a follow-up chip below, per the instruction
not to delete it myself and §7's preference for un-exporting over deleting anyway).

## How I verified it — searches run per file (Lane A bar, CHIP-PROTOCOL.md §4/§7)

### 1. `ProductionPulse.js`
```
grep -rn "ProductionPulse" --include="*.js" --include="*.html" --include="*.md" .
grep -rn "proforma/ProductionPulse" .
grep -rn "productionPulse" --include="*.js" --include="*.html" .   # exported symbol, camelCase
grep -rln "Pulse" client/src/js/components/tabs/proforma/
head -5 client/src/js/components/tabs/proforma/ProductionSection.js
```
Result: only self-hit (`export function productionPulse()` in the file itself) plus
`ROADMAP.md`, `DECISIONS.md` (D-012 itself), and three doc lines in
`docs/features/PROFORMA-SYSTEM.md` (23, 170, 209) that describe it as live — the exact
contradiction D-012 orders corrected. `ProductionSection.js:1` imports only
`{ numInput, formGrid, card, sectionHeader, HELP } from './helpers.js'` — no import of
`ProductionPulse.js`. No other file in `proforma/` mentions "Pulse" at all. Confirmed dead.

### 2. `app.js` / `app-original.js`
```
grep -rn "['\"/]app\.js" --include="*.js" --include="*.html" .
grep -rn "app-original" .
grep -n "script src\|type=\"module\"\|app.js\|app-original\|app-refactored" client/index.html
cat vite.config.js   # checked build.rollupOptions.input for extra entries
diff client/src/js/app.js client/src/js/app-original.js
```
Result: `client/index.html` loads exactly one app script —
`<script type="module" src="/src/js/app-refactored.js"></script>` (line 1349) — no reference to
`app.js` or `app-original.js` anywhere. `vite.config.js`'s multi-entry `rollupOptions.input` has
exactly two entries, `index.html` and `proforma-embed.html`; neither points at these files, and I
additionally checked `client/proforma-embed.html`'s own `<script>` tags and
`client/src/js/proforma-embed.js`'s imports directly — clean. `diff` confirms the two files are
byte-identical (a backup copy, matching `docs/archive/REFACTORING.md`'s own narrative: "Original
`app.js` backed up as `app-original.js`"). Only non-code hits: `ROADMAP.md`, `CHIP-PROTOCOL.md`
(both talking about this same investigation), and two archive docs narrating history. Confirmed
dead, on both counts asked for.

### 3. `DealModal.js` / `DealDetailPanel.js`
```
grep -rn "DealModal\|DealDetailPanel" --include="*.js" --include="*.html" --include="*.md" .
grep -rn "modals/DealModal\|modals/DealDetailPanel" .
grep -rn "getDealModalHtml\|getDealDetailPanelHtml\|dealModal\|dealDetailPanel" --include="*.js" --include="*.html" .
```
Result: only self-hits (`export function getDealModalHtml()` / `getDealDetailPanelHtml()`), plus
`CLAUDE.md:132` and `docs/core-reference/ARCHITECTURE.md:416`, both of which *already* document
these as dead ("DealModal.js and DealDetailPanel.js are dead code (not imported)" /
"Replaced DealModal/DealDetailPanel with AddToPipelineModal"). Confirmed dead; CLAUDE.md's own
claim checks out.

### 4. `NewsTab_backup.js`
```
grep -rn "NewsTab_backup" --include="*.js" --include="*.html" --include="*.md" .
grep -rn "tabs/NewsTab_backup" .
```
Result: zero hits anywhere except this notes file and W1-RECON-DEAD's. File content is two
comment lines, no exports, no logic. Confirmed dead.

### Cross-cutting dynamic-reference check (search #4, all six at once)

Because a sibling chip (W2-AUTH-CLIENT) is editing `client/index.html` and
`client/src/js/app-refactored.js` live, I grepped both files twice, a beat apart, for every
symbol/filename across all six candidates in one pass, to rule out a torn read:
```
grep -n "productionPulse|getDealModalHtml|getDealDetailPanelHtml|DealModal|DealDetailPanel|app-original|NewsTab_backup|app\.js" client/index.html client/src/js/app-refactored.js
```
Exit code 1 (no matches) both times; file sizes were sane (1363 and 6242 lines respectively, not
truncated). No `window.foo = ...` assignment, no `x-html="getFooTabHtml()"` mount, and no
`switchTab()`/`validTabs` allowlist entry for any of the six.

### Post-delete verification (Lane A bar: build must pass, output must be read)
```
npm run check
```
All 5 gates PASS/REPORT (self-test, syntax on 207/209 files, relative-import-resolution across
249 specifiers, duplicate-key scan, vite build). Full transcript captured; key line: "check
PASSED in 1.6s." The two known-broken files in the syntax gate (`NewsWidget.js`,
`NewsScheduler.js`) are pre-existing baselined failures unrelated to this chip.

```
npx vite build --outDir ../dist-deadcode
```
Note for future chips: **`--outDir` resolves relative to Vite's configured `root` (`./client`),
not the shell's cwd.** `../dist-deadcode` from the repo root therefore lands at
`graphene/dist-deadcode/`, not one directory above the repo (same place W1-RECON-DEAD's
`dist-matrixwrite/` landed, which I used as a corroborating cross-check). Build succeeded: "125
modules transformed... built in 839ms", no missing-module errors, 6 assets emitted. `dist-*/` is
gitignored (confirmed via `.gitignore`) so this didn't dirty `git status`.

Positive confirmation the deleted symbols are truly gone from the compiled output, not just from
source (verify by ancestry, not silence — CHIP-PROTOCOL.md §6):
```
grep -c "productionPulse|getDealModalHtml|getDealDetailPanelHtml" dist-deadcode/assets/*.js
```
→ 0 in every asset file. Sanity check the bundle isn't simply empty:
```
grep -c "getTasksTabHtml" dist-deadcode/assets/*.js
```
→ 1 hit in the main bundle, confirming the build is real and other exports still compile in.
`node --check client/src/js/app-refactored.js` also re-run clean, confirming I left that
DO-NOT-TOUCH file untouched.

## Measurements

No thresholds introduced by this work — pure deletion, nothing to gate.

## Draft wiring

None — this chip touched no shared wiring file.

## Draft for shared docs

**File: `docs/features/PROFORMA-SYSTEM.md`**

Line 23 — delete this line entirely from the directory tree listing:
```
                   ├── ProductionPulse.js     -- Material-flow visualization (hemp → graphene → stock) at top of Production section
```

Line 170 — currently:
```
- **Production** — keeps the Material-flow visualization (`ProductionPulse.js`) between the section header and the Critical block.
```
Replace with (matches the actual current Production sub-tab, per CLAUDE.md's own Gotchas entry on
`ProductionTimeline.js`):
```
- **Production** — the Production sub-tab is a single combined table (`ProductionTimeline.js`): Machine Timeline gantt + Production Detail, sharing one 60-monthly + 5-yearly-total column structure. There is no separate material-flow visualization above it; that was `ProductionPulse.js`, an orphaned component removed in W2-DEADCODE-PURGE (see DECISIONS.md D-012).
```

Line 209 — delete this row entirely from the file table:
```
| `client/src/js/components/tabs/proforma/ProductionPulse.js` | Material-flow visualization (Production section) |
```

**File: `docs/README.md`**

Lines 57-58 link to two files that do not exist under `docs/history/` (only
`SERVICE-EXTRACTION-2025-09.md` is present; re-verified myself — `find docs -iname
"*COMPONENT-PHASES*" -o -iname "*MAJOR-MIGRATIONS*"` returns nothing). Currently:
```
- **[COMPONENT-PHASES.md](history/COMPONENT-PHASES.md)** - Component library evolution (Phases 1-4)
- **[MAJOR-MIGRATIONS.md](history/MAJOR-MIGRATIONS.md)** - Cloudinary, modal stacking, and other major changes
```
Either write the two missing files (if that history is worth preserving and exists in git log /
someone's memory) or remove the two bullets. I have no way to know which from this seat — flagging
rather than picking one, since inventing history-doc content would be worse than a broken link.
Minimal safe fix if no one writes the content: delete both bullet lines.

**File: `CLAUDE.md`**

Line 139, currently ends with a clause claiming the unused `constants.js` exports drive the Tasks
filter dropdowns:
```
- Task assignees are many-to-many via `TaskAssignment` (composite PK taskId+userId). Task payloads include `assignees: [{ user }]` — use `getTaskAssigneeUsers(task)` to flatten. Create/update endpoints accept `assigneeIds: string[]`; PUT diffs old vs. new and emits `assigned`/`unassigned` activity per user. The `?assigneeId=x` list filter still exists and matches any assignee (drives the Tasks filter dropdown + dashboard "my tasks"). Kanban and list views show an avatar stack (up to 3, `+N` overflow). Tag + Institution filter dropdowns on the Tasks tab filter client-side via `getFilteredTasks()`; constants live in `client/src/js/utils/constants.js` (`TASK_CATEGORY_TAGS`, `TASK_INSTITUTION_TAGS`).
```
Verified against the code: `client/src/js/components/tabs/TasksTab.js:57` renders the Tag filter
`<select>` from `systemCategoryTags`, and `:64` renders the Institution filter from
`systemInstitutionTags` — both Alpine state loaded from the `Tag` Prisma model via
`loadSystemTags()` (already documented correctly two bullets up, at what is currently line 133).
`grep -rn "TASK_CATEGORY_TAGS|TASK_INSTITUTION_TAGS"` across the whole repo returns only the two
`export const` lines in `constants.js` itself — imported by nothing. Replace the final clause:
```
...Tag + Institution filter dropdowns on the Tasks tab filter client-side via `getFilteredTasks()`, sourced from `systemCategoryTags`/`systemInstitutionTags` (see the System tags note above) — not from `client/src/js/utils/constants.js`, whose `TASK_CATEGORY_TAGS`/`TASK_INSTITUTION_TAGS` exports are unused.
```

## Handoff: changes needed in files I do not own

None beyond the doc drafts above (docs/ isn't owned by this chip; already covered in the section
above).

## Reflections

| Severity | Finding | Where | Status |
|---|---|---|---|
| medium | `CLAUDE.md:132` still says `DealModal.js`/`DealDetailPanel.js` "are dead code (not imported)" — true today, but after this chip's deletion the files won't exist at all, which is a stronger and slightly different claim than "unimported." Worth a doc pass so it reads "have been removed" rather than "are dead code," so a future reader doesn't go looking for a file that's gone. | CLAUDE.md:132 | left, why: not owned — proposed below |
| low | `docs/README.md:57-58` link to `history/COMPONENT-PHASES.md` and `history/MAJOR-MIGRATIONS.md`, neither of which exists under `docs/history/` (only `SERVICE-EXTRACTION-2025-09.md` is there) | docs/README.md:57-58 | left, why: not owned — draft above, needs a human call on write-vs-delete |
| low | `docs/features/PROFORMA-SYSTEM.md` claims `ProductionPulse.js` renders at lines 23, 170, 209 — now stale after this deletion (was already stale before it, per D-012/W1-RECON-DEAD) | docs/features/PROFORMA-SYSTEM.md:23,170,209 | left, why: not owned — draft above |
| low | `CLAUDE.md:139`'s trailing clause claims `constants.js`'s `TASK_CATEGORY_TAGS`/`TASK_INSTITUTION_TAGS` drive the Tasks filter dropdowns; `TasksTab.js:57,64` actually reads `systemCategoryTags`/`systemInstitutionTags` from the Tag Prisma model, and the constants are imported by nothing | CLAUDE.md:139 | left, why: not owned — draft above |
| info | `--outDir` for `vite build` resolves relative to Vite's `root` (`./client`), not the shell cwd — `../dist-deadcode` run from the repo root lands at `graphene/dist-deadcode/`, matching where W1-RECON-DEAD's `dist-matrixwrite/` also landed. Worth stating explicitly in CHIP-PROTOCOL.md §9 so future chips don't waste a step looking for their build output one level too high. | vite.config.js:6 (`root: './client'`) | proposed as harness fix, see below |
| info | All six candidate files were confirmed genuinely dead by an independent re-run of all four §7 searches; none needed to be spared. No new orphans found beyond the six named. | — | fixed here (deleted) |

### What I saw outside my scope

- `docs/archive/phase1.md` and `docs/archive/REFACTORING.md` independently narrate `app-original.js`
  as "a backup of the monolithic version" — this corroborated the `diff` result rather than
  contradicting it, unlike the `ProductionPulse.js` case where a live doc actively claimed the
  dead file was rendering. Worth noting as a *good* pattern: archive docs describing something as
  historical are a positive signal for deletion, where a live feature doc claiming something
  renders is a stop signal.
- `client/src/js/components/tabs/proforma/helpers.js` still exports `criticalBlock`/
  `advancedAccordion`, which CLAUDE.md itself already documents as unused ("older ... helpers ...
  still exist but are unused — don't reach for them"). Not in my owned-files list, not touched,
  but it's the same shape of issue (documented-dead, not yet removed) as the six files I did own,
  so it's a natural next target for a follow-up.
- `client/src/js/app.js` and `app-original.js` (before deletion) each still carried a second full
  copy of CRUD logic, including their own `/api/*/export/csv` handling, per W1-AUTH-GUARD's notes
  at `app.js:347,523`. That's now moot since the files are gone, but it means the auth-client work
  W2-AUTH-CLIENT is doing only ever needed to touch the one live copy in `app-refactored.js` — the
  duplicate wasn't a second place that fix needed to land.

### Risks in what I built

- This is subtractive work with a solid four-way-search safety net and a green `npm run check` +
  successful build afterward, so the main residual risk is narrow: something that references one
  of these six files by a string form none of my greps caught (e.g. a runtime `fetch()` of the raw
  file path, or a reference baked into a Cloudinary-hosted asset, or a hardcoded string in a
  database row rather than in the repo). I have no way to check the last two from a static grep,
  and neither did W1-RECON-DEAD. Nothing in `server/**` (which I didn't touch or need to) serves
  these paths as static assets outside Vite's own module graph, as far as the build output shows.
- `git rm` was used (staged deletion) rather than a plain filesystem `rm`, so the deletions are
  visible in `git status` as `D` and easy for the Command Center to inspect or revert with
  `git restore --staged` before committing — I did not commit.

### Proposed follow-up chips

1. **CHIP-CONSTANTS-UNEXPORT** — un-export (not delete, per CLAUDE.md's explicit instruction and
   §7's preference) `TASK_CATEGORY_TAGS`/`TASK_INSTITUTION_TAGS` from
   `client/src/js/utils/constants.js`, or leave them exported but add a `@deprecated` /
   tombstone comment, whichever the Command Center prefers. Lane A, sonnet, owns only
   `constants.js`.
2. **CHIP-HELPERS-DEADCODE** — same treatment for `criticalBlock`/`advancedAccordion` in
   `client/src/js/components/tabs/proforma/helpers.js`, already flagged unused in CLAUDE.md
   itself and in W1-RECON-DEAD's notes. Lane A, sonnet, owns only `helpers.js` (would need to run
   concurrently-safe with anything else touching the `proforma/` directory — check the wave's
   sibling list before scheduling).
3. **CHIP-HISTORY-DOCS** — resolve the two dead links in `docs/README.md` (`history/
   COMPONENT-PHASES.md`, `history/MAJOR-MIGRATIONS.md`): either author the missing history docs
   from git log archaeology, or remove the two bullets. Lane B, sonnet is fine, owns only
   `docs/README.md` and (if writing) the two new `docs/history/*.md` files.

### Harness improvements

- **D-012's instruction to re-run the four-way search rather than inherit W1-RECON-DEAD's
  conclusion was worth the time**, even though every conclusion ended up matching. It caught one
  thing W1-RECON-DEAD's per-file table didn't spell out as explicitly: I additionally checked
  `client/proforma-embed.html`'s own script tags and `proforma-embed.js`'s import list directly,
  because `vite.config.js` showed it as a *second* build entry point that a chip focused only on
  `index.html` could plausibly miss. It came back clean, but it's exactly the kind of
  second-entry-point trap §7 warns about in the abstract ("a symbol can be live with no JS
  import") — worth naming `proforma-embed.html`/`proforma-embed.js` explicitly in §7 or in a
  future dead-code chip's prompt, since it's easy to check only `client/index.html` and stop.
  Also worth noting for the same reason: `--outDir` resolving relative to Vite's `root` rather
  than cwd (see findings table) — cost me one confused `ls` before I found the build output.
  Both are small, but both are exactly the "a future chip wastes ten minutes" class of thing §9
  exists to prevent.
- Everything else in the spawn prompt was accurate and sufficient — the two shared-file torn-read
  warnings (about `app-refactored.js`/`client/index.html` being edited live) were correct and I
  did hit exactly that situation, resolved by re-running the grep a beat apart and checking file
  sizes for sanity rather than trusting a single read.
- No model-tier mismatch — sonnet was the right tier for six independent mechanical grep-verify-
  delete cycles plus doc drafting; nothing here needed deeper reasoning than "does this string
  appear anywhere else."
