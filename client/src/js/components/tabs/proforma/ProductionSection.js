import { numInput, formGrid, card, sectionHeader, HELP } from './helpers.js';

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
      unit: '×', step: 0.05, ...HELP['production.bufferToggle'] },
    { label: 'Volume conversion', path: 'proformaAssumptions.production.volumeConversionCuFt',
      unit: 'cu ft/mL', step: 0.0000001, ...HELP['production.volumeConversionCuFt'] }
  ];

  const kilns = [
    { label: 'Pilot kiln feed rate', path: 'proformaAssumptions.production.smallKilnCuFtPerHour',
      unit: 'cu ft / hr', step: 0.5,
      indicator: `proformaComputed ? '→ ' + proformaComputed.production.pilotMonthlyByPhase[0].toFixed(1) + ' kg/mo (Phase 1)' : ''`,
      ...HELP['production.smallKilnCuFtPerHour'] },
    { label: 'Broderick kiln feed rate', path: 'proformaAssumptions.production.largeKilnCuFtPerHour',
      unit: 'cu ft / hr', step: 1,
      indicator: `proformaComputed ? '→ ' + proformaComputed.production.broderickMonthlyByPhase[2].toFixed(1) + ' kg/mo (Phase 3)' : ''`,
      ...HELP['production.largeKilnCuFtPerHour'] }
  ];

  const phaseGrid = (kilnType, label) => `
    <div>
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-xs font-semibold uppercase tracking-wide text-gray-700">${label}</h4>
        ${kilnType === 'broderick' ? `
          <button type="button"
                  @click="proformaAssumptions.production.phasesByMachineType.broderick = proformaAssumptions.production.phasesByMachineType.pilot.map(p => ({ ...p })); proformaRecompute()"
                  class="text-[10px] uppercase tracking-wide text-gray-500 hover:text-gray-900 underline-offset-2 hover:underline">
            Copy from pilot
          </button>
        ` : ''}
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <template x-for="(phase, pi) in proformaAssumptions.production.phasesByMachineType.${kilnType}" :key="pi">
          <div class="border border-gray-100 rounded-lg p-3">
            <div class="text-xs font-semibold text-gray-600 mb-2"
                 x-text="'Phase ' + (pi+1) + ' (Mo ' + (pi === 0 ? '0-23' : pi === 1 ? '24-35' : '36-59') + ')'"></div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[10px] uppercase tracking-wide font-semibold text-gray-500 mb-1">Hrs / day</label>
                <input type="number"
                       :value="proformaAssumptions.production.phasesByMachineType.${kilnType}[pi].hoursPerDay"
                       @input="proformaAssumptions.production.phasesByMachineType.${kilnType}[pi].hoursPerDay = +$event.target.value; proformaRecompute()"
                       class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 font-mono tabular-nums">
              </div>
              <div>
                <label class="block text-[10px] uppercase tracking-wide font-semibold text-gray-500 mb-1">Days / mo</label>
                <input type="number"
                       :value="proformaAssumptions.production.phasesByMachineType.${kilnType}[pi].daysPerMonth"
                       @input="proformaAssumptions.production.phasesByMachineType.${kilnType}[pi].daysPerMonth = +$event.target.value; proformaRecompute()"
                       class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 font-mono tabular-nums">
              </div>
            </div>
            <span class="block text-[10px] text-gray-400 font-mono mt-1.5"
                  x-text="'= ' + (proformaAssumptions.production.phasesByMachineType.${kilnType}[pi].hoursPerDay * proformaAssumptions.production.phasesByMachineType.${kilnType}[pi].daysPerMonth) + ' hrs/mo'"></span>
          </div>
        </template>
      </div>
    </div>
  `;

  const phaseSchedule = `
    <div class="space-y-5">
      ${phaseGrid('pilot', 'Pilot kilns')}
      ${phaseGrid('broderick', 'Broderick kilns')}
    </div>
    <p class="text-[11px] text-gray-500 leading-snug mt-4">
      Hours × days per phase sets each kiln type's monthly run-time. Feeds monthly production (kg) and labor/maintenance op cost. Phase indices match machine-level phase overrides on the Machines tab.
    </p>
  `;

  const efficiencyGrid = `
    <div class="grid grid-cols-5 gap-3">
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
  `;

  return `
    <section class="max-w-5xl">
      ${sectionHeader('Production', 'Hemp in, graphene out. Chemistry and kiln throughput set the kg/mo ceiling for everything downstream.')}

      <div class="space-y-6">
        ${card('Process chemistry', formGrid(chemistry.map(f => numInput(f.label, f.path, f)).join('')))}
        ${card('Kiln throughput', formGrid(kilns.map(f => numInput(f.label, f.path, f)).join(''), { cols: 2 }))}
        ${card('Operating schedule by phase',
          phaseSchedule,
          { subtitle: 'Phase 1 = initial ramp, Phase 3 = full-rate operations.' }
        )}
        ${card('Cost efficiency by year', efficiencyGrid)}
      </div>
    </section>
  `;
}
