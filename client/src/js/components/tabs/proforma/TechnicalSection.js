import { numInput, card, HELP, sectionHeader } from './helpers.js';

// ─────────────────────────────────────────────────────────────────────
// Markets section — top-level journey pill. Owns the global TAM sources
// that revenue streams link to. Built-ins (supercap, EV-conductive)
// pull from the technical reference fields below; custom sources are
// generic tonnes × CAGR^N projections the user manages here.
// ─────────────────────────────────────────────────────────────────────
export function getMarketsSection() {
  return `
    <section class="max-w-5xl">
      ${sectionHeader('Markets', 'Global TAM sources a revenue stream can link to. Each entry produces a Y0 → Y3 kg-per-year curve. Edit any source and every linked revenue stream re-prices automatically.')}

      <div class="space-y-3">

        <!-- Built-in: Supercap -->
        <article class="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <header class="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <span class="text-[10px] uppercase tracking-wide font-semibold text-gray-500">Built-in</span>
            <h5 class="text-sm font-semibold text-gray-800">Supercapacitor activated-carbon demand</h5>
          </header>
          <div class="px-4 py-3.5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${numInput('Base demand', 'proformaAssumptions.technical.market.supercapActivatedCarbonDemandTonnes', { unit: 'tonnes' })}
              ${numInput('CAGR', 'proformaAssumptions.technical.market.supercapCagr', { step: 0.01, unit: 'x' })}
            </div>
            <div x-show="proformaComputed && proformaComputed.techRef" class="mt-3 bg-gray-50 rounded-md px-3 py-2 text-xs font-mono text-gray-600">
              <span x-text="(proformaComputed.techRef.supercapByYear?.[0] || 0).toLocaleString()"></span> kg (Y0)
              &rarr;
              <span x-text="(proformaComputed.techRef.supercapByYear?.[proformaComputed.techRef.supercapByYear.length - 1] || 0).toLocaleString()"></span> kg (Y4)
            </div>
            <p class="mt-2 text-[11px] text-gray-400">
              Also derives from supercap module specs in Reference data.
            </p>
            <template x-if="countProformaStreamsLinkedToSource('supercap') > 0">
              <p class="mt-1 text-[11px] text-gray-500">
                Used by
                <span class="font-semibold text-gray-700" x-text="countProformaStreamsLinkedToSource('supercap')"></span>
                revenue stream<span x-show="countProformaStreamsLinkedToSource('supercap') !== 1">s</span>.
              </p>
            </template>
          </div>
        </article>

        <!-- Built-in: EV conductive -->
        <article class="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <header class="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <span class="text-[10px] uppercase tracking-wide font-semibold text-gray-500">Built-in</span>
            <h5 class="text-sm font-semibold text-gray-800">EV conductive additives (cathode + anode)</h5>
          </header>
          <div class="px-4 py-3.5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${numInput('Global EV battery capacity', 'proformaAssumptions.technical.market.globalEvBatteryCapacityGwh', { unit: 'GWh' })}
              ${numInput('CAGR', 'proformaAssumptions.technical.market.evCagr', {
                step: 0.01,
                unit: 'x',
                help: HELP['technical.market.evCagr']
              })}
            </div>
            <div x-show="proformaComputed && proformaComputed.techRef" class="mt-3 bg-gray-50 rounded-md px-3 py-2 text-xs font-mono text-gray-600">
              <span x-text="(proformaComputed.techRef.conductiveByYear?.[0] || 0).toLocaleString()"></span> kg (Y0)
              &rarr;
              <span x-text="(proformaComputed.techRef.conductiveByYear?.[proformaComputed.techRef.conductiveByYear.length - 1] || 0).toLocaleString()"></span> kg (Y4)
            </div>
            <p class="mt-2 text-[11px] text-gray-400">
              Also derives from EV battery composition in Reference data.
            </p>
            <template x-if="countProformaStreamsLinkedToSource('conductive') > 0">
              <p class="mt-1 text-[11px] text-gray-500">
                Used by
                <span class="font-semibold text-gray-700" x-text="countProformaStreamsLinkedToSource('conductive')"></span>
                revenue stream<span x-show="countProformaStreamsLinkedToSource('conductive') !== 1">s</span>.
              </p>
            </template>
          </div>
        </article>

        <!-- Custom sources -->
        <template x-for="(src, srcIndex) in (proformaAssumptions.technical.market.customSources || [])" :key="src.id">
          <article class="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <header class="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <span class="text-[10px] uppercase tracking-wide font-semibold text-gray-500"
                    x-text="src.builtin ? 'Built-in' : 'Custom'"></span>
              <input type="text"
                     :value="src.label"
                     @input="proformaAssumptions.technical.market.customSources[srcIndex].label = $event.target.value; proformaMarkDirty(); reseedProformaMarketSources()"
                     class="flex-1 min-w-0 text-sm font-semibold text-gray-800 bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-gray-900 focus:ring-0 px-0 py-0.5">
              <template x-if="!src.builtin">
                <button type="button"
                        @click="onDeleteProformaMarketSource(src.id)"
                        class="text-gray-400 hover:text-red-600 px-1.5 py-1 rounded-md"
                        title="Delete this market source">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                  </svg>
                </button>
              </template>
            </header>
            <div class="px-4 py-3.5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="flex items-center text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    <span>Base demand</span>
                    <span class="ml-1.5 text-[10px] text-gray-400 font-normal tracking-wide">tonnes</span>
                  </label>
                  <input type="number" step="1"
                         :value="src.baseTonnes"
                         @input="proformaAssumptions.technical.market.customSources[srcIndex].baseTonnes = +$event.target.value; proformaRecompute()"
                         class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 font-mono tabular-nums">
                </div>
                <div>
                  <label class="flex items-center text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    <span>CAGR</span>
                    <span class="ml-1.5 text-[10px] text-gray-400 font-normal tracking-wide">x</span>
                  </label>
                  <input type="number" step="0.01"
                         :value="src.cagr"
                         @input="proformaAssumptions.technical.market.customSources[srcIndex].cagr = +$event.target.value; proformaRecompute()"
                         class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 font-mono tabular-nums">
                </div>
              </div>

              <div x-show="proformaComputed && proformaComputed.techRef && proformaComputed.techRef[src.id + 'ByYear']"
                   class="mt-3 bg-gray-50 rounded-md px-3 py-2 text-xs font-mono text-gray-600">
                <span x-text="((proformaComputed.techRef[src.id + 'ByYear'] || [])[0] || 0).toLocaleString()"></span> kg (Y0)
                &rarr;
                <span x-text="(() => { const a = proformaComputed.techRef[src.id + 'ByYear'] || []; return (a[a.length - 1] || 0).toLocaleString(); })()"></span> kg (Y4)
              </div>

              <template x-if="countProformaStreamsLinkedToSource(src.id) > 0">
                <p class="mt-2 text-[11px] text-gray-500">
                  Used by
                  <span class="font-semibold text-gray-700" x-text="countProformaStreamsLinkedToSource(src.id)"></span>
                  revenue stream<span x-show="countProformaStreamsLinkedToSource(src.id) !== 1">s</span>.
                </p>
              </template>
            </div>
          </article>
        </template>

        <!-- Add market source -->
        <div x-data="{ open: false, label: '', baseTonnes: 0, cagr: 1.20 }">
          <template x-if="!open">
            <div class="flex justify-center pt-1">
              <button type="button"
                      @click="open = true"
                      class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                </svg>
                Add market source
              </button>
            </div>
          </template>
          <template x-if="open">
            <article class="border border-dashed border-gray-300 rounded-xl bg-gray-50 px-4 py-3.5">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="sm:col-span-3">
                  <label class="block text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-1">Label</label>
                  <input type="text" x-model="label"
                         placeholder="e.g. Carbon nanotubes demand"
                         class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-1">Base demand <span class="text-gray-400 font-normal">tonnes</span></label>
                  <input type="number" step="1" x-model.number="baseTonnes"
                         class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 font-mono tabular-nums">
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-1">CAGR <span class="text-gray-400 font-normal">x</span></label>
                  <input type="number" step="0.01" x-model.number="cagr"
                         class="w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 font-mono tabular-nums">
                </div>
                <div class="flex items-end gap-2">
                  <button type="button"
                          @click="addProformaMarketSource({ label, baseTonnes, cagr }); open = false; label = ''; baseTonnes = 0; cagr = 1.20"
                          :disabled="!label.trim()"
                          :class="!label.trim() ? 'opacity-50 cursor-not-allowed' : ''"
                          class="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800">
                    Add
                  </button>
                  <button type="button"
                          @click="open = false; label = ''; baseTonnes = 0; cagr = 1.20"
                          class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900">
                    Cancel
                  </button>
                </div>
              </div>
            </article>
          </template>
        </div>

      </div>
    </section>
  `;
}

