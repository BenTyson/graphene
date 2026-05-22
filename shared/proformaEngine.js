import { MONTHS_TOTAL, YEARS_TOTAL, QUARTERS_TOTAL, validateAssumptions, migrateAssumptions } from './proformaDefaults.js';

// Which year (0..YEARS_TOTAL-1) a month falls in
function getYear(month) {
  return Math.floor(month / 12);
}

// Which quarter within a year (0-3)
function getQuarterInYear(month) {
  return Math.floor((month % 12) / 3);
}

// Resolve the effective {hoursPerDay, daysPerMonth} for a given year+quarter
// from a scheduleByMachineType entry. Quarter override wins; otherwise falls
// back to the yearly default. Missing entries collapse to zeros.
function resolveScheduleCell(scheduleByYear, year, quarter) {
  const entry = scheduleByYear && scheduleByYear[year];
  if (!entry) return { hoursPerDay: 0, daysPerMonth: 0 };
  const qOverride = Array.isArray(entry.quarters) ? entry.quarters[quarter] : null;
  if (qOverride && typeof qOverride.hoursPerDay === 'number' && typeof qOverride.daysPerMonth === 'number') {
    return { hoursPerDay: qOverride.hoursPerDay, daysPerMonth: qOverride.daysPerMonth };
  }
  return {
    hoursPerDay: entry.hoursPerDay || 0,
    daysPerMonth: entry.daysPerMonth || 0
  };
}

// Resolve effective biochar $/kg for a year+quarter.
function resolveBiocharCostCell(biocharByYear, year, quarter) {
  const entry = biocharByYear && biocharByYear[year];
  if (!entry) return 0;
  const qOverride = Array.isArray(entry.quarters) ? entry.quarters[quarter] : null;
  if (typeof qOverride === 'number') return qOverride;
  return typeof entry.perKilo === 'number' ? entry.perKilo : 0;
}

// ──────────────────────────────────────────────────────────────
// Layer 1: Technical Reference (market sizing)
// ──────────────────────────────────────────────────────────────
function deriveTechnical(tech) {
  const ev = tech.evBattery;
  const hg = tech.hgrapheneReplacement;
  const sup = tech.supercapacitor;
  const mkt = tech.market;

  // EV Battery calculations
  const totalBatteryWeightKg = (ev.capacityKwh / ev.energyDensityWhKg) * 1000;
  const activeMaterialWeightKg = totalBatteryWeightKg * ev.activeMaterialPct;
  const cathodeWeightPct = ev.cathodeAnodeRatio / (1 + ev.cathodeAnodeRatio);
  const anodeWeightPct = 1 / (1 + ev.cathodeAnodeRatio);
  const cathodeMaterialWeightKg = activeMaterialWeightKg * cathodeWeightPct;
  const anodeMaterialWeightKg = activeMaterialWeightKg * anodeWeightPct;

  // HGraphene per battery - cathode conductive additive
  const hgCathodePercent = ev.cathodeComposition.carbonBlack / hg.cathodeEfficiencyFactor;
  const hgCathodeWeightKg = cathodeMaterialWeightKg * hgCathodePercent;
  const hgCathodePerKwh = hgCathodeWeightKg / ev.capacityKwh;

  // HGraphene per battery - anode conductive additive
  const hgAnodeWeightKg = anodeMaterialWeightKg * hgCathodePercent;
  const hgAnodePerKwh = hgAnodeWeightKg / ev.capacityKwh;

  // Global market - conductive additives (cathode + anode)
  // GWh * 1,000,000 kWh/GWh * kg/kWh = kg
  const globalHgCathodeKg = mkt.globalEvBatteryCapacityGwh * 1e6 * hgCathodePerKwh;
  const globalHgAnodeConductiveKg = mkt.globalEvBatteryCapacityGwh * 1e6 * hgAnodePerKwh;
  const globalHgConductiveTotalKg = globalHgCathodeKg + globalHgAnodeConductiveKg;

  // Supercapacitor market
  const supHGDemandKg = mkt.supercapActivatedCarbonDemandTonnes *
    (1 / sup.hgrapheneEfficiencyFactor) * 1000;

  // Yearly global markets with CAGR — Y0 is base, Y1+ compound.
  const conductiveByYear = [];
  const supercapByYear = [];
  for (let y = 0; y < YEARS_TOTAL; y++) {
    conductiveByYear.push(globalHgConductiveTotalKg * Math.pow(mkt.evCagr, y));
    supercapByYear.push(supHGDemandKg * Math.pow(mkt.supercapCagr, y));
  }

  // Generic custom market sources: each entry becomes a <id>ByYear array
  // computed as tonnes × CAGR^N. Streams pick one via market.linkedSource.
  const customSources = Array.isArray(mkt.customSources) ? mkt.customSources : [];
  const customByYear = {};
  for (const src of customSources) {
    if (!src || !src.id) continue;
    const baseKg = (src.baseTonnes || 0) * 1000;
    const cagr = src.cagr || 1.0;
    const arr = [];
    for (let y = 0; y < YEARS_TOTAL; y++) arr.push(baseKg * Math.pow(cagr, y));
    customByYear[src.id + 'ByYear'] = arr;
  }

  return {
    globalHgConductiveTotalKg,
    supHGDemandKg,
    conductiveByYear,
    supercapByYear,
    ...customByYear
  };
}

