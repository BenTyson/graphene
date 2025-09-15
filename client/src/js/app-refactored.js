// Main Application Module - Refactored Version
// Uses modular components for better maintainability

import API from './services/api.js';
import formatters from './utils/formatters.js';
import validators from './utils/validators.js';
import dataHelpers from './utils/dataHelpers.js';
import objectiveParser from './utils/objectiveParser.js';
import modalHelpers from './components/modals/modalHelpers.js';
import pdfViewerHelpers from './components/modals/pdfViewerHelpers.js';
import dateFieldHelpers from './components/forms/dateFieldHelpers.js';
import selectFieldHelpers from './components/forms/selectFieldHelpers.js';
import numericFieldHelpers from './components/forms/numericFieldHelpers.js';
import fileFieldHelpers from './components/forms/fileFieldHelpers.js';
import testResultsHelper from './components/dropdownSections/testResultsHelper.js';
import reportsHelper from './components/dropdownSections/reportsHelper.js';
import sourceDataHelper from './components/dropdownSections/sourceDataHelper.js';
import objectivesHelper from './components/dropdownSections/objectivesHelper.js';
import shipmentsHelper from './components/dropdownSections/shipmentsHelper.js';
import { getFilterPanelHtml } from './components/tables/filterHelper.js';
import { filterMixin } from './components/tables/filterStateManager.js';
import { createProductionWidget, createInventoryWidget, createTestResultsWidget, createActivityWidget, createLoadingSkeleton, createErrorWidget } from './components/dashboard/dashboardWidgets.js';
import { getDashboardTabHtml } from './components/tabs/DashboardTab.js';
import { getShipmentsTabHtml } from './components/tabs/ShipmentsTab.js';
import { getMicronizationTabHtml } from './components/tabs/MicronizationTab.js';
import { getCompoundBatchesTabHtml } from './components/tabs/CompoundBatchesTab.js';
import { getBiocharTabHtml } from './components/tabs/BiocharTab.js';
import { getGrapheneTabHtml } from './components/tabs/GrapheneTab.js';
// Tab components are loaded as separate scripts and made available globally
// import { getAnalysisTabHtml } from './components/tabs/AnalysisTab.js';
import { getAIInsightsTabHtml } from './components/tabs/AIInsightsTab.js';
import { getNewsTabHtml } from './components/tabs/NewsTab.js';
import { getBiocharModalHtml } from './components/modals/BiocharModal.js';
import { getCompoundBatchModalHtml } from './components/modals/CompoundBatchModal.js';
import { getMicronizationModalHtml } from './components/modals/MicronizationModal.js';
import { getRAMANModalHtml } from './components/modals/RAMANModal.js';

// Import new components for simplified cards and modals
import './components/cards/SimplifiedGrapheneCard.js';
import './components/cards/SimplifiedCompoundBatchCard.js';
import './components/cards/SimplifiedShipmentCard.js';
import './components/modals/CardModalSystem.js';

// Import authentication components
import './services/AuthService.js';
import './components/auth/LoginPage.js';
import './components/auth/AuthWrapper.js';

// Import card services and components
import './services/CardService.js';
import './components/cards/CardSection.js';
import './components/cards/CardMetrics.js';
import './components/cards/CardHeader.js';
import './components/cards/CardContainer.js';
import './components/cards/utils/cardConfig.js';
import './components/cards/MasterDataCard.js';
import './components/cards/CardFactory.js';

// Import modal components
import './components/modals/ModalPdfViewer.js';
import './components/modals/ModalTemplates.js';
import './components/modals/BETModal.js';
import './components/modals/ConductivityModal.js';
import './components/modals/TEMModal.js';
import './components/modals/ShipmentModal.js';
import './components/modals/GrapheneModal.js';

// Import tab components
import './components/tabs/TestResultsBETTab.js';
import './components/tabs/TestResultsConductivityTab.js';
import './components/tabs/TestResultsRAMANTab.js';
import './components/tabs/TestResultsTEMTab.js';
import './components/tabs/SEMReportsTab.js';
import './components/tabs/UpdateReportsTab.js';
import './components/tabs/AnalysisTab.js';
import { getSummaryToggleHtml, shouldShowSummaryToggle, formatSummaryWithSections, getSimplifiedTitle } from './components/SummaryToggle.js';
import FilterService from './services/FilterService.js';
import NewsService from './services/NewsService.js';
import CRUDService from './services/CRUDService.js';
import DashboardService from './services/DashboardService.js';
import { DEFAULT_FORMS } from './utils/constants.js';

console.log('Loading app-refactored.js...');

// Make tab functions globally available for Alpine.js templates
window.getDashboardTabHtml = getDashboardTabHtml;
window.getShipmentsTabHtml = getShipmentsTabHtml;
window.getMicronizationTabHtml = getMicronizationTabHtml;
window.getCompoundBatchesTabHtml = getCompoundBatchesTabHtml;
window.getBiocharTabHtml = getBiocharTabHtml;
window.getGrapheneTabHtml = getGrapheneTabHtml;
// Tab functions are made globally available in their component files  
// window.getAnalysisTabHtml = getAnalysisTabHtml;

// AI Insights tab is now loaded from the actual component
window.getAIInsightsTabHtml = getAIInsightsTabHtml;

window.getNewsTabHtml = getNewsTabHtml;

// Global safe date formatting function
window.formatDateSafe = function(dateString) {
  // Handle null, undefined, empty string, or invalid values
  if (!dateString || dateString === '' || dateString === 'null' || dateString === '0') {
    return 'Unknown';
  }
  
  try {
    const date = new Date(dateString);
    
    // Check if the date is invalid or represents Unix epoch (1970-01-01 or 1969-12-31)
    if (isNaN(date.getTime()) || date.getFullYear() <= 1970) {
      return 'Unknown';
    }
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return 'Unknown';
  }
};

