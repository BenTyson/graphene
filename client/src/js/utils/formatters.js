// Formatting Utility Functions
// Handles all data formatting and display transformations

/**
 * Format a date string for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date or 'Unknown'
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  
  // Handle date-only strings (YYYY-MM-DD) - create local date to avoid timezone issues
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      timeZone: 'America/Denver' // MST/MDT timezone
    });
  }
  
  // Handle full ISO strings normally
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    timeZone: 'America/Denver' // MST/MDT timezone
  });
};

/**
 * Format acid properties for display
 * @param {Object} record - Biochar record
 * @returns {string} Formatted acid string
 */
export const formatAcid = (record) => {
  const parts = [];
  if (record.acidAmount) parts.push(`${record.acidAmount}g`);
  if (record.acidConcentration) parts.push(`${record.acidConcentration}%`);
  if (record.acidMolarity) parts.push(`${record.acidMolarity}M`);
  if (record.acidType) parts.push(record.acidType);
  return parts.join(' | ');
};

/**
 * Format base properties for display
 * @param {Object} record - Graphene record
 * @returns {string} Formatted base string
 */
export const formatBase = (record) => {
  const parts = [];
  if (record.baseAmount) parts.push(`${record.baseAmount}g`);
  if (record.baseType) parts.push(record.baseType);
  if (record.baseConcentration) parts.push(`${record.baseConcentration}%`);
  return parts.join(' | ');
};

/**
 * Format appearance tags array for display
 * @param {Array} tags - Array of appearance tags
 * @returns {string} Comma-separated tags
 */
export const formatAppearanceTags = (tags) => {
  return tags && tags.length > 0 ? tags.join(', ') : '';
};

/**
 * Calculate and format output percentage
 * @param {Object} record - Graphene record with quantity and output
 * @returns {string} Formatted percentage or empty string
 */
export const calculateOutputPercentage = (record) => {
  if (record.quantity && record.output && record.quantity > 0) {
    const percentage = (record.output / record.quantity) * 100;
    return percentage.toFixed(1) + '%';
  }
  return '';
};

/**
 * Format scientific notation values
 * @param {number|string} value - Value to format
 * @returns {string} Formatted scientific notation
 */
export const formatScientificNotation = (value) => {
  if (!value) return '';
  
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  
  // If the number is large (>= 1000) or small (<= 0.001), show in scientific notation
  if (num >= 1000 || (num > 0 && num <= 0.001)) {
    const exp = num.toExponential(2);
    const [coefficient, exponent] = exp.split('e');
    const expNum = parseInt(exponent, 10);
    
    // Convert to mathematical notation with proper superscript
    const superscripts = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
      '-': '⁻'
    };
    
    const superscriptExp = expNum.toString().split('').map(char => superscripts[char] || char).join('');
    return `${parseFloat(coefficient).toString()} × 10${superscriptExp}`;
  }
  
  // Otherwise show as regular number with appropriate decimal places
  return num.toFixed(3);
};

/**
 * Format temperature range
 * @param {string} tempRate - Temperature rate string
 * @returns {string} Formatted temperature range
 */
export const formatTempRate = (tempRate) => {
  if (!tempRate) return '';
  return tempRate.includes('°C') ? tempRate : `${tempRate}°C/min`;
};

/**
 * Format pressure values
 * @param {number} pressure - Pressure value
 * @returns {string} Formatted pressure with unit
 */
export const formatPressure = (pressure) => {
  if (!pressure) return '';
  return `${pressure} bar`;
};

/**
 * Format time duration
 * @param {number} time - Time value
 * @param {string} unit - Time unit (hr, min)
 * @returns {string} Formatted time with unit
 */
export const formatTime = (time, unit = 'hr') => {
  if (!time) return '';
  return `${time} ${unit}`;
};

/**
 * Format wash properties for display
 * @param {Object} record - Record with wash properties
 * @returns {string} Formatted wash string
 */
export const formatWash = (record) => {
  const parts = [];
  if (record.washAmount) parts.push(`${record.washAmount}g`);
  if (record.washSolution) parts.push(record.washSolution);
  if (record.washConcentration) parts.push(`${record.washConcentration}%`);
  if (record.washWater) parts.push(record.washWater);
  return parts.join(' | ');
};

/**
 * Format homogeneous boolean for display
 * @param {boolean|null} value - Homogeneous value
 * @returns {string} Yes/No or empty string
 */
export const formatHomogeneous = (value) => {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return '';
};

/**
 * Format a date for HTML date input without timezone conversion issues
 * This function ensures dates display correctly in HTML <input type="date"> elements
 * by converting any date to local YYYY-MM-DD format without timezone shifts
 * @param {string|Date} dateValue - Date string (ISO format) or Date object
 * @returns {string} YYYY-MM-DD formatted string for HTML date inputs
 */
export const formatDateForInput = (dateValue) => {
  if (!dateValue) return '';
  
  let date;
  
  // If it's already a Date object
  if (dateValue instanceof Date) {
    date = dateValue;
  } 
  // If it's a string that looks like a simple date (YYYY-MM-DD)
  else if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // For simple date strings, split and create date in local timezone
    const [year, month, day] = dateValue.split('-');
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  // If it's an ISO string or other date string
  else if (typeof dateValue === 'string') {
    date = new Date(dateValue);
    // Convert to local date to avoid timezone issues for date inputs
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  else {
    return '';
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '';
  }
  
  // Format as YYYY-MM-DD for HTML date input
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Default export with all formatters
export default {
  formatDate,
  formatDateForInput,
  formatAcid,
  formatBase,
  formatAppearanceTags,
  calculateOutputPercentage,
  formatScientificNotation,
  formatTempRate,
  formatPressure,
  formatTime,
  formatWash,
  formatHomogeneous,
  formatFileSize
};