// ──────────────────────────────────────────────────────────────
// Layer 2: Production Timeline
// ──────────────────────────────────────────────────────────────
function computeProduction(machines, prod, mfg) {
  const p = prod;

  // Derived production constants
  const biocharYieldKg = p.biocharYieldG / 1000;
  const massKOHBiocharG = p.initialBiocharUseG + p.initialKOHG;
  const volumeMl = massKOHBiocharG / p.densityMix;
  const cubicFtPerBatch = volumeMl * p.volumeConversionCuFt;
  const graphenePerBatchG = p.initialBiocharUseG * p.grapheneYieldPercent;

  // Hemp ratio multiplier: hemp_kg_needed_per_graphene_kg
  // From spreadsheet: hempPerDay / graphenePerDay using pilot Phase 1 numbers
  const pilotGraphenePerHourKg = ((p.smallKilnCuFtPerHour * graphenePerBatchG) / cubicFtPerBatch) * p.bufferToggle / 1000;

  // Hemp ratio multiplier: exactly as spreadsheet B100 = B57/B59
  const biocharToFillFeedG = (p.smallKilnCuFtPerHour * p.initialBiocharUseG) / cubicFtPerBatch;
  const biocharToFillFeedKg = biocharToFillFeedG / 1000;
  const hempToFillFeedKg = biocharToFillFeedKg / biocharYieldKg;
  const hempRatioMultiplier = hempToFillFeedKg / pilotGraphenePerHourKg;

  // Production rate per hour for each kiln type (kg)
  function graphenePerHourKg(kilnCuFt) {
    return ((kilnCuFt * graphenePerBatchG) / cubicFtPerBatch) * p.bufferToggle / 1000;
  }

  const pilotRatePerHourKg = graphenePerHourKg(p.smallKilnCuFtPerHour);
  const broderickRatePerHourKg = graphenePerHourKg(p.largeKilnCuFtPerHour);

  // Each kiln type runs on its own per-year schedule, with optional per-quarter
  // overrides. Production rate AND op cost both follow the resolved cell —
  // labor/maintenance scale with that quarter's monthly shifts.
  const pilotSchedule = p.scheduleByMachineType.pilot;
  const broderickSchedule = p.scheduleByMachineType.broderick;

  const totalFteMonthlyCost = mfg.fteRoles.reduce((sum, r) => sum + r.count * r.monthlyCost, 0);
  const costPerShift = totalFteMonthlyCost / mfg.shiftsPerMonth;

  // Pre-compute the 5×4 production-rate and op-cost grids per kiln type so
  // overrides and the per-month loop are cheap lookups.
  const buildRateGrid = (schedule, ratePerHourKg) => {
    const grid = new Array(YEARS_TOTAL);
    for (let y = 0; y < YEARS_TOTAL; y++) {
      grid[y] = new Array(4);
      for (let q = 0; q < 4; q++) {
        const cell = resolveScheduleCell(schedule, y, q);
        grid[y][q] = ratePerHourKg * cell.hoursPerDay * cell.daysPerMonth;
      }
    }
    return grid;
  };
  const buildCostGrid = schedule => {
    const grid = new Array(YEARS_TOTAL);
    for (let y = 0; y < YEARS_TOTAL; y++) {
      grid[y] = new Array(4);
      for (let q = 0; q < 4; q++) {
        const cell = resolveScheduleCell(schedule, y, q);
        const shifts = (cell.hoursPerDay / 8) * cell.daysPerMonth;
        const laborCost = shifts * costPerShift;
        const maintenance = laborCost * mfg.maintenanceContingencyPct;
        grid[y][q] = laborCost + maintenance;
      }
    }
    return grid;
  };

  const pilotMonthlyGrid = buildRateGrid(pilotSchedule, pilotRatePerHourKg);
  const broderickMonthlyGrid = buildRateGrid(broderickSchedule, broderickRatePerHourKg);
  const pilotCostGrid = buildCostGrid(pilotSchedule);
  const broderickCostGrid = buildCostGrid(broderickSchedule);

  // Initialize monthly arrays
  const monthlyGrapheneKg = new Array(MONTHS_TOTAL).fill(0);
  const monthlyHempKg = new Array(MONTHS_TOTAL).fill(0);
  const monthlyCapex = new Array(MONTHS_TOTAL).fill(0);
  const monthlyManufacturingCost = new Array(MONTHS_TOTAL).fill(0);
  const monthlyBiocharCost = new Array(MONTHS_TOTAL).fill(0);
  const machineTimelines = [];

  for (const machine of machines) {
    const timeline = {
      name: machine.name,
      type: machine.type,
      monthlyKg: new Array(MONTHS_TOTAL).fill(0),
      monthlyOpCost: new Array(MONTHS_TOTAL).fill(0),
      monthlyCapex: new Array(MONTHS_TOTAL).fill(0)
    };

    const isBroderick = machine.type === 'broderick';
    const rateGrid = isBroderick ? broderickMonthlyGrid : pilotMonthlyGrid;
    const costGrid = isBroderick ? broderickCostGrid : pilotCostGrid;
    const prodOverride = machine.productionScheduleOverride || { year: null, quarter: null };
    const costOverride = machine.costScheduleOverride || { year: null, quarter: null };

    // CapEx payments
    for (const payment of machine.payments) {
      if (payment.month >= 0 && payment.month < MONTHS_TOTAL) {
        const amount = machine.cost * payment.pct;
        timeline.monthlyCapex[payment.month] = amount;
        monthlyCapex[payment.month] += amount;
      }
    }

    // Validation phase (2 months before production)
    if (machine.validationStartMonth != null) {
      for (let m = machine.validationStartMonth; m < machine.validationStartMonth + 2 && m < MONTHS_TOTAL; m++) {
        if (m >= 0) {
          timeline.monthlyOpCost[m] = mfg.validationPhaseMonthly;
          monthlyManufacturingCost[m] += mfg.validationPhaseMonthly;
        }
      }
    }

    // Production phase
    for (let m = machine.productionStartMonth; m < MONTHS_TOTAL; m++) {
      const year = getYear(m);
      const quarter = getQuarterInYear(m);

      // Production kg: pinned by override or follows the timeline.
      const prodY = prodOverride.year != null ? prodOverride.year : year;
      const prodQ = prodOverride.quarter != null ? prodOverride.quarter : quarter;
      const kg = rateGrid[prodY][prodQ];
      timeline.monthlyKg[m] = kg;
      monthlyGrapheneKg[m] += kg;

      // Operating cost
      const costY = costOverride.year != null ? costOverride.year : year;
      const costQ = costOverride.quarter != null ? costOverride.quarter : quarter;
      const efficiency = p.efficiencyByYear[year] || p.efficiencyByYear[p.efficiencyByYear.length - 1];
      const opCost = costGrid[costY][costQ] * efficiency;
      timeline.monthlyOpCost[m] = opCost;
      monthlyManufacturingCost[m] += opCost;
    }

    machineTimelines.push(timeline);
  }

  // Hemp and biochar consumption
  for (let m = 0; m < MONTHS_TOTAL; m++) {
    monthlyHempKg[m] = monthlyGrapheneKg[m] * hempRatioMultiplier;

    // Biochar cost: graphene_kg / yield * cost_per_kg_for_year_quarter
    const year = getYear(m);
    const quarter = getQuarterInYear(m);
    const biocharKg = monthlyGrapheneKg[m] / p.grapheneYieldPercent;
    monthlyBiocharCost[m] = biocharKg * resolveBiocharCostCell(mfg.biocharCostByYear, year, quarter);
  }

  // Backwards-compat output: previous consumers read [Phase 1, Phase 2, Phase 3]
  // arrays of kg/mo. We surface equivalents pulled from the new grid:
  // Phase 1 ≈ Y1Q0 (steady ramp), Phase 2 ≈ Y2Q0, Phase 3 ≈ Y3Q3 (full rate).
  // New consumers should use pilotMonthlyGrid / broderickMonthlyGrid directly.
  const pilotMonthlyByPhase = [pilotMonthlyGrid[1][0], pilotMonthlyGrid[2][0], pilotMonthlyGrid[3][3]];
  const broderickMonthlyByPhase = [broderickMonthlyGrid[1][0], broderickMonthlyGrid[2][0], broderickMonthlyGrid[3][3]];

  return {
    monthlyGrapheneKg,
    monthlyHempKg,
    monthlyCapex,
    monthlyManufacturingCost,
    monthlyBiocharCost,
    machineTimelines,
    hempRatioMultiplier,
    pilotMonthlyGrid,
    broderickMonthlyGrid,
    pilotMonthlyByPhase,
    broderickMonthlyByPhase
  };
}

