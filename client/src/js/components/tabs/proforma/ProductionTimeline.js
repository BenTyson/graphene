// Shared <thead>: year-group banner + monthly columns with Y{n} Total
// columns interleaved after every 12 months. Single header for both the
// gantt section and the data section so they share scroll & alignment.
function _header() {
  return `
    <thead class="sticky top-0 z-20">
      <tr class="bg-gray-100 border-b border-gray-300">
        <th class="sticky left-0 bg-gray-100 z-30 px-3 py-1 border-r border-gray-200 w-44 min-w-[176px]"></th>
        <template x-for="yr in [0,1,2,3,4]" :key="yr">
          <th colspan="13"
              class="py-1.5 px-3 text-center text-[11px] font-semibold text-gray-600 tracking-wide"
              :class="yr > 0 ? 'border-l-2 border-gray-400' : ''"
              x-text="'Year ' + yr">
          </th>
        </template>
      </tr>
      <tr class="bg-gray-50">
        <th class="sticky left-0 bg-gray-50 z-30 px-3 py-2 text-left text-gray-600 font-medium w-44 min-w-[176px] border-r border-gray-200">Line</th>
        <template x-for="i in 65" :key="i">
          <th class="py-2 text-right whitespace-nowrap"
              :class="i % 13 === 0
                ? 'px-3 min-w-[90px] bg-gray-100 text-gray-700 font-semibold border-x-2 border-gray-400'
                : 'px-2 min-w-[80px] text-gray-500 font-medium'"
              x-text="i % 13 === 0
                ? 'Y' + Math.floor((i-1)/13) + ' Total'
                : 'Y' + Math.floor((i-1)/13) + ' M' + ((i-1) % 13 + 1)">
          </th>
        </template>
      </tr>
    </thead>
  `;
}

// A section-divider row spanning all columns. Used to label the Gantt
// block and the Data block inside the unified table.
function _sectionDivider(label, withTopBorder = false) {
  return `
    <tr class="${withTopBorder ? 'border-t-2 border-gray-300' : ''} bg-gray-100">
      <td colspan="66" class="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-700">${label}</td>
    </tr>
  `;
}

