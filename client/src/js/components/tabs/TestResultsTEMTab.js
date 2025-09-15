/**
 * TEM Test Results Tab Component
 * 
 * Provides the complete TEM (Transmission Electron Microscopy) analysis interface including:
 * - Header with title and action buttons
 * - Search functionality for samples, labs, and teams
 * - Data table with test records showing date, sample, lab, PDF report links
 * - PDF viewing integration
 * - Edit/Delete actions
 * - Support for both individual graphene experiments and compound batches
 * 
 * Dependencies:
 * - Alpine.js data: temRecords, temSearch
 * - Alpine.js methods: exportData, initTemForm, loadTemRecords, viewTemPdf, editTem, deleteTem
 * - Alpine.js state: activeTab
 * - Utility functions: Date formatting
 */

/**
 * Returns the complete HTML for the TEM tab component
 * @returns {string} HTML string for the TEM tab
 */
function getTEMTabHtml() {
  return `
    <!-- TEM Test Results Tab -->
    <div x-show="activeTab === 'test-tem'" x-cloak>
      <div class="mb-6 flex justify-between items-center">
        <h2 class="text-xl font-semibold">TEM Analysis Results</h2>
        <div class="flex space-x-2">
          <button @click="exportData('test-tem')" class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 touch-target">
            Export CSV
          </button>
          <button @click="initTemForm()" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 touch-target">
            Add Record
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <input
          type="text"
          x-model="temSearch"
          @input="loadTemRecords()"
          placeholder="Search samples, labs, teams..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        >
      </div>

      <!-- TEM Table -->
      <div class="overflow-x-auto border border-gray-200 rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-100">
            <tr>
              <th class="table-cell-standard">Test Date</th>
              <th class="table-cell-standard">Graphene Sample</th>
              <th class="table-cell-standard">Testing Lab</th>
              <th class="table-cell-standard">PDF Report</th>
              <th class="table-cell-standard">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template x-if="temRecords.length === 0">
              <tr>
                <td colspan="5" class="table-cell-compact text-center text-gray-500 py-8">
                  No TEM records found
                </td>
              </tr>
            </template>
            <template x-for="record in temRecords" :key="record.id">
              <tr class="hover:bg-gray-50">
                <td class="table-cell-compact" x-text="record.testDate ? window.formatDateSafe(record.testDate) : ''"></td>
                <td class="table-cell-compact">
                  <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          :class="record.grapheneSample ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'"
                          x-text="record.grapheneSample ? 'G' : 'CB'"></span>
                    <span x-text="record.grapheneSample || record.compoundBatchNumber" class="text-link font-medium"></span>
                  </div>
                </td>
                <td class="table-cell-compact" x-text="record.testingLab"></td>
                <td class="table-cell-compact">
                  <template x-if="record.temReportPath">
                    <button @click="viewTemPdf(record.temReportPath)" class="text-link text-link-hover">
                      View PDF
                    </button>
                  </template>
                  <template x-if="!record.temReportPath">
                    <span class="text-gray-400">No report</span>
                  </template>
                </td>
                <td class="table-cell-actions-compact">
                  <div class="flex justify-end space-x-2">
                    <button @click="editTem(record)" class="text-link hover:text-link-hover" title="Edit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button @click="deleteTem(record.id)" class="text-red-400 hover:text-red-600" title="Delete">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Export for use in main application
window.getTEMTabHtml = getTEMTabHtml;