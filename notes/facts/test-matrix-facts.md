# Test Matrix — Verified Fact File

- **Chip:** W1-MATRIX-RESEARCH · Lane B · Wave 1
- **Date:** 2026-08-21
- **Governing ruling:** D-008 (Test Matrix content is public factual copy; Confident/Verify split; unverified rows do not ship)
- **Consumer:** W1-MATRIX-WRITE, which may transcribe into `client/src/js/data/testMatrix.js` **nothing that is not in this file**.

---

## 0. How the writing chip must read this file

1. **Only cells in a "SHIP (Confident)" table may be written into `testMatrix.js`.** Transcribe `level`, `target`, and `note` exactly as given. A blank target/note column means the cell ships without that field.
2. **"VERIFY" tables do not ship.** They are for a human to rule on. Do not write them into the data file in any form.
3. **"Not evaluated" lists** mean: the `testId` is omitted from that row's `req` object entirely (per `testMatrix.js:17`, omission = "not evaluated / NA").
4. **"Changes vs the existing file"** in each section list edits to already-shipped cells (level changes, target removals, note rewrites). Apply them — they are corrections of unsourced or wrong content.
5. Valid test ids and their `testMatrix.js` lines (checked 2026-08-21): `xrd`:59, `raman`:60, `tem`:61, `sem`:62, `particle-size`:63, `bet`:66, `xps`:67, `ftir`:68, `zeta`:69, `elemental`:72, `purity`:73, `tga`:74, `moisture`:75, `conductivity`:78. Valid levels `required | recommended | optional` (`testMatrix.js:25-51`). No other ids or levels exist.
6. Sources are cited as `[S#]` and resolved in the Source Register (§8). Sources are for the human reviewer; they do NOT get transcribed into the data file.

## 1. Schema facts (checked against the repo, not recalled)

- The matrix has **14 test columns**, not 25 — `TEST_MATRIX_TESTS`, `client/src/js/data/testMatrix.js:57-79`. **This contradicts D-008** ("25 tests and 8 application rows"). The 8-rows/7-industries half is correct (`testMatrix.js:87-181`).
- 4 rows are populated with **17 cells total**: `go-cement` (6 cells, :95-103), `go-carbon-capture` (5 cells, :113-119), `supercap-electrode` (3 cells, :129-133), `battery-conductive-additive` (3 cells, :141-145).
- 4 rows are empty scaffolds with `req: {}`: `composites-polymer` (:150-156), `coatings-anticorrosion` (:157-164), `water-treatment` (:165-172), `lubricants` (:173-180).
- Cell shape is `testId: { level, target?, note? }`; `target` renders in the cell, `note` in the tooltip (`testMatrix.js:84-85`).
- Total possible cells: 14 × 8 = **112** (spawn prompt said ~200; that assumed 25 columns).
- None of the 17 existing cells carries any recorded source. The `go-cement` row even self-declares this: `// TODO: confirm targets with the team — seeded as a starting point.` (`testMatrix.js:96`).

## 2. Audit verdict on the 17 existing cells (summary)

| Row | Cell | Existing content | Verdict |
|---|---|---|---|
| go-cement | xps | required, target 'C/O ≈ 2' | **Level confirmed** (Confident). **Target demoted to Verify** — typical-GO value, no source ties it to cement performance. Remove from file until ruled. |
| go-cement | ftir | required | **Downgraded to recommended** — duplicative gate with XPS; no source makes FTIR itself a gate. |
| go-cement | particle-size | required | Confirmed (Confident). |
| go-cement | zeta | recommended | Confirmed (Confident). |
| go-cement | bet | recommended | Confirmed (Confident). |
| go-cement | xrd | optional | Confirmed (Confident). |
| go-carbon-capture | bet | required, target 'high m²/g' | **Level confirmed. Target removed** — vague, and capacity is demonstrably not purely SSA-driven [S9]. Note rewritten. |
| go-carbon-capture | xps | required | Confirmed (Confident). |
| go-carbon-capture | tga | required | Confirmed (Confident); note extended. |
| go-carbon-capture | ftir | recommended | Confirmed (Confident). |
| go-carbon-capture | particle-size | optional | Confirmed (Confident). |
| supercap-electrode | conductivity | required | Confirmed (Confident). |
| supercap-electrode | bet | required | Confirmed (Confident). |
| supercap-electrode | raman | required | Confirmed (Confident). |
| battery-conductive-additive | conductivity | required | Confirmed (Confident). |
| battery-conductive-additive | particle-size | required | Confirmed (Confident); note added. |
| battery-conductive-additive | purity | required | Confirmed (Confident); **numeric target added** from supplier benchmark [S4]. |

