// Demo Scenario seed — plausible-aggressive fake data used to explore the
// redesigned assumption UX without touching real scenarios. Starts from
// getDefaultAssumptions() and overrides strategic inputs so metrics land
// around: break-even ≈ month 22, peak cash ≈ -$4M, Y4 revenue strong.

import { getDefaultAssumptions } from './proformaDefaults.js';

export const DEMO_SCENARIO_NAME = 'Demo Scenario';
export const DEMO_SCENARIO_DESCRIPTION = 'Example numbers for exploring the model — clone to edit.';

export function getDemoScenarioAssumptions() {
  const a = getDefaultAssumptions();

  // Revenue: slightly more aggressive share ramp, brings Y3+ revenue up
  const sup = a.revenue.streams.find(s => s.id === 'supercapElectrode');
  const cb  = a.revenue.streams.find(s => s.id === 'carbonBlackCathodeAnode');
  if (sup) {
    sup.year1.marketSharePct = 0.035;
    sup.year2.marketSharePct = 0.075;
    sup.year3.marketSharePct = 0.11;
    sup.year4.marketSharePct = 0.14;
    sup.pricing = { year0: 200, year1: 210, year2: 220, year3: 225, year4: 230 };
  }
  if (cb) {
    cb.year1.marketSharePct = 0.003;
    cb.year2.marketSharePct = 0.007;
    cb.year3.marketSharePct = 0.012;
    cb.year4.marketSharePct = 0.015;
  }

  // Costs: slightly higher hemp
  a.cogs.hempCostPerKilo = 0.50;

  // Capital: seed + two raises producing the target peak-cash shape
  a.capital.startingCash = 150000;
  a.capital.initialInvestment = 750000;
  a.capital.raises = [
    { month: 6, amount: 2000000 },
    { month: 20, amount: 8000000 }
  ];

  return a;
}

export function getDemoScenarioData() {
  return {
    name: DEMO_SCENARIO_NAME,
    description: DEMO_SCENARIO_DESCRIPTION,
    assumptions: getDemoScenarioAssumptions()
  };
}

export function isDemoScenario(scenario) {
  return !!scenario && scenario.name === DEMO_SCENARIO_NAME;
}
