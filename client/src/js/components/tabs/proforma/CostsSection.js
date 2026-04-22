import { numInput, formGrid, card, sectionHeader, criticalBlock, advancedAccordion, HELP } from './helpers.js';

// Costs = raw material + manufacturing labor + phase-specific biochar.
// Critical tier: hemp cost inputs (directly hit COGS) and top-line
// manufacturing params. Advanced tier: per-phase biochar cost and the
// FTE role table.

function _fteRolesTable() {
  return card('Manufacturing labor (FTE roles)', `
    <div class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr class="text-gray-500">
            <th class="text-left py-1.5 pr-2 font-medium">Role</th>
            <th class="text-center py-1.5 px-1.5 font-medium w-20">Count</th>
            <th class="text-center py-1.5 px-1.5 font-medium w-32">Monthly cost</th>
            <th class="text-right py-1.5 pl-2 font-medium w-32 border-l border-gray-200">Annual</th>
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
                       class="w-full text-xs border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
              </td>
              <td class="py-1 px-1">
                <input type="number"
                       :value="role.count"
                       @input="proformaAssumptions.manufacturing.fteRoles[ri].count = +$event.target.value; proformaRecompute()"
                       class="w-full text-center text-xs border-gray-300 rounded px-1.5 py-1 font-mono tabular-nums focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
              </td>
              <td class="py-1 px-1">
                <input type="number"
                       :value="role.monthlyCost"
                       @input="proformaAssumptions.manufacturing.fteRoles[ri].monthlyCost = +$event.target.value; proformaRecompute()"
                       class="w-full text-right text-xs border-gray-300 rounded px-1.5 py-1 font-mono tabular-nums focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
              </td>
              <td class="py-1 pl-2 text-right font-mono text-gray-600 border-l border-gray-200 tabular-nums"
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
            <td colspan="3" class="py-1.5 text-right text-xs font-semibold text-gray-700 pr-2">Total annual</td>
            <td class="py-1.5 pl-2 text-right font-mono font-semibold text-gray-700 border-l border-gray-200 tabular-nums"
                x-text="window._pfFmtC(proformaAssumptions.manufacturing.fteRoles.reduce((t, r) => t + r.count * r.monthlyCost * 12, 0), true)"></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
    <button @click="addProformaFteRole()"
            class="mt-2 text-[11px] text-gray-500 hover:text-gray-900 underline">
      + Add role
    </button>
    <p class="text-[11px] text-gray-500 leading-snug mt-3">
      Per-role headcount × monthly cost → total manufacturing labor. Feeds into COGS via the shifts-per-month factor below.
    </p>
  `);
}

function _biocharByPhaseBlock() {
  return card('Biochar cost by phase', `
    <div class="grid grid-cols-3 gap-3">
      <template x-for="(bc, bci) in proformaAssumptions.manufacturing.biocharCostPerKiloByPhase" :key="bci">
        <div>
          <label class="block text-[10px] uppercase tracking-wide font-semibold text-gray-500 mb-1" x-text="'Phase ' + (bci+1)"></label>
          <div class="relative">
            <input type="number" step="0.01"
                   :value="proformaAssumptions.manufacturing.biocharCostPerKiloByPhase[bci]"
                   @input="proformaAssumptions.manufacturing.biocharCostPerKiloByPhase[bci] = +$event.target.value; proformaRecompute()"
                   class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 pr-10 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 font-mono tabular-nums">
            <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">$/kg</span>
          </div>
        </div>
      </template>
    </div>
    <p class="text-[11px] text-gray-500 leading-snug mt-3">
      ${HELP['manufacturing.biocharCostByPhase'].help} <span class="text-gray-400">Feeds → ${HELP['manufacturing.biocharCostByPhase'].dependsOn}</span>
    </p>
  `);
}

export function getCostsSection() {
  const hemp = [
    { label: 'Hemp cost', path: 'proformaAssumptions.cogs.hempCostPerKilo',
      unit: '$/kg', step: 0.01, ...HELP['cogs.hempCostPerKilo'] },
    { label: 'Hemp contingency', path: 'proformaAssumptions.cogs.hempContingencyPct',
      unit: '%', format: 'fraction-percent', step: 1, ...HELP['cogs.hempContingencyPct'] },
    { label: 'Hemp shipping', path: 'proformaAssumptions.cogs.hempShippingPerKilo',
      unit: '$/kg', step: 0.01, ...HELP['cogs.hempShippingPerKilo'] }
  ];

  const manufacturing = [
    { label: 'Shifts per month', path: 'proformaAssumptions.manufacturing.shiftsPerMonth',
      step: 1, ...HELP['manufacturing.shiftsPerMonth'] },
    { label: 'Maintenance contingency', path: 'proformaAssumptions.manufacturing.maintenanceContingencyPct',
      unit: '%', format: 'fraction-percent', step: 1, ...HELP['manufacturing.maintenanceContingencyPct'] },
    { label: 'Validation phase cost', path: 'proformaAssumptions.manufacturing.validationPhaseMonthly',
      unit: '$/mo', step: 1000, ...HELP['manufacturing.validationPhaseMonthly'] }
  ];

  return `
    <section class="max-w-5xl">
      ${sectionHeader('Costs', 'Raw materials, labor, and per-phase biochar. Directly sets gross margin.')}

      ${criticalBlock(
        `<h3 class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2 mt-2">Hemp / raw materials</h3>
         ${formGrid(hemp.map(f => numInput(f.label, f.path, f)).join(''))}
         <div class="mt-3 bg-gray-50 rounded-md px-3 py-2 text-xs font-mono text-gray-600 inline-block">
           Effective hemp cost:
           <span class="font-semibold text-gray-900"
                 x-text="'$' + ((proformaAssumptions.cogs.hempCostPerKilo * (1 + proformaAssumptions.cogs.hempContingencyPct)) + proformaAssumptions.cogs.hempShippingPerKilo).toFixed(2) + '/kg'"></span>
         </div>
         <h3 class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2 mt-6">Manufacturing parameters</h3>
         ${formGrid(manufacturing.map(f => numInput(f.label, f.path, f)).join(''))}`,
        { label: 'Critical', hint: 'Hemp inputs + top-line manufacturing costs' }
      )}

      ${advancedAccordion('costs',
        `${_biocharByPhaseBlock()}
         ${_fteRolesTable()}`,
        { label: 'Advanced', hint: 'Per-phase biochar cost and FTE role table' }
      )}
    </section>
  `;
}
