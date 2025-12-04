/**
 * Graphene Tab Component - THE FINAL BOSS
 * 
 * Provides the most complex interface in the entire system including:
 * - Header with title and action buttons (Export CSV, Add Record)
 * - Search functionality for experiments, biochar source, species
 * - Advanced filter panel with dynamic field generation and active filter tracking
 * - Complex data table with extensive column structure and sorting
 * - Expandable rows with comprehensive related data sections using component helpers
 * - Mobile-responsive card layout with simplified test result summaries
 * - Empty state display
 * 
 * Dependencies:
 * - Alpine.js data: activeTab, grapheneRecords, grapheneSearch, grapheneFilterState, expandedGrapheneRows, grapheneRelatedData
 * - Alpine.js methods: exportData, searchGraphene, sortGraphene, toggleGrapheneExpansion, copyGraphene, editGraphene, deleteGraphene
 * - Filter system: generateFilterFields, getActiveFilterCount, clearAllFilters, applyFilters
 * - Component helpers: getSourceDataSectionHtml, getTestResultsSectionHtml, getReportsSectionHtml, getShipmentsSectionHtml, getObjectivesSectionHtml
 * - Global functions: formatDate, formatAppearanceTags, calculateOutputPercentage, getSortIcon, viewSemReport, openPDFModal
 * - Modal triggers: showAddGraphene
 * - Form initialization: grapheneForm reset with extensive field structure
 */

/**
 * Returns the complete HTML for the Graphene tab component
 * @returns {string} HTML string for the Graphene tab
 */
