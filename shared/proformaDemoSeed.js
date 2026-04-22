// Demo Scenario seed — plausible-aggressive fake data used to explore the
// redesigned assumption UX without touching real scenarios. Starts from
// getDefaultAssumptions() and overrides strategic inputs so metrics land
// around: break-even ≈ month 22, peak cash ≈ -$4M, Y3 revenue ≈ $6M.

import { getDefaultAssumptions } from './proformaDefaults.js';

export const DEMO_SCENARIO_NAME = 'Demo Scenario';
export const DEMO_SCENARIO_DESCRIPTION = 'Example numbers for exploring the model — clone to edit.';

export function getDemoScenarioAssumptions() {
  const a = getDefaultAssumptions();

  // Revenue: slightly more aggressive share ramp, brings Y3 revenue up
  a.revenue.supercapElectrode.year1.marketSharePct = 0.035;
  a.revenue.supercapElectrode.year2.marketSharePct = 0.075;
  a.revenue.supercapElectrode.year3.marketSharePct = 0.11;
  a.revenue.carbonBlackCathodeAnode.year1.marketSharePct = 0.003;
  a.revenue.carbonBlackCathodeAnode.year2.marketSharePct = 0.007;
  a.revenue.carbonBlackCathodeAnode.year3.marketSharePct = 0.012;

  // Pricing: hold defaults; founder will nudge in the demo.
  a.pricing.supercapPerKg = { year0: 200, year1: 210, year2: 220, year3: 225 };

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
