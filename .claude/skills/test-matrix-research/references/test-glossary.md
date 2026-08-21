# Test Glossary — what each column measures & when an application needs it

Reasoning scaffold for assigning requirement levels. For each test: the property it measures, and
the kinds of application concerns that make it **required** vs merely nice-to-have. Test IDs match
`TEST_MATRIX_TESTS` in `client/src/js/data/testMatrix.js` — always re-read that file for the
authoritative, current column list; this glossary explains the reasoning, not the schema.

> The matrix is material-agnostic in structure but our material is carbon (Graphene / Graphene
> Oxide / rGO). Oxidation state is the biggest swing factor: GO is oxygen-rich and hydrophilic;
> rGO/graphene are conductive and hydrophobic. A test's importance often flips with that state.

## Structure & morphology

- **xrd — X-Ray Diffraction.** Crystallinity, interlayer d-spacing, degree of oxidation/reduction
  (GO's ~0.8 nm spacing vs graphite's ~0.34 nm). *Required* when layer spacing or crystalline phase
  drives function (barrier coatings, intercalation electrodes). *Optional* when the application
  doesn't care about stacking order (many dispersion/additive uses).
- **raman — Raman Spectroscopy.** D/G/2D bands → defect density (I_D/I_G), layer count, reduction
  quality. *Required* for anything where electronic quality or reduction degree matters
  (supercapacitors, conductive films). Nearly always at least *recommended* for graphene — it's the
  fastest fingerprint of "what did we actually make."
- **tem — Transmission Electron Microscopy.** Direct imaging of flake thickness, edges, few-layer
  vs multilayer, lattice defects. *Recommended/optional* — high-value characterization but slow and
  rarely a shipping gate unless a customer demands morphology proof.
- **sem — Scanning Electron Microscopy.** Surface morphology, aggregation, flake lateral size at
  µm scale, coating uniformity. *Recommended* where morphology/dispersion is visible and matters
  (composites, coatings).
- **particle-size — Particle Size Distribution (PSD).** Lateral flake size distribution. *Required*
  where size gates performance or processability: cement nucleation, ink/coating rheology, filler
  packing, battery electrode uniformity.

## Surface & chemistry

- **bet — BET Surface Area.** Accessible specific surface area (m²/g). *Required* for adsorption and
  double-layer applications (carbon capture sorbents, supercapacitor electrodes, catalysis
  supports) where capacity scales with area. *Recommended* elsewhere as a general quality metric.
- **xps — X-Ray Photoelectron Spectroscopy.** Surface elemental composition & bonding states; the
  gold standard for **oxidation degree / C:O ratio** and functional-group chemistry. *Required*
  whenever surface chemistry drives behavior: GO dispersion in cement, CO₂ affinity in capture,
  interface bonding in composites, reduction verification.
- **ftir — Fourier-Transform Infrared.** Identifies functional groups (–OH, C=O, –COOH, epoxide).
  Cheaper, faster complement to XPS. *Required/recommended* for GO where functionalization is the
  point; less relevant for fully-reduced graphene.
- **zeta — Zeta Potential.** Surface charge → colloidal/dispersion stability in a given medium.
  *Required* when the material must stay dispersed to work: aqueous inks, cement pore solution
  (high pH), water-treatment membranes, any wet formulation.

## Composition & purity

- **elemental — Elemental Analysis (C/H/O).** Bulk C/H/O ratios; complements XPS (bulk vs surface).
  *Recommended* where oxidation degree or carbon content is specified.
- **purity — Purity / Ash / Trace Metals (ICP).** Residual metals, ash, synthesis contaminants.
  *Required* and often safety-critical for **battery/energy** (trace Fe/Ni cause shorts) and
  **biomedical/water** (toxicity limits). A hard qualification gate in regulated markets.
- **tga — Thermogravimetric Analysis.** Mass loss vs temperature → thermal stability, functional-
  group content, moisture/volatiles. *Required* where the material sees heat or cyclic thermal load
  (capture sorbent regeneration, high-temp composites, sintering).
- **moisture — Moisture Content.** Adsorbed water. *Required/recommended* where water interferes
  with processing or performance (battery slurries — water is a poison; powder handling; coatings).

## Performance

- **conductivity — Electrical Conductivity.** Bulk/film electrical conductivity. *Required* for all
  electrical/electronic functions (supercapacitors, battery conductive additive, EMI shielding,
  conductive inks). Irrelevant for insulating-context uses (some cement, barrier coatings) — omit
  there.

## Quick heuristics for level assignment

- **Safety- or regulation-gated property → `required`** (e.g. ICP trace metals for batteries,
  toxicity-relevant purity for water/biomedical). These are non-negotiable.
- **Property that the application's core mechanism depends on → `required`** (surface area for
  adsorption; conductivity for electrodes; dispersion/zeta for wet formulations).
- **Commonly-reported quality metric, not a hard gate → `recommended`** (BET on a structural filler,
  Raman as a fingerprint).
- **Deeper characterization with no direct performance link for this function → `optional`** (TEM,
  XRD on a dispersion additive).
- **No bearing on this function → omit the column.** Don't pad.
