// File Upload Field Component Helpers for Alpine.js
// Creates file upload fields with current file management

/**
 * Creates a file upload field with current file display and management
 * Preserves Alpine.js reactivity and maintains existing styling
 * 
 * @param {Object} config - Field configuration
 * @param {string} config.label - Field label text (e.g., "BET Report (PDF)")
 * @param {string} config.fileModelVariable - Alpine.js variable for file input
 * @param {string} config.editingVariable - Alpine.js variable for editing state (e.g., "editingBet")
 * @param {string} config.currentFilePathField - Field name for current file path (e.g., "betReportPath")
 * @param {string} config.removeFileVariable - Alpine.js variable for removal flag (e.g., "betForm.removeBetReport")
 * @param {string} config.acceptTypes - File accept types (default: "application/pdf")
 * @param {boolean} config.required - Whether the field is required (default: false)
 * @returns {string} HTML string for the file upload field with management
 */
export function createFileUploadField(config) {
  const {
    label,
    fileModelVariable,
    editingVariable,
    currentFilePathField,
    removeFileVariable,
    acceptTypes = 'application/pdf',
    required = false
  } = config;

  const requiredAttr = required ? 'required' : '';
  const requiredIndicator = required ? '<span class="text-red-500">*</span>' : '';

  return `
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">${label} ${requiredIndicator}</label>
      <div class="space-y-2">
        <input type="file" 
               accept="${acceptTypes}"
               @change="${fileModelVariable} = $event.target.files[0]"
               ${requiredAttr}
               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
        <template x-if="${editingVariable} && ${editingVariable}.${currentFilePathField}">
          <div class="flex items-center justify-between bg-link-light p-2 rounded">
            <span class="text-sm text-link-dark">Current ${label.toLowerCase()} attached</span>
            <div class="flex space-x-2">
              <button type="button" @click="window.open('/uploads/' + ${editingVariable}.${currentFilePathField}, '_blank')" 
                      class="text-link text-link-hover text-sm">View</button>
              <button type="button" @click="${removeFileVariable} = true" 
                      class="text-red-600 hover:text-red-800 text-sm">Remove</button>
            </div>
          </div>
        </template>
        <template x-if="${removeFileVariable}">
          <div class="text-red-600 text-sm">${label} will be removed when saved</div>
        </template>
      </div>
    </div>
  `;
}

// Export as default object for easy importing
export default {
  createFileUploadField
};