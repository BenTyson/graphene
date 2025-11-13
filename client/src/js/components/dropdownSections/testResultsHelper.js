/**
 * Test Results Section Template Helper
 * Generates Alpine.js template HTML for test result displays
 * Preserves Alpine.js reactivity by generating templates with directives intact
 */

export function createTestResultsSection(config) {
  const {
    testType,           // 'bet', 'conductivity', 'raman', 'tem'
    dataPath,          // Path to test data (e.g., 'grapheneRelatedData[record.experimentNumber].betTests')
    experimentNumber   // Variable for experiment number if needed
  } = config;

  switch(testType) {
    case 'bet':
      return createBetTestSection(dataPath);
    case 'conductivity':
      return createConductivityTestSection(dataPath);
    case 'raman':
      return createRamanTestSection(dataPath);
    case 'tem':
      return createTemTestSection(dataPath);
    case 'particleSize':
      return createParticleSizeTestSection(dataPath);
    default:
      return '';
  }
}

function createBetTestSection(dataPath) {
  return `
    <!-- BET Test Results -->
    <div>
      <h4 class="text-md font-semibold text-gray-700 mb-3 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        BET Test Results
      </h4>
      <template x-if="${dataPath} && ${dataPath}.length > 0">
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div class="space-y-2">
            <template x-for="bet in ${dataPath}">
              <div class="bg-white rounded p-2 text-xs border">
                <div class="flex justify-between mb-1">
                  <span class="font-medium">BET Test</span>
                  <span x-text="window.formatDateSafe(bet.testDate)"></span>
                </div>
                <table class="w-full">
                  <tr><td class="font-medium">Mass:</td><td x-text="bet.mass ? bet.mass + ' g' : 'N/A'"></td></tr>
                  <tr><td class="font-medium">Multipoint BET:</td><td x-text="bet.multipointBetArea ? formatScientific(bet.multipointBetArea) + ' m²/g' : 'N/A'"></td></tr>
                  <tr><td class="font-medium">Langmuir:</td><td x-text="bet.langmuirSurfaceArea ? formatScientific(bet.langmuirSurfaceArea) + ' m²/g' : 'N/A'"></td></tr>
                  <tr x-show="bet.researchTeam"><td class="font-medium">Research Team:</td><td x-text="bet.researchTeam || 'N/A'"></td></tr>
                  <tr x-show="bet.testingLab"><td class="font-medium">Testing Lab:</td><td x-text="bet.testingLab || 'N/A'"></td></tr>
                </table>
                <template x-if="bet.comments">
                  <p class="text-gray-600 mt-1" x-text="bet.comments"></p>
                </template>
                <template x-if="bet.betReportPath">
                  <div class="mt-2 pt-2 border-t border-gray-200">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-medium text-gray-700">BET Report:</span>
                      <button @click="window.open(bet.betReportPath.startsWith('https://') ? bet.betReportPath : '/uploads/' + bet.betReportPath, '_blank')" 
                              class="text-link text-link-hover text-xs font-medium flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        View PDF
                      </button>
                    </div>
                  </div>
                </template>
              </div>
            </template>
          </div>
        </div>
      </template>
      
      <template x-if="!${dataPath} || ${dataPath}.length === 0">
        <div class="bg-gray-100 border border-gray-200 rounded-lg p-3 text-center text-gray-500 text-sm">
          No BET tests found for this graphene sample
        </div>
      </template>
    </div>
  `;
}

