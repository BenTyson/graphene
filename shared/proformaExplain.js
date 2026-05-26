// ──────────────────────────────────────────────────────────────
// Cell explainer for the Outlook table.
//
// Given a (rowKey, periodIndex, view) tuple plus the full computed
// result and source assumptions, returns a structured explanation:
// formula text, the values of each input at that period, and (for
// aggregated views) the underlying monthly breakdown.
//
// Adding a new outlook row in assembleOutlook() means adding an
// entry to FORMULAS here. The boot-time drift guard
// (assertFormulasMatchOutlook) trips if a row is missing.
// ──────────────────────────────────────────────────────────────

import { MONTHS_TOTAL, YEARS_TOTAL } from './proformaDefaults.js';

// Period kinds: 'monthly' | 'quarterly' | 'yearly'.
// Returns the month-index range [start, endExclusive) that the period covers.
function periodMonthRange(view, periodIndex) {
  if (view === 'yearly') return [periodIndex * 12, Math.min((periodIndex + 1) * 12, MONTHS_TOTAL)];
  if (view === 'quarterly') return [periodIndex * 3, Math.min((periodIndex + 1) * 3, MONTHS_TOTAL)];
  return [periodIndex, periodIndex + 1];
}

function periodLabel(view, periodIndex) {
  if (view === 'yearly') return `Year ${periodIndex}`;
  if (view === 'quarterly') {
    const y = Math.floor(periodIndex / 4);
    const q = (periodIndex % 4) + 1;
    return `Y${y} Q${q}`;
  }
  const y = Math.floor(periodIndex / 12);
  const m = (periodIndex % 12) + 1;
  return `Y${y} M${m}`;
}

function monthLabel(m) {
  const y = Math.floor(m / 12);
  const mo = (m % 12) + 1;
  return `Y${y} M${mo}`;
}

// Pull a value from computed[view][key][periodIndex], falling back
// to summing the monthly array when the aggregate isn't present
// (e.g. a synthetic key that aggregateViews missed).
function readCell(computed, view, key, periodIndex) {
  const src = view === 'yearly' ? computed.yearly : view === 'quarterly' ? computed.quarterly : computed.outlook;
  if (src && Array.isArray(src[key])) return src[key][periodIndex] || 0;
  // Fallback: sum monthly
  const arr = computed.outlook && computed.outlook[key];
  if (!Array.isArray(arr)) return 0;
  const [a, b] = periodMonthRange(view, periodIndex);
  let s = 0;
  for (let m = a; m < b; m++) s += arr[m] || 0;
  return s;
}

function monthlyBreakdown(computed, key, view, periodIndex) {
  if (view === 'monthly') return null;
  const arr = computed.outlook && computed.outlook[key];
  if (!Array.isArray(arr)) return null;
  const [a, b] = periodMonthRange(view, periodIndex);
  const values = [];
  const labels = [];
  for (let m = a; m < b; m++) {
    values.push(arr[m] || 0);
    labels.push(monthLabel(m));
  }
  return { values, labels };
}

// ──────────────────────────────────────────────────────────────
// FORMULAS — one entry per outlook row key.
// Each entry returns:
//   { formula, parts, leafInputs?, note?, format }
// Where parts are { key, label, value, op } — op renders as the
// connector between this part and the next ('+' '-' '×' '÷').
// ──────────────────────────────────────────────────────────────

// Helper to resolve a stream by id for dynamic keys.
function findStream(assumptions, streamId) {
  const streams = assumptions?.revenue?.streams || [];
  return streams.find(s => s.id === streamId) || null;
}

// Yearly index for a monthly cell (or for the first month of a Q/Y bucket).
function yearOfMonth(m) { return Math.floor(m / 12); }

// How many months of `year` fall inside [a, b)? Used by aggregation-aware
// explainers that need to weight per-year contributions to a multi-year period.
function countMonthsInYearWithin(a, b, year) {
  const ys = year * 12;
  const ye = ys + 12;
  const lo = Math.max(a, ys);
  const hi = Math.min(b, ye);
  return Math.max(0, hi - lo);
}