// ──────────────────────────────────────────────────────────────
// Layer 3: Revenue
// ──────────────────────────────────────────────────────────────
// Iterates revenue.streams[]. Each stream resolves its annual revenue
// via either a linked market source (kg × marketSharePct × $/kg) or
// a direct revenueByYear schedule, then distributes it through the
// stream's qDist into months — clipped at startMonth.
function computeRevenue(revenueAssumptions, techRef) {
  const monthly = {
    byStream: {},                           // { [streamId]: number[] } (revenue $)
    total: new Array(MONTHS_TOTAL).fill(0),
    kgByStream: {},                         // { [streamId]: number[] } (kg sold)
    kgTotal: new Array(MONTHS_TOTAL).fill(0)
  };

  const streams = (revenueAssumptions && revenueAssumptions.streams) || [];

  for (const stream of streams) {
    const stripe = new Array(MONTHS_TOTAL).fill(0);
    const kgStripe = new Array(MONTHS_TOTAL).fill(0);
    // Disabled streams keep their config but contribute zero revenue.
    // We still register the empty stripe so chart datasets stay stable.
    if (stream.enabled === false) {
      monthly.byStream[stream.id] = stripe;
      monthly.kgByStream[stream.id] = kgStripe;
      continue;
    }
    const market = stream.market || { mode: 'linked', linkedSource: 'supercap' };

    for (let year = 1; year < YEARS_TOTAL; year++) {
      const cfg = stream['year' + year];
      if (!cfg) continue;

      // Year 1 uses index 0 (base), Year 2 → index 1, Year 3 → index 2.
      // (Matches the legacy mapping the spreadsheet uses.)
      let yearRevenue = 0;
      let yearKg = 0;

      if (market.mode === 'linked') {
        const sourceKey = (market.linkedSource || '') + 'ByYear';
        const sourceArr = techRef[sourceKey];
        if (!Array.isArray(sourceArr)) continue;
        const marketKg = sourceArr[year - 1] || 0;
        yearKg = marketKg * (cfg.marketSharePct || 0);
        const pricing = stream.pricing || {};
        const pricePerKg = pricing['year' + year] || pricing.year1 || 0;
        yearRevenue = yearKg * pricePerKg;
      } else if (market.mode === 'direct') {
        const pricing = stream.pricing || {};
        const pricePerKg = pricing['year' + year] || pricing.year1 || 0;
        const directInput = market.directInput === 'kg' ? 'kg' : 'revenue';
        let directRevenue;
        if (directInput === 'kg') {
          // kg-driven: user enters kilos sold, revenue = kg × price.
          const kgY = market.kgByYear || {};
          yearKg = kgY['year' + year] || 0;
          directRevenue = yearKg * pricePerKg;
        } else {
          // $-driven: user enters revenue, derive kg from price if set.
          const rev = market.revenueByYear || {};
          directRevenue = rev['year' + year] || 0;
          yearKg = pricePerKg > 0 ? directRevenue / pricePerKg : 0;
        }
        // Commission income: rate × deal value flowing through a third party.
        // No kg component — it's a fee, not a product sale.
        let commissionRevenue = 0;
        const comm = stream.commission;
        if (comm && comm.enabled) {
          const rate = (comm.rateByYear || {})['year' + year] || 0;
          commissionRevenue = directRevenue * rate;
        }
        yearRevenue = directRevenue + commissionRevenue;
      }

      const qDist = Array.isArray(cfg.qDist) ? cfg.qDist : [0.25, 0.25, 0.25, 0.25];
      for (let q = 0; q < 4; q++) {
        const monthlyRev = (yearRevenue * (qDist[q] || 0)) / 3;
        const monthlyKg = (yearKg * (qDist[q] || 0)) / 3;
        const baseMonth = (year * 12) + (q * 3);
        for (let i = 0; i < 3; i++) {
          const m = baseMonth + i;
          if (m >= (stream.startMonth || 0) && m < MONTHS_TOTAL) {
            stripe[m] = monthlyRev;
            kgStripe[m] = monthlyKg;
          }
        }
      }
    }

    monthly.byStream[stream.id] = stripe;
    monthly.kgByStream[stream.id] = kgStripe;
    for (let m = 0; m < MONTHS_TOTAL; m++) {
      monthly.total[m] += stripe[m];
      monthly.kgTotal[m] += kgStripe[m];
    }
  }

  return monthly;
}

