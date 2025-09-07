/**
 * Card Section Component
 * Collapsible sections for organizing card content
 * Includes animations and responsive behavior
 */

/**
 * Create a collapsible card section
 * @param {Object} config - Section configuration
 * @param {string} config.title - Section title
 * @param {string} config.icon - Icon SVG HTML
 * @param {string} config.content - Section content HTML
 * @param {string} config.badge - Optional badge text (e.g., count)
 * @param {boolean} config.defaultExpanded - Whether section starts expanded
 * @param {string} config.className - Additional CSS classes
 * @returns {string} HTML string for the section
 */
function createCardSection(config) {
  const { 
    title, 
    icon = '', 
    content, 
    badge = null, 
    defaultExpanded = false,
    className = ''
  } = config;
  
  // Generate unique section ID - sanitize for valid JavaScript identifier
  const sectionId = `section_${title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}`;
  
  return `
    <div class="data-card-section border-t border-gray-100 ${className}"
         x-data="{ expanded_${sectionId}: ${defaultExpanded} }">
      
      <!-- Section Header (Clickable) -->
      <button class="data-card-section-header w-full px-4 py-3 md:px-6 md:py-4 
                     flex items-center justify-between hover:bg-gray-50 transition-colors"
              @click="expanded_${sectionId} = !expanded_${sectionId}"
              :aria-expanded="expanded_${sectionId}">
        
        <div class="flex items-center space-x-3">
          <!-- Icon -->
          ${icon ? `<span class="text-gray-400">${icon}</span>` : ''}
          
          <!-- Title -->
          <h3 class="text-sm md:text-base font-semibold text-gray-900">
            ${title}
          </h3>
          
          <!-- Badge -->
          ${badge ? `
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              ${badge}
            </span>
          ` : ''}
        </div>
        
        <!-- Expand/Collapse Icon -->
        <svg class="w-5 h-5 text-gray-400 transform transition-transform duration-200"
             :class="{ 'rotate-180': expanded_${sectionId} }"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      
      <!-- Section Content (Collapsible) -->
      <div class="data-card-section-content"
           x-show="expanded_${sectionId}"
           x-transition:enter="transition ease-out duration-200"
           x-transition:enter-start="opacity-0 -translate-y-2"
           x-transition:enter-end="opacity-100 translate-y-0"
           x-transition:leave="transition ease-in duration-150"
           x-transition:leave-start="opacity-100 translate-y-0"
           x-transition:leave-end="opacity-0 -translate-y-2">
        ${content}
      </div>
    </div>
  `;
}

/**
 * Create a group of related sections (e.g., all test types)
 */
function createSectionGroup(config) {
  const { title, sections = [] } = config;
  
  return `
    <div class="data-card-section-group">
      ${title ? `
        <div class="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <h3 class="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            ${title}
          </h3>
        </div>
      ` : ''}
      
      ${sections.map(section => createCardSection(section)).join('')}
    </div>
  `;
}

/**
 * Create an empty state for sections with no data
 */
function createEmptyState(config) {
  const { 
    message = 'No data available', 
    icon = null,
    actionText = null,
    actionHandler = null 
  } = config;
  
  return `
    <div class="p-8 text-center">
      ${icon ? `
        <div class="mb-4 flex justify-center">
          <span class="text-gray-300">${icon}</span>
        </div>
      ` : ''}
      
      <p class="text-sm text-gray-500">${message}</p>
      
      ${actionText ? `
        <button class="mt-4 px-4 py-2 text-sm text-link hover:text-link-hover transition-colors"
                ${actionHandler ? `@click="${actionHandler}"` : ''}>
          ${actionText}
        </button>
      ` : ''}
    </div>
  `;
}

/**
 * Create a loading skeleton for section content
 */
function createSectionSkeleton() {
  return `
    <div class="p-4 animate-pulse">
      <div class="space-y-3">
        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        <div class="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  `;
}

/**
 * Create a stat item for use within sections
 */
function createStatItem(config) {
  const { label, value, unit = '', trend = null } = config;
  
  return `
    <div class="flex justify-between items-center py-2">
      <span class="text-sm text-gray-600">${label}</span>
      <div class="flex items-center space-x-2">
        <span class="font-mono font-semibold text-gray-900">
          ${value}${unit ? ` ${unit}` : ''}
        </span>
        ${trend ? `
          <span class="text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}">
            ${trend > 0 ? '↑' : '↓'} ${Math.abs(trend)}%
          </span>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Create a list item for use within sections
 */
function createListItem(config) {
  const { 
    title, 
    subtitle = null, 
    badge = null, 
    action = null,
    icon = null 
  } = config;
  
  return `
    <div class="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div class="flex items-center space-x-3">
        ${icon ? `<span class="text-gray-400">${icon}</span>` : ''}
        
        <div>
          <div class="text-sm font-medium text-gray-900">${title}</div>
          ${subtitle ? `<div class="text-xs text-gray-500">${subtitle}</div>` : ''}
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        ${badge ? `
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            ${badge}
          </span>
        ` : ''}
        
        ${action ? action : ''}
      </div>
    </div>
  `;
}

/**
 * Create a grid of cards within a section
 */
function createCardGrid(items = [], columns = 2) {
  const colClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4'
  }[columns] || 'grid-cols-2';
  
  return `
    <div class="p-4">
      <div class="grid ${colClass} gap-3">
        ${items.map(item => `
          <div class="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
            ${item}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}