---
name: test-matrix-research
description: >-
  Research which characterization & QC tests a given material+application needs,
  then emit a ready-to-paste row for the graphene Test Matrix (client/src/js/data/testMatrix.js).
  Use this WHENEVER the user wants to fill in, expand, research, or validate the Test Matrix —
  e.g. "what tests do we need for graphene oxide in cement?", "add a carbon-capture row to the
  matrix", "research the QC requirements for our graphene in battery anodes", "populate the
  coatings application", or any request to figure out the required tests for a material in an
  industry/use-case. Trigger even when the user names an application and a material without
  saying the words "test matrix".
---

# Test Matrix Research

## What this does and why it exists

The Test Matrix (Tests → Test Matrix page) answers one question for the sales/science team:
**"Before our material can be used in application X, which tests must we run — and to what spec?"**

Filling it in by hand is slow and inconsistent: two people research "graphene oxide in cement"
and come back with different test lists, different confidence levels, and no sources. This skill
makes the research **repeatable** — one method, one output shape, always sourced — so every row
in the matrix is trustworthy and looks like it was written by the same person.

The output is a single JavaScript object that drops straight into `TEST_MATRIX_APPLICATIONS`,
plus a short sourced rationale so a human can sanity-check it before it ships.

## The one rule that matters most

**Every requirement level and every target spec must trace to a real source** — a peer-reviewed
paper, a published standard (ASTM / ISO / IEC), a supplier technical datasheet, or an established
industry spec sheet. If you cannot find a source, say so and mark the cell as your reasoned
estimate rather than inventing a number. A confidently-wrong spec is worse than an honest gap,
because the team will quote it to a customer. When unsure, prefer `recommended` + a note over a
fabricated `required` + target.

## Step 0 — Load the live schema first (do not skip)

The matrix data model can change. Never work from memory of the columns — read the source of
truth so your output matches the current shape exactly:

1. Read `client/src/js/data/testMatrix.js`. From it, extract:
   - **The available test IDs** (`TEST_MATRIX_TESTS` — the `id` of each column) and what each
     `full` name means. You may ONLY use these IDs as keys in `req`.
   - **The valid levels** (`TEST_MATRIX_LEVELS` — currently `required` / `recommended` / `optional`).
   - **Existing rows** (`TEST_MATRIX_APPLICATIONS`) so you match their style and don't duplicate one.
2. Skim `references/test-glossary.md` in this skill — it says what property each test measures and
   which application concerns make it relevant. This is your reasoning scaffold for assigning levels.

If research surfaces a test that has **no matching ID** in the file, do NOT silently drop it or
jam it into a wrong column — handle it per "New test columns" below.

## Step 1 — Frame the application precisely

Vague framing produces a vague matrix. Pin down three things (ask the user only if genuinely
ambiguous — otherwise state your interpretation and proceed):

- **Material form** — Graphene Oxide (GO), reduced GO (rGO), pristine graphene, etc. Oxidation
  state changes which tests matter (e.g. C/O ratio is central for GO, irrelevant framing for
  pristine graphene).
- **Industry** — Construction, Energy Storage, Water Treatment, Coatings, …
- **Function in the use-case** — the *job the material does* is what drives the test list. "GO in
  cement as a strength-boosting admixture" needs different tests than "GO in cement as a corrosion
  inhibitor for rebar." Name the mechanism.

## Step 2 — Research the required tests

Goal: find what serious players (standards bodies, suppliers, researchers) actually measure and
specify for this material in this function. Search in roughly this order of trust:

1. **Published standards** — ASTM, ISO, IEC, and material-specific ones (e.g. ISO/TS graphene
   nomenclature & characterization standards; ASTM cement/concrete admixture standards). These
   give you both the test AND often a pass/fail threshold.
2. **Supplier technical datasheets & spec sheets** — how commercial GO/graphene is actually sold
   into this market (typical values become your `target`).
3. **Peer-reviewed literature & review papers** — especially reviews, which summarize which
   properties correlate with performance in this application (tells you what's *required* vs merely
   *characterized*).
4. **Industry / customer requirement docs** — RFQs, qualification protocols where available.

For each source, extract: *which test*, *why it matters for this function*, and *any numeric
target or acceptance range*. Prefer WebSearch/WebFetch; if the question is broad or you need
multi-source triangulation, the `deep-research` skill is a good force-multiplier — but you must
still map its findings back into the matrix schema yourself.

Distinguish two things that are easy to conflate:
- Tests that are **required to qualify the material for use** (safety, performance-critical,
  customer-mandated) → these drive `required`.
- Tests that merely **characterize** the material for a paper → often `recommended`/`optional`
  unless the property is load-bearing for the application's function.

## Step 3 — Assign a level, target, and note to each test

