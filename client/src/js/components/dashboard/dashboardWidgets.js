/**
 * Dashboard Widget Components
 * Reusable modular components for the dashboard interface
 */

/**
 * Create a metric card widget
 * @param {object} config - Widget configuration
 * @returns {string} HTML for metric card
 */
export function createMetricCard(config) {
  const { title, value, unit = '', label, trend = null, icon = null, size = 'medium' } = config;
  
  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-3',
    full: 'col-span-1 md:col-span-4'
  };
  
  const trendIndicator = trend ? `
    <div class="flex items-center mt-2 text-xs ${trend > 0 ? 'text-gray-600' : 'text-gray-500'}">
      ${trend > 0 ? 
        '<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>' :
        '<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>'
      }
      <span>${Math.abs(trend)}% ${trend > 0 ? 'increase' : 'decrease'}</span>
    </div>
  ` : '';
  
  return `
    <div class="bg-white border border-gray-200 rounded-lg p-6 ${sizeClasses[size]} dashboard-widget">
      <div class="flex justify-between items-start mb-4">
        <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wider">${title}</h3>
        ${icon ? `<span class="text-gray-400">${icon}</span>` : ''}
      </div>
      <div class="metric-body">
        <div class="text-3xl font-mono font-bold text-gray-900">
          ${formatMetricValue(value)} ${unit}
        </div>
        ${label ? `<div class="text-sm text-gray-500 mt-1">${label}</div>` : ''}
        ${trendIndicator}
      </div>
    </div>
  `;
}

/**
 * Create a production metrics widget
 * @param {object} data - Production metrics data
 * @returns {string} HTML for production widget
 */
export function createProductionWidget(data) {
  const { totalProduction = 0, totalExperiments = 0, averageOutput = 0, currentMonth = {}, previousMonth = {} } = data;
  
  const monthChange = previousMonth.production > 0 
    ? ((currentMonth.production - previousMonth.production) / previousMonth.production * 100).toFixed(1)
    : 0;
  
  return `
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 col-span-full dashboard-widget">
      <div class="mb-6">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center dashboard-icon">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-900 dashboard-section-title">Production Dashboard</h3>
            <p class="text-base text-gray-600 dashboard-metric-label">Total graphene metrics across all experiments</p>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <!-- Total Production -->
        <div class="text-center bg-gray-50 rounded-lg p-6 border border-gray-100">
          <div class="text-5xl dashboard-metric-value text-gray-900 mb-2">
            ${formatMetricValue(totalProduction)}
            <span class="text-3xl text-gray-600">g</span>
          </div>
          <div class="text-lg dashboard-metric-label text-gray-800 font-semibold">Total Produced</div>
          <div class="text-sm text-gray-600 mt-1 dashboard-metric-label">${totalExperiments} experiments</div>
        </div>
        
        <!-- Average Output -->
        <div class="text-center bg-gray-50 rounded-lg p-6 border border-gray-100">
          <div class="text-5xl dashboard-metric-value text-gray-900 mb-2">
            ${formatMetricValue(averageOutput)}
            <span class="text-3xl text-gray-600">g</span>
          </div>
          <div class="text-lg dashboard-metric-label text-gray-800 font-semibold">Average Output</div>
          <div class="text-sm text-gray-600 mt-1 dashboard-metric-label">per experiment</div>
        </div>
        
        <!-- Current Month -->
        <div class="text-center bg-gray-50 rounded-lg p-6 border border-gray-100">
          <div class="text-5xl dashboard-metric-value text-gray-900 mb-2">
            ${formatMetricValue(currentMonth.production || 0)}
            <span class="text-3xl text-gray-600">g</span>
          </div>
          <div class="text-lg dashboard-metric-label text-gray-800 font-semibold">This Month</div>
          <div class="text-sm text-gray-600 mt-1 dashboard-metric-label">${currentMonth.experiments || 0} experiments</div>
        </div>
        
        <!-- Month Change -->
        <div class="text-center rounded-lg p-6 border ${monthChange >= 0 ? 'bg-link-light border-link text-link-dark' : 'bg-gray-100 border-gray-300 text-gray-700'}">
          <div class="text-5xl dashboard-metric-value mb-2 ${monthChange >= 0 ? 'text-link' : 'text-gray-700'}">
            ${Math.abs(monthChange)}
            <span class="text-3xl">%</span>
          </div>
          <div class="text-lg dashboard-metric-label font-semibold ${monthChange >= 0 ? 'text-link-dark' : 'text-gray-800'}">
            ${monthChange >= 0 ? 'Increase' : 'Decrease'}
          </div>
          <div class="text-sm mt-1 dashboard-metric-label ${monthChange >= 0 ? 'text-link-medium' : 'text-gray-600'}">vs last month</div>
        </div>
      </div>
      
    </div>
  `;
}

