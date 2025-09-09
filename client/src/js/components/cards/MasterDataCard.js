/**
 * Master Data Card Component
 * A versatile, responsive data card for displaying experiment data
 * Supports multiple display modes (popup/inline) and configurable features
 */

/**
 * Format date for display in cards
 */
function formatCardDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return 'N/A';
  }
}


/**
 * Create a master data card with configurable options
 * @param {Object} options - Card configuration options
 * @param {string} options.displayMode - 'popup' or 'inline'
 * @param {boolean} options.editMode - Enable/disable edit functionality
 * @param {string} options.compactMode - 'auto', true, or false
 * @param {Object} options.data - Experiment data to display
 * @param {Array|string} options.sections - Which sections to show ('all' or array)
 * @param {string} options.preset - Use a preset configuration
 * @param {string} options.instanceId - Unique ID for this card instance
 * @returns {string} HTML string for the card
 */
function createMasterDataCard(options = {}) {
  // Apply preset if specified
  const config = options.preset 
    ? { ...getCardConfig(options.preset), ...options }
    : { ...getDefaultConfig(), ...options };
  
  // Generate unique instance ID if not provided
  const instanceId = config.instanceId || `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Determine which sections to show based on data type
  let sections;
  if (config.data.isShipment) {
    // Shipment sections (material flow, locations, status)
    sections = config.sections === 'all' 
      ? ['metrics', 'source', 'destination', 'status']
      : config.sections || ['metrics', 'source', 'destination'];
  } else if (config.data.isCompoundBatch) {
    // Compound batch sections (no process details since they combine multiple processes)
    sections = config.sections === 'all' 
      ? ['constituents', 'micronization', 'tests', 'reports', 'shipments']
      : config.sections || ['metrics', 'constituents', 'tests'];
  } else {
    // Regular experiment sections
    sections = config.sections === 'all' 
      ? ['process', 'source', 'tests', 'reports', 'shipments', 'objectives', 'compoundBatches']
      : config.sections || ['metrics', 'tests'];
  }
  
  // Build card content
  const cardContent = `
    <div class="data-card ${config.editMode ? 'data-card-editable' : ''}" 
         data-instance-id="${instanceId}">
      
      <!-- Card Header -->
      ${createCardHeader({
        data: config.data,
        editMode: config.editMode,
        compactMode: config.compactMode,
        instanceId
      })}
      
      <!-- Hero Metrics -->
      ${sections.includes('metrics') ? createCardMetrics({
        data: config.data,
        compactMode: config.compactMode,
        editMode: config.editMode
      }) : ''}
      
      <!-- Collapsible Sections -->
      <div class="data-card-sections">
        ${sections.includes('process') ? createProcessSection(config) : ''}
        ${sections.includes('source') ? (config.data.isShipment ? createShipmentSourceSection(config) : createSourceSection(config)) : ''}
        ${sections.includes('destination') ? createDestinationSection(config) : ''}
        ${sections.includes('status') ? createStatusSection(config) : ''}
        ${sections.includes('constituents') ? createConstituentExperimentsSection(config) : ''}
        ${sections.includes('micronization') ? createMicronizationSection(config) : ''}
        ${sections.includes('tests') ? createTestsSection(config) : ''}
        ${sections.includes('reports') ? createReportsSection(config) : ''}
        ${sections.includes('shipments') ? createShipmentsSection(config) : ''}
        ${sections.includes('objectives') ? createObjectivesSection(config) : ''}
        ${sections.includes('compoundBatches') ? createCompoundBatchesSection(config) : ''}
      </div>
      
      <!-- Loading State -->
      <div class="data-card-loading hidden" x-show="cardLoading_${instanceId}">
        <div class="p-8 text-center">
          <div class="inline-block animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
      
      <!-- Error State -->
      <div class="data-card-error hidden" x-show="cardError_${instanceId}">
        <div class="p-4 bg-red-50 border border-red-200 rounded-lg m-4">
          <p class="text-sm text-red-800" x-text="cardError_${instanceId}"></p>
        </div>
      </div>
    </div>
  `;
  
  // Wrap in container based on display mode
  return createCardContainer({
    displayMode: config.displayMode,
    content: cardContent,
    instanceId,
    data: config.data
  });
}

/**
 * Get default configuration
 */
function getDefaultConfig() {
  return {
    displayMode: 'inline',
    editMode: false,
    compactMode: 'auto',
    sections: ['metrics', 'tests'],
    animations: 'subtle'
  };
}

/**
 * Create process details section
 */
function createProcessSection(config) {
  const { data } = config;
  
  return createCardSection({
    title: 'Process Details',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
    </svg>`,
    content: `
      <div class="p-4 space-y-6">
        
        <!-- Equipment & Setup -->
        <div class="border-b border-gray-100 pb-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Equipment & Setup</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Oven</label>
              <value class="font-mono text-sm text-gray-800">${data.oven || 'N/A'}</value>
            </div>
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Quantity</label>
              <value class="font-mono text-sm text-gray-800">${data.quantity || 'N/A'}${data.quantity ? ' g' : ''}</value>
            </div>
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Research Team</label>
              <value class="font-mono text-sm text-gray-800">${data.researchTeam || 'N/A'}</value>
            </div>
          </div>
          ${data.titleNote ? `
            <div class="mt-3">
              <div class="data-card-field">
                <label class="text-xs text-gray-500">Title Note</label>
                <value class="text-sm text-gray-800">${data.titleNote}</value>
              </div>
            </div>
          ` : ''}
        </div>
        
        <!-- Base Treatment -->
        <div class="border-b border-gray-100 pb-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Base Treatment</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Amount</label>
              <value class="font-mono text-sm text-gray-800">${data.baseAmount || 'N/A'}${data.baseAmount ? ' g' : ''}</value>
            </div>
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Type</label>
              <value class="font-mono text-sm text-gray-800">${data.baseType || 'N/A'}</value>
            </div>
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Concentration</label>
              <value class="font-mono text-sm text-gray-800">${data.baseConcentration || 'N/A'}${data.baseConcentration ? '%' : ''}</value>
            </div>
          </div>
          ${data.base2Type ? `
            <div class="mt-3 pt-3 border-t border-gray-50">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="data-card-field">
                  <label class="text-xs text-gray-500">Base 2 Amount</label>
                  <value class="font-mono text-sm text-gray-800">${data.base2Amount || 'N/A'}${data.base2Amount ? ' g' : ''}</value>
                </div>
                <div class="data-card-field">
                  <label class="text-xs text-gray-500">Base 2 Type</label>
                  <value class="font-mono text-sm text-gray-800">${data.base2Type}</value>
                </div>
                <div class="data-card-field">
                  <label class="text-xs text-gray-500">Base 2 Concentration</label>
                  <value class="font-mono text-sm text-gray-800">${data.base2Concentration || 'N/A'}${data.base2Concentration ? '%' : ''}</value>
                </div>
              </div>
            </div>
          ` : ''}
        </div>
        
        <!-- Grinding -->
        <div class="border-b border-gray-100 pb-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Grinding</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Method</label>
              <value class="font-mono text-sm text-gray-800">${data.grindingMethod || 'N/A'}</value>
            </div>
            <div class="data-card-field">
              <label class="text-xs text-gray-500"># Grinds</label>
              <value class="font-mono text-sm text-gray-800">${data.grindingCount || 'N/A'}</value>
            </div>
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Time</label>
              <value class="font-mono text-sm text-gray-800">${data.grindingTime || 'N/A'}${data.grindingTime ? ' min' : ''}</value>
            </div>
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Frequency</label>
              <value class="font-mono text-sm text-gray-800">${data.grindingFrequency || 'N/A'}${data.grindingFrequency ? ' Hz' : ''}</value>
            </div>
          </div>
        </div>
        
        <!-- Temperature -->
        <div class="border-b border-gray-100 pb-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Temperature</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Rate</label>
              <value class="font-mono text-sm text-gray-800">${data.tempRate || 'N/A'}${data.tempRate ? ' °C/min' : ''}</value>
            </div>
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Max Temp</label>
              <value class="font-mono text-sm text-gray-800">${data.tempMax || 'N/A'}${data.tempMax ? ' °C' : ''}</value>
            </div>
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Time</label>
              <value class="font-mono text-sm text-gray-800">${data.time || 'N/A'}${data.time ? ' h' : ''}</value>
            </div>
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Gas</label>
              <value class="font-mono text-sm text-gray-800">${data.gas || 'N/A'}</value>
            </div>
          </div>
        </div>
        
        <!-- Washing -->
        <div class="border-b border-gray-100 pb-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Washing</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Amount</label>
              <value class="font-mono text-sm text-gray-800">${data.washAmount || 'N/A'}${data.washAmount ? ' ml' : ''}</value>
            </div>
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Solution</label>
              <value class="font-mono text-sm text-gray-800">${data.washSolution || 'N/A'}</value>
            </div>
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Concentration</label>
              <value class="font-mono text-sm text-gray-800">${data.washConcentration || 'N/A'}${data.washConcentration ? '%' : ''}</value>
            </div>
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Water</label>
              <value class="font-mono text-sm text-gray-800">${data.washWater || 'N/A'}</value>
            </div>
          </div>
        </div>
        
        <!-- Drying -->
        <div class="border-b border-gray-100 pb-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Drying</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Temperature</label>
              <value class="font-mono text-sm text-gray-800">${data.dryingTemp || 'N/A'}${data.dryingTemp ? ' °C' : ''}</value>
            </div>
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Atmosphere</label>
              <value class="font-mono text-sm text-gray-800">${data.dryingAtmosphere || 'N/A'}</value>
            </div>
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Pressure</label>
              <value class="font-mono text-sm text-gray-800">${data.dryingPressure || 'N/A'}</value>
            </div>
          </div>
        </div>
        
        <!-- Results -->
        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Results</h4>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Volume</label>
              <value class="font-mono text-sm text-gray-800">${data.volumeMl || 'N/A'}${data.volumeMl ? ' ml' : ''}</value>
            </div>
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Output</label>
              <value class="font-mono text-sm text-gray-800">${data.output || 'N/A'}${data.output ? ' g' : ''}</value>
            </div>
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Density</label>
              <value class="font-mono text-sm text-gray-800">${data.density || 'N/A'}${data.density ? ' ml/g' : ''}</value>
            </div>
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Homogeneous</label>
              <value class="font-mono text-sm text-gray-800">${data.homogeneous === true ? 'Yes' : data.homogeneous === false ? 'No' : 'N/A'}</value>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Species</label>
              <value class="font-mono text-sm text-gray-800">${data.species || 'N/A'}</value>
            </div>
            <div class="data-card-field">
              <label class="text-xs text-gray-500">Appearance</label>
              <value class="text-sm text-gray-800">${Array.isArray(data.appearanceTags) ? data.appearanceTags.join(', ') : (data.appearanceTags || data.appearance || 'N/A')}</value>
            </div>
          </div>
        </div>
        
      </div>
    `,
    defaultExpanded: false
  });
}

