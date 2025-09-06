/**
 * TEM Add/Edit Modal Component
 * 
 * Provides the complete TEM (Transmission Electron Microscopy) analysis modal including:
 * - Dynamic modal title (Add vs Edit)
 * - Date field with unknown checkbox
 * - Material type selection (Individual Graphene vs Compound Batch)
 * - Sample selection dropdowns
 * - Research team and testing lab dropdowns
 * - PDF report upload functionality
 * - Comments textarea
 * - Form validation and submission
 * 
 * Dependencies:
 * - Alpine.js data: showAddTem, editingTem, temForm, availableGrapheneSamples, compoundBatches, researchTeams, testingLabs
 * - Alpine.js methods: saveTem()
 * - Form field helpers: getDateFieldHtml, getFileFieldHtml
 * - Global styling: Standard form classes and button styles
 */

/**
 * Returns the complete HTML for the TEM modal component
 * @returns {string} HTML string for the TEM modal
 */
function getTEMModalHtml() {
  return `
    <!-- TEM Add/Edit Modal -->
    <div x-show="showAddTem" x-cloak
         @click.away="showAddTem = false; editingTem = null"
         class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white rounded-none md:rounded-lg w-full md:max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <h3 class="text-lg font-semibold mb-4" x-text="editingTem ? 'Edit TEM Test' : 'Add TEM Test'"></h3>
          
          <form @submit.prevent="saveTem()" class="space-y-4">
            <div class="grid grid-cols-1 gap-4">
              <div x-html="getDateFieldHtml({
                label: 'Test Date', 
                dateModelVariable: 'temForm.testDate',
                unknownModelVariable: 'temForm.dateUnknown'
              })"></div>
            </div>
            
            <!-- Sample Source Selection -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Sample Source</label>
              <div class="flex space-x-4">
                <label class="flex items-center">
                  <input type="radio" x-model="temForm.materialType" value="graphene" class="mr-2">
                  <span>Individual Graphene Batch</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" x-model="temForm.materialType" value="compound" class="mr-2">
                  <span>Compound Batch</span>
                </label>
              </div>
            </div>
            
            <div class="grid grid-cols-1 gap-4">
              <div x-show="temForm.materialType === 'graphene'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Graphene Sample</label>
                <select x-model="temForm.grapheneSample" 
                        name="grapheneSample"
                        @change="temForm.compoundBatchNumber = ''"
                        :required="temForm.materialType === 'graphene'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select graphene sample...</option>
                  <template x-for="exp in availableGrapheneSamples" :key="exp">
                    <option :value="exp" x-text="exp"></option>
                  </template>
                </select>
              </div>
              <div x-show="temForm.materialType === 'compound'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Compound Batch</label>
                <select x-model="temForm.compoundBatchNumber"
                        name="compoundBatchNumber"
                        @change="temForm.grapheneSample = ''"
                        :required="temForm.materialType === 'compound'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select compound batch...</option>
                  <template x-for="batch in compoundBatches" :key="batch.id">
                    <option :value="batch.batchNumber" 
                            x-text="\`\${batch.batchNumber} - \${batch.batchName || 'Unnamed'} (\${batch.totalOutput || 0}g)\`"></option>
                  </template>
                </select>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Research Team</label>
                <select x-model="temForm.researchTeam" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <template x-for="team in researchTeams" :key="team">
                    <option :value="team" x-text="team"></option>
                  </template>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Testing Lab</label>
                <select x-model="temForm.testingLab" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <template x-for="lab in testingLabs" :key="lab">
                    <option :value="lab" x-text="lab"></option>
                  </template>
                </select>
              </div>
            </div>
            
            <div x-html="getFileFieldHtml({
              label: 'TEM Report (PDF)',
              fileModelVariable: 'temForm.temReportFile',
              editingVariable: 'editingTem',
              currentFilePathField: 'temReportPath',
              removeFileVariable: 'temForm.removeTEMReport'
            })"></div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Comments</label>
              <textarea x-model="temForm.comments" rows="3"
                        placeholder="Additional notes about the TEM analysis..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button type="button" @click="showAddTem = false; editingTem = null; temForm = {}" 
                      class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800">
                <span x-text="editingTem ? 'Update' : 'Create'"></span> Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Export for use in main application
window.getTEMModalHtml = getTEMModalHtml;