// ──────────────────────────────────────────────────────────────
// Layer 4: COGS
// ──────────────────────────────────────────────────────────────
function computeCOGS(cogsAssumptions, production, revenue, streams) {
  const modeledHempCostPerKilo =
    (cogsAssumptions.hempCostPerKilo * (1 + cogsAssumptions.hempContingencyPct)) +
    cogsAssumptions.hempShippingPerKilo;

  const monthly = {
    manufacturing: production.monthlyManufacturingCost,
    hemp: new Array(MONTHS_TOTAL).fill(0),
    biochar: production.monthlyBiocharCost,
    // Per-stream post-processing premium: kg sold via stream s, multiplied
    // by the per-kg fully-loaded raw-graphene cost (hemp + biochar + mfg),
    // multiplied by the stream's processingPremiumPct. Aggregates across
    // streams into one COGS line. Zero when no stream has a premium set or
    // no kg are sold through such a stream.
    processingPremium: new Array(MONTHS_TOTAL).fill(0),
    total: new Array(MONTHS_TOTAL).fill(0)
  };

  const totalKg = production.monthlyGrapheneKg;
  const kgByStream = (revenue && revenue.kgByStream) || {};
  const streamList = Array.isArray(streams) ? streams : [];

  for (let m = 0; m < MONTHS_TOTAL; m++) {
    monthly.hemp[m] = production.monthlyHempKg[m] * modeledHempCostPerKilo;

    const baseRawCost = monthly.manufacturing[m] + monthly.hemp[m] + monthly.biochar[m];
    if (totalKg[m] > 0 && streamList.length > 0) {
      const baseCostPerKg = baseRawCost / totalKg[m];
      let premiumSum = 0;
      for (const s of streamList) {
        const pct = (s && typeof s.processingPremiumPct === 'number') ? s.processingPremiumPct : 0;
        if (pct === 0) continue;
        const kgStripe = kgByStream[s.id];
        if (!Array.isArray(kgStripe)) continue;
        premiumSum += (kgStripe[m] || 0) * baseCostPerKg * pct;
      }
      monthly.processingPremium[m] = premiumSum;
    }

    monthly.total[m] = baseRawCost + monthly.processingPremium[m];
  }

  return monthly;
}

