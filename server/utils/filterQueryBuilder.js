/**
 * Filter Query Builder
 * Converts filter parameters into Prisma query conditions
 */

import { getFilterConfig } from './filterConfig.js';

/**
 * Build Prisma where clause from filter parameters
 * @param {string} tableName - Name of the table being filtered
 * @param {object} filters - Filter parameters from request
 * @param {string} searchTerm - Global search term (optional)
 * @returns {object} Prisma where clause
 */
export function buildFilterWhere(tableName, filters = {}, searchTerm = null) {
  const config = getFilterConfig(tableName);
  if (!config) {
    throw new Error(`No filter configuration found for table: ${tableName}`);
  }

  const whereClause = { AND: [] };

  // Handle global search
  if (searchTerm && config.searchFields && config.searchFields.length > 0) {
    const searchConditions = config.searchFields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive'
      }
    }));
    
    whereClause.AND.push({
      OR: searchConditions
    });
  }

  // Process each filter
  Object.entries(filters).forEach(([filterKey, filterValue]) => {
    const filterConfig = config.filters.find(f => f.field === filterKey);
    
    if (!filterConfig || filterValue === null || filterValue === undefined || filterValue === '') {
      return; // Skip invalid or empty filters
    }

    const condition = buildFilterCondition(filterConfig, filterValue);
    if (condition) {
      whereClause.AND.push(condition);
    }
  });

  // Return simplified where clause if only one condition
  if (whereClause.AND.length === 0) {
    return {};
  } else if (whereClause.AND.length === 1) {
    return whereClause.AND[0];
  } else {
    return whereClause;
  }
}

/**
 * Build individual filter condition based on filter type
 * @param {object} filterConfig - Configuration for this filter
 * @param {*} filterValue - Value to filter by
 * @returns {object|null} Prisma condition or null
 */
function buildFilterCondition(filterConfig, filterValue) {
  const { field, type, dbField, dbFields } = filterConfig;
  const targetField = dbField || field;

  switch (type) {
    case 'text':
      return buildTextFilter(targetField, filterValue, dbFields);
      
    case 'select':
      return buildSelectFilter(targetField, filterValue, filterConfig.multiple);
      
    case 'multiSelect':
      return buildMultiSelectFilter(targetField, filterValue);
      
    case 'dateRange':
      return buildDateRangeFilter(targetField, filterValue);
      
    case 'numericRange':
      return buildNumericRangeFilter(targetField, filterValue);
      
    case 'boolean':
      return buildBooleanFilter(targetField, filterValue, filterConfig);
      
    default:
      console.warn(`Unknown filter type: ${type}`);
      return null;
  }
}

/**
 * Build text search filter condition
 * @param {string} field - Database field name
 * @param {string} value - Search value
 * @param {string[]} dbFields - Multiple fields to search (optional)
 * @returns {object} Prisma condition
 */
function buildTextFilter(field, value, dbFields) {
  const searchCondition = {
    contains: value,
    mode: 'insensitive'
  };

  if (dbFields && dbFields.length > 1) {
    // Search across multiple fields (e.g., biocharExperiment OR biocharLotNumber)
    return {
      OR: dbFields.map(f => ({
        [f]: searchCondition
      }))
    };
  } else {
    return { [field]: searchCondition };
  }
}

/**
 * Build select filter condition
 * @param {string} field - Database field name
 * @param {string|string[]} value - Selected value(s)
 * @param {boolean} multiple - Whether multiple selection is allowed
 * @returns {object} Prisma condition
 */
function buildSelectFilter(field, value, multiple) {
  if (multiple && Array.isArray(value) && value.length > 0) {
    return {
      [field]: {
        in: value
      }
    };
  } else if (!multiple && value) {
    return {
      [field]: value
    };
  }
  return null;
}

/**
 * Build multi-select filter for array fields
 * @param {string} field - Database field name (array field)
 * @param {string[]} values - Selected values
 * @returns {object} Prisma condition
 */
function buildMultiSelectFilter(field, values) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }

  // For array fields, check if any of the selected values exist in the array
  return {
    [field]: {
      hasSome: values
    }
  };
}

/**
 * Build date range filter condition
 * @param {string} field - Database field name
 * @param {object} dateRange - Date range object {from, to}
 * @returns {object} Prisma condition
 */
