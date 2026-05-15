import API from './api.js';
import { calculateProforma } from '@shared/proformaEngine.js';
import {
  getDefaultAssumptions,
  migrateAssumptions,
  BUILTIN_MARKET_SOURCES,
  YEARS_TOTAL
} from '@shared/proformaDefaults.js';
import {
  getDemoScenarioData,
  isDemoScenario as _isDemoScenario
} from '@shared/proformaDemoSeed.js';

// Categorical palette for stream-by-stream charts. Bronze is the brand
// anchor; the rest sit at similar saturation/value so adjacent stacks read
// as a designed system rather than a Chart.js default. Hues are spaced
// ~45° apart on the wheel to keep streams discernable side-by-side.
const STREAM_COLORS = [
  '#B87333', // bronze (brand)
  '#3F5B6B', // slate teal
  '#7A8B5C', // sage olive
  '#8B5A6B', // mauve
  '#C9A66B', // wheat
  '#5D7B8C', // steel blue
  '#7D6B8A', // heather
  '#5B7561'  // moss
];

// Semantic palette for the P&L, cash-flow, and capacity charts. Same
// muted register as STREAM_COLORS so the two never clash on screen.
const PALETTE = {
  revenue:    '#B87333', // bronze — headline
  cogs:       '#3F5B6B', // slate teal — a cost
  opex:       '#A67F5D', // walnut — another cost, distinct from bronze
  positive:   '#7A8B5C', // sage — positive cash flow
  negative:   '#8B5A6B', // mauve — negative cash flow
  cumulative: '#1F2937', // ink — strong reference line on top of bars
  capacity:   '#1F2937'  // ink — capacity ceiling line
};

// Apply once. Lighter grids, mute axis text, system font, refined legend
// and tooltip. Runs the first time we render any chart.
let _chartDefaultsApplied = false;
function _applyChartDefaults() {
  if (_chartDefaultsApplied || typeof Chart === 'undefined') return;
  const C = Chart.defaults;
  C.font.family = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  C.font.size = 11;
  C.color = '#6B7280';
  C.borderColor = '#F3F4F6';
  if (C.plugins?.legend?.labels) {
    C.plugins.legend.labels.boxWidth = 8;
    C.plugins.legend.labels.boxHeight = 8;
    C.plugins.legend.labels.usePointStyle = true;
    C.plugins.legend.labels.padding = 14;
    C.plugins.legend.labels.color = '#4B5563';
  }
  if (C.plugins?.title) {
    C.plugins.title.color = '#111827';
    C.plugins.title.font = { size: 13, weight: '600' };
    C.plugins.title.padding = { top: 4, bottom: 14 };
  }
  if (C.plugins?.tooltip) {
    C.plugins.tooltip.backgroundColor = 'rgba(17,24,39,0.95)';
    C.plugins.tooltip.padding = 10;
    C.plugins.tooltip.cornerRadius = 6;
    C.plugins.tooltip.titleFont = { size: 11, weight: '600' };
    C.plugins.tooltip.bodyFont = { size: 11 };
    C.plugins.tooltip.boxPadding = 4;
  }
  if (C.scale?.grid) {
    C.scale.grid.color = '#F3F4F6';
    C.scale.grid.tickColor = '#E5E7EB';
  }
  if (C.scale?.border) C.scale.border.color = '#E5E7EB';
  if (C.scale?.ticks) C.scale.ticks.color = '#9CA3AF';
  _chartDefaultsApplied = true;
}

function _slugifyStreamId(name) {
  const base = (name || 'stream').toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'stream';
  return base + '_' + Math.random().toString(36).slice(2, 7);
}

function _slugifyMarketSourceId(label) {
  const base = (label || 'source').toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'source';
  return base + '_' + Math.random().toString(36).slice(2, 7);
}

const DEMO_SEEDED_KEY = 'graphene.proforma.demoSeeded';

function _snapshotMetrics(computed) {
  if (!computed || !computed.metrics) return null;
  return JSON.parse(JSON.stringify(computed.metrics));
}

class ProformaService {
  constructor() {
    this._charts = {};
    // Cached chart configs by canvas id, so we can re-instantiate the
    // same chart in the fullscreen modal without rebuilding from scratch.
    this._chartConfigs = {};
    this._fullscreenChart = null;
  }

  // ── Scenario List ──

