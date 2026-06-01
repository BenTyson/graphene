import { formatCurrency, formatPercent } from '../../utils/formatters.js';
import { metricsAndNav } from './proforma/cards.js';
import { getProductionSection } from './proforma/ProductionSection.js';
import { getRevenueSection } from './proforma/RevenueSection.js';
import { getCostsSection } from './proforma/CostsSection.js';
import { getOperationsSection } from './proforma/OperationsSection.js';
import { getMachinesSection } from './proforma/MachinesSection.js';
import { getCapitalSection } from './proforma/CapitalSection.js';
import { getMarketsSection, getReferenceDataSection } from './proforma/TechnicalSection.js';
import { getHistoricalSection } from './proforma/HistoricalSection.js';
import { getProductionTimelineHtml } from './proforma/ProductionTimeline.js';

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
          <div class="sticky top-0 z-30 bg-white/95 backdrop-blur -mx-4 px-4 flex border-b border-gray-200 mb-4 gap-1">
            <template x-for="t in [{id:'assumptions',label:'Assumptions'},{id:'production',label:'Production'},{id:'outlook',label:'Outlook'},{id:'charts',label:'Charts'},{id:'summary',label:'Summary'}]" :key="t.id">
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
              <div x-show="proformaSection === 'historical'">${getHistoricalSection()}</div>
            </div>

            <!-- Reference data accordion: Markets section only -->
            <details x-show="proformaSection === 'markets'" class="mt-16 border-t border-gray-200 pt-6 max-w-3xl">
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

          <!-- ─── PRODUCTION SUB-TAB ─── -->
          <div x-show="proformaEditorTab === 'production'">
            ${getProductionTimelineHtml()}
          </div>

          <!-- ─── OUTLOOK SUB-TAB ─── -->
          <div x-show="proformaEditorTab === 'outlook'">
            ${_outlookTable()}
          </div>

          <!-- ─── CHARTS SUB-TAB ─── -->
          <div x-show="proformaEditorTab === 'charts'">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              ${_chartCard('proforma-chart-revenue')}
              ${_chartCard('proforma-chart-pnl')}

              ${_chartCard('proforma-chart-margins')}
              ${_chartCard('proforma-chart-unit-economics', { caption: 'Per-kg revenue and cost, using stream-implied kg as the denominator. The vertical gap between the lines is gross margin per kg.' })}

              ${_chartCard('proforma-chart-cogs-composition')}
              ${_chartCard('proforma-chart-opex-composition')}

              ${_chartCard('proforma-chart-cash')}
              ${_chartCard('proforma-chart-production')}

              ${_chartCard('proforma-chart-capacity-vs-demand', {
                wide: true,
                height: 360,
                caption: 'Stacked bars are kg-of-graphene implied by each revenue stream; the dark line is what the modeled machines can actually produce. Where the line dips below the bars, sales projections exceed production capacity.'
              })}
            </div>
          </div>

          <!-- ─── SUMMARY SUB-TAB ─── -->
          <div x-show="proformaEditorTab === 'summary'">
            ${_summaryView()}
          </div>
        </div>
      </template>

      ${_fullscreenChartModal()}
      ${_explainerPanel()}
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════
// OUTLOOK CELL EXPLAINER
// Floating panel anchored near the double-clicked cell. Shows the
// formula, each input's current value at that period, optional leaf
// inputs (raw assumptions), and a monthly breakdown for aggregated
// cells. Each "part" with a `key` is clickable → drills in.
// ═══════════════════════════════════════════════════════════════
function _explainerPanel() {
  return `
    <template x-if="proformaExplainer">
      <div x-data="{ panelStyle: '' }"
           x-init="
             $nextTick(() => {
               const anchor = proformaExplainer.anchor;
               const W = 440, MARGIN = 12;
               const vw = window.innerWidth, vh = window.innerHeight;
               let top, left;
               if (anchor) {
                 top = anchor.top + anchor.height + 8;
                 left = anchor.left + anchor.width / 2 - W / 2;
                 if (left + W > vw - MARGIN) left = vw - W - MARGIN;
                 if (left < MARGIN) left = MARGIN;
                 // Flip above the cell if the panel would run off the bottom.
                 const estH = Math.min(520, vh - 2 * MARGIN);
                 if (top + estH > vh - MARGIN) top = Math.max(MARGIN, anchor.top - estH - 8);
               } else {
                 top = 100;
                 left = vw / 2 - W / 2;
               }
               panelStyle = 'top:' + top + 'px; left:' + left + 'px; width:' + W + 'px;';
             })
           ">
        <!-- Click-away backdrop (invisible) -->
        <div class="fixed inset-0 z-40"
             @click="closeProformaExplainer()"
             @keydown.escape.window="closeProformaExplainer()"></div>

        <!-- Panel -->
        <div class="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[80vh] overflow-hidden flex flex-col"
             :style="panelStyle"
             x-data="{ exp: getProformaExplain(), showMonthly: false }"
             x-effect="exp = getProformaExplain()">
          <template x-if="exp">
            <div class="flex flex-col min-h-0">
              <!-- Header -->
              <div class="px-4 py-3 border-b border-gray-200 flex items-start gap-2 bg-gray-50">
                <button x-show="proformaExplainerStack.length > 0"
                        @click="backProformaExplainer()"
                        class="p-1 text-gray-400 hover:text-gray-900 rounded shrink-0"
                        title="Back">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <div class="flex-1 min-w-0">
                  <div class="text-[10px] uppercase tracking-wide text-gray-500" x-text="exp.periodLabel + ' · ' + exp.view"></div>
                  <div class="text-sm font-semibold text-gray-900 truncate" x-text="exp.title"></div>
                  <div class="text-lg font-mono mt-0.5"
                       :class="exp.value < 0 ? 'text-red-600' : 'text-gray-900'"
                       x-text="formatProformaExplainValue(exp.value, exp.format)"></div>
                </div>
                <button @click="closeProformaExplainer()"
                        class="p-1 text-gray-400 hover:text-gray-900 rounded shrink-0">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <!-- Body (scrolls) -->
              <div class="overflow-y-auto px-4 py-3 text-xs text-gray-700 space-y-3 min-h-0">
                <!-- Formula -->
                <div>
                  <div class="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Formula</div>
                  <div class="font-mono text-[12px] text-gray-800 leading-snug" x-text="exp.formula"></div>
                </div>

                <!-- Parts -->
                <div x-show="exp.parts && exp.parts.length">
                  <div class="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Inputs at this period</div>
                  <div class="border border-gray-100 rounded divide-y divide-gray-100">
                    <template x-for="(p, pi) in exp.parts" :key="pi">
                      <div class="flex items-center gap-2 px-2.5 py-1.5"
                           :class="p.key ? 'cursor-pointer hover:bg-gray-50' : ''"
                           @click="p.key && drillProformaExplainer(p.key, p.label)">
                        <span class="text-gray-400 font-mono w-4 shrink-0 text-center" x-text="pi === 0 ? '' : (exp.parts[pi-1].op || '+')"></span>
                        <span class="flex-1 truncate text-gray-700" x-text="p.label"></span>
                        <span class="font-mono text-gray-900 shrink-0"
                              x-text="formatProformaExplainValue(p.value, p.format || (typeof p.value === 'number' ? exp.format : null))"></span>
                        <svg x-show="p.key" class="w-3 h-3 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </template>
                  </div>
                </div>

                <!-- Leaf inputs (raw assumptions). Rows with a section deep-link
                     to the matching journey pill on the Assumptions tab. -->
                <div x-show="exp.leafInputs && exp.leafInputs.length">
                  <div class="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Source assumptions</div>
                  <div class="border border-gray-100 rounded divide-y divide-gray-100">
                    <template x-for="(li, ii) in exp.leafInputs" :key="ii">
                      <div class="flex items-center gap-2 px-2.5 py-1.5"
                           :class="li.section ? 'cursor-pointer hover:bg-gray-50' : ''"
                           @click="li.section && jumpToProformaSection(li.section)">
                        <span class="flex-1 text-gray-600" x-text="li.label"></span>
                        <span class="font-mono text-gray-900 shrink-0 text-right" x-text="li.value"></span>
                        <svg x-show="li.section" class="w-3 h-3 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                      </div>
                    </template>
                  </div>
                </div>

                <!-- Monthly breakdown (aggregated views only) -->
                <div x-show="exp.monthly && exp.monthly.values.length">
                  <button @click="showMonthly = !showMonthly"
                          class="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-gray-500 hover:text-gray-900">
                    <svg :class="showMonthly ? 'rotate-90' : ''" class="w-3 h-3 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                    <span>Monthly breakdown</span>
                    <span class="text-gray-400 normal-case tracking-normal" x-text="'(' + exp.monthly.values.length + ' months)'"></span>
                  </button>
                  <div x-show="showMonthly" class="mt-2 border border-gray-100 rounded divide-y divide-gray-100">
                    <template x-for="(v, mi) in exp.monthly.values" :key="mi">
                      <div class="flex items-center gap-2 px-2.5 py-1 text-[11px]">
                        <span class="text-gray-500 w-14 shrink-0" x-text="exp.monthly.labels[mi]"></span>
                        <span class="flex-1"></span>
                        <span class="font-mono text-gray-800 shrink-0"
                              :class="v < 0 ? 'text-red-600' : ''"
                              x-text="formatProformaExplainValue(v, exp.format)"></span>
                      </div>
                    </template>
                  </div>
                </div>

                <!-- Note -->
                <div x-show="exp.note" class="text-[11px] text-gray-500 italic border-l-2 border-gray-200 pl-2" x-text="exp.note"></div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
  `;
}

