/**
 * Conductivity Add/Edit Modal Component
 * 
 * Provides the complete Conductivity test modal including:
 * - Dynamic modal title (Add vs Edit)
 * - Date field with unknown checkbox
 * - Material type selection (Individual Graphene vs Compound Batch)
 * - Sample selection dropdowns
 * - Name and description fields
 * - Multi-pressure conductivity measurements (1kN, 8kN, 12kN, 20kN)
 * - File upload functionality for reports
 * - Comments textarea
 * - Form validation and submission
 * 
 * Dependencies:
 * - Alpine.js data: showAddConductivity, editingConductivity, conductivityForm, availableGrapheneSamples, compoundBatches
 * - Alpine.js methods: saveConductivity()
 * - Form field helpers: getDateFieldHtml, getFileFieldHtml
 * - Global styling: Standard form classes and button styles
 */

/**
 * Returns the complete HTML for the Conductivity modal component
 * @returns {string} HTML string for the Conductivity modal
 */
function getConductivityModalHtml() {
  return `
    <!-- Conductivity Add/Edit Modal -->
    <div x-show="showAddConductivity" x-cloak
         @click.away="showAddConductivity = false; editingConductivity = null"
         class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white rounded-none md:rounded-lg w-full md:max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <h3 class="text-lg font-semibold mb-4" x-text="editingConductivity ? 'Edit Conductivity Test' : 'Add Conductivity Test'"></h3>
          
          <form @submit.prevent="saveConductivity()" class="space-y-4">
            <div class="grid grid-cols-1 gap-4">
              <div x-html="getDateFieldHtml({
                label: 'Test Date', 
                dateModelVariable: 'conductivityForm.testDate',
                unknownModelVariable: 'conductivityForm.dateUnknown'
              })"></div>
            </div>

            <!-- Material Type Selection -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Sample Source</label>
              <div class="flex space-x-4">
                <label class="flex items-center">
                  <input type="radio" x-model="conductivityForm.materialType" value="graphene" class="mr-2">
                  <span>Individual Graphene Batch</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" x-model="conductivityForm.materialType" value="compound" class="mr-2">
                  <span>Compound Batch</span>
                </label>
              </div>
            </div>
            
            <div x-show="conductivityForm.materialType === 'graphene'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Graphene Sample</label>
              <select x-model="conductivityForm.grapheneSample" 
                      name="grapheneSample"
                      @change="conductivityForm.compoundBatchNumber = ''"
                      :required="conductivityForm.materialType === 'graphene'"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                <option value="">Select graphene sample...</option>
                <template x-for="exp in availableGrapheneSamples" :key="exp">
                  <option :value="exp" x-text="exp"></option>
                </template>
              </select>
            </div>
            <div x-show="conductivityForm.materialType === 'compound'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Compound Batch</label>
              <select x-model="conductivityForm.compoundBatchNumber"
                      name="compoundBatchNumber"
                      @change="conductivityForm.grapheneSample = ''"
                      :required="conductivityForm.materialType === 'compound'"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                <option value="">Select compound batch...</option>
                <template x-for="batch in compoundBatches" :key="batch.id">
                  <option :value="batch.batchNumber" 
                          x-text="\`\${batch.batchNumber} - \${batch.batchName || 'Unnamed'} (\${batch.totalOutput || 0}g)\`"></option>
                </template>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" x-model="conductivityForm.name" 
                     placeholder="Test name or identifier..."
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea x-model="conductivityForm.description" rows="3"
                        placeholder="Test conditions, setup, methodology..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"></textarea>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">1kN Conductivity (S/cm²)</label>
                <input type="number" step="any" x-model="conductivityForm.conductivity1kN" 
                       placeholder="0.000001"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">8kN Conductivity (S/cm²)</label>
                <input type="number" step="any" x-model="conductivityForm.conductivity8kN" 
                       placeholder="0.000001"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">12kN Conductivity (S/cm²)</label>
                <input type="number" step="any" x-model="conductivityForm.conductivity12kN" 
                       placeholder="0.000001"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">20kN Conductivity (S/cm²)</label>
                <input type="number" step="any" x-model="conductivityForm.conductivity20kN" 
                       placeholder="0.000001"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Comments</label>
              <textarea x-model="conductivityForm.comments" rows="3"
                        placeholder="Additional notes about the conductivity test..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"></textarea>
            </div>

            <div x-html="getFileFieldHtml({
              label: 'Conductivity Report',
              fileModelVariable: 'conductivityForm.conductivityReportFile',
              editingVariable: 'editingConductivity',
              currentFilePathField: 'conductivityReportPath',
              removeFileVariable: 'conductivityForm.removeConductivityReport',
              acceptTypes: '.pdf,.xlsx,.xls,.xlsm',
              required: false
            })"></div>
            
            <div class="flex justify-end space-x-3">
              <button type="button" @click="showAddConductivity = false; editingConductivity = null; conductivityForm = {}" 
                      class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800">
                <span x-text="editingConductivity ? 'Update' : 'Create'"></span> Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Export for use in main application
window.getConductivityModalHtml = getConductivityModalHtml;