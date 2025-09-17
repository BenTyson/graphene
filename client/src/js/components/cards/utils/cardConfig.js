/**
 * Card Configuration Presets
 * Predefined configurations for different card use cases
 */

/**
 * Configuration presets for different contexts
 */
const presets = {
  // Modal view - full detail popup
  modal: {
    displayMode: 'popup',
    editMode: false,
    compactMode: false,
    sections: 'all',
    animations: 'smooth'
  },
  
  // Table row - inline view for tables
  tableRow: {
    displayMode: 'inline',
    editMode: false,
    compactMode: 'auto',
    sections: ['process', 'source', 'tests', 'shipments'],
    animations: 'subtle'
  },
  
  // Dashboard widget - compact metrics
  dashboard: {
    displayMode: 'inline',
    editMode: false,
    compactMode: true,
    sections: ['metrics', 'status'],
    animations: 'subtle'
  },
  
  // Search result - optimized for search
  search: {
    displayMode: 'inline',
    editMode: false,
    compactMode: 'auto',
    sections: ['metrics', 'tests'],
    animations: 'subtle'
  },
  
  // Inline view - standard inline display
  inline: {
    displayMode: 'inline',
    editMode: false,
    compactMode: 'auto',
    sections: ['metrics', 'tests', 'source'],
    animations: 'subtle'
  },
  
  // Full width - detailed inline view
  fullwidth: {
    displayMode: 'inline',
    editMode: false,
    compactMode: false,
    sections: 'all',
    animations: 'subtle'
  },
  
  // Compound batch - optimized for batch data
  compoundBatch: {
    displayMode: 'inline',
    editMode: false,
    compactMode: 'auto',
    sections: ['constituents', 'micronization', 'tests', 'shipments'],
    animations: 'subtle'
  },
  
  // Shipment - optimized for shipment tracking data
  shipment: {
    displayMode: 'inline',
    editMode: false,
    compactMode: true,
    sections: ['metrics', 'source', 'destination'],
    animations: 'subtle'
  },
  
  // Detail popup - legacy alias for modal
  detailPopup: {
    displayMode: 'popup',
    editMode: false,
    compactMode: false,
    sections: 'all',
    animations: 'smooth'
  },
  
  // Table view - legacy alias for tableRow
  tableView: {
    displayMode: 'inline',
    editMode: false,
    compactMode: 'auto',
    sections: ['process', 'source', 'tests', 'shipments'],
    animations: 'subtle'
  }
};

/**
 * Get a preset configuration
 * @param {string} presetName - Name of the preset
 * @returns {Object} Configuration object
 */
function getCardConfig(presetName) {
  return presets[presetName] || presets.tableView;
}

/**
 * Merge custom config with preset
 * @param {string} presetName - Name of the preset
 * @param {Object} customConfig - Custom overrides
 * @returns {Object} Merged configuration
 */
function mergeCardConfig(presetName, customConfig = {}) {
  const preset = getCardConfig(presetName);
  return { ...preset, ...customConfig };
}

/**
 * Get responsive configuration based on screen size
 * @returns {Object} Configuration adjusted for current screen
 */
function getResponsiveConfig() {
  const width = window.innerWidth;
  
  if (width < 640) {
    // Mobile
    return {
      displayMode: 'popup',
      compactMode: true,
      sections: ['metrics', 'tests'],
      animations: 'smooth'
    };
  } else if (width < 1024) {
    // Tablet
    return {
      displayMode: 'inline',
      compactMode: 'auto',
      sections: ['metrics', 'tests', 'source'],
      animations: 'subtle'
    };
  } else {
    // Desktop
    return {
      displayMode: 'inline',
      compactMode: false,
      sections: 'all',
      animations: 'subtle'
    };
  }
}

/**
 * Create configuration for specific data types
 * @param {Object} data - The experiment data
 * @returns {Object} Type-specific configuration
 */
function getTypeSpecificConfig(data) {
  // Determine type from data
  if (data.batchNumber) {
    // Compound Batch
    return {
      sections: ['metrics', 'tests', 'constituent-experiments', 'shipments'],
      animations: 'subtle'
    };
  } else if (data.micronizationNumber) {
    // Micronization
    return {
      sections: ['metrics', 'source', 'process', 'shipments'],
      animations: 'subtle'
    };
  } else if (data.experimentNumber?.startsWith('BC')) {
    // Biochar
    return {
      sections: ['metrics', 'process', 'downstream'],
      animations: 'subtle'
    };
  } else {
    // Default Graphene
    return {
      sections: ['metrics', 'source', 'tests', 'reports', 'shipments', 'objectives'],
      animations: 'subtle'
    };
  }
}

/**
 * Animation timing configurations
 */
const animationTimings = {
  none: {
    enter: '',
    leave: ''
  },
  fast: {
    enter: 'duration-150',
    leave: 'duration-100'
  },
  subtle: {
    enter: 'duration-200',
    leave: 'duration-150'
  },
  smooth: {
    enter: 'duration-300',
    leave: 'duration-200'
  }
};

/**
 * Section visibility rules
 * Determines which sections to show based on data availability
 */
function getSectionVisibility(data) {
  return {
    metrics: true, // Always show
    process: data.maxTemp || data.time || data.grindingMethod,
    source: data.biocharExperiment || data.biocharLotNumber,
    tests: (data.betTests?.length > 0) || 
           (data.conductivityTests?.length > 0) || 
           (data.ramanTests?.length > 0) || 
           (data.temTests?.length > 0),
    reports: (data.semReports?.length > 0) || (data.updateReports?.length > 0),
    shipments: data.shipments?.length > 0,
    objectives: data.objective || data.conclusion || data.recommendedAction
  };
}

/**
 * Get list of all available presets
 * @returns {Array} Array of preset names and descriptions
 */
function getAvailablePresets() {
  return [
    { name: 'modal', description: 'Full detail modal popup' },
    { name: 'tableRow', description: 'Inline card for table rows' },
    { name: 'dashboard', description: 'Dashboard widget display' },
    { name: 'search', description: 'Search result card' },
    { name: 'inline', description: 'Standard inline view' },
    { name: 'fullwidth', description: 'Full width detailed view' },
    { name: 'compoundBatch', description: 'Compound batch optimized view' },
    { name: 'shipment', description: 'Shipment tracking card view' }
  ];
}

// Make functions globally available
window.getCardConfig = getCardConfig;
window.mergeCardConfig = mergeCardConfig;
window.getResponsiveConfig = getResponsiveConfig;
window.getTypeSpecificConfig = getTypeSpecificConfig;
window.getSectionVisibility = getSectionVisibility;
window.getAvailablePresets = getAvailablePresets;

