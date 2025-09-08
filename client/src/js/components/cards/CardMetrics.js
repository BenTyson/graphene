/**
 * Card Metrics Component
 * Responsive hero metrics section showing key experiment data
 * Adapts layout from mobile (2 metrics) to desktop (4+ metrics)
 */

/**
 * Create responsive metrics section
 * @param {Object} config - Metrics configuration
 * @param {Object} config.data - Experiment data
 * @param {string} config.compactMode - Responsive mode setting
 * @param {boolean} config.editMode - Whether metrics are editable
 * @returns {string} HTML string for metrics section
 */
function createCardMetrics(config) {
  const { data, compactMode, editMode } = config;
  
  // Determine which metrics to show based on data type
  const metrics = getRelevantMetrics(data);
  
  return `
    <div class="data-card-metrics bg-gray-50 border-b border-gray-100">
      <!-- Mobile Metrics (2 primary metrics) -->
      <div class="md:hidden p-4">
        <div class="grid grid-cols-2 gap-4">
          ${createMobileMetrics(metrics.primary)}
        </div>
        
        <!-- Expandable secondary metrics on mobile -->
        ${metrics.secondary.length > 0 ? `
          <button class="mt-3 w-full text-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  @click="metricsExpanded = !metricsExpanded">
            <span x-show="!metricsExpanded">Show more details</span>
            <span x-show="metricsExpanded">Show less</span>
            <svg class="inline-block w-4 h-4 ml-1 transform transition-transform"
                 :class="{ 'rotate-180': metricsExpanded }"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          <div class="mt-3 grid grid-cols-2 gap-4"
               x-show="metricsExpanded"
               x-transition>
            ${createMobileMetrics(metrics.secondary)}
          </div>
        ` : ''}
      </div>
      
      <!-- Tablet Metrics (3 columns) -->
      <div class="hidden md:block lg:hidden p-4">
        <div class="grid grid-cols-3 gap-4">
          ${createTabletMetrics([...metrics.primary, ...metrics.secondary].slice(0, 6))}
        </div>
      </div>
      
      <!-- Desktop Metrics (4+ columns) -->
      <div class="hidden lg:block p-6">
        <div class="grid grid-cols-4 xl:grid-cols-5 gap-6">
          ${createDesktopMetrics([...metrics.primary, ...metrics.secondary])}
        </div>
        
      </div>
    </div>
  `;
}

/**
 * Determine relevant metrics based on data type
 */
function getRelevantMetrics(data) {
  const primary = [];
  const secondary = [];
  
  // Check if this is a compound batch
  if (data.isCompoundBatch) {
    // Compound batch primary metrics
    if (data.totalOutput !== undefined) {
      primary.push({
        label: 'Total Output',
        value: `${formatNumber(data.totalOutput)}`,
        unit: 'g',
        icon: 'scale'
      });
    }
    
    if (data.createdDate) {
      primary.push({
        label: 'Created',
        value: formatDate(data.createdDate),
        unit: '',
        icon: 'calendar'
      });
    }
    
    // Compound batch secondary metrics
    if (data.experiments && data.experiments.length > 0) {
      secondary.push({
        label: 'Experiments',
        value: data.experiments.length,
        unit: '',
        icon: 'beaker'
      });
    }
    
    if (data.micronizations && data.micronizations.length > 0) {
      secondary.push({
        label: 'Micronized',
        value: 'Yes',
        unit: '',
        icon: 'zap'
      });
    } else {
      secondary.push({
        label: 'Micronized',
        value: 'No',
        unit: '',
        icon: 'clock'
      });
    }
    
    if (data.batchName) {
      secondary.push({
        label: 'Name',
        value: data.batchName,
        unit: '',
        icon: 'tag'
      });
    }
  } else if (data.isShipment) {
    // Shipment primary metrics - only show essential info not in header or dropdowns
    if (data.purpose) {
      primary.push({
        label: 'Purpose',
        value: data.purpose,
        unit: '',
        icon: 'clipboard'
      });
    }
    
    if (data.shipmentDate) {
      primary.push({
        label: 'Ship Date',
        value: formatDate(data.shipmentDate),
        unit: '',
        icon: 'calendar'
      });
    }
    
    // Show material type in metrics
    if (data.grapheneSample) {
      secondary.push({
        label: 'Material',
        value: data.grapheneSample,
        unit: '',
        icon: 'beaker'
      });
    } else if (data.compoundBatchNumber) {
      secondary.push({
        label: 'Material',
        value: data.compoundBatchNumber,
        unit: '',
        icon: 'layers'
      });
    } else if (data.micronizationSku) {
      secondary.push({
        label: 'Material',
        value: data.micronizationSku,
        unit: '',
        icon: 'sparkles'
      });
    }
  } else {
    // Regular experiment primary metrics
    if (data.output !== undefined) {
      primary.push({
        label: 'Output',
        value: `${formatNumber(data.output)}`,
        unit: 'g',
        icon: 'scale'
      });
    }
    
    if (data.experimentDate) {
      primary.push({
        label: 'Date',
        value: formatDate(data.experimentDate),
        unit: '',
        icon: 'calendar'
      });
    }
  }
  
  // Regular experiment secondary metrics (only for non-compound batches)
  if (!data.isCompoundBatch) {
    if (data.species) {
      secondary.push({
        label: 'Species',
        value: data.species,
        unit: '',
        icon: 'beaker'
      });
    }
    
    if (data.density !== undefined) {
      secondary.push({
        label: 'Density',
        value: formatNumber(data.density),
        unit: 'ml/g',
        icon: 'cube'
      });
    }
    
    if (data.maxTemp) {
      secondary.push({
        label: 'Max Temp',
        value: formatNumber(data.maxTemp),
        unit: '°C',
        icon: 'fire'
      });
    }
  }
  
  // Additional regular experiment metrics (only for non-compound batches)  
  if (!data.isCompoundBatch) {
    if (data.time) {
      secondary.push({
        label: 'Time',
        value: data.time,
        unit: 'min',
        icon: 'clock'
      });
    }
    
    if (data.grindingMethod) {
      secondary.push({
        label: 'Grinding',
        value: data.grindingMethod,
        unit: '',
        icon: 'cog'
      });
    }
    
    if (data.appearance) {
      secondary.push({
        label: 'Appearance',
        value: Array.isArray(data.appearance) ? data.appearance.join(', ') : data.appearance,
        unit: '',
        icon: 'eye'
      });
    }
  }
  
  return { primary, secondary };
}

