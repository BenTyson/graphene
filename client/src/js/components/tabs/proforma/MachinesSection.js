import { sectionHeader, HELP } from './helpers.js';
import { MONTHS_TOTAL as MONTHS } from '@shared/proformaDefaults.js';

// Machines — each kiln gets a card with three critical fields
// (validation start, production start, cost), plus a per-machine Advanced
// accordion containing its payment schedule and phase overrides.
// The fleet gantt at the top stays — it's the strongest read of the
// whole fleet in one glance.

// Per-year capacity vs peak demand strip. Reads from the live proformaComputed
// snapshot (engine outputs `productionCapacityKg` and `demandKgTotal` arrays of
// length 48). Shows the worst-case month in each year so under-capacity is
// visible from the editing surface, not just the Charts tab.
function _capacityVsDemandStrip() {
  return `
    <figure x-show="proformaComputed?.outlook?.productionCapacityKg && proformaComputed?.outlook?.demandKgTotal"
            class="rounded-lg border border-gray-200 bg-white p-5 mb-6">
      <figcaption class="flex items-center justify-between mb-3">
        <div>
          <h3 class="text-sm font-semibold text-gray-900">Capacity vs sales demand</h3>
          <p class="text-[11px] text-gray-500 mt-0.5">Peak monthly kg of graphene each year — what we can make vs what revenue streams imply we'll sell.</p>
        </div>
        <a href="#" @click.prevent="proformaEditorTab = 'charts'"
           class="text-[11px] text-gray-500 hover:text-gray-900 underline">View full chart →</a>
      </figcaption>

      <div class="grid grid-cols-4 gap-3">
        <template x-for="y in [1, 2, 3, 4]" :key="y">
          <div class="border border-gray-100 rounded-md p-3" x-data="{
            cap: Math.max(...proformaComputed.outlook.productionCapacityKg.slice(y * 12, y * 12 + 12)),
            dem: Math.max(...proformaComputed.outlook.demandKgTotal.slice(y * 12, y * 12 + 12))
          }">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-semibold uppercase tracking-wide text-gray-600" x-text="'Year ' + y"></span>
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded"
                    :class="dem > cap ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'"
                    x-text="dem > cap ? 'short ' + Math.round(dem - cap).toLocaleString() + ' kg/mo' : 'OK · ' + (cap > 0 ? Math.round((dem / cap) * 100) : 0) + '% used'"></span>
            </div>
            <div class="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <div class="text-gray-400">Capacity</div>
                <div class="font-mono tabular-nums text-gray-900" x-text="Math.round(cap).toLocaleString() + ' kg/mo'"></div>
              </div>
              <div>
                <div class="text-gray-400">Demand</div>
                <div class="font-mono tabular-nums text-gray-900" x-text="Math.round(dem).toLocaleString() + ' kg/mo'"></div>
              </div>
            </div>
            <div class="mt-2 relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div class="absolute inset-y-0 left-0 bg-gray-900 rounded-full"
                   :style="'width:' + (cap > 0 ? Math.min(100, (dem / cap) * 100) : 0) + '%'"
                   :class="dem > cap ? '!bg-red-500' : ''"></div>
            </div>
          </div>
        </template>
      </div>
    </figure>
  `;
}