// ──────────────────────────────────────────────────────────────
// Layer 5: OPEX
// ──────────────────────────────────────────────────────────────
function computeOPEX(opex, rnd, grossMarginMonthly) {
  const monthly = {
    staffing: new Array(MONTHS_TOTAL).fill(0),
    benefits: new Array(MONTHS_TOTAL).fill(0),
    generalOverhead: new Array(MONTHS_TOTAL).fill(0),
    rnd: new Array(MONTHS_TOTAL).fill(0),
    legal: new Array(MONTHS_TOTAL).fill(0),
    uofaRoyalty: new Array(MONTHS_TOTAL).fill(0),
    salesCommission: new Array(MONTHS_TOTAL).fill(0),
    businessInsurance: new Array(MONTHS_TOTAL).fill(0),
    contingency: new Array(MONTHS_TOTAL).fill(0),
    total: new Array(MONTHS_TOTAL).fill(0)
  };
  const contingencyPct = typeof opex.contingencyPct === 'number' ? opex.contingencyPct : 0;

  const staffYears = Array.from({ length: YEARS_TOTAL }, (_, y) => opex.staffing['year' + y]);
  const legalYears = Array.from({ length: YEARS_TOTAL }, (_, y) => 'year' + y);

  for (let m = 0; m < MONTHS_TOTAL; m++) {
    const year = getYear(m);
    const q = getQuarterInYear(m);
    const staffYear = staffYears[year];

    if (staffYear) {
      // Staffing: count * annualSalary / 4 (quarterly) / 3 (monthly)
      let staffTotal = 0;
      for (const role of ['operational', 'sales', 'executive']) {
        const roleData = staffYear[role];
        if (!roleData) continue;
        const count = roleData.count[q];
        const salary = Array.isArray(roleData.salary) ? roleData.salary[q] : roleData.salary;
        staffTotal += count * salary / 4;
      }
      monthly.staffing[m] = staffTotal / 3;
    }

    // Benefits
    monthly.benefits[m] = monthly.staffing[m] * opex.benefitsPct;
    // Benefits start in Year 0 Q2 M3 (month 2) per spreadsheet -- first 2 months have no benefits
    if (m < 2) monthly.benefits[m] = 0;

    // General Overhead
    const ohGrowth = opex.generalOverhead.growthByYear[year] || 1.0;
    monthly.generalOverhead[m] = (opex.generalOverhead.base * ohGrowth) / 12;

    // R&D
    const rndYear = rnd['year' + year];
    if (rndYear) {
      monthly.rnd[m] = rndYear[q] / 3;
    }

    // Legal (patent + corporate combined)
    const yearKey = legalYears[year];
    const patentQ = opex.legal.patent[yearKey];
    const corpQ = opex.legal.corporate[yearKey];
    if (patentQ && corpQ) {
      monthly.legal[m] = (patentQ[q] + corpQ[q]) / 3;
    }

    // UofA Royalty: 6% of gross margin (only when positive)
    if (grossMarginMonthly[m] > 0) {
      monthly.uofaRoyalty[m] = grossMarginMonthly[m] * opex.uofaRoyaltyPct;
    }

    // Sales Commission: 5.5% of gross margin (only when revenue > 0 and margin > 0)
    // Spreadsheet starts this from Year 1 Q2 (month 15) onwards
    if (m >= 15 && grossMarginMonthly[m] > 0) {
      monthly.salesCommission[m] = grossMarginMonthly[m] * opex.salesCommissionPct;
    }

    // Business Insurance (once per year, first month of year)
    if (m % 12 === 0) {
      monthly.businessInsurance[m] = opex.businessInsurance[year] || 0;
    }
    // Spreadsheet also has a second insurance payment in Year 1 at month 14 (Q1 M3)
    // O28: 100000, Q28: 100000 -- paid twice in Year 1? Actually looking at data:
    // O28=100000, P28=0, Q28=100000 -- this seems like a quirk. For now, single annual payment.

    // Total OPEX: base subtotal + flat contingency uplift (% of base).
    // Contingency is computed off the base so doubling-up is impossible.
    const baseOpex = monthly.staffing[m] + monthly.benefits[m] +
      monthly.generalOverhead[m] + monthly.rnd[m] + monthly.legal[m] +
      monthly.uofaRoyalty[m] + monthly.salesCommission[m] + monthly.businessInsurance[m];
    monthly.contingency[m] = baseOpex * contingencyPct;
    monthly.total[m] = baseOpex + monthly.contingency[m];
  }

  return monthly;
}