export function getProductionTimelineHtml() {
  return `
    <div>
      <div x-show="proformaComputed" class="overflow-auto border border-gray-200 rounded-lg max-h-[calc(100vh-220px)]">
        <table class="text-xs">
          ${_header()}
          <tbody>

            <!-- ───────── Machine Timeline (Gantt) ───────── -->
            ${_sectionDivider('Machine Timeline')}
            <template x-for="(row, ri) in getProformaGanttRows()" :key="'g_' + ri">
              <tr class="border-t border-gray-100">
                <td class="sticky left-0 z-10 bg-white px-3 py-1.5 whitespace-nowrap border-r border-gray-200 w-44 min-w-[176px]">
                  <div class="flex items-center gap-1.5">
                    <span class="text-gray-800 font-medium" x-text="row.name"></span>
                    <span class="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
                          x-text="row.type"></span>
                  </div>
                </td>
                <!-- 60 monthly + 5 yearly-total cells, interleaved -->
                <template x-for="i in 65" :key="i">
                  <template x-if="i % 13 !== 0">
                    <td class="relative p-0 min-w-[80px]"
                        :class="((i - Math.floor((i-1)/13) - 1) >= row.productionStart) ? 'bg-emerald-100' :
                                ((i - Math.floor((i-1)/13) - 1) >= row.validationStart) ? 'bg-amber-200' :
                                ((i - Math.floor((i-1)/13) - 1) >= row.constructionStart) ? 'bg-slate-200' : 'bg-white'"
                        style="height:28px;">
                      <template x-if="row.paymentAmounts[i - Math.floor((i-1)/13) - 1]">
                        <span class="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-slate-700 leading-none"
                              x-text="window._pfFmtC(row.paymentAmounts[i - Math.floor((i-1)/13) - 1], false)">
                        </span>
                      </template>
                    </td>
                  </template>
                  <template x-if="i % 13 === 0">
                    <td class="px-3 py-1.5 text-right whitespace-nowrap font-mono text-[11px] font-semibold bg-gray-100 text-gray-700 border-x-2 border-gray-400"
                        x-text="(row.yearlyCapex[Math.floor((i-1)/13)] || 0) > 0 ? window._pfFmtC(row.yearlyCapex[Math.floor((i-1)/13)], false) : ''">
                    </td>
                  </template>
                </template>
              </tr>
            </template>

            <!-- ───────── Production Detail (data table) ───────── -->
            ${_sectionDivider('Production Detail', true)}
            <template x-for="(row, ri) in getProformaProductionRows()" :key="row.key">
              <tr x-show="!row.child || !proformaProductionCollapsed[row.parentKey]"
                  :class="{
                    'border-t border-gray-300 bg-gray-50': row.bold || row.category,
                    'border-t border-gray-100': !row.bold && !row.category && !row.child,
                    'border-t border-gray-50': row.child,
                    'cursor-pointer hover:bg-gray-100': row.category
                  }"
                  @click="row.category && (proformaProductionCollapsed[row.key] = !proformaProductionCollapsed[row.key])">
                <td class="sticky left-0 z-10 px-3 py-1.5 whitespace-nowrap border-r border-gray-200 w-44 min-w-[176px]"
                    :class="row.bold ? 'bg-gray-50 text-gray-900 font-semibold'
                            : row.child ? 'bg-white text-gray-500 pl-8'
                            : row.category ? 'bg-gray-50 text-gray-700 font-medium'
                            : 'bg-white text-gray-700'">
                  <span class="flex items-center gap-1.5">
                    <template x-if="row.category">
                      <svg :class="proformaProductionCollapsed[row.key] ? '' : 'rotate-90'"
                           class="w-3 h-3 text-gray-400 transition-transform"
                           fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                    </template>
                    <span x-text="row.label"></span>
                    <!-- Unit chip identifies kg rows once; cells stay numeric. -->
                    <template x-if="row.isKg">
                      <span class="text-[9px] uppercase tracking-wide px-1 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">kg</span>
                    </template>
                  </span>
                </td>
                <template x-for="(item, vi) in row.displayData" :key="vi">
                  <td class="py-1.5 text-right whitespace-nowrap font-mono"
                      :class="item.isTotal ? [
                        'px-3 border-x-2 border-gray-400 font-semibold',
                        (row.bold || row.category) ? 'bg-gray-300' : 'bg-gray-100',
                        (item.val != null && item.val < 0) ? 'text-red-600'
                          : (row.bold ? 'text-green-700' : 'text-gray-800')
                      ] : [
                        'px-2',
                        (item.val != null && item.val < 0) ? 'text-red-600'
                          : row.bold ? 'text-gray-900 font-semibold'
                          : row.child ? 'text-gray-500'
                          : 'text-gray-700',
                        (row.bold || row.category) ? 'font-semibold' : ''
                      ]">
                    <template x-if="row.isCostPerKg">
                      <span x-text="item.val == null ? '—' : '$' + Math.round(item.val).toLocaleString()"></span>
                    </template>
                    <template x-if="row.isKg">
                      <span x-text="Math.abs(item.val || 0) < 1 ? '' : Math.round(item.val).toLocaleString()"></span>
                    </template>
                    <template x-if="!row.isCostPerKg && !row.isKg && !row.category">
                      <span x-text="(item.val == null || item.val === 0) ? '' : window._pfFmtC(item.val, item.isTotal)"></span>
                    </template>
                    <template x-if="row.category">
                      <span></span>
                    </template>
                  </td>
                </template>
              </tr>
            </template>

          </tbody>
        </table>
      </div>

      <div x-show="!proformaComputed" class="text-center py-12 text-gray-400 text-sm">
        No computed data. Save or load a scenario to see the production timeline.
      </div>
    </div>
  `;
}