function createConductivityTestSection(dataPath) {
  return `
    <!-- Conductivity Test Results -->
    <div>
      <h4 class="text-md font-semibold text-gray-700 mb-3 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        Conductivity Tests
      </h4>
      <template x-if="${dataPath} && ${dataPath}.length > 0">
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div class="space-y-2">
            <template x-for="conductivity in ${dataPath}">
              <div class="bg-white rounded p-2 text-xs border">
                <div class="flex justify-between mb-1">
                  <span class="font-medium">Conductivity Test</span>
                  <span x-text="window.formatDateSafe(conductivity.testDate)"></span>
                </div>
                <div class="mb-2" x-show="conductivity.description">
                  <div class="text-xs mb-1"><strong>Description:</strong> <span x-text="conductivity.description || 'N/A'"></span></div>
                </div>
                <table class="w-full text-xs">
                  <tr><td class="font-medium">1kN:</td><td x-text="conductivity.conductivity1kN ? conductivity.conductivity1kN + ' S/cm²' : 'N/A'"></td></tr>
                  <tr><td class="font-medium">8kN:</td><td x-text="conductivity.conductivity8kN ? conductivity.conductivity8kN + ' S/cm²' : 'N/A'"></td></tr>
                  <tr><td class="font-medium">12kN:</td><td x-text="conductivity.conductivity12kN ? conductivity.conductivity12kN + ' S/cm²' : 'N/A'"></td></tr>
                  <tr><td class="font-medium">20kN:</td><td x-text="conductivity.conductivity20kN ? conductivity.conductivity20kN + ' S/cm²' : 'N/A'"></td></tr>
                </table>
                <template x-if="conductivity.comments">
                  <p class="text-gray-600 mt-1" x-text="conductivity.comments"></p>
                </template>
              </div>
            </template>
          </div>
        </div>
      </template>
      
      <template x-if="!${dataPath} || ${dataPath}.length === 0">
        <div class="bg-gray-100 border border-gray-200 rounded-lg p-3 text-center text-gray-500 text-sm">
          No conductivity tests found for this graphene sample
        </div>
      </template>
    </div>
  `;
}

