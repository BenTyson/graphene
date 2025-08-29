/**
 * Convert string values to proper numeric types
 * @param {object} data - Data object to convert
 * @param {string[]} numericFields - Fields that should be converted to float
 * @param {string[]} integerFields - Fields that should be converted to integer
 * @returns {object} Data with converted fields
 */
export function convertNumericFields(data, numericFields = [], integerFields = []) {
  const converted = { ...data };
  
  // Convert decimal fields
  numericFields.forEach(field => {
    if (converted[field] !== undefined && converted[field] !== null && converted[field] !== '') {
      const num = parseFloat(converted[field]);
      if (!isNaN(num)) {
        converted[field] = num;
      }
    } else {
      converted[field] = null;
    }
  });
  
  // Convert integer fields
  integerFields.forEach(field => {
    if (converted[field] !== undefined && converted[field] !== null && converted[field] !== '') {
      const num = parseInt(converted[field], 10);
      if (!isNaN(num)) {
        converted[field] = num;
      }
    } else {
      converted[field] = null;
    }
  });
  
  return converted;
}

/**
 * Convert date fields and handle 'unknown' checkboxes
 * @param {object} data - Data object to convert
 * @param {string[]} dateFields - Fields that should be converted to Date
 * @returns {object} Data with converted date fields
 */
export function convertDateFields(data, dateFields = []) {
  const converted = { ...data };
  
  dateFields.forEach(field => {
    const dateValue = converted[field];
    const unknownField = `${field.replace('Date', '')}Unknown`;
    
    // If unknown checkbox is checked, set date to null
    if (converted[unknownField] === true || converted[unknownField] === 'true') {
      converted[field] = null;
    } else if (dateValue && dateValue !== '') {
      // Convert to Date if valid
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        converted[field] = date;
      }
    } else {
      converted[field] = null;
    }
    
    // Remove the unknown field from final data
    delete converted[unknownField];
  });
  
  return converted;
}

/**
 * Clean data object by removing UI-only fields
 * @param {object} data - Data object to clean
 * @param {string[]} fieldsToRemove - Array of field names to remove
 * @returns {object} Cleaned data object
 */
export function cleanFormData(data, fieldsToRemove = []) {
  const cleaned = { ...data };
  
  // Standard UI fields that should always be removed
  const standardUIFields = [
    'dateUnknown', 
    'biocharSource',
    'removeReport',
    'replaceReport'
  ];
  
  const allFieldsToRemove = [...standardUIFields, ...fieldsToRemove];
  
  allFieldsToRemove.forEach(field => {
    delete cleaned[field];
  });
  
  return cleaned;
}

/**
 * Prepare data for database operations by applying all conversions
 * @param {object} data - Raw form data
 * @param {object} config - Configuration for conversions
 * @param {string[]} config.numericFields - Fields to convert to float
 * @param {string[]} config.integerFields - Fields to convert to integer  
 * @param {string[]} config.dateFields - Fields to convert to Date
 * @param {string[]} config.fieldsToRemove - UI fields to remove
 * @returns {object} Processed data ready for database
 */
export function prepareDataForDB(data, config = {}) {
  const {
    numericFields = [],
    integerFields = [],
    dateFields = [],
    fieldsToRemove = []
  } = config;
  
  let processed = convertNumericFields(data, numericFields, integerFields);
  processed = convertDateFields(processed, dateFields);
  processed = cleanFormData(processed, fieldsToRemove);
  
  return processed;
}