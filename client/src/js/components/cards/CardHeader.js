/**
 * Card Header Component
 * Responsive header with mobile and desktop variants
 * Includes experiment ID, status, type, and actions
 */

/**
 * Create a responsive card header
 * @param {Object} config - Header configuration
 * @param {Object} config.data - Experiment data
 * @param {boolean} config.editMode - Show edit actions
 * @param {string} config.compactMode - Responsive mode setting
 * @param {string} config.instanceId - Card instance ID
 * @returns {string} HTML string for the header
 */
function createCardHeader(config) {
  const { data, editMode, compactMode, instanceId } = config;
  
  // Determine experiment type, status, and available tests
  const experimentType = getExperimentType(data);
  const status = getExperimentStatus(data);
  const availableTests = getAvailableTests(data);
  
  return `
    <div class="data-card-header border-b border-gray-200">
      <!-- Mobile Header -->
      <div class="md:hidden p-4">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h2 class="text-xl font-bold text-gray-900 font-mono">
              ${data.shipmentNumber || data.experimentNumber || data.batchNumber || 'Unknown'}
            </h2>
            ${data.isShipment && data.amountShipped && data.shipToLocation ? `
              <p class="text-sm text-gray-600 font-medium mt-1">${data.amountShipped}${data.unit || 'g'} to ${data.shipToLocation}</p>
            ` : data.batchName ? `
              <p class="text-sm text-gray-600 font-medium mt-1">${data.batchName}</p>
            ` : ''}
            <!-- Mobile metadata -->
            <div class="mt-2 space-y-1 text-xs text-gray-600">
              <div class="flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                ${formatDate(data.experimentDate || data.createdDate) || 'Unknown'}
              </div>
              <div class="flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                ${data.researchTeam || 'Unknown'}
              </div>
            </div>
            <div class="flex items-center mt-2 space-x-2 flex-wrap gap-1">
              ${createTypeBadge(experimentType, 'mobile')}
              ${status === 'shipped' ? createStatusBadge(status, 'mobile') : ''}
              ${availableTests.map(test => createTestBadge(test, 'mobile')).join('')}
            </div>
          </div>
          
          <!-- Mobile Menu Button -->
          <button class="p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors"
                  @click="cardMenuOpen_${instanceId} = !cardMenuOpen_${instanceId}">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
            </svg>
          </button>
        </div>
        
        <!-- Mobile Dropdown Menu -->
        ${editMode ? `
          <div class="mt-2 py-2 bg-gray-50 rounded-lg"
               x-show="cardMenuOpen_${instanceId}"
               x-transition
               @click.away="cardMenuOpen_${instanceId} = false">
            ${createMobileActions(data, instanceId)}
          </div>
        ` : ''}
      </div>
      
      <!-- Desktop Header -->
      <div class="hidden md:block p-6">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center space-x-3">
              <h2 class="text-2xl font-bold text-gray-900 font-mono">
                ${data.shipmentNumber || data.experimentNumber || data.batchNumber || 'Unknown'}
              </h2>
              ${data.isShipment && data.amountShipped && data.shipToLocation ? `
                <p class="text-base text-gray-600 font-medium mt-1">${data.amountShipped}${data.unit || 'g'} to ${data.shipToLocation}</p>
              ` : data.batchName ? `
                <p class="text-base text-gray-600 font-medium mt-1">${data.batchName}</p>
              ` : ''}
              ${createTypeBadge(experimentType, 'desktop')}
              ${status === 'shipped' ? createStatusBadge(status, 'desktop') : ''}
              ${availableTests.map(test => createTestBadge(test, 'desktop')).join('')}
            </div>
            
            <!-- Subtitle with metadata -->
            <div class="mt-2 flex items-center space-x-4 text-sm text-gray-600">
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                ${formatDate(data.experimentDate || data.createdDate) || 'Unknown'}
              </span>
              
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                ${data.researchTeam || 'Unknown'}
              </span>
            </div>
          </div>
          
          <!-- Desktop Actions -->
          ${editMode ? createDesktopActions(data, instanceId) : ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * Determine experiment type from data
 */
function getExperimentType(data) {
  if (data.isShipment) return 'Shipment';
  if (data.batchNumber) return 'Compound Batch';
  if (data.micronizationNumber) return 'Micronization';
  if (data.experimentNumber?.startsWith('MRa')) return 'Graphene Sample';
  if (data.experimentNumber?.startsWith('BC')) return 'Biochar';
  return 'Experiment';
}

/**
 * Get available tests for badge display
 */
function getAvailableTests(data) {
  const tests = [];
  if (data.betTests?.length > 0) tests.push('BET');
  if (data.temTests?.length > 0) tests.push('TEM');
  if (data.ramanTests?.length > 0) tests.push('RAMAN');
  if (data.conductivityTests?.length > 0) tests.push('Conductivity');
  return tests;
}

/**
 * Determine experiment status
 */
function getExperimentStatus(data) {
  // Check for various completion indicators
  if (data.shipments?.length > 0) return 'shipped';
  if (data.output > 0) return 'complete';
  return 'in-progress';
}

/**
 * Create type badge
 */
function createTypeBadge(type, variant = 'desktop') {
  const sizeClass = variant === 'mobile' ? 'text-xs px-2 py-0.5' : 'text-xs px-2 py-1';
  
  return `
    <span class="inline-flex items-center ${sizeClass} bg-gray-100 text-gray-700 rounded-full font-medium">
      ${type}
    </span>
  `;
}

/**
 * Create status badge  
 */
function createStatusBadge(status, variant = 'desktop') {
  const sizeClass = variant === 'mobile' ? 'text-xs px-2 py-0.5' : 'text-xs px-2 py-1';
  
  const statusConfig = {
    'shipped': { bg: 'bg-link-light', text: 'text-link-dark', label: 'Shipped' },
    'complete': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Complete' },
    'in-progress': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'In Progress' }
  };
  
  const config = statusConfig[status] || statusConfig['in-progress'];
  
  return `
    <span class="inline-flex items-center ${sizeClass} ${config.bg} ${config.text} rounded-full font-medium">
      <span class="w-1.5 h-1.5 mr-1 rounded-full ${config.text.replace('text', 'bg')}"></span>
      ${config.label}
    </span>
  `;
}

/**
 * Create test badge
 */
function createTestBadge(testType, variant = 'desktop') {
  const sizeClass = variant === 'mobile' ? 'text-xs px-2 py-0.5' : 'text-xs px-2 py-1';
  
  const testConfig = {
    'BET': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'BET' },
    'TEM': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'TEM' },
    'RAMAN': { bg: 'bg-green-100', text: 'text-green-800', label: 'RAMAN' },
    'Conductivity': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Conductivity' }
  };
  
  const config = testConfig[testType] || { bg: 'bg-gray-100', text: 'text-gray-800', label: testType };
  
  return `
    <span class="inline-flex items-center ${sizeClass} ${config.bg} ${config.text} rounded-full font-medium ml-1">
      ${config.label}
    </span>
  `;
}

/**
 * Create mobile action menu
 */
function createMobileActions(data, instanceId) {
  return `
    <div class="space-y-1 px-2">
      <button class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-white rounded-lg transition-colors flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
        Edit
      </button>
      
      <button class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-white rounded-lg transition-colors flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
        Duplicate
      </button>
      
      <button class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
        Delete
      </button>
    </div>
  `;
}

/**
 * Create desktop action buttons
 */
function createDesktopActions(data, instanceId) {
  return `
    <div class="flex items-center space-x-2">
      <button class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
      </button>
      
      <button class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Duplicate">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
      </button>
      
      <button class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
    </div>
  `;
}

/**
 * Format date helper
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime()) || date.getFullYear() <= 1970) {
    return 'N/A';
  }
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}


