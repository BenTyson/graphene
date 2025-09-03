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
    <div class="bg-white border border-gray-200 rounded-lg p-6 col-span-1 dashboard-widget">
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800">Production</h3>
        <p class="text-sm text-gray-500">Total graphene production metrics</p>
      </div>
      
      <div class="space-y-4">
        <!-- Total Production -->
        <div class="text-center">
          <div class="text-3xl font-mono font-bold text-gray-900">
            ${formatMetricValue(totalProduction)} g
          </div>
          <div class="text-sm text-gray-500 mt-1">Total Produced</div>
          <div class="text-xs text-gray-400 mt-2">${totalExperiments} experiments</div>
        </div>
        
        <!-- Average Output -->
        <div class="border-t border-gray-200 pt-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Average Output</span>
            <span class="font-mono font-bold text-gray-900">${formatMetricValue(averageOutput)} g</span>
          </div>
        </div>
        
        <!-- Current Month -->
        <div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">This Month</span>
            <span class="font-mono font-bold text-gray-900">${formatMetricValue(currentMonth.production || 0)} g</span>
          </div>
          <div class="text-xs text-gray-400 mt-1">
            ${monthChange > 0 ? '↑' : '↓'} ${Math.abs(monthChange)}% vs last month
          </div>
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
 * @param {object} data - Location inventory data
 * @returns {string} HTML for inventory widget
 */
export function createInventoryWidget(data) {
  const { locations = [], inTransit = {}, unshipped = 0 } = data;
  
  // Sort locations by current inventory
  const sortedLocations = locations.sort((a, b) => b.currentInventory - a.currentInventory);
  
  return `
    <div class="bg-white border border-gray-200 rounded-lg p-6 col-span-1 md:col-span-2 dashboard-widget">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-800">Inventory by Location</h3>
        <p class="text-sm text-gray-500">Current graphene distribution</p>
      </div>
      
      <div class="space-y-4">
        ${sortedLocations.slice(0, 5).map(loc => `
          <div class="flex justify-between items-center">
            <div>
              <div class="text-sm font-medium text-gray-900">
                ${loc.location}
                ${loc.isProductionOrigin ? '<span class="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Production Origin</span>' : ''}
              </div>
              <div class="text-xs text-gray-500">
                ${loc.isProductionOrigin ? 'Produced + ' : ''}In: ${formatMetricValue(loc.received)}g | Out: ${formatMetricValue(loc.shipped)}g
              </div>
            </div>
            <div class="text-lg font-mono font-bold text-gray-900">
              ${formatMetricValue(loc.currentInventory)} g
            </div>
          </div>
        `).join('')}
        
        <div class="pt-4 border-t border-gray-200 space-y-3">
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-600">In Transit</div>
            <div class="font-mono font-bold text-gray-900">
              ${formatMetricValue(inTransit.amount || 0)} g
            </div>
          </div>
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-600">Unshipped</div>
            <div class="font-mono font-bold text-gray-900">
              ${formatMetricValue(unshipped)} g
            </div>
          </div>
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
    <div class="bg-white border border-gray-200 rounded-lg p-6 col-span-1 md:col-span-2 dashboard-widget">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-800">Best Test Results</h3>
        <p class="text-sm text-gray-500">Top achievements across all tests</p>
      </div>
      
      <div class="space-y-4">
        <!-- BET Result -->
        ${bet ? `
          <div class="border-l-4 border-gray-700 pl-4">
            <div class="text-sm font-semibold text-gray-700">BET Surface Area</div>
            <div class="text-xl font-mono font-bold text-gray-900 mt-1">
              ${formatScientificNotation(bet.value)} m²/g
            </div>
            <div class="text-xs text-gray-500 mt-1">
              ${bet.experimentNumber} • ${bet.testingLab || 'Lab N/A'}
            </div>
          </div>
        ` : '<div class="text-sm text-gray-400">No BET tests recorded</div>'}
        
        <!-- Conductivity Result -->
        ${conductivity ? `
          <div class="border-l-4 border-gray-600 pl-4">
            <div class="text-sm font-semibold text-gray-700">Conductivity (20kN)</div>
            <div class="text-xl font-mono font-bold text-gray-900 mt-1">
              ${formatMetricValue(conductivity.value20kN)} S/cm
            </div>
            <div class="text-xs text-gray-500 mt-1">
              ${conductivity.experimentNumber}
            </div>
          </div>
        ` : '<div class="text-sm text-gray-400">No conductivity tests recorded</div>'}
        
        <!-- RAMAN Result -->
        ${raman ? `
          <div class="border-l-4 border-gray-500 pl-4">
            <div class="text-sm font-semibold text-gray-700">RAMAN D/G Ratio</div>
            <div class="text-xl font-mono font-bold text-gray-900 mt-1">
              ${formatMetricValue(raman.dgRatio)}
            </div>
            <div class="text-xs text-gray-500 mt-1">
              ${raman.experimentNumber} • ${raman.testingLab || 'Lab N/A'}
            </div>
          </div>
        ` : '<div class="text-sm text-gray-400">No RAMAN tests recorded</div>'}
        
        <!-- TEM Tests -->
        <div class="border-l-4 border-gray-400 pl-4">
          <div class="text-sm font-semibold text-gray-700">TEM Analysis</div>
          <div class="text-xl font-mono font-bold text-gray-900 mt-1">
            ${tem.totalTests || 0} Tests
          </div>
          ${tem.latest ? `
            <div class="text-xs text-gray-500 mt-1">
              Latest: ${tem.latest.experimentNumber}
            </div>
          ` : '<div class="text-xs text-gray-400 mt-1">No tests performed</div>'}
        </div>
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