/**
 * AI Insights Tab Component
 * 
 * Provides AI-powered analysis of graphene production data including:
 * - Correlation analysis between process variables and outcomes
 * - Yield and quality optimization recommendations  
 * - Production scaling insights for larger ovens
 * - AI-suggested next experiments
 * - Custom analysis queries
 * 
 * Features:
 * - Real-time AI analysis with OpenAI integration
 * - Interactive visualizations and charts
 * - Smart caching to manage API costs
 * - Continuous learning from new test data
 * 
 * Dependencies:
 * - Alpine.js: aiInsightsData, aiInsightsLoading, aiInsightsError
 * - Alpine.js methods: loadAIInsights(), refreshAIInsights()
 * - API: /api/ai-insights/*
 */

/**
 * Returns the complete HTML for the AI Insights tab component
 * @returns {string} HTML string for the AI Insights tab
 */
function getAIInsightsTabHtml() {
  return `
    <!-- AI Insights Tab -->
    <div x-show="activeTab === 'ai-insights'" x-cloak>
      
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-3xl font-bold text-gray-900">Insights</h2>
          </div>
          <button @click="refreshAIInsights()" 
                  :disabled="aiInsightsLoading"
                  class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors">
            <span x-show="!aiInsightsLoading">Refresh Analysis</span>
            <span x-show="aiInsightsLoading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div x-show="aiInsightsLoading && !aiInsightsData" class="animate-pulse">
        <!-- Hero Metrics Loading -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-gray-200 h-32 rounded-lg"></div>
          <div class="bg-gray-200 h-32 rounded-lg"></div>
          <div class="bg-gray-200 h-32 rounded-lg"></div>
        </div>
        <!-- Analysis Loading -->
        <div class="bg-gray-200 h-64 rounded-lg mb-8"></div>
        <div class="bg-gray-200 h-48 rounded-lg"></div>
      </div>

      <!-- Error State -->
      <div x-show="aiInsightsError && !aiInsightsLoading" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="text-sm text-red-800" x-text="aiInsightsError"></span>
          <button @click="refreshAIInsights()" class="ml-auto text-sm text-red-600 hover:text-red-800 font-medium">
            Retry
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div x-show="aiInsightsData && !aiInsightsLoading">
        
        <!-- Quick Insights Alert Bar -->
        <div x-show="aiInsightsData?.dashboard?.quickInsight" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800">Latest AI Analysis</h3>
              <div class="mt-2 text-sm text-blue-700" x-html="renderMarkdown(aiInsightsData?.dashboard?.quickInsight || '')"></div>
            </div>
          </div>
        </div>

        <!-- Analysis Configuration -->
        <div class="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900">🔧 Analysis Configuration</h3>
            <div class="flex space-x-2">
              <button @click="applyFilters()" 
                      :disabled="filtersLoading"
                      class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 text-sm">
                <span x-show="!filtersLoading">Apply Filters</span>
                <span x-show="filtersLoading">Applying...</span>
              </button>
              <button @click="resetFilters()" 
                      class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                Reset
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Oven Type Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Oven Type</label>
              <select x-model="analysisFilters.oven" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Ovens</option>
                <option value="A">Oven A</option>
                <option value="B">Oven B</option>
                <option value="C">Oven C</option>
              </select>
            </div>
            
            <!-- Species Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Species</label>
              <select x-model="analysisFilters.species" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Species</option>
                <option value="1">Species 1</option>
                <option value="2">Species 2</option>
                <option value="1/2 Mix">1/2 Mix</option>
                <option value="Mostly 1">Mostly 1</option>
                <option value="Mostly 2">Mostly 2</option>
                <option value="Mostly 1/2 Mix">Mostly 1/2 Mix</option>
                <option value="1 + Fibres">1 + Fibres</option>
              </select>
            </div>
            
            <!-- Time Range Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
              <select x-model="analysisFilters.timeRange" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Time</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="180">Last 6 months</option>
                <option value="365">Last year</option>
              </select>
            </div>
            
            <!-- Include Data Types -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Include Data</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input type="checkbox" x-model="analysisFilters.includeCompoundBatches" 
                         class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="ml-2 text-sm text-gray-700">Compound Batches</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" x-model="analysisFilters.includeMicronization" 
                         class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="ml-2 text-sm text-gray-700">Micronization</span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Active Filters Display -->
          <div x-show="hasActiveFilters()" class="mt-4 pt-4 border-t border-gray-100">
            <div class="flex flex-wrap gap-2">
              <span class="text-sm text-gray-600">Active filters:</span>
              <span x-show="analysisFilters.oven" class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                Oven: <span x-text="analysisFilters.oven"></span>
              </span>
              <span x-show="analysisFilters.species" class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                Species: <span x-text="analysisFilters.species"></span>
              </span>
              <span x-show="analysisFilters.timeRange" class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                <span x-text="analysisFilters.timeRange + ' days'"></span>
              </span>
              <span x-show="analysisFilters.includeCompoundBatches" class="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                Compound Batches
              </span>
              <span x-show="analysisFilters.includeMicronization" class="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs">
                Micronization
              </span>
            </div>
          </div>
        </div>

        <!-- Analysis Sections -->
        <div class="space-y-8">
          
          <!-- Correlation Analysis -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-semibold text-gray-900">Process Variable Correlations</h3>
              <button @click="loadCorrelationAnalysis()" 
                      :disabled="correlationLoading"
                      class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50">
                <span x-show="!correlationLoading">Analyze</span>
                <span x-show="correlationLoading">Analyzing...</span>
              </button>
            </div>
            
            <div x-show="correlationLoading" class="animate-pulse bg-gray-100 h-48 rounded"></div>
            
            <div x-show="correlationData && !correlationLoading" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-medium text-gray-900 mb-2">Data Quality</h4>
                  <div class="text-sm text-gray-600 space-y-1">
                    <div x-text="'Total experiments analyzed: ' + (correlationData?.totalExperiments || 0)"></div>
                    <div x-text="'With BET data: ' + (correlationData?.dataQuality?.withBET || 0)"></div>
                    <div x-text="'With conductivity data: ' + (correlationData?.dataQuality?.withConductivity || 0)"></div>
                    <div x-text="'Average yield: ' + (correlationData?.dataQuality?.avgYield || 0).toFixed(2) + 'g'"></div>
                  </div>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 mb-2">Analysis Scope</h4>
                  <div class="text-sm text-gray-600 space-y-1">
                    <div x-text="'Time range: ' + (correlationData?.timeRange === 'all' ? 'All experiments' : correlationData?.timeRange + ' days')"></div>
                    <div x-text="'Updated: ' + (correlationData?.updatedAt ? new Date(correlationData.updatedAt).toLocaleString() : '')"></div>
                  </div>
                </div>
              </div>
              
              <!-- AI Analysis Results -->
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-3">AI Analysis Results</h4>
                <div class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed" x-html="renderMarkdown(correlationData?.analysis || '')"></div>
              </div>
            </div>
          </div>

          <!-- Optimization Recommendations -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-semibold text-gray-900">Yield & Quality Optimization</h3>
              <button @click="loadOptimizationAnalysis()" 
                      :disabled="optimizationLoading"
                      class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50">
                <span x-show="!optimizationLoading">Optimize</span>
                <span x-show="optimizationLoading">Optimizing...</span>
              </button>
            </div>
            
            <div x-show="optimizationLoading" class="animate-pulse bg-gray-100 h-48 rounded"></div>
            
            <div x-show="optimizationData && !optimizationLoading" class="space-y-4">
              <!-- Top Performers -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div x-show="optimizationData?.topPerformers?.bestYield">
                  <h4 class="font-medium text-gray-900 mb-2">Best Yield Performance</h4>
                  <div class="bg-green-50 border border-green-200 rounded p-3">
                    <div class="font-mono text-lg text-green-800" x-text="optimizationData?.topPerformers?.bestYield?.experimentNumber"></div>
                    <div class="text-sm text-green-700" x-text="(optimizationData?.topPerformers?.bestYield?.output || 0) + 'g yield'"></div>
                  </div>
                </div>
                <div x-show="optimizationData?.topPerformers?.bestBET">
                  <h4 class="font-medium text-gray-900 mb-2">Best Quality Performance</h4>
                  <div class="bg-blue-50 border border-blue-200 rounded p-3">
                    <div class="font-mono text-lg text-blue-800" x-text="optimizationData?.topPerformers?.bestBET?.experimentNumber"></div>
                    <div class="text-sm text-blue-700" x-text="'Quality leader'"></div>
                  </div>
                </div>
              </div>
              
              <!-- Optimization Analysis -->
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-3">AI Optimization Recommendations</h4>
                <div class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed" x-html="renderMarkdown(optimizationData?.analysis || '')"></div>
              </div>
            </div>
          </div>

          <!-- Production Scaling Analysis -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-semibold text-gray-900">Production Scaling Insights</h3>
              <button @click="loadScalingAnalysis()" 
                      :disabled="scalingLoading"
                      class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50">
                <span x-show="!scalingLoading">Analyze Scaling</span>
                <span x-show="scalingLoading">Analyzing...</span>
              </button>
            </div>
            
            <div x-show="scalingLoading" class="animate-pulse bg-gray-100 h-48 rounded"></div>
            
            <div x-show="scalingData && !scalingLoading" class="space-y-4">
              <!-- Scaling Parameters -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-purple-50 border border-purple-200 rounded p-3">
                  <div class="text-sm text-purple-700">Target Oven Size</div>
                  <div class="font-medium text-purple-900" x-text="scalingData?.targetOvenSize"></div>
                </div>
                <div class="bg-purple-50 border border-purple-200 rounded p-3">
                  <div class="text-sm text-purple-700">Target Production</div>
                  <div class="font-medium text-purple-900" x-text="scalingData?.currentProductionRate + ' kg/month'"></div>
                </div>
                <div class="bg-purple-50 border border-purple-200 rounded p-3">
                  <div class="text-sm text-purple-700">Scaling Readiness</div>
                  <div class="font-medium text-green-800">Analyzing...</div>
                </div>
              </div>
              
              <!-- Scaling Analysis -->
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-3">AI Scaling Analysis</h4>
                <div class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed" x-html="renderMarkdown(scalingData?.scalingRecommendations || '')"></div>
              </div>
            </div>
          </div>

          <!-- Next Experiment Suggestions -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-semibold text-gray-900">AI-Suggested Next Experiments</h3>
              <button @click="loadExperimentSuggestions()" 
                      :disabled="suggestionsLoading"
                      class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50">
                <span x-show="!suggestionsLoading">Get Suggestions</span>
                <span x-show="suggestionsLoading">Generating...</span>
              </button>
            </div>
            
            <div x-show="suggestionsLoading" class="animate-pulse bg-gray-100 h-48 rounded"></div>
            
            <div x-show="suggestionsData && !suggestionsLoading" class="space-y-4">
              <!-- Current Coverage -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-medium text-gray-900 mb-2">Experimental Coverage</h4>
                  <div class="text-sm text-gray-600 space-y-1">
                    <div x-text="'Total experiments: ' + (suggestionsData?.experimentalCoverage?.totalExperiments || 0)"></div>
                    <div x-text="'Species tested: ' + (suggestionsData?.experimentalCoverage?.parameterRanges?.species?.length || 0)"></div>
                    <div x-text="'Base types: ' + (suggestionsData?.experimentalCoverage?.parameterRanges?.baseTypes?.length || 0)"></div>
                  </div>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 mb-2">Analysis Priorities</h4>
                  <div class="text-sm text-gray-600">
                    <div x-text="'Focus areas: ' + (suggestionsData?.priorities?.join(', ') || '')"></div>
                  </div>
                </div>
              </div>
              
              <!-- Experiment Suggestions -->
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-3">AI Experiment Suggestions</h4>
                <div class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed" x-html="renderMarkdown(suggestionsData?.suggestions || '')"></div>
              </div>
            </div>
          </div>

          <!-- Custom Analysis Query -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">Custom AI Analysis</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Ask the AI about your production data:</label>
                <textarea x-model="customQuery" 
                         placeholder="e.g., 'What parameters lead to the highest conductivity results?' or 'How does grinding method affect surface area?'"
                         class="w-full h-24 px-3 py-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
              
              <div class="flex items-center space-x-4">
                <button @click="performCustomAnalysis()" 
                        :disabled="!customQuery || customAnalysisLoading"
                        class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors">
                  <span x-show="!customAnalysisLoading">Analyze</span>
                  <span x-show="customAnalysisLoading" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                </button>
                
                <select x-model="customAnalysisContext" class="px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="general">General Analysis</option>
                  <option value="recent">Focus on Recent Data</option>
                  <option value="quality">Focus on Quality Metrics</option>
                </select>
              </div>
              
              <div x-show="customAnalysisResult" class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-2">AI Response</h4>
                <div class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed" x-html="renderMarkdown(customAnalysisResult || '')"></div>
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- No Data State -->
      <div x-show="!aiInsightsData && !aiInsightsLoading && !aiInsightsError" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No AI insights loaded</h3>
        <p class="text-gray-600 mb-6">Click "Refresh Analysis" to start AI-powered analysis of your production data.</p>
        <button @click="refreshAIInsights()" class="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
          Start AI Analysis
        </button>
      </div>

    </div>
  `;
}

// Make function globally available for Alpine.js templates
if (typeof window !== 'undefined') {
  window.getAIInsightsTabHtml = getAIInsightsTabHtml;
}

// Export for ES6 module usage
export { getAIInsightsTabHtml };