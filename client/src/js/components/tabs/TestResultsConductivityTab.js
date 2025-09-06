/**
 * Conductivity Test Results Tab Component
 * 
 * Provides the complete Conductivity test results interface including:
 * - Header with title and action buttons
 * - Search functionality for samples and descriptions
 * - Data table with expandable rows showing measurements at different pressures (1kN, 8kN, 12kN, 20kN)
 * - PDF viewing and download integration
 * - Edit/Delete actions
 * 
 * Dependencies:
 * - Alpine.js data: conductivityRecords, conductivitySearch
 * - Alpine.js methods: exportData, initConductivityForm, searchConductivity, toggleExpanded, openPdfViewer, editConductivity, deleteConductivity
 * - Alpine.js state: expandedRows, activeTab
 * - Utility functions: Date formatting
 */

/**
 * Returns the complete HTML for the Conductivity tab component
 * @returns {string} HTML string for the Conductivity tab
 */
function getConductivityTabHtml() {
  return `
    <!-- Conductivity Tests Tab -->
    <div x-show="activeTab === 'test-conductivity'" x-cloak>
      <div class="mb-6 flex justify-between items-center">
        <h2 class="text-xl font-semibold">Conductivity Test Results</h2>
        <div class="flex space-x-2">
          <button @click="exportData('test-conductivity')" class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 touch-target">
            Export CSV
          </button>
          <button @click="initConductivityForm()" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 touch-target">
            Add Record
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <input
          type="text"
          x-model="conductivitySearch"
          @input="searchConductivity()"
          placeholder="Search samples, descriptions..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        >
      </div>

      <!-- Conductivity Table -->
      <div class="overflow-x-auto border border-gray-200 rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr class="bg-gray-100">
              <th class="table-cell-standard border-r border-gray-300">Test Date</th>
              <th class="table-cell-standard border-r border-gray-300">Graphene Sample</th>
              <th class="table-cell-standard border-r border-gray-300">Name</th>
              <th class="table-cell-standard border-r border-gray-300">Description</th>
              <th class="table-cell-standard text-center border-r border-gray-300">1kN (S/cm²)</th>
              <th class="table-cell-standard text-center border-r border-gray-300">8kN (S/cm²)</th>
              <th class="table-cell-standard text-center border-r border-gray-300">12kN (S/cm²)</th>
              <th class="table-cell-standard text-center border-r border-gray-300">20kN (S/cm²)</th>
              <th class="table-cell-standard text-center border-r border-gray-300">Test Data</th>
              <th class="table-cell-standard">Actions</th>
            </tr>
          </thead>
          <template x-for="record in conductivityRecords" :key="record.id">
            <tbody class="bg-white divide-y divide-gray-200">
              <tr class="hover:bg-gray-50">
                <td class="table-cell-compact border-r border-gray-200" x-text="record.testDate ? new Date(record.testDate).toLocaleDateString() : ''"></td>
                <td class="table-cell-compact font-mono border-r border-gray-200">
                  <button @click="toggleExpanded('conductivity', record.id)" class="text-link text-link-hover font-medium">
                    <div class="flex items-center space-x-2">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            :class="record.grapheneSample ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'"
                            x-text="record.grapheneSample ? 'G' : 'CB'"></span>
                      <span x-text="record.grapheneSample || record.compoundBatchNumber"></span>
                      <svg class="w-4 h-4" :class="{'transform rotate-180': expandedRows['conductivity_' + record.id]}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </button>
                </td>
                <td class="table-cell-compact border-r border-gray-200" x-text="record.name"></td>
                <td class="table-cell-compact border-r border-gray-200" x-text="record.description"></td>
                <td class="table-cell-compact font-mono text-center border-r border-gray-200" x-text="record.conductivity1kN || ''"></td>
                <td class="table-cell-compact font-mono text-center border-r border-gray-200" x-text="record.conductivity8kN || ''"></td>
                <td class="table-cell-compact font-mono text-center border-r border-gray-200" x-text="record.conductivity12kN || ''"></td>
                <td class="table-cell-compact font-mono text-center border-r border-gray-200" x-text="record.conductivity20kN || ''"></td>
                <td class="table-cell-compact text-center border-r border-gray-200">
                  <template x-if="record.conductivityReportPath">
                    <a :href="'/uploads/' + record.conductivityReportPath" 
                       download
                       class="text-link hover:text-link-hover inline-flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                      </svg>
                      Download
                    </a>
                  </template>
                  <template x-if="!record.conductivityReportPath">
                    <span class="text-gray-400">-</span>
                  </template>
                </td>
                <td class="table-cell-compact">
                  <div class="flex justify-end space-x-2">
                    <button @click="editConductivity(record)" class="text-link hover:text-link-hover" title="Edit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button @click="deleteConductivity(record.id)" class="text-red-400 hover:text-red-600" title="Delete">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr x-show="expandedRows['conductivity_' + record.id]" class="bg-gray-50">
                <td colspan="10" class="table-cell-compact">
                  <div class="grid grid-cols-1 gap-2">
                    <div class="text-xs"><strong>Comments:</strong> <span x-text="record.comments || 'None'"></span></div>
                    <div x-show="record.conductivityReportPath" class="text-xs">
                      <strong>Report:</strong> 
                      <template x-if="record.conductivityReportPath && record.conductivityReportPath.toLowerCase().endsWith('.pdf')">
                        <button @click="openPdfViewer(record.conductivityReportPath, 'Conductivity Report')" 
                                class="text-link hover:text-link-hover ml-1">
                          View PDF
                        </button>
                      </template>
                      <template x-if="record.conductivityReportPath && !record.conductivityReportPath.toLowerCase().endsWith('.pdf')">
                        <a :href="'/uploads/' + record.conductivityReportPath" 
                           download
                           class="text-link hover:text-link-hover ml-1">
                          Download File
                        </a>
                      </template>
                    </div>
                    <div class="text-xs text-gray-500">Created: <span x-text="new Date(record.createdAt).toLocaleString()"></span></div>
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

// Export for use in main application
window.getConductivityTabHtml = getConductivityTabHtml;