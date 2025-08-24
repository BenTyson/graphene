// Select Field Component Helpers for Alpine.js
// Creates select dropdown fields with "Add New" functionality

/**
 * Creates a select dropdown with "Add New" option
 * Preserves Alpine.js reactivity and maintains existing styling
 * 
 * @param {Object} config - Field configuration
 * @param {string} config.label - Field label text
 * @param {string} config.modelVariable - Alpine.js variable for selected value
 * @param {string} config.optionsArray - Alpine.js array variable for options
 * @param {string} config.showModalVariable - Alpine.js variable for modal visibility
 * @param {string} config.placeholder - Placeholder text (default: "Select...")
 * @param {string} config.addNewText - Text for "Add New" option (e.g., "Team", "Material")
 * @param {string} config.resetValue - Value to reset to when "Add New" is selected
 * @param {boolean} config.required - Whether the field is required (default: false)
 * @returns {string} HTML string for the select field with add new functionality
 */
export function createSelectWithAdd(config) {
  const {
    label,
    modelVariable,
    optionsArray,
    showModalVariable,
    placeholder = 'Select...',
    addNewText,
    resetValue = '',
    required = false
  } = config;

  const requiredAttr = required ? 'required' : '';
  const requiredIndicator = required ? '<span class="text-red-500">*</span>' : '';

  return `
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">${label} ${requiredIndicator}</label>
      <div class="relative">
        <select x-model="${modelVariable}" 
                @change="if($event.target.value === 'add_new') { ${showModalVariable} = true; ${modelVariable} = '${resetValue}'; }"
                ${requiredAttr}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black appearance-none">
          <option value="">${placeholder}</option>
          <template x-for="item in ${optionsArray}" :key="item">
            <option :value="item" x-text="item"></option>
          </template>
          <option value="add_new" class="font-semibold">+ Add New ${addNewText}</option>
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  `;
}

// Export as default object for easy importing
export default {
  createSelectWithAdd
};