Net: 14 of 17 cells confirmed as-is or strengthened; 3 corrections (1 level downgrade, 2 target removals). Nothing in the existing 17 cells was outright fabricated — but both numeric-ish targets ('C/O ≈ 2', 'high m²/g') were unsourceable as acceptance specs.

---

## 3. Row-by-row: audited + gap-filled cells

### 3.1 `go-cement` — Construction / Cement admixture / Graphene Oxide (testMatrix.js:89-104)

Row `notes` field: keep existing text (:94). **Delete the TODO comment at `testMatrix.js:96`** — cells are now sourced here.

**SHIP (Confident):**

| test id | level | target | note (exact ship text) | source |
|---|---|---|---|---|
| xps | required | — | Oxidation degree (C/O) drives dispersion & hydration nucleation. | [S6][S7][S2] |
| ftir | recommended | — | Confirm carboxyl / hydroxyl functional groups (cheaper complement to XPS). | [S2][G] |
| particle-size | required | — | Lateral flake size affects nucleation seeding & workability. | [S6][S1] |
| zeta | recommended | — | Dispersion stability in high-pH cement pore solution; PCE dispersant usually needed. | [S6][S10] |
| bet | recommended | — | | [G][S2] |
| xrd | optional | — | | [G] |

**VERIFY (do not ship; human ruling needed):**

| item | proposal | why it is Verify |
|---|---|---|
| xps target | 'C/O ≈ 2' | Typical Hummers-route GO measures C/O ≈ 1.8–2.5 by XPS [S7], so the value is real *as a typical-GO benchmark* — but no source ties any specific C/O to cement performance. Inference: "our GO should look like literature GO". Needs in-house data or a team ruling before a number is shown in a cell. |
| elemental | recommended | Bulk C/O complements surface-only XPS — but backed only by the in-repo glossary [G], no external source gates it for cement duty. |

**Not evaluated (omit these ids):** `moisture` (GO is dosed into cement as an aqueous dispersion in the sourced studies [S6]; solids content is process QC, not a powder-moisture test) · `purity` (no standard gates trace metals at the admixture-material level; ASTM C494 qualifies admixtures via concrete-level performance tests [S3]) · `conductivity` (insulating context — no bearing [G]) · `raman`, `sem`, `tem`, `tga` (deeper characterization only; no gate found).

**Row-level caveat (for the human, not the file):** ASTM C494 [S3] qualifies the *admixture in concrete* (slump, set time, strength) — application-level tests outside this matrix's material-QC scope. Customers will still expect C494 qualification; see §5 scope note.

**Changes vs the existing file:** remove target at :97; ftir :98 `required` → `recommended`; delete TODO comment :96. Notes at :97/:99/:100 replaced by the ship text above.

### 3.2 `go-carbon-capture` — Carbon Capture / CO₂ sorbent / Graphene Oxide (testMatrix.js:107-120)

Row `notes` field: keep existing text (:112).

**SHIP (Confident):**

