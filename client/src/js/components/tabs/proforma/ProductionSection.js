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
      indicator: `proformaComputed ? '→ ' + proformaComputed.production.pilotMonthlyGrid[1][0].toFixed(1) + ' kg/mo (Y1 default)' : ''`,
      ...HELP['production.smallKilnCuFtPerHour'] },
    { label: 'Broderick kiln feed rate', path: 'proformaAssumptions.production.largeKilnCuFtPerHour',
      unit: 'cu ft / hr', step: 1,
      indicator: `proformaComputed ? '→ ' + proformaComputed.production.broderickMonthlyGrid[3][3].toFixed(1) + ' kg/mo (Y3 Q4)' : ''`,
      ...HELP['production.largeKilnCuFtPerHour'] }
  ];

  // One yearly row with collapsible quarter overrides under each year.
  // `expanded` is a local Alpine-data flag per row.
  const yearRow = (kilnType) => `
    <template x-for="(year, yi) in proformaAssumptions.production.scheduleByMachineType.${kilnType}" :key="yi">
      <div class="border border-gray-100 rounded-lg" x-data="{ open: false }">
        <div class="grid grid-cols-12 items-center gap-3 px-3 py-2">
          <div class="col-span-1 text-xs font-semibold text-gray-700" x-text="'Y' + yi"></div>
          <div class="col-span-3">
            <label class="block text-[10px] uppercase tracking-wide font-semibold text-gray-500 mb-0.5">Hrs / day</label>
            <input type="number"
                   :value="year.hoursPerDay"
                   @input="year.hoursPerDay = +$event.target.value; proformaRecompute()"
                   class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 font-mono tabular-nums">
          </div>
          <div class="col-span-3">
            <label class="block text-[10px] uppercase tracking-wide font-semibold text-gray-500 mb-0.5">Days / mo</label>
            <input type="number"
                   :value="year.daysPerMonth"
                   @input="year.daysPerMonth = +$event.target.value; proformaRecompute()"
                   class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 font-mono tabular-nums">
          </div>
          <div class="col-span-3 text-[11px] text-gray-500 font-mono">
            <span x-text="'= ' + ((year.hoursPerDay || 0) * (year.daysPerMonth || 0)) + ' hrs/mo'"></span>
            <span class="ml-2 text-gray-400"
                  x-show="(year.quarters || []).some(q => q !== null)"
                  x-text="'· ' + (year.quarters || []).filter(q => q !== null).length + ' Q override' + ((year.quarters || []).filter(q => q !== null).length === 1 ? '' : 's')"></span>
          </div>
          <div class="col-span-2 text-right">
            <button type="button" @click="open = !open"
                    class="text-[10px] uppercase tracking-wide text-gray-500 hover:text-gray-900">
              <span x-show="!open">+ quarters</span>
              <span x-show="open" x-cloak>− quarters</span>
            </button>
          </div>
        </div>
        <div x-show="open" x-cloak x-collapse class="border-t border-gray-100 bg-gray-50/60 px-3 py-2">
          <div class="grid grid-cols-4 gap-2">
            <template x-for="qi in 4" :key="qi">
              <div class="bg-white border border-gray-100 rounded p-2">
                <div class="flex items-center justify-between mb-1.5">
                  <div class="text-[10px] font-semibold text-gray-600" x-text="'Q' + qi"></div>
                  <button type="button"
                          x-show="year.quarters && year.quarters[qi-1] !== null"
                          @click="clearProformaScheduleQuarter('${kilnType}', yi, qi-1)"
                          class="text-[9px] text-gray-400 hover:text-red-500">clear</button>
                </div>
                <div class="grid grid-cols-2 gap-1.5">
                  <div>
                    <input type="number"
                           :value="year.quarters && year.quarters[qi-1] ? year.quarters[qi-1].hoursPerDay : ''"
                           :placeholder="year.hoursPerDay"
                           @input="setProformaScheduleQuarterField('${kilnType}', yi, qi-1, 'hoursPerDay', $event.target.value)"
                           :class="(year.quarters && year.quarters[qi-1] !== null) ? 'font-semibold' : 'font-normal'"
                           class="w-full text-xs border-gray-200 rounded px-1.5 py-1 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 font-mono tabular-nums">
                    <div class="text-[9px] text-gray-400 mt-0.5">hrs/day</div>
                  </div>
                  <div>
                    <input type="number"
                           :value="year.quarters && year.quarters[qi-1] ? year.quarters[qi-1].daysPerMonth : ''"
                           :placeholder="year.daysPerMonth"
                           @input="setProformaScheduleQuarterField('${kilnType}', yi, qi-1, 'daysPerMonth', $event.target.value)"
                           :class="(year.quarters && year.quarters[qi-1] !== null) ? 'font-semibold' : 'font-normal'"
                           class="w-full text-xs border-gray-200 rounded px-1.5 py-1 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 font-mono tabular-nums">
                    <div class="text-[9px] text-gray-400 mt-0.5">days/mo</div>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <p class="text-[10px] text-gray-500 leading-snug mt-2">
            Blank = inherit the yearly default. Type into either field to override that quarter — bold cells indicate active overrides.
          </p>
        </div>
      </div>
    </template>
  `;

  const kilnBlock = (kilnType, label) => `
    <div>
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-xs font-semibold uppercase tracking-wide text-gray-700">${label}</h4>
        ${kilnType === 'broderick' ? `
          <button type="button"
                  @click="copyProformaPilotScheduleToBroderick()"
                  class="text-[10px] uppercase tracking-wide text-gray-500 hover:text-gray-900 underline-offset-2 hover:underline">
            Copy from pilot
          </button>
        ` : ''}
      </div>
      <div class="space-y-1.5">
        ${yearRow(kilnType)}
      </div>
    </div>
  `;

  const phaseSchedule = `
    <div class="space-y-5">
      ${kilnBlock('pilot', 'Pilot kilns')}
      ${kilnBlock('broderick', 'Broderick kilns')}
    </div>
    <p class="text-[11px] text-gray-500 leading-snug mt-4">
      Per-kiln-type schedules drive monthly production (kg) and labor/maintenance op cost. Yearly defaults apply across all four quarters; expand a year to override any individual quarter.
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
        ${card('Operating schedule by year', phaseSchedule)}
        ${card('Cost efficiency by year', efficiencyGrid)}
      </div>
    </section>
  `;
}
