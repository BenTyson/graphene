/**
 * BET Surface Area Analysis Tab Component
 * 
 * Provides the complete BET test results interface including:
 * - Header with title and action buttons
 * - Search functionality for samples and batches
 * - Data table with expandable rows
 * - PDF viewing integration
 * - Edit/Delete actions
 * 
 * Dependencies:
 * - Alpine.js data: betRecords, betSearch
 * - Alpine.js methods: exportData, initBetForm, searchBet, toggleExpanded, viewBetPdf, editBet, deleteBet
 * - Alpine.js state: expandedRows, activeTab
 * - Utility functions: formatDate, formatScientificNotation
 */

/**
 * Returns the complete HTML for the BET tab component
 * @returns {string} HTML string for the BET tab
 */
function getBETTabHtml() {
  return `
    <!-- BET Tab -->
    <div x-show="activeTab === 'test-bet'" x-cloak>
      <div class="mb-6 flex justify-between items-center">
        <h2 class="text-xl font-semibold">BET Surface Area Analysis</h2>
        <div class="flex space-x-2">
          <button @click="exportData('test-bet')" class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 touch-target">
            Export CSV
          </button>
          <button @click="initBetForm()" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 touch-target">
            Add Record
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <input
          type="text"
          x-model="betSearch"
          @input="searchBet()"
          placeholder="Search samples, graphene batches..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        >
      </div>

      <!-- BET Table -->
      <div class="overflow-x-auto border border-gray-200 rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-100">
            <tr>
              <th class="table-cell-standard border-r border-gray-300">Test Date</th>
              <th class="table-cell-standard border-r border-gray-300">Graphene Sample</th>
              <th class="table-cell-standard border-r border-gray-300">Multipoint BET Area (m²/g)</th>
              <th class="table-cell-standard border-r border-gray-300">Langmuir Surface Area (m²/g)</th>
              <th class="table-cell-standard border-r border-gray-300">Mass (g)</th>
              <th class="table-cell-standard border-r border-gray-300">Research Team</th>
              <th class="table-cell-standard border-r border-gray-300">Testing Lab</th>
              <th class="table-cell-standard border-r border-gray-300">BET Report</th>
              <th class="table-cell-standard">Actions</th>
            </tr>
          </thead>
          <template x-for="record in betRecords" :key="record.id">
            <tbody class="bg-white divide-y divide-gray-200">
              <tr class="hover:bg-gray-50">
                <td class="table-cell-compact border-r border-gray-200" x-text="formatDate(record.testDate)"></td>
                <td class="table-cell-compact font-mono border-r border-gray-200">
                  <button @click="toggleExpanded('bet', record.id)" class="text-link text-link-hover font-medium">
                    <div class="flex items-center space-x-2">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            :class="record.grapheneSample ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'"
                            x-text="record.grapheneSample ? 'G' : 'CB'"></span>
                      <span x-text="record.grapheneSample || record.compoundBatchNumber"></span>
                      <svg class="w-4 h-4" :class="{'transform rotate-180': expandedRows['bet_' + record.id]}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </button>
                </td>
                <td class="table-cell-compact font-mono border-r border-gray-200" x-text="formatScientificNotation(record.multipointBetArea)"></td>
                <td class="table-cell-compact font-mono border-r border-gray-200" x-text="formatScientificNotation(record.langmuirSurfaceArea)"></td>
                <td class="table-cell-compact font-mono border-r border-gray-200" x-text="record.mass ? record.mass + 'g' : ''"></td>
                <td class="table-cell-compact border-r border-gray-200" x-text="record.researchTeam"></td>
                <td class="table-cell-compact border-r border-gray-200" x-text="record.testingLab"></td>
                <td class="table-cell-compact border-r border-gray-200">
                  <template x-if="record.betReportPath">
                    <button @click="viewBetPdf(record.betReportPath)" 
                            class="text-link text-link-hover text-xs font-medium">
                      View PDF
                    </button>
                  </template>
                  <template x-if="!record.betReportPath">
                    <span class="text-gray-400 text-xs">No report</span>
                  </template>
                </td>
                <td class="table-cell-compact">
                  <div class="flex justify-end space-x-2">
                    <button @click="editBet(record)" class="text-link hover:text-link-hover" title="Edit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button @click="deleteBet(record.id)" class="text-red-400 hover:text-red-600" title="Delete">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr x-show="expandedRows['bet_' + record.id]" class="bg-gray-50">
                <td colspan="9" class="table-cell-compact">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <div class="mb-2"><strong>Research Team:</strong> <span x-text="record.researchTeam || 'N/A'"></span></div>
                      <template x-if="record.betReportPath">
                        <div class="mb-2">
                          <strong>BET Report:</strong>
                          <button @click="viewBetPdf(record.betReportPath)" class="text-link text-link-hover ml-1">
                            View PDF
                          </button>
                        </div>
                      </template>
                    </div>
                    <div>
                      <div class="mb-2"><strong>Comments:</strong> <span x-text="record.comments || 'None'"></span></div>
                      <div class="text-xs text-gray-500">Created: <span x-text="new Date(record.createdAt).toLocaleString()"></span></div>
                    </div>
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
window.getBETTabHtml = getBETTabHtml;