  async loadScenarios(ctx) {
    ctx.proformaLoading = true;
    try {
      ctx.proformaScenarios = await API.proforma.getScenarios();
      // Auto-seed a locked Demo Scenario the first time a user opens the
      // proforma tab with no scenarios. Guarded by a localStorage flag so
      // a user who deletes the demo doesn't get it back on every load.
      const alreadySeeded = typeof window !== 'undefined' && window.localStorage
        ? window.localStorage.getItem(DEMO_SEEDED_KEY) === '1'
        : false;
      if (!alreadySeeded && ctx.proformaScenarios.length === 0) {
        try {
          await this.createDemoScenario(ctx, { openAfter: false });
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(DEMO_SEEDED_KEY, '1');
          }
          ctx.proformaScenarios = await API.proforma.getScenarios();
        } catch (seedErr) {
          console.warn('Demo scenario auto-seed failed (non-fatal)', seedErr);
        }
      }
    } catch (e) {
      console.error('Failed to load proforma scenarios', e);
    } finally {
      ctx.proformaLoading = false;
    }
  }

  async openScenario(ctx, id) {
    ctx.proformaLoading = true;
    try {
      const data = await API.proforma.getScenario(id);
      ctx.proformaScenario = data.scenario;
      ctx.proformaAssumptions = migrateAssumptions(JSON.parse(JSON.stringify(data.scenario.assumptions)));
      ctx.proformaComputed = data.computed;
      ctx.proformaBaseline = _snapshotMetrics(data.computed);
      ctx.proformaView = 'editor';
      ctx.proformaDirty = false;
      this._reseedMarketSources(ctx);
    } catch (e) {
      console.error('Failed to load scenario', e);
    } finally {
      ctx.proformaLoading = false;
    }
  }

  async createScenario(ctx) {
    const name = prompt('Scenario name:');
    if (!name) return;
    ctx.proformaLoading = true;
    try {
      const defaults = getDefaultAssumptions();
      const result = await API.proforma.create({
        name,
        assumptions: defaults
      });
      ctx.proformaScenario = result.scenario;
      ctx.proformaAssumptions = migrateAssumptions(JSON.parse(JSON.stringify(result.scenario.assumptions)));
      ctx.proformaComputed = result.computed;
      ctx.proformaBaseline = _snapshotMetrics(result.computed);
      ctx.proformaView = 'editor';
      ctx.proformaDirty = false;
      this._reseedMarketSources(ctx);
      // Refresh list in background
      this.loadScenarios(ctx);
    } catch (e) {
      console.error('Failed to create scenario', e);
    } finally {
      ctx.proformaLoading = false;
    }
  }

  // Create the locked "Demo Scenario" with plausible fake data so the
  // redesigned UX can be explored without touching real scenarios.
  // opts.openAfter: if true, open the scenario in the editor after creating.
  async createDemoScenario(ctx, opts = {}) {
    const { openAfter = true } = opts;
    const { name, description, assumptions } = getDemoScenarioData();
    const result = await API.proforma.create({ name, description, assumptions });
    // Intentionally NOT locked — the whole point of the demo is to play
    // with sliders live. The DEMO badge + "Clone to real" button still
    // make it clear this is throwaway data.
    if (openAfter) {
      ctx.proformaScenario = result.scenario;
      ctx.proformaAssumptions = migrateAssumptions(JSON.parse(JSON.stringify(result.scenario.assumptions)));
      ctx.proformaComputed = result.computed;
      ctx.proformaBaseline = _snapshotMetrics(result.computed);
      ctx.proformaView = 'editor';
      ctx.proformaDirty = false;
      this._reseedMarketSources(ctx);
    }
    // Refresh list so the demo appears in list view as well
    this.loadScenarios(ctx);
    return result.scenario;
  }

  // Clone the currently-open (demo) scenario into a new unlocked scenario
  // with a user-supplied name, using the demo's current assumptions as seed.
  async cloneToReal(ctx) {
    if (!ctx.proformaScenario || !ctx.proformaAssumptions) return;
    const suggested = ctx.proformaScenario.name.replace(/\s*\(copy\)\s*$/i, '') + ' (copy)';
    const name = prompt('New scenario name:', suggested);
    if (!name) return;
    ctx.proformaLoading = true;
    try {
      const result = await API.proforma.create({
        name,
        assumptions: JSON.parse(JSON.stringify(ctx.proformaAssumptions))
      });
      ctx.proformaScenario = result.scenario;
      ctx.proformaAssumptions = migrateAssumptions(JSON.parse(JSON.stringify(result.scenario.assumptions)));
      ctx.proformaComputed = result.computed;
      ctx.proformaBaseline = _snapshotMetrics(result.computed);
      ctx.proformaView = 'editor';
      ctx.proformaDirty = false;
      this._reseedMarketSources(ctx);
      this.loadScenarios(ctx);
    } catch (e) {
      console.error('Failed to clone scenario', e);
    } finally {
      ctx.proformaLoading = false;
    }
  }

  isDemoScenario(scenario) {
    return _isDemoScenario(scenario);
  }

  async toggleLock(ctx, id) {
    try {
      const result = await API.proforma.toggleLock(id);
      const s = ctx.proformaScenarios.find(s => s.id === id);
      if (s) s.locked = result.locked;
      if (ctx.proformaScenario?.id === id) {
        ctx.proformaScenario.locked = result.locked;
      }
    } catch (e) {
      console.error('Failed to toggle lock', e);
    }
  }

  async deleteScenario(ctx, id) {
    if (!confirm('Delete this scenario? This cannot be undone.')) return;
    try {
      await API.proforma.delete(id);
      ctx.proformaScenarios = ctx.proformaScenarios.filter(s => s.id !== id);
      if (ctx.proformaScenario?.id === id) {
        this.backToList(ctx);
      }
    } catch (e) {
      console.error('Failed to delete scenario', e);
    }
  }

  // ── Editor ──

  async saveScenario(ctx) {
    if (!ctx.proformaScenario) return;
    ctx.proformaLoading = true;
    try {
      const result = await API.proforma.update(ctx.proformaScenario.id, {
        name: ctx.proformaScenario.name,
        description: ctx.proformaScenario.description,
        assumptions: ctx.proformaAssumptions
      });
      ctx.proformaScenario = result.scenario;
      ctx.proformaComputed = result.computed;
      ctx.proformaBaseline = _snapshotMetrics(result.computed);
      ctx.proformaDirty = false;
      // Refresh list
      this.loadScenarios(ctx);
    } catch (e) {
      console.error('Failed to save scenario', e);
    } finally {
      ctx.proformaLoading = false;
    }
  }

  // Restore assumptions to the last-saved state (reloads from server) and
  // reset the baseline so delta chips return to zero.
  async resetToBaseline(ctx) {
    if (!ctx.proformaScenario) return;
    if (!confirm('Revert assumptions to last saved state? Unsaved edits will be lost.')) return;
    await this.openScenario(ctx, ctx.proformaScenario.id);
  }

  recompute(ctx) {
    try {
      ctx.proformaComputed = calculateProforma(ctx.proformaAssumptions);
      ctx.proformaDirty = true;
    } catch (e) {
      console.error('Proforma recompute error', e);
    }
  }

  backToList(ctx) {
    ctx.proformaView = 'list';
    ctx.proformaScenario = null;
    ctx.proformaAssumptions = null;
    ctx.proformaComputed = null;
    ctx.proformaBaseline = null;
    ctx.proformaDirty = false;
    this.destroyCharts();
  }

  // ── Assumption helpers ──

  markDirty(ctx) {
    ctx.proformaDirty = true;
  }

  setAssumption(ctx, path, value) {
    const keys = path.split('.');
    let obj = ctx.proformaAssumptions;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    this.recompute(ctx);
  }

  // Machine editing
  addMachine(ctx) {
    ctx.proformaAssumptions.machines.push({
      name: 'New Machine',
      type: 'pilot',
      commissionMonth: 12,
      constructionMonths: 7,
      validationMonths: 2,
      cost: 283000,
      paymentSplit: [0.20, 0.50, 0.25, 0.05],
      paymentMonthOffsets: [0, 1, 4, 7]
    });
    this.recompute(ctx);
  }

  removeMachine(ctx, index) {
    ctx.proformaAssumptions.machines.splice(index, 1);
    this.recompute(ctx);
  }

  // Q Distribution normalization
  normalizeQDist(arr) {
    const sum = arr.reduce((a, b) => a + b, 0);
    if (sum > 0) {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.round((arr[i] / sum) * 1000) / 1000;
      }
      arr[arr.length - 1] += (1.0 - arr.reduce((a, b) => a + b, 0));
    }
  }

  // Staffing salary mode toggle (scalar <-> array)
  toggleSalaryMode(ctx, yearKey, role) {
    const data = ctx.proformaAssumptions.opex.staffing[yearKey][role];
    if (Array.isArray(data.salary)) {
      data.salary = Math.round(data.salary.reduce((a, b) => a + b, 0) / data.salary.length);
    } else {
      data.salary = [data.salary, data.salary, data.salary, data.salary];
    }
    this.recompute(ctx);
  }

  // Machine payment management
  addMachinePayment(ctx, machineIndex) {
    const machine = ctx.proformaAssumptions.machines[machineIndex];
    if (!machine.payments) machine.payments = [];
    machine.payments.push({ month: 0, pct: 0 });
    this.recompute(ctx);
  }

  removeMachinePayment(ctx, machineIndex, paymentIndex) {
    ctx.proformaAssumptions.machines[machineIndex].payments.splice(paymentIndex, 1);
    this.recompute(ctx);
  }

  // FTE role management
  addFteRole(ctx) {
    ctx.proformaAssumptions.manufacturing.fteRoles.push({ name: 'New Role', count: 1, monthlyCost: 15000 });
    this.recompute(ctx);
  }

  removeFteRole(ctx, index) {
    ctx.proformaAssumptions.manufacturing.fteRoles.splice(index, 1);
    this.recompute(ctx);
  }

  // Capital raises
  addRaise(ctx) {
    if (!ctx.proformaAssumptions.capital.raises) {
      ctx.proformaAssumptions.capital.raises = [];
    }
    ctx.proformaAssumptions.capital.raises.push({ month: 0, amount: 0 });
    this.recompute(ctx);
  }

  removeRaise(ctx, index) {
    ctx.proformaAssumptions.capital.raises.splice(index, 1);
    this.recompute(ctx);
  }

  // ── Market source management ──

  // Catalog of global market sources surfaced in the linked-source
  // dropdown. Built-ins (supercap, conductive) come first; the remainder
  // is derived from the open scenario's technical.market.customSources[].
  // Safe to call before a scenario is open — returns just the built-ins.
  getMarketSourceCatalog(ctx) {
    const sources = BUILTIN_MARKET_SOURCES.map(s => ({ id: s.id, label: s.label }));
    const custom = ctx?.proformaAssumptions?.technical?.market?.customSources || [];
    for (const s of custom) {
      if (!s || !s.id) continue;
      sources.push({ id: s.id, label: s.label || s.id });
    }
    return sources;
  }

  // Re-seed proformaMarketSources whenever the source list changes so
  // the Revenue tab dropdown picks up additions/removals without reload.
  _reseedMarketSources(ctx) {
    ctx.proformaMarketSources = this.getMarketSourceCatalog(ctx);
  }

  // Count revenue streams currently linked to a given source id. Used by
  // the Technical tab to warn before deleting a source that's in use.
  countStreamsLinkedToSource(ctx, sourceId) {
    const streams = ctx.proformaAssumptions?.revenue?.streams || [];
    return streams.filter(s =>
      s.market?.mode === 'linked' && s.market?.linkedSource === sourceId
    ).length;
  }

  addMarketSource(ctx, { label, baseTonnes = 0, cagr = 1.20 } = {}) {
    const finalLabel = (label && label.trim()) || 'New market source';
    const market = ctx.proformaAssumptions?.technical?.market;
    if (!market) return null;
    if (!Array.isArray(market.customSources)) market.customSources = [];
    const id = _slugifyMarketSourceId(finalLabel);
    market.customSources.push({
      id,
      label: finalLabel,
      baseTonnes: +baseTonnes || 0,
      cagr: +cagr || 1.0,
      builtin: false
    });
    this._reseedMarketSources(ctx);
    this.recompute(ctx);
    return id;
  }

  removeMarketSource(ctx, sourceId) {
    const market = ctx.proformaAssumptions?.technical?.market;
    const sources = market?.customSources;
    if (!Array.isArray(sources)) return;
    const idx = sources.findIndex(s => s.id === sourceId);
    if (idx < 0) return;
    if (sources[idx].builtin) return; // Built-in customs are not deletable.
    sources.splice(idx, 1);
    this._reseedMarketSources(ctx);
    this.recompute(ctx);
  }

  // ── Revenue stream management ──

  // mode: 'linked' | 'direct'. linkedSource only used when mode === 'linked'.
  addRevenueStream(ctx, { name, mode = 'linked', linkedSource = 'supercap' } = {}) {
    const finalName = (name && name.trim()) || 'New revenue stream';
    if (!ctx.proformaAssumptions.revenue) ctx.proformaAssumptions.revenue = { streams: [] };
    if (!Array.isArray(ctx.proformaAssumptions.revenue.streams)) ctx.proformaAssumptions.revenue.streams = [];

    const streams = ctx.proformaAssumptions.revenue.streams;
    const id = _slugifyStreamId(finalName);

    const pricing = {};
    const revenueByYear = {};
    for (let y = 0; y < YEARS_TOTAL; y++) {
      pricing['year' + y] = 100;
      if (y >= 1) revenueByYear['year' + y] = 0;
    }
    const stream = {
      id,
      name: finalName,
      builtin: false,
      enabled: true,
      order: streams.length,
      startMonth: 12,
      pricing,
      commission: { enabled: false, rateByYear: { year1: 0, year2: 0, year3: 0, year4: 0 }, dealValueByYear: { year1: 0, year2: 0, year3: 0, year4: 0 } },
      market: mode === 'direct'
        ? { mode: 'direct', revenueByYear }
        : { mode: 'linked', linkedSource }
    };
    for (let y = 1; y < YEARS_TOTAL; y++) {
      stream['year' + y] = { marketSharePct: 0, qDist: [0.25, 0.25, 0.25, 0.25] };
    }
    streams.push(stream);
    this.recompute(ctx);
    return id;
  }

  toggleRevenueStream(ctx, streamId) {
    const stream = ctx.proformaAssumptions?.revenue?.streams?.find(s => s.id === streamId);
    if (!stream) return;
    stream.enabled = stream.enabled === false; // flip; treat undefined as true
    this.recompute(ctx);
  }

  removeRevenueStream(ctx, streamId) {
    const streams = ctx.proformaAssumptions?.revenue?.streams;
    if (!Array.isArray(streams)) return;
    const idx = streams.findIndex(s => s.id === streamId);
    if (idx < 0) return;
    if (streams[idx].builtin) return; // Built-ins are not deletable
    streams.splice(idx, 1);
    streams.forEach((s, i) => { s.order = i; });
    this.recompute(ctx);
  }

  // Switch a stream's market mode in place. When switching to 'direct',
  // seed revenueByYear with a rough estimate of last-computed revenue so
  // the user has a starting point instead of zeros.
  setStreamMarketMode(ctx, streamId, mode) {
    const stream = ctx.proformaAssumptions?.revenue?.streams?.find(s => s.id === streamId);
    if (!stream) return;
    if (mode === 'direct') {
      let revenueByYear = stream.market?.revenueByYear;
      if (!revenueByYear) {
        revenueByYear = {};
        for (let y = 1; y < YEARS_TOTAL; y++) revenueByYear['year' + y] = 0;
      }
      stream.market = { mode: 'direct', revenueByYear };
    } else {
      stream.market = {
        mode: 'linked',
        linkedSource: stream.market?.linkedSource || 'supercap'
      };
    }
    this.recompute(ctx);
  }

  // ── Outlook helpers ──

  getOutlookRows(ctx) {
    const c = ctx.proformaComputed;
    if (!c) return [];
    const view = ctx.proformaOutlookView;
    const src = view === 'yearly' ? c.yearly : view === 'quarterly' ? c.quarterly : c.outlook;
    // Flat list: parent rows + child rows interleaved. Children have parentKey for collapse logic.
    const rows = [];
    const add = (label, key, data, opts = {}) => rows.push({ label, key, data, ...opts });
    const addChildren = (parentKey, children) => {
      for (const ch of children) {
        rows.push({ ...ch, child: true, parentKey });
      }
    };

    add('Revenue', 'revenue', src.revenue, { category: true });
    const streams = ctx.proformaAssumptions?.revenue?.streams || [];
    addChildren('revenue', streams.filter(s => s.enabled !== false).map(s => ({
      label: s.name,
      key: 'revenueStream_' + s.id,
      data: src['revenueStream_' + s.id] || []
    })));
    add('COGS', 'cogs', src.cogs, { category: true });
    addChildren('cogs', [
      { label: 'Manufacturing', key: 'cogsManufacturing', data: src.cogsManufacturing },
      { label: 'Hemp', key: 'cogsHemp', data: src.cogsHemp },
      { label: 'Biochar', key: 'cogsBiochar', data: src.cogsBiochar }
    ]);
    add('Gross Margin', 'grossMargin', src.grossMargin, { bold: true });
    add('Gross Margin %', 'grossMarginPct', src.grossMarginPct, { percent: true });
    add('Operating Expenses', 'opex', src.opex, { category: true });
    addChildren('opex', [
      { label: 'Staffing', key: 'opexStaffing', data: src.opexStaffing },
      { label: 'Benefits', key: 'opexBenefits', data: src.opexBenefits },
      { label: 'Overhead', key: 'opexOverhead', data: src.opexOverhead },
      { label: 'R&D', key: 'opexRnd', data: src.opexRnd },
      { label: 'Legal', key: 'opexLegal', data: src.opexLegal },
      { label: 'Royalty', key: 'opexRoyalty', data: src.opexRoyalty },
      { label: 'Commission', key: 'opexCommission', data: src.opexCommission },
      { label: 'Insurance', key: 'opexInsurance', data: src.opexInsurance }
    ]);
    add('EBITDA', 'ebitda', src.ebitda, { bold: true });
    add('CapEx', 'capex', src.capex, { category: true });
    addChildren('capex', [
      { label: 'Machinery', key: 'capexMachinery', data: src.capexMachinery },
      { label: 'Lab/R&D', key: 'capexLab', data: src.capexLab }
    ]);
    add('Capital Raised', 'capitalRaised', src.capitalRaised);
    add('Cash Flow', 'cashFlow', src.cashFlow, { bold: true });
    add('Cumulative Cash', 'cumulativeCash', src.cumulativeCash, { bold: true });
    return rows;
  }

  getColumnLabels(ctx) {
    const view = ctx.proformaOutlookView;
    if (view === 'yearly') {
      const labels = [];
      for (let y = 0; y < YEARS_TOTAL; y++) labels.push(`Year ${y}`);
      return labels;
    }
    if (view === 'quarterly') {
      const labels = [];
      for (let y = 0; y < YEARS_TOTAL; y++) for (let q = 1; q <= 4; q++) labels.push(`Y${y} Q${q}`);
      return labels;
    }
    // monthly
    const labels = [];
    for (let y = 0; y < YEARS_TOTAL; y++) for (let m = 1; m <= 12; m++) labels.push(`Y${y} M${m}`);
    return labels;
  }

  // ── Charts ──

  destroyCharts() {
    Object.values(this._charts).forEach(c => c?.destroy());
    this._charts = {};
  }

  renderCharts(ctx) {
    this.destroyCharts();
    const c = ctx.proformaComputed;
    if (!c) return;

    const streams = ctx.proformaAssumptions?.revenue?.streams || [];

    // Wait for browser layout after x-show toggle, then create charts
    requestAnimationFrame(() => this._buildCharts(c, streams));
  }

  _buildCharts(c, streams = []) {
    _applyChartDefaults();
    const labels = this.getColumnLabels({ proformaOutlookView: 'monthly' });
    const dollarTick = v => '$' + (v / 1e6).toFixed(1) + 'M';

    // Revenue by Stream — stacked bar, one dataset per stream in order.
    this._renderChart('proforma-chart-revenue', {
      type: 'bar',
      data: {
        labels,
        datasets: streams.map((s, i) => ({
          label: s.name,
          data: c.outlook['revenueStream_' + s.id] || [],
          backgroundColor: STREAM_COLORS[i % STREAM_COLORS.length],
          borderWidth: 0,
          borderRadius: 1
        }))
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'Revenue by Stream' } },
        scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: dollarTick } } }
      }
    });

    // Rev vs COGS vs OPEX — Revenue as the headline (filled), costs as
    // unfilled lines underneath so the gross/operating margin reads as
    // visual whitespace between the curves.
    this._renderChart('proforma-chart-pnl', {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data: c.outlook.revenue,
            borderColor: PALETTE.revenue,
            backgroundColor: PALETTE.revenue + '1F',
            borderWidth: 2,
            fill: 'origin'
          },
          { label: 'COGS', data: c.outlook.cogs, borderColor: PALETTE.cogs, borderWidth: 1.75, fill: false },
          { label: 'OPEX', data: c.outlook.opex, borderColor: PALETTE.opex, borderWidth: 1.75, fill: false, borderDash: [4, 3] }
        ]
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'Revenue vs COGS vs OPEX' } },
        scales: { y: { ticks: { callback: dollarTick } } }
      }
    });

    // Cash Flow + Cumulative — sage/mauve diverging bars, ink line on top.
    this._renderChart('proforma-chart-cash', {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Cash Flow',
            data: c.outlook.cashFlow,
            backgroundColor: c.outlook.cashFlow.map(v => v >= 0 ? PALETTE.positive : PALETTE.negative),
            borderWidth: 0,
            borderRadius: 1,
            order: 2
          },
          {
            label: 'Cumulative Cash',
            data: c.outlook.cumulativeCash,
            type: 'line',
            borderColor: PALETTE.cumulative,
            borderWidth: 2,
            fill: false,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'Cash Flow & Cumulative Cash' } },
        scales: { y: { ticks: { callback: dollarTick } } }
      }
    });

    // Production Ramp — stacked area, one band per machine.
    const machineDatasets = c.production.machineTimelines.map((mt, i) => {
      const color = STREAM_COLORS[i % STREAM_COLORS.length];
      return {
        label: mt.name,
        data: mt.monthlyKg,
        fill: true,
        backgroundColor: color + '99',
        borderColor: color,
        borderWidth: 1
      };
    });
    this._renderChart('proforma-chart-production', {
      type: 'line',
      data: { labels, datasets: machineDatasets },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'Production Ramp by Machine (kg)' } },
        scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: v => v.toLocaleString() + ' kg' } } }
      }
    });

    // Production Capacity vs Sales Demand (kg) — stacked per-stream demand
    // bars overlaid with a capacity line. Where the line dips below the
    // stack, the planned sales exceed what the facility can actually make.
    const demandDatasets = streams.map((s, i) => ({
      label: s.name + ' (kg)',
      type: 'bar',
      data: c.outlook['demandKg_' + s.id] || [],
      backgroundColor: STREAM_COLORS[i % STREAM_COLORS.length] + 'D9',
      borderWidth: 0,
      borderRadius: 1,
      stack: 'demand',
      order: 2
    }));
    const capacityLine = {
      label: 'Production capacity (kg)',
      type: 'line',
      data: c.outlook.productionCapacityKg || [],
      borderColor: PALETTE.capacity,
      borderWidth: 2,
      borderDash: [5, 4],
      backgroundColor: 'transparent',
      fill: false,
      order: 1,
      pointRadius: 0
    };
    this._renderChart('proforma-chart-capacity-vs-demand', {
      type: 'bar',
      data: { labels, datasets: [...demandDatasets, capacityLine] },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Production Capacity vs Sales Demand (kg/mo)' },
          tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${Math.round(ctx.parsed.y).toLocaleString()} kg` } }
        },
        // Bars share stack:'demand' so they stack into one bar per month;
        // the line dataset draws against absolute y (not stacked).
        scales: {
          x: { stacked: true },
          y: { beginAtZero: true, ticks: { callback: v => v.toLocaleString() + ' kg' } }
        }
      }
    });

    // Margin curves — gross margin % and EBITDA margin %. Both as fraction
    // → percent. EBITDA margin can dive deep negative pre-revenue, so we
    // null pre-revenue months to keep the chart legible.
    const grossPct = (c.outlook.grossMarginPct || []).map(v => (v || 0) * 100);
    const ebitdaPct = c.outlook.revenue.map((rev, i) =>
      rev > 0 ? (c.outlook.ebitda[i] / rev) * 100 : null
    );
    this._renderChart('proforma-chart-margins', {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Gross margin %',
            data: grossPct,
            borderColor: PALETTE.revenue,
            backgroundColor: PALETTE.revenue + '14',
            borderWidth: 2,
            fill: 'origin',
            spanGaps: true
          },
          {
            label: 'EBITDA margin %',
            data: ebitdaPct,
            borderColor: PALETTE.cumulative,
            borderWidth: 2,
            borderDash: [5, 4],
            fill: false,
            spanGaps: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Margins (% of Revenue)' },
          tooltip: { callbacks: { label: (ctx) => ctx.dataset.label + ': ' + (ctx.parsed.y == null ? '—' : ctx.parsed.y.toFixed(1) + '%') } }
        },
        scales: { y: { ticks: { callback: v => v + '%' } } }
      }
    });

    // COGS composition — three-band stacked area showing where the
    // unit cost actually lives over time.
    const cogsBands = [
      { key: 'cogsManufacturing', label: 'Manufacturing', color: PALETTE.cogs },
      { key: 'cogsHemp',          label: 'Hemp',          color: PALETTE.opex },
      { key: 'cogsBiochar',       label: 'Biochar',       color: STREAM_COLORS[2] }
    ];
    this._renderChart('proforma-chart-cogs-composition', {
      type: 'line',
      data: {
        labels,
        datasets: cogsBands.map(b => ({
          label: b.label,
          data: c.outlook[b.key] || [],
          backgroundColor: b.color + 'BB',
          borderColor: b.color,
          borderWidth: 1,
          fill: true
        }))
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'COGS Composition' } },
        scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: dollarTick } } }
      }
    });

    // OPEX composition — eight-band stacked area. Hits eight palette
    // slots; later wraps would collide visually so we cap labels here.
    const opexBands = [
      { key: 'opexStaffing',   label: 'Staffing' },
      { key: 'opexBenefits',   label: 'Benefits' },
      { key: 'opexOverhead',   label: 'Overhead' },
      { key: 'opexRnd',        label: 'R&D' },
      { key: 'opexLegal',      label: 'Legal' },
      { key: 'opexRoyalty',    label: 'Royalty' },
      { key: 'opexCommission', label: 'Commission' },
      { key: 'opexInsurance',  label: 'Insurance' }
    ];
    this._renderChart('proforma-chart-opex-composition', {
      type: 'line',
      data: {
        labels,
        datasets: opexBands.map((b, i) => {
          const color = STREAM_COLORS[i % STREAM_COLORS.length];
          return {
            label: b.label,
            data: c.outlook[b.key] || [],
            backgroundColor: color + 'BB',
            borderColor: color,
            borderWidth: 1,
            fill: true
          };
        })
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'OPEX Composition' } },
        scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: dollarTick } } }
      }
    });

    // Unit economics — $/kg sold. Denominator is `demandKgTotal` (the
    // kg implied by revenue streams). Months with zero demand emit null
    // so Chart.js skips the point rather than spiking to infinity.
    const demandKg = c.outlook.demandKgTotal || [];
    const revPerKg  = c.outlook.revenue.map((v, i) => demandKg[i] > 0 ? v / demandKg[i] : null);
    const costPerKg = c.outlook.cogs.map(   (v, i) => demandKg[i] > 0 ? v / demandKg[i] : null);
    this._renderChart('proforma-chart-unit-economics', {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Revenue / kg', data: revPerKg,  borderColor: PALETTE.revenue, borderWidth: 2, fill: false, spanGaps: true },
          { label: 'Cost / kg',    data: costPerKg, borderColor: PALETTE.cogs,    borderWidth: 2, fill: false, spanGaps: true }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Unit Economics ($/kg sold)' },
          tooltip: { callbacks: { label: (ctx) => ctx.dataset.label + ': ' + (ctx.parsed.y == null ? '—' : '$' + Math.round(ctx.parsed.y).toLocaleString()) } }
        },
        scales: { y: { ticks: { callback: v => '$' + v.toLocaleString() } } }
      }
    });
  }

  _renderChart(canvasId, config) {
    this._chartConfigs[canvasId] = config;
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const existing = this._charts[canvasId];
    if (existing) existing.destroy();
    this._charts[canvasId] = new Chart(canvas, {
      ...config,
      options: {
        ...config.options,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        elements: { point: { radius: 0 }, line: { tension: 0.3 } }
      }
    });
  }

  // Mounts the saved config of `sourceCanvasId` onto a fullscreen target
  // canvas. The same config object is reused — Chart.js doesn't share
  // state between instances, so this is a clean second render.
  renderFullscreenChart(sourceCanvasId, targetCanvasId = 'proforma-chart-fullscreen') {
    const config = this._chartConfigs[sourceCanvasId];
    if (!config) return;
    const canvas = document.getElementById(targetCanvasId);
    if (!canvas) return;
    if (this._fullscreenChart) this._fullscreenChart.destroy();
    this._fullscreenChart = new Chart(canvas, {
      ...config,
      options: {
        ...config.options,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        elements: { point: { radius: 0 }, line: { tension: 0.3 } }
      }
    });
  }

  destroyFullscreenChart() {
    if (this._fullscreenChart) {
      this._fullscreenChart.destroy();
      this._fullscreenChart = null;
    }
  }
}

const proformaService = new ProformaService();
export default proformaService;
