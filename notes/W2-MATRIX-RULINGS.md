# CHIP-W2-MATRIX-RULINGS

- **Lane:** A (implementation)
- **Model tier used:** sonnet
- **Owned files:** `client/src/js/data/testMatrix.js`, `notes/W2-MATRIX-RULINGS.md`
- **Wave:** 2

**Note to the Command Center:** this chip was killed by a host-sleep fault right at the write-up
step (per your message). The transcription itself had already landed and you verified it
independently (58 cells, 0 bad ids, 0 bad levels). This notes file is the resumed write-up, plus
the two follow-up items you asked me to resolve (the count reconciliation and the three remaining
numeric targets), completed and re-verified before this file was written.

## What I was asked to do

Apply D-014 (DECISIONS.md) — the Command Center's rulings on all 26 previously-unshipped
("Verify") Test Matrix cells identified by W1-MATRIX-RESEARCH (`notes/facts/test-matrix-facts.md`,
input, read-only) and counted by D-013 — to `client/src/js/data/testMatrix.js`. D-014's own text:
24 of 26 cells ship, none with a numeric target; 2 dropped (Carbon capture/raman,
Composites/bet). Every judgement-based cell must say so in its note (D-014 point 5), because the
Test Matrix is public factual copy (D-008) and the Confident/Verify split only survives if a
reader can tell sourced cells from engineering-judgement cells apart.

Do not add test columns or application rows (the fact file's proposed `dispersion` column and
`go-merchant` row are explicitly out of scope — matrix-wide decisions, not mine).

## Note convention (stated up front, per the spawn prompt)

Two literal, greppable markers so a later chip can turn them into a visual treatment without
re-deriving which cells are which:

