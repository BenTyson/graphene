/**
 * Test Matrix Tab Component
 *
 * A matrix of the characterization / QC tests required for each application
 * (industry + use-case) of our material. Rows = applications, columns =
 * tests, cells = requirement level (Required / Recommended / Optional).
 *
 * Data source: client/src/js/data/testMatrix.js (code-defined, curated in git).
 *
 * Alpine dependencies (defined in app-refactored.js):
 *   State   : testMatrixSearch, testMatrixIndustryFilter, testMatrixMaterialFilter,
 *             testMatrixLevelFilter
 *   Methods : getTestMatrixTests(), getTestMatrixTestGroups(), getTestMatrixLevels(),
 *             getTestMatrixApplications() (filtered), getTestMatrixIndustries(),
 *             getTestMatrixMaterials(), getTestMatrixCell(app, testId),
 *             getTestMatrixCellClass(level), getTestMatrixRowStat(app),
 *             resetTestMatrixFilters()
 */

function getTestMatrixTabHtml() {
  return `
    <!-- Test Matrix Tab -->
    <div x-show="activeTab === 'test-matrix'" x-cloak>

      <!-- Intro -->
      <div class="mb-5">
        <h2 class="text-xl font-semibold text-gray-900">Test Matrix</h2>
        <p class="mt-1 text-sm text-gray-500 max-w-3xl">
          Which characterization &amp; QC tests each application requires. Rows are
          material + application; columns are tests. Use it to scope what must be run
          before our material can be used in a given industry.
        </p>
      </div>

      <!-- Controls: legend + filters -->
      <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <!-- Legend -->
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <template x-for="level in getTestMatrixLevels()" :key="level.id">
            <div class="flex items-center gap-1.5" :title="level.desc">
              <span class="w-2.5 h-2.5 rounded-full" :class="level.dotClass"></span>
              <span class="text-xs font-medium text-gray-600" x-text="level.label"></span>
            </div>
          </template>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full border border-gray-200 bg-white"></span>
            <span class="text-xs font-medium text-gray-400">Not evaluated</span>
          </div>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-2">
          <input type="text" x-model="testMatrixSearch" placeholder="Search…"
                 class="px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 w-40">
          <select x-model="testMatrixIndustryFilter"
                  class="px-2.5 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400">
            <option value="">All industries</option>
            <template x-for="ind in getTestMatrixIndustries()" :key="ind">
              <option :value="ind" x-text="ind"></option>
            </template>
          </select>
          <select x-model="testMatrixMaterialFilter"
                  class="px-2.5 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400">
            <option value="">All materials</option>
            <template x-for="mat in getTestMatrixMaterials()" :key="mat">
              <option :value="mat" x-text="mat"></option>
            </template>
          </select>
          <button x-show="testMatrixSearch || testMatrixIndustryFilter || testMatrixMaterialFilter"
                  @click="resetTestMatrixFilters()"
                  class="px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900">Clear</button>
        </div>
      </div>

      <!-- Matrix (desktop) -->
      <div class="hidden md:block border border-gray-200 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full border-collapse text-sm">
            <!-- Group header band -->
            <thead>
              <tr class="bg-gray-50">
                <th class="sticky left-0 z-20 bg-gray-50 border-b border-r border-gray-200 px-4 py-2 text-left align-bottom" rowspan="2">
                  <span class="text-xs font-semibold uppercase tracking-wide text-gray-500">Application</span>
                </th>
                <template x-for="grp in getTestMatrixTestGroups()" :key="grp.group">
                  <th :colspan="grp.tests.length"
                      class="border-b border-l border-gray-200 px-2 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap"
                      x-text="grp.group"></th>
                </template>
              </tr>
              <tr class="bg-gray-50">
                <template x-for="test in getTestMatrixTests()" :key="test.id">
                  <th class="border-b border-l border-gray-200 px-2 py-2 text-center align-bottom min-w-[64px]" :title="test.full">
                    <span class="text-xs font-semibold text-gray-700 whitespace-nowrap" x-text="test.label"></span>
                  </th>
                </template>
              </tr>
            </thead>
            <tbody>
              <template x-for="app in getTestMatrixApplications()" :key="app.id">
                <tr class="hover:bg-gray-50/70 transition-colors">
                  <!-- Application label (sticky) -->
                  <th class="sticky left-0 z-10 bg-white border-b border-r border-gray-200 px-4 py-2.5 text-left align-top min-w-[220px]">
                    <div class="flex items-start justify-between gap-2">
                      <div>
                        <div class="text-sm font-semibold text-gray-900" x-text="app.application"></div>
                        <div class="mt-0.5 text-xs text-gray-500">
                          <span x-text="app.material"></span>
                          <span class="text-gray-300"> · </span>
                          <span x-text="app.industry"></span>
                        </div>
                        <div x-show="app.notes" class="mt-1 text-[11px] leading-snug text-gray-400 max-w-[240px]" x-text="app.notes"></div>
                      </div>
                      <span class="shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500"
                            :title="getTestMatrixRowStat(app).required + ' required, ' + getTestMatrixRowStat(app).total + ' total'"
                            x-text="getTestMatrixRowStat(app).total ? getTestMatrixRowStat(app).required + '/' + getTestMatrixRowStat(app).total : '—'"></span>
                    </div>
                  </th>
                  <!-- Cells -->
                  <template x-for="test in getTestMatrixTests()" :key="test.id">
                    <td class="border-b border-l border-gray-100 p-1 text-center align-middle">
                      <template x-if="getTestMatrixCell(app, test.id)">
                        <div class="mx-auto w-full min-h-[2.25rem] rounded-md border flex flex-col items-center justify-center px-1 py-1 cursor-default"
                             :class="getTestMatrixCellClass(getTestMatrixCell(app, test.id).level)"
                             :title="getTestMatrixCellTooltip(app, test, getTestMatrixCell(app, test.id))">
                          <span class="text-[11px] font-semibold leading-none" x-text="getTestMatrixLevelShort(getTestMatrixCell(app, test.id).level)"></span>
                          <span x-show="getTestMatrixCell(app, test.id).target"
                                class="mt-0.5 text-[10px] leading-tight opacity-80" x-text="getTestMatrixCell(app, test.id).target"></span>
                        </div>
                      </template>
                      <template x-if="!getTestMatrixCell(app, test.id)">
                        <span class="text-gray-200 text-xs">·</span>
                      </template>
                    </td>
                  </template>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty state -->
      <div x-show="getTestMatrixApplications().length === 0" class="hidden md:block text-center py-12 text-sm text-gray-400 border border-gray-200 rounded-lg">
        No applications match the current filters.
      </div>

      <!-- Cards (mobile) -->
      <div class="md:hidden space-y-3">
        <template x-for="app in getTestMatrixApplications()" :key="app.id">
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="text-sm font-semibold text-gray-900" x-text="app.application"></div>
                <div class="mt-0.5 text-xs text-gray-500">
                  <span x-text="app.material"></span> · <span x-text="app.industry"></span>
                </div>
              </div>
              <span class="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500"
                    x-text="getTestMatrixRowStat(app).total ? getTestMatrixRowStat(app).required + '/' + getTestMatrixRowStat(app).total : '—'"></span>
            </div>
            <div x-show="app.notes" class="mt-1.5 text-xs text-gray-400" x-text="app.notes"></div>

            <div class="mt-3 flex flex-wrap gap-1.5">
              <template x-for="test in getTestMatrixTests()" :key="test.id">
                <template x-if="getTestMatrixCell(app, test.id)">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-medium"
                        :class="getTestMatrixCellClass(getTestMatrixCell(app, test.id).level)">
                    <span x-text="test.label"></span>
                    <span class="opacity-70" x-text="getTestMatrixLevelShort(getTestMatrixCell(app, test.id).level)"></span>
                  </span>
                </template>
              </template>
              <span x-show="getTestMatrixRowStat(app).total === 0" class="text-xs text-gray-400 italic">No tests defined yet</span>
            </div>
          </div>
        </template>
        <div x-show="getTestMatrixApplications().length === 0" class="text-center py-10 text-sm text-gray-400">
          No applications match the current filters.
        </div>
      </div>

    </div>
  `;
}

window.getTestMatrixTabHtml = getTestMatrixTabHtml;
