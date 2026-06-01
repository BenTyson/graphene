import { card, sectionHeader } from './helpers.js';

// ═══════════════════════════════════════════════════════════════
// Historical — prior-year actuals ("use of funds")
// ═══════════════════════════════════════════════════════════════
// Hand-entered P&L lines for a completed year (e.g. 2025). DISPLAY-ONLY:
// these never flow through calculateProforma() — they surface as a leading
// "actual" column on the Summary tab. Each line is tagged with the Summary
// bucket it rolls into. Net = revenue − cogs − opex (capex excluded, it's a
// balance-sheet use, not a P&L expense).

// Buckets a line can map to, in display order. Value = stored key.
const BUCKETS = [
  { value: 'revenue',              label: 'Revenue' },
  { value: 'cogs',                 label: 'COGS' },
  { value: 'opexSalaryBenefits',  label: 'OPEX · Salary & Benefits' },
  { value: 'opexLegal',           label: 'OPEX · Legal' },
  { value: 'opexRoyaltyCommission', label: 'OPEX · Royalty & Commission' },
  { value: 'opex',                 label: 'OPEX · Other' },
  { value: 'capex',                label: 'CapEx' }
];

function _bucketOptions() {
  return BUCKETS.map(b => `<option value="${b.value}">${b.label}</option>`).join('');
}

function _linesTable() {
  return `
    <template x-if="!proformaAssumptions.historical?.lines || proformaAssumptions.historical.lines.length === 0">
      <p class="text-xs text-gray-400 italic">No lines yet. Add your P&amp;L rows below.</p>
    </template>
    <template x-if="proformaAssumptions.historical?.lines && proformaAssumptions.historical.lines.length > 0">
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="text-gray-500">
              <th class="text-left py-1.5 pr-2 font-medium">Line item</th>
              <th class="text-left py-1.5 px-2 font-medium">Amount ($)</th>
              <th class="text-left py-1.5 px-2 font-medium">Maps to</th>
              <th class="w-8"></th>
            </tr>
          </thead>
          <tbody>
            <template x-for="(line, li) in proformaAssumptions.historical.lines" :key="li">
              <tr class="border-t border-gray-100">
                <td class="py-1 pr-2">
                  <input type="text"
                         :value="line.label"
                         @input="proformaAssumptions.historical.lines[li].label = $event.target.value; proformaMarkDirty()"
                         class="w-48 text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
                </td>
                <td class="py-1 px-2">
                  <input type="number" step="0.01"
                         :value="line.amount"
                         @input="proformaAssumptions.historical.lines[li].amount = +$event.target.value; proformaRecompute()"
                         class="w-32 text-sm border-gray-300 rounded-md px-2.5 py-1.5 font-mono tabular-nums text-right focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
                </td>
                <td class="py-1 px-2">
                  <select :value="line.bucket"
                          @change="proformaAssumptions.historical.lines[li].bucket = $event.target.value; proformaRecompute()"
                          class="text-sm border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
                    ${_bucketOptions()}
                  </select>
                </td>
                <td class="py-1 pl-1">
                  <button @click="removeProformaHistoricalLine(li)"
                          class="text-gray-400 hover:text-red-500 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
          <tfoot>
            <tr class="border-t-2 border-gray-300 font-semibold text-gray-800">
              <td class="py-1.5 pr-2 text-right">Net income</td>
              <td class="py-1.5 px-2 font-mono tabular-nums text-right"
                  :class="(proformaHistoricalNet() ?? 0) < 0 ? 'text-red-600' : 'text-gray-900'"
                  x-text="window._pfFmtC(proformaHistoricalNet() ?? 0, true)"></td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </template>
    <button @click="addProformaHistoricalLine()" class="text-[11px] text-gray-500 hover:text-gray-900 underline mt-2">
      + Add line
    </button>
  `;
}

export function getHistoricalSection() {
  return `
    <section class="max-w-4xl">
      ${sectionHeader('2025 Actual')}

      <div class="space-y-6">
        ${card('Show on Summary', `
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox"
                   :checked="proformaAssumptions.historical?.enabled"
                   @change="toggleProformaHistorical()"
                   class="rounded border-gray-300 text-gray-900 focus:ring-gray-900">
            <span class="text-sm text-gray-700">Display the prior-year actuals column on the Summary tab</span>
          </label>
          <div class="mt-3 flex items-center gap-2">
            <label class="text-[11px] text-gray-500">Column label</label>
            <input type="text"
                   :value="proformaAssumptions.historical?.periodLabel"
                   @input="proformaAssumptions.historical.periodLabel = $event.target.value; proformaRecompute()"
                   class="w-40 text-sm border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
          </div>
        `)}

        ${card('P&amp;L lines', _linesTable())}
      </div>
    </section>
  `;
}
