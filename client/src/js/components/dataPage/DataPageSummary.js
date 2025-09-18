/**
 * DataPageSummary - Summary metrics card for data pages
 * 
 * Shows key metrics and quick overview information
 * at the top of each data page
 */

/**
 * Create data page summary card
 * @param {Object} config - Summary configuration
 * @returns {string} HTML for summary card
 */
function createDataPageSummary(config) {
  const { type, data, metrics = [] } = config;
  
  if (!data) {
    return createSummaryLoading();
  }

  const typeMetrics = getTypeSpecificMetrics(type, data);
  const allMetrics = [...metrics, ...typeMetrics];

  return `
    <div class="data-page-summary bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
      <div class="p-6">
        
        <!-- Summary Header -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Summary</h2>
          <p class="text-gray-600">${getSummaryDescription(type, data)}</p>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${allMetrics.map(metric => createMetricCard(metric)).join('')}
        </div>

        <!-- Quick Actions -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <div class="flex flex-wrap gap-3">
            ${getQuickActions(type, data).map(action => createQuickActionButton(action)).join('')}
          </div>
        </div>

      </div>
    </div>
  `;
}

/**
 * Create a metric card
 * @param {Object} metric - Metric configuration
 * @returns {string} HTML for metric card
 */
function createMetricCard(metric) {
  const { label, value, unit, trend, icon } = metric;
  
  return `
    <div class="metric-card">
      <div class="flex items-center mb-3">
        ${icon ? `
          <div class="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center mr-3">
            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              ${icon}
            </svg>
          </div>
        ` : ''}
        <span class="text-sm font-medium text-gray-600">${label}</span>
      </div>
      
      <div class="flex items-baseline justify-between">
        <div>
          <span class="text-2xl font-bold text-gray-900">${value || 'N/A'}</span>
          ${unit ? `<span class="text-sm text-gray-500 ml-1">${unit}</span>` : ''}
        </div>
        
        ${trend ? `
          <span class="text-xs ${trend.direction === 'up' ? 'text-green-600' : trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'}">
            ${trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} ${trend.value}
          </span>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Create quick action button
 * @param {Object} action - Action configuration
 * @returns {string} HTML for action button
 */
function createQuickActionButton(action) {
  const { label, onclick, icon, variant = 'secondary' } = action;
  
  const baseClasses = 'inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-black text-white hover:bg-gray-800',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    success: 'bg-green-100 text-green-700 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
  };
  
  return `
    <button onclick="${onclick}" 
            class="${baseClasses} ${variantClasses[variant]}">
      ${icon ? `
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${icon}
        </svg>
      ` : ''}
      ${label}
    </button>
  `;
}

/**
 * Get type-specific metrics
 * @param {string} type - Data type
 * @param {Object} data - Data object
 * @returns {Array} Array of metrics
 */
function getTypeSpecificMetrics(type, data) {
  switch (type) {
    case 'graphene':
      return getGrapheneMetrics(data);
    case 'biochar':
      return getBiocharMetrics(data);
    case 'compound-batch':
      return getCompoundBatchMetrics(data);
    case 'micronization':
      return getMicronizationMetrics(data);
    case 'shipment':
      return getShipmentMetrics(data);
    default:
      return [];
  }
}

/**
 * Get graphene experiment metrics
 * @param {Object} data - Graphene data
 * @returns {Array} Metrics array
 */
function getGrapheneMetrics(data) {
  return [
    {
      label: 'Output',
      value: data.output,
      unit: 'g',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>'
    },
    {
      label: 'Species',
      value: data.species || 'N/A',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>'
    },
    {
      label: 'Max Temp',
      value: data.tempMax || data.maxTemp || data.temperature,
      unit: '°C',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>'
    },
    {
      label: 'Tests',
      value: getTestCount(data),
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>'
    }
  ];
}

/**
 * Get biochar experiment metrics
 * @param {Object} data - Biochar data
 * @returns {Array} Metrics array
 */
function getBiocharMetrics(data) {
  return [
    {
      label: 'Output',
      value: data.output,
      unit: 'g',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>',
    },
    {
      label: 'Species',
      value: data.species || 'N/A',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>',
    },
    {
      label: 'Pyrolysis Temp',
      value: data.pyrolysisTemp,
      unit: '°C',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>',
    },
    {
      label: 'Downstream Use',
      value: getDownstreamCount(data),
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>',
    }
  ];
}

/**
 * Get compound batch metrics
 * @param {Object} data - Compound batch data
 * @returns {Array} Metrics array
 */
function getCompoundBatchMetrics(data) {
  return [
    {
      label: 'Total Output',
      value: data.totalOutput,
      unit: 'g',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>',
    },
    {
      label: 'Constituents',
      value: data.constituents?.length || 0,
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>',
    },
    {
      label: 'Micronized',
      value: data.micronized ? 'Yes' : 'No',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2M7 4a1 1 0 00-1 1v12a1 1 0 001 1h6a1 1 0 001-1V5a1 1 0 00-1-1M7 4h6"></path>',
    },
    {
      label: 'Shipments',
      value: data.shipments?.length || 0,
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>',
    }
  ];
}