const FORMULAS = {
  // ── Sales ──
  revenue: (ctx) => {
    const { computed, assumptions, view, periodIndex } = ctx;
    const streams = (assumptions?.revenue?.streams || []).filter(s => s.enabled !== false);
    return {
      format: 'currency',
      formula: 'Σ revenue from all enabled streams',
      parts: streams.map((s, i) => ({
        key: 'revenueStream_' + s.id,
        label: s.name,
        value: readCell(computed, view, 'revenueStream_' + s.id, periodIndex),
        op: i === streams.length - 1 ? '' : '+'
      }))
    };
  },

  // Per-stream revenue: linked-mode vs direct-mode have different formulas.
  // Handled below by the prefix matcher; falls through to a leaf-style explainer.

  // ── COGS ──
  cogs: (ctx) => ({
    format: 'currency',
    formula: 'Manufacturing + Hemp + Biochar + Processing premium',
    parts: [
      { key: 'cogsManufacturing', label: 'Manufacturing', value: readCell(ctx.computed, ctx.view, 'cogsManufacturing', ctx.periodIndex), op: '+' },
      { key: 'cogsHemp', label: 'Hemp', value: readCell(ctx.computed, ctx.view, 'cogsHemp', ctx.periodIndex), op: '+' },
      { key: 'cogsBiochar', label: 'Biochar', value: readCell(ctx.computed, ctx.view, 'cogsBiochar', ctx.periodIndex), op: '+' },
      { key: 'cogsProcessingPremium', label: 'Processing premium', value: readCell(ctx.computed, ctx.view, 'cogsProcessingPremium', ctx.periodIndex), op: '' }
    ]
  }),

  cogsManufacturing: (ctx) => {
    const { computed, view, periodIndex, assumptions } = ctx;
    const [a, b] = periodMonthRange(view, periodIndex);
    // Per-machine contribution at this period (sum over months in range).
    const machines = computed.production?.machineTimelines || [];
    const perMachine = machines.map(mt => {
      let s = 0;
      for (let m = a; m < b; m++) s += mt.monthlyOpCost[m] || 0;
      return { name: mt.name, type: mt.type, value: s };
    }).filter(x => x.value > 0);

    const mfg = assumptions?.manufacturing;
    return {
      format: 'currency',
      formula: 'Σ (machine op-cost) where op-cost = labor·shifts × (1 + maintenance %) × efficiency',
      parts: perMachine.map((m, i) => ({
        key: null,
        label: `${m.name} (${m.type})`,
        value: m.value,
        op: i === perMachine.length - 1 ? '' : '+'
      })),
      leafInputs: mfg ? [
        { label: 'FTE roles', value: (mfg.fteRoles || []).map(r => `${r.count}× ${r.name} @ $${Math.round(r.monthlyCost).toLocaleString()}/mo`).join(', '), section: 'operations' },
        { label: 'Shifts per month', value: mfg.shiftsPerMonth, section: 'operations' },
        { label: 'Maintenance contingency', value: `${(mfg.maintenanceContingencyPct * 100).toFixed(1)}%`, section: 'operations' },
        { label: 'Validation phase monthly cost', value: `$${Math.round(mfg.validationPhaseMonthly).toLocaleString()}`, section: 'operations' }
      ] : null
    };
  },

  cogsHemp: (ctx) => {
    const { computed, assumptions, view, periodIndex } = ctx;
    const [a, b] = periodMonthRange(view, periodIndex);
    let hempKg = 0;
    for (let m = a; m < b; m++) hempKg += computed.production?.monthlyHempKg?.[m] || 0;
    const cogs = assumptions?.cogs || {};
    const modeledPerKg = (cogs.hempCostPerKilo || 0) * (1 + (cogs.hempContingencyPct || 0)) + (cogs.hempShippingPerKilo || 0);
    return {
      format: 'currency',
      formula: 'hemp_kg × (hempCostPerKilo × (1 + contingency) + shipping)',
      parts: [
        { key: null, label: 'Hemp kg consumed', value: hempKg, op: '×', format: 'kg' },
        { key: null, label: 'Modeled $/kg', value: modeledPerKg, op: '=', format: 'pricePerKg' }
      ],
      leafInputs: [
        { label: 'Hemp cost per kilo', value: `$${(cogs.hempCostPerKilo || 0).toFixed(2)}`, section: 'costs' },
        { label: 'Hemp contingency %', value: `${((cogs.hempContingencyPct || 0) * 100).toFixed(1)}%`, section: 'costs' },
        { label: 'Hemp shipping per kilo', value: `$${(cogs.hempShippingPerKilo || 0).toFixed(2)}`, section: 'costs' }
      ]
    };
  },

  cogsProcessingPremium: (ctx) => {
    const { computed, assumptions, view, periodIndex } = ctx;
    const [a, b] = periodMonthRange(view, periodIndex);
    const streams = assumptions?.revenue?.streams || [];
    const kgByStream = computed.revenue?.kgByStream || {};
    const totalKg = computed.production?.monthlyGrapheneKg || [];
    const mfg = computed.cogs?.manufacturing || [];
    const hemp = computed.cogs?.hemp || [];
    const biochar = computed.cogs?.biochar || [];

    // Per-year pct resolver: tolerates scalar / object / missing shapes.
    const resolve = (s, year) => {
      const p = s && s.processingPremiumPct;
      if (typeof p === 'number') return p;
      if (p && typeof p === 'object') return p['year' + year] || 0;
      return 0;
    };

    // Aggregate base raw cost over the period (for the indicator).
    let periodBaseCost = 0, periodKg = 0;
    for (let m = a; m < b; m++) {
      periodBaseCost += (mfg[m] || 0) + (hemp[m] || 0) + (biochar[m] || 0);
      periodKg += totalKg[m] || 0;
    }
    const baseCostPerKg = periodKg > 0 ? periodBaseCost / periodKg : 0;

    // Per-stream rows: rebuild the engine's sum per stream over the period,
    // resolving the year-specific pct each month.
    const streamRows = [];
    for (const s of streams) {
      const kgStripe = kgByStream[s.id] || [];
      let streamPremium = 0, streamKg = 0;
      const pctsUsed = new Set();
      for (let m = a; m < b; m++) {
        const kg = kgStripe[m] || 0;
        if (kg === 0) continue;
        const y = yearOfMonth(m);
        const pct = resolve(s, y);
        if (pct === 0) continue;
        const monthBaseKg = totalKg[m] || 0;
        const monthBaseCost = (mfg[m] || 0) + (hemp[m] || 0) + (biochar[m] || 0);
        const monthBasePerKg = monthBaseKg > 0 ? monthBaseCost / monthBaseKg : 0;
        streamPremium += kg * monthBasePerKg * pct;
        streamKg += kg;
        pctsUsed.add((pct * 100).toFixed(1) + '%');
      }
      if (streamPremium === 0) continue;
      streamRows.push({
        label: `${s.name}: ${streamKg.toFixed(0)} kg @ ${[...pctsUsed].join('/')}`,
        value: streamPremium
      });
    }

    return {
      format: 'currency',
      formula: 'Σ (streamKg × monthly base $/kg × year-resolved processingPremiumPct)',
      parts: streamRows.length
        ? streamRows.map((r, i) => ({ key: null, label: r.label, value: r.value, op: i === streamRows.length - 1 ? '' : '+' }))
        : [{ key: null, label: 'No streams with a non-zero processing premium have kg sold this period', value: 0, op: '' }],
      leafInputs: [
        { label: 'Base raw $/kg this period', value: `$${baseCostPerKg.toFixed(2)}`, section: 'costs' },
        { label: 'Premiums by stream (Y0–Y4)', value: streams.map(s => {
            const p = s.processingPremiumPct;
            if (!p) return null;
            const vals = (typeof p === 'object')
              ? [0,1,2,3,4].map(y => ((p['year' + y] || 0) * 100).toFixed(1) + '%').join('/')
              : `${(p * 100).toFixed(1)}% (flat)`;
            const isNonZero = (typeof p === 'object')
              ? [0,1,2,3,4].some(y => (p['year' + y] || 0) > 0)
              : (p > 0);
            return isNonZero ? `${s.name}: ${vals}` : null;
          }).filter(Boolean).join(' · ') || 'none', section: 'revenue' }
      ]
    };
  },

  cogsBiochar: (ctx) => {
    const { computed, assumptions, view, periodIndex } = ctx;
    const [a, b] = periodMonthRange(view, periodIndex);
    let grapheneKg = 0;
    for (let m = a; m < b; m++) grapheneKg += computed.production?.monthlyGrapheneKg?.[m] || 0;
    const p = assumptions?.production || {};
    const biocharKg = (p.grapheneYieldPercent || 1) > 0 ? grapheneKg / p.grapheneYieldPercent : 0;
    const mfg = assumptions?.manufacturing || {};
    return {
      format: 'currency',
      formula: '(graphene_kg ÷ grapheneYieldPct) × biocharCostPerKilo[year,quarter]',
      parts: [
        { key: null, label: 'Graphene produced (kg)', value: grapheneKg, op: '÷', format: 'kg' },
        { key: null, label: 'Graphene yield %', value: `${((p.grapheneYieldPercent || 0) * 100).toFixed(2)}%`, op: '×' },
        { key: null, label: 'Implied biochar consumed (kg)', value: biocharKg, op: '', format: 'kg' }
      ],
      leafInputs: [
        { label: 'Biochar $/kg by year', value: (mfg.biocharCostByYear || []).map((y, i) => {
          const overrides = Array.isArray(y?.quarters) ? y.quarters.filter(q => q !== null).length : 0;
          return `Y${i}: $${y?.perKilo ?? 0}${overrides ? ` (${overrides} Q override${overrides === 1 ? '' : 's'})` : ''}`;
        }).join(' · '), section: 'costs' }
      ]
    };
  },

  // ── Margin ──
  grossMargin: (ctx) => ({
    format: 'currency',
    formula: 'revenue − COGS',
    parts: [
      { key: 'revenue', label: 'Revenue', value: readCell(ctx.computed, ctx.view, 'revenue', ctx.periodIndex), op: '−' },
      { key: 'cogs', label: 'COGS', value: readCell(ctx.computed, ctx.view, 'cogs', ctx.periodIndex), op: '' }
    ]
  }),

  grossMarginPct: (ctx) => {
    const { computed, view, periodIndex } = ctx;
    const rev = readCell(computed, view, 'revenue', periodIndex);
    const gm = readCell(computed, view, 'grossMargin', periodIndex);
    return {
      format: 'percent',
      formula: view === 'monthly' ? 'grossMargin ÷ revenue' : 'Σ grossMargin ÷ Σ revenue (weighted across period)',
      parts: [
        { key: 'grossMargin', label: 'Gross Margin', value: gm, op: '÷' },
        { key: 'revenue', label: 'Revenue', value: rev, op: '' }
      ],
      note: view !== 'monthly' ? 'Weighted by revenue, not an average of monthly %.' : null
    };
  },

  // ── OPEX ──
  opex: (ctx) => {
    const parts = [
      ['opexStaffing', 'Staffing'],
      ['opexBenefits', 'Benefits'],
      ['opexOverhead', 'Overhead'],
      ['opexRnd', 'R&D'],
      ['opexLegal', 'Legal'],
      ['opexRoyalty', 'Royalty'],
      ['opexCommission', 'Commission'],
      ['opexInsurance', 'Insurance'],
      ['opexContingency', 'Contingency']
    ];
    return {
      format: 'currency',
      formula: 'Σ all OPEX line items',
      parts: parts.map(([k, label], i) => ({
        key: k,
        label,
        value: readCell(ctx.computed, ctx.view, k, ctx.periodIndex),
        op: i === parts.length - 1 ? '' : '+'
      }))
    };
  },

  opexStaffing: (ctx) => {
    const { assumptions, view, periodIndex } = ctx;
    const [a, b] = periodMonthRange(view, periodIndex);
    // Show the roles' contribution at the FIRST month in the period
    // (staffing is constant within a quarter; for a yearly view we show Q1
    // and note that other quarters may differ).
    const m0 = a;
    const year = yearOfMonth(m0);
    const q = Math.floor((m0 % 12) / 3);
    const staff = assumptions?.opex?.staffing?.['year' + year];
    const rolePartsRaw = [];
    if (staff) {
      for (const role of ['operational', 'sales', 'executive']) {
        const rd = staff[role];
        if (!rd) continue;
        const count = rd.count?.[q] || 0;
        const salary = Array.isArray(rd.salary) ? rd.salary[q] : rd.salary;
        if (count > 0) rolePartsRaw.push({ role, count, salary, q });
      }
    }
    return {
      format: 'currency',
      formula: 'Σroles (count × salary ÷ 4) ÷ 3 — per month within each quarter',
      parts: rolePartsRaw.map((p, i) => ({
        key: null,
        label: `${p.role}: ${p.count} × $${Math.round(p.salary).toLocaleString()}/yr`,
        value: (p.count * p.salary) / 12,
        op: i === rolePartsRaw.length - 1 ? '' : '+'
      })),
      note: view === 'yearly'
        ? `Showing Q1 of Year ${year} — quarters can differ.`
        : null
    };
  },

  opexBenefits: (ctx) => {
    const { computed, assumptions, view, periodIndex } = ctx;
    const staff = readCell(computed, view, 'opexStaffing', periodIndex);
    const pct = assumptions?.opex?.benefitsPct || 0;
    return {
      format: 'currency',
      formula: 'staffing × benefitsPct  (zero in months 0–1)',
      parts: [
        { key: 'opexStaffing', label: 'Staffing', value: staff, op: '×' },
        { key: null, label: 'Benefits %', value: `${(pct * 100).toFixed(1)}%`, op: '' }
      ]
    };
  },

  opexOverhead: (ctx) => {
    const { assumptions, view, periodIndex } = ctx;
    const [a, b] = periodMonthRange(view, periodIndex);
    const oh = assumptions?.opex?.generalOverhead;
    const base = oh?.base || 0;
    // Sum the actual monthly contributions inside the period so the parts
    // are real $ figures, not display gymnastics.
    const yearBuckets = new Map();
    for (let m = a; m < b; m++) {
      const y = yearOfMonth(m);
      const growth = oh?.growthByYear?.[y] || 1;
      const monthly = (base * growth) / 12;
      yearBuckets.set(y, (yearBuckets.get(y) || 0) + monthly);
    }
    const yearList = [...yearBuckets.entries()].sort((p, q) => p[0] - q[0]);
    return {
      format: 'currency',
      formula: 'monthly = base × growthByYear[year] ÷ 12  — summed across months in period',
      parts: yearList.map(([y, amt], i) => ({
        key: null,
        label: `Y${y} (base $${Math.round(base).toLocaleString()} × ${(oh?.growthByYear?.[y] || 1).toFixed(2)}× ÷ 12, ${countMonthsInYearWithin(a, b, y)} mo)`,
        value: amt,
        op: i === yearList.length - 1 ? '' : '+'
      })),
      leafInputs: [
        { label: 'Base annual overhead', value: '$' + Math.round(base).toLocaleString(), section: 'costs' },
        { label: 'Growth by year', value: (oh?.growthByYear || []).map((g, y) => `Y${y}: ${g.toFixed(2)}×`).join(' · '), section: 'costs' }
      ]
    };
  },

  opexRnd: (ctx) => {
    const { assumptions, view, periodIndex } = ctx;
    const [a, b] = periodMonthRange(view, periodIndex);
    // Group contributions by (year, quarter). Each quarter's full amount is
    // spread evenly over its 3 months, so each month in [a, b) contributes
    // qAmount / 3 to its quarter's bucket.
    const buckets = new Map(); // key "y_q" → { y, q, monthsHit, total }
    for (let m = a; m < b; m++) {
      const year = yearOfMonth(m);
      const q = Math.floor((m % 12) / 3);
      const qVal = assumptions?.rnd?.['year' + year]?.[q] || 0;
      const key = year + '_' + q;
      const cur = buckets.get(key) || { y: year, q, qAmount: qVal, monthsHit: 0, total: 0 };
      cur.monthsHit += 1;
      cur.total += qVal / 3;
      buckets.set(key, cur);
    }
    const list = [...buckets.values()].filter(b2 => b2.qAmount > 0);
    return {
      format: 'currency',
      formula: 'Σ quarters: quarterlyAmount × (months_in_quarter_hit ÷ 3)',
      parts: list.map((b2, i) => ({
        key: null,
        label: `Y${b2.y} Q${b2.q + 1} ($${Math.round(b2.qAmount).toLocaleString()}/qtr × ${b2.monthsHit}/3 mo)`,
        value: b2.total,
        op: i === list.length - 1 ? '' : '+'
      })),
      note: list.length === 0 ? 'No R&D scheduled in this period.' : null
    };
  },

  opexLegal: (ctx) => {
    const { assumptions, view, periodIndex } = ctx;
    const [a, b] = periodMonthRange(view, periodIndex);
    const legal = assumptions?.opex?.legal || {};
    let patentTotal = 0, corpTotal = 0;
    for (let m = a; m < b; m++) {
      const year = yearOfMonth(m);
      const q = Math.floor((m % 12) / 3);
      patentTotal += (legal.patent?.['year' + year]?.[q] || 0) / 3;
      corpTotal += (legal.corporate?.['year' + year]?.[q] || 0) / 3;
    }
    return {
      format: 'currency',
      formula: '(patent + corporate) ÷ 3 — quarterly schedules, spread per month',
      parts: [
        { key: null, label: 'Patent legal', value: patentTotal, op: '+' },
        { key: null, label: 'Corporate legal', value: corpTotal, op: '' }
      ]
    };
  },

  opexRoyalty: (ctx) => {
    const { computed, assumptions, view, periodIndex } = ctx;
    const gm = readCell(computed, view, 'grossMargin', periodIndex);
    const pct = assumptions?.opex?.uofaRoyaltyPct || 0;
    return {
      format: 'currency',
      formula: 'max(0, grossMargin) × uofaRoyaltyPct  — zero in months with GM ≤ 0',
      parts: [
        { key: 'grossMargin', label: 'Gross Margin', value: gm, op: '×' },
        { key: null, label: 'Royalty rate', value: `${(pct * 100).toFixed(2)}%`, op: '' }
      ],
      note: view !== 'monthly' ? 'Months with GM ≤ 0 contribute $0 — period total may differ from the simple product.' : null
    };
  },

  opexCommission: (ctx) => {
    const { computed, assumptions, view, periodIndex } = ctx;
    const gm = readCell(computed, view, 'grossMargin', periodIndex);
    const pct = assumptions?.opex?.salesCommissionPct || 0;
    return {
      format: 'currency',
      formula: 'max(0, grossMargin) × salesCommissionPct  — from month 15 onward',
      parts: [
        { key: 'grossMargin', label: 'Gross Margin', value: gm, op: '×' },
        { key: null, label: 'Commission rate', value: `${(pct * 100).toFixed(2)}%`, op: '' }
      ]
    };
  },

  opexInsurance: (ctx) => {
    const { assumptions, view, periodIndex } = ctx;
    const [a, b] = periodMonthRange(view, periodIndex);
    const ins = assumptions?.opex?.businessInsurance || [];
    const payments = [];
    for (let m = a; m < b; m++) {
      if (m % 12 === 0) {
        const y = yearOfMonth(m);
        const amt = ins[y] || 0;
        if (amt) payments.push({ label: `Y${y} M1 payment`, value: amt });
      }
    }
    return {
      format: 'currency',
      formula: 'Lump-sum at month 0 of each year',
      parts: payments.map((p, i) => ({ key: null, label: p.label, value: p.value, op: i === payments.length - 1 ? '' : '+' })),
      note: payments.length === 0 ? 'No insurance payment in this period.' : null
    };
  },

  opexContingency: (ctx) => {
    const { assumptions, computed, view, periodIndex } = ctx;
    const [a, b] = periodMonthRange(view, periodIndex);
    const cPct = assumptions?.opex?.contingencyPct;
    const pctByYear = Array.isArray(cPct) ? cPct : (typeof cPct === 'number' ? [cPct, cPct, cPct, cPct, cPct] : [0, 0, 0, 0, 0]);

    // Sum base OPEX & contingency over the period, year-by-year (a period
    // can span multiple years in the yearly view but normally won't here).
    let periodBase = 0;
    let periodContingency = 0;
    const yearsHit = new Set();
    for (let m = a; m < b; m++) {
      const y = yearOfMonth(m);
      yearsHit.add(y);
      const monthBase = (computed.opex?.staffing?.[m] || 0) + (computed.opex?.benefits?.[m] || 0)
        + (computed.opex?.generalOverhead?.[m] || 0) + (computed.opex?.rnd?.[m] || 0)
        + (computed.opex?.legal?.[m] || 0) + (computed.opex?.uofaRoyalty?.[m] || 0)
        + (computed.opex?.salesCommission?.[m] || 0) + (computed.opex?.businessInsurance?.[m] || 0);
      periodBase += monthBase;
      periodContingency += monthBase * (pctByYear[y] || 0);
    }
    const yearsLabel = [...yearsHit].sort().map(y => `Y${y}: ${((pctByYear[y] || 0) * 100).toFixed(2)}%`).join(' · ');
    return {
      format: 'currency',
      formula: 'Σ (monthly base OPEX × year-resolved contingencyPct)',
      parts: [
        { key: null, label: 'Base OPEX over period', value: periodBase, op: '×' },
        { key: null, label: 'Year-resolved contingency %', value: yearsLabel || '0%', op: '' }
      ],
      leafInputs: [
        { label: 'Contingency by year', value: pctByYear.map((p, y) => `Y${y}: ${(p * 100).toFixed(2)}%`).join(' · '), section: 'opex' }
      ]
    };
  },

  // ── EBITDA ──
  ebitda: (ctx) => ({
    format: 'currency',
    formula: 'grossMargin − OPEX',
    parts: [
      { key: 'grossMargin', label: 'Gross Margin', value: readCell(ctx.computed, ctx.view, 'grossMargin', ctx.periodIndex), op: '−' },
      { key: 'opex', label: 'OPEX', value: readCell(ctx.computed, ctx.view, 'opex', ctx.periodIndex), op: '' }
    ]
  }),

  // ── CapEx ──
  capex: (ctx) => ({
    format: 'currency',
    formula: 'capexMachinery + capexLab',
    parts: [
      { key: 'capexMachinery', label: 'Machinery', value: readCell(ctx.computed, ctx.view, 'capexMachinery', ctx.periodIndex), op: '+' },
      { key: 'capexLab', label: 'Lab/R&D', value: readCell(ctx.computed, ctx.view, 'capexLab', ctx.periodIndex), op: '' }
    ]
  }),

  capexMachinery: (ctx) => {
    const { computed, assumptions, view, periodIndex } = ctx;
    const [a, b] = periodMonthRange(view, periodIndex);
    const machines = assumptions?.machines || [];
    const contribs = [];
    for (const machine of machines) {
      let amt = 0;
      for (const pay of machine.payments || []) {
        if (pay.month >= a && pay.month < b) amt += (machine.cost || 0) * (pay.pct || 0);
      }
      if (amt > 0) contribs.push({ name: machine.name, value: amt });
    }
    return {
      format: 'currency',
      formula: 'Σ machines (cost × payment_pct) where payment falls in period',
      parts: contribs.map((c, i) => ({ key: null, label: c.name, value: c.value, op: i === contribs.length - 1 ? '' : '+' })),
      note: contribs.length === 0 ? 'No machine payments in this period.' : null
    };
  },

  capexLab: (ctx) => {
    const { assumptions, view, periodIndex } = ctx;
    const [a, b] = periodMonthRange(view, periodIndex);
    const lab = assumptions?.capexLab || {};
    const buckets = new Map();
    for (let m = a; m < b; m++) {
      const year = yearOfMonth(m);
      const q = Math.floor((m % 12) / 3);
      const qAmt = lab['year' + year]?.[q] || 0;
      if (!qAmt) continue;
      const key = year + '_' + q;
      const cur = buckets.get(key) || { y: year, q, qAmount: qAmt, monthsHit: 0, total: 0 };
      cur.monthsHit += 1;
      cur.total += qAmt / 3;
      buckets.set(key, cur);
    }
    const list = [...buckets.values()];
    return {
      format: 'currency',
      formula: 'Σ quarters: quarterlyAmount × (months_in_quarter_hit ÷ 3)',
      parts: list.map((b2, i) => ({
        key: null,
        label: `Y${b2.y} Q${b2.q + 1} ($${Math.round(b2.qAmount).toLocaleString()}/qtr × ${b2.monthsHit}/3 mo)`,
        value: b2.total,
        op: i === list.length - 1 ? '' : '+'
      })),
      note: list.length === 0 ? 'No lab capex scheduled in this period.' : null
    };
  },

  // ── Capital ──
  capitalRaised: (ctx) => {
    const { assumptions, view, periodIndex } = ctx;
    const [a, b] = periodMonthRange(view, periodIndex);
    const raises = (assumptions?.capital?.raises || []).filter(r => r.month >= a && r.month < b);
    return {
      format: 'currency',
      formula: 'Σ scheduled raises with month in period',
      parts: raises.map((r, i) => ({
        key: null,
        label: r.label || `Month ${r.month}`,
        value: r.amount || 0,
        op: i === raises.length - 1 ? '' : '+'
      })),
      note: raises.length === 0 ? 'No capital raises in this period.' : null
    };
  },

  // ── Cash ──
  cashFlow: (ctx) => ({
    format: 'currency',
    formula: 'EBITDA + capitalRaised − CapEx',
    parts: [
      { key: 'ebitda', label: 'EBITDA', value: readCell(ctx.computed, ctx.view, 'ebitda', ctx.periodIndex), op: '+' },
      { key: 'capitalRaised', label: 'Capital Raised', value: readCell(ctx.computed, ctx.view, 'capitalRaised', ctx.periodIndex), op: '−' },
      { key: 'capex', label: 'CapEx', value: readCell(ctx.computed, ctx.view, 'capex', ctx.periodIndex), op: '' }
    ]
  }),

  cumulativeCash: (ctx) => {
    const { computed, assumptions, view, periodIndex } = ctx;
    // End-of-period snapshot, not a sum.
    const [a, b] = periodMonthRange(view, periodIndex);
    const endMonth = b - 1;
    const startOfPeriod = endMonth === 0
      ? (assumptions?.capital?.startingCash || 0) + (assumptions?.capital?.initialInvestment || 0)
      : computed.outlook.cumulativeCash[a - 1] || 0;
    // Sum of cash flow inside the period
    let cfSum = 0;
    for (let m = a; m < b; m++) cfSum += computed.outlook.cashFlow[m] || 0;
    return {
      format: 'currency',
      formula: 'previous balance + Σ cashFlow within period  (running balance, not summed)',
      parts: [
        { key: null, label: a === 0 ? 'Opening cash + initial investment' : `Balance at end of ${monthLabel(a - 1)}`, value: startOfPeriod, op: '+' },
        { key: 'cashFlow', label: 'Cash flow in period', value: cfSum, op: '=' }
      ]
    };
  }
};

