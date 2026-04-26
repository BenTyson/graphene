import { numInput, card, HELP } from './helpers.js';

export function getTechnicalSection() {
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
      `, { subtitle: 'These reference values drive revenue calculations.' })}

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
      `)}

      ${card('Market Sizing', `
        <p class="text-[11px] text-gray-500 leading-snug mb-3">
          These are the global TAM sources a revenue stream can link to (Revenue tab → stream → "Linked market source").
          Edit a base demand or CAGR here and every linked stream re-prices automatically.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${numInput('Global EV Battery Capacity', 'proformaAssumptions.technical.market.globalEvBatteryCapacityGwh', { unit: 'GWh' })}
          ${numInput('EV CAGR', 'proformaAssumptions.technical.market.evCagr', {
            step: 0.01,
            unit: 'x',
            help: HELP['technical.market.evCagr']
          })}
          ${numInput('Supercap AC Demand', 'proformaAssumptions.technical.market.supercapActivatedCarbonDemandTonnes', { unit: 'tonnes' })}
          ${numInput('Supercap CAGR', 'proformaAssumptions.technical.market.supercapCagr', { step: 0.01, unit: 'x' })}
          ${numInput('Graphene Oxide Demand', 'proformaAssumptions.technical.market.grapheneOxideDemandTonnes', {
            unit: 'tonnes',
            help: 'Global graphene oxide demand baseline. Powers any revenue stream linked to "Graphene Oxide".'
          })}
          ${numInput('Graphene Oxide CAGR', 'proformaAssumptions.technical.market.grapheneOxideCagr', { step: 0.01, unit: 'x' })}
        </div>

        <div x-show="proformaComputed && proformaComputed.techRef" class="mt-3 bg-gray-50 rounded-lg px-3 py-2 text-xs font-mono text-gray-600 space-y-1">
          <div>
            Conductive additives:
            <span x-text="proformaComputed.techRef.conductiveByYear[0].toLocaleString()"></span> kg (Y0)
            &rarr;
            <span x-text="proformaComputed.techRef.conductiveByYear[3].toLocaleString()"></span> kg (Y3)
          </div>
          <div>
            Supercap HG demand:
            <span x-text="proformaComputed.techRef.supercapByYear[0].toLocaleString()"></span> kg (Y0)
            &rarr;
            <span x-text="proformaComputed.techRef.supercapByYear[3].toLocaleString()"></span> kg (Y3)
          </div>
          <div>
            Graphene Oxide:
            <span x-text="(proformaComputed.techRef.grapheneOxideByYear?.[0] || 0).toLocaleString()"></span> kg (Y0)
            &rarr;
            <span x-text="(proformaComputed.techRef.grapheneOxideByYear?.[3] || 0).toLocaleString()"></span> kg (Y3)
          </div>
        </div>
      `, { subtitle: 'Global market parameters that drive revenue TAM calculations' })}

    </div>
  `;
}