| test id | level | target | note (exact ship text) | source |
|---|---|---|---|---|
| bet | required | — | Accessible area & porosity set physisorption capacity; surface chemistry co-determines uptake. | [S9] |
| xps | required | — | Surface chemistry (functional groups / heteroatoms) governs CO₂ affinity & selectivity. | [S9] |
| tga | required | — | Thermal stability across adsorption/regeneration cycles; TGA also quantifies uptake. | [S9] |
| ftir | recommended | — | | [S2][S9] |
| particle-size | optional | — | | [G] |

**VERIFY (do not ship):**

| item | proposal | why it is Verify |
|---|---|---|
| bet target | none proposable | Reported GO-based sorbents span a wide SSA range — one sourced GO sorbent achieved 1.354 mmol/g CO₂ at only 107 m²/g [S9] — so no defensible numeric floor exists. The old 'high m²/g' target must stay removed, not replaced. |
| moisture | recommended? | Direction is genuinely ambiguous: water competes for physisorption sites, yet moisture-swing GO capture *exploits* water uptake [S9b]. Needs a ruling on which capture mode we sell into. |
| elemental | recommended | Bulk C/O; glossary-backed only [G]. |
| raman | optional | Material fingerprint; glossary-backed only [G]. |

**Not evaluated (omit):** `xrd`, `sem`, `tem`, `zeta`, `purity`, `conductivity` — no gate found for sorbent duty.

**Changes vs the existing file:** remove target 'high m²/g' at :114; replace notes at :114 and :116 with ship text above.

### 3.3 `supercap-electrode` — Energy Storage / Supercapacitor electrode / rGO-Graphene (testMatrix.js:123-134)

Row `notes` field: keep existing text (:128).

**SHIP (Confident):**

| test id | level | target | note (exact ship text) | source |
|---|---|---|---|---|
| conductivity | required | — | Directly sets ESR / power density. | [S8] |
| bet | required | — | Accessible surface area drives double-layer capacitance. | [S8] |
| raman | required | — | I(D)/I(G) — defect density & reduction quality. | [S1][S8] |
| purity | recommended | — | EDLC-grade carbons are spec'd for ash & trace Fe (leakage current). | [S5] |
| xps | recommended | — | Residual oxygen affects conductivity & adds pseudocapacitance. | [S8] |

**VERIFY (do not ship):**

| item | proposal | why it is Verify |
|---|---|---|
| purity target | 'ash ≤0.3%, Fe ≤18 ppm' | These are Kuraray YP-50F (industry-standard EDLC activated carbon) spec values [S5]. Whether rGO must meet AC benchmarks is a transfer inference. |
| bet target | context only: EDLC AC benchmark ≈1600 m²/g (YP-50F) [S5] | rGO literature values vary widely (e.g. 495 m²/g graphene nanosheets with 272 F/g reported [S8]); accessible-in-electrode area ≠ powder BET. No single defensible number. |
| moisture | recommended | Water narrows the organic-electrolyte voltage window; inference from Li-ion moisture practice [S11], no supercap-specific source found. |
| particle-size | recommended | Electrode film uniformity; inference, no source found. |

**Not evaluated (omit):** `xrd`, `sem`, `tem`, `ftir`, `zeta`, `elemental`, `tga`, `moisture` (pending Verify ruling for moisture/particle-size) — no gate found.

**Changes vs the existing file:** none to the 3 existing cells (all confirmed verbatim); adds `purity` and `xps`.

### 3.4 `battery-conductive-additive` — Energy Storage / Battery conductive additive / Graphene (testMatrix.js:135-146)

Row `notes` field: keep existing text (:140).

**SHIP (Confident):**

