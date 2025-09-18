/**
 * DataPageSection - Reusable section component for data pages
 * 
 * Provides consistent section layouts and content renderers
 * for different types of data sections
 */

/**
 * Create a data page section
 * @param {Object} config - Section configuration
 * @returns {string} HTML for the section
 */
function createDataPageSection(config) {
  const { 
    id, 
    title, 
    data, 
    type, 
    layout = 'default',
    collapsible = false,
    visible = true 
  } = config;
  
  if (!visible || !data) {
    return '';
  }

  const content = getSectionContent(id, data, type);
  
  if (!content) {
    return '';
  }

  return `
    <div class="data-page-section bg-white rounded-lg shadow-sm border border-gray-200 p-6" 
         data-section="${id}">
      
      <!-- Section Header -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
        ${collapsible ? `
          <button x-data="{ expanded: true }" 
                  @click="expanded = !expanded" 
                  class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-5 h-5 transition-transform" 
                 :class="expanded ? 'rotate-180' : ''" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        ` : ''}
      </div>

      <!-- Section Content -->
      <div class="section-content">
        ${content}
      </div>
      
    </div>
  `;
}

/**
 * Get section content based on section ID and data type
 * @param {string} sectionId - Section identifier
 * @param {Object} data - Data object
 * @param {string} type - Data type
 * @returns {string} Section content HTML
 */
function getSectionContent(sectionId, data, type) {
  switch (sectionId) {
    case 'process':
      return createProcessSection(data, type);
    case 'source':
    case 'materials':
      return createSourceSection(data, type);
    case 'tests':
      return createTestsSection(data, type);
    case 'reports':
      return createReportsSection(data, type);
    case 'shipments':
      return createShipmentsSection(data, type);
    case 'related':
      return createRelatedSection(data, type);
    case 'properties':
      return createPropertiesSection(data, type);
    case 'downstream':
      return createDownstreamSection(data, type);
    case 'constituents':
      return createConstituentsSection(data, type);
    default:
      return createGenericSection(data, sectionId);
  }
}

/**
 * Create process details section
 * @param {Object} data - Data object
 * @param {string} type - Data type
 * @returns {string} Process section HTML
 */
