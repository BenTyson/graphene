/**
 * MCB (Micronized Compound Batch) Modal Component
 *
 * Provides interface for creating and editing MCBs by combining existing micronizations:
 * - MCB identification (number and name)
 * - Multi-select existing micronizations
 * - Auto-calculated total recovered amount
 * - Comments
 *
 * Dependencies:
 * - Alpine.js data: mcbForm, editingMCB, showMCBModal, availableMicronizations
 * - Alpine.js methods: saveMCB(), closeMCBForm()
 */

function getMCBModalHtml() {
  return `
    <!-- MCB Add/Edit Modal -->
    <div x-show="showMCBModal" x-cloak
         @click.away="showMCBModal = false; editingMCB = null"
         class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white rounded-none md:rounded-lg w-full md:max-w-3xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <h3 class="text-lg font-semibold mb-4 flex items-center space-x-2">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
              MCB
            </span>
            <span x-text="editingMCB ? 'Edit Micronized Compound Batch' : 'Create Micronized Compound Batch'"></span>
          </h3>

          <form @submit.prevent="saveMCB()" class="space-y-6">
            <!-- MCB Identification -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">MCB Identification</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">MCB Number *</label>
                  <input type="text" x-model="mcbForm.mcbNumber" required
                         placeholder="MCB001"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <p class="text-xs text-gray-500 mt-1">Unique identifier / SKU for this MCB</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <select x-model="mcbForm.mcbLocation" required
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                    <option value="">Select location...</option>
                    <template x-for="location in micronizationLocations" :key="location">
                      <option :value="location" x-text="location"></option>
                    </template>
                  </select>
                  <p class="text-xs text-gray-500 mt-1">Where MCB is stored</p>
                </div>
              </div>
              <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Combined Date *</label>
                <input type="date" x-model="mcbForm.combinedDate" required
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                <p class="text-xs text-gray-500 mt-1">Date when micronizations were combined into this MCB</p>
              </div>
            </div>

            <!-- Select Micronizations -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Select Micronizations to Combine *</h4>
              <div class="border border-gray-300 rounded-md p-3 max-h-64 overflow-y-auto bg-gray-50">
                <template x-if="availableMicronizations && availableMicronizations.length > 0">
                  <div class="space-y-2">
                    <template x-for="micro in availableMicronizations" :key="micro.id">
                      <label class="flex items-center p-3 hover:bg-white rounded cursor-pointer border border-transparent hover:border-gray-300 transition-colors">
                        <input type="checkbox" :value="micro.id"
                               x-model="mcbForm.selectedMicronizationIds"
                               @change="mcbForm.totalRecoveredAmount = availableMicronizations.filter(m => mcbForm.selectedMicronizationIds.includes(m.id)).reduce((sum, m) => sum + (m.recoveredAmount || 0), 0)"
                               class="rounded border-gray-300 text-gray-600 focus:ring-gray-500 mr-3">
                        <div class="flex-1">
                          <div class="flex items-center space-x-2">
                            <span class="font-medium text-sm" x-text="micro.micronizationNumber"></span>
                            <span class="text-xs text-gray-500" x-text="'(' + (micro.recoveredAmount || 0) + 'g)'"></span>
                          </div>
                          <div class="text-xs text-gray-600">
                            <span x-text="'SKU: ' + (micro.sku || 'No SKU')"></span>
                            <template x-if="micro.grapheneSample">
                              <span x-text="' • From: ' + micro.grapheneSample"></span>
                            </template>
                            <template x-if="micro.compoundBatchNumber">
                              <span x-text="' • From: ' + micro.compoundBatchNumber"></span>
                            </template>
                          </div>
                        </div>
                      </label>
                    </template>
                  </div>
                </template>
                <template x-if="!availableMicronizations || availableMicronizations.length === 0">
                  <div class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                    <p class="text-sm text-gray-500">No available micronizations</p>
                    <p class="text-xs text-gray-400 mt-1">All micronizations are already in MCBs</p>
                  </div>
                </template>
              </div>
              <p class="text-xs text-gray-500 mt-2">
                <span class="inline-flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                  </svg>
                  Only micronizations not already in other MCBs are shown
                </span>
              </p>
            </div>

            <!-- Summary -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Summary</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Selected Batches</label>
                  <input type="text" :value="mcbForm.selectedMicronizationIds.length + ' micronization' + (mcbForm.selectedMicronizationIds.length !== 1 ? 's' : '')" readonly
                         class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Total Recovered Amount (g)</label>
                  <input type="text" :value="(mcbForm.totalRecoveredAmount || 0).toFixed(2) + ' g'" readonly
                         class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600 font-medium">
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-2">Auto-calculated from selected micronizations</p>
            </div>

            <!-- Comments -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Comments</label>
              <textarea x-model="mcbForm.comments" rows="3"
                        placeholder="Optional notes about this MCB..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"></textarea>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-2 pt-4 border-t">
              <button type="button" @click="closeMCBForm()"
                      class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit"
                      :disabled="mcbForm.selectedMicronizationIds.length === 0"
                      :class="mcbForm.selectedMicronizationIds.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'"
                      class="px-4 py-2 text-sm bg-black text-white rounded">
                <span x-text="editingMCB ? 'Update MCB' : 'Create MCB'"></span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Export for use in the main application
export { getMCBModalHtml };
