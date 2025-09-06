/**
 * Biochar Add/Edit Modal Component
 * 
 * Provides the biochar experiment creation and editing interface including:
 * - Basic information (experiment number, test order, date, research team)
 * - Setup & materials (reactor, raw material, starting amount)
 * - Acid treatment (amount, concentration, molarity, type)
 * - Process conditions (temperature, time, pressures)
 * - Post-processing (wash amount/medium, drying temp, KFT %, output)
 * - Comments section
 * 
 * Dependencies:
 * - Alpine.js data: biocharForm, editingBiochar, showAddBiochar
 * - Alpine.js methods: saveBiochar()
 * - Component helpers: getDateFieldHtml, getSelectFieldHtml, getNumericFieldHtml
 * - Dropdown arrays: researchTeams, reactors, rawMaterials, acidTypes, washMediums
 * - Modal state variables: showAddResearchTeam, showAddReactor, etc.
 */

function getBiocharModalHtml() {
  return `
    <!-- Biochar Add/Edit Modal -->
    <div x-show="showAddBiochar" x-cloak
         @click.away="showAddBiochar = false; editingBiochar = null"
         class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white rounded-none md:rounded-lg w-full md:max-w-3xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <h3 class="text-lg font-semibold mb-4" x-text="editingBiochar ? 'Edit Biochar Record' : 'Add Biochar Record'"></h3>
          
          <form @submit.prevent="saveBiochar()" class="space-y-6">
            <!-- Basic Information -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Basic Information</h4>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Experiment #</label>
                  <input type="text" x-model="biocharForm.experimentNumber" required
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Test Order</label>
                  <input type="number" x-model="biocharForm.testOrder" 
                         placeholder="1, 2, 3..."
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
                <div x-html="getDateFieldHtml({
                  label: 'Experiment Date', 
                  dateModelVariable: 'biocharForm.experimentDate',
                  unknownModelVariable: 'biocharForm.dateUnknown'
                })"></div>
                <div x-html="getSelectFieldHtml({
                  label: 'Research Team',
                  modelVariable: 'biocharForm.researchTeam',
                  optionsArray: 'researchTeams',
                  showModalVariable: 'showAddResearchTeam',
                  placeholder: 'Select team...',
                  addNewText: 'Team',
                  resetValue: 'Curia - Germany'
                })"></div>
              </div>
            </div>

            <!-- Setup & Materials -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Setup & Materials</h4>
              <div class="grid grid-cols-3 gap-4">
                <div x-html="getSelectFieldHtml({
                  label: 'Reactor',
                  modelVariable: 'biocharForm.reactor',
                  optionsArray: 'reactors',
                  showModalVariable: 'showAddReactor',
                  placeholder: 'Select reactor...',
                  addNewText: 'Reactor',
                  resetValue: ''
                })"></div>
                <div x-html="getSelectFieldHtml({
                  label: 'Raw Material',
                  modelVariable: 'biocharForm.rawMaterial',
                  optionsArray: 'rawMaterials',
                  showModalVariable: 'showAddMaterial',
                  placeholder: 'Select material...',
                  addNewText: 'Material',
                  resetValue: ''
                })"></div>
                <div x-html="getNumericFieldHtml({
                  label: 'Starting Amount',
                  unit: 'g',
                  modelVariable: 'biocharForm.startingAmount',
                  step: '0.01'
                })"></div>
              </div>
            </div>
            
            <!-- Acid Treatment -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Acid Treatment</h4>
              <div class="grid grid-cols-4 gap-4">
                <div x-html="getNumericFieldHtml({
                  label: 'Amount',
                  unit: 'g',
                  modelVariable: 'biocharForm.acidAmount',
                  step: '0.01'
                })"></div>
                <div x-html="getNumericFieldHtml({
                  label: 'Concentration',
                  unit: '%',
                  modelVariable: 'biocharForm.acidConcentration',
                  step: '0.01'
                })"></div>
                <div x-html="getNumericFieldHtml({
                  label: 'Molarity',
                  unit: 'M',
                  modelVariable: 'biocharForm.acidMolarity',
                  step: '0.01'
                })"></div>
                <div x-html="getSelectFieldHtml({
                  label: 'Type',
                  modelVariable: 'biocharForm.acidType',
                  optionsArray: 'acidTypes',
                  showModalVariable: 'showAddAcidType',
                  placeholder: 'Select...',
                  addNewText: 'Acid Type',
                  resetValue: ''
                })"></div>
              </div>
            </div>
            
            <!-- Process Conditions -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Process Conditions</h4>
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div x-html="getNumericFieldHtml({
                  label: 'Temperature',
                  unit: '°C',
                  modelVariable: 'biocharForm.temperature',
                  step: '0.1'
                })"></div>
                <div x-html="getNumericFieldHtml({
                  label: 'Time',
                  unit: 'hr',
                  modelVariable: 'biocharForm.time',
                  step: '0.1'
                })"></div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div x-html="getNumericFieldHtml({
                  label: 'Initial Pressure',
                  unit: 'bar',
                  modelVariable: 'biocharForm.pressureInitial',
                  step: '0.1'
                })"></div>
                <div x-html="getNumericFieldHtml({
                  label: 'Final Pressure',
                  unit: 'bar',
                  modelVariable: 'biocharForm.pressureFinal',
                  step: '0.1'
                })"></div>
              </div>
            </div>
            
            <!-- Post-Processing -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Post-Processing</h4>
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div x-html="getNumericFieldHtml({
                  label: 'Wash Amount',
                  unit: 'g',
                  modelVariable: 'biocharForm.washAmount',
                  step: '0.01'
                })"></div>
                <div x-html="getSelectFieldHtml({
                  label: 'Wash Medium',
                  modelVariable: 'biocharForm.washMedium',
                  optionsArray: 'washMediums',
                  showModalVariable: 'showAddWashMedium',
                  placeholder: 'Select medium...',
                  addNewText: 'Medium',
                  resetValue: ''
                })"></div>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Drying Temp (°C)</label>
                  <input type="number" step="0.1" x-model="biocharForm.dryingTemp"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">KFT (%)</label>
                  <input type="number" step="0.01" x-model="biocharForm.kftPercentage"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Output (g)</label>
                  <input type="number" step="0.01" x-model="biocharForm.output"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
              </div>
            </div>
            
            <!-- Comments -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Comments</label>
              <textarea x-model="biocharForm.comments" rows="2"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
            </div>
            
            <div class="flex justify-end space-x-2 pt-4">
              <button type="button" @click="showAddBiochar = false; editingBiochar = null; biocharForm = {}"
                      class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit"
                      class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Export for use in the main application
export { getBiocharModalHtml };