| test id | level | target | note (exact ship text) | source |
|---|---|---|---|---|
| conductivity | required | — | | [S4][S12] |
| particle-size | required | — | Oversize grit causes coating defects & shorts; conductive carbons carry grit specs. | [S4][S12] |
| purity | required | Fe ≤5 ppm, Ni ≤1 ppm (Super P Li benchmark) | Trace metals are critical for battery safety. | [S4][S11] |
| moisture | required | ≤0.1% (Super P Li benchmark) | Water reacts with LiPF₆ electrolyte to form HF; powder moisture is spec'd on battery carbons. | [S4][S11] |
| bet | recommended | — | Routinely spec'd on battery conductive carbons (Super P: 62 m²/g). | [S4] |
| raman | recommended | — | Layer count / disorder QC per ISO/TS 21356-1. | [S1] |

Benchmark targets above are explicitly labeled "(Super P Li benchmark)" in the cell so they cannot be quoted as our certified spec. The benchmark values themselves are Confident — read directly from the supplier spec table [S4]: ash (600 °C) 0.05%, moisture 0.1%, volatiles 0.15%, BET 62 m²/g, Fe 5 ppm, Ni 1 ppm, V 1 ppm, S 0.02%, grit >45 µm ≤5 ppm.

**VERIFY (do not ship):**

| item | proposal | why it is Verify |
|---|---|---|
| particle-size target | 'no grit >45 µm' | Super P specs grit >45 µm at ≤5 ppm [S4]; transferring a carbon-black grit spec to graphene powder is an inference. |
| tga | recommended | Super P's volatiles spec (0.15% max) [S4] maps only loosely onto our TGA column; the mapping is mine, not a source's. |
| sem | optional | Morphology/aggregation; glossary-backed only [G]. |

**Not evaluated (omit):** `xrd`, `tem`, `ftir`, `zeta`, `elemental` — no gate found for conductive-additive duty.

**Changes vs the existing file:** none to the 3 existing cells except adding the purity target and note-preserving; adds `moisture`, `bet`, `raman`.

### 3.5 `composites-polymer` — Composites / Polymer reinforcement / Graphene (testMatrix.js:150-156, empty scaffold)

Row `notes` field (SHIP): `Graphene reinforcement in thermoplastic / thermoset matrices; dispersion & interfacial bonding govern gains.`

**SHIP (Confident):**

| test id | level | target | note (exact ship text) | source |
|---|---|---|---|---|
| particle-size | required | — | Lateral size / aspect ratio set load transfer & percolation. | [S18] |
| sem | recommended | — | Dispersion & agglomeration state control composite properties. | [S18] |
| xps | recommended | — | Surface functionalization drives interfacial bonding to the matrix. | [S18] |
| raman | recommended | — | Defect density / quality fingerprint. | [S1] |
| tga | recommended | — | Additive must survive melt-processing temperatures; also quantifies functional groups. | [S18] |
| conductivity | optional | — | Only gates conductive-composite grades. | [G] |

**VERIFY (do not ship):**

| item | proposal | why it is Verify |
|---|---|---|
| moisture | recommended | Hygroscopic filler causes voids/hydrolysis in melt processing (esp. polyamides); mechanism is standard polymer practice but I found no graphene-specific source. |
| ftir | optional | Functional-group ID for functionalized grades only; glossary-backed [G]. |
| bet | optional | General quality metric; glossary-backed only [G]. |

**Not evaluated (omit):** `xrd`, `tem`, `zeta`, `elemental`, `purity` — no gate found for structural-reinforcement duty (zeta only if waterborne latex-mixing route is adopted).

### 3.6 `coatings-anticorrosion` — Coatings / Anti-corrosion coating / Graphene Oxide (testMatrix.js:157-164, empty scaffold)

Row `notes` field (SHIP): `GO/rGO barrier filler in epoxy primers; dispersion & alignment set the barrier gain.`

**SHIP (Confident):**

| test id | level | target | note (exact ship text) | source |
|---|---|---|---|---|
| particle-size | required | — | Aspect ratio / lateral size set diffusion-path tortuosity (the barrier mechanism). | [S13] |
| sem | recommended | — | Agglomeration destroys the barrier effect; verify dispersion in the film. | [S13] |
| xps | recommended | — | Oxidation degree trades dispersibility (GO) against barrier & conductivity (rGO). | [S13] |
| raman | recommended | — | Reduction degree & defect QC. | [S1] |
| conductivity | optional | — | Caution: conductive graphene can galvanically accelerate corrosion at coating defects. | [S14] |

