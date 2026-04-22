import { sectionHero } from './cards.js';

// The Machines section centers on a fleet-timeline gantt at the top —
// one bar per machine across a shared 0–48 month axis, split into
// validation (lighter) and production (solid). As you drag any slider
// in the cards below, the gantt animates live. Hover / click on a bar
// highlights and scrolls to the matching card.

const MONTHS = 48;

function _fleetTimeline() {
  const monthMarkers = [0, 12, 24, 36, 48];
  return `
    <figure class="rounded-2xl border border-gray-200 bg-white p-6 mb-6">
      <figcaption class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-[15px] font-semibold text-gray-900">Fleet timeline</h3>
          <p class="text-xs text-gray-500 mt-0.5">Validation (pale) → Production (solid). Drag sliders below to shift a machine left or right.</p>
        </div>
        <div class="flex items-center gap-3 text-[11px] text-gray-500">
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-indigo-500"></span>Pilot</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-amber-500"></span>Broderick</span>
        </div>
      </figcaption>

      <!-- Rows -->
      <div class="space-y-2">
        <template x-for="(machine, mi) in proformaAssumptions.machines" :key="mi">
          <button type="button"
                  @click="document.getElementById('pf-machine-' + mi)?.scrollIntoView({behavior:'smooth', block:'center'}); proformaMachineHover = mi"
                  @mouseenter="proformaMachineHover = mi"
                  @mouseleave="proformaMachineHover = null"
                  class="w-full group text-left transition-opacity"
                  :class="proformaMachineHover !== null && proformaMachineHover !== mi ? 'opacity-40' : 'opacity-100'">
            <div class="flex items-center gap-3">
              <span class="w-24 text-[11px] font-medium text-gray-700 truncate shrink-0" x-text="machine.name"></span>

              <!-- Track -->
              <div class="relative flex-1 h-6 bg-gray-50 rounded-md overflow-hidden">
                <!-- Quarter/year gridlines -->
                <template x-for="m in [12, 24, 36]" :key="m">
                  <span class="absolute top-0 bottom-0 w-px bg-gray-200" :style="'left:' + (m / ${MONTHS} * 100) + '%'"></span>
                </template>

                <!-- Validation segment -->
                <span class="absolute top-1 bottom-1 rounded-sm transition-all duration-300"
                      :class="machine.type === 'broderick' ? 'bg-amber-200' : 'bg-indigo-200'"
                      :style="'left:' + (Math.max(0, machine.validationStartMonth) / ${MONTHS} * 100) + '%; width:' + (Math.max(0, machine.productionStartMonth - machine.validationStartMonth) / ${MONTHS} * 100) + '%'"></span>

                <!-- Production segment -->
                <span class="absolute top-1 bottom-1 rounded-sm transition-all duration-300 shadow-sm"
                      :class="machine.type === 'broderick' ? 'bg-amber-500' : 'bg-indigo-500'"
                      :style="'left:' + (machine.productionStartMonth / ${MONTHS} * 100) + '%; width:' + (Math.max(0, ${MONTHS} - machine.productionStartMonth) / ${MONTHS} * 100) + '%'"></span>

                <!-- Month markers on hover -->
                <span x-show="proformaMachineHover === mi"
                      class="absolute top-1 h-5 w-px bg-gray-900"
                      :style="'left:' + (machine.productionStartMonth / ${MONTHS} * 100) + '%'"></span>
                <span x-show="proformaMachineHover === mi"
                      class="absolute -top-5 text-[10px] font-mono text-gray-900 px-1 bg-white rounded"
                      :style="'left:' + (machine.productionStartMonth / ${MONTHS} * 100) + '%; transform: translateX(-50%);'"
                      x-text="'Mo ' + machine.productionStartMonth"></span>
              </div>

              <span class="w-20 text-[11px] text-gray-500 font-mono tabular-nums shrink-0 text-right"
                    x-text="window._pfFmtC(machine.cost, true)"></span>
            </div>
          </button>
        </template>
      </div>

      <!-- Axis -->
      <div class="relative h-4 mt-2 ml-[108px] mr-[92px]">
        ${monthMarkers.map(m => `
          <span class="absolute top-0 text-[10px] font-mono text-gray-400"
                style="left:${m / MONTHS * 100}%; transform: translateX(${m === 0 ? '0' : m === MONTHS ? '-100%' : '-50%'})">
            ${m === 0 ? 'M0' : 'Y' + (m / 12)}
          </span>
        `).join('')}
      </div>
    </figure>
  `;
}

