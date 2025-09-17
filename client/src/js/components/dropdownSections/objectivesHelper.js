/**
 * Objectives and Compound Batch Section Template Helper
 * Generates Alpine.js template HTML for experiment objectives and compound batch displays
 * Preserves Alpine.js reactivity by generating templates with directives intact
 */

export function createObjectivesSection(config) {
  const {
    sectionType,       // 'objectives', 'compound-batches'
    dataPath,          // Path to data
    record            // Record variable name
  } = config;

  switch(sectionType) {
    case 'objectives':
      return createExperimentObjectivesSection(record);
    case 'compound-batches':
      return createCompoundBatchesSection(dataPath);
    default:
      return '';
  }
}

function createExperimentObjectivesSection(record = 'record') {
  return `
    <!-- Experiment Objective & Results -->
    <div x-show="${record}.objective || ${record}.experimentDetails || ${record}.result || ${record}.conclusion || ${record}.recommendedAction">
      <h4 class="text-md font-semibold text-gray-700 mb-3 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        Experiment Objective & Results
      </h4>
      <div class="bg-link-light border border-link rounded-lg p-3 space-y-3">
        <div x-show="${record}.objective">
          <h5 class="font-semibold text-sm text-gray-700">Objective:</h5>
          <p class="text-sm text-gray-600 whitespace-pre-wrap" x-text="${record}.objective"></p>
        </div>
        <div x-show="${record}.experimentDetails">
          <h5 class="font-semibold text-sm text-gray-700">Experiment Details:</h5>
          <p class="text-sm text-gray-600 whitespace-pre-wrap" x-text="${record}.experimentDetails"></p>
        </div>
        <div x-show="${record}.result">
          <h5 class="font-semibold text-sm text-gray-700">Result:</h5>
          <p class="text-sm text-gray-600 whitespace-pre-wrap" x-text="${record}.result"></p>
        </div>
        <div x-show="${record}.conclusion">
          <h5 class="font-semibold text-sm text-gray-700">Conclusion:</h5>
          <p class="text-sm text-gray-600 whitespace-pre-wrap" x-text="${record}.conclusion"></p>
        </div>
        <div x-show="${record}.recommendedAction">
          <h5 class="font-semibold text-sm text-gray-700">Recommended Action:</h5>
          <p class="text-sm text-gray-600 whitespace-pre-wrap" x-text="${record}.recommendedAction"></p>
        </div>
      </div>
    </div>
  `;
}