// Main Alpine.js application
window.grapheneApp = function() {
  return {
    // Tab management
    activeTab: 'dashboard',
    
    // Dashboard data
    dashboardData: {
      production: null,
      inventory: null,
      testResults: null,
      activity: null
    },
    dashboardLoading: {
      production: false,
      inventory: false,
      testResults: false,
      activity: false
    },
    dashboardError: null,
    
    // Analysis data
    analysisData: null,
    analysisLoading: false,
    analysisError: null,
    analysisChartData: null,
    betChart: null,
    conductivityChart: null,
    ramanChart: null,
    
    // AI Insights data
    aiInsightsData: null,
    aiInsightsLoading: false,
    aiInsightsError: null,
    correlationData: null,
    correlationLoading: false,
    optimizationData: null,
    optimizationLoading: false,
    scalingData: null,
    scalingLoading: false,
    suggestionsData: null,
    suggestionsLoading: false,
    customQuery: '',
    customAnalysisContext: 'general',
    customAnalysisResult: null,
    customAnalysisLoading: false,
    
    // AI Analysis Filters
    analysisFilters: {
      oven: '',
      species: '',
      timeRange: '',
      includeCompoundBatches: true,
      includeMicronization: true
    },
    filtersLoading: false,
    
    // News system state
    newsArticles: [],
    filteredNewsArticles: [],
    paginatedNewsArticles: [],
    newsLoading: false,
    newsError: null,
    showNewsFilters: false,
    bookmarkLoading: {},
    headlines: [],
    headlinesLoading: false,
    headlinesError: null,
    
    // High-impact keywords for filtering
    highImpactKeywords: [],
    allHighImpactKeywords: ['hemp', 'supercapacitor', 'supercapacitors', 'energy storage', 'cathode', 'anode', 'electrode', 'electrochemical', 'capacitor'],
    
    // Summary system state
    showSummary: {},
    summaryLoading: {},
    summaryError: {},
    
    // News pagination
    newsCurrentPage: 1,
    newsPageSize: 10,
    newsTotalPages: 0,
    newsHasMorePages: false,

    // News filters
    newsFilters: {
      search: '',
      category: '',
      source: '',
      dateRange: '',
      sortBy: 'publishDate',
      sortOrder: 'desc'
    },
    
    // Latest production cards data
    latestGrapheneCards: [],
    latestCompoundBatches: [],
    latestShipments: [],
    
    // Data Card state
    viewMode: 'card',
    showTestCardPopup: false,
    inlineCardHtml: '',
    fullwidthCardHtml: '',
    compoundBatchCardHtml: '',
    
    // Modal system state
    activeCardModal: null,
    modalLoading: false,
    modalError: null,
    modalCardData: {},
    modalCardType: null,
    
    // PDF viewer state
    pdfViewerActive: false,
    currentPdfUrl: null,
    currentPdfTitle: null,
    
    // Data storage
    biocharRecords: [],
    grapheneRecords: [],
    betRecords: [],
    conductivityRecords: [],
    ramanRecords: [],
    temRecords: [],
    updateReports: [],
    semReports: [],
    compoundBatches: [],
    compoundBatchRecords: [],
    shipments: [],
    micronizations: [],
    availableExperiments: [],
    availableLots: [],
    availableGrapheneSamples: [],
    availableCompoundBatches: [],
    
    // Expansion states
    expandedCompoundBatches: {},
    compoundBatchRelatedData: {},
    loadingCompoundBatchRelated: {},
    expandedUpdateReportDetails: null,
    
    // Search states
    biocharSearch: '',
    grapheneSearch: '',
    betSearch: '',
    conductivitySearch: '',
    ramanSearch: '',
    temSearch: '',
    updateReportSearch: '',
    semReportSearch: '',
    compoundBatchSearch: '',
    shipmentSearch: '',
    micronizationSearch: '',
    
    // Sorting states
    biocharSortColumn: null,
    biocharSortDirection: 'asc',
    grapheneSortColumn: null,
    grapheneSortDirection: 'asc',
    
    // Modal states
    showAddBiochar: false,
    showAddGraphene: false,
    showAddBet: false,
    showAddConductivity: false,
    showAddRaman: false,
    showAddTem: false,
    showAddMicronization: false,
    showCombineModal: false,
    showCompoundBatchModal: false,
    showSemModal: false,
    currentSemPdf: null,
    showRamanModal: false,
    currentRamanPdf: null,
    showBetModal: false,
    currentBetPdf: null,
    showTemModal: false,
    currentTemPdf: null,
    showAddUpdateReport: false,
    showAddSemReport: false,
    showUpdateReportModal: false,
    currentUpdateReport: null,
    showAddShipment: false,
    showMicronizationModal: false,
    
    // Editing states
    editingBiochar: null,
    editingGraphene: null,
    editingBet: null,
    editingConductivity: null,
    editingRaman: null,
    editingTem: null,
    editingUpdateReport: null,
    editingSemReport: null,
    editingCompoundBatch: null,
    editingShipment: null,
    editingMicronization: null,
    
    // Forms
    biocharForm: { ...DEFAULT_FORMS.biochar },
    grapheneForm: { ...DEFAULT_FORMS.graphene },
    betForm: { ...DEFAULT_FORMS.bet },
    conductivityForm: { ...DEFAULT_FORMS.conductivity },
    ramanForm: { ...DEFAULT_FORMS.raman },
    temForm: { ...DEFAULT_FORMS.tem },
    combineForm: { ...DEFAULT_FORMS.combine },
    updateReportForm: { ...DEFAULT_FORMS.updateReport },
    semReportForm: { ...DEFAULT_FORMS.semReport },
    compoundBatchForm: { ...DEFAULT_FORMS.compoundBatch },
    shipmentForm: { ...DEFAULT_FORMS.shipment },
    micronizationForm: { ...DEFAULT_FORMS.micronization },
    
    // Selection states
    selectedBiocharIds: [],
    selectedGrapheneIds: [],
    
    // Expandable row states
    expandedRows: {},
    expandedBiocharRows: {},
    expandedGrapheneRows: {},
    expandedCompoundBatches: {},
    biocharRelatedData: {},
    grapheneRelatedData: {},
    
    // Filter states
    grapheneFilterState: {
      filters: {
        experimentDate: { from: '', to: '' },
        tempMax: { min: '', max: '' },
        output: { min: '', max: '' }
      },
      meta: {}
    },
    filterConfigs: {},
    filterOptions: {},
    activeFilters: {},
    filterLoading: false,
    filterError: null,
    
    // Tooltip state
    showTooltip: null,
    compoundBatchRelatedData: {},
    loadingBiocharRelated: {},
    loadingGrapheneRelated: {},
    loadingCompoundBatchRelated: {},
    
    // Compound batch state
    compoundBatchRecords: [],
    compoundBatchSearch: '',
    compoundBatchSortColumn: 'batchNumber',
    compoundBatchSortOrder: 'asc',
    experimentSearchTerm: '',
    
    // Update Report filtering
    updateReportSearchTerm: '',
    filteredGrapheneForUpdate: [],
    filteredCompoundBatchesForUpdate: [],
    
    // Dropdown options
    rawMaterials: ['BAFA neu Hemp Fibre VF', 'Canadian Rockies Hemp'],
    acidTypes: ['Sulfuric Acid'],
    washMediums: ['Water'],
    reactors: ['AV1', 'AV5'],
    researchTeams: ['Curia - Germany'],
    testingLabs: ['Fraunhofer-Institut', 'Clariant'],
    baseTypes: ['KOH', 'NaOH'],
    gases: ['Ar', 'N2'],
    washSolutions: ['HCl'],
    washWaters: ['+ Water'],
    dryingAtmospheres: ['N2 stream'],
    dryingPressures: ['atm. Pressure'],
    ovens: ['A', 'B', 'C'],
    micronizationLocations: ['Curia Albany', 'Curia Frankfurt'],
    species: ['1', '2', '1/2 Mix', 'Mostly 1', 'Mostly 2', 'Mostly 1/2 Mix', '1 + Fibres'],
    appearanceTags: ['Shiny', 'Somewhat Shiny', 'Barely Shiny', 'Dull', 'Black', 'Black/Grey', 'Grey', 'Voluminous', 'Very Voluminous', 'Brittle'],
    grapheneComments: [
      'ground biochar (brown powder) NOT compacted',
      'ground biochar (brown powder) compacted to two pellets of equal size',
      'Rotating oven, powder not compacted'
    ],
    titleNotes: [
      '(2% Water)',
      '(+ H20)',
      '(Pilot Plant #1)',
      '(Pilot Plant #1 + H20)',
      '(Pilot Plant #2)',
      '(Pilot Plants 1 & 2)',
      '(Pilot Plant #2 + H20)',
      '(Pilot Plant #3)',
      '(Pilot Plant #3 + H20)'
    ],
    shipmentLocations: [
      'Curia Frankfurt',
      'Curia Albany',
      'Mork Technologies',
      'GEIC',
      'Maxwell'
    ],
    
    // Modal states for adding new dropdown options
    showAddMaterial: false,
    showAddAcidType: false,
    showAddWashMedium: false,
    showAddReactor: false,
    showAddResearchTeam: false,
    showAddBaseType: false,
    showAddGas: false,
    showAddWashSolution: false,
    showAddDryingAtmosphere: false,
    showAddDryingPressure: false,
    showAddOven: false,
    showAddAppearanceTag: false,
    showAddGrapheneComment: false,
    showAddShipmentLocation: false,
    
    // New values for dropdowns
    newMaterial: '',
    newAcidType: '',
    newWashMedium: '',
    newReactor: '',
    newResearchTeam: '',
    newBaseType: '',
    newGas: '',
    newWashSolution: '',
    newDryingAtmosphere: '',
    newDryingPressure: '',
    newOven: '',
    newAppearanceTag: '',
    newGrapheneComment: '',
    newShipmentLocation: '',
    
    // Import utilities as methods
    ...formatters,
    
    // Alias for scientific notation formatting (used in HTML)
    formatScientific(value) {
      return formatters.formatScientificNotation(value);
    },
    
    // Computed property for filtered SEM reports
    get filteredSemReports() {
      if (!this.semReportSearch || this.semReportSearch.trim() === '') {
        return this.semReports;
      }
      
      const searchTerm = this.semReportSearch.toLowerCase();
      return this.semReports.filter(report => {
        // Search in filename
        if (report.originalName && report.originalName.toLowerCase().includes(searchTerm)) {
          return true;
        }
        
        // Search in associated experiment numbers
        if (report.grapheneReports && report.grapheneReports.length > 0) {
          for (const gr of report.grapheneReports) {
            if (gr.graphene.experimentNumber && 
                gr.graphene.experimentNumber.toLowerCase().includes(searchTerm)) {
              return true;
            }
            // Search in species
            if (gr.graphene.species && 
                gr.graphene.species.toLowerCase().includes(searchTerm)) {
              return true;
            }
          }
        }
        
        return false;
      });
    },
    
    // Testing Infrastructure
    componentErrors: [],
    stateValidationErrors: [],
    
    setupTestingInfrastructure() {
      // Global error monitoring
      window.addEventListener('error', (event) => {
        const error = {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          timestamp: new Date().toISOString(),
          type: 'javascript-error'
        };
        this.componentErrors.push(error);
        console.error('Component Error Detected:', error);
      });
      
      // Unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        const error = {
          message: event.reason?.message || 'Unhandled Promise Rejection',
          reason: event.reason,
          timestamp: new Date().toISOString(),
          type: 'promise-rejection'
        };
        this.componentErrors.push(error);
        console.error('Promise Rejection Detected:', error);
      });
      
      console.log('🧪 Testing infrastructure initialized');
    },
    
    validateApplicationState() {
      const requiredStateProperties = [
        'biocharRecords', 'grapheneRecords', 'betRecords', 'conductivityRecords',
        'ramanRecords', 'temRecords', 'updateReports', 'semReports',
        'compoundBatches', 'shipments', 'micronizations'
      ];
      
      const errors = [];
      requiredStateProperties.forEach(prop => {
        if (!Array.isArray(this[prop])) {
          errors.push(`State property '${prop}' is not an array or is undefined`);
        }
      });
      
      this.stateValidationErrors = errors;
      if (errors.length > 0) {
        console.error('State Validation Errors:', errors);
      } else {
        console.log('✅ Application state validation passed');
      }
      
      return errors.length === 0;
    },
    
    async performAPIHealthCheck() {
      const endpoints = [
        '/api/bet',
        '/api/conductivity', 
        '/api/raman',
        '/api/tem',
        '/api/update-reports',
        '/api/sem-reports'
      ];
      
      const results = {};
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          results[endpoint] = {
            status: response.status,
            ok: response.ok,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          results[endpoint] = {
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
          };
        }
      }
      
      console.log('🏥 API Health Check Results:', results);
      return results;
    },
    
    getTestingReport() {
      return {
        componentErrors: this.componentErrors,
        stateValidationErrors: this.stateValidationErrors,
        timestamp: new Date().toISOString(),
        errorCount: this.componentErrors.length,
        stateValid: this.stateValidationErrors.length === 0
      };
    },
    
    // Initialization
    async init() {
      // Setup testing infrastructure first
      this.setupTestingInfrastructure();
      
      // Load dashboard data first if dashboard is active
      if (this.activeTab === 'dashboard') {
        await this.loadDashboardData();
      }
      
      // Initialize filter system for graphene table
      await this.initFilters('graphene');
      
      await Promise.all([
        this.loadBiocharRecords(),
        this.loadGrapheneRecords(),
        this.loadBetRecords(),
        this.loadConductivityRecords(),
        this.loadRamanRecords(),
        this.loadTemRecords(),
        this.loadUpdateReports(),
        this.loadSemReports(),
        this.loadCompoundBatches(),
        this.loadShipments(),
        this.loadMicronizations()
      ]);
      this.loadDropdownOptions();
      
      // Validate state after initialization
      setTimeout(() => {
        this.validateApplicationState();
        this.performAPIHealthCheck();
      }, 1000);
    },
    
    // Data loading methods
    async loadBiocharRecords() {
      try {
        this.biocharRecords = await API.biochar.getAll(this.biocharSearch);
        this.applySortingToBiochar();
        this.loadAvailableExperiments();
        await this.loadAvailableLots();
      } catch (error) {
        console.error('Failed to load biochar records:', error);
        this.biocharRecords = [];
      }
    },
    
    async loadGrapheneRecords() {
      try {
        // Build filter parameters using both old search and new filters
        const baseParams = {};
        if (this.grapheneSearch) {
          baseParams.search = this.grapheneSearch;
        }
        
        const params = this.buildFilterQueryParams('graphene', baseParams);
        params.limit = '500'; // Request all records
        const response = await fetch(`/api/graphene?${new URLSearchParams(params)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Handle both old format (direct array) and new format (with metadata)
        if (result.success !== undefined) {
          // New format with metadata
          this.grapheneRecords = result.data || [];
          this.grapheneFilterState.meta = result.meta || {};
        } else {
          // Old format - direct array
          this.grapheneRecords = Array.isArray(result) ? result : [];
          this.grapheneFilterState.meta = {};
        }
        
        this.applySortingToGraphene();
        this.loadAvailableGrapheneSamples();
      } catch (error) {
        console.error('Failed to load graphene records:', error);
        this.grapheneRecords = [];
        this.grapheneFilterState.meta = {};
      }
    },
    
    async loadBetRecords() {
      try {
        this.betRecords = await API.bet.getAll(this.betSearch);
      } catch (error) {
        console.error('Failed to load BET records:', error);
        this.betRecords = [];
      }
    },
    
    async loadConductivityRecords() {
      try {
        this.conductivityRecords = await API.conductivity.getAll(this.conductivitySearch);
      } catch (error) {
        console.error('Failed to load conductivity records:', error);
        this.conductivityRecords = [];
      }
    },

    async loadRamanRecords() {
      try {
        this.ramanRecords = await API.raman.getAll(this.ramanSearch);
      } catch (error) {
        console.error('Failed to load RAMAN records:', error);
        this.ramanRecords = [];
      }
    },

    async loadTemRecords() {
      try {
        this.temRecords = await API.tem.getAll(this.temSearch);
      } catch (error) {
        console.error('Failed to load TEM records:', error);
        this.temRecords = [];
      }
    },
    
    async loadUpdateReports() {
      try {
        this.updateReports = await API.updateReport.getAll();
      } catch (error) {
        console.error('Failed to load update reports:', error);
        this.updateReports = [];
      }
    },
    
    async loadSemReports() {
      try {
        this.semReports = await API.semReport.getAll();
      } catch (error) {
        console.error('Failed to load SEM reports:', error);
        this.semReports = [];
      }
    },
    
    async loadCompoundBatches() {
      try {
        this.compoundBatchRecords = await API.compoundBatch.getAll(this.compoundBatchSearch);
        this.loadAvailableCompoundBatches();
      } catch (error) {
        console.error('Failed to load compound batches:', error);
        this.compoundBatchRecords = [];
      }
    },

    async loadShipments() {
      try {
        this.shipments = await API.shipment.getAll(this.shipmentSearch);
      } catch (error) {
        console.error('Failed to load shipments:', error);
        this.shipments = [];
      }
    },

    async loadMicronizations() {
      try {
        this.micronizations = await API.micronization.getAll(this.micronizationSearch);
      } catch (error) {
        console.error('Failed to load micronizations:', error);
        this.micronizations = [];
      }
    },
    
    async loadAvailableLots() {
      try {
        this.availableLots = await API.biochar.getLots();
      } catch (error) {
        console.error('Failed to load available lots:', error);
        this.availableLots = [];
      }
    },
    
    // Load dropdown options from existing records
    loadDropdownOptions() {
      this.loadRawMaterials();
    },
    
    loadRawMaterials() {
      const materials = dataHelpers.getUniqueValues(this.biocharRecords, 'rawMaterial');
      const combined = new Set([...this.rawMaterials, ...materials]);
      this.rawMaterials = Array.from(combined).sort();
    },
    
    loadAvailableExperiments() {
      const experiments = this.biocharRecords
        .filter(r => r.experimentNumber && !r.lotNumber)
        .map(r => r.experimentNumber)
        .sort();
      this.availableExperiments = experiments;
    },
    
    loadAvailableGrapheneSamples() {
      const samples = dataHelpers.getUniqueValues(this.grapheneRecords, 'experimentNumber');
      this.availableGrapheneSamples = samples;
    },
    
    loadAvailableCompoundBatches() {
      const batches = dataHelpers.getUniqueValues(this.compoundBatchRecords, 'batchNumber');
      this.availableCompoundBatches = batches;
    },
    
    // Search methods (debounced)
    searchBiochar() {
      if (!this._debouncedSearchBiochar) {
        this._debouncedSearchBiochar = dataHelpers.debounce(async () => {
          await this.loadBiocharRecords();
        }, 300);
      }
      this._debouncedSearchBiochar();
    },
    
    searchGraphene() {
      if (!this._debouncedSearchGraphene) {
        this._debouncedSearchGraphene = dataHelpers.debounce(async () => {
          await this.loadGrapheneRecords();
        }, 300);
      }
      this._debouncedSearchGraphene();
    },
    
    searchBet() {
      if (!this._debouncedSearchBet) {
        this._debouncedSearchBet = dataHelpers.debounce(async () => {
          await this.loadBetRecords();
        }, 300);
      }
      this._debouncedSearchBet();
    },
    
    searchConductivity() {
      if (!this._debouncedSearchConductivity) {
        this._debouncedSearchConductivity = dataHelpers.debounce(async () => {
          await this.loadConductivityRecords();
        }, 300);
      }
      this._debouncedSearchConductivity();
    },

    searchRaman() {
      if (!this._debouncedSearchRaman) {
        this._debouncedSearchRaman = dataHelpers.debounce(async () => {
          await this.loadRamanRecords();
        }, 300);
      }
      this._debouncedSearchRaman();
    },
    
    searchUpdateReports() {
      if (!this._debouncedSearchUpdateReports) {
        this._debouncedSearchUpdateReports = dataHelpers.debounce(async () => {
          await this.loadUpdateReports();
        }, 300);
      }
      this._debouncedSearchUpdateReports();
    },
    
    searchSemReports() {
      if (!this._debouncedSearchSemReports) {
        this._debouncedSearchSemReports = dataHelpers.debounce(async () => {
          await this.loadSemReports();
        }, 300);
      }
      this._debouncedSearchSemReports();
    },
    
    searchCompoundBatches() {
      if (!this._debouncedSearchCompoundBatches) {
        this._debouncedSearchCompoundBatches = dataHelpers.debounce(async () => {
          await this.loadCompoundBatches();
        }, 300);
      }
      this._debouncedSearchCompoundBatches();
    },

    searchShipments() {
      if (!this._debouncedSearchShipments) {
        this._debouncedSearchShipments = dataHelpers.debounce(async () => {
          await this.loadShipments();
        }, 300);
      }
      this._debouncedSearchShipments();
    },

    searchMicronizations() {
      if (!this._debouncedSearchMicronizations) {
        this._debouncedSearchMicronizations = dataHelpers.debounce(async () => {
          await this.loadMicronizations();
        }, 300);
      }
      this._debouncedSearchMicronizations();
    },
    
    // Sorting methods
    sortBiochar(column) {
      if (this.biocharSortColumn === column) {
        this.biocharSortDirection = this.biocharSortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.biocharSortColumn = column;
        this.biocharSortDirection = 'asc';
      }
      this.applySortingToBiochar();
    },
    
    applySortingToBiochar() {
      if (!this.biocharSortColumn) return;
      
      this.biocharRecords.sort((a, b) => {
        let aVal = a[this.biocharSortColumn];
        let bVal = b[this.biocharSortColumn];
        
        // Handle null/undefined values - always sort to end
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        
        // Convert to appropriate types for comparison
        if (this.biocharSortColumn === 'experimentDate') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        } else if (this.isNumericColumn(this.biocharSortColumn)) {
          aVal = parseFloat(aVal) || 0;
          bVal = parseFloat(bVal) || 0;
        } else {
          aVal = String(aVal).toLowerCase();
          bVal = String(bVal).toLowerCase();
        }
        
        let result = 0;
        if (aVal < bVal) result = -1;
        else if (aVal > bVal) result = 1;
        
        return this.biocharSortDirection === 'desc' ? -result : result;
      });
    },
    
    isNumericColumn(column) {
      const numericColumns = ['testOrder', 'startingAmount', 'acidAmount', 'acidConcentration', 
                             'acidMolarity', 'temperature', 'time', 'pressureInitial', 'pressureFinal', 
                             'washAmount', 'output', 'dryingTemp', 'kftPercentage'];
      return numericColumns.includes(column);
    },
    
    sortGraphene(column) {
      if (this.grapheneSortColumn === column) {
        this.grapheneSortDirection = this.grapheneSortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.grapheneSortColumn = column;
        this.grapheneSortDirection = 'asc';
      }
      this.applySortingToGraphene();
    },
    
    applySortingToGraphene() {
      if (!this.grapheneSortColumn) return;
      
      this.grapheneRecords.sort((a, b) => {
        let aVal = a[this.grapheneSortColumn];
        let bVal = b[this.grapheneSortColumn];
        
        // Handle null/undefined values - always sort to end
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        
        // Convert to appropriate types for comparison
        if (this.grapheneSortColumn === 'experimentDate') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        } else if (this.isGrapheneNumericColumn(this.grapheneSortColumn)) {
          aVal = parseFloat(aVal) || 0;
          bVal = parseFloat(bVal) || 0;
        } else {
          aVal = String(aVal).toLowerCase();
          bVal = String(bVal).toLowerCase();
        }
        
        let result = 0;
        if (aVal < bVal) result = -1;
        else if (aVal > bVal) result = 1;
        
        return this.grapheneSortDirection === 'desc' ? -result : result;
      });
    },
    
    isGrapheneNumericColumn(column) {
      const numericColumns = ['testOrder', 'quantity', 'baseAmount', 'baseConcentration', 'base2Amount', 
                             'base2Concentration', 'grindingCount', 'grindingTime', 'grindingFrequency', 'tempRate', 'tempMax', 
                             'time', 'washAmount', 'washConcentration', 'washWater', 'dryingTemp', 
                             'volumeMl', 'output'];
      return numericColumns.includes(column);
    },
    
    getSortIcon(column) {
      const currentColumn = this.activeTab === 'biochar' ? this.biocharSortColumn : this.grapheneSortColumn;
      const currentDirection = this.activeTab === 'biochar' ? this.biocharSortDirection : this.grapheneSortDirection;
      
      if (currentColumn !== column) {
        return '<svg class="w-3 h-3 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg>';
      }
      
      if (currentDirection === 'asc') {
        return '<svg class="w-3 h-3 ml-1 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4"></path></svg>';
      } else {
        return '<svg class="w-3 h-3 ml-1 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v12m0 0l4-4m-4 4l-4-4"></path></svg>';
      }
    },

    // Computed properties (getters)
    get filteredShipments() {
      return this.shipments;
    },

    get filteredMicronizations() {
      return this.micronizations;
    },

    get compoundBatches() {
      return this.compoundBatchRecords;
    },
    
    // Expandable row methods
    async toggleBiocharExpansion(experimentNumber) {
      // Toggle the expansion state using Alpine.js reactive assignment
      this.expandedBiocharRows = {
        ...this.expandedBiocharRows,
        [experimentNumber]: !this.expandedBiocharRows[experimentNumber]
      };
      
      // If expanding and we don't have data yet, fetch it
      if (this.expandedBiocharRows[experimentNumber] && !this.biocharRelatedData[experimentNumber]) {
        await this.loadBiocharRelatedData(experimentNumber);
      }
    },
    
    async toggleGrapheneExpansion(experimentNumber) {
      // Toggle the expansion state using Alpine.js reactive assignment
      const newState = !this.expandedGrapheneRows[experimentNumber];
      this.expandedGrapheneRows = {
        ...this.expandedGrapheneRows,
        [experimentNumber]: newState
      };
      
      // Force Alpine.js to detect the change and re-render
      await this.$nextTick();
      
      // If expanding and we don't have data yet, fetch it
      if (this.expandedGrapheneRows[experimentNumber] && !this.grapheneRelatedData[experimentNumber]) {
        await this.loadGrapheneRelatedData(experimentNumber);
      }
    },
    
    async loadBiocharRelatedData(experimentNumber) {
      try {
        this.loadingBiocharRelated = {
          ...this.loadingBiocharRelated,
          [experimentNumber]: true
        };
        const relatedData = await API.biochar.getRelated(experimentNumber);
        this.biocharRelatedData = {
          ...this.biocharRelatedData,
          [experimentNumber]: relatedData
        };
      } catch (error) {
        console.error('Failed to load biochar related data:', error);
        alert(`Failed to load related data: ${error.message}`);
      } finally {
        this.loadingBiocharRelated = {
          ...this.loadingBiocharRelated,
          [experimentNumber]: false
        };
      }
    },
    
    async loadGrapheneRelatedData(experimentNumber) {
      try {
        this.loadingGrapheneRelated = {
          ...this.loadingGrapheneRelated,
          [experimentNumber]: true
        };
        const relatedData = await API.graphene.getRelated(experimentNumber);
        this.grapheneRelatedData = {
          ...this.grapheneRelatedData,
          [experimentNumber]: relatedData
        };
      } catch (error) {
        console.error('Failed to load graphene related data:', error);
        alert(`Failed to load related data: ${error.message}`);
      } finally {
        this.loadingGrapheneRelated = {
          ...this.loadingGrapheneRelated,
          [experimentNumber]: false
        };
      }
    },

    async toggleCompoundBatchExpansion(batchId) {
      // Toggle the expansion state using Alpine.js reactive assignment
      const newState = !this.expandedCompoundBatches[batchId];
      this.expandedCompoundBatches = {
        ...this.expandedCompoundBatches,
        [batchId]: newState
      };
      
      // Force Alpine.js to detect the change and re-render
      await this.$nextTick();
      
      // If expanding and we don't have data yet, fetch it
      if (this.expandedCompoundBatches[batchId] && !this.compoundBatchRelatedData[batchId]) {
        await this.loadCompoundBatchRelatedData(batchId);
      }
    },

    async loadCompoundBatchRelatedData(batchId) {
      try {
        this.loadingCompoundBatchRelated = {
          ...this.loadingCompoundBatchRelated,
          [batchId]: true
        };
        const relatedData = await API.compoundBatch.getRelated(batchId);
        this.compoundBatchRelatedData = {
          ...this.compoundBatchRelatedData,
          [batchId]: relatedData
        };
      } catch (error) {
        console.error('Failed to load compound batch related data:', error);
        alert(`Failed to load related data: ${error.message}`);
      } finally {
        this.loadingCompoundBatchRelated = {
          ...this.loadingCompoundBatchRelated,
          [batchId]: false
        };
      }
    },
    
    // Generic toggle method for simple expandable rows
    toggleExpanded(type, id) {
      const key = `${type}_${id}`;
      this.expandedRows = {
        ...this.expandedRows,
        [key]: !this.expandedRows[key]
      };
    },

    toggleMicronizationExpansion(id) {
      this.toggleExpanded('micronization', id);
    },
    
    // Biochar CRUD operations - Delegated to CRUDService
    editBiochar(record) {
      CRUDService.editBiochar(record, this);
    },
    
    copyBiochar(record) {
      CRUDService.copyBiochar(record, this);
    },
    
    async saveBiochar() {
      await CRUDService.saveBiochar(this);
    },
    
    async deleteBiochar(id) {
      await CRUDService.deleteBiochar(id, this);
    },
    
    closeBiocharForm() {
      CRUDService.closeBiocharForm(this);
    },
    
    // Graphene CRUD operations - Delegated to CRUDService
    editGraphene(record) {
      CRUDService.editGraphene(record, this);
    },

    copyGraphene(record) {
      CRUDService.copyGraphene(record, this);
    },

    async saveGraphene() {
      await CRUDService.saveGraphene(this);
    },

    async deleteGraphene(id) {
      await CRUDService.deleteGraphene(id, this);
    },

    async removeSemReportAssociation(semReportId) {
      await CRUDService.removeSemReportAssociation(semReportId, this);
    },

    closeGrapheneForm() {
      CRUDService.closeGrapheneForm(this);
    },

    // BET CRUD operations - Delegated to CRUDService
    editBet(record) {
      CRUDService.editBet(record, this);
    },

    async saveBet() {
      await CRUDService.saveBet(this);
    },

    async deleteBet(id) {
      await CRUDService.deleteBet(id, this);
    },

    closeBetForm() {
      CRUDService.closeBetForm(this);
    },

    // Conductivity CRUD operations - Delegated to CRUDService
    editConductivity(record) {
      CRUDService.editConductivity(record, this);
    },

    async saveConductivity() {
      await CRUDService.saveConductivity(this);
    },

    async deleteConductivity(id) {
      await CRUDService.deleteConductivity(id, this);
    },

    closeConductivityForm() {
      CRUDService.closeConductivityForm(this);
    },

    // RAMAN Test management - Delegated to CRUDService
    editRaman(record) {
      CRUDService.editRaman(record, this);
    },

    async saveRaman() {
      await CRUDService.saveRaman(this);
    },

    async deleteRaman(id) {
      await CRUDService.deleteRaman(id, this);
    },

    closeRamanForm() {
      CRUDService.closeRamanForm(this);
    },

    // TEM CRUD operations - Delegated to CRUDService
    editTem(record) {
      CRUDService.editTem(record, this);
    },

    async saveTem() {
      await CRUDService.saveTem(this);
    },

    async deleteTem(id) {
      await CRUDService.deleteTem(id, this);
    },

    closeTemForm() {
      CRUDService.closeTemForm(this);
    },

    // Update Report CRUD operations - Delegated to CRUDService
    editUpdateReport(record) {
      CRUDService.editUpdateReport(record, this);
    },

    async saveUpdateReport() {
      await CRUDService.saveUpdateReport(this);
    },

    async deleteUpdateReport(id) {
      await CRUDService.deleteUpdateReport(id, this);
    },

    closeUpdateReportForm() {
      CRUDService.closeUpdateReportForm(this);
    },

    viewUpdateReport(filePath) {
      CRUDService.viewUpdateReport(filePath, this);
    },

    closeUpdateReportModal() {
      CRUDService.closeUpdateReportModal(this);
    },

    handleUpdateFileChange(event) {
      CRUDService.handleUpdateFileChange(event, this);
    },

    toggleGrapheneSelection(grapheneId) {
      CRUDService.toggleGrapheneSelection(grapheneId, this);
    },

    // New Update Report functions for compound batch support - Delegated to CRUDService
    toggleUpdateReportGraphene(grapheneId) {
      CRUDService.toggleUpdateReportGraphene(grapheneId, this);
    },

    toggleUpdateReportCompoundBatch(batchId) {
      CRUDService.toggleUpdateReportCompoundBatch(batchId, this);
    },

    filterUpdateReportMaterials() {
      CRUDService.filterUpdateReportMaterials(this);
    },

    // SEM Report methods - Delegated to CRUDService
    async saveSemReport() {
      await CRUDService.saveSemReport(this);
    },

    editSemReport(record) {
      CRUDService.editSemReport(record, this);
    },

    async deleteSemReport(id) {
      await CRUDService.deleteSemReport(id, this);
    },

    closeSemReportForm() {
      CRUDService.closeSemReportForm(this);
    },

    viewSemPdf(filePath) {
      CRUDService.viewSemPdf(filePath, this);
    },

    closeSemModal() {
      CRUDService.closeSemModal(this);
    },

    handleSemFileChange(event) {
      CRUDService.handleSemFileChange(event, this);
    },

    toggleSemGrapheneSelection(grapheneId) {
      CRUDService.toggleSemGrapheneSelection(grapheneId, this);
    },

    toggleSemCompoundBatchSelection(compoundBatchId) {
      CRUDService.toggleSemCompoundBatchSelection(compoundBatchId, this);
    },

    // Compound Batch CRUD operations - Delegated to CRUDService
    async saveCompoundBatch() {
      await CRUDService.saveCompoundBatch(this);
    },

    editCompoundBatch(batch) {
      CRUDService.editCompoundBatch(batch, this);
    },

    async deleteCompoundBatch(id) {
      await CRUDService.deleteCompoundBatch(id, this);
    },

    closeCompoundBatchForm() {
      CRUDService.closeCompoundBatchForm(this);
    },

    // Compound Batch Management Tab Functions - Delegated to CRUDService
    openCompoundBatchForm() {
      CRUDService.openCompoundBatchForm(this);
    },

    async searchCompoundBatches() {
      await CRUDService.searchCompoundBatches(this);
    },

    sortCompoundBatches(column) {
      CRUDService.sortCompoundBatches(column, this);
    },

    getCompoundBatchSortIcon(column) {
      return CRUDService.getCompoundBatchSortIcon(column, this);
    },

    // Modal experiment selection functions - Delegated to CRUDService
    getFilteredExperiments() {
      return CRUDService.getFilteredExperiments(this);
    },

    toggleExperimentSelection(experimentId) {
      CRUDService.toggleExperimentSelection(experimentId, this);
    },

    updateCompoundBatchTotalOutput() {
      CRUDService.updateCompoundBatchTotalOutput(this);
    },

    createCompoundBatchFromSelected() {
      CRUDService.createCompoundBatchFromSelected(this);
    },

    // Shipment CRUD operations - Delegated to CRUDService
    openShipmentForm(shipment = null) {
      CRUDService.openShipmentForm(shipment, this);
    },

    async saveShipment() {
      await CRUDService.saveShipment(this);
    },

    async deleteShipment(id) {
      await CRUDService.deleteShipment(id, this);
    },

    duplicateShipment(shipment) {
      CRUDService.duplicateShipment(shipment, this);
    },

    closeShipmentForm() {
      CRUDService.closeShipmentForm(this);
    },

    addShipmentLocation() {
      CRUDService.addShipmentLocation(this);
    },

    // Micronization CRUD operations - Delegated to CRUDService
    openMicronizationForm(micronization = null) {
      CRUDService.openMicronizationForm(micronization, this);
    },

    async saveMicronization() {
      await CRUDService.saveMicronization(this);
    },

    async deleteMicronization(id) {
      await CRUDService.deleteMicronization(id, this);
    },

    duplicateMicronization(micronization) {
      CRUDService.duplicateMicronization(micronization, this);
    },

    closeMicronizationForm() {
      CRUDService.closeMicronizationForm(this);
    },

    // Export methods
    exportData(type) {
      if (type === 'biochar') {
        API.biochar.exportCSV();
      } else if (type === 'graphene') {
        API.graphene.exportCSV();
      } else if (type === 'bet' || type === 'test-bet') {
        API.bet.exportCSV();
      } else if (type === 'conductivity' || type === 'test-conductivity') {
        API.conductivity.exportCSV();
      } else if (type === 'raman' || type === 'test-raman') {
        API.raman.exportCSV();
      } else if (type === 'tem' || type === 'test-tem') {
        API.tem.exportCSV();
      } else if (type === 'compound-batches') {
        API.compoundBatch.exportCSV();
      } else if (type === 'shipments') {
        API.shipment.exportCSV();
      } else if (type === 'micronization') {
        API.micronization.exportCSV();
      }
    },
    
    // Lot combination
    async combineBiocharIntoLot() {
      try {
        if (this.selectedBiocharIds.length === 0) {
          alert('Please select at least one biochar experiment to combine.');
          return;
        }
        
        if (!this.combineForm.lotNumber.trim()) {
          alert('Please enter a lot number.');
          return;
        }
        
        await API.biochar.combineLots({
          lotNumber: this.combineForm.lotNumber.trim(),
          lotName: this.combineForm.lotName.trim() || null,
          description: this.combineForm.description.trim() || null,
          experimentIds: this.selectedBiocharIds
        });
        
        const selectedCount = this.selectedBiocharIds.length;
        const lotNumber = this.combineForm.lotNumber;
        
        await this.loadBiocharRecords();
        this.showCombineModal = false;
        this.selectedBiocharIds = [];
        this.combineForm = { ...DEFAULT_FORMS.combine };
        
        alert(`Successfully created lot ${lotNumber} with ${selectedCount} experiments.`);
      } catch (error) {
        console.error('Failed to combine biochar into lot:', error);
        alert(`Failed to create lot: ${error.message}`);
      }
    },
    
    // File handling
    handleSemFileChange(event) {
      const file = event.target.files[0];
      const validation = validators.validatePDFFile(file);
      
      if (validation.isValid) {
        this.grapheneForm.semReportFile = file;
      } else {
        alert(validation.message);
        event.target.value = '';
        this.grapheneForm.semReportFile = null;
      }
    },
    
    viewSemReport(semReportPath) {
      if (semReportPath) {
        // Path will be proxied through Vite to backend
        // Add PDF viewer parameters to hide navigation pane and toolbar elements
        this.currentSemPdf = semReportPath + '#navpanes=0&toolbar=0';
        this.showSemModal = true;
      }
    },
    
    closeSemModal() {
      this.showSemModal = false;
      this.currentSemPdf = null;
    },

    viewRamanPdf(ramanReportPath) {
      if (ramanReportPath) {
        this.currentRamanPdf = '/uploads/' + ramanReportPath + '#navpanes=0&toolbar=0';
        this.showRamanModal = true;
      }
    },

    closeRamanModal() {
      this.showRamanModal = false;
      this.currentRamanPdf = null;
    },

    viewTemPdf(temReportPath) {
      if (temReportPath) {
        this.currentTemPdf = '/uploads/' + temReportPath + '#navpanes=0&toolbar=0';
        this.showTemModal = true;
      }
    },

    closeTemModal() {
      this.showTemModal = false;
      this.currentTemPdf = null;
    },

    viewBetPdf(betReportPath) {
      if (betReportPath) {
        this.currentBetPdf = '/uploads/' + betReportPath + '#navpanes=0&toolbar=0';
        this.showBetModal = true;
      }
    },

    closeBetModal() {
      this.showBetModal = false;
      this.currentBetPdf = null;
    },
    
    // Biochar source handling for graphene form
    handleBiocharSourceChange(event) {
      const value = event.target.value;
      if (value.startsWith('exp:')) {
        this.grapheneForm.biocharExperiment = value.replace('exp:', '');
        this.grapheneForm.biocharLotNumber = '';
      } else if (value.startsWith('lot:')) {
        this.grapheneForm.biocharLotNumber = value.replace('lot:', '');
        this.grapheneForm.biocharExperiment = '';
      } else {
        this.grapheneForm.biocharExperiment = '';
        this.grapheneForm.biocharLotNumber = '';
      }
    },
    
    // Objective parsing
    parseObjective() {
      if (!this.grapheneForm.objectivePaste) {
        alert('Please paste the objective text first');
        return;
      }
      
      const parsed = objectiveParser.parseObjectiveText(this.grapheneForm.objectivePaste);
      
      if (parsed) {
        // Update form fields with parsed data
        this.grapheneForm.objective = parsed.objective || '';
        this.grapheneForm.experimentDetails = parsed.experimentDetails || '';
        this.grapheneForm.result = parsed.result || '';
        this.grapheneForm.conclusion = parsed.conclusion || '';
        this.grapheneForm.recommendedAction = parsed.recommendedAction || '';
        
        // Show success message
        alert('Objective text parsed successfully! Review the extracted fields below.');
      } else {
        alert('Could not parse the objective text. Please check the format and try again.');
      }
    },
    
    clearObjectiveFields() {
      this.grapheneForm.objective = '';
      this.grapheneForm.experimentDetails = '';
      this.grapheneForm.result = '';
      this.grapheneForm.conclusion = '';
      this.grapheneForm.recommendedAction = '';
      this.grapheneForm.objectivePaste = '';
    },
    
    // Appearance tags handling
    toggleAppearanceTag(tag) {
      if (!this.grapheneForm.appearanceTags) {
        this.grapheneForm.appearanceTags = [];
      }
      
      const index = this.grapheneForm.appearanceTags.indexOf(tag);
      if (index > -1) {
        this.grapheneForm.appearanceTags.splice(index, 1);
      } else if (this.grapheneForm.appearanceTags.length < 20) {
        this.grapheneForm.appearanceTags.push(tag);
      }
    },
    
    // Update report selection handling
    toggleUpdateReportSelection(reportId) {
      if (!this.grapheneForm.updateReportIds) {
        this.grapheneForm.updateReportIds = [];
      }
      
      const index = this.grapheneForm.updateReportIds.indexOf(reportId);
      if (index > -1) {
        this.grapheneForm.updateReportIds.splice(index, 1);
      } else {
        this.grapheneForm.updateReportIds.push(reportId);
      }
    },
    
    // Dropdown management methods
    addNewMaterial() {
      if (this.newMaterial && !this.rawMaterials.includes(this.newMaterial)) {
        this.rawMaterials.push(this.newMaterial);
        this.biocharForm.rawMaterial = this.newMaterial;
        this.newMaterial = '';
        this.showAddMaterial = false;
      }
    },
    
    addNewAcidType() {
      if (this.newAcidType && !this.acidTypes.includes(this.newAcidType)) {
        this.acidTypes.push(this.newAcidType);
        this.biocharForm.acidType = this.newAcidType;
        this.newAcidType = '';
        this.showAddAcidType = false;
      }
    },
    
    addNewWashMedium() {
      if (this.newWashMedium && !this.washMediums.includes(this.newWashMedium)) {
        this.washMediums.push(this.newWashMedium);
        this.biocharForm.washMedium = this.newWashMedium;
        this.newWashMedium = '';
        this.showAddWashMedium = false;
      }
    },
    
    addNewReactor() {
      if (this.newReactor && !this.reactors.includes(this.newReactor)) {
        this.reactors.push(this.newReactor);
        this.biocharForm.reactor = this.newReactor;
        this.newReactor = '';
        this.showAddReactor = false;
      }
    },
    
    addNewResearchTeam() {
      if (this.newResearchTeam && !this.researchTeams.includes(this.newResearchTeam)) {
        this.researchTeams.push(this.newResearchTeam);
        if (this.showAddBiochar) {
          this.biocharForm.researchTeam = this.newResearchTeam;
        } else if (this.showAddGraphene) {
          this.grapheneForm.researchTeam = this.newResearchTeam;
        }
        this.newResearchTeam = '';
        this.showAddResearchTeam = false;
      }
    },
    
    addNewBaseType() {
      if (this.newBaseType && !this.baseTypes.includes(this.newBaseType)) {
        this.baseTypes.push(this.newBaseType);
        this.grapheneForm.baseType = this.newBaseType;
        this.newBaseType = '';
        this.showAddBaseType = false;
      }
    },
    
    addNewGas() {
      if (this.newGas && !this.gases.includes(this.newGas)) {
        this.gases.push(this.newGas);
        this.grapheneForm.gas = this.newGas;
        this.newGas = '';
        this.showAddGas = false;
      }
    },
    
    addNewWashSolution() {
      if (this.newWashSolution && !this.washSolutions.includes(this.newWashSolution)) {
        this.washSolutions.push(this.newWashSolution);
        this.grapheneForm.washSolution = this.newWashSolution;
        this.newWashSolution = '';
        this.showAddWashSolution = false;
      }
    },
    
    addNewDryingAtmosphere() {
      if (this.newDryingAtmosphere && !this.dryingAtmospheres.includes(this.newDryingAtmosphere)) {
        this.dryingAtmospheres.push(this.newDryingAtmosphere);
        this.grapheneForm.dryingAtmosphere = this.newDryingAtmosphere;
        this.newDryingAtmosphere = '';
        this.showAddDryingAtmosphere = false;
      }
    },
    
    addNewDryingPressure() {
      if (this.newDryingPressure && !this.dryingPressures.includes(this.newDryingPressure)) {
        this.dryingPressures.push(this.newDryingPressure);
        this.grapheneForm.dryingPressure = this.newDryingPressure;
        this.newDryingPressure = '';
        this.showAddDryingPressure = false;
      }
    },
    
    addNewOven() {
      if (this.newOven && !this.ovens.includes(this.newOven)) {
        this.ovens.push(this.newOven);
        this.grapheneForm.oven = this.newOven;
        this.newOven = '';
        this.showAddOven = false;
      }
    },
    
    addNewAppearanceTag() {
      if (this.newAppearanceTag && !this.appearanceTags.includes(this.newAppearanceTag)) {
        this.appearanceTags.push(this.newAppearanceTag);
        this.newAppearanceTag = '';
        this.showAddAppearanceTag = false;
      }
    },
    
    addNewGrapheneComment() {
      if (this.newGrapheneComment && !this.grapheneComments.includes(this.newGrapheneComment)) {
        this.grapheneComments.push(this.newGrapheneComment);
        this.grapheneForm.comments = this.newGrapheneComment;
        this.newGrapheneComment = '';
        this.showAddGrapheneComment = false;
      }
    },
    
    // Modal HTML generation using helpers
    getModalHtml(modalType) {
      // This method generates modal HTML dynamically
      // We'll use this to gradually replace hardcoded modals
      switch(modalType) {
        case 'addResearchTeam':
          return modalHelpers.createAddItemModal({
            itemType: 'Research Team',
            showVariable: 'showAddResearchTeam',
            modelVariable: 'newResearchTeam',
            submitMethod: 'addNewResearchTeam',
            inputLabel: 'Team Name',
            inputType: 'text',
            placeholder: ''
          });
        case 'addGrapheneComment':
          return modalHelpers.createAddItemModal({
            itemType: 'Comment Option',
            showVariable: 'showAddGrapheneComment',
            modelVariable: 'newGrapheneComment',
            submitMethod: 'addNewGrapheneComment',
            inputLabel: 'Comment Text',
            inputType: 'textarea',
            placeholder: 'Enter the comment text that will be available for selection...'
          });
        case 'addMaterial':
          return modalHelpers.createAddItemModal({
            itemType: 'Raw Material',
            showVariable: 'showAddMaterial',
            modelVariable: 'newMaterial',
            submitMethod: 'addNewMaterial',
            inputLabel: 'Material Name',
            inputType: 'text',
            placeholder: ''
          });
        case 'addReactor':
          return modalHelpers.createAddItemModal({
            itemType: 'Reactor',
            showVariable: 'showAddReactor',
            modelVariable: 'newReactor',
            submitMethod: 'addNewReactor',
            inputLabel: 'Reactor Name',
            inputType: 'text',
            placeholder: ''
          });
        case 'addBaseType':
          return modalHelpers.createAddItemModal({
            itemType: 'Base Type',
            showVariable: 'showAddBaseType',
            modelVariable: 'newBaseType',
            submitMethod: 'addNewBaseType',
            inputLabel: 'Base Type',
            inputType: 'text',
            placeholder: ''
          });
        case 'addOven':
          return modalHelpers.createAddItemModal({
            itemType: 'Oven',
            showVariable: 'showAddOven',
            modelVariable: 'newOven',
            submitMethod: 'addNewOven',
            inputLabel: 'Oven Name',
            inputType: 'text',
            placeholder: ''
          });
        case 'addAppearanceTag':
          return modalHelpers.createAddItemModal({
            itemType: 'Appearance Tag',
            showVariable: 'showAddAppearanceTag',
            modelVariable: 'newAppearanceTag',
            submitMethod: 'addNewAppearanceTag',
            inputLabel: 'Tag Name',
            inputType: 'text',
            placeholder: ''
          });
        case 'addAcidType':
          return modalHelpers.createAddItemModal({
            itemType: 'Acid Type',
            showVariable: 'showAddAcidType',
            modelVariable: 'newAcidType',
            submitMethod: 'addNewAcidType',
            inputLabel: 'Acid Type',
            inputType: 'text',
            placeholder: ''
          });
        case 'addWashMedium':
          return modalHelpers.createAddItemModal({
            itemType: 'Wash Medium',
            showVariable: 'showAddWashMedium',
            modelVariable: 'newWashMedium',
            submitMethod: 'addNewWashMedium',
            inputLabel: 'Wash Medium',
            inputType: 'text',
            placeholder: ''
          });
        case 'addGas':
          return modalHelpers.createAddItemModal({
            itemType: 'Gas',
            showVariable: 'showAddGas',
            modelVariable: 'newGas',
            submitMethod: 'addNewGas',
            inputLabel: 'Gas Type',
            inputType: 'text',
            placeholder: ''
          });
        case 'addWashSolution':
          return modalHelpers.createAddItemModal({
            itemType: 'Wash Solution',
            showVariable: 'showAddWashSolution',
            modelVariable: 'newWashSolution',
            submitMethod: 'addNewWashSolution',
            inputLabel: 'Wash Solution',
            inputType: 'text',
            placeholder: ''
          });
        case 'addDryingAtmosphere':
          return modalHelpers.createAddItemModal({
            itemType: 'Drying Atmosphere',
            showVariable: 'showAddDryingAtmosphere',
            modelVariable: 'newDryingAtmosphere',
            submitMethod: 'addNewDryingAtmosphere',
            inputLabel: 'Drying Atmosphere',
            inputType: 'text',
            placeholder: ''
          });
        case 'addDryingPressure':
          return modalHelpers.createAddItemModal({
            itemType: 'Drying Pressure',
            showVariable: 'showAddDryingPressure',
            modelVariable: 'newDryingPressure',
            submitMethod: 'addNewDryingPressure',
            inputLabel: 'Drying Pressure',
            inputType: 'text',
            placeholder: ''
          });
        default:
          return '';
      }
    },

    // Form initialization helpers
    initBetForm() {
      this.betForm = { ...DEFAULT_FORMS.bet };
      this.editingBet = null;
      this.showAddBet = true;
    },

    initConductivityForm() {
      this.conductivityForm = { ...DEFAULT_FORMS.conductivity };
      this.editingConductivity = null;
      this.showAddConductivity = true;
    },

    initRamanForm() {
      this.ramanForm = { ...DEFAULT_FORMS.raman };
      this.editingRaman = null;
      this.showAddRaman = true;
    },

    initTemForm() {
      this.temForm = { ...DEFAULT_FORMS.tem };
      this.editingTem = null;
      this.showAddTem = true;
    },

    // Date field HTML generation using helpers
    getDateFieldHtml(config) {
      return dateFieldHelpers.createDateFieldWithUnknown(config);
    },

    // Select field HTML generation using helpers
    getSelectFieldHtml(config) {
      return selectFieldHelpers.createSelectWithAdd(config);
    },

    // Numeric field HTML generation using helpers
    getNumericFieldHtml(config) {
      return numericFieldHelpers.createNumericFieldWithUnit(config);
    },

    // File upload field HTML generation using helpers
    getFileFieldHtml(config) {
      return fileFieldHelpers.createFileUploadField(config);
    },

    // Test results section HTML generation using helpers
    getTestResultsSectionHtml(config) {
      return testResultsHelper.createTestResultsSection(config);
    },

    // Reports section HTML generation using helpers
    getReportsSectionHtml(config) {
      return reportsHelper.createReportsSection(config);
    },

    // Source data section HTML generation using helpers
    getSourceDataSectionHtml(config) {
      return sourceDataHelper.createSourceDataSection(config);
    },

    // Objectives section HTML generation using helpers
    getObjectivesSectionHtml(config) {
      return objectivesHelper.createObjectivesSection(config);
    },

    // Shipments section HTML generation using helpers
    getShipmentsSectionHtml(config) {
      return shipmentsHelper.createShipmentsSection(config);
    },

    // PDF viewer modal HTML generation using helpers
    getPdfViewerModalHtml(config) {
      return pdfViewerHelpers.createPdfViewerModal(config);
    },
    
    // Filter system methods - delegated to FilterService
    async initFilters(tableName) {
      await FilterService.initFilters(tableName, this);
      // Expose filter data to app context for template access
      this.filterConfigs = FilterService.getFilterConfigs();
      this.filterOptions = FilterService.getFilterOptions();
      this.activeFilters = FilterService.getActiveFilters();
    },

    generateFilterFields(tableName, filterStateVariable, onFilterChange) {
      return FilterService.generateFilterFields(tableName, filterStateVariable, onFilterChange);
    },

    getActiveFilterCount(filterState) {
      return FilterService.getActiveFilterCount(filterState);
    },

    clearAllFilters(tableName) {
      FilterService.clearAllFilters(tableName, this);
    },

    toggleMultiSelectOption(field, option, checked, stateVariable) {
      FilterService.toggleMultiSelectOption(field, option, checked, stateVariable, this);
    },

    buildFilterQueryParams(tableName, additionalParams = {}) {
      return FilterService.buildFilterQueryParams(tableName, additionalParams, this);
    },

    applyFilters() {
      FilterService.applyFilters(this);
    },
    
    // Dashboard methods - Delegated to DashboardService
    async loadDashboardData() {
      await DashboardService.loadDashboardData(this);
    },
    
    async loadProductionMetrics() {
      await DashboardService.loadProductionMetrics(this);
    },
    
    async loadInventoryData() {
      await DashboardService.loadInventoryData(this);
    },
    
    async loadTestResultsData() {
      await DashboardService.loadTestResultsData(this);
    },
    
    async loadActivityData() {
      await DashboardService.loadActivityData(this);
    },
    
    async loadLatestProductionCards() {
      await DashboardService.loadLatestProductionCards(this);
    },
    
    // Card creation methods for dashboard - Delegated to DashboardService
    createGrapheneCard(experiment) {
      return DashboardService.createGrapheneCard(experiment, createSimplifiedGrapheneCard);
    },
    
    createCompoundBatchCard(batch) {
      return DashboardService.createCompoundBatchCard(batch, createSimplifiedCompoundBatchCard);
    },
    
    createShipmentCard(shipment) {
      return DashboardService.createShipmentCard(shipment, createSimplifiedShipmentCard);
    },
    
    // Modal system methods
    async openGrapheneModal(experimentNumber) {
      if (!experimentNumber) {
        console.error('No experiment number provided to openGrapheneModal');
        return;
      }
      
      this.activeCardModal = experimentNumber;
      this.modalCardType = 'graphene';
      this.modalLoading = true;
      this.modalError = null;
      
      try {
        // Fetch detailed data using CardService
        if (!this.modalCardData[experimentNumber]) {
          const detailedData = await window.CardService.getGrapheneCard(experimentNumber);
          this.modalCardData = {
            ...this.modalCardData,
            [experimentNumber]: detailedData
          };
        }
      } catch (error) {
        console.error('Failed to load detailed card data:', error);
        this.modalError = `Failed to load data for ${experimentNumber}: ${error.message}`;
      } finally {
        this.modalLoading = false;
      }
    },
    
    async openCompoundBatchModal(batchNumber) {
      if (!batchNumber) {
        console.error('No batch number provided to openCompoundBatchModal');
        return;
      }
      
      console.log('Opening modal for batch:', batchNumber);
      
      this.activeCardModal = batchNumber;
      this.modalCardType = 'compoundBatch';
      this.modalLoading = true;
      this.modalError = null;
      
      try {
        if (!this.modalCardData[batchNumber]) {
          const detailedData = await window.CardService.getCompoundBatchCard(batchNumber);
          this.modalCardData = {
            ...this.modalCardData,
            [batchNumber]: detailedData
          };
        }
      } catch (error) {
        console.error('Failed to load detailed batch data:', error);
        this.modalError = `Failed to load data for ${batchNumber}: ${error.message}`;
      } finally {
        this.modalLoading = false;
      }
    },
    
    async openShipmentModal(shipmentNumber) {
      if (!shipmentNumber) {
        console.error('No shipment number provided to openShipmentModal');
        return;
      }
      
      console.log('Opening modal for shipment:', shipmentNumber);
      
      this.activeCardModal = shipmentNumber;
      this.modalCardType = 'shipment';
      this.modalLoading = true;
      this.modalError = null;
      
      try {
        if (!this.modalCardData[shipmentNumber]) {
          const detailedData = await window.CardService.getShipmentCard(shipmentNumber);
          this.modalCardData = {
            ...this.modalCardData,
            [shipmentNumber]: detailedData
          };
        }
      } catch (error) {
        console.error('Failed to load detailed shipment data:', error);
        this.modalError = `Failed to load data for ${shipmentNumber}: ${error.message}`;
      } finally {
        this.modalLoading = false;
      }
    },
    
    closeCardModal() {
      this.activeCardModal = null;
      this.modalCardType = null;
      this.modalLoading = false;
      this.modalError = null;
      // Don't clear cached data - keep it for performance
    },
    
    // PDF viewer methods for modal-within-modal functionality
    openPdfInModal(pdfUrl, pdfTitle) {
      this.currentPdfUrl = pdfUrl;
      this.currentPdfTitle = pdfTitle || 'PDF Document';
      this.pdfViewerActive = true;
    },
    
    closePdfViewer() {
      this.pdfViewerActive = false;
      this.currentPdfUrl = null;
      this.currentPdfTitle = null;
    },
    
    async retryLoadModalData(cardType, identifier) {
      console.log('Retrying modal data load:', cardType, identifier);
      this.modalError = null;
      
      if (cardType === 'graphene') {
        // Clear cached data to force reload
        delete this.modalCardData[identifier];
        await this.openGrapheneModal(identifier);
      } else if (cardType === 'compoundBatch') {
        delete this.modalCardData[identifier];
        await this.openCompoundBatchModal(identifier);
      } else if (cardType === 'shipment') {
        delete this.modalCardData[identifier];
        await this.openShipmentModal(identifier);
      }
    },
    
    getDetailedCardContent(cardType, identifier) {
      if (this.modalLoading) {
        return window.CardFactory.createLoadingCard(identifier);
      }
      
      if (this.modalError) {
        return window.CardFactory.createErrorCard(identifier, this.modalError);
      }
      
      const data = this.modalCardData[identifier];
      if (!data) {
        return window.CardFactory.createErrorCard(identifier, 'No data available');
      }
      
      return window.CardFactory.createCard(data, {
        preset: 'fullwidth',
        context: 'modal'
      });
    },
    
    getCurrentModalHtml() {
      if (!this.activeCardModal || !this.modalCardType) {
        return '';
      }
      
      return createCardModal(this.modalCardType, this.activeCardModal, {
        context: 'modal'
      });
    },
    
    // Dashboard widget generators
    getProductionWidget() {
      if (this.dashboardLoading.production) {
        return createLoadingSkeleton();
      }
      if (!this.dashboardData.production) {
        return createErrorWidget('Failed to load production metrics');
      }
      return createProductionWidget(this.dashboardData.production);
    },
    
    getInventoryWidget() {
      if (this.dashboardLoading.inventory) {
        return createLoadingSkeleton();
      }
      if (!this.dashboardData.inventory) {
        return createErrorWidget('Failed to load inventory data');
      }
      return createInventoryWidget(this.dashboardData.inventory);
    },
    
    getTestResultsWidget() {
      if (this.dashboardLoading.testResults) {
        return createLoadingSkeleton();
      }
      if (!this.dashboardData.testResults) {
        return createErrorWidget('Failed to load test results');
      }
      return createTestResultsWidget(this.dashboardData.testResults);
    },
    
    getActivityWidget() {
      if (this.dashboardLoading.activity) {
        return createLoadingSkeleton();
      }
      if (!this.dashboardData.activity) {
        return createErrorWidget('Failed to load recent activity');
      }
      return createActivityWidget(this.dashboardData.activity);
    },
    
    // Data Card functions
    async getGrapheneDataCard(experimentNumber = 'MRa389A', preset = 'tableView') {
      // Fetch real graphene data from the database
      try {
        // First get the graphene record with related data
        const response = await fetch(`/api/graphene/${experimentNumber}/related`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${experimentNumber} data: ${response.status}`);
        }
        
        const relatedData = await response.json();
        
        // Now get the main graphene record
        const grapheneResponse = await fetch(`/api/graphene?search=${experimentNumber}&limit=1`);
        if (!grapheneResponse.ok) {
          throw new Error(`Failed to fetch ${experimentNumber} record: ${grapheneResponse.status}`);
        }
        
        const grapheneResult = await grapheneResponse.json();
        const grapheneRecord = grapheneResult.data && grapheneResult.data.length > 0 ? grapheneResult.data[0] : null;
        
        if (!grapheneRecord) {
          throw new Error(`${experimentNumber} record not found in database`);
        }
        
        // Combine the main record with related data
        const grapheneData = {
          ...grapheneRecord,
          ...relatedData
        };
        
        return createMasterDataCard({
          preset: preset,
          data: grapheneData,
          instanceId: `graphene_${experimentNumber}_${preset}`
        });
        
      } catch (error) {
        console.error(`Failed to load ${experimentNumber} data:`, error);
        return `<div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800">Error loading ${experimentNumber} data: ${error.message}</p>
          <p class="text-sm text-red-600 mt-1">Make sure the server is running and ${experimentNumber} exists in the database.</p>
        </div>`;
      }
    },
    
    async getCompoundBatchCard(batchNumber = null, preset = 'compoundBatch') {
      // Fetch real compound batch data from your system
      try {
        // Get all compound batches
        const compoundBatches = await API.compoundBatch.getAll();
        if (compoundBatches.length === 0) {
          return `<div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p class="text-orange-800">No compound batches found. Please create a compound batch first.</p>
          </div>`;
        }
        
        // Find the requested batch or use the first available
        let targetBatch;
        if (batchNumber) {
          targetBatch = compoundBatches.find(batch => batch.batchNumber === batchNumber);
          if (!targetBatch) {
            return `<div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p class="text-orange-800">Compound batch ${batchNumber} not found.</p>
            </div>`;
          }
        } else {
          targetBatch = compoundBatches[0];
        }
        
        const relatedData = await API.compoundBatch.getRelated(targetBatch.id);
        
        // Fetch micronization data for this compound batch
        const micronizations = await API.micronization.getByCompoundBatch(targetBatch.batchNumber);
        
        // Combine all real data
        const compoundBatchData = {
          ...targetBatch,
          ...relatedData,
          micronizations: micronizations || [],
          isCompoundBatch: true
        };
        
        return createMasterDataCard({
          preset: preset,
          data: compoundBatchData,
          instanceId: `compound_batch_${targetBatch.batchNumber}_${preset}`
        });
        
      } catch (error) {
        console.error('Failed to load compound batch data:', error);
        return `<div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800">Error loading compound batch data: ${error.message}</p>
          <p class="text-sm text-red-600 mt-1">Make sure the server is running and compound batches exist in the database.</p>
        </div>`;
      }
    },
    
    // Loader functions for async card data
    async loadInlineCard(experimentNumber = 'MRa389A') {
      if (!this.inlineCardHtml) {
        this.inlineCardHtml = await this.getGrapheneDataCard(experimentNumber, 'inline');
      }
      return this.inlineCardHtml;
    },
    
    async loadFullwidthCard(experimentNumber = 'MRa389A') {
      if (!this.fullwidthCardHtml) {
        this.fullwidthCardHtml = await this.getGrapheneDataCard(experimentNumber, 'fullwidth');
      }
      return this.fullwidthCardHtml;
    },
    
    async loadCompoundBatchCard(batchNumber = null) {
      if (!this.compoundBatchCardHtml) {
        this.compoundBatchCardHtml = await this.getCompoundBatchCard(batchNumber);
      }
      return this.compoundBatchCardHtml;
    },
    
    async getPopupCard(experimentNumber) {
      // Fetch real data for popup display
      if (!experimentNumber) {
        return `<div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p class="text-gray-600">No experiment selected for preview.</p>
        </div>`;
      }
      
      try {
        // Determine type based on experiment number prefix
        let data;
        if (experimentNumber.startsWith('MRa')) {
          // Graphene experiment
          const response = await fetch(`/api/graphene/${experimentNumber}/related`);
          const relatedData = await response.json();
          const mainResponse = await fetch(`/api/graphene?search=${experimentNumber}&limit=1`);
          const mainResult = await mainResponse.json();
          const mainRecord = mainResult.data?.[0];
          
          if (!mainRecord) {
            throw new Error(`Experiment ${experimentNumber} not found`);
          }
          
          data = { ...mainRecord, ...relatedData };
        } else if (experimentNumber.startsWith('MB') || experimentNumber.startsWith('BC')) {
          // Biochar experiment
          const response = await fetch(`/api/biochar/${experimentNumber}/related`);
          data = await response.json();
        } else if (experimentNumber.startsWith('CB')) {
          // Compound batch
          const batches = await API.compoundBatch.getAll();
          const batch = batches.find(b => b.batchNumber === experimentNumber);
          if (!batch) {
            throw new Error(`Compound batch ${experimentNumber} not found`);
          }
          const relatedData = await API.compoundBatch.getRelated(batch.id);
          data = { ...batch, ...relatedData, isCompoundBatch: true };
        } else {
          throw new Error(`Unknown experiment type for ${experimentNumber}`);
        }
        
        return createMasterDataCard({
          preset: 'detailPopup',
          data: data,
          instanceId: `popup_${experimentNumber}`,
          editMode: false
        });
        
      } catch (error) {
        console.error(`Failed to load ${experimentNumber} for popup:`, error);
        return `<div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800">Error loading ${experimentNumber}: ${error.message}</p>
        </div>`;
      }
    },
    
    getCardToggleButton() {
      return createCardToggleButton();
    },
    
    // Tab component generators
    getDashboardTabHtml() {
      return getDashboardTabHtml();
    },
    
    getShipmentsTabHtml() {
      return getShipmentsTabHtml();
    },
    
    getMicronizationTabHtml() {
      return getMicronizationTabHtml();
    },
    
    getCompoundBatchesTabHtml() {
      return getCompoundBatchesTabHtml();
    },
    
    getBiocharTabHtml() {
      return getBiocharTabHtml();
    },
    
    getGrapheneTabHtml() {
      return getGrapheneTabHtml();
    },
    
    getAnalysisTabHtml() {
      return getAnalysisTabHtml();
    },
    
    getBiocharModalHtml() {
      return getBiocharModalHtml();
    },
    
    getCompoundBatchModalHtml() {
      return getCompoundBatchModalHtml();
    },
    
    getMicronizationModalHtml() {
      return getMicronizationModalHtml();
    },
    
    getRAMANModalHtml() {
      return getRAMANModalHtml();
    },
    
    // Refresh dashboard data
    async refreshDashboard() {
      this.dashboardError = null;
      await this.loadDashboardData();
    },
    
    // Load analysis data
    async loadAnalysisData() {
      this.analysisLoading = true;
      this.analysisError = null;
      
      try {
        const response = await fetch('/api/analysis/competitive-metrics');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        this.analysisData = result.data;
      } catch (error) {
        console.error('Failed to load analysis data:', error);
        this.analysisError = 'Failed to load competitive analysis data. Please try again.';
      } finally {
        this.analysisLoading = false;
      }
    },
    
    // Refresh analysis data
    async refreshAnalysis() {
      this.analysisError = null;
      await this.loadAnalysisData();
    },
    
    // Load chart data
    async loadAnalysisChartData() {
      try {
        const response = await fetch('/api/analysis/chart-data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        this.analysisChartData = result.data;
        
        // Initialize charts after data is loaded
        await this.$nextTick();
        this.initializeAnalysisCharts();
      } catch (error) {
        console.error('Failed to load chart data:', error);
      }
    },
    
    // Initialize all analysis charts
    initializeAnalysisCharts() {
      if (!this.analysisChartData) return;
      
      this.initializeBETChart();
      this.initializeConductivityChart();
      this.initializeRAMANChart();
    },
    
    // Initialize BET Surface Area Chart
    initializeBETChart() {
      const ctx = document.getElementById('betChart');
      if (!ctx || !this.analysisChartData?.bet) return;
      
      // Destroy existing chart if it exists
      if (this.betChart) {
        this.betChart.destroy();
      }
      
      const data = this.analysisChartData.bet;
      
      this.betChart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [
            ...data.datasets,
            // Add benchmark zones as background datasets
            {
              label: 'Activated Carbon Range',
              data: [
                {x: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), y: 500},
                {x: new Date(), y: 500},
                {x: new Date(), y: 2000},
                {x: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), y: 2000}
              ],
              backgroundColor: data.benchmarks.activatedCarbon.color,
              borderColor: 'rgba(59, 130, 246, 0.3)',
              fill: true,
              pointRadius: 0,
              showLine: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'BET Surface Area Over Time vs Industry Benchmarks'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const point = context.parsed;
                  const raw = context.raw;
                  if (raw.sampleId) {
                    return `${raw.sampleId} (${raw.sampleType}): ${point.y} m²/g`;
                  }
                  return `${point.y} m²/g`;
                }
              }
            }
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'month'
              },
              title: {
                display: true,
                text: 'Test Date'
              }
            },
            y: {
              title: {
                display: true,
                text: 'BET Surface Area (m²/g)'
              },
              beginAtZero: false
            }
          }
        }
      });
    },
    
    // Initialize Conductivity Chart
    initializeConductivityChart() {
      const ctx = document.getElementById('conductivityChart');
      if (!ctx || !this.analysisChartData?.conductivity) return;
      
      // Destroy existing chart if it exists
      if (this.conductivityChart) {
        this.conductivityChart.destroy();
      }
      
      const data = this.analysisChartData.conductivity;
      
      this.conductivityChart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [
            ...data.datasets,
            // Add benchmark zones as background datasets
            {
              label: 'Carbon Black Range',
              data: [
                {x: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), y: 0.1},
                {x: new Date(), y: 0.1},
                {x: new Date(), y: 100},
                {x: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), y: 100}
              ],
              backgroundColor: data.benchmarks.carbonBlack.color,
              borderColor: 'rgba(147, 51, 234, 0.3)',
              fill: true,
              pointRadius: 0,
              showLine: false
            },
            {
              label: 'Activated Carbon Range',
              data: [
                {x: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), y: 0.1},
                {x: new Date(), y: 0.1},
                {x: new Date(), y: 10},
                {x: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), y: 10}
              ],
              backgroundColor: data.benchmarks.activatedCarbon.color,
              borderColor: 'rgba(59, 130, 246, 0.3)',
              fill: true,
              pointRadius: 0,
              showLine: false
            },
            {
              label: 'Synthetic Graphite Range',
              data: [
                {x: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), y: 100},
                {x: new Date(), y: 100},
                {x: new Date(), y: 1000},
                {x: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), y: 1000}
              ],
              backgroundColor: data.benchmarks.syntheticGraphite.color,
              borderColor: 'rgba(107, 114, 128, 0.3)',
              fill: true,
              pointRadius: 0,
              showLine: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Electrical Conductivity Over Time (20kN Pressure)'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const point = context.parsed;
                  const raw = context.raw;
                  if (raw.sampleId) {
                    const lines = [
                      `${raw.sampleId} (${raw.sampleType})`,
                      `20kN: ${raw.conductivity20kN} S/cm`
                    ];
                    
                    // Add other pressure levels if available
                    if (raw.conductivity12kN) lines.push(`12kN: ${raw.conductivity12kN} S/cm`);
                    if (raw.conductivity8kN) lines.push(`8kN: ${raw.conductivity8kN} S/cm`);
                    if (raw.conductivity1kN) lines.push(`1kN: ${raw.conductivity1kN} S/cm`);
                    
                    // Add benchmark comparison
                    const value = raw.conductivity20kN;
                    if (value >= 100) {
                      lines.push('⚡ Excellent - Synthetic Graphite range');
                    } else if (value >= 10) {
                      lines.push('🟢 Good - Above Activated Carbon');
                    } else if (value >= 0.1) {
                      lines.push('🟡 Competitive - Industry range');
                    } else {
                      lines.push('🔴 Below industry standards');
                    }
                    
                    return lines;
                  }
                  return `${point.y} S/cm`;
                },
                title: function(context) {
                  const raw = context[0].raw;
                  if (raw.sampleId) {
                    return `Sample: ${raw.sampleId}`;
                  }
                  return 'Conductivity Measurement';
                }
              }
            }
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'month'
              },
              title: {
                display: true,
                text: 'Test Date'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Electrical Conductivity (S/cm)'
              },
              beginAtZero: false,
              min: 0.01,
              max: 1000,
              type: 'logarithmic'
            }
          }
        }
      });
    },
    
    // Initialize RAMAN Chart
    initializeRAMANChart() {
      const ctx = document.getElementById('ramanChart');
      if (!ctx || !this.analysisChartData?.raman) return;
      
      // Destroy existing chart if it exists
      if (this.ramanChart) {
        this.ramanChart.destroy();
      }
      
      const data = this.analysisChartData.raman;
      
      this.ramanChart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: data.datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'RAMAN D/G Ratio Over Time (Lower is Better)'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const point = context.parsed;
                  const raw = context.raw;
                  if (raw.sampleId) {
                    return `${raw.sampleId} (${raw.sampleType}): ${point.y.toFixed(3)} D/G`;
                  }
                  return `${point.y.toFixed(3)} D/G`;
                }
              }
            }
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'month'
              },
              title: {
                display: true,
                text: 'Test Date'
              }
            },
            y: {
              title: {
                display: true,
                text: 'RAMAN D/G Ratio'
              },
              beginAtZero: true
            }
          }
        }
      });
    },
    
    // AI Insights Methods
    
    // Load AI insights dashboard data
    async loadAIInsightsDashboard() {
      this.aiInsightsLoading = true;
      this.aiInsightsError = null;
      
      try {
        const response = await fetch('/api/ai-insights/dashboard');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        this.aiInsightsData = result;
      } catch (error) {
        console.error('Failed to load AI insights dashboard:', error);
        this.aiInsightsError = error.message;
      } finally {
        this.aiInsightsLoading = false;
      }
    },
    
    // Refresh all AI insights
    async refreshAIInsights() {
      this.aiInsightsError = null;
      await this.loadAIInsightsDashboard();
    },
    
    // Load correlation analysis
    async loadCorrelationAnalysis() {
      this.correlationLoading = true;
      
      try {
        const response = await fetch('/api/ai-insights/correlations');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        this.correlationData = result;
      } catch (error) {
        console.error('Failed to load correlation analysis:', error);
        this.aiInsightsError = error.message;
      } finally {
        this.correlationLoading = false;
      }
    },
    
    // Load optimization analysis
    async loadOptimizationAnalysis() {
      this.optimizationLoading = true;
      
      try {
        const response = await fetch('/api/ai-insights/optimization');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        this.optimizationData = result;
      } catch (error) {
        console.error('Failed to load optimization analysis:', error);
        this.aiInsightsError = error.message;
      } finally {
        this.optimizationLoading = false;
      }
    },
    
    // Load scaling analysis  
    async loadScalingAnalysis() {
      this.scalingLoading = true;
      
      try {
        const response = await fetch('/api/ai-insights/scaling?targetOvenSize=50L&targetProductionRate=10');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        this.scalingData = result;
      } catch (error) {
        console.error('Failed to load scaling analysis:', error);
        this.aiInsightsError = error.message;
      } finally {
        this.scalingLoading = false;
      }
    },
    
    // Load experiment suggestions
    async loadExperimentSuggestions() {
      this.suggestionsLoading = true;
      
      try {
        const response = await fetch('/api/ai-insights/experiments?priorities=yield,quality,scaling');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        this.suggestionsData = result;
      } catch (error) {
        console.error('Failed to load experiment suggestions:', error);
        this.aiInsightsError = error.message;
      } finally {
        this.suggestionsLoading = false;
      }
    },
    
    // Perform custom analysis
    async performCustomAnalysis() {
      if (!this.customQuery.trim()) return;
      
      this.customAnalysisLoading = true;
      this.customAnalysisResult = null;
      
      try {
        const response = await fetch('/api/ai-insights/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            question: this.customQuery,
            context: this.customAnalysisContext
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        this.customAnalysisResult = result.analysis;
      } catch (error) {
        console.error('Failed to perform custom analysis:', error);
        this.customAnalysisResult = 'Error: ' + error.message;
      } finally {
        this.customAnalysisLoading = false;
      }
    },
    
    // Markdown Utility Function
    
    // Safely render markdown to HTML
    renderMarkdown(text) {
      if (!text || typeof text !== 'string') return '';
      
      try {
        // Configure marked for safe rendering
        const html = marked.parse(text, {
          breaks: true,
          gfm: true,
          sanitize: false // We control the input source (our AI responses)
        });
        return html;
      } catch (error) {
        console.error('Markdown rendering error:', error);
        return text; // Fallback to plain text
      }
    },
    
    // AI Analysis Filter Methods
    
    // Check if any filters are active
    hasActiveFilters() {
      return this.analysisFilters.oven || 
             this.analysisFilters.species || 
             this.analysisFilters.timeRange ||
             this.analysisFilters.includeCompoundBatches ||
             this.analysisFilters.includeMicronization;
    },
    
    // Apply analysis filters and refresh data
    async applyFilters() {
      this.filtersLoading = true;
      
      try {
        // Clear existing analysis data to force refresh with filters
        this.correlationData = null;
        this.optimizationData = null;
        this.scalingData = null;
        this.suggestionsData = null;
        
        // Reload AI insights with filters
        await this.loadAIInsightsDashboard();
        
      } catch (error) {
        console.error('Failed to apply filters:', error);
        this.aiInsightsError = 'Failed to apply filters: ' + error.message;
      } finally {
        this.filtersLoading = false;
      }
    },
    
    // Reset all filters to default values
    resetFilters() {
      this.analysisFilters = {
        oven: '',
        species: '',
        timeRange: '',
        includeCompoundBatches: true,
        includeMicronization: true
      };
      
      // Auto-apply reset filters
      this.applyFilters();
    },
    
    // Handle tab change to load data if needed
    async switchTab(tab) {
      this.activeTab = tab;
      if (tab === 'dashboard' && !this.dashboardData.production) {
        await this.loadDashboardData();
      } else if (tab === 'analysis') {
        if (!this.analysisData) {
          await this.loadAnalysisData();
        }
        if (!this.analysisChartData) {
          await this.loadAnalysisChartData();
        }
      } else if (tab === 'ai-insights') {
        if (!this.aiInsightsData) {
          await this.loadAIInsightsDashboard();
        }
      } else if (tab === 'news') {
        await this.initializeNewsTab();
      }
    },

    // News system methods - delegated to NewsService
    async fetchNewsArticles() {
      await NewsService.fetchNewsArticles(this);
      // Sync state from service
      const state = NewsService.getNewsState();
      Object.assign(this, state);
    },

    async refreshNewsFeed() {
      await NewsService.refreshNewsFeed(this);
    },

    filterNews() {
      NewsService.filterNews(this);
      const state = NewsService.getNewsState();
      Object.assign(this, state);
    },

    applyClientSideFilters() {
      NewsService.applyClientSideFilters();
      const state = NewsService.getNewsState();
      this.filteredNewsArticles = state.filteredNewsArticles;
      this.paginatedNewsArticles = state.paginatedNewsArticles;
    },

    updatePagination() {
      NewsService.updatePagination();
      const state = NewsService.getNewsState();
      this.paginatedNewsArticles = state.paginatedNewsArticles;
      this.newsTotalPages = state.newsTotalPages;
      this.newsHasMorePages = state.newsHasMorePages;
    },

    nextNewsPage() {
      NewsService.nextNewsPage();
      this.updatePagination();
    },

    previousNewsPage() {
      NewsService.previousNewsPage();
      this.updatePagination();
    },

    goToNewsPage(page) {
      NewsService.goToNewsPage(page);
      this.updatePagination();
    },

    loadMoreNews() {
      NewsService.loadMoreNews();
      this.updatePagination();
    },

    getNewsPageNumbers() {
      return NewsService.getNewsPageNumbers();
    },

    nextNewsPage() {
      if (this.newsCurrentPage < this.newsTotalPages) {
        this.newsCurrentPage++;
        this.updatePagination();
      }
    },

    previousNewsPage() {
      if (this.newsCurrentPage > 1) {
        this.newsCurrentPage--;
        this.updatePagination();
      }
    },

    goToNewsPage(page) {
      if (page >= 1 && page <= this.newsTotalPages) {
        this.newsCurrentPage = page;
        this.updatePagination();
      }
    },

    loadMoreNews() {
      if (this.newsHasMorePages && !this.newsLoading) {
        this.nextNewsPage();
      }
    },

    async refreshNewsFeed() {
      console.log('🔄 Refreshing news feed...');
      this.newsLoading = true;
      
      try {
        // First, trigger content acquisition from external sources
        console.log('📡 Fetching new articles from external sources...');
        const refreshResponse = await fetch('/api/news/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const refreshData = await refreshResponse.json();
        
        if (refreshData.success) {
          console.log(`✅ Content refresh completed: ${refreshData.data.newArticles} new articles found`);
          
          // Then fetch the updated articles from database
          await this.fetchNewsArticles();
          
          console.log(`📄 News feed updated successfully`);
        } else {
          console.error('❌ Content refresh failed:', refreshData.error);
          // Still try to refresh from database in case of external source errors
          await this.fetchNewsArticles();
        }
        
      } catch (error) {
        console.error('❌ Error during news refresh:', error);
        // Fallback to just refreshing from database
        await this.fetchNewsArticles();
      } finally {
        this.newsLoading = false;
      }
    },

    getDateRange() {
      return NewsService.getDateRange();
    },

    updateDateFilters() {
      // Called when date range filter changes - handled by filterNews
      this.filterNews();
    },

    formatCategory(category) {
      return NewsService.formatCategory(category);
    },

    getCategoryColor(category) {
      return NewsService.getCategoryColor(category);
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    hasActiveFilters() {
      return NewsService.hasActiveFilters();
    },

    getActiveFilters() {
      return NewsService.getActiveFilters();
    },

    removeFilter(filterKey) {
      NewsService.removeFilter(filterKey);
      this.filterNews();
    },

    clearAllFilters() {
      NewsService.clearAllFilters();
      this.filterNews();
    },

    async trackArticleView(articleId) {
      await NewsService.trackArticleView(articleId);
    },

    shareArticle(article) {
      NewsService.shareArticle(article, this);
    },

    // High-impact keyword methods
    toggleHighImpactKeyword(keyword) {
      NewsService.toggleHighImpactKeyword(keyword);
      this.filterNews();
    },

    clearHighImpactKeywords() {
      NewsService.clearHighImpactKeywords();
      this.filterNews();
    },

    hasHighImpactKeyword(article) {
      return NewsService.hasHighImpactKeyword(article);
    },

    isHighImpactKeyword(tag) {
      return NewsService.isHighImpactKeyword(tag);
    },

    // Count functions for badges
    getCategoryCount(category) {
      if (!this.newsArticles) return 0;
      if (!category) {
        return this.newsArticles.length;
      }
      return this.newsArticles.filter(article => article.category === category).length;
    },

    getTagCount(tag) {
      if (!this.newsArticles) return 0;
      return this.newsArticles.filter(article => 
        article.keywordTags?.some(articleTag => 
          articleTag.toLowerCase().includes(tag.toLowerCase())
        )
      ).length;
    },

    getDateRangeCount(dateRange) {
      if (!this.newsArticles) return 0;
      if (!dateRange) {
        return this.newsArticles.length;
      }

      const now = new Date();
      let startDate;

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
          break;
        default:
          return this.newsArticles.length;
      }

      return this.newsArticles.filter(article => {
        const publishDate = new Date(article.publishDate);
        return publishDate >= startDate;
      }).length;
    },

    // Bookmark functionality
    async toggleBookmark(articleId) {
      // Set loading state
      this.bookmarkLoading[articleId] = true;
      
      try {
        const response = await fetch(`/api/news/articles/${articleId}/bookmark`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to toggle bookmark');
        }

        const data = await response.json();
        
        if (data.success) {
          // Update the article in our local state
          const article = this.newsArticles.find(a => a.id === articleId);
          if (article) {
            article.isBookmarked = data.isBookmarked;
          }
          
          // Update filtered and paginated arrays
          const filteredArticle = this.filteredNewsArticles.find(a => a.id === articleId);
          if (filteredArticle) {
            filteredArticle.isBookmarked = data.isBookmarked;
          }
          
          const paginatedArticle = this.paginatedNewsArticles.find(a => a.id === articleId);
          if (paginatedArticle) {
            paginatedArticle.isBookmarked = data.isBookmarked;
          }

          this.showNotification(
            data.isBookmarked ? 'Article bookmarked' : 'Bookmark removed',
            'success'
          );
        }

      } catch (error) {
        console.error('Error toggling bookmark:', error);
        this.showNotification('Error updating bookmark', 'error');
      } finally {
        // Clear loading state
        this.bookmarkLoading[articleId] = false;
      }
    },

    shareArticle(article) {
      if (navigator.share) {
        navigator.share({
          title: article.title,
          text: article.summary,
          url: article.url
        });
      } else {
        // Fallback to copying URL to clipboard
        navigator.clipboard.writeText(article.url).then(() => {
          this.showNotification('Article URL copied to clipboard', 'success');
        }).catch(err => {
          console.error('Error copying to clipboard:', err);
          this.showNotification('Could not copy URL', 'error');
        });
      }
    },

    // Summary system methods - these remain here as they use imported helpers
    toggleSummaryDisplay(articleId) {
      this.showSummary[articleId] = !this.showSummary[articleId];
    },

    shouldShowSummaryToggle(article) {
      return shouldShowSummaryToggle(article);
    },

    getSummaryToggleHtml(article) {
      return getSummaryToggleHtml(article);
    },

    formatSummaryWithSections(summaryText) {
      return formatSummaryWithSections(summaryText);
    },

    getSimplifiedTitle(title) {
      return getSimplifiedTitle(title);
    },

    async generateSummary(articleId) {
      await NewsService.generateSummary(articleId, this);
    },

    async regenerateSummary(articleId) {
      await NewsService.regenerateSummary(articleId, this);
    },

    async retryGenerateSummary(articleId) {
      await NewsService.retryGenerateSummary(articleId, this);
    },

    async initializeNewsTab() {
      await NewsService.initializeNewsTab(this);
    },

    async fetchHeadlines() {
      await NewsService.fetchHeadlines(this);
    },

    async refreshHeadlines() {
      await NewsService.refreshHeadlines(this);
    },

    openNewsArticle(article) {
      NewsService.openNewsArticle(article);
    },

    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
  };
};

