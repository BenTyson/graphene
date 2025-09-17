/**
 * Card Factory
 * Automatically determines card type and returns appropriate component
 */

class CardFactory {
  /**
   * Create a card based on data type
   * @param {Object} data - The experiment/batch data
   * @param {Object} options - Card configuration options
   * @returns {string} HTML string for the card
   */
  static createCard(data, options = {}) {
    // Determine the card type from the data
    const cardType = this.detectCardType(data);
    
    // Get appropriate preset based on card type and context
    const preset = options.preset || this.getDefaultPreset(cardType, options.context);
    
    // Merge options with preset
    const config = {
      ...getCardConfig(preset),
      ...options,
      data: data,
      instanceId: options.instanceId || this.generateInstanceId(data)
    };
    
    // Return the appropriate card
    if (window.createMasterDataCard) {
      return window.createMasterDataCard(config);
    } else {
      // Fallback to simplified cards if master card isn't available
      const cardType = this.detectCardType(data);
      if (cardType === 'graphene' && window.createSimplifiedGrapheneCard) {
        return window.createSimplifiedGrapheneCard(data, options);
      } else if (cardType === 'compoundBatch' && window.createSimplifiedCompoundBatchCard) {
        return window.createSimplifiedCompoundBatchCard(data, options);
      } else if (cardType === 'shipment' && window.createSimplifiedShipmentCard) {
        return window.createSimplifiedShipmentCard(data, options);
      } else {
        return this.createErrorCard(data.experimentNumber || data.batchNumber || 'Unknown', 'Card type not supported');
      }
    }
  }
  
  /**
   * Create a card by fetching data first
   * @param {string} identifier - The experiment/batch number
   * @param {Object} options - Card configuration options
   * @returns {Promise<string>} HTML string for the card
   */
  static async createCardAsync(identifier, options = {}) {
    try {
      // Show loading state
      if (options.showLoading) {
        return this.createLoadingCard(identifier);
      }
      
      // Fetch the data using CardService
      const data = await window.CardService.getCardByIdentifier(identifier);
      
      // Create the card with the fetched data
      return this.createCard(data, options);
    } catch (error) {
      console.error(`Failed to create card for ${identifier}:`, error);
      return this.createErrorCard(identifier, error.message);
    }
  }
  
  /**
   * Detect card type from data
   * @param {Object} data - The experiment/batch data
   * @returns {string} Card type
   */
  static detectCardType(data) {
    if (data.isShipment || data.shipmentNumber) {
      return 'shipment';
    } else if (data.isCompoundBatch || data.batchNumber) {
      return 'compoundBatch';
    } else if (data.micronizationNumber) {
      return 'micronization';
    } else if (data.experimentNumber) {
      if (data.experimentNumber.startsWith('MRa')) {
        return 'graphene';
      } else if (data.experimentNumber.startsWith('MB') || data.experimentNumber.startsWith('BC')) {
        return 'biochar';
      }
    }
    return 'unknown';
  }
  
  /**
   * Get default preset for card type and context
   * @param {string} cardType - The type of card
   * @param {string} context - The usage context
   * @returns {string} Preset name
   */
  static getDefaultPreset(cardType, context) {
    // Context-specific presets
    if (context === 'table') {
      return 'tableRow';
    } else if (context === 'dashboard') {
      return 'dashboard';
    } else if (context === 'search') {
      return 'search';
    } else if (context === 'modal') {
      return 'modal';
    }
    
    // Card type specific defaults
    switch (cardType) {
      case 'compoundBatch':
        return 'compoundBatch';
      case 'shipment':
        return 'shipment';
      case 'graphene':
      case 'biochar':
      case 'micronization':
        return 'inline';
      default:
        return 'inline';
    }
  }
  
  /**
   * Generate unique instance ID
   * @param {Object} data - The experiment/batch data
   * @returns {string} Instance ID
   */
  static generateInstanceId(data) {
    const prefix = data.experimentNumber || data.batchNumber || data.micronizationNumber || data.shipmentNumber || 'card';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    // Sanitize the prefix to create valid JavaScript identifiers
    const sanitizedPrefix = prefix.replace(/[^a-zA-Z0-9_]/g, '_');
    return `${sanitizedPrefix}_${timestamp}_${random}`;
  }
  
  /**
   * Create a loading card
   * @param {string} identifier - The experiment/batch number
   * @returns {string} HTML string for loading card
   */
  static createLoadingCard(identifier) {
    return `
      <div class="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
        <div class="flex items-center justify-between mb-4">
          <div class="h-6 bg-gray-200 rounded w-32"></div>
          <div class="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div class="space-y-3">
          <div class="h-4 bg-gray-200 rounded w-full"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div class="text-xs text-gray-500 mt-4">Loading ${identifier}...</div>
      </div>
    `;
  }
  