**VERIFY (do not ship):**

| item | proposal | why it is Verify |
|---|---|---|
| zeta | recommended | Dispersion is the documented bottleneck [S13], but zeta as the specific gate applies to waterborne formulations; solvent-borne epoxy dispersions aren't zeta-governed. Needs a ruling on which formulation we target. |
| xrd | optional | Exfoliation/stacking state; glossary-backed only [G]. |
| ftir | optional | Functional groups on GO; glossary-backed only [G]. |

**Not evaluated (omit):** `tem`, `bet`, `elemental`, `purity`, `tga`, `moisture` — no gate found for barrier-filler duty.

### 3.7 `water-treatment` — Water Treatment / Membrane-adsorbent / Graphene Oxide (testMatrix.js:165-172, empty scaffold)

Row `notes` field (SHIP): `GO laminate membranes & adsorbents; interlayer spacing is the sieve, surface charge the selectivity lever.`

**SHIP (Confident):**

| test id | level | target | note (exact ship text) | source |
|---|---|---|---|---|
| xrd | required | d(001) ≈ 0.8 nm (dry) | Interlayer spacing is the sieving channel; swells in water — track the dry baseline. | [S15] |
| zeta | required | — | Surface charge governs salt rejection & fouling behavior. | [S15] |
| purity | required | — | Potable-water contact requires NSF/ANSI 61 leachate compliance. | [S16] |
| xps | recommended | — | Oxidation degree controls swelling & permeance. | [S15] |
| bet | recommended | — | Gates adsorbent duty — uptake scales with accessible area. | [G][S9] |

The xrd target is a well-documented typical value for GO laminates (0.825 nm measured dry, tunable down to 0.634 nm by reduction/modification [S15]) and is labeled "(dry)" because spacing swells to several nm in salt solutions [S15]. It is a characteristic value, not an invented acceptance number.

**VERIFY (do not ship):**

| item | proposal | why it is Verify |
|---|---|---|
| zeta target | '≤ −30 mV (feed-water pH)' | GO typically measures ≈ −39 mV [S15] and ±30 mV is the standard colloidal-stability rule [S10], but applying the stability rule as a membrane acceptance spec is a transfer inference. |
| particle-size | recommended | Larger flakes → longer nanochannels / fewer stacking defects is plausible from membrane-fabrication papers, but I did not pin a source stating it as a requirement. |
| ftir | optional | Functional groups; glossary-backed only [G]. |

**Not evaluated (omit):** `moisture` (product is wet-processed; a powder-moisture spec is meaningless here) · `raman`, `sem`, `tem`, `elemental`, `tga`, `conductivity` — no gate found.

### 3.8 `lubricants` — Lubricants / Additive / Graphene (testMatrix.js:173-180, empty scaffold)

Row `notes` field (SHIP): `Graphene friction-modifier additive for oils & greases.`

**SHIP (Confident):**

| test id | level | target | note (exact ship text) | source |
|---|---|---|---|---|
| particle-size | required | — | Size dictates tribofilm formation; smaller flakes adsorb better and cut friction & wear. | [S17] |
| raman | recommended | — | Layer count matters — few- vs multi-layer changes shear behavior. | [S17][S1] |
| sem | optional | — | | [G] |

**VERIFY (do not ship):**

| item | proposal | why it is Verify |
|---|---|---|
| particle-size target | '≤10 µm mean' | One controlled study found <10 µm mean size improved friction/wear [S17-TL]; single-study benchmark, not an industry spec. |
| purity | recommended | Abrasive inorganic residues (ash/grit) plausibly add wear; inference — no source gates ash for graphene lubricant additives. |
| tga | recommended | Thermal stability at operating temperature; inference from grease-duty scope [S17], not a stated QC requirement. |
| moisture | optional | Water ingress in oil is harmful, but no source ties a powder-moisture spec to this duty. |

