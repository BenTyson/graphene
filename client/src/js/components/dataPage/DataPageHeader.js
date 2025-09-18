/**
 * DataPageHeader - Header component for data pages
 * 
 * Provides:
 * - Breadcrumb navigation
 * - Page title and identifier
 * - Status badges
 * - Action buttons (Edit, Export, etc.)
 */

/**
 * Create data page header
 * @param {Object} config - Header configuration
 * @returns {string} HTML for header
 */
function createDataPageHeader(config) {
  const { 
    type, 
    identifier, 
    data, 
    breadcrumbs = [], 
    actions = {},
    showBackButton = true 
  } = config;

  const typeLabel = getDataTypeLabel(type);
  const status = data?.status || 'unknown';
  const statusBadge = createStatusBadge(status, type);

  return `
    <div class="data-page-header bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-6 py-6">
        
        <!-- Breadcrumb Navigation -->
        <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          ${breadcrumbs.map((crumb, index) => `
            ${index > 0 ? `
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            ` : ''}
            ${crumb.url ? `
              <a href="${crumb.url}" class="hover:text-gray-700 transition-colors">${crumb.label}</a>
            ` : `
              <span class="${crumb.isActive ? 'text-gray-900 font-medium' : ''}">${crumb.label}</span>
            `}
          `).join('')}
        </nav>

        <!-- Header Content -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          
          <!-- Title Section -->
          <div class="flex items-center space-x-4 mb-4 sm:mb-0">
            ${showBackButton ? `
              <button onclick="window.history.back()" 
                      class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
              </button>
            ` : ''}
            
            <div>
              <div class="flex items-center space-x-3">
                <h1 class="text-3xl font-bold text-gray-900">${identifier}</h1>
                ${statusBadge}
              </div>
              <p class="text-gray-600 mt-1">${typeLabel} Details</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-3">
            ${actions.edit ? `
              <button onclick="${actions.edit}" 
                      class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit
              </button>
            ` : ''}

            ${actions.export ? `
              <button onclick="${actions.export}" 
                      class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Export
              </button>
            ` : ''}

            ${actions.duplicate ? `
              <button onclick="${actions.duplicate}" 
                      class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                Duplicate
              </button>
            ` : ''}

            <!-- More Actions Dropdown -->
            <div class="relative" x-data="{ open: false }">
              <button @click="open = !open" 
                      class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                </svg>
              </button>

              <div x-show="open" 
                   @click.away="open = false"
                   x-transition:enter="transition ease-out duration-100"
                   x-transition:enter-start="transform opacity-0 scale-95"
                   x-transition:enter-end="transform opacity-100 scale-100"
                   x-transition:leave="transition ease-in duration-75"
                   x-transition:leave-start="transform opacity-100 scale-100"
                   x-transition:leave-end="transform opacity-0 scale-95"
                   class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                
                ${actions.delete ? `
                  <button onclick="${actions.delete}" 
                          class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    Delete ${typeLabel}
                  </button>
                ` : ''}
                
                <button onclick="window.print()" 
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  Print Page
                </button>
                
                <button onclick="copyPageUrl()" 
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  Copy URL
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Create status badge based on status and type
 * @param {string} status - Status value
 * @param {string} type - Data type
 * @returns {string} Status badge HTML
 */
function createStatusBadge(status, type) {
  const statusConfig = getStatusConfig(status, type);
  
  return `
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.classes}">
      ${statusConfig.icon ? `
        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          ${statusConfig.icon}
        </svg>
      ` : ''}
      ${statusConfig.label}
    </span>
  `;
}

/**
 * Get status configuration
 * @param {string} status - Status value
 * @param {string} type - Data type
 * @returns {Object} Status configuration
 */
function getStatusConfig(status, type) {
  const statusConfigs = {
    completed: {
      label: 'Completed',
      classes: 'bg-green-100 text-green-800',
      icon: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>'
    },
    pending: {
      label: 'Pending',
      classes: 'bg-yellow-100 text-yellow-800',
      icon: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>'
    },
    in_progress: {
      label: 'In Progress',
      classes: 'bg-blue-100 text-blue-800',
      icon: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"></path>'
    },
    failed: {
      label: 'Failed',
      classes: 'bg-red-100 text-red-800',
      icon: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>'
    },
    unknown: {
      label: 'Unknown',
      classes: 'bg-gray-100 text-gray-800',
      icon: null
    }
  };

  return statusConfigs[status?.toLowerCase()] || statusConfigs.unknown;
}

/**
 * Get display label for data type
 * @param {string} type - Data type
 * @returns {string} Display label
 */
function getDataTypeLabel(type) {
  const labels = {
    'graphene': 'Graphene Experiment',
    'biochar': 'Biochar Experiment',
    'compound-batch': 'Compound Batch',
    'micronization': 'Micronization',
    'shipment': 'Shipment'
  };
  return labels[type] || type;
}

/**
 * Copy page URL to clipboard
 */
function copyPageUrl() {
  const url = window.location.href;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      // Show success message
      showToast('URL copied to clipboard', 'success');
    }).catch(() => {
      fallbackCopyUrl(url);
    });
  } else {
    fallbackCopyUrl(url);
  }
}

/**
 * Fallback URL copy method
 * @param {string} url - URL to copy
 */
function fallbackCopyUrl(url) {
  const textArea = document.createElement('textarea');
  textArea.value = url;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    showToast('URL copied to clipboard', 'success');
  } catch (err) {
    showToast('Failed to copy URL', 'error');
  }
  
  document.body.removeChild(textArea);
}

/**
 * Show toast notification
 * @param {string} message - Message to show
 * @param {string} type - Toast type (success, error, info)
 */
function showToast(message, type = 'info') {
  // Simple toast implementation - can be enhanced later
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'error' ? 'bg-red-500 text-white' :
    'bg-blue-500 text-white'
  }`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Make functions globally available
window.createDataPageHeader = createDataPageHeader;
window.createStatusBadge = createStatusBadge;
window.getStatusConfig = getStatusConfig;
window.getDataTypeLabel = getDataTypeLabel;
window.copyPageUrl = copyPageUrl;
window.showToast = showToast;

export { createDataPageHeader, createStatusBadge, getStatusConfig, getDataTypeLabel };