/**
 * Create constituent experiments section for compound batches
 */
function createConstituentExperimentsSection(config) {
  const { data } = config;
  
  return createCardSection({
    title: 'Constituent Experiments',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10"></path>
    </svg>`,
    content: `
      <div class="p-4">
        ${data.experiments && data.experiments.length > 0 ? `
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div class="flex items-center justify-between mb-3">
              <div class="text-sm font-medium text-blue-900">${data.experiments.length} Individual Experiments</div>
              <div class="text-xs text-blue-700">Total: ${data.totalOutput}g</div>
            </div>
            
            <div class="space-y-2">
              ${data.experiments.map(exp => `
                <div class="bg-white rounded-lg p-3 border border-blue-100">
                  <div class="flex justify-between items-start mb-2">
                    <div class="font-mono text-sm font-semibold text-blue-700">${exp.graphene?.experimentNumber || exp.experimentNumber}</div>
                    <div class="text-xs text-gray-500">${formatCardDate(exp.graphene?.experimentDate)}</div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span class="text-gray-500">Species:</span>
                      <span class="ml-1 text-gray-800">${exp.graphene?.species || '-'}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Output:</span>
                      <span class="ml-1 text-gray-800 font-mono">${exp.graphene?.output ? exp.graphene.output + 'g' : '-'}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Biochar:</span>
                      <span class="ml-1 text-gray-700 text-xs">${exp.graphene?.biocharExperiment || (exp.graphene?.biocharLotNumber ? 'LOT: ' + exp.graphene.biocharLotNumber : 'Various')}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p class="text-sm text-gray-600">No constituent experiments found</p>
          </div>
        `}
      </div>
    `,
    defaultExpanded: false
  });
}

/**
 * Create micronization tracking section
 */
function createMicronizationSection(config) {
  const { data } = config;
  
  return createCardSection({
    title: 'Micronization Status',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
    </svg>`,
    content: `
      <div class="p-4">
        ${data.micronizations && data.micronizations.length > 0 ? `
          <div class="space-y-3">
            ${data.micronizations.map(mic => `
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                      Micronized
                    </span>
                    <div class="font-semibold text-green-900">${mic.micronizationNumber}</div>
                  </div>
                  <div class="text-xs text-green-700">${formatCardDate(mic.date)}</div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                  <div class="data-card-field">
                    <label class="text-xs text-green-600">SKU</label>
                    <value class="text-green-800 font-mono">${mic.sku || 'Not assigned'}</value>
                  </div>
                  <div class="data-card-field">
                    <label class="text-xs text-green-600">Location</label>
                    <value class="text-green-800">${mic.micronizationLocation || 'Unknown'}</value>
                  </div>
                  <div class="data-card-field">
                    <label class="text-xs text-green-600">Recovery Rate</label>
                    <value class="text-green-800 font-mono">${mic.recoveredAmount && mic.startingMaterialAmount ? 
                      ((mic.recoveredAmount / mic.startingMaterialAmount) * 100).toFixed(1) + '%' : 'N/A'}</value>
                  </div>
                  <div class="data-card-field">
                    <label class="text-xs text-green-600">Particle Size</label>
                    <value class="text-green-800 font-mono">${mic.dx50 || 'N/A'}</value>
                  </div>
                </div>
                
                ${mic.startingMaterialAmount && mic.recoveredAmount ? `
                  <div class="text-xs text-green-700">
                    ${mic.startingMaterialAmount}g → ${mic.recoveredAmount}g
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div class="flex items-center">
              <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <div class="font-medium text-gray-700">Not Micronized</div>
                <div class="text-sm text-gray-500">This compound batch has not been processed for micronization</div>
              </div>
            </div>
          </div>
        `}
      </div>
    `,
    defaultExpanded: false
  });
}

/**
 * Create source material section
 */
function createSourceSection(config) {
  const { data } = config;
  
  return createCardSection({
    title: 'Source Material',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
    </svg>`,
    content: `
      <div class="p-4">
        ${data.sourceBiochar ? `
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="font-semibold text-gray-900">${data.sourceBiochar.experimentNumber}</div>
              <span class="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">Direct Reference</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div class="data-card-field">
                <label class="text-xs text-gray-500">Date</label>
                <value class="text-gray-800">${formatCardDate(data.sourceBiochar.experimentDate)}</value>
              </div>
              <div class="data-card-field">
                <label class="text-xs text-gray-500">Raw Material</label>
                <value class="text-gray-800">${data.sourceBiochar.rawMaterial}</value>
              </div>
              <div class="data-card-field">
                <label class="text-xs text-gray-500">Reactor</label>
                <value class="text-gray-800">${data.sourceBiochar.reactor}</value>
              </div>
              <div class="data-card-field">
                <label class="text-xs text-gray-500">Temperature</label>
                <value class="text-gray-800">${data.sourceBiochar.temperature}°C</value>
              </div>
              <div class="data-card-field">
                <label class="text-xs text-gray-500">Starting Amount</label>
                <value class="text-gray-800">${data.sourceBiochar.startingAmount} g</value>
              </div>
              <div class="data-card-field">
                <label class="text-xs text-gray-500">Output</label>
                <value class="text-gray-800">${data.sourceBiochar.output} g</value>
              </div>
            </div>
          </div>
        ` : data.lotBiocharExperiments && data.lotBiocharExperiments.length > 0 ? `
          <div class="bg-link-light border border-link rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="font-semibold text-link-dark">Lot ${data.biocharLotNumber}</div>
              <span class="text-xs px-2 py-1 bg-link text-white rounded">Lot Reference</span>
            </div>
            <div class="text-sm text-link-medium mb-3">${data.lotBiocharExperiments.length} constituent experiments</div>
            <div class="space-y-3">
              ${data.lotBiocharExperiments.map(biochar => `
                <div class="bg-white rounded-lg p-3 border border-link-light">
                  <div class="flex justify-between items-start mb-2">
                    <div class="font-medium text-link-dark">${biochar.experimentNumber}</div>
                    <div class="text-xs text-link-medium">${formatCardDate(biochar.experimentDate)}</div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span class="text-link-medium">Material:</span>
                      <span class="text-link-dark ml-1">${biochar.rawMaterial}</span>
                    </div>
                    <div>
                      <span class="text-link-medium">Reactor:</span>
                      <span class="text-link-dark ml-1">${biochar.reactor}</span>
                    </div>
                    <div>
                      <span class="text-link-medium">Output:</span>
                      <span class="text-link-dark ml-1">${biochar.output} g</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : data.biocharExperiment ? `
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="font-semibold text-gray-900">${data.biocharExperiment}</div>
              <span class="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">Reference Only</span>
            </div>
            <div class="text-sm text-gray-600">Biochar experiment reference (detailed data not loaded)</div>
          </div>
        ` : data.biocharLotNumber ? `
          <div class="bg-link-light border border-link rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="font-semibold text-link-dark">Lot ${data.biocharLotNumber}</div>
              <span class="text-xs px-2 py-1 bg-link text-white rounded">Reference Only</span>
            </div>
            <div class="text-sm text-link-medium">Biochar lot reference (detailed data not loaded)</div>
          </div>
        ` : `
          <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div class="flex items-center">
              <svg class="w-4 h-4 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <div>
                <div class="font-medium text-orange-800">Various Sources</div>
                <div class="text-sm text-orange-600">No specific biochar source linked</div>
              </div>
            </div>
          </div>
        `}
      </div>
    `,
    defaultExpanded: false
  });
}

/**
 * Create shipment source section - shows what material is being shipped
 */
function createShipmentSourceSection(config) {
  const { data } = config;
  
  return createCardSection({
    title: 'Shipped Material',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
    </svg>`,
    content: `
      <div class="p-4">
        ${data.grapheneSample && data.grapheneRef ? `
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="font-semibold text-green-900">${data.grapheneSample}</div>
              <span class="text-xs px-2 py-1 bg-green-200 text-green-700 rounded">Graphene</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div class="data-card-field">
                <label class="text-xs text-gray-500">Species</label>
                <value class="text-gray-800">${data.grapheneRef.species || 'N/A'}</value>
              </div>
              <div class="data-card-field">
                <label class="text-xs text-gray-500">Output</label>
                <value class="text-gray-800">${data.grapheneRef.output || 'N/A'} g</value>
              </div>
            </div>
          </div>
        ` : data.compoundBatchNumber && data.compoundBatchRef ? `
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="font-semibold text-blue-900">${data.compoundBatchNumber}</div>
              <span class="text-xs px-2 py-1 bg-blue-200 text-blue-700 rounded">Compound Batch</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div class="data-card-field">
                <label class="text-xs text-gray-500">Batch Name</label>
                <value class="text-gray-800">${data.compoundBatchRef.batchName || 'N/A'}</value>
              </div>
              <div class="data-card-field">
                <label class="text-xs text-gray-500">Total Output</label>
                <value class="text-gray-800">${data.compoundBatchRef.totalOutput || 'N/A'} g</value>
              </div>
            </div>
          </div>
        ` : data.micronizationSku && data.micronizationRef ? `
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="font-semibold text-purple-900">${data.micronizationSku}</div>
              <span class="text-xs px-2 py-1 bg-purple-200 text-purple-700 rounded">Micronized</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div class="data-card-field">
                <label class="text-xs text-gray-500">Micronization #</label>
                <value class="text-gray-800">${data.micronizationRef.micronizationNumber || 'N/A'}</value>
              </div>
              <div class="data-card-field">
                <label class="text-xs text-gray-500">Recovered Amount</label>
                <value class="text-gray-800">${data.micronizationRef.recoveredAmount || 'N/A'} g</value>
              </div>
            </div>
          </div>
        ` : data.grapheneSample ? `
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="font-semibold text-gray-900">${data.grapheneSample}</div>
              <span class="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">Graphene Reference</span>
            </div>
            <div class="text-sm text-gray-600">Graphene sample reference (detailed data not loaded)</div>
          </div>
        ` : data.compoundBatchNumber ? `
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="font-semibold text-gray-900">${data.compoundBatchNumber}</div>
              <span class="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">Batch Reference</span>
            </div>
            <div class="text-sm text-gray-600">Compound batch reference (detailed data not loaded)</div>
          </div>
        ` : data.micronizationSku ? `
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="font-semibold text-gray-900">${data.micronizationSku}</div>
              <span class="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">SKU Reference</span>
            </div>
            <div class="text-sm text-gray-600">Micronization SKU reference (detailed data not loaded)</div>
          </div>
        ` : `
          <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div class="flex items-center">
              <svg class="w-4 h-4 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <div>
                <div class="font-medium text-orange-800">Unknown Material</div>
                <div class="text-sm text-orange-600">No material source specified</div>
              </div>
            </div>
          </div>
        `}
      </div>
    `,
    defaultExpanded: false
  });
}

/**
 * Create test results section
 */
function createTestsSection(config) {
  const { data } = config;
  
  // Count total tests (including SEM reports)
  const testCount = (data.betTests?.length || 0) + 
                   (data.conductivityTests?.length || 0) + 
                   (data.ramanTests?.length || 0) + 
                   (data.temTests?.length || 0) +
                   (data.semReports?.length || 0);
  
  return createCardSection({
    title: `Test Results`,
    badge: testCount > 0 ? `${testCount}` : null,
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
    </svg>`,
    content: `
      <div class="divide-y divide-gray-100">
        <!-- BET Surface Area Tests -->
        <div class="p-4">
          <h5 class="text-sm font-semibold text-gray-700 mb-2">BET Surface Area</h5>
          ${data.betTests?.length > 0 ? `
            <div class="space-y-2">
              ${data.betTests.map(test => `
                <div class="flex justify-between text-sm">
                  <span class="font-mono">${test.multipointBetArea || 'N/A'} m²/g</span>
                  <span class="text-gray-500">${formatCardDate(test.testDate)}</span>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="text-sm text-gray-500">No BET tests performed</div>
          `}
        </div>
        
        <!-- Conductivity Tests -->
        <div class="p-4">
          <h5 class="text-sm font-semibold text-gray-700 mb-2">Conductivity</h5>
          ${data.conductivityTests?.length > 0 ? `
            <div class="space-y-2">
              ${data.conductivityTests.map(test => `
                <div class="flex justify-between text-sm">
                  <span class="font-mono">${test.conductivity20kN || 'N/A'} S/cm @ 20kN</span>
                  <span class="text-gray-500">${formatCardDate(test.testDate)}</span>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="text-sm text-gray-500">No conductivity tests performed</div>
          `}
        </div>
        
        <!-- RAMAN Tests -->
        <div class="p-4">
          <h5 class="text-sm font-semibold text-gray-700 mb-2">RAMAN Spectroscopy</h5>
          ${data.ramanTests?.length > 0 ? `
            <div class="space-y-2">
              ${data.ramanTests.map(test => `
                <div class="flex justify-between text-sm">
                  <span class="font-mono">D/G Ratio: ${test.integralTypADG2 || 'N/A'}</span>
                  <span class="text-gray-500">${formatCardDate(test.testDate)}</span>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="text-sm text-gray-500">No RAMAN tests performed</div>
          `}
        </div>
        
        <!-- TEM Tests -->
        <div class="p-4">
          <h5 class="text-sm font-semibold text-gray-700 mb-2">TEM Analysis</h5>
          ${data.temTests?.length > 0 ? `
            <div class="space-y-2">
              ${data.temTests.map(test => `
                <div class="flex justify-between text-sm">
                  <span class="font-mono">TEM Analysis</span>
                  <span class="text-gray-500">${formatCardDate(test.testDate)}</span>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="text-sm text-gray-500">No TEM tests performed</div>
          `}
        </div>
        
        <!-- SEM Reports -->
        <div class="p-4">
          <h5 class="text-sm font-semibold text-gray-700 mb-2">SEM Reports</h5>
          ${data.semReports?.length > 0 ? `
            <div class="space-y-2">
              ${data.semReports.map(report => `
                <div class="flex justify-between items-center text-sm">
                  <button @click="openPdfInModal('/uploads/sem-reports/${report.filename}', 'SEM Report')" 
                          class="font-mono text-link hover:text-link-hover cursor-pointer text-left">
                    ${report.originalName || report.filename}
                  </button>
                  <span class="text-gray-500">${formatCardDate(report.reportDate)}</span>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="text-sm text-gray-500">No SEM reports available</div>
          `}
        </div>
      </div>
    `,
    defaultExpanded: false
  });
}

/**
 * Create reports section - for actual documents like Curia Updates
 */
function createReportsSection(config) {
  const { data } = config;
  
  const documentCount = (data.updateReports?.length || 0);
  
  return createCardSection({
    title: 'Documents',
    badge: documentCount > 0 ? `${documentCount}` : null,
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>`,
    content: `
      <div class="p-4">
        ${documentCount > 0 ? `
          <div class="space-y-2">
            ${data.updateReports?.map(report => `
              <div class="flex justify-between items-center text-sm">
                <button @click="openPdfInModal('/uploads/update-reports/${report.filename}', 'Curia Update Report')" 
                        class="text-link hover:text-link-hover cursor-pointer">
                  ${report.originalName || report.filename}
                </button>
                <span class="text-gray-500">${formatCardDate(report.uploadDate)}</span>
              </div>
            `).join('') || ''}
          </div>
        ` : `
          <div class="text-sm text-gray-500">No documents available</div>
        `}
      </div>
    `,
    defaultExpanded: false
  });
}

/**
 * Create shipments section
 */
function createShipmentsSection(config) {
  const { data } = config;
  
  const shipmentCount = data.shipments?.length || 0;
  
  return createCardSection({
    title: 'Distribution',
    badge: shipmentCount > 0 ? `${shipmentCount}` : null,
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
    </svg>`,
    content: `
      <div class="p-4">
        ${shipmentCount > 0 ? `
          <div class="space-y-2">
            ${data.shipments.map(shipment => `
              <div class="flex justify-between text-sm">
                <span>${shipment.shipToLocation}</span>
                <span class="font-mono">${shipment.amountShipped}g</span>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="text-sm text-gray-500">No shipments recorded</div>
        `}
      </div>
    `,
    defaultExpanded: false
  });
}

/**
 * Create objectives section
 */
function createObjectivesSection(config) {
  const { data } = config;
  
  const hasObjectives = data.objective || data.conclusion || data.recommendedAction;
  
  return createCardSection({
    title: 'Research Notes',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
    </svg>`,
    content: `
      <div class="p-4 space-y-3">
        ${data.objective ? `
          <div>
            <h5 class="text-xs font-semibold text-gray-700 uppercase">Objective</h5>
            <p class="text-sm text-gray-600 mt-1">${data.objective}</p>
          </div>
        ` : ''}
        ${data.conclusion ? `
          <div>
            <h5 class="text-xs font-semibold text-gray-700 uppercase">Conclusion</h5>
            <p class="text-sm text-gray-600 mt-1">${data.conclusion}</p>
          </div>
        ` : ''}
        ${!hasObjectives ? `
          <div class="text-sm text-gray-500">No research notes available</div>
        ` : ''}
      </div>
    `,
    defaultExpanded: false
  });
}

/**
 * Create destination section for shipment cards
 * @param {Object} config - Card configuration
 * @returns {string} HTML string for destination section
 */
function createDestinationSection(config) {
  const data = config.data;
  
  return createCardSection({
    id: `destination-${config.instanceId}`,
    title: 'Destination & Status',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
    </svg>`,
    content: `
      <div class="p-4 space-y-3">
        <div class="flex items-center space-x-4">
          <div class="flex-1">
            <h5 class="text-xs font-semibold text-gray-700 uppercase">From</h5>
            <p class="text-sm text-gray-900">${data.shipFromLocation || 'N/A'}</p>
          </div>
          <div class="text-gray-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
          </div>
          <div class="flex-1">
            <h5 class="text-xs font-semibold text-gray-700 uppercase">To</h5>
            <p class="text-sm text-gray-900">${data.shipToLocation || 'N/A'}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h5 class="text-xs font-semibold text-gray-700 uppercase">Amount</h5>
            <p class="text-sm text-gray-900">${data.amountShipped || 'N/A'}${data.unit ? ` ${data.unit}` : ''}</p>
          </div>
          <div>
            <h5 class="text-xs font-semibold text-gray-700 uppercase">Status</h5>
            <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(data.status)}">
              ${getStatusLabel(data.status)}
            </span>
          </div>
        </div>
        ${data.purpose ? `
          <div>
            <h5 class="text-xs font-semibold text-gray-700 uppercase">Purpose</h5>
            <p class="text-sm text-gray-600">${data.purpose}</p>
          </div>
        ` : ''}
      </div>
    `,
    defaultExpanded: false
  });
}

/**
 * Create status section for shipment cards
 * @param {Object} config - Card configuration
 * @returns {string} HTML string for status section
 */
function createStatusSection(config) {
  const data = config.data;
  
  return createCardSection({
    id: `status-${config.instanceId}`,
    title: 'Shipment Details',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
    </svg>`,
    content: `
      <div class="p-4 space-y-3">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h5 class="text-xs font-semibold text-gray-700 uppercase">Ship Date</h5>
            <p class="text-sm text-gray-900">${data.shipmentDate ? formatCardDate(data.shipmentDate) : 'N/A'}</p>
          </div>
          ${data.receivedDate ? `
            <div>
              <h5 class="text-xs font-semibold text-gray-700 uppercase">Received Date</h5>
              <p class="text-sm text-gray-900">${formatCardDate(data.receivedDate)}</p>
            </div>
          ` : ''}
        </div>
        ${data.comments ? `
          <div>
            <h5 class="text-xs font-semibold text-gray-700 uppercase">Comments</h5>
            <p class="text-sm text-gray-600">${data.comments}</p>
          </div>
        ` : ''}
      </div>
    `,
    defaultExpanded: false
  });
}

/**
 * Create compound batches section
 * Shows compound batches that include this experiment
 * @param {Object} config - Configuration object
 * @returns {string} HTML string for compound batches section
 */
function createCompoundBatchesSection(config) {
  const { data, instanceId } = config;
  
  // Get the current experiment number for highlighting
  const currentExperimentNumber = data.experimentNumber;
  
  return createCardSection({
    id: `compound-batches-${instanceId}`,
    title: 'Compound Batches',
    badge: data.compoundBatches?.length > 0 ? `${data.compoundBatches.length}` : null,
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
    </svg>`,
    content: data.compoundBatches?.length > 0 ? `
      <div class="space-y-3">
        ${data.compoundBatches.map(compoundBatchAssoc => `
          <div class="bg-link-light border border-link rounded-lg p-3">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h5 class="font-semibold text-sm text-gray-800 flex items-center mb-2">
                  <span class="font-mono">${compoundBatchAssoc.compoundBatch.batchNumber}</span>
                  ${compoundBatchAssoc.compoundBatch.batchName ? `
                    <span class="ml-2 font-normal"> - ${compoundBatchAssoc.compoundBatch.batchName}</span>
                  ` : ''}
                </h5>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span class="font-medium text-gray-700">Created:</span>
                    <span class="text-gray-600">${compoundBatchAssoc.compoundBatch.createdDate || 'Not specified'}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">Total Output:</span>
                    <span class="text-gray-600">${compoundBatchAssoc.compoundBatch.totalOutput ? compoundBatchAssoc.compoundBatch.totalOutput + 'g' : 'Not specified'}</span>
                  </div>
                </div>
                ${compoundBatchAssoc.compoundBatch.description ? `
                  <div class="mt-2">
                    <span class="font-medium text-gray-700 text-sm">Description:</span>
                    <p class="text-sm text-gray-600 mt-1">${compoundBatchAssoc.compoundBatch.description}</p>
                  </div>
                ` : ''}
                
                <!-- Constituent Experiments -->
                <div class="mt-3">
                  <span class="font-medium text-gray-700 text-sm">Constituent Experiments:</span>
                  <div class="mt-1 flex flex-wrap gap-1">
                    ${compoundBatchAssoc.compoundBatch.experiments.map(exp => `
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        exp.graphene.experimentNumber === currentExperimentNumber 
                          ? 'bg-white text-gray-800 ring-2 ring-link border border-link' 
                          : 'bg-gray-100 text-gray-700'
                      }">
                        <span>${exp.graphene.experimentNumber}</span>
                        ${exp.graphene.output ? `
                          <span class="text-gray-600"> (${exp.graphene.output}g)</span>
                        ` : ''}
                      </span>
                    `).join('')}
                  </div>
                </div>
                
                <!-- Associated Tests -->
                ${(compoundBatchAssoc.compoundBatch.betTests?.length > 0 || 
                   compoundBatchAssoc.compoundBatch.conductivityTests?.length > 0 || 
                   compoundBatchAssoc.compoundBatch.ramanTests?.length > 0 ||
                   compoundBatchAssoc.compoundBatch.temTests?.length > 0) ? `
                  <div class="mt-3">
                    <span class="font-medium text-gray-700 text-sm">Associated Tests:</span>
                    <div class="mt-1 flex flex-wrap gap-1">
                      ${compoundBatchAssoc.compoundBatch.betTests?.length > 0 ? `
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          BET (${compoundBatchAssoc.compoundBatch.betTests.length})
                        </span>
                      ` : ''}
                      ${compoundBatchAssoc.compoundBatch.conductivityTests?.length > 0 ? `
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          Conductivity (${compoundBatchAssoc.compoundBatch.conductivityTests.length})
                        </span>
                      ` : ''}
                      ${compoundBatchAssoc.compoundBatch.ramanTests?.length > 0 ? `
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          RAMAN (${compoundBatchAssoc.compoundBatch.ramanTests.length})
                        </span>
                      ` : ''}
                      ${compoundBatchAssoc.compoundBatch.temTests?.length > 0 ? `
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          TEM (${compoundBatchAssoc.compoundBatch.temTests.length})
                        </span>
                      ` : ''}
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    ` : `
      <div class="text-sm text-gray-500">This experiment is not part of any compound batches</div>
    `,
    defaultExpanded: false
  });
}

/**
 * Get status badge CSS classes
 * @param {string} status - Shipment status
 * @returns {string} CSS classes for status badge
 */
function getStatusBadgeClass(status) {
  switch (status?.toLowerCase()) {
    case 'pending': return 'bg-gray-100 text-gray-800';
    case 'shipped': return 'bg-blue-100 text-blue-800';
    case 'in_transit': return 'bg-yellow-100 text-yellow-800';
    case 'received': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get status display label
 * @param {string} status - Shipment status
 * @returns {string} Display label for status
 */
function getStatusLabel(status) {
  switch (status?.toLowerCase()) {
    case 'pending': return 'Pending';
    case 'shipped': return 'Shipped';
    case 'in_transit': return 'In Transit';
    case 'received': return 'Received';
    default: return status || 'Unknown';
  }
}

