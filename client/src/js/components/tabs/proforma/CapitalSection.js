import { numInput, formGrid, card, sectionHeader, quarterlyMatrix, HELP } from './helpers.js';

function _raisesBlock() {
  return card('Capital raises', `
    <template x-if="!proformaAssumptions.capital.raises || proformaAssumptions.capital.raises.length === 0">
      <p class="text-xs text-gray-400 italic">No additional capital raises planned.</p>
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
                         class="w-20 text-sm border-gray-300 rounded-md px-2.5 py-1.5 font-mono tabular-nums focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
                </td>
                <td class="py-1 px-2">
                  <input type="number"
                         :value="raise.amount"
                         @input="proformaAssumptions.capital.raises[ri].amount = +$event.target.value; proformaRecompute()"
                         class="w-32 text-sm border-gray-300 rounded-md px-2.5 py-1.5 font-mono tabular-nums focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
                </td>
                <td class="py-1 px-2 text-right font-mono text-gray-600 tabular-nums"
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
    <button @click="addProformaRaise()" class="text-[11px] text-gray-500 hover:text-gray-900 underline mt-2">
      + Add raise
    </button>
    <p class="text-[11px] text-gray-500 leading-snug mt-3">
      Each raise lands as cash in the given month. Feeds cumulative cash and peak cash need.
    </p>
  `, { subtitle: 'Scheduled injections of cash beyond the initial investment.' });
}

export function getCapitalSection() {
  const starting = [
    { label: 'Starting cash', path: 'proformaAssumptions.capital.startingCash',
      unit: '$', step: 1000, ...HELP['capital.startingCash'] },
    { label: 'Initial investment', path: 'proformaAssumptions.capital.initialInvestment',
      unit: '$', step: 1000, ...HELP['capital.initialInvestment'] }
  ];

  return `
    <section class="max-w-5xl">
      ${sectionHeader('Capital', 'Cash position — opening balance, planned raises, and R&D equipment spend.')}

      <div class="space-y-6">
        ${card('Opening balance', `
          ${formGrid(starting.map(f => numInput(f.label, f.path, f)).join(''), { cols: 2 })}
          <div class="mt-3 text-xs font-mono text-gray-600 bg-gray-50 rounded-md px-3 py-1.5 inline-block"
               x-text="'Opening balance: ' + window._pfFmtC(proformaAssumptions.capital.startingCash + (proformaAssumptions.capital.initialInvestment || 0))">
          </div>
        `)}

        ${_raisesBlock()}

        ${quarterlyMatrix('R&D equipment capex', 'proformaAssumptions.capexLab', {
          showTotal: true,
          subtitle: 'Quarterly spend on lab equipment separate from production machines.'
        })}
      </div>
    </section>
  `;
}