function createRamanTestSection(dataPath) {
  return `
    <!-- RAMAN Analysis Results -->
    <div>
      <h4 class="text-md font-semibold text-gray-700 mb-3 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        RAMAN Analysis
      </h4>
      <template x-if="${dataPath} && ${dataPath}.length > 0">
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div class="space-y-2">
            <template x-for="raman in ${dataPath}">
              <div class="bg-white rounded p-2 text-xs border">
                <div class="flex justify-between mb-1">
                  <span class="font-medium">RAMAN Test</span>
                  <span x-text="window.formatDateSafe(raman.testDate)"></span>
                </div>
                <div class="mb-2">
                  <div class="text-xs mb-1">
                    <strong>Research Team:</strong> <span x-text="raman.researchTeam || 'N/A'"></span> | 
                    <strong>Testing Lab:</strong> <span x-text="raman.testingLab || 'N/A'"></span>
                  </div>
                  <table class="w-full text-xs border border-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-1 py-1 text-left border-r border-gray-200 text-xs"></th>
                        <th class="px-1 py-1 text-center border-r border-gray-200 text-xs">2D</th>
                        <th class="px-1 py-1 text-center border-r border-gray-200 text-xs">G</th>
                        <th class="px-1 py-1 text-center border-r border-gray-200 text-xs">D</th>
                        <th class="px-1 py-1 text-center text-xs">D/G</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr class="border-t border-gray-200">
                        <td class="px-1 py-1 font-medium border-r border-gray-200 text-xs">Int. Range</td>
                        <td class="px-1 py-1 text-center border-r border-gray-200 font-mono text-xs" x-text="(raman.integrationRange2DLow && raman.integrationRange2DHigh) ? \`\${raman.integrationRange2DLow}-\${raman.integrationRange2DHigh}\` : '-'"></td>
                        <td class="px-1 py-1 text-center border-r border-gray-200 font-mono text-xs" x-text="(raman.integrationRangeGLow && raman.integrationRangeGHigh) ? \`\${raman.integrationRangeGLow}-\${raman.integrationRangeGHigh}\` : '-'"></td>
                        <td class="px-1 py-1 text-center border-r border-gray-200 font-mono text-xs" x-text="(raman.integrationRangeDLow && raman.integrationRangeDHigh) ? \`\${raman.integrationRangeDLow}-\${raman.integrationRangeDHigh}\` : '-'"></td>
                        <td class="px-1 py-1 text-center font-mono text-xs" x-text="(raman.integrationRangeDGLow && raman.integrationRangeDGHigh) ? \`\${raman.integrationRangeDGLow}-\${raman.integrationRangeDGHigh}\` : '-'"></td>
                      </tr>
                      <tr class="border-t border-gray-200">
                        <td class="px-1 py-1 font-medium border-r border-gray-200 text-xs">Integral A</td>
                        <td class="px-1 py-1 text-center border-r border-gray-200 font-mono text-xs" x-text="(raman.integralTypA2D1 && raman.integralTypA2D2) ? \`\${raman.integralTypA2D1},\${raman.integralTypA2D2}\` : '-'"></td>
                        <td class="px-1 py-1 text-center border-r border-gray-200 font-mono text-xs" x-text="(raman.integralTypAG1 && raman.integralTypAG2) ? \`\${raman.integralTypAG1},\${raman.integralTypAG2}\` : '-'"></td>
                        <td class="px-1 py-1 text-center border-r border-gray-200 font-mono text-xs" x-text="(raman.integralTypAD1 && raman.integralTypAD2) ? \`\${raman.integralTypAD1},\${raman.integralTypAD2}\` : '-'"></td>
                        <td class="px-1 py-1 text-center font-mono text-xs" x-text="(raman.integralTypADG1 && raman.integralTypADG2) ? \`\${raman.integralTypADG1},\${raman.integralTypADG2}\` : '-'"></td>
                      </tr>
                      <tr class="border-t border-gray-200">
                        <td class="px-1 py-1 font-medium border-r border-gray-200 text-xs">Peak J</td>
                        <td class="px-1 py-1 text-center border-r border-gray-200 font-mono text-xs" x-text="(raman.peakHighTypJ2D1 && raman.peakHighTypJ2D2) ? \`\${raman.peakHighTypJ2D1},\${raman.peakHighTypJ2D2}\` : '-'"></td>
                        <td class="px-1 py-1 text-center border-r border-gray-200 font-mono text-xs" x-text="(raman.peakHighTypJG1 && raman.peakHighTypJG2) ? \`\${raman.peakHighTypJG1},\${raman.peakHighTypJG2}\` : '-'"></td>
                        <td class="px-1 py-1 text-center border-r border-gray-200 font-mono text-xs" x-text="(raman.peakHighTypJD1 && raman.peakHighTypJD2) ? \`\${raman.peakHighTypJD1},\${raman.peakHighTypJD2}\` : '-'"></td>
                        <td class="px-1 py-1 text-center font-mono text-xs" x-text="(raman.peakHighTypJDG1 && raman.peakHighTypJDG2) ? \`\${raman.peakHighTypJDG1},\${raman.peakHighTypJDG2}\` : '-'"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <template x-if="raman.comments">
                  <p class="text-gray-600 mt-1" x-text="raman.comments"></p>
                </template>
                <template x-if="raman.ramanReportPath">
                  <div class="mt-2 pt-2 border-t border-gray-200">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-medium text-gray-700">RAMAN Report:</span>
                      <button @click="viewRamanPdf(raman.ramanReportPath)" 
                              class="text-link text-link-hover text-xs font-medium flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        View PDF
                      </button>
                    </div>
                  </div>
                </template>
              </div>
            </template>
          </div>
        </div>
      </template>
      
      <template x-if="!${dataPath} || ${dataPath}.length === 0">
        <div class="bg-gray-100 border border-gray-200 rounded-lg p-3 text-center text-gray-500 text-sm">
          No RAMAN analysis found for this graphene sample
        </div>
      </template>
    </div>
  `;
}

