/**
 * Dashboard Tab Component
 * 
 * Provides the production dashboard interface including:
 * - Header with title and refresh button
 * - Production metrics widget
 * - Inventory location widget  
 * - Test results widget
 * - Error display with retry functionality
 * 
 * Dependencies:
 * - Alpine.js data: activeTab, dashboardError
 * - Alpine.js methods: refreshDashboard()
 * - Dashboard widgets: getProductionWidget(), getInventoryWidget(), getTestResultsWidget()
 * - Global styling: Standard button and grid classes
 */

/**
 * Returns the complete HTML for the Dashboard tab component
 * @returns {string} HTML string for the Dashboard tab
 */
function getDashboardTabHtml() {
  return `
    <!-- Dashboard Tab -->
    <div x-show="activeTab === 'dashboard'" x-cloak>

      <!-- Dashboard Grid -->
      <div class="space-y-8">
        <!-- Production Metrics Widget - Full Width -->
        <div class="grid grid-cols-1 gap-8">
          <div x-html="getProductionWidget()"></div>
        </div>
        
        <!-- Secondary Widgets - Two Column Layout -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Inventory Location Widget -->
          <div x-html="getInventoryWidget()"></div>
          
          <!-- Test Results Widget -->
          <div x-html="getTestResultsWidget()"></div>
          
          <!-- Recent Activity Widget - Hidden for now but saved for later -->
          <!-- <div x-html="getActivityWidget()"></div> -->
        </div>
      </div>

      <!-- Latest Production Data -->
      <div class="mt-12 space-y-8">
        
        <!-- Latest Graphene Batches -->
        <div>
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-900">Latest Graphene Batches</h3>
            <span class="text-sm text-gray-600">Last 4 experiments</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            <template x-for="(experiment, index) in latestGrapheneCards.slice(0, 4)" :key="experiment.id">
              <div x-html="createGrapheneCard(experiment)"></div>
            </template>
            <template x-if="!latestGrapheneCards || latestGrapheneCards.length === 0">
              <div class="col-span-full bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p class="text-gray-600">No graphene experiments found</p>
              </div>
            </template>
          </div>
        </div>
        
        <!-- Latest Compound Batches -->
        <div>
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-900">Latest Compound Batches</h3>
            <span class="text-sm text-gray-600">Last 4 batches</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            <template x-for="(batch, index) in latestCompoundBatches.slice(0, 4)" :key="batch.id">
              <div x-html="createCompoundBatchCard(batch)"></div>
            </template>
            <template x-if="!latestCompoundBatches || latestCompoundBatches.length === 0">
              <div class="col-span-full bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p class="text-gray-600">No compound batches found</p>
              </div>
            </template>
          </div>
        </div>
        
        <!-- Latest Shipments -->
        <div>
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-900">Latest Shipments</h3>
            <span class="text-sm text-gray-600">Last 2 shipments</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <template x-for="(shipment, index) in latestShipments.slice(0, 2)" :key="shipment.id">
              <div x-html="createShipmentCard(shipment)"></div>
            </template>
            <template x-if="!latestShipments || latestShipments.length === 0">
              <div class="col-span-full bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p class="text-gray-600">No shipments found</p>
              </div>
            </template>
          </div>
        </div>
        
      </div>

      <!-- Error Display -->
      <div x-show="dashboardError" x-cloak class="mt-6">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-sm text-red-800" x-text="dashboardError"></span>
            <button @click="refreshDashboard()" class="ml-auto text-sm text-red-600 hover:text-red-800">
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Export for use in the main application
export { getDashboardTabHtml };