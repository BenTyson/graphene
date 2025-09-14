/**
 * Filter Configuration System
 * Defines filterable fields and their types for each table
 */

export const filterConfigs = {
  graphene: {
    table: 'graphene',
    searchFields: ['experimentNumber', 'species', 'biocharExperiment', 'biocharLotNumber', 'comments'],
    filters: [
      {
        field: 'species',
        type: 'select',
        label: 'Species',
        multiple: true,
        optionsQuery: 'SELECT DISTINCT species FROM graphene WHERE species IS NOT NULL ORDER BY species'
      },
      {
        field: 'experimentDate',
        type: 'dateRange',
        label: 'Experiment Date',
        dbField: 'experimentDate'
      },
      {
        field: 'tempMax',
        type: 'numericRange',
        label: 'Max Temperature (°C)',
        dbField: 'tempMax',
        min: 0,
        max: 1200
      },
      {
        field: 'biocharSource',
        type: 'text',
        label: 'Biochar Source',
        dbFields: ['biocharExperiment', 'biocharLotNumber'], // Search across multiple fields
        placeholder: 'Search biochar experiments or lots...'
      },
      {
        field: 'baseType',
        type: 'select',
        label: 'Base Type',
        multiple: true,
        optionsQuery: 'SELECT DISTINCT base_type FROM graphene WHERE base_type IS NOT NULL ORDER BY base_type'
      },
      {
        field: 'grindingMethod',
        type: 'select',
        label: 'Grinding Method',
        multiple: true,
        optionsQuery: 'SELECT DISTINCT grinding_method FROM graphene WHERE grinding_method IS NOT NULL ORDER BY grinding_method'
      },
      {
        field: 'oven',
        type: 'select',
        label: 'Oven',
        multiple: true,
        optionsQuery: 'SELECT DISTINCT oven FROM graphene WHERE oven IS NOT NULL ORDER BY oven'
      },
      {
        field: 'researchTeam',
        type: 'select',
        label: 'Research Team',
        multiple: true,
        optionsQuery: 'SELECT DISTINCT research_team FROM graphene WHERE research_team IS NOT NULL ORDER BY research_team'
      },
      {
        field: 'output',
        type: 'numericRange',
        label: 'Output (g)',
        dbField: 'output',
        min: 0,
        max: 1000,
        step: 0.1
      },
      {
        field: 'appearanceTags',
        type: 'multiSelect',
        label: 'Appearance',
        dbField: 'appearanceTags',
        options: ['Shiny', 'Somewhat Shiny', 'Barely Shiny', 'Dull', 'Black', 'Black/Grey', 'Grey', 'Voluminous', 'Very Voluminous', 'Brittle']
      },
      {
        field: 'hasTestResults',
        type: 'boolean',
        label: 'Has Test Results',
        options: [
          { value: 'bet', label: 'Has BET Tests' },
          { value: 'conductivity', label: 'Has Conductivity Tests' },
          { value: 'raman', label: 'Has RAMAN Tests' },
          { value: 'tem', label: 'Has TEM Tests' }
        ]
      }
    ]
  },

  bet: {
    table: 'bet',
    searchFields: ['grapheneSample', 'compoundBatchNumber', 'testingLab', 'comments'],
    filters: [
      {
        field: 'testDate',
        type: 'dateRange',
        label: 'Test Date',
        dbField: 'testDate'
      },
      {
        field: 'testingLab',
        type: 'select',
        label: 'Testing Lab',
        multiple: true,
        optionsQuery: 'SELECT DISTINCT "testingLab" FROM "BET" WHERE "testingLab" IS NOT NULL ORDER BY "testingLab"'
      },
      {
        field: 'sampleType',
        type: 'select',
        label: 'Sample Type',
        multiple: false,
        options: [
          { value: 'graphene', label: 'Individual Experiments' },
          { value: 'compound', label: 'Compound Batches' }
        ]
      },
      {
        field: 'multipointBetArea',
        type: 'numericRange',
        label: 'BET Surface Area (m²/g)',
        dbField: 'multipointBetArea',
        min: 0,
        max: 3000,
        step: 0.1
      },
      {
        field: 'langmuirSurfaceArea',
        type: 'numericRange',
        label: 'Langmuir Surface Area (m²/g)',
        dbField: 'langmuirSurfaceArea',
        min: 0,
        max: 5000,
        step: 0.1
      },
      {
        field: 'mass',
        type: 'numericRange',
        label: 'Sample Mass (g)',
        dbField: 'mass',
        min: 0,
        max: 10,
        step: 0.0001
      },
      {
        field: 'hasReport',
        type: 'boolean',
        label: 'Has BET Report',
        dbField: 'betReportPath'
      }
    ]
  },

  biochar: {
    table: 'biochar',
    searchFields: ['experimentNumber', 'rawMaterial', 'reactor', 'comments'],
    filters: [
      {
        field: 'experimentDate',
        type: 'dateRange',
        label: 'Experiment Date',
        dbField: 'experimentDate'
      },
      {
        field: 'rawMaterial',
        type: 'select',
        label: 'Raw Material',
        multiple: true,
        optionsQuery: 'SELECT DISTINCT "rawMaterial" FROM biochar WHERE "rawMaterial" IS NOT NULL ORDER BY "rawMaterial"'
      },
      {
        field: 'reactor',
        type: 'select',
        label: 'Reactor',
        multiple: true,
        optionsQuery: 'SELECT DISTINCT reactor FROM biochar WHERE reactor IS NOT NULL ORDER BY reactor'
      },
      {
        field: 'temperature',
        type: 'numericRange',
        label: 'Temperature (°C)',
        dbField: 'temperature',
        min: 200,
        max: 1000
      },
      {
        field: 'time',
        type: 'numericRange',
        label: 'Time (hours)',
        dbField: 'time',
        min: 0,
        max: 24,
        step: 0.1
      },
      {
        field: 'output',
        type: 'numericRange',
        label: 'Output (g)',
        dbField: 'output',
        min: 0,
        max: 1000,
        step: 0.1
      },
      {
        field: 'researchTeam',
        type: 'select',
        label: 'Research Team',
        multiple: true,
        optionsQuery: 'SELECT DISTINCT research_team FROM biochar WHERE research_team IS NOT NULL ORDER BY research_team'
      },
      {
        field: 'isInLot',
        type: 'boolean',
        label: 'Part of Lot',
        dbField: 'lotNumber'
      }
    ]
  },

  shipments: {
    table: 'shipments',
    searchFields: ['shipmentNumber', 'shipFromLocation', 'shipToLocation', 'purpose', 'comments'],
    filters: [
      {
        field: 'shipmentDate',
        type: 'dateRange',
        label: 'Shipment Date',
        dbField: 'shipmentDate'
      },
      {
        field: 'status',
        type: 'select',
        label: 'Status',
        multiple: true,
        options: [
          { value: 'pending', label: 'Pending' },
          { value: 'shipped', label: 'Shipped' },
          { value: 'in_transit', label: 'In Transit' },
          { value: 'received', label: 'Received' }
        ]
      },
      {
        field: 'materialType',
        type: 'select',
        label: 'Material Type',
        multiple: false,
        options: [
          { value: 'graphene', label: 'Individual Experiments' },
          { value: 'compound', label: 'Compound Batches' },
          { value: 'micronized', label: 'Micronized SKUs' }
        ]
      },
      {
        field: 'shipFromLocation',
        type: 'select',
        label: 'From Location',
        multiple: true,
        optionsQuery: 'SELECT DISTINCT "shipFromLocation" FROM "MaterialShipment" WHERE "shipFromLocation" IS NOT NULL ORDER BY "shipFromLocation"'
      },
      {
        field: 'shipToLocation',
        type: 'select',
        label: 'To Location',
        multiple: true,
        optionsQuery: 'SELECT DISTINCT "shipToLocation" FROM "MaterialShipment" WHERE "shipToLocation" IS NOT NULL ORDER BY "shipToLocation"'
      },
      {
        field: 'amountShipped',
        type: 'numericRange',
        label: 'Amount Shipped',
        dbField: 'amountShipped',
        min: 0,
        max: 10000,
        step: 0.1
      }
    ]
  }
};

/**
 * Get filter configuration for a specific table
 * @param {string} tableName - Name of the table
 * @returns {object|null} Filter configuration or null if not found
 */
export function getFilterConfig(tableName) {
  return filterConfigs[tableName] || null;
}

/**
 * Get all available filter types
 * @returns {string[]} Array of filter type names
 */
export function getFilterTypes() {
  return ['text', 'select', 'multiSelect', 'dateRange', 'numericRange', 'boolean'];
}

/**
 * Validate filter configuration
 * @param {object} config - Filter configuration to validate
 * @returns {boolean} True if valid
 */
export function validateFilterConfig(config) {
  if (!config.table || !config.filters || !Array.isArray(config.filters)) {
    return false;
  }

  const validTypes = getFilterTypes();
  
  for (const filter of config.filters) {
    if (!filter.field || !filter.type || !filter.label) {
      return false;
    }
    
    if (!validTypes.includes(filter.type)) {
      return false;
    }
  }
  
  return true;
}