function createTemTestSection(dataPath) {
  return `
    <!-- TEM Test Results -->
    <div>
      <h4 class="text-md font-semibold text-gray-700 mb-3 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        TEM Analysis
      </h4>
      <template x-if="${dataPath} && ${dataPath}.length > 0">
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div class="space-y-2">
            <template x-for="tem in ${dataPath}">
              <div class="bg-white rounded p-2 text-xs border">
                <div class="flex justify-between mb-1">
                  <span class="font-medium">TEM Test</span>
                  <span x-text="window.formatDateSafe(tem.testDate)"></span>
                </div>
                <table class="w-full text-xs">
                  <tr x-show="tem.researchTeam"><td class="font-medium">Research Team:</td><td x-text="tem.researchTeam || 'N/A'"></td></tr>
                  <tr x-show="tem.testingLab"><td class="font-medium">Testing Lab:</td><td x-text="tem.testingLab || 'N/A'"></td></tr>
                </table>
                <template x-if="tem.comments">
                  <p class="text-gray-600 mt-1" x-text="tem.comments"></p>
                </template>
                <template x-if="tem.temReportPath">
                  <div class="mt-2 pt-2 border-t border-gray-200">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-medium text-gray-700">TEM Report:</span>
                      <button @click="viewTemPdf(tem.temReportPath)" 
                              class="text-link text-link-hover text-xs font-medium flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        View PDF
                      </button>
                    </div>
                  </div>
                </template>
              </div>
            </template>
          </div>
        </div>
      </template>
      
      <template x-if="!${dataPath} || ${dataPath}.length === 0">
        <div class="bg-gray-100 border border-gray-200 rounded-lg p-3 text-center text-gray-500 text-sm">
          No TEM analysis found for this graphene sample
        </div>
      </template>
    </div>
  `;
}

function createParticleSizeTestSection(dataPath) {
  return `
    <!-- Particle Size Test Results -->
    <div>
      <h4 class="text-md font-semibold text-gray-700 mb-3 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        Particle Size Analysis
      </h4>
      <template x-if="${dataPath} && ${dataPath}.length > 0">
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div class="space-y-2">
            <template x-for="ps in ${dataPath}">
              <div class="bg-white rounded p-2 text-xs border">
                <div class="flex justify-between mb-1">
                  <span class="font-medium">Particle Size Test</span>
                  <span x-text="window.formatDateSafe(ps.testDate)"></span>
                </div>
                <table class="w-full text-xs">
                  <tr><td class="font-medium">D10:</td><td x-text="ps.d10 ? ps.d10 + ' μm' : 'N/A'"></td></tr>
                  <tr><td class="font-medium">D50 (Median):</td><td x-text="ps.d50 ? ps.d50 + ' μm' : 'N/A'"></td></tr>
                  <tr><td class="font-medium">D90:</td><td x-text="ps.d90 ? ps.d90 + ' μm' : 'N/A'"></td></tr>
                  <tr x-show="ps.meanSize"><td class="font-medium">Mean Size:</td><td x-text="ps.meanSize ? ps.meanSize + ' μm' : 'N/A'"></td></tr>
                  <tr x-show="ps.spanValue"><td class="font-medium">Span Value:</td><td x-text="ps.spanValue || 'N/A'"></td></tr>
                  <tr x-show="ps.testingLab"><td class="font-medium">Testing Lab:</td><td x-text="ps.testingLab || 'N/A'"></td></tr>
                  <tr x-show="ps.testingMethod"><td class="font-medium">Testing Method:</td><td x-text="ps.testingMethod || 'N/A'"></td></tr>
                </table>
                <template x-if="ps.comments">
                  <p class="text-gray-600 mt-1" x-text="ps.comments"></p>
                </template>
                <template x-if="ps.particleSizeReportPath">
                  <div class="mt-2 pt-2 border-t border-gray-200">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-medium text-gray-700">Particle Size Report:</span>
                      <button @click="viewParticleSizePdf(ps.particleSizeReportPath)"
                              class="text-link text-link-hover text-xs font-medium flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        View Report
                      </button>
                    </div>
                  </div>
                </template>
              </div>
            </template>
          </div>
        </div>
      </template>

      <template x-if="!${dataPath} || ${dataPath}.length === 0">
        <div class="bg-gray-100 border border-gray-200 rounded-lg p-3 text-center text-gray-500 text-sm">
          No particle size analysis found for this sample
        </div>
      </template>
    </div>
  `;
}

// Export as default object
export default {
  createTestResultsSection
};