function _machineCard() {
  // One template, rendered per machine via x-for. Uses `mi` and `machine`.
  return `
    <article :id="'pf-machine-' + mi"
             class="group relative rounded-2xl border border-gray-200 bg-white p-6 transition-all
                    hover:border-gray-300 hover:shadow-sm focus-within:border-gray-900 focus-within:shadow-md"
             :class="proformaMachineHover === mi ? 'ring-2 ring-indigo-300 ring-offset-2' : ''"
             @mouseenter="proformaMachineHover = mi"
             @mouseleave="proformaMachineHover = null">

      <!-- Header row: name, type pill, remove -->
      <div class="flex items-center gap-3 mb-4">
        <input type="text"
               :value="machine.name"
               @input="proformaAssumptions.machines[mi].name = $event.target.value; proformaMarkDirty()"
               class="text-[17px] font-semibold text-gray-900 bg-transparent border-0 border-b-2 border-transparent
                      focus:border-gray-900 focus:outline-none focus:ring-0 px-0 py-0.5 w-48 transition-colors"
               aria-label="Machine name">
        <span class="inline-flex rounded-full p-0.5 bg-gray-100 text-[11px] font-medium">
          <button type="button"
                  @click="proformaAssumptions.machines[mi].type = 'pilot'; proformaRecompute()"
                  :class="machine.type === 'pilot' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                  class="px-2.5 py-0.5 rounded-full transition-all">Pilot</button>
          <button type="button"
                  @click="proformaAssumptions.machines[mi].type = 'broderick'; proformaRecompute()"
                  :class="machine.type === 'broderick' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                  class="px-2.5 py-0.5 rounded-full transition-all">Broderick</button>
        </span>
        <button @click="removeProformaMachine(mi)"
                class="ml-auto p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                aria-label="Remove machine">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Conversational sentence with inline inputs -->
      <p class="text-[15px] leading-relaxed text-gray-700 tracking-tight">
        Validates in month
        <span class="inline-flex items-baseline mx-1">
          <input type="number" step="1"
                 :value="machine.validationStartMonth"
                 @input.debounce.150ms="proformaAssumptions.machines[mi].validationStartMonth = +$event.target.value; proformaRecompute()"
                 class="w-14 text-xl font-semibold font-mono text-gray-900 bg-transparent border-0 border-b-2 border-gray-200
                        focus:border-gray-900 focus:outline-none focus:ring-0 px-1 py-0 text-right tabular-nums transition-colors">
        </span>
        and ships product starting month
        <span class="inline-flex items-baseline mx-1">
          <input type="number" step="1"
                 :value="machine.productionStartMonth"
                 @input.debounce.150ms="proformaAssumptions.machines[mi].productionStartMonth = +$event.target.value; proformaRecompute()"
                 class="w-14 text-xl font-semibold font-mono text-gray-900 bg-transparent border-0 border-b-2 border-gray-200
                        focus:border-gray-900 focus:outline-none focus:ring-0 px-1 py-0 text-right tabular-nums transition-colors">
        </span>
        at a cost of
        <span class="inline-flex items-baseline mx-1">
          <span class="text-lg text-gray-400 mr-0.5 select-none">$</span>
          <input type="number" step="5000"
                 :value="machine.cost"
                 @input.debounce.150ms="proformaAssumptions.machines[mi].cost = +$event.target.value; proformaRecompute()"
                 class="w-28 text-xl font-semibold font-mono text-gray-900 bg-transparent border-0 border-b-2 border-gray-200
                        focus:border-gray-900 focus:outline-none focus:ring-0 px-1 py-0 text-right tabular-nums transition-colors">
        </span>.
      </p>

      <!-- Triple slider row -->
      <div class="grid grid-cols-3 gap-5 mt-5">
        <div>
          <label class="block text-[10px] uppercase tracking-[0.08em] text-gray-400 font-medium mb-1.5">Validation start</label>
          <input type="range" min="0" max="47" step="1"
                 :value="machine.validationStartMonth"
                 @input="proformaAssumptions.machines[mi].validationStartMonth = +$event.target.value"
                 @change="proformaRecompute()"
                 class="w-full accent-indigo-500 cursor-pointer">
          <div class="flex justify-between text-[10px] text-gray-400 font-mono mt-0.5">
            <span>M0</span><span>Y1</span><span>Y2</span><span>Y3</span>
          </div>
        </div>
        <div>
          <label class="block text-[10px] uppercase tracking-[0.08em] text-gray-400 font-medium mb-1.5">Production start</label>
          <input type="range" min="0" max="47" step="1"
                 :value="machine.productionStartMonth"
                 @input="proformaAssumptions.machines[mi].productionStartMonth = +$event.target.value"
                 @change="proformaRecompute()"
                 class="w-full accent-indigo-700 cursor-pointer">
          <div class="flex justify-between text-[10px] text-gray-400 font-mono mt-0.5">
            <span>M0</span><span>Y1</span><span>Y2</span><span>Y3</span>
          </div>
        </div>
        <div>
          <label class="block text-[10px] uppercase tracking-[0.08em] text-gray-400 font-medium mb-1.5">Cost</label>
          <input type="range" min="100000" max="2000000" step="10000"
                 :value="machine.cost"
                 @input="proformaAssumptions.machines[mi].cost = +$event.target.value"
                 @change="proformaRecompute()"
                 class="w-full accent-gray-900 cursor-pointer">
          <div class="flex justify-between text-[10px] text-gray-400 font-mono mt-0.5">
            <span>$0.1M</span><span>$1M</span><span>$2M</span>
          </div>
        </div>
      </div>

      <!-- Impact chips: two because a machine touches both capex and revenue timing -->
      <div class="mt-5 flex items-center gap-2 flex-wrap">
        <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                     bg-gradient-to-r from-red-50 to-rose-50 border border-red-100
                     text-[12px] font-medium text-red-900" aria-live="polite">
          <span class="text-red-500">↳</span>
          <span class="text-red-700/70">Peak cash need</span>
          <span class="font-mono font-semibold text-red-900"
                x-text="window._pfFmtC(proformaComputed?.metrics?.peakCashNeed || 0, true)"></span>
          <span class="text-red-400/80 font-mono text-[11px]"
                x-show="proformaBaseline"
                x-text="(() => { const b = proformaBaseline?.peakCashNeed; const n = proformaComputed?.metrics?.peakCashNeed; if (b == null || n == null) return ''; const d = n - b; if (Math.abs(d) < 1) return ''; return '(' + window._pfFmtC(d, true) + ')'; })()"></span>
        </span>
        <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                     bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100
                     text-[12px] font-medium text-blue-900" aria-live="polite">
          <span class="text-blue-500">→</span>
          <span class="text-blue-700/70">Y3 revenue</span>
          <span class="font-mono font-semibold text-blue-900"
                x-text="window._pfFmtC(proformaComputed?.metrics?.y3Revenue || 0, true)"></span>
          <span class="text-blue-400/80 font-mono text-[11px]"
                x-show="proformaBaseline"
                x-text="(() => { const b = proformaBaseline?.y3Revenue; const n = proformaComputed?.metrics?.y3Revenue; if (b == null || n == null) return ''; const d = n - b; if (Math.abs(d) < 1) return ''; return '(' + window._pfFmtC(d, true) + ')'; })()"></span>
        </span>
      </div>

      <!-- Advanced: payment schedule + phase overrides -->
      <div class="mt-6 border-t border-gray-200 pt-5">
        <button type="button"
                @click="proformaAdvancedOpen['machine_' + mi] = !proformaAdvancedOpen['machine_' + mi]"
                class="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <svg class="w-3.5 h-3.5 transition-transform"
               :class="proformaAdvancedOpen['machine_' + mi] ? 'rotate-90' : ''"
               fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
          <span x-text="proformaAdvancedOpen['machine_' + mi] ? 'Hide payment schedule + phase overrides' : 'Payment schedule + phase overrides'"></span>
        </button>

        <div x-show="proformaAdvancedOpen['machine_' + mi]" x-collapse class="mt-4 space-y-4">
          <!-- Payment schedule -->
          <div>
            <h4 class="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Payment schedule</h4>
            <div x-show="machine.payments?.length" class="overflow-x-auto">
              <table class="w-full text-xs">
                <thead>
                  <tr class="text-gray-400">
                    <th class="text-left py-1.5 pr-2 font-medium">Month</th>
                    <th class="text-right py-1.5 px-1.5 font-medium">% of total</th>
                    <th class="text-right py-1.5 px-1.5 font-medium">Amount</th>
                    <th class="text-right py-1.5 px-1.5 font-medium">Running</th>
                    <th class="py-1.5 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  <template x-for="(payment, pi) in machine.payments" :key="pi">
                    <tr class="border-t border-gray-100">
                      <td class="py-1 pr-2">
                        <input type="number" :value="payment.month"
                               @input="proformaAssumptions.machines[mi].payments[pi].month = +$event.target.value; proformaRecompute()"
                               class="w-16 text-right text-xs border-gray-200 rounded px-1.5 py-1 font-mono focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
                      </td>
                      <td class="py-1 px-1">
                        <input type="number" step="0.01" :value="payment.pct"
                               @input="proformaAssumptions.machines[mi].payments[pi].pct = +$event.target.value; proformaRecompute()"
                               class="w-16 text-right text-xs border-gray-200 rounded px-1.5 py-1 font-mono focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
                      </td>
                      <td class="py-1 px-1.5 text-right font-mono text-gray-600"
                          x-text="window._pfFmtC(machine.cost * payment.pct)"></td>
                      <td class="py-1 px-1.5 text-right font-mono text-gray-500"
                          x-text="window._pfFmtC(machine.payments.slice(0, pi + 1).reduce((sum, p) => sum + machine.cost * p.pct, 0))"></td>
                      <td class="py-1 text-center">
                        <button @click="removeProformaMachinePayment(mi, pi)" class="text-gray-300 hover:text-red-500">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  </template>
                  <tr class="border-t border-gray-200">
                    <td class="py-1.5 pr-2 text-gray-500 font-medium">Total</td>
                    <td class="py-1.5 px-1 text-right font-mono font-medium"
                        :class="Math.abs(machine.payments.reduce((s, p) => s + p.pct, 0) - 1.0) < 0.001 ? 'text-green-600' : 'text-red-500'"
                        x-text="(machine.payments.reduce((s, p) => s + p.pct, 0) * 100).toFixed(1) + '%'"></td>
                    <td class="py-1.5 px-1.5 text-right font-mono font-medium text-gray-700"
                        x-text="window._pfFmtC(machine.payments.reduce((s, p) => s + machine.cost * p.pct, 0))"></td>
                    <td colspan="2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button @click="addProformaMachinePayment(mi)"
                    class="text-[11px] text-gray-600 hover:text-gray-900 mt-2 underline">
              + Add payment
            </button>
          </div>

          <!-- Phase overrides -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-medium text-gray-500 mb-1">Production phase override</label>
              <select :value="machine.productionPhaseOverride ?? ''"
                      @change="proformaAssumptions.machines[mi].productionPhaseOverride = $event.target.value === '' ? null : +$event.target.value; proformaRecompute()"
                      class="w-full text-xs border-gray-200 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
                <option value="">Auto</option>
                <option value="0">Phase 1</option>
                <option value="1">Phase 2</option>
                <option value="2">Phase 3</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-medium text-gray-500 mb-1">Cost phase override</label>
              <select :value="machine.costPhaseOverride ?? ''"
                      @change="proformaAssumptions.machines[mi].costPhaseOverride = $event.target.value === '' ? null : +$event.target.value; proformaRecompute()"
                      class="w-full text-xs border-gray-200 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
                <option value="">Auto</option>
                <option value="0">Phase 1</option>
                <option value="1">Phase 2</option>
                <option value="2">Phase 3</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </article>
  `;
}

export function getMachinesSection() {
  return `
    <section class="max-w-3xl">
      ${sectionHero(
        'What kit do we need and when does it light up?',
        'Each machine is a commitment. Timing shapes revenue; cost shapes the raise. The timeline shows the whole fleet at a glance — edit any card and watch it shift.'
      )}

      ${_fleetTimeline()}

      <div class="space-y-4">
        <template x-for="(machine, mi) in proformaAssumptions.machines" :key="mi">
          ${_machineCard()}
        </template>

        <button @click="addProformaMachine()"
                class="text-sm text-gray-500 hover:text-gray-900 border-2 border-dashed border-gray-200 rounded-2xl
                       px-4 py-5 w-full text-center hover:border-gray-300 transition-colors">
          + Add machine
        </button>
      </div>
    </section>
  `;
}
