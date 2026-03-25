import { numInput, card, HELP } from './helpers.js';

export function getCostsSection() {
  return `
    <div class="space-y-4">

      ${card('Hemp / Raw Materials', `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          ${numInput('Hemp Cost ($/kg)', 'proformaAssumptions.cogs.hempCostPerKilo', {
            step: 0.01,
            help: HELP['cogs.hempCostPerKilo']
          })}
          ${numInput('Contingency %', 'proformaAssumptions.cogs.hempContingencyPct', {
            step: 0.01,
            help: HELP['cogs.hempContingencyPct']
          })}
          ${numInput('Shipping ($/kg)', 'proformaAssumptions.cogs.hempShippingPerKilo', {
            step: 0.01,
            help: HELP['cogs.hempShippingPerKilo']
          })}
        </div>
        <div class="mt-3 bg-blue-50 rounded px-3 py-2 text-xs font-mono text-gray-600">
          Effective cost:
          <span class="font-semibold"
                x-text="'$' + ((proformaAssumptions.cogs.hempCostPerKilo * (1 + proformaAssumptions.cogs.hempContingencyPct)) + proformaAssumptions.cogs.hempShippingPerKilo).toFixed(2) + '/kg'"></span>
        </div>
      `)}

      ${card('Manufacturing Labor', `
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="text-gray-500">
                <th class="text-left py-1.5 pr-2 font-medium">Role</th>
                <th class="text-center py-1.5 px-1.5 font-medium w-20">Count</th>
                <th class="text-center py-1.5 px-1.5 font-medium w-28">Monthly Cost</th>
                <th class="text-right py-1.5 pl-2 font-medium w-28 border-l border-gray-200">Annual</th>
                <th class="w-8"></th>
              </tr>
            </thead>
            <tbody>
              <template x-for="(role, ri) in proformaAssumptions.manufacturing.fteRoles" :key="ri">
                <tr class="border-t border-gray-100">
                  <td class="py-1 pr-2">
                    <input type="text"
                           :value="role.name"
                           @input="proformaAssumptions.manufacturing.fteRoles[ri].name = $event.target.value; proformaRecompute()"
                           class="w-full text-xs border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-black focus:border-black">
                  </td>
                  <td class="py-1 px-1">
                    <input type="number"
                           :value="role.count"
                           @input="proformaAssumptions.manufacturing.fteRoles[ri].count = +$event.target.value; proformaRecompute()"
                           class="w-full text-center text-xs border-gray-300 rounded px-1.5 py-1 font-mono focus:ring-1 focus:ring-black focus:border-black">
                  </td>
                  <td class="py-1 px-1">
                    <input type="number"
                           :value="role.monthlyCost"
                           @input="proformaAssumptions.manufacturing.fteRoles[ri].monthlyCost = +$event.target.value; proformaRecompute()"
                           class="w-full text-right text-xs border-gray-300 rounded px-1.5 py-1 font-mono focus:ring-1 focus:ring-black focus:border-black">
                  </td>
                  <td class="py-1 pl-2 text-right font-mono text-gray-600 border-l border-gray-200"
                      x-text="window._pfFmtC(role.count * role.monthlyCost * 12, true)"></td>
                  <td class="py-1 pl-1">
                    <button @click="removeProformaFteRole(ri)" class="text-gray-400 hover:text-red-500">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              </template>
            </tbody>
            <tfoot>
              <tr class="border-t border-gray-300">
                <td colspan="3" class="py-1.5 text-right text-xs font-semibold text-gray-700 pr-2">Total Annual</td>
                <td class="py-1.5 pl-2 text-right font-mono font-semibold text-gray-700 border-l border-gray-200"
                    x-text="window._pfFmtC(proformaAssumptions.manufacturing.fteRoles.reduce((t, r) => t + r.count * r.monthlyCost * 12, 0), true)"></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <button @click="addProformaFteRole()"
                class="mt-2 text-sm text-gray-500 hover:text-gray-700 underline">
          + Add Role
        </button>
      `)}

      ${card('Manufacturing Parameters', `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          ${numInput('Shifts/Month', 'proformaAssumptions.manufacturing.shiftsPerMonth', {
            help: HELP['manufacturing.shiftsPerMonth']
          })}
          ${numInput('Maintenance Contingency %', 'proformaAssumptions.manufacturing.maintenanceContingencyPct', {
            step: 0.01,
            help: HELP['manufacturing.maintenanceContingencyPct']
          })}
          ${numInput('Validation Phase ($/mo)', 'proformaAssumptions.manufacturing.validationPhaseMonthly', {
            help: HELP['manufacturing.validationPhaseMonthly']
          })}
        </div>
      `)}

      ${card('Biochar Cost by Phase', `
        <div class="grid grid-cols-3 gap-3">
          <template x-for="(bc, bci) in proformaAssumptions.manufacturing.biocharCostPerKiloByPhase" :key="bci">
            <div>
              <label class="block text-[11px] font-medium text-gray-500 mb-1" x-text="'Phase ' + (bci+1)"></label>
              <div class="relative">
                <input type="number" step="0.01"
                       :value="proformaAssumptions.manufacturing.biocharCostPerKiloByPhase[bci]"
                       @input="proformaAssumptions.manufacturing.biocharCostPerKiloByPhase[bci] = +$event.target.value; proformaRecompute()"
                       class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-black focus:border-black font-mono">
                <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">$/kg</span>
              </div>
            </div>
          </template>
        </div>
      `)}

    </div>
  `;
}