// ─────────────────────────────────────────────────────────────────────
// Reference data — bottom-of-page collapsed accordion. Battery + supercap
// physical specs that feed the built-in market sources above. Genuinely
// rarely-touched once a scenario is set up.
// ─────────────────────────────────────────────────────────────────────
export function getReferenceDataSection() {
  return `
    <div class="space-y-4">

      ${card('EV Battery Specs', `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          ${numInput('Capacity', 'proformaAssumptions.technical.evBattery.capacityKwh', { unit: 'kWh' })}
          ${numInput('Voltage', 'proformaAssumptions.technical.evBattery.voltageV', { unit: 'V' })}
          ${numInput('Energy Density', 'proformaAssumptions.technical.evBattery.energyDensityWhKg', { unit: 'Wh/kg' })}
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          ${numInput('Active Material %', 'proformaAssumptions.technical.evBattery.activeMaterialPct', { step: 0.01 })}
          ${numInput('Cathode:Anode Ratio', 'proformaAssumptions.technical.evBattery.cathodeAnodeRatio', {
            step: 0.1,
            help: HELP['technical.evBattery.cathodeAnodeRatio']
          })}
        </div>

        <div class="mt-4 pt-3 border-t border-gray-100">
          <p class="text-[11px] font-semibold text-gray-600 mb-2">Cathode Composition</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            ${numInput('Active Material', 'proformaAssumptions.technical.evBattery.cathodeComposition.activeMaterial', { step: 0.01 })}
            ${numInput('Binder', 'proformaAssumptions.technical.evBattery.cathodeComposition.binder', { step: 0.01 })}
            ${numInput('Carbon Black', 'proformaAssumptions.technical.evBattery.cathodeComposition.carbonBlack', { step: 0.01 })}
          </div>
          <div class="mt-1.5 text-[10px] font-mono"
               :class="Math.abs((proformaAssumptions.technical.evBattery.cathodeComposition.activeMaterial + proformaAssumptions.technical.evBattery.cathodeComposition.binder + proformaAssumptions.technical.evBattery.cathodeComposition.carbonBlack) - 1.0) <= 0.01 ? 'text-green-600' : 'text-red-500'">
            Sum: <span x-text="(proformaAssumptions.technical.evBattery.cathodeComposition.activeMaterial + proformaAssumptions.technical.evBattery.cathodeComposition.binder + proformaAssumptions.technical.evBattery.cathodeComposition.carbonBlack).toFixed(3)"></span>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-gray-100">
          <p class="text-[11px] font-semibold text-gray-600 mb-2">Anode Composition</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            ${numInput('Synthetic Graphite', 'proformaAssumptions.technical.evBattery.anodeComposition.syntheticGraphite', { step: 0.01 })}
            ${numInput('Binder', 'proformaAssumptions.technical.evBattery.anodeComposition.binder', { step: 0.01 })}
            ${numInput('Conductive Additives', 'proformaAssumptions.technical.evBattery.anodeComposition.conductiveAdditives', { step: 0.01 })}
          </div>
          <div class="mt-1.5 text-[10px] font-mono"
               :class="Math.abs((proformaAssumptions.technical.evBattery.anodeComposition.syntheticGraphite + proformaAssumptions.technical.evBattery.anodeComposition.binder + proformaAssumptions.technical.evBattery.anodeComposition.conductiveAdditives) - 1.0) <= 0.01 ? 'text-green-600' : 'text-red-500'">
            Sum: <span x-text="(proformaAssumptions.technical.evBattery.anodeComposition.syntheticGraphite + proformaAssumptions.technical.evBattery.anodeComposition.binder + proformaAssumptions.technical.evBattery.anodeComposition.conductiveAdditives).toFixed(3)"></span>
          </div>
        </div>
      `, { subtitle: 'Powers the EV-conductive built-in market source.' })}

      ${card('HGraphene Replacement Factors', `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          ${numInput('Cathode Efficiency Factor', 'proformaAssumptions.technical.hgrapheneReplacement.cathodeEfficiencyFactor', {
            step: 0.1,
            unit: 'x',
            help: HELP['technical.hgrapheneReplacement.cathodeEfficiencyFactor']
          })}
          ${numInput('Anode Density Advantage', 'proformaAssumptions.technical.hgrapheneReplacement.anodeDensityAdvantage', { step: 0.01 })}
          ${numInput('Anode Phase-In %', 'proformaAssumptions.technical.hgrapheneReplacement.anodePhaseInPercent', { step: 0.01 })}
        </div>
      `)}

      ${card('Supercapacitor Specs', `
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          ${numInput('Capacitance', 'proformaAssumptions.technical.supercapacitor.capacitanceF', { unit: 'F' })}
          ${numInput('Voltage', 'proformaAssumptions.technical.supercapacitor.voltageV', { unit: 'V' })}
          ${numInput('Specific Energy', 'proformaAssumptions.technical.supercapacitor.specificEnergyWhKg', { unit: 'Wh/kg' })}
          ${numInput('Module Weight', 'proformaAssumptions.technical.supercapacitor.moduleWeightKg', { unit: 'kg' })}
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          ${numInput('Active Material %', 'proformaAssumptions.technical.supercapacitor.activeMaterialPct', { step: 0.01 })}
          ${numInput('Activated Carbon %', 'proformaAssumptions.technical.supercapacitor.activatedCarbonPct', { step: 0.01 })}
          ${numInput('HG Efficiency Factor', 'proformaAssumptions.technical.supercapacitor.hgrapheneEfficiencyFactor', { step: 0.1, unit: 'x' })}
          ${numInput('HG Required %', 'proformaAssumptions.technical.supercapacitor.hgrapheneRequiredPct', { step: 0.01 })}
        </div>
      `, { subtitle: 'Powers the supercap built-in market source.' })}

    </div>
  `;
}
