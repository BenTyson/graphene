/**
 * Particle Size Test Results Tab Component
 *
 * Provides the complete Particle Size analysis interface including:
 * - Header with title and action buttons
 * - Search functionality for samples, labs, and methods
 * - Data table with test records showing date, sample, D10/D50/D90 values, lab, PDF report links
 * - PDF/Image viewing integration (supports PDF, JPG, PNG)
 * - Edit/Delete actions
 * - Support for Graphene, Compound Batch, Micronization, and MCB samples
 *
 * Dependencies:
 * - Alpine.js data: particleSizeRecords, particleSizeSearch
 * - Alpine.js methods: exportData, initParticleSizeForm, loadParticleSizeRecords, viewParticleSizePdf, editParticleSize, deleteParticleSize
 * - Alpine.js state: activeTab
 * - Utility functions: Date formatting
 */

/**
 * Returns the complete HTML for the Particle Size tab component
 * @returns {string} HTML string for the Particle Size tab
 */
function getParticleSizeTabHtml() {
  return `
    <!-- Particle Size Test Results Tab -->
    <div x-show="activeTab === 'test-particle-size'" x-cloak>
      <div class="mb-6 flex justify-between items-center">
        <h2 class="text-xl font-semibold">Particle Size Analysis Results</h2>
        <div class="flex space-x-2">
          <button @click="exportData('test-particle-size')" class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 touch-target">
            Export CSV
          </button>
          <button @click="initParticleSizeForm()" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 touch-target">
            Add Record
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <input
          type="text"
          x-model="particleSizeSearch"
          @input="loadParticleSizeRecords()"
          placeholder="Search samples, labs, methods..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        >
      </div>

      <!-- Particle Size Table -->
      <div class="overflow-x-auto border border-gray-200 rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-100">
            <tr>
              <th class="table-cell-standard">Test Date</th>
              <th class="table-cell-standard">Sample</th>
              <th class="table-cell-standard">D10 (μm)</th>
              <th class="table-cell-standard">D50 (μm)</th>
              <th class="table-cell-standard">D90 (μm)</th>
              <th class="table-cell-standard">Testing Lab</th>
              <th class="table-cell-standard">Testing Method</th>
              <th class="table-cell-standard">Comments</th>
              <th class="table-cell-standard">Report</th>
              <th class="table-cell-standard">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template x-if="particleSizeRecords.length === 0">
              <tr>
                <td colspan="10" class="table-cell-compact text-center text-gray-500 py-8">
                  No Particle Size records found
                </td>
              </tr>
            </template>
            <template x-for="record in particleSizeRecords" :key="record.id">
              <tr class="hover:bg-gray-50">
                <td class="table-cell-compact" x-text="record.testDate ? window.formatDateSafe(record.testDate) : ''"></td>
                <td class="table-cell-compact">
                  <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          :class="{
                            'bg-blue-100 text-blue-800': record.grapheneSample,
                            'bg-green-100 text-green-800': record.compoundBatchNumber,
                            'bg-purple-100 text-purple-800': record.micronizationSku,
                            'bg-orange-100 text-orange-800': record.mcbNumber
                          }"
                          x-text="record.grapheneSample ? 'G' : record.compoundBatchNumber ? 'CB' : record.micronizationSku ? 'M' : 'MCB'"></span>
                    <span x-text="record.grapheneSample || record.compoundBatchNumber || record.micronizationSku || record.mcbNumber" class="text-link font-medium"></span>
                  </div>
                </td>
                <td class="table-cell-compact font-mono text-sm" x-text="record.d10 !== null ? record.d10.toFixed(2) : '-'"></td>
                <td class="table-cell-compact font-mono text-sm font-semibold" x-text="record.d50 !== null ? record.d50.toFixed(2) : '-'"></td>
                <td class="table-cell-compact font-mono text-sm" x-text="record.d90 !== null ? record.d90.toFixed(2) : '-'"></td>
                <td class="table-cell-compact" x-text="record.testingLab || '-'"></td>
                <td class="table-cell-compact" x-text="record.testingMethod || '-'"></td>
                <td class="table-cell-compact text-center">
                  <template x-if="record.comments && record.comments.trim()">
                    <button @click="$dispatch('show-comment-modal', { comment: record.comments })"
                            class="text-gray-600 hover:text-gray-900"
                            title="View comment">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                      </svg>
                    </button>
                  </template>
                  <template x-if="!record.comments || !record.comments.trim()">
                    <span class="text-gray-400">-</span>
                  </template>
                </td>
                <td class="table-cell-compact">
                  <template x-if="record.particleSizeReportPath">
                    <button @click="viewParticleSizePdf(record.particleSizeReportPath)" class="text-link text-link-hover">
                      View Report
                    </button>
                  </template>
                  <template x-if="!record.particleSizeReportPath">
                    <span class="text-gray-400">No report</span>
                  </template>
                </td>
                <td class="table-cell-actions-compact">
                  <div class="flex justify-end space-x-2">
                    <button @click="editParticleSize(record)" class="text-link hover:text-link-hover" title="Edit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button @click="deleteParticleSize(record.id)" class="text-red-400 hover:text-red-600" title="Delete">
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

      <!-- Comment Modal -->
      <div x-data="{ showCommentModal: false, currentComment: '' }"
           @show-comment-modal.window="showCommentModal = true; currentComment = $event.detail.comment"
           x-show="showCommentModal"
           x-cloak
           @click.away="showCommentModal = false"
           class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4">
          <div class="fixed inset-0 bg-black opacity-50"></div>
          <div class="relative bg-white rounded-lg w-full max-w-lg p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Comment</h3>
              <button @click="showCommentModal = false" class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <p class="text-sm text-gray-700 whitespace-pre-wrap" x-text="currentComment"></p>
            </div>
            <div class="mt-4 flex justify-end">
              <button @click="showCommentModal = false"
                      class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Export for use in main application
window.getParticleSizeTabHtml = getParticleSizeTabHtml;
