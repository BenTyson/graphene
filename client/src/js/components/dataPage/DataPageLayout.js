/**
 * DataPageLayout - Universal layout container for data pages
 * 
 * Provides consistent layout structure for all data types:
 * - Header with breadcrumbs and actions
 * - Summary metrics card  
 * - Navigation tabs for long pages
 * - Content sections
 * - Footer with audit trail
 */

/**
 * Create the main data page layout
 * @param {Object} config - Page configuration
 * @param {string} config.type - Data type (graphene, biochar, etc.)
 * @param {string} config.identifier - Experiment/batch identifier
 * @param {Object} config.data - Full data object
 * @param {Array} config.sections - Section configuration array
 * @param {Object} config.actions - Available actions
 * @returns {string} HTML string for the data page
 */
function createDataPageLayout(config) {
  const { type, identifier, data, sections = [], actions = {} } = config;
  
  if (!type || !identifier) {
    return createDataPageError('Invalid page configuration', 'Missing type or identifier');
  }

  if (!data) {
    return createDataPageLoading(type, identifier);
  }

  const instanceId = `datapage_${type}_${identifier}_${Date.now()}`;
  
  return `
    <div class="data-page-layout" 
         data-type="${type}" 
         data-identifier="${identifier}"
         data-instance="${instanceId}">
      
      <!-- Data Page Header -->
      <div>
        ${createDataPageHeader(type, identifier)}
      </div>
      
      <!-- Data Page Content Sections -->
      <div class="data-page-content space-y-8">
        ${sections.map(section => createDataPageSection(section, data, type)).join('')}
      </div>
      
    </div>
  `;
}

/**
 * Create a data page section
 * @param {Object} sectionConfig - Section configuration
 * @param {Object} data - Data object
 * @param {string} type - Data type
 * @returns {string} HTML for the section
 */
function createDataPageSection(sectionConfig, data, type) {
  const { id, title, component, visible = true, collapsible = false } = sectionConfig;
  
  if (!visible) {
    return '';
  }

  const sectionId = `section_${id}`;
  
  return `
    <div class="data-page-section bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6" 
         data-section="${id}">
      
      <!-- Section Header -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900">${title}</h2>
      </div>
      
      <!-- Section Content -->
      <div class="section-content">
        ${createBasicSectionContent(id, data, type)}
      </div>
      
    </div>
  `;
}

/**
 * Create basic section content as fallback
 * @param {string} sectionId - Section ID
 * @param {Object} data - Data object
 * @param {string} type - Data type
 * @returns {string} Section content HTML
 */
function createBasicSectionContent(sectionId, data, type) {
  try {
    if (window.getSectionContent) {
      return window.getSectionContent(sectionId, data, type);
    }
    return `<div class="text-center py-8 text-gray-500">Section content for ${sectionId} loading...</div>`;
  } catch (error) {
    console.error(`Error creating section content for ${sectionId}:`, error);
    return `<div class="text-center py-8 text-red-500">Error loading ${sectionId} section</div>`;
  }
}

/**
 * Create loading state for data page
 * @param {string} type - Data type
 * @param {string} identifier - Identifier
 * @returns {string} Loading HTML
 */
