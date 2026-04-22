// ═══════════════════════════════════════════════════════════════
// Proforma — Conversational Card Components (2027 redesign)
// ═══════════════════════════════════════════════════════════════
// Reusable HTML builders for the redesigned assumptions editor.
// Each section composes `conversationalCard` + optional `timelineCard`,
// with the less-strategic inputs hidden behind `advancedReveal`.

// ── formatting helpers ──

// Given a dotted assumption path and a format tag, return the Alpine
// expression used for :value= (display) and the handler body for @input=.
// Formats:
//   'fraction-percent' — stored as 0–1 fraction, displayed as 0–100 %
//   'percent'          — stored and displayed as percent
//   'currency'         — stored and displayed as dollars
//   'number'           — pass-through
//   'month'            — stored and displayed as month index
function _displayExpr(path, format) {
  if (format === 'fraction-percent') return `((${path} || 0) * 100).toFixed(2).replace(/\\.?0+$/, '')`;
  return path;
}
function _inputHandler(path, format) {
  if (format === 'fraction-percent') return `${path} = +$event.target.value / 100; proformaRecompute()`;
  return `${path} = +$event.target.value; proformaRecompute()`;
}

// ── sectionHero ──
// Renders a one-sentence question + supporting line at the top of a section.
export function sectionHero(question, supporting) {
  return `
    <header class="mb-6">
      <h2 class="text-[22px] leading-tight font-semibold text-gray-900 tracking-tight">${question}</h2>
      ${supporting ? `<p class="text-sm text-gray-500 mt-1.5 max-w-2xl">${supporting}</p>` : ''}
    </header>
  `;
}

