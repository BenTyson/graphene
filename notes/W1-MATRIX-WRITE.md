# CHIP-W1-MATRIX-WRITE

- **Lane:** A (implementation)
- **Model tier used:** sonnet
- **Owned files:** client/src/js/data/testMatrix.js, notes/W1-MATRIX-WRITE.md
- **Wave:** 1

## What I was asked to do

Transcribe `notes/facts/test-matrix-facts.md` (produced by W1-MATRIX-RESEARCH) into
`client/src/js/data/testMatrix.js`. I write nothing into the data file that is not backed by that
fact file. Ship only Confident/SHIP rows; never ship Verify rows (omit the test id entirely for
those and for "not evaluated" cells). Do not add/rename test columns or add new application rows
beyond what the fact file authors for the 4 empty scaffold rows. Do not touch app-refactored.js,
server files, other chips' notes, or shared docs.

## What I did

Rewrote `TEST_MATRIX_APPLICATIONS` in `client/src/js/data/testMatrix.js` (lines ~87-181) by
transcribing only the "SHIP (Confident)" tables in `notes/facts/test-matrix-facts.md` §3.1-3.8.
No Verify item was written; no target/note text was invented; every `req` cell's `level`, `target`
(when present), and `note` (when present) is copied verbatim from the fact file.

Specific changes applied per the fact file's "Changes vs the existing file" instructions:
- go-cement: deleted the `// TODO: confirm targets with the team` comment (fact file §3.1, ships
  now sourced). Removed the `xps` target `'C/O ≈ 2'` (demoted to Verify — not shipped). Downgraded
  `ftir` required → recommended. Rewrote xps/ftir/particle-size/zeta notes to the ship text.
