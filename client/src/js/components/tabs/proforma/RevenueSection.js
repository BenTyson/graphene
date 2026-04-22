import { sectionHero, conversationalCard, timelineCard, advancedReveal } from './cards.js';

// Revenue is the biggest strategic lever in the proforma. Cards are ordered
// so the highest-impact decisions (Y3 market share) surface first, with
// ramp-up timelines and pricing grouped logically. Quarterly distribution
// weights (qDist) stay out of sight under the advanced reveal — they rarely
// change in a strategy meeting but accuracy still depends on them.

function _qDistBlock(segmentKey, segmentLabel) {
  return `
    <div class="rounded-2xl border border-gray-200 bg-gray-50/60 p-5">
      <h4 class="text-sm font-semibold text-gray-900 mb-1">${segmentLabel} — quarterly shape</h4>
      <p class="text-xs text-gray-500 mb-4">Weights must sum to 1.0 for each year. Click Normalize to auto-balance.</p>
      <div class="space-y-2.5">
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

export function getRevenueSection() {
  const y3Rev = `window._pfFmtC(proformaComputed?.metrics?.y3Revenue || 0, true)`;
  const y3RevDelta = { label: 'Y3 revenue', expr: y3Rev, deltaKey: 'y3Revenue' };
  const breakEvenImpact = {
    label: 'Break-even',
    expr: `proformaComputed?.metrics?.breakEvenMonth >= 0 ? 'Month ' + proformaComputed.metrics.breakEvenMonth : 'N/A'`,
    deltaKey: 'breakEvenMonth'
  };

  return `
    <section class="max-w-3xl">
      ${sectionHero(
        'How big do we think we can get?',
        'Two segments, three years. Market share compounds everything downstream — this is where the conversation starts.'
      )}

      <div class="space-y-4">

        <!-- Supercap: biggest strategic lever first -->
        ${conversationalCard({
          sentence: 'If we capture __INPUT__ of the supercap market by 2027,',
          path: 'proformaAssumptions.revenue.supercapElectrode.year3.marketSharePct',
          unit: '%',
          format: 'fraction-percent',
          step: 0.1,
          inputWidth: 'w-20',
          slider: { min: 0, max: 25, step: 0.1, stops: [0, 5, 10, 15, 20, 25] },
          impact: y3RevDelta
        })}

        ${timelineCard({
          title: 'Supercap ramp',
          supporting: 'How market share builds up to the 2027 target.',
          inputs: [
            { label: 'Y1', path: 'proformaAssumptions.revenue.supercapElectrode.year1.marketSharePct', format: 'fraction-percent', step: 0.1, unit: '%', inputWidth: 'w-16' },
            { label: 'Y2', path: 'proformaAssumptions.revenue.supercapElectrode.year2.marketSharePct', format: 'fraction-percent', step: 0.1, unit: '%', inputWidth: 'w-16' },
            { label: 'Y3', path: 'proformaAssumptions.revenue.supercapElectrode.year3.marketSharePct', format: 'fraction-percent', step: 0.1, unit: '%', inputWidth: 'w-16' }
          ],
          impact: y3RevDelta
        })}

        ${conversationalCard({
          sentence: 'We start recognizing supercap revenue in month __INPUT__.',
          path: 'proformaAssumptions.revenue.supercapElectrode.startMonth',
          unit: '',
          format: 'number',
          step: 1,
          inputWidth: 'w-14',
          slider: { min: 0, max: 36, step: 1, stops: [0, 12, 24, 36] },
          impact: breakEvenImpact
        })}

        <!-- Divider between segments -->
        <div class="pt-3"></div>

        <!-- Carbon Black -->
        ${conversationalCard({
          sentence: 'If we capture __INPUT__ of the carbon black market by 2027,',
          path: 'proformaAssumptions.revenue.carbonBlackCathodeAnode.year3.marketSharePct',
          unit: '%',
          format: 'fraction-percent',
          step: 0.1,
          inputWidth: 'w-20',
          slider: { min: 0, max: 5, step: 0.05, stops: [0, 1, 2, 3, 4, 5] },
          impact: y3RevDelta
        })}

        ${timelineCard({
          title: 'Carbon black ramp',
          supporting: 'Slower to develop — the market is bigger but the sales cycle is longer.',
          inputs: [
            { label: 'Y1', path: 'proformaAssumptions.revenue.carbonBlackCathodeAnode.year1.marketSharePct', format: 'fraction-percent', step: 0.05, unit: '%', inputWidth: 'w-16' },
            { label: 'Y2', path: 'proformaAssumptions.revenue.carbonBlackCathodeAnode.year2.marketSharePct', format: 'fraction-percent', step: 0.05, unit: '%', inputWidth: 'w-16' },
            { label: 'Y3', path: 'proformaAssumptions.revenue.carbonBlackCathodeAnode.year3.marketSharePct', format: 'fraction-percent', step: 0.05, unit: '%', inputWidth: 'w-16' }
          ],
          impact: y3RevDelta
        })}

        ${conversationalCard({
          sentence: 'We start recognizing carbon black revenue in month __INPUT__.',
          path: 'proformaAssumptions.revenue.carbonBlackCathodeAnode.startMonth',
          unit: '',
          format: 'number',
          step: 1,
          inputWidth: 'w-14',
          slider: { min: 0, max: 47, step: 1, stops: [0, 12, 24, 36, 47] },
          impact: breakEvenImpact
        })}

      </div>

      ${advancedReveal('revenue', 2, `
        ${_qDistBlock('supercapElectrode', 'Supercap')}
        ${_qDistBlock('carbonBlackCathodeAnode', 'Carbon Black')}
      `)}
    </section>
  `;
}
