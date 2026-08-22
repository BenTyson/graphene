# CHIP-W1-MATRIX-RESEARCH

- **Lane:** B (spec/docs/research)
- **Model tier used:** fable
- **Owned files:** `notes/W1-MATRIX-RESEARCH.md`, `notes/facts/test-matrix-facts.md`
- **Wave:** 1

## What I was asked to do

Under D-008: (1) audit the 8 existing Test Matrix application rows — none had recorded provenance — ranking the audit above adding anything; (2) fill their gaps, distinguishing "nobody knew" from "genuinely N/A"; (3) only then propose new rows; and emit the whole thing as a Confident/Verify fact file (`notes/facts/test-matrix-facts.md`) that W1-MATRIX-WRITE can transcribe without judgment. Zero application code. Use the `test-matrix-research` skill.

**Understanding mismatch worth recording:** the spawn prompt (quoting D-008) says the matrix holds "25 tests" and I should report coverage against "~200 possible cells". The file holds **14 tests** (`client/src/js/data/testMatrix.js:57-79`), so the real cell space is 14 × 8 = **112**. Also, only 4 of the 8 rows are populated (17 cells); the other 4 are empty `req: {}` scaffolds (`testMatrix.js:148-181`) — so "audit the eight rows" was in practice "audit 17 cells, author ~4 rows from scratch".

## What I did

