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

      <!-- Data Card Test Section -->
      <div class="mt-12 space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-bold text-gray-900">Data Card Preview</h3>
          <div class="flex space-x-2">
            <!-- View Mode Toggle -->
            <div x-html="getCardToggleButton()"></div>
            <!-- Test Card Popup Button -->
            <button @click="showTestCardPopup = true"
                    class="px-4 py-2 text-sm bg-link text-white rounded-lg hover:bg-link-hover transition-colors">
              Test Popup Card
            </button>
          </div>
        </div>
        
        <!-- Card Display Area -->
        <template x-if="typeof viewMode === 'undefined' || viewMode === 'card'">
          <div>
            <!-- Two Column Cards -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <!-- Inline Card Preview -->
              <div x-html="inlineCardHtml || loadInlineCard()"></div>
              
              <!-- Compound Batch Card -->
              <div x-html="compoundBatchCardHtml || loadCompoundBatchCard()"></div>
            </div>
            
            <!-- Full Width Card Example -->
            <div class="space-y-4">
              <h4 class="text-lg font-semibold text-gray-800">Full Width Example</h4>
              <div x-html="fullwidthCardHtml || loadFullwidthCard()"></div>
            </div>
          </div>
        </template>
        
        <!-- Table View (when toggled) -->
        <template x-if="viewMode === 'table'">
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <p class="text-gray-600">Table view would be displayed here. Click "Card View" to see the data cards.</p>
          </div>
        </template>
        
        <!-- Test Popup Card -->
        <div x-html="getTestPopupCard()"></div>
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