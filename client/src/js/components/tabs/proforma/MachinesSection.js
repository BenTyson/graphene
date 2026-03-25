// Machines section - uses raw HTML cards (no helper imports needed)

export function getMachinesSection() {
  return `
    <div class="space-y-4">
      <template x-for="(machine, mi) in proformaAssumptions.machines" :key="mi">
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <!-- Machine header -->
          <div class="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <input type="text" :value="machine.name"
                     @input="proformaAssumptions.machines[mi].name = $event.target.value; proformaMarkDirty()"
                     class="text-sm font-semibold border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-black focus:border-black w-36">
              <select :value="machine.type"
                      @change="proformaAssumptions.machines[mi].type = $event.target.value; proformaRecompute()"
                      class="text-xs border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-black focus:border-black">
                <option value="pilot">Pilot</option>
                <option value="broderick">Broderick</option>
              </select>
            </div>
            <button @click="removeProformaMachine(mi)" class="text-gray-400 hover:text-red-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Machine body -->
          <div class="px-4 py-3 space-y-3">
            <!-- Row 1: Core parameters -->
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-medium text-gray-500 mb-1">Validation Start Month</label>
                <input type="number" :value="machine.validationStartMonth"
                       @input="proformaAssumptions.machines[mi].validationStartMonth = +$event.target.value; proformaRecompute()"
                       class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-black focus:border-black">
              </div>
              <div>
                <label class="block text-[11px] font-medium text-gray-500 mb-1">Production Start Month</label>
                <input type="number" :value="machine.productionStartMonth"
                       @input="proformaAssumptions.machines[mi].productionStartMonth = +$event.target.value; proformaRecompute()"
                       class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-black focus:border-black">
              </div>
              <div>
                <label class="block text-[11px] font-medium text-gray-500 mb-1">Cost ($)</label>
                <input type="number" :value="machine.cost"
                       @input="proformaAssumptions.machines[mi].cost = +$event.target.value; proformaRecompute()"
                       class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-black focus:border-black">
              </div>
            </div>

            <!-- Computed indicator -->
            <p class="text-[10px] text-gray-400 font-mono"
               x-text="proformaComputed ? '\\u2192 Produces from Mo ' + machine.productionStartMonth + ', capacity: ' + (machine.type === 'broderick' ? proformaComputed.production.broderickMonthlyByPhase[0].toFixed(0) : proformaComputed.production.pilotMonthlyByPhase[0].toFixed(0)) + ' kg/mo (Phase 1)' : ''"></p>

            <!-- Phase override row -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-medium text-gray-500 mb-1">Production Phase Override</label>
                <select :value="machine.productionPhaseOverride ?? ''"
                        @change="proformaAssumptions.machines[mi].productionPhaseOverride = $event.target.value === '' ? null : +$event.target.value; proformaRecompute()"
                        class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-black focus:border-black">
                  <option value="">Auto</option>
                  <option value="0">Phase 1</option>
                  <option value="1">Phase 2</option>
                  <option value="2">Phase 3</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-medium text-gray-500 mb-1">Cost Phase Override</label>
                <select :value="machine.costPhaseOverride ?? ''"
                        @change="proformaAssumptions.machines[mi].costPhaseOverride = $event.target.value === '' ? null : +$event.target.value; proformaRecompute()"
                        class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-black focus:border-black">
                  <option value="">Auto</option>
                  <option value="0">Phase 1</option>
                  <option value="1">Phase 2</option>
                  <option value="2">Phase 3</option>
                </select>
              </div>
            </div>

            <!-- Payment Schedule -->
            <div>
              <label class="block text-[11px] font-medium text-gray-500 mb-1">Payment Schedule</label>
              <div x-show="machine.payments?.length" class="overflow-x-auto">
                <table class="w-full text-xs">
                  <thead>
                    <tr class="text-gray-500">
                      <th class="text-left py-1.5 pr-2 font-medium">Month</th>
                      <th class="text-right py-1.5 px-1.5 font-medium">%</th>
                      <th class="text-right py-1.5 px-1.5 font-medium">Amount</th>
                      <th class="text-right py-1.5 px-1.5 font-medium">Running Total</th>
                      <th class="py-1.5 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <template x-for="(payment, pi) in machine.payments" :key="pi">
                      <tr class="border-t border-gray-100">
                        <td class="py-1 pr-2">
                          <input type="number" :value="payment.month"
                                 @input="proformaAssumptions.machines[mi].payments[pi].month = +$event.target.value; proformaRecompute()"
                                 class="w-16 text-right text-xs border-gray-300 rounded px-1.5 py-1 font-mono focus:ring-1 focus:ring-black focus:border-black">
                        </td>
                        <td class="py-1 px-1">
                          <input type="number" step="0.01" :value="payment.pct"
                                 @input="proformaAssumptions.machines[mi].payments[pi].pct = +$event.target.value; proformaRecompute()"
                                 class="w-16 text-right text-xs border-gray-300 rounded px-1.5 py-1 font-mono focus:ring-1 focus:ring-black focus:border-black">
                        </td>
                        <td class="py-1 px-1.5 text-right font-mono text-gray-600"
                            x-text="window._pfFmtC(machine.cost * payment.pct)"></td>
                        <td class="py-1 px-1.5 text-right font-mono text-gray-600"
                            x-text="window._pfFmtC(machine.payments.slice(0, pi + 1).reduce((sum, p) => sum + machine.cost * p.pct, 0))"></td>
                        <td class="py-1 text-center">
                          <button @click="removeProformaMachinePayment(mi, pi)" class="text-gray-400 hover:text-red-500">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    </template>
                    <!-- Sum validation row -->
                    <tr class="border-t border-gray-200">
                      <td class="py-1.5 pr-2 text-gray-500 font-medium">Total</td>
                      <td class="py-1.5 px-1 text-right font-mono font-medium"
                          :class="Math.abs(machine.payments.reduce((s, p) => s + p.pct, 0) - 1.0) < 0.001 ? 'text-green-600' : 'text-red-600'"
                          x-text="(machine.payments.reduce((s, p) => s + p.pct, 0) * 100).toFixed(1) + '%'"></td>
                      <td class="py-1.5 px-1.5 text-right font-mono font-medium text-gray-700"
                          x-text="window._pfFmtC(machine.payments.reduce((s, p) => s + machine.cost * p.pct, 0))"></td>
                      <td colspan="2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button @click="addProformaMachinePayment(mi)"
                      class="text-[11px] text-blue-600 hover:text-blue-800 mt-1">
                + Add Payment
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- Add Machine button -->
      <button @click="addProformaMachine()"
              class="text-sm text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 rounded-lg px-4 py-3 w-full text-center hover:border-gray-400 transition-colors">
        + Add Machine
      </button>
    </div>
  `;
}