function createProcessSection(data, type) {
  if (type === 'graphene') {
    return `
      <div class="space-y-4">
        <!-- Process Parameters -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Equipment & Base -->
          <div class="bg-gray-50 rounded-lg p-3">
            <h4 class="font-medium text-gray-900 mb-2 text-sm">Equipment & Base</h4>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div><span class="text-gray-600">Oven:</span> <span class="font-medium">${data.oven || 'N/A'}</span></div>
              <div><span class="text-gray-600">Quantity:</span> <span class="font-medium">${data.quantity || 'N/A'} g</span></div>
              <div><span class="text-gray-600">Gas:</span> <span class="font-medium">${data.gas || 'N/A'}</span></div>
              <div><span class="text-gray-600">Base:</span> <span class="font-medium">${data.baseAmount || 'N/A'}g ${data.baseType || ''} ${data.baseConcentration ? '(' + data.baseConcentration + '%)' : ''}</span></div>
            </div>
          </div>

          <!-- Grinding -->
          <div class="bg-gray-50 rounded-lg p-3">
            <h4 class="font-medium text-gray-900 mb-2 text-sm">Grinding</h4>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div><span class="text-gray-600">Method:</span> <span class="font-medium">${data.grindingMethod || 'N/A'}</span></div>
              <div><span class="text-gray-600"># Grinds:</span> <span class="font-medium">${data.grindingCount || 'N/A'}</span></div>
              <div><span class="text-gray-600">Time:</span> <span class="font-medium">${data.grindingTime || 'N/A'} min</span></div>
              <div><span class="text-gray-600">Frequency:</span> <span class="font-medium">${data.grindingFrequency || 'N/A'} Hz</span></div>
              <div class="col-span-2"><span class="text-gray-600">Homogeneous:</span> <span class="font-medium">${data.homogeneous || 'N/A'}</span></div>
            </div>
          </div>

          <!-- Temperature -->
          <div class="bg-gray-50 rounded-lg p-3">
            <h4 class="font-medium text-gray-900 mb-2 text-sm">Temperature</h4>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div><span class="text-gray-600">Rate:</span> <span class="font-medium">${data.tempRate || 'N/A'} °C/min</span></div>
              <div><span class="text-gray-600">Max:</span> <span class="font-medium">${data.tempMax || 'N/A'} °C</span></div>
              <div><span class="text-gray-600">Time:</span> <span class="font-medium">${data.time || 'N/A'} min</span></div>
            </div>
          </div>

          <!-- Wash & Drying -->
          <div class="bg-gray-50 rounded-lg p-3">
            <h4 class="font-medium text-gray-900 mb-2 text-sm">Wash & Drying</h4>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div><span class="text-gray-600">Wash:</span> <span class="font-medium">${data.washAmount || 'N/A'}mL ${data.washSolution || ''}</span></div>
              <div><span class="text-gray-600">Conc:</span> <span class="font-medium">${data.washConcentration || 'N/A'}%</span></div>
              <div><span class="text-gray-600">Water:</span> <span class="font-medium">${data.washWater || 'N/A'} mL</span></div>
              <div><span class="text-gray-600">Dry:</span> <span class="font-medium">${data.dryingTemp || 'N/A'}°C ${data.dryingAtmosphere || ''}</span></div>
            </div>
          </div>
        </div>

        <!-- Results & Output -->
        <div class="bg-gray-50 rounded-lg p-3">
          <h4 class="font-medium text-gray-900 mb-2 text-sm">Results</h4>
          <div class="grid grid-cols-4 gap-2 text-xs">
            <div><span class="text-gray-600">Volume:</span> <span class="font-medium">${data.volumeMl || 'N/A'} mL</span></div>
            <div><span class="text-gray-600">Density:</span> <span class="font-medium">${data.volumeMl && data.output ? (data.output / data.volumeMl).toFixed(2) : 'N/A'} g/mL</span></div>
            <div><span class="text-gray-600">Output:</span> <span class="font-medium">${data.output || 'N/A'} g</span></div>
            <div><span class="text-gray-600">Yield:</span> <span class="font-medium">${data.quantity && data.output ? ((data.output / data.quantity) * 100).toFixed(1) : 'N/A'}%</span></div>
          </div>
        </div>

        <!-- Appearance & Comments -->
        <div class="space-y-3">
          ${data.appearanceTags && data.appearanceTags.length > 0 ? `
            <div class="bg-gray-50 rounded-lg p-3">
              <h4 class="font-medium text-gray-900 mb-2 text-sm">Appearance</h4>
              <div class="flex flex-wrap gap-1">
                ${data.appearanceTags.map(tag => `
                  <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${tag}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${data.comments ? `
            <div class="bg-gray-50 rounded-lg p-3">
              <h4 class="font-medium text-gray-900 mb-2 text-sm">Comments</h4>
              <p class="text-sm text-gray-700">${data.comments}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  } else if (type === 'biochar') {
    return createProcessGrid([
      { label: 'Pyrolysis Temperature', value: data.pyrolysisTemp, unit: '°C' },
      { label: 'Hold Time', value: data.holdTime, unit: 'min' },
      { label: 'Heating Rate', value: data.heatingRate, unit: '°C/min' },
      { label: 'Atmosphere', value: data.atmosphere },
      { label: 'Reactor Type', value: data.reactorType },
      { label: 'Final pH', value: data.finalPH }
    ]);
  } else if (type === 'micronization') {
    return createProcessGrid([
      { label: 'Grinding Method', value: data.grindingMethod },
      { label: 'Input Weight', value: data.inputWeight, unit: 'g' },
      { label: 'Output Weight', value: data.outputWeight, unit: 'g' },
      { label: 'Processing Time', value: data.processingTime, unit: 'min' },
      { label: 'Equipment', value: data.equipment }
    ]);
  }
  
  return createGenericSection(data, 'process');
}

/**
 * Create source materials section
 * @param {Object} data - Data object
 * @param {string} type - Data type
 * @returns {string} Source section HTML
 */
function createSourceSection(data, type) {
  if (type === 'graphene') {
    const biocharData = data.biocharExperiment || {};
    return `
      <div class="space-y-4">
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 mb-3">Source Biochar</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-sm text-gray-600">Experiment Number:</span>
              <span class="ml-2 font-medium">${biocharData.experimentNumber || 'N/A'}</span>
            </div>
            <div>
              <span class="text-sm text-gray-600">Species:</span>
              <span class="ml-2 font-medium">${biocharData.species || 'N/A'}</span>
            </div>
            <div>
              <span class="text-sm text-gray-600">Lot Number:</span>
              <span class="ml-2 font-medium">${data.biocharLotNumber || 'N/A'}</span>
            </div>
            <div>
              <span class="text-sm text-gray-600">Input Weight:</span>
              <span class="ml-2 font-medium">${data.inputWeight || 'N/A'} g</span>
            </div>
          </div>
          ${biocharData.experimentNumber ? `
            <div class="mt-3">
              <a href="#/data/biochar/${biocharData.experimentNumber}" 
                 class="text-blue-600 hover:text-blue-800 text-sm">
                View Source Biochar Details →
              </a>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  } else if (type === 'biochar') {
    return createProcessGrid([
      { label: 'Species', value: data.species },
      { label: 'Feedstock Type', value: data.feedstockType },
      { label: 'Moisture Content', value: data.moistureContent, unit: '%' },
      { label: 'Particle Size', value: data.particleSize, unit: 'mm' },
      { label: 'Source Location', value: data.sourceLocation },
      { label: 'Harvest Date', value: data.harvestDate ? window.formatDateSafe(data.harvestDate) : 'N/A' }
    ]);
  }
  
  return createGenericSection(data, 'source');
}

/**
 * Create tests section
 * @param {Object} data - Data object
 * @param {string} type - Data type
 * @returns {string} Tests section HTML
 */
function createTestsSection(data, type) {
  const testTypes = ['betTests', 'conductivityTests', 'ramanTests', 'temTests'];
  const semReports = data.semReports || [];
  const hasTests = testTypes.some(testType => data[testType] && data[testType].length > 0);
  const hasAnything = hasTests || semReports.length > 0;
  
  if (!hasAnything) {
    return `
      <div class="text-center py-8 text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
        </svg>
        <p>No test results available</p>
      </div>
    `;
  }

  return `
    <div class="space-y-6">
      ${testTypes.map(testType => {
        const tests = data[testType] || [];
        if (tests.length === 0) return '';
        
        const testLabel = getTestTypeLabel(testType);
        return createTestTypeSection(testLabel, tests, testType);
      }).filter(Boolean).join('')}
      
      ${semReports.length > 0 ? `
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 mb-3">SEM Reports (${semReports.length})</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${semReports.map(reportRelation => {
              // Handle nested structure: semReports[].semReport or flat semReports[]
              const report = reportRelation.semReport || reportRelation;
              const filePath = report.filePath || report.originalPath;
              const originalName = report.originalName || 'SEM Report';
              const reportDate = report.reportDate || reportRelation.reportDate;
              
              return `
                <div class="bg-white rounded border p-3">
                  <div class="flex justify-between items-center">
                    <div>
                      <div class="font-medium">${originalName}</div>
                      <div class="text-sm text-gray-600">${reportDate ? window.formatDateSafe(reportDate) : 'N/A'}</div>
                    </div>
                    ${filePath ? `
                      ${filePath.includes('cloudinary.com') ? `
                        <a href="${filePath}" target="_blank" rel="noopener noreferrer"
                           class="text-blue-600 hover:text-blue-800 transition-colors">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7l10 10M17 7v4M17 7h-4"></path>
                          </svg>
                        </a>
                      ` : `
                        <button @click="window.openPdfInModal('${filePath}', '${originalName}')"
                                class="text-blue-600 hover:text-blue-800 transition-colors">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                        </button>
                      `}
                    ` : `
                      <span class="text-gray-400 text-sm">No file</span>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Create test type section
 * @param {string} label - Test type label
 * @param {Array} tests - Test array
 * @param {string} testType - Test type
 * @returns {string} Test type section HTML
 */
function createTestTypeSection(label, tests, testType) {
  return `
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="font-medium text-gray-900 mb-3">${label} (${tests.length})</h4>
      <div class="space-y-2">
        ${tests.slice(0, 3).map(test => `
          <div class="flex justify-between items-center py-2 px-3 bg-white rounded border">
            <div>
              <span class="font-medium">${test.testDate ? window.formatDateSafe(test.testDate) : 'N/A'}</span>
              ${test.value ? `<span class="ml-2 text-gray-600">${test.value} ${test.unit || ''}</span>` : ''}
            </div>
            ${test.reportPath ? `
              <a href="${test.reportPath}" target="_blank" 
                 class="text-blue-600 hover:text-blue-800 text-sm">
                View Report
              </a>
            ` : ''}
          </div>
        `).join('')}
        ${tests.length > 3 ? `
          <div class="text-center pt-2">
            <button onclick="showAllTests('${testType}')" 
                    class="text-blue-600 hover:text-blue-800 text-sm">
              View all ${tests.length} ${label.toLowerCase()}
            </button>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Create reports section
 * @param {Object} data - Data object
 * @param {string} type - Data type
 * @returns {string} Reports section HTML
 */
function createReportsSection(data, type) {
  const updateReports = data.updateReports || [];
  
  if (updateReports.length === 0) {
    return `
      <div class="text-center py-8 text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p>No reports available</p>
      </div>
    `;
  }

  return `
    <div class="space-y-6">
      ${updateReports.length > 0 ? `
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 mb-3">Update Reports (${updateReports.length})</h4>
          <div class="space-y-2">
            ${updateReports.map(reportRelation => {
              // Handle nested structure: updateReports[].updateReport or flat updateReports[]
              const report = reportRelation.updateReport || reportRelation;
              const filePath = report.filePath || report.originalPath;
              const originalName = report.originalName || 'Update Report';
              const weekOf = report.weekOf || reportRelation.weekOf;
              const description = report.description || reportRelation.description;
              
              return `
                <div class="bg-white rounded border p-3">
                  <div class="flex justify-between items-center">
                    <div>
                      <div class="font-medium">${originalName}</div>
                      <div class="text-sm text-gray-600">Week of ${weekOf ? window.formatDateSafe(weekOf) : 'N/A'}</div>
                      ${description ? `<div class="text-sm text-gray-500 mt-1">${description}</div>` : ''}
                    </div>
                    ${filePath ? `
                      ${filePath.includes('cloudinary.com') ? `
                        <a href="${filePath}" target="_blank" rel="noopener noreferrer"
                           class="text-blue-600 hover:text-blue-800 transition-colors">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7l10 10M17 7v4M17 7h-4"></path>
                          </svg>
                        </a>
                      ` : `
                        <button @click="window.openPdfInModal('${filePath}', '${originalName}')"
                                class="text-blue-600 hover:text-blue-800 transition-colors">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                        </button>
                      `}
                    ` : `
                      <span class="text-gray-400 text-sm">No file</span>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Create shipments section
 * @param {Object} data - Data object
 * @param {string} type - Data type
 * @returns {string} Shipments section HTML
 */
function createShipmentsSection(data, type) {
  const shipments = data.shipments || [];
  
  if (shipments.length === 0) {
    return `
      <div class="text-center py-8 text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
        </svg>
        <p>No shipments recorded</p>
      </div>
    `;
  }

  return `
    <div class="space-y-3">
      ${shipments.map(shipment => `
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <span class="font-medium">${shipment.shipmentNumber || 'N/A'}</span>
                <span class="px-2 py-1 text-xs rounded-full ${getShipmentStatusClass(shipment.status)}">
                  ${shipment.status || 'Unknown'}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-600">Weight:</span>
                  <span class="ml-2">${shipment.weight || 'N/A'} g</span>
                </div>
                <div>
                  <span class="text-gray-600">Destination:</span>
                  <span class="ml-2">${shipment.destination || 'N/A'}</span>
                </div>
                <div>
                  <span class="text-gray-600">Ship Date:</span>
                  <span class="ml-2">${shipment.shipmentDate ? window.formatDateSafe(shipment.shipmentDate) : 'N/A'}</span>
                </div>
                <div>
                  <span class="text-gray-600">Tracking:</span>
                  <span class="ml-2">${shipment.trackingNumber || 'N/A'}</span>
                </div>
              </div>
            </div>
            ${shipment.shipmentNumber ? `
              <a href="#/data/shipment/${shipment.shipmentNumber}" 
                 class="text-blue-600 hover:text-blue-800 text-sm">
                View Details →
              </a>
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Create related experiments section
 * @param {Object} data - Data object
 * @param {string} type - Data type
 * @returns {string} Related section HTML
 */
function createRelatedSection(data, type) {
  // This would show related experiments, compound batches, etc.
  return `
    <div class="text-center py-8 text-gray-500">
      <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
      </svg>
      <p>Related experiments coming soon</p>
    </div>
  `;
}

/**
 * Create process grid layout
 * @param {Array} items - Process items
 * @returns {string} Process grid HTML
 */
function createProcessGrid(items) {
  return `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${items.map(item => `
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="text-sm text-gray-600 mb-1">${item.label}</div>
          <div class="font-medium text-gray-900">
            ${item.value || 'N/A'}${item.unit ? ` ${item.unit}` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Create generic section
 * @param {Object} data - Data object
 * @param {string} sectionId - Section ID
 * @returns {string} Generic section HTML
 */
function createGenericSection(data, sectionId) {
  return `
    <div class="text-center py-8 text-gray-500">
      <p>Section content for ${sectionId} coming soon</p>
    </div>
  `;
}

/**
 * Get test type label
 * @param {string} testType - Test type
 * @returns {string} Test label
 */
function getTestTypeLabel(testType) {
  const labels = {
    betTests: 'BET Tests',
    conductivityTests: 'Conductivity Tests',
    ramanTests: 'RAMAN Tests',
    temTests: 'TEM Tests'
  };
  return labels[testType] || testType;
}

/**
 * Get shipment status CSS class
 * @param {string} status - Shipment status
 * @returns {string} CSS class
 */
function getShipmentStatusClass(status) {
  switch (status?.toLowerCase()) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'shipped': return 'bg-blue-100 text-blue-800';
    case 'in_transit': return 'bg-purple-100 text-purple-800';
    case 'received': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// Make functions globally available
window.createDataPageSection = createDataPageSection;
window.getSectionContent = getSectionContent;
window.createProcessSection = createProcessSection;
window.createSourceSection = createSourceSection;
window.createTestsSection = createTestsSection;
window.createReportsSection = createReportsSection;
window.createShipmentsSection = createShipmentsSection;
window.createRelatedSection = createRelatedSection;

export { 
  createDataPageSection, 
  getSectionContent, 
  createProcessSection,
  createSourceSection,
  createTestsSection,
  createReportsSection,
  createShipmentsSection,
  createRelatedSection
};