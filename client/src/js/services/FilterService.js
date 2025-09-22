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
    console.log(`🔧 FilterService: Initializing filters for table: ${tableName}`);
    this.filterLoading = true;
    this.filterError = null;

    // Update app context loading state
    if (appContext) {
      appContext.filterLoading = true;
      appContext.filterError = null;
    }

    try {
      // Load filter configuration
      console.log(`🌐 FilterService: Fetching config from /api/${tableName}/filters/config`);
      const configResponse = await fetch(`/api/${tableName}/filters/config`);
      console.log(`📡 FilterService: Config response status: ${configResponse.status}`);

      if (!configResponse.ok) {
        const errorText = await configResponse.text();
        console.error(`❌ FilterService: Config fetch failed:`, errorText);
        throw new Error(`Failed to load filter configuration: ${configResponse.statusText}`);
      }

      const config = await configResponse.json();
      console.log(`✅ FilterService: Config loaded for ${tableName}:`, config);
      this.filterConfigs[tableName] = config;
      
      // Initialize filter options object
      this.filterOptions[tableName] = {};
      
      // Load dynamic filter options
      console.log(`🔄 FilterService: Loading filter options for ${tableName}`);
      await this.loadFilterOptions(tableName);
      console.log(`✅ FilterService: Filter options loaded:`, this.filterOptions[tableName]);

      // Initialize active filters state
      console.log(`🎛️ FilterService: Initializing filter values for ${tableName}`);
      this.initializeFilterValues(tableName, appContext);
      console.log(`✅ FilterService: Filter initialization completed for ${tableName}`);

    } catch (error) {
      console.error(`❌ FilterService: Failed to initialize filters for ${tableName}:`, error);
      this.filterError = error.message;
      if (appContext) {
        appContext.filterError = error.message;
      }
    } finally {
      this.filterLoading = false;
      if (appContext) {
        appContext.filterLoading = false;
        // Trigger Alpine.js reactivity to re-render filter fields
        appContext.$nextTick && appContext.$nextTick(() => {
          console.log(`🔄 FilterService: Triggering filter field re-render for ${tableName}`);
        });
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
    console.log(`🎨 FilterService: Generating filter fields for ${tableName}`);
    console.log(`🎨 FilterService: onFilterChange parameter:`, onFilterChange);
    console.log(`🎨 FilterService: Available filter configs:`, Object.keys(this.filterConfigs));
    const config = this.filterConfigs[tableName];
    console.log(`🎨 FilterService: Config for ${tableName}:`, config);

    if (!config || !config.filters) {
      console.warn(`⚠️ FilterService: No filter config found for ${tableName}. Config:`, config);
      // Check if we're still loading filters
      if (this.filterLoading) {
        return '<div class="text-xs text-gray-500">Loading filters...</div>';
      }
      return '<div class="text-xs text-gray-500">No filters available</div>';
    }

    console.log(`✅ FilterService: Found ${config.filters.length} filters for ${tableName}`);

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
            if (multiple) {
              // Render multiple select as checkboxes for better UX
              return `
                <div class="space-y-2">
                  <label class="text-xs font-medium text-gray-700">${label} <span x-text="'(' + ((filterOptions && filterOptions['${tableName}'] && filterOptions['${tableName}']['${field}']) || []).length + ')'" class="text-gray-400"></span></label>
                  <div class="space-y-1 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                    <template x-for="option in (filterOptions && filterOptions['${tableName}'] && filterOptions['${tableName}']['${field}']) || []" :key="option.value">
                      <label class="flex items-center space-x-2 text-xs cursor-pointer">
                        <input type="checkbox"
                               :value="option.value"
                               :checked="${filterStateVariable}.filters.${field}.includes(option.value)"
                               @change="toggleMultiSelectOption('${field}', option.value, $event.target.checked, '${filterStateVariable}'); applyFilters()"
                               class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                        <span x-text="option.label" class="text-gray-700"></span>
                      </label>
                    </template>
                    <div x-show="!(filterOptions && filterOptions['${tableName}'] && filterOptions['${tableName}']['${field}']) || (filterOptions['${tableName}']['${field}'] || []).length === 0" class="text-xs text-gray-500 p-2">
                      No options available
                    </div>
                  </div>
                </div>
              `;
            } else {
              // Single select dropdown
              return `
                <div class="space-y-2">
                  <label class="text-xs font-medium text-gray-700">${label}</label>
                  <select x-model="${filterStateVariable}.filters.${field}"
                          @change="${onFilterChange}"
                          class="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All ${label}</option>
                    <template x-for="option in filterOptions['${tableName}']['${field}'] || []" :key="option.value">
                      <option :value="option.value" x-text="option.label"></option>
                    </template>
                  </select>
                </div>
              `;
            }
          
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
    console.log(`☑️ FilterService: toggleMultiSelectOption called - field: ${field}, option: ${option}, checked: ${checked}`);
    if (!appContext) {
      console.error(`❌ FilterService: No appContext provided to toggleMultiSelectOption`);
      return;
    }

    const filterState = appContext[stateVariable];
    if (!filterState) {
      console.error(`❌ FilterService: No filterState found for ${stateVariable}`);
      return;
    }

    if (!filterState.filters[field]) {
      console.log(`🔧 FilterService: Initializing empty array for ${field}`);
      filterState.filters[field] = [];
    }

    if (checked) {
      if (!filterState.filters[field].includes(option)) {
        filterState.filters[field].push(option);
        console.log(`✅ FilterService: Added ${option} to ${field}. New array:`, filterState.filters[field]);
      }
    } else {
      filterState.filters[field] = filterState.filters[field].filter(item => item !== option);
      console.log(`❌ FilterService: Removed ${option} from ${field}. New array:`, filterState.filters[field]);
    }
  }

  buildFilterQueryParams(tableName, additionalParams = {}, appContext) {
    console.log(`🔍 FilterService: Building query params for ${tableName}`);
    const filters = appContext && appContext.grapheneFilterState ? appContext.grapheneFilterState.filters : {};
    console.log(`🔍 FilterService: Current filter state:`, filters);

    if (!filters) {
      console.log(`⚠️ FilterService: No filters found, returning base params`);
      return additionalParams;
    }

    const params = { ...additionalParams };

    // Add filters as JSON string
    const activeFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        activeFilters[key] = value;
        console.log(`✅ FilterService: Added array filter ${key}:`, value);
      } else if (typeof value === 'object' && value !== null) {
        const hasValues = Object.values(value).some(v => v !== null && v !== '');
        if (hasValues) {
          activeFilters[key] = value;
          console.log(`✅ FilterService: Added object filter ${key}:`, value);
        }
      } else if (value !== null && value !== '') {
        activeFilters[key] = value;
        console.log(`✅ FilterService: Added filter ${key}:`, value);
      }
    });

    if (Object.keys(activeFilters).length > 0) {
      params.filters = JSON.stringify(activeFilters);
      console.log(`🎯 FilterService: Final params with filters:`, params);
    } else {
      console.log(`📭 FilterService: No active filters, returning base params`);
    }

    return params;
  }

  applyFilters(appContext) {
    console.log(`🔄 FilterService: Applying filters, reloading data...`);
    if (appContext && appContext.loadGrapheneRecords) {
      appContext.loadGrapheneRecords();
    } else {
      console.error(`❌ FilterService: No loadGrapheneRecords method found in appContext`);
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