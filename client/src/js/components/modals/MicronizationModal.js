/**
 * Micronization Add/Edit Modal Component
 * 
 * Provides the micronization process creation and editing interface including:
 * - Basic information (micronization number, date, location)
 * - Material source selection (graphene experiment or compound batch)
 * - Processing parameters (starting/recovered amounts, pressure, Dx50)
 * - SKU tracking and recovery rate calculation
 * - Report file upload functionality
 * 
 * Dependencies:
 * - Alpine.js data: micronizationForm, editingMicronization, showAddMicronization
 * - Alpine.js methods: saveMicronization()
 * - Component helpers: getDateFieldHtml, getSelectFieldHtml, getNumericFieldHtml, getFileFieldHtml
 * - Dropdown arrays: micronizationLocations
 * - Modal state variables: showAddLocation
 */

function getMicronizationModalHtml() {
  return `
    <!-- Micronization Add/Edit Modal -->
    <div x-show="showMicronizationModal" x-cloak
         @click.away="showMicronizationModal = false; editingMicronization = null"
         class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white rounded-none md:rounded-lg w-full md:max-w-3xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <h3 class="text-lg font-semibold mb-4" x-text="editingMicronization ? 'Edit Micronization Record' : 'Add Micronization Record'"></h3>

          <form @submit.prevent="saveMicronization()" class="space-y-6">
            <!-- Basic Information -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Basic Information</h4>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Micronization #</label>
                  <input type="text" x-model="micronizationForm.micronizationNumber" required
                         placeholder="M001"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
                <div x-html="getDateFieldHtml({
                  label: 'Date',
                  dateModelVariable: 'micronizationForm.date',
                  unknownModelVariable: 'micronizationForm.dateUnknown'
                })"></div>
                <div x-html="getSelectFieldHtml({
                  label: 'Location',
                  modelVariable: 'micronizationForm.micronizationLocation',
                  optionsArray: 'micronizationLocations',
                  showModalVariable: 'showAddLocation',
                  placeholder: 'Select location...',
                  addNewText: 'Location',
                  resetValue: 'Curia Albany'
                })"></div>
              </div>
            </div>

            <!-- Material Source Selection -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Material Source</h4>
              <div class="space-y-4">
                <!-- Material Source Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">What are you micronizing?</label>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input type="radio" x-model="micronizationForm.materialType" value="graphene"
                             class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2">
                      <span class="text-sm">Individual Graphene</span>
                    </label>
                    <label class="flex items-center">
                      <input type="radio" x-model="micronizationForm.materialType" value="compoundBatch"
                             class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2">
                      <span class="text-sm">Compound Batch</span>
                    </label>
                  </div>
                </div>

                <!-- Graphene Sample Selection -->
                <div x-show="micronizationForm.materialType === 'graphene'" x-transition>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Graphene Sample *</label>
                  <select x-model="micronizationForm.grapheneSample" :required="micronizationForm.materialType === 'graphene'"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                    <option value="">Select graphene sample...</option>
                    <template x-for="graphene in grapheneRecords" :key="graphene.experimentNumber">
                      <option :value="graphene.experimentNumber" 
                              x-text="graphene.experimentNumber + ' (' + (graphene.output || 'No output') + 'g) - ' + (graphene.species || 'No species')"></option>
                    </template>
                  </select>
                </div>

                <!-- Compound Batch Selection -->
                <div x-show="micronizationForm.materialType === 'compoundBatch'" x-transition>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Compound Batch *</label>
                  <select x-model="micronizationForm.compoundBatchNumber" :required="micronizationForm.materialType === 'compoundBatch'"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                    <option value="">Select compound batch...</option>
                    <template x-for="batch in compoundBatches" :key="batch.batchNumber">
                      <option :value="batch.batchNumber"
                              x-text="batch.batchNumber + ' (' + (batch.totalOutput || 'No output') + 'g) - ' + (batch.batchName || 'No name')"></option>
                    </template>
                  </select>
                </div>
              </div>
            </div>

            <!-- Processing Parameters -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Processing Parameters</h4>
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Starting Material Amount (g)</label>
                  <input type="number" step="0.01" x-model="micronizationForm.startingMaterialAmount"
                         required
                         placeholder=""
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Recovered Amount (g)</label>
                  <input type="number" step="0.01" x-model="micronizationForm.recoveredAmount"
                         placeholder=""
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Grind Pressure (PSI)</label>
                  <input type="number" x-model="micronizationForm.grindPressure" 
                         placeholder="2000"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Dx50</label>
                  <input type="text" x-model="micronizationForm.dx50" 
                         placeholder="3.88µm"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
              </div>
            </div>

            <!-- SKU and Output -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Tracking Information</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input type="text" x-model="micronizationForm.sku"
                         placeholder="Auto-generated or custom"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Recovery Rate (%)</label>
                  <input type="text"
                         :value="micronizationForm.recoveredAmount && micronizationForm.startingMaterialAmount ?
                                 ((parseFloat(micronizationForm.recoveredAmount) / parseFloat(micronizationForm.startingMaterialAmount)) * 100).toFixed(1) + '%' :
                                 'Enter amounts to calculate'"
                         readonly
                         class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600">
                </div>
              </div>
            </div>

            <!-- Report Upload -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Report</h4>
              <div x-html="getFileFieldHtml({
                label: 'Micronization Report',
                fileInputName: 'micronizationReportFile',
                currentFileVariable: 'micronizationForm.micronizationReportPath',
                acceptTypes: '.pdf'
              })"></div>
            </div>
            
            <!-- Comments -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Comments</label>
              <textarea x-model="micronizationForm.comments" rows="2"
                        placeholder="Additional notes about the micronization process..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"></textarea>
            </div>

            <div class="flex justify-end space-x-2 pt-4">
              <button type="button" @click="showMicronizationModal = false; editingMicronization = null; micronizationForm = {}"
                      class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit"
                      class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800">
                <span x-text="(editingMicronization ? 'Update' : 'Create') + ' Micronization Record'"></span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Export for use in the main application
export { getMicronizationModalHtml };