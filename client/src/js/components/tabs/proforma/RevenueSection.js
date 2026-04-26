import { numInput, sectionHeader, criticalBlock } from './helpers.js';

// Revenue tab: one self-contained card per stream. Each card owns its own
// ramp (Y1 → Y2 → Y3), pricing (linked mode), market source, and
// quarterly-shape weights. New streams append at the bottom; built-ins
// can be renamed but not deleted.
//
// Implementation note: every Alpine binding inside a stream card uses
// `proformaAssumptions.revenue.streams[streamIndex]…` where `streamIndex`
// is the loop variable from `<template x-for>`. The numeric index has to
// be late-bound this way (NOT substituted at render time) so that the
// directives Alpine wires up live inside the `<template>` and don't go
// stale when a stream is added or removed.

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

// Critical fields: start month + Y1/Y2/Y3 share (linked) or revenue $ (direct).
function _criticalFields() {
  return `
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5">
      ${numInput('Revenue start month', `${SBASE}.startMonth`, { unit: 'mo', step: 1 })}

      <template x-if="${SBASE}.market.mode === 'linked'">
        <div class="contents">
          ${numInput('Y1 market share', `${SBASE}.year1.marketSharePct`, { unit: '%', format: 'fraction-percent', step: 0.05 })}
          ${numInput('Y2 market share', `${SBASE}.year2.marketSharePct`, { unit: '%', format: 'fraction-percent', step: 0.05 })}
          ${numInput('Y3 market share', `${SBASE}.year3.marketSharePct`, { unit: '%', format: 'fraction-percent', step: 0.05 })}
        </div>
      </template>

      <template x-if="${SBASE}.market.mode === 'direct'">
        <div class="contents">
          ${numInput('Y1 revenue', `${SBASE}.market.revenueByYear.year1`, { unit: '$', step: 10000 })}
          ${numInput('Y2 revenue', `${SBASE}.market.revenueByYear.year2`, { unit: '$', step: 10000 })}
          ${numInput('Y3 revenue', `${SBASE}.market.revenueByYear.year3`, { unit: '$', step: 10000 })}
        </div>
      </template>
    </div>
  `;
}

function _pricingBlock() {
  return `
    <template x-if="${SBASE}.market.mode === 'linked'">
      <div class="border border-gray-200 rounded-lg overflow-hidden">
        <div class="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
          <h4 class="text-sm font-semibold text-gray-700">Unit pricing ($/kg)</h4>
          <p class="text-[11px] text-gray-500 mt-0.5">Sell price per kg by year. Revenue = price × kg × market share.</p>
        </div>
        <div class="px-4 py-3.5">
          <div class="grid grid-cols-4 gap-3">
            ${['year0', 'year1', 'year2', 'year3'].map((yr, i) => `
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
    </template>
  `;
}

function _marketSourceBlock() {
  return `
    <template x-if="${SBASE}.market.mode === 'linked'">
      <div class="border border-gray-200 rounded-lg overflow-hidden">
        <div class="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
          <h4 class="text-sm font-semibold text-gray-700">Linked market source</h4>
          <p class="text-[11px] text-gray-500 mt-0.5">
            Pulls global TAM (kg/year) from the Technical tab. Edit the demand or CAGR there to re-price every linked stream.
          </p>
        </div>
        <div class="px-4 py-3.5">
          <select
            @change="${SBASE}.market.linkedSource = $event.target.value; proformaRecompute()"
            class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
            <template x-for="src in proformaMarketSources" :key="src.id">
              <option :value="src.id" :selected="src.id === ${SBASE}.market.linkedSource" x-text="src.label"></option>
            </template>
          </select>
        </div>
      </div>
    </template>
  `;
}

function _qDistBlock() {
  return `
    <div class="border border-gray-200 rounded-lg overflow-hidden">
      <div class="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <h4 class="text-sm font-semibold text-gray-700">Quarterly shape</h4>
        <p class="text-[11px] text-gray-500 mt-0.5">Weights split each year's revenue across Q1–Q4. Must sum to 1.0 per year.</p>
      </div>
      <div class="px-4 py-3.5 space-y-2.5">
        ${_qDistRow('year1')}
        ${_qDistRow('year2')}
        ${_qDistRow('year3')}
      </div>
    </div>
  `;
}

// Per-stream advanced disclosure. State key includes the stream id so each
// card opens/closes independently across re-renders.
function _advancedAccordion() {
  const stateKey = `proformaAdvancedOpen['stream_' + ${SBASE}.id]`;
  return `
    <section class="mt-2 border-t border-gray-100 pt-4">
      <button type="button"
              @click="${stateKey} = !${stateKey}"
              class="w-full flex items-center gap-2 text-left group"
              :aria-expanded="${stateKey} ? 'true' : 'false'">
        <svg class="w-3.5 h-3.5 text-gray-400 transition-transform"
             :class="${stateKey} ? 'rotate-90' : ''"
             fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
        <span class="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-700 group-hover:text-gray-900">Advanced</span>
        <span class="text-[11px] text-gray-400 truncate">Pricing, market source, quarterly shape</span>
      </button>
      <div x-show="${stateKey}" x-collapse class="mt-4 space-y-4">
        ${_pricingBlock()}
        ${_marketSourceBlock()}
        ${_qDistBlock()}
      </div>
    </section>
  `;
}

function _streamCard() {
  return `
    <article class="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <header class="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
        <input type="text"
               :value="${SBASE}.name"
               @input="${SBASE}.name = $event.target.value; proformaMarkDirty()"
               class="flex-1 min-w-[200px] text-base font-semibold text-gray-900 bg-transparent border-0 border-b border-transparent hover:border-gray-200 focus:border-gray-900 focus:ring-0 px-0 py-1">

        <div class="inline-flex items-center bg-gray-100 rounded-lg p-0.5 text-[11px] font-medium">
          <button type="button"
                  @click="setProformaStreamMarketMode(${SBASE}.id, 'linked')"
                  :class="${SBASE}.market.mode === 'linked' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                  class="px-2.5 py-1 rounded-md transition">
            Market share
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

      <div class="px-5 pt-5 pb-2">
        ${_criticalFields()}
      </div>

      <div class="px-5 pb-5">
        ${_advancedAccordion()}
      </div>
    </article>
  `;
}

export function getRevenueSection() {
  return `
    <section class="max-w-5xl">
      ${sectionHeader('Revenue', 'One module per revenue stream — each owns its market source, pricing, ramp, and quarterly shape. Built-in streams can be edited but not deleted; custom streams can be added below.')}

      ${criticalBlock(`
        <div class="space-y-5">
          <template x-for="(stream, streamIndex) in (proformaAssumptions.revenue.streams || [])" :key="stream.id">
            ${_streamCard()}
          </template>
        </div>
      `, { label: 'Revenue streams', hint: 'Each card is self-contained' })}

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
