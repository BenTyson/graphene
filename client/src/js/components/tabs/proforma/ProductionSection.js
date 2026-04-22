import { numInput, formGrid, card, sectionHeader, criticalBlock, advancedAccordion, HELP } from './helpers.js';
import { productionPulse } from './ProductionPulse.js';

// Production = the heartbeat. Critical tier is chemistry + kiln sizes (the
// levers that change output kg). Advanced tier holds phase operating schedule,
// per-year efficiency multipliers, and the raw volume conversion.

function _phaseScheduleBlock() {
  return card('Operating schedule by phase', `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <template x-for="(phase, pi) in proformaAssumptions.production.phases" :key="pi">
        <div class="border border-gray-100 rounded-lg p-3">
          <div class="text-xs font-semibold text-gray-600 mb-2"
               x-text="'Phase ' + (pi+1) + ' (Mo ' + (pi === 0 ? '0-23' : pi === 1 ? '24-35' : '36-47') + ')'"></div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[10px] uppercase tracking-wide font-semibold text-gray-500 mb-1">Hrs / day</label>
              <input type="number"
                     :value="proformaAssumptions.production.phases[pi].hoursPerDay"
                     @input="proformaAssumptions.production.phases[pi].hoursPerDay = +$event.target.value; proformaRecompute()"
                     class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 font-mono tabular-nums">
            </div>
            <div>
              <label class="block text-[10px] uppercase tracking-wide font-semibold text-gray-500 mb-1">Days / mo</label>
              <input type="number"
                     :value="proformaAssumptions.production.phases[pi].daysPerMonth"
                     @input="proformaAssumptions.production.phases[pi].daysPerMonth = +$event.target.value; proformaRecompute()"
                     class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 font-mono tabular-nums">
            </div>
          </div>
          <span class="block text-[10px] text-gray-400 font-mono mt-1.5"
                x-text="'= ' + (proformaAssumptions.production.phases[pi].hoursPerDay * proformaAssumptions.production.phases[pi].daysPerMonth) + ' hrs/mo'"></span>
        </div>
      </template>
    </div>
    <p class="text-[11px] text-gray-500 leading-snug mt-3">
      Hours × days per phase sets the monthly run-time. Feeds monthly production (kg) which feeds revenue.
    </p>
  `, { subtitle: 'Phase 1 = initial ramp, Phase 3 = full-rate operations.' });
}

function _efficiencyBlock() {
  return card('Cost efficiency by year', `
    <div class="grid grid-cols-4 gap-3">
      <template x-for="(eff, ei) in proformaAssumptions.production.efficiencyByYear" :key="ei">
        <div>
          <label class="block text-[10px] uppercase tracking-wide font-semibold text-gray-500 mb-1" x-text="'Y' + ei"></label>
          <input type="number" step="0.01"
                 :value="proformaAssumptions.production.efficiencyByYear[ei]"
                 @input="proformaAssumptions.production.efficiencyByYear[ei] = +$event.target.value; proformaRecompute()"
                 class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 font-mono tabular-nums">
        </div>
      </template>
    </div>
    <p class="text-[11px] text-gray-500 leading-snug mt-3">
      ${HELP['production.efficiencyByYear'].help} <span class="text-gray-400">Feeds → ${HELP['production.efficiencyByYear'].dependsOn}</span>
    </p>
  `);
}

export function getProductionSection() {
  const chemistry = [
    { label: 'Biochar per batch', path: 'proformaAssumptions.production.initialBiocharUseG',
      unit: 'g', step: 1,
      indicator: `proformaComputed ? '= ' + (proformaAssumptions.production.initialBiocharUseG * proformaAssumptions.production.grapheneYieldPercent).toFixed(1) + ' g graphene/batch' : ''`,
      ...HELP['production.initialBiocharUseG'] },
    { label: 'KOH per batch', path: 'proformaAssumptions.production.initialKOHG',
      unit: 'g', step: 1, ...HELP['production.initialKOHG'] },
    { label: 'Density of mix', path: 'proformaAssumptions.production.densityMix',
      unit: 'g/mL', step: 0.01, ...HELP['production.densityMix'] },
    { label: 'Graphene yield', path: 'proformaAssumptions.production.grapheneYieldPercent',
      unit: '%', format: 'fraction-percent', step: 0.5, ...HELP['production.grapheneYieldPercent'] },
    { label: 'Buffer (production multiplier)', path: 'proformaAssumptions.production.bufferToggle',
      unit: '×', step: 0.05, ...HELP['production.bufferToggle'] }
  ];

  const kilns = [
    { label: 'Pilot kiln feed rate', path: 'proformaAssumptions.production.smallKilnCuFtPerHour',
      unit: 'cu ft / hr', step: 0.5,
      indicator: `proformaComputed ? '\u2192 ' + proformaComputed.production.pilotMonthlyByPhase[0].toFixed(1) + ' kg/mo (Phase 1)' : ''`,
      ...HELP['production.smallKilnCuFtPerHour'] },
    { label: 'Broderick kiln feed rate', path: 'proformaAssumptions.production.largeKilnCuFtPerHour',
      unit: 'cu ft / hr', step: 1,
      indicator: `proformaComputed ? '\u2192 ' + proformaComputed.production.broderickMonthlyByPhase[2].toFixed(1) + ' kg/mo (Phase 3)' : ''`,
      ...HELP['production.largeKilnCuFtPerHour'] }
  ];

  const advancedChemistry = [
    { label: 'Volume conversion', path: 'proformaAssumptions.production.volumeConversionCuFt',
      unit: 'cu ft/mL', step: 0.0000001, ...HELP['production.volumeConversionCuFt'] }
  ];

  return `
    <section class="max-w-5xl">
      ${sectionHeader('Production', 'Hemp in, graphene out. Chemistry and kiln throughput set the kg/mo ceiling for everything downstream.')}

      ${productionPulse()}

      ${criticalBlock(
        `<h3 class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2 mt-2">Process chemistry</h3>
         ${formGrid(chemistry.map(f => numInput(f.label, f.path, f)).join(''))}
         <h3 class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2 mt-6">Kiln throughput</h3>
         ${formGrid(kilns.map(f => numInput(f.label, f.path, f)).join(''), { cols: 2 })}`,
        { label: 'Critical', hint: 'Chemistry + kiln sizes — every output volume depends on these' }
      )}

      ${advancedAccordion('production',
        `${_phaseScheduleBlock()}
         ${_efficiencyBlock()}
         ${formGrid(advancedChemistry.map(f => numInput(f.label, f.path, f)).join(''))}`,
        { label: 'Advanced', hint: 'Phase schedule, year-over-year efficiency, conversion constants' }
      )}
    </section>
  `;
}
