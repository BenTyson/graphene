// Data Helper Functions
// Utilities for data manipulation and transformation

/**
 * Initialize form with default values
 * @param {Object} defaults - Default values for the form
 * @returns {Object} Initialized form object
 */
export const initializeForm = (defaults = {}) => {
  return { ...defaults };
};

/**
 * Reset form to default values
 * @param {Object} form - Current form object
 * @param {Object} defaults - Default values
 * @returns {Object} Reset form object
 */
export const resetForm = (form, defaults) => {
  Object.keys(form).forEach(key => {
    form[key] = defaults[key] !== undefined ? defaults[key] : '';
  });
  return form;
};

/**
 * Extract editable fields from a record
 * @param {Object} record - Database record
 * @param {Array} excludeFields - Fields to exclude
 * @returns {Object} Editable fields only
 */
export const extractEditableFields = (record, excludeFields = []) => {
  const defaultExcludes = ['id', 'createdAt', 'updatedAt', '_count'];
  const allExcludes = [...defaultExcludes, ...excludeFields];
  
  const editable = {};
  Object.keys(record).forEach(key => {
    if (!allExcludes.includes(key) && !key.endsWith('Ref') && !key.endsWith('Productions')) {
      editable[key] = record[key];
    }
  });
  
  return editable;
};

/**
 * Get unique values from array of records
 * @param {Array} records - Array of records
 * @param {string} field - Field to extract unique values from
 * @returns {Array} Sorted array of unique values
 */
export const getUniqueValues = (records, field) => {
  const values = new Set();
  records.forEach(record => {
    if (record[field]) {
      values.add(record[field]);
    }
  });
  return Array.from(values).sort();
};

/**
 * Filter records by search term
 * @param {Array} records - Array of records to filter
 * @param {string} searchTerm - Search term
 * @param {Array} searchFields - Fields to search in
 * @returns {Array} Filtered records
 */
export const filterBySearch = (records, searchTerm, searchFields) => {
  if (!searchTerm) return records;
  
  const term = searchTerm.toLowerCase();
  return records.filter(record => 
    searchFields.some(field => {
      const value = record[field];
      if (!value) return false;
      return value.toString().toLowerCase().includes(term);
    })
  );
};

/**
 * Group records by a field
 * @param {Array} records - Array of records
 * @param {string} field - Field to group by
 * @returns {Object} Grouped records
 */
export const groupByField = (records, field) => {
  return records.reduce((groups, record) => {
    const key = record[field] || 'Unknown';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(record);
    return groups;
  }, {});
};

/**
 * Sort records by multiple fields
 * @param {Array} records - Array of records
 * @param {Array} sortFields - Array of {field, order} objects
 * @returns {Array} Sorted records
 */
export const sortByMultipleFields = (records, sortFields) => {
  return [...records].sort((a, b) => {
    for (const { field, order = 'asc' } of sortFields) {
      const aVal = a[field];
      const bVal = b[field];
      
      // Handle null/undefined values
      if (aVal === null || aVal === undefined) {
        return order === 'asc' ? 1 : -1;
      }
      if (bVal === null || bVal === undefined) {
        return order === 'asc' ? -1 : 1;
      }
      
      // Compare values
      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      else if (aVal > bVal) comparison = 1;
      
      if (comparison !== 0) {
        return order === 'asc' ? comparison : -comparison;
      }
    }
    return 0;
  });
};

/**
 * Calculate statistics for numeric field
 * @param {Array} records - Array of records
 * @param {string} field - Numeric field to calculate stats for
 * @returns {Object} Statistics object
 */
export const calculateFieldStats = (records, field) => {
  const values = records
    .map(r => parseFloat(r[field]))
    .filter(v => !isNaN(v));
  
  if (values.length === 0) {
    return { min: null, max: null, avg: null, sum: null, count: 0 };
  }
  
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    sum: values.reduce((a, b) => a + b, 0),
    count: values.length
  };
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const clonedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
};

/**
 * Debounce function for search/filter operations
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Default export with all helpers
export default {
  initializeForm,
  resetForm,
  extractEditableFields,
  getUniqueValues,
  filterBySearch,
  groupByField,
  sortByMultipleFields,
  calculateFieldStats,
  deepClone,
  debounce
};