function getGrapheneTabHtml() {
  return `
    <!-- Graphene Tab -->
    <div x-show="activeTab === 'graphene'" x-cloak>
      <div class="mb-6 flex justify-between items-center">
        <h2 class="text-xl font-semibold">Graphene Production Records</h2>
        <div class="flex space-x-2">
          <button @click="exportData('graphene')" class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 touch-target">
            Export CSV
          </button>
          <button x-show="canEdit()" @click="grapheneForm = {experimentNumber: '', titleNote: '', testOrder: '', experimentDate: '', dateUnknown: false, researchTeam: 'Curia - Germany', oven: '', quantity: '', biocharExperiment: '', biocharLotNumber: '', biocharSource: '', baseAmount: '', baseType: '', baseConcentration: '', base2Amount: '', base2Type: '', base2Concentration: '', grindingMethod: '', grindingCount: '', grindingTime: '', grindingFrequency: '', homogeneous: '', gas: '', tempRate: '', tempMax: '', time: '', washAmount: '', washSolution: '', washConcentration: '', washWater: '', dryingTemp: '', dryingAtmosphere: '', dryingPressure: 'atm. Pressure', volumeMl: '', density: '', species: '', appearanceTags: [], semReportFile: null, removeSemReport: false, replaceSemReport: false, output: '', comments: ''}; editingGraphene = null; showAddGraphene = true" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 touch-target">
            Add Record
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <input
          type="text"
          x-model="grapheneSearch"
          @input="searchGraphene()"
          placeholder="Search experiments, biochar source, species..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        >
      </div>

      <!-- Filters Row -->
      <div class="mb-4 flex flex-wrap items-center gap-4">
        <!-- Species Filter -->
        <div class="flex items-center space-x-2">
          <span class="text-sm font-medium text-gray-700">Species:</span>
          <div class="inline-flex rounded-md shadow-sm">
            <button @click="grapheneSpeciesFilter = 'all'; loadGrapheneRecords()"
                    :class="grapheneSpeciesFilter === 'all' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
                    class="px-4 py-2 text-sm font-medium border border-gray-300 rounded-l-md transition-colors">
              All
            </button>
            <button @click="grapheneSpeciesFilter = 'species1'; loadGrapheneRecords()"
                    :class="grapheneSpeciesFilter === 'species1' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
                    class="px-4 py-2 text-sm font-medium border-t border-b border-gray-300 -ml-px transition-colors">
              Species 1 (KOH only)
            </button>
            <button @click="grapheneSpeciesFilter = 'species2'; loadGrapheneRecords()"
                    :class="grapheneSpeciesFilter === 'species2' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
                    class="px-4 py-2 text-sm font-medium border border-gray-300 rounded-r-md -ml-px transition-colors">
              Species 2 (KOH + NaOH)
            </button>
          </div>
        </div>

        <!-- Divider -->
        <div class="h-8 w-px bg-gray-300"></div>

        <!-- Tested Filter -->
        <div class="flex items-center space-x-2">
          <span class="text-sm font-medium text-gray-700">Tested:</span>
          <div class="inline-flex rounded-md shadow-sm">
            <button @click="toggleTestedFilter('bet'); loadGrapheneRecords()"
                    :class="grapheneTestedFilters.includes('bet') ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
                    class="px-4 py-2 text-sm font-medium border border-gray-300 rounded-l-md transition-colors">
              BET
            </button>
            <button @click="toggleTestedFilter('conductivity'); loadGrapheneRecords()"
                    :class="grapheneTestedFilters.includes('conductivity') ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
                    class="px-4 py-2 text-sm font-medium border-t border-b border-gray-300 -ml-px transition-colors">
              Conductivity
            </button>
            <button @click="toggleTestedFilter('raman'); loadGrapheneRecords()"
                    :class="grapheneTestedFilters.includes('raman') ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
                    class="px-4 py-2 text-sm font-medium border border-gray-300 rounded-r-md -ml-px transition-colors">
              RAMAN
            </button>
          </div>
        </div>
      </div>

      <!-- Graphene Table - Desktop -->
      <div class="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <!-- Main Header Row -->
            <tr class="bg-gray-100">
              <th rowspan="2" class="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                <button @click="sortGraphene('testOrder')" class="flex items-center hover:text-gray-800">
                  Order
                  <span x-html="getSortIcon('testOrder')"></span>
                </button>
              </th>
              <th rowspan="2" class="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                <button @click="sortGraphene('experimentNumber')" class="flex items-center hover:text-gray-800">
                  Exp #
                  <span x-html="getSortIcon('experimentNumber')"></span>
                </button>
              </th>
              <th rowspan="2" class="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                <button @click="sortGraphene('experimentDate')" class="flex items-center hover:text-gray-800">
                  Date
                  <span x-html="getSortIcon('experimentDate')"></span>
                </button>
              </th>
              <th rowspan="2" class="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                <button @click="sortGraphene('oven')" class="flex items-center hover:text-gray-800">
                  Oven
                  <span x-html="getSortIcon('oven')"></span>
                </button>
              </th>
              <th rowspan="2" class="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                <button @click="sortGraphene('quantity')" class="flex items-center hover:text-gray-800">
                  Qty (g)
                  <span x-html="getSortIcon('quantity')"></span>
                </button>
              </th>
              <th rowspan="2" class="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                <button @click="sortGraphene('biocharExperiment')" class="flex items-center hover:text-gray-800">
                  Biochar
                  <span x-html="getSortIcon('biocharExperiment')"></span>
                </button>
              </th>
              <th colspan="4" class="px-2 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">Base</th>
              <th colspan="4" class="px-2 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">Grinding</th>
              <th rowspan="2" class="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">Homog.</th>
              <th rowspan="2" class="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">Gas</th>
              <th colspan="3" class="px-2 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">Temperature</th>
              <th colspan="4" class="px-2 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">Wash</th>
              <th colspan="3" class="px-2 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">Drying</th>
              <th colspan="4" class="px-2 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">Results</th>
              <th rowspan="2" class="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                <button @click="sortGraphene('species')" class="flex items-center hover:text-gray-800">
                  Species
                  <span x-html="getSortIcon('species')"></span>
                </button>
              </th>
              <th rowspan="2" class="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">Appearance</th>
              <th rowspan="2" class="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
            <!-- Sub-Header Row -->
            <tr class="bg-gray-50">
              <!-- Base sub-headers -->
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Amt</th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Type</th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">NaOH%</th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">Conc%</th>
              <!-- Grinding sub-headers -->
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Method</th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                <button @click="sortGraphene('grindingCount')" class="flex items-center hover:text-gray-700">
                  # Grinds
                  <span x-html="getSortIcon('grindingCount')"></span>
                </button>
              </th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Time</th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">Freq</th>
              <!-- Temperature sub-headers -->
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                <button @click="sortGraphene('tempRate')" class="flex items-center hover:text-gray-700">
                  Rate
                  <span x-html="getSortIcon('tempRate')"></span>
                </button>
              </th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                <button @click="sortGraphene('tempMax')" class="flex items-center hover:text-gray-700">
                  Max
                  <span x-html="getSortIcon('tempMax')"></span>
                </button>
              </th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                <button @click="sortGraphene('time')" class="flex items-center hover:text-gray-700">
                  Time
                  <span x-html="getSortIcon('time')"></span>
                </button>
              </th>
              <!-- Wash sub-headers -->
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Amt</th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Sol.</th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Conc%</th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">Water</th>
              <!-- Drying sub-headers -->
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Temp</th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Atm.</th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">Press.</th>
              <!-- Results sub-headers -->
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                <button @click="sortGraphene('volumeMl')" class="flex items-center hover:text-gray-700">
                  Vol(ml)
                  <span x-html="getSortIcon('volumeMl')"></span>
                </button>
              </th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Dens.</th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                <button @click="sortGraphene('output')" class="flex items-center hover:text-gray-700">
                  Out(g)
                  <span x-html="getSortIcon('output')"></span>
                </button>
              </th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">Out%</th>
            </tr>
          </thead>
          <!-- Each record gets its own tbody containing both main and expandable rows -->
          <template x-for="record in grapheneRecords" :key="record.id">
            <tbody class="bg-white divide-y divide-gray-200">
              <tr class="hover:bg-gray-50">
                <!-- Basic info -->
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="record.testOrder || '-'"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200">
                  <button 
                    @click="routerService.navigateToDataPage('graphene', record.experimentNumber)" 
                    class="text-link text-link-hover underline cursor-pointer">
                    <span x-text="record.experimentNumber" class="font-bold"></span>
                    <span x-show="record.titleNote" x-text="' ' + record.titleNote" class="text-gray-600"></span>
                  </button>
                </td>
                <td class="px-2 py-2 text-xs border-r border-gray-200" x-text="window.formatDateSafe(record.experimentDate)"></td>
                <td class="px-2 py-2 text-xs border-r border-gray-200" x-text="record.oven"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="record.quantity ? record.quantity + 'g' : ''"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-300">
                  <span x-text="record.biocharExperiment || (record.biocharLotNumber ? 'LOT: ' + record.biocharLotNumber : (!record.biocharExperiment && !record.biocharLotNumber ? 'Various' : ''))"
                        :class="{'text-link font-semibold': record.biocharLotNumber, 'text-gray-500 italic': !record.biocharExperiment && !record.biocharLotNumber}"></span>
                </td>
                
                <!-- Base columns -->
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200">
                  <span x-text="record.baseAmount ? record.baseAmount + 'g' : ''"></span>
                  <span x-show="record.base2Amount" x-text="' + ' + record.base2Amount + 'g'" class="text-gray-500"></span>
                </td>
                <td class="px-2 py-2 text-xs border-r border-gray-200">
                  <span x-text="record.baseType"></span>
                  <span x-show="record.base2Type" x-text="' + ' + record.base2Type" class="text-gray-500"></span>
                </td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200">
                  <span x-text="(() => {
                    const baseAmt = parseFloat(record.baseAmount) || 0;
                    const base2Amt = parseFloat(record.base2Amount) || 0;
                    const totalBase = baseAmt + base2Amt;
                    if (totalBase === 0) return '0%';
                    if (record.base2Type === 'NaOH') {
                      return ((base2Amt / totalBase) * 100).toFixed(1) + '%';
                    } else if (record.baseType === 'NaOH') {
                      return base2Amt > 0 ? ((baseAmt / totalBase) * 100).toFixed(1) + '%' : '100%';
                    }
                    return '0%';
                  })()"></span>
                </td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-300">
                  <span x-text="record.baseConcentration ? record.baseConcentration + '%' : ''"></span>
                  <span x-show="record.base2Concentration" x-text="' + ' + record.base2Concentration + '%'" class="text-gray-500"></span>
                </td>
                <!-- Grinding columns -->
                <td class="px-2 py-2 text-xs border-r border-gray-200" x-text="record.grindingMethod"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="record.grindingCount || ''"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="record.grindingTime ? record.grindingTime + 'min' : ''"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-300" x-text="record.grindingFrequency ? record.grindingFrequency + 'Hz' : ''"></td>
                <!-- Homogeneous -->
                <td class="px-2 py-2 text-xs border-r border-gray-300" x-text="record.homogeneous !== null ? (record.homogeneous ? 'Yes' : 'No') : ''"></td>
                <!-- Gas -->
                <td class="px-2 py-2 text-xs border-r border-gray-300" x-text="record.gas"></td>
                <!-- Temperature columns -->
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="record.tempRate ? record.tempRate + '°C/min' : ''"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="record.tempMax ? record.tempMax + '°C' : ''"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-300" x-text="record.time ? record.time + 'hr' : ''"></td>
                <!-- Wash columns -->
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="record.washAmount ? record.washAmount + 'g' : ''"></td>
                <td class="px-2 py-2 text-xs border-r border-gray-200" x-text="record.washSolution"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="record.washConcentration ? record.washConcentration + '%' : ''"></td>
                <td class="px-2 py-2 text-xs border-r border-gray-300" x-text="record.washWater"></td>
                <!-- Drying columns -->
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="record.dryingTemp ? record.dryingTemp + '°C' : ''"></td>
                <td class="px-2 py-2 text-xs border-r border-gray-200" x-text="record.dryingAtmosphere"></td>
                <td class="px-2 py-2 text-xs border-r border-gray-300" x-text="record.dryingPressure"></td>
                <!-- Results columns -->
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="record.volumeMl ? record.volumeMl + 'ml' : ''"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="(record.volumeMl && record.output) ? (record.volumeMl / record.output).toFixed(2) + ' ml/g' : ''"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="record.output ? record.output + 'g' : ''"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-300" x-text="calculateOutputPercentage(record)"></td>
                <!-- Species & Appearance -->
                <td class="px-2 py-2 text-xs border-r border-gray-300" x-text="record.species"></td>
                <td class="px-2 py-2 text-xs border-r border-gray-300" x-text="formatAppearanceTags(record.appearanceTags)"></td>
                <!-- Actions -->
                <td class="px-2 py-2 text-xs">
                  <div class="flex items-center space-x-1">
                    <template x-if="record.comments">
                      <div class="relative group">
                        <svg class="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                        </svg>
                        <div class="absolute bottom-full left-0 mb-1 hidden group-hover:block z-10 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                          <span x-text="record.comments"></span>
                        </div>
                      </div>
                    </template>
                    <button x-show="record.semReportPath" @click="viewSemReport(record.semReportPath)" class="text-link hover:text-link-hover" title="View SEM Report">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </button>
                    <button @click="copyGraphene(record)" class="text-gray-400 hover:text-gray-600" title="Copy">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    </button>
                    <button x-show="canEdit()" @click="editGraphene(record)" class="text-link hover:text-link-hover" title="Edit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button x-show="canEdit()" @click="deleteGraphene(record.id)" class="text-red-400 hover:text-red-600" title="Delete">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              
              <!-- Expandable Related Data Row - Directly below the main row -->
              <tr x-show="expandedGrapheneRows[record.experimentNumber]" 
                  x-transition:enter="transition ease-out duration-200"
                  x-transition:enter-start="opacity-0 transform scale-95"
                  x-transition:enter-end="opacity-100 transform scale-100"
                  x-transition:leave="transition ease-in duration-150"
                  x-transition:leave-start="opacity-100 transform scale-100"
                  x-transition:leave-end="opacity-0 transform scale-95"
                  class="bg-gray-50">
                <td colspan="29" class="px-4 py-4">
                  <div class="bg-white border border-gray-300 rounded-lg p-4 space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Material Journey: <span class="font-mono text-black" x-text="record.experimentNumber"></span>
                      <span x-show="record.titleNote" x-text="record.titleNote" class="text-gray-600 font-normal"></span>
                    </h3>
                    
                    <template x-if="loadingGrapheneRelated[record.experimentNumber]">
                      <div class="text-center py-4">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p class="mt-2 text-gray-600">Loading related data...</p>
                      </div>
                    </template>
                    
                    <template x-if="!loadingGrapheneRelated[record.experimentNumber] && grapheneRelatedData[record.experimentNumber]">
                      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Source Biochar Data -->
                        <div x-html="getSourceDataSectionHtml({
                          dataPath: 'grapheneRelatedData[record.experimentNumber]'
                        })"></div>
                        
                        <!-- BET Test Results -->
                        <div x-html="getTestResultsSectionHtml({
                          testType: 'bet',
                          dataPath: 'grapheneRelatedData[record.experimentNumber].betTests'
                        })"></div>
                        
                        <!-- Conductivity Test Results -->
                        <div x-html="getTestResultsSectionHtml({
                          testType: 'conductivity',
                          dataPath: 'grapheneRelatedData[record.experimentNumber].conductivityTests'
                        })"></div>
                        
                        <!-- RAMAN Analysis Results -->
                        <div x-html="getTestResultsSectionHtml({
                          testType: 'raman',
                          dataPath: 'grapheneRelatedData[record.experimentNumber].ramanTests'
                        })"></div>
                        
                        <!-- Update Reports -->
                        <div x-html="getReportsSectionHtml({
                          reportType: 'update',
                          dataPath: 'record.updateReports'
                        })"></div>
                        
                        <!-- SEM Reports -->
                        <div x-html="getReportsSectionHtml({
                          reportType: 'sem',
                          dataPath: 'record.semReports',
                          record: 'record'
                        })"></div>
                        
                        <!-- Shipment History -->
                        <div x-html="getShipmentsSectionHtml({
                          dataPath: 'grapheneRelatedData[record.experimentNumber].shipments',
                          materialType: 'graphene'
                        })"></div>
                        
                        <!-- Experiment Objective & Results -->
                        <div x-html="getObjectivesSectionHtml({
                          sectionType: 'objectives',
                          record: 'record'
                        })"></div>
                        
                        <!-- Compound Batch Information -->
                        <div x-html="getObjectivesSectionHtml({
                          sectionType: 'compound-batches',
                          dataPath: 'grapheneRelatedData[record.experimentNumber]'
                        })"></div>
                      </div>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </template>
        </table>
      </div>

      <!-- Graphene Cards - Mobile -->
      <div class="md:hidden space-y-3">
        <template x-for="record in grapheneRecords" :key="record.id">
          <div class="mobile-card">
            <div class="mobile-card-header">
              <div class="flex items-center justify-between">
                <button 
                  @click="routerService.navigateToDataPage('graphene', record.experimentNumber)" 
                  class="text-link text-link-hover underline font-bold touch-target"
                  x-text="'Exp #' + record.experimentNumber">
                </button>
                <span class="text-xs text-gray-500" x-text="window.formatDateSafe(record.experimentDate)"></span>
              </div>
            </div>
            
            <div class="space-y-2">
              <div class="mobile-card-row">
                <span class="mobile-card-label">Order:</span>
                <span class="mobile-card-value" x-text="record.testOrder || '-'"></span>
              </div>
              <div class="mobile-card-row">
                <span class="mobile-card-label">Oven:</span>
                <span class="mobile-card-value" x-text="record.oven || '-'"></span>
              </div>
              <div class="mobile-card-row">
                <span class="mobile-card-label">Quantity:</span>
                <span class="mobile-card-value" x-text="record.quantity ? record.quantity + 'g' : '-'"></span>
              </div>
              <div class="mobile-card-row">
                <span class="mobile-card-label">Biochar:</span>
                <span class="mobile-card-value" x-text="record.biocharExperiment || record.biocharLotNumber || '-'"></span>
              </div>
              <div class="mobile-card-row">
                <span class="mobile-card-label">Species:</span>
                <span class="mobile-card-value" x-text="record.species || '-'"></span>
              </div>
              <div class="mobile-card-row">
                <span class="mobile-card-label">Base:</span>
                <span class="mobile-card-value" x-text="record.baseType ? (record.baseAmount + 'g ' + record.baseType + ' ' + record.baseConcentration + '%') : '-'"></span>
              </div>
              <div class="mobile-card-row" x-show="record.base2Type">
                <span class="mobile-card-label">Base 2:</span>
                <span class="mobile-card-value" x-text="record.base2Type ? (record.base2Amount + 'g ' + record.base2Type + ' ' + record.base2Concentration + '%') : '-'"></span>
              </div>
              <div class="mobile-card-row" x-show="record.baseType || record.base2Type">
                <span class="mobile-card-label">NaOH %:</span>
                <span class="mobile-card-value" x-text="(() => {
                  const baseAmt = parseFloat(record.baseAmount) || 0;
                  const base2Amt = parseFloat(record.base2Amount) || 0;
                  const totalBase = baseAmt + base2Amt;
                  if (totalBase === 0) return '0%';
                  if (record.base2Type === 'NaOH') {
                    return ((base2Amt / totalBase) * 100).toFixed(1) + '%';
                  } else if (record.baseType === 'NaOH') {
                    return base2Amt > 0 ? ((baseAmt / totalBase) * 100).toFixed(1) + '%' : '100%';
                  }
                  return '0%';
                })()"></span>
              </div>
              <div class="mobile-card-row">
                <span class="mobile-card-label">Temperature:</span>
                <span class="mobile-card-value" x-text="record.tempMax ? record.tempMax + '°C' : '-'"></span>
              </div>
              <div class="mobile-card-row">
                <span class="mobile-card-label">Time:</span>
                <span class="mobile-card-value" x-text="record.time ? record.time + 'min' : '-'"></span>
              </div>
              <div class="mobile-card-row">
                <span class="mobile-card-label">Output:</span>
                <span class="mobile-card-value" x-text="record.output ? record.output + 'g' : '-'"></span>
              </div>
              <div x-show="record.appearance && record.appearance.length > 0" class="mobile-card-row">
                <span class="mobile-card-label">Appearance:</span>
                <span class="mobile-card-value" x-text="Array.isArray(record.appearance) ? record.appearance.join(', ') : record.appearance"></span>
              </div>
            </div>
            
            <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
              <div class="flex items-center space-x-2">
                <template x-if="record.comments">
                  <button class="text-gray-400 hover:text-gray-600 touch-target" 
                          @click="showTooltip = showTooltip === record.id ? null : record.id">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                    </svg>
                  </button>
                </template>
                <template x-if="record.semReportPath">
                  <button @click="openPDFModal(record.semReportPath, 'SEM Report')" 
                          class="text-gray-400 hover:text-gray-600 touch-target"
                          title="View SEM PDF">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </button>
                </template>
              </div>
              <div class="flex space-x-1">
                <button @click="copyGraphene(record)" class="px-3 py-2 text-xs text-link hover:text-link-hover bg-gray-50 rounded touch-target">Copy</button>
                <button x-show="canEdit()" @click="editGraphene(record)" class="px-3 py-2 text-xs text-gray-600 hover:text-gray-900 bg-gray-50 rounded touch-target">Edit</button>
                <button x-show="canEdit()" @click="deleteGraphene(record.id)" class="px-3 py-2 text-xs text-red-600 hover:text-red-900 bg-red-50 rounded touch-target">Delete</button>
              </div>
            </div>
            
            <!-- Comments tooltip for mobile -->
            <div x-show="showTooltip === record.id && record.comments" 
                 x-transition
                 class="mt-2 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
              <span x-text="record.comments"></span>
            </div>
            
            <!-- Expandable content for mobile -->
            <div x-show="expandedGrapheneRows[record.experimentNumber]" 
                 x-transition
                 class="mt-4 pt-4 border-t border-gray-200">
              <div class="bg-gray-50 p-3 rounded">
                <h4 class="text-sm font-semibold text-gray-900 mb-2">Test Results & Reports</h4>
                
                <div x-show="loadingGrapheneRelated[record.experimentNumber]" class="text-center text-gray-500 py-4">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  <p class="mt-2 text-xs">Loading...</p>
                </div>
                
                <div x-show="!loadingGrapheneRelated[record.experimentNumber] && grapheneRelatedData[record.experimentNumber]" class="text-xs">
                  <!-- Simplified test results for mobile -->
                  <div x-show="grapheneRelatedData[record.experimentNumber] && grapheneRelatedData[record.experimentNumber].betTests && grapheneRelatedData[record.experimentNumber].betTests.length > 0">
                    <h5 class="font-medium text-gray-700 mb-1">BET Tests:</h5>
                    <template x-for="test in (grapheneRelatedData[record.experimentNumber] && grapheneRelatedData[record.experimentNumber].betTests) || []" :key="test.id">
                      <div class="mb-1 text-gray-600">
                        <span x-text="window.formatDateSafe(test.testDate)"></span> - 
                        <span x-text="test.multipointBetArea ? test.multipointBetArea + ' m²/g' : 'No data'"></span>
                      </div>
                    </template>
                  </div>
                  
                  <div x-show="grapheneRelatedData[record.experimentNumber] && grapheneRelatedData[record.experimentNumber].conductivityTests && grapheneRelatedData[record.experimentNumber].conductivityTests.length > 0" class="mt-2">
                    <h5 class="font-medium text-gray-700 mb-1">Conductivity Tests:</h5>
                    <template x-for="test in (grapheneRelatedData[record.experimentNumber] && grapheneRelatedData[record.experimentNumber].conductivityTests) || []" :key="test.id">
                      <div class="mb-1 text-gray-600">
                        <span x-text="window.formatDateSafe(test.testDate)"></span> - 
                        <span x-text="test.conductivity20kN || 'No data'"></span>
                      </div>
                    </template>
                  </div>
                  
                  <div x-show="grapheneRelatedData[record.experimentNumber] && grapheneRelatedData[record.experimentNumber].ramanTests && grapheneRelatedData[record.experimentNumber].ramanTests.length > 0" class="mt-2">
                    <h5 class="font-medium text-gray-700 mb-1">RAMAN Tests:</h5>
                    <template x-for="test in (grapheneRelatedData[record.experimentNumber] && grapheneRelatedData[record.experimentNumber].ramanTests) || []" :key="test.id">
                      <div class="mb-1 text-gray-600">
                        <span x-text="window.formatDateSafe(test.testDate)"></span> - 
                        <span x-text="test.testingLab || 'Lab data'"></span>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Empty State -->
      <div x-show="grapheneRecords.length === 0" class="text-center py-8 text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
        </svg>
        <p>No graphene records found</p>
      </div>
    </div>
  `;
}

// Export for use in the main application
export { getGrapheneTabHtml };