1. **`[D-014 judgement]`** — start of the note on any of the **17 new cells** added under this
   ruling. All of these rest on engineering judgement, not a source (D-014's own preamble: "None
   of these rows gains a source by being ruled on").
2. **`[D-014 reference only, not spec]`** — inline, appended after the original sourced note text,
   on the **9 already-Confident cells** (7 from D-014's Group A + 2 more I added by extension —
   see the targets section below) whose *level* was already sourced and stays Confident, but whose
   note now carries a borrowed-material benchmark number for context.

## What I did

Edited `client/src/js/data/testMatrix.js` only. Full per-row detail:

**go-cement**: added `elemental` (optional, judgement — duplicates XPS, no failure mode).
Extended `xps` note with the Hummers-route C/O 1.8–2.5 reference (no target).

**go-carbon-capture**: added `moisture` (recommended, judgement — direction depends on capture
mode) and `elemental` (optional, judgement — duplicates XPS). Did **not** add `raman` — dropped
per D-014 ("material fingerprint", no failure mode). Extended `bet` note with the 1.354 mmol/g @
107 m²/g context (no target — target was already absent and stays absent).

**supercap-electrode**: added `moisture` (recommended, judgement — Li-ion transfer) and
`particle-size` (optional, judgement — downgraded from the researcher's proposed recommended).
Extended `purity` note with the YP-50F ash/Fe benchmark and `bet` note with the YP-50F ~1600 m²/g
context (both reference-only, no target — targets were already absent).

**battery-conductive-additive**: added `tga` (optional, judgement — loose volatiles mapping) and
`sem` (optional, judgement — qualitative gate only). Extended `particle-size` note with the Super P
grit benchmark (reference-only, no target). **Also removed the numeric `target` fields from
`purity` and `moisture`** — see "The three remaining targets" below; those numbers moved into the
note, same reference-only pattern.

**composites-polymer**: added `moisture` (recommended, judgement — hygroscopic-filler mechanism)
and `ftir` (optional, judgement — functionalized grades only). Did **not** add `bet` — dropped per
D-014 ("general quality metric", no failure mode).

**coatings-anticorrosion**: added `zeta` (recommended, judgement — scoped to waterborne only),
`xrd` (optional, judgement), `ftir` (optional, judgement).

**water-treatment**: added `particle-size` (optional, judgement — downgraded from proposed
recommended) and `ftir` (optional, judgement). Extended `zeta` note with the ±30 mV heuristic
context (reference-only, no target — target was already absent). Did **not** change the `zeta`
level — see Ambiguity #1 below.

**lubricants**: added `purity` (recommended, judgement — self-evident mechanism), `tga`
(recommended, judgement), `moisture` (optional, judgement). Extended `particle-size` note with the
<10 µm single-study benchmark (reference-only, no target — target was already absent). Did **not**
change the `particle-size` level — see Ambiguity #1 below.

## The count reconciliation (Command Center's item 1)

**Answer: the file has 58 cells. D-014's stated arithmetic, 41 + 24 − 2 = 63, is wrong. I did not
adjust my work to hit 63.**

Working, shown in full:

| Step | Count | What it is |
|---|---|---|
| Cells before | 41 | Sum of `req` keys across all 8 rows, pre-D-014 (verified by counting the shipped file before I touched it — matches the fact file §7: "Cells affirmatively decided and shipping (Confident): 41") |
| New cells added | 17 | Test ids that did **not** previously exist in that row's `req`, added under D-014 |
| Cells dropped | 2 | Candidate new cells D-014 rules out entirely (carbon-capture/raman, composites/bet) — **never added**, so they don't subtract from anything; they simply aren't in the 17 |
| Existing cells modified in place | 9 | Test ids that **already existed** in the row's `req` (already counted in the 41), whose `note`/`target` I changed but whose key didn't change — 7 from D-014's Group A + water-treatment/zeta's own pre-existing target-absence, plus 2 more from the "targets remaining" fix below |
| **Cells after** | **41 + 17 = 58** | Verified in Node: `Total cells (sum of req keys across all rows): 58` |

**Why 63 is wrong, specifically.** D-014's own text says "24 of 26 cells ship... 2 dropped" — that
24/2 split is internally correct as a count of *rulings*. The formula `41 + 24 − 2 = 63` then
implicitly assumes all 24 "shipping" rulings are net-new keys added to some row's `req`. They are
not. Of the 26 unsourced items W1-MATRIX-RESEARCH flagged, only **19** were genuinely new test ids
not yet present on their row (17 of which ship, 2 of which are dropped). The other **7** were
Verify items about a *target or note* on a test id that **already existed** in the row (all of
Group A: cement/xps, supercap/purity, battery/particle-size, water-treatment/zeta,
lubricants/particle-size; plus the "targets confirmed absent" pair, carbon-capture/bet and
supercap/bet). Those 7 modify cells already inside the 41 — they cannot also be "added" without
double-counting the same key twice. The correct formula is `41 + 17 = 58`, not `41 + 24 − 2 = 63`.

I traced every one of the 26 fact-file VERIFY rows individually against the shipped file's actual
`req` keys before writing this — the 7-vs-19 split isn't an estimate, it's an exhaustive
enumeration (available on request; omitted here for length, but every row above documents which of
its cells were "added" vs "extended").

## The three remaining targets (Command Center's item 2)

Per-cell justification, each with a `test-matrix-facts.md` citation:

1. **`battery-conductive-additive.purity` = `'Fe ≤5 ppm, Ni ≤1 ppm (Super P Li benchmark)'`** —
   sourced from `test-matrix-facts.md:148`, in the row's **SHIP (Confident)** table, source `[S4]`
   = Imerys/TIMCAL Super P Li spec sheet (`test-matrix-facts.md:304`). **Verdict: borrowed number,
   moved to note.** Super P Li is a carbon-black conductive additive, a categorically different
   material from graphene, exactly the pattern D-014 rule 1 exists to catch — and D-014's own
   Group A table already orders the *particle-size* cell on this identical row to have its Super P
   grit number pulled from target to note. Leaving these two Super P numbers sitting in the
   rendered `target` field on the same row, while the Super P number one cell over gets pulled,
   would be an indefensible inconsistency in the same document. **Action taken:** moved to note as
   `[D-014 reference only, not spec] Super P Li — a carbon black, not our material — specs Fe ≤5
   ppm / Ni ≤1 ppm as a reference point, not our acceptance spec.` `target` field removed.

2. **`battery-conductive-additive.moisture` = `'≤0.1% (Super P Li benchmark)'`** — sourced from
   `test-matrix-facts.md:149`, same SHIP table, same source `[S4]`. **Verdict: same reasoning,
   same action.** Moved to note: `[D-014 reference only, not spec] Super P Li — a carbon black,
   not our material — specs moisture ≤0.1% as a reference point, not our acceptance spec.` `target`
   field removed.

3. **`water-treatment.xrd` = `'d(001) ≈ 0.8 nm (dry)'`** — sourced from `test-matrix-facts.md:224`,
   SHIP table, source `[S15]`, with explicit reasoning at `test-matrix-facts.md:230`: "a
   well-documented typical value for GO laminates... a characteristic value, not an invented
   acceptance number." **Verdict: not a borrowed number — left as a target, unchanged.** `[S15]` is
   GO-laminate membrane literature — i.e., about our own material class (Graphene Oxide), not a
   different material standing in for it the way Super P Li (carbon black) or Kuraray YP-50F
   (activated carbon) do for the Group A cells. D-014 rule 1's concern is specifically "all five
   proposed numbers came from a different material or duty" — this number doesn't have that
   defect. Pulling it would be over-applying the rule to a cell it wasn't written for.

**Note on scope:** items 1 and 2 are not literally named in D-014's Group A table (which names only
five specific cells, and these aren't among them) — I am extending D-014 rule 1's *principle* to
two cells D-014 didn't individually address, because leaving them as-is produces a visibly
inconsistent document on the same row where D-014 *did* rule. If the Command Center disagrees with
extending the rule this far without a fresh ruling, both edits are a two-line revert (paste the
target string back, drop the added note sentence) — flagged here so that's a cheap fix either way.

**Grep confirmation — the five Group A numbers and the two Super P benchmarks are absent as
targets; only one `target:` field exists anywhere in the file:**

```
$ grep -n "target:" client/src/js/data/testMatrix.js
201:      xrd: { level: 'required', target: 'd(001) ≈ 0.8 nm (dry)', note: '...' },
```

That is the only `target:` field in the entire file (verified by grep, not by counting the ones I
expected to remove). It is item 3 above, deliberately kept.

## How I verified it

**Lane A bar (CHIP-PROTOCOL §4):** `npm run build`-equivalent (`npx vite build`, per D-010), read
its output, `node --check` on the changed file, and exercised the change for real — I ran the
module directly in Node and inspected actual printed values rather than trusting exit codes. The
app is login-gated (D-004/D-005: no chip creates a user or writes to the DB); I did not attempt to
load the tab in a browser, since I have no credentials, and said so rather than claiming a UI check
I didn't do.

```
$ node --check client/src/js/data/testMatrix.js
NODE_CHECK_OK
```

Structural validation script (`/private/tmp/.../scratchpad/validate-matrix.mjs`, imports the real
module in Node — ESM, `"type": "module"` in package.json):

```
Test columns: 14 xrd, raman, tem, sem, particle-size, bet, xps, ftir, zeta, elemental, purity, tga, moisture, conductivity
Levels: 3 required, recommended, optional
Application rows: 8

Total cells (sum of req keys across all rows): 58
Bad test ids: none
Bad levels: none

Cells WITH a target field: water-treatment.xrd = "d(001) ≈ 0.8 nm (dry)"   <- only one, post-fix

Grep for the five D-014 Group-A borrowed numbers appearing as a `target:` value: none found

Per-row cell counts:
 go-cement: 7 | go-carbon-capture: 7 | supercap-electrode: 7 | battery-conductive-additive: 8
 composites-polymer: 8 | coatings-anticorrosion: 8 | water-treatment: 7 | lubricants: 6
(sum = 58)

[D-014 judgement] tagged cells: 17 (expect 17)
[D-014 reference only, not spec] tagged cells: 9 (expect 7 base + 2 from the targets fix)
```

Build, own output directory per D-010:

```
$ npx vite build --outDir ../dist-matrixrulings
✓ 127 modules transformed.
../dist-matrixrulings/index.html  88.88 kB │ gzip: 12.25 kB
../dist-matrixrulings/assets/index-CRMkjU9d.js  1,203.11 kB │ gzip: 184.94 kB
✓ built in 903ms
```
(Module count moved 125→127 between my two build runs because sibling chip W2-DEADCODE-PURGE
landed its 6 file deletions in the shared tree mid-session — not something in my owned files;
noted, not acted on.) I grepped the actual built bundle (not just the source) to confirm the
markers survive minification:

```
$ grep -o "D-014 judgement" dist-matrixrulings/assets/index-*.js | wc -l
17
$ grep -o "D-014 reference only, not spec" dist-matrixrulings/assets/index-*.js | wc -l
9
```

`dist-matrixrulings/` deleted after each check (gitignored, but tidied anyway per D-010 shared-tree
hygiene — no other chip should trip over it).

## Draft wiring

None. `testMatrix.js` is self-contained; no wiring needed (confirmed by D-008 itself).

## Draft for shared docs

None — CLAUDE.md's Test Matrix bullet already describes the data-file-only editing model
correctly; no correction needed from this chip.

## Handoff: changes needed in files I do not own

None.

## Reflections

| Severity | Finding | Where | Status |
|---|---|---|---|
| high | D-014's arithmetic (`41+24−2=63`) is wrong; correct total is 58 — 7 of the 26 rulings modify cells already inside the 41, not net-new cells | DECISIONS.md D-014 "Net effect" | left, why: not owned (DECISIONS.md) — reported here for the Integrator/Command Center to correct, per D-008's own precedent (the "25 tests"/"17 not 26" corrections) |
| high | D-014 Group A's per-row text says `Water treatment \| zeta \| Keep recommended` and `Lubricants \| particle-size \| Keep recommended`, but both cells already ship Confident at `required` — a real level/text conflict, not a typo I could silently resolve | DECISIONS.md D-014 Group A table; `testMatrix.js:202,217` | fixed here — kept `required` (see Ambiguity #1 below), flagged for Command Center confirmation |
| medium | Two numeric targets (`battery-conductive-additive.purity`, `.moisture`) were sourced Super P Li benchmarks sitting directly in the rendered `target` field, inconsistent with D-014's explicit removal of the Super P benchmark on the neighboring `particle-size` cell in the same row | `testMatrix.js:150-151` pre-fix | fixed here — moved to note, flagged as an extension of D-014 by analogy, not a literal instruction |
| low | `test-matrix-facts.md` (read-only input) has its own known-drift history (D-013 already documents 2 prior summary/table mismatches); I did not find a third, but I relied on its tables, not its prose summaries, throughout, per its own §0 rule | `notes/facts/test-matrix-facts.md` | left, why: not owned, read-only input |

### What I saw outside my scope

- `git status` at start showed 6 file deletions already staged/committed by W2-DEADCODE-PURGE
  (`app.js`, `app-original.js`, `DealModal.js`, `DealDetailPanel.js`, `NewsTab_backup.js`,
  `ProductionPulse.js`) and untracked notes for `W2-AUTH-CLIENT` and `W2-DEADCODE-PURGE` — both
  siblings named in my spawn prompt's do-not-touch list. I did not open or touch any of them.
- The Vite build's module count changed between my two build runs (125→127) purely because of that
  sibling's deletions landing in the shared tree mid-session — expected under D-010 (shared working
  directory, no worktree isolation), not a defect in my own work.
- `client/src/js/data/testMatrix.js`'s header comment ("HOW TO EXTEND") and the D-008 ruling both
  describe `target` as literally what renders in the cell and `note` as the tooltip — this is the
  load-bearing fact behind both the marker-convention design and the decision to move the two Super
  P numbers out of `target`. Worth keeping in mind for any future chip touching this file: the
  target/note split is not cosmetic, it is the actual customer-facing risk boundary D-008 cares
  about.

### Risks in what I built

- **The two marker strings are prose, not a schema field.** Nothing enforces that every judgement
  cell carries `[D-014 judgement]` — a future hand-edit to this file could add an unmarked
  judgement cell and nothing would catch it. If the Command Center wants this durable, it belongs
  as a real field (e.g. `basis: 'sourced' | 'judgement'`) rather than a string convention; I left it
  as a string because the spawn prompt's own framing ("a later chip may turn it into a visual
  treatment") anticipated exactly that kind of follow-up, and a schema change felt out of scope for
  a chip whose owned file is meant to just carry data.
- **My extension of D-014 to the two Super P targets is my own inference**, not literal ruling
  text. I've made the reasoning and the revert path explicit above so it's cheap to override if the
  Command Center disagrees, but it is a real content change beyond the 26-cell scope I was handed.
- **The `required`-vs-`recommended` conflict on water-treatment/zeta and lubricants/particle-size**
  was resolved by keeping the already-shipped Confident level, on the theory that D-014's own
  section header ("level ships, number does not") governs over what looks like a drafting slip in
  2 of the 5 per-row cells. I could be wrong about which one is the slip — it's equally possible
  the Command Center intended a genuine downgrade and mistyped the header instead. Either way, this
  is the single largest interpretive judgment call I made, and I did not silently resolve it either
  direction without flagging it.

### Proposed follow-up chips

- **CHIP-MATRIX-BASIS-FIELD** (Lane A, sonnet): promote the `[D-014 judgement]` /
  `[D-014 reference only, not spec]` string markers into a real `basis` field on each cell
  (`sourced | judgement | reference`), and have `TestMatrixTab.js` render a visual distinction
  (e.g. a small dot or icon) instead of relying on tooltip text. Owns `testMatrix.js` +
  `TestMatrixTab.js` (the latter is not in my owned-files list, so I didn't touch it).
- **CHIP-MATRIX-GO-MERCHANT** (Lane B research, sonnet or above): the fact file's §5 proposes a
  `go-merchant` application row (GO sold as bulk product) — explicitly out of scope for both W1 and
  this chip. Needs its own research pass per the fact file's own note.

### Harness improvements

- The spawn prompt's arithmetic check ("must come to 41+24−2=63... if your number differs, do not
  adjust to fit, record the discrepancy") worked exactly as intended — it caught a real defect in
  D-014 rather than in my transcription. Worth keeping this pattern (a chip-independently-derived
  arithmetic check against a ruling's own stated numbers) in `CHIP-PROTOCOL.md` §6 as a named
  technique, since this is now the second wave running where "trust the repo/verify by counting"
  caught an error the Command Center itself introduced (first was D-008's "25 tests", now this).
- This did not need a stronger tier than sonnet. The work was mechanical transcription plus careful
  enumeration/counting — the one place it got genuinely hard (the required-vs-recommended
  ambiguity, the arithmetic reconciliation) was solved by exhaustive listing rather than by deeper
  reasoning capability, and sonnet handled the volume fine.
- Getting killed at the write-up step (host sleep) cost a full resumption round-trip even though
  the file edit itself was intact and independently verified by the Command Center. §5a's "write
  early, write often" is right, and I should have opened the notes file with the plan/reconciliation
  written *before* running the build the second time, not after. Filed this as a personal process
  note more than a harness gap — the tooling didn't fail me, I finished the risky work before
  writing it down.
