/**
 * SEM Reports Management Tab Component
 * 
 * Provides the complete SEM (Scanning Electron Microscopy) report management interface including:
 * - Header with title and upload button
 * - Search functionality for filenames, experiment numbers, and species
 * - Data table with sample associations, dates, species, PDF names
 * - PDF viewing, editing, and deletion capabilities
 * - Multi-experiment association support
 * - Bulk upload functionality
 * 
 * Dependencies:
 * - Alpine.js data: filteredSemReports, semReportSearch, semReportForm, editingSemReport, showAddSemReport
 * - Alpine.js methods: viewSemPdf, editSemReport, deleteSemReport
 * - Alpine.js state: activeTab
 * - Utility functions: Date formatting (formatDate)
 */

/**
 * Returns the complete HTML for the SEM Reports tab component
 * @returns {string} HTML string for the SEM Reports tab
 */
function getSEMReportsTabHtml() {
  return `
    <!-- SEM Reports Tab -->
    <div x-show="activeTab === 'test-sem'" x-cloak>
      <div class="mb-6 flex justify-between items-center">
        <h2 class="text-xl font-semibold">SEM Report Management</h2>
        <div class="flex space-x-2">
          <button @click="semReportForm = {description: '', uploadDate: '', grapheneIds: [], semFiles: null}; editingSemReport = null; showAddSemReport = true" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800">
            Upload Reports
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <input
          type="text"
          x-model="semReportSearch"
          placeholder="Search filenames, experiment numbers, species..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        >
      </div>

      <!-- SEM Reports Table -->
      <div class="overflow-x-auto border border-gray-200 rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-100">
            <tr>
              <th class="table-cell-standard">Sample #</th>
              <th class="table-cell-standard">Date</th>
              <th class="table-cell-standard">Species</th>
              <th class="table-cell-standard">PDF Name</th>
              <th class="table-cell-standard">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template x-if="filteredSemReports.length === 0">
              <tr>
                <td colspan="5" class="table-cell-compact text-center text-gray-500 py-8">
                  <span x-show="!semReportSearch || semReportSearch.trim() === ''">No SEM reports found</span>
                  <span x-show="semReportSearch && semReportSearch.trim() !== ''">No reports matching your search</span>
                </td>
              </tr>
            </template>
            <template x-for="report in filteredSemReports" :key="report.id">
              <tr class="hover:bg-gray-50">
                <!-- Sample # Column -->
                <td class="table-cell-standard">
                  <template x-if="report.grapheneReports && report.grapheneReports.length > 0">
                    <div class="space-y-1">
                      <template x-for="gr in report.grapheneReports">
                        <div class="text-sm font-medium" x-text="gr.graphene.experimentNumber"></div>
                      </template>
                    </div>
                  </template>
                  <template x-if="!report.grapheneReports || report.grapheneReports.length === 0">
                    <span class="text-gray-400 text-sm">-</span>
                  </template>
                </td>
                
                <!-- Date Column -->
                <td class="table-cell-standard" x-text="window.formatDateSafe(report.reportDate)"></td>
                
                <!-- Species Column -->
                <td class="table-cell-standard">
                  <template x-if="report.grapheneReports && report.grapheneReports.length > 0">
                    <div class="space-y-1">
                      <template x-for="gr in report.grapheneReports">
                        <div class="text-sm" x-text="gr.graphene.species || '-'"></div>
                      </template>
                    </div>
                  </template>
                  <template x-if="!report.grapheneReports || report.grapheneReports.length === 0">
                    <span class="text-gray-400 text-sm">-</span>
                  </template>
                </td>
                
                <!-- PDF Name Column -->
                <td class="table-cell-standard">
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"></path>
                    </svg>
                    <span class="font-medium" x-text="report.originalName"></span>
                  </div>
                </td>
                <td class="table-cell-actions">
                  <div class="flex justify-end space-x-2">
                    <button @click="viewSemPdf(report.filePath)" class="text-link hover:text-link-hover" title="View PDF">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </button>
                    <button @click="editSemReport(report)" class="text-link hover:text-link-hover" title="Edit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button @click="deleteSemReport(report.id)" class="text-red-400 hover:text-red-600" title="Delete">
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
window.getSEMReportsTabHtml = getSEMReportsTabHtml;