// ── conversationalCard ──
// opts:
//   sentence       — HTML string with the literal token __INPUT__ where the input goes
//   path           — dotted path (e.g. 'proformaAssumptions.revenue.supercap...')
//   unit           — glyph shown after the number (e.g. '%', '$', 'mo')
//   unitPosition   — 'after' (default) | 'before'
//   format         — see _displayExpr/_inputHandler; default 'number'
//   step           — HTML step attribute; default 1
//   inputWidth     — tailwind width class for the input (default 'w-24')
//   slider         — optional { min, max, step, stops: number[] }
//   impact         — optional { label, expr, deltaKey }
//                    label: short string ("Y3 revenue")
//                    expr:  Alpine expression returning a formatted string
//                    deltaKey: optional key into proformaBaseline for signed-delta suffix
//   size           — 'default' | 'compact' (compact for advanced reveals)
export function conversationalCard(opts) {
  const {
    sentence,
    path,
    unit = '',
    unitPosition = 'after',
    format = 'number',
    step = 1,
    inputWidth = 'w-24',
    slider,
    impact,
    size = 'default'
  } = opts;

  const displayValue = _displayExpr(path, format);
  const handler = _inputHandler(path, format);

  const unitGlyph = unit
    ? `<span class="text-lg text-gray-400 ml-0.5 select-none">${unit}</span>`
    : '';

  const unitBefore = unit && unitPosition === 'before'
    ? `<span class="text-lg text-gray-400 mr-0.5 select-none">${unit}</span>`
    : '';

  const padding = size === 'compact' ? 'p-4' : 'p-6';
  const sentenceSize = size === 'compact' ? 'text-sm' : 'text-[15px]';
  const inputSize = size === 'compact' ? 'text-xl' : 'text-2xl';

  const inputHtml = `
    <span class="inline-flex items-baseline mx-1 align-baseline">
      ${unitPosition === 'before' ? unitBefore : ''}
      <input type="number" step="${step}"
             :value="${displayValue}"
             @input.debounce.150ms="${handler}"
             class="${inputWidth} ${inputSize} font-semibold font-mono text-gray-900
                    bg-transparent border-0 border-b-2 border-gray-200
                    focus:border-gray-900 focus:outline-none focus:ring-0
                    px-1 py-0 text-right tabular-nums transition-colors"
             aria-label="${(opts.ariaLabel || 'value').replace(/"/g, '&quot;')}">
      ${unitPosition === 'after' ? unitGlyph : ''}
    </span>
  `;

  const sentenceHtml = sentence.replace('__INPUT__', inputHtml);

  const sliderHtml = slider ? `
    <div class="mt-5">
      <input type="range"
             min="${slider.min}" max="${slider.max}" step="${slider.step ?? 1}"
             :value="${displayValue}"
             @input="${handler.replace('proformaRecompute()', '')}"
             @change="proformaRecompute()"
             class="w-full accent-gray-900 h-1 cursor-pointer"
             aria-valuemin="${slider.min}" aria-valuemax="${slider.max}">
      ${slider.stops ? `
        <div class="flex justify-between text-[10px] text-gray-400 font-mono mt-1 px-0.5">
          ${slider.stops.map(s => `<span>${s}${unit}</span>`).join('')}
        </div>` : ''}
    </div>
  ` : '';

  let impactHtml = '';
  if (impact) {
    const deltaSuffix = impact.deltaKey
      ? `<span class="text-blue-400/80 font-mono text-[11px]"
               x-show="proformaBaseline"
               x-text="(() => { const b = proformaBaseline?.${impact.deltaKey}; const n = proformaComputed?.metrics?.${impact.deltaKey}; if (b == null || n == null) return ''; const d = n - b; if (Math.abs(d) < 0.01) return ''; const sign = d >= 0 ? '+' : '−'; const abs = Math.abs(d); const fmt = abs >= 1000 ? window._pfFmtC(d, true) : (d >= 0 ? '+' : '') + d.toFixed(2); return '(' + fmt + ')'; })()"></span>`
      : '';

    impactHtml = `
      <div class="mt-4 flex items-center gap-2">
        <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                     bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100
                     text-[12px] font-medium text-blue-900 transition-all"
              aria-live="polite">
          <span class="text-blue-500">→</span>
          <span class="text-blue-700/70">${impact.label}</span>
          <span class="font-mono font-semibold text-blue-900" x-text="${impact.expr}"></span>
          ${deltaSuffix}
        </span>
      </div>
    `;
  }

  return `
    <article class="group relative rounded-2xl border border-gray-200 bg-white ${padding}
                   transition-all hover:border-gray-300 hover:shadow-sm
                   focus-within:border-gray-900 focus-within:shadow-md">
      <p class="${sentenceSize} leading-relaxed text-gray-700 tracking-tight">
        ${sentenceHtml}
      </p>
      ${sliderHtml}
      ${impactHtml}
    </article>
  `;
}

// ── timelineCard ──
// Multi-input card for year-over-year timelines ("from X in Y1 → Y in Y2 → Z in Y3").
// opts:
//   title: string — e.g. "Supercap pricing"
//   supporting: optional sub-line
//   inputs: [{ label, path, format, step, unit, inputWidth }]
//   impact: same shape as conversationalCard.impact
export function timelineCard(opts) {
  const { title, supporting, inputs, impact } = opts;

  const cells = inputs.map(inp => {
    const displayValue = _displayExpr(inp.path, inp.format || 'number');
    const handler = _inputHandler(inp.path, inp.format || 'number');
    const unit = inp.unit || '';
    return `
      <div class="flex flex-col items-center gap-2">
        <span class="text-[10px] uppercase tracking-[0.08em] text-gray-400 font-medium">${inp.label}</span>
        <span class="inline-flex items-baseline">
          <input type="number" step="${inp.step ?? 1}"
                 :value="${displayValue}"
                 @input.debounce.150ms="${handler}"
                 class="${inp.inputWidth || 'w-20'} text-xl font-semibold font-mono text-gray-900
                        bg-transparent border-0 border-b-2 border-gray-200
                        focus:border-gray-900 focus:outline-none focus:ring-0
                        px-1 py-0 text-right tabular-nums transition-colors">
          ${unit ? `<span class="text-sm text-gray-400 ml-0.5 select-none">${unit}</span>` : ''}
        </span>
      </div>
    `;
  }).join(`
    <span class="text-gray-300 text-xl self-end mb-1.5 select-none">→</span>
  `);

  let impactHtml = '';
  if (impact) {
    impactHtml = `
      <div class="mt-5 flex items-center gap-2">
        <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                     bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100
                     text-[12px] font-medium text-blue-900" aria-live="polite">
          <span class="text-blue-500">→</span>
          <span class="text-blue-700/70">${impact.label}</span>
          <span class="font-mono font-semibold text-blue-900" x-text="${impact.expr}"></span>
        </span>
      </div>
    `;
  }

  return `
    <article class="group relative rounded-2xl border border-gray-200 bg-white p-6
                   transition-all hover:border-gray-300 hover:shadow-sm
                   focus-within:border-gray-900 focus-within:shadow-md">
      <div class="mb-4">
        <h3 class="text-[15px] font-semibold text-gray-900 tracking-tight">${title}</h3>
        ${supporting ? `<p class="text-xs text-gray-500 mt-1">${supporting}</p>` : ''}
      </div>
      <div class="flex items-end justify-start gap-3 flex-wrap">
        ${cells}
      </div>
      ${impactHtml}
    </article>
  `;
}

