import { formatCurrency, formatPercent } from '../../utils/formatters.js';
import { metricsAndNav } from './proforma/cards.js';
import { getProductionSection } from './proforma/ProductionSection.js';
import { getRevenueSection } from './proforma/RevenueSection.js';
import { getCostsSection } from './proforma/CostsSection.js';
import { getOperationsSection } from './proforma/OperationsSection.js';
import { getMachinesSection } from './proforma/MachinesSection.js';
import { getCapitalSection } from './proforma/CapitalSection.js';
import { getMarketsSection, getReferenceDataSection } from './proforma/TechnicalSection.js';

// Make formatters available for inline template expressions
window._pfFmtC = formatCurrency;
window._pfFmtP = formatPercent;

export function getProformaTabHtml() {
  return `
    <div x-show="activeTab === 'proforma'" x-cloak>

      <!-- ═══ SCENARIO LIST VIEW ═══ -->
      <template x-if="proformaView === 'list'">
        <div>
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm text-gray-500" x-show="proformaScenarios.length">
              <span x-text="proformaScenarios.length"></span> scenario(s)
            </p>
            <div class="flex items-center gap-2">
              <button @click="createProformaDemoScenario()"
                      x-show="!proformaScenarios.some(s => s.name === 'Demo Scenario')"
                      class="px-3 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                Try Demo Scenario
              </button>
              <button @click="createProformaScenario()"
                      class="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">
                New Scenario
              </button>
            </div>
          </div>

          <!-- Loading -->
          <div x-show="proformaLoading" class="text-center py-12 text-gray-400">Loading...</div>

          <!-- Empty state -->
          <div x-show="!proformaLoading && proformaScenarios.length === 0" class="text-center py-16">
            <svg class="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
            </svg>
            <p class="text-gray-500 text-sm">No scenarios yet</p>
            <div class="mt-4 flex items-center justify-center gap-3">
              <button @click="createProformaScenario()"
                      class="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">
                Create your first scenario
              </button>
              <button @click="createProformaDemoScenario()"
                      class="px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                Try Demo Scenario
              </button>
            </div>
          </div>

          <!-- Scenario cards -->
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" x-show="!proformaLoading && proformaScenarios.length > 0">
            <template x-for="s in proformaScenarios" :key="s.id">
              <div class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 cursor-pointer transition-colors"
                   :class="s.name === 'Demo Scenario' ? 'border-l-4 border-l-indigo-400' : ''"
                   @click="openProformaScenario(s.id)">
                <div class="flex items-start justify-between">
                  <div class="min-w-0 flex-1">
                    <h3 class="text-sm font-semibold text-gray-900 truncate flex items-center gap-1.5">
                      <span x-text="s.name"></span>
                      <span x-show="s.name === 'Demo Scenario'"
                            class="text-[9px] font-semibold tracking-wider bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded uppercase">
                        Demo
                      </span>
                      <svg x-show="s.locked" class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                      </svg>
                    </h3>
                    <p class="text-xs text-gray-500 mt-1" x-text="s.description || 'No description'"></p>
                  </div>
                  <div class="flex items-center gap-1 ml-2 shrink-0">
                    <button @click.stop="toggleProformaLock(s.id)"
                            class="p-1 text-gray-400 hover:text-gray-600"
                            :title="s.locked ? 'Unlock scenario' : 'Lock scenario'">
                      <template x-if="s.locked">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                        </svg>
                      </template>
                      <template x-if="!s.locked">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                        </svg>
                      </template>
                    </button>
                    <button @click.stop="deleteProformaScenario(s.id)"
                            class="p-1 text-gray-400 hover:text-red-500">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="mt-3 flex items-center gap-3 text-xs text-gray-400">
                  <span x-text="s.createdBy ? (s.createdBy.firstName + ' ' + s.createdBy.lastName) : ''"></span>
                  <span x-text="window.formatDateSafe(s.updatedAt)"></span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>

      <!-- ═══ EDITOR VIEW ═══ -->
      <template x-if="proformaView === 'editor' && proformaScenario">
        <div>
          <!-- Editor Header -->
          <div class="flex items-center gap-3 mb-4 flex-wrap">
            <button @click="proformaBackToList()"
                    class="p-1.5 text-gray-400 hover:text-gray-600 rounded">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
              </svg>
            </button>
            <input type="text" x-model="proformaScenario.name"
                   @input="proformaMarkDirty()"
                   :disabled="proformaScenario.locked"
                   :class="proformaScenario.locked ? 'text-gray-500 cursor-not-allowed' : 'text-gray-900 hover:border-gray-300 focus:border-gray-900'"
                   class="text-lg font-semibold border-0 border-b border-transparent focus:ring-0 px-0 py-1 bg-transparent flex-1 min-w-[200px]">
            <span x-show="proformaScenario.name === 'Demo Scenario'"
                  class="text-[10px] font-semibold tracking-wider bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded uppercase">
              Demo
            </span>
            <div class="flex items-center gap-2 ml-auto">
              <span x-show="proformaScenario.locked" class="text-xs text-gray-400 font-medium flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                </svg>
                Locked
              </span>
              <span x-show="proformaDirty && !proformaScenario.locked" class="text-xs text-amber-600 font-medium">Unsaved</span>
              <button x-show="proformaScenario.name === 'Demo Scenario'"
                      @click="cloneProformaToReal()"
                      class="px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                Clone to real scenario
              </button>
              <button x-show="proformaDirty && !proformaScenario.locked"
                      @click="resetProformaToBaseline()"
                      class="px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                Reset
              </button>
              <button @click="saveProformaScenario()"
                      :disabled="proformaLoading || proformaScenario.locked"
                      class="px-4 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50">
                Save
              </button>
            </div>
          </div>

          <!-- Sub-tab pills -->
          <div class="flex border-b border-gray-200 mb-4 gap-1">
            <template x-for="t in [{id:'assumptions',label:'Assumptions'},{id:'outlook',label:'Outlook'},{id:'charts',label:'Charts'},{id:'summary',label:'Summary'}]" :key="t.id">
              <button @click="proformaEditorTab = t.id; if(t.id === 'charts') $nextTick(() => renderProformaCharts())"
                      :class="proformaEditorTab === t.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'"
                      class="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
                      x-text="t.label">
              </button>
            </template>
          </div>

          <!-- ─── ASSUMPTIONS SUB-TAB ─── -->
          <div x-show="proformaEditorTab === 'assumptions'"
               :class="proformaScenario.locked ? 'opacity-60 pointer-events-none' : ''">

            <!-- Sticky combined header: metric tiles + journey bar -->
            ${metricsAndNav()}

            <!-- Active section -->
            <div class="min-w-0">
              <div x-show="proformaSection === 'revenue'">${getRevenueSection()}</div>
              <div x-show="proformaSection === 'markets'">${getMarketsSection()}</div>
              <div x-show="proformaSection === 'production'">${getProductionSection()}</div>
              <div x-show="proformaSection === 'costs'">${getCostsSection()}</div>
              <div x-show="proformaSection === 'operations'">${getOperationsSection()}</div>
              <div x-show="proformaSection === 'machines'">${getMachinesSection()}</div>
              <div x-show="proformaSection === 'capital'">${getCapitalSection()}</div>
            </div>

            <!-- Reference data accordion: collapsed by default, always at the bottom -->
            <details class="mt-16 border-t border-gray-200 pt-6 max-w-3xl">
              <summary class="cursor-pointer flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 select-none">
                <svg class="w-4 h-4 transition-transform details-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
                <span>Reference data</span>
                <span class="text-[11px] text-gray-400 font-normal">Battery chemistry, supercap specs &mdash; rarely edited; powers built-in market sources</span>
              </summary>
              <div class="mt-6">${getReferenceDataSection()}</div>
            </details>
          </div>

          <!-- ─── OUTLOOK SUB-TAB ─── -->
          <div x-show="proformaEditorTab === 'outlook'">
            ${_outlookTable()}
          </div>

          <!-- ─── CHARTS SUB-TAB ─── -->
          <div x-show="proformaEditorTab === 'charts'">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div class="border border-gray-200 rounded-lg p-4"><div style="height:320px"><canvas id="proforma-chart-revenue"></canvas></div></div>
              <div class="border border-gray-200 rounded-lg p-4"><div style="height:320px"><canvas id="proforma-chart-pnl"></canvas></div></div>
              <div class="border border-gray-200 rounded-lg p-4"><div style="height:320px"><canvas id="proforma-chart-cash"></canvas></div></div>
              <div class="border border-gray-200 rounded-lg p-4"><div style="height:320px"><canvas id="proforma-chart-production"></canvas></div></div>
              <div class="border border-gray-200 rounded-lg p-4 lg:col-span-2">
                <div style="height:360px"><canvas id="proforma-chart-capacity-vs-demand"></canvas></div>
                <p class="mt-2 text-[11px] text-gray-500">Stacked bars are kg-of-graphene implied by each revenue stream; the dark line is what the modeled machines can actually produce. Where the line dips below the bars, sales projections exceed production capacity.</p>
              </div>
            </div>
          </div>

          <!-- ─── SUMMARY SUB-TAB ─── -->
          <div x-show="proformaEditorTab === 'summary'">
            ${_summaryView()}
          </div>
        </div>
      </template>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════
// OUTLOOK TABLE
// ═══════════════════════════════════════════════════════════════
function _outlookTable() {
  return `
    <div>
      <!-- View toggle -->
      <div class="flex items-center justify-end gap-1 mb-3">
        <div class="flex rounded-md border border-gray-300 overflow-hidden">
          <template x-for="v in [{id:'monthly',label:'Monthly'},{id:'quarterly',label:'Quarterly'},{id:'yearly',label:'Yearly'}]" :key="v.id">
            <button @click="proformaOutlookView = v.id"
                    :class="proformaOutlookView === v.id ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'"
                    class="px-3 py-1.5 text-xs font-medium transition-colors"
                    x-text="v.label">
            </button>
          </template>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto border border-gray-200 rounded-lg" x-show="proformaComputed">
        <table class="text-xs w-full">
          <thead>
            <tr class="bg-gray-50">
              <th class="sticky left-0 bg-gray-50 z-10 px-3 py-2 text-left text-gray-600 font-medium w-40 min-w-[160px] border-r border-gray-200">Line Item</th>
              <template x-for="(col, ci) in getProformaColumns()" :key="ci">
                <th class="px-2 py-2 text-right text-gray-500 font-medium whitespace-nowrap min-w-[80px]" x-text="col"></th>
              </template>
            </tr>
          </thead>
          <tbody>
            <template x-for="(row, ri) in getProformaOutlookRows()" :key="row.key">
              <tr x-show="!row.child || !proformaCollapsed[row.parentKey]"
                  :class="{
                    'border-t border-gray-300 bg-gray-50': row.bold || row.category,
                    'border-t border-gray-100': !row.bold && !row.category && !row.child,
                    'border-t border-gray-50': row.child,
                    'cursor-pointer hover:bg-gray-100': row.category
                  }"
                  @click="row.category && (proformaCollapsed[row.key] = !proformaCollapsed[row.key])">
                <td class="sticky left-0 z-10 px-3 py-1.5 whitespace-nowrap border-r border-gray-200"
                    :class="[
                      row.bold ? 'bg-gray-50 text-gray-900 font-semibold' : row.child ? 'bg-white text-gray-500 pl-8' : row.category ? 'bg-gray-50 text-gray-700 font-medium' : 'bg-white text-gray-700',
                    ]">
                  <span class="flex items-center gap-1">
                    <template x-if="row.category">
                      <svg :class="proformaCollapsed[row.key] ? '' : 'rotate-90'" class="w-3 h-3 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                    </template>
                    <span x-text="row.label"></span>
                  </span>
                </td>
                <template x-for="(val, vi) in row.data" :key="vi">
                  <td class="px-2 py-1.5 text-right whitespace-nowrap font-mono"
                      :class="row.percent ? 'text-gray-600' : row.child ? (val < 0 ? 'text-red-400' : 'text-gray-500') : (val < 0 ? 'text-red-600' : (val > 0 && row.bold ? 'text-green-700' : 'text-gray-700'))">
                    <span x-text="row.percent ? window._pfFmtP(val) : window._pfFmtC(val, proformaOutlookView !== 'monthly')"></span>
                  </td>
                </template>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div x-show="!proformaComputed" class="text-center py-12 text-gray-400 text-sm">
        No computed data. Save or load a scenario to see the outlook.
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════
// SUMMARY VIEW
// ═══════════════════════════════════════════════════════════════
function _summaryView() {
  return `
    <div x-show="proformaComputed">
      <!-- Key Metrics Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <div class="border border-gray-200 rounded-lg p-3">
          <p class="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Break-Even Month</p>
          <p class="text-lg font-semibold text-gray-900" x-text="proformaComputed.metrics.breakEvenMonth >= 0 ? 'Month ' + proformaComputed.metrics.breakEvenMonth : 'N/A'"></p>
        </div>
        <div class="border border-gray-200 rounded-lg p-3">
          <p class="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Peak Cash Need</p>
          <p class="text-lg font-semibold text-red-600" x-text="window._pfFmtC(proformaComputed.metrics.peakCashNeed, true)"></p>
        </div>
        <div class="border border-gray-200 rounded-lg p-3">
          <p class="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Y3 Revenue Run Rate</p>
          <p class="text-lg font-semibold text-gray-900" x-text="window._pfFmtC(proformaComputed.metrics.y3Revenue, true)"></p>
        </div>
        <div class="border border-gray-200 rounded-lg p-3">
          <p class="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Y3 EBITDA Margin</p>
          <p class="text-lg font-semibold" :class="proformaComputed.metrics.y3EbitdaMargin >= 0 ? 'text-green-700' : 'text-red-600'"
             x-text="window._pfFmtP(proformaComputed.metrics.y3EbitdaMargin)"></p>
        </div>
        <div class="border border-gray-200 rounded-lg p-3">
          <p class="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Total CapEx</p>
          <p class="text-lg font-semibold text-gray-900" x-text="window._pfFmtC(proformaComputed.metrics.totalCapex, true)"></p>
        </div>
      </div>

      <!-- Quarterly Summary Table -->
      <h3 class="text-sm font-semibold text-gray-700 mb-2">Quarterly Summary</h3>
      <div class="overflow-x-auto border border-gray-200 rounded-lg">
        <table class="text-xs w-full">
          <thead>
            <tr class="bg-gray-50">
              <th class="sticky left-0 bg-gray-50 z-10 px-3 py-2 text-left text-gray-600 font-medium w-40 border-r border-gray-200">Metric</th>
              <template x-for="q in 16" :key="q">
                <th class="px-2 py-2 text-right text-gray-500 font-medium whitespace-nowrap" x-text="'Y' + Math.floor((q-1)/4) + ' Q' + ((q-1)%4+1)"></th>
              </template>
            </tr>
          </thead>
          <tbody>
            <template x-for="row in [{label:'Revenue',key:'revenue'},{label:'COGS',key:'cogs'},{label:'Gross Margin',key:'grossMargin'},{label:'OPEX',key:'opex'},{label:'EBITDA',key:'ebitda'},{label:'Cash Flow',key:'cashFlow'},{label:'Cumulative Cash',key:'cumulativeCash'}]" :key="row.key">
              <tr class="border-t border-gray-100">
                <td class="sticky left-0 bg-white z-10 px-3 py-1.5 text-gray-700 font-medium whitespace-nowrap border-r border-gray-200" x-text="row.label"></td>
                <template x-for="(val, vi) in proformaComputed.quarterly[row.key]" :key="vi">
                  <td class="px-2 py-1.5 text-right whitespace-nowrap font-mono"
                      :class="val < 0 ? 'text-red-600' : 'text-gray-700'">
                    <span x-text="window._pfFmtC(val, true)"></span>
                  </td>
                </template>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
    <div x-show="!proformaComputed" class="text-center py-12 text-gray-400 text-sm">
      No computed data available.
    </div>
  `;
}
