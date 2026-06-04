// ─────────────────────────────────────────────────────────────────────────
// PHASE 2 — Production chrome-less proforma embed entry.
//
// This is the real token-fed entry (the Phase 0 spike it replaced was
// throwaway). It defines a SLIM Alpine factory — proforma state + delegates
// ONLY — so we never pull in the full grapheneApp() whose init() fires
// auth-dependent loaders that error without a JWT (see the build doc's Phase 0
// findings).
//
// Flow:
//   1. Read ?token= from the URL.
//   2. GET /api/proforma/share/:token  (the token router — NOT the
//      requireSuperAdmin admin routes) → { scenario, computed, mode }.
//   3. Mount the existing proforma editor/summary against the seeded state.
//      - mode 'view' → render the variant as `locked` (reuses the editor's
//        existing disable/hide path: inputs disabled, Save hidden).
//      - mode 'edit' → Save calls PUT /api/proforma/share/:token, which writes
//        ONLY the variant the token points at (master-safety is server-side).
//
// The token only ever reaches its own variant clone; no scenario id is sent
// from the client, so a master can never be read or written from this page.
// ─────────────────────────────────────────────────────────────────────────
import { migrateAssumptions } from '@shared/proformaDefaults.js';
import { calculateProforma } from '@shared/proformaEngine.js';
import { explainCell as explainProformaCell } from '@shared/proformaExplain.js';
import proformaService from './services/ProformaService.js';
// Importing this also sets window._pfFmtC / window._pfFmtP and pulls in every
// proforma section module (each registers its own window._pf* helpers).
import { getProformaTabHtml as buildProformaTabHtml } from './components/tabs/ProformaTab.js';

function getShareToken() {
  return new URLSearchParams(window.location.search).get('token');
}

const deepClone = (o) => JSON.parse(JSON.stringify(o));

