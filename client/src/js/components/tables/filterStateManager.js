/**
 * Filter State Management
 * Provides Alpine.js methods for managing filter state and API integration
 */

import { getFilterFieldHtml } from './filterHelper.js';

/**
 * Initialize filter state management for Alpine.js
 * @param {string} tableName - Name of the table being filtered
 * @returns {object} Alpine.js data and methods
 */
export function initializeFilterState(tableName) {
  return {
    // Filter state
    filterConfigs: {},
    filterOptions: {},
    activeFilters: {},
    
    // UI state
    filterLoading: false,
    filterError: null,
    
    // Initialize filter system
    async initFilters() {
      this.filterLoading = true;
      this.filterError = null;
      
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
        this.initializeFilterValues(tableName);
        
      } catch (error) {
        console.error('Error initializing filters:', error);
        this.filterError = error.message;
      } finally {
        this.filterLoading = false;
      }
    },
    
    // Load dynamic filter options from API
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
    },
    
    // Initialize filter values with empty state
    initializeFilterValues(tableName) {
      const config = this.filterConfigs[tableName];
      if (!config || !config.filters) return;
      
      this.activeFilters[tableName] = {};
      
      config.filters.forEach(filter => {
        switch (filter.type) {
          case 'text':
          case 'select':
            this.activeFilters[tableName][filter.field] = filter.multiple ? [] : '';
            break;
          case 'multiSelect':
            this.activeFilters[tableName][filter.field] = [];
            break;
          case 'dateRange':
            this.activeFilters[tableName][filter.field] = { from: '', to: '' };
            break;
          case 'numericRange':
            this.activeFilters[tableName][filter.field] = { min: null, max: null };
            break;
          case 'boolean':
            this.activeFilters[tableName][filter.field] = '';
            break;
        }
      });
    },
    
    // Generate filter fields HTML dynamically
    generateFilterFields(tableName, filterStateVariable, onFilterChange) {
      const config = this.filterConfigs[tableName];
      if (!config || !config.filters) {
        return '<div class="text-xs text-gray-500">No filters available</div>';
      }
      
      return config.filters
        .map(filterConfig => getFilterFieldHtml(filterConfig, tableName, filterStateVariable, onFilterChange))
        .join('');
    },
    
    // Get count of active filters
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
    },
    
    // Clear all filters
    clearAllFilters(tableName) {
      this.initializeFilterValues(tableName);
    },
    
    // Toggle multi-select option
    toggleMultiSelectOption(field, option, checked, stateVariable) {
      const filterState = this[stateVariable];
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
    },
    
    // Build API query parameters from filter state
    buildFilterQueryParams(tableName, additionalParams = {}) {
      const filters = this.activeFilters[tableName];
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
    },
    
    // Apply filters and reload data
    async applyFilters(tableName, loadDataMethod) {
      if (typeof loadDataMethod === 'string') {
        // If method name is passed as string, call it on this context
        if (this[loadDataMethod]) {
          await this[loadDataMethod]();
        }
      } else if (typeof loadDataMethod === 'function') {
        // If method is passed directly, call it
        await loadDataMethod();
      }
    },
    
    // Get filter summary text
    getFilterSummary(tableName) {
      const activeCount = this.getActiveFilterCount({ filters: this.activeFilters[tableName] });
      if (activeCount === 0) {
        return 'No filters applied';
      }
      return `${activeCount} filter${activeCount > 1 ? 's' : ''} applied`;
    },
    
    // Check if specific filter is active
    isFilterActive(tableName, fieldName) {
      const filters = this.activeFilters[tableName];
      if (!filters || !filters[fieldName]) return false;
      
      const value = filters[fieldName];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== null && v !== '');
      }
      return value !== null && value !== '';
    },
    
    // Reset specific filter
    resetFilter(tableName, fieldName, onFilterChange) {
      const config = this.filterConfigs[tableName];
      const filterConfig = config?.filters?.find(f => f.field === fieldName);
      
      if (!filterConfig) return;
      
      switch (filterConfig.type) {
        case 'text':
        case 'select':
          this.activeFilters[tableName][fieldName] = filterConfig.multiple ? [] : '';
          break;
        case 'multiSelect':
          this.activeFilters[tableName][fieldName] = [];
          break;
        case 'dateRange':
          this.activeFilters[tableName][fieldName] = { from: '', to: '' };
          break;
        case 'numericRange':
          this.activeFilters[tableName][fieldName] = { min: null, max: null };
          break;
        case 'boolean':
          this.activeFilters[tableName][fieldName] = '';
          break;
      }
      
      if (onFilterChange) {
        if (typeof onFilterChange === 'string') {
          if (this[onFilterChange]) {
            this[onFilterChange]();
          }
        } else if (typeof onFilterChange === 'function') {
          onFilterChange();
        }
      }
    }
  };
}

/**
 * Mixin for existing Alpine.js components to add filtering capabilities
 * @param {string} tableName - Name of the table
 * @param {string} loadDataMethodName - Name of the method to reload data
 * @returns {object} Methods to merge into existing Alpine.js component
 */
export function filterMixin(tableName, loadDataMethodName = 'loadData') {
  const filterState = initializeFilterState(tableName);
  
  return {
    ...filterState,
    
    // Enhanced data loading that includes filter parameters
    async loadFilteredData(baseParams = {}) {
      const params = this.buildFilterQueryParams(tableName, baseParams);
      
      try {
        const response = await fetch(`/api/${tableName}?${new URLSearchParams(params)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Handle both old format (direct array) and new format (with metadata)
        if (result.success !== undefined) {
          // New format with metadata
          return {
            data: result.data || [],
            meta: result.meta || {}
          };
        } else {
          // Old format - direct array
          return {
            data: Array.isArray(result) ? result : [],
            meta: {}
          };
        }
      } catch (error) {
        console.error(`Error loading ${tableName} data:`, error);
        throw error;
      }
    },
    
    // Wrapper for the main load data method that applies filters
    async applyFilters() {
      await this.applyFilters(tableName, loadDataMethodName);
    }
  };
}