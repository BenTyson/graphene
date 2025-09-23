/**
 * Analysis Tab Component
 * 
 * Provides competitive benchmarking interface showing graphene material
 * performance against industry standards (activated carbon, carbon black, synthetic graphite)
 * 
 * Features:
 * - Executive dashboard with hero metric cards
 * - Detailed comparison charts for primary metrics
 * - Industry benchmark visualization
 * - Performance trend analysis
 * 
 * Dependencies:
 * - Alpine.js data: activeTab, analysisData, analysisLoading, analysisError
 * - Alpine.js methods: loadAnalysisData(), refreshAnalysis()
 * - API: /api/analysis/competitive-metrics
 */

/**
 * Returns the complete HTML for the Analysis tab component
 * @returns {string} HTML string for the Analysis tab
 */
function getAnalysisTabHtml() {
  return `
    <!-- Analysis Tab -->
    <div x-show="activeTab === 'analysis'" x-cloak x-init="if (activeTab === 'analysis') { loadCharacterizationData(); loadCharacterizationReferences(); }">

      <!-- Characterization Comparison Section -->
      ${window.getCharacterizationComparisonHtml?.() || ''}

      <!-- Divider -->
      <div class="border-t border-gray-200 my-12"></div>

      <!-- Competitive Analysis Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900">Competitive Analysis</h2>
        <p class="text-sm text-gray-600 mt-1">Compare our best results against industry standards and competitive materials</p>
      </div>

      <!-- Loading State -->
      <div x-show="analysisLoading" class="animate-pulse">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-gray-200 h-32 rounded-lg"></div>
          <div class="bg-gray-200 h-32 rounded-lg"></div>
          <div class="bg-gray-200 h-32 rounded-lg"></div>
        </div>
        <div class="bg-gray-200 h-64 rounded-lg"></div>
      </div>

      <!-- Error State -->
      <div x-show="analysisError && !analysisLoading" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="text-sm text-red-800" x-text="analysisError"></span>
          <button @click="refreshAnalysis()" class="ml-auto text-sm text-red-600 hover:text-red-800">
            Retry
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div x-show="!analysisLoading && !analysisError">
        
        <!-- Executive Dashboard - Hero Metric Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          <!-- BET Surface Area Card -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">BET Surface Area</h3>
              <div class="w-3 h-3 rounded-full" 
                   :class="analysisData?.bet?.status === 'leading' ? 'bg-green-500' : 
                          analysisData?.bet?.status === 'competitive' ? 'bg-yellow-500' : 'bg-red-500'">
              </div>
            </div>
            <div class="space-y-3">
              <div>
                <div class="text-2xl font-bold text-gray-900">
                  <span x-text="analysisData?.bet?.yourBest || '---'"></span>
                  <span class="text-sm font-normal text-gray-500">m²/g</span>
                </div>
                <div class="text-xs text-gray-600">Our Best Result</div>
              </div>
              <div class="pt-3 border-t border-gray-100">
                <div class="text-sm text-gray-700 mb-2">Industry Benchmarks:</div>
                <div class="space-y-1 text-xs text-gray-600">
                  <div class="flex justify-between items-center">
                    <span class="flex items-center">
                      <div class="w-2 h-2 rounded-full mr-2" 
                           :class="(analysisData?.bet?.yourBest || 0) >= 2000 ? 'bg-green-500' : 
                                  (analysisData?.bet?.yourBest || 0) >= 500 ? 'bg-yellow-500' : 'bg-red-500'"></div>
                      Activated Carbon:
                    </span>
                    <span>500-2,000 m²/g</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="flex items-center">
                      <div class="w-2 h-2 rounded-full mr-2" 
                           :class="(analysisData?.bet?.yourBest || 0) >= 1500 ? 'bg-green-500' : 
                                  (analysisData?.bet?.yourBest || 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'"></div>
                      Carbon Black:
                    </span>
                    <span>50-1,500 m²/g</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="flex items-center">
                      <div class="w-2 h-2 rounded-full mr-2" 
                           :class="(analysisData?.bet?.yourBest || 0) >= 20 ? 'bg-green-500' : 
                                  (analysisData?.bet?.yourBest || 0) >= 1 ? 'bg-yellow-500' : 'bg-red-500'"></div>
                      Synthetic Graphite:
                    </span>
                    <span>1-20 m²/g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Electrical Conductivity Card -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Conductivity</h3>
              <div class="w-3 h-3 rounded-full" 
                   :class="analysisData?.conductivity?.status === 'leading' ? 'bg-green-500' : 
                          analysisData?.conductivity?.status === 'competitive' ? 'bg-yellow-500' : 'bg-red-500'">
              </div>
            </div>
            <div class="space-y-3">
              <div>
                <div class="text-2xl font-bold text-gray-900">
                  <span x-text="analysisData?.conductivity?.yourBest || '---'"></span>
                  <span class="text-sm font-normal text-gray-500">S/cm</span>
                </div>
                <div class="text-xs text-gray-600">Our Best Result (20kN)</div>
              </div>
              <div class="pt-3 border-t border-gray-100">
                <div class="text-sm text-gray-700 mb-2">Industry Benchmarks:</div>
                <div class="space-y-1 text-xs text-gray-600">
                  <div class="flex justify-between items-center">
                    <span class="flex items-center">
                      <div class="w-2 h-2 rounded-full mr-2" 
                           :class="(analysisData?.conductivity?.yourBest || 0) >= 100 ? 'bg-green-500' : 
                                  (analysisData?.conductivity?.yourBest || 0) >= 0.1 ? 'bg-yellow-500' : 'bg-red-500'"></div>
                      Carbon Black:
                    </span>
                    <span>0.1-100 S/cm</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="flex items-center">
                      <div class="w-2 h-2 rounded-full mr-2" 
                           :class="(analysisData?.conductivity?.yourBest || 0) >= 10 ? 'bg-green-500' : 
                                  (analysisData?.conductivity?.yourBest || 0) >= 0.1 ? 'bg-yellow-500' : 'bg-red-500'"></div>
                      Activated Carbon:
                    </span>
                    <span>0.1-10 S/cm</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="flex items-center">
                      <div class="w-2 h-2 rounded-full mr-2" 
                           :class="(analysisData?.conductivity?.yourBest || 0) >= 10000 ? 'bg-green-500' : 
                                  (analysisData?.conductivity?.yourBest || 0) >= 100 ? 'bg-yellow-500' : 'bg-red-500'"></div>
                      Synthetic Graphite:
                    </span>
                    <span>100-10,000 S/cm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- RAMAN D/G Ratio Card -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">RAMAN D/G Ratio</h3>
              <div class="w-3 h-3 rounded-full" 
                   :class="analysisData?.raman?.status === 'leading' ? 'bg-green-500' : 
                          analysisData?.raman?.status === 'competitive' ? 'bg-yellow-500' : 'bg-red-500'">
              </div>
            </div>
            <div class="space-y-3">
              <div>
                <div class="text-2xl font-bold text-gray-900">
                  <span x-text="analysisData?.raman?.yourBest || '---'"></span>
                </div>
                <div class="text-xs text-gray-600">Our Best Result (Lower = Better)</div>
              </div>
              <div class="pt-3 border-t border-gray-100">
                <div class="text-sm text-gray-700 mb-2">Quality Benchmarks:</div>
                <div class="space-y-1 text-xs text-gray-600">
                  <div class="flex justify-between items-center">
                    <span class="flex items-center">
                      <div class="w-2 h-2 rounded-full mr-2" 
                           :class="(analysisData?.raman?.yourBest || 99) <= 0.5 ? 'bg-green-500' : 'bg-red-500'"></div>
                      High-quality Graphene:
                    </span>
                    <span>&lt;0.5</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="flex items-center">
                      <div class="w-2 h-2 rounded-full mr-2" 
                           :class="(analysisData?.raman?.yourBest || 99) <= 0.2 ? 'bg-green-500' : 
                                  (analysisData?.raman?.yourBest || 99) >= 0.05 ? 'bg-yellow-500' : 'bg-red-500'"></div>
                      Commercial Graphite:
                    </span>
                    <span>0.05-0.2</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="flex items-center">
                      <div class="w-2 h-2 rounded-full mr-2" 
                           :class="(analysisData?.raman?.yourBest || 99) >= 2.0 ? 'bg-red-500' : 
                                  (analysisData?.raman?.yourBest || 99) >= 0.8 ? 'bg-yellow-500' : 'bg-green-500'"></div>
                      Carbon Materials:
                    </span>
                    <span>0.8-2.0+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Comparison Charts Section -->
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">Detailed Performance Comparison</h3>
          
          <!-- Chart Container -->
          <div class="space-y-8">
            
            <!-- BET Surface Area Chart -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-4">BET Surface Area Performance</h4>
              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <canvas id="betChart" class="w-full" style="height: 300px;"></canvas>
              </div>
            </div>

            <!-- Conductivity Chart -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-4">Electrical Conductivity Performance</h4>
              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <canvas id="conductivityChart" class="w-full" style="height: 300px;"></canvas>
              </div>
            </div>

            <!-- RAMAN Chart -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-4">RAMAN D/G Ratio Performance</h4>
              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <canvas id="ramanChart" class="w-full" style="height: 300px;"></canvas>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  `;
}

// Make function globally available for Alpine.js templates
if (typeof window !== 'undefined') {
  window.getAnalysisTabHtml = getAnalysisTabHtml;
}