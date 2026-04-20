// ═══════════════════════════════════════════════════════════════
// Proforma Shared Helpers
// ═══════════════════════════════════════════════════════════════

import { isLocked } from '@shared/proformaLockedFields.js';

export const HELP = {
  'production.initialBiocharUseG': 'Grams of biochar per batch loaded into the kiln',
  'production.initialKOHG': 'Grams of KOH (potassium hydroxide) per batch',
  'production.densityMix': 'KOH + biochar mixture density in g/mL, used to compute volume per batch',
  'production.grapheneYieldPercent': 'Fraction of biochar mass converted to graphene (0 to 1)',
  'production.bufferToggle': 'Master production multiplier. 1.0 = full capacity, 0.5 = half',
  'production.volumeConversionCuFt': 'mL to cubic feet conversion factor',
  'production.smallKilnCuFtPerHour': 'Continuous feed rate for pilot kilns',
  'production.largeKilnCuFtPerHour': 'Continuous feed rate for Broderick kilns',
  'production.efficiencyByYear': 'Cost multiplier per year. Lower = cheaper operations as processes mature',
  'opex.benefitsPct': 'Benefits as % of total staffing cost. Applied from Month 3 onward',
  'opex.uofaRoyaltyPct': 'University of Alberta royalty on positive gross margin',
  'opex.salesCommissionPct': 'Sales commission on gross margin. Starts Y1 Q2 (Month 15)',
  'opex.generalOverhead.base': 'Annual total: T&E $100K + Internet $5K + Marketing $50K + Misc $15K',
  'revenue.startMonth': 'First month (0-indexed) when revenue is recognized for this segment',
  'revenue.qDist': 'Quarterly revenue distribution weights. Must sum to 1.0',
  'cogs.hempCostPerKilo': 'Raw hemp cost before contingency and shipping',
  'cogs.hempContingencyPct': 'Contingency markup on hemp cost (e.g., 0.35 = 35%)',
  'cogs.hempShippingPerKilo': 'Shipping cost per kg of hemp',
  'manufacturing.shiftsPerMonth': 'Working shifts per month for FTE cost calculation',
  'manufacturing.maintenanceContingencyPct': 'Maintenance cost as % of labor cost',
  'manufacturing.validationPhaseMonthly': 'Monthly cost during machine validation (pre-production)',
  'capital.startingCash': 'Cash on hand at Month 0 before any investment',
  'capital.initialInvestment': 'Seed investment credited at Month 0',
  'technical.evBattery.cathodeAnodeRatio': 'Weight ratio of cathode to anode active material',
  'technical.hgrapheneReplacement.cathodeEfficiencyFactor': 'HGraphene replaces this multiple of its weight in carbon black',
  'technical.market.evCagr': 'Year-over-year growth multiplier (e.g., 1.20 = 20% growth)',
};

// Enhanced number input with optional help text, unit suffix, and computed indicator.
// If the field's dotted path is in shared/proformaLockedFields.js, it renders
// disabled with a red-tinted "locked" style (derived from formula, don't edit).
export function numInput(label, path, opts = {}) {
  const { step = 1, help, unit, indicator, wide } = opts;
  const widthClass = wide ? 'sm:col-span-2' : '';
  const locked = isLocked(path);
  const inputClass = locked
    ? 'w-full text-sm border rounded-md px-2.5 py-1.5 font-mono bg-red-50 border-red-200 text-red-400 cursor-not-allowed'
    : 'w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-black focus:border-black font-mono';
  const inputAttrs = locked
    ? `disabled title="Locked — derived from formula, edit in the source spreadsheet"`
    : `@input="${path} = +$event.target.value; proformaRecompute()"`;
  const lockIcon = locked
    ? `<svg class="inline w-3 h-3 ml-1 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>`
    : '';
  return `
    <div class="${widthClass}">
      <label class="block text-[11px] font-medium text-gray-500 mb-1">${label}${unit ? ` <span class="text-gray-400 font-normal">(${unit})</span>` : ''}${lockIcon}</label>
      <input type="number" step="${step}"
             :value="${path}"
             ${inputAttrs}
             class="${inputClass}">
      ${indicator ? `<span class="block text-[10px] text-gray-400 font-mono mt-0.5" x-text="${indicator}"></span>` : ''}
      ${help ? `<span class="block text-[10px] text-gray-400 italic mt-0.5">${help}</span>` : ''}
    </div>
  `;
}

// Card wrapper with title
export function card(title, content, opts = {}) {
  const { subtitle } = opts;
  return `
    <div class="border border-gray-200 rounded-lg overflow-hidden">
      <div class="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <h4 class="text-sm font-semibold text-gray-700">${title}</h4>
        ${subtitle ? `<p class="text-[10px] text-gray-400 mt-0.5">${subtitle}</p>` : ''}
      </div>
      <div class="px-4 py-3">
        ${content}
      </div>
    </div>
  `;
}

