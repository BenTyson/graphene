// Modal Helper Functions for Alpine.js
// These helpers create modal HTML structures while preserving Alpine.js reactivity

/**
 * Creates a modal wrapper with standard styling
 * This is a helper function that returns HTML string - Alpine.js directives remain intact
 * 
 * @param {Object} config - Modal configuration
 * @param {string} config.showVariable - Alpine.js variable controlling modal visibility
 * @param {string} config.title - Modal title
 * @param {string} config.content - Modal body content (can include Alpine.js directives)
 * @param {string} config.maxWidth - Tailwind max-width class (default: 'max-w-md')
 * @param {boolean} config.clickAway - Whether clicking outside closes modal (default: true)
 * @returns {string} HTML string for the modal
 */
export function createModal(config) {
  const {
    showVariable,
    title,
    content,
    maxWidth = 'max-w-md',
    clickAway = true
  } = config;

  // Build click away directive if enabled
  const clickAwayAttr = clickAway ? `@click.away="${showVariable} = false"` : '';

  return `
    <div x-show="${showVariable}" x-cloak
         ${clickAwayAttr}
         class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white rounded-lg ${maxWidth} w-full p-6">
          <h3 class="text-lg font-semibold mb-4">${title}</h3>
          ${content}
        </div>
      </div>
    </div>
  `;
}

/**
 * Creates a simple "Add New Item" modal
 * Preserves all Alpine.js functionality
 * 
 * @param {Object} config - Modal configuration
 * @param {string} config.itemType - Type of item being added (e.g., "Research Team")
 * @param {string} config.showVariable - Alpine.js variable for visibility
 * @param {string} config.modelVariable - Alpine.js v-model variable
 * @param {string} config.submitMethod - Alpine.js method to call on submit
 * @param {string} config.inputLabel - Label for the input field
 * @param {string} config.inputType - Type of input (text, textarea, etc.)
 * @param {string} config.placeholder - Input placeholder text
 * @returns {string} HTML string for the add item modal
 */
export function createAddItemModal(config) {
  const {
    itemType,
    showVariable,
    modelVariable,
    submitMethod,
    inputLabel,
    inputType = 'text',
    placeholder = ''
  } = config;

  let inputHtml;
  if (inputType === 'textarea') {
    inputHtml = `
      <textarea x-model="${modelVariable}" required rows="3"
                placeholder="${placeholder}"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"></textarea>
    `;
  } else {
    inputHtml = `
      <input type="${inputType}" x-model="${modelVariable}" required
             placeholder="${placeholder}"
             class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
    `;
  }

  const content = `
    <form @submit.prevent="${submitMethod}()" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">${inputLabel}</label>
        ${inputHtml}
      </div>
      <div class="flex justify-end space-x-2">
        <button type="button" @click="${showVariable} = false; ${modelVariable} = ''"
                class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800">
          Add ${itemType}
        </button>
      </div>
    </form>
  `;

  return createModal({
    showVariable,
    title: `Add New ${itemType}`,
    content,
    maxWidth: 'max-w-md',
    clickAway: true
  });
}

// Export as default object for easy importing
export default {
  createModal,
  createAddItemModal
};