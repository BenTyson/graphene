import { numInput, formGrid, card, sectionHeader, criticalBlock, advancedAccordion, HELP } from './helpers.js';

// Revenue is the biggest strategic lever in the proforma. Critical tier
// shows the market share ramp + start months. Advanced tier holds pricing
// and the quarterly-shape (qDist) weights that rarely move in a meeting.

function _qDistBlock(segmentKey, segmentLabel) {
  return `
    <div class="border border-gray-200 rounded-lg overflow-hidden">
      <div class="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <h4 class="text-sm font-semibold text-gray-700">${segmentLabel} — quarterly shape</h4>
        <p class="text-[11px] text-gray-500 mt-0.5">Weights split each year's revenue across Q1–Q4. Must sum to 1.0 per year.</p>
      </div>
      <div class="px-4 py-3.5 space-y-2.5">
        ${['year1', 'year2', 'year3'].map(yr => `
          <div class="flex items-center gap-3">
            <span class="text-[11px] font-semibold text-gray-500 w-6 shrink-0">${yr.replace('year', 'Y')}</span>
            <div class="grid grid-cols-4 gap-2 flex-1">
              <template x-for="qi in [0,1,2,3]" :key="qi">
                <div class="flex flex-col items-center">
                  <span class="text-[10px] text-gray-400 font-mono" x-text="'Q' + (qi+1)"></span>
                  <input type="number" step="0.01"
                         :value="proformaAssumptions.revenue.${segmentKey}.${yr}.qDist[qi]"
                         @input="proformaAssumptions.revenue.${segmentKey}.${yr}.qDist[qi] = +$event.target.value; proformaRecompute()"
                         class="w-full text-center text-xs border-gray-200 rounded-md px-1.5 py-1 font-mono focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
                </div>
              </template>
            </div>
            <div class="flex items-center gap-2 shrink-0 w-28 justify-end">
              <span class="text-[11px] font-mono tabular-nums"
                    :class="Math.abs(proformaAssumptions.revenue.${segmentKey}.${yr}.qDist.reduce((a,b) => a+b, 0) - 1.0) < 0.001 ? 'text-green-600' : 'text-red-500'"
                    x-text="proformaAssumptions.revenue.${segmentKey}.${yr}.qDist.reduce((a,b) => a+b, 0).toFixed(3)"></span>
              <template x-if="Math.abs(proformaAssumptions.revenue.${segmentKey}.${yr}.qDist.reduce((a,b) => a+b, 0) - 1.0) < 0.001">
                <svg class="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                </svg>
              </template>
              <template x-if="Math.abs(proformaAssumptions.revenue.${segmentKey}.${yr}.qDist.reduce((a,b) => a+b, 0) - 1.0) >= 0.001">
                <button @click="normalizeProformaQDist(proformaAssumptions.revenue.${segmentKey}.${yr}.qDist)"
                        class="text-[11px] text-gray-700 hover:text-gray-900 underline">
                  Normalize
                </button>
              </template>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function _pricingBlock() {
  return card('Unit pricing ($/kg)', `
    <div class="grid grid-cols-2 gap-x-6 gap-y-5">
      <div>
        <h5 class="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-2">Supercap</h5>
        <div class="grid grid-cols-4 gap-2">
          ${['year0', 'year1', 'year2', 'year3'].map((yr, i) => `
            <div>
              <label class="block text-[10px] text-gray-400 font-mono mb-0.5">Y${i}</label>
              <input type="number" step="1"
                     :value="proformaAssumptions.pricing.supercapPerKg.${yr}"
                     @input="proformaAssumptions.pricing.supercapPerKg.${yr} = +$event.target.value; proformaRecompute()"
                     class="w-full text-sm border-gray-300 rounded-md px-2 py-1.5 font-mono tabular-nums focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
            </div>
          `).join('')}
        </div>
      </div>
      <div>
        <h5 class="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-2">Carbon black</h5>
        <div class="grid grid-cols-4 gap-2">
          ${['year0', 'year1', 'year2', 'year3'].map((yr, i) => `
            <div>
              <label class="block text-[10px] text-gray-400 font-mono mb-0.5">Y${i}</label>
              <input type="number" step="1"
                     :value="proformaAssumptions.pricing.carbonBlackPerKg.${yr}"
                     @input="proformaAssumptions.pricing.carbonBlackPerKg.${yr} = +$event.target.value; proformaRecompute()"
                     class="w-full text-sm border-gray-300 rounded-md px-2 py-1.5 font-mono tabular-nums focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    <p class="text-[11px] text-gray-500 leading-snug mt-3">
      Blended sell price per kg for each segment, per year. Revenue = price × kg × market share.
    </p>
  `, { subtitle: 'Premium supercap pricing vs. commodity carbon black — both flow straight into revenue.' });
}

export function getRevenueSection() {
  const critical = [
    // Supercap ramp
    { label: 'Supercap — Y3 market share', path: 'proformaAssumptions.revenue.supercapElectrode.year3.marketSharePct',
      unit: '%', format: 'fraction-percent', step: 0.1, ...HELP['revenue.supercap.year3'] },
    { label: 'Supercap — Y2 market share', path: 'proformaAssumptions.revenue.supercapElectrode.year2.marketSharePct',
      unit: '%', format: 'fraction-percent', step: 0.1, ...HELP['revenue.supercap.year2'] },
    { label: 'Supercap — Y1 market share', path: 'proformaAssumptions.revenue.supercapElectrode.year1.marketSharePct',
      unit: '%', format: 'fraction-percent', step: 0.1, ...HELP['revenue.supercap.year1'] },
    { label: 'Supercap — revenue start month', path: 'proformaAssumptions.revenue.supercapElectrode.startMonth',
      unit: 'mo', step: 1, ...HELP['revenue.supercap.startMonth'] },

    // Carbon black ramp
    { label: 'Carbon black — Y3 market share', path: 'proformaAssumptions.revenue.carbonBlackCathodeAnode.year3.marketSharePct',
      unit: '%', format: 'fraction-percent', step: 0.05, ...HELP['revenue.carbonBlack.year3'] },
    { label: 'Carbon black — Y2 market share', path: 'proformaAssumptions.revenue.carbonBlackCathodeAnode.year2.marketSharePct',
      unit: '%', format: 'fraction-percent', step: 0.05, ...HELP['revenue.carbonBlack.year2'] },
    { label: 'Carbon black — Y1 market share', path: 'proformaAssumptions.revenue.carbonBlackCathodeAnode.year1.marketSharePct',
      unit: '%', format: 'fraction-percent', step: 0.05, ...HELP['revenue.carbonBlack.year1'] },
    { label: 'Carbon black — revenue start month', path: 'proformaAssumptions.revenue.carbonBlackCathodeAnode.startMonth',
      unit: 'mo', step: 1, ...HELP['revenue.carbonBlack.startMonth'] }
  ];

  return `
    <section class="max-w-5xl">
      ${sectionHeader('Revenue', 'Market share ramp and revenue-start timing per segment. These dominate every downstream number.')}

      ${criticalBlock(formGrid(critical.map(f => numInput(f.label, f.path, f)).join('')),
        { label: 'Critical', hint: '8 fields — market share and ramp timing' })}

      ${advancedAccordion('revenue',
        `${_pricingBlock()}
         ${_qDistBlock('supercapElectrode', 'Supercap')}
         ${_qDistBlock('carbonBlackCathodeAnode', 'Carbon Black')}`,
        { label: 'Advanced', hint: 'Unit pricing and quarterly shape weights' }
      )}
    </section>
  `;
}
