/**
 * Modal PDF Viewer Component
 * 
 * Specialized PDF viewer for use within card modals
 * Features modal stacking with higher z-index to appear above card modals
 * 
 * Features:
 * - Higher z-index (60) to appear above card modals (z-index 50)
 * - Proper backdrop handling to prevent card modal closure
 * - Context-aware close behavior (returns to card modal)
 * - Full-screen PDF viewing with navigation controls
 * - Smooth animations and transitions
 */

/**
 * Create a PDF viewer modal that appears above card modals
 * @param {Object} options - Configuration options
 * @returns {string} HTML string for the modal PDF viewer
 */
function createModalPdfViewer(options = {}) {
  const {
    maxWidth = 'max-w-6xl',
    height = 'h-[90vh]'
  } = options;

  return `
    <div x-show="pdfViewerActive" 
         x-cloak
         class="fixed inset-0 z-60 overflow-y-auto"
         x-transition:enter="transition ease-out duration-300"
         x-transition:enter-start="opacity-0"
         x-transition:enter-end="opacity-100"
         x-transition:leave="transition ease-in duration-200"
         x-transition:leave-start="opacity-100"
         x-transition:leave-end="opacity-0"
         @keydown.escape.window="closePdfViewer()"
         @click="closePdfViewer()">
      
      <!-- Modal backdrop - higher opacity to clearly separate from card modal -->
      <div class="fixed inset-0 bg-black bg-opacity-75 transition-opacity"></div>
      
      <!-- PDF viewer content -->
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-lg shadow-2xl ${maxWidth} w-full ${height} relative"
             x-transition:enter="transition ease-out duration-300"
             x-transition:enter-start="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
             x-transition:enter-end="opacity-100 translate-y-0 sm:scale-100"
             x-transition:leave="transition ease-in duration-200"
             x-transition:leave-start="opacity-100 translate-y-0 sm:scale-100"
             x-transition:leave-end="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
             @click.stop>
          
          <!-- PDF viewer header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10 rounded-t-lg">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
              <h3 class="text-lg font-semibold text-gray-900" x-text="currentPdfTitle">
                PDF Document
              </h3>
            </div>
            
            <div class="flex items-center space-x-2">
              <!-- Download button -->
              <a :href="currentPdfUrl" 
                 :download="currentPdfTitle + '.pdf'"
                 class="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                </svg>
                Download
              </a>
              
              <!-- Close button -->
              <button @click="closePdfViewer()" 
                      class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-link rounded-full p-2 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- PDF iframe container -->
          <div class="p-4 ${height}">
            <div class="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
              <!-- Loading state -->
              <template x-if="!currentPdfUrl">
                <div class="flex items-center justify-center h-full">
                  <div class="text-center">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-link mb-4"></div>
                    <p class="text-gray-600">Loading PDF...</p>
                  </div>
                </div>
              </template>
              
              <!-- PDF iframe -->
              <template x-if="currentPdfUrl">
                <iframe :src="currentPdfUrl" 
                        class="w-full h-full border-0 rounded"
                        :title="currentPdfTitle"
                        frameborder="0"
                        sandbox="allow-same-origin"
                        loading="lazy">
                  <div class="flex items-center justify-center h-full">
                    <div class="text-center p-8">
                      <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                      </svg>
                      <h3 class="text-lg font-semibold text-gray-900 mb-2">PDF Unavailable</h3>
                      <p class="text-gray-600 mb-4">Your browser doesn't support embedded PDFs.</p>
                      <a :href="currentPdfUrl" 
                         :download="currentPdfTitle + '.pdf'"
                         class="px-4 py-2 bg-link text-white rounded hover:bg-link-hover transition-colors">
                        Download PDF
                      </a>
                    </div>
                  </div>
                </iframe>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Create CSS styles for modal PDF viewer
 * @returns {string} CSS styles
 */
function getModalPdfViewerStyles() {
  return `
    <style>
      /* Modal stacking z-index hierarchy */
      .z-60 {
        z-index: 60;
      }
      
      /* Ensure PDF viewer appears above card modals */
      .modal-pdf-viewer {
        z-index: 60 !important;
      }
      
      /* PDF iframe optimization */
      .modal-pdf-viewer iframe {
        background: white;
        border-radius: 0.5rem;
      }
      
      /* Loading animation for PDF viewer */
      .modal-pdf-viewer .animate-spin {
        animation: spin 1s linear infinite;
      }
    </style>
  `;
}

/**
 * Initialize modal PDF viewer system
 * @returns {Object} Public API for modal PDF viewer
 */
function initializeModalPdfViewer() {
  return {
    // Create PDF viewer
    createViewer: createModalPdfViewer,
    
    // Get styles
    getStyles: getModalPdfViewerStyles,
    
    // Check if PDF viewer is supported
    isSupported: () => {
      // Check for iframe and PDF support
      return typeof document !== 'undefined' && 
             document.createElement('iframe') &&
             navigator.mimeTypes &&
             navigator.mimeTypes['application/pdf'];
    }
  };
}

// Initialize and expose the modal PDF viewer system
window.ModalPdfViewer = initializeModalPdfViewer();

console.log('Modal PDF Viewer system initialized');