// ── advancedReveal ──
// Collapsible container for the "less strategic" fields under each section.
// sectionId: unique id used for Alpine state (e.g. 'revenue').
// fieldCount: number shown in the toggle label.
// bodyHtml: the advanced fields.
export function advancedReveal(sectionId, fieldCount, bodyHtml) {
  const stateKey = `proformaAdvancedOpen.${sectionId}`;
  return `
    <div class="mt-8 border-t border-gray-200 pt-6">
      <button @click="${stateKey} = !${stateKey}"
              class="flex items-center gap-2 text-sm font-medium text-gray-500
                     hover:text-gray-900 transition-colors"
              :aria-expanded="${stateKey} ? 'true' : 'false'">
        <svg class="w-4 h-4 transition-transform"
             :class="${stateKey} ? 'rotate-90' : ''"
             fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
        <span x-text="${stateKey} ? 'Hide advanced' : 'Show advanced (${fieldCount} more ${fieldCount === 1 ? 'field' : 'fields'})'"></span>
      </button>
      <div x-show="${stateKey}" x-collapse class="mt-5 space-y-4">
        ${bodyHtml}
      </div>
    </div>
  `;
}

// ── journey bar sections ──
// Ordered narratively: Revenue first (biggest lever in a fundraising convo),
// then production → costs → operations → machines → capital.
export const JOURNEY_SECTIONS = [
  { id: 'revenue',    label: 'Revenue',    headline: `proformaComputed ? window._pfFmtC(proformaComputed.metrics.y3Revenue, true) + ' Y3' : '--'` },
  { id: 'production', label: 'Production', headline: `proformaComputed?.metrics?.peakMonthlyProductionKg ? Math.round(proformaComputed.metrics.peakMonthlyProductionKg).toLocaleString() + ' kg/mo peak' : '--'` },
  { id: 'costs',      label: 'Costs',      headline: `proformaComputed?.yearly?.grossMarginPct ? window._pfFmtP(proformaComputed.yearly.grossMarginPct[3]) + ' Y3 margin' : '--'` },
  { id: 'operations', label: 'Operations', headline: `proformaComputed ? window._pfFmtP(proformaComputed.metrics.y3EbitdaMargin) + ' EBITDA' : '--'` },
  { id: 'machines',   label: 'Machines',   headline: `proformaComputed ? window._pfFmtC(proformaComputed.metrics.totalCapex, true) + ' CapEx' : '--'` },
  { id: 'capital',    label: 'Capital',    headline: `proformaComputed ? window._pfFmtC(proformaComputed.metrics.peakCashNeed, true) + ' peak need' : '--'` }
];

// ── metricsAndNav ──
// Sticky combined header: 6 metric tiles on top row, journey pills below.
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
