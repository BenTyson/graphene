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
          
          <!-- My Tasks Widget -->
          <div class="bg-white border border-gray-200 rounded-lg p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-semibold text-gray-900">My Tasks</h3>
              <button @click="switchTab('tasks')" class="text-xs text-gray-500 hover:text-gray-700">View all</button>
            </div>
            <div x-init="$watch('activeTab', async (tab) => { if (tab === 'dashboard') { try { $el._myTasks = await (await fetch('/api/tasks?' + new URLSearchParams({ assigneeId: currentUser?.id || '', sortBy: 'dueDate', order: 'asc', limit: '5' }), { headers: window.authService?.getAuthHeader() })).json(); } catch(e) { $el._myTasks = []; } } })"
              x-effect="if (activeTab === 'dashboard' && currentUser?.id) { fetch('/api/tasks?' + new URLSearchParams({ assigneeId: currentUser.id, sortBy: 'dueDate', order: 'asc', limit: '5' }), { headers: window.authService?.getAuthHeader() }).then(r => r.json()).then(d => $el._myTasks = d.filter(t => t.status !== 'DONE' && t.status !== 'ARCHIVED')).catch(() => $el._myTasks = []) }">
              <template x-if="$el._myTasks && $el._myTasks.length > 0">
                <div class="space-y-2">
                  <template x-for="task in $el._myTasks" :key="task.id">
                    <div @click="switchTab('tasks'); setTimeout(() => openTaskDetail(task.id), 300)"
                      class="flex items-center justify-between py-2 px-2 rounded hover:bg-gray-50 cursor-pointer group">
                      <div class="flex items-center gap-2 min-w-0">
                        <span :class="getPriorityBadgeClass(task.priority)"
                          class="w-1.5 h-1.5 rounded-full shrink-0"></span>
                        <span class="text-sm text-gray-700 truncate" x-text="task.title"></span>
                      </div>
                      <span v-if="task.dueDate" :class="getTaskDueClass(task.dueDate, task.status)"
                        class="text-[11px] shrink-0 ml-2"
                        x-text="getTaskDueLabel(task.dueDate)"></span>
                    </div>
                  </template>
                </div>
              </template>
              <template x-if="!$el._myTasks || $el._myTasks.length === 0">
                <p class="text-sm text-gray-400 py-4 text-center">No active tasks assigned to you</p>
              </template>
            </div>
          </div>
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