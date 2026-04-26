// Default assumptions matching the 2025 HGraphene Projections spreadsheet.
// All values are direct inputs (not derived). The engine computes everything else.

export const MONTHS_TOTAL = 48; // Year 0 (12) + Year 1 (12) + Year 2 (12) + Year 3 (12)

// Global phase boundaries (month indices where phases change)
export const PHASE_BOUNDARIES = [0, 24, 36]; // Phase 1: 0-23, Phase 2: 24-35, Phase 3: 36-47

// ── Built-in revenue stream factories ─────────────────────────────
// Each stream is self-contained: pricing, market source, ramp, qDist.
// `builtin: true` streams cannot be deleted via the UI but are otherwise
// editable. New custom streams are appended with builtin: false.

function _supercapStream() {
  return {
    id: 'supercapElectrode',
    name: 'Supercapacitor Electrode',
    builtin: true,
    order: 0,
    startMonth: 12,
    pricing: { year0: 200, year1: 200, year2: 200, year3: 200 },
    market: { mode: 'linked', linkedSource: 'supercap' },
    year1: { marketSharePct: 0.03, qDist: [0.10, 0.20, 0.30, 0.40] },
    year2: { marketSharePct: 0.06, qDist: [0.23, 0.24, 0.26, 0.27] },
    year3: { marketSharePct: 0.09, qDist: [0.20, 0.24, 0.26, 0.30] }
  };
}

function _carbonBlackStream() {
  return {
    id: 'carbonBlackCathodeAnode',
    name: 'Carbon Black (Cathode + Anode)',
    builtin: true,
    order: 1,
    startMonth: 36,
    pricing: { year0: 50, year1: 50, year2: 50, year3: 50 },
    market: { mode: 'linked', linkedSource: 'conductive' },
    year1: { marketSharePct: 0.0025, qDist: [0.00, 0.20, 0.30, 0.50] },
    year2: { marketSharePct: 0.005, qDist: [0.20, 0.23, 0.25, 0.27] },
    year3: { marketSharePct: 0.009, qDist: [0.20, 0.23, 0.25, 0.27] }
  };
}

// Catalog of global market sources surfaced on the Technical tab. The
// engine extends this in deriveTechnical(); the UI uses it to render
// the linked-source dropdown when adding a stream.
export const MARKET_SOURCE_CATALOG = [
  { id: 'supercap',      label: 'Supercapacitor activated-carbon demand' },
  { id: 'conductive',    label: 'EV conductive additives (cathode + anode)' },
  { id: 'grapheneOxide', label: 'Graphene Oxide demand' }
];

