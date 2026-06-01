// Default assumptions matching the 2025 HGraphene Projections spreadsheet.
// All values are direct inputs (not derived). The engine computes everything else.

// Horizon: Y0..Y4 (5 calendar years). Single source of truth — engine and UI
// derive YEARS_TOTAL / QUARTERS_TOTAL from MONTHS_TOTAL.
export const MONTHS_TOTAL = 60;
export const YEARS_TOTAL = MONTHS_TOTAL / 12;       // 5
export const QUARTERS_TOTAL = MONTHS_TOTAL / 3;     // 20

// Phase 1 covered months 0-23, Phase 2 = 24-35, Phase 3 = 36-59. Retained as
// a constant for migrations only; the engine now resolves schedules by
// {year, quarter} directly rather than through global phase boundaries.
export const LEGACY_PHASE_BOUNDARIES = [0, 24, 36];

function _emptyQuarters() {
  return [null, null, null, null];
}

function _yearSchedule(hoursPerDay, daysPerMonth) {
  return { hoursPerDay, daysPerMonth, quarters: _emptyQuarters() };
}

function _yearBiocharCost(perKilo) {
  return { perKilo, quarters: _emptyQuarters() };
}

// ── Built-in revenue stream factories ─────────────────────────────
// Each stream is self-contained: pricing, market source, ramp, qDist.
// `builtin: true` streams cannot be deleted via the UI but are otherwise
// editable. New custom streams are appended with builtin: false.

function _supercapStream() {
  return {
    id: 'supercapElectrode',
    name: 'Supercapacitor Electrode',
    builtin: true,
    enabled: true,
    order: 0,
    startMonth: 12,
    pricing: { year0: 200, year1: 200, year2: 200, year3: 200, year4: 200 },
    market: { mode: 'linked', linkedSource: 'supercap' },
    year1: { marketSharePct: 0.03, qDist: [0.10, 0.20, 0.30, 0.40] },
    year2: { marketSharePct: 0.06, qDist: [0.23, 0.24, 0.26, 0.27] },
    year3: { marketSharePct: 0.09, qDist: [0.20, 0.24, 0.26, 0.30] },
    year4: { marketSharePct: 0.12, qDist: [0.22, 0.24, 0.26, 0.28] },
    // % uplift on the per-kg fully-loaded cost of raw graphene (hemp +
    // biochar + manufacturing) for kg flowing through this stream's
    // downstream processing step, controlled per year. 0 = no extra cost.
    processingPremiumPct: { year0: 0, year1: 0, year2: 0, year3: 0, year4: 0 }
  };
}

function _carbonBlackStream() {
  return {
    id: 'carbonBlackCathodeAnode',
    name: 'Carbon Black (Cathode + Anode)',
    builtin: true,
    enabled: true,
    order: 1,
    startMonth: 36,
    pricing: { year0: 50, year1: 50, year2: 50, year3: 50, year4: 50 },
    market: { mode: 'linked', linkedSource: 'conductive' },
    year1: { marketSharePct: 0.0025, qDist: [0.00, 0.20, 0.30, 0.50] },
    year2: { marketSharePct: 0.005, qDist: [0.20, 0.23, 0.25, 0.27] },
    year3: { marketSharePct: 0.009, qDist: [0.20, 0.23, 0.25, 0.27] },
    year4: { marketSharePct: 0.012, qDist: [0.20, 0.23, 0.25, 0.27] },
    processingPremiumPct: { year0: 0, year1: 0, year2: 0, year3: 0, year4: 0 }
  };
}