// Per-stream revenue dynamic explainer (key shape: revenueStream_<id>)
function explainRevenueStream(ctx, streamId) {
  const { computed, assumptions, view, periodIndex } = ctx;
  const stream = findStream(assumptions, streamId);
  if (!stream) {
    return { format: 'currency', formula: 'Unknown stream', parts: [] };
  }
  const market = stream.market || { mode: 'linked' };
  const [a, b] = periodMonthRange(view, periodIndex);

  // Yearly bucket(s) covered. Spread is annual-revenue × qDist / 3,
  // so per-period we summarize via the year(s) involved.
  const yearsCovered = [...new Set(Array.from({ length: b - a }, (_, i) => yearOfMonth(a + i)))];

  if (market.mode === 'direct') {
    const dirInput = market.directInput === 'kg' ? 'kg' : 'revenue';
    const pricing = stream.pricing || {};
    const yearLines = yearsCovered.map(y => {
      const ykey = 'year' + y;
      const price = pricing[ykey] || pricing.year1 || 0;
      if (dirInput === 'kg') {
        const kg = market.kgByYear?.[ykey] || 0;
        return { label: `${ykey}: ${kg.toLocaleString()} kg × $${price}/kg`, value: kg * price };
      }
      const rev = market.revenueByYear?.[ykey] || 0;
      return { label: `${ykey}: direct $${Math.round(rev).toLocaleString()}`, value: rev };
    });
    const cfg = stream['year' + yearsCovered[0]];
    const qDist = cfg?.qDist || [0.25, 0.25, 0.25, 0.25];
    return {
      format: 'currency',
      formula: dirInput === 'kg'
        ? 'kg/year × $/kg, distributed by qDist, divided per month'
        : 'revenue/year (direct), distributed by qDist, divided per month',
      parts: yearLines.map((y, i) => ({ key: null, label: y.label, value: y.value, op: i === yearLines.length - 1 ? '' : '+' })),
      leafInputs: [
        { label: 'Quarterly distribution', value: qDist.map(q => `${Math.round(q * 100)}%`).join(' / '), section: 'revenue' },
        { label: 'Start month', value: stream.startMonth || 0, section: 'revenue' },
        ...(stream.commission?.enabled ? [{ label: 'Commission rate', value: `${((stream.commission.rateByYear?.['year' + yearsCovered[0]] || 0) * 100).toFixed(1)}% of direct rev`, section: 'revenue' }] : [])
      ]
    };
  }

  // Linked mode
  const sourceId = market.linkedSource || 'supercap';
  const sourceArr = computed.techRef?.[sourceId + 'ByYear'] || [];
  const pricing = stream.pricing || {};
  const yearLines = yearsCovered.map(y => {
    const ykey = 'year' + y;
    const cfg = stream[ykey] || {};
    const marketKg = sourceArr[y - 1] || 0;
    const sharePct = cfg.marketSharePct || 0;
    const kg = marketKg * sharePct;
    const price = pricing[ykey] || pricing.year1 || 0;
    return {
      label: `${ykey}: ${Math.round(marketKg).toLocaleString()} kg × ${(sharePct * 100).toFixed(2)}% × $${price}/kg`,
      value: kg * price
    };
  });
  const cfg = stream['year' + yearsCovered[0]];
  const qDist = cfg?.qDist || [0.25, 0.25, 0.25, 0.25];
  return {
    format: 'currency',
    formula: 'market_kg[year] × marketSharePct × pricePerKg → distributed by qDist',
    parts: yearLines.map((y, i) => ({ key: null, label: y.label, value: y.value, op: i === yearLines.length - 1 ? '' : '+' })),
    leafInputs: [
      { label: 'Linked source', value: sourceId, section: 'markets' },
      { label: 'Quarterly distribution', value: qDist.map(q => `${Math.round(q * 100)}%`).join(' / '), section: 'revenue' },
      { label: 'Start month', value: stream.startMonth || 0, section: 'revenue' }
    ]
  };
}