  /**
   * Create an error card
   * @param {string} identifier - The experiment/batch number
   * @param {string} error - Error message
   * @returns {string} HTML string for error card
   */
  static createErrorCard(identifier, error) {
    return `
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <p class="text-sm text-red-800 font-medium">Failed to load ${identifier}</p>
            <p class="text-xs text-red-600 mt-1">${error}</p>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Create a collection of cards
   * @param {Array} dataArray - Array of experiment/batch data
   * @param {Object} options - Card configuration options
   * @returns {string} HTML string for multiple cards
   */
  static createCardCollection(dataArray, options = {}) {
    if (!dataArray || dataArray.length === 0) {
      return this.createEmptyStateCard(options.emptyMessage || 'No data available');
    }
    
    const cards = dataArray.map(data => this.createCard(data, options));
    
    // Wrap in appropriate container based on layout
    const layout = options.layout || 'grid';
    
    if (layout === 'grid') {
      return `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${cards.join('')}
        </div>
      `;
    } else if (layout === 'list') {
      return `
        <div class="space-y-4">
          ${cards.join('')}
        </div>
      `;
    } else {
      return cards.join('');
    }
  }
  
  /**
   * Create an empty state card
   * @param {string} message - Empty state message
   * @returns {string} HTML string for empty state
   */
  static createEmptyStateCard(message) {
    return `
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p class="text-gray-600">${message}</p>
      </div>
    `;
  }
  
  /**
   * Create a hover card for quick preview
   * @param {Object} data - The experiment/batch data
   * @returns {string} HTML string for hover card
   */
  static createHoverCard(data) {
    return this.createCard(data, {
      preset: 'dashboard',
      context: 'hover'
    });
  }
  
  /**
   * Create a search result card
   * @param {Object} data - The experiment/batch data
   * @param {string} searchQuery - The search query for highlighting
   * @returns {string} HTML string for search result card
   */
  static createSearchCard(data, searchQuery) {
    return this.createCard(data, {
      preset: 'search',
      context: 'search',
      searchQuery: searchQuery
    });
  }
  
  /**
   * Create a shipment card
   * @param {Object} data - The shipment data
   * @param {Object} options - Card configuration options
   * @returns {string} HTML string for shipment card
   */
  static createShipmentCard(data, options = {}) {
    // Ensure data has shipment identifier
    data.isShipment = true;
    
    return this.createCard(data, {
      preset: 'shipment',
      context: 'dashboard',
      ...options
    });
  }
  
  /**
   * Create a dashboard metric card
   * @param {Object} data - The metric data
   * @param {string} metricType - Type of metric (production, inventory, etc.)
   * @returns {string} HTML string for metric card
   */
  static createMetricCard(data, metricType) {
    return `
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium text-gray-600">${data.title}</h3>
          ${data.trend ? `
            <span class="text-xs ${data.trend > 0 ? 'text-green-600' : 'text-red-600'}">
              ${data.trend > 0 ? '↑' : '↓'} ${Math.abs(data.trend)}%
            </span>
          ` : ''}
        </div>
        <div class="text-2xl font-bold text-gray-900">${data.value}</div>
        ${data.subtitle ? `
          <p class="text-xs text-gray-500 mt-1">${data.subtitle}</p>
        ` : ''}
      </div>
    `;
  }
}

// Make CardFactory globally available
window.CardFactory = CardFactory;

// Create wrapper functions for dashboard compatibility
window.createGrapheneCard = function(experiment, options = {}) {
  if (window.createSimplifiedGrapheneCard) {
    return window.createSimplifiedGrapheneCard(experiment, options);
  }
  return CardFactory.createCard(experiment, { preset: 'dashboard', context: 'dashboard', ...options });
};

window.createCompoundBatchCard = function(batch, options = {}) {
  if (window.createSimplifiedCompoundBatchCard) {
    return window.createSimplifiedCompoundBatchCard(batch, options);
  }
  return CardFactory.createCard(batch, { preset: 'compoundBatch', context: 'dashboard', ...options });
};

window.createShipmentCard = function(shipment, options = {}) {
  if (window.createSimplifiedShipmentCard) {
    return window.createSimplifiedShipmentCard(shipment, options);
  }
  return CardFactory.createShipmentCard(shipment, { context: 'dashboard', ...options });
};

// Add the missing getDetailedCardContent function that modals expect
window.getDetailedCardContent = function(cardType, identifier) {
  // This function should return detailed content for card modals
  console.log('getDetailedCardContent called with:', cardType, identifier);
  
  // For now, prevent modal opening and instead redirect to the appropriate tab
  const message = `Viewing details for ${identifier}. This will redirect to the appropriate tab.`;
  
  // Determine the correct tab based on the identifier
  let targetTab = 'graphene';
  if (identifier && identifier.startsWith('MB') || identifier.startsWith('BC')) {
    targetTab = 'biochar';
  } else if (identifier && identifier.includes('CB') || identifier.includes('batch')) {
    targetTab = 'compound-batches';
  } else if (identifier && identifier.includes('shipment')) {
    targetTab = 'shipments';
  }
  
  // Instead of showing a modal, switch to the appropriate tab
  setTimeout(() => {
    if (window.switchTab) {
      window.switchTab(targetTab);
    } else if (window.grapheneApp && window.grapheneApp().activeTab !== undefined) {
      window.grapheneApp().activeTab = targetTab;
    }
  }, 100);
  
  return `
    <div class="p-4 text-center">
      <h3 class="text-lg font-semibold mb-2">Redirecting...</h3>
      <p class="text-gray-600">${message}</p>
      <div class="mt-4">
        <button onclick="this.closest('.fixed').style.display = 'none'" 
                class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
          Close
        </button>
      </div>
    </div>
  `;
};