// Shipments section helper for expandable table rows
// Displays shipment history for both graphene experiments and compound batches

export function createShipmentsSection(config) {
  const { dataPath, materialType = 'graphene' } = config;
  
  return `
    <div x-show="${dataPath} && ${dataPath}.length > 0" 
         class="border-b border-gray-100 bg-white px-6 py-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-medium text-gray-900 flex items-center">
          <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293L16 16.586a1 1 0 01-.707.293h-2.586a1 1 0 01-.707-.293L9 13.586a1 1 0 00-.707-.293H6"></path>
          </svg>
          Shipment History
        </h4>
        <span class="text-xs text-gray-500" 
              x-text="\`\${${dataPath} ? ${dataPath}.length : 0} shipment\${${dataPath} && ${dataPath}.length === 1 ? '' : 's'}\`">
        </span>
      </div>
      
      <div class="space-y-3">
        <template x-for="shipment in ${dataPath}" :key="shipment.id">
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center space-x-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-gray-100 text-gray-800': shipment.status === 'pending',
                        'bg-blue-100 text-blue-800': shipment.status === 'shipped',
                        'bg-yellow-100 text-yellow-800': shipment.status === 'in_transit',
                        'bg-green-100 text-green-800': shipment.status === 'received'
                      }"
                      x-text="shipment.status ? shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1).replace('_', ' ') : 'Shipped'">
                </span>
                <span class="text-sm font-medium text-gray-900" x-text="shipment.shipmentNumber"></span>
              </div>
              <div class="text-sm text-gray-500">
                <span x-text="shipment.shipmentDate ? new Date(shipment.shipmentDate).toLocaleDateString() : 'Date unknown'"></span>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div class="flex items-center space-x-2 mb-1">
                  <span class="text-gray-600">From:</span>
                  <span class="text-gray-900" x-text="shipment.shipFromLocation"></span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-gray-600">To:</span>
                  <span class="text-gray-900" x-text="shipment.shipToLocation"></span>
                </div>
              </div>
              <div>
                <div class="flex items-center space-x-2 mb-1">
                  <span class="text-gray-600">Amount:</span>
                  <span class="text-gray-900" x-text="shipment.amountShipped ? \`\${shipment.amountShipped} \${shipment.unit || 'g'}\` : '—'"></span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-gray-600">Purpose:</span>
                  <span class="text-gray-900" x-text="shipment.purpose || '—'"></span>
                </div>
              </div>
            </div>
            
            <div x-show="shipment.comments" class="mt-3 pt-3 border-t border-gray-200">
              <div class="text-sm">
                <span class="text-gray-600">Comments:</span>
                <span class="text-gray-900 ml-2" x-text="shipment.comments"></span>
              </div>
            </div>
            
            <div x-show="shipment.receivedDate" class="mt-2">
              <div class="text-xs text-gray-500">
                <span>Received: </span>
                <span x-text="shipment.receivedDate ? new Date(shipment.receivedDate).toLocaleDateString() : 'Not received'"></span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    
    <div x-show="!${dataPath} || ${dataPath}.length === 0" 
         class="border-b border-gray-100 bg-gray-50 px-6 py-4">
      <div class="text-sm text-gray-500 text-center flex items-center justify-center">
        <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293L16 16.586a1 1 0 01-.707.293h-2.586a1 1 0 01-.707-.293L9 13.586a1 1 0 00-.707-.293H6"></path>
        </svg>
        No shipment history recorded
      </div>
    </div>
  `;
}

// Export the function for use in other modules
export default {
  createShipmentsSection
};