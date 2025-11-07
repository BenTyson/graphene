/**
 * Shipment Add/Edit Modal Component
 * 
 * Provides the complete Material Shipment tracking modal including:
 * - Dynamic modal title (Add vs Edit)
 * - Auto-generated shipment numbers
 * - Location management with dropdowns
 * - Shipment date field with unknown checkbox
 * - Triple material type selection (Individual Graphene, Compound Batch, Micronized SKU)
 * - Sample/batch/SKU selection dropdowns
 * - Amount, purpose, and status fields
 * - Comments textarea
 * - Form validation and submission
 * 
 * Dependencies:
 * - Alpine.js data: showAddShipment, editingShipment, shipmentForm, grapheneRecords, compoundBatches, micronizations, shipmentLocations
 * - Alpine.js methods: saveShipment(), closeShipmentForm()
 * - Form field helpers: getSelectFieldHtml, getDateFieldHtml, getNumericFieldHtml
 * - Global styling: Standard form classes and button styles
 */

/**
 * Returns the complete HTML for the Shipment modal component
 * @returns {string} HTML string for the Shipment modal
 */
function getShipmentModalHtml() {
  return `
    <!-- Shipment Add/Edit Modal -->
    <div x-show="showAddShipment" x-cloak
         @click.away="closeShipmentForm()"
         class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white rounded-none md:rounded-lg w-full md:max-w-3xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <h3 class="text-lg font-semibold mb-4" 
              x-text="editingShipment ? 'Edit Shipment' : 'Add New Shipment'"></h3>
          <form @submit.prevent="saveShipment()">
            
            <!-- Row 1: Shipment Number and Locations -->
            <div class="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Shipment Number</label>
                <input
                  type="text"
                  x-model="shipmentForm.shipmentNumber"
                  placeholder="Auto-generated if empty"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                >
              </div>
              <div x-html="getSelectFieldHtml({
                label: 'Ship From Location',
                modelVariable: 'shipmentForm.shipFromLocation',
                optionsArray: 'shipmentLocations',
                showModalVariable: 'showAddShipmentLocation',
                addNewText: 'Location',
                required: true
              })"></div>
              <div x-html="getSelectFieldHtml({
                label: 'Ship To Location',
                modelVariable: 'shipmentForm.shipToLocation',
                optionsArray: 'shipmentLocations',
                showModalVariable: 'showAddShipmentLocation',
                addNewText: 'Location',
                required: true
              })"></div>
            </div>

            <!-- Row 2: Shipment Date -->
            <div class="grid grid-cols-1 gap-4 mb-4">
              <div x-html="getDateFieldHtml({
                label: 'Shipment Date',
                dateModelVariable: 'shipmentForm.shipmentDate',
                unknownModelVariable: 'shipmentForm.dateUnknown'
              })"></div>
            </div>

            <!-- Row 3: Material Selection -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Material Source</label>
              <div class="flex space-x-4 flex-wrap gap-y-2">
                <label class="flex items-center">
                  <input type="radio" x-model="shipmentForm.materialType" value="graphene" class="mr-2">
                  <span>Individual Graphene Batch</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" x-model="shipmentForm.materialType" value="compound" class="mr-2">
                  <span>Compound Batch</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" x-model="shipmentForm.materialType" value="micronized" class="mr-2">
                  <span>Micronized SKU</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" x-model="shipmentForm.materialType" value="mcb" class="mr-2">
                  <span class="font-medium">Micronized Compound Batch (MCB)</span>
                </label>
              </div>
            </div>

            <!-- Row 4: Batch Selection and Amount -->
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div x-show="shipmentForm.materialType === 'graphene'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Graphene Batch</label>
                <select
                  x-model="shipmentForm.grapheneSample"
                  name="grapheneSample"
                  @change="shipmentForm.compoundBatchNumber = ''; shipmentForm.micronizationSku = ''"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  :required="shipmentForm.materialType === 'graphene'"
                >
                  <option value="">Select graphene batch...</option>
                  <template x-for="record in grapheneRecords" :key="record.id">
                    <option :value="record.experimentNumber" 
                            x-text="\`\${record.experimentNumber} - \${record.species || 'Unknown'} (\${record.output || 0}g)\`"></option>
                  </template>
                </select>
              </div>
              <div x-show="shipmentForm.materialType === 'compound'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Compound Batch</label>
                <select
                  x-model="shipmentForm.compoundBatchNumber"
                  name="compoundBatchNumber"
                  @change="shipmentForm.grapheneSample = ''; shipmentForm.micronizationSku = ''"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  :required="shipmentForm.materialType === 'compound'"
                >
                  <option value="">Select compound batch...</option>
                  <template x-for="batch in compoundBatches" :key="batch.id">
                    <option :value="batch.batchNumber" 
                            x-text="\`\${batch.batchNumber} - \${batch.batchName || 'Unnamed'} (\${batch.totalOutput || 0}g)\`"></option>
                  </template>
                </select>
              </div>
              <div x-show="shipmentForm.materialType === 'micronized'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Micronized SKU</label>
                <select
                  x-model="shipmentForm.micronizationSku"
                  name="micronizationSku"
                  @change="shipmentForm.grapheneSample = ''; shipmentForm.compoundBatchNumber = ''; shipmentForm.mcbNumber = ''"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  :required="shipmentForm.materialType === 'micronized'"
                >
                  <option value="">Select micronized SKU...</option>
                  <template x-for="micronization in micronizations" :key="micronization.id">
                    <option :value="micronization.sku"
                            x-text="\`\${micronization.sku} - \${micronization.micronizationNumber} (\${micronization.recoveredAmount || 0}g)\`"></option>
                  </template>
                </select>
              </div>
              <div x-show="shipmentForm.materialType === 'mcb'">
                <label class="block text-sm font-medium text-gray-700 mb-1">MCB</label>
                <select
                  x-model="shipmentForm.mcbNumber"
                  name="mcbNumber"
                  @change="shipmentForm.grapheneSample = ''; shipmentForm.compoundBatchNumber = ''; shipmentForm.micronizationSku = ''"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  :required="shipmentForm.materialType === 'mcb'"
                >
                  <option value="">Select MCB...</option>
                  <template x-for="mcb in mcbs" :key="mcb.id">
                    <option :value="mcb.mcbNumber"
                            x-text="\`\${mcb.mcbNumber} - \${mcb.mcbName || 'Unnamed'} (\${mcb.totalRecoveredAmount || 0}g) - \${mcb.micronizationCount} batches\`"></option>
                  </template>
                </select>
              </div>
              <div x-html="getNumericFieldHtml({
                label: 'Amount Shipped',
                modelVariable: 'shipmentForm.amountShipped',
                unit: 'g'
              })"></div>
            </div>

            <!-- Row 5: Purpose and Status -->
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <select
                  x-model="shipmentForm.purpose"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="">Select purpose...</option>
                  <option value="Testing">Testing</option>
                  <option value="Micronization">Micronization</option>
                  <option value="Storage">Storage</option>
                  <option value="Processing">Processing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  x-model="shipmentForm.status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="in_transit">In Transit</option>
                  <option value="received">Received</option>
                </select>
              </div>
            </div>

            <!-- Row 6: Comments -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-1">Comments</label>
              <textarea
                x-model="shipmentForm.comments"
                rows="3"
                placeholder="Additional notes about this shipment..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              ></textarea>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-2">
              <button type="button" @click="closeShipmentForm()" 
                      class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800">
                <span x-text="editingShipment ? 'Update' : 'Create'"></span> Shipment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Export for use in main application
window.getShipmentModalHtml = getShipmentModalHtml;