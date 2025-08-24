// Numeric Field Component Helpers for Alpine.js
// Creates numeric input fields with unit labels

/**
 * Creates a numeric input field with unit display in label
 * Preserves Alpine.js reactivity and maintains existing styling
 * 
 * @param {Object} config - Field configuration
 * @param {string} config.label - Field base label text (e.g., "Starting Amount")
 * @param {string} config.unit - Unit to display in parentheses (e.g., "g", "°C", "hr")
 * @param {string} config.modelVariable - Alpine.js variable for field value
 * @param {string} config.inputType - Input type (default: "number")
 * @param {string} config.step - Step value for number inputs (default: "0.01")
 * @param {string} config.placeholder - Placeholder text
 * @param {boolean} config.required - Whether the field is required (default: false)
 * @returns {string} HTML string for the numeric field with unit label
 */
export function createNumericFieldWithUnit(config) {
  const {
    label,
    unit,
    modelVariable,
    inputType = 'number',
    step = '0.01',
    placeholder = '',
    required = false
  } = config;

  const requiredAttr = required ? 'required' : '';
  const requiredIndicator = required ? '<span class="text-red-500">*</span>' : '';
  const stepAttr = inputType === 'number' ? `step="${step}"` : '';
  const fullLabel = unit ? `${label} (${unit})` : label;

  return `
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">${fullLabel} ${requiredIndicator}</label>
      <input type="${inputType}" ${stepAttr} x-model="${modelVariable}" 
             ${requiredAttr}
             placeholder="${placeholder}"
             class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
    </div>
  `;
}

// Export as default object for easy importing
export default {
  createNumericFieldWithUnit
};