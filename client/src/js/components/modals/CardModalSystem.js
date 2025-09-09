/**
 * Card Modal System
 * 
 * Provides a reusable modal management system for displaying detailed card content
 * Supports all card types: graphene, compound batches, shipments, etc.
 * 
 * Features:
 * - Dynamic modal creation on-demand
 * - Full screen modal with detailed card layout
 * - Alpine.js integration with proper state management
 * - Loading and error states
 * - Multiple close mechanisms (ESC, click outside, close button)
 * - Reusable architecture for future expansion
 */

/**
 * Create a card modal for any card type
 * @param {string} cardType - Type of card (graphene, compoundBatch, shipment, etc.)
 * @param {string} identifier - Card identifier (experimentNumber, batchNumber, etc.)
 * @param {Object} options - Modal configuration options
 * @returns {string} HTML string for the modal
 */
function createCardModal(cardType, identifier, options = {}) {
  const modalId = `modal_${cardType}_${identifier}`;
  const sanitizedId = modalId.replace(/[^a-zA-Z0-9_]/g, '_');
  
  return `
    <div x-show="activeCardModal === '${identifier}'" 
         x-cloak
         class="fixed inset-0 z-50 overflow-y-auto"
         id="${sanitizedId}"
         x-transition:enter="transition ease-out duration-300"
         x-transition:enter-start="opacity-0"
         x-transition:enter-end="opacity-100"
         x-transition:leave="transition ease-in duration-200"
         x-transition:leave-start="opacity-100"
         x-transition:leave-end="opacity-0"
         @keydown.escape.window="closeCardModal()"
         @click="closeCardModal()">
      
      <!-- Modal backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      <!-- Modal content -->
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-screen overflow-y-auto relative"
             x-transition:enter="transition ease-out duration-300"
             x-transition:enter-start="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
             x-transition:enter-end="opacity-100 translate-y-0 sm:scale-100"
             x-transition:leave="transition ease-in duration-200"
             x-transition:leave-start="opacity-100 translate-y-0 sm:scale-100"
             x-transition:leave-end="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
             @click.stop>
          
          <!-- Close button - positioned absolutely in top right -->
          <button @click="closeCardModal()" 
                  class="absolute top-4 right-4 z-20 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-link rounded-full p-2 bg-white shadow-lg transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          
          <!-- Modal body with detailed card content - no padding -->
          <div>
            <!-- Loading state -->
            <template x-if="modalLoading">
              <div class="text-center py-12">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-link mb-4"></div>
                <p class="text-gray-600">Loading detailed information...</p>
              </div>
            </template>
            
            <!-- Error state -->
            <template x-if="modalError">
              <div class="text-center py-12">
                <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                  <svg class="w-8 h-8 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h3 class="text-lg font-semibold text-red-900 mb-2">Failed to Load Data</h3>
                  <p class="text-red-700" x-text="modalError"></p>
                  <button @click="retryLoadModalData('${cardType}', '${identifier}')"
                          class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                    Try Again
                  </button>
                </div>
              </div>
            </template>
            
            <!-- Content state -->
            <template x-if="!modalLoading && !modalError">
              <div x-html="getDetailedCardContent('${cardType}', '${identifier}')">
                <!-- Card content will be injected here -->
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Create a modal container for the application
 * This should be added to the main HTML template
 * @returns {string} HTML string for modal container
 */
function createCardModalContainer() {
  return `
    <!-- Card Modal Container -->
    <div id="card-modal-container">
      <!-- Modals are dynamically injected here -->
      <template x-if="activeCardModal">
        <div x-html="getCurrentModalHtml()"></div>
      </template>
    </div>
  `;
}

/**
 * Get display name for card types
 * @param {string} cardType - The card type identifier
 * @returns {string} Human-readable display name
 */
function getCardTypeDisplayName(cardType) {
  const displayNames = {
    'graphene': 'Graphene Experiment',
    'compoundBatch': 'Compound Batch',
    'biochar': 'Biochar Experiment', 
    'shipment': 'Material Shipment',
    'micronization': 'Micronization Process',
    'sem': 'SEM Report',
    'update': 'Update Report'
  };
  
  return displayNames[cardType] || 'Data Record';
}

/**
 * Create modal backdrop click handler
 * @returns {string} JavaScript code for backdrop click handling
 */
function getModalBackdropHandler() {
  return `
    // Handle backdrop click to close modal
    function handleModalBackdropClick(event) {
      // Only close if clicking the backdrop itself, not modal content
      if (event.target === event.currentTarget) {
        closeCardModal();
      }
    }
  `;
}

/**
 * Create keyboard event handler for modals
 * @returns {string} JavaScript code for keyboard handling
 */
function getModalKeyboardHandler() {
  return `
    // Handle keyboard events for modals
    function handleModalKeyboard(event) {
      if (event.key === 'Escape' && activeCardModal) {
        closeCardModal();
        event.preventDefault();
        event.stopPropagation();
      }
    }
    
    // Add event listener when modal system loads
    document.addEventListener('keydown', handleModalKeyboard);
  `;
}

/**
 * Create CSS classes for modal animations and styling
 * @returns {string} CSS styles for modal system
 */
function getModalSystemStyles() {
  return `
    <style>
      /* Modal system styles */
      .card-modal-overlay {
        backdrop-filter: blur(4px);
      }
      
      .card-modal-content {
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }
      
      .card-modal-content:focus {
        outline: none;
        ring: 2px;
        ring-color: var(--link-primary);
      }
      
      /* Simplified card hover styles */
      .simplified-card:hover {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        border-color: var(--link-primary);
      }
      
      .simplified-card:active {
        transform: translateY(0);
      }
      
      /* Modal content spacing */
      .card-modal-content .data-card {
        margin: 0;
        border: none;
        box-shadow: none;
      }
    </style>
  `;
}

/**
 * Initialize modal system
 * @returns {string} JavaScript initialization code
 */
function initializeModalSystem() {
  // Make functions globally available
  window.createCardModal = createCardModal;
  window.createCardModalContainer = createCardModalContainer;
  window.getCardTypeDisplayName = getCardTypeDisplayName;
  window.getModalSystemStyles = getModalSystemStyles;
  
  // Also create a namespace for the modal system
  window.CardModalSystem = {
    createModal: createCardModal,
    getDisplayName: getCardTypeDisplayName,
    createContainer: createCardModalContainer,
    getStyles: getModalSystemStyles
  };
  
  console.log('Card Modal System initialized');
}

// Initialize on load
initializeModalSystem();