import { numInput, card, HELP } from './helpers.js';

function _revenueSegment(title, segmentKey, revenueComputedKey) {
  const yearMap = { year1: 1, year2: 2, year3: 3 };

  return card(title, `
    <div class="space-y-4">
      ${numInput('Start Month', 'proformaAssumptions.revenue.' + segmentKey + '.startMonth', {
        help: HELP['revenue.startMonth']
      })}

      <div>
        <label class="block text-[11px] font-medium text-gray-500 mb-2">Market Share by Year</label>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          ${['year1', 'year2', 'year3'].map(yr => `
            <div class="border border-gray-100 rounded-lg p-3">
              <span class="text-xs font-semibold text-gray-600">${yr.replace('year', 'Y')}</span>
              <div class="mt-2">
                ${numInput('Market Share %', 'proformaAssumptions.revenue.' + segmentKey + '.' + yr + '.marketSharePct', {
                  step: 0.001,
                  indicator: `proformaComputed ? '\u2192 ' + window._pfFmtC(proformaComputed.yearly.${revenueComputedKey} ? proformaComputed.yearly.${revenueComputedKey}[${yearMap[yr]}] : 0, true) + '/yr' : ''`
                })}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div>
        <label class="block text-[11px] font-medium text-gray-500 mb-2">Q Distribution</label>
        <span class="block text-[10px] text-gray-400 italic mb-2">${HELP['revenue.qDist']}</span>
        <div class="space-y-2">
          ${['year1', 'year2', 'year3'].map(yr => `
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-medium text-gray-500 w-6 shrink-0">${yr.replace('year', 'Y')}</span>
              <div class="grid grid-cols-4 gap-1.5 flex-1">
                <template x-for="(qv, qi) in proformaAssumptions.revenue.${segmentKey}.${yr}.qDist" :key="qi">
                  <div>
                    <span class="text-[10px] text-gray-400" x-text="'Q' + (qi+1)"></span>
                    <input type="number" step="0.01"
                           :value="proformaAssumptions.revenue.${segmentKey}.${yr}.qDist[qi]"
                           @input="proformaAssumptions.revenue.${segmentKey}.${yr}.qDist[qi] = +$event.target.value; proformaRecompute()"
                           class="w-full text-xs border-gray-300 rounded px-1.5 py-1 font-mono focus:ring-1 focus:ring-black focus:border-black">
                  </div>
                </template>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <span class="text-[10px] font-mono w-10 text-right"
                      :class="Math.abs(proformaAssumptions.revenue.${segmentKey}.${yr}.qDist.reduce((a,b) => a+b, 0) - 1.0) < 0.001 ? 'text-green-600' : 'text-red-500'"
                      x-text="proformaAssumptions.revenue.${segmentKey}.${yr}.qDist.reduce((a,b) => a+b, 0).toFixed(3)"></span>
                <template x-if="Math.abs(proformaAssumptions.revenue.${segmentKey}.${yr}.qDist.reduce((a,b) => a+b, 0) - 1.0) < 0.001">
                  <svg class="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  </svg>
                </template>
                <template x-if="Math.abs(proformaAssumptions.revenue.${segmentKey}.${yr}.qDist.reduce((a,b) => a+b, 0) - 1.0) >= 0.001">
                  <button @click="normalizeProformaQDist(proformaAssumptions.revenue.${segmentKey}.${yr}.qDist)"
                          class="text-[10px] text-red-500 hover:text-red-700 underline whitespace-nowrap">
                    Normalize
                  </button>
                </template>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `);
}

export function getRevenueSection() {
  return `
    <div class="space-y-4">

      ${card('Pricing', `
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="text-gray-500">
                <th class="text-left py-1.5 pr-2 font-medium"></th>
                <template x-for="yr in ['year0','year1','year2','year3']" :key="yr">
                  <th class="text-center py-1.5 px-1.5 font-medium" x-text="yr.replace('year','Y')"></th>
                </template>
              </tr>
            </thead>
            <tbody class="font-mono">
              <tr class="border-t border-gray-100">
                <td class="py-1.5 pr-2 text-gray-600 font-medium font-sans">Supercap ($/kg)</td>
                <template x-for="yr in ['year0','year1','year2','year3']" :key="yr">
                  <td class="py-1 px-1">
                    <input type="number"
                           :value="proformaAssumptions.pricing.supercapPerKg[yr]"
                           @input="proformaAssumptions.pricing.supercapPerKg[yr] = +$event.target.value; proformaRecompute()"
                           class="w-full text-right text-xs border-gray-300 rounded px-1.5 py-1 font-mono focus:ring-1 focus:ring-black focus:border-black">
                  </td>
                </template>
              </tr>
              <tr class="border-t border-gray-100">
                <td class="py-1.5 pr-2 text-gray-600 font-medium font-sans">Carbon Black ($/kg)</td>
                <template x-for="yr in ['year0','year1','year2','year3']" :key="yr">
                  <td class="py-1 px-1">
                    <input type="number"
                           :value="proformaAssumptions.pricing.carbonBlackPerKg[yr]"
                           @input="proformaAssumptions.pricing.carbonBlackPerKg[yr] = +$event.target.value; proformaRecompute()"
                           class="w-full text-right text-xs border-gray-300 rounded px-1.5 py-1 font-mono focus:ring-1 focus:ring-black focus:border-black">
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      `)}

      ${_revenueSegment('Supercap Electrode', 'supercapElectrode', 'revenueSupercap')}

      ${_revenueSegment('Carbon Black CB/CA', 'carbonBlackCathodeAnode', 'revenueCarbonBlack')}

    </div>
  `;
}