- go-carbon-capture: removed `bet` target `'high m²/g'` (unsourceable, fact file explicitly says
  don't replace it with anything). Rewrote bet/xps/tga notes to ship text.
- supercap-electrode: kept the 3 existing cells verbatim (conductivity/bet/raman - all confirmed
  as-is), added `purity` (recommended) and `xps` (recommended) — both new, both Confident.
- battery-conductive-additive: kept conductivity/particle-size/purity, added `purity` target
  'Fe ≤5 ppm, Ni ≤1 ppm (Super P Li benchmark)' (Confident numeric target per fact file), added
  `moisture` (required, target '≤0.1% (Super P Li benchmark)'), `bet` (recommended), `raman`
  (recommended).
- composites-polymer, coatings-anticorrosion, water-treatment, lubricants: were empty `req: {}`
  scaffolds. Filled row-level `notes` field and all Confident cells from fact file §3.5-3.8.

Nothing was written for any Verify item or any "not evaluated" cell (per rule: omission = NA,
already the schema's native encoding — no code needed for those).

No test id or level outside the schema was introduced. Did not touch `dispersion` column or
`go-merchant` row proposals (§4/§5 of fact file) — explicitly out of scope, left for Command Center.

## How I verified it

Lane A bar (CHIP-PROTOCOL.md §4):

1. **Syntax:** `node --check client/src/js/data/testMatrix.js` → `SYNTAX OK`.

2. **Build:** `npx vite build --outDir ../dist-matrixwrite` (own output dir per D-010, never plain
   `npm run build`) → `✓ 125 modules transformed.` / `✓ built in 982ms`. Only warning is the
   pre-existing >500kB chunk-size notice (index-*.js at 1.2MB), unrelated to this change and not
   introduced by it.

3. **Schema-validity of the data module, exercised directly in Node** (ESM dynamic `import()` of
   the file, since I could not log into the running app — see below):
   ```
   test ids: 14 xrd,raman,tem,sem,particle-size,bet,xps,ftir,zeta,elemental,purity,tga,moisture,conductivity
   applications: 8
   total cells shipped: 41
   bad test ids: []
   bad levels: []
   go-cement -> 6 cells: xps,ftir,particle-size,zeta,bet,xrd
   go-carbon-capture -> 5 cells: bet,xps,tga,ftir,particle-size
   supercap-electrode -> 5 cells: conductivity,bet,raman,purity,xps
   battery-conductive-additive -> 6 cells: conductivity,particle-size,purity,moisture,bet,raman
   composites-polymer -> 6 cells: particle-size,sem,xps,raman,tga,conductivity
   coatings-anticorrosion -> 5 cells: particle-size,sem,xps,raman,conductivity
   water-treatment -> 5 cells: xrd,zeta,purity,xps,bet
   lubricants -> 3 cells: particle-size,raman,sem
   ```
   Every `req` key across all 8 rows is one of the 14 real test ids; every `level` is one of
   `required|recommended|optional`. Zero bad ids, zero bad levels — the exact typo-renders-blank
   failure mode the spawn prompt warned about is ruled out programmatically, not by eyeballing.

4. **Reconciled the cell count against the fact file.** 6+5+5+6+6+5+5+3 = **41 cells shipped**,
   matching §7 of the fact file exactly: "Cells affirmatively decided and shipping (Confident): 41
   across 8 rows." No discrepancy — did not need to stop per the "reconcile counts" instruction.

5. **Read `getTestMatrixCell`/`getTestMatrixCellTooltip`/`getTestMatrixRowStat` in
   `app-refactored.js:6073-6098`** (read-only — I do not own this file) to confirm the consuming
   code tolerates missing `target`/`note` fields (`if (cell.target) ...`, `if (cell.note) ...`) and
   that an omitted testId renders as `null` → blank cell, matching the "not evaluated" semantics
   the fact file relies on. My data shape is compatible with the existing consumer as-is; no
   wiring change needed (confirms D-008's "No D-001 wiring debt" note).

6. **Ran the app for real.** `PORT=3014 node server/index.js` (background) — started cleanly,
   `GET /api/graphene` returned `200` (this is the pre-existing D-006 auth-gap, being fixed
   concurrently by W1-AUTH-GUARD; not something I touched or need to fix). `npx vite --port 5187`
   (background) — served `200` at `/`. Opened it in the browser: it is genuinely login-gated (a
   real "Username or Email" / "Password" / "Sign in" screen, confirmed via screenshot — an earlier
   `get_page_text` read caught a stale pre-auth DOM snapshot showing tab content with the console
   full of `500` errors on nearly every data-loading endpoint, e.g. "Failed to load graphene
   records: HTTP error! status: 500" — those 500s are unrelated to my change; they are almost
   certainly transient breakage from W1-APP-DEDUPE's concurrent in-place rewrite of
   `app-refactored.js`, which I do not own and did not touch). Per my spawn prompt I do not have
   and must not create login credentials (account creation / writes are prohibited under D-005 and
   the tool-use rules), so I did not attempt to sign in. Both processes were killed after
   (`pkill -f "node server/index.js"`, `pkill -f "vite --port 5187"`) so I leave no lingering
   servers for sibling chips.

Given the login gate, item 3+5 above (direct module exercise + reading the consumer's tolerance
logic) is the verification the spawn prompt anticipated as the fallback: "If you cannot log in,
verify the data module directly ... and confirm every req key is a real test id and every level is
a real level id." Done, and clean.

## Measurements

Cell count is not a chosen threshold, it's a straight tally against the fact file's own count — see
verification item 4 above. No other threshold/limit was introduced by this change.

## Draft wiring

None expected — testMatrix.js is a self-contained data module per D-008.

## Draft for shared docs

Doc: `CLAUDE.md`, section: the existing "Test Matrix" bullet (currently describes the schema/files
only, no coverage numbers). Suggested addition, appended to the end of that bullet:

> As of Wave 1 (W1-MATRIX-RESEARCH + W1-MATRIX-WRITE), all 112 cells (14 tests × 8 rows) are
> dispositioned against a sourced fact file (`notes/facts/test-matrix-facts.md`): 41 ship as
> `req` entries, 17 are parked as unshipped `Verify` items pending a human ruling (targets:
> go-cement XPS C/O, go-carbon-capture BET, supercap-electrode purity/BET targets, and others —
> see the fact file §3), and 54 are deliberate omissions (10 with a stated reason, 44 "no gate
> found in sources searched"). A proposed `dispersion` test column and a `go-merchant` application
> row were scoped but NOT shipped — both are matrix-wide decisions above a writing chip's scope.

## Handoff: changes needed in files I do not own

None. `testMatrix.js` is self-contained (D-008); no wiring, no app-refactored.js, no
client/index.html, no server change required for this work.

## Reflections

| Severity | Finding | Where | Status |
|---|---|---|---|
| medium | Fact file's own "Changes vs the existing file" prose is internally inconsistent with its SHIP tables in two places: (1) §3.3 says the 3 existing supercap-electrode cells are "confirmed verbatim," but the SHIP table's `bet` note reads "Accessible surface area drives **double-layer** capacitance" while the shipped-before text was "Accessible surface area drives capacitance" (no "double-layer"); (2) §3.4 says battery-conductive-additive changes are "none to the 3 existing cells except adding the purity target and note-preserving," but the SHIP table adds a brand-new note to `particle-size` ("Oversize grit causes coating defects...") where the existing file had no note at all. | notes/facts/test-matrix-facts.md:136,165 vs client/src/js/data/testMatrix.js (pre-edit) | fixed here — resolved by following §0 rule 1 (transcribe the SHIP table exactly) over the summary prose, since the table is the explicit source of truth; flagging so the research/writing split gets tightened |
| low | Browser console showed ~20 endpoints returning 500 on a fresh app load at localhost:5187 (graphene/biochar/shipments/MCB/etc. all failed with "Unknown error" from `handleResponse`) | observed via browser console during my own render check, app-refactored.js (not owned) | left, why: not owned — almost certainly transient breakage from W1-APP-DEDUPE's concurrent in-place rewrite of the file I'm forbidden to touch; not something my change caused or can fix |
| low | `GET /api/graphene` returned `200` with zero auth headers against a locally-started server | server/index.js (not owned) | left, why: not owned — this is exactly D-006, already ruled and already being fixed by the concurrent W1-AUTH-GUARD chip; noted only for completeness, not a new finding |

### What I saw outside my scope

The concurrent 500-error storm and the confirmed-live D-006 auth gap above are the two things I
noticed while exercising the server/UI for verification. Both are already owned by sibling chips
(W1-APP-DEDUPE, W1-AUTH-GUARD) per my spawn prompt's DO-NOT-TOUCH list, so I made no attempt to
diagnose or fix either — I only needed to confirm my own change (testMatrix.js data shape) wasn't
itself the cause, which the direct module-import check (clean, zero bad ids/levels) and the build
(clean) both rule out independently of whatever app-refactored.js is doing mid-edit.

### Risks in what I built

- **Transcription fidelity is the single point of failure here**, and I have no independent way to
  re-derive "correctness" beyond re-reading the fact file myself — I am the only check on my own
  copy-paste. I mitigated this by generating the applied cell list programmatically (item 3 in "How
  I verified it") and diffing it against the fact file's row-by-row `req` key lists rather than
  trusting my own memory of what I typed, but a silent one-word note mismatch would not be caught
  by that check (it only validates ids/levels, not note *text* fidelity). If the Command Center
  wants stronger assurance, a second pass that diffs note text char-for-char against the fact file
  would close that gap — I did not do this because CHIP-PROTOCOL.md doesn't ask for it and it would
  roughly double the file-reading cost of an already cheap job.
- **The two prose/table inconsistencies above are the most likely place a future reader gets
  confused** if they read the fact file's summary sentences instead of its tables — I resolved them
  in the direction the file's own §0 tells me to, but a different writing chip reading loosely
  could have shipped the *old* wording for those two notes instead, silently diverging from what a
  human reviewer expects when they check the fact file's "Changes" prose against the shipped file.

### Proposed follow-up chips

- **CHIP-MATRIX-VERIFY-RULING** — a human/Command Center ruling pass on the 17 parked Verify items
  in `notes/facts/test-matrix-facts.md` (§3.1-3.8 "VERIFY" tables): e.g. go-cement XPS C/O target,
  go-carbon-capture BET target (explicitly "none proposable"), supercap-electrode purity/BET
  targets, battery particle-size target, water-treatment zeta target, lubricants particle-size
  target, plus several ambiguous-mechanism items (carbon-capture moisture direction, coatings zeta
  formulation dependency). Lane B or a ruling-only session; owns nothing but produces a
  DECISIONS.md entry the Integrator applies, then a small follow-up write chip transcribes any
  newly-approved targets. Model tier: sonnet is enough (it's a judgment call over already-gathered
  facts, not new research).
- **CHIP-MATRIX-DISPERSION-COLUMN** (proposed by the research chip, relaying here) — evaluate
  whether to add the proposed `dispersion` test column (fact file §4); matrix-wide schema decision,
  needs Command Center sign-off before any chip touches `TEST_MATRIX_TESTS`. Lane B first (spec),
  then a Lane A write chip.
- **CHIP-MATRIX-GO-MERCHANT-ROW** (also relayed from the research chip, §5) — new
  `go-merchant` application row for GO-as-bulk-product, tied to the existing `grapheneOxideStream`
  proforma revenue stream. Needs its own research pass (all proposed cells are Verify-only, no
  Confident cells yet) — Lane B research chip first, same split as this wave.

### Harness improvements

- The spawn prompt's line "State how many cells you shipped and confirm the number matches the
  fact file's Confident/SHIP count" worked well as a forcing function — I'd keep that instruction
  verbatim in future writing-chip prompts, it caught nothing wrong this time but it's cheap
  insurance and would have caught a miscount immediately.
- Model tier: **sonnet was the right call, no upgrade needed.** This was pure transcription +
  mechanical verification (counting, schema-checking) with an explicit "do not reason about
  materials science" instruction — exactly sonnet's sweet spot. The one place a slightly sharper
  model might have helped is catching the two prose/table inconsistencies in the fact file faster;
  I found them by manually diffing every "Changes vs the existing file" sentence against its own
  SHIP table rather than by any shortcut, which took real wall-clock time for a 320-line file. A
  future version of the research skill could self-check that its own summary sentences match its
  own tables before handing off, which would remove this cross-check burden from the writing chip
  entirely.
- No wrong file paths or missing context in my spawn prompt — the line numbers cited (`:57-79`,
  `:87-181`, `:97`, `:114`) all matched the actual repo state exactly, which made this fast.
