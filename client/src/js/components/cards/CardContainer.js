/**
 * Card Container Component
 * Handles different display modes (popup/inline) for the data card
 * Manages responsive behavior and animations
 */

/**
 * Create a container wrapper for the card based on display mode
 * @param {Object} config - Container configuration
 * @param {string} config.displayMode - 'popup' or 'inline'
 * @param {string} config.content - The card content HTML
 * @param {string} config.instanceId - Unique ID for this card instance
 * @param {Object} config.data - Card data for title/identification
 * @returns {string} HTML string for the container
 */
function createCardContainer(config) {
  const { displayMode, content, instanceId, data } = config;
  
  if (displayMode === 'popup') {
    return createPopupContainer({ content, instanceId, data });
  } else {
    return createInlineContainer({ content, instanceId, data });
  }
}

/**
 * Create popup container with overlay
 */
function createPopupContainer({ content, instanceId, data }) {
  return `
    <!-- Popup Container with Alpine Data -->
    <div x-data="{
      showCardPopup_${instanceId}: false,
      cardLoading_${instanceId}: false,
      cardError_${instanceId}: null,
      cardMenuOpen_${instanceId}: false,
      metricsExpanded: false
    }">
      <!-- Popup Overlay -->
      <div class="fixed inset-0 z-50 overflow-y-auto" 
           x-show="showCardPopup_${instanceId}"
           x-cloak
           @keydown.escape.window="showCardPopup_${instanceId} = false">
        
        <!-- Background overlay with fade -->
        <div class="fixed inset-0 bg-black transition-opacity"
             x-show="showCardPopup_${instanceId}"
             x-transition:enter="ease-out duration-300"
             x-transition:enter-start="opacity-0"
             x-transition:enter-end="opacity-50"
             x-transition:leave="ease-in duration-200"
             x-transition:leave-start="opacity-50"
             x-transition:leave-end="opacity-0"
             @click="showCardPopup_${instanceId} = false"></div>
        
        <!-- Popup Card -->
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="data-card-popup relative w-full max-w-4xl transform transition-all"
               x-show="showCardPopup_${instanceId}"
               x-transition:enter="ease-out duration-300"
               x-transition:enter-start="opacity-0 scale-95"
               x-transition:enter-end="opacity-100 scale-100"
               x-transition:leave="ease-in duration-200"
               x-transition:leave-start="opacity-100 scale-100"
               x-transition:leave-end="opacity-0 scale-95"
               @click.away="showCardPopup_${instanceId} = false">
            
            <!-- Close button -->
            <button class="absolute top-4 right-4 z-10 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    @click="showCardPopup_${instanceId} = false">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            <!-- Card Content -->
            <div class="bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
              ${content}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Create inline container for embedded display
 */
function createInlineContainer({ content, instanceId, data }) {
  return `
    <!-- Inline Card Container -->
    <div class="data-card-inline w-full"
         x-data="{ 
           cardExpanded_${instanceId}: false,
           cardLoading_${instanceId}: false,
           cardError_${instanceId}: null,
           cardMenuOpen_${instanceId}: false,
           metricsExpanded: false
         }"
         x-init="$watch('cardExpanded_${instanceId}', value => {
           if (value) {
             // Optional: Track expanded cards
             $dispatch('card-expanded', { instanceId: '${instanceId}' });
           }
         })">
      
      <!-- Card Content -->
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        ${content}
      </div>
    </div>
  `;
}

/**
 * Helper function to open a popup card
 * Can be called from Alpine.js
 */
function openCardPopup(instanceId, data = null) {
  // Set Alpine.js state to show popup
  if (window.Alpine) {
    // Store the data if provided
    if (data && window.Alpine.store('cardData')) {
      Alpine.store('cardData')[instanceId] = data;
    }
    
    // Show the popup
    if (window.Alpine.store('cardPopups')) {
      Alpine.store('cardPopups')[instanceId] = true;
    } else {
      // Fallback to direct variable
      window[`showCardPopup_${instanceId}`] = true;
    }
  }
}

/**
 * Helper function to close a popup card
 */
function closeCardPopup(instanceId) {
  if (window.Alpine) {
    if (window.Alpine.store('cardPopups')) {
      Alpine.store('cardPopups')[instanceId] = false;
    } else {
      window[`showCardPopup_${instanceId}`] = false;
    }
  }
}

/**
 * Create a card toggle button (for switching between views)
 */
function createCardToggleButton(config = {}) {
  const { currentView = 'table', iconOnly = false } = config;
  
  return `
    <button @click="viewMode = viewMode === 'table' ? 'card' : 'table'"
            class="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            :class="{ 'bg-gray-100': viewMode === 'card' }">
      
      <!-- Table Icon -->
      <svg x-show="viewMode === 'table'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
      </svg>
      
      <!-- Card Icon -->
      <svg x-show="viewMode === 'card'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
      </svg>
      
      ${!iconOnly ? `
        <span x-text="viewMode === 'table' ? 'Card View' : 'Table View'"></span>
      ` : ''}
    </button>
  `;
}