**Not evaluated (omit):** `zeta` (non-aqueous medium — the aqueous-dispersion test doesn't apply) · `conductivity` (no electrical function) · `xrd`, `tem`, `bet`, `xps`, `ftir`, `elemental` — no gate found (xps/ftir would enter only if surface-functionalized oil-dispersible grades are introduced).

---

## 4. Proposed new test columns (NOT shipped — matrix-wide decision per skill Step 4)

| proposed id | label | full | group | why |
|---|---|---|---|---|
| dispersion | Dispersion | Dispersion stability (settling / rheology) | Surface & Chemistry | Dispersion quality surfaced as the #1 failure mode in three separate industries — cement (agglomeration at 0.4 wt% hurts hydration [S6]), coatings (dispersion is "the main bottleneck" [S13]), lubricants (aggregation kills lubricity [S17]). Zeta covers only the aqueous electrostatic case. |

Deliberately **not** proposed: application-level performance tests (ASTM B117 salt spray / EIS for coatings, ASTM C494 concrete tests [S3], ASTM D4172 four-ball wear). The matrix's own header scopes it to characterization/QC of *the material* (`testMatrix.js:3-5`); application qualification is a different table. Worth a one-line scope note in the UI someday.

## 5. Proposed new application rows (NOT shipped)

One candidate only — do not pad:

- **`go-merchant` — Graphene Oxide sold as a bulk product.** The proforma ships a built-in `grapheneOxideStream` revenue stream (`shared/proformaDefaults.js:73`, seeded at `:298`), i.e. GO-as-product is a real revenue line with no matrix row. Suggested cells (ALL Verify — needs its own research pass): xps (C/O), ftir, xrd (d-spacing), particle-size, moisture (GO ships as dispersion/wet-cake), purity (residual process metals — Hummers-route GO classically carries Mn residue; our hemp/biochar route differs, so in-house ICP data is the real source here).

The other two proforma streams already map to existing rows: `supercapElectrode` (:34) → `supercap-electrode`; `carbonBlackCathodeAnode` (:55) → `battery-conductive-additive`.

## 6. Contradictions found (fact file vs. repo/docs)

1. **D-008 says "25 tests"; the file has 14** (`testMatrix.js:57-79`: 5 Structure + 4 Surface & Chemistry + 4 Composition & Purity + 1 Performance). DECISIONS.md correction is Integrator bookkeeping.
2. **Spawn prompt says "~200 possible cells"; the real number is 112** (14 × 8).
3. **This file contradicts three shipped cells** — deliberately: `testMatrix.js:97` (target 'C/O ≈ 2' demoted to Verify), `:98` (ftir required → recommended), `:114` (target 'high m²/g' removed). Everything else in the existing file is confirmed or extended, not contradicted.
4. `CLAUDE.md`'s Test Matrix bullet is consistent with the file (14 columns aside — it doesn't state a count... it says "25 tests" in the closing sentence of D-008 quoted in the spawn prompt only; CLAUDE.md itself does not state a test count).

## 7. Coverage & ratio (honest accounting)

- Cells affirmatively decided and shipping (Confident): **41** across 8 rows (incl. 3 Confident targets: battery purity, battery moisture, water-treatment xrd).
- Verify items awaiting human ruling: **17** (4 of which are targets on cells whose *level* ships Confident).
- Explicit not-evaluated with a stated reason: **10**; remaining omitted cells are "no gate found in sources searched" (blanket NA, listed per row).
- All 112 possible cells are therefore dispositioned; 41 ship, 17 need a ruling, 54 are omissions.
- Existing-cell audit: 17 audited, 14 confirmed, 3 corrected, 0 fabrications found — but 2 of the 3 numeric-ish targets in the file were unsourceable as acceptance specs, which validates D-008's suspicion.

