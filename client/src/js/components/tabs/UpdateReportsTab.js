/**
 * Update Reports Management Tab Component
 * 
 * Provides the complete Weekly Update Reports management interface including:
 * - Header with title and upload button
 * - Search functionality for reports and descriptions
 * - Complex expandable table with experiment and compound batch associations
 * - PDF viewing capabilities
 * - Edit/Delete actions
 * - Expandable detail rows showing associated experiments and compound batches
 * - Support for both graphene experiments and compound batch associations
 * 
 * Dependencies:
 * - Alpine.js data: updateReports, updateReportSearch, updateReportForm, editingUpdateReport, expandedUpdateReportDetails, showAddUpdateReport
 * - Alpine.js methods: searchUpdateReports, viewUpdateReport, editUpdateReport, deleteUpdateReport
 * - Alpine.js state: activeTab, grapheneRecords, compoundBatchRecords, updateReportSearchTerm, filteredGrapheneForUpdate, filteredCompoundBatchesForUpdate
 * - Utility functions: Date formatting
 */

/**
 * Returns the complete HTML for the Update Reports tab component
 * @returns {string} HTML string for the Update Reports tab
 */
function getUpdateReportsTabHtml() {
  return `
    <!-- Curia Updates Tab -->
    <div x-show="activeTab === 'test-updates'" x-cloak>
      <div class="mb-6 flex justify-between items-center">
        <h2 class="text-xl font-semibold">Weekly Update Reports</h2>
        <div class="flex space-x-2">
          <button @click="updateReportForm = {description: '', weekOf: '', grapheneIds: [], compoundBatchIds: [], updateFile: null}; editingUpdateReport = null; updateReportSearchTerm = ''; filteredGrapheneForUpdate = grapheneRecords; filteredCompoundBatchesForUpdate = compoundBatchRecords; showAddUpdateReport = true" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800">
            Upload Report
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <input
          type="text"
          x-model="updateReportSearch"
          @input="searchUpdateReports()"
          placeholder="Search reports, descriptions..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        >
      </div>

      <!-- Update Reports Table -->
      <div class="overflow-x-auto border border-gray-200 rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-100">
            <tr>
              <th class="table-cell-standard">Week Of</th>
              <th class="table-cell-standard">File Name</th>
              <th class="table-cell-standard">Associated Experiments</th>
              <th class="table-cell-standard">Uploaded</th>
              <th class="table-cell-standard">Description</th>
              <th class="table-cell-standard">Actions</th>
            </tr>
          </thead>
          <!-- Each update report gets its own tbody for expandable rows -->
          <template x-for="report in updateReports" :key="report.id">
            <tbody class="bg-white divide-y divide-gray-200">
              <tr class="hover:bg-gray-50">
                <td class="table-cell-standard" x-text="report.weekOf ? window.formatDateSafe(report.weekOf) : '-'"></td>
                <td class="table-cell-standard">
                  <button @click="viewUpdateReport(report.filePath)" 
                          class="text-link text-link-hover font-medium">
                    <span x-text="report.originalName"></span>
                  </button>
                </td>
                <td class="table-cell-standard">
                  <div class="max-w-xs">
                    <template x-if="report.grapheneReports && report.grapheneReports.length > 0">
                      <div class="flex items-center space-x-2">
                        <div>
                          <template x-for="(gr, index) in report.grapheneReports.slice(0, 3)" :key="gr.id">
                            <span>
                              <span x-text="gr.graphene.experimentNumber"></span><span x-show="index < Math.min(2, report.grapheneReports.length - 1)">, </span>
                            </span>
                          </template>
                          <span x-show="report.grapheneReports.length > 3" x-text="\`... +\${report.grapheneReports.length - 3} more\`"></span>
                        </div>
                        <template x-if="report.grapheneReports && report.grapheneReports.length > 0">
                          <button @click="expandedUpdateReportDetails = expandedUpdateReportDetails === report.id ? null : report.id"
                                  class="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                                  title="Show experiment details">
                            <span x-text="expandedUpdateReportDetails === report.id ? 'Hide' : 'Details'"></span>
                          </button>
                        </template>
                      </div>
                    </template>
                    <template x-if="!report.grapheneReports || report.grapheneReports.length === 0">
                      <span class="text-gray-500">No associations</span>
                    </template>
                  </div>
                </td>
                <td class="table-cell-standard" x-text="report.createdAt ? window.formatDateSafe(report.createdAt) : '-'"></td>
                <td class="table-cell-standard">
                  <div class="max-w-xs truncate" x-text="report.description || '-'"></div>
                </td>
                <td class="table-cell-actions">
                  <div class="flex space-x-2">
                    <button @click="editUpdateReport(report)" class="text-link hover:text-link-hover" title="Edit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button @click="deleteUpdateReport(report.id)" class="text-red-600 hover:text-red-800" title="Delete">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              
              <!-- Expandable Experiment Details Row -->
              <tr x-show="expandedUpdateReportDetails === report.id" 
                  x-transition:enter="transition ease-out duration-200"
                  x-transition:enter-start="opacity-0 transform scale-95"
                  x-transition:enter-end="opacity-100 transform scale-100"
                  x-transition:leave="transition ease-in duration-150"
                  x-transition:leave-start="opacity-100 transform scale-100"
                  x-transition:leave-end="opacity-0 transform scale-95"
                  class="bg-gray-50">
                <td colspan="6" class="table-cell-compact">
                  <div class="space-y-4">
                    <h4 class="text-sm font-semibold text-gray-700 mb-3">Associated Experiment Details</h4>
                    
                    <template x-if="report.grapheneReports && report.grapheneReports.length > 0">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <template x-for="gr in report.grapheneReports" :key="gr.id">
                          <div class="border border-gray-200 rounded-lg p-3 bg-white">
                            <div class="flex justify-between items-start mb-2">
                              <h5 class="font-medium text-gray-900" x-text="gr.graphene.experimentNumber"></h5>
                              <span class="text-xs text-gray-500" x-text="gr.graphene.species || 'No species'"></span>
                            </div>
                            
                            <div class="text-xs text-gray-600 space-y-1">
                              <div><strong>Date:</strong> <span x-text="gr.graphene.experimentDate ? window.formatDateSafe(gr.graphene.experimentDate) : 'N/A'"></span></div>
                              <div><strong>Output:</strong> <span x-text="gr.graphene.output ? gr.graphene.output + 'g' : 'N/A'"></span></div>
                              <div><strong>Biochar Source:</strong> <span x-text="gr.graphene.biocharExperiment || gr.graphene.biocharLotNumber || 'N/A'"></span></div>
                            </div>
                            
                            <!-- Test Results Summary -->
                            <div class="mt-2 pt-2 border-t border-gray-100">
                              <div class="text-xs text-gray-500">
                                <strong>Tests Available:</strong> 
                                <!-- This will be populated by related data when expanded -->
                                <span class="text-blue-600">Click experiment # to view full details</span>
                              </div>
                            </div>
                          </div>
                        </template>
                      </div>
                    </template>
                    
                    <template x-if="report.compoundBatchReports && report.compoundBatchReports.length > 0">
                      <div>
                        <h5 class="text-sm font-medium text-gray-700 mb-2">Compound Batches:</h5>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <template x-for="cbr in report.compoundBatchReports" :key="cbr.id">
                            <div class="border border-gray-200 rounded-lg p-3 bg-white">
                              <div class="flex justify-between items-start mb-2">
                                <h6 class="font-medium text-gray-900" x-text="cbr.compoundBatch.batchNumber"></h6>
                                <span class="text-xs text-gray-500" x-text="cbr.compoundBatch.totalOutput ? cbr.compoundBatch.totalOutput + 'g' : 'N/A'"></span>
                              </div>
                              <div class="text-xs text-gray-600">
                                <div><strong>Name:</strong> <span x-text="cbr.compoundBatch.batchName || 'N/A'"></span></div>
                                <div><strong>Created:</strong> <span x-text="cbr.compoundBatch.createdDate ? window.formatDateSafe(cbr.compoundBatch.createdDate) : 'N/A'"></span></div>
                              </div>
                            </div>
                          </template>
                        </div>
                      </div>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </template>
          
          <!-- No reports message -->
          <template x-if="updateReports.length === 0">
            <tbody>
              <tr>
                <td colspan="6" class="table-cell-compact text-center text-gray-500 py-8">
                  No update reports found
                </td>
              </tr>
            </tbody>
          </template>
        </table>
      </div>
    </div>
  `;
}

// Export for use in main application
window.getUpdateReportsTabHtml = getUpdateReportsTabHtml;