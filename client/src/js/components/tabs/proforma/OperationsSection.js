import { numInput, card, quarterlyMatrix, HELP } from './helpers.js';

export function getOperationsSection() {
  return `
    <div class="space-y-4">

      <!-- ═══ Card A: Staffing ═══ -->
      ${card('Staffing', `
        <!-- Year selector pills -->
        <div class="flex gap-1 mb-3">
          ${['year0', 'year1', 'year2', 'year3'].map((yr, i) => `
            <button @click="proformaStaffingYear = '${yr}'"
                    :class="proformaStaffingYear === '${yr}' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                    class="px-3 py-1 text-xs font-medium rounded-md transition-colors">
              Y${i}
            </button>
          `).join('')}
        </div>

        <!-- Staffing table -->
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="text-gray-500">
                <th class="text-left py-1.5 pr-2 font-medium w-24">Role</th>
                <th class="text-right py-1.5 px-1.5 font-medium">Q1</th>
                <th class="text-right py-1.5 px-1.5 font-medium">Q2</th>
                <th class="text-right py-1.5 px-1.5 font-medium">Q3</th>
                <th class="text-right py-1.5 px-1.5 font-medium">Q4</th>
                <th class="text-right py-1.5 pl-2 font-medium border-l border-gray-200">Salary</th>
              </tr>
            </thead>
            <tbody>
              ${_staffingRoleBlock('operational', 'Operational')}
              ${_staffingRoleBlock('sales', 'Sales')}
              ${_staffingRoleBlock('executive', 'Executive')}
            </tbody>
          </table>
        </div>

        <!-- Computed quarterly cost row -->
        <div class="mt-3 pt-2 border-t border-gray-200">
          <div class="grid grid-cols-4 gap-2">
            ${[0, 1, 2, 3].map(qi => `
              <div class="text-center">
                <span class="text-[10px] text-gray-400">Q${qi + 1} Cost</span>
                <p class="text-xs font-mono font-medium text-gray-700"
                   x-text="(() => {
                     const yr = proformaStaffingYear;
                     const s = proformaAssumptions.opex.staffing[yr];
                     let total = 0;
                     ['operational','sales','executive'].forEach(r => {
                       const sal = Array.isArray(s[r].salary) ? s[r].salary[${qi}] : s[r].salary;
                       total += s[r].count[${qi}] * sal / 4;
                     });
                     return window._pfFmtC(total, true);
                   })()"></p>
              </div>
            `).join('')}
          </div>
        </div>
      `)}

      <!-- ═══ Card B: Benefits & Commissions ═══ -->
      ${card('Benefits & Commissions', `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          ${numInput('Benefits %', 'proformaAssumptions.opex.benefitsPct', { step: 0.01, help: HELP['opex.benefitsPct'] })}
          ${numInput('UofA Royalty %', 'proformaAssumptions.opex.uofaRoyaltyPct', { step: 0.01, help: HELP['opex.uofaRoyaltyPct'] })}
          ${numInput('Sales Commission %', 'proformaAssumptions.opex.salesCommissionPct', { step: 0.01, help: HELP['opex.salesCommissionPct'] })}
        </div>
      `)}

      <!-- ═══ Card C: General Overhead ═══ -->
      ${card('General Overhead', `
        <div class="mb-3">
          ${numInput('Base Annual $', 'proformaAssumptions.opex.generalOverhead.base', { help: HELP['opex.generalOverhead.base'] })}
        </div>
        <div>
          <label class="block text-[11px] font-medium text-gray-500 mb-1">Growth Multipliers</label>
          <div class="grid grid-cols-4 gap-2">
            <template x-for="(gm, gi) in proformaAssumptions.opex.generalOverhead.growthByYear" :key="gi">
              <div>
                <span class="text-[10px] text-gray-400" x-text="'Y' + gi"></span>
                <input type="number" step="0.1" :value="gm"
                       @input="proformaAssumptions.opex.generalOverhead.growthByYear[gi] = +$event.target.value; proformaRecompute()"
                       class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-black focus:border-black">
                <span class="block text-[10px] text-gray-400 font-mono mt-0.5"
                      x-text="window._pfFmtC(proformaAssumptions.opex.generalOverhead.base * proformaAssumptions.opex.generalOverhead.growthByYear[gi], true)"></span>
              </div>
            </template>
          </div>
        </div>
      `)}

      <!-- ═══ Card D: Legal Costs ═══ -->
      ${quarterlyMatrix('Patent Costs', 'proformaAssumptions.opex.legal.patent', { showTotal: true })}
      <div class="mt-4"></div>
      ${quarterlyMatrix('Corporate Legal', 'proformaAssumptions.opex.legal.corporate', { showTotal: true })}

      <!-- ═══ Card E: Business Insurance ═══ -->
      ${card('Business Insurance', `
        <div class="grid grid-cols-4 gap-2">
          <template x-for="(ins, ii) in proformaAssumptions.opex.businessInsurance" :key="ii">
            <div>
              <span class="text-[10px] text-gray-400" x-text="'Y' + ii"></span>
              <input type="number" :value="ins"
                     @input="proformaAssumptions.opex.businessInsurance[ii] = +$event.target.value; proformaRecompute()"
                     class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-black focus:border-black">
            </div>
          </template>
        </div>
      `)}

      <!-- ═══ Card F: R&D Spend ═══ -->
      ${quarterlyMatrix('R&D Spend', 'proformaAssumptions.rnd', { showTotal: true })}

    </div>
  `;
}

