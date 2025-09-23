/**
 * Characterization Comparison Component
 *
 * Provides comparative analysis interface showing test results from multiple sources:
 * - Dr. Li's academic research (manual entry)
 * - Curia scale-up data (system + manual)
 * - GEIC characterization (manual entry)
 * - ISO/ASTM standards (manual entry)
 *
 * Features:
 * - Test type selector dropdown
 * - Visual comparison chart
 * - Data table with all sources
 * - Admin modal for reference data entry
 */

/**
 * Returns the complete HTML for the Characterization Comparison component
 * @returns {string} HTML string for the characterization comparison section
 */
function getCharacterizationComparisonHtml() {
  return `
    <!-- Characterization Comparison Section -->
    <div class="mb-12">

      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Comparative Characterization Analysis</h2>
        </div>
        <button @click="showCharacterizationModal = true; resetCharacterizationForm();"
                class="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium">
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Manage Reference Data
        </button>
      </div>

      <!-- Test Property Selector -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Test Property</label>
        <select x-model="selectedCharacterizationTest"
                @change="selectCharacterizationTest(selectedCharacterizationTest)"
                class="block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white">
          <option value="BET">BET Surface Area</option>
          <option value="Conductivity">Powder Conductivity</option>
          <option value="RAMAN">RAMAN D/G Ratio</option>
          <option value="XPS">XPS Analysis</option>
          <option value="ICP-OES">ICP-OES</option>
          <option value="TGA">TGA</option>
          <option value="Specific Capacitance">Specific Capacitance</option>
          <option value="SEM Morphology">SEM Morphology</option>
        </select>
      </div>

      <!-- Error State -->
      <div x-show="characterizationError && !characterizationLoading"
           class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="text-sm text-red-800" x-text="characterizationError"></span>
          <button @click="loadCharacterizationData()" class="ml-auto text-sm text-red-600 hover:text-red-800">
            Retry
          </button>
        </div>
      </div>

      <!-- Visual Comparison Chart (always rendered) -->
      <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6 relative">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          <span x-text="selectedCharacterizationTest"></span> Comparison
          <span class="text-sm font-normal text-gray-500" x-text="characterizationData?.sources && Object.keys(characterizationData.sources).length > 0 ? '(' + characterizationData.sources[Object.keys(characterizationData.sources)[0]]?.unit + ')' : ''"></span>
        </h3>

        <!-- Loading Overlay -->
        <div x-show="characterizationLoading" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
          <div class="animate-pulse text-gray-500">Loading chart data...</div>
        </div>

        <!-- Bar Chart Container -->
        <div class="relative">
          <canvas id="characterizationChart" class="w-full" style="height: 300px;"></canvas>
        </div>
      </div>

      <!-- Data Table -->
      <div x-show="!characterizationLoading && !characterizationError && characterizationData">

        <!-- Data Table -->
        <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Detailed Comparison Data</h3>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button @click="toggleCharacterizationSort()" class="flex items-center gap-1 hover:text-gray-700">
                      Value
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              :d="characterizationSortOrder === 'desc' ? 'M19 9l-7 7-7-7' : 'M5 15l7-7 7 7'"></path>
                      </svg>
                    </button>
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Change</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conditions</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample/Notes</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <template x-for="item in getSortedCharacterizationSources()" :key="item.key">
                  <tr>
                    <!-- Source Name -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-3 h-3 rounded-full mr-3"
                             :class="item.source.type === 'system' ? 'bg-black' :
                                    item.source.sourceType === 'academic' ? 'bg-amber-600' :
                                    item.source.sourceType === 'standard' ? 'bg-gray-400' :
                                    item.source.sourceType === 'external_lab' ? 'bg-gray-600' : 'bg-gray-500'"
                             :style="item.source.sourceType === 'academic' ? 'background-color: rgba(184, 115, 51, 1)' : ''">
                        </div>
                        <!-- Non-system data: static text -->
                        <span x-show="item.source.type !== 'system' || !item.source.sampleId"
                              class="text-sm font-medium text-gray-900"
                              x-text="item.source.source || item.key.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase())"></span>
                        <!-- System data: clickable link -->
                        <a x-show="item.source.type === 'system' && item.source.sampleId"
                           @click.prevent="window.routerService?.navigateToDataPage(item.source.sampleType, item.source.sampleId)"
                           class="text-sm font-medium text-gray-900 hover:text-black hover:underline cursor-pointer"
                           x-text="item.source.source || item.key.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase())"></a>
                      </div>
                    </td>

                    <!-- Type -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-white border border-black text-black">
                        <span x-text="item.source.type === 'system' ? 'System Data' : item.source.type === 'manual' ? 'Manual Entry' : 'Standard'"></span>
                      </span>
                    </td>

                    <!-- Value -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-mono text-gray-900">
                        <span x-show="item.source.isRange" x-text="(item.source.minValue || '—') + ' - ' + (item.source.maxValue || '—')"></span>
                        <span x-show="!item.source.isRange && item.source.value !== null" x-text="item.source.value"></span>
                        <span x-show="!item.source.isRange && item.source.value === null && item.source.valueString" x-text="item.source.valueString"></span>
                        <span x-show="!item.source.isRange && item.source.value === null && !item.source.valueString">—</span>
                        <span class="text-xs text-gray-500 ml-2" x-text="item.source.unit || ''"></span>
                      </div>
                    </td>

                    <!-- % Change -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-mono">
                        <span x-show="item.percentChange !== null"
                              :class="item.percentChange === 0 ? 'text-gray-900' :
                                     item.percentChange > 0 ? 'text-green-600' : 'text-red-600'"
                              x-text="item.percentChange === 0 ? 'Baseline' :
                                     (item.percentChange > 0 ? '+' : '') + item.percentChange.toFixed(1) + '%'">
                        </span>
                        <span x-show="item.percentChange === null" class="text-gray-400">—</span>
                      </div>
                    </td>

                    <!-- Conditions -->
                    <td class="px-6 py-4">
                      <div class="text-xs text-gray-600 max-w-xs">
                        <template x-for="[key, value] in Object.entries(item.source.conditions || {})" :key="key">
                          <div x-show="value !== null && value !== undefined">
                            <span x-text="key"></span>: <span x-text="value"></span>
                          </div>
                        </template>
                        <span x-show="!item.source.conditions || Object.keys(item.source.conditions).length === 0">—</span>
                      </div>
                    </td>

                    <!-- Sample/Notes -->
                    <td class="px-6 py-4">
                      <div class="text-xs text-gray-600 max-w-xs">
                        <div x-show="item.source.sampleId">
                          Sample: <span class="font-medium" x-text="item.source.sampleId"></span>
                        </div>
                        <div x-show="item.source.testDate">
                          Date: <span x-text="item.source.testDate ? new Date(item.source.testDate).toLocaleDateString() : ''"></span>
                        </div>
                        <div x-show="item.source.notes" x-text="item.source.notes"></div>
                        <span x-show="!item.source.sampleId && !item.source.testDate && !item.source.notes">—</span>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

    <!-- Reference Data Management Modal -->
    <div x-show="showCharacterizationModal"
         x-cloak
         class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">

        <!-- Modal Header -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Manage Reference Data</h3>
          <button @click="showCharacterizationModal = false"
                  class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="saveCharacterizationReference()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

            <!-- Source -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <input type="text" x-model="characterizationForm.source" required
                     placeholder="e.g., Dr. Li, ISO, ASTM, GEIC Raw"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>

            <!-- Source Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Source Type</label>
              <select x-model="characterizationForm.sourceType" required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="academic">Academic Research</option>
                <option value="production">Production Scale-up</option>
                <option value="external_lab">External Laboratory</option>
                <option value="standard">Industry Standard</option>
              </select>
            </div>

            <!-- Test Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
              <select x-model="characterizationForm.testType" required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="BET">BET Surface Area</option>
                <option value="Conductivity">Powder Conductivity</option>
                <option value="RAMAN">RAMAN D/G Ratio</option>
                <option value="XPS">XPS Analysis</option>
                <option value="ICP-OES">ICP-OES</option>
                <option value="TGA">TGA</option>
                <option value="Specific Capacitance">Specific Capacitance</option>
                <option value="SEM Morphology">SEM Morphology</option>
              </select>
            </div>

            <!-- Unit -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input type="text" x-model="characterizationForm.unit"
                     placeholder="e.g., m²/g, S/cm"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>

            <!-- Range Checkbox -->
            <div class="md:col-span-2">
              <label class="flex items-center">
                <input type="checkbox" x-model="characterizationForm.isRange"
                       class="rounded border-gray-300 text-blue-600">
                <span class="ml-2 text-sm text-gray-700">This is a range value (e.g., standards)</span>
              </label>
            </div>

            <!-- Single Value (when not range) -->
            <template x-if="!characterizationForm.isRange">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <input type="text" x-model="characterizationForm.value"
                       placeholder="Numeric value or text description"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md">
              </div>
            </template>

            <!-- Range Values (when is range) -->
            <template x-if="characterizationForm.isRange">
              <div class="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
                  <input type="number" x-model="characterizationForm.minValue" step="any"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
                  <input type="number" x-model="characterizationForm.maxValue" step="any"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
              </div>
            </template>

            <!-- Test Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Test Date</label>
              <input type="date" x-model="characterizationForm.testDate"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>

            <!-- Notes -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea x-model="characterizationForm.notes" rows="2"
                        placeholder="Additional notes or conditions"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="flex justify-end space-x-3">
            <button type="button" @click="showCharacterizationModal = false"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
              Cancel
            </button>
            <button type="submit"
                    class="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-black rounded-md">
              Save Reference
            </button>
          </div>

        </form>

        <!-- Existing References List -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <h4 class="text-md font-medium text-gray-900 mb-3">Existing Reference Data</h4>
          <div class="max-h-64 overflow-y-auto">
            <template x-for="ref in characterizationReferences" :key="ref.id">
              <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded mb-2">
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-900" x-text="ref.source + ' - ' + ref.testType"></div>
                  <div class="text-xs text-gray-600">
                    <span x-show="ref.isRange" x-text="(ref.minValue || '—') + ' - ' + (ref.maxValue || '—') + ' ' + (ref.unit || '')"></span>
                    <span x-show="!ref.isRange" x-text="(ref.value || ref.valueString || '—') + ' ' + (ref.unit || '')"></span>
                  </div>
                </div>
                <button @click="deleteCharacterizationReference(ref.id)"
                        class="text-red-600 hover:text-red-800 text-sm">
                  Delete
                </button>
              </div>
            </template>
            <div x-show="characterizationReferences.length === 0" class="text-sm text-gray-500 text-center py-4">
              No reference data found
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}

// Make function globally available for Alpine.js templates
if (typeof window !== 'undefined') {
  window.getCharacterizationComparisonHtml = getCharacterizationComparisonHtml;
}