/**
 * Create mobile metric cards
 */
function createMobileMetrics(metrics) {
  return metrics.map(metric => `
    <div class="data-card-metric-mobile">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs text-gray-600 font-medium">${metric.label}</span>
        ${getMetricIcon(metric.icon, 'w-3 h-3 text-gray-400')}
      </div>
      <div class="font-mono text-sm font-medium text-gray-700">
        ${metric.value}
        ${metric.unit ? `<span class="text-xs text-gray-500">${metric.unit}</span>` : ''}
      </div>
    </div>
  `).join('');
}

/**
 * Create tablet metric cards
 */
function createTabletMetrics(metrics) {
  return metrics.map(metric => `
    <div class="data-card-metric-tablet bg-white rounded-lg p-3 border border-gray-200">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs text-gray-600 font-medium uppercase tracking-wider">${metric.label}</span>
        ${getMetricIcon(metric.icon, 'w-4 h-4 text-gray-400')}
      </div>
      <div class="font-mono text-base font-medium text-gray-700">
        ${metric.value}
        ${metric.unit ? `<span class="text-sm text-gray-500 ml-1">${metric.unit}</span>` : ''}
      </div>
    </div>
  `).join('');
}

/**
 * Create desktop metric cards
 */
function createDesktopMetrics(metrics) {
  return metrics.map(metric => `
    <div class="data-card-metric-desktop">
      <div class="flex items-center mb-2">
        ${getMetricIcon(metric.icon, 'w-5 h-5 text-gray-400 mr-2')}
        <span class="text-sm text-gray-600 font-medium">${metric.label}</span>
      </div>
      <div class="font-mono text-lg font-medium text-gray-700">
        ${metric.value}
        ${metric.unit ? `<span class="text-sm text-gray-500 ml-1">${metric.unit}</span>` : ''}
      </div>
    </div>
  `).join('');
}


/**
 * Get icon SVG for metric type
 */
function getMetricIcon(type, className = '') {
  const icons = {
    scale: `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
    </svg>`,
    
    calendar: `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
    </svg>`,
    
    beaker: `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
    </svg>`,
    
    cube: `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
    </svg>`,
    
    fire: `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path>
    </svg>`,
    
    clock: `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>`,
    
    cog: `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
    </svg>`,
    
    eye: `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
    </svg>`,
    
    truck: `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0"></path>
    </svg>`,
    
    map: `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
    </svg>`,
    
    location: `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
    </svg>`
  };
  
  return icons[type] || '';
}

/**
 * Format number helper
 */
function formatNumber(num) {
  if (num === null || num === undefined) return 'N/A';
  return parseFloat(num).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/**
 * Format date helper
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Get status icon for shipments
 * @param {string} status - Shipment status
 * @returns {string} Icon type
 */
function getStatusIcon(status) {
  switch (status?.toLowerCase()) {
    case 'pending': return 'clock';
    case 'shipped': return 'truck';
    case 'in_transit': return 'zap';
    case 'received': return 'check';
    default: return 'clock';
  }
}

/**
 * Get status color for shipments
 * @param {string} status - Shipment status
 * @returns {string} Color class
 */
function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'pending': return 'text-gray-600';
    case 'shipped': return 'text-blue-600';
    case 'in_transit': return 'text-yellow-600';
    case 'received': return 'text-green-600';
    default: return 'text-gray-600';
  }
}

