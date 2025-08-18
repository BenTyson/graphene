// Validation Utility Functions
// Handles form validation and data transformation

/**
 * Convert form field to proper numeric type or null
 * @param {any} value - Value to convert
 * @param {boolean} isInteger - Whether to parse as integer
 * @returns {number|null} Parsed number or null
 */
export const parseNumericField = (value, isInteger = false) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  const parsed = isInteger ? parseInt(value) : parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Process numeric fields in a data object
 * @param {Object} data - Data object with fields to process
 * @param {Array} fields - Array of field names to process
 * @param {Array} integerFields - Array of fields that should be integers
 * @returns {Object} Processed data object
 */
export const processNumericFields = (data, fields, integerFields = []) => {
  const processed = { ...data };
  
  fields.forEach(field => {
    if (field in processed) {
      processed[field] = parseNumericField(
        processed[field], 
        integerFields.includes(field)
      );
    }
  });
  
  return processed;
};

/**
 * Handle date field with unknown checkbox
 * @param {Object} data - Form data
 * @returns {Object} Processed data with date handling
 */
export const processDateField = (data) => {
  const processed = { ...data };
  
  if (processed.dateUnknown || !processed.experimentDate) {
    processed.experimentDate = null;
  }
  if (processed.dateUnknown || !processed.testDate) {
    processed.testDate = null;
  }
  
  delete processed.dateUnknown;
  return processed;
};

/**
 * Convert homogeneous field to boolean
 * @param {any} value - Value to convert
 * @returns {boolean|null} Boolean value or null
 */
export const parseHomogeneous = (value) => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return null;
};

/**
 * Validate PDF file
 * @param {File} file - File to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validatePDFFile = (file) => {
  if (!file) {
    return { isValid: false, message: 'No file selected' };
  }
  
  if (file.type !== 'application/pdf') {
    return { isValid: false, message: 'Only PDF files are allowed' };
  }
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { isValid: false, message: 'File size must be less than 10MB' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate required fields
 * @param {Object} data - Data to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} Validation result
 */
export const validateRequired = (data, requiredFields) => {
  const errors = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors.push(`${field.replace(/([A-Z])/g, ' $1').trim()} is required`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate experiment number format
 * @param {string} experimentNumber - Experiment number to validate
 * @returns {boolean} Whether the experiment number is valid
 */
export const validateExperimentNumber = (experimentNumber) => {
  if (!experimentNumber) return false;
  // Add any specific format requirements here
  return experimentNumber.trim().length > 0;
};

/**
 * Validate numeric range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {boolean} Whether the value is in range
 */
export const validateRange = (value, min, max) => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  return num >= min && num <= max;
};

/**
 * Process biochar form data for submission
 * @param {Object} formData - Raw form data
 * @returns {Object} Processed data ready for API
 */
export const processBiocharForm = (formData) => {
  let data = processDateField(formData);
  
  const numericFields = [
    'startingAmount', 'acidAmount', 'acidConcentration', 'acidMolarity',
    'temperature', 'time', 'pressureInitial', 'pressureFinal',
    'washAmount', 'output', 'dryingTemp', 'kftPercentage', 'testOrder'
  ];
  
  data = processNumericFields(data, numericFields, ['testOrder']);
  
  return data;
};

/**
 * Process graphene form data for submission
 * @param {Object} formData - Raw form data
 * @returns {Object} Processed data ready for API
 */
export const processGrapheneForm = (formData) => {
  let data = processDateField(formData);
  
  const numericFields = [
    'quantity', 'baseAmount', 'baseConcentration', 'grindingTime',
    'tempMax', 'time', 'washAmount', 'washConcentration', 'dryingTemp',
    'volumeMl', 'density', 'output', 'testOrder'
  ];
  
  data = processNumericFields(data, numericFields, ['testOrder']);
  data.homogeneous = parseHomogeneous(data.homogeneous);
  
  // Remove file from data (handled separately)
  delete data.semReportFile;
  
  return data;
};

/**
 * Process BET form data for submission
 * @param {Object} formData - Raw form data
 * @returns {Object} Processed data ready for API
 */
export const processBetForm = (formData) => {
  let data = processDateField(formData);
  
  const numericFields = ['multipointBetArea', 'langmuirSurfaceArea'];
  data = processNumericFields(data, numericFields);
  
  return data;
};

/**
 * Validate array length limit
 * @param {Array} array - Array to validate
 * @param {number} maxLength - Maximum allowed length
 * @returns {boolean} Whether the array is within limit
 */
export const validateArrayLength = (array, maxLength) => {
  return Array.isArray(array) && array.length <= maxLength;
};

// Default export with all validators
export default {
  parseNumericField,
  processNumericFields,
  processDateField,
  parseHomogeneous,
  validatePDFFile,
  validateRequired,
  validateExperimentNumber,
  validateRange,
  processBiocharForm,
  processGrapheneForm,
  processBetForm,
  validateArrayLength
};