/**
 * BET Add/Edit Modal Component
 * 
 * Provides the complete BET (Brunauer-Emmett-Teller) surface area analysis modal including:
 * - Dynamic modal title (Add vs Edit)
 * - Date field with unknown checkbox
 * - Material type selection (Individual Graphene vs Compound Batch)
 * - Sample selection dropdowns
 * - Mass measurement input
 * - Research team and testing lab dropdowns
 * - Scientific notation surface area fields
 * - PDF report upload functionality
 * - Comments textarea
 * - Form validation and submission
 * 
 * Dependencies:
 * - Alpine.js data: showAddBet, editingBet, betForm, availableGrapheneSamples, compoundBatches, researchTeams, testingLabs
 * - Alpine.js methods: saveBet()
 * - Form field helpers: getDateFieldHtml, getNumericFieldHtml, getFileFieldHtml
 * - Global styling: Standard form classes and button styles
 */

/**
 * Returns the complete HTML for the BET modal component
 * @returns {string} HTML string for the BET modal
 */
function getBETModalHtml() {
  return `
    <!-- BET Add/Edit Modal -->
    <div x-show="showAddBet" x-cloak
         @click.away="showAddBet = false; editingBet = null"
         class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white rounded-none md:rounded-lg w-full md:max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <h3 class="text-lg font-semibold mb-4" x-text="editingBet ? 'Edit BET Record' : 'Add BET Record'"></h3>
          
          <form @submit.prevent="saveBet()" class="space-y-4">
            <div class="grid grid-cols-1 gap-4">
              <div x-html="getDateFieldHtml({
                label: 'Test Date', 
                dateModelVariable: 'betForm.testDate',
                unknownModelVariable: 'betForm.dateUnknown'
              })"></div>
            </div>

            <!-- Material Type Selection -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Sample Source</label>
              <div class="flex space-x-4">
                <label class="flex items-center">
                  <input type="radio" x-model="betForm.materialType" value="graphene" class="mr-2">
                  <span>Individual Graphene Batch</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" x-model="betForm.materialType" value="compound" class="mr-2">
                  <span>Compound Batch</span>
                </label>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div x-show="betForm.materialType === 'graphene'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Graphene Sample</label>
                <select x-model="betForm.grapheneSample" 
                        name="grapheneSample"
                        @change="betForm.compoundBatchNumber = ''"
                        :required="betForm.materialType === 'graphene'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select graphene sample...</option>
                  <template x-for="exp in availableGrapheneSamples" :key="exp">
                    <option :value="exp" x-text="exp"></option>
                  </template>
                </select>
              </div>
              <div x-show="betForm.materialType === 'compound'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Compound Batch</label>
                <select x-model="betForm.compoundBatchNumber"
                        name="compoundBatchNumber"
                        @change="betForm.grapheneSample = ''"
                        :required="betForm.materialType === 'compound'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select compound batch...</option>
                  <template x-for="batch in compoundBatches" :key="batch.id">
                    <option :value="batch.batchNumber" 
                            x-text="\`\${batch.batchNumber} - \${batch.batchName || 'Unnamed'} (\${batch.totalOutput || 0}g)\`"></option>
                  </template>
                </select>
              </div>
              <div x-html="getNumericFieldHtml({
                label: 'Mass',
                unit: 'g',
                modelVariable: 'betForm.mass',
                inputType: 'number',
                step: '0.0001',
                placeholder: 'Sample mass in grams'
              })"></div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Research Team</label>
                <select x-model="betForm.researchTeam" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <template x-for="team in researchTeams" :key="team">
                    <option :value="team" x-text="team"></option>
                  </template>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Testing Lab</label>
                <select x-model="betForm.testingLab" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <template x-for="lab in testingLabs" :key="lab">
                    <option :value="lab" x-text="lab"></option>
                  </template>
                </select>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div x-html="getNumericFieldHtml({
                label: 'Multipoint BET Area',
                unit: 'm²/g',
                modelVariable: 'betForm.multipointBetArea',
                inputType: 'text',
                placeholder: 'e.g., 1.88e3 or 1880'
              })"></div>
              <div x-html="getNumericFieldHtml({
                label: 'Langmuir Surface Area',
                unit: 'm²/g',
                modelVariable: 'betForm.langmuirSurfaceArea',
                inputType: 'text',
                placeholder: 'e.g., 2.34e3 or 2340'
              })"></div>
            </div>
            
            <div x-html="getFileFieldHtml({
              label: 'BET Report (PDF)',
              fileModelVariable: 'betForm.betReportFile',
              editingVariable: 'editingBet',
              currentFilePathField: 'betReportPath',
              removeFileVariable: 'betForm.removeBetReport'
            })"></div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Comments</label>
              <textarea x-model="betForm.comments" rows="3"
                        placeholder="Additional notes about the BET analysis..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button type="button" @click="showAddBet = false; editingBet = null; betForm = {}" 
                      class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800">
                <span x-text="editingBet ? 'Update' : 'Create'"></span> Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Export for use in main application
window.getBETModalHtml = getBETModalHtml;