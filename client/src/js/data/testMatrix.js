/**
 * Test Matrix — data model
 * -------------------------------------------------------------------------
 * Defines WHICH characterization / QC tests are required for each
 * application (industry + use-case) of our material.
 *
 * This is the single source of truth for the "Test Matrix" page under the
 * Tests section. It is intentionally code-defined so it can be curated in
 * git; it is trivially convertible to a DB-backed model later if in-app
 * editing is ever needed.
 *
 * HOW TO EXTEND
 *   • Add a test column      -> push to TEST_MATRIX_TESTS
 *   • Add an application row  -> push to TEST_MATRIX_APPLICATIONS
 *   • Fill in a cell          -> add `testId: { level, target?, note? }`
 *                                to that application's `req` object.
 *                                Omit a testId entirely = "not evaluated / NA".
 *
 * LEVELS (see TEST_MATRIX_LEVELS): required | recommended | optional
 * -------------------------------------------------------------------------
 */

// --- Requirement levels ---------------------------------------------------
// Order matters: used for the legend and for level-based sorting/emphasis.
export const TEST_MATRIX_LEVELS = [
  {
    id: 'required',
    label: 'Required',
    short: 'Req',
    desc: 'Must be tested & pass spec before the material can be used here.',
    // Tailwind classes (literal for JIT) — cell fill + text.
    cellClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  {
    id: 'recommended',
    label: 'Recommended',
    short: 'Rec',
    desc: 'Strongly advised — expected by most customers / validation.',
    cellClass: 'bg-amber-100 text-amber-900 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  {
    id: 'optional',
    label: 'Optional',
    short: 'Opt',
    desc: 'Nice to have — situational or for deeper characterization.',
    cellClass: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400',
  },
];

// --- Test columns ---------------------------------------------------------
// `group` clusters columns under a header band. `id` should match the
// existing test-result tab slug where one exists (bet, conductivity, ...),
// so the matrix can later deep-link into those pages.
export const TEST_MATRIX_TESTS = [
  // Structure & morphology
  { id: 'xrd', label: 'XRD', full: 'X-Ray Diffraction', group: 'Structure' },
  { id: 'raman', label: 'RAMAN', full: 'Raman Spectroscopy', group: 'Structure' },
  { id: 'tem', label: 'TEM', full: 'Transmission Electron Microscopy', group: 'Structure' },
  { id: 'sem', label: 'SEM', full: 'Scanning Electron Microscopy', group: 'Structure' },
  { id: 'particle-size', label: 'PSD', full: 'Particle Size Distribution', group: 'Structure' },

  // Surface & chemistry
  { id: 'bet', label: 'BET', full: 'BET Surface Area', group: 'Surface & Chemistry' },
  { id: 'xps', label: 'XPS', full: 'X-Ray Photoelectron Spectroscopy', group: 'Surface & Chemistry' },
  { id: 'ftir', label: 'FTIR', full: 'Fourier-Transform Infrared Spectroscopy', group: 'Surface & Chemistry' },
  { id: 'zeta', label: 'Zeta', full: 'Zeta Potential', group: 'Surface & Chemistry' },

  // Composition & purity
  { id: 'elemental', label: 'C/H/O', full: 'Elemental Analysis (C/H/O ratio)', group: 'Composition & Purity' },
  { id: 'purity', label: 'Purity', full: 'Purity / Ash / Trace Metals (ICP)', group: 'Composition & Purity' },
  { id: 'tga', label: 'TGA', full: 'Thermogravimetric Analysis', group: 'Composition & Purity' },
  { id: 'moisture', label: 'Moisture', full: 'Moisture Content', group: 'Composition & Purity' },

  // Performance
  { id: 'conductivity', label: 'Conductivity', full: 'Electrical Conductivity', group: 'Performance' },
];

// --- Application rows ------------------------------------------------------
// Each row = one material used in one application.
//   material : product form (e.g. "Graphene Oxide", "rGO", "Graphene")
//   req      : map of testId -> { level, target?, note? }
//              `target` shows as the cell value; `note` shows in the tooltip.
// Rows with an empty `req` are scaffolds we will fill in together.
export const TEST_MATRIX_APPLICATIONS = [
  // ---- Construction --------------------------------------------------
  {
    id: 'go-cement',
    industry: 'Construction',
    application: 'Cement admixture',
    material: 'Graphene Oxide',
    notes: 'GO dispersed into cement/concrete to boost compressive & flexural strength.',
    req: {
      xps: { level: 'required', note: 'Oxidation degree (C/O) drives dispersion & hydration nucleation. [D-014 reference only, not spec] Typical Hummers-route GO measures C/O 1.8–2.5 by XPS — an orientation range for our own material, not a cement-performance acceptance spec.' },
      ftir: { level: 'recommended', note: 'Confirm carboxyl / hydroxyl functional groups (cheaper complement to XPS).' },
      'particle-size': { level: 'required', note: 'Lateral flake size affects nucleation seeding & workability.' },
      zeta: { level: 'recommended', note: 'Dispersion stability in high-pH cement pore solution; PCE dispersant usually needed.' },
      bet: { level: 'recommended' },
      xrd: { level: 'optional' },
      elemental: { level: 'optional', note: "[D-014 judgement] Bulk C/O by elemental analysis duplicates the surface-sensitive XPS measurement already required on this row; downgraded from the researcher's proposed 'recommended' — no failure mode beyond what XPS already covers." },
    },
  },

  // ---- Carbon Capture ------------------------------------------------
  {
    id: 'go-carbon-capture',
    industry: 'Carbon Capture',
    application: 'CO₂ sorbent',
    material: 'Graphene Oxide',
    notes: 'High surface-area GO / rGO framework for CO₂ adsorption.',
    req: {
      bet: { level: 'required', note: 'Accessible area & porosity set physisorption capacity; surface chemistry co-determines uptake. [D-014 reference only, not spec] No numeric floor is defensible — one sourced GO sorbent reached 1.354 mmol/g CO₂ uptake at only 107 m²/g surface area, so capacity is not purely SSA-driven.' },
      xps: { level: 'required', note: 'Surface chemistry (functional groups / heteroatoms) governs CO₂ affinity & selectivity.' },
      tga: { level: 'required', note: 'Thermal stability across adsorption/regeneration cycles; TGA also quantifies uptake.' },
      ftir: { level: 'recommended' },
      'particle-size': { level: 'optional' },
      moisture: { level: 'recommended', note: '[D-014 judgement] Water competes for physisorption sites in dry-mode CO₂ capture but is the working fluid in moisture-swing capture — measure regardless of mode; the acceptance direction depends on which capture mode is sold, not resolved here.' },
      elemental: { level: 'optional', note: "[D-014 judgement] Bulk C/O by elemental analysis duplicates the surface-sensitive XPS measurement already required on this row; downgraded from the researcher's proposed 'recommended' — no failure mode beyond what XPS already covers." },
    },
  },

  // ---- Energy Storage ------------------------------------------------
  {
    id: 'supercap-electrode',
    industry: 'Energy Storage',
    application: 'Supercapacitor electrode',
    material: 'rGO / Graphene',
    notes: 'Electrode active material for supercapacitors.',
    req: {
      conductivity: { level: 'required', note: 'Directly sets ESR / power density.' },
      bet: { level: 'required', note: 'Accessible surface area drives double-layer capacitance. [D-014 reference only, not spec] Powder BET overstates accessible-in-electrode area for rGO, so no numeric floor is set here — for context only, EDLC activated carbon (Kuraray YP-50F, not our material) benchmarks ≈1600 m²/g.' },
      raman: { level: 'required', note: 'I(D)/I(G) — defect density & reduction quality.' },
      purity: { level: 'recommended', note: "EDLC-grade carbons are spec'd for ash & trace Fe (leakage current), which drives self-discharge. [D-014 reference only, not spec] Kuraray YP-50F — an activated carbon, not our material — specs ash ≤0.3% / Fe ≤18 ppm as a reference point, not our acceptance spec." },
      xps: { level: 'recommended', note: 'Residual oxygen affects conductivity & adds pseudocapacitance.' },
      moisture: { level: 'recommended', note: '[D-014 judgement] Water narrows the organic-electrolyte voltage window; transferred from Li-ion moisture practice since both are organic-electrolyte systems — no supercapacitor-specific source found.' },
      'particle-size': { level: 'optional', note: "[D-014 judgement] Electrode-film uniformity is a second-order concern beside moisture and purity on this row; downgraded from the researcher's proposed 'recommended' — no source found." },
    },
  },
  {
    id: 'battery-conductive-additive',
    industry: 'Energy Storage',
    application: 'Battery conductive additive',
    material: 'Graphene',
    notes: 'Conductive additive in cathode / anode formulations.',
    req: {
      conductivity: { level: 'required' },
      'particle-size': { level: 'required', note: "Oversize grit causes coating defects & shorts; conductive carbons carry grit specs. [D-014 reference only, not spec] Super P — a carbon black, not our material — specs grit >45 µm at ≤5 ppm as a reference point, not our acceptance spec." },
      purity: { level: 'required', note: "Trace metals are critical for battery safety. [D-014 reference only, not spec] Super P Li — a carbon black, not our material — specs Fe ≤5 ppm / Ni ≤1 ppm as a reference point, not our acceptance spec." },
      moisture: { level: 'required', note: "Water reacts with LiPF₆ electrolyte to form HF; powder moisture is spec'd on battery carbons. [D-014 reference only, not spec] Super P Li — a carbon black, not our material — specs moisture ≤0.1% as a reference point, not our acceptance spec." },
      bet: { level: 'recommended', note: "Routinely spec'd on battery conductive carbons (Super P: 62 m²/g)." },
      raman: { level: 'recommended', note: 'Layer count / disorder QC per ISO/TS 21356-1.' },
      tga: { level: 'optional', note: "[D-014 judgement] Volatiles-to-TGA mapping from the carbon-black benchmark is loose, as the research chip flagged itself; downgraded from the researcher's proposed 'recommended'." },
      sem: { level: 'optional', note: '[D-014 judgement] Aggregation state drives the conductive percolation network, but SEM is a qualitative check, not a quantitative gate — glossary-backed only, no external source.' },
    },
  },

  // ---- Composites -----------------------------------------------------
  {
    id: 'composites-polymer',
    industry: 'Composites',
    application: 'Polymer reinforcement',
    material: 'Graphene',
    notes: 'Graphene reinforcement in thermoplastic / thermoset matrices; dispersion & interfacial bonding govern gains.',
    req: {
      'particle-size': { level: 'required', note: 'Lateral size / aspect ratio set load transfer & percolation.' },
      sem: { level: 'recommended', note: 'Dispersion & agglomeration state control composite properties.' },
      xps: { level: 'recommended', note: 'Surface functionalization drives interfacial bonding to the matrix.' },
      raman: { level: 'recommended', note: 'Defect density / quality fingerprint.' },
      tga: { level: 'recommended', note: 'Additive must survive melt-processing temperatures; also quantifies functional groups.' },
      conductivity: { level: 'optional', note: 'Only gates conductive-composite grades.' },
      moisture: { level: 'recommended', note: '[D-014 judgement] Hygroscopic filler causes voids & hydrolytic degradation during polyamide/PET melt processing — standard polymer-composite failure mode, though no graphene-specific source was found.' },
      ftir: { level: 'optional', note: '[D-014 judgement] Functional-group ID, relevant only for surface-functionalized grades — glossary-backed only, no external source.' },
    },
  },
  {
    id: 'coatings-anticorrosion',
    industry: 'Coatings',
    application: 'Anti-corrosion coating',
    material: 'Graphene Oxide',
    notes: 'GO/rGO barrier filler in epoxy primers; dispersion & alignment set the barrier gain.',
    req: {
      'particle-size': { level: 'required', note: 'Aspect ratio / lateral size set diffusion-path tortuosity (the barrier mechanism).' },
      sem: { level: 'recommended', note: 'Agglomeration destroys the barrier effect; verify dispersion in the film.' },
      xps: { level: 'recommended', note: 'Oxidation degree trades dispersibility (GO) against barrier & conductivity (rGO).' },
      raman: { level: 'recommended', note: 'Reduction degree & defect QC.' },
      conductivity: { level: 'optional', note: 'Caution: conductive graphene can galvanically accelerate corrosion at coating defects.' },
      zeta: { level: 'recommended', note: '[D-014 judgement] Dispersion is the documented failure mode for GO/rGO barrier coatings. Scoped to waterborne formulations only — solvent-borne epoxy dispersions are not zeta-governed.' },
      xrd: { level: 'optional', note: '[D-014 judgement] Stacking/exfoliation state predicts barrier tortuosity — glossary-backed only, no external source.' },
      ftir: { level: 'optional', note: '[D-014 judgement] Functional-group ID on the GO/rGO filler — glossary-backed only, no external source.' },
    },
  },
  {
    id: 'water-treatment',
    industry: 'Water Treatment',
    application: 'Membrane / adsorbent',
    material: 'Graphene Oxide',
    notes: 'GO laminate membranes & adsorbents; interlayer spacing is the sieve, surface charge the selectivity lever.',
    req: {
      xrd: { level: 'required', target: 'd(001) ≈ 0.8 nm (dry)', note: 'Interlayer spacing is the sieving channel; swells in water — track the dry baseline.' },
      zeta: { level: 'required', note: 'Surface charge governs salt rejection & fouling behavior. [D-014 reference only, not spec] ±30 mV is a colloidal-stability heuristic, not a membrane acceptance spec — GO typically measures around −39 mV, but no target is set here.' },
      purity: { level: 'required', note: 'Potable-water contact requires NSF/ANSI 61 leachate compliance.' },
      xps: { level: 'recommended', note: 'Oxidation degree controls swelling & permeance.' },
      bet: { level: 'recommended', note: 'Gates adsorbent duty — uptake scales with accessible area.' },
      'particle-size': { level: 'optional', note: "[D-014 judgement] Larger flakes plausibly give longer nanochannels / fewer stacking defects, but this is unpinned to any source; downgraded from the researcher's proposed 'recommended'." },
      ftir: { level: 'optional', note: '[D-014 judgement] Functional-group ID on the GO filler — glossary-backed only, no external source.' },
    },
  },
  {
    id: 'lubricants',
    industry: 'Lubricants',
    application: 'Additive',
    material: 'Graphene',
    notes: 'Graphene friction-modifier additive for oils & greases.',
    req: {
      'particle-size': { level: 'required', note: "Size dictates tribofilm formation; smaller flakes adsorb better and cut friction & wear. [D-014 reference only, not spec] One controlled study found <10 µm mean size improved friction/wear — a single-study benchmark, not an industry spec; no target is set here." },
      raman: { level: 'recommended', note: 'Layer count matters — few- vs multi-layer changes shear behavior.' },
      sem: { level: 'optional' },
      purity: { level: 'recommended', note: "[D-014 judgement] Abrasive inorganic ash/grit works against the product's own friction-reducing function — the mechanism is self-evident, though no graphene-specific source was found." },
      tga: { level: 'recommended', note: '[D-014 judgement] Thermal stability at operating temperature is a real duty requirement for a grease/oil additive — no graphene-specific source was found.' },
      moisture: { level: 'optional', note: '[D-014 judgement] Water ingress in the base oil is a plausible concern, but no source ties a powder-moisture spec to lubricant-additive duty — glossary-backed only.' },
    },
  },
];

// --- Convenience lookups (built once) -------------------------------------
export const TEST_MATRIX_LEVEL_BY_ID = Object.fromEntries(
  TEST_MATRIX_LEVELS.map((l) => [l.id, l])
);
export const TEST_MATRIX_TEST_BY_ID = Object.fromEntries(
  TEST_MATRIX_TESTS.map((t) => [t.id, t])
);

// Ordered list of the column groups, preserving first-seen order.
export const TEST_MATRIX_TEST_GROUPS = TEST_MATRIX_TESTS.reduce((groups, test) => {
  const existing = groups.find((g) => g.group === test.group);
  if (existing) existing.tests.push(test);
  else groups.push({ group: test.group, tests: [test] });
  return groups;
}, []);

// Expose on window so the tab template (evaluated in Alpine scope) and the
// Alpine helper methods can read the data without threading imports through.
if (typeof window !== 'undefined') {
  window.TEST_MATRIX_LEVELS = TEST_MATRIX_LEVELS;
  window.TEST_MATRIX_TESTS = TEST_MATRIX_TESTS;
  window.TEST_MATRIX_TEST_GROUPS = TEST_MATRIX_TEST_GROUPS;
  window.TEST_MATRIX_APPLICATIONS = TEST_MATRIX_APPLICATIONS;
  window.TEST_MATRIX_LEVEL_BY_ID = TEST_MATRIX_LEVEL_BY_ID;
  window.TEST_MATRIX_TEST_BY_ID = TEST_MATRIX_TEST_BY_ID;
}