// Year x Quarter editable matrix with computed Annual column
export function quarterlyMatrix(title, basePath, opts = {}) {
  const { showTotal } = opts;
  return card(title, `
    <div class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr class="text-gray-500">
            <th class="text-left py-1.5 pr-2 font-medium w-16"></th>
            <th class="text-right py-1.5 px-1.5 font-medium">Q1</th>
            <th class="text-right py-1.5 px-1.5 font-medium">Q2</th>
            <th class="text-right py-1.5 px-1.5 font-medium">Q3</th>
            <th class="text-right py-1.5 px-1.5 font-medium">Q4</th>
            <th class="text-right py-1.5 pl-2 font-medium border-l border-gray-200 text-gray-600">Annual</th>
          </tr>
        </thead>
        <tbody>
          <template x-for="yr in ['year0','year1','year2','year3']" :key="yr">
            <tr class="border-t border-gray-100">
              <td class="py-1 pr-2 text-gray-500 font-medium" x-text="yr.replace('year','Y')"></td>
              <template x-for="qi in [0,1,2,3]" :key="qi">
                <td class="py-1 px-1">
                  <input type="number" :value="${basePath}[yr][qi]"
                         @input="${basePath}[yr][qi] = +$event.target.value; proformaRecompute()"
                         class="w-full text-right text-xs border-gray-300 rounded px-1.5 py-1 font-mono focus:ring-1 focus:ring-black focus:border-black">
                </td>
              </template>
              <td class="py-1 pl-2 text-right font-mono text-gray-600 border-l border-gray-200"
                  x-text="window._pfFmtC(${basePath}[yr].reduce((a,b) => a+b, 0), true)"></td>
            </tr>
          </template>
          ${showTotal ? `
          <tr class="border-t border-gray-300">
            <td class="py-1.5 pr-2 text-gray-700 font-semibold">Total</td>
            <td colspan="4"></td>
            <td class="py-1.5 pl-2 text-right font-mono font-semibold text-gray-700 border-l border-gray-200"
                x-text="window._pfFmtC(['year0','year1','year2','year3'].reduce((t,yr) => t + ${basePath}[yr].reduce((a,b) => a+b, 0), 0), true)"></td>
          </tr>` : ''}
        </tbody>
      </table>
    </div>
  `);
}

// Metrics banner (sticky, always visible)
export function metricsBanner() {
  return `
    <div x-show="proformaComputed" class="sticky top-0 z-20 bg-white border-b border-gray-200 -mx-4 px-4 py-2 mb-4" style="margin-top:-1rem; padding-top:0.75rem;">
      <div class="grid grid-cols-3 lg:grid-cols-6 gap-2">
        <div class="text-center">
          <p class="text-[10px] uppercase tracking-wide text-gray-400">Break-Even</p>
          <p class="text-sm font-semibold text-gray-900 font-mono" x-text="proformaComputed.metrics.breakEvenMonth >= 0 ? 'Month ' + proformaComputed.metrics.breakEvenMonth : 'N/A'"></p>
        </div>
        <div class="text-center">
          <p class="text-[10px] uppercase tracking-wide text-gray-400">Peak Cash Need</p>
          <p class="text-sm font-semibold text-red-600 font-mono" x-text="window._pfFmtC(proformaComputed.metrics.peakCashNeed, true)"></p>
        </div>
        <div class="text-center">
          <p class="text-[10px] uppercase tracking-wide text-gray-400">Y3 Revenue</p>
          <p class="text-sm font-semibold text-gray-900 font-mono" x-text="window._pfFmtC(proformaComputed.metrics.y3Revenue, true)"></p>
        </div>
        <div class="text-center">
          <p class="text-[10px] uppercase tracking-wide text-gray-400">Y3 EBITDA Margin</p>
          <p class="text-sm font-semibold font-mono" :class="proformaComputed.metrics.y3EbitdaMargin >= 0 ? 'text-green-700' : 'text-red-600'"
             x-text="window._pfFmtP(proformaComputed.metrics.y3EbitdaMargin)"></p>
        </div>
        <div class="text-center">
          <p class="text-[10px] uppercase tracking-wide text-gray-400">Total CapEx</p>
          <p class="text-sm font-semibold text-gray-900 font-mono" x-text="window._pfFmtC(proformaComputed.metrics.totalCapex, true)"></p>
        </div>
        <div class="text-center">
          <p class="text-[10px] uppercase tracking-wide text-gray-400">Peak Production</p>
          <p class="text-sm font-semibold text-gray-900 font-mono" x-text="proformaComputed.metrics.peakMonthlyProductionKg ? Math.round(proformaComputed.metrics.peakMonthlyProductionKg).toLocaleString() + ' kg/mo' : '--'"></p>
        </div>
      </div>
    </div>
  `;
}

// Section navigation (vertical on desktop, horizontal on mobile)
export function sectionNav() {
  const sections = [
    { id: 'production', label: 'Production', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17l-5.384 3.03 1.029-5.997L2.1 7.39l6.022-.875L11.42 1.5l2.691 5.015 6.022.875-4.965 4.813 1.029 5.997z"/>' },
    { id: 'revenue', label: 'Revenue', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>' },
    { id: 'costs', label: 'Costs', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>' },
    { id: 'operations', label: 'Operations', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>' },
    { id: 'machines', label: 'Machines', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>' },
    { id: 'capital', label: 'Capital', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21"/>' },
    { id: 'technical', label: 'Technical', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/>' },
  ];

  return `
    <!-- Desktop: vertical nav -->
    <div class="hidden lg:block w-44 shrink-0 space-y-0.5 pr-4 border-r border-gray-200">
      ${sections.map(s => `
        <button @click="proformaSection = '${s.id}'"
                :class="proformaSection === '${s.id}' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'"
                class="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">${s.icon}</svg>
          ${s.label}
        </button>
      `).join('')}
    </div>
    <!-- Mobile: horizontal scrollable pills -->
    <div class="lg:hidden flex gap-1 overflow-x-auto pb-3 mb-3 border-b border-gray-200 -mx-4 px-4">
      ${sections.map(s => `
        <button @click="proformaSection = '${s.id}'"
                :class="proformaSection === '${s.id}' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors">
          ${s.label}
        </button>
      `).join('')}
    </div>
  `;
}
