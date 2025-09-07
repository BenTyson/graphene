/**
 * Card Configuration Presets
 * Predefined configurations for different card use cases
 */

/**
 * Configuration presets for different contexts
 */
const presets = {
  // Full detail popup with all features
  detailPopup: {
    displayMode: 'popup',
    editMode: true,
    compactMode: false,
    sections: 'all',
    animations: 'smooth'
  },
  
  // Table view card (inline, no edit)
  tableView: {
    displayMode: 'inline',
    editMode: false,
    compactMode: 'auto',
    sections: ['process', 'source', 'tests', 'shipments'],
    animations: 'subtle'
  },
  
  // Dashboard preview card (minimal)
  dashboardPreview: {
    displayMode: 'inline',
    editMode: false,
    compactMode: true,
    sections: ['metrics', 'status'],
    animations: 'subtle'
  },
  
  // Search result card
  searchResult: {
    displayMode: 'inline',
    editMode: false,
    compactMode: 'auto',
    sections: ['metrics', 'tests'],
    animations: 'subtle'
  },
  
  // Print-friendly card
  printView: {
    displayMode: 'inline',
    editMode: false,
    compactMode: false,
    sections: 'all',
    animations: 'none'
  },
  
  // Mobile-optimized card
  mobileCard: {
    displayMode: 'popup',
    editMode: false,
    compactMode: true,
    sections: ['metrics', 'tests', 'shipments'],
    animations: 'smooth'
  },
  
  // Comparison card (side-by-side)
  comparison: {
    displayMode: 'inline',
    editMode: false,
    compactMode: 'auto',
    sections: ['metrics', 'tests'],
    animations: 'none'
  },
  
  // Quick view card (hover preview)
  quickView: {
    displayMode: 'inline',
    editMode: false,
    compactMode: true,
    sections: ['metrics'],
    animations: 'fast'
  },
  
  // Full width card (detailed view)
  fullwidth: {
    displayMode: 'inline',
    editMode: false,
    compactMode: false,
    sections: 'all',
    animations: 'subtle'
  },
  
  // Compound batch card (inline view optimized for batch data)
  compoundBatch: {
    displayMode: 'inline',
    editMode: false,
    compactMode: 'auto',
    sections: ['constituents', 'micronization', 'tests', 'shipments'],
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
    { name: 'detailPopup', description: 'Full detail popup with editing' },
    { name: 'tableView', description: 'Inline card for table views' },
    { name: 'dashboardPreview', description: 'Minimal dashboard preview' },
    { name: 'searchResult', description: 'Search result display' },
    { name: 'printView', description: 'Print-friendly format' },
    { name: 'mobileCard', description: 'Mobile-optimized popup' },
    { name: 'comparison', description: 'Side-by-side comparison' },
    { name: 'quickView', description: 'Hover preview card' },
    { name: 'fullwidth', description: 'Full width detailed card' },
    { name: 'compoundBatch', description: 'Compound batch display card' }
  ];
}