function _grapheneOxideStream() {
  return {
    id: 'grapheneOxideStream',
    name: 'Graphene Oxide',
    builtin: true,
    enabled: true,
    order: 2,
    startMonth: 24,
    // Pricing/share are placeholders — GO market data is highly variable.
    // Defaults compute to $0 until baseTonnes on the GO market source is
    // filled in (Markets tab) and a non-zero share is set here.
    pricing: { year0: 100, year1: 100, year2: 100, year3: 100, year4: 100 },
    market: { mode: 'linked', linkedSource: 'grapheneOxide' },
    year1: { marketSharePct: 0, qDist: [0.25, 0.25, 0.25, 0.25] },
    year2: { marketSharePct: 0, qDist: [0.25, 0.25, 0.25, 0.25] },
    year3: { marketSharePct: 0, qDist: [0.25, 0.25, 0.25, 0.25] },
    year4: { marketSharePct: 0, qDist: [0.25, 0.25, 0.25, 0.25] },
    // GO requires a separate post-processing step after raw powder is
    // produced. 30% across all years is a rough placeholder until reagent
    // / labor data for the GO step firms up — edit per year as data lands.
    processingPremiumPct: { year0: 0.30, year1: 0.30, year2: 0.30, year3: 0.30, year4: 0.30 }
  };
}

// Bespoke built-in TAM sources rendered on the Markets tab. Their
// kg-per-year arrays are derived in deriveTechnical() from EV-battery /
// supercap composition fields, so they cannot be expressed as a generic
// {baseTonnes, cagr} pair. Generic-formula sources live in
// technical.market.customSources[] — including baked-in Graphene Oxide
// (locked via builtin: true).
export const BUILTIN_MARKET_SOURCES = [
  { id: 'supercap',   label: 'Supercapacitor activated-carbon demand' },
  { id: 'conductive', label: 'EV conductive additives (cathode + anode)' }
];

// Default custom sources seeded into a brand-new scenario.
// Graphene Oxide is `builtin: true` so it can't be deleted — every
// scenario should ship with it as a first-class market.
function _defaultCustomSources() {
  return [
    { id: 'grapheneOxide', label: 'Graphene Oxide demand', baseTonnes: 0, cagr: 1.20, builtin: true }
  ];
}