function explainDemandKg(ctx, streamId) {
  const { assumptions } = ctx;
  const stream = findStream(assumptions, streamId);
  return {
    format: 'kg',
    formula: stream?.market?.mode === 'direct'
      ? (stream.market.directInput === 'kg' ? 'kgByYear (direct), distributed by qDist' : 'revenueByYear ÷ $/kg')
      : 'market_kg[year] × marketSharePct',
    parts: [],
    note: `Per-stream demand for "${stream?.name || streamId}". See the linked revenue stream for the full breakdown.`
  };
}

// ──────────────────────────────────────────────────────────────
// Public: explainCell
// ──────────────────────────────────────────────────────────────
export function explainCell({ computed, assumptions, rowKey, periodIndex, view, label }) {
  if (!computed || !assumptions || rowKey == null) return null;
  const ctx = { computed, assumptions, view, periodIndex };
  const value = readCell(computed, view, rowKey, periodIndex);

  let exp;
  if (FORMULAS[rowKey]) {
    exp = FORMULAS[rowKey](ctx);
  } else if (rowKey.startsWith('revenueStream_')) {
    exp = explainRevenueStream(ctx, rowKey.slice('revenueStream_'.length));
  } else if (rowKey.startsWith('demandKg_')) {
    exp = explainDemandKg(ctx, rowKey.slice('demandKg_'.length));
  } else {
    exp = {
      format: 'currency',
      formula: '(no explainer registered for this row)',
      parts: []
    };
  }

  return {
    title: label || rowKey,
    rowKey,
    periodIndex,
    view,
    periodLabel: periodLabel(view, periodIndex),
    value,
    format: exp.format || 'currency',
    formula: exp.formula,
    parts: exp.parts || [],
    leafInputs: exp.leafInputs || null,
    monthly: monthlyBreakdown(computed, rowKey, view, periodIndex),
    note: exp.note || null
  };
}

// Drift guard — call once at app boot to surface missing registry entries.
// Returns an array of unhandled keys (empty when in sync).
export function findUnregisteredOutlookKeys(computed) {
  if (!computed?.outlook) return [];
  const known = new Set(Object.keys(FORMULAS));
  const missing = [];
  for (const k of Object.keys(computed.outlook)) {
    if (known.has(k)) continue;
    if (k.startsWith('revenueStream_')) continue;
    if (k.startsWith('demandKg_')) continue;
    // These are reference series the table doesn't render as primary rows.
    if (k === 'productionCapacityKg' || k === 'demandKgTotal' || k === 'capacityShortfallKg') continue;
    missing.push(k);
  }
  return missing;
}
