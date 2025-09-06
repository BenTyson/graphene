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
      <div class="mb-6 flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Production Dashboard</h2>
          <p class="text-sm text-gray-500 mt-1">Overview of graphene production, testing, and distribution</p>
        </div>
        <button @click="refreshDashboard()" 
                class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 touch-target flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      <!-- Dashboard Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Production Metrics Widget -->
        <div x-html="getProductionWidget()"></div>
        
        <!-- Inventory Location Widget -->
        <div x-html="getInventoryWidget()"></div>
        
        <!-- Test Results Widget -->
        <div x-html="getTestResultsWidget()"></div>
        
        <!-- Recent Activity Widget - Hidden for now but saved for later -->
        <!-- <div x-html="getActivityWidget()"></div> -->
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