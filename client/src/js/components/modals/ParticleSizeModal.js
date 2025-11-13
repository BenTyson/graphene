/**
 * Particle Size Add/Edit Modal Component
 *
 * Provides the complete Particle Size analysis modal including:
 * - Dynamic modal title (Add vs Edit)
 * - Date field with unknown checkbox
 * - Material type selection (Graphene, Compound Batch, Micronization, MCB)
 * - Sample selection dropdowns
 * - D10, D50, D90, Mean Size, and Span Value numeric inputs
 * - Testing lab and testing method dropdowns
 * - PDF/JPG/PNG report upload functionality
 * - Comments textarea
 * - Form validation and submission
 *
 * Dependencies:
 * - Alpine.js data: showAddParticleSize, editingParticleSize, particleSizeForm, availableGrapheneSamples, compoundBatches, micronizations, mcbs, testingLabs
 * - Alpine.js methods: saveParticleSize()
 * - Form field helpers: getDateFieldHtml, getNumericFieldHtml, getFileFieldHtml
 * - Global styling: Standard form classes and button styles
 */

/**
 * Returns the complete HTML for the Particle Size modal component
 * @returns {string} HTML string for the Particle Size modal
 */
function getParticleSizeModalHtml() {
  return `
    <!-- Particle Size Add/Edit Modal -->
    <div x-show="showAddParticleSize" x-cloak
         @click.away="showAddParticleSize = false; editingParticleSize = null"
         class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white rounded-none md:rounded-lg w-full md:max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <h3 class="text-lg font-semibold mb-4" x-text="editingParticleSize ? 'Edit Particle Size Test' : 'Add Particle Size Test'"></h3>

          <form @submit.prevent="saveParticleSize()" class="space-y-4">
            <!-- Test Date -->
            <div class="grid grid-cols-1 gap-4">
              <div x-html="getDateFieldHtml({
                label: 'Test Date',
                dateModelVariable: 'particleSizeForm.testDate',
                unknownModelVariable: 'particleSizeForm.dateUnknown'
              })"></div>
            </div>

            <!-- Sample Source Selection -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Sample Source</label>
              <div class="grid grid-cols-2 gap-2">
                <label class="flex items-center">
                  <input type="radio" x-model="particleSizeForm.materialType" value="graphene" class="mr-2">
                  <span>Individual Graphene</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" x-model="particleSizeForm.materialType" value="compound" class="mr-2">
                  <span>Compound Batch</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" x-model="particleSizeForm.materialType" value="micronization" class="mr-2">
                  <span>Micronization</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" x-model="particleSizeForm.materialType" value="mcb" class="mr-2">
                  <span>MCB</span>
                </label>
              </div>
            </div>

            <!-- Dynamic Sample Selectors -->
            <div class="grid grid-cols-1 gap-4">
              <div x-show="particleSizeForm.materialType === 'graphene'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Graphene Sample</label>
                <select x-model="particleSizeForm.grapheneSample"
                        name="grapheneSample"
                        @change="particleSizeForm.compoundBatchNumber = ''; particleSizeForm.micronizationSku = ''; particleSizeForm.mcbNumber = ''"
                        :required="particleSizeForm.materialType === 'graphene'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select graphene sample...</option>
                  <template x-for="exp in availableGrapheneSamples" :key="exp">
                    <option :value="exp" x-text="exp"></option>
                  </template>
                </select>
              </div>

              <div x-show="particleSizeForm.materialType === 'compound'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Compound Batch</label>
                <select x-model="particleSizeForm.compoundBatchNumber"
                        name="compoundBatchNumber"
                        @change="particleSizeForm.grapheneSample = ''; particleSizeForm.micronizationSku = ''; particleSizeForm.mcbNumber = ''"
                        :required="particleSizeForm.materialType === 'compound'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select compound batch...</option>
                  <template x-for="batch in compoundBatches" :key="batch.id">
                    <option :value="batch.batchNumber"
                            x-text="\`\${batch.batchNumber} - \${batch.batchName || 'Unnamed'}\`"></option>
                  </template>
                </select>
              </div>

              <div x-show="particleSizeForm.materialType === 'micronization'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Micronization</label>
                <select x-model="particleSizeForm.micronizationSku"
                        name="micronizationSku"
                        @change="particleSizeForm.grapheneSample = ''; particleSizeForm.compoundBatchNumber = ''; particleSizeForm.mcbNumber = ''"
                        :required="particleSizeForm.materialType === 'micronization'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select micronization...</option>
                  <template x-for="micro in micronizations" :key="micro.id">
                    <option :value="micro.sku"
                            x-text="\`\${micro.micronizationNumber} - \${micro.sku}\`"></option>
                  </template>
                </select>
              </div>

              <div x-show="particleSizeForm.materialType === 'mcb'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Micronized Compound Batch (MCB)</label>
                <select x-model="particleSizeForm.mcbNumber"
                        name="mcbNumber"
                        @change="particleSizeForm.grapheneSample = ''; particleSizeForm.compoundBatchNumber = ''; particleSizeForm.micronizationSku = ''"
                        :required="particleSizeForm.materialType === 'mcb'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select MCB...</option>
                  <template x-for="mcb in mcbs" :key="mcb.id">
                    <option :value="mcb.mcbNumber" x-text="mcb.mcbNumber"></option>
                  </template>
                </select>
              </div>
            </div>

            <!-- Particle Size Measurements -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Particle Size Distribution</label>
              <div class="grid grid-cols-3 gap-4">
                <div x-html="getNumericFieldHtml({
                  label: 'D10',
                  unit: 'μm',
                  modelVariable: 'particleSizeForm.d10',
                  inputType: 'number',
                  step: '0.0001',
                  placeholder: '10th percentile'
                })"></div>
                <div x-html="getNumericFieldHtml({
                  label: 'D50 (Median)',
                  unit: 'μm',
                  modelVariable: 'particleSizeForm.d50',
                  inputType: 'number',
                  step: '0.0001',
                  placeholder: 'Median size'
                })"></div>
                <div x-html="getNumericFieldHtml({
                  label: 'D90',
                  unit: 'μm',
                  modelVariable: 'particleSizeForm.d90',
                  inputType: 'number',
                  step: '0.0001',
                  placeholder: '90th percentile'
                })"></div>
              </div>
            </div>

            <!-- Additional Metrics -->
            <div class="grid grid-cols-2 gap-4">
              <div x-html="getNumericFieldHtml({
                label: 'Mean Size',
                unit: 'μm',
                modelVariable: 'particleSizeForm.meanSize',
                inputType: 'number',
                step: '0.0001',
                placeholder: 'Average particle size'
              })"></div>
              <div x-html="getNumericFieldHtml({
                label: 'Span Value',
                unit: '',
                modelVariable: 'particleSizeForm.spanValue',
                inputType: 'number',
                step: '0.0001',
                placeholder: '(D90-D10)/D50'
              })"></div>
            </div>

            <!-- Testing Context -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Testing Lab</label>
                <select x-model="particleSizeForm.testingLab"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select lab...</option>
                  <template x-for="lab in testingLabs" :key="lab">
                    <option :value="lab" x-text="lab"></option>
                  </template>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Testing Method</label>
                <select x-model="particleSizeForm.testingMethod"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select method...</option>
                  <option value="Laser Diffraction">Laser Diffraction</option>
                  <option value="Dynamic Light Scattering (DLS)">Dynamic Light Scattering (DLS)</option>
                  <option value="SEM Image Analysis">SEM Image Analysis</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <!-- File Upload -->
            <div x-html="getFileFieldHtml({
              label: 'Particle Size Report (PDF, JPG, PNG)',
              fileModelVariable: 'particleSizeForm.particleSizeReportFile',
              editingVariable: 'editingParticleSize',
              currentFilePathField: 'particleSizeReportPath',
              removeFileVariable: 'particleSizeForm.removeParticleSizeReport',
              acceptTypes: 'application/pdf,image/jpeg,image/png'
            })"></div>

            <!-- Comments -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Comments</label>
              <textarea x-model="particleSizeForm.comments" rows="3"
                        placeholder="Additional notes about the particle size analysis..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"></textarea>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-3">
              <button type="button" @click="showAddParticleSize = false; editingParticleSize = null; particleSizeForm = {}"
                      class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800">
                <span x-text="editingParticleSize ? 'Update' : 'Create'"></span> Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Export for use in main application
window.getParticleSizeModalHtml = getParticleSizeModalHtml;
