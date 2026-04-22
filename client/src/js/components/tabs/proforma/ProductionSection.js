import { numInput, card, HELP } from './helpers.js';
import { sectionHero } from './cards.js';
import { productionPulse } from './ProductionPulse.js';

export function getProductionSection() {
  return `
    <section class="max-w-3xl">
      ${sectionHero(
        'How fast can we actually make it?',
        'Hemp in, graphene out, stock in between. This is the heartbeat of the business — everything downstream depends on it.'
      )}

      ${productionPulse()}

      <div class="space-y-4">

      ${card('Process Chemistry', `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          ${numInput('Biochar Use (g)', 'proformaAssumptions.production.initialBiocharUseG', {
            indicator: `proformaComputed ? '\u2192 ' + (proformaAssumptions.production.initialBiocharUseG * proformaAssumptions.production.grapheneYieldPercent).toFixed(1) + ' g graphene/batch' : ''`
          })}
          ${numInput('KOH (g)', 'proformaAssumptions.production.initialKOHG')}
          ${numInput('Density Mix', 'proformaAssumptions.production.densityMix', {
            step: 0.01,
            help: HELP['production.densityMix']
          })}
          ${numInput('Graphene Yield %', 'proformaAssumptions.production.grapheneYieldPercent', {
            step: 0.01,
            help: HELP['production.grapheneYieldPercent']
          })}
          ${numInput('Buffer Toggle', 'proformaAssumptions.production.bufferToggle', {
            step: 0.1,
            help: HELP['production.bufferToggle']
          })}
          ${numInput('Vol. Conversion', 'proformaAssumptions.production.volumeConversionCuFt', {
            step: 0.0000001,
            help: HELP['production.volumeConversionCuFt']
          })}
        </div>
      `)}

      ${card('Kiln Specifications', `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${numInput('Pilot Kiln', 'proformaAssumptions.production.smallKilnCuFtPerHour', {
            unit: 'cu ft/hr',
            indicator: `proformaComputed ? '\u2192 ' + proformaComputed.production.pilotMonthlyByPhase[0].toFixed(1) + ' kg/mo (Phase 1)' : ''`
          })}
          ${numInput('Broderick Kiln', 'proformaAssumptions.production.largeKilnCuFtPerHour', {
            unit: 'cu ft/hr',
            indicator: `proformaComputed ? '\u2192 ' + proformaComputed.production.broderickMonthlyByPhase[2].toFixed(1) + ' kg/mo (Phase 3)' : ''`
          })}
        </div>
      `)}

      ${card('Operating Schedule', `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <template x-for="(phase, pi) in proformaAssumptions.production.phases" :key="pi">
            <div class="border border-gray-100 rounded-lg p-3">
              <div class="text-xs font-semibold text-gray-600 mb-2"
                   x-text="'Phase ' + (pi+1) + ' (Mo ' + (pi === 0 ? '0-23' : pi === 1 ? '24-35' : '36-47') + ')'"></div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[11px] font-medium text-gray-500 mb-1">Hrs/day</label>
                  <input type="number"
                         :value="proformaAssumptions.production.phases[pi].hoursPerDay"
                         @input="proformaAssumptions.production.phases[pi].hoursPerDay = +$event.target.value; proformaRecompute()"
                         class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-black focus:border-black font-mono">
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-gray-500 mb-1">Days/mo</label>
                  <input type="number"
                         :value="proformaAssumptions.production.phases[pi].daysPerMonth"
                         @input="proformaAssumptions.production.phases[pi].daysPerMonth = +$event.target.value; proformaRecompute()"
                         class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-black focus:border-black font-mono">
                </div>
              </div>
              <span class="block text-[10px] text-gray-400 font-mono mt-1.5"
                    x-text="'= ' + (proformaAssumptions.production.phases[pi].hoursPerDay * proformaAssumptions.production.phases[pi].daysPerMonth) + ' hrs/mo'"></span>
            </div>
          </template>
        </div>
      `)}

      ${card('Efficiency by Year', `
        <div class="grid grid-cols-4 gap-3">
          <template x-for="(eff, ei) in proformaAssumptions.production.efficiencyByYear" :key="ei">
            <div>
              <label class="block text-[11px] font-medium text-gray-500 mb-1" x-text="'Y' + ei"></label>
              <input type="number" step="0.01"
                     :value="proformaAssumptions.production.efficiencyByYear[ei]"
                     @input="proformaAssumptions.production.efficiencyByYear[ei] = +$event.target.value; proformaRecompute()"
                     class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-black focus:border-black font-mono">
            </div>
          </template>
        </div>
        <span class="block text-[10px] text-gray-400 italic mt-1.5">${HELP['production.efficiencyByYear']}</span>
      `)}

      <div x-show="proformaComputed" class="bg-blue-50 rounded-lg px-4 py-2.5 text-xs font-mono text-gray-600">
        <span>Pilot: </span>
        <template x-for="(val, vi) in (proformaComputed ? proformaComputed.production.pilotMonthlyByPhase : [])" :key="'p'+vi">
          <span>
            <span x-text="val.toFixed(1)"></span>
            <span x-show="vi < 2"> / </span>
          </span>
        </template>
        <span> kg/mo</span>
        <span class="mx-2">|</span>
        <span>Broderick: </span>
        <span x-text="proformaComputed ? proformaComputed.production.broderickMonthlyByPhase[2].toFixed(1) : ''"></span>
        <span> kg/mo (Phase 3)</span>
      </div>

      </div>
    </section>
  `;
}