function _fleetTimeline() {
  const monthMarkers = [0, 12, 24, 36, 48, 60];
  return `
    <figure class="rounded-lg border border-gray-200 bg-white p-5 mb-6">
      <figcaption class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-sm font-semibold text-gray-900">Fleet timeline</h3>
          <p class="text-[11px] text-gray-500 mt-0.5">Validation (pale) → Production (solid). Edit any machine below to shift a bar.</p>
        </div>
        <div class="flex items-center gap-3 text-[11px] text-gray-500">
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-indigo-500"></span>Pilot</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-amber-500"></span>Broderick</span>
        </div>
      </figcaption>

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

              <div class="relative flex-1 h-6 bg-gray-50 rounded-md overflow-hidden">
                <template x-for="m in [12, 24, 36, 48]" :key="m">
                  <span class="absolute top-0 bottom-0 w-px bg-gray-200" :style="'left:' + (m / ${MONTHS} * 100) + '%'"></span>
                </template>

                <span class="absolute top-1 bottom-1 rounded-sm transition-all duration-300"
                      :class="machine.type === 'broderick' ? 'bg-amber-200' : 'bg-indigo-200'"
                      :style="'left:' + (Math.max(0, machine.validationStartMonth) / ${MONTHS} * 100) + '%; width:' + (Math.max(0, machine.productionStartMonth - machine.validationStartMonth) / ${MONTHS} * 100) + '%'"></span>

                <span class="absolute top-1 bottom-1 rounded-sm transition-all duration-300 shadow-sm"
                      :class="machine.type === 'broderick' ? 'bg-amber-500' : 'bg-indigo-500'"
                      :style="'left:' + (machine.productionStartMonth / ${MONTHS} * 100) + '%; width:' + (Math.max(0, ${MONTHS} - machine.productionStartMonth) / ${MONTHS} * 100) + '%'"></span>

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
  return `
    <article :id="'pf-machine-' + mi"
             class="rounded-lg border border-gray-200 bg-white p-5 transition-all"
             :class="proformaMachineHover === mi ? 'border-gray-900 shadow-sm' : 'hover:border-gray-300'"
             @mouseenter="proformaMachineHover = mi"
             @mouseleave="proformaMachineHover = null">

      <!-- Header: name, type, remove -->
      <div class="flex items-center gap-3 mb-4">
        <input type="text"
               :value="machine.name"
               @input="proformaAssumptions.machines[mi].name = $event.target.value; proformaMarkDirty()"
               class="text-[15px] font-semibold text-gray-900 bg-transparent border-0 border-b border-transparent
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

      <!-- Critical fields: three labeled inputs in a grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
        <div>
          <label class="flex items-center text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Validation start <span class="ml-1.5 text-[10px] text-gray-400 font-normal tracking-wide">mo</span>
          </label>
          <input type="number" step="1" min="0" max="47"
                 :value="machine.validationStartMonth"
                 @input="proformaAssumptions.machines[mi].validationStartMonth = +$event.target.value; proformaRecompute()"
                 class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 font-mono tabular-nums focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
          <p class="text-[11px] text-gray-500 leading-snug mt-1">${HELP['machine.validationStartMonth'].help}</p>
          <p class="text-[11px] text-gray-400 leading-snug mt-0.5"><span>Feeds →</span> ${HELP['machine.validationStartMonth'].dependsOn}</p>
        </div>
        <div>
          <label class="flex items-center text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Production start <span class="ml-1.5 text-[10px] text-gray-400 font-normal tracking-wide">mo</span>
          </label>
          <input type="number" step="1" min="0" max="47"
                 :value="machine.productionStartMonth"
                 @input="proformaAssumptions.machines[mi].productionStartMonth = +$event.target.value; proformaRecompute()"
                 class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 font-mono tabular-nums focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
          <p class="text-[11px] text-gray-500 leading-snug mt-1">${HELP['machine.productionStartMonth'].help}</p>
          <p class="text-[11px] text-gray-400 leading-snug mt-0.5"><span>Feeds →</span> ${HELP['machine.productionStartMonth'].dependsOn}</p>
        </div>
        <div>
          <label class="flex items-center text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Cost <span class="ml-1.5 text-[10px] text-gray-400 font-normal tracking-wide">$</span>
          </label>
          <input type="number" step="5000"
                 :value="machine.cost"
                 @input="proformaAssumptions.machines[mi].cost = +$event.target.value; proformaRecompute()"
                 class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 font-mono tabular-nums focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
          <p class="text-[11px] text-gray-500 leading-snug mt-1">${HELP['machine.cost'].help}</p>
          <p class="text-[11px] text-gray-400 leading-snug mt-0.5"><span>Feeds →</span> ${HELP['machine.cost'].dependsOn}</p>
        </div>
      </div>

      <!-- Payment schedule + phase overrides -->
      <div class="mt-5 border-t border-gray-100 pt-4 space-y-4">
          <div>
            <h4 class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment schedule</h4>
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
                               class="w-16 text-right text-xs border-gray-200 rounded px-1.5 py-1 font-mono tabular-nums focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
                      </td>
                      <td class="py-1 px-1">
                        <input type="number" step="0.01" :value="payment.pct"
                               @input="proformaAssumptions.machines[mi].payments[pi].pct = +$event.target.value; proformaRecompute()"
                               class="w-16 text-right text-xs border-gray-200 rounded px-1.5 py-1 font-mono tabular-nums focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
                      </td>
                      <td class="py-1 px-1.5 text-right font-mono text-gray-600 tabular-nums"
                          x-text="window._pfFmtC(machine.cost * payment.pct)"></td>
                      <td class="py-1 px-1.5 text-right font-mono text-gray-500 tabular-nums"
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
                    <td class="py-1.5 px-1.5 text-right font-mono font-medium text-gray-700 tabular-nums"
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
            <p class="text-[11px] text-gray-500 leading-snug mt-2">
              Percent of total paid in each month. Feeds the cash-flow curve — must sum to 100 %.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Production phase override</label>
              <select :value="machine.productionPhaseOverride ?? ''"
                      @change="proformaAssumptions.machines[mi].productionPhaseOverride = $event.target.value === '' ? null : +$event.target.value; proformaRecompute()"
                      class="w-full text-xs border-gray-200 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
                <option value="">Auto (follows global phase)</option>
                <option value="0">Phase 1</option>
                <option value="1">Phase 2</option>
                <option value="2">Phase 3</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Cost phase override</label>
              <select :value="machine.costPhaseOverride ?? ''"
                      @change="proformaAssumptions.machines[mi].costPhaseOverride = $event.target.value === '' ? null : +$event.target.value; proformaRecompute()"
                      class="w-full text-xs border-gray-200 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
                <option value="">Auto (follows global phase)</option>
                <option value="0">Phase 1</option>
                <option value="1">Phase 2</option>
                <option value="2">Phase 3</option>
              </select>
            </div>
          </div>
      </div>
    </article>
  `;
}

export function getMachinesSection() {
  return `
    <section class="max-w-5xl">
      ${sectionHeader('Machines', 'Each kiln is a capex + revenue-timing commitment. Timing shifts revenue; cost shifts the raise.')}

      ${_capacityVsDemandStrip()}

      ${_fleetTimeline()}

      <div class="space-y-4">
        <template x-for="(machine, mi) in proformaAssumptions.machines" :key="mi">
          ${_machineCard()}
        </template>

        <button @click="addProformaMachine()"
                class="text-sm text-gray-500 hover:text-gray-900 border-2 border-dashed border-gray-200 rounded-lg
                       px-4 py-5 w-full text-center hover:border-gray-300 transition-colors">
          + Add machine
        </button>
      </div>
    </section>
  `;
}
