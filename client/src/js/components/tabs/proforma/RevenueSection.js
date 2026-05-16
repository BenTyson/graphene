import { numInput, sectionHeader } from './helpers.js';

// Revenue tab — one self-contained card per stream, structured as a
// numbered recipe so the mental model reads top-to-bottom:
//   ① Source        (which global TAM does this draw from)
//   ② Capture       (market share + price by year — or direct $/year)
//   ③ Timing        (start month + optional quarterly shape)
//
// Built-ins can be renamed but not deleted; custom streams append at
// the bottom. Every Alpine binding inside a stream card uses
// `proformaAssumptions.revenue.streams[streamIndex]…` where `streamIndex`
// is late-bound from the loop variable so directives stay live across
// add/remove.

const SBASE = 'proformaAssumptions.revenue.streams[streamIndex]';

// ── Per-year quarterly-shape row (Q1–Q4 + sum chip + Normalize) ──
function _qDistRow(yearKey) {
  const arr = `${SBASE}.${yearKey}.qDist`;
  return `
    <div class="flex items-center gap-3">
      <span class="text-[11px] font-semibold text-gray-500 w-6 shrink-0">${yearKey.replace('year', 'Y')}</span>
      <div class="grid grid-cols-4 gap-2 flex-1">
        <template x-for="qi in [0,1,2,3]" :key="qi">
          <div class="flex flex-col items-center">
            <span class="text-[10px] text-gray-400 font-mono" x-text="'Q' + (qi+1)"></span>
            <input type="number" step="0.01"
                   :value="${arr}[qi]"
                   @input="${arr}[qi] = +$event.target.value; proformaRecompute()"
                   class="w-full text-center text-xs border-gray-200 rounded-md px-1.5 py-1 font-mono focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
          </div>
        </template>
      </div>
      <div class="flex items-center gap-2 shrink-0 w-28 justify-end">
        <span class="text-[11px] font-mono tabular-nums"
              :class="Math.abs(${arr}.reduce((a,b) => a+b, 0) - 1.0) < 0.001 ? 'text-green-600' : 'text-red-500'"
              x-text="${arr}.reduce((a,b) => a+b, 0).toFixed(3)"></span>
        <template x-if="Math.abs(${arr}.reduce((a,b) => a+b, 0) - 1.0) < 0.001">
          <svg class="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
          </svg>
        </template>
        <template x-if="Math.abs(${arr}.reduce((a,b) => a+b, 0) - 1.0) >= 0.001">
          <button @click="normalizeProformaQDist(${arr})"
                  class="text-[11px] text-gray-700 hover:text-gray-900 underline">
            Normalize
          </button>
        </template>
      </div>
    </div>
  `;
}

// ① Source — linked-mode only. Dropdown + live Y1→Y3 TAM preview pulled
// from techRef[<linkedSource>ByYear], with a deep-link to the Markets
// section so users can edit the source without losing their place.
function _sourceBlock() {
  const sourceArr = `(proformaComputed?.techRef?.[${SBASE}.market.linkedSource + 'ByYear'] || [])`;
  return `
    <template x-if="${SBASE}.market.mode === 'linked'">
      <section>
        <header class="flex items-baseline gap-2 mb-2">
          <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-semibold">1</span>
          <h4 class="text-sm font-semibold text-gray-800">Source</h4>
          <span class="text-[11px] text-gray-400">Which global TAM this stream draws from</span>
        </header>
        <select
          @change="${SBASE}.market.linkedSource = $event.target.value; proformaRecompute()"
          class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
          <template x-for="src in proformaMarketSources" :key="src.id">
            <option :value="src.id" :selected="src.id === ${SBASE}.market.linkedSource" x-text="src.label"></option>
          </template>
        </select>
        <div class="mt-2 flex items-center justify-between gap-3 text-[11px]">
          <div class="font-mono text-gray-600">
            <span class="text-gray-400">Y1</span>
            <span x-text="(${sourceArr}[0] || 0).toLocaleString()"></span>
            <span class="text-gray-400">kg &rarr; Y3</span>
            <span x-text="(${sourceArr}[2] || 0).toLocaleString()"></span>
            <span class="text-gray-400">kg</span>
          </div>
          <button type="button"
                  @click="proformaSection = 'markets'; proformaSectionsReviewed['markets'] = true"
                  class="text-gray-500 hover:text-gray-900 underline underline-offset-2">
            Edit on Markets &rarr;
          </button>
        </div>
      </section>
    </template>
  `;
}

