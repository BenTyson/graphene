/**
 * XPS Add/Edit Modal Component
 *
 * Provides the complete XPS analysis modal including:
 * - Dynamic modal title (Add vs Edit)
 * - Date field with unknown checkbox
 * - Material type selection (Graphene, Compound Batch, Micronization, MCB)
 * - Sample selection dropdowns
 * - Elemental composition fields (C, Cl, Mo, N, O, S, Si with error values)
 * - C-1s decomposition fields (C-C, C-O, C=O, CO₃, O-C=O, sp² with error values)
 * - Testing lab dropdown
 * - MULTIPLE file upload functionality (PDF, JPG, PNG, Excel)
 * - Comments textarea
 * - Form validation and submission
 *
 * Dependencies:
 * - Alpine.js data: showAddXPS, editingXPS, xpsForm, availableGrapheneSamples, compoundBatches, micronizations, mcbs, testingLabs
 * - Alpine.js methods: saveXPS()
 * - Form field helpers: getDateFieldHtml, getNumericFieldHtml, getMultiFileFieldHtml
 * - Global styling: Standard form classes and button styles
 */

/**
 * Returns the complete HTML for the XPS modal component
 * @returns {string} HTML string for the XPS modal
 */
function getXPSModalHtml() {
  return `
    <!-- XPS Add/Edit Modal -->
    <div x-show="showAddXPS" x-cloak
         @click.away="showAddXPS = false; editingXPS = null"
         class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white rounded-none md:rounded-lg w-full md:max-w-4xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <h3 class="text-lg font-semibold mb-4" x-text="editingXPS ? 'Edit XPS Test' : 'Add XPS Test'"></h3>

          <form @submit.prevent="saveXPS()" class="space-y-4">
            <!-- Test Date -->
            <div class="grid grid-cols-1 gap-4">
              <div x-html="getDateFieldHtml({
                label: 'Test Date',
                dateModelVariable: 'xpsForm.testDate',
                unknownModelVariable: 'xpsForm.dateUnknown'
              })"></div>
            </div>

            <!-- Sample Source Selection -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Sample Source</label>
              <div class="grid grid-cols-2 gap-2">
                <label class="flex items-center">
                  <input type="radio" x-model="xpsForm.materialType" value="graphene" class="mr-2">
                  <span>Individual Graphene</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" x-model="xpsForm.materialType" value="compound" class="mr-2">
                  <span>Compound Batch</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" x-model="xpsForm.materialType" value="micronization" class="mr-2">
                  <span>Micronization</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" x-model="xpsForm.materialType" value="mcb" class="mr-2">
                  <span>MCB</span>
                </label>
              </div>
            </div>

            <!-- Dynamic Sample Selectors -->
            <div class="grid grid-cols-1 gap-4">
              <div x-show="xpsForm.materialType === 'graphene'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Graphene Sample</label>
                <select x-model="xpsForm.grapheneSample"
                        name="grapheneSample"
                        @change="xpsForm.compoundBatchNumber = ''; xpsForm.micronizationSku = ''; xpsForm.mcbNumber = ''"
                        :required="xpsForm.materialType === 'graphene'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select graphene sample...</option>
                  <template x-for="exp in availableGrapheneSamples" :key="exp">
                    <option :value="exp" x-text="exp"></option>
                  </template>
                </select>
              </div>

              <div x-show="xpsForm.materialType === 'compound'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Compound Batch</label>
                <select x-model="xpsForm.compoundBatchNumber"
                        name="compoundBatchNumber"
                        @change="xpsForm.grapheneSample = ''; xpsForm.micronizationSku = ''; xpsForm.mcbNumber = ''"
                        :required="xpsForm.materialType === 'compound'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select compound batch...</option>
                  <template x-for="batch in compoundBatches" :key="batch.id">
                    <option :value="batch.batchNumber"
                            x-text="\`\${batch.batchNumber} - \${batch.batchName || 'Unnamed'}\`"></option>
                  </template>
                </select>
              </div>

              <div x-show="xpsForm.materialType === 'micronization'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Micronization</label>
                <select x-model="xpsForm.micronizationSku"
                        name="micronizationSku"
                        @change="xpsForm.grapheneSample = ''; xpsForm.compoundBatchNumber = ''; xpsForm.mcbNumber = ''"
                        :required="xpsForm.materialType === 'micronization'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select micronization...</option>
                  <template x-for="micro in micronizations" :key="micro.id">
                    <option :value="micro.sku"
                            x-text="\`\${micro.micronizationNumber} - \${micro.sku}\`"></option>
                  </template>
                </select>
              </div>

              <div x-show="xpsForm.materialType === 'mcb'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Micronized Compound Batch (MCB)</label>
                <select x-model="xpsForm.mcbNumber"
                        name="mcbNumber"
                        @change="xpsForm.grapheneSample = ''; xpsForm.compoundBatchNumber = ''; xpsForm.micronizationSku = ''"
                        :required="xpsForm.materialType === 'mcb'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select MCB...</option>
                  <template x-for="mcb in mcbs" :key="mcb.id">
                    <option :value="mcb.mcbNumber" x-text="mcb.mcbNumber"></option>
                  </template>
                </select>
              </div>
            </div>

            <!-- Elemental Composition -->
            <div class="border border-gray-200 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">Elemental Composition</h4>
              <div class="grid grid-cols-2 gap-3">
                <!-- C-1s -->
                <div class="col-span-2 grid grid-cols-2 gap-3 border-b border-gray-100 pb-3">
                  <div x-html="getNumericFieldHtml({ label: 'C-1s', unit: '%', modelVariable: 'xpsForm.c1s_percent', inputType: 'number', step: '0.01' })"></div>
                  <div x-html="getNumericFieldHtml({ label: 'C-1s Error', unit: '', modelVariable: 'xpsForm.c1s_percent_error', inputType: 'number', step: '0.01' })"></div>
                </div>
                <!-- O-1s -->
                <div x-html="getNumericFieldHtml({ label: 'O-1s', unit: '%', modelVariable: 'xpsForm.o1s_percent', inputType: 'number', step: '0.01' })"></div>
                <div x-html="getNumericFieldHtml({ label: 'O-1s Error', unit: '', modelVariable: 'xpsForm.o1s_percent_error', inputType: 'number', step: '0.01' })"></div>
                <!-- N-1s -->
                <div x-html="getNumericFieldHtml({ label: 'N-1s', unit: '%', modelVariable: 'xpsForm.n1s_percent', inputType: 'number', step: '0.01' })"></div>
                <div x-html="getNumericFieldHtml({ label: 'N-1s Error', unit: '', modelVariable: 'xpsForm.n1s_percent_error', inputType: 'number', step: '0.01' })"></div>
                <!-- Cl-2p -->
                <div x-html="getNumericFieldHtml({ label: 'Cl-2p', unit: '%', modelVariable: 'xpsForm.cl2p_percent', inputType: 'number', step: '0.01' })"></div>
                <div x-html="getNumericFieldHtml({ label: 'Cl-2p Error', unit: '', modelVariable: 'xpsForm.cl2p_percent_error', inputType: 'number', step: '0.01' })"></div>
                <!-- Mo-3d -->
                <div x-html="getNumericFieldHtml({ label: 'Mo-3d', unit: '%', modelVariable: 'xpsForm.mo3d_percent', inputType: 'number', step: '0.01' })"></div>
                <div x-html="getNumericFieldHtml({ label: 'Mo-3d Error', unit: '', modelVariable: 'xpsForm.mo3d_percent_error', inputType: 'number', step: '0.01' })"></div>
                <!-- S-2p -->
                <div x-html="getNumericFieldHtml({ label: 'S-2p', unit: '%', modelVariable: 'xpsForm.s2p_percent', inputType: 'number', step: '0.01' })"></div>
                <div x-html="getNumericFieldHtml({ label: 'S-2p Error', unit: '', modelVariable: 'xpsForm.s2p_percent_error', inputType: 'number', step: '0.01' })"></div>
                <!-- Si-2p -->
                <div x-html="getNumericFieldHtml({ label: 'Si-2p', unit: '%', modelVariable: 'xpsForm.si2p_percent', inputType: 'number', step: '0.01' })"></div>
                <div x-html="getNumericFieldHtml({ label: 'Si-2p Error', unit: '', modelVariable: 'xpsForm.si2p_percent_error', inputType: 'number', step: '0.01' })"></div>
              </div>
            </div>

            <!-- C-1s Decomposition -->
            <div class="border border-gray-200 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">C-1s Decomposition</h4>
              <div class="grid grid-cols-2 gap-3">
                <!-- C-C -->
                <div x-html="getNumericFieldHtml({ label: 'C-C (C-1s)', unit: '%', modelVariable: 'xpsForm.c1s_cc_percent', inputType: 'number', step: '0.01' })"></div>
                <div x-html="getNumericFieldHtml({ label: 'C-C Error', unit: '', modelVariable: 'xpsForm.c1s_cc_error', inputType: 'number', step: '0.01' })"></div>
                <!-- C-O -->
                <div x-html="getNumericFieldHtml({ label: 'C-O (C-1s)', unit: '%', modelVariable: 'xpsForm.c1s_co_percent', inputType: 'number', step: '0.01' })"></div>
                <div x-html="getNumericFieldHtml({ label: 'C-O Error', unit: '', modelVariable: 'xpsForm.c1s_co_error', inputType: 'number', step: '0.01' })"></div>
                <!-- C=O -->
                <div x-html="getNumericFieldHtml({ label: 'C=O (C-1s)', unit: '%', modelVariable: 'xpsForm.c1s_ceo_percent', inputType: 'number', step: '0.01' })"></div>
                <div x-html="getNumericFieldHtml({ label: 'C=O Error', unit: '', modelVariable: 'xpsForm.c1s_ceo_error', inputType: 'number', step: '0.01' })"></div>
                <!-- CO₃ -->
                <div x-html="getNumericFieldHtml({ label: 'CO₃ (C-1s)', unit: '%', modelVariable: 'xpsForm.c1s_co3_percent', inputType: 'number', step: '0.01' })"></div>
                <div x-html="getNumericFieldHtml({ label: 'CO₃ Error', unit: '', modelVariable: 'xpsForm.c1s_co3_error', inputType: 'number', step: '0.01' })"></div>
                <!-- O-C=O -->
                <div x-html="getNumericFieldHtml({ label: 'O-C=O (C-1s)', unit: '%', modelVariable: 'xpsForm.c1s_oceo_percent', inputType: 'number', step: '0.01' })"></div>
                <div x-html="getNumericFieldHtml({ label: 'O-C=O Error', unit: '', modelVariable: 'xpsForm.c1s_oceo_error', inputType: 'number', step: '0.01' })"></div>
                <!-- sp² -->
                <div x-html="getNumericFieldHtml({ label: 'sp² (C-1s)', unit: '%', modelVariable: 'xpsForm.c1s_sp2_percent', inputType: 'number', step: '0.01' })"></div>
                <div x-html="getNumericFieldHtml({ label: 'sp² Error', unit: '', modelVariable: 'xpsForm.c1s_sp2_error', inputType: 'number', step: '0.01' })"></div>
              </div>
            </div>

            <!-- Testing Lab -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Testing Lab</label>
              <select x-model="xpsForm.testingLab"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                <option value="">Select lab...</option>
                <template x-for="lab in testingLabs" :key="lab">
                  <option :value="lab" x-text="lab"></option>
                </template>
              </select>
            </div>

            <!-- Multiple File Upload -->
            <div x-html="getMultiFileFieldHtml({
              label: 'XPS Reports (PDF, JPG, PNG, Excel)',
              fileModelVariable: 'xpsForm.xpsReportFiles',
              editingVariable: 'editingXPS',
              currentFilePathsField: 'xpsReportPaths',
              removeFileIndicesVariable: 'xpsForm.removeFileIndices',
              acceptTypes: 'application/pdf,image/jpeg,image/png,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              maxFiles: 10
            })"></div>

            <!-- Comments -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Comments</label>
              <textarea x-model="xpsForm.comments" rows="3"
                        placeholder="Additional notes about the XPS analysis..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"></textarea>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-3">
              <button type="button" @click="showAddXPS = false; editingXPS = null; xpsForm = {}"
                      class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800">
                <span x-text="editingXPS ? 'Update' : 'Create'"></span> Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Export for use in main application
window.getXPSModalHtml = getXPSModalHtml;
