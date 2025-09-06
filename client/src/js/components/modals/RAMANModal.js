/**
 * RAMAN Add/Edit Modal Component
 * 
 * Provides the RAMAN spectroscopy test creation and editing interface including:
 * - Basic information (test date, sample source selection)
 * - Team and lab information (research team, testing lab)
 * - Complex absorption band data matrix (4×4 structure)
 * - Integration ranges, integral types A/B, and peak high type J measurements
 * - RAMAN report PDF upload functionality
 * - Comments section
 * 
 * Dependencies:
 * - Alpine.js data: ramanForm, editingRaman, showAddRaman
 * - Alpine.js methods: saveRaman(), viewRamanPdf()
 * - Component helpers: getDateFieldHtml (for date with unknown checkbox)
 * - Dropdown arrays: researchTeams, testingLabs
 * - Material data: availableGrapheneSamples, compoundBatches
 */

function getRAMANModalHtml() {
  return `
    <!-- RAMAN Add/Edit Modal -->
    <div x-show="showAddRaman" x-cloak
         @click.away="showAddRaman = false; editingRaman = null"
         class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white rounded-none md:rounded-lg w-full md:max-w-4xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <h3 class="text-lg font-semibold mb-4" x-text="editingRaman ? 'Edit RAMAN Test' : 'Add RAMAN Test'"></h3>
          
          <form @submit.prevent="saveRaman()" class="space-y-6">
            <!-- Basic Information -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Basic Information</h4>
              <div class="grid grid-cols-2 gap-4">
                <div x-html="getDateFieldHtml({
                  label: 'Test Date', 
                  dateModelVariable: 'ramanForm.testDate',
                  unknownModelVariable: 'ramanForm.dateUnknown'
                })"></div>
              </div>
              
              <!-- Sample Source Selection -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Sample Source</label>
                <div class="flex space-x-4">
                  <label class="flex items-center">
                    <input type="radio" x-model="ramanForm.materialType" value="graphene" class="mr-2">
                    <span>Individual Graphene Batch</span>
                  </label>
                  <label class="flex items-center">
                    <input type="radio" x-model="ramanForm.materialType" value="compound" class="mr-2">
                    <span>Compound Batch</span>
                  </label>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div x-show="ramanForm.materialType === 'graphene'">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Graphene Sample</label>
                  <select x-model="ramanForm.grapheneSample" 
                          name="grapheneSample"
                          @change="ramanForm.compoundBatchNumber = ''"
                          :required="ramanForm.materialType === 'graphene'"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                    <option value="">Select graphene sample...</option>
                    <template x-for="exp in availableGrapheneSamples" :key="exp">
                      <option :value="exp" x-text="exp"></option>
                    </template>
                  </select>
                </div>
                <div x-show="ramanForm.materialType === 'compound'">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Compound Batch</label>
                  <select x-model="ramanForm.compoundBatchNumber"
                          name="compoundBatchNumber"
                          @change="ramanForm.grapheneSample = ''"
                          :required="ramanForm.materialType === 'compound'"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                    <option value="">Select compound batch...</option>
                    <template x-for="batch in compoundBatches" :key="batch.id">
                      <option :value="batch.batchNumber" 
                              x-text="\`\${batch.batchNumber} - \${batch.batchName || 'Unnamed'} (\${batch.totalOutput || 0}g)\`"></option>
                    </template>
                  </select>
                </div>
              </div>
            </div>

            <!-- Team and Lab Information -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Team & Lab Information</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Research Team</label>
                  <select x-model="ramanForm.researchTeam" 
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                    <option value="">Select research team...</option>
                    <template x-for="team in researchTeams" :key="team">
                      <option :value="team" x-text="team"></option>
                    </template>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Testing Lab</label>
                  <select x-model="ramanForm.testingLab" 
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                    <option value="">Select testing lab...</option>
                    <template x-for="lab in testingLabs" :key="lab">
                      <option :value="lab" x-text="lab"></option>
                    </template>
                  </select>
                </div>
              </div>
            </div>

            <!-- Absorption Band Data Matrix -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Absorption Band Analysis <span class="text-gray-500 font-normal">(Optional)</span></h4>
              <p class="text-xs text-gray-600 mb-3">Leave blank if only submitting the report. All matrix data fields are optional.</p>
              <table class="w-full border border-gray-300">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="px-3 py-2 text-left text-sm font-medium text-gray-700 border-r border-gray-300">Absorption Band</th>
                    <th class="px-3 py-2 text-center text-sm font-medium text-gray-700 border-r border-gray-300">2D Band</th>
                    <th class="px-3 py-2 text-center text-sm font-medium text-gray-700 border-r border-gray-300">G Band</th>
                    <th class="px-3 py-2 text-center text-sm font-medium text-gray-700 border-r border-gray-300">D Band</th>
                    <th class="px-3 py-2 text-center text-sm font-medium text-gray-700">D/G Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Integration Range Row -->
                  <tr class="border-t border-gray-300">
                    <td class="px-3 py-2 text-sm font-medium text-gray-700 border-r border-gray-300 bg-gray-50">Integration Range</td>
                    <td class="px-1 py-1 border-r border-gray-300">
                      <div class="grid grid-cols-2 gap-1">
                        <input type="number" step="any" x-model="ramanForm.integrationRange2DLow" 
                               placeholder="2791"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                        <input type="number" step="any" x-model="ramanForm.integrationRange2DHigh" 
                               placeholder="2557"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                      </div>
                    </td>
                    <td class="px-1 py-1 border-r border-gray-300">
                      <div class="grid grid-cols-2 gap-1">
                        <input type="number" step="any" x-model="ramanForm.integrationRangeGLow" 
                               placeholder="1753.2"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                        <input type="number" step="any" x-model="ramanForm.integrationRangeGHigh" 
                               placeholder="1474"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                      </div>
                    </td>
                    <td class="px-1 py-1 border-r border-gray-300">
                      <div class="grid grid-cols-2 gap-1">
                        <input type="number" step="any" x-model="ramanForm.integrationRangeDLow" 
                               placeholder="1474"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                        <input type="number" step="any" x-model="ramanForm.integrationRangeDHigh" 
                               placeholder="959"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                      </div>
                    </td>
                    <td class="px-1 py-1">
                      <div class="grid grid-cols-2 gap-1">
                        <input type="number" step="any" x-model="ramanForm.integrationRangeDGLow" 
                               placeholder="1.0"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                        <input type="number" step="any" x-model="ramanForm.integrationRangeDGHigh" 
                               placeholder="1.451"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                      </div>
                    </td>
                  </tr>
                  <!-- Integral Typ A Row -->
                  <tr class="border-t border-gray-300">
                    <td class="px-3 py-2 text-sm font-medium text-gray-700 border-r border-gray-300 bg-gray-50">Integral Typ A</td>
                    <td class="px-1 py-1 border-r border-gray-300">
                      <div class="grid grid-cols-2 gap-1">
                        <input type="number" step="any" x-model="ramanForm.integralTypA2D1" 
                               placeholder="2581"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                        <input type="number" step="any" x-model="ramanForm.integralTypA2D2" 
                               placeholder="0"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                      </div>
                    </td>
                    <td class="px-1 py-1 border-r border-gray-300">
                      <div class="grid grid-cols-2 gap-1">
                        <input type="number" step="any" x-model="ramanForm.integralTypAG1" 
                               placeholder="228"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                        <input type="number" step="any" x-model="ramanForm.integralTypAG2" 
                               placeholder="0"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                      </div>
                    </td>
                    <td class="px-1 py-1 border-r border-gray-300">
                      <div class="grid grid-cols-2 gap-1">
                        <input type="number" step="any" x-model="ramanForm.integralTypAD1" 
                               placeholder="330"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                        <input type="number" step="any" x-model="ramanForm.integralTypAD2" 
                               placeholder="8"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                      </div>
                    </td>
                    <td class="px-1 py-1">
                      <div class="grid grid-cols-2 gap-1">
                        <input type="number" step="any" x-model="ramanForm.integralTypADG1" 
                               placeholder="1"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                        <input type="number" step="any" x-model="ramanForm.integralTypADG2" 
                               placeholder="451"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                      </div>
                    </td>
                  </tr>
                  <!-- Integral Typ B Row -->
                  <tr class="border-t border-gray-300">
                    <td class="px-3 py-2 text-sm font-medium text-gray-700 border-r border-gray-300 bg-gray-50">Integral Typ B</td>
                    <td class="px-1 py-1 border-r border-gray-300">
                      <div class="grid grid-cols-2 gap-1">
                        <input type="number" step="any" x-model="ramanForm.integralTypB2D1" 
                               placeholder="2581"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                        <input type="number" step="any" x-model="ramanForm.integralTypB2D2" 
                               placeholder="0"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                      </div>
                    </td>
                    <td class="px-1 py-1 border-r border-gray-300">
                      <div class="grid grid-cols-2 gap-1">
                        <input type="number" step="any" x-model="ramanForm.integralTypBG1" 
                               placeholder="228"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                        <input type="number" step="any" x-model="ramanForm.integralTypBG2" 
                               placeholder="0"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                      </div>
                    </td>
                    <td class="px-1 py-1 border-r border-gray-300">
                      <div class="grid grid-cols-2 gap-1">
                        <input type="number" step="any" x-model="ramanForm.integralTypBD1" 
                               placeholder="330"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                        <input type="number" step="any" x-model="ramanForm.integralTypBD2" 
                               placeholder="8"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                      </div>
                    </td>
                    <td class="px-1 py-1">
                      <div class="grid grid-cols-2 gap-1">
                        <input type="number" step="any" x-model="ramanForm.integralTypBDG1" 
                               placeholder="1"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                        <input type="number" step="any" x-model="ramanForm.integralTypBDG2" 
                               placeholder="451"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                      </div>
                    </td>
                  </tr>
                  <!-- Peak High Typ J Row -->
                  <tr class="border-t border-gray-300">
                    <td class="px-3 py-2 text-sm font-medium text-gray-700 border-r border-gray-300 bg-gray-50">Peak High Typ J</td>
                    <td class="px-1 py-1 border-r border-gray-300">
                      <div class="grid grid-cols-2 gap-1">
                        <input type="number" step="any" x-model="ramanForm.peakHighTypJ2D1" 
                               placeholder="0.024"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                        <input type="number" step="any" x-model="ramanForm.peakHighTypJ2D2" 
                               placeholder="0"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                      </div>
                    </td>
                    <td class="px-1 py-1 border-r border-gray-300">
                      <div class="grid grid-cols-2 gap-1">
                        <input type="number" step="any" x-model="ramanForm.peakHighTypJG1" 
                               placeholder="1.972"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                        <input type="number" step="any" x-model="ramanForm.peakHighTypJG2" 
                               placeholder="0"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                      </div>
                    </td>
                    <td class="px-1 py-1 border-r border-gray-300">
                      <div class="grid grid-cols-2 gap-1">
                        <input type="number" step="any" x-model="ramanForm.peakHighTypJD1" 
                               placeholder="1.784"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                        <input type="number" step="any" x-model="ramanForm.peakHighTypJD2" 
                               placeholder="0"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                      </div>
                    </td>
                    <td class="px-1 py-1">
                      <div class="grid grid-cols-2 gap-1">
                        <input type="number" step="any" x-model="ramanForm.peakHighTypJDG1" 
                               placeholder="0.905"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                        <input type="number" step="any" x-model="ramanForm.peakHighTypJDG2" 
                               placeholder="0"
                               class="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black">
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- PDF Upload -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">RAMAN Report</h4>
              <template x-if="editingRaman && editingRaman.ramanReportPath">
                <div class="mb-3 p-3 bg-link-light rounded-md">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-link-dark">Current report: RAMAN Report PDF</span>
                    <div class="flex space-x-2">
                      <button type="button" @click="viewRamanPdf(editingRaman.ramanReportPath)" 
                              class="text-link text-link-hover text-sm">View</button>
                      <button type="button" @click="ramanForm.removeRamanReport = true; ramanForm.replacementFile = null" 
                              class="text-red-600 hover:text-red-800 text-sm">Remove</button>
                    </div>
                  </div>
                </div>
              </template>
              
              <template x-if="!editingRaman || !editingRaman.ramanReportPath || ramanForm.removeRamanReport">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    <span x-show="!editingRaman">Upload RAMAN Report (Optional)</span>
                    <span x-show="editingRaman && (!editingRaman.ramanReportPath || ramanForm.removeRamanReport)">Upload New RAMAN Report</span>
                  </label>
                  <input type="file" 
                         @change="ramanForm.ramanReportFile = $event.target.files[0]" 
                         accept="application/pdf"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <p class="text-xs text-gray-500 mt-1">PDF files only, max 10MB</p>
                </div>
              </template>
              
              <template x-if="editingRaman && editingRaman.ramanReportPath && !ramanForm.removeRamanReport">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Replace RAMAN Report (Optional)</label>
                  <input type="file" 
                         @change="ramanForm.ramanReportFile = $event.target.files[0]" 
                         accept="application/pdf"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <p class="text-xs text-gray-500 mt-1">PDF files only, max 10MB. Leave empty to keep current report.</p>
                </div>
              </template>
            </div>

            <!-- Comments -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Comments</label>
              <textarea x-model="ramanForm.comments" rows="3"
                        placeholder="Additional notes about the RAMAN analysis..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button type="button" @click="showAddRaman = false; editingRaman = null; ramanForm = {}" 
                      class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800">
                <span x-text="editingRaman ? 'Update' : 'Create'"></span> Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Export for use in the main application
export { getRAMANModalHtml };