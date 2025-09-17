/**
 * Source Data Section Template Helper
 * Generates Alpine.js template HTML for biochar source data displays
 * Preserves Alpine.js reactivity by generating templates with directives intact
 */

export function createSourceDataSection(config) {
  const {
    dataPath,          // Path to source data (e.g., 'grapheneRelatedData[record.experimentNumber]')
    experimentNumber   // Variable for experiment number if needed
  } = config;

  return createBiocharSourceSection(dataPath);
}

function createBiocharSourceSection(dataPath) {
  return `
    <!-- Source Biochar Data -->
    <div>
      <h4 class="text-md font-semibold text-gray-700 mb-3 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
        </svg>
        Source Biochar
      </h4>
      
      <!-- Direct biochar source -->
      <template x-if="${dataPath}.sourceBiochar">
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <table class="min-w-full text-xs">
            <tr><td class="font-medium">Experiment:</td><td x-text="${dataPath}.sourceBiochar.experimentNumber"></td></tr>
            <tr><td class="font-medium">Date:</td><td x-text="window.formatDateSafe(${dataPath}.sourceBiochar.experimentDate)"></td></tr>
            <tr><td class="font-medium">Material:</td><td x-text="${dataPath}.sourceBiochar.rawMaterial"></td></tr>
            <tr><td class="font-medium">Reactor:</td><td x-text="${dataPath}.sourceBiochar.reactor"></td></tr>
            <tr><td class="font-medium">Output:</td><td x-text="${dataPath}.sourceBiochar.output ? ${dataPath}.sourceBiochar.output + 'g' : ''"></td></tr>
          </table>
        </div>
      </template>
      
      <!-- Lot-based biochar experiments -->
      <template x-if="${dataPath}.lotBiocharExperiments && ${dataPath}.lotBiocharExperiments.length > 0">
        <div class="bg-link-light border border-link rounded-lg p-3">
          <p class="font-medium text-sm mb-2">Lot Biochar Experiments:</p>
          <div class="space-y-2">
            <template x-for="biochar in ${dataPath}.lotBiocharExperiments">
              <div class="bg-white rounded p-2 text-xs border">
                <div class="flex justify-between">
                  <span class="font-medium" x-text="biochar.experimentNumber"></span>
                  <span x-text="window.formatDateSafe(biochar.experimentDate)"></span>
                </div>
                <div class="text-gray-600">
                  <span x-text="biochar.rawMaterial"></span> - 
                  <span x-text="biochar.output ? biochar.output + 'g' : 'No output'"></span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
      
      <!-- No source data message -->
      <template x-if="!${dataPath}.sourceBiochar && (!${dataPath}.lotBiocharExperiments || ${dataPath}.lotBiocharExperiments.length === 0)">
        <div class="bg-gray-100 border border-gray-200 rounded-lg p-3 text-center text-gray-500 text-sm">
          No source biochar data available
        </div>
      </template>
    </div>
  `;
}

// Export as default object
export default {
  createSourceDataSection
};