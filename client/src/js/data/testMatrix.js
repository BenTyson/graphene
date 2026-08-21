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
      // TODO: confirm targets with the team — seeded as a starting point.
      xps: { level: 'required', target: 'C/O ≈ 2', note: 'Oxidation degree drives dispersion & hydration.' },
      ftir: { level: 'required', note: 'Confirm carboxyl / hydroxyl functional groups.' },
      'particle-size': { level: 'required', note: 'Lateral flake size affects nucleation.' },
      zeta: { level: 'recommended', note: 'Dispersion stability in high-pH cement pore solution.' },
      bet: { level: 'recommended' },
      xrd: { level: 'optional' },
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
      bet: { level: 'required', target: 'high m²/g', note: 'Adsorption capacity scales with surface area.' },
      xps: { level: 'required', note: 'Surface chemistry governs CO₂ affinity.' },
      tga: { level: 'required', note: 'Thermal stability across adsorption/regeneration cycles.' },
      ftir: { level: 'recommended' },
      'particle-size': { level: 'optional' },
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
      bet: { level: 'required', note: 'Accessible surface area drives capacitance.' },
      raman: { level: 'required', note: 'I(D)/I(G) — defect density & reduction quality.' },
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
      'particle-size': { level: 'required' },
      purity: { level: 'required', note: 'Trace metals are critical for battery safety.' },
    },
  },

  // ---- Scaffolds to fill in together (empty req) ---------------------
  {
    id: 'composites-polymer',
    industry: 'Composites',
    application: 'Polymer reinforcement',
    material: 'Graphene',
    notes: '',
    req: {},
  },
  {
    id: 'coatings-anticorrosion',
    industry: 'Coatings',
    application: 'Anti-corrosion coating',
    material: 'Graphene Oxide',
    notes: '',
    req: {},
  },
  {
    id: 'water-treatment',
    industry: 'Water Treatment',
    application: 'Membrane / adsorbent',
    material: 'Graphene Oxide',
    notes: '',
    req: {},
  },
  {
    id: 'lubricants',
    industry: 'Lubricants',
    application: 'Additive',
    material: 'Graphene',
    notes: '',
    req: {},
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
