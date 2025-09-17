/**
 * Shipments Tab Component
 * 
 * Provides the material shipment tracking interface including:
 * - Header with title and action buttons
 * - Search functionality for shipments
 * - Data table with shipment records
 * - Status badges and material type indicators
 * - Edit/Duplicate/Delete actions
 * - Empty state display
 * 
 * Dependencies:
 * - Alpine.js data: activeTab, shipmentSearch, filteredShipments
 * - Alpine.js methods: exportData, openShipmentForm, searchShipments, duplicateShipment, deleteShipment
 * - Global styling: Standard table and button classes
 */

/**
 * Returns the complete HTML for the Shipments tab component
 * @returns {string} HTML string for the Shipments tab
 */
function getShipmentsTabHtml() {
  return `
    <!-- Shipments Tab -->
    <div x-show="activeTab === 'shipments'" x-cloak>
      <div class="mb-6 flex justify-between items-center">
        <h2 class="text-xl font-semibold">Material Shipment Tracking</h2>
        <div class="flex space-x-2">
          <button @click="exportData('shipments')" class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 touch-target">
            Export CSV
          </button>
          <button @click="openShipmentForm()" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 touch-target">
            Add Shipment
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <input
          type="text"
          x-model="shipmentSearch"
          @input="searchShipments()"
          placeholder="Search shipment numbers, locations, materials, purposes..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        >
      </div>

      <!-- Shipments Table -->
      <div class="overflow-x-auto border border-gray-200 rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Shipment #
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                From
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                To
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Amount
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Material
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Purpose
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template x-for="shipment in filteredShipments" :key="shipment.id">
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <span class="font-medium" x-text="shipment.shipmentNumber"></span>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <span x-text="shipment.shipFromLocation"></span>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <span x-text="shipment.shipToLocation"></span>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <span x-text="window.formatDateSafe(shipment.shipmentDate)"></span>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <span x-text="shipment.amountShipped ? \`\${shipment.amountShipped} \${shipment.unit}\` : '—'"></span>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          :class="shipment.grapheneSample ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'"
                          x-text="shipment.grapheneSample ? 'G' : 'CB'"></span>
                    <span x-text="shipment.grapheneSample || shipment.compoundBatchNumber || '—'"></span>
                  </div>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <span x-text="shipment.purpose || '—'"></span>
                </td>
                <td class="px-4 py-3 text-xs font-mono" style="color: #212121;">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="{
                          'bg-gray-100 text-gray-800': shipment.status === 'pending',
                          'bg-blue-100 text-blue-800': shipment.status === 'shipped',
                          'bg-yellow-100 text-yellow-800': shipment.status === 'in_transit',
                          'bg-green-100 text-green-800': shipment.status === 'received'
                        }"
                        x-text="shipment.status ? shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1).replace('_', ' ') : 'Shipped'"></span>
                </td>
                <td class="px-4 py-3 text-right text-xs font-mono" style="color: #212121;">
                  <div class="flex justify-end space-x-2">
                    <button @click="openShipmentForm(shipment)" class="text-link hover:text-link-hover" title="Edit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button @click="duplicateShipment(shipment)" class="text-gray-400 hover:text-gray-600" title="Duplicate">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    </button>
                    <button @click="deleteShipment(shipment.id)" class="text-red-400 hover:text-red-600" title="Delete">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div x-show="filteredShipments.length === 0" class="text-center py-8 text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293L16 16.586a1 1 0 01-.707.293h-2.586a1 1 0 01-.707-.293L9 13.586a1 1 0 00-.707-.293H6"></path>
        </svg>
        <p>No shipments found</p>
      </div>

    </div>
  `;
}

// Export for use in the main application
export { getShipmentsTabHtml };