function buildDateRangeFilter(field, dateRange) {
  if (!dateRange || typeof dateRange !== 'object') {
    return null;
  }

  const condition = {};
  
  if (dateRange.from) {
    condition.gte = new Date(dateRange.from);
  }
  
  if (dateRange.to) {
    // Set to end of day for 'to' date
    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59, 999);
    condition.lte = toDate;
  }

  if (Object.keys(condition).length === 0) {
    return null;
  }

  return { [field]: condition };
}

/**
 * Build numeric range filter condition
 * @param {string} field - Database field name
 * @param {object} numRange - Numeric range object {min, max}
 * @returns {object} Prisma condition
 */
function buildNumericRangeFilter(field, numRange) {
  if (!numRange || typeof numRange !== 'object') {
    return null;
  }

  const condition = {};
  
  if (numRange.min !== null && numRange.min !== undefined) {
    condition.gte = parseFloat(numRange.min);
  }
  
  if (numRange.max !== null && numRange.max !== undefined) {
    condition.lte = parseFloat(numRange.max);
  }

  if (Object.keys(condition).length === 0) {
    return null;
  }

  return { [field]: condition };
}

/**
 * Build boolean filter condition
 * @param {string} field - Database field name
 * @param {*} value - Boolean value or special condition
 * @param {object} filterConfig - Filter configuration
 * @returns {object} Prisma condition
 */
function buildBooleanFilter(field, value, filterConfig) {
  // Handle special test result filters
  if (filterConfig.options && Array.isArray(filterConfig.options)) {
    // This is for complex boolean conditions like "has test results"
    if (value === 'bet') {
      return {
        betTests: {
          some: {}
        }
      };
    } else if (value === 'conductivity') {
      return {
        conductivityTests: {
          some: {}
        }
      };
    } else if (value === 'raman') {
      return {
        ramanTests: {
          some: {}
        }
      };
    } else if (value === 'tem') {
      return {
        temTests: {
          some: {}
        }
      };
    }
  }

  // Handle standard boolean filters
  if (value === true || value === 'true') {
    return {
      [field]: {
        not: null
      }
    };
  } else if (value === false || value === 'false') {
    return {
      [field]: null
    };
  }

  return null;
}

/**
 * Get filter options from database
 * @param {object} prisma - Prisma client instance
 * @param {string} tableName - Name of the table
 * @param {string} filterField - Field to get options for
 * @returns {Promise<Array>} Array of option objects
 */
export async function getFilterOptions(prisma, tableName, filterField) {
  const config = getFilterConfig(tableName);
  if (!config) {
    throw new Error(`No filter configuration found for table: ${tableName}`);
  }

  const filterConfig = config.filters.find(f => f.field === filterField);
  if (!filterConfig) {
    throw new Error(`Filter field '${filterField}' not found in ${tableName} configuration`);
  }

  // Return static options if defined
  if (filterConfig.options && Array.isArray(filterConfig.options)) {
    return filterConfig.options;
  }

  // Execute dynamic query if defined
  if (filterConfig.optionsQuery) {
    try {
      const results = await prisma.$queryRawUnsafe(filterConfig.optionsQuery);
      
      // Extract the first column value from each result
      return results
        .map(row => {
          const values = Object.values(row);
          return values.length > 0 ? values[0] : null;
        })
        .filter(value => value !== null)
        .map(value => ({
          value: value,
          label: value
        }));
    } catch (error) {
      console.error(`Error executing options query for ${tableName}.${filterField}:`, error);
      return [];
    }
  }

  return [];
}

/**
 * Build enhanced order by clause that works with filters
 * @param {string} sortBy - Field to sort by
 * @param {string} order - Sort order (asc/desc)
 * @param {object} sortMappings - Field name mappings
 * @returns {object|object[]} Prisma orderBy clause
 */
export function buildFilterAwareOrderBy(sortBy = 'createdAt', order = 'desc', sortMappings = {}) {
  const mappedSortBy = sortMappings[sortBy] || sortBy;
  
  // Handle special chronological sorting
  if (sortBy === 'chronological') {
    return [
      { experimentDate: order },
      { createdAt: order }
    ];
  }
  
  // Handle relation field sorting
  if (mappedSortBy.includes('.')) {
    const [relation, field] = mappedSortBy.split('.');
    return {
      [relation]: {
        [field]: order
      }
    };
  }
  
  // Standard field sorting
  return { [mappedSortBy]: order };
}