/**
 * Compound Batches Tab Component
 * 
 * Provides the compound batch management interface including:
 * - Header with title and action buttons
 * - Search functionality for compound batches
 * - Data table with expandable rows showing related data
 * - Test results integration using dropdown section components
 * - Edit/Delete actions
 * - Empty state display
 * 
 * Dependencies:
 * - Alpine.js data: activeTab, compoundBatchSearch, compoundBatchRecords, expandedCompoundBatches, loadingCompoundBatchRelated, compoundBatchRelatedData
 * - Alpine.js methods: exportData, openCompoundBatchForm, searchCompoundBatches, toggleCompoundBatchExpansion, editCompoundBatch, deleteCompoundBatch
 * - Dropdown section components: getObjectivesSectionHtml, getReportsSectionHtml, getTestResultsSectionHtml, getShipmentsSectionHtml
 * - Global styling: Standard table and button classes
 */

/**
 * Returns the complete HTML for the Compound Batches tab component
 * @returns {string} HTML string for the Compound Batches tab
 */
function getCompoundBatchesTabHtml() {
  return `
    <!-- Compound Batches Tab -->
    <div x-show="activeTab === 'compound-batches'" x-cloak>
      <div class="mb-6 flex justify-between items-center">
        <h2 class="text-xl font-semibold">Compound Batch Management</h2>
        <div class="flex space-x-2">
          <button @click="exportData('compound-batches')" class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 touch-target">
            Export CSV
          </button>
          <button @click="openCompoundBatchForm()" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 touch-target">
            Create Batch
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <input
          type="text"
          x-model="compoundBatchSearch"
          @input="searchCompoundBatches()"
          placeholder="Search batch numbers, names, descriptions..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        >
      </div>

      <!-- Compound Batches Table -->
      <div class="overflow-x-auto border border-gray-200 rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Batch Number
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Batch Name
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Created Date
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Total Output (g)
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Experiments
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Description
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <!-- Each compound batch gets its own tbody containing both main and expandable rows -->
          <template x-for="batch in compoundBatchRecords" :key="batch.id">
            <tbody class="bg-white divide-y divide-gray-200">
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <button @click="toggleCompoundBatchExpansion(batch.id)" 
                          class="text-link text-link-hover underline cursor-pointer font-bold">
                    <span x-text="batch.batchNumber"></span>
                  </button>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <span x-text="batch.batchName || '-'"></span>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <span x-text="batch.createdDate || '-'"></span>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <span x-text="batch.totalOutput ? batch.totalOutput + 'g' : '-'"></span>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <span x-text="batch.experiments ? batch.experiments.length : '0'" 
                        class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"></span>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <span x-text="batch.description || '-'"></span>
                </td>
                <td class="px-4 py-3 text-xs">
                  <div class="flex justify-end space-x-2">
                    <button @click="editCompoundBatch(batch)" class="text-link hover:text-link-hover" title="Edit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button @click="deleteCompoundBatch(batch.id)" class="text-red-400 hover:text-red-600" title="Delete">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              
              <!-- Expandable Related Data Row - Directly below the main row -->
              <tr x-show="expandedCompoundBatches[batch.id]" 
                  x-transition:enter="transition ease-out duration-200"
                  x-transition:enter-start="opacity-0 transform scale-95"
                  x-transition:enter-end="opacity-100 transform scale-100"
                  x-transition:leave="transition ease-in duration-150"
                  x-transition:leave-start="opacity-100 transform scale-100"
                  x-transition:leave-end="opacity-0 transform scale-95"
                  class="bg-gray-50">
                <td colspan="7" class="px-4 py-4">
                  <div class="bg-white border border-gray-300 rounded-lg p-4 space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Compound Batch Journey: <span class="font-mono text-black" x-text="batch.batchNumber"></span>
                      <span x-show="batch.batchName" x-text="' - ' + batch.batchName" class="text-gray-600 font-normal"></span>
                    </h3>
                    
                    <template x-if="loadingCompoundBatchRelated[batch.id]">
                      <div class="text-center py-4">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p class="mt-2 text-gray-600">Loading related test data...</p>
                      </div>
                    </template>
                    
                    <template x-if="!loadingCompoundBatchRelated[batch.id] && compoundBatchRelatedData[batch.id]">
                      <div class="space-y-6">
                        <!-- Constituent Experiments Section -->
                        <div x-html="getObjectivesSectionHtml({
                          sectionType: 'compound-batches',
                          dataPath: 'compoundBatchRelatedData[batch.id].compoundBatch.experiments'
                        })"></div>
                        
                        <!-- SEM Reports Section -->
                        <div x-html="getReportsSectionHtml({
                          reportType: 'sem',
                          dataPath: 'compoundBatchRelatedData[batch.id].compoundBatch.semReports',
                          record: 'compoundBatchRelatedData[batch.id].compoundBatch'
                        })"></div>
                        
                        <!-- Test Results Grid -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <!-- BET Test Results -->
                          <div x-html="getTestResultsSectionHtml({
                            testType: 'bet',
                            dataPath: 'compoundBatchRelatedData[batch.id].betTests'
                          })"></div>

                          <!-- Conductivity Test Results -->
                          <div x-html="getTestResultsSectionHtml({
                            testType: 'conductivity',
                            dataPath: 'compoundBatchRelatedData[batch.id].conductivityTests'
                          })"></div>

                          <!-- RAMAN Analysis Results -->
                          <div x-html="getTestResultsSectionHtml({
                            testType: 'raman',
                            dataPath: 'compoundBatchRelatedData[batch.id].ramanTests'
                          })"></div>

                          <!-- TEM Test Results -->
                          <div x-html="getTestResultsSectionHtml({
                            testType: 'tem',
                            dataPath: 'compoundBatchRelatedData[batch.id].temTests'
                          })"></div>
                        </div>

                        <!-- Shipment History -->
                        <div x-html="getShipmentsSectionHtml({
                          dataPath: 'compoundBatchRelatedData[batch.id].shipments',
                          materialType: 'compound'
                        })"></div>
                      </div>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </template>
            
          <!-- Empty State -->
          <template x-if="compoundBatchRecords.length === 0">
            <tbody>
              <tr>
                <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                  <div class="flex flex-col items-center">
                    <svg class="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                    <p class="text-sm">No compound batches found</p>
                    <p class="text-xs text-gray-400 mt-1">Create your first compound batch to get started</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </template>
        </table>
      </div>

    </div>
  `;
}

// Export for use in the main application
export { getCompoundBatchesTabHtml };