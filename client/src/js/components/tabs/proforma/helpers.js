// ═══════════════════════════════════════════════════════════════
// Proforma Shared Helpers
// ═══════════════════════════════════════════════════════════════
// Building blocks for the assumptions editor. Every section composes
// the same primitives: labeled numeric inputs in a responsive grid,
// with an "Advanced" accordion below for detail fields.

import { isLocked } from '@shared/proformaLockedFields.js';

// ── format helpers ──
// 'fraction-percent' — stored as 0–1 fraction, edited as 0–100 %
// everything else is a pass-through
function _displayExpr(path, format) {
  if (format === 'fraction-percent') {
    return `((${path} ?? 0) * 100).toFixed(4).replace(/\\.?0+$/, '')`;
  }
  return path;
}
function _inputHandler(path, format) {
  if (format === 'fraction-percent') {
    return `${path} = (+$event.target.value || 0) / 100; proformaRecompute()`;
  }
  return `${path} = +$event.target.value; proformaRecompute()`;
}

// ═══════════════════════════════════════════════════════════════
// numInput — labeled numeric input with rich help metadata
// ═══════════════════════════════════════════════════════════════
// opts:
//   step           — HTML step attribute (default 1)
//   unit           — glyph shown after the label (e.g. '%', '$', 'kg')
//   format         — 'number' (default) | 'fraction-percent'
//   help           — one short sentence describing what this value IS
//   dependsOn      — one short sentence describing what it AFFECTS downstream
//   indicator      — Alpine expression for a live "= X" helper line
//   wide           — span 2 columns in a form grid
export function numInput(label, path, opts = {}) {
  const { step = 1, unit, format = 'number', help, dependsOn, indicator, wide } = opts;
  const widthClass = wide ? 'sm:col-span-2' : '';
  const locked = isLocked(path);

  const inputClass = locked
    ? 'w-full text-sm border rounded-md px-2.5 py-1.5 font-mono bg-red-50 border-red-200 text-red-400 cursor-not-allowed'
    : 'w-full text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 font-mono tabular-nums';

  const inputAttrs = locked
    ? `disabled title="Locked — derived from formula, edit in the source spreadsheet"`
    : `@input="${_inputHandler(path, format)}"`;

  const lockIcon = locked
    ? `<svg class="inline w-3 h-3 ml-1 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>`
    : '';

  const unitBadge = unit
    ? `<span class="ml-1.5 text-[10px] text-gray-400 font-normal tracking-wide">${unit}</span>`
    : '';

  return `
    <div class="${widthClass}">
      <label class="flex items-center text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-1">
        <span>${label}</span>${unitBadge}${lockIcon}
      </label>
      <input type="number" step="${step}"
             :value="${_displayExpr(path, format)}"
             ${inputAttrs}
             class="${inputClass}">
      ${indicator ? `<span class="block text-[10px] text-gray-500 font-mono mt-1" x-text="${indicator}"></span>` : ''}
      ${help ? `<p class="text-[11px] text-gray-500 leading-snug mt-1">${help}</p>` : ''}
      ${dependsOn ? `<p class="text-[11px] text-gray-400 leading-snug mt-0.5"><span class="text-gray-400">Feeds →</span> ${dependsOn}</p>` : ''}
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════
// formGrid — responsive grid for a list of labeled inputs
// ═══════════════════════════════════════════════════════════════
// Use directly with numInput:
//   formGrid(fields.map(f => numInput(f.label, f.path, f)).join(''))
export function formGrid(innerHtml, opts = {}) {
  const { cols = 3 } = opts;
  const colsClass = cols === 2
    ? 'sm:grid-cols-2'
    : 'sm:grid-cols-2 lg:grid-cols-3';
  return `
    <div class="grid grid-cols-1 ${colsClass} gap-x-6 gap-y-5">
      ${innerHtml}
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════
// card — bordered section with a subtle header
// ═══════════════════════════════════════════════════════════════
export function card(title, content, opts = {}) {
  const { subtitle } = opts;
  return `
    <div class="border border-gray-200 rounded-lg overflow-hidden">
      <div class="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <h4 class="text-sm font-semibold text-gray-700">${title}</h4>
        ${subtitle ? `<p class="text-[11px] text-gray-500 mt-0.5 leading-snug">${subtitle}</p>` : ''}
      </div>
      <div class="px-4 py-3.5">
        ${content}
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════
// sectionHeader — H2 title + supporting line for each section
// ═══════════════════════════════════════════════════════════════
export function sectionHeader(title, supporting) {
  return `
    <header class="mb-5">
      <h2 class="text-[18px] leading-tight font-semibold text-gray-900 tracking-tight">${title}</h2>
      ${supporting ? `<p class="text-[13px] text-gray-500 mt-1 max-w-2xl leading-snug">${supporting}</p>` : ''}
    </header>
  `;
}

// ═══════════════════════════════════════════════════════════════
// criticalBlock — labeled wrapper for the "critical" tier of a section
// ═══════════════════════════════════════════════════════════════
// Draws a faint left accent so the tier is visible without being loud.
export function criticalBlock(bodyHtml, opts = {}) {
  const { label = 'Core assumptions', hint } = opts;
  return `
    <section class="mb-6">
      <div class="flex items-baseline gap-2 mb-3">
        <span class="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-700">${label}</span>
        ${hint ? `<span class="text-[11px] text-gray-400">${hint}</span>` : ''}
      </div>
      ${bodyHtml}
    </section>
  `;
}

// ═══════════════════════════════════════════════════════════════
// advancedAccordion — collapsible container for detail fields
// ═══════════════════════════════════════════════════════════════
// Uniform treatment across all sections. Closed by default.
// sectionId — unique id used for Alpine state key
// opts.label — toggle label (default "Advanced")
// opts.hint  — one-line preview shown next to the toggle
export function advancedAccordion(sectionId, bodyHtml, opts = {}) {
  const { label = 'Advanced', hint } = opts;
  const stateKey = `proformaAdvancedOpen['${sectionId}']`;
  return `
    <section class="mt-8 border-t border-gray-200 pt-5">
      <button type="button"
              @click="${stateKey} = !${stateKey}"
              class="w-full flex items-center gap-2 text-left group"
              :aria-expanded="${stateKey} ? 'true' : 'false'">
        <svg class="w-3.5 h-3.5 text-gray-400 transition-transform"
             :class="${stateKey} ? 'rotate-90' : ''"
             fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
        <span class="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-700 group-hover:text-gray-900">${label}</span>
        ${hint ? `<span class="text-[11px] text-gray-400 truncate">${hint}</span>` : ''}
      </button>
      <div x-show="${stateKey}" x-collapse class="mt-5 space-y-5">
        ${bodyHtml}
      </div>
    </section>
  `;
}

// ═══════════════════════════════════════════════════════════════
// quarterlyMatrix — Year × Quarter editable grid with auto Annual total
// ═══════════════════════════════════════════════════════════════
export function quarterlyMatrix(title, basePath, opts = {}) {
  const { showTotal, subtitle } = opts;
  return card(title, `
    <div class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr class="text-gray-500">
            <th class="text-left py-1.5 pr-2 font-medium w-16"></th>
            <th class="text-right py-1.5 px-1.5 font-medium">Q1</th>
            <th class="text-right py-1.5 px-1.5 font-medium">Q2</th>
            <th class="text-right py-1.5 px-1.5 font-medium">Q3</th>
            <th class="text-right py-1.5 px-1.5 font-medium">Q4</th>
            <th class="text-right py-1.5 pl-2 font-medium border-l border-gray-200 text-gray-600">Annual</th>
          </tr>
        </thead>
        <tbody>
          <template x-for="yr in ['year0','year1','year2','year3','year4']" :key="yr">
            <tr class="border-t border-gray-100">
              <td class="py-1 pr-2 text-gray-500 font-medium" x-text="yr.replace('year','Y')"></td>
              <template x-for="qi in [0,1,2,3]" :key="qi">
                <td class="py-1 px-1">
                  <input type="number" :value="${basePath}[yr][qi]"
                         @input="${basePath}[yr][qi] = +$event.target.value; proformaRecompute()"
                         class="w-full text-right text-xs border-gray-300 rounded px-1.5 py-1 font-mono tabular-nums focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
                </td>
              </template>
              <td class="py-1 pl-2 text-right font-mono text-gray-600 border-l border-gray-200 tabular-nums"
                  x-text="window._pfFmtC(${basePath}[yr].reduce((a,b) => a+b, 0), true)"></td>
            </tr>
          </template>
          ${showTotal ? `
          <tr class="border-t border-gray-300">
            <td class="py-1.5 pr-2 text-gray-700 font-semibold">Total</td>
            <td colspan="4"></td>
            <td class="py-1.5 pl-2 text-right font-mono font-semibold text-gray-700 border-l border-gray-200 tabular-nums"
                x-text="window._pfFmtC(['year0','year1','year2','year3','year4'].reduce((t,yr) => t + ${basePath}[yr].reduce((a,b) => a+b, 0), 0), true)"></td>
          </tr>` : ''}
        </tbody>
      </table>
    </div>
  `, subtitle ? { subtitle } : {});
}

// ═══════════════════════════════════════════════════════════════
// HELP — central copy for field descriptions and dependency hints
// ═══════════════════════════════════════════════════════════════
// Each entry: { help, dependsOn }.
// `help` — what the number IS.
// `dependsOn` — what it AFFECTS downstream.
export const HELP = {
  // ── Revenue ──
  'revenue.supercap.year3': {
    help: 'Share of the global supercap electrode market we capture by end of Y3.',
    dependsOn: 'Y3 revenue, break-even month, cumulative cash.'
  },
  'revenue.supercap.year2': {
    help: 'Y2 market share. Should bridge Y1 and Y3 — this is the ramp midpoint.',
    dependsOn: 'Y2 revenue, machine utilization.'
  },
  'revenue.supercap.year1': {
    help: 'Y1 market share. Usually small: customer qualification and first volume orders.',
    dependsOn: 'Y1 revenue, early-stage cash burn.'
  },
  'revenue.supercap.startMonth': {
    help: 'Month (0-indexed) when supercap revenue first recognizes.',
    dependsOn: 'Break-even month, early-year revenue curve.'
  },
  'revenue.carbonBlack.year3': {
    help: 'Share of the global carbon black market for batteries we capture by Y3.',
    dependsOn: 'Y3 revenue, long-term margin mix.'
  },
  'revenue.carbonBlack.year2': {
    help: 'Y2 market share. Slower ramp than supercap — longer qualification cycles.',
    dependsOn: 'Y2 revenue.'
  },
  'revenue.carbonBlack.year1': {
    help: 'Y1 market share — typically near zero while samples are in qualification.',
    dependsOn: 'Y1 revenue.'
  },
  'revenue.carbonBlack.startMonth': {
    help: 'Month when carbon black revenue begins. Later than supercap — battery OEM cycles are ~18 months.',
    dependsOn: 'Revenue ramp timing for the anode/cathode segment.'
  },
  'pricing.supercap': {
    help: 'Blended sell price per kg to supercap customers. Premium application.',
    dependsOn: 'Revenue = price × units × market share. Gross margin.'
  },
  'pricing.carbonBlack': {
    help: 'Sell price per kg to battery OEMs. Commodity pricing with a green premium.',
    dependsOn: 'Revenue and gross margin on the carbon black segment.'
  },

  // ── Production ──
  'production.initialBiocharUseG': {
    help: 'Grams of biochar loaded per batch before activation.',
    dependsOn: 'Graphene output per batch, total kg capacity per month.'
  },
  'production.initialKOHG': {
    help: 'Grams of potassium hydroxide per batch. Activates the biochar.',
    dependsOn: 'Batch volume, kiln throughput, hemp consumption.'
  },
  'production.densityMix': {
    help: 'Density of the KOH + biochar mixture in g/mL. Used to convert mass → volume.',
    dependsOn: 'Volume per batch, kiln fill rate, throughput.'
  },
  'production.grapheneYieldPercent': {
    help: 'Fraction of biochar mass that converts to graphene (0 to 1).',
    dependsOn: 'Output kg per batch. Every point of yield scales revenue 1:1.'
  },
  'production.bufferToggle': {
    help: 'Master production multiplier. 1.0 = full design capacity, 0.5 = half.',
    dependsOn: 'All production volume and therefore all revenue.'
  },
  'production.smallKilnCuFtPerHour': {
    help: 'Continuous-feed rate of a Pilot kiln in cubic feet per hour.',
    dependsOn: 'Pilot monthly production (kg/mo), early-year revenue.'
  },
  'production.largeKilnCuFtPerHour': {
    help: 'Continuous-feed rate of a Broderick kiln. ~30× a Pilot.',
    dependsOn: 'Phase 3 monthly production, Y3 revenue.'
  },
  'production.volumeConversionCuFt': {
    help: 'mL → cubic feet conversion factor (3.53e-5).',
    dependsOn: 'Batch volume math. Should not need to change.'
  },
  'production.efficiencyByYear': {
    help: 'Cost multiplier per year (1.0 = baseline, 0.8 = 20 % cheaper).',
    dependsOn: 'COGS per year as operations mature.'
  },

  // ── Costs / COGS ──
  'cogs.hempCostPerKilo': {
    help: 'Raw hemp price per kg before contingency and shipping.',
    dependsOn: 'COGS, gross margin.'
  },
  'cogs.hempContingencyPct': {
    help: 'Markup on the raw hemp price as a risk buffer (0.35 = +35 %).',
    dependsOn: 'Effective hemp cost per kg.'
  },
  'cogs.hempShippingPerKilo': {
    help: 'Landed shipping cost per kg of hemp.',
    dependsOn: 'Effective hemp cost per kg.'
  },
  'manufacturing.shiftsPerMonth': {
    help: 'Production shifts per month. Used to annualize FTE costs.',
    dependsOn: 'Manufacturing labor cost per kg.'
  },
  'manufacturing.maintenanceContingencyPct': {
    help: 'Maintenance + contingency as % of labor cost.',
    dependsOn: 'Total manufacturing overhead.'
  },
  'manufacturing.validationPhaseMonthly': {
    help: 'Monthly ops cost for a kiln while it is in validation (pre-production).',
    dependsOn: 'Early-year OPEX, pre-revenue cash burn.'
  },
  'manufacturing.biocharCostByPhase': {
    help: 'Biochar cost per kg by year. Drops as we scale hemp sourcing. Expand a year to override individual quarters.',
    dependsOn: 'Monthly COGS, gross margin.'
  },

  // ── Operations / OPEX ──
  'opex.benefitsPct': {
    help: 'Employee benefits as % of total staffing cost. Applied from Month 3.',
    dependsOn: 'Total OPEX, EBITDA.'
  },
  'opex.uofaRoyaltyPct': {
    help: 'University of Alberta royalty on positive gross margin.',
    dependsOn: 'Net margin when gross margin is positive.'
  },
  'opex.salesCommissionPct': {
    help: 'Sales commission on gross margin. Starts Y1 Q2 (Month 15).',
    dependsOn: 'Sales-driven OPEX once revenue begins.'
  },
  'opex.generalOverhead.base': {
    help: 'Annual baseline: T&E $100K + Internet $5K + Marketing $50K + Misc $15K.',
    dependsOn: 'General overhead line per year.'
  },
  'opex.generalOverhead.growthByYear': {
    help: 'Multiplier applied to the base annual overhead for each year.',
    dependsOn: 'Overhead growth curve.'
  },
  'opex.businessInsurance': {
    help: 'Annual business insurance premium (paid once per year).',
    dependsOn: 'Total OPEX.'
  },

  // ── Capital ──
  'capital.startingCash': {
    help: 'Cash on hand at Month 0 before any investment.',
    dependsOn: 'Opening balance, peak cash need.'
  },
  'capital.initialInvestment': {
    help: 'Seed investment credited at Month 0.',
    dependsOn: 'Opening balance, runway, cumulative cash.'
  },

  // ── Technical reference (legacy keys: string-valued, read as `help` directly) ──
  'technical.evBattery.cathodeAnodeRatio': 'Weight ratio of cathode to anode active material.',
  'technical.hgrapheneReplacement.cathodeEfficiencyFactor': 'HGraphene replaces this multiple of its weight in carbon black.',
  'technical.market.evCagr': 'Year-over-year growth multiplier (1.20 = 20 % growth).',

  // ── Machines ──
  'machine.validationStartMonth': {
    help: 'Month the kiln enters validation (pre-revenue, validation-cost phase).',
    dependsOn: 'Cash burn window, payment schedule anchor.'
  },
  'machine.productionStartMonth': {
    help: 'Month the kiln starts shipping product (revenue recognition eligible).',
    dependsOn: 'Monthly production kg, revenue timing.'
  },
  'machine.cost': {
    help: 'Total equipment cost for this kiln.',
    dependsOn: 'Total CapEx, peak cash need, payment schedule.'
  }
};
