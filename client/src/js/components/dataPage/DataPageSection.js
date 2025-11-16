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
    case 'micronizations':
      return createMicronizationsSection(data, type);
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
            <h4 class="font-medium text-gray-900 mb-2 text-sm">Equipment & Base ${data.base2Type === 'NaOH' ? '(Species 2)' : '(Species 1)'}</h4>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div><span class="text-gray-600">Oven:</span> <span class="font-medium">${data.oven || 'N/A'}</span></div>
              <div><span class="text-gray-600">Quantity:</span> <span class="font-medium">${data.quantity || 'N/A'} g</span></div>
              <div><span class="text-gray-600">Gas:</span> <span class="font-medium">${data.gas || 'N/A'}</span></div>
              <div><span class="text-gray-600">Base:</span> <span class="font-medium">${data.baseAmount || 'N/A'}g ${data.baseType || ''}${data.baseConcentration ? ' (' + data.baseConcentration + '%)' : ''}${data.base2Type ? ' + ' + data.base2Amount + 'g ' + data.base2Type + (data.base2Concentration ? ' (' + data.base2Concentration + '%)' : '') : ''}</span></div>
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
          ${(data.species || (data.appearanceTags && data.appearanceTags.length > 0)) ? `
            <div class="bg-gray-50 rounded-lg p-3">
              <h4 class="font-medium text-gray-900 mb-2 text-sm">Appearance</h4>
              ${data.species ? `
                <div class="mb-2">
                  <span class="text-gray-600 text-xs">Visual Appearance:</span>
                  <span class="font-medium text-xs">${data.species}</span>
                </div>
              ` : ''}
              ${data.appearanceTags && data.appearanceTags.length > 0 ? `
                <div class="flex flex-wrap gap-1">
                  ${data.appearanceTags.map(tag => `
                    <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${tag}</span>
                  `).join('')}
                </div>
              ` : ''}
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
      { label: 'Reactor', value: data.reactor },
      { label: 'Temperature', value: data.temperature, unit: '°C' },
      { label: 'Time', value: data.time, unit: 'min' },
      { label: 'Acid Amount', value: data.acidAmount, unit: 'mL' },
      { label: 'Acid Concentration', value: data.acidConcentration, unit: '%' },
      { label: 'Acid Molarity', value: data.acidMolarity, unit: 'M' },
      { label: 'Acid Type', value: data.acidType },
      { label: 'Pressure Initial', value: data.pressureInitial, unit: 'bar' },
      { label: 'Pressure Final', value: data.pressureFinal, unit: 'bar' }
    ]);
  } else if (type === 'micronization') {
    return createProcessGrid([
      { label: 'Grinding Method', value: data.grindingMethod },
      { label: 'Input Weight', value: data.inputWeight, unit: 'g' },
      { label: 'Output Weight', value: data.outputWeight, unit: 'g' },
      { label: 'Processing Time', value: data.processingTime, unit: 'min' },
      { label: 'Equipment', value: data.equipment }
    ]);
  } else if (type === 'compound-batch') {
    return `
      <div class="space-y-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Batch Information -->
          <div class="bg-gray-50 rounded-lg p-3">
            <h4 class="font-medium text-gray-900 mb-2 text-sm">Batch Information</h4>
            <div class="grid grid-cols-1 gap-2 text-xs">
              <div><span class="text-gray-600">Batch Number:</span> <span class="font-medium">${data.batchNumber || 'N/A'}</span></div>
              <div><span class="text-gray-600">Batch Name:</span> <span class="font-medium">${data.batchName || 'N/A'}</span></div>
              <div><span class="text-gray-600">Creation Date:</span> <span class="font-medium">${data.creationDate ? window.formatDateSafe(data.creationDate) : 'N/A'}</span></div>
              <div><span class="text-gray-600">Created By:</span> <span class="font-medium">${data.createdBy || 'N/A'}</span></div>
            </div>
          </div>

          <!-- Batch Metrics -->
          <div class="bg-gray-50 rounded-lg p-3">
            <h4 class="font-medium text-gray-900 mb-2 text-sm">Batch Metrics</h4>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div><span class="text-gray-600">Total Input:</span> <span class="font-medium">${data.totalInput || 'N/A'} g</span></div>
              <div><span class="text-gray-600">Total Output:</span> <span class="font-medium">${data.totalOutput || 'N/A'} g</span></div>
              <div><span class="text-gray-600">Constituents:</span> <span class="font-medium">${data.constituents?.length || 0}</span></div>
              <div><span class="text-gray-600">Status:</span> <span class="font-medium">${data.status || 'Active'}</span></div>
            </div>
          </div>
        </div>

        <!-- Description -->
        ${data.description ? `
          <div class="bg-gray-50 rounded-lg p-3">
            <h4 class="font-medium text-gray-900 mb-2 text-sm">Description</h4>
            <p class="text-sm text-gray-700">${data.description}</p>
          </div>
        ` : ''}

        <!-- Comments -->
        ${data.comments ? `
          <div class="bg-gray-50 rounded-lg p-3">
            <h4 class="font-medium text-gray-900 mb-2 text-sm">Comments</h4>
            <p class="text-sm text-gray-700">${data.comments}</p>
          </div>
        ` : ''}
      </div>
    `;
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
    // Handle both direct biochar reference and lot reference
    const biocharData = data.sourceBiochar || {};
    const lotBiocharExperiments = data.lotBiocharExperiments || [];
    const biocharExperimentNumber = data.biocharExperiment || biocharData.experimentNumber;

    // Determine which biochar data to show
    let displayData = biocharData;
    let isLotBased = false;

    if (!biocharData.experimentNumber && lotBiocharExperiments.length > 0) {
      // If no direct biochar reference, but has lot experiments, show lot info
      displayData = lotBiocharExperiments[0]; // Use first experiment in lot for species info
      isLotBased = true;
    }

    return `
      <div class="space-y-4">
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 mb-3">Source Biochar</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-sm text-gray-600">Experiment Number:</span>
              <span class="ml-2 font-medium">${biocharExperimentNumber || 'N/A'}</span>
            </div>
            <div>
              <span class="text-sm text-gray-600">Species:</span>
              <span class="ml-2 font-medium">${displayData.species || displayData.rawMaterial || 'N/A'}</span>
            </div>
            <div>
              <span class="text-sm text-gray-600">Lot Number:</span>
              <span class="ml-2 font-medium">${data.biocharLotNumber || 'N/A'}</span>
            </div>
            <div>
              <span class="text-sm text-gray-600">Output:</span>
              <span class="ml-2 font-medium">${displayData.outputAmount || displayData.output || 'N/A'} g</span>
            </div>
          </div>
          ${biocharExperimentNumber && !isLotBased ? `
            <div class="mt-3">
              <a href="#/data/biochar/${biocharExperimentNumber}"
                 class="text-blue-600 hover:text-blue-800 text-sm">
                View Source Biochar Details →
              </a>
            </div>
          ` : ''}
          ${isLotBased && lotBiocharExperiments.length > 0 ? `
            <div class="mt-3">
              <p class="text-sm text-gray-600 mb-2">Lot contains ${lotBiocharExperiments.length} biochar experiments</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  } else if (type === 'biochar') {
    return createProcessGrid([
      { label: 'Raw Material', value: data.rawMaterial },
      { label: 'Starting Amount', value: data.startingAmount, unit: 'g' },
      { label: 'Experiment Date', value: data.experimentDate ? window.formatDateSafe(data.experimentDate) : 'N/A' },
      { label: 'Test Order', value: data.testOrder },
      { label: 'Research Team', value: data.researchTeam },
      { label: 'Lot Number', value: data.lotNumber }
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
  const testTypes = ['betTests', 'conductivityTests', 'ramanTests', 'temTests', 'particleSizeTests', 'xrdTests', 'xpsTests'];
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
  switch(testType) {
    case 'betTests':
      return createDetailedBetSection(label, tests);
    case 'conductivityTests':
      return createDetailedConductivitySection(label, tests);
    case 'ramanTests':
      return createDetailedRamanSection(label, tests);
    case 'temTests':
      return createDetailedTemSection(label, tests);
    case 'particleSizeTests':
      return createDetailedParticleSizeSection(label, tests);
    case 'xrdTests':
      return createDetailedXRDSection(label, tests);
    case 'xpsTests':
      return createDetailedXPSSection(label, tests);
    default:
      return createGenericTestSection(label, tests, testType);
  }
}

function createDetailedBetSection(label, tests) {
  return `
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="font-medium text-gray-900 mb-3 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        ${label}
      </h4>
      ${tests.length === 0 ? `
        <div class="text-center py-4 text-gray-500 text-sm">
          No BET tests found for this graphene sample
        </div>
      ` : `
        <div class="space-y-3">
          ${tests.map(test => `
            <div class="bg-white rounded border p-3">
              <div class="flex justify-between items-start mb-2">
                <span class="font-medium text-sm">BET Test</span>
                <span class="text-sm text-gray-600">${test.testDate ? window.formatDateSafe(test.testDate) : 'N/A'}</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs">
                ${test.mass !== null && test.mass !== undefined ? `
                  <div><span class="text-gray-600">Mass:</span> <span class="font-medium">${test.mass} g</span></div>
                ` : ''}
                ${test.multipointBetArea !== null && test.multipointBetArea !== undefined ? `
                  <div><span class="text-gray-600">Multipoint BET:</span> <span class="font-medium">${window.formatScientific ? window.formatScientific(test.multipointBetArea) : test.multipointBetArea} m²/g</span></div>
                ` : ''}
                ${test.langmuirSurfaceArea !== null && test.langmuirSurfaceArea !== undefined ? `
                  <div><span class="text-gray-600">Langmuir:</span> <span class="font-medium">${window.formatScientific ? window.formatScientific(test.langmuirSurfaceArea) : test.langmuirSurfaceArea} m²/g</span></div>
                ` : ''}
                ${test.researchTeam ? `
                  <div><span class="text-gray-600">Team:</span> <span class="font-medium">${test.researchTeam}</span></div>
                ` : ''}
                ${test.testingLab ? `
                  <div><span class="text-gray-600">Lab:</span> <span class="font-medium">${test.testingLab}</span></div>
                ` : ''}
              </div>
              ${test.betReportPath ? `
                <div class="mt-2 pt-2 border-t">
                  ${test.betReportPath.includes('cloudinary.com') ? `
                    <a href="${test.betReportPath}" target="_blank" rel="noopener noreferrer"
                       class="text-blue-600 hover:text-blue-800 text-xs flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      View PDF
                    </a>
                  ` : `
                    <button @click="window.openPdfInModal('${test.betReportPath}', 'BET Report')"
                            class="text-blue-600 hover:text-blue-800 text-xs flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      View PDF
                    </button>
                  `}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function createDetailedConductivitySection(label, tests) {
  return `
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="font-medium text-gray-900 mb-3 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        ${label}
      </h4>
      ${tests.length === 0 ? `
        <div class="text-center py-4 text-gray-500 text-sm">
          No conductivity tests found for this graphene sample
        </div>
      ` : `
        <div class="space-y-3">
          ${tests.map(test => `
            <div class="bg-white rounded border p-3">
              <div class="flex justify-between items-start mb-2">
                <span class="font-medium text-sm">Conductivity Test</span>
                <span class="text-sm text-gray-600">${test.testDate ? window.formatDateSafe(test.testDate) : 'N/A'}</span>
              </div>
              ${test.name || test.description ? `
                <div class="mb-2">
                  <span class="text-xs font-medium">Description:</span>
                  <span class="text-xs">${test.name || test.description}</span>
                </div>
              ` : ''}
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div><span class="text-gray-600">1kN:</span> <span class="font-medium">${test.conductivity1kN || 'N/A'} S/cm²</span></div>
                <div><span class="text-gray-600">8kN:</span> <span class="font-medium">${test.conductivity8kN || 'N/A'} S/cm²</span></div>
                <div><span class="text-gray-600">12kN:</span> <span class="font-medium">${test.conductivity12kN || 'N/A'} S/cm²</span></div>
                <div><span class="text-gray-600">20kN:</span> <span class="font-medium">${test.conductivity20kN || 'N/A'} S/cm²</span></div>
              </div>
              ${test.conductivityReportPath ? `
                <div class="mt-2 pt-2 border-t">
                  ${test.conductivityReportPath.includes('cloudinary.com') ? `
                    <a href="${test.conductivityReportPath}" target="_blank" rel="noopener noreferrer"
                       class="text-blue-600 hover:text-blue-800 text-xs flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      ${test.conductivityReportPath.endsWith('.xlsx') || test.conductivityReportPath.endsWith('.xls') ? 'Download File' : 'View PDF'}
                    </a>
                  ` : `
                    <button @click="window.openPdfInModal('${test.conductivityReportPath}', 'Conductivity Report')"
                            class="text-blue-600 hover:text-blue-800 text-xs flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      View Report
                    </button>
                  `}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function createDetailedRamanSection(label, tests) {
  return `
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="font-medium text-gray-900 mb-3 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        ${label}
      </h4>
      ${tests.length === 0 ? `
        <div class="text-center py-4 text-gray-500 text-sm">
          No RAMAN tests found for this graphene sample
        </div>
      ` : `
        <div class="space-y-3">
          ${tests.map(test => `
            <div class="bg-white rounded border p-3">
              <div class="flex justify-between items-start mb-2">
                <span class="font-medium text-sm">RAMAN Test</span>
                <span class="text-sm text-gray-600">${test.testDate ? window.formatDateSafe(test.testDate) : 'N/A'}</span>
              </div>
              <div class="text-xs mb-2">
                ${test.researchTeam ? `<span class="text-gray-600">Team:</span> <span class="font-medium">${test.researchTeam}</span>` : ''}
                ${test.testingLab ? `<span class="text-gray-600 ml-3">Lab:</span> <span class="font-medium">${test.testingLab}</span>` : ''}
              </div>
              <div class="overflow-x-auto">
                <table class="text-xs w-full">
                  <thead>
                    <tr class="border-b">
                      <th class="text-left py-1"></th>
                      <th class="text-center px-2">2D</th>
                      <th class="text-center px-2">G</th>
                      <th class="text-center px-2">D</th>
                      <th class="text-center px-2">D/G</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="border-b">
                      <td class="font-medium py-1">Int. Range</td>
                      <td class="text-center">
                        ${(test.integrationRange2DLow !== null && test.integrationRange2DLow !== undefined &&
                           test.integrationRange2DHigh !== null && test.integrationRange2DHigh !== undefined)
                          ? `${test.integrationRange2DLow}-${test.integrationRange2DHigh}`
                          : '-'}
                      </td>
                      <td class="text-center">
                        ${(test.integrationRangeGLow !== null && test.integrationRangeGLow !== undefined &&
                           test.integrationRangeGHigh !== null && test.integrationRangeGHigh !== undefined)
                          ? `${test.integrationRangeGLow}-${test.integrationRangeGHigh}`
                          : '-'}
                      </td>
                      <td class="text-center">
                        ${(test.integrationRangeDLow !== null && test.integrationRangeDLow !== undefined &&
                           test.integrationRangeDHigh !== null && test.integrationRangeDHigh !== undefined)
                          ? `${test.integrationRangeDLow}-${test.integrationRangeDHigh}`
                          : '-'}
                      </td>
                      <td class="text-center">
                        ${(test.integrationRangeDGLow !== null && test.integrationRangeDGLow !== undefined &&
                           test.integrationRangeDGHigh !== null && test.integrationRangeDGHigh !== undefined)
                          ? `${test.integrationRangeDGLow}-${test.integrationRangeDGHigh}`
                          : '-'}
                      </td>
                    </tr>
                    <tr class="border-b">
                      <td class="font-medium py-1">Integral A</td>
                      <td class="text-center">
                        ${(test.integralTypA2D1 !== null && test.integralTypA2D1 !== undefined &&
                           test.integralTypA2D2 !== null && test.integralTypA2D2 !== undefined)
                          ? `${test.integralTypA2D1}, ${test.integralTypA2D2}`
                          : '-'}
                      </td>
                      <td class="text-center">
                        ${(test.integralTypAG1 !== null && test.integralTypAG1 !== undefined &&
                           test.integralTypAG2 !== null && test.integralTypAG2 !== undefined)
                          ? `${test.integralTypAG1}, ${test.integralTypAG2}`
                          : '-'}
                      </td>
                      <td class="text-center">
                        ${(test.integralTypAD1 !== null && test.integralTypAD1 !== undefined &&
                           test.integralTypAD2 !== null && test.integralTypAD2 !== undefined)
                          ? `${test.integralTypAD1}, ${test.integralTypAD2}`
                          : '-'}
                      </td>
                      <td class="text-center">
                        ${(test.integralTypADG1 !== null && test.integralTypADG1 !== undefined &&
                           test.integralTypADG2 !== null && test.integralTypADG2 !== undefined)
                          ? `${test.integralTypADG1}, ${test.integralTypADG2}`
                          : '-'}
                      </td>
                    </tr>
                    <tr class="border-b">
                      <td class="font-medium py-1">Integral B</td>
                      <td class="text-center">
                        ${(test.integralTypB2D1 !== null && test.integralTypB2D1 !== undefined &&
                           test.integralTypB2D2 !== null && test.integralTypB2D2 !== undefined)
                          ? `${test.integralTypB2D1}, ${test.integralTypB2D2}`
                          : '-'}
                      </td>
                      <td class="text-center">
                        ${(test.integralTypBG1 !== null && test.integralTypBG1 !== undefined &&
                           test.integralTypBG2 !== null && test.integralTypBG2 !== undefined)
                          ? `${test.integralTypBG1}, ${test.integralTypBG2}`
                          : '-'}
                      </td>
                      <td class="text-center">
                        ${(test.integralTypBD1 !== null && test.integralTypBD1 !== undefined &&
                           test.integralTypBD2 !== null && test.integralTypBD2 !== undefined)
                          ? `${test.integralTypBD1}, ${test.integralTypBD2}`
                          : '-'}
                      </td>
                      <td class="text-center">
                        ${(test.integralTypBDG1 !== null && test.integralTypBDG1 !== undefined &&
                           test.integralTypBDG2 !== null && test.integralTypBDG2 !== undefined)
                          ? `${test.integralTypBDG1}, ${test.integralTypBDG2}`
                          : '-'}
                      </td>
                    </tr>
                    <tr>
                      <td class="font-medium py-1">Peak J</td>
                      <td class="text-center">
                        ${(test.peakHighTypJ2D1 !== null && test.peakHighTypJ2D1 !== undefined &&
                           test.peakHighTypJ2D2 !== null && test.peakHighTypJ2D2 !== undefined)
                          ? `${test.peakHighTypJ2D1}, ${test.peakHighTypJ2D2}`
                          : '-'}
                      </td>
                      <td class="text-center">
                        ${(test.peakHighTypJG1 !== null && test.peakHighTypJG1 !== undefined &&
                           test.peakHighTypJG2 !== null && test.peakHighTypJG2 !== undefined)
                          ? `${test.peakHighTypJG1}, ${test.peakHighTypJG2}`
                          : '-'}
                      </td>
                      <td class="text-center">
                        ${(test.peakHighTypJD1 !== null && test.peakHighTypJD1 !== undefined &&
                           test.peakHighTypJD2 !== null && test.peakHighTypJD2 !== undefined)
                          ? `${test.peakHighTypJD1}, ${test.peakHighTypJD2}`
                          : '-'}
                      </td>
                      <td class="text-center">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              ${test.ramanReportPath ? `
                <div class="mt-2 pt-2 border-t">
                  ${test.ramanReportPath.includes('cloudinary.com') ? `
                    <a href="${test.ramanReportPath}" target="_blank" rel="noopener noreferrer"
                       class="text-blue-600 hover:text-blue-800 text-xs flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      View PDF
                    </a>
                  ` : `
                    <button @click="window.openPdfInModal('${test.ramanReportPath}', 'RAMAN Report')"
                            class="text-blue-600 hover:text-blue-800 text-xs flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      View PDF
                    </button>
                  `}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function createDetailedTemSection(label, tests) {
  return `
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="font-medium text-gray-900 mb-3 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        </svg>
        ${label}
      </h4>
      ${tests.length === 0 ? `
        <div class="text-center py-4 text-gray-500 text-sm">
          No TEM analysis found for this graphene sample
        </div>
      ` : `
        <div class="space-y-3">
          ${tests.map(test => `
            <div class="bg-white rounded border p-3">
              <div class="flex justify-between items-start mb-2">
                <span class="font-medium text-sm">TEM Analysis</span>
                <span class="text-sm text-gray-600">${test.testDate ? window.formatDateSafe(test.testDate) : 'N/A'}</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs">
                ${test.researchTeam ? `
                  <div><span class="text-gray-600">Team:</span> <span class="font-medium">${test.researchTeam}</span></div>
                ` : ''}
                ${test.testingLab ? `
                  <div><span class="text-gray-600">Lab:</span> <span class="font-medium">${test.testingLab}</span></div>
                ` : ''}
              </div>
              ${test.comments ? `
                <div class="mt-2 text-xs text-gray-600">${test.comments}</div>
              ` : ''}
              ${test.temReportPath ? `
                <div class="mt-2 pt-2 border-t">
                  ${test.temReportPath.includes('cloudinary.com') ? `
                    <a href="${test.temReportPath}" target="_blank" rel="noopener noreferrer"
                       class="text-blue-600 hover:text-blue-800 text-xs flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      View PDF
                    </a>
                  ` : `
                    <button @click="window.openPdfInModal('${test.temReportPath}', 'TEM Report')"
                            class="text-blue-600 hover:text-blue-800 text-xs flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      View PDF
                    </button>
                  `}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function createDetailedParticleSizeSection(label, tests) {
  return `
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="font-medium text-gray-900 mb-3 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        ${label}
      </h4>
      ${tests.length === 0 ? `
        <div class="text-center py-4 text-gray-500 text-sm">
          No particle size tests found for this sample
        </div>
      ` : `
        <div class="space-y-3">
          ${tests.map(test => `
            <div class="bg-white rounded border p-3">
              <div class="flex justify-between items-start mb-2">
                <span class="font-medium text-sm">Particle Size Test</span>
                <span class="text-sm text-gray-600">${test.testDate ? window.formatDateSafe(test.testDate) : 'N/A'}</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs">
                ${test.d10 !== null && test.d10 !== undefined ? `
                  <div><span class="text-gray-600">D10:</span> <span class="font-medium">${test.d10} μm</span></div>
                ` : ''}
                ${test.d50 !== null && test.d50 !== undefined ? `
                  <div><span class="text-gray-600">D50 (Median):</span> <span class="font-medium">${test.d50} μm</span></div>
                ` : ''}
                ${test.d90 !== null && test.d90 !== undefined ? `
                  <div><span class="text-gray-600">D90:</span> <span class="font-medium">${test.d90} μm</span></div>
                ` : ''}
                ${test.meanSize !== null && test.meanSize !== undefined ? `
                  <div><span class="text-gray-600">Mean Size:</span> <span class="font-medium">${test.meanSize} μm</span></div>
                ` : ''}
                ${test.spanValue !== null && test.spanValue !== undefined ? `
                  <div><span class="text-gray-600">Span Value:</span> <span class="font-medium">${test.spanValue}</span></div>
                ` : ''}
                ${test.testingLab ? `
                  <div><span class="text-gray-600">Lab:</span> <span class="font-medium">${test.testingLab}</span></div>
                ` : ''}
                ${test.testingMethod ? `
                  <div><span class="text-gray-600">Method:</span> <span class="font-medium">${test.testingMethod}</span></div>
                ` : ''}
              </div>
              ${test.comments ? `
                <div class="mt-2 text-xs text-gray-600">${test.comments}</div>
              ` : ''}
              ${test.particleSizeReportPath ? `
                <div class="mt-2 pt-2 border-t">
                  ${test.particleSizeReportPath.includes('cloudinary.com') ? `
                    <a href="${test.particleSizeReportPath}" target="_blank" rel="noopener noreferrer"
                       class="text-blue-600 hover:text-blue-800 text-xs flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      View Report
                    </a>
                  ` : `
                    <button @click="window.openPdfInModal('${test.particleSizeReportPath}', 'Particle Size Report')"
                            class="text-blue-600 hover:text-blue-800 text-xs flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      View Report
                    </button>
                  `}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function createDetailedXRDSection(label, tests) {
  return `
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="font-medium text-gray-900 mb-3 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        ${label}
      </h4>
      ${tests.length === 0 ? `
        <div class="text-center py-4 text-gray-500 text-sm">
          No XRD tests found for this sample
        </div>
      ` : `
        <div class="space-y-3">
          ${tests.map(test => `
            <div class="bg-white rounded border p-3">
              <div class="flex justify-between items-start mb-2">
                <span class="font-medium text-sm">XRD Test</span>
                <span class="text-sm text-gray-600">${test.testDate ? window.formatDateSafe(test.testDate) : 'N/A'}</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs">
                ${test.peak1_position !== null && test.peak1_position !== undefined ? `
                  <div><span class="text-gray-600">Peak 1 (2θ):</span> <span class="font-medium">${test.peak1_position}°</span>${test.peak1_assignment ? ` <span class="text-gray-500">(${test.peak1_assignment})</span>` : ''}</div>
                ` : ''}
                ${test.peak2_position !== null && test.peak2_position !== undefined ? `
                  <div><span class="text-gray-600">Peak 2 (2θ):</span> <span class="font-medium">${test.peak2_position}°</span>${test.peak2_assignment ? ` <span class="text-gray-500">(${test.peak2_assignment})</span>` : ''}</div>
                ` : ''}
                ${test.crystallite_size !== null && test.crystallite_size !== undefined ? `
                  <div><span class="text-gray-600">Crystallite Size:</span> <span class="font-medium">${test.crystallite_size} nm</span></div>
                ` : ''}
                ${test.testingLab ? `
                  <div><span class="text-gray-600">Lab:</span> <span class="font-medium">${test.testingLab}</span></div>
                ` : ''}
              </div>
              ${test.comments ? `
                <div class="mt-2 text-xs text-gray-600">${test.comments}</div>
              ` : ''}
              ${test.xrdReportPaths && test.xrdReportPaths.length > 0 ? `
                <div class="mt-2 pt-2 border-t">
                  <div class="text-xs font-medium text-gray-700 mb-1">XRD Reports (${test.xrdReportPaths.length} file${test.xrdReportPaths.length > 1 ? 's' : ''}):</div>
                  <div class="flex flex-wrap gap-2">
                    ${test.xrdReportPaths.map((filePath, index) => `
                      <a href="${filePath.startsWith('https://') ? filePath : '/uploads/' + filePath}"
                         target="_blank" rel="noopener noreferrer"
                         class="text-blue-600 hover:text-blue-800 text-xs flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Report ${index + 1}
                      </a>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function createDetailedXPSSection(label, tests) {
  return `
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="font-medium text-gray-900 mb-3 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        ${label}
      </h4>
      ${tests.length === 0 ? `
        <div class="text-center py-4 text-gray-500 text-sm">
          No XPS tests found for this sample
        </div>
      ` : `
        <div class="space-y-3">
          ${tests.map(test => `
            <div class="bg-white rounded border p-3">
              <div class="flex justify-between items-start mb-2">
                <span class="font-medium text-sm">XPS Test</span>
                <span class="text-sm text-gray-600">${test.testDate ? window.formatDateSafe(test.testDate) : 'N/A'}</span>
              </div>
              <div class="mb-2">
                <div class="text-xs font-semibold mb-1">Elemental Composition:</div>
                <div class="grid grid-cols-2 gap-1 text-xs">
                  ${test.c1s_percent !== null && test.c1s_percent !== undefined ? `
                    <div><span class="text-gray-600">C-1s:</span> <span class="font-medium font-mono">${test.c1s_percent.toFixed(2)}%</span>${test.c1s_percent_error !== null ? ` <span class="text-gray-500">± ${test.c1s_percent_error.toFixed(2)}</span>` : ''}</div>
                  ` : ''}
                  ${test.o1s_percent !== null && test.o1s_percent !== undefined ? `
                    <div><span class="text-gray-600">O-1s:</span> <span class="font-medium font-mono">${test.o1s_percent.toFixed(2)}%</span>${test.o1s_percent_error !== null ? ` <span class="text-gray-500">± ${test.o1s_percent_error.toFixed(2)}</span>` : ''}</div>
                  ` : ''}
                  ${test.n1s_percent !== null && test.n1s_percent !== undefined ? `
                    <div><span class="text-gray-600">N-1s:</span> <span class="font-medium font-mono">${test.n1s_percent.toFixed(2)}%</span>${test.n1s_percent_error !== null ? ` <span class="text-gray-500">± ${test.n1s_percent_error.toFixed(2)}</span>` : ''}</div>
                  ` : ''}
                  ${test.cl2p_percent !== null && test.cl2p_percent !== undefined ? `
                    <div><span class="text-gray-600">Cl-2p:</span> <span class="font-medium font-mono">${test.cl2p_percent.toFixed(2)}%</span>${test.cl2p_percent_error !== null ? ` <span class="text-gray-500">± ${test.cl2p_percent_error.toFixed(2)}</span>` : ''}</div>
                  ` : ''}
                  ${test.mo3d_percent !== null && test.mo3d_percent !== undefined ? `
                    <div><span class="text-gray-600">Mo-3d:</span> <span class="font-medium font-mono">${test.mo3d_percent.toFixed(2)}%</span>${test.mo3d_percent_error !== null ? ` <span class="text-gray-500">± ${test.mo3d_percent_error.toFixed(2)}</span>` : ''}</div>
                  ` : ''}
                  ${test.s2p_percent !== null && test.s2p_percent !== undefined ? `
                    <div><span class="text-gray-600">S-2p:</span> <span class="font-medium font-mono">${test.s2p_percent.toFixed(2)}%</span>${test.s2p_percent_error !== null ? ` <span class="text-gray-500">± ${test.s2p_percent_error.toFixed(2)}</span>` : ''}</div>
                  ` : ''}
                  ${test.si2p_percent !== null && test.si2p_percent !== undefined ? `
                    <div><span class="text-gray-600">Si-2p:</span> <span class="font-medium font-mono">${test.si2p_percent.toFixed(2)}%</span>${test.si2p_percent_error !== null ? ` <span class="text-gray-500">± ${test.si2p_percent_error.toFixed(2)}</span>` : ''}</div>
                  ` : ''}
                </div>
              </div>
              ${test.c1s_cc_percent !== null || test.c1s_co_percent !== null ? `
                <div class="mb-2">
                  <div class="text-xs font-semibold mb-1">C-1s Decomposition:</div>
                  <div class="grid grid-cols-2 gap-1 text-xs">
                    ${test.c1s_cc_percent !== null && test.c1s_cc_percent !== undefined ? `
                      <div><span class="text-gray-600">C-C:</span> <span class="font-medium font-mono">${test.c1s_cc_percent.toFixed(2)}%</span>${test.c1s_cc_error !== null ? ` <span class="text-gray-500">± ${test.c1s_cc_error.toFixed(2)}</span>` : ''}</div>
                    ` : ''}
                    ${test.c1s_co_percent !== null && test.c1s_co_percent !== undefined ? `
                      <div><span class="text-gray-600">C-O:</span> <span class="font-medium font-mono">${test.c1s_co_percent.toFixed(2)}%</span>${test.c1s_co_error !== null ? ` <span class="text-gray-500">± ${test.c1s_co_error.toFixed(2)}</span>` : ''}</div>
                    ` : ''}
                    ${test.c1s_ceo_percent !== null && test.c1s_ceo_percent !== undefined ? `
                      <div><span class="text-gray-600">C=O:</span> <span class="font-medium font-mono">${test.c1s_ceo_percent.toFixed(2)}%</span>${test.c1s_ceo_error !== null ? ` <span class="text-gray-500">± ${test.c1s_ceo_error.toFixed(2)}</span>` : ''}</div>
                    ` : ''}
                    ${test.c1s_co3_percent !== null && test.c1s_co3_percent !== undefined ? `
                      <div><span class="text-gray-600">CO₃:</span> <span class="font-medium font-mono">${test.c1s_co3_percent.toFixed(2)}%</span>${test.c1s_co3_error !== null ? ` <span class="text-gray-500">± ${test.c1s_co3_error.toFixed(2)}</span>` : ''}</div>
                    ` : ''}
                    ${test.c1s_oceo_percent !== null && test.c1s_oceo_percent !== undefined ? `
                      <div><span class="text-gray-600">O-C=O:</span> <span class="font-medium font-mono">${test.c1s_oceo_percent.toFixed(2)}%</span>${test.c1s_oceo_error !== null ? ` <span class="text-gray-500">± ${test.c1s_oceo_error.toFixed(2)}</span>` : ''}</div>
                    ` : ''}
                    ${test.c1s_sp2_percent !== null && test.c1s_sp2_percent !== undefined ? `
                      <div><span class="text-gray-600">sp²:</span> <span class="font-medium font-mono">${test.c1s_sp2_percent.toFixed(2)}%</span>${test.c1s_sp2_error !== null ? ` <span class="text-gray-500">± ${test.c1s_sp2_error.toFixed(2)}</span>` : ''}</div>
                    ` : ''}
                  </div>
                </div>
              ` : ''}
              ${test.testingLab ? `
                <div class="text-xs mb-2"><span class="text-gray-600">Lab:</span> <span class="font-medium">${test.testingLab}</span></div>
              ` : ''}
              ${test.comments ? `
                <div class="mt-2 text-xs text-gray-600">${test.comments}</div>
              ` : ''}
              ${test.xpsReportPaths && test.xpsReportPaths.length > 0 ? `
                <div class="mt-2 pt-2 border-t">
                  <div class="text-xs font-medium text-gray-700 mb-1">XPS Reports (${test.xpsReportPaths.length} file${test.xpsReportPaths.length > 1 ? 's' : ''}):</div>
                  <div class="flex flex-wrap gap-2">
                    ${test.xpsReportPaths.map((filePath, index) => `
                      <a href="${filePath.startsWith('https://') ? filePath : '/uploads/' + filePath}"
                         target="_blank" rel="noopener noreferrer"
                         class="text-blue-600 hover:text-blue-800 text-xs flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Report ${index + 1}
                      </a>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function createGenericTestSection(label, tests, testType) {
  return `
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="font-medium text-gray-900 mb-3">${label} (${tests.length})</h4>
      <div class="space-y-2">
        ${tests.map(test => `
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
  if (type === 'graphene') {
    // Show compound batches that include this graphene experiment
    const compoundBatches = data.compoundBatches || [];

    if (compoundBatches.length === 0) {
      return `
        <div class="text-center py-8 text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          <p>Not part of any compound batch</p>
        </div>
      `;
    }

    return `
      <div class="space-y-4">
        ${compoundBatches.map(cb => {
          const batch = cb.compoundBatch;
          const experimentCount = batch.experiments ? batch.experiments.length : 0;

          return `
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex justify-between items-start mb-3">
                <div>
                  <button @click="routerService.navigateToDataPage('compound-batch', '${batch.batchNumber}')"
                          class="font-medium text-blue-600 hover:text-blue-800 text-lg">
                    ${batch.batchNumber}
                  </button>
                  ${batch.batchName ? `
                    <span class="ml-2 text-gray-600">${batch.batchName}</span>
                  ` : ''}
                </div>
                <button @click="routerService.navigateToDataPage('compound-batch', '${batch.batchNumber}')"
                        class="text-blue-600 hover:text-blue-800 text-sm">
                  View Batch Details →
                </button>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span class="text-gray-600">Created:</span>
                  <span class="ml-2 font-medium">${batch.createdDate || 'N/A'}</span>
                </div>
                <div>
                  <span class="text-gray-600">Total Output:</span>
                  <span class="ml-2 font-medium">${batch.totalOutput || 'N/A'} g</span>
                </div>
                <div>
                  <span class="text-gray-600">Constituents:</span>
                  <span class="ml-2 font-medium">${experimentCount} experiments</span>
                </div>
                <div>
                  <span class="text-gray-600">Status:</span>
                  <span class="ml-2 font-medium">${batch.status || 'Active'}</span>
                </div>
              </div>

              ${batch.description ? `
                <div class="mt-3 pt-3 border-t border-gray-200">
                  <p class="text-sm text-gray-700">${batch.description}</p>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Default placeholder for other types
  return `
    <div class="text-center py-8 text-gray-500">
      <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
      </svg>
      <p>Related data coming soon</p>
    </div>
  `;
}

/**
 * Create constituents section for compound batches
 * @param {Object} data - Data object
 * @param {string} type - Data type
 * @returns {string} Constituents section HTML
 */
function createConstituentsSection(data, type) {
  const constituents = data.constituents || [];
  
  if (constituents.length === 0) {
    return `
      <div class="text-center py-8 text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
        <p>No constituent experiments added</p>
      </div>
    `;
  }

  return `
    <div class="space-y-4">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Exp #</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Species</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Output (g)</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${constituents.map(constituent => {
              const exp = constituent.graphene || constituent.grapheneExperiment || constituent;
              return `
                <tr class="hover:bg-gray-50">
                  <td class="px-3 py-2 text-xs font-mono">
                    <button @click="routerService.navigateToDataPage('graphene', '${exp.experimentNumber}')" 
                            class="font-bold text-black hover:text-gray-700 underline">
                      ${exp.experimentNumber || 'N/A'}
                    </button>
                  </td>
                  <td class="px-3 py-2 text-xs">${exp.experimentDate ? window.formatDateSafe(exp.experimentDate) : 'N/A'}</td>
                  <td class="px-3 py-2 text-xs">${exp.species || 'N/A'}</td>
                  <td class="px-3 py-2 text-xs font-mono">${exp.output || 'N/A'}</td>
                  <td class="px-3 py-2 text-xs">
                    <button @click="routerService.navigateToDataPage('graphene', '${exp.experimentNumber}')" 
                            class="text-amber-600 hover:text-amber-800">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * Create micronizations section
 * @param {Object} data - Data object
 * @param {string} type - Data type
 * @returns {string} Micronizations section HTML
 */
function createMicronizationsSection(data, type) {
  const micronizations = data.micronizations || [];
  
  if (micronizations.length === 0) {
    return `
      <div class="text-center py-8 text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
        </svg>
        <p>No micronizations recorded</p>
      </div>
    `;
  }

  return `
    <div class="space-y-4">
      ${micronizations.map(micronization => `
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="flex justify-between items-start mb-3">
            <div>
              <span class="font-medium text-gray-900">${micronization.micronizationNumber || 'N/A'}</span>
              <span class="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                SKU: ${micronization.sku || 'N/A'}
              </span>
            </div>
            ${micronization.micronizationNumber ? `
              <button @click="routerService.navigateToDataPage('micronization', '${micronization.micronizationNumber}')" 
                      class="text-blue-600 hover:text-blue-800 text-sm">
                View Details →
              </button>
            ` : ''}
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span class="text-gray-600">Date:</span>
              <span class="ml-2 font-medium">${micronization.processingDate ? window.formatDateSafe(micronization.processingDate) : 'N/A'}</span>
            </div>
            <div>
              <span class="text-gray-600">Input:</span>
              <span class="ml-2 font-medium">${micronization.inputAmount || 'N/A'} g</span>
            </div>
            <div>
              <span class="text-gray-600">Recovered:</span>
              <span class="ml-2 font-medium">${micronization.recoveredAmount || 'N/A'} g</span>
            </div>
            <div>
              <span class="text-gray-600">Recovery:</span>
              <span class="ml-2 font-medium">
                ${micronization.inputAmount && micronization.recoveredAmount 
                  ? ((micronization.recoveredAmount / micronization.inputAmount) * 100).toFixed(1) + '%'
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span class="text-gray-600">Location:</span>
              <span class="ml-2 font-medium">${micronization.processingLocation || 'N/A'}</span>
            </div>
            <div>
              <span class="text-gray-600">Equipment:</span>
              <span class="ml-2 font-medium">${micronization.equipment || 'N/A'}</span>
            </div>
            <div>
              <span class="text-gray-600">Operator:</span>
              <span class="ml-2 font-medium">${micronization.operator || 'N/A'}</span>
            </div>
            <div>
              <span class="text-gray-600">Status:</span>
              <span class="ml-2 font-medium">${micronization.status || 'Complete'}</span>
            </div>
          </div>
          
          ${micronization.comments ? `
            <div class="mt-3 pt-3 border-t border-gray-200">
              <p class="text-sm text-gray-700">${micronization.comments}</p>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Create properties section (for biochar: output and finishing data)
 */
function createPropertiesSection(data, type) {
  if (type === 'biochar') {
    return createProcessGrid([
      { label: 'Output', value: data.output, unit: 'g' },
      { label: 'Wash Amount', value: data.washAmount, unit: 'mL' },
      { label: 'Wash Medium', value: data.washMedium },
      { label: 'Drying Temperature', value: data.dryingTemp, unit: '°C' },
      { label: 'KFT Percentage', value: data.kftPercentage, unit: '%' },
      { label: 'Comments', value: data.comments }
    ]);
  }
  return createGenericSection(data, 'properties');
}

function createDownstreamSection(data, type) {
  return createGenericSection(data, 'downstream');
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
    temTests: 'TEM Tests',
    particleSizeTests: 'Particle Size Tests',
    xrdTests: 'XRD Tests',
    xpsTests: 'XPS Tests'
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
window.createConstituentsSection = createConstituentsSection;
window.createMicronizationsSection = createMicronizationsSection;
window.createPropertiesSection = createPropertiesSection;
window.createDownstreamSection = createDownstreamSection;

export { 
  createDataPageSection, 
  getSectionContent, 
  createProcessSection,
  createSourceSection,
  createTestsSection,
  createReportsSection,
  createShipmentsSection,
  createRelatedSection,
  createConstituentsSection,
  createMicronizationsSection,
  createPropertiesSection,
  createDownstreamSection
};