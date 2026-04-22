import API from './api.js';
import { calculateProforma } from '@shared/proformaEngine.js';
import { getDefaultAssumptions } from '@shared/proformaDefaults.js';
import {
  getDemoScenarioData,
  isDemoScenario as _isDemoScenario
} from '@shared/proformaDemoSeed.js';

const DEMO_SEEDED_KEY = 'graphene.proforma.demoSeeded';

function _snapshotMetrics(computed) {
  if (!computed || !computed.metrics) return null;
  return JSON.parse(JSON.stringify(computed.metrics));
}

class ProformaService {
  constructor() {
    this._charts = {};
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
      ctx.proformaAssumptions = JSON.parse(JSON.stringify(data.scenario.assumptions));
      ctx.proformaComputed = data.computed;
      ctx.proformaBaseline = _snapshotMetrics(data.computed);
      ctx.proformaView = 'editor';
      ctx.proformaDirty = false;
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
      ctx.proformaAssumptions = JSON.parse(JSON.stringify(result.scenario.assumptions));
      ctx.proformaComputed = result.computed;
      ctx.proformaBaseline = _snapshotMetrics(result.computed);
      ctx.proformaView = 'editor';
      ctx.proformaDirty = false;
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
      ctx.proformaAssumptions = JSON.parse(JSON.stringify(result.scenario.assumptions));
      ctx.proformaComputed = result.computed;
      ctx.proformaBaseline = _snapshotMetrics(result.computed);
      ctx.proformaView = 'editor';
      ctx.proformaDirty = false;
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
      ctx.proformaAssumptions = JSON.parse(JSON.stringify(result.scenario.assumptions));
      ctx.proformaComputed = result.computed;
      ctx.proformaBaseline = _snapshotMetrics(result.computed);
      ctx.proformaView = 'editor';
      ctx.proformaDirty = false;
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
    addChildren('revenue', [
      { label: 'Supercap Electrode', key: 'revenueSupercap', data: src.revenueSupercap },
      { label: 'Carbon Black CB/CA', key: 'revenueCarbonBlack', data: src.revenueCarbonBlack }
    ]);
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
    if (view === 'yearly') return ['Year 0', 'Year 1', 'Year 2', 'Year 3'];
    if (view === 'quarterly') {
      const labels = [];
      for (let y = 0; y <= 3; y++) for (let q = 1; q <= 4; q++) labels.push(`Y${y} Q${q}`);
      return labels;
    }
    // monthly
    const labels = [];
    for (let y = 0; y <= 3; y++) for (let m = 1; m <= 12; m++) labels.push(`Y${y} M${m}`);
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

    // Wait for browser layout after x-show toggle, then create charts
    requestAnimationFrame(() => this._buildCharts(c));
  }

  _buildCharts(c) {
    const labels = this.getColumnLabels({ proformaOutlookView: 'monthly' });

    // Revenue by Segment
    this._renderChart('proforma-chart-revenue', {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Supercap', data: c.outlook.revenueSupercap, backgroundColor: '#3B82F6' },
          { label: 'Carbon Black', data: c.outlook.revenueCarbonBlack, backgroundColor: '#10B981' }
        ]
      },
      options: { responsive: true, plugins: { title: { display: true, text: 'Revenue by Segment' } }, scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: v => '$' + (v/1e6).toFixed(1) + 'M' } } } }
    });

    // Rev vs COGS vs OPEX
    this._renderChart('proforma-chart-pnl', {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Revenue', data: c.outlook.revenue, borderColor: '#3B82F6', fill: false },
          { label: 'COGS', data: c.outlook.cogs, borderColor: '#EF4444', fill: false },
          { label: 'OPEX', data: c.outlook.opex, borderColor: '#F59E0B', fill: false }
        ]
      },
      options: { responsive: true, plugins: { title: { display: true, text: 'Revenue vs COGS vs OPEX' } }, scales: { y: { ticks: { callback: v => '$' + (v/1e6).toFixed(1) + 'M' } } } }
    });

    // Cash Flow + Cumulative
    this._renderChart('proforma-chart-cash', {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Cash Flow', data: c.outlook.cashFlow, backgroundColor: c.outlook.cashFlow.map(v => v >= 0 ? '#10B981' : '#EF4444'), order: 2 },
          { label: 'Cumulative Cash', data: c.outlook.cumulativeCash, type: 'line', borderColor: '#6366F1', fill: false, order: 1 }
        ]
      },
      options: { responsive: true, plugins: { title: { display: true, text: 'Cash Flow & Cumulative Cash' } }, scales: { y: { ticks: { callback: v => '$' + (v/1e6).toFixed(1) + 'M' } } } }
    });

    // Production Ramp
    const machineDatasets = c.production.machineTimelines.map((mt, i) => {
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
      return { label: mt.name, data: mt.monthlyKg, fill: true, backgroundColor: colors[i % colors.length] + '40', borderColor: colors[i % colors.length] };
    });
    this._renderChart('proforma-chart-production', {
      type: 'line',
      data: { labels, datasets: machineDatasets },
      options: { responsive: true, plugins: { title: { display: true, text: 'Production Ramp by Machine (kg)' } }, scales: { x: { stacked: true }, y: { stacked: true } } }
    });
  }

  _renderChart(canvasId, config) {
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
}

const proformaService = new ProformaService();
export default proformaService;