Use this rubric (it mirrors `TEST_MATRIX_LEVELS`, but here's how to *decide*):

- **`required`** — The application cannot be trusted/sold without this test passing. It's
  performance-critical, safety-critical, or explicitly customer/standard-mandated. Example:
  trace-metal purity (ICP) for battery materials — a safety gate, non-negotiable.
- **`recommended`** — Strongly expected by most customers or validation protocols; its absence
  would raise eyebrows but isn't an absolute blocker. Example: BET surface area for a cement
  admixture — informative and commonly reported, rarely a hard gate.
- **`optional`** — Situational or deeper-characterization value; nice to have. Example: XRD on a
  material whose performance doesn't hinge on crystallinity for this function.
- **Omit the test entirely** if it's genuinely not evaluated for this application. A blank cell is
  honest; a padded matrix is noise.

For each included test, populate:
- `level` — per the rubric.
- `target` (optional) — a short, human-readable spec that renders IN the cell. Keep it tight:
  `≥400 m²/g`, `C/O ≈ 2`, `<50 ppm Fe`. Omit if there's no meaningful numeric target.
- `note` (optional) — one sentence, shown on hover, explaining *why this test matters here* (the
  mechanism) and/or the source. This is what makes the matrix teachable rather than a wall of dots.

## Step 4 — New test columns (when research outgrows the schema)

If the right test for an application isn't among the current `TEST_MATRIX_TESTS` IDs (say research
says "you must run rheology / dispersion-stability" and there's no column for it), don't force it.
Instead, in your output, add a clearly-labeled **"Proposed new columns"** section describing:
`{ id, label, full, group }` for each new test, plus one line on why the matrix needs it. Adding a
column is a deliberate, matrix-wide decision (it affects every row and the group header bands), so
surface it for a human to approve rather than editing `TEST_MATRIX_TESTS` unprompted. If the user
says go ahead, add the column object to `TEST_MATRIX_TESTS` (respecting the `group` bands) and then
fill the cell.

## Step 5 — Emit the output

Produce two things, in this order:

**(A) A sourced rationale table** — so a human can verify before it ships:

| Test | Level | Target | Why it matters here | Source |
|------|-------|--------|---------------------|--------|
| BET  | required | ≥400 m²/g | Adsorption capacity scales with surface area | Smith et al. 2021; ISO XXXX |

**(B) The ready-to-paste row object**, matching the exact style of existing entries in
`testMatrix.js` (2-space indent, trailing commas, `id` in kebab-case, `req` keyed by real test IDs):

```js
{
  id: 'go-carbon-capture',          // kebab-case, unique; not already in the file
  industry: 'Carbon Capture',
  application: 'CO₂ sorbent',        // the function, short
  material: 'Graphene Oxide',
  notes: 'High surface-area GO framework for CO₂ adsorption.',  // one-line context; '' if none
  req: {
    bet:  { level: 'required',    target: 'high m²/g', note: 'Adsorption capacity scales with surface area.' },
    xps:  { level: 'required',    note: 'Surface chemistry governs CO₂ affinity.' },
    tga:  { level: 'required',    note: 'Thermal stability across adsorption/regeneration cycles.' },
    ftir: { level: 'recommended' },
  },
},
```

Only use test IDs that exist in the file. Omit `target`/`note`/`notes` when you have nothing
substantive — don't pad with filler.

## Step 6 — Deploy into the matrix

Once the human is happy (or if they said "just add it"):

1. Edit `client/src/js/data/testMatrix.js` — insert the object into `TEST_MATRIX_APPLICATIONS`,
   grouped near other rows of the same industry. If a scaffold row for this application already
   exists with an empty `req: {}`, fill THAT row in place rather than adding a duplicate.
2. Keep the file valid JS: unique `id`, balanced braces, trailing commas consistent with neighbors.
3. Verify: run `npm run build` (catches syntax errors), or load the Test Matrix page in the
   preview and confirm the new row renders with the right cells. The page reads this file directly —
   no API, DB, or schema change is involved.
4. Do NOT commit or push unless the user asks. Report what you added and the sources you used.

## Quality bar — what "good" looks like

- Every `required` and every `target` is traceable to a named source. Gaps are labeled as
  estimates, not hidden.
- Levels are *decided*, not defaulted — a matrix where everything is `required` is useless, and so
  is one where everything is `optional`. The mix should reflect real qualification priorities.
- `note`s explain mechanism ("why THIS test for THIS function"), turning the matrix into something
  a new hire can learn from.
- The row is byte-compatible with the file's existing style and drops in without hand-fixing.

## Batch mode

If the user asks for several applications at once ("fill in all the empty scaffolds", "research the
whole Energy Storage industry"), process them one application at a time through Steps 1–5, present
all rationale tables together for one review pass, then deploy the approved rows in a single edit.
Reuse research across rows where the same material+function recurs, but re-check targets per
application — the same test often has different acceptance specs in different industries.