// ═══════════════════════════════════════════════════════════════
// CHART CARD + FULLSCREEN MODAL
// ═══════════════════════════════════════════════════════════════
// Each chart sits in a clickable card. Click anywhere on the card to
// open the chart in the fullscreen modal. The expand icon in the
// corner is just an affordance — the whole card is the hit target.
function _chartCard(canvasId, opts = {}) {
  const { caption, wide = false, height = 320 } = opts;
  const wideClass = wide ? ' lg:col-span-2' : '';
  return `
    <div class="group relative border border-gray-200 rounded-lg p-4 cursor-pointer
                hover:border-gray-400 hover:shadow-sm transition-all${wideClass}"
         @click="openProformaFullscreenChart('${canvasId}')">
      <button type="button"
              class="absolute top-2.5 right-2.5 z-10 p-1.5 text-gray-300 group-hover:text-gray-700
                     rounded-md hover:bg-gray-100 transition-colors"
              @click.stop="openProformaFullscreenChart('${canvasId}')"
              aria-label="Expand chart">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4h4m8 0h4v4m0 8v4h-4M8 20H4v-4"/>
        </svg>
      </button>
      <div style="height:${height}px"><canvas id="${canvasId}"></canvas></div>
      ${caption ? `<p class="mt-2 text-[11px] text-gray-500">${caption}</p>` : ''}
    </div>
  `;
}