// ──────────────────────────────────────────────────────────────
// Layer 6: Assemble Outlook (P&L)
// ──────────────────────────────────────────────────────────────
function assembleOutlook(revenue, cogs, opex, production, capital, capexLab, streams) {
  const monthly = {
    revenue: revenue.total,
    cogs: cogs.total,
    cogsManufacturing: cogs.manufacturing,
    cogsHemp: cogs.hemp,
    cogsBiochar: cogs.biochar,
    cogsProcessingPremium: cogs.processingPremium,
    grossMargin: new Array(MONTHS_TOTAL).fill(0),
    grossMarginPct: new Array(MONTHS_TOTAL).fill(0),
    opex: opex.total,
    opexStaffing: opex.staffing,
    opexBenefits: opex.benefits,
    opexOverhead: opex.generalOverhead,
    opexRnd: opex.rnd,
    opexLegal: opex.legal,
    opexRoyalty: opex.uofaRoyalty,
    opexCommission: opex.salesCommission,
    opexInsurance: opex.businessInsurance,
    opexContingency: opex.contingency,
    ebitda: new Array(MONTHS_TOTAL).fill(0),
    capex: new Array(MONTHS_TOTAL).fill(0),
    capexMachinery: production.monthlyCapex,
    capexLab: new Array(MONTHS_TOTAL).fill(0),
    capitalRaised: new Array(MONTHS_TOTAL).fill(0),
    cashFlow: new Array(MONTHS_TOTAL).fill(0),
    cumulativeCash: new Array(MONTHS_TOTAL).fill(0),
    // kg series — production capacity vs sales demand. Surfaced so the UI
    // can compare "what we can make" against "what we plan to sell."
    productionCapacityKg: production.monthlyGrapheneKg,
    demandKgTotal: revenue.kgTotal || new Array(MONTHS_TOTAL).fill(0),
    capacityShortfallKg: new Array(MONTHS_TOTAL).fill(0)
  };

  // CapEx Lab (R&D equipment)
  if (capexLab) {
    for (let year = 0; year < YEARS_TOTAL; year++) {
      const yearData = capexLab['year' + year];
      if (!yearData) continue;
      for (let q = 0; q < 4; q++) {
        const monthlyVal = yearData[q] / 3;
        for (let i = 0; i < 3; i++) {
          const m = year * 12 + q * 3 + i;
          if (m < MONTHS_TOTAL) {
            monthly.capexLab[m] = monthlyVal;
          }
        }
      }
    }
  }

  // Capital raised
  if (capital.raises) {
    for (const raise of capital.raises) {
      if (raise.month >= 0 && raise.month < MONTHS_TOTAL) {
        monthly.capitalRaised[raise.month] += raise.amount;
      }
    }
  }

  // Compute derived rows
  for (let m = 0; m < MONTHS_TOTAL; m++) {
    monthly.grossMargin[m] = monthly.revenue[m] - monthly.cogs[m];
    monthly.grossMarginPct[m] = monthly.revenue[m] > 0
      ? monthly.grossMargin[m] / monthly.revenue[m]
      : 0;
    monthly.ebitda[m] = monthly.grossMargin[m] - monthly.opex[m];
    monthly.capex[m] = monthly.capexMachinery[m] + monthly.capexLab[m];
    monthly.cashFlow[m] = monthly.ebitda[m] + monthly.capitalRaised[m] - monthly.capex[m];
  }

  // Cumulative cash
  let running = capital.startingCash + (capital.initialInvestment || 0);
  for (let m = 0; m < MONTHS_TOTAL; m++) {
    running += monthly.cashFlow[m];
    monthly.cumulativeCash[m] = running;
  }

  // Per-stream revenue series. Keyed `revenueStream_<id>` so they get
  // picked up automatically by aggregateViews() and downstream UI loops
  // that walk Object.keys(outlook) won't trip over a nested object.
  if (Array.isArray(streams) && revenue && revenue.byStream) {
    for (const s of streams) {
      monthly['revenueStream_' + s.id] = revenue.byStream[s.id] || new Array(MONTHS_TOTAL).fill(0);
      monthly['demandKg_' + s.id] = (revenue.kgByStream && revenue.kgByStream[s.id]) || new Array(MONTHS_TOTAL).fill(0);
    }
  }

  // Capacity shortfall (positive = demand exceeds capacity that month).
  for (let m = 0; m < MONTHS_TOTAL; m++) {
    const gap = monthly.demandKgTotal[m] - monthly.productionCapacityKg[m];
    monthly.capacityShortfallKg[m] = gap > 0 ? gap : 0;
  }

  return monthly;
}