export function getDefaultAssumptions() {
  return {
    version: 2,

    production: {
      // Step 1: Hemp to Biochar
      initialHempKg: 1,
      biocharYieldG: 650 / 3, // 216.6667g per 1kg hemp

      // Step 2: Total mass calculation
      initialBiocharUseG: 50,
      initialKOHG: 75,

      // Step 3: Density/volume
      densityMix: 0.4,
      volumeConversionCuFt: 3.53147e-05,

      // Step 4: Graphene yield
      grapheneYieldPercent: 0.44,

      // Buffer toggle (master efficiency multiplier on production)
      bufferToggle: 1.0,

      // Kiln sizes (cubic feet per hour continuous load)
      smallKilnCuFtPerHour: 4,   // Pilot
      largeKilnCuFtPerHour: 118, // Broderick

      // Operating parameters by phase [Phase 1, Phase 2, Phase 3]
      phases: [
        { hoursPerDay: 15, daysPerMonth: 20 },
        { hoursPerDay: 23, daysPerMonth: 24 },
        { hoursPerDay: 23, daysPerMonth: 28 }
      ],

      // Cost efficiency multiplier by year (costs decrease as operations mature)
      efficiencyByYear: [1.0, 1.0, 0.85, 0.75] // Year 0, Year 1, Year 2, Year 3
    },

    machines: [
      {
        name: 'Pilot 1', type: 'pilot',
        validationStartMonth: 8,
        productionStartMonth: 10,
        cost: 283000,
        payments: [
          { month: 1, pct: 0.20 },
          { month: 2, pct: 0.50 },
          { month: 5, pct: 0.25 },
          { month: 8, pct: 0.05 }
        ],
        productionPhaseOverride: null,
        costPhaseOverride: null
      },
      {
        name: 'Pilot 2', type: 'pilot',
        validationStartMonth: 15,
        productionStartMonth: 17,
        cost: 283000,
        payments: [
          { month: 8, pct: 0.20 },
          { month: 9, pct: 0.50 },
          { month: 12, pct: 0.25 },
          { month: 15, pct: 0.05 }
        ],
        productionPhaseOverride: null,
        costPhaseOverride: null
      },
      {
        name: 'Pilot 3', type: 'pilot',
        validationStartMonth: 15,
        productionStartMonth: 17,
        cost: 283000,
        payments: [
          { month: 8, pct: 0.20 },
          { month: 9, pct: 0.50 },
          { month: 12, pct: 0.25 },
          { month: 15, pct: 0.05 }
        ],
        productionPhaseOverride: null,
        costPhaseOverride: null
      },
      {
        name: 'Pilot 4', type: 'pilot',
        validationStartMonth: 18,
        productionStartMonth: 20,
        cost: 283000,
        payments: [
          { month: 11, pct: 0.20 },
          { month: 12, pct: 0.50 },
          { month: 15, pct: 0.25 },
          { month: 18, pct: 0.05 }
        ],
        productionPhaseOverride: null,
        costPhaseOverride: null
      },
      {
        name: 'Broderick 1', type: 'broderick',
        validationStartMonth: 36,
        productionStartMonth: 38,
        cost: 1330000,
        payments: [
          { month: 28, pct: 0.10 },
          { month: 29, pct: 0.50 },
          { month: 32, pct: 0.25 },
          { month: 35, pct: 0.10 },
          { month: 36, pct: 0.05 }
        ],
        productionPhaseOverride: 2, // Always Phase 3 production (index 2)
        costPhaseOverride: 0        // Always Phase 1 costs (index 0) - new machine
      }
    ],

    manufacturing: {
      // FTE costs for rotary kiln operation
      fteRoles: [
        { name: 'Loader', count: 1, monthlyCost: 20000 },
        { name: 'Machine Operator', count: 1, monthlyCost: 20000 },
        { name: 'Post-Processing', count: 1, monthlyCost: 20000 }
      ],
      shiftsPerMonth: 20,
      maintenanceContingencyPct: 0.05,
      validationPhaseMonthly: 80000,
      // Biochar cost per kilo by phase [Phase 1, Phase 2, Phase 3]
      biocharCostPerKiloByPhase: [1.50, 1.25, 1.00]
    },

    revenue: {
      streams: [_supercapStream(), _carbonBlackStream()]
    },

    opex: {
      staffing: {
        // Per quarter: {count, salary (annual)} -- salary/4 = quarterly cost per person
        year0: {
          operational: { count: [0, 0, 0, 0], salary: 75000 },
          sales:       { count: [0, 0, 1, 1], salary: 100000 },
          executive:   { count: [5, 5, 5, 5], salary: [40000, 40000, 150000, 150000] }
        },
        year1: {
          operational: { count: [0, 0, 1, 1], salary: 75000 },
          sales:       { count: [0, 0, 1, 1], salary: 100000 },
          executive:   { count: [5, 5, 5, 5], salary: [40000, 150000, 150000, 150000] }
        },
        year2: {
          operational: { count: [1, 1, 1, 1], salary: 75000 },
          sales:       { count: [1, 1, 2, 2], salary: 100000 },
          executive:   { count: [6, 6, 7, 7], salary: 150000 }
        },
        year3: {
          operational: { count: [2, 2, 2, 2], salary: 75000 },
          sales:       { count: [2, 2, 2, 2], salary: 100000 },
          executive:   { count: [7, 7, 7, 7], salary: 150000 }
        }
      },
      benefitsPct: 0.40,

      legal: {
        patent:    { year0: [30000, 6000, 6000, 6000], year1: [20000, 6000, 20000, 6000],
                     year2: [6000, 20000, 60000, 6000], year3: [6000, 20000, 60000, 6000] },
        corporate: { year0: [50000, 30000, 30000, 30000], year1: [45000, 45000, 45000, 45000],
                     year2: [51000, 51000, 51000, 51000], year3: [51000, 51000, 51000, 51000] }
      },

      generalOverhead: {
        base: 170000, // Annual total: T&E 100K + Internet 5K + Marketing 50K + Misc 15K
        growthByYear: [1.0, 1.2, 1.5, 1.6] // Year 0, 1, 2, 3 multipliers
      },

      businessInsurance: [50000, 100000, 150000, 200000], // Year 0, 1, 2, 3 (annual, paid once)

      uofaRoyaltyPct: 0.06,
      salesCommissionPct: 0.055
    },

    rnd: {
      // Quarterly R&D spend (from OUTLOOK formulas)
      year0: [15000, 0, 75000, 30000],
      year1: [100000, 126000, 215667, 240167],
      year2: [240167, 240167, 240167, 240167],
      year3: [240167, 240167, 240167, 240167]
    },

    capexLab: {
      // R&D Equipment CapEx (quarterly)
      year0: [0, 0, 0, 0],
      year1: [0, 130000, 80000, 10000],
      year2: [2000, 10000, 20000, 80000],
      year3: [2000, 10000, 20000, 80000]
    },

    cogs: {
      hempCostPerKilo: 0.40,
      hempContingencyPct: 0.35,
      hempShippingPerKilo: 0.30
    },

    capital: {
      startingCash: 0,
      initialInvestment: 550000, // B36 in OUTLOOK
      raises: [] // { month: N, amount: N }
    },

    technical: {
      evBattery: {
        capacityKwh: 60,
        voltageV: 400,
        energyDensityWhKg: 220,
        activeMaterialPct: 0.60,
        cathodeAnodeRatio: 1.8,
        cathodeComposition: { activeMaterial: 0.94, binder: 0.03, carbonBlack: 0.03 },
        anodeComposition: { syntheticGraphite: 0.95, binder: 0.03, conductiveAdditives: 0.02 }
      },
      hgrapheneReplacement: {
        cathodeEfficiencyFactor: 1.5,
        anodeDensityAdvantage: 0.40,
        anodePhaseInPercent: 0.10
      },
      supercapacitor: {
        capacitanceF: 10,
        voltageV: 160,
        specificEnergyWhKg: 5.1,
        moduleWeightKg: 7.4,
        activeMaterialPct: 0.40,
        activatedCarbonPct: 0.92,
        hgrapheneEfficiencyFactor: 2.5,
        hgrapheneRequiredPct: 0.40
      },
      market: {
        globalEvBatteryCapacityGwh: 1200,
        evCagr: 1.20,
        supercapActivatedCarbonDemandTonnes: 5936,
        supercapCagr: 1.20,
        // Graphene Oxide global demand (user-edited on Technical tab).
        // Defaults to 0 — the supercap/conductive sources are the funded
        // baselines; GO is here so it can power a new revenue stream once
        // the founder fills in real demand numbers.
        grapheneOxideDemandTonnes: 0,
        grapheneOxideCagr: 1.20
      }
    }
  };
}