// Prior-year actuals (use of funds), entered by hand from a real P&L.
// This is DISPLAY-ONLY data — it does NOT flow through calculateProforma();
// it surfaces as a leading "actual" column on the Summary tab. Each line
// rolls into a Summary bucket: revenue | cogs | opexSalaryBenefits |
// opexLegal | opexRoyaltyCommission | opex (other) | capex. Net income =
// revenue − cogs − opex (capex is a balance-sheet use, not a P&L expense).
// Seeded with HGraphene's actual 2025 P&L; edit on the "2025 Actual" pill.
function _defaultHistorical() {
  return {
    enabled: true,
    periodLabel: '2025 Actual',
    lines: [
      { label: 'Services',                amount: -2236.13,  bucket: 'revenue' },
      { label: 'Uncategorized Income',    amount: 28.73,     bucket: 'revenue' },
      { label: 'Interest earned',         amount: 68.83,     bucket: 'revenue' },
      { label: 'Contractor Services',     amount: 641573.41, bucket: 'opex' },
      { label: 'Legal',                   amount: 55000,     bucket: 'opexLegal' },
      { label: 'Debt Interest',           amount: 30000,     bucket: 'opex' },
      { label: 'Expense Reimbursement',   amount: 10745.66,  bucket: 'opex' },
      { label: 'Travel',                  amount: 11502.36,  bucket: 'opex' },
      { label: 'Monthly Tech Services',   amount: 2411.26,   bucket: 'opex' },
      { label: 'Conference',              amount: 1000,      bucket: 'opex' },
      { label: 'Travel Meal',             amount: 773.84,    bucket: 'opex' },
      { label: 'Advertising & marketing', amount: 66.60,     bucket: 'opex' },
      { label: 'Uncategorized Expense',   amount: 127.66,    bucket: 'opex' },
      { label: 'General business expenses', amount: 20,      bucket: 'opex' }
    ]
  };
}

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

      // Operating schedule per kiln type, indexed by calendar year (Y0..Y4).
      // Each year carries a yearly default {hoursPerDay, daysPerMonth} plus a
      // `quarters` array of four optional overrides — null means "inherit the
      // yearly default", a non-null entry pins that quarter's hours/days.
      // Length MUST equal YEARS_TOTAL.
      scheduleByMachineType: {
        pilot: [
          _yearSchedule(15, 20), // Y0
          _yearSchedule(15, 20), // Y1
          _yearSchedule(23, 24), // Y2
          _yearSchedule(23, 28), // Y3
          _yearSchedule(23, 28)  // Y4
        ],
        broderick: [
          _yearSchedule(15, 20),
          _yearSchedule(15, 20),
          _yearSchedule(23, 24),
          _yearSchedule(23, 28),
          _yearSchedule(23, 28)
        ]
      },

      // Cost efficiency multiplier by year (costs decrease as operations mature)
      efficiencyByYear: [1.0, 1.0, 0.85, 0.75, 0.75] // Year 0..Year 4
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
        productionScheduleOverride: { year: null, quarter: null },
        costScheduleOverride: { year: null, quarter: null }
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
        productionScheduleOverride: { year: null, quarter: null },
        costScheduleOverride: { year: null, quarter: null }
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
        productionScheduleOverride: { year: null, quarter: null },
        costScheduleOverride: { year: null, quarter: null }
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
        productionScheduleOverride: { year: null, quarter: null },
        costScheduleOverride: { year: null, quarter: null }
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
        // Broderick runs at full-rate production from day one (pinned to
        // Y3 schedule) but op-cost stays at Y0 ramp level — single new
        // machine, not a full team yet.
        productionScheduleOverride: { year: 3, quarter: null },
        costScheduleOverride: { year: 0, quarter: null }
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
      // Biochar cost per kilo by calendar year (Y0..Y4). Same shape as the
      // operating schedule: each entry is {perKilo, quarters:[n|null × 4]}
      // where a non-null quarter overrides the year's default for that Q.
      biocharCostByYear: [
        _yearBiocharCost(1.50), // Y0
        _yearBiocharCost(1.50), // Y1
        _yearBiocharCost(1.25), // Y2
        _yearBiocharCost(1.00), // Y3
        _yearBiocharCost(1.00)  // Y4
      ]
    },

    revenue: {
      streams: [_supercapStream(), _carbonBlackStream(), _grapheneOxideStream()]
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
        },
        year4: {
          operational: { count: [2, 2, 2, 2], salary: 75000 },
          sales:       { count: [2, 2, 2, 2], salary: 100000 },
          executive:   { count: [7, 7, 7, 7], salary: 150000 }
        }
      },
      // Benefits as a % of staffing salary, per year (Y0..Y4). Same shape
      // as contingencyPct — edit each year independently.
      benefitsPct: [0.40, 0.40, 0.40, 0.40, 0.40],

      legal: {
        patent:    { year0: [30000, 6000, 6000, 6000], year1: [20000, 6000, 20000, 6000],
                     year2: [6000, 20000, 60000, 6000], year3: [6000, 20000, 60000, 6000],
                     year4: [6000, 20000, 60000, 6000] },
        corporate: { year0: [50000, 30000, 30000, 30000], year1: [45000, 45000, 45000, 45000],
                     year2: [51000, 51000, 51000, 51000], year3: [51000, 51000, 51000, 51000],
                     year4: [51000, 51000, 51000, 51000] }
      },

      generalOverhead: {
        base: 170000, // Annual total: T&E 100K + Internet 5K + Marketing 50K + Misc 15K
        growthByYear: [1.0, 1.2, 1.5, 1.6, 1.6] // Year 0..4 multipliers
      },

      businessInsurance: [50000, 100000, 150000, 200000, 200000], // Year 0..4 (annual, paid once)

      uofaRoyaltyPct: 0.06,
      salesCommissionPct: 0.055,
      // Catch-all contingency applied as a % uplift on the sum of all other
      // OPEX line items, controlled per year (Y0..Y4). Default zeros keep
      // existing scenarios unchanged.
      contingencyPct: [0, 0, 0, 0, 0]
    },

    rnd: {
      // Quarterly R&D spend (from OUTLOOK formulas)
      year0: [15000, 0, 75000, 30000],
      year1: [100000, 126000, 215667, 240167],
      year2: [240167, 240167, 240167, 240167],
      year3: [240167, 240167, 240167, 240167],
      year4: [240167, 240167, 240167, 240167]
    },

    capexLab: {
      // R&D Equipment CapEx (quarterly)
      year0: [0, 0, 0, 0],
      year1: [0, 130000, 80000, 10000],
      year2: [2000, 10000, 20000, 80000],
      year3: [2000, 10000, 20000, 80000],
      year4: [2000, 10000, 20000, 80000]
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

    historical: _defaultHistorical(),

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
        // User-editable list of generic TAM sources. Each entry produces a
        // <id>ByYear array via the simple tonnes × CAGR^N formula. Built-in
        // sources (supercap, conductive) live outside this array because
        // their formulas reach into other technical fields.
        customSources: _defaultCustomSources()
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
      streams.push(_supercapStream(), _carbonBlackStream(), _grapheneOxideStream());
    }
    a.revenue = { streams };
  }

  // Any version: reshape the Graphene-Oxide-specific fields into the
  // generic customSources[] array. Older DB blobs may have neither the
  // GO fields nor the array — in that case we still seed the default
  // GO entry so the Markets tab has at least one editable source.
  if (a.technical && a.technical.market) {
    const m = a.technical.market;
    if (!Array.isArray(m.customSources)) {
      const sources = [];
      const hasLegacyGO = typeof m.grapheneOxideDemandTonnes === 'number'
        || typeof m.grapheneOxideCagr === 'number';
      if (hasLegacyGO) {
        sources.push({
          id: 'grapheneOxide',
          label: 'Graphene Oxide demand',
          baseTonnes: m.grapheneOxideDemandTonnes || 0,
          cagr: m.grapheneOxideCagr || 1.20,
          builtin: true
        });
      } else {
        sources.push(..._defaultCustomSources());
      }
      m.customSources = sources;
    }
    // Promote any pre-existing GO entry to builtin (locked-from-deletion).
    // GO is now baked into every scenario as a first-class market source.
    const goSource = m.customSources.find(s => s && s.id === 'grapheneOxide');
    if (goSource) goSource.builtin = true;
    delete m.grapheneOxideDemandTonnes;
    delete m.grapheneOxideCagr;
  }

  // Drop the old top-level pricing block — it's been folded into streams.
  if (a.pricing && a.revenue?.streams) {
    delete a.pricing;
  }

  // Normalise stream order field + ensure every stream has an `enabled`
  // flag (default true). Existing scenarios predate the flag.
  if (a.revenue?.streams) {
    a.revenue.streams.forEach((s, i) => {
      if (typeof s.order !== 'number') s.order = i;
      if (typeof s.enabled !== 'boolean') s.enabled = true;
      // processingPremiumPct: scalar | undefined | object → {year0..year4}
      const defaultPct = s.id === 'grapheneOxideStream' ? 0.30 : 0;
      const p = s.processingPremiumPct;
      if (typeof p === 'number') {
        // Old scalar shape: broadcast across all years.
        s.processingPremiumPct = { year0: p, year1: p, year2: p, year3: p, year4: p };
      } else if (!p || typeof p !== 'object') {
        s.processingPremiumPct = { year0: defaultPct, year1: defaultPct, year2: defaultPct, year3: defaultPct, year4: defaultPct };
      } else {
        // Already an object — backfill any missing year keys with the
        // nearest defined value (Y4 falls back to Y3 → Y2 → ... → default).
        const fallback = (yIdx) => {
          for (let j = yIdx; j >= 0; j--) {
            const v = p['year' + j];
            if (typeof v === 'number') return v;
          }
          return defaultPct;
        };
        for (let y = 0; y < YEARS_TOTAL; y++) {
          if (typeof p['year' + y] !== 'number') p['year' + y] = fallback(y);
        }
      }
    });
    a.revenue.streams.sort((x, y) => (x.order ?? 0) - (y.order ?? 0));

    // Bake in a Graphene Oxide stream for any scenario that doesn't
    // already have one linked to the GO market source. GO is now
    // first-class — every scenario should ship with all three.
    const hasGoStream = a.revenue.streams.some(s => s.id === 'grapheneOxideStream');
    if (!hasGoStream) {
      const go = _grapheneOxideStream();
      go.order = a.revenue.streams.length;
      a.revenue.streams.push(go);
    }
  }

  // ── Phase → year/quarter migration ────────────────────────────────
  // Legacy schedules had 3 phases mapped to month ranges:
  //   Phase 1 (idx 0) = months  0-23 → Y0, Y1
  //   Phase 2 (idx 1) = months 24-35 → Y2
  //   Phase 3 (idx 2) = months 36-59 → Y3, Y4
  // The new shape: 5 yearly entries (Y0..Y4) each with optional per-quarter
  // overrides. Older blobs may carry `production.phases[]` (very old),
  // `production.phasesByMachineType.{pilot,broderick}` (recent legacy), or
  // already the new `scheduleByMachineType` (no-op). All are handled here.
  const _phaseToYear = [0, 2, 3]; // legacy phase idx → starting year
  const _yearToPhase = y => (y >= 3 ? 2 : y === 2 ? 1 : 0);

  const _phaseEntryToYears = phaseArr => {
    const safe = i => ({
      hoursPerDay: typeof phaseArr[i]?.hoursPerDay === 'number' ? phaseArr[i].hoursPerDay : 0,
      daysPerMonth: typeof phaseArr[i]?.daysPerMonth === 'number' ? phaseArr[i].daysPerMonth : 0
    });
    const p0 = safe(0), p1 = safe(1), p2 = safe(2);
    return [
      { ...p0, quarters: _emptyQuarters() }, // Y0
      { ...p0, quarters: _emptyQuarters() }, // Y1
      { ...p1, quarters: _emptyQuarters() }, // Y2
      { ...p2, quarters: _emptyQuarters() }, // Y3
      { ...p2, quarters: _emptyQuarters() }  // Y4
    ];
  };

  if (a.production && !a.production.scheduleByMachineType) {
    const fallback = [
      { hoursPerDay: 15, daysPerMonth: 20 },
      { hoursPerDay: 23, daysPerMonth: 24 },
      { hoursPerDay: 23, daysPerMonth: 28 }
    ];
    let pilotPhases = fallback, broderickPhases = fallback;
    if (a.production.phasesByMachineType) {
      const pbm = a.production.phasesByMachineType;
      if (Array.isArray(pbm.pilot) && pbm.pilot.length === 3) pilotPhases = pbm.pilot;
      if (Array.isArray(pbm.broderick) && pbm.broderick.length === 3) broderickPhases = pbm.broderick;
    } else if (Array.isArray(a.production.phases) && a.production.phases.length === 3) {
      pilotPhases = a.production.phases;
      broderickPhases = a.production.phases;
    }
    a.production.scheduleByMachineType = {
      pilot: _phaseEntryToYears(pilotPhases),
      broderick: _phaseEntryToYears(broderickPhases)
    };
  } else if (a.production && a.production.scheduleByMachineType) {
    // Already-new shape: make sure each kiln type has YEARS_TOTAL entries
    // (extends short arrays by flat-lining the last year) and that every
    // entry has a `quarters` array of length 4.
    const sbm = a.production.scheduleByMachineType;
    for (const kt of ['pilot', 'broderick']) {
      if (!Array.isArray(sbm[kt])) sbm[kt] = [];
      while (sbm[kt].length < YEARS_TOTAL) {
        const last = sbm[kt][sbm[kt].length - 1] || { hoursPerDay: 0, daysPerMonth: 0 };
        sbm[kt].push({ hoursPerDay: last.hoursPerDay, daysPerMonth: last.daysPerMonth, quarters: _emptyQuarters() });
      }
      sbm[kt] = sbm[kt].slice(0, YEARS_TOTAL).map(entry => ({
        hoursPerDay: typeof entry?.hoursPerDay === 'number' ? entry.hoursPerDay : 0,
        daysPerMonth: typeof entry?.daysPerMonth === 'number' ? entry.daysPerMonth : 0,
        quarters: Array.isArray(entry?.quarters) && entry.quarters.length === 4
          ? entry.quarters.map(q =>
              q && typeof q.hoursPerDay === 'number' && typeof q.daysPerMonth === 'number'
                ? { hoursPerDay: q.hoursPerDay, daysPerMonth: q.daysPerMonth }
                : null)
          : _emptyQuarters()
      }));
    }
  }
  if (a.production) {
    delete a.production.phases;
    delete a.production.phasesByMachineType;
  }

  // Biochar cost: 3-entry phase array → 5-entry year array with quarters.
  if (a.manufacturing && !a.manufacturing.biocharCostByYear) {
    const legacy = Array.isArray(a.manufacturing.biocharCostPerKiloByPhase)
      && a.manufacturing.biocharCostPerKiloByPhase.length === 3
      ? a.manufacturing.biocharCostPerKiloByPhase
      : [1.50, 1.25, 1.00];
    a.manufacturing.biocharCostByYear = [
      { perKilo: +legacy[0] || 0, quarters: _emptyQuarters() },
      { perKilo: +legacy[0] || 0, quarters: _emptyQuarters() },
      { perKilo: +legacy[1] || 0, quarters: _emptyQuarters() },
      { perKilo: +legacy[2] || 0, quarters: _emptyQuarters() },
      { perKilo: +legacy[2] || 0, quarters: _emptyQuarters() }
    ];
  } else if (a.manufacturing && Array.isArray(a.manufacturing.biocharCostByYear)) {
    const arr = a.manufacturing.biocharCostByYear;
    while (arr.length < YEARS_TOTAL) {
      const last = arr[arr.length - 1] || { perKilo: 0 };
      arr.push({ perKilo: last.perKilo || 0, quarters: _emptyQuarters() });
    }
    a.manufacturing.biocharCostByYear = arr.slice(0, YEARS_TOTAL).map(entry => ({
      perKilo: typeof entry?.perKilo === 'number' ? entry.perKilo : 0,
      quarters: Array.isArray(entry?.quarters) && entry.quarters.length === 4
        ? entry.quarters.map(q => (typeof q === 'number' ? q : null))
        : _emptyQuarters()
    }));
  }
  if (a.manufacturing) {
    delete a.manufacturing.biocharCostPerKiloByPhase;
  }

  // Per-machine phase overrides → schedule overrides.
  if (Array.isArray(a.machines)) {
    for (const machine of a.machines) {
      if (!machine) continue;
      if (!machine.productionScheduleOverride) {
        const legacy = machine.productionPhaseOverride;
        machine.productionScheduleOverride = (typeof legacy === 'number')
          ? { year: _phaseToYear[legacy] ?? null, quarter: null }
          : { year: null, quarter: null };
      } else {
        // Normalize new shape so year/quarter are always present
        const o = machine.productionScheduleOverride;
        machine.productionScheduleOverride = {
          year: typeof o?.year === 'number' ? o.year : null,
          quarter: typeof o?.quarter === 'number' ? o.quarter : null
        };
      }
      if (!machine.costScheduleOverride) {
        const legacy = machine.costPhaseOverride;
        machine.costScheduleOverride = (typeof legacy === 'number')
          ? { year: _phaseToYear[legacy] ?? null, quarter: null }
          : { year: null, quarter: null };
      } else {
        const o = machine.costScheduleOverride;
        machine.costScheduleOverride = {
          year: typeof o?.year === 'number' ? o.year : null,
          quarter: typeof o?.quarter === 'number' ? o.quarter : null
        };
      }
      delete machine.productionPhaseOverride;
      delete machine.costPhaseOverride;
    }
  }

  // Horizon extension Y0..Y3 -> Y0..Y4: hybrid rule.
  //   Cost/efficiency fields repeat last year (flat-line steady state).
  //   Revenue share fields default to 0 (don't silently inflate forecasts).
  //   Pricing $/kg copies the last year (unit price isn't a forecast).
  // Idempotent: only fills in year4 / extends arrays when missing/short.
  if (a.production && Array.isArray(a.production.efficiencyByYear) && a.production.efficiencyByYear.length < YEARS_TOTAL) {
    const last = a.production.efficiencyByYear[a.production.efficiencyByYear.length - 1] ?? 1.0;
    while (a.production.efficiencyByYear.length < YEARS_TOTAL) a.production.efficiencyByYear.push(last);
  }
  if (a.opex) {
    // contingencyPct: scalar | undefined | array → 5-elem array
    const c = a.opex.contingencyPct;
    if (typeof c === 'number') {
      a.opex.contingencyPct = [c, c, c, c, c];
    } else if (!Array.isArray(c)) {
      a.opex.contingencyPct = [0, 0, 0, 0, 0];
    } else if (c.length < YEARS_TOTAL) {
      // Short array (e.g. user-truncated or future-proofing): repeat last
      const last = c[c.length - 1] ?? 0;
      while (a.opex.contingencyPct.length < YEARS_TOTAL) a.opex.contingencyPct.push(last);
    } else if (c.length > YEARS_TOTAL) {
      a.opex.contingencyPct = c.slice(0, YEARS_TOTAL);
    }
    // benefitsPct: scalar | undefined | array → 5-elem array (same rules
    // as contingencyPct). Older scenarios stored a single number.
    const b = a.opex.benefitsPct;
    if (typeof b === 'number') {
      a.opex.benefitsPct = [b, b, b, b, b];
    } else if (!Array.isArray(b)) {
      a.opex.benefitsPct = [0.40, 0.40, 0.40, 0.40, 0.40];
    } else if (b.length < YEARS_TOTAL) {
      const last = b[b.length - 1] ?? 0.40;
      while (a.opex.benefitsPct.length < YEARS_TOTAL) a.opex.benefitsPct.push(last);
    } else if (b.length > YEARS_TOTAL) {
      a.opex.benefitsPct = b.slice(0, YEARS_TOTAL);
    }
    if (a.opex.staffing && a.opex.staffing.year3 && !a.opex.staffing.year4) {
      a.opex.staffing.year4 = JSON.parse(JSON.stringify(a.opex.staffing.year3));
    }
    if (a.opex.legal) {
      if (a.opex.legal.patent && Array.isArray(a.opex.legal.patent.year3) && !a.opex.legal.patent.year4) {
        a.opex.legal.patent.year4 = [...a.opex.legal.patent.year3];
      }
      if (a.opex.legal.corporate && Array.isArray(a.opex.legal.corporate.year3) && !a.opex.legal.corporate.year4) {
        a.opex.legal.corporate.year4 = [...a.opex.legal.corporate.year3];
      }
    }
    if (a.opex.generalOverhead && Array.isArray(a.opex.generalOverhead.growthByYear)
        && a.opex.generalOverhead.growthByYear.length < YEARS_TOTAL) {
      const last = a.opex.generalOverhead.growthByYear[a.opex.generalOverhead.growthByYear.length - 1] ?? 1.0;
      while (a.opex.generalOverhead.growthByYear.length < YEARS_TOTAL) {
        a.opex.generalOverhead.growthByYear.push(last);
      }
    }
    if (Array.isArray(a.opex.businessInsurance) && a.opex.businessInsurance.length < YEARS_TOTAL) {
      const last = a.opex.businessInsurance[a.opex.businessInsurance.length - 1] ?? 0;
      while (a.opex.businessInsurance.length < YEARS_TOTAL) a.opex.businessInsurance.push(last);
    }
  }
  if (a.rnd && Array.isArray(a.rnd.year3) && !a.rnd.year4) {
    a.rnd.year4 = [...a.rnd.year3];
  }
  if (a.capexLab && Array.isArray(a.capexLab.year3) && !a.capexLab.year4) {
    a.capexLab.year4 = [...a.capexLab.year3];
  }
  if (a.revenue && Array.isArray(a.revenue.streams)) {
    for (const s of a.revenue.streams) {
      if (!s) continue;
      if (!s.year4) {
        s.year4 = { marketSharePct: 0, qDist: [0.25, 0.25, 0.25, 0.25] };
      }
      if (s.pricing && s.pricing.year4 == null) {
        s.pricing.year4 = s.pricing.year3 ?? s.pricing.year2 ?? s.pricing.year1 ?? s.pricing.year0 ?? 0;
      }
      if (s.market && s.market.mode === 'direct' && s.market.revenueByYear && s.market.revenueByYear.year4 == null) {
        s.market.revenueByYear.year4 = 0;
      }
      // Direct streams gained an input-mode toggle: 'revenue' (entered $, derive kg)
      // vs 'kg' (entered kg, derive $). Older blobs default to 'revenue' to
      // preserve behavior; kgByYear is seeded as zeros.
      if (s.market && s.market.mode === 'direct') {
        if (s.market.directInput !== 'kg') s.market.directInput = 'revenue';
        if (!s.market.kgByYear || typeof s.market.kgByYear !== 'object') {
          s.market.kgByYear = { year1: 0, year2: 0, year3: 0, year4: 0 };
        } else {
          for (const yk of ['year1','year2','year3','year4']) {
            if (typeof s.market.kgByYear[yk] !== 'number') s.market.kgByYear[yk] = 0;
          }
        }
      }
      if (!s.commission) {
        s.commission = { enabled: false, rateByYear: { year1: 0, year2: 0, year3: 0, year4: 0 }, dealValueByYear: { year1: 0, year2: 0, year3: 0, year4: 0 } };
      }
      // Migrate single `rate` field to `rateByYear`
      if (s.commission && typeof s.commission.rate === 'number' && !s.commission.rateByYear) {
        const r = s.commission.rate;
        s.commission.rateByYear = { year1: r, year2: r, year3: r, year4: r };
        delete s.commission.rate;
      }
    }
  }

  // Prior-year actuals block (display-only "2025 Actual" column on Summary).
  // Add-only and idempotent. The 2025 P&L is a company-wide fact, identical
  // across every scenario, so seed the real lines onto any scenario that
  // predates the feature (or has an empty list) rather than a blank stub —
  // that way opening an existing scenario shows the column with no re-typing.
  // Hand-entered lines are never overwritten.
  if (!a.historical || typeof a.historical !== 'object') {
    a.historical = _defaultHistorical();
  } else {
    if (typeof a.historical.enabled !== 'boolean') a.historical.enabled = true;
    if (typeof a.historical.periodLabel !== 'string') a.historical.periodLabel = '2025 Actual';
    if (!Array.isArray(a.historical.lines) || a.historical.lines.length === 0) {
      a.historical.lines = _defaultHistorical().lines;
    }
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
    const sbm = a.production.scheduleByMachineType;
    if (!sbm || typeof sbm !== 'object') {
      errors.push('production.scheduleByMachineType must exist (run migration)');
    } else {
      if (!Array.isArray(sbm.pilot) || sbm.pilot.length !== YEARS_TOTAL) {
        errors.push(`production.scheduleByMachineType.pilot must have exactly ${YEARS_TOTAL} entries`);
      }
      if (!Array.isArray(sbm.broderick) || sbm.broderick.length !== YEARS_TOTAL) {
        errors.push(`production.scheduleByMachineType.broderick must have exactly ${YEARS_TOTAL} entries`);
      }
    }
  }

  return errors;
}
