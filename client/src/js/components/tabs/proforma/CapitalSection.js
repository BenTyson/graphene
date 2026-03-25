import { numInput, card, quarterlyMatrix, HELP } from './helpers.js';

export function getCapitalSection() {
  return `
    <div class="space-y-4">

      ${card('Starting Position', `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${numInput('Starting Cash', 'proformaAssumptions.capital.startingCash', {
            help: HELP['capital.startingCash']
          })}
          ${numInput('Initial Investment', 'proformaAssumptions.capital.initialInvestment', {
            help: HELP['capital.initialInvestment']
          })}
        </div>
        <div class="mt-2 text-xs font-mono text-gray-500 bg-gray-50 rounded px-3 py-1.5"
             x-text="'Opening balance: ' + window._pfFmtC(proformaAssumptions.capital.startingCash + (proformaAssumptions.capital.initialInvestment || 0))">
        </div>
      `)}

      ${card('Capital Raises', `
        <template x-if="!proformaAssumptions.capital.raises || proformaAssumptions.capital.raises.length === 0">
          <p class="text-sm text-gray-400 italic">No additional capital raises planned.</p>
        </template>
        <template x-if="proformaAssumptions.capital.raises && proformaAssumptions.capital.raises.length > 0">
          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead>
                <tr class="text-gray-500">
                  <th class="text-left py-1.5 pr-2 font-medium">Month</th>
                  <th class="text-left py-1.5 px-2 font-medium">Amount</th>
                  <th class="text-right py-1.5 px-2 font-medium">Cumulative</th>
                  <th class="w-8"></th>
                </tr>
              </thead>
              <tbody>
                <template x-for="(raise, ri) in proformaAssumptions.capital.raises" :key="ri">
                  <tr class="border-t border-gray-100">
                    <td class="py-1 pr-2">
                      <input type="number"
                             :value="raise.month"
                             @input="proformaAssumptions.capital.raises[ri].month = +$event.target.value; proformaRecompute()"
                             class="w-20 text-sm border-gray-300 rounded-md px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-black focus:border-black">
                    </td>
                    <td class="py-1 px-2">
                      <input type="number"
                             :value="raise.amount"
                             @input="proformaAssumptions.capital.raises[ri].amount = +$event.target.value; proformaRecompute()"
                             class="w-32 text-sm border-gray-300 rounded-md px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-black focus:border-black">
                    </td>
                    <td class="py-1 px-2 text-right font-mono text-gray-600"
                        x-text="window._pfFmtC(proformaAssumptions.capital.raises.slice(0, ri + 1).reduce((t, r) => t + r.amount, 0))">
                    </td>
                    <td class="py-1 pl-1">
                      <button @click="removeProformaRaise(ri)"
                              class="text-gray-400 hover:text-red-500 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </template>
        <div class="mt-2">
          <button @click="addProformaRaise()" class="text-sm text-gray-500 hover:text-gray-700 underline">+ Add Raise</button>
        </div>
      `)}

      ${quarterlyMatrix('R&D Equipment CapEx', 'proformaAssumptions.capexLab', { showTotal: true })}

    </div>
  `;
}
