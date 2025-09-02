/**
 * Advanced Filtering System
 * Provides reusable filter components for table data filtering
 */

/**
 * Generate HTML for a complete filter panel
 * @param {object} config - Filter configuration
 * @param {string} config.tableName - Table name for filter configuration
 * @param {string} config.filterStateVariable - Alpine.js variable name for filter state
 * @param {string} config.onFilterChange - Alpine.js method to call when filters change
 * @returns {string} HTML string for filter panel
 */
export function getFilterPanelHtml(config) {
  const { tableName, filterStateVariable, onFilterChange = 'applyFilters()' } = config;
  
  return `
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm mb-6" x-data="{ showFilters: false }">
      <!-- Filter Header -->
      <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-700 flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586a1 1 0 01-.293.707l-2 2A1 1 0 0111 21v-6.586a1 1 0 00-.293-.707L4.293 7.293A1 1 0 014 6.586V4z"></path>
          </svg>
          Filters
        </h3>
        
        <div class="flex items-center space-x-2">
          <!-- Active Filter Count -->
          <span x-show="getActiveFilterCount(${filterStateVariable}) > 0" 
                x-text="getActiveFilterCount(${filterStateVariable}) + ' active'"
                class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          </span>
          
          <!-- Clear All Filters -->
          <button type="button" 
                  x-show="getActiveFilterCount(${filterStateVariable}) > 0"
                  @click="clearAllFilters('${tableName}'); ${onFilterChange}"
                  class="text-xs text-gray-500 hover:text-gray-700">
            Clear All
          </button>
          
          <!-- Toggle Button -->
          <button type="button" 
                  @click="showFilters = !showFilters"
                  class="text-sm text-gray-600 hover:text-gray-800 flex items-center">
            <span x-text="showFilters ? 'Hide' : 'Show'"></span>
            <svg class="w-4 h-4 ml-1 transform transition-transform duration-200" 
                 :class="showFilters ? 'rotate-180' : ''"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Filter Content -->
      <div x-show="showFilters" 
           x-transition:enter="transition ease-out duration-200"
           x-transition:enter-start="opacity-0 transform scale-95"
           x-transition:enter-end="opacity-100 transform scale-100"
           x-transition:leave="transition ease-in duration-100"
           x-transition:leave-start="opacity-100 transform scale-100"
           x-transition:leave-end="opacity-0 transform scale-95"
           class="p-4">
        
        <!-- Filter Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
             x-html="generateFilterFields('${tableName}', '${filterStateVariable}', '${onFilterChange}')">
        </div>
        
        <!-- Filter Actions -->
        <div class="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
          <div class="text-xs text-gray-500">
            <span x-text="'Showing ' + (${filterStateVariable}.meta?.filteredRecords || 0) + ' of ' + (${filterStateVariable}.meta?.totalRecords || 0) + ' records'"></span>
          </div>
          
          <div class="flex space-x-2">
            <button type="button"
                    @click="clearAllFilters('${tableName}'); ${onFilterChange}"
                    class="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50">
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate HTML for individual filter field
 * @param {object} filterConfig - Configuration for specific filter
 * @param {string} tableName - Table name
 * @param {string} filterStateVariable - Alpine.js state variable name
 * @param {string} onFilterChange - Method to call on change
 * @returns {string} HTML for filter field
 */
export function getFilterFieldHtml(filterConfig, tableName, filterStateVariable, onFilterChange) {
  const { field, type, label, multiple, options, min, max, step } = filterConfig;
  
  switch (type) {
    case 'text':
      return getTextFilterHtml(field, label, filterStateVariable, onFilterChange);
    
    case 'select':
      return getSelectFilterHtml(field, label, multiple, tableName, filterStateVariable, onFilterChange);
    
    case 'multiSelect':
      return getMultiSelectFilterHtml(field, label, options, filterStateVariable, onFilterChange);
    
    case 'dateRange':
      return getDateRangeFilterHtml(field, label, filterStateVariable, onFilterChange);
    
    case 'numericRange':
      return getNumericRangeFilterHtml(field, label, min, max, step, filterStateVariable, onFilterChange);
    
    case 'boolean':
      return getBooleanFilterHtml(field, label, options, filterStateVariable, onFilterChange);
    
    default:
      return '';
  }
}

/**
 * Generate text filter HTML
 */
function getTextFilterHtml(field, label, stateVar, onChange) {
  return `
    <div class="space-y-2">
      <label class="text-xs font-medium text-gray-700">${label}</label>
      <input type="text"
             x-model="${stateVar}.filters.${field}"
             @input.debounce.300ms="${onChange}"
             placeholder="Search ${label.toLowerCase()}..."
             class="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
    </div>
  `;
}

/**
 * Generate select filter HTML with dynamic options
 */
function getSelectFilterHtml(field, label, multiple, tableName, stateVar, onChange) {
  const modelAttribute = multiple ? `x-model="${stateVar}.filters.${field}"` : `x-model="${stateVar}.filters.${field}"`;
  const multipleAttribute = multiple ? 'multiple' : '';
  const sizeAttribute = multiple ? 'size="4"' : '';
  
  return `
    <div class="space-y-2">
      <label class="text-xs font-medium text-gray-700">${label}</label>
      <select ${modelAttribute}
              @change="${onChange}"
              ${multipleAttribute}
              ${sizeAttribute}
              class="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${multiple ? 'h-20' : ''}">
        <option value="">All ${label}</option>
        <template x-for="option in filterOptions['${tableName}']['${field}'] || []" :key="option.value">
          <option :value="option.value" x-text="option.label"></option>
        </template>
      </select>
    </div>
  `;
}

/**
 * Generate multi-select filter HTML with static options
 */
function getMultiSelectFilterHtml(field, label, options, stateVar, onChange) {
  return `
    <div class="space-y-2">
      <label class="text-xs font-medium text-gray-700">${label}</label>
      <div class="space-y-1 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
        ${options.map(option => `
          <label class="flex items-center space-x-2 text-xs">
            <input type="checkbox"
                   :checked="(${stateVar}.filters.${field} || []).includes('${option}')"
                   @change="toggleMultiSelectOption('${field}', '${option}', $event.target.checked, '${stateVar}'); ${onChange}"
                   class="rounded text-blue-600">
            <span>${option}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Generate date range filter HTML
 */
function getDateRangeFilterHtml(field, label, stateVar, onChange) {
  return `
    <div class="space-y-2">
      <label class="text-xs font-medium text-gray-700">${label}</label>
      <div class="grid grid-cols-2 gap-2">
        <input type="date"
               x-model="${stateVar}.filters.${field}.from"
               @change="${onChange}"
               placeholder="From"
               class="px-2 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <input type="date"
               x-model="${stateVar}.filters.${field}.to"
               @change="${onChange}"
               placeholder="To"
               class="px-2 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
      </div>
    </div>
  `;
}

/**
 * Generate numeric range filter HTML
 */
function getNumericRangeFilterHtml(field, label, min, max, step, stateVar, onChange) {
  return `
    <div class="space-y-2">
      <label class="text-xs font-medium text-gray-700">${label}</label>
      <div class="grid grid-cols-2 gap-2">
        <input type="number"
               x-model.number="${stateVar}.filters.${field}.min"
               @input.debounce.300ms="${onChange}"
               placeholder="Min"
               min="${min || ''}"
               max="${max || ''}"
               step="${step || 'any'}"
               class="px-2 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <input type="number"
               x-model.number="${stateVar}.filters.${field}.max"
               @input.debounce.300ms="${onChange}"
               placeholder="Max"
               min="${min || ''}"
               max="${max || ''}"
               step="${step || 'any'}"
               class="px-2 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
      </div>
    </div>
  `;
}

/**
 * Generate boolean filter HTML
 */
function getBooleanFilterHtml(field, label, options, stateVar, onChange) {
  return `
    <div class="space-y-2">
      <label class="text-xs font-medium text-gray-700">${label}</label>
      <select x-model="${stateVar}.filters.${field}"
              @change="${onChange}"
              class="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <option value="">All</option>
        ${options.map(option => `
          <option value="${option.value}">${option.label}</option>
        `).join('')}
      </select>
    </div>
  `;
}