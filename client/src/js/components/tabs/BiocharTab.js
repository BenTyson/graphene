/**
 * Biochar Tab Component
 * 
 * Provides the biochar experiments interface including:
 * - Header with title and action buttons
 * - Search functionality
 * - Data table with sorting
 * - Expandable rows for material journey tracking
 * - Lot highlighting and management
 * - Mobile-responsive design
 */

function getBiocharTabHtml() {
  return `
    <!-- Biochar Tab -->
    <div x-show="activeTab === 'biochar'" x-cloak>
      <div class="mb-6 flex justify-between items-center">
        <h2 class="text-xl font-semibold">Biochar Production Records</h2>
        <div class="flex space-x-2">
          <button @click="exportData('biochar')" class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 touch-target">
            Export CSV
          </button>
          <button x-show="canEdit()" @click="showCombineModal = true" class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 touch-target"
                  :class="{'opacity-50 cursor-not-allowed': biocharRecords.length === 0}"
                  :disabled="biocharRecords.length === 0">
            Combine into Lot
          </button>
          <button x-show="canEdit()" @click="biocharForm = {experimentNumber: '', testOrder: '', experimentDate: '', dateUnknown: false, researchTeam: 'Curia - Germany', reactor: '', rawMaterial: '', startingAmount: '', acidAmount: '', acidConcentration: '', acidMolarity: '', acidType: '', temperature: '', time: '', pressureInitial: '', pressureFinal: '', washAmount: '', washMedium: '', output: '', dryingTemp: '', kftPercentage: '', comments: ''}; editingBiochar = null; showAddBiochar = true" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 touch-target">
            Add Record
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <input
          type="text"
          x-model="biocharSearch"
          @input="searchBiochar()"
          placeholder="Search experiments, materials..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        >
      </div>

      <!-- Biochar Table - Desktop -->
      <div class="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <!-- Main Header Row -->
            <tr class="bg-gray-100">
              <th rowspan="2" class="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">Select</th>
              <th colspan="4" class="px-2 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">Basic Info</th>
              <th colspan="2" class="px-2 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">Material</th>
              <th colspan="8" class="px-2 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">Process</th>
              <th colspan="5" class="px-2 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">Output</th>
              <th rowspan="2" class="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">Lot #</th>
              <th rowspan="2" class="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
            <!-- Sub-Header Row -->
            <tr class="bg-gray-50">
              <!-- Basic Info sub-headers -->
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                <button @click="sortBiochar('testOrder')" class="flex items-center hover:text-gray-700">
                  Order
                  <span x-html="getSortIcon('testOrder')"></span>
                </button>
              </th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                <button @click="sortBiochar('experimentNumber')" class="flex items-center hover:text-gray-700">
                  Exp #
                  <span x-html="getSortIcon('experimentNumber')"></span>
                </button>
              </th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                <button @click="sortBiochar('experimentDate')" class="flex items-center hover:text-gray-700">
                  Date
                  <span x-html="getSortIcon('experimentDate')"></span>
                </button>
              </th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                <button @click="sortBiochar('reactor')" class="flex items-center hover:text-gray-700">
                  Reactor
                  <span x-html="getSortIcon('reactor')"></span>
                </button>
              </th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                <button @click="sortBiochar('rawMaterial')" class="flex items-center hover:text-gray-700">
                  Raw Material
                  <span x-html="getSortIcon('rawMaterial')"></span>
                </button>
              </th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                <button @click="sortBiochar('startingAmount')" class="flex items-center hover:text-gray-700">
                  Start (g)
                  <span x-html="getSortIcon('startingAmount')"></span>
                </button>
              </th>
              <!-- Process sub-headers -->
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Acid Amt</th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Acid %</th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Molarity</th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Acid Type</th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                <button @click="sortBiochar('temperature')" class="flex items-center hover:text-gray-700">
                  Temp
                  <span x-html="getSortIcon('temperature')"></span>
                </button>
              </th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                <button @click="sortBiochar('time')" class="flex items-center hover:text-gray-700">
                  Time
                  <span x-html="getSortIcon('time')"></span>
                </button>
              </th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">P Initial</th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">P Final</th>
              <!-- Output sub-headers -->
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Wash Amt</th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Wash Med</th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Drying</th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                <button @click="sortBiochar('output')" class="flex items-center hover:text-gray-700">
                  Output (g)
                  <span x-html="getSortIcon('output')"></span>
                </button>
              </th>
              <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">KFT %</th>
            </tr>
          </thead>
          <!-- Each record gets its own tbody containing both main and expandable rows -->
          <template x-for="record in biocharRecords" :key="record.id">
            <tbody class="bg-white divide-y divide-gray-200">
              <tr class="hover:bg-gray-50" :class="{'bg-link-light': record.lotNumber}">
                <!-- Select checkbox -->
                <td class="px-2 py-2 text-xs border-r border-gray-300">
                  <input type="checkbox" x-model="selectedBiocharIds" :value="record.id" 
                         :disabled="record.lotNumber"
                         class="rounded border-gray-300" 
                         :class="{'opacity-50 cursor-not-allowed': record.lotNumber}">
                </td>
                <!-- Basic Info columns -->
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="record.testOrder || '-'"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200">
                  <button
                    @click="routerService.navigateToDataPage('biochar', record.experimentNumber)"
                    class="text-link text-link-hover underline cursor-pointer font-bold"
                    x-text="record.experimentNumber">
                  </button>
                </td>
                <td class="px-2 py-2 text-xs border-r border-gray-200" x-text="window.formatDateSafe(record.experimentDate)"></td>
                <td class="px-2 py-2 text-xs border-r border-gray-300" x-text="record.reactor"></td>
                <!-- Material columns -->
                <td class="px-2 py-2 text-xs border-r border-gray-200" x-text="record.rawMaterial"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-300" x-text="record.startingAmount ? record.startingAmount + 'g' : ''"></td>
                <!-- Process columns -->
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="record.acidAmount ? record.acidAmount + 'g' : ''"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="record.acidConcentration ? record.acidConcentration + '%' : ''"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="record.acidMolarity ? record.acidMolarity + 'M' : ''"></td>
                <td class="px-2 py-2 text-xs border-r border-gray-200" x-text="record.acidType || ''"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="record.temperature ? record.temperature + '°C' : ''"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="record.time ? record.time + 'hr' : ''"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="record.pressureInitial ? record.pressureInitial + ' bar' : ''"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-300" x-text="record.pressureFinal ? record.pressureFinal + ' bar' : ''"></td>
                <!-- Output columns -->
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="record.washAmount ? record.washAmount + 'g' : ''"></td>
                <td class="px-2 py-2 text-xs border-r border-gray-200" x-text="record.washMedium || ''"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="record.dryingTemp ? record.dryingTemp + '°C' : ''"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-200" x-text="record.output ? record.output + 'g' : ''"></td>
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-300" x-text="record.kftPercentage ? record.kftPercentage + '%' : ''"></td>
                <!-- Lot Number -->
                <td class="px-2 py-2 text-xs font-mono border-r border-gray-300">
                  <span x-text="record.lotNumber || ''" 
                        :class="{'text-link font-semibold': record.lotNumber}"></span>
                </td>
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
                    <button @click="copyBiochar(record)" class="text-gray-400 hover:text-gray-600" title="Copy">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    </button>
                    <button x-show="canEdit()" @click="editBiochar(record)" class="text-link hover:text-link-hover" title="Edit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button x-show="canEdit()" @click="deleteBiochar(record.id)" class="text-red-400 hover:text-red-600" title="Delete">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              
              <!-- Expandable Related Data Row - Directly below the main row -->
              <tr x-show="expandedBiocharRows[record.experimentNumber]" 
                  x-transition:enter="transition ease-out duration-200"
                  x-transition:enter-start="opacity-0 transform scale-95"
                  x-transition:enter-end="opacity-100 transform scale-100"
                  x-transition:leave="transition ease-in duration-150"
                  x-transition:leave-start="opacity-100 transform scale-100"
                  x-transition:leave-end="opacity-0 transform scale-95"
                  class="bg-gray-50">
                <td colspan="21" class="px-4 py-4">
                  <div class="bg-white border border-gray-300 rounded-lg p-4">
                    <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                      Material Journey: <span class="font-mono text-black" x-text="record.experimentNumber"></span>
                    </h3>
                    
                    <div x-show="loadingBiocharRelated[record.experimentNumber]" class="text-center text-gray-500">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      <p class="mt-2">Loading related data...</p>
                    </div>
                    
                    <div x-show="!loadingBiocharRelated[record.experimentNumber] && biocharRelatedData[record.experimentNumber]" class="space-y-4">
                      
                      <!-- Direct Graphene Productions -->
                      <div x-show="biocharRelatedData[record.experimentNumber] && biocharRelatedData[record.experimentNumber].directGraphene && biocharRelatedData[record.experimentNumber].directGraphene.length > 0">
                        <h4 class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                          </svg>
                          Direct Graphene Productions
                        </h4>
                      <div class="overflow-x-auto">
                        <table class="min-w-full text-xs border border-gray-200">
                          <thead class="bg-gray-100">
                            <tr>
                              <th class="px-2 py-1 text-left">Exp #</th>
                              <th class="px-2 py-1 text-left">Date</th>
                              <th class="px-2 py-1 text-left">Oven</th>
                              <th class="px-2 py-1 text-left">Quantity (g)</th>
                              <th class="px-2 py-1 text-left">Species</th>
                              <th class="px-2 py-1 text-left">Output (g)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <template x-for="graphene in (biocharRelatedData[record.experimentNumber] && biocharRelatedData[record.experimentNumber].directGraphene) || []" :key="graphene.id">
                              <tr class="border-t border-gray-200">
                                <td class="px-2 py-1 font-mono" x-text="graphene.experimentNumber"></td>
                                <td class="px-2 py-1" x-text="window.formatDateSafe(graphene.experimentDate)"></td>
                                <td class="px-2 py-1" x-text="graphene.oven"></td>
                                <td class="px-2 py-1" x-text="graphene.quantity ? graphene.quantity + 'g' : ''"></td>
                                <td class="px-2 py-1" x-text="graphene.species"></td>
                                <td class="px-2 py-1" x-text="graphene.output ? graphene.output + 'g' : ''"></td>
                              </tr>
                            </template>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <!-- Lot-based Graphene Productions -->
                    <div x-show="biocharRelatedData[record.experimentNumber] && biocharRelatedData[record.experimentNumber].lotGraphene && biocharRelatedData[record.experimentNumber].lotGraphene.length > 0">
                      <h4 class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                        Lot-based Graphene Productions 
                        <span class="text-gray-500 font-normal ml-2">(from lot: <span x-text="biocharRelatedData[record.experimentNumber] && biocharRelatedData[record.experimentNumber].lotNumber"></span>)</span>
                      </h4>
                      <div class="overflow-x-auto">
                        <table class="min-w-full text-xs border border-gray-200">
                          <thead class="bg-gray-100">
                            <tr>
                              <th class="px-2 py-1 text-left">Exp #</th>
                              <th class="px-2 py-1 text-left">Date</th>
                              <th class="px-2 py-1 text-left">Oven</th>
                              <th class="px-2 py-1 text-left">Quantity (g)</th>
                              <th class="px-2 py-1 text-left">Species</th>
                              <th class="px-2 py-1 text-left">Output (g)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <template x-for="graphene in (biocharRelatedData[record.experimentNumber] && biocharRelatedData[record.experimentNumber].lotGraphene) || []" :key="graphene.id">
                              <tr class="border-t border-gray-200">
                                <td class="px-2 py-1 font-mono" x-text="graphene.experimentNumber"></td>
                                <td class="px-2 py-1" x-text="window.formatDateSafe(graphene.experimentDate)"></td>
                                <td class="px-2 py-1" x-text="graphene.oven"></td>
                                <td class="px-2 py-1" x-text="graphene.quantity ? graphene.quantity + 'g' : ''"></td>
                                <td class="px-2 py-1" x-text="graphene.species"></td>
                                <td class="px-2 py-1" x-text="graphene.output ? graphene.output + 'g' : ''"></td>
                              </tr>
                            </template>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <!-- BET Tests -->
                    <div x-show="biocharRelatedData[record.experimentNumber] && biocharRelatedData[record.experimentNumber].betTests && biocharRelatedData[record.experimentNumber].betTests.length > 0">
                      <h4 class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        BET Surface Area Tests
                      </h4>
                      <div class="overflow-x-auto">
                        <table class="min-w-full text-xs border border-gray-200">
                          <thead class="bg-gray-100">
                            <tr>
                              <th class="px-2 py-1 text-left">Test Date</th>
                              <th class="px-2 py-1 text-left">Graphene Sample</th>
                              <th class="px-2 py-1 text-left">BET Area (m²/g)</th>
                              <th class="px-2 py-1 text-left">Langmuir Area (m²/g)</th>
                              <th class="px-2 py-1 text-left">Species</th>
                            </tr>
                          </thead>
                          <tbody>
                            <template x-for="bet in (biocharRelatedData[record.experimentNumber] && biocharRelatedData[record.experimentNumber].betTests) || []" :key="bet.id">
                              <tr class="border-t border-gray-200">
                                <td class="px-2 py-1" x-text="window.formatDateSafe(bet.testDate)"></td>
                                <td class="px-2 py-1 font-mono" x-text="bet.grapheneSample"></td>
                                <td class="px-2 py-1 font-mono" x-text="bet.multipointBetArea ? formatScientific(bet.multipointBetArea) : ''"></td>
                                <td class="px-2 py-1 font-mono" x-text="bet.langmuirSurfaceArea ? formatScientific(bet.langmuirSurfaceArea) : ''"></td>
                                <td class="px-2 py-1" x-text="bet.species"></td>
                              </tr>
                            </template>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <!-- No Related Data Message -->
                      <div x-show="biocharRelatedData[record.experimentNumber] &&
                                   (!biocharRelatedData[record.experimentNumber].directGraphene || !biocharRelatedData[record.experimentNumber].directGraphene.length) && 
                                   (!biocharRelatedData[record.experimentNumber].lotGraphene || !biocharRelatedData[record.experimentNumber].lotGraphene.length) && 
                                   (!biocharRelatedData[record.experimentNumber].betTests || !biocharRelatedData[record.experimentNumber].betTests.length)" 
                           class="text-center text-gray-500 py-4">
                        No related graphene or BET data found for this biochar experiment.
                      </div>
                      
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </template>
        </table>
      </div>

      <!-- Biochar Cards - Mobile -->
      <div class="md:hidden space-y-3">
        <template x-for="record in biocharRecords" :key="record.id">
          <div class="mobile-card" :class="{'bg-link-light': record.lotNumber}">
            <div class="mobile-card-header">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <input type="checkbox" x-model="selectedBiocharIds" :value="record.id" 
                         :disabled="record.lotNumber"
                         class="rounded border-gray-300 touch-target" 
                         :class="{'opacity-50 cursor-not-allowed': record.lotNumber}">
                  <button 
                    @click="toggleBiocharExpansion(record.experimentNumber)" 
                    class="text-link text-link-hover underline font-bold touch-target"
                    x-text="'Exp #' + record.experimentNumber">
                  </button>
                </div>
                <span class="text-xs text-gray-500" x-text="window.formatDateSafe(record.experimentDate)"></span>
              </div>
            </div>
            
            <div class="space-y-2">
              <div class="mobile-card-row">
                <span class="mobile-card-label">Order:</span>
                <span class="mobile-card-value" x-text="record.testOrder || '-'"></span>
              </div>
              <div class="mobile-card-row">
                <span class="mobile-card-label">Reactor:</span>
                <span class="mobile-card-value" x-text="record.reactor || '-'"></span>
              </div>
              <div class="mobile-card-row">
                <span class="mobile-card-label">Raw Material:</span>
                <span class="mobile-card-value" x-text="record.rawMaterial || '-'"></span>
              </div>
              <div class="mobile-card-row">
                <span class="mobile-card-label">Start Amount:</span>
                <span class="mobile-card-value" x-text="record.startingAmount ? record.startingAmount + 'g' : '-'"></span>
              </div>
              <div class="mobile-card-row">
                <span class="mobile-card-label">Temperature:</span>
                <span class="mobile-card-value" x-text="record.temperature ? record.temperature + '°C' : '-'"></span>
              </div>
              <div class="mobile-card-row">
                <span class="mobile-card-label">Time:</span>
                <span class="mobile-card-value" x-text="record.time ? record.time + 'hr' : '-'"></span>
              </div>
              <div class="mobile-card-row">
                <span class="mobile-card-label">Output:</span>
                <span class="mobile-card-value" x-text="record.output ? record.output + 'g' : '-'"></span>
              </div>
              <div x-show="record.lotNumber" class="mobile-card-row">
                <span class="mobile-card-label">Lot #:</span>
                <span class="mobile-card-value text-link font-semibold" x-text="record.lotNumber"></span>
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
              </div>
              <div class="flex space-x-1">
                <button @click="copyBiochar(record)" class="px-3 py-2 text-xs text-link hover:text-link-hover bg-gray-50 rounded touch-target">Copy</button>
                <button x-show="canEdit()" @click="editBiochar(record)" class="px-3 py-2 text-xs text-gray-600 hover:text-gray-900 bg-gray-50 rounded touch-target">Edit</button>
                <button x-show="canEdit()" @click="deleteBiochar(record.id)" class="px-3 py-2 text-xs text-red-600 hover:text-red-900 bg-red-50 rounded touch-target">Delete</button>
              </div>
            </div>
            
            <!-- Comments tooltip for mobile -->
            <div x-show="showTooltip === record.id && record.comments" 
                 x-transition
                 class="mt-2 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
              <span x-text="record.comments"></span>
            </div>
            
            <!-- Expandable content for mobile -->
            <div x-show="expandedBiocharRows[record.experimentNumber]" 
                 x-transition
                 class="mt-4 pt-4 border-t border-gray-200">
              <div class="bg-gray-50 p-3 rounded">
                <h4 class="text-sm font-semibold text-gray-900 mb-2">Material Journey</h4>
                
                <div x-show="loadingBiocharRelated[record.experimentNumber]" class="text-center text-gray-500 py-4">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  <p class="mt-2 text-xs">Loading...</p>
                </div>
                
                <div x-show="!loadingBiocharRelated[record.experimentNumber] && biocharRelatedData[record.experimentNumber]" class="text-xs">
                  <!-- Simplified related data display for mobile -->
                  <div x-show="biocharRelatedData[record.experimentNumber] && biocharRelatedData[record.experimentNumber].directGraphene && biocharRelatedData[record.experimentNumber].directGraphene.length > 0">
                    <h5 class="font-medium text-gray-700 mb-1">Direct Graphene:</h5>
                    <template x-for="graphene in (biocharRelatedData[record.experimentNumber] && biocharRelatedData[record.experimentNumber].directGraphene) || []" :key="graphene.id">
                      <div class="mb-1 text-gray-600">
                        <span class="font-mono" x-text="graphene.experimentNumber"></span> - 
                        <span x-text="graphene.output ? graphene.output + 'g' : 'No output'"></span>
                      </div>
                    </template>
                  </div>
                  
                  <div x-show="biocharRelatedData[record.experimentNumber] && biocharRelatedData[record.experimentNumber].lotGraphene && biocharRelatedData[record.experimentNumber].lotGraphene.length > 0" class="mt-2">
                    <h5 class="font-medium text-gray-700 mb-1">Lot-based Graphene:</h5>
                    <template x-for="graphene in (biocharRelatedData[record.experimentNumber] && biocharRelatedData[record.experimentNumber].lotGraphene) || []" :key="graphene.id">
                      <div class="mb-1 text-gray-600">
                        <span class="font-mono" x-text="graphene.experimentNumber"></span> - 
                        <span x-text="graphene.output ? graphene.output + 'g' : 'No output'"></span>
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
      <div x-show="biocharRecords.length === 0" class="text-center py-8 text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
        </svg>
        <p>No biochar records found</p>
      </div>
    </div>
  `;
}

// Export for use in the main application
export { getBiocharTabHtml };