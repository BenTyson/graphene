/**
 * Filter Service
 * Centralized service for all filtering functionality
 * Extracted from app-refactored.js for better maintainability
 */

class FilterService {
  constructor() {
    this.filterConfigs = {};
    this.filterOptions = {};
    this.activeFilters = {};
    this.filterLoading = false;
    this.filterError = null;
  }

  /**
   * Initialize filters for a specific table
   * @param {string} tableName - Name of the table to initialize filters for
   * @param {Object} appContext - Reference to the main app context for state updates
   */
  async initFilters(tableName, appContext) {
    this.filterLoading = true;
    this.filterError = null;
    
    // Update app context loading state
    if (appContext) {
      appContext.filterLoading = true;
      appContext.filterError = null;
    }
    
    try {
      // Load filter configuration
      const configResponse = await fetch(`/api/${tableName}/filters/config`);
      if (!configResponse.ok) {
        throw new Error(`Failed to load filter configuration: ${configResponse.statusText}`);
      }
      
      const config = await configResponse.json();
      this.filterConfigs[tableName] = config;
      
      // Initialize filter options object
      this.filterOptions[tableName] = {};
      
      // Load dynamic filter options
      await this.loadFilterOptions(tableName);
      
      // Initialize active filters state
      this.initializeFilterValues(tableName, appContext);
      
    } catch (error) {
      console.error('Error initializing filters:', error);
      this.filterError = error.message;
      if (appContext) {
        appContext.filterError = error.message;
      }
    } finally {
      this.filterLoading = false;
      if (appContext) {
        appContext.filterLoading = false;
      }
    }
  }

  async loadFilterOptions(tableName) {
    const config = this.filterConfigs[tableName];
    if (!config || !config.filters) return;
    
    const optionPromises = config.filters
      .filter(filter => filter.optionsQuery || (filter.type === 'select' && !filter.options))
      .map(async (filter) => {
        try {
          const response = await fetch(`/api/${tableName}/filters/${filter.field}/options`);
          if (response.ok) {
            const options = await response.json();
            this.filterOptions[tableName][filter.field] = options;
          }
        } catch (error) {
          console.warn(`Failed to load options for ${filter.field}:`, error);
          this.filterOptions[tableName][filter.field] = [];
        }
      });
    
    await Promise.all(optionPromises);
  }

  initializeFilterValues(tableName, appContext) {
    const config = this.filterConfigs[tableName];
    if (!config || !config.filters) return;
    
    this.activeFilters[tableName] = {};
    
    // Update app context if provided
    if (appContext && appContext.grapheneFilterState) {
      appContext.grapheneFilterState.filters = {};
    }
    
    config.filters.forEach(filter => {
      let defaultValue;
      switch (filter.type) {
        case 'text':
        case 'select':
          defaultValue = filter.multiple ? [] : '';
          break;
        case 'multiSelect':
          defaultValue = [];
          break;
        case 'dateRange':
          defaultValue = { from: '', to: '' };
          break;
        case 'numericRange':
          defaultValue = { min: null, max: null };
          break;
        case 'boolean':
          defaultValue = '';
          break;
        default:
          defaultValue = '';
      }
      this.activeFilters[tableName][filter.field] = defaultValue;
      
      if (appContext && appContext.grapheneFilterState) {
        appContext.grapheneFilterState.filters[filter.field] = defaultValue;
      }
    });
  }