/**
 * Create a simple bar chart for monthly trends
 * @param {array} monthlyData - Array of monthly production data
 * @returns {string} HTML for trend chart
 */
function createMonthlyTrendChart(monthlyData) {
  if (!monthlyData || monthlyData.length === 0) return '';
  
  const maxValue = Math.max(...monthlyData.map(m => parseFloat(m.production || 0)));
  
  return `
    <div class="mt-6 pt-6 border-t border-gray-200">
      <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Monthly Production Trend</h4>
      <div class="flex items-end justify-between space-x-2" style="height: 80px;">
        ${monthlyData.map(month => {
          const height = maxValue > 0 ? (parseFloat(month.production || 0) / maxValue * 100) : 0;
          return `
            <div class="flex-1 flex flex-col items-center">
              <div class="w-full bg-gray-200 rounded-t relative" style="height: ${height}%;">
                <div class="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-mono text-gray-600">
                  ${parseFloat(month.production || 0).toFixed(0)}
                </div>
              </div>
              <div class="text-xs text-gray-400 mt-1">${month.month.split(' ')[0]}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * Create inventory location widget
 * @param {object} data - Location inventory data with micronization accounting
 * @returns {string} HTML for inventory widget
 */
export function createInventoryWidget(data) {
  const { 
    locations = [], 
    inTransit = {}, 
    unshipped = {}, 
    micronizationSummary = {},
    totalInventory = {} 
  } = data;
  
  // Sort locations by total current inventory
  const sortedLocations = locations.sort((a, b) => (b.totalCurrent || 0) - (a.totalCurrent || 0));
  
  return `
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 col-span-1 dashboard-widget">
      <div class="mb-6">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center dashboard-icon">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900 dashboard-section-title">Inventory by Location</h3>
            <p class="text-sm text-gray-600 dashboard-metric-label">Material distribution tracking</p>
          </div>
        </div>
      </div>
      
      <div class="space-y-4">
        ${sortedLocations.slice(0, 5).map(loc => `
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <div class="flex justify-between items-center mb-3">
              <div class="flex items-center space-x-2">
                <div class="text-base font-semibold text-gray-900 dashboard-metric-label">${loc.location}</div>
                ${loc.isProductionOrigin ? '<span class="text-xs bg-link-light text-link-dark px-2 py-1 rounded-full font-medium">Origin</span>' : ''}
              </div>
              <div class="text-2xl dashboard-metric-value text-gray-900">
                ${formatMetricValue(loc.totalCurrent || 0)}
                <span class="text-lg text-gray-600">g</span>
              </div>
            </div>
            
            <!-- Material breakdown -->
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div class="text-center bg-white border border-gray-200 rounded-lg p-3">
                <div class="text-gray-700 font-medium mb-1 dashboard-metric-label">Raw</div>
                <div class="dashboard-metric-value text-gray-900">${formatMetricValue(loc.rawGraphene?.current || 0)}<span class="text-xs text-gray-500 ml-1">g</span></div>
              </div>
              <div class="text-center bg-link-light border border-link rounded-lg p-3">
                <div class="text-link-dark font-medium mb-1 dashboard-metric-label">Compound</div>
                <div class="dashboard-metric-value text-link">${formatMetricValue(loc.compoundBatch?.current || 0)}<span class="text-xs text-gray-500 ml-1">g</span></div>
                ${loc.compoundBatch?.processed > 0 ? `<div class="text-xs text-link-medium mt-1 dashboard-metric-label">${formatMetricValue(loc.compoundBatch.processed)}g processed</div>` : ''}
              </div>
              <div class="text-center bg-white border border-gray-200 rounded-lg p-3">
                <div class="text-gray-700 font-medium mb-1 dashboard-metric-label">Micronized</div>
                <div class="dashboard-metric-value text-gray-900">${formatMetricValue(loc.micronized?.current || 0)}<span class="text-xs text-gray-500 ml-1">g</span></div>
                ${loc.micronized?.producedHere > 0 ? `<div class="text-xs text-gray-600 mt-1 dashboard-metric-label">${formatMetricValue(loc.micronized.producedHere)}g produced</div>` : ''}
              </div>
            </div>
          </div>
        `).join('')}
        
        <div class="pt-5 border-t border-gray-200 space-y-4">
          <!-- In Transit Summary -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-100 border border-gray-300 rounded-lg p-3">
              <div class="text-sm font-semibold text-gray-800 mb-2 dashboard-metric-label">In Transit</div>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-700 dashboard-metric-label">Raw</span>
                  <span class="dashboard-metric-value text-gray-900">${formatMetricValue(inTransit.rawGraphene?.amount || 0)}<span class="text-xs text-gray-500 ml-1">g</span></span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-700 dashboard-metric-label">Micronized</span>
                  <span class="dashboard-metric-value text-gray-900">${formatMetricValue(inTransit.micronized?.amount || 0)}<span class="text-xs text-gray-500 ml-1">g</span></span>
                </div>
                <div class="flex justify-between text-sm font-semibold border-t border-gray-300 pt-2">
                  <span class="text-gray-800 dashboard-metric-label">Total</span>
                  <span class="dashboard-metric-value text-gray-900">${formatMetricValue(inTransit.total?.amount || 0)}<span class="text-xs text-gray-500 ml-1">g</span></span>
                </div>
              </div>
            </div>
            
            <div class="bg-link-light border border-link rounded-lg p-3">
              <div class="text-sm font-semibold text-link-dark mb-2 dashboard-metric-label">Unshipped</div>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-link-medium dashboard-metric-label">Raw</span>
                  <span class="dashboard-metric-value text-link">${formatMetricValue(unshipped.rawGraphene || 0)}<span class="text-xs text-gray-500 ml-1">g</span></span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-link-medium dashboard-metric-label">Micronized</span>
                  <span class="dashboard-metric-value text-link">${formatMetricValue(unshipped.micronized || 0)}<span class="text-xs text-gray-500 ml-1">g</span></span>
                </div>
                <div class="flex justify-between text-sm font-semibold border-t border-link pt-2">
                  <span class="text-link-dark dashboard-metric-label">Total</span>
                  <span class="dashboard-metric-value text-link">${formatMetricValue(unshipped.total || 0)}<span class="text-xs text-gray-500 ml-1">g</span></span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Micronization Summary -->
          ${micronizationSummary.totalInput ? `
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="text-sm font-semibold text-gray-800 mb-3 dashboard-metric-label">Micronization Summary</div>
              <div class="grid grid-cols-3 gap-4 text-sm">
                <div class="text-center">
                  <div class="text-gray-700 font-medium mb-1 dashboard-metric-label">Input</div>
                  <div class="dashboard-metric-value text-gray-900">${formatMetricValue(micronizationSummary.totalInput)}<span class="text-xs text-gray-500 ml-1">g</span></div>
                </div>
                <div class="text-center">
                  <div class="text-gray-700 font-medium mb-1 dashboard-metric-label">Recovered</div>
                  <div class="dashboard-metric-value text-gray-900">${formatMetricValue(micronizationSummary.totalRecovered)}<span class="text-xs text-gray-500 ml-1">g</span></div>
                </div>
                <div class="text-center">
                  <div class="text-link-dark font-medium mb-1 dashboard-metric-label">Recovery</div>
                  <div class="dashboard-metric-value text-link">${micronizationSummary.recoveryRate.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * Create best test results widget
 * @param {object} data - Test results data
 * @returns {string} HTML for test results widget
 */
export function createTestResultsWidget(data) {
  const { bet = null, conductivity = null, raman = null, tem = {} } = data;
  
  return `
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 col-span-1 dashboard-widget">
      <div class="mb-6">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center dashboard-icon">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900 dashboard-section-title">Best Test Results</h3>
            <p class="text-sm text-gray-600 dashboard-metric-label">Top achievements across all tests</p>
          </div>
        </div>
      </div>
      
      <div class="space-y-4">
        <!-- BET Result -->
        ${bet ? `
          <div class="bg-gray-50 border-l-4 border-link rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-base font-semibold text-link-dark mb-1 dashboard-metric-label">BET Surface Area</div>
                <div class="text-2xl dashboard-metric-value text-link">
                  ${formatScientificNotation(bet.value)}
                  <span class="text-lg text-gray-600 ml-1">m²/g</span>
                </div>
                <div class="text-sm text-gray-600 mt-1 flex items-center space-x-2 dashboard-metric-label">
                  <span class="dashboard-metric-value">${bet.experimentNumber}</span>
                  <span class="text-gray-400">•</span>
                  <span>${bet.testingLab || 'Lab N/A'}</span>
                </div>
              </div>
              <div class="w-12 h-12 bg-link-light rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-link" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                </svg>
              </div>
            </div>
          </div>
        ` : '<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-400 dashboard-metric-label">No BET tests recorded</div>'}
        
        <!-- Conductivity Result -->
        ${conductivity ? `
          <div class="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-base font-semibold text-gray-800 mb-1 dashboard-metric-label">Conductivity (20kN)</div>
                <div class="text-2xl dashboard-metric-value text-gray-900">
                  ${formatMetricValue(conductivity.value20kN)}
                  <span class="text-lg text-gray-600 ml-1">S/cm</span>
                </div>
                <div class="text-sm text-gray-600 mt-1 dashboard-metric-label">
                  <span class="dashboard-metric-value">${conductivity.experimentNumber}</span>
                </div>
              </div>
              <div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
            </div>
          </div>
        ` : '<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-400 dashboard-metric-label">No conductivity tests recorded</div>'}
        
        <!-- RAMAN Result -->
        ${raman ? `
          <div class="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-base font-semibold text-gray-800 mb-1 dashboard-metric-label">RAMAN D/G Ratio</div>
                <div class="text-2xl dashboard-metric-value text-gray-900">
                  ${formatMetricValue(raman.dgRatio)}
                </div>
                <div class="text-sm text-gray-600 mt-1 flex items-center space-x-2 dashboard-metric-label">
                  <span class="dashboard-metric-value">${raman.experimentNumber}</span>
                  <span class="text-gray-400">•</span>
                  <span>${raman.testingLab || 'Lab N/A'}</span>
                </div>
              </div>
              <div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
            </div>
          </div>
        ` : '<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-400 dashboard-metric-label">No RAMAN tests recorded</div>'}
        
        <!-- TEM Tests -->
        ${tem.latest ? `
          <div class="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-base font-semibold text-gray-800 mb-1 dashboard-metric-label">Latest TEM Analysis</div>
                <div class="text-2xl dashboard-metric-value text-gray-900">
                  ${tem.latest.experimentNumber}
                </div>
                <div class="text-sm text-gray-600 mt-1 flex items-center space-x-2 dashboard-metric-label">
                  <span>${tem.latest.testingLab || 'Lab N/A'}</span>
                  <span class="text-gray-400">•</span>
                  <span>${tem.totalTests} total tests</span>
                </div>
              </div>
              <div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </div>
            </div>
          </div>
        ` : '<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-400 dashboard-metric-label">No TEM tests recorded</div>'}
      </div>
    </div>
  `;
}

/**
 * Create recent activity widget
 * @param {object} data - Recent activity data
 * @returns {string} HTML for activity widget
 */
export function createActivityWidget(data) {
  const { experiments = [], shipments = [], tests = [] } = data;
  
  return `
    <div class="bg-white border border-gray-200 rounded-lg p-6 col-span-1 md:col-span-4 dashboard-widget">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-800">Recent Activity</h3>
        <p class="text-sm text-gray-500">Latest experiments, shipments, and tests</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Recent Experiments -->
        <div>
          <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Latest Experiments</h4>
          <div class="space-y-2">
            ${experiments.slice(0, 5).map(exp => `
              <div class="text-sm">
                <div class="font-mono font-medium text-gray-900">${exp.experimentNumber}</div>
                <div class="text-xs text-gray-500">
                  ${exp.output ? `${formatMetricValue(exp.output)}g` : 'No output'} • 
                  ${exp.species || 'N/A'} • 
                  ${formatDate(exp.experimentDate)}
                </div>
              </div>
            `).join('') || '<div class="text-sm text-gray-400">No recent experiments</div>'}
          </div>
        </div>
        
        <!-- Recent Shipments -->
        <div>
          <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Latest Shipments</h4>
          <div class="space-y-2">
            ${shipments.slice(0, 5).map(ship => `
              <div class="text-sm">
                <div class="font-mono font-medium text-gray-900">${ship.shipmentNumber}</div>
                <div class="text-xs text-gray-500">
                  ${formatMetricValue(ship.amountShipped)}g • 
                  ${ship.shipToLocation} • 
                  <span class="inline-flex px-1 py-0.5 text-xs rounded ${getStatusColor(ship.status)}">
                    ${ship.status}
                  </span>
                </div>
              </div>
            `).join('') || '<div class="text-sm text-gray-400">No recent shipments</div>'}
          </div>
        </div>
        
        <!-- Recent Tests -->
        <div>
          <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Latest Tests</h4>
          <div class="space-y-2">
            ${tests.slice(0, 5).map(test => `
              <div class="text-sm">
                <div class="font-mono font-medium text-gray-900">${test.type} Test</div>
                <div class="text-xs text-gray-500">
                  ${test.sample} • ${test.result} • ${formatDate(test.date)}
                </div>
              </div>
            `).join('') || '<div class="text-sm text-gray-400">No recent tests</div>'}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Format metric values for display
 */
function formatMetricValue(value) {
  if (value === null || value === undefined) return '0';
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  
  // For large numbers, add thousand separators
  if (num >= 1000) {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
  return num.toFixed(2);
}

/**
 * Format scientific notation values
 */
function formatScientificNotation(value) {
  if (!value) return 'N/A';
  const num = parseFloat(value);
  if (num >= 1000) {
    const exponent = Math.floor(Math.log10(num));
    const mantissa = (num / Math.pow(10, exponent)).toFixed(2);
    return `${mantissa} × 10<sup>${exponent}</sup>`;
  }
  return num.toFixed(2);
}

/**
 * Format dates for display
 */
function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Get status color classes
 */
function getStatusColor(status) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    shipped: 'bg-blue-100 text-blue-800',
    in_transit: 'bg-purple-100 text-purple-800',
    received: 'bg-green-100 text-green-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Create loading skeleton for widgets
 */
export function createLoadingSkeleton() {
  return `
    <div class="animate-pulse">
      <div class="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div class="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  `;
}

/**
 * Create error message widget
 */
export function createErrorWidget(message) {
  return `
    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="text-sm text-red-800">${message}</span>
      </div>
    </div>
  `;
}