/**
 * Alpine.js State Optimization Utilities
 * Reduces unnecessary re-renders and improves performance
 */

/**
 * Batches multiple state updates to reduce re-renders
 * @param {Function} updateFn - Function containing multiple state updates
 * @param {object} context - Alpine.js component context (this)
 */
export function batchUpdates(updateFn, context) {
  // Use nextTick to batch updates in a single DOM update cycle
  context.$nextTick(() => {
    updateFn.call(context);
  });
}

/**
 * Debounced search function to prevent excessive API calls
 * @param {Function} searchFn - Search function to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {Function} Debounced function
 */
export function debounceSearch(searchFn, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => searchFn.apply(this, args), delay);
  };
}

/**
 * Optimized array update that minimizes reactivity triggers
 * @param {Array} currentArray - Current array
 * @param {Array} newArray - New array
 * @returns {Array} Updated array (same reference if no changes)
 */
export function optimizedArrayUpdate(currentArray, newArray) {
  // If arrays are identical, return current reference to prevent re-render
  if (arraysEqual(currentArray, newArray)) {
    return currentArray;
  }
  
  // Return new array to trigger reactivity
  return [...newArray];
}

/**
 * Deep comparison of arrays for optimization
 * @param {Array} arr1 - First array
 * @param {Array} arr2 - Second array
 * @returns {boolean} True if arrays are equal
 */
function arraysEqual(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    return arr1 === arr2;
  }
  
  if (arr1.length !== arr2.length) {
    return false;
  }
  
  return arr1.every((item, index) => {
    if (typeof item === 'object' && item !== null) {
      return JSON.stringify(item) === JSON.stringify(arr2[index]);
    }
    return item === arr2[index];
  });
}

/**
 * Creates an optimized computed property that caches results
 * @param {Function} computeFn - Function to compute value
 * @param {Array} dependencies - Array of dependency values
 * @returns {Function} Cached computed function
 */
export function createCachedComputed(computeFn, dependencies = []) {
  let cache = null;
  let lastDependencies = null;
  
  return function() {
    const currentDependencies = JSON.stringify(dependencies);
    
    if (cache === null || lastDependencies !== currentDependencies) {
      cache = computeFn.call(this);
      lastDependencies = currentDependencies;
    }
    
    return cache;
  };
}

/**
 * Optimized form state manager
 */
export class FormStateManager {
  constructor(initialState = {}) {
    this.state = { ...initialState };
    this.pristineState = { ...initialState };
    this.errors = {};
  }
  
  /**
   * Update form field with validation
   * @param {string} field - Field name
   * @param {any} value - Field value
   * @param {Function} validator - Optional validator function
   */
  updateField(field, value, validator = null) {
    this.state[field] = value;
    
    if (validator) {
      const error = validator(value);
      if (error) {
        this.errors[field] = error;
      } else {
        delete this.errors[field];
      }
    }
  }
  
  /**
   * Check if form is dirty (has changes)
   * @returns {boolean} True if form has changes
   */
  isDirty() {
    return JSON.stringify(this.state) !== JSON.stringify(this.pristineState);
  }
  
  /**
   * Check if form is valid
   * @returns {boolean} True if no errors
   */
  isValid() {
    return Object.keys(this.errors).length === 0;
  }
  
  /**
   * Reset form to pristine state
   */
  reset() {
    this.state = { ...this.pristineState };
    this.errors = {};
  }
  
  /**
   * Get form data with only changed fields
   * @returns {object} Changed fields only
   */
  getChanges() {
    const changes = {};
    for (const [key, value] of Object.entries(this.state)) {
      if (value !== this.pristineState[key]) {
        changes[key] = value;
      }
    }
    return changes;
  }
}

/**
 * Memory-efficient event handler creator
 * Prevents memory leaks from closures in loops
 * @param {string} methodName - Method name to call
 * @param {...any} args - Arguments to pass to method
 * @returns {Function} Event handler
 */
export function createEventHandler(methodName, ...args) {
  return function(event) {
    if (this[methodName] && typeof this[methodName] === 'function') {
      this[methodName](event, ...args);
    }
  };
}