1. Read `CHIP-PROTOCOL.md`, `DECISIONS.md`, the `test-matrix-research` skill + its `references/test-glossary.md`, and the live schema in `client/src/js/data/testMatrix.js` (line-verified all ids, levels, and existing cells).
2. Ran 13 web searches + 1 page fetch across standards (ISO/TS 21356-1, ISO/TR 19733, ASTM C494, NSF/ANSI 61), supplier spec sheets (Imerys Super P Li TDS values via reseller republication; Kuraray YP-50F), and review literature for all 7 industries.
3. Audited all 17 existing cells: **14 confirmed, 3 corrected** — `ftir` on go-cement downgraded required→recommended; both quasi-numeric targets in the file ('C/O ≈ 2' at `testMatrix.js:97`, 'high m²/g' at `:114`) demoted/removed as unsourceable acceptance specs. No outright fabrications found.
4. Filled gaps in the 4 populated rows and authored the 4 scaffolds, each cell tagged Confident (with source) or Verify (with the exact inference stated), plus explicit "not evaluated, because…" entries.
5. Proposed (not shipped): 1 new column (`dispersion` — the failure mode three industries share), 1 new row (`go-merchant`, backed by the proforma's built-in `grapheneOxideStream` revenue stream at `shared/proformaDefaults.js:73`).

## How I verified it

Lane B bar: every repo claim carries a `file:line` checked against `cat -n` output in-session, not recalled — schema ids (`testMatrix.js:59-78`), levels (`:25-51`), all 17 audited cells (`:95-145`), scaffolds (`:148-181`), omission semantics (`:17`), proforma stream ids (`shared/proformaDefaults.js:34,55,73,298`). Every world claim carries an external source in the fact file's Source Register ([S1]–[S18], URLs included; supplier spec values quoted from a fetched page, not memory). The in-repo glossary ([G]) is used alone only for `recommended`/`optional` levels, never for `required` or targets.

**Consistency statement:** the fact file deliberately contradicts three shipped cells (`testMatrix.js:97,98,114` — detailed in its §6) and confirms the rest. It contradicts D-008's "25 tests" count (file has 14). It does not contradict CLAUDE.md.

## Measurements

- Real cell space: **112** (14 tests × 8 rows), not ~200 as prompted.
- Coverage: 112/112 dispositioned. **41 cells ship Confident** (incl. 3 Confident targets), **17 items Verify** (awaiting human ruling), **10 explicit reasoned not-evaluated**, remainder "no gate found" omissions.
- Existing-cell audit ratio: 17 audited → 14 confirmed / 3 corrected / 0 fabricated. Both numeric-ish targets in the shipped file (2 of 2) were unsourceable as acceptance specs — D-008's suspicion was justified exactly where the damage potential is highest (numbers quoted to customers).
- Confident:Verify ≈ 41:17 (~70% of affirmative content ships).

## Handoff: changes needed in files I do not own

None beyond the intended pipeline: `client/src/js/data/testMatrix.js` changes are fully specified in `notes/facts/test-matrix-facts.md` §0–§3 for W1-MATRIX-WRITE (including deleting the TODO comment at `testMatrix.js:96` and the three corrections at `:97,:98,:114`).

## Draft for shared docs

For the Integrator, DECISIONS.md D-008 bookkeeping: replace "25 tests" with "14 tests" in the final paragraph (count verified against `client/src/js/data/testMatrix.js:57-79`; groups: 5 Structure, 4 Surface & Chemistry, 4 Composition & Purity, 1 Performance).

## Reflections

| Severity | Finding | Where | Status |
|---|---|---|---|
| high | Both numeric-ish targets in the shipped matrix ('C/O ≈ 2', 'high m²/g') were unsourceable as acceptance specs — exactly the values a salesperson would quote | client/src/js/data/testMatrix.js:97,114 | fixed via fact file (removed/demoted to Verify) |
| medium | D-008 states "25 tests"; file has 14 — a chip trusting the ruling over the repo would misreport coverage by ~2× | DECISIONS.md D-008 / testMatrix.js:57-79 | left, why: shared doc — draft entry above for Integrator |
| medium | ftir marked `required` for cement with no source; duplicative gate with XPS — would send the lab running a test that gates nothing | testMatrix.js:98 | fixed via fact file (→ recommended) |
| medium | Chip worktrees omit untracked-but-load-bearing files: CHIP-PROTOCOL.md, DECISIONS.md, notes/, the skill dir, and testMatrix.js itself were all absent from my worktree (untracked in main) — I had to read every one of them from the shared checkout by absolute path | .claude/worktrees/* | left, why: harness — proposed as CHIP-W2-TRACK-PROTOCOL below |
| low | Skill's Step 5 example row uses id `go-carbon-capture`, which already exists in the data file — a copy-paste from the example would collide | .claude/skills/test-matrix-research/SKILL.md (Step 5) | left, why: not owned |
| low | TODO comment self-documents the unsourced seeding | testMatrix.js:96 | fixed via fact file (deletion instructed) |
| info | Environment fault (host slept) killed the session after research, before any file was written; worktree auto-cleaned; Command Center redirected output to main-repo notes paths | this session | noted — see Harness improvements |

### What I saw outside my scope

- The three built-in proforma revenue streams map cleanly onto matrix rows (`supercapElectrode`→supercap-electrode, `carbonBlackCathodeAnode`→battery-conductive-additive) **except** `grapheneOxideStream` (`shared/proformaDefaults.js:73`) — a revenue line with no QC row. That gap is the one new row worth adding (proposed as Verify in the fact file, §5).
- The matrix has exactly one Performance-group column (`conductivity`). Real application qualification (salt spray, four-ball wear, C494 concrete tests) has no home; the fact file scopes these out explicitly, but customers will ask.
- `TEST_MATRIX_TESTS` ids are designed to match test-result tab slugs for future deep-linking (`testMatrix.js:54-56`) — worth preserving if columns are ever added.

### Risks in what I built

- **Benchmark-transfer targets.** The two Confident numeric targets on the battery row (Fe ≤5 ppm / moisture ≤0.1%) are Super P Li *carbon black* specs applied to graphene. I shipped them only because the cell text itself carries "(Super P Li benchmark)"; if W1-MATRIX-WRITE trims that suffix for space, the number becomes a fabricated house spec. The suffix is load-bearing.
- **Level judgments backed by [G] alone.** Several recommended/optional levels rest on the in-repo glossary, which is itself an unaudited project asset. I never let [G] alone carry a `required` or a target, but if the glossary is wrong somewhere, my recommended/optional split inherits it.
- **The water-treatment xrd target (d ≈ 0.8 nm dry)** is a characteristic literature value, not our measured value. If our hemp-derived GO stacks differently, the cell reads as a spec we don't meet. In-house XRD should replace it.
- **Where a wrong row does most damage:** battery purity/moisture (safety-adjacent, customer-quotable numbers) and water-treatment purity (NSF/ANSI 61 is a regulatory claim). I kept all three maximally conservative and sourced.

### Proposed follow-up chips

- **CHIP-W2-MATRIX-WRITE-REVIEW** — after W1-MATRIX-WRITE lands, diff `testMatrix.js` against the fact file's SHIP tables cell-by-cell (transcription fidelity check, incl. the benchmark suffixes). Owns nothing; Lane B; haiku/sonnet tier.
- **CHIP-W2-GO-MERCHANT-RESEARCH** — research pass for the proposed `go-merchant` row + rule on the 17 Verify items, ideally with in-house data (our hemp-route GO's actual C/O, d-spacing, ICP). Owns `notes/facts/test-matrix-facts.md` (append-only section); Lane B; fable (web + judgment).
- **CHIP-W2-TRACK-PROTOCOL** — decide whether CHIP-PROTOCOL.md / DECISIONS.md / notes/ / skills should be git-tracked so provisioned worktrees contain them; currently every chip must escape its worktree to read its own contract. Owns the tracking decision + a DECISIONS draft; Lane B; sonnet.

### Harness improvements

- **The fault, and what incremental writing would have saved.** The host slept after ~30 minutes of research and before I had written a single byte to disk; the worktree was auto-cleaned because it was unchanged. Everything survived only because my context survived — a full restart would have lost 13 searches and the complete audit. Lesson for CHIP-PROTOCOL.md: **a research chip should write its fact file incrementally as findings land** (skeleton first, then per-row sections after each research batch), not compose it in one final action. Cost of incremental writes: near zero. Cost of the alternative: this entire chip, twice. On restart I wrote the fact file in 2 chunks and this file immediately after — that ordering (deliverable → reflections → polish) should be the standing rule.
- **Worktree provisioning gap** (also in findings table): every load-bearing coordination file was untracked and therefore absent from my worktree. I read them from the shared checkout by absolute path — workable for Lane B, but a sandbox rule also (correctly) blocked `cd <main-repo> && git ...`, and the same isolation would bite harder on a chip that needed to *diff* against those files.
- **Spawn-prompt numbers were stale** ("25 tests", "~200 cells"). Cheap to tolerate here, but it validates the protocol's "trust the repo over the notes" rule — worth the Command Center re-measuring counts at spawn time.
- **The skill served well.** Its step order (schema-first, source-trust hierarchy, level rubric, "omit = honest blank") matched this task almost exactly; the glossary was a genuinely useful scaffold. Two gaps: its Step 5 example id collides with a live row (findings table), and it has no guidance for *auditing* existing rows (only authoring new ones) — a short "audit mode" section would have saved me inventing the confirm/correct/demote verdict vocabulary.
- **Model tier:** fable was right for this — the value was judgment calls at the Confident/Verify boundary, which a cheaper tier would have flattened into over-confidence one way or the other. The transcription half (W1-MATRIX-WRITE) genuinely needs nothing above haiku/sonnet.
