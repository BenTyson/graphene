// Date Field Component Helpers for Alpine.js
// Creates date input fields with "Unknown" checkbox functionality

/**
 * Creates a date field with "Unknown" checkbox
 * Preserves Alpine.js reactivity and maintains existing styling
 * 
 * @param {Object} config - Field configuration
 * @param {string} config.label - Field label text
 * @param {string} config.dateModelVariable - Alpine.js variable for date value
 * @param {string} config.unknownModelVariable - Alpine.js variable for unknown checkbox
 * @param {boolean} config.required - Whether the field is required (default: false)
 * @returns {string} HTML string for the date field with unknown checkbox
 */
export function createDateFieldWithUnknown(config) {
  const {
    label,
    dateModelVariable,
    unknownModelVariable,
    required = false
  } = config;

  const requiredAttr = required ? 'required' : '';
  const requiredIndicator = required ? '<span class="text-red-500">*</span>' : '';

  return `
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">${label} ${requiredIndicator}</label>
      <div class="flex items-center space-x-2">
        <input type="date" x-model="${dateModelVariable}" 
               :disabled="${unknownModelVariable}"
               ${requiredAttr}
               class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100">
        <label class="flex items-center whitespace-nowrap">
          <input type="checkbox" x-model="${unknownModelVariable}" 
                 @change="if($event.target.checked) ${dateModelVariable} = ''"
                 class="mr-2 rounded border-gray-300">
          <span class="text-sm">Unknown</span>
        </label>
      </div>
    </div>
  `;
}

// Export as default object for easy importing
export default {
  createDateFieldWithUnknown
};