  generateFilterFields(tableName, filterStateVariable, onFilterChange) {
    const config = this.filterConfigs[tableName];
    if (!config || !config.filters) {
      return '<div class="text-xs text-gray-500">No filters available</div>';
    }
    
    return config.filters
      .map(filterConfig => {
        const { field, type, label, multiple, options, min, max, step } = filterConfig;
        
        switch (type) {
          case 'text':
            return `
              <div class="space-y-2">
                <label class="text-xs font-medium text-gray-700">${label}</label>
                <input type="text"
                       x-model="${filterStateVariable}.filters.${field}"
                       @input.debounce.300ms="${onFilterChange}"
                       placeholder="Search ${label.toLowerCase()}..."
                       class="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
            `;
          
          case 'select':
            const modelAttribute = `x-model="${filterStateVariable}.filters.${field}"`;
            const multipleAttribute = multiple ? 'multiple' : '';
            const sizeAttribute = multiple ? 'size="4"' : '';
            
            return `
              <div class="space-y-2">
                <label class="text-xs font-medium text-gray-700">${label}</label>
                <select ${modelAttribute}
                        @change="${onFilterChange}"
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
          
          case 'dateRange':
            return `
              <div class="space-y-2">
                <label class="text-xs font-medium text-gray-700">${label}</label>
                <div class="grid grid-cols-2 gap-2">
                  <input type="date"
                         x-model="${filterStateVariable}.filters.${field}.from"
                         @change="${onFilterChange}"
                         placeholder="From"
                         class="px-2 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <input type="date"
                         x-model="${filterStateVariable}.filters.${field}.to"
                         @change="${onFilterChange}"
                         placeholder="To"
                         class="px-2 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
              </div>
            `;
          
          case 'numericRange':
            return `
              <div class="space-y-2">
                <label class="text-xs font-medium text-gray-700">${label}</label>
                <div class="grid grid-cols-2 gap-2">
                  <input type="number"
                         x-model.number="${filterStateVariable}.filters.${field}.min"
                         @input.debounce.300ms="${onFilterChange}"
                         placeholder="Min"
                         min="${min || ''}"
                         max="${max || ''}"
                         step="${step || 'any'}"
                         class="px-2 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <input type="number"
                         x-model.number="${filterStateVariable}.filters.${field}.max"
                         @input.debounce.300ms="${onFilterChange}"
                         placeholder="Max"
                         min="${min || ''}"
                         max="${max || ''}"
                         step="${step || 'any'}"
                         class="px-2 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
              </div>
            `;
          
          case 'multiSelect':
            return `
              <div class="space-y-2">
                <label class="text-xs font-medium text-gray-700">${label}</label>
                <div class="space-y-1 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                  ${options.map(option => `
                    <label class="flex items-center space-x-2 text-xs">
                      <input type="checkbox"
                             :checked="(${filterStateVariable}.filters.${field} || []).includes('${option}')"
                             @change="toggleMultiSelectOption('${field}', '${option}', $event.target.checked, '${filterStateVariable}'); ${onFilterChange}"
                             class="rounded text-blue-600">
                      <span>${option}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
            `;
          
          case 'boolean':
            return `
              <div class="space-y-2">
                <label class="text-xs font-medium text-gray-700">${label}</label>
                <select x-model="${filterStateVariable}.filters.${field}"
                        @change="${onFilterChange}"
                        class="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">All</option>
                  ${options.map(option => `
                    <option value="${option.value}">${option.label}</option>
                  `).join('')}
                </select>
              </div>
            `;
          
          default:
            return '';
        }
      })
      .join('');
  }

  getActiveFilterCount(filterState) {
    if (!filterState || !filterState.filters) return 0;
    
    return Object.values(filterState.filters).filter(value => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== null && v !== '');
      }
      return value !== null && value !== '';
    }).length;
  }

  clearAllFilters(tableName, appContext) {
    this.initializeFilterValues(tableName, appContext);
    if (appContext && appContext.loadGrapheneRecords) {
      appContext.loadGrapheneRecords();
    }
  }

  toggleMultiSelectOption(field, option, checked, stateVariable, appContext) {
    if (!appContext) return;
    
    const filterState = appContext[stateVariable];
    if (!filterState.filters[field]) {
      filterState.filters[field] = [];
    }
    
    if (checked) {
      if (!filterState.filters[field].includes(option)) {
        filterState.filters[field].push(option);
      }
    } else {
      filterState.filters[field] = filterState.filters[field].filter(item => item !== option);
    }
  }

  buildFilterQueryParams(tableName, additionalParams = {}, appContext) {
    const filters = appContext && appContext.grapheneFilterState ? appContext.grapheneFilterState.filters : {};
    if (!filters) return additionalParams;
    
    const params = { ...additionalParams };
    
    // Add filters as JSON string
    const activeFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        activeFilters[key] = value;
      } else if (typeof value === 'object' && value !== null) {
        const hasValues = Object.values(value).some(v => v !== null && v !== '');
        if (hasValues) {
          activeFilters[key] = value;
        }
      } else if (value !== null && value !== '') {
        activeFilters[key] = value;
      }
    });
    
    if (Object.keys(activeFilters).length > 0) {
      params.filters = JSON.stringify(activeFilters);
    }
    
    return params;
  }

  applyFilters(appContext) {
    if (appContext && appContext.loadGrapheneRecords) {
      appContext.loadGrapheneRecords();
    }
  }

  // Expose filter configs and options for external access
  getFilterConfigs() {
    return this.filterConfigs;
  }

  getFilterOptions() {
    return this.filterOptions;
  }

  getActiveFilters() {
    return this.activeFilters;
  }
}

// Create singleton instance
const filterService = new FilterService();

// Export for use in other modules
window.FilterService = filterService;

export default filterService;