/**
 * RAMAN Analysis Results Tab Component
 * 
 * Provides the complete RAMAN spectroscopy analysis interface including:
 * - Header with title and action buttons
 * - Search functionality for samples, labs, and teams
 * - Complex matrix data table with Integration Range, Integral Typ A, and Integral Typ B sections
 * - Expandable rows showing detailed absorption band analysis matrix
 * - Specialized 4x4 data structure for 2D Band, G Band, D Band, and D/G Ratio measurements
 * - PDF viewing integration
 * - Edit/Delete actions
 * 
 * Dependencies:
 * - Alpine.js data: ramanRecords, ramanSearch
 * - Alpine.js methods: exportData, initRamanForm, searchRaman, toggleExpanded, viewRamanPdf, editRaman, deleteRaman
 * - Alpine.js state: expandedRows, activeTab
 * - Complex field structure: integrationRange*, integralTypA*, integralTypB*, peakHighTypJ* fields
 */

/**
 * Returns the complete HTML for the RAMAN tab component
 * @returns {string} HTML string for the RAMAN tab
 */
function getRAMANTabHtml() {
  return `
    <!-- RAMAN Analysis Tab -->
    <div x-show="activeTab === 'test-raman'" x-cloak>
      <div class="mb-6 flex justify-between items-center">
        <h2 class="text-xl font-semibold">RAMAN Analysis Results</h2>
        <div class="flex space-x-2">
          <button @click="exportData('test-raman')" class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 touch-target">
            Export CSV
          </button>
          <button @click="initRamanForm()" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 touch-target">
            Add Record
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <input
          type="text"
          x-model="ramanSearch"
          @input="searchRaman()"
          placeholder="Search samples, labs, teams..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        >
      </div>

      <!-- RAMAN Table -->
      <div class="overflow-x-auto border border-gray-200 rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr class="bg-gray-100">
              <th class="table-cell-standard border-r border-gray-300">Test Date</th>
              <th class="table-cell-standard border-r border-gray-300">Graphene Sample</th>
              <th class="table-cell-standard border-r border-gray-300">Testing Lab</th>
              <th class="table-cell-standard text-center border-r border-gray-300" colspan="4">Integration Range</th>
              <th class="table-cell-standard text-center border-r border-gray-300" colspan="4">Integral Typ A</th>
              <th class="table-cell-standard text-center border-r border-gray-300" colspan="4">Integral Typ B</th>
              <th class="table-cell-standard border-r border-gray-300">RAMAN Report</th>
              <th class="table-cell-standard">Actions</th>
            </tr>
            <tr class="bg-gray-100">
              <th class="table-cell-compact border-r border-gray-300"></th>
              <th class="table-cell-compact border-r border-gray-300"></th>
              <th class="table-cell-compact border-r border-gray-300"></th>
              <th class="table-cell-compact text-center border-r border-gray-200">2D Band</th>
              <th class="table-cell-compact text-center border-r border-gray-200">G Band</th>
              <th class="table-cell-compact text-center border-r border-gray-200">D Band</th>
              <th class="table-cell-compact text-center border-r border-gray-300">D/G Ratio</th>
              <th class="table-cell-compact text-center border-r border-gray-200">2D Band</th>
              <th class="table-cell-compact text-center border-r border-gray-200">G Band</th>
              <th class="table-cell-compact text-center border-r border-gray-200">D Band</th>
              <th class="table-cell-compact text-center border-r border-gray-300">D/G Ratio</th>
              <th class="table-cell-compact text-center border-r border-gray-200">2D Band</th>
              <th class="table-cell-compact text-center border-r border-gray-200">G Band</th>
              <th class="table-cell-compact text-center border-r border-gray-200">D Band</th>
              <th class="table-cell-compact text-center border-r border-gray-300">D/G Ratio</th>
              <th class="table-cell-compact border-r border-gray-300"></th>
              <th class="table-cell-compact"></th>
            </tr>
          </thead>
          <template x-for="record in ramanRecords" :key="record.id">
            <tbody class="bg-white divide-y divide-gray-200">
              <tr class="hover:bg-gray-50">
                <td class="table-cell-compact border-r border-gray-200" x-text="window.formatDateSafe(record.testDate)"></td>
                <td class="table-cell-compact font-mono border-r border-gray-200">
                  <button @click="toggleExpanded('raman', record.id)" class="text-link text-link-hover font-medium">
                    <div class="flex items-center space-x-2">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            :class="record.grapheneSample ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'"
                            x-text="record.grapheneSample ? 'G' : 'CB'"></span>
                      <span x-text="record.grapheneSample || record.compoundBatchNumber"></span>
                      <svg class="w-4 h-4" :class="{'transform rotate-180': expandedRows['raman_' + record.id]}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </button>
                </td>
                <td class="table-cell-compact border-r border-gray-200" x-text="record.testingLab"></td>
                <!-- Integration Range Data -->
                <td class="table-cell-compact font-mono text-center border-r border-gray-200" x-text="(record.integrationRange2DLow !== null && record.integrationRange2DLow !== undefined && record.integrationRange2DHigh !== null && record.integrationRange2DHigh !== undefined) ? \`\${record.integrationRange2DLow}-\${record.integrationRange2DHigh}\` : ''"></td>
                <td class="table-cell-compact font-mono text-center border-r border-gray-200" x-text="(record.integrationRangeGLow !== null && record.integrationRangeGLow !== undefined && record.integrationRangeGHigh !== null && record.integrationRangeGHigh !== undefined) ? \`\${record.integrationRangeGLow}-\${record.integrationRangeGHigh}\` : ''"></td>
                <td class="table-cell-compact font-mono text-center border-r border-gray-200" x-text="(record.integrationRangeDLow !== null && record.integrationRangeDLow !== undefined && record.integrationRangeDHigh !== null && record.integrationRangeDHigh !== undefined) ? \`\${record.integrationRangeDLow}-\${record.integrationRangeDHigh}\` : ''"></td>
                <td class="table-cell-compact font-mono text-center border-r border-gray-200" x-text="(record.integrationRangeDGLow !== null && record.integrationRangeDGLow !== undefined && record.integrationRangeDGHigh !== null && record.integrationRangeDGHigh !== undefined) ? \`\${record.integrationRangeDGLow}-\${record.integrationRangeDGHigh}\` : ''"></td>
                <!-- Integral Typ A Data -->
                <td class="table-cell-compact font-mono text-center border-r border-gray-200" x-text="(record.integralTypA2D1 !== null && record.integralTypA2D1 !== undefined && record.integralTypA2D2 !== null && record.integralTypA2D2 !== undefined) ? \`\${record.integralTypA2D1},\${record.integralTypA2D2}\` : ''"></td>
                <td class="table-cell-compact font-mono text-center border-r border-gray-200" x-text="(record.integralTypAG1 !== null && record.integralTypAG1 !== undefined && record.integralTypAG2 !== null && record.integralTypAG2 !== undefined) ? \`\${record.integralTypAG1},\${record.integralTypAG2}\` : ''"></td>
                <td class="table-cell-compact font-mono text-center border-r border-gray-200" x-text="(record.integralTypAD1 !== null && record.integralTypAD1 !== undefined && record.integralTypAD2 !== null && record.integralTypAD2 !== undefined) ? \`\${record.integralTypAD1},\${record.integralTypAD2}\` : ''"></td>
                <td class="table-cell-compact font-mono text-center border-r border-gray-200" x-text="(record.integralTypADG1 !== null && record.integralTypADG1 !== undefined && record.integralTypADG2 !== null && record.integralTypADG2 !== undefined) ? \`\${record.integralTypADG1},\${record.integralTypADG2}\` : ''"></td>
                <!-- Integral Typ B Data -->
                <td class="table-cell-compact font-mono text-center border-r border-gray-200" x-text="(record.integralTypB2D1 !== null && record.integralTypB2D1 !== undefined && record.integralTypB2D2 !== null && record.integralTypB2D2 !== undefined) ? \`\${record.integralTypB2D1},\${record.integralTypB2D2}\` : ''"></td>
                <td class="table-cell-compact font-mono text-center border-r border-gray-200" x-text="(record.integralTypBG1 !== null && record.integralTypBG1 !== undefined && record.integralTypBG2 !== null && record.integralTypBG2 !== undefined) ? \`\${record.integralTypBG1},\${record.integralTypBG2}\` : ''"></td>
                <td class="table-cell-compact font-mono text-center border-r border-gray-200" x-text="(record.integralTypBD1 !== null && record.integralTypBD1 !== undefined && record.integralTypBD2 !== null && record.integralTypBD2 !== undefined) ? \`\${record.integralTypBD1},\${record.integralTypBD2}\` : ''"></td>
                <td class="table-cell-compact font-mono text-center border-r border-gray-200" x-text="(record.integralTypBDG1 !== null && record.integralTypBDG1 !== undefined && record.integralTypBDG2 !== null && record.integralTypBDG2 !== undefined) ? \`\${record.integralTypBDG1},\${record.integralTypBDG2}\` : ''"></td>
                <!-- PDF Report -->
                <td class="table-cell-compact border-r border-gray-200">
                  <template x-if="record.ramanReportPath">
                    <button @click="viewRamanPdf(record.ramanReportPath)" 
                            class="text-link text-link-hover text-xs font-medium">
                      View PDF
                    </button>
                  </template>
                  <template x-if="!record.ramanReportPath">
                    <span class="text-gray-400 text-xs">No report</span>
                  </template>
                </td>
                <!-- Actions -->
                <td class="table-cell-compact">
                  <div class="flex justify-end space-x-2">
                    <button @click="editRaman(record)" class="text-link hover:text-link-hover" title="Edit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button @click="deleteRaman(record.id)" class="text-red-400 hover:text-red-600" title="Delete">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <!-- Expandable Row with Detailed Matrix -->
              <tr x-show="expandedRows['raman_' + record.id]" class="bg-gray-50">
                <td colspan="17" class="table-cell-compact">
                  <div class="space-y-3">
                    <!-- RAMAN Data Matrix -->
                    <div>
                      <h5 class="font-semibold mb-2">Absorption Band Analysis</h5>
                      <table class="w-full text-xs border border-gray-200">
                        <thead class="bg-gray-100">
                          <tr>
                            <th class="px-2 py-1 text-left border-r border-gray-200"></th>
                            <th class="px-2 py-1 text-center border-r border-gray-200">2D Band</th>
                            <th class="px-2 py-1 text-center border-r border-gray-200">G Band</th>
                            <th class="px-2 py-1 text-center border-r border-gray-200">D Band</th>
                            <th class="px-2 py-1 text-center">D/G Ratio</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr class="border-t border-gray-200">
                            <td class="px-2 py-1 font-medium border-r border-gray-200">Integration Range</td>
                            <td class="px-2 py-1 text-center font-mono border-r border-gray-200" x-text="(record.integrationRange2DLow && record.integrationRange2DHigh) ? \`\${record.integrationRange2DLow}-\${record.integrationRange2DHigh}\` : '-'"></td>
                            <td class="px-2 py-1 text-center font-mono border-r border-gray-200" x-text="(record.integrationRangeGLow && record.integrationRangeGHigh) ? \`\${record.integrationRangeGLow}-\${record.integrationRangeGHigh}\` : '-'"></td>
                            <td class="px-2 py-1 text-center font-mono border-r border-gray-200" x-text="(record.integrationRangeDLow && record.integrationRangeDHigh) ? \`\${record.integrationRangeDLow}-\${record.integrationRangeDHigh}\` : '-'"></td>
                            <td class="px-2 py-1 text-center font-mono" x-text="(record.integrationRangeDGLow && record.integrationRangeDGHigh) ? \`\${record.integrationRangeDGLow}-\${record.integrationRangeDGHigh}\` : '-'"></td>
                          </tr>
                          <tr class="border-t border-gray-200">
                            <td class="px-2 py-1 font-medium border-r border-gray-200">Integral Typ A</td>
                            <td class="px-2 py-1 text-center font-mono border-r border-gray-200" x-text="(record.integralTypA2D1 && record.integralTypA2D2) ? \`\${record.integralTypA2D1},\${record.integralTypA2D2}\` : '-'"></td>
                            <td class="px-2 py-1 text-center font-mono border-r border-gray-200" x-text="(record.integralTypAG1 && record.integralTypAG2) ? \`\${record.integralTypAG1},\${record.integralTypAG2}\` : '-'"></td>
                            <td class="px-2 py-1 text-center font-mono border-r border-gray-200" x-text="(record.integralTypAD1 && record.integralTypAD2) ? \`\${record.integralTypAD1},\${record.integralTypAD2}\` : '-'"></td>
                            <td class="px-2 py-1 text-center font-mono" x-text="(record.integralTypADG1 && record.integralTypADG2) ? \`\${record.integralTypADG1},\${record.integralTypADG2}\` : '-'"></td>
                          </tr>
                          <tr class="border-t border-gray-200">
                            <td class="px-2 py-1 font-medium border-r border-gray-200">Integral Typ B</td>
                            <td class="px-2 py-1 text-center font-mono border-r border-gray-200" x-text="(record.integralTypB2D1 !== null && record.integralTypB2D1 !== undefined && record.integralTypB2D2 !== null && record.integralTypB2D2 !== undefined) ? \`\${record.integralTypB2D1},\${record.integralTypB2D2}\` : '-'"></td>
                            <td class="px-2 py-1 text-center font-mono border-r border-gray-200" x-text="(record.integralTypBG1 !== null && record.integralTypBG1 !== undefined && record.integralTypBG2 !== null && record.integralTypBG2 !== undefined) ? \`\${record.integralTypBG1},\${record.integralTypBG2}\` : '-'"></td>
                            <td class="px-2 py-1 text-center font-mono border-r border-gray-200" x-text="(record.integralTypBD1 !== null && record.integralTypBD1 !== undefined && record.integralTypBD2 !== null && record.integralTypBD2 !== undefined) ? \`\${record.integralTypBD1},\${record.integralTypBD2}\` : '-'"></td>
                            <td class="px-2 py-1 text-center font-mono" x-text="(record.integralTypBDG1 !== null && record.integralTypBDG1 !== undefined && record.integralTypBDG2 !== null && record.integralTypBDG2 !== undefined) ? \`\${record.integralTypBDG1},\${record.integralTypBDG2}\` : '-'"></td>
                          </tr>
                          <tr class="border-t border-gray-200">
                            <td class="px-2 py-1 font-medium border-r border-gray-200">Peak High Typ J</td>
                            <td class="px-2 py-1 text-center font-mono border-r border-gray-200" x-text="(record.peakHighTypJ2D1 && record.peakHighTypJ2D2) ? \`\${record.peakHighTypJ2D1},\${record.peakHighTypJ2D2}\` : '-'"></td>
                            <td class="px-2 py-1 text-center font-mono border-r border-gray-200" x-text="(record.peakHighTypJG1 && record.peakHighTypJG2) ? \`\${record.peakHighTypJG1},\${record.peakHighTypJG2}\` : '-'"></td>
                            <td class="px-2 py-1 text-center font-mono border-r border-gray-200" x-text="(record.peakHighTypJD1 && record.peakHighTypJD2) ? \`\${record.peakHighTypJD1},\${record.peakHighTypJD2}\` : '-'"></td>
                            <td class="px-2 py-1 text-center font-mono" x-text="(record.peakHighTypJDG1 && record.peakHighTypJDG2) ? \`\${record.peakHighTypJDG1},\${record.peakHighTypJDG2}\` : '-'"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <!-- Additional Info -->
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <div class="mb-2"><strong>Research Team:</strong> <span x-text="record.researchTeam || 'N/A'"></span></div>
                        <template x-if="record.ramanReportPath">
                          <div class="mb-2">
                            <strong>RAMAN Report:</strong>
                            <button @click="viewRamanPdf(record.ramanReportPath)" class="text-link text-link-hover ml-1">
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
window.getRAMANTabHtml = getRAMANTabHtml;