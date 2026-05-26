import { numInput, formGrid, card, sectionHeader, quarterlyMatrix, HELP } from './helpers.js';

function _staffingTable() {
  return card('Staffing', `
    <div class="flex items-center gap-2 mb-3">
      <span class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Year</span>
      <div class="flex gap-1">
        ${['year0', 'year1', 'year2', 'year3', 'year4'].map((yr, i) => `
          <button @click="proformaStaffingYear = '${yr}'"
                  :class="proformaStaffingYear === '${yr}' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  class="px-3 py-1 text-xs font-medium rounded-md transition-colors">
            Y${i}
          </button>
        `).join('')}
      </div>
    </div>

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

    <div class="mt-3 pt-2 border-t border-gray-200">
      <div class="grid grid-cols-4 gap-2">
        ${[0, 1, 2, 3].map(qi => `
          <div class="text-center">
            <span class="text-[10px] text-gray-400">Q${qi + 1} cost</span>
            <p class="text-xs font-mono font-medium text-gray-700 tabular-nums"
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
    <p class="text-[11px] text-gray-500 leading-snug mt-3">
      Headcount × annual salary ÷ 4 → quarterly cost. Benefits % (below) is layered on top from Month 3 onward.
    </p>
  `, { subtitle: 'Quarterly headcount + salary per role, per year. Biggest OPEX line.' });
}

function _staffingRoleBlock(role, displayName) {
  const path = `proformaAssumptions.opex.staffing[proformaStaffingYear].${role}`;
  return `
    <tr class="border-t border-gray-100">
      <td class="py-1 pr-2 text-gray-700 font-medium">${displayName}</td>
      ${[0, 1, 2, 3].map(qi => `
        <td class="py-1 px-1">
          <input type="number" :value="${path}.count[${qi}]"
                 @input="${path}.count[${qi}] = +$event.target.value; proformaRecompute()"
                 class="w-full text-right text-xs border-gray-300 rounded px-1.5 py-1 font-mono tabular-nums focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
        </td>
      `).join('')}
      <td class="py-1 pl-2 border-l border-gray-200">
        <div x-show="!Array.isArray(${path}.salary)">
          <input type="number" :value="${path}.salary"
                 @input="${path}.salary = +$event.target.value; proformaRecompute()"
                 class="w-full text-right text-xs border-gray-300 rounded px-1.5 py-1 font-mono tabular-nums focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
          <button @click="toggleProformaSalaryMode(proformaStaffingYear, '${role}')"
                  class="text-[10px] text-gray-500 hover:text-gray-900 mt-0.5 underline">Per quarter</button>
        </div>
        <div x-show="Array.isArray(${path}.salary)">
          <span class="text-xs text-gray-500 italic">Varies</span>
          <button @click="toggleProformaSalaryMode(proformaStaffingYear, '${role}')"
                  class="text-[10px] text-gray-500 hover:text-gray-900 ml-1 underline">Uniform</button>
        </div>
      </td>
    </tr>
    <tr x-show="Array.isArray(${path}.salary)" class="border-t border-gray-50 bg-gray-50/50">
      <td class="py-1 pr-2 text-[10px] text-gray-400 text-right">salary/q</td>
      ${[0, 1, 2, 3].map(qi => `
        <td class="py-1 px-1">
          <template x-if="Array.isArray(${path}.salary)">
            <input type="number" :value="${path}.salary[${qi}]"
                   @input="${path}.salary[${qi}] = +$event.target.value; proformaRecompute()"
                   class="w-full text-right text-xs border-gray-200 rounded px-1.5 py-1 font-mono tabular-nums bg-white focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
          </template>
        </td>
      `).join('')}
      <td class="py-1 pl-2 border-l border-gray-200"></td>
    </tr>
  `;
}

function _overheadBlock() {
  return card('General overhead', `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
      ${numInput('Base annual overhead', 'proformaAssumptions.opex.generalOverhead.base', {
        unit: '$', step: 1000, ...HELP['opex.generalOverhead.base']
      })}
      <div>
        <label class="flex items-center text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-1">
          Growth multiplier by year
        </label>
        <div class="grid grid-cols-5 gap-2">
          <template x-for="(gm, gi) in proformaAssumptions.opex.generalOverhead.growthByYear" :key="gi">
            <div>
              <span class="text-[10px] text-gray-400 font-mono" x-text="'Y' + gi"></span>
              <input type="number" step="0.1" :value="gm"
                     @input="proformaAssumptions.opex.generalOverhead.growthByYear[gi] = +$event.target.value; proformaRecompute()"
                     class="w-full text-sm border-gray-300 rounded-md px-2 py-1 font-mono tabular-nums focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
              <span class="block text-[10px] text-gray-400 font-mono mt-0.5"
                    x-text="window._pfFmtC(proformaAssumptions.opex.generalOverhead.base * proformaAssumptions.opex.generalOverhead.growthByYear[gi], true)"></span>
            </div>
          </template>
        </div>
        <p class="text-[11px] text-gray-400 leading-snug mt-1">${HELP['opex.generalOverhead.growthByYear'].help}</p>
      </div>
    </div>
  `);
}

function _insuranceBlock() {
  return card('Business insurance (annual)', `
    <div class="grid grid-cols-5 gap-3">
      <template x-for="(ins, ii) in proformaAssumptions.opex.businessInsurance" :key="ii">
        <div>
          <label class="block text-[10px] uppercase tracking-wide font-semibold text-gray-500 mb-1" x-text="'Y' + ii"></label>
          <input type="number" :value="ins"
                 @input="proformaAssumptions.opex.businessInsurance[ii] = +$event.target.value; proformaRecompute()"
                 class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 font-mono tabular-nums focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
        </div>
      </template>
    </div>
    <p class="text-[11px] text-gray-500 leading-snug mt-3">${HELP['opex.businessInsurance'].help}</p>
  `);
}

export function getOperationsSection() {
  const percentages = [
    { label: 'Benefits', path: 'proformaAssumptions.opex.benefitsPct',
      unit: '%', format: 'fraction-percent', step: 1, ...HELP['opex.benefitsPct'] },
    { label: 'UofA royalty', path: 'proformaAssumptions.opex.uofaRoyaltyPct',
      unit: '%', format: 'fraction-percent', step: 0.1, ...HELP['opex.uofaRoyaltyPct'] },
    { label: 'Sales commission', path: 'proformaAssumptions.opex.salesCommissionPct',
      unit: '%', format: 'fraction-percent', step: 0.1, ...HELP['opex.salesCommissionPct'] }
  ];

  // OPEX contingency: 5-cell Y0-Y4 grid (% of base OPEX). Lives in its
  // own card so the per-year mental model is obvious and matches the
  // shape of `efficiencyByYear` on the Production tab.
  const contingencyGrid = `
    <div class="grid grid-cols-5 gap-3">
      <template x-for="(pct, yi) in proformaAssumptions.opex.contingencyPct" :key="yi">
        <div>
          <label class="block text-[10px] uppercase tracking-wide font-semibold text-gray-500 mb-1" x-text="'Y' + yi"></label>
          <div class="relative">
            <input type="number" step="0.5"
                   :value="(proformaAssumptions.opex.contingencyPct[yi] * 100).toFixed(2)"
                   @input="proformaAssumptions.opex.contingencyPct[yi] = (+$event.target.value) / 100; proformaRecompute()"
                   class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 pr-8 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 font-mono tabular-nums">
            <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">%</span>
          </div>
        </div>
      </template>
    </div>
  `;

  return `
    <section class="max-w-5xl">
      ${sectionHeader('Operations', 'Staffing, benefits, overhead, and R&D. These are the OPEX levers that determine break-even timing.')}

      <div class="space-y-6">
        ${_staffingTable()}

        ${card('Rates & percentages', formGrid(percentages.map(f => numInput(f.label, f.path, f)).join('')))}

        ${card('OPEX contingency by year', contingencyGrid, { subtitle: '% uplift on the sum of all other OPEX lines, per year.' })}

        ${_overheadBlock()}

        ${_insuranceBlock()}

        ${quarterlyMatrix('Patent legal costs', 'proformaAssumptions.opex.legal.patent', { showTotal: true, subtitle: 'Quarterly patent spend by year.' })}

        ${quarterlyMatrix('Corporate legal costs', 'proformaAssumptions.opex.legal.corporate', { showTotal: true, subtitle: 'Quarterly corporate counsel spend by year.' })}

        ${quarterlyMatrix('R&D spend', 'proformaAssumptions.rnd', { showTotal: true, subtitle: 'Quarterly research-and-development spend.' })}
      </div>
    </section>
  `;
}