## 8. Source Register

- **[G]** In-repo reasoning scaffold: `.claude/skills/test-matrix-research/references/test-glossary.md` (per-test relevance heuristics). Used alone only for `recommended`/`optional` levels, never for `required` levels or targets.
- **[S1]** ISO/TS 21356-1:2021 — *Nanotechnologies — Structural characterization of graphene — Part 1: Graphene from powders and dispersions*. Measurands incl. layer count/thickness, lateral flake size, disorder (Raman), SSA. https://www.iso.org/standard/70757.html
- **[S2]** ISO/TR 19733:2019 — *Nanotechnologies — Matrix of properties and measurement techniques for graphene and related 2D materials*. https://www.iso.org/standard/66188.html
- **[S3]** ASTM C494/C494M — *Standard Specification for Chemical Admixtures for Concrete* (qualification via concrete-level performance: slump, set time, strength). https://www.astm.org/Standards/C494.htm
- **[S4]** Imerys/TIMCAL **Super P Li** conductive carbon black spec table (fetched 2026-08-21 from reseller product page republishing the TDS): ash (600 °C) 0.05%, moisture 0.1%, volatiles 0.15%, BET 62 m²/g, Fe 5 ppm, Ni 1 ppm, V 1 ppm, S 0.02%, grit >45 µm ≤5 ppm, grit >20 µm 25 ppm. https://celllab.co.uk/products/cell-lab-super-p-conductive-carbon-black-high-purity-battery-grade-premium-conductive-additive-for-lithium-ion-batteries · corroborated by https://www.imerys.com/product-ranges/super-p-li and MSE Supplies / Beyond Battery listings.
- **[S5]** Kuraray **KURARAY COAL YP series** (YP-50F) EDLC activated carbon: SSA ≈1600 m²/g, ash 0.3%, Fe 18 ppm. Brochure: https://www.calgoncarbon.com/app/uploads/YP-brochure-draft_final_08_2019.pdf · reseller spec: https://cam-energy.com/shop/battery-materials/supercapacitor-materials/kuraray-activated-carbon-powder-yp-50f/
- **[S6]** GO-cement literature: *A review of graphene oxide/cement composites* (J. Build. Eng. 2022, sciencedirect.com/science/article/abs/pii/S2352710222005150); *Effect of graphene oxide dispersion on hydration and carbonation of low-clinker cement* (Constr. Build. Mater. 2025, S0950061825051025 — PCE:GO 3–5 stabilizes dispersion; 0.4 wt% agglomeration hinders hydration); *Cement-Based GO Composites: Review* (academia.edu/102774268).
- **[S7]** GO oxidation degree by synthesis: C/O ≈ 1.8–2.5 by XPS across Hummers variants — S0254058415000061 (Mater. Chem. Phys. 2015); S0272884219309903 (Ceram. Int. 2019).
- **[S8]** *State-of-the-art review on reduced graphene oxide for supercapacitor electrode applications* (S259012302503484X, 2025) — conductivity↔ESR, SSA↔capacitance, conductivity/SSA trade-off, tunable surface chemistry; graphene nanosheet example 495 m²/g / 272 F/g.
- **[S9]** CO₂ capture: *A comprehensive review on graphene-based materials for CO₂ capture* (S2212982025001519, 2025); *functionalities of GO/polymer composites → selective CO₂ capture* (PMC9512785); *rGO heteroatoms vs textural characteristics* (MDPI Appl. Sci. 11:9631); amino-functionalized graphene-silica cycling retention 90–96% over 50 cycles (Gels 11:702, 2025); GO sorbent 1.354 mmol/g at 107 m²/g (same review family).
- **[S9b]** *Moisture-swing CO₂ capture from air enabled by graphene oxide* (S2666386426002274).
- **[S10]** Zeta ±30 mV colloidal-stability criterion: ScienceDirect Topics "Zeta Potential" (sciencedirect.com/topics/engineering/zeta-potential); Wyatt Technology, *Colloidal Stability and Zeta Potential* (wyatt.com/blogs/colloidal-stability-and-zeta-potential.html).
- **[S11]** Li-ion moisture sensitivity: LiPF₆ + H₂O → HF, corrodes collectors, degrades SEI — *Drying and moisture resorption behaviour of electrode materials* (S0378775317310327); *Moisture behavior of Li-ion components along production* (S2352152X22021636); LabX overview (labx.com/resources/...5479).
- **[S12]** Cheap Tubes, *GNP Buying Guide* — battery use: 3–5 nm GNPs at 1–3 wt%; lateral size/thickness/surface chemistry as ordering variables. https://www.cheaptubes.com/graphene-nanoplatelets-buying-guide-lateral-size-thickness-surface-chemistry/
- **[S13]** Coatings: *Anti-corrosion of epoxy coatings enhanced via GO with different aspect ratios* (S0300944018304557 — higher aspect ratio → more tortuous path → better protection); *Factors affecting barrier performance of few-layer-graphene composite coatings* (S1359836818317414); *Particle size-dependent anti-corrosion of green-graphene composite* (S0300944024002649); American Coatings Assoc., *Graphene in Coatings* (dispersion bottleneck; never add as dry powder) (paint.org); *Progress in GO-based composite coatings for anticorrosion* (MDPI Coatings 13:1120).
- **[S14]** Galvanic-corrosion caution: Schriver et al., *Graphene as a Long-Term Metal Oxidation Barrier: Worse Than Nothing*, ACS Nano 2013 (PubMed 23755733); *Review of corrosion behaviour of CVD graphene coatings on metals* (IOPscience 10.1149/1945-7111/ac53cb — graphene cathode / metal anode couple).
- **[S15]** GO membranes: d-spacing 0.825 nm dry → 0.634 nm modified (PMC6418752); d-spacing by XRD/Bragg for GO NF membranes (S0169433218321044); *GO-cation interaction: interlayer spacing and zeta changes* (S037673881733051X — zeta drives rejection; GO ≈ −39 mV); oxidation degree & spacing vs water permeation, 0.6–1.0 nm channel regime (ResearchGate 352755134); *Controlled reduction of GO membranes* (Springer 10.1007/s10853-020-05073-9).
- **[S16]** NSF/ANSI 61 — *Drinking Water System Components — Health Effects* (leachate limits for materials in potable contact). https://www.nsf.org/knowledge-library/nsf-ansi-standard-61-drinking-water-system-components-health-effects
- **[S17]** Lubricants: **[S17-TL]** *Effects of Thickness and Particle Size on Tribological Properties of Graphene as Lubricant Additive* (Tribology Letters, 10.1007/s11249-020-01351-4 — <10 µm mean size improved wear/friction; more layers + smaller size → −37% friction, −47% wear); *rGO additives: mechanism of effective lubrication* (Sci. Rep. srep18372 — −70% friction, −50% wear at optimized concentration; aggregation at high loading kills lubricity); *Graphene-based additives in greases review* (S2590123025006292 — 1 wt% optimum); GO at SiC interface, 0.1 wt% optimum, −48.7% CoF (S0927775724007581); *Graphene-Based Nanomaterials as Lubricant Additives: Review* (MDPI Lubricants 10:273).
- **[S18]** Composites: *Distribution states of graphene in polymer nanocomposites: a review* (S1359836821007241 — dispersion quality controls electro-thermo-mechanical properties; aspect ratio central); *Graphene Reinforced Polymer Matrix Nanocomposites* (IntechOpen ch. 84568 — processing routes); carboxyl-functionalized graphene/PU TGA stability gains (S221478532033683X); dopamine-rGO nylon-6 interfacial bonding (PMC9330574).