// ──────────────────────────────────────────────────────────────
// Layer 7: Aggregate Views (Quarterly + Yearly)
// ──────────────────────────────────────────────────────────────
function aggregateViews(outlook) {
  const keys = Object.keys(outlook);
  const quarterly = {};
  const yearly = {};

  for (const key of keys) {
    if (!Array.isArray(outlook[key])) continue;

    // Quarterly: sum every 3 months
    quarterly[key] = [];
    for (let q = 0; q < QUARTERS_TOTAL; q++) {
      const base = q * 3;
      if (key === 'grossMarginPct') {
        const revSum = (outlook.revenue[base] || 0) + (outlook.revenue[base + 1] || 0) + (outlook.revenue[base + 2] || 0);
        const gmSum = (outlook.grossMargin[base] || 0) + (outlook.grossMargin[base + 1] || 0) + (outlook.grossMargin[base + 2] || 0);
        quarterly[key].push(revSum > 0 ? gmSum / revSum : 0);
      } else if (key === 'cumulativeCash') {
        // Running balance — end-of-quarter snapshot, not a sum
        quarterly[key].push(outlook[key][base + 2] || 0);
      } else {
        let sum = 0;
        for (let i = 0; i < 3; i++) sum += outlook[key][base + i] || 0;
        quarterly[key].push(sum);
      }
    }

    // Yearly: sum every 12 months
    yearly[key] = [];
    for (let y = 0; y < YEARS_TOTAL; y++) {
      const base = y * 12;
      if (key === 'grossMarginPct') {
        let revSum = 0, gmSum = 0;
        for (let i = 0; i < 12; i++) {
          revSum += outlook.revenue[base + i] || 0;
          gmSum += outlook.grossMargin[base + i] || 0;
        }
        yearly[key].push(revSum > 0 ? gmSum / revSum : 0);
      } else if (key === 'cumulativeCash') {
        // Running balance — end-of-year snapshot, not a sum
        yearly[key].push(outlook[key][base + 11] || 0);
      } else {
        let sum = 0;
        for (let i = 0; i < 12; i++) sum += outlook[key][base + i] || 0;
        yearly[key].push(sum);
      }
    }
  }

  return { quarterly, yearly };
}

