/**
 * Simplified Shipment Card Component
 * 
 * Lightweight card component for shipment dashboard display
 * Matches SimplifiedGrapheneCard and SimplifiedCompoundBatchCard structure
 * 
 * Features:
 * - Clickable cards that open shipment modals
 * - Status indicators with color coding (pending, shipped, in_transit, received)
 * - Material type detection (graphene, compound batch, micronized)
 * - From/To location display with arrow
 * - Consistent hover effects and styling
 * - Responsive grid layout
 */

/**
 * Create a simplified shipment card for dashboard display
 * @param {Object} shipment - Shipment data
 * @param {Object} options - Configuration options
 * @returns {string} HTML string for simplified card
 */
function createSimplifiedShipmentCard(shipment, options = {}) {
  if (!shipment) {
    return createSimplifiedShipmentErrorCard('Unknown', 'No shipment data provided');
  }

  const instanceId = options.instanceId || `simplified_shipment_${shipment.shipmentNumber || 'unknown'}_${Date.now()}`;
  
  // Determine material type and source
  const materialInfo = getMaterialTypeInfo(shipment);
  
  // Get status styling
  const statusStyling = getStatusStyling(shipment.status);
  
  return `
    <div class="simplified-card bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg hover:border-link transition-all duration-200 transform hover:-translate-y-1"
         data-shipment="${shipment.shipmentNumber || ''}"
         data-instance="${instanceId}"
         @click="window.routerService.navigateToDataPage('shipment', '${shipment.shipmentNumber || ''}')"
         >
      
      <!-- Shipment Number and Date - Primary line -->
      <div class="font-semibold text-lg text-gray-900 mb-2">
        ${shipment.shipmentNumber || 'Unknown'} <span class="text-sm font-normal text-gray-500">| ${shipment.shipmentDate ? formatCardDate(shipment.shipmentDate) : 'Date unknown'}</span>
      </div>
      
      <!-- From/To Locations and Amount - Secondary line -->
      <div class="text-sm text-gray-600 mb-1">
        ${shipment.shipFromLocation || 'Unknown'} → ${shipment.shipToLocation || 'Unknown'}${shipment.amountShipped ? ` | ${shipment.amountShipped}${shipment.unit || 'g'}` : ''}
      </div>
      
      <!-- Material Type and Status - Tertiary line -->
      <div class="text-xs text-gray-500 flex items-center justify-between">
        <span>${materialInfo.type}: ${materialInfo.identifier}</span>
        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyling.classes}">
          ${statusStyling.icon}
          ${getStatusDisplayText(shipment.status)}
        </span>
      </div>
      
      <!-- Visual click indicator -->
      <div class="mt-3 flex items-center justify-end text-xs text-gray-400">
        <span class="mr-1">View details</span>
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </div>
    </div>
  `;
}

/**
 * Determine material type and identifier from shipment data
 * @param {Object} shipment - Shipment data
 * @returns {Object} Material type info
 */
function getMaterialTypeInfo(shipment) {
  if (shipment.grapheneSample) {
    return {
      type: 'Graphene',
      identifier: shipment.grapheneSample
    };
  } else if (shipment.compoundBatchNumber) {
    return {
      type: 'Compound Batch',
      identifier: shipment.compoundBatchNumber
    };
  } else if (shipment.micronizationSku) {
    return {
      type: 'Micronized',
      identifier: shipment.micronizationSku
    };
  } else {
    return {
      type: 'Material',
      identifier: 'Unspecified'
    };
  }
}

/**
 * Get status styling classes and icons
 * @param {string} status - Shipment status
 * @returns {Object} Status styling info
 */
function getStatusStyling(status) {
  const statusStyles = {
    'pending': {
      classes: 'bg-yellow-100 text-yellow-800',
      icon: `<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`
    },
    'shipped': {
      classes: 'bg-blue-100 text-blue-800',
      icon: `<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4"></path>
      </svg>`
    },
    'in_transit': {
      classes: 'bg-purple-100 text-purple-800',
      icon: `<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>`
    },
    'received': {
      classes: 'bg-green-100 text-green-800',
      icon: `<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>`
    }
  };
  
  return statusStyles[status] || statusStyles['shipped']; // Default to shipped styling
}

/**
 * Get human-readable status text
 * @param {string} status - Shipment status
 * @returns {string} Display text
 */
function getStatusDisplayText(status) {
  const statusText = {
    'pending': 'Pending',
    'shipped': 'Shipped',
    'in_transit': 'In Transit',
    'received': 'Received'
  };
  
  return statusText[status] || 'Shipped';
}

/**
 * Create a simplified loading card for shipments
 * @param {string} identifier - Loading identifier
 * @returns {string} HTML string for loading card
 */
function createSimplifiedShipmentLoadingCard(identifier = 'Loading') {
  return `
    <div class="simplified-card bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
      <!-- Skeleton for shipment number -->
      <div class="h-6 bg-gray-200 rounded w-32 mb-2"></div>
      
      <!-- Skeleton for date -->
      <div class="h-4 bg-gray-200 rounded w-20 mb-1"></div>
      
      <!-- Skeleton for locations -->
      <div class="h-3 bg-gray-200 rounded w-40 mb-1"></div>
      
      <!-- Skeleton for material type and status -->
      <div class="flex justify-between items-center mb-3">
        <div class="h-3 bg-gray-200 rounded w-24"></div>
        <div class="h-5 bg-gray-200 rounded w-16"></div>
      </div>
      
      <!-- Click indicator area -->
      <div class="flex justify-end">
        <div class="h-3 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  `;
}

/**
 * Create a simplified error card for shipments
 * @param {string} identifier - Shipment identifier
 * @param {string} error - Error message
 * @returns {string} HTML string for error card
 */
function createSimplifiedShipmentErrorCard(identifier, error = 'Unknown error') {
  return `
    <div class="simplified-card bg-red-50 border border-red-200 rounded-lg p-4">
      <!-- Error icon and identifier -->
      <div class="flex items-center text-red-600 mb-2">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="font-semibold">${identifier}</span>
      </div>
      
      <!-- Error message -->
      <div class="text-sm text-red-700">
        ${error}
      </div>
    </div>
  `;
}

/**
 * Create multiple simplified cards from an array of shipments
 * @param {Array} shipments - Array of shipment data
 * @param {Object} options - Configuration options
 * @returns {string} HTML string for all cards
 */
function createSimplifiedShipmentCardCollection(shipments, options = {}) {
  if (!shipments || shipments.length === 0) {
    return `
      <div class="col-span-full bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
        </svg>
        <p class="text-gray-600">No shipments found</p>
      </div>
    `;
  }

  return shipments.map(shipment => {
    try {
      return createSimplifiedShipmentCard(shipment, options);
    } catch (error) {
      console.error('Error creating simplified shipment card:', error);
      return createSimplifiedShipmentErrorCard(
        shipment?.shipmentNumber || 'Unknown', 
        'Card creation error'
      );
    }
  }).join('');
}

/**
 * Format card date for display (reusing the formatCardDate function)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatCardDate(date) {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime()) || dateObj.getFullYear() <= 1970) {
      return 'N/A';
    }
    
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
}

// Make functions globally available
window.createSimplifiedShipmentCard = createSimplifiedShipmentCard;
window.createSimplifiedShipmentLoadingCard = createSimplifiedShipmentLoadingCard;
window.createSimplifiedShipmentErrorCard = createSimplifiedShipmentErrorCard;
window.createSimplifiedShipmentCardCollection = createSimplifiedShipmentCardCollection;

console.log('Simplified Shipment Card components initialized');