console.log('grapheneApp defined on window:', typeof window.grapheneApp);

// Expose PDF modal functions globally for card modal system
window.addEventListener('alpine:init', () => {
  // Wait for Alpine to initialize the app, then expose PDF functions
  setTimeout(() => {
    const appElement = document.querySelector('[x-data*="grapheneApp"]');
    if (appElement && appElement._x_dataStack && appElement._x_dataStack[0]) {
      const appData = appElement._x_dataStack[0];
      window.openPdfInModal = function(url, title) {
        console.log('🔗 PDF Modal - Processing URL:', url);
        
        // Handle both Cloudinary URLs and local paths  
        let finalUrl = url;
        
        // If it's already a full URL (Cloudinary or other CDN), use as-is
        if (url.startsWith('https://') || url.startsWith('http://')) {
          finalUrl = url;
          console.log('✅ Using full URL as-is:', finalUrl);
        } 
        // If it's a relative path, make it local uploads path
        else {
          // Clean up the path and make it absolute for local development
          const cleanPath = url.replace(/^\/+/, ''); // Remove leading slashes
          finalUrl = '/uploads/' + cleanPath;
          
          // Add viewer params only for local PDFs
          if (!finalUrl.includes('#')) {
            finalUrl += '#navpanes=0&toolbar=0';
          }
          console.log('📁 Using local uploads path:', finalUrl);
        }
        
        console.log('🎯 Final PDF URL:', finalUrl);
        appData.openPdfInModal(finalUrl, title);
      };
      window.closePdfViewer = appData.closePdfViewer.bind(appData);
      console.log('PDF modal functions exposed globally');
      
      // Expose timezone-safe date formatting function globally
      window.formatDateSafe = function(dateString) {
        if (!dateString) return 'Unknown';
        
        try {
          // Use the same timezone-safe logic as the date picker
          const parts = dateString.split('-');
          if (parts.length === 3) {
            const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            
            // Check for invalid dates (epoch dates like 1969-1970)
            if (date.getFullYear() <= 1970) {
              return 'Unknown';
            }
            
            return date.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            });
          }
          
          // Fallback for other date formats
          const date = new Date(dateString);
          if (isNaN(date.getTime()) || date.getFullYear() <= 1970) {
            return 'Unknown';
          }
          
          return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
        } catch (error) {
          return 'Unknown';
        }
      };
      
      console.log('Global date formatting function exposed');
    }
  }, 100);
});
