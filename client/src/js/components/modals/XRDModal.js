/**
 * XRD Add/Edit Modal Component
 *
 * Provides the complete XRD analysis modal including:
 * - Dynamic modal title (Add vs Edit)
 * - Date field with unknown checkbox
 * - Material type selection (Graphene, Compound Batch, Micronization, MCB)
 * - Sample selection dropdowns
 * - Peak position and assignment fields (2 peaks)
 * - Crystallite size numeric input
 * - Testing lab dropdown
 * - MULTIPLE file upload functionality (PDF, JPG, PNG)
 * - Comments textarea
 * - Form validation and submission
 *
 * Dependencies:
 * - Alpine.js data: showAddXRD, editingXRD, xrdForm, availableGrapheneSamples, compoundBatches, micronizations, mcbs, testingLabs
 * - Alpine.js methods: saveXRD()
 * - Form field helpers: getDateFieldHtml, getNumericFieldHtml, getMultiFileFieldHtml
 * - Global styling: Standard form classes and button styles
 */

/**
 * Returns the complete HTML for the XRD modal component
 * @returns {string} HTML string for the XRD modal
 */
function getXRDModalHtml() {
  return `
    <!-- XRD Add/Edit Modal -->
    <div x-show="showAddXRD" x-cloak
         @click.away="showAddXRD = false; editingXRD = null"
         class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white rounded-none md:rounded-lg w-full md:max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <h3 class="text-lg font-semibold mb-4" x-text="editingXRD ? 'Edit XRD Test' : 'Add XRD Test'"></h3>

          <form @submit.prevent="saveXRD()" class="space-y-4">
            <!-- Test Date -->
            <div class="grid grid-cols-1 gap-4">
              <div x-html="getDateFieldHtml({
                label: 'Test Date',
                dateModelVariable: 'xrdForm.testDate',
                unknownModelVariable: 'xrdForm.dateUnknown'
              })"></div>
            </div>

            <!-- Sample Source Selection -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Sample Source</label>
              <div class="grid grid-cols-2 gap-2">
                <label class="flex items-center">
                  <input type="radio" x-model="xrdForm.materialType" value="graphene" class="mr-2">
                  <span>Individual Graphene</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" x-model="xrdForm.materialType" value="compound" class="mr-2">
                  <span>Compound Batch</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" x-model="xrdForm.materialType" value="micronization" class="mr-2">
                  <span>Micronization</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" x-model="xrdForm.materialType" value="mcb" class="mr-2">
                  <span>MCB</span>
                </label>
              </div>
            </div>

            <!-- Dynamic Sample Selectors -->
            <div class="grid grid-cols-1 gap-4">
              <div x-show="xrdForm.materialType === 'graphene'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Graphene Sample</label>
                <select x-model="xrdForm.grapheneSample"
                        name="grapheneSample"
                        @change="xrdForm.compoundBatchNumber = ''; xrdForm.micronizationSku = ''; xrdForm.mcbNumber = ''"
                        :required="xrdForm.materialType === 'graphene'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select graphene sample...</option>
                  <template x-for="exp in availableGrapheneSamples" :key="exp">
                    <option :value="exp" x-text="exp"></option>
                  </template>
                </select>
              </div>

              <div x-show="xrdForm.materialType === 'compound'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Compound Batch</label>
                <select x-model="xrdForm.compoundBatchNumber"
                        name="compoundBatchNumber"
                        @change="xrdForm.grapheneSample = ''; xrdForm.micronizationSku = ''; xrdForm.mcbNumber = ''"
                        :required="xrdForm.materialType === 'compound'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select compound batch...</option>
                  <template x-for="batch in compoundBatches" :key="batch.id">
                    <option :value="batch.batchNumber"
                            x-text="\`\${batch.batchNumber} - \${batch.batchName || 'Unnamed'}\`"></option>
                  </template>
                </select>
              </div>

              <div x-show="xrdForm.materialType === 'micronization'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Micronization</label>
                <select x-model="xrdForm.micronizationSku"
                        name="micronizationSku"
                        @change="xrdForm.grapheneSample = ''; xrdForm.compoundBatchNumber = ''; xrdForm.mcbNumber = ''"
                        :required="xrdForm.materialType === 'micronization'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select micronization...</option>
                  <template x-for="micro in micronizations" :key="micro.id">
                    <option :value="micro.sku"
                            x-text="\`\${micro.micronizationNumber} - \${micro.sku}\`"></option>
                  </template>
                </select>
              </div>

              <div x-show="xrdForm.materialType === 'mcb'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Micronized Compound Batch (MCB)</label>
                <select x-model="xrdForm.mcbNumber"
                        name="mcbNumber"
                        @change="xrdForm.grapheneSample = ''; xrdForm.compoundBatchNumber = ''; xrdForm.micronizationSku = ''"
                        :required="xrdForm.materialType === 'mcb'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select MCB...</option>
                  <template x-for="mcb in mcbs" :key="mcb.id">
                    <option :value="mcb.mcbNumber" x-text="mcb.mcbNumber"></option>
                  </template>
                </select>
              </div>
            </div>

            <!-- XRD Peak Analysis -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-700">Peak Analysis</label>

              <!-- Peak 1 -->
              <div class="border border-gray-200 rounded-lg p-3">
                <div class="text-sm font-medium text-gray-600 mb-2">Peak 1</div>
                <div class="grid grid-cols-2 gap-4">
                  <div x-html="getNumericFieldHtml({
                    label: 'Position (2θ)',
                    unit: '°',
                    modelVariable: 'xrdForm.peak1_position',
                    inputType: 'number',
                    step: '0.0001',
                    placeholder: 'e.g., 22'
                  })"></div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Assignment</label>
                    <input type="text"
                           x-model="xrdForm.peak1_assignment"
                           placeholder="e.g., (002)"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  </div>
                </div>
              </div>

              <!-- Peak 2 -->
              <div class="border border-gray-200 rounded-lg p-3">
                <div class="text-sm font-medium text-gray-600 mb-2">Peak 2</div>
                <div class="grid grid-cols-2 gap-4">
                  <div x-html="getNumericFieldHtml({
                    label: 'Position (2θ)',
                    unit: '°',
                    modelVariable: 'xrdForm.peak2_position',
                    inputType: 'number',
                    step: '0.0001',
                    placeholder: 'e.g., 43'
                  })"></div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Assignment</label>
                    <input type="text"
                           x-model="xrdForm.peak2_assignment"
                           placeholder="e.g., (100/101)"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  </div>
                </div>
              </div>
            </div>

            <!-- Crystallite Size -->
            <div x-html="getNumericFieldHtml({
              label: 'Crystallite Size (Scherrer)',
              unit: 'nm',
              modelVariable: 'xrdForm.crystallite_size',
              inputType: 'number',
              step: '0.0001',
              placeholder: 'e.g., 1.7'
            })"></div>

            <!-- Testing Lab -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Testing Lab</label>
              <select x-model="xrdForm.testingLab"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                <option value="">Select lab...</option>
                <template x-for="lab in testingLabs" :key="lab">
                  <option :value="lab" x-text="lab"></option>
                </template>
              </select>
            </div>

            <!-- Multiple File Upload -->
            <div x-html="getMultiFileFieldHtml({
              label: 'XRD Reports (PDF, JPG, PNG)',
              fileModelVariable: 'xrdForm.xrdReportFiles',
              editingVariable: 'editingXRD',
              currentFilePathsField: 'xrdReportPaths',
              removeFileIndicesVariable: 'xrdForm.removeFileIndices',
              acceptTypes: 'application/pdf,image/jpeg,image/png',
              maxFiles: 10
            })"></div>

            <!-- Comments -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Comments</label>
              <textarea x-model="xrdForm.comments" rows="3"
                        placeholder="Qualitative analysis, comparisons, observations..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"></textarea>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-3">
              <button type="button" @click="showAddXRD = false; editingXRD = null; xrdForm = {}"
                      class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800">
                <span x-text="editingXRD ? 'Update' : 'Create'"></span> Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Export for use in main application
window.getXRDModalHtml = getXRDModalHtml;