// ───────────────────────────────────────────────────────────────────
// Migration: convert legacy assumption shapes to the current schema.
// Idempotent — safe to call on any blob. Mutates `a` in place AND
// returns it for chaining. Run at the top of calculateProforma() and
// after server load on the client so the UI always sees the new shape.
// ───────────────────────────────────────────────────────────────────
export function migrateAssumptions(a) {
  if (!a || typeof a !== 'object') return a;

  // v1 → v2: revenue.{supercapElectrode,carbonBlackCathodeAnode} +
  // top-level pricing.{supercapPerKg,carbonBlackPerKg} → revenue.streams[].
  if (a.revenue && !a.revenue.streams) {
    const streams = [];
    const legacySup = a.revenue.supercapElectrode;
    const legacyCb  = a.revenue.carbonBlackCathodeAnode;
    const legacyPricing = a.pricing || {};

    if (legacySup) {
      const s = _supercapStream();
      s.startMonth = legacySup.startMonth ?? s.startMonth;
      s.year1 = legacySup.year1 ?? s.year1;
      s.year2 = legacySup.year2 ?? s.year2;
      s.year3 = legacySup.year3 ?? s.year3;
      if (legacyPricing.supercapPerKg) s.pricing = { ...s.pricing, ...legacyPricing.supercapPerKg };
      streams.push(s);
    }
    if (legacyCb) {
      const s = _carbonBlackStream();
      s.startMonth = legacyCb.startMonth ?? s.startMonth;
      s.year1 = legacyCb.year1 ?? s.year1;
      s.year2 = legacyCb.year2 ?? s.year2;
      s.year3 = legacyCb.year3 ?? s.year3;
      if (legacyPricing.carbonBlackPerKg) s.pricing = { ...s.pricing, ...legacyPricing.carbonBlackPerKg };
      streams.push(s);
    }

    if (streams.length === 0) {
      streams.push(_supercapStream(), _carbonBlackStream());
    }
    a.revenue = { streams };
  }

  // Any version: ensure new market keys exist on technical (so old DB
  // blobs render correctly even if they predate Graphene Oxide).
  if (a.technical && a.technical.market) {
    if (typeof a.technical.market.grapheneOxideDemandTonnes !== 'number') {
      a.technical.market.grapheneOxideDemandTonnes = 0;
    }
    if (typeof a.technical.market.grapheneOxideCagr !== 'number') {
      a.technical.market.grapheneOxideCagr = 1.20;
    }
  }

  // Drop the old top-level pricing block — it's been folded into streams.
  if (a.pricing && a.revenue?.streams) {
    delete a.pricing;
  }

  // Normalise stream order field
  if (a.revenue?.streams) {
    a.revenue.streams.forEach((s, i) => {
      if (typeof s.order !== 'number') s.order = i;
    });
    a.revenue.streams.sort((x, y) => (x.order ?? 0) - (y.order ?? 0));
  }

  a.version = 2;
  return a;
}