/**
 * Get micronization metrics
 * @param {Object} data - Micronization data
 * @returns {Array} Metrics array
 */
function getMicronizationMetrics(data) {
  return [
    {
      label: 'Input Weight',
      value: data.inputWeight,
      unit: 'g',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l-3-3m3 3l3-3"></path>',
    },
    {
      label: 'Output Weight',
      value: data.outputWeight,
      unit: 'g',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>',
    },
    {
      label: 'Grinding Method',
      value: data.grindingMethod || 'N/A',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>',
    },
    {
      label: 'Yield',
      value: data.inputWeight && data.outputWeight ? `${Math.round((data.outputWeight / data.inputWeight) * 100)}%` : 'N/A',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>',
    }
  ];
}

/**
 * Get shipment metrics
 * @param {Object} data - Shipment data
 * @returns {Array} Metrics array
 */
function getShipmentMetrics(data) {
  return [
    {
      label: 'Weight',
      value: data.weight,
      unit: 'g',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l-3-3m3 3l3-3"></path>',
    },
    {
      label: 'Destination',
      value: data.destination || 'N/A',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>',
    },
    {
      label: 'Ship Date',
      value: data.shipmentDate ? window.formatDateSafe(data.shipmentDate) : 'N/A',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>',
    },
    {
      label: 'Status',
      value: data.status || 'Unknown',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
    }
  ];
}

/**
 * Get test count for data
 * @param {Object} data - Data object
 * @returns {number} Test count
 */
function getTestCount(data) {
  let count = 0;
  if (data.betTests?.length) count += data.betTests.length;
  if (data.conductivityTests?.length) count += data.conductivityTests.length;
  if (data.ramanTests?.length) count += data.ramanTests.length;
  if (data.temTests?.length) count += data.temTests.length;
  if (data.semReports?.length) count += data.semReports.length;
  return count;
}

/**
 * Get downstream usage count
 * @param {Object} data - Data object
 * @returns {number} Downstream count
 */
function getDownstreamCount(data) {
  return data.downstreamExperiments?.length || 0;
}

/**
 * Get summary description
 * @param {string} type - Data type
 * @param {Object} data - Data object
 * @returns {string} Description
 */
function getSummaryDescription(type, data) {
  const date = data.experimentDate || data.createdDate || data.date;
  const formattedDate = date ? window.formatDateSafe(date) : 'Unknown date';
  
  switch (type) {
    case 'graphene':
      return `Graphene experiment conducted on ${formattedDate}`;
    case 'biochar':
      return `Biochar experiment conducted on ${formattedDate}`;
    case 'compound-batch':
      return `Compound batch created on ${formattedDate}`;
    case 'micronization':
      return `Micronization process completed on ${formattedDate}`;
    case 'shipment':
      return `Shipment processed on ${formattedDate}`;
    default:
      return `Data record from ${formattedDate}`;
  }
}

/**
 * Get quick actions for data type
 * @param {string} type - Data type
 * @param {Object} data - Data object
 * @returns {Array} Quick actions
 */
function getQuickActions(type, data) {
  const actions = [];
  
  // Common actions
  actions.push({
    label: 'View in Table',
    onclick: `window.routerService.navigateToTab('${window.routerService.getTabForType(type)}')`,
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h14a2 2 0 012 2v2M3 7h18M9 15h6"></path>',
    variant: 'secondary'
  });
  
  // Type-specific actions
  if (type === 'graphene' || type === 'biochar') {
    actions.push({
      label: 'Run Tests',
      onclick: `openTestModal('${data.experimentNumber}')`,
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
      variant: 'primary'
    });
  }
  
  if (type === 'compound-batch') {
    actions.push({
      label: 'Create Shipment',
      onclick: `createShipmentFromBatch('${data.batchNumber}')`,
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>',
      variant: 'success'
    });
  }
  
  return actions;
}

/**
 * Create loading state for summary
 * @returns {string} Loading HTML
 */
function createSummaryLoading() {
  return `
    <div class="data-page-summary bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
      <div class="p-6">
        <div class="h-6 bg-gray-200 rounded w-32 animate-pulse mb-4"></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${Array.from({ length: 4 }, () => `
            <div class="space-y-3">
              <div class="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div class="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// Make functions globally available
window.createDataPageSummary = createDataPageSummary;
window.createMetricCard = createMetricCard;
window.createQuickActionButton = createQuickActionButton;
window.getTypeSpecificMetrics = getTypeSpecificMetrics;

export { 
  createDataPageSummary, 
  createMetricCard, 
  createQuickActionButton, 
  getTypeSpecificMetrics 
};