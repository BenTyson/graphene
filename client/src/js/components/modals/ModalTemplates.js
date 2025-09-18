/**
 * Modal Templates System
 * 
 * Provides reusable modal templates for different card types
 * Designed for easy expansion to support new card types in the future
 * 
 * Features:
 * - Consistent modal structure across all card types
 * - Customizable headers, content, and footers
 * - Type-specific branding and styling
 * - Extensible architecture for new modal types
 */

/**
 * Get modal template configuration for different card types
 * @param {string} cardType - The type of card (graphene, compoundBatch, etc.)
 * @returns {Object} Template configuration
 */
function getModalTemplate(cardType) {
  const templates = {
    graphene: {
      title: 'Graphene Experiment Details',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
      </svg>`,
      headerColor: 'bg-green-50 border-green-200 text-green-900',
      badgeColor: 'bg-green-100 text-green-800',
      actions: ['view', 'edit']
    },
    
    compoundBatch: {
      title: 'Compound Batch Details',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10"></path>
      </svg>`,
      headerColor: 'bg-blue-50 border-blue-200 text-blue-900',
      badgeColor: 'bg-blue-100 text-blue-800',
      actions: ['view', 'edit']
    },
    
    shipment: {
      title: 'Material Shipment Details',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
      </svg>`,
      headerColor: 'bg-purple-50 border-purple-200 text-purple-900',
      badgeColor: 'bg-purple-100 text-purple-800',
      actions: ['view', 'track']
    },
    
    biochar: {
      title: 'Biochar Experiment Details',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path>
      </svg>`,
      headerColor: 'bg-orange-50 border-orange-200 text-orange-900',
      badgeColor: 'bg-orange-100 text-orange-800',
      actions: ['view', 'edit']
    },
    
    micronization: {
      title: 'Micronization Process Details',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>`,
      headerColor: 'bg-indigo-50 border-indigo-200 text-indigo-900',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      actions: ['view', 'edit']
    },
    
    report: {
      title: 'Report Details',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>`,
      headerColor: 'bg-gray-50 border-gray-200 text-gray-900',
      badgeColor: 'bg-gray-100 text-gray-800',
      actions: ['view', 'download']
    },
    
    // Default template for unknown types
    default: {
      title: 'Data Record Details',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>`,
      headerColor: 'bg-gray-50 border-gray-200 text-gray-900',
      badgeColor: 'bg-gray-100 text-gray-800',
      actions: ['view']
    }
  };
  
  return templates[cardType] || templates.default;
}

/**
 * Create a standardized modal header
 * @param {string} cardType - The card type
 * @param {string} identifier - The record identifier
 * @param {Object} options - Header customization options
 * @returns {string} HTML for modal header
 */
function createModalHeader(cardType, identifier, options = {}) {
  const template = getModalTemplate(cardType);
  const customTitle = options.title || template.title;
  
  return `
    <div class="sticky top-0 ${template.headerColor} px-6 py-4 flex justify-between items-center z-10 rounded-t-lg border-b">
      <div class="flex items-center">
        ${template.icon}
        <h2 class="ml-3 text-xl font-semibold">
          ${customTitle}
        </h2>
        <span class="ml-3 px-3 py-1 ${template.badgeColor} text-sm rounded-full font-medium">
          ${identifier}
        </span>
      </div>
      
      <button @click="closeCardModal()" 
              class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-link rounded-full p-1 transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;
}

/**
 * Create a standardized modal footer with action buttons
 * @param {string} cardType - The card type
 * @param {string} identifier - The record identifier
 * @param {Object} options - Footer customization options
 * @returns {string} HTML for modal footer
 */
function createModalFooter(cardType, identifier, options = {}) {
  const template = getModalTemplate(cardType);
  const actions = options.actions || template.actions;
  
  return `
    <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center rounded-b-lg">
      <div class="flex items-center text-xs text-gray-500">
        <span>Modal ID: ${identifier}</span>
      </div>
      
      <div class="flex space-x-3">
        <button @click="closeCardModal()"
                class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-link transition-colors">
          Close
        </button>
        
        ${actions.includes('edit') ? `
          <button class="px-4 py-2 bg-link text-white rounded-md hover:bg-link-hover focus:outline-none focus:ring-2 focus:ring-link-light transition-colors"
                  @click="openEditModal('${cardType}', '${identifier}')">
            Edit
          </button>
        ` : ''}
        
        ${actions.includes('download') ? `
          <button class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  @click="downloadRecord('${cardType}', '${identifier}')">
            Download
          </button>
        ` : ''}
        
        ${actions.includes('track') ? `
          <button class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                  @click="trackShipment('${identifier}')">
            Track
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Create a complete modal using templates
 * @param {string} cardType - The card type
 * @param {string} identifier - The record identifier
 * @param {Object} options - Modal customization options
 * @returns {string} HTML for complete modal
 */
function createTemplatedModal(cardType, identifier, options = {}) {
  const template = getModalTemplate(cardType);
  const modalId = `templated_modal_${cardType}_${identifier}`;
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
      <div class="fixed inset-0 bg-black bg-opacity-50 card-modal-overlay"></div>
      
      <!-- Modal content -->
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-screen overflow-y-auto relative card-modal-content"
             x-transition:enter="transition ease-out duration-300"
             x-transition:enter-start="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
             x-transition:enter-end="opacity-100 translate-y-0 sm:scale-100"
             x-transition:leave="transition ease-in duration-200"
             x-transition:leave-start="opacity-100 translate-y-0 sm:scale-100"
             x-transition:leave-end="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
             @click.stop>
          
          ${createModalHeader(cardType, identifier, options)}
          
          <!-- Modal body with detailed card content -->
          <div class="p-6 min-h-[400px]">
            <!-- Loading state -->
            <template x-if="modalLoading">
              <div class="flex items-center justify-center py-12">
                <div class="text-center">
                  <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-link mb-4"></div>
                  <p class="text-gray-600">Loading detailed information...</p>
                  <p class="text-gray-400 text-sm mt-2">Please wait while we fetch the data</p>
                </div>
              </div>
            </template>
            
            <!-- Error state -->
            <template x-if="modalError">
              <div class="flex items-center justify-center py-12">
                <div class="text-center">
                  <div class="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
                    <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 class="text-lg font-semibold text-red-900 mb-2">Failed to Load Data</h3>
                    <p class="text-red-700 mb-4" x-text="modalError"></p>
                    <button @click="retryLoadModalData('${cardType}', '${identifier}')"
                            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </template>
            
            <!-- Content state -->
            <template x-if="!modalLoading && !modalError">
              <div x-html="getDetailedCardContent('${cardType}', '${identifier}')" class="min-h-[300px]">
                <!-- Card content will be injected here -->
              </div>
            </template>
          </div>
          
          ${createModalFooter(cardType, identifier, options)}
        </div>
      </div>
    </div>
  `;
}

/**
 * Initialize modal template system
 * @returns {Object} Public API for modal templates
 */
function initializeModalTemplates() {
  return {
    // Get template configuration
    getTemplate: getModalTemplate,
    
    // Create modal parts
    createHeader: createModalHeader,
    createFooter: createModalFooter,
    
    // Create complete modal
    createModal: createTemplatedModal,
    
    // Available card types
    getSupportedTypes: () => Object.keys(getModalTemplate('dummy').__proto__.constructor()),
    
    // Check if card type is supported
    isSupported: (cardType) => !!getModalTemplate(cardType)
  };
}

// Initialize and expose the modal template system
window.ModalTemplates = initializeModalTemplates();

// Modal Templates System initialized - removed excessive logging