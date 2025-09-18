/**
 * RouterService - Client-side routing for data pages
 * 
 * Handles hash-based routing for navigating to dedicated data pages
 * URL pattern: #/data/{type}/{identifier}
 * 
 * Examples:
 * - #/data/graphene/MRa2024-001
 * - #/data/biochar/MB2967A
 * - #/data/compound-batch/CB-2024-15
 */

class RouterService {
  constructor() {
    this.currentRoute = null;
    this.routeChangeListeners = [];
    this.init();
  }

  /**
   * Initialize the router
   */
  init() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRouteChange());
    
    // Handle initial route
    this.handleRouteChange();
    
    // RouterService initialized - reduced logging
  }

  /**
   * Handle route changes
   */
  handleRouteChange() {
    const newRoute = this.parseRoute();
    
    // Only process data page routes - ignore normal tab navigation
    if (!newRoute.isDataPage && !this.isOnDataPage()) {
      return;
    }
    
    // Only process if route actually changed
    if (this.routeEquals(newRoute, this.currentRoute)) {
      return;
    }

    const previousRoute = this.currentRoute;
    this.currentRoute = newRoute;

    // Route changed - using debug logging only
    window.logger?.router(`Route changed: ${previousRoute?.type || 'none'} -> ${newRoute.type}`, {
      from: previousRoute?.fullPath,
      to: newRoute.fullPath
    });

    // Only notify listeners for data page routes
    if (newRoute.isDataPage || (previousRoute && previousRoute.isDataPage)) {
      this.routeChangeListeners.forEach(listener => {
        try {
          listener(newRoute, previousRoute);
        } catch (error) {
          console.error('Route change listener error:', error);
        }
      });
    }
  }

  /**
   * Check if a hash represents a data page route
   * @param {string} hash - URL hash
   * @returns {boolean}
   */
  isDataPageRoute(hash) {
    if (!hash || hash === '#') return false;
    const parts = hash.slice(1).split('/');
    
    // Check for malformed data page routes
    if (parts[1] === 'data' && parts.length >= 4) {
      const identifier = parts[3];
      // Reject malformed identifiers
      if (identifier === 'undefined' || identifier === 'null' || identifier === '') {
        console.warn('RouterService: Detected malformed data page route with invalid identifier:', {
          hash,
          parts,
          identifier
        });
        return false;
      }
      return true;
    }
    
    return false;
  }

  /**
   * Parse the current URL hash into route components
   * @returns {Object} Route object with type, identifier, and other properties
   */
  parseRoute() {
    const hash = window.location.hash;
    const currentPath = window.location.pathname;
    
    // Check for malformed URLs with /undefined path
    if (currentPath.includes('/undefined')) {
      console.warn('RouterService: Detected malformed URL with /undefined path:', {
        currentPath,
        hash,
        fullUrl: window.location.href
      });
      // Treat as home route to trigger cleanup
      return { type: 'home', identifier: null, isDataPage: false, malformed: true };
    }
    
    // No hash or empty hash
    if (!hash || hash === '#') {
      return { type: 'home', identifier: null, isDataPage: false };
    }

    // Remove # and split by /
    const parts = hash.slice(1).split('/');
    
    // Check if it's a data page route: /data/{type}/{identifier}
    if (this.isDataPageRoute(hash)) {
      const identifier = parts[3];
      
      // Double-check for malformed identifiers
      if (identifier === 'undefined' || identifier === 'null' || identifier === '') {
        console.error('RouterService: Malformed data page route detected during parsing:', {
          hash,
          parts,
          identifier
        });
        // Return home route instead of malformed data page
        return { type: 'home', identifier: null, isDataPage: false, malformed: true };
      }
      
      const route = {
        type: parts[2],
        identifier: identifier,
        isDataPage: true,
        fullPath: parts.join('/'),
        params: this.parseParams(parts.slice(4))
      };
      return route;
    }

    // For non-data page routes (normal tab navigation), return minimal info
    // This prevents RouterService from interfering with normal navigation
    return {
      type: parts[0] || 'home',
      identifier: null,
      isDataPage: false,
      fullPath: parts.join('/'),
      params: {}
    };
  }

  /**
   * Parse additional URL parameters
   * @param {Array} parts - URL parts after the main route
   * @returns {Object} Parameters object
   */
  parseParams(parts) {
    const params = {};
    
    for (let i = 0; i < parts.length; i += 2) {
      if (parts[i] && parts[i + 1]) {
        params[parts[i]] = decodeURIComponent(parts[i + 1]);
      }
    }
    
    return params;
  }

  /**
   * Compare two routes for equality
   * @param {Object} route1 
   * @param {Object} route2 
   * @returns {boolean}
   */
  routeEquals(route1, route2) {
    if (!route1 || !route2) return false;
    return route1.type === route2.type && 
           route1.identifier === route2.identifier &&
           route1.isDataPage === route2.isDataPage;
  }

  /**
   * Navigate to a data page
   * @param {string} type - Data type (graphene, biochar, etc.)
   * @param {string} identifier - Experiment/batch identifier
   * @param {Object} params - Optional parameters
   */
  navigateToDataPage(type, identifier, params = {}) {
    // Enhanced validation to prevent malformed URLs
    if (!type || !identifier || 
        identifier === 'undefined' || identifier === 'null' || 
        identifier === '' || identifier.trim() === '') {
      console.error('navigateToDataPage requires valid type and identifier', {
        type,
        identifier,
        identifierType: typeof identifier,
        params
      });
      console.warn('Attempted navigation with invalid identifier prevented');
      return;
    }

    // Additional validation for common problematic values
    const stringIdentifier = String(identifier).trim();
    if (stringIdentifier === 'undefined' || stringIdentifier === 'null' || stringIdentifier === '') {
      console.error('navigateToDataPage: identifier resolves to invalid value', {
        originalIdentifier: identifier,
        stringIdentifier,
        type
      });
      return;
    }

    console.log('RouterService: navigateToDataPage called', {
      type,
      identifier: stringIdentifier,
      params
    });

    // Build URL with optional parameters
    let url = `#/data/${type}/${encodeURIComponent(stringIdentifier)}`;
    
    // Add parameters
    const paramPairs = Object.entries(params).map(([key, value]) => 
      `${key}/${encodeURIComponent(value)}`
    );
    
    if (paramPairs.length > 0) {
      url += '/' + paramPairs.join('/');
    }

    console.log('RouterService: navigating to URL:', url);
    window.location.hash = url;
  }

  /**
   * Navigate to home/dashboard
   */
  navigateToHome() {
    window.location.hash = '#';
  }

  /**
   * Navigate to a specific tab
   * @param {string} tabName - Tab name
   */
  navigateToTab(tabName) {
    window.location.hash = `#${tabName}`;
  }

  /**
   * Go back to previous page
   */
  goBack() {
    window.history.back();
  }

  /**
   * Add a route change listener
   * @param {Function} listener - Function to call on route change
   */
  addRouteChangeListener(listener) {
    this.routeChangeListeners.push(listener);
  }

  /**
   * Remove a route change listener
   * @param {Function} listener - Function to remove
   */
  removeRouteChangeListener(listener) {
    const index = this.routeChangeListeners.indexOf(listener);
    if (index > -1) {
      this.routeChangeListeners.splice(index, 1);
    }
  }

  /**
   * Get current route
   * @returns {Object} Current route object
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * Check if currently on a data page
   * @returns {boolean}
   */
  isOnDataPage() {
    return this.currentRoute && this.currentRoute.isDataPage;
  }

  /**
   * Get data page breadcrumb items
   * @returns {Array} Breadcrumb items
   */
  getBreadcrumbs() {
    if (!this.isOnDataPage()) {
      return [{ label: 'Home', url: '#' }];
    }

    const { type, identifier } = this.currentRoute;
    const typeLabel = this.getTypeLabel(type);

    return [
      { label: 'Home', url: '#' },
      { label: 'Production', url: '#' },
      { label: typeLabel, url: `#${this.getTabForType(type)}` },
      { label: identifier, url: null, isActive: true }
    ];
  }

  /**
   * Get human-readable label for data type
   * @param {string} type - Data type
   * @returns {string} Display label
   */
  getTypeLabel(type) {
    const labels = {
      'graphene': 'Graphene',
      'biochar': 'Biochar',
      'compound-batch': 'Compound Batches',
      'micronization': 'Micronization',
      'shipment': 'Shipments'
    };
    return labels[type] || type;
  }

  /**
   * Get tab name for data type
   * @param {string} type - Data type
   * @returns {string} Tab name
   */
  getTabForType(type) {
    const tabs = {
      'graphene': 'graphene',
      'biochar': 'biochar',
      'compound-batch': 'compound-batches',
      'micronization': 'micronization',
      'shipment': 'shipments'
    };
    return tabs[type] || type;
  }

  /**
   * Create a data page URL
   * @param {string} type - Data type
   * @param {string} identifier - Identifier
   * @returns {string} URL hash
   */
  createDataPageUrl(type, identifier) {
    return `#/data/${type}/${encodeURIComponent(identifier)}`;
  }

  /**
   * Check if a given identifier matches current page
   * @param {string} type - Data type
   * @param {string} identifier - Identifier
   * @returns {boolean}
   */
  isCurrentPage(type, identifier) {
    return this.currentRoute && 
           this.currentRoute.type === type && 
           this.currentRoute.identifier === identifier;
  }
}

// Create global instance
const routerService = new RouterService();

// Make globally available
window.RouterService = RouterService;
window.routerService = routerService;

export default routerService;