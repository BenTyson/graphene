/**
 * Micronization Tab Component
 * 
 * Provides the micronization processing interface including:
 * - Header with title and action buttons
 * - Search functionality for micronizations
 * - Data table with micronization records
 * - Material source indicators and SKU tracking
 * - Recovery percentage calculations
 * - PDF report viewing
 * - Edit/Duplicate/Delete actions
 * - Empty state display
 * 
 * Dependencies:
 * - Alpine.js data: activeTab, micronizationSearch, filteredMicronizations
 * - Alpine.js methods: exportData, openMicronizationForm, searchMicronizations, duplicateMicronization, deleteMicronization, openPDFModal
 * - Global styling: Standard table and button classes
 */

/**
 * Returns the complete HTML for the Micronization tab component
 * @returns {string} HTML string for the Micronization tab
 */
function getMicronizationTabHtml() {
  return `
    <!-- Micronization Tab -->
    <div x-show="activeTab === 'micronization'" x-cloak>
      <div class="mb-6 flex justify-between items-center">
        <h2 class="text-xl font-semibold">Micronization Processing</h2>
        <div class="flex space-x-2">
          <button @click="exportData('micronization')" class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 touch-target">
            Export CSV
          </button>
          <button @click="openMicronizationForm()" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 touch-target">
            Add Micronization
          </button>
          <button @click="openMCBForm()" class="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 touch-target">
            Create MCB
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <input
          type="text"
          x-model="micronizationSearch"
          @input="searchMicronizations()"
          placeholder="Search micronization numbers, SKUs, materials, Dx50..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        >
      </div>

      <!-- Micronizations Table -->
      <div class="overflow-x-auto border border-gray-200 rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Micronization #
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Material Source
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                SKU
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Location
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Starting Amount (g)
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Recovered Amount (g)
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Recovery %
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Grind Pressure (psi)
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Dx50 (µm)
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Report
              </th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template x-for="micronization in filteredMicronizations" :key="micronization.id">
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <div class="flex items-center space-x-2">
                    <span class="font-medium" x-text="micronization.micronizationNumber"></span>
                    <template x-if="micronization.isMCB">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        MCB
                      </span>
                    </template>
                  </div>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <span x-text="window.formatDateSafe(micronization.date)"></span>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <div class="flex items-center space-x-2">
                    <template x-if="!micronization.isMCB">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            :class="micronization.grapheneSample ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'"
                            x-text="micronization.grapheneSample ? 'G' : 'CB'"></span>
                    </template>
                    <template x-if="micronization.isMCB">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        MCB
                      </span>
                    </template>
                    <span x-text="micronization.isMCB ? ((micronization.mcbName ? micronization.mcbName + ' - ' : '') + micronization.micronizationCount + ' batches') : (micronization.grapheneSample || micronization.compoundBatchNumber || '—')"></span>
                  </div>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <span class="font-medium" x-text="micronization.sku || '—'"></span>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <span x-text="micronization.isMCB ? (micronization.mcbLocation || '—') : (micronization.micronizationLocation || '—')"></span>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <span x-text="micronization.startingMaterialAmount || '—'"></span>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <span x-text="micronization.recoveredAmount || '—'"></span>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <span class="font-medium" 
                        x-text="(micronization.startingMaterialAmount && micronization.recoveredAmount) ? 
                        ((micronization.recoveredAmount / micronization.startingMaterialAmount * 100).toFixed(1) + '%') : '—'"></span>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <span x-text="micronization.grindPressure || '—'"></span>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <span x-text="micronization.dx50 || '—'"></span>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <template x-if="micronization.micronizationReportPath">
                    <button @click="openPDFModal(micronization.micronizationReportPath, 'Micronization Report')" 
                            class="text-link hover:text-link-hover" title="View PDF">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </button>
                  </template>
                  <template x-if="!micronization.micronizationReportPath">
                    <span class="text-gray-400">—</span>
                  </template>
                </td>
                <td class="px-4 py-3 text-right text-xs font-mono" style="color: #212121;">
                  <div class="flex justify-end space-x-2">
                    <button @click="micronization.isMCB ? openMCBForm(micronization) : openMicronizationForm(micronization)"
                            class="text-link hover:text-link-hover" title="Edit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button @click="micronization.isMCB ? duplicateMCB(micronization) : duplicateMicronization(micronization)"
                            class="text-gray-400 hover:text-gray-600" title="Duplicate">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    </button>
                    <button @click="micronization.isMCB ? deleteMCB(micronization.id) : deleteMicronization(micronization.id)"
                            class="text-red-400 hover:text-red-600" title="Delete">
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

      <!-- Empty State -->
      <div x-show="filteredMicronizations.length === 0" class="text-center py-8 text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
        </svg>
        <p>No micronizations found</p>
      </div>

    </div>
  `;
}

// Export for use in the main application
export { getMicronizationTabHtml };