// ──────────────────────────────────────────────────────────────
// Main Entry Point
// ──────────────────────────────────────────────────────────────
export function calculateProforma(assumptions) {
  // Idempotent shape upgrade — old DB blobs are reshaped into the
  // current schema (revenue.streams[]) before validation.
  migrateAssumptions(assumptions);

  const errors = validateAssumptions(assumptions);
  if (errors.length > 0) {
    throw new Error('Invalid assumptions: ' + errors.join('; '));
  }

  // Layer 1: Technical reference
  const techRef = deriveTechnical(assumptions.technical);

  // Layer 2: Production timeline
  const production = computeProduction(
    assumptions.machines,
    assumptions.production,
    assumptions.manufacturing
  );

  // Layer 3: Revenue
  const revenue = computeRevenue(assumptions.revenue, techRef);

  // Layer 4: COGS
  const cogs = computeCOGS(assumptions.cogs, production, revenue, assumptions.revenue?.streams);

  // Preliminary gross margin (needed for OPEX royalty/commission calculation)
  const grossMarginMonthly = new Array(MONTHS_TOTAL).fill(0);
  for (let m = 0; m < MONTHS_TOTAL; m++) {
    grossMarginMonthly[m] = revenue.total[m] - cogs.total[m];
  }

  // Layer 5: OPEX
  const opex = computeOPEX(
    assumptions.opex,
    assumptions.rnd,
    grossMarginMonthly
  );

  // Layer 6: Assemble Outlook (carries per-stream revenue series too)
  const outlook = assembleOutlook(
    revenue, cogs, opex, production,
    assumptions.capital, assumptions.capexLab,
    assumptions.revenue.streams
  );

  // Layer 7: Aggregate views
  const { quarterly, yearly } = aggregateViews(outlook);

  // Key metrics
  const breakEvenMonth = outlook.cumulativeCash.findIndex((v, i) => i > 0 && v > 0 && outlook.cumulativeCash[i - 1] <= 0);
  const peakCashNeed = Math.min(...outlook.cumulativeCash);
  const finalYearIdx = YEARS_TOTAL - 1;
  const y4Revenue = yearly.revenue[finalYearIdx] || 0;
  const y4Ebitda = yearly.ebitda[finalYearIdx] || 0;
  const y4EbitdaMargin = y4Revenue > 0 ? y4Ebitda / y4Revenue : 0;
  const totalCapex = yearly.capex.reduce((a, b) => a + b, 0);
  const peakMonthlyProductionKg = Math.max(...production.monthlyGrapheneKg);

  return {
    techRef,
    production: {
      monthlyGrapheneKg: production.monthlyGrapheneKg,
      monthlyHempKg: production.monthlyHempKg,
      machineTimelines: production.machineTimelines.map(mt => ({
        name: mt.name,
        type: mt.type,
        monthlyKg: mt.monthlyKg,
        monthlyOpCost: mt.monthlyOpCost,
        monthlyCapex: mt.monthlyCapex
      })),
      hempRatioMultiplier: production.hempRatioMultiplier,
      pilotMonthlyGrid: production.pilotMonthlyGrid,
      broderickMonthlyGrid: production.broderickMonthlyGrid,
      pilotMonthlyByPhase: production.pilotMonthlyByPhase,
      broderickMonthlyByPhase: production.broderickMonthlyByPhase
    },
    revenue,
    cogs,
    opex,
    outlook,
    quarterly,
    yearly,
    metrics: {
      breakEvenMonth,
      peakCashNeed,
      y4Revenue,
      y4Ebitda,
      y4EbitdaMargin,
      totalCapex,
      peakMonthlyProductionKg
    }
  };
}
