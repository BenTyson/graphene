/**
 * Reports Section Template Helper
 * Generates Alpine.js template HTML for SEM and Update report displays
 * Preserves Alpine.js reactivity by generating templates with directives intact
 */

export function createReportsSection(config) {
  const {
    reportType,         // 'update', 'sem'
    dataPath,          // Path to report data (e.g., 'record.updateReports')
    record             // Record variable name for context
  } = config;

  switch(reportType) {
    case 'update':
      return createUpdateReportsSection(dataPath, record);
    case 'sem':
      return createSemReportsSection(dataPath, record);
    default:
      return '';
  }
}

function createUpdateReportsSection(dataPath, record = 'record') {
  return `
    <!-- Update Reports -->
    <div>
      <h4 class="text-md font-semibold text-gray-700 mb-3 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        Update Reports
      </h4>
      <template x-if="${dataPath} && ${dataPath}.length > 0">
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div class="space-y-2">
            <template x-for="updateReport in ${dataPath}">
              <div class="bg-white rounded p-2 text-xs border">
                <div class="flex justify-between mb-1">
                  <button @click="viewUpdateReport(updateReport.updateReport.filePath)" 
                          class="font-medium text-link text-link-hover text-left">
                    <span x-text="updateReport.updateReport.originalName"></span>
                  </button>
                  <span class="text-gray-500" x-text="updateReport.updateReport.weekOf ? 'Week of ' + new Date(updateReport.updateReport.weekOf).toLocaleDateString() : 'No date'"></span>
                </div>
                <div x-show="updateReport.updateReport.description" class="text-gray-600">
                  <span x-text="updateReport.updateReport.description"></span>
                </div>
                <div class="text-gray-400 text-xs mt-1">
                  Uploaded: <span x-text="formatDate(updateReport.updateReport.createdAt)"></span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
      
      <template x-if="!${dataPath} || ${dataPath}.length === 0">
        <div class="bg-gray-100 border border-gray-200 rounded-lg p-3 text-center text-gray-500 text-sm">
          No update reports associated with this experiment
        </div>
      </template>
    </div>
  `;
}

function createSemReportsSection(dataPath, record = 'record') {
  return `
    <!-- SEM Reports -->
    <div>
      <h4 class="text-md font-semibold text-gray-700 mb-3 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
        SEM Reports
      </h4>
      
      <!-- Direct attachment -->
      <template x-if="${record}.semReportPath">
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
          <div class="bg-white rounded p-2 text-xs border">
            <div class="flex justify-between items-center">
              <button @click="viewSemReport(${record}.semReportPath)" 
                      class="font-medium text-link text-link-hover text-left">
                <span x-text="${record}.semReportPath.split('/').pop().replace(/_\\d+\\.pdf$/, '.pdf')"></span>
              </button>
              <span class="text-gray-500 text-xs">Uploaded with record</span>
            </div>
          </div>
        </div>
      </template>
      
      <!-- Associated SEM reports -->
      <template x-if="${record}.semReports && ${record}.semReports.length > 0">
        <div class="space-y-2">
          <template x-for="semReport in ${record}.semReports">
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div class="bg-white rounded p-2 text-xs border">
                <div class="flex justify-between items-center">
                  <div>
                    <button @click="viewSemPdf(semReport.semReport.filePath)" 
                            class="font-medium text-link text-link-hover text-left">
                      <span x-text="semReport.semReport.originalName"></span>
                    </button>
                    <div x-show="semReport.semReport.description" class="text-gray-500 text-xs mt-1" x-text="semReport.semReport.description"></div>
                  </div>
                  <span class="text-gray-500 text-xs">Associated report</span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>
      
      <template x-if="!${record}.semReportPath && (!${record}.semReports || ${record}.semReports.length === 0)">
        <div class="bg-gray-100 border border-gray-200 rounded-lg p-3 text-center text-gray-500 text-sm">
          No SEM reports available for this experiment
        </div>
      </template>
    </div>
  `;
}

// Export as default object
export default {
  createReportsSection
};