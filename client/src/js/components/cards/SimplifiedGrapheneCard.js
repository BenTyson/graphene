/**
 * Simplified Graphene Card Component
 * 
 * Creates minimal clickable cards showing only batch name and date
 * Designed for dashboard use with modal integration
 * 
 * Features:
 * - Minimal display (experiment number, date, species)
 * - Clickable design with hover effects
 * - Loading and error states
 * - Consistent styling with existing card system
 */

/**
 * Create a simplified graphene card for dashboard display
 * @param {Object} experiment - Graphene experiment data
 * @param {Object} options - Configuration options
 * @returns {string} HTML string for simplified card
 */
function createSimplifiedGrapheneCard(experiment, options = {}) {
  if (!experiment) {
    return createSimplifiedErrorCard('Unknown', 'No experiment data provided');
  }

  const instanceId = options.instanceId || `simplified_${experiment.experimentNumber || 'unknown'}_${Date.now()}`;
  
  return `
    <div class="simplified-card bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg hover:border-link transition-all duration-200 transform hover:-translate-y-1"
         data-experiment="${experiment.experimentNumber || ''}"
         data-instance="${instanceId}"
         @click="openGrapheneModal('${experiment.experimentNumber || ''}')">
      
      <!-- Experiment Number and Date - Primary line -->
      <div class="font-semibold text-lg text-gray-900 mb-2">
        ${experiment.experimentNumber || 'Unknown'} <span class="text-sm font-normal text-gray-500">| ${experiment.experimentDate ? formatCardDate(experiment.experimentDate) : 'Date unknown'}</span>
      </div>
      
      <!-- Species and Output - Secondary line -->
      <div class="text-sm text-gray-600">
        Species: ${experiment.species || 'Not specified'}${experiment.output ? ` | ${experiment.output}g` : ''}
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
 * Create a simplified loading card
 * @param {string} identifier - Loading identifier
 * @returns {string} HTML string for loading card
 */
function createSimplifiedLoadingCard(identifier = 'Loading') {
  return `
    <div class="simplified-card bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
      <!-- Skeleton for experiment number -->
      <div class="h-6 bg-gray-200 rounded w-24 mb-2"></div>
      
      <!-- Skeleton for date -->
      <div class="h-4 bg-gray-200 rounded w-20 mb-1"></div>
      
      <!-- Skeleton for species -->
      <div class="h-3 bg-gray-200 rounded w-16"></div>
      
      <!-- Loading indicator -->
      <div class="text-xs text-gray-500 mt-3">
        Loading ${identifier}...
      </div>
    </div>
  `;
}

/**
 * Create a simplified error card
 * @param {string} identifier - Error identifier
 * @param {string} errorMessage - Error message to display
 * @returns {string} HTML string for error card
 */
function createSimplifiedErrorCard(identifier, errorMessage) {
  return `
    <div class="simplified-card bg-red-50 border border-red-200 rounded-lg p-4">
      <!-- Error identifier -->
      <div class="font-semibold text-red-900 mb-2">
        ${identifier}
      </div>
      
      <!-- Error icon and message -->
      <div class="flex items-center text-red-600 text-sm">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>${errorMessage || 'Failed to load experiment data'}</span>
      </div>
    </div>
  `;
}

/**
 * Create multiple simplified cards from an array of experiments
 * @param {Array} experiments - Array of experiment data
 * @param {Object} options - Configuration options
 * @returns {string} HTML string for all cards
 */
function createSimplifiedGrapheneCardCollection(experiments, options = {}) {
  if (!experiments || experiments.length === 0) {
    return `
      <div class="col-span-full bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
        <p class="text-gray-600">No graphene experiments found</p>
      </div>
    `;
  }

  return experiments.map(experiment => {
    try {
      return createSimplifiedGrapheneCard(experiment, options);
    } catch (error) {
      console.error('Error creating simplified card:', error);
      return createSimplifiedErrorCard(
        experiment?.experimentNumber || 'Unknown', 
        'Card creation error'
      );
    }
  }).join('');
}

/**
 * Format date for simplified cards (reuse existing function)
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
function formatCardDate(dateString) {
  // Handle null, undefined, empty string, or invalid values
  if (!dateString || dateString === '' || dateString === 'null' || dateString === '0') {
    return 'N/A';
  }
  
  try {
    const date = new Date(dateString);
    
    // Check if the date is invalid or represents Unix epoch (1970-01-01 or 1969-12-31)
    if (isNaN(date.getTime()) || date.getFullYear() <= 1970) {
      return 'N/A';
    }
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return 'N/A';
  }
}

// Make functions globally available
window.createSimplifiedGrapheneCard = createSimplifiedGrapheneCard;
window.createSimplifiedLoadingCard = createSimplifiedLoadingCard;
window.createSimplifiedErrorCard = createSimplifiedErrorCard;
window.createSimplifiedGrapheneCardCollection = createSimplifiedGrapheneCardCollection;

console.log('Simplified Graphene Card components initialized');