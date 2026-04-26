// ═══════════════════════════════════════════════════════════════
// Proforma — Sticky metrics header + section journey nav
// ═══════════════════════════════════════════════════════════════
// Top-of-assumptions chrome that stays fixed as you scroll through
// the editor. Six metric tiles on top, six section pills below.
// Each pill shows a live per-section headline metric so the nav
// itself doubles as an at-a-glance dashboard.

export const JOURNEY_SECTIONS = [
  { id: 'revenue',    label: 'Revenue',    headline: `proformaComputed ? window._pfFmtC(proformaComputed.metrics.y3Revenue, true) + ' Y3' : '--'` },
  { id: 'markets',    label: 'Markets',    headline: `proformaMarketSources?.length ? proformaMarketSources.length + ' sources' : '--'` },
  { id: 'production', label: 'Production', headline: `proformaComputed?.metrics?.peakMonthlyProductionKg ? Math.round(proformaComputed.metrics.peakMonthlyProductionKg).toLocaleString() + ' kg/mo peak' : '--'` },
  { id: 'costs',      label: 'Costs',      headline: `proformaComputed?.yearly?.grossMarginPct ? window._pfFmtP(proformaComputed.yearly.grossMarginPct[3]) + ' Y3 margin' : '--'` },
  { id: 'operations', label: 'Operations', headline: `proformaComputed ? window._pfFmtP(proformaComputed.metrics.y3EbitdaMargin) + ' EBITDA' : '--'` },
  { id: 'machines',   label: 'Machines',   headline: `proformaComputed ? window._pfFmtC(proformaComputed.metrics.totalCapex, true) + ' CapEx' : '--'` },
  { id: 'capital',    label: 'Capital',    headline: `proformaComputed ? window._pfFmtC(proformaComputed.metrics.peakCashNeed, true) + ' peak need' : '--'` }
];

export function metricsAndNav() {
  const pillsHtml = JOURNEY_SECTIONS.map(s => `
    <button @click="proformaSection = '${s.id}'; proformaSectionsReviewed['${s.id}'] = true"
            :class="proformaSection === '${s.id}'
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'"
            class="group flex-1 min-w-[120px] flex items-center gap-2.5 px-3 py-2 rounded-lg
                   text-left transition-all border">
      <span class="w-0.5 self-stretch rounded-full"
            :class="proformaSection === '${s.id}'
              ? 'bg-white/40'
              : (proformaSectionsReviewed['${s.id}'] ? 'bg-blue-400' : 'bg-gray-200')"></span>
      <span class="min-w-0 flex-1">
        <span class="block text-[13px] font-medium truncate">${s.label}</span>
        <span class="block text-[10px] font-mono truncate mt-0.5"
              :class="proformaSection === '${s.id}' ? 'text-gray-300' : 'text-gray-400'"
              x-text="${s.headline}"></span>
      </span>
    </button>
  `).join('');

  return `
    <div x-show="proformaComputed" class="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-200 -mx-4 px-4 pt-2 pb-3 mb-6" style="margin-top:-0.5rem;">
      <!-- Metric tiles -->
      <div class="grid grid-cols-3 lg:grid-cols-6 gap-px bg-gray-100 border border-gray-200 rounded-lg overflow-hidden mb-3">
        <div class="bg-white px-3 py-2">
          <p class="text-[10px] uppercase tracking-[0.08em] text-gray-400 font-medium">Break-Even</p>
          <p class="text-base font-semibold text-gray-900 font-mono tabular-nums mt-0.5"
             x-text="proformaComputed.metrics.breakEvenMonth >= 0 ? 'Mo ' + proformaComputed.metrics.breakEvenMonth : 'N/A'"></p>
        </div>
        <div class="bg-white px-3 py-2">
          <p class="text-[10px] uppercase tracking-[0.08em] text-gray-400 font-medium">Peak Cash Need</p>
          <p class="text-base font-semibold text-red-600 font-mono tabular-nums mt-0.5"
             x-text="window._pfFmtC(proformaComputed.metrics.peakCashNeed, true)"></p>
        </div>
        <div class="bg-white px-3 py-2">
          <p class="text-[10px] uppercase tracking-[0.08em] text-gray-400 font-medium">Y3 Revenue</p>
          <p class="text-base font-semibold text-gray-900 font-mono tabular-nums mt-0.5"
             x-text="window._pfFmtC(proformaComputed.metrics.y3Revenue, true)"></p>
        </div>
        <div class="bg-white px-3 py-2">
          <p class="text-[10px] uppercase tracking-[0.08em] text-gray-400 font-medium">Y3 EBITDA</p>
          <p class="text-base font-semibold font-mono tabular-nums mt-0.5"
             :class="proformaComputed.metrics.y3EbitdaMargin >= 0 ? 'text-green-700' : 'text-red-600'"
             x-text="window._pfFmtP(proformaComputed.metrics.y3EbitdaMargin)"></p>
        </div>
        <div class="bg-white px-3 py-2">
          <p class="text-[10px] uppercase tracking-[0.08em] text-gray-400 font-medium">Total CapEx</p>
          <p class="text-base font-semibold text-gray-900 font-mono tabular-nums mt-0.5"
             x-text="window._pfFmtC(proformaComputed.metrics.totalCapex, true)"></p>
        </div>
        <div class="bg-white px-3 py-2">
          <p class="text-[10px] uppercase tracking-[0.08em] text-gray-400 font-medium">Peak Production</p>
          <p class="text-base font-semibold text-gray-900 font-mono tabular-nums mt-0.5"
             x-text="proformaComputed.metrics.peakMonthlyProductionKg ? Math.round(proformaComputed.metrics.peakMonthlyProductionKg).toLocaleString() + ' kg/mo' : '--'"></p>
        </div>
      </div>

      <!-- Journey pills -->
      <nav class="flex items-stretch gap-2 overflow-x-auto" aria-label="Proforma sections">
        ${pillsHtml}
      </nav>
    </div>
  `;
}
