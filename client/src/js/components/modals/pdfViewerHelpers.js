// PDF Viewer Modal Component Helpers for Alpine.js
// Creates consistent PDF viewer modals across the application

/**
 * Creates a standardized PDF viewer modal
 * Provides consistent styling and behavior for all PDF viewing modals
 * 
 * @param {Object} config - Modal configuration
 * @param {string} config.showVariable - Alpine.js variable controlling modal visibility
 * @param {string} config.pdfSourceVariable - Alpine.js variable containing PDF source URL
 * @param {string} config.closeMethod - Alpine.js method to call when closing
 * @param {string} config.title - Modal title (e.g., "RAMAN Report", "SEM Report")
 * @param {string} config.maxWidth - Tailwind max-width class (default: 'max-w-4xl')
 * @param {string} config.height - Height class (default: 'h-[90vh]')
 * @returns {string} HTML string for the PDF viewer modal
 */
export function createPdfViewerModal(config) {
  const {
    showVariable,
    pdfSourceVariable,
    closeMethod,
    title,
    maxWidth = 'max-w-4xl',
    height = 'h-[90vh]'
  } = config;

  return `
    <div x-show="${showVariable}" x-cloak
         @click.away="${closeMethod}()"
         class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white rounded-lg ${maxWidth} w-full ${height} p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">${title}</h3>
            <button @click="${closeMethod}()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="h-full">
            <iframe x-show="${pdfSourceVariable}" 
                    :src="${pdfSourceVariable}" 
                    class="w-full h-full border rounded"
                    title="${title} PDF">
            </iframe>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Export as default object for easy importing
export default {
  createPdfViewerModal
};