function _fullscreenChartModal() {
  return `
    <div x-show="proformaFullscreenChart"
         x-cloak
         x-transition.opacity
         @keydown.escape.window="closeProformaFullscreenChart()"
         @click.self="closeProformaFullscreenChart()"
         class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8">
      <div class="relative bg-white rounded-xl shadow-2xl w-full h-full max-w-[1400px] max-h-[92vh] p-6 sm:p-8 flex flex-col">
        <button type="button"
                @click="closeProformaFullscreenChart()"
                class="absolute top-3 right-3 z-10 p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Close fullscreen chart">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <div class="flex-1 min-h-0">
          <canvas id="proforma-chart-fullscreen"></canvas>
        </div>
      </div>
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
      <div class="overflow-auto border border-gray-200 rounded-lg max-h-[calc(100vh-260px)]" x-show="proformaComputed">
        <table class="text-xs">
          <thead class="sticky top-0 z-20">
            <!-- Year-group banner (monthly / quarterly only) -->
            <template x-if="proformaOutlookView !== 'yearly'">
              <tr class="bg-gray-100 border-b border-gray-300">
                <th class="sticky left-0 bg-gray-100 z-30 px-3 py-1 border-r border-gray-200"></th>
                <template x-for="(yr, yi) in [0,1,2,3,4]" :key="yr">
                  <th :colspan="proformaOutlookView === 'monthly' ? 13 : 5"
                      class="py-1.5 px-3 text-center text-[11px] font-semibold text-gray-600 tracking-wide"
                      x-text="'Year ' + yr">
                  </th>
                </template>
              </tr>
            </template>
            <tr class="bg-gray-50">
              <th class="sticky left-0 bg-gray-50 z-30 px-3 py-2 text-left text-gray-600 font-medium w-44 min-w-[176px] border-r border-gray-200">Line Item</th>
              <template x-for="(col, ci) in getProformaDisplayColumns()" :key="ci">
                <th class="py-2 text-right font-medium whitespace-nowrap"
                    :class="col.isTotal ? 'px-3 min-w-[90px] bg-gray-100 text-gray-700 font-semibold border-x-2 border-gray-400' : {
                      'px-4 min-w-[150px] text-gray-500': proformaOutlookView === 'yearly',
                      'px-3 min-w-[110px] text-gray-500': proformaOutlookView === 'quarterly',
                      'px-2 min-w-[80px] text-gray-500': proformaOutlookView === 'monthly'
                    }"
                    x-text="col.label">
                </th>
              </template>
            </tr>
          </thead>
          <tbody>
            <template x-for="(row, ri) in getProformaOutlookRows()" :key="proformaOutlookView + '_' + row.key">
              <tr x-show="!row.child || !proformaCollapsed[row.parentKey]"
                  :class="[
                    row.bgRow,
                    row.child ? 'border-t border-gray-100/60' : 'border-t border-gray-300',
                    row.category ? 'cursor-pointer hover:brightness-95' : ''
                  ]"
                  @click="row.category && (proformaCollapsed[row.key] = !proformaCollapsed[row.key])">
                <td class="sticky left-0 z-10 px-3 py-1.5 whitespace-nowrap border-r border-gray-200"
                    :class="[
                      row.bgLabel,
                      row.bold ? 'text-gray-900 font-semibold'
                        : row.category ? 'text-gray-700 font-medium'
                        : row.child ? 'text-gray-600 pl-8'
                        : 'text-gray-700'
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
                <template x-for="(item, vi) in getProformaDisplayData(row)" :key="vi">
                  <td class="py-1.5 text-right whitespace-nowrap font-mono select-none hover:outline hover:outline-1 hover:outline-gray-400/60"
                      @dblclick.stop="openProformaExplainerFromCell(row, vi, item.isTotal, $event)"
                      :class="item.isTotal ? [
                        'px-3 border-x-2 border-gray-400 font-semibold',
                        row.bgTotal,
                        row.percent ? 'text-gray-600' : item.val < 0 ? 'text-red-600' : (item.val > 0 && row.bold ? 'text-green-700' : 'text-gray-800')
                      ] : [
                        row.percent ? 'text-gray-600' : row.child ? (item.val < 0 ? 'text-red-500' : 'text-gray-600') : (item.val < 0 ? 'text-red-600' : (item.val > 0 && row.bold ? 'text-green-700' : 'text-gray-800')),
                        proformaOutlookView === 'yearly' ? 'px-4' : proformaOutlookView === 'quarterly' ? 'px-3' : 'px-2',
                        (row.bold || row.category) ? 'font-semibold' : ''
                      ]">
                    <span x-text="row.percent ? window._pfFmtP(item.val) : window._pfFmtC(item.val, item.isTotal || proformaOutlookView !== 'monthly')"></span>
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
  // Section header row in the yearly table. Tinted bg matches the section's role.
  const sectionRow = (label, bgClass) => `
    <tr class="border-t border-gray-300">
      <td colspan="20" class="${bgClass} px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-800" x-text="'${label}'"></td>
    </tr>
  `;

  // Currency row — one value per year, x-text expression takes the array.
  const currencyRow = (label, expr, opts = {}) => {
    const { bold = false, indent = false, sign = false } = opts;
    return `
      <tr class="border-t border-gray-100">
        <td class="sticky left-0 bg-white z-10 px-3 py-1.5 whitespace-nowrap border-r border-gray-200 ${bold ? 'font-semibold text-gray-900' : 'text-gray-700'} ${indent ? 'pl-6 text-gray-600' : ''}">${sign ? '<span class="text-gray-400 mr-1">−</span>' : ''}${label}</td>
        <template x-for="(v, i) in (${expr} || [])" :key="i">
          <td class="px-3 py-1.5 text-right whitespace-nowrap font-mono ${bold ? 'font-semibold' : ''}"
              :class="(v == null || v === 0) ? 'text-gray-300' : (v < 0 ? 'text-red-600' : 'text-gray-800')">
            <span x-text="(v == null) ? '—' : window._pfFmtC(v, true)"></span>
          </td>
        </template>
      </tr>
    `;
  };

  // Number row (kg or unitless integer).
  const numRow = (label, expr, opts = {}) => {
    const { unit = '', bold = false, indent = false } = opts;
    return `
      <tr class="border-t border-gray-100">
        <td class="sticky left-0 bg-white z-10 px-3 py-1.5 whitespace-nowrap border-r border-gray-200 ${bold ? 'font-semibold text-gray-900' : 'text-gray-700'} ${indent ? 'pl-6 text-gray-600' : ''}">${label}</td>
        <template x-for="(v, i) in (${expr} || [])" :key="i">
          <td class="px-3 py-1.5 text-right whitespace-nowrap font-mono ${bold ? 'font-semibold' : ''}"
              :class="(v == null || v === 0) ? 'text-gray-300' : (v < 0 ? 'text-red-600' : 'text-gray-800')">
            <span x-text="v == null ? '—' : Math.round(v).toLocaleString()${unit ? ` + ' ${unit}'` : ''}"></span>
          </td>
        </template>
      </tr>
    `;
  };

  // Per-kilo $ row (small numbers, integer-rounded, em-dash for null).
  const perKgRow = (label, expr) => `
    <tr class="border-t border-gray-100">
      <td class="sticky left-0 bg-white z-10 px-3 py-1.5 whitespace-nowrap border-r border-gray-200 font-semibold text-gray-900">${label}</td>
      <template x-for="(v, i) in (${expr} || [])" :key="i">
        <td class="px-3 py-1.5 text-right whitespace-nowrap font-mono font-semibold"
            :class="v == null ? 'text-gray-300' : 'text-gray-800'">
          <span x-text="v == null ? 'N/A' : '$' + Math.round(v).toLocaleString()"></span>
        </td>
      </template>
    </tr>
  `;

  // Headline P&L: clean striped table. Label column sits one shade darker
  // than the data row it belongs to so the eye keeps the row together.
  const headlineRow = (label, expr, idx, opts = {}) => {
    const { pct = false } = opts;
    const isEven = idx % 2 === 0;
    const dataBg = isEven ? 'bg-white' : 'bg-gray-50';
    const labelBg = isEven ? 'bg-gray-100' : 'bg-gray-200';
    const valueFmt = pct
      ? `(v == null ? 'N/A' : (v * 100).toFixed(2) + '%')`
      : `(v == null ? 'N/A' : window._pfFmtC(v, true))`;
    return `
      <tr class="border-b border-gray-200">
        <td class="${labelBg} px-3 py-2 font-semibold text-[11px] uppercase tracking-wider text-gray-800 whitespace-nowrap">${label}</td>
        <template x-for="(v, i) in (${expr} || [])" :key="i">
          <td class="${dataBg} px-3 py-2 text-right font-mono font-semibold"
              :class="(v == null) ? 'text-gray-400' : (v < 0 ? 'text-red-600' : 'text-gray-900')">
            <span x-text="${valueFmt}"></span>
          </td>
        </template>
      </tr>
    `;
  };
  const headlineTable = `
    <div class="mb-6 overflow-x-auto rounded-lg border border-gray-200" x-data="{ S: getProformaSummary() }" x-effect="S = getProformaSummary()">
      <table class="text-xs w-full border-collapse">
        <thead>
          <tr>
            <th class="bg-white px-3 py-2 w-56 min-w-[224px] border-b border-gray-200"></th>
            <template x-for="(yr, yi) in (S?.years || [])" :key="yi">
              <th class="px-3 py-2 text-right text-xs font-semibold border-b border-gray-200 whitespace-nowrap"
                  :class="(S?.hasHistorical && yi === 0) ? 'bg-amber-50 text-amber-800' : 'bg-white text-gray-900'"
                  x-text="yr"></th>
            </template>
          </tr>
        </thead>
        <tbody>
          ${headlineRow('Revenue',                'S?.headline?.revenue',          0)}
          ${headlineRow('COGS',                   'S?.headline?.cogs',             1)}
          ${headlineRow('Gross',                  'S?.headline?.gross',            2)}
          ${headlineRow('Gross Margin',           'S?.headline?.grossMarginPct',   3, { pct: true })}
          ${headlineRow('OPEX',                   'S?.headline?.opex',             4)}
          ${headlineRow('Net Income Pre-Tax',     'S?.headline?.netIncome',        5)}
          ${headlineRow('Net Operating Margin',   'S?.headline?.netOpMarginPct',   6, { pct: true })}
        </tbody>
      </table>
    </div>
  `;

  return `
    <div id="proforma-summary-printable">

      <!-- Print-only title: hidden on screen, visible when printing -->
      <div class="proforma-print-header" style="display:none; margin-bottom:16px;">
        <h2 style="font-size:16px; font-weight:700; margin:0 0 2px;" x-text="proformaScenario?.name + ' — Financial Summary'"></h2>
        <p style="font-size:10px; color:#666; margin:0;" x-text="'Generated ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })"></p>
      </div>

      <!-- Export button: visible on screen only -->
      <div class="proforma-export-btn flex items-center justify-end mb-3">
        <button @click="printProformaSummary()"
                class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
          </svg>
          Export PDF
        </button>
      </div>

    <div x-show="proformaComputed">
      ${headlineTable}
      <div class="overflow-x-auto border border-gray-200 rounded-lg" x-data="{ S: getProformaSummary() }" x-effect="S = getProformaSummary()">
        <table class="text-xs w-full">
          <thead>
            <tr class="bg-gray-50">
              <th class="sticky left-0 bg-gray-50 z-10 px-3 py-2 text-left text-gray-600 font-medium w-56 min-w-[224px] border-r border-gray-200">Line</th>
              <template x-for="(yr, yi) in (S?.years || [])" :key="yi">
                <th class="px-3 py-2 text-right font-medium whitespace-nowrap min-w-[120px]"
                    :class="(S?.hasHistorical && yi === 0) ? 'bg-amber-50 text-amber-800' : 'text-gray-500'"
                    x-text="yr"></th>
              </template>
            </tr>
          </thead>
          <tbody>
            ${sectionRow('Metrics', 'bg-slate-100')}
            ${perKgRow('Avg. Price per Kilo', 'S?.metrics?.avgPricePerKg')}
            ${perKgRow('Avg. Cost per Kilo',  'S?.metrics?.avgCostPerKg')}
            ${numRow  ('Total Kilos Produced', 'S?.metrics?.kgProducedByYear', { bold: true })}

            ${sectionRow('Sales', 'bg-blue-50')}
            <template x-for="(row, ri) in (S?.sales || [])" :key="ri">
              <tr class="border-t border-gray-100">
                <td class="sticky left-0 bg-white z-10 px-3 py-1.5 whitespace-nowrap border-r border-gray-200 text-gray-700">
                  <span class="text-gray-400 mr-1">Sales kg:</span><span x-text="row.label"></span>
                </td>
                <template x-for="(v, i) in row.data" :key="i">
                  <td class="px-3 py-1.5 text-right whitespace-nowrap font-mono"
                      :class="(v == null || v === 0) ? 'text-gray-300' : 'text-gray-800'">
                    <span x-text="Math.round(v || 0).toLocaleString()"></span>
                  </td>
                </template>
              </tr>
            </template>

            ${sectionRow('CapEx &amp; OpEx', 'bg-rose-50')}
            ${currencyRow('Total CAPEX', 'S?.capexOpex?.capex', { bold: true })}
            ${currencyRow('Total OPEX',  'S?.capexOpex?.opex',  { bold: true })}
            ${currencyRow('Salary &amp; Benefits', 'S?.capexOpex?.salaryBenefits', { indent: true, sign: true })}
            ${currencyRow('Legal',                 'S?.capexOpex?.legal',          { indent: true, sign: true })}
            ${currencyRow('Royalty &amp; Commission', 'S?.capexOpex?.royaltyCommission', { indent: true, sign: true })}
            ${currencyRow('Other',                 'S?.capexOpex?.otherOpex',      { indent: true, sign: true })}
            ${numRow     ('Total FTEs',            'S?.capexOpex?.fteByYear',      { bold: true })}

            ${sectionRow('Cash Flow', 'bg-violet-100')}
            ${currencyRow('Cumulative Cash Flow',   'S?.cashFlow?.cumulativeCash', { bold: true })}
            ${currencyRow('CAPEX',                 'S?.cashFlow?.capex',          { indent: true, sign: true })}
            <tr class="border-t border-gray-100">
              <td class="sticky left-0 bg-white z-10 px-3 py-1.5 whitespace-nowrap border-r border-gray-200 text-gray-700">Opening Cash + Commitments</td>
              <template x-if="S?.hasHistorical">
                <td class="px-3 py-1.5 text-right whitespace-nowrap font-mono text-gray-300">—</td>
              </template>
              <td class="px-3 py-1.5 text-right whitespace-nowrap font-mono text-gray-800"
                  x-text="window._pfFmtC(S?.cashFlow?.openingCash || 0, true)"></td>
              <td colspan="20"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Cash Needs — single-figure summary block -->
      <div class="mt-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-2">Cash Needs</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" x-data="{ S: getProformaSummary() }" x-effect="S = getProformaSummary()">
          <div class="border border-emerald-200 rounded-lg p-3 bg-emerald-50">
            <p class="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Total Cash to Break Even</p>
            <p class="text-lg font-semibold text-gray-900" x-text="window._pfFmtC(S?.cashNeeds?.totalCashToBreakEven || 0, true)"></p>
          </div>
          <div class="border border-gray-200 rounded-lg p-3">
            <p class="text-[10px] uppercase tracking-wide text-gray-500 mb-1">CapEx Cash to Break Even</p>
            <p class="text-lg font-semibold text-gray-900" x-text="window._pfFmtC(S?.cashNeeds?.capexToBreakEven || 0, true)"></p>
          </div>
          <div class="border border-gray-200 rounded-lg p-3">
            <p class="text-[10px] uppercase tracking-wide text-gray-500 mb-1">OpEx Cash to Break Even</p>
            <p class="text-lg font-semibold text-gray-900" x-text="window._pfFmtC(S?.cashNeeds?.opexToBreakEven || 0, true)"></p>
          </div>
          <div class="border border-gray-200 rounded-lg p-3">
            <p class="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Break Even</p>
            <p class="text-lg font-semibold text-gray-900"
               x-text="(S?.cashNeeds?.breakEvenMonth >= 0) ? 'Month ' + S.cashNeeds.breakEvenMonth : 'Not reached'"></p>
          </div>
        </div>
      </div>
    </div>

    <div x-show="!proformaComputed" class="text-center py-12 text-gray-400 text-sm">
      No computed data available.
    </div>

    </div>
  `;
}