export function validateAssumptions(a) {
  const errors = [];
  if (!a || typeof a !== 'object') return ['Assumptions must be an object'];
  if (a.version !== 1 && a.version !== 2) errors.push('Unsupported version: ' + a.version);
  if (!a.production) errors.push('Missing production');
  if (!Array.isArray(a.machines) || a.machines.length === 0) errors.push('Missing machines');
  if (!a.manufacturing) errors.push('Missing manufacturing');
  if (!a.revenue) errors.push('Missing revenue');
  if (a.revenue && !Array.isArray(a.revenue.streams)) {
    // Legacy shape — engine will migrate. No error.
  }
  if (!a.opex) errors.push('Missing opex');
  if (!a.cogs) errors.push('Missing cogs');
  if (!a.capital) errors.push('Missing capital');
  if (!a.technical) errors.push('Missing technical');

  if (a.production) {
    if (typeof a.production.grapheneYieldPercent !== 'number' || a.production.grapheneYieldPercent <= 0 || a.production.grapheneYieldPercent > 1) {
      errors.push('grapheneYieldPercent must be between 0 and 1');
    }
    if (!Array.isArray(a.production.phases) || a.production.phases.length !== 3) {
      errors.push('production.phases must have exactly 3 entries');
    }
  }

  return errors;
}
