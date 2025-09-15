/**
 * Simplified Compound Batch Card Component
 * 
 * Lightweight card component for compound batch dashboard display
 * Matches SimplifiedGrapheneCard structure and styling
 * 
 * Features:
 * - Clickable cards that open compound batch modals
 * - Consistent hover effects and styling with graphene cards
 * - Responsive grid layout
 * - Loading and error state cards
 * - Optimized for dashboard performance
 */

/**
 * Create a simplified compound batch card for dashboard display
 * @param {Object} batch - Compound batch data
 * @param {Object} options - Configuration options
 * @returns {string} HTML string for simplified card
 */
function createSimplifiedCompoundBatchCard(batch, options = {}) {
  if (!batch) {
    return createSimplifiedBatchErrorCard('Unknown', 'No batch data provided');
  }

  const instanceId = options.instanceId || `simplified_batch_${batch.batchNumber || 'unknown'}_${Date.now()}`;
  
  return `
    <div class="simplified-card bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg hover:border-link transition-all duration-200 transform hover:-translate-y-1"
         data-batch="${batch.batchNumber || ''}"
         data-instance="${instanceId}"
         @click="openCompoundBatchModal('${batch.batchNumber || ''}')">
      
      <!-- Batch Number and Date - Primary line -->
      <div class="font-semibold text-lg text-gray-900 mb-2">
        ${batch.batchNumber || 'Unknown'} <span class="text-sm font-normal text-gray-500">| ${batch.createdDate ? formatCardDate(batch.createdDate) : 'Date unknown'}</span>
      </div>
      
      <!-- Batch Name and Output - Secondary line -->
      <div class="text-sm text-gray-600">
        ${batch.batchName ? `${batch.batchName}` : 'No name specified'}${batch.totalOutput ? ` | ${batch.totalOutput}g` : ''}
      </div>
      
      <!-- Constituent Count - Tertiary line -->
      <div class="text-xs text-gray-500 mt-1">
        ${batch.experiments?.length || 0} constituent experiment${(batch.experiments?.length || 0) !== 1 ? 's' : ''}
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
 * Create a simplified loading card for compound batches
 * @param {string} identifier - Loading identifier
 * @returns {string} HTML string for loading card
 */
function createSimplifiedBatchLoadingCard(identifier = 'Loading') {
  return `
    <div class="simplified-card bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
      <!-- Skeleton for batch number -->
      <div class="h-6 bg-gray-200 rounded w-24 mb-2"></div>
      
      <!-- Skeleton for date -->
      <div class="h-4 bg-gray-200 rounded w-20 mb-1"></div>
      
      <!-- Skeleton for batch name -->
      <div class="h-3 bg-gray-200 rounded w-16 mb-1"></div>
      
      <!-- Skeleton for constituent count -->
      <div class="h-3 bg-gray-200 rounded w-20"></div>
      
      <!-- Click indicator area -->
      <div class="mt-3 flex justify-end">
        <div class="h-3 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  `;
}

/**
 * Create a simplified error card for compound batches
 * @param {string} identifier - Batch identifier
 * @param {string} error - Error message
 * @returns {string} HTML string for error card
 */
function createSimplifiedBatchErrorCard(identifier, error = 'Unknown error') {
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
 * Create multiple simplified cards from an array of compound batches
 * @param {Array} batches - Array of compound batch data
 * @param {Object} options - Configuration options
 * @returns {string} HTML string for all cards
 */
function createSimplifiedCompoundBatchCardCollection(batches, options = {}) {
  if (!batches || batches.length === 0) {
    return `
      <div class="col-span-full bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
        <p class="text-gray-600">No compound batches found</p>
      </div>
    `;
  }

  return batches.map(batch => {
    try {
      return createSimplifiedCompoundBatchCard(batch, options);
    } catch (error) {
      console.error('Error creating simplified batch card:', error);
      return createSimplifiedBatchErrorCard(
        batch?.batchNumber || 'Unknown', 
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
window.createSimplifiedCompoundBatchCard = createSimplifiedCompoundBatchCard;
window.createSimplifiedBatchLoadingCard = createSimplifiedBatchLoadingCard;
window.createSimplifiedBatchErrorCard = createSimplifiedBatchErrorCard;
window.createSimplifiedCompoundBatchCardCollection = createSimplifiedCompoundBatchCardCollection;

console.log('Simplified Compound Batch Card components initialized');