function _staffingRoleBlock(role, displayName) {
  const path = `proformaAssumptions.opex.staffing[proformaStaffingYear].${role}`;
  return `
    <!-- ${displayName} headcount row -->
    <tr class="border-t border-gray-100">
      <td class="py-1 pr-2 text-gray-700 font-medium">${displayName}</td>
      ${[0, 1, 2, 3].map(qi => `
        <td class="py-1 px-1">
          <input type="number" :value="${path}.count[${qi}]"
                 @input="${path}.count[${qi}] = +$event.target.value; proformaRecompute()"
                 class="w-full text-right text-xs border-gray-300 rounded px-1.5 py-1 font-mono focus:ring-1 focus:ring-black focus:border-black">
        </td>
      `).join('')}
      <td class="py-1 pl-2 border-l border-gray-200">
        <!-- Scalar salary -->
        <div x-show="!Array.isArray(${path}.salary)">
          <input type="number" :value="${path}.salary"
                 @input="${path}.salary = +$event.target.value; proformaRecompute()"
                 class="w-full text-right text-xs border-gray-300 rounded px-1.5 py-1 font-mono focus:ring-1 focus:ring-black focus:border-black">
          <button @click="toggleProformaSalaryMode(proformaStaffingYear, '${role}')"
                  class="text-[10px] text-blue-600 hover:text-blue-800 mt-0.5">Per quarter</button>
        </div>
        <!-- Array salary -->
        <div x-show="Array.isArray(${path}.salary)">
          <span class="text-xs text-gray-500 italic">Varies</span>
          <button @click="toggleProformaSalaryMode(proformaStaffingYear, '${role}')"
                  class="text-[10px] text-blue-600 hover:text-blue-800 ml-1">Use uniform</button>
        </div>
      </td>
    </tr>
    <!-- ${displayName} per-quarter salary sub-row (only when salary is array) -->
    <tr x-show="Array.isArray(${path}.salary)" class="border-t border-gray-50 bg-gray-50/50">
      <td class="py-1 pr-2 text-[10px] text-gray-400 text-right">salary/q</td>
      ${[0, 1, 2, 3].map(qi => `
        <td class="py-1 px-1">
          <template x-if="Array.isArray(${path}.salary)">
            <input type="number" :value="${path}.salary[${qi}]"
                   @input="${path}.salary[${qi}] = +$event.target.value; proformaRecompute()"
                   class="w-full text-right text-xs border-gray-200 rounded px-1.5 py-1 font-mono bg-white focus:ring-1 focus:ring-black focus:border-black">
          </template>
        </td>
      `).join('')}
      <td class="py-1 pl-2 border-l border-gray-200"></td>
    </tr>
  `;
}