window.proformaEmbedApp = function () {
  return {
    // ── Token / embed state ──
    shareToken: getShareToken(),
    shareMode: 'view',          // 'view' | 'edit' — set from the GET response
    embedReady: false,          // true once the variant has loaded
    embedError: null,           // user-facing load/save error string

    // ── Proforma state (mirrors app-refactored.js; slim subset) ──
    // activeTab is kept only because the shared template root is gated on
    // `activeTab === 'proforma'`.
    activeTab: 'proforma',
    proformaScenarios: [],
    proformaScenario: null,
    proformaAssumptions: null,
    proformaComputed: null,
    proformaBaseline: null,
    proformaView: 'editor',
    proformaEditorTab: 'summary',
    proformaFullscreenChart: null,
    proformaOutlookView: 'monthly',
    proformaLoading: false,
    proformaDirty: false,
    proformaCollapsed: {},
    proformaProductionCollapsed: {},
    proformaSection: 'revenue',
    proformaSectionsReviewed: {},
    proformaAdvancedOpen: {},
    proformaMachineHover: null,
    proformaStaffingYear: 'year0',
    proformaMarketSources: [],
    proformaExplainer: null,
    proformaExplainerStack: [],

    // ── Bootstrap ──
    // Alpine auto-runs init(). Loads the variant from the share token.
    async init() {
      if (!this.shareToken) {
        this.embedError = 'No share token provided. This link is missing its ?token= value.';
        return;
      }
      await this.loadShare();
    },

    async loadShare() {
      this.proformaLoading = true;
      this.embedError = null;
      try {
        const res = await fetch(`/api/proforma/share/${encodeURIComponent(this.shareToken)}`, {
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
          this.embedError = res.status === 404
            ? 'This proforma link is no longer available.'
            : 'This proforma link could not be opened.';
          return;
        }
        const data = await res.json();
        this._seedFromShare(data);
        this.embedReady = true;
      } catch (e) {
        console.error('Failed to load shared proforma', e);
        this.embedError = 'This proforma link could not be opened.';
      } finally {
        this.proformaLoading = false;
      }
    },

    // Seed proforma state from a { scenario, computed, mode } token response.
    // View mode renders via the editor's existing `locked` path, so we flag the
    // scenario locked when mode !== 'edit'.
    _seedFromShare(data) {
      this.shareMode = data.mode === 'edit' ? 'edit' : 'view';
      this.proformaScenario = { ...data.scenario, locked: this.shareMode !== 'edit' };
      this.proformaAssumptions = migrateAssumptions(deepClone(data.scenario.assumptions));
      this.proformaComputed = data.computed;
      this.proformaBaseline = null;
      this.proformaView = 'editor';
      this.proformaDirty = false;
      proformaService._reseedMarketSources(this);
    },

    // ── Save (edit mode only) → PUT the token's own variant ──
    async saveProformaScenario() {
      if (!this.proformaScenario || this.proformaScenario.locked || this.shareMode !== 'edit') return;
      this.proformaLoading = true;
      try {
        const res = await fetch(`/api/proforma/share/${encodeURIComponent(this.shareToken)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assumptions: this.proformaAssumptions })
        });
        if (!res.ok) {
          this.embedError = 'Could not save your changes. Please try again.';
          return;
        }
        const data = await res.json();
        // Keep the in-memory assumptions object (the user's live edits); refresh
        // the scenario metadata + computed output from the server response.
        this.proformaScenario = { ...data.scenario, locked: false };
        this.proformaComputed = data.computed;
        this.proformaDirty = false;
      } catch (e) {
        console.error('Failed to save shared proforma', e);
        this.embedError = 'Could not save your changes. Please try again.';
      } finally {
        this.proformaLoading = false;
      }
    },

    // Discard unsaved edits by re-fetching the variant from the server.
    async resetProformaToBaseline() {
      if (!this.proformaScenario || this.proformaScenario.locked) return;
      if (!confirm('Revert to the last saved version? Unsaved edits will be lost.')) return;
      await this.loadShare();
    },

    // The embed has no scenario list — the back arrow in the editor header is
    // inert here (there is nowhere to go back to).
    proformaBackToList() {},

    // ── Local, recompute-only delegates (no admin API; safe in the embed) ──
    proformaRecompute() { proformaService.recompute(this); },
    proformaMarkDirty() { proformaService.markDirty(this); },
    addProformaMachine() { proformaService.addMachine(this); },
    removeProformaMachine(index) { proformaService.removeMachine(this, index); },
    addProformaRaise() { proformaService.addRaise(this); },
    removeProformaRaise(index) { proformaService.removeRaise(this, index); },
    addProformaHistoricalLine() { proformaService.addHistoricalLine(this); },
    removeProformaHistoricalLine(index) { proformaService.removeHistoricalLine(this, index); },
    toggleProformaHistorical() { proformaService.toggleHistorical(this); },
    proformaHistoricalNet() { return proformaService.historicalNet(this); },
    addProformaRevenueStream(opts) { proformaService.addRevenueStream(this, opts); },
    removeProformaRevenueStream(streamId) { proformaService.removeRevenueStream(this, streamId); },
    toggleProformaRevenueStream(streamId) { proformaService.toggleRevenueStream(this, streamId); },
    setProformaStreamMarketMode(streamId, mode) { proformaService.setStreamMarketMode(this, streamId, mode); },
    setProformaStreamDirectInput(streamId, input) { proformaService.setStreamDirectInput(this, streamId, input); },
    addProformaMarketSource(opts) { return proformaService.addMarketSource(this, opts); },
    removeProformaMarketSource(sourceId) { proformaService.removeMarketSource(this, sourceId); },
    countProformaStreamsLinkedToSource(sourceId) { return proformaService.countStreamsLinkedToSource(this, sourceId); },
    reseedProformaMarketSources() { proformaService._reseedMarketSources(this); },
    onDeleteProformaMarketSource(sourceId) {
      const n = proformaService.countStreamsLinkedToSource(this, sourceId);
      const msg = n > 0
        ? `This source is linked by ${n} revenue stream${n === 1 ? '' : 's'}. Deleting it will leave those streams with $0 revenue until you re-link them. Delete anyway?`
        : 'Delete this market source?';
      if (confirm(msg)) proformaService.removeMarketSource(this, sourceId);
    },
    normalizeProformaQDist(arr) { proformaService.normalizeQDist(arr); proformaService.recompute(this); },
    toggleProformaSalaryMode(yearKey, role) { proformaService.toggleSalaryMode(this, yearKey, role); },
    addProformaMachinePayment(mi) { proformaService.addMachinePayment(this, mi); },
    removeProformaMachinePayment(mi, pi) { proformaService.removeMachinePayment(this, mi, pi); },
    setProformaScheduleQuarterField(kilnType, yearIdx, quarterIdx, field, rawValue) {
      proformaService.setScheduleQuarterField(this, kilnType, yearIdx, quarterIdx, field, rawValue);
    },
    clearProformaScheduleQuarter(kilnType, yearIdx, quarterIdx) {
      proformaService.clearScheduleQuarter(this, kilnType, yearIdx, quarterIdx);
    },
    copyProformaPilotScheduleToBroderick() {
      proformaService.copyPilotScheduleToBroderick(this);
    },
    setProformaBiocharQuarter(yearIdx, quarterIdx, rawValue) {
      proformaService.setBiocharQuarter(this, yearIdx, quarterIdx, rawValue);
    },
    clearProformaBiocharQuarter(yearIdx, quarterIdx) {
      proformaService.clearBiocharQuarter(this, yearIdx, quarterIdx);
    },
    addProformaFteRole() { proformaService.addFteRole(this); },
    removeProformaFteRole(index) { proformaService.removeFteRole(this, index); },

    // ── Read-only view helpers ──
    getProformaOutlookRows() { return proformaService.getOutlookRows(this); },
    getProformaColumns() { return proformaService.getColumnLabels(this); },
    getProformaDisplayColumns() { return proformaService.getDisplayColumns(this); },
    getProformaDisplayData(row) { return proformaService.getDisplayData(row, this); },
    getProformaGanttRows() { return proformaService.getProductionGanttRows(this); },
    getProformaProductionRows() { return proformaService.getProductionTableRows(this); },
    getProformaSummary() { return proformaService.getSummary(this); },

    // ── PDF export (Summary tab) ──
    printProformaSummary() {
      document.body.classList.add('printing-proforma-summary');
      window.print();
      document.body.classList.remove('printing-proforma-summary');
    },

    // ── Outlook cell explainer (double-click a cell) ──
    openProformaExplainerFromCell(row, displayIndex, isTotal, event) {
      const view = this.proformaOutlookView;
      let targetView = view;
      let periodIndex;
      if (view === 'yearly') {
        periodIndex = displayIndex;
      } else {
        const block = view === 'monthly' ? 13 : 5;
        const yearIdx = Math.floor(displayIndex / block);
        if (isTotal) {
          targetView = 'yearly';
          periodIndex = yearIdx;
        } else {
          periodIndex = displayIndex - yearIdx;
        }
      }
      this._openProformaExplainerInternal(row.key, periodIndex, row.label, targetView, event);
    },
    _openProformaExplainerInternal(rowKey, periodIndex, label, view, event) {
      let anchor = null;
      if (event && event.currentTarget) {
        const r = event.currentTarget.getBoundingClientRect();
        anchor = { top: r.top, left: r.left, width: r.width, height: r.height };
      }
      this.proformaExplainerStack = [];
      this.proformaExplainer = { rowKey, periodIndex, label, view, anchor };
      if (window.getSelection) {
        try { window.getSelection().removeAllRanges(); } catch (e) { /* ignore */ }
      }
    },
    closeProformaExplainer() {
      this.proformaExplainer = null;
      this.proformaExplainerStack = [];
    },
    drillProformaExplainer(rowKey, label) {
      if (!this.proformaExplainer) return;
      this.proformaExplainerStack.push({ ...this.proformaExplainer });
      this.proformaExplainer = { ...this.proformaExplainer, rowKey, label: label || rowKey };
    },
    backProformaExplainer() {
      const prev = this.proformaExplainerStack.pop();
      if (prev) this.proformaExplainer = prev;
    },
    getProformaExplain() {
      const e = this.proformaExplainer;
      if (!e) return null;
      return explainProformaCell({
        computed: this.proformaComputed,
        assumptions: this.proformaAssumptions,
        rowKey: e.rowKey,
        periodIndex: e.periodIndex,
        view: e.view,
        label: e.label
      });
    },
    jumpToProformaSection(section) {
      if (!section) return;
      this.proformaEditorTab = 'assumptions';
      this.proformaSection = section;
      this.closeProformaExplainer();
    },
    formatProformaExplainValue(val, format) {
      if (val === '—' || val == null) return val ?? '—';
      if (typeof val !== 'number') return val;
      if (format === 'percent') return (val * 100).toFixed(2) + '%';
      if (format === 'kg') return Math.round(val).toLocaleString() + ' kg';
      if (format === 'count') return Math.round(val).toLocaleString();
      if (format === 'pricePerKg') return '$' + val.toFixed(2) + '/kg';
      if (format === 'multiplier') return val.toFixed(2) + '×';
      if (format === 'none') return String(val);
      return window._pfFmtC(val, true);
    },
    getStreamCommissionIncome(streamIndex, yr) {
      const stream = this.proformaAssumptions?.revenue?.streams?.[streamIndex];
      if (!stream) return '$0';
      const rev = stream.market?.revenueByYear?.[yr] || 0;
      const rate = stream.commission?.rateByYear?.[yr] || 0;
      return '$' + Math.round(rev * rate).toLocaleString();
    },

    // ── Charts ──
    renderProformaCharts() { proformaService.renderCharts(this); },
    openProformaFullscreenChart(canvasId) {
      this.proformaFullscreenChart = canvasId;
      this.$nextTick(() => proformaService.renderFullscreenChart(canvasId));
    },
    closeProformaFullscreenChart() {
      proformaService.destroyFullscreenChart();
      this.proformaFullscreenChart = null;
    },

    // The shared editor template is rendered via x-html.
    getProformaTabHtml() { return buildProformaTabHtml(); }
  };
};

console.log('proformaEmbedApp defined on window:', typeof window.proformaEmbedApp);
