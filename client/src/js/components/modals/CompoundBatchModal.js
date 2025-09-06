/**
 * Compound Batch Add/Edit Modal Component
 * 
 * Provides the compound batch creation and editing interface including:
 * - Basic information (batch number, batch name)
 * - Date selection with unknown checkbox
 * - Interactive experiment selection with search functionality
 * - Real-time total output calculation
 * - Description field
 * 
 * Dependencies:
 * - Alpine.js data: compoundBatchForm, editingCompoundBatch, showCompoundBatchModal, experimentSearchTerm
 * - Alpine.js methods: saveCompoundBatch(), closeCompoundBatchForm(), getFilteredExperiments(), toggleExperimentSelection()
 * - Component helpers: getDateFieldHtml, getNumericFieldHtml
 * - Experiment data for selection interface
 */

function getCompoundBatchModalHtml() {
  return `
    <!-- Compound Batch Modal -->
    <div x-show="showCompoundBatchModal" x-cloak
         @click.away="closeCompoundBatchForm()"
         class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white rounded-none md:rounded-lg w-full md:max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <h3 class="text-lg font-semibold mb-4" x-text="editingCompoundBatch ? 'Edit Compound Batch' : 'Create Compound Batch'"></h3>
          
          <form @submit.prevent="saveCompoundBatch()" class="space-y-6">
            <!-- Basic Information -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Basic Information</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Batch Number *</label>
                  <input type="text" x-model="compoundBatchForm.batchNumber" required
                         placeholder="CB001"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
                  <input type="text" x-model="compoundBatchForm.batchName"
                         placeholder="Optional descriptive name"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
              </div>
            </div>
            
            <!-- Date -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Date</h4>
              <div class="grid grid-cols-1 gap-4">
                <div x-html="getDateFieldHtml({
                  label: 'Created Date',
                  dateModelVariable: 'compoundBatchForm.createdDate',
                  unknownModelVariable: 'compoundBatchForm.dateUnknown'
                })"></div>
              </div>
            </div>
            
            <!-- Select Experiments -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Select Graphene Experiments</h4>
              
              <!-- Search bar for experiments -->
              <div class="mb-3">
                <input
                  type="text"
                  x-model="experimentSearchTerm"
                  placeholder="Search experiments by number, species, date..."
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                >
              </div>
              
              <!-- Experiment selection list -->
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div class="space-y-2">
                  <template x-for="record in getFilteredExperiments()" :key="record.id">
                    <div class="flex items-center space-x-3 p-2 bg-white border border-gray-200 rounded hover:bg-blue-50">
                      <input 
                        type="checkbox" 
                        :checked="compoundBatchForm.experimentIds.includes(record.id)"
                        @change="toggleExperimentSelection(record.id)"
                        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      >
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                          <span class="font-mono font-semibold text-sm text-gray-900" x-text="record.experimentNumber"></span>
                          <span class="text-xs text-gray-500" x-text="record.output ? record.output + 'g' : 'No output'"></span>
                        </div>
                        <div class="flex items-center space-x-4 mt-1">
                          <span class="text-xs text-gray-500" x-text="record.experimentDate ? new Date(record.experimentDate).toLocaleDateString() : 'No date'"></span>
                          <span class="text-xs text-gray-500" x-text="record.species || 'No species'"></span>
                          <span class="text-xs text-gray-500" x-text="record.biocharExperiment ? 'Biochar: ' + record.biocharExperiment : (record.biocharLotNumber ? 'Lot: ' + record.biocharLotNumber : 'Various biochar')"></span>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
                
                <!-- No experiments found -->
                <div x-show="getFilteredExperiments().length === 0" class="text-center py-4 text-gray-500">
                  <p class="text-sm">No experiments found</p>
                </div>
              </div>
              
              <!-- Selected count -->
              <div class="mt-2 text-sm text-gray-600">
                <span x-text="compoundBatchForm.experimentIds.length"></span> experiment<span x-show="compoundBatchForm.experimentIds.length !== 1">s</span> selected
              </div>
            </div>
            
            <!-- Output and Details -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Output & Details</h4>
              <div class="grid grid-cols-1 gap-4">
                <div x-html="getNumericFieldHtml({
                  label: 'Total Output',
                  unit: 'g',
                  modelVariable: 'compoundBatchForm.totalOutput',
                  inputType: 'number',
                  step: '0.01',
                  placeholder: 'Calculated from selected experiments'
                })"></div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea x-model="compoundBatchForm.description" rows="3"
                            placeholder="Purpose or description of this compound batch..."
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"></textarea>
                </div>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button type="button" @click="closeCompoundBatchForm()" 
                      class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800">
                <span x-text="editingCompoundBatch ? 'Update' : 'Create'"></span> Compound Batch
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Export for use in the main application
export { getCompoundBatchModalHtml };