function createCompoundBatchesSection(dataPath) {
  // Handle both cases: compound batch experiments (for compound batch dropdown) 
  // and compound batches (for graphene dropdown)
  const isExperimentsPath = dataPath.includes('experiments');
  
  if (isExperimentsPath) {
    // Compound batch dropdown showing constituent experiments
    return `
      <!-- Constituent Experiments -->
      <div x-show="${dataPath} && ${dataPath}.length > 0">
        <h4 class="text-md font-semibold text-gray-700 mb-3 flex items-center justify-between">
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            Constituent Experiments
          </div>
          <span class="text-sm font-normal text-gray-500" x-text="${dataPath}.length + ' experiments'"></span>
        </h4>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-2">
          <!-- Compact table layout for many experiments -->
          <div class="bg-white rounded border overflow-hidden">
            <table class="w-full text-xs">
              <thead class="bg-gray-50 border-b">
                <tr>
                  <th class="text-left px-2 py-1 font-medium text-gray-700">Exp #</th>
                  <th class="text-left px-2 py-1 font-medium text-gray-700">Date</th>
                  <th class="text-left px-2 py-1 font-medium text-gray-700">Species</th>
                  <th class="text-right px-2 py-1 font-medium text-gray-700">Output (g)</th>
                  <th class="text-left px-2 py-1 font-medium text-gray-700">Biochar</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <template x-for="experiment in ${dataPath}">
                  <tr class="hover:bg-gray-50">
                    <td class="px-2 py-1 font-mono font-semibold text-blue-700" x-text="experiment.graphene.experimentNumber"></td>
                    <td class="px-2 py-1 text-gray-600" x-text="window.formatDateSafe(experiment.graphene.experimentDate)"></td>
                    <td class="px-2 py-1 text-gray-600" x-text="experiment.graphene.species || '-'"></td>
                    <td class="px-2 py-1 text-right font-mono text-gray-800" x-text="experiment.graphene.output ? experiment.graphene.output + 'g' : '-'"></td>
                    <td class="px-2 py-1 text-gray-500 text-xs">
                      <span x-text="experiment.graphene.biocharExperiment || (experiment.graphene.biocharLotNumber ? 'LOT: ' + experiment.graphene.biocharLotNumber : 'Various')"></span>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <!-- Summary row -->
          <div class="mt-2 flex justify-between items-center text-xs text-gray-600 bg-white rounded border px-2 py-1">
            <span class="font-medium">Total:</span>
            <span class="font-mono" x-text="${dataPath}.reduce((sum, exp) => sum + (parseFloat(exp.graphene.output) || 0), 0).toFixed(2) + 'g'"></span>
          </div>
        </div>
      </div>
    `;
  } else {
    // Graphene dropdown showing compound batches
    return `
      <!-- Compound Batch Information -->
      <div x-show="${dataPath} && ${dataPath}.compoundBatches && ${dataPath}.compoundBatches.length > 0">
        <h4 class="text-md font-semibold text-gray-700 mb-3 flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          Compound Batches
        </h4>
        <div class="space-y-3">
          <template x-for="compoundBatchAssoc in ${dataPath}.compoundBatches">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h5 class="font-semibold text-sm text-blue-800 flex items-center mb-2">
                    <span x-text="compoundBatchAssoc.compoundBatch.batchNumber" class="font-mono"></span>
                    <span x-show="compoundBatchAssoc.compoundBatch.batchName" 
                          x-text="' - ' + compoundBatchAssoc.compoundBatch.batchName" 
                          class="ml-2 font-normal"></span>
                  </h5>
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span class="font-medium text-gray-700">Created:</span>
                      <span x-text="compoundBatchAssoc.compoundBatch.createdDate || 'Not specified'" class="text-gray-600"></span>
                    </div>
                    <div>
                      <span class="font-medium text-gray-700">Total Output:</span>
                      <span x-text="compoundBatchAssoc.compoundBatch.totalOutput ? compoundBatchAssoc.compoundBatch.totalOutput + 'g' : 'Not specified'" class="text-gray-600"></span>
                    </div>
                  </div>
                  <div x-show="compoundBatchAssoc.compoundBatch.description" class="mt-2">
                    <span class="font-medium text-gray-700 text-sm">Description:</span>
                    <p class="text-sm text-gray-600 mt-1" x-text="compoundBatchAssoc.compoundBatch.description"></p>
                  </div>
                  
                  <!-- Constituent Experiments -->
                  <div class="mt-3">
                    <span class="font-medium text-gray-700 text-sm">Constituent Experiments:</span>
                    <div class="mt-1 flex flex-wrap gap-1">
                      <template x-for="exp in compoundBatchAssoc.compoundBatch.experiments">
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <span x-text="exp.graphene.experimentNumber"></span>
                          <span x-show="exp.graphene.output" 
                                x-text="' (' + exp.graphene.output + 'g)'" 
                                class="text-blue-600"></span>
                        </span>
                      </template>
                    </div>
                  </div>
                  
                  <!-- Associated Tests -->
                  <div x-show="(compoundBatchAssoc.compoundBatch.betTests && compoundBatchAssoc.compoundBatch.betTests.length > 0) || 
                               (compoundBatchAssoc.compoundBatch.conductivityTests && compoundBatchAssoc.compoundBatch.conductivityTests.length > 0) || 
                               (compoundBatchAssoc.compoundBatch.ramanTests && compoundBatchAssoc.compoundBatch.ramanTests.length > 0) ||
                               (compoundBatchAssoc.compoundBatch.temTests && compoundBatchAssoc.compoundBatch.temTests.length > 0)" 
                       class="mt-3">
                    <span class="font-medium text-gray-700 text-sm">Associated Tests:</span>
                    <div class="mt-1 flex flex-wrap gap-1">
                      <template x-if="compoundBatchAssoc.compoundBatch.betTests && compoundBatchAssoc.compoundBatch.betTests.length > 0">
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          BET (<span x-text="compoundBatchAssoc.compoundBatch.betTests.length"></span>)
                        </span>
                      </template>
                      <template x-if="compoundBatchAssoc.compoundBatch.conductivityTests && compoundBatchAssoc.compoundBatch.conductivityTests.length > 0">
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Conductivity (<span x-text="compoundBatchAssoc.compoundBatch.conductivityTests.length"></span>)
                        </span>
                      </template>
                      <template x-if="compoundBatchAssoc.compoundBatch.ramanTests && compoundBatchAssoc.compoundBatch.ramanTests.length > 0">
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          RAMAN (<span x-text="compoundBatchAssoc.compoundBatch.ramanTests.length"></span>)
                        </span>
                      </template>
                      <template x-if="compoundBatchAssoc.compoundBatch.temTests && compoundBatchAssoc.compoundBatch.temTests.length > 0">
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          TEM (<span x-text="compoundBatchAssoc.compoundBatch.temTests.length"></span>)
                        </span>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    `;
  }
}

// Export as default object
export default {
  createObjectivesSection
};