function createDataPageLoading(type, identifier) {
  return `
    <div class="data-page-loading min-h-screen bg-gray-50">
      <!-- Loading Header -->
      <div class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="max-w-7xl mx-auto">
          <div class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <span>Home</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <span>Production</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <div class="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
          <div class="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
      </div>
      
      <!-- Loading Content -->
      <div class="max-w-7xl mx-auto px-6 py-8">
        <!-- Loading Summary Card -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-3">
              <div class="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div class="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div class="space-y-3">
              <div class="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div class="h-6 bg-gray-200 rounded w-28 animate-pulse"></div>
            </div>
            <div class="space-y-3">
              <div class="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div class="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <!-- Loading Sections -->
        ${Array.from({ length: 3 }, (_, i) => `
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div class="h-6 bg-gray-200 rounded w-40 animate-pulse mb-4"></div>
            <div class="space-y-3">
              <div class="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div class="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        `).join('')}
        
        <div class="text-center text-gray-500 mt-8">
          <div class="inline-flex items-center space-x-2">
            <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span>Loading ${identifier}...</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Create data page header with breadcrumbs
 * @param {string} type - Data type
 * @param {string} identifier - Identifier
 * @returns {string} Header HTML
 */
function createDataPageHeader(type, identifier) {
  const breadcrumbs = getDataPageBreadcrumbs(type, identifier);
  return `
    <div class="bg-white border-b border-gray-200 px-6 py-4" x-data="{}">
      <nav class="flex" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-4">
          ${breadcrumbs.map((crumb, index) => `
            <li class="flex">
              ${index > 0 ? '<svg class="flex-shrink-0 h-5 w-5 text-gray-400 mr-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>' : ''}
              ${crumb.href ? `
                <a href="${crumb.href}" ${crumb.action ? `@click.prevent="${crumb.action}"` : ''} class="text-gray-500 hover:text-gray-700 text-sm font-medium">
                  ${crumb.label}
                </a>
              ` : `
                <span class="text-gray-900 text-sm font-medium">${crumb.label}</span>
              `}
            </li>
          `).join('')}
        </ol>
      </nav>
      <div class="mt-4">
        <h1 class="text-2xl font-bold text-gray-900">${identifier}</h1>
        <p class="mt-1 text-sm text-gray-500">${getDataPageSubtitle(type)}</p>
      </div>
    </div>
  `;
}

/**
 * Get breadcrumbs for data page
 * @param {string} type - Data type
 * @param {string} identifier - Identifier
 * @returns {Array} Breadcrumbs array
 */
function getDataPageBreadcrumbs(type, identifier) {
  const breadcrumbs = [
    { label: 'Home', href: '#' },
    { label: 'Production', href: null }
  ];
  
  if (type === 'compound-batch') {
    breadcrumbs.push({ label: 'Compound Batches', href: '#', action: 'window.navigateToCompoundBatches()' });
    breadcrumbs.push({ label: identifier, href: null });
  } else if (type === 'graphene') {
    breadcrumbs.push({ label: 'Graphene', href: '#', action: 'window.navigateToGraphene()' });
    breadcrumbs.push({ label: identifier, href: null });
  } else if (type === 'biochar') {
    breadcrumbs.push({ label: 'Biochar', href: '#', action: 'window.navigateToBiochar()' });
    breadcrumbs.push({ label: identifier, href: null });
  }
  
  return breadcrumbs;
}

/**
 * Get page subtitle based on type
 * @param {string} type - Data type
 * @returns {string} Subtitle
 */
function getDataPageSubtitle(type) {
  if (type === 'compound-batch') {
    return 'Compound Batch Details';
  } else if (type === 'graphene') {
    return 'Graphene Experiment Details';
  } else if (type === 'biochar') {
    return 'Biochar Experiment Details';
  }
  return 'Details';
}

/**
 * Create error state for data page
 * @param {string} title - Error title
 * @param {string} message - Error message
 * @returns {string} Error HTML
 */
function createDataPageError(title, message) {
  return `
    <div class="data-page-error min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <div class="text-center">
          <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">${title}</h1>
          <p class="text-gray-600 mb-6">${message}</p>
          <div class="space-x-4">
            <button onclick="window.history.back()" 
                    class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
              Go Back
            </button>
            <button onclick="window.location.hash = '#'" 
                    class="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Data page Alpine.js controller
 * @param {string} type - Data type
 * @param {string} identifier - Identifier
 * @returns {Object} Alpine.js data object
 */
function dataPageController(type, identifier) {
  return {
    type: type,
    identifier: identifier,
    data: null,
    loading: true,
    error: null,
    activeSection: null,
    
    init() {
      // Initializing data page - reduced logging
      window.logger?.debug(`Initializing data page: ${type}/${identifier}`);
      this.loadData();
    },
    
    async loadData() {
      try {
        this.loading = true;
        this.error = null;
        
        // Fetch data from API
        const response = await fetch(`/api/data/${this.type}/${this.identifier}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load ${this.identifier}: ${response.statusText}`);
        }
        
        this.data = await response.json();
        // Data loaded successfully - reduced logging
        window.logger?.debug('Data loaded for data page', { type: this.type, identifier: this.identifier });
        
      } catch (error) {
        window.logger?.error('Failed to load data page:', error.message);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    
    shouldShowNavigation() {
      // Show navigation if page has multiple sections
      return this.data && this.getSections().length > 3;
    },
    
    shouldShowSection(sectionId) {
      // Section visibility logic
      return true;
    },
    
    getSections() {
      // Return sections based on data type
      const sectionConfigs = this.getSectionConfigs();
      return sectionConfigs[this.type] || [];
    },
    
    getSectionConfigs() {
      return {
        graphene: [
          { id: 'process', title: 'Process Details', component: 'ProcessSection' },
          { id: 'source', title: 'Source Materials', component: 'SourceSection' },
          { id: 'tests', title: 'Test Results', component: 'TestSection' },
          { id: 'reports', title: 'Reports', component: 'ReportsSection' },
          { id: 'shipments', title: 'Shipments', component: 'ShipmentsSection' },
          { id: 'related', title: 'Related Experiments', component: 'RelatedSection' }
        ],
        biochar: [
          { id: 'process', title: 'Process Parameters', component: 'ProcessSection' },
          { id: 'materials', title: 'Source Materials', component: 'MaterialsSection' },
          { id: 'properties', title: 'Physical Properties', component: 'PropertiesSection' },
          { id: 'downstream', title: 'Downstream Usage', component: 'DownstreamSection' }
        ],
        'compound-batch': [
          { id: 'process', title: 'Batch Details', component: 'ProcessSection' },
          { id: 'constituents', title: 'Constituent Experiments', component: 'ConstituentsSection' },
          { id: 'tests', title: 'Test Results', component: 'TestSection' },
          { id: 'micronizations', title: 'Micronizations', component: 'MicronizationsSection' },
          { id: 'shipments', title: 'Shipments', component: 'ShipmentsSection' },
          { id: 'reports', title: 'Reports & Documents', component: 'ReportsSection' }
        ]
      };
    },
    
    getDataPageHeader() {
      const breadcrumbs = this.getBreadcrumbs();
      return `
        <div class="bg-white border-b border-gray-200 px-6 py-4">
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-4">
              ${breadcrumbs.map((crumb, index) => `
                <li class="flex">
                  ${index > 0 ? '<svg class="flex-shrink-0 h-5 w-5 text-gray-400 mr-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>' : ''}
                  ${crumb.href ? `
                    <a href="${crumb.href}" ${crumb.onclick ? `onclick="${crumb.onclick}"` : ''} class="text-gray-500 hover:text-gray-700 text-sm font-medium">
                      ${crumb.label}
                    </a>
                  ` : `
                    <span class="text-gray-900 text-sm font-medium">${crumb.label}</span>
                  `}
                </li>
              `).join('')}
            </ol>
          </nav>
          <div class="mt-4">
            <h1 class="text-2xl font-bold text-gray-900">${this.identifier}</h1>
            <p class="mt-1 text-sm text-gray-500">${this.getPageSubtitle()}</p>
          </div>
        </div>
      `;
    },
    
    getBreadcrumbs() {
      const breadcrumbs = [
        { label: 'Home', href: '#' },
        { label: 'Production', href: null }
      ];
      
      if (this.type === 'compound-batch') {
        breadcrumbs.push({ label: 'Compound Batches', href: 'javascript:void(0)', onclick: 'navigateToCompoundBatches()' });
        breadcrumbs.push({ label: this.identifier, href: null });
      } else if (this.type === 'graphene') {
        breadcrumbs.push({ label: 'Graphene', href: 'javascript:void(0)', onclick: 'navigateToGraphene()' });
        breadcrumbs.push({ label: this.identifier, href: null });
      } else if (this.type === 'biochar') {
        breadcrumbs.push({ label: 'Biochar', href: 'javascript:void(0)', onclick: 'navigateToBiochar()' });
        breadcrumbs.push({ label: this.identifier, href: null });
      }
      
      return breadcrumbs;
    },
    
    getPageSubtitle() {
      if (this.type === 'compound-batch') {
        return 'Compound Batch Details';
      } else if (this.type === 'graphene') {
        return 'Graphene Experiment Details';
      } else if (this.type === 'biochar') {
        return 'Biochar Experiment Details';
      }
      return 'Details';
    },
    
    getDataPageSummary() {
      return '<div class="text-center py-4 text-gray-500">Summary section coming soon...</div>';
    },
    
    getDataPageNavigation() {
      return '<div class="text-center py-2 text-gray-500">Navigation coming soon...</div>';
    },
    
    getDataPageSectionContent(sectionId, component) {
      return '<div class="text-center py-4 text-gray-500">Section content loading...</div>';
    },
    
    getDataPageFooter() {
      return '<div class="text-center py-4 text-gray-500 text-xs">Footer coming soon...</div>';
    }
  };
}

// Make functions globally available
window.createDataPageLayout = createDataPageLayout;
window.createDataPageSection = createDataPageSection;
window.createDataPageLoading = createDataPageLoading;
window.createDataPageError = createDataPageError;
window.createDataPageHeader = createDataPageHeader;

export { 
  createDataPageLayout, 
  createDataPageSection, 
  createDataPageLoading, 
  createDataPageError,
  createDataPageHeader
};