// ② Capture — linked mode shows market share % by year + sell price by
// year. Direct mode shows yearly $ revenue inputs instead.
function _captureBlock() {
  return `
    <template x-if="${SBASE}.market.mode === 'linked'">
      <section>
        <header class="flex items-baseline gap-2 mb-2">
          <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-semibold">2</span>
          <h4 class="text-sm font-semibold text-gray-800">Capture &amp; price</h4>
          <span class="text-[11px] text-gray-400">Revenue = TAM &times; share &times; $/kg</span>
        </header>
        <div class="space-y-3">
          <div>
            <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Market share by year</p>
            <div class="grid grid-cols-4 gap-3">
              ${numInput('Y1', `${SBASE}.year1.marketSharePct`, { unit: '%', format: 'fraction-percent', step: 0.05 })}
              ${numInput('Y2', `${SBASE}.year2.marketSharePct`, { unit: '%', format: 'fraction-percent', step: 0.05 })}
              ${numInput('Y3', `${SBASE}.year3.marketSharePct`, { unit: '%', format: 'fraction-percent', step: 0.05 })}
              ${numInput('Y4', `${SBASE}.year4.marketSharePct`, { unit: '%', format: 'fraction-percent', step: 0.05 })}
            </div>
          </div>
          <div>
            <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Sell price ($/kg) by year</p>
            <div class="grid grid-cols-5 gap-3">
              ${['year0', 'year1', 'year2', 'year3', 'year4'].map((yr, i) => `
                <div>
                  <label class="block text-[10px] text-gray-400 font-mono mb-0.5">Y${i}</label>
                  <input type="number" step="1"
                         :value="${SBASE}.pricing.${yr}"
                         @input="${SBASE}.pricing.${yr} = +$event.target.value; proformaRecompute()"
                         class="w-full text-sm border-gray-300 rounded-md px-2 py-1.5 font-mono tabular-nums focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </section>
    </template>

    <template x-if="${SBASE}.market.mode === 'direct'">
      <section class="space-y-4">
        <!-- $ vs kg input-mode sub-toggle -->
        <div class="flex items-center gap-2">
          <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Drive from</span>
          <div class="inline-flex rounded-md bg-gray-100 p-0.5">
            <button type="button"
                    @click="setProformaStreamDirectInput(${SBASE}.id, 'revenue')"
                    :class="(${SBASE}.market.directInput || 'revenue') === 'revenue' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                    class="px-2.5 py-1 text-[11px] font-medium rounded transition-colors">
              $ &rarr; kg
            </button>
            <button type="button"
                    @click="setProformaStreamDirectInput(${SBASE}.id, 'kg')"
                    :class="${SBASE}.market.directInput === 'kg' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                    class="px-2.5 py-1 text-[11px] font-medium rounded transition-colors">
              kg &rarr; $
            </button>
          </div>
        </div>

        <!-- $-driven: enter yearly revenue, derive kg -->
        <template x-if="(${SBASE}.market.directInput || 'revenue') === 'revenue'">
          <div>
            <header class="flex items-baseline gap-2 mb-2">
              <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-semibold">1</span>
              <h4 class="text-sm font-semibold text-gray-800">Yearly revenue</h4>
              <span class="text-[11px] text-gray-400">Set the dollar amount; kg derived from price below</span>
            </header>
            <div class="grid grid-cols-4 gap-3">
              ${['year1','year2','year3','year4'].map((yr, i) => numInput(`Y${i+1}`, `${SBASE}.market.revenueByYear.${yr}`, {
                unit: '$', step: 10000,
                indicator: `(${SBASE}.market.revenueByYear.${yr} > 0 && ${SBASE}.pricing.${yr} > 0) ? '≈ ' + Math.round(${SBASE}.market.revenueByYear.${yr} / ${SBASE}.pricing.${yr}).toLocaleString() + ' kg' : (${SBASE}.market.revenueByYear.${yr} > 0 ? '⚠ set price below' : '—')`
              })).join('')}
            </div>
          </div>
        </template>

        <!-- kg-driven: enter yearly kg, derive revenue -->
        <template x-if="${SBASE}.market.directInput === 'kg'">
          <div>
            <header class="flex items-baseline gap-2 mb-2">
              <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-semibold">1</span>
              <h4 class="text-sm font-semibold text-gray-800">Yearly kg sold</h4>
              <span class="text-[11px] text-gray-400">Set the kilos; revenue derived from price below</span>
            </header>
            <div class="grid grid-cols-4 gap-3">
              ${['year1','year2','year3','year4'].map((yr, i) => numInput(`Y${i+1}`, `${SBASE}.market.kgByYear.${yr}`, {
                unit: 'kg', step: 100,
                indicator: `(${SBASE}.market.kgByYear.${yr} > 0 && ${SBASE}.pricing.${yr} > 0) ? '≈ $' + Math.round(${SBASE}.market.kgByYear.${yr} * ${SBASE}.pricing.${yr}).toLocaleString() : (${SBASE}.market.kgByYear.${yr} > 0 ? '⚠ set price below' : '—')`
              })).join('')}
            </div>
          </div>
        </template>

        <div>
          <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Sell price ($/kg) by year</p>
          <div class="grid grid-cols-4 gap-3">
            ${['year1','year2','year3','year4'].map((yr, i) => `
              <div>
                <label class="block text-[10px] text-gray-400 font-mono mb-0.5">Y${i+1}</label>
                <input type="number" step="1"
                       :value="${SBASE}.pricing.${yr}"
                       @input="${SBASE}.pricing.${yr} = +$event.target.value; proformaRecompute()"
                       class="w-full text-sm border-gray-300 rounded-md px-2 py-1.5 font-mono tabular-nums focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
              </div>
            `).join('')}
          </div>
        </div>

        <div class="border-t border-gray-100 pt-4">
          <div class="flex items-center gap-3 mb-3">
            <button type="button"
                    @click="if (!${SBASE}.commission) ${SBASE}.commission = { enabled: false, rateByYear: { year1: 0, year2: 0, year3: 0, year4: 0 } }; if (!${SBASE}.commission.rateByYear) ${SBASE}.commission.rateByYear = { year1: 0, year2: 0, year3: 0, year4: 0 }; ${SBASE}.commission.enabled = !${SBASE}.commission.enabled; proformaRecompute()"
                    :class="(${SBASE}.commission && ${SBASE}.commission.enabled) ? 'bg-gray-900' : 'bg-gray-300'"
                    class="relative inline-flex shrink-0 items-center h-5 w-9 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400">
              <span :class="(${SBASE}.commission && ${SBASE}.commission.enabled) ? 'translate-x-[18px]' : 'translate-x-[2px]'"
                    class="inline-block w-4 h-4 transform bg-white rounded-full shadow transition-transform"></span>
            </button>
            <div>
              <p class="text-sm font-semibold text-gray-800">Commission income</p>
            </div>
          </div>
          <template x-if="${SBASE}.commission.enabled">
            <div class="space-y-3 pl-12">
              <div>
                <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Commission rate by year</p>
                <div class="grid grid-cols-4 gap-3">
                  ${numInput('Y1', `${SBASE}.commission.rateByYear.year1`, { unit: '%', format: 'fraction-percent', step: 1 })}
                  ${numInput('Y2', `${SBASE}.commission.rateByYear.year2`, { unit: '%', format: 'fraction-percent', step: 1 })}
                  ${numInput('Y3', `${SBASE}.commission.rateByYear.year3`, { unit: '%', format: 'fraction-percent', step: 1 })}
                  ${numInput('Y4', `${SBASE}.commission.rateByYear.year4`, { unit: '%', format: 'fraction-percent', step: 1 })}
                </div>
              </div>
              <div>
                <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Commission income (calculated)</p>
                <div class="grid grid-cols-4 gap-3">
                  ${['year1','year2','year3','year4'].map((yr, i) => `
                    <div class="flex flex-col">
                      <span class="text-[10px] text-gray-400 font-mono mb-0.5">Y${i + 1}</span>
                      <span class="text-sm font-mono tabular-nums text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5"
                            x-text="getStreamCommissionIncome(streamIndex, '${yr}')">
                      </span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </template>
        </div>
      </section>
    </template>
  `;
}

// ③ Timing — start month + an Advanced (single-purpose) accordion for
// the qDist quarterly shape. This is the only "Advanced" left in the
// stream card, and it owns one self-contained thing.
function _timingBlock() {
  const stateKey = `proformaAdvancedOpen['stream_qdist_' + ${SBASE}.id]`;
  const numLinked = `${SBASE}.market.mode === 'linked' ? 3 : 2`;
  return `
    <section>
      <header class="flex items-baseline gap-2 mb-2">
        <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-semibold"
              x-text="${numLinked}"></span>
        <h4 class="text-sm font-semibold text-gray-800">Timing</h4>
      </header>

      <div class="grid grid-cols-3 gap-3">
        ${numInput('First revenue month', `${SBASE}.startMonth`, { unit: 'mo', step: 1 })}
      </div>

      <div class="mt-3 border-t border-gray-100 pt-3">
        <button type="button"
                @click="${stateKey} = !${stateKey}"
                class="flex items-center gap-2 text-left group"
                :aria-expanded="${stateKey} ? 'true' : 'false'">
          <svg class="w-3.5 h-3.5 text-gray-400 transition-transform"
               :class="${stateKey} ? 'rotate-90' : ''"
               fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
          <span class="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-700 group-hover:text-gray-900">Quarterly shape</span>
          <span class="text-[11px] text-gray-400">How each year splits across Q1&ndash;Q4 (must sum to 1.0)</span>
        </button>
        <div x-show="${stateKey}" x-collapse class="mt-3 space-y-2.5 pl-5">
          ${_qDistRow('year1')}
          ${_qDistRow('year2')}
          ${_qDistRow('year3')}
          ${_qDistRow('year4')}
        </div>
      </div>
    </section>
  `;
}

function _streamCard() {
  // Treat missing `enabled` as true so v1 blobs that haven't migrated
  // yet still render normally on the very first paint.
  const isEnabled = `(${SBASE}.enabled !== false)`;
  return `
    <article class="border rounded-2xl overflow-hidden bg-white transition-colors"
             :class="${isEnabled} ? 'border-gray-200' : 'border-gray-200 bg-gray-50'">
      <header class="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">

        <!-- Enable/disable toggle -->
        <button type="button"
                @click="toggleProformaRevenueStream(${SBASE}.id)"
                :title="${isEnabled} ? 'Disable this stream (keeps config, contributes $0)' : 'Re-enable this stream'"
                :class="${isEnabled} ? 'bg-gray-900' : 'bg-gray-300'"
                class="relative inline-flex shrink-0 items-center h-5 w-9 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400">
          <span :class="${isEnabled} ? 'translate-x-[18px]' : 'translate-x-[2px]'"
                class="inline-block w-4 h-4 transform bg-white rounded-full shadow transition-transform"></span>
        </button>

        <input type="text"
               :value="${SBASE}.name"
               @input="${SBASE}.name = $event.target.value; proformaMarkDirty()"
               class="flex-1 min-w-[200px] text-base font-semibold bg-transparent border-0 border-b border-transparent hover:border-gray-200 focus:border-gray-900 focus:ring-0 px-0 py-1"
               :class="${isEnabled} ? 'text-gray-900' : 'text-gray-500 line-through decoration-gray-400'">

        <span x-show="!${isEnabled}"
              class="text-[10px] uppercase tracking-wide font-semibold text-gray-500 bg-gray-200 rounded px-1.5 py-0.5">
          Disabled
        </span>

        <div class="inline-flex items-center bg-gray-100 rounded-lg p-0.5 text-[11px] font-medium">
          <button type="button"
                  @click="setProformaStreamMarketMode(${SBASE}.id, 'linked')"
                  :class="${SBASE}.market.mode === 'linked' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                  class="px-2.5 py-1 rounded-md transition">
            Linked TAM
          </button>
          <button type="button"
                  @click="setProformaStreamMarketMode(${SBASE}.id, 'direct')"
                  :class="${SBASE}.market.mode === 'direct' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                  class="px-2.5 py-1 rounded-md transition">
            Direct $
          </button>
        </div>

        <template x-if="!${SBASE}.builtin">
          <button type="button"
                  @click="if (confirm('Delete revenue stream &quot;' + ${SBASE}.name + '&quot;?')) removeProformaRevenueStream(${SBASE}.id)"
                  class="text-gray-400 hover:text-red-600 px-2 py-1 rounded-md"
                  title="Delete this revenue stream">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
            </svg>
          </button>
        </template>
      </header>

      <div class="px-5 py-5 space-y-5 transition-opacity"
           :class="${isEnabled} ? '' : 'opacity-50'">
        ${_sourceBlock()}
        ${_captureBlock()}
        ${_timingBlock()}
      </div>
    </article>
  `;
}

export function getRevenueSection() {
  return `
    <section class="max-w-5xl">
      ${sectionHeader('Revenue', 'One card per revenue stream. Each stream picks a market source, captures a share at a price, and ramps in over time. Built-ins can be edited but not deleted.')}

      <div class="space-y-5">
        <template x-for="(stream, streamIndex) in (proformaAssumptions.revenue.streams || [])" :key="stream.id">
          ${_streamCard()}
        </template>
      </div>

      <div class="mt-6 flex justify-center">
        <button type="button"
                @click="addProformaRevenueStream()"
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
          </svg>
          Add revenue stream
        </button>
      </div>
    </section>
  `;
}
