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
import { getAnalysisTabHtml } from './components/tabs/AnalysisTab.js';
import { getBiocharModalHtml } from './components/modals/BiocharModal.js';
import { getCompoundBatchModalHtml } from './components/modals/CompoundBatchModal.js';
import { getMicronizationModalHtml } from './components/modals/MicronizationModal.js';
import { getRAMANModalHtml } from './components/modals/RAMANModal.js';

// Import new components for simplified cards and modals
import './components/cards/SimplifiedGrapheneCard.js';
import './components/modals/CardModalSystem.js';
import { getSummaryToggleHtml, shouldShowSummaryToggle, formatSummaryWithSections, getSimplifiedTitle } from './components/SummaryToggle.js';

// Default form values
const DEFAULT_FORMS = {
  biochar: {
    experimentNumber: '',
    testOrder: '',
    experimentDate: '',
    dateUnknown: false,
    researchTeam: 'Curia - Germany',
    reactor: '',
    rawMaterial: '',
    startingAmount: '',
    acidAmount: '',
    acidConcentration: '',
    acidMolarity: '',
    acidType: '',
    temperature: '',
    time: '',
    pressureInitial: '',
    pressureFinal: '',
    washAmount: '',
    washMedium: '',
    output: '',
    dryingTemp: '',
    kftPercentage: '',
    comments: ''
  },
  graphene: {
    experimentNumber: '',
    titleNote: '',
    testOrder: '',
    experimentDate: '',
    dateUnknown: false,
    researchTeam: 'Curia - Germany',
    oven: '',
    quantity: '',
    biocharExperiment: '',
    biocharLotNumber: '',
    biocharSource: '',
    baseAmount: '',
    baseType: '',
    baseConcentration: '',
    base2Amount: '',
    base2Type: '',
    base2Concentration: '',
    grindingMethod: '',
    grindingCount: '',
    grindingTime: '',
    grindingFrequency: '',
    homogeneous: '',
    gas: '',
    tempRate: '',
    tempMax: '',
    time: '',
    washAmount: '',
    washSolution: '',
    washConcentration: '',
    washWater: '',
    dryingTemp: '',
    dryingAtmosphere: '',
    dryingPressure: 'atm. Pressure',
    volumeMl: '',
    species: '',
    appearanceTags: [],
    semReportFile: null,
    removeSemReport: false,
    replaceSemReport: false,
    objective: '',
    experimentDetails: '',
    result: '',
    conclusion: '',
    recommendedAction: '',
    objectivePaste: '', // For the paste textarea
    updateReportIds: [],
    output: '',
    comments: ''
  },
  bet: {
    testDate: '',
    dateUnknown: false,
    materialType: 'graphene',
    grapheneSample: '',
    compoundBatchNumber: '',
    mass: '',
    researchTeam: 'Curia - Germany',
    testingLab: 'Fraunhofer-Institut',
    multipointBetArea: '',
    langmuirSurfaceArea: '',
    betReportFile: null,
    removeBetReport: false,
    replaceBetReport: false,
    comments: ''
  },
  conductivity: {
    testDate: '',
    dateUnknown: false,
    materialType: 'graphene',
    grapheneSample: '',
    compoundBatchNumber: '',
    name: '',
    description: '',
    conductivity1kN: '',
    conductivity8kN: '',
    conductivity12kN: '',
    conductivity20kN: '',
    comments: '',
    conductivityReportPath: '',
    conductivityReportFile: null,
    removeConductivityReport: false
  },
  raman: {
    testDate: '',
    dateUnknown: false,
    materialType: 'graphene',
    grapheneSample: '',
    compoundBatchNumber: '',
    researchTeam: 'Curia - Germany',
    testingLab: '',
    // Integration range row (low and high for each)
    integrationRange2DLow: '',
    integrationRange2DHigh: '',
    integrationRangeGLow: '',
    integrationRangeGHigh: '',
    integrationRangeDLow: '',
    integrationRangeDHigh: '',
    integrationRangeDGLow: '',
    integrationRangeDGHigh: '',
    // Integral Typ A row (two values for each)
    integralTypA2D1: '',
    integralTypA2D2: '',
    integralTypAG1: '',
    integralTypAG2: '',
    integralTypAD1: '',
    integralTypAD2: '',
    integralTypADG1: '',
    integralTypADG2: '',
    // Peak high Typ J row (two values for each)
    peakHighTypJ2D1: '',
    peakHighTypJ2D2: '',
    peakHighTypJG1: '',
    peakHighTypJG2: '',
    peakHighTypJD1: '',
    peakHighTypJD2: '',
    peakHighTypJDG1: '',
    peakHighTypJDG2: '',
    ramanReportFile: null,
    removeRamanReport: false,
    replaceRamanReport: false,
    comments: ''
  },
  tem: {
    testDate: '',
    dateUnknown: false,
    materialType: 'graphene',
    grapheneSample: '',
    compoundBatchNumber: '',
    researchTeam: 'Curia - Germany',
    testingLab: '',
    temReportFile: null,
    removeTEMReport: false,
    replaceTEMReport: false,
    comments: ''
  },
  combine: {
    lotNumber: '',
    lotName: '',
    description: ''
  },
  updateReport: {
    description: '',
    weekOf: '',
    grapheneIds: [],
    compoundBatchIds: [],
    updateFile: null
  },
  semReport: {
    reportDate: '',
    grapheneIds: [],
    compoundBatchIds: [],
    semFiles: null
  },
  compoundBatch: {
    batchNumber: '',
    batchName: '',
    createdDate: '',
    dateUnknown: false,
    totalOutput: '',
    description: '',
    experimentIds: []
  },
  shipment: {
    shipmentNumber: '',
    shipFromLocation: 'Curia Frankfurt',
    shipToLocation: '',
    shipmentDate: '',
    dateUnknown: false,
    receivedDate: '',
    receivedDateUnknown: false,
    materialType: 'graphene',
    grapheneSample: '',
    compoundBatchNumber: '',
    micronizationSku: '',
    amountShipped: '',
    unit: 'g',
    purpose: '',
    status: 'shipped',
    comments: ''
  },
  micronization: {
    micronizationNumber: '',
    date: '',
    dateUnknown: false,
    skuSuffix: '',  // Changed from sku to skuSuffix
    materialType: 'graphene',
    grapheneSample: '',
    compoundBatchNumber: '',
    startingMaterialAmount: '',
    recoveredAmount: '',
    grindPressure: '',
    dx50: '',
    micronizationReportFile: null,
    removeMicronizationReport: false,
    replaceMicronizationReport: false
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
    
    // News system state
    newsArticles: [],
    filteredNewsArticles: [],
    paginatedNewsArticles: [],
    newsLoading: false,
    newsError: null,
    showNewsFilters: false,
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
    
    // Biochar CRUD operations
    editBiochar(record) {
      this.editingBiochar = record;
      const editableFields = dataHelpers.extractEditableFields(record, ['grapheneProductions', 'lot', 'lotNumber']);
      this.biocharForm = { ...editableFields };
      this.showAddBiochar = true;
    },
    
    copyBiochar(record) {
      this.editingBiochar = null;
      const editableFields = dataHelpers.extractEditableFields(record, ['grapheneProductions', 'lot', 'lotNumber', 'experimentNumber']);
      this.biocharForm = { 
        ...editableFields,
        experimentNumber: '',
        testOrder: record.testOrder ? record.testOrder + 1 : null
      };
      this.showAddBiochar = true;
    },
    
    async saveBiochar() {
      try {
        const data = validators.processBiocharForm(this.biocharForm);
        
        if (this.editingBiochar) {
          await API.biochar.update(this.editingBiochar.id, data);
        } else {
          await API.biochar.create(data);
        }
        
        await this.loadBiocharRecords();
        this.closeBiocharForm();
      } catch (error) {
        console.error('Failed to save biochar record:', error);
        alert(`Failed to save record: ${error.message}`);
      }
    },
    
    async deleteBiochar(id) {
      if (!confirm('Are you sure you want to delete this record?')) return;
      
      try {
        await API.biochar.delete(id);
        await this.loadBiocharRecords();
      } catch (error) {
        console.error('Failed to delete biochar record:', error);
        alert(`Failed to delete record: ${error.message}`);
      }
    },
    
    closeBiocharForm() {
      this.showAddBiochar = false;
      this.editingBiochar = null;
      this.biocharForm = { ...DEFAULT_FORMS.biochar };
    },
    
    // Graphene CRUD operations
    editGraphene(record) {
      this.editingGraphene = record;
      const editableFields = dataHelpers.extractEditableFields(record, ['biocharLot', 'biocharExperimentRef', 'biocharLotRef', 'betTests', 'updateReports']);
      this.grapheneForm = { ...editableFields };
      
      // Ensure appearanceTags is always an array
      if (!this.grapheneForm.appearanceTags || !Array.isArray(this.grapheneForm.appearanceTags)) {
        this.grapheneForm.appearanceTags = [];
      }
      
      // Set biocharSource based on what's populated
      if (record.biocharExperiment) {
        this.grapheneForm.biocharSource = 'exp:' + record.biocharExperiment;
      } else if (record.biocharLotNumber) {
        this.grapheneForm.biocharSource = 'lot:' + record.biocharLotNumber;
      } else {
        this.grapheneForm.biocharSource = '';  // Could be 'various' or empty
      }
      
      // Initialize SEM-related flags
      this.grapheneForm.removeSemReport = false;
      this.grapheneForm.replaceSemReport = false;
      
      // Initialize update report IDs from existing associations
      this.grapheneForm.updateReportIds = record.updateReports?.map(ur => ur.updateReportId) || [];
      
      this.showAddGraphene = true;
    },
    
    copyGraphene(record) {
      this.editingGraphene = null;
      const editableFields = dataHelpers.extractEditableFields(record, ['biocharLot', 'biocharExperimentRef', 'biocharLotRef', 'betTests', 'updateReports', 'experimentNumber', 'semReportPath']);
      this.grapheneForm = { 
        ...editableFields,
        experimentNumber: '',
        testOrder: record.testOrder ? record.testOrder + 1 : null
      };
      
      // Ensure appearanceTags is always an array
      if (!this.grapheneForm.appearanceTags || !Array.isArray(this.grapheneForm.appearanceTags)) {
        this.grapheneForm.appearanceTags = [];
      }
      
      // Set biocharSource based on what's populated
      if (record.biocharExperiment) {
        this.grapheneForm.biocharSource = 'exp:' + record.biocharExperiment;
      } else if (record.biocharLotNumber) {
        this.grapheneForm.biocharSource = 'lot:' + record.biocharLotNumber;
      } else {
        this.grapheneForm.biocharSource = '';  // Could be 'various' or empty
      }
      
      // Initialize SEM-related flags
      this.grapheneForm.removeSemReport = false;
      this.grapheneForm.replaceSemReport = false;
      
      // Copy update report associations from original record
      this.grapheneForm.updateReportIds = record.updateReports?.map(ur => ur.updateReportId) || [];
      
      this.showAddGraphene = true;
    },
    
    async saveGraphene() {
      try {
        const data = validators.processGrapheneForm(this.grapheneForm);
        const file = this.grapheneForm.semReportFile;
        
        // Add removal flag if user wants to remove SEM report
        if (this.grapheneForm.removeSemReport) {
          data.removeSemReport = true;
        }
        
        if (this.editingGraphene) {
          await API.graphene.update(this.editingGraphene.id, data, file);
        } else {
          await API.graphene.create(data, file);
        }
        
        await this.loadGrapheneRecords();
        await this.loadSemReports(); // Refresh SEM reports if one was uploaded
        this.closeGrapheneForm();
      } catch (error) {
        console.error('Failed to save graphene record:', error);
        alert(`Failed to save record: ${error.message}`);
      }
    },
    
    async deleteGraphene(id) {
      if (!confirm('Are you sure you want to delete this record?')) return;
      
      try {
        await API.graphene.delete(id);
        await this.loadGrapheneRecords();
      } catch (error) {
        console.error('Failed to delete graphene record:', error);
        alert(`Failed to delete record: ${error.message}`);
      }
    },

    async removeSemReportAssociation(semReportId) {
      if (!confirm('Remove the association between this SEM report and the graphene experiment?')) return;
      
      try {
        await API.semReport.removeGrapheneAssociation(semReportId, this.editingGraphene.id);
        
        // Update the editingGraphene record to reflect the change
        this.editingGraphene.semReports = this.editingGraphene.semReports.filter(
          sr => sr.semReport.id !== semReportId
        );
        
        // Also refresh the main graphene list
        await this.loadGrapheneRecords();
        
        alert('SEM report association removed successfully');
      } catch (error) {
        console.error('Failed to remove SEM report association:', error);
        alert(`Failed to remove association: ${error.message}`);
      }
    },
    
    closeGrapheneForm() {
      this.showAddGraphene = false;
      this.editingGraphene = null;
      this.grapheneForm = { ...DEFAULT_FORMS.graphene };
      // Ensure appearanceTags is always an array
      this.grapheneForm.appearanceTags = [];
      // Reset SEM-related flags
      this.grapheneForm.removeSemReport = false;
      this.grapheneForm.replaceSemReport = false;
      // Reset update report IDs
      this.grapheneForm.updateReportIds = [];
    },
    
    // BET CRUD operations
    editBet(record) {
      this.editingBet = record;
      this.betForm = {
        testDate: record.testDate ? record.testDate.split('T')[0] : '',
        dateUnknown: !record.testDate,
        grapheneSample: record.grapheneSample || '',
        mass: record.mass || '',
        researchTeam: record.researchTeam || 'Curia - Germany',
        testingLab: record.testingLab || 'Fraunhofer-Institut',
        multipointBetArea: record.multipointBetArea || '',
        langmuirSurfaceArea: record.langmuirSurfaceArea || '',
        betReportFile: null,
        removeBetReport: false,
        replaceBetReport: false,
        comments: record.comments || ''
      };
      this.showAddBet = true;
    },
    
    async saveBet() {
      try {
        // Extract file before processing
        const file = this.betForm.betReportFile;
        
        // Process form data through validator
        const data = validators.processBetForm(this.betForm);
        
        if (this.editingBet) {
          await API.bet.update(this.editingBet.id, data, file);
        } else {
          await API.bet.create(data, file);
        }
        
        await this.loadBetRecords();
        this.closeBetForm();
      } catch (error) {
        console.error('Failed to save BET record:', error);
        alert(`Failed to save record: ${error.message}`);
      }
    },
    
    async deleteBet(id) {
      if (!confirm('Are you sure you want to delete this record?')) return;
      
      try {
        await API.bet.delete(id);
        await this.loadBetRecords();
      } catch (error) {
        console.error('Failed to delete BET record:', error);
        alert(`Failed to delete record: ${error.message}`);
      }
    },
    
    closeBetForm() {
      this.showAddBet = false;
      this.editingBet = null;
      this.betForm = { ...DEFAULT_FORMS.bet };
    },
    
    // Conductivity CRUD operations
    editConductivity(record) {
      this.editingConductivity = record;
      this.conductivityForm = {
        testDate: record.testDate ? record.testDate.split('T')[0] : '',
        dateUnknown: !record.testDate,
        materialType: record.compoundBatchNumber ? 'compound' : 'graphene',
        grapheneSample: record.grapheneSample || '',
        compoundBatchNumber: record.compoundBatchNumber || '',
        name: record.name || '',
        description: record.description || '',
        conductivity1kN: record.conductivity1kN || '',
        conductivity8kN: record.conductivity8kN || '',
        conductivity12kN: record.conductivity12kN || '',
        conductivity20kN: record.conductivity20kN || '',
        comments: record.comments || '',
        conductivityReportPath: record.conductivityReportPath || '',
        conductivityReportFile: null,
        removeConductivityReport: false
      };
      this.showAddConductivity = true;
    },
    
    async saveConductivity() {
      try {
        // Extract file before processing
        const file = this.conductivityForm.conductivityReportFile;
        
        const data = { ...this.conductivityForm };
        
        if (data.dateUnknown) {
          data.testDate = null;
        }
        delete data.dateUnknown;
        delete data.conductivityReportFile; // Remove file from data object
        delete data.conductivityReportPath; // Don't send the path from frontend
        delete data.replaceConductivityReport; // Remove UI-only field
        
        if (this.editingConductivity) {
          await API.conductivity.update(this.editingConductivity.id, data, file);
        } else {
          await API.conductivity.create(data, file);
        }
        
        await this.loadConductivityRecords();
        this.closeConductivityForm();
      } catch (error) {
        console.error('Failed to save conductivity record:', error);
        alert(`Failed to save record: ${error.message}`);
      }
    },
    
    async deleteConductivity(id) {
      if (!confirm('Are you sure you want to delete this record?')) return;
      
      try {
        await API.conductivity.delete(id);
        await this.loadConductivityRecords();
      } catch (error) {
        console.error('Failed to delete conductivity record:', error);
        alert(`Failed to delete record: ${error.message}`);
      }
    },
    
    closeConductivityForm() {
      this.showAddConductivity = false;
      this.editingConductivity = null;
      this.conductivityForm = { ...DEFAULT_FORMS.conductivity };
    },

    // RAMAN Test management
    editRaman(record) {
      this.editingRaman = record;
      this.ramanForm = {
        testDate: record.testDate ? new Date(record.testDate).toISOString().split('T')[0] : '',
        dateUnknown: !record.testDate,
        grapheneSample: record.grapheneSample || '',
        researchTeam: record.researchTeam || 'Curia - Germany',
        testingLab: record.testingLab || '',
        // Integration range row (low and high for each)
        integrationRange2DLow: record.integrationRange2DLow || '',
        integrationRange2DHigh: record.integrationRange2DHigh || '',
        integrationRangeGLow: record.integrationRangeGLow || '',
        integrationRangeGHigh: record.integrationRangeGHigh || '',
        integrationRangeDLow: record.integrationRangeDLow || '',
        integrationRangeDHigh: record.integrationRangeDHigh || '',
        integrationRangeDGLow: record.integrationRangeDGLow || '',
        integrationRangeDGHigh: record.integrationRangeDGHigh || '',
        // Integral Typ A row (two values for each)
        integralTypA2D1: record.integralTypA2D1 || '',
        integralTypA2D2: record.integralTypA2D2 || '',
        integralTypAG1: record.integralTypAG1 || '',
        integralTypAG2: record.integralTypAG2 || '',
        integralTypAD1: record.integralTypAD1 || '',
        integralTypAD2: record.integralTypAD2 || '',
        integralTypADG1: record.integralTypADG1 || '',
        integralTypADG2: record.integralTypADG2 || '',
        // Peak high Typ J row (two values for each)
        peakHighTypJ2D1: record.peakHighTypJ2D1 || '',
        peakHighTypJ2D2: record.peakHighTypJ2D2 || '',
        peakHighTypJG1: record.peakHighTypJG1 || '',
        peakHighTypJG2: record.peakHighTypJG2 || '',
        peakHighTypJD1: record.peakHighTypJD1 || '',
        peakHighTypJD2: record.peakHighTypJD2 || '',
        peakHighTypJDG1: record.peakHighTypJDG1 || '',
        peakHighTypJDG2: record.peakHighTypJDG2 || '',
        ramanReportFile: null,
        removeRamanReport: false,
        replaceRamanReport: false,
        comments: record.comments || ''
      };
      this.showAddRaman = true;
    },

    async saveRaman() {
      try {
        const data = { ...this.ramanForm };
        
        if (data.dateUnknown) {
          data.testDate = null;
        }
        delete data.dateUnknown;
        
        // Handle file removal
        if (data.removeRamanReport) {
          data.removeRamanReport = 'true';
        }
        
        let result;
        if (this.editingRaman) {
          result = await API.raman.update(this.editingRaman.id, data, data.ramanReportFile);
        } else {
          result = await API.raman.create(data, data.ramanReportFile);
        }
        
        await this.loadRamanRecords();
        this.closeRamanForm();
      } catch (error) {
        console.error('Failed to save RAMAN record:', error);
        alert(`Failed to save record: ${error.message}`);
      }
    },

    async deleteRaman(id) {
      if (!confirm('Are you sure you want to delete this record?')) return;
      
      try {
        await API.raman.delete(id);
        await this.loadRamanRecords();
      } catch (error) {
        console.error('Failed to delete RAMAN record:', error);
        alert(`Failed to delete record: ${error.message}`);
      }
    },

    closeRamanForm() {
      this.showAddRaman = false;
      this.editingRaman = null;
      this.ramanForm = { ...DEFAULT_FORMS.raman };
    },

    // TEM CRUD operations
    editTem(record) {
      this.editingTem = record;
      this.temForm = {
        testDate: record.testDate ? record.testDate.split('T')[0] : '',
        dateUnknown: !record.testDate,
        grapheneSample: record.grapheneSample || '',
        researchTeam: record.researchTeam || 'Curia - Germany',
        testingLab: record.testingLab || '',
        temReportFile: null,
        removeTEMReport: false,
        replaceTEMReport: false,
        comments: record.comments || ''
      };
      this.showAddTem = true;
    },

    async saveTem() {
      try {
        // Extract file before processing
        const file = this.temForm.temReportFile;
        
        // Create clean data object
        const data = { ...this.temForm };
        
        // Remove file and UI fields
        delete data.temReportFile;
        
        // Handle report removal
        if (data.removeTEMReport) {
          data.removeTEMReport = 'true';
        }
        
        let result;
        if (this.editingTem) {
          result = await API.tem.update(this.editingTem.id, data, file);
        } else {
          result = await API.tem.create(data, file);
        }
        
        await this.loadTemRecords();
        this.closeTemForm();
      } catch (error) {
        console.error('Failed to save TEM record:', error);
        alert(`Failed to save record: ${error.message}`);
      }
    },

    async deleteTem(id) {
      if (!confirm('Are you sure you want to delete this record?')) return;
      
      try {
        await API.tem.delete(id);
        await this.loadTemRecords();
      } catch (error) {
        console.error('Failed to delete TEM record:', error);
        alert(`Failed to delete record: ${error.message}`);
      }
    },

    closeTemForm() {
      this.showAddTem = false;
      this.editingTem = null;
      this.temForm = { ...DEFAULT_FORMS.tem };
    },
    
    // Update Report CRUD operations
    editUpdateReport(record) {
      this.editingUpdateReport = record;
      this.updateReportForm = {
        description: record.description || '',
        weekOf: record.weekOf ? record.weekOf.split('T')[0] : '',
        grapheneIds: record.grapheneReports?.map(gr => gr.grapheneId) || [],
        updateFile: null
      };
      this.showAddUpdateReport = true;
    },
    
    async saveUpdateReport() {
      try {
        const data = { ...this.updateReportForm };
        const file = this.updateReportForm.updateFile;
        
        // Remove the file object from data since it's handled separately
        delete data.updateFile;
        
        if (this.editingUpdateReport) {
          // For edit, file is optional
          await API.updateReport.update(this.editingUpdateReport.id, data, file);
        } else {
          if (!file) {
            alert('Please select an update report file');
            return;
          }
          await API.updateReport.create(data, file);
        }
        
        await this.loadUpdateReports();
        await this.loadGrapheneRecords(); // Refresh graphene records to show new associations
        this.closeUpdateReportForm();
      } catch (error) {
        console.error('Failed to save update report:', error);
        alert(`Failed to save update report: ${error.message}`);
      }
    },
    
    async deleteUpdateReport(id) {
      if (!confirm('Are you sure you want to delete this update report?')) return;
      
      try {
        await API.updateReport.delete(id);
        await this.loadUpdateReports();
        await this.loadGrapheneRecords(); // Refresh graphene records to update associations
      } catch (error) {
        console.error('Failed to delete update report:', error);
        alert(`Failed to delete update report: ${error.message}`);
      }
    },
    
    closeUpdateReportForm() {
      this.showAddUpdateReport = false;
      this.editingUpdateReport = null;
      this.updateReportForm = { ...DEFAULT_FORMS.updateReport };
    },
    
    viewUpdateReport(filePath) {
      if (filePath) {
        this.currentUpdateReport = filePath + '#navpanes=0&toolbar=0';
        this.showUpdateReportModal = true;
      }
    },
    
    closeUpdateReportModal() {
      this.showUpdateReportModal = false;
      this.currentUpdateReport = null;
    },
    
    handleUpdateFileChange(event) {
      const file = event.target.files[0];
      const validation = validators.validatePDFFile(file);
      
      if (validation.isValid) {
        this.updateReportForm.updateFile = file;
      } else {
        alert(validation.message);
        event.target.value = '';
        this.updateReportForm.updateFile = null;
      }
    },
    
    toggleGrapheneSelection(grapheneId) {
      const index = this.updateReportForm.grapheneIds.indexOf(grapheneId);
      if (index > -1) {
        this.updateReportForm.grapheneIds.splice(index, 1);
      } else {
        this.updateReportForm.grapheneIds.push(grapheneId);
      }
    },
    
    // New Update Report functions for compound batch support
    toggleUpdateReportGraphene(grapheneId) {
      const index = this.updateReportForm.grapheneIds.indexOf(grapheneId);
      if (index > -1) {
        this.updateReportForm.grapheneIds.splice(index, 1);
      } else {
        this.updateReportForm.grapheneIds.push(grapheneId);
      }
    },
    
    toggleUpdateReportCompoundBatch(batchId) {
      const index = this.updateReportForm.compoundBatchIds.indexOf(batchId);
      if (index > -1) {
        this.updateReportForm.compoundBatchIds.splice(index, 1);
      } else {
        this.updateReportForm.compoundBatchIds.push(batchId);
      }
    },
    
    filterUpdateReportMaterials() {
      const searchTerm = this.updateReportSearchTerm.toLowerCase();
      
      // Filter graphene experiments
      if (!searchTerm) {
        this.filteredGrapheneForUpdate = this.grapheneRecords;
      } else {
        this.filteredGrapheneForUpdate = this.grapheneRecords.filter(g => 
          g.experimentNumber?.toLowerCase().includes(searchTerm) ||
          g.species?.toLowerCase().includes(searchTerm) ||
          (g.experimentDate && formatters.formatDate(g.experimentDate).toLowerCase().includes(searchTerm))
        );
      }
      
      // Filter compound batches
      if (!searchTerm) {
        this.filteredCompoundBatchesForUpdate = this.compoundBatchRecords;
      } else {
        this.filteredCompoundBatchesForUpdate = this.compoundBatchRecords.filter(b => 
          b.batchNumber?.toLowerCase().includes(searchTerm) ||
          b.batchName?.toLowerCase().includes(searchTerm) ||
          b.description?.toLowerCase().includes(searchTerm)
        );
      }
    },
    
    // SEM Report methods
    async saveSemReport() {
      try {
        const files = this.semReportForm.semFiles;
        
        console.log('Saving SEM report, files:', files);
        console.log('Is editing:', this.editingSemReport);
        console.log('Files length:', files ? files.length : 0);
        
        // Only require files for new uploads, not edits
        if (!this.editingSemReport && (!files || files.length === 0)) {
          alert('Please select at least one PDF file to upload');
          return;
        }
        
        const data = {
          reportDate: this.semReportForm.reportDate,
          grapheneIds: this.semReportForm.grapheneIds,
          compoundBatchIds: this.semReportForm.compoundBatchIds
        };
        
        if (this.editingSemReport) {
          await API.semReport.update(this.editingSemReport.id, data);
        } else {
          await API.semReport.create(data, files);
        }
        
        await this.loadSemReports();
        this.closeSemReportForm();
      } catch (error) {
        console.error('Failed to save SEM report:', error);
        alert(`Failed to save SEM report: ${error.message}`);
      }
    },
    
    editSemReport(record) {
      this.editingSemReport = record;
      this.semReportForm = {
        reportDate: record.reportDate ? new Date(record.reportDate).toISOString().split('T')[0] : '',
        grapheneIds: record.grapheneReports ? record.grapheneReports.map(gr => gr.graphene.id) : [],
        compoundBatchIds: record.compoundBatchReports ? record.compoundBatchReports.map(cbr => cbr.compoundBatch.id) : [],
        semFiles: null
      };
      this.showAddSemReport = true;
    },
    
    async deleteSemReport(id) {
      if (confirm('Are you sure you want to delete this SEM report?')) {
        try {
          await API.semReport.delete(id);
          await this.loadSemReports();
        } catch (error) {
          console.error('Failed to delete SEM report:', error);
          alert(`Failed to delete SEM report: ${error.message}`);
        }
      }
    },
    
    closeSemReportForm() {
      this.showAddSemReport = false;
      this.editingSemReport = null;
      this.semReportForm = { ...DEFAULT_FORMS.semReport };
    },
    
    viewSemPdf(filePath) {
      if (filePath) {
        this.currentSemPdf = filePath + '#navpanes=0&toolbar=0';
        this.showSemModal = true;
      }
    },
    
    closeSemModal() {
      this.showSemModal = false;
      this.currentSemPdf = null;
    },
    
    handleSemFileChange(event) {
      console.log('handleSemFileChange called, event:', event);
      
      if (!event || !event.target || !event.target.files) {
        console.error('Invalid event object:', event);
        return;
      }
      
      const files = event.target.files;
      const filesArray = Array.from(files);
      
      console.log('Files selected:', filesArray.length, 'files');
      console.log('File details:', filesArray.map(f => ({ name: f.name, size: f.size, type: f.type })));
      
      // Validate all files are PDFs
      const allValid = filesArray.every(file => {
        const validation = validators.validatePDFFile(file);
        if (!validation.isValid) {
          alert(`${file.name}: ${validation.message}`);
          return false;
        }
        return true;
      });
      
      if (allValid && filesArray.length > 0) {
        this.semReportForm.semFiles = filesArray;
        console.log('Files stored in form:', this.semReportForm.semFiles);
        console.log('Form state after file selection:', this.semReportForm);
      } else {
        event.target.value = null;
        this.semReportForm.semFiles = null;
      }
    },
    
    toggleSemGrapheneSelection(grapheneId) {
      const index = this.semReportForm.grapheneIds.indexOf(grapheneId);
      if (index > -1) {
        this.semReportForm.grapheneIds.splice(index, 1);
      } else {
        this.semReportForm.grapheneIds.push(grapheneId);
      }
    },

    toggleSemCompoundBatchSelection(compoundBatchId) {
      const index = this.semReportForm.compoundBatchIds.indexOf(compoundBatchId);
      if (index > -1) {
        this.semReportForm.compoundBatchIds.splice(index, 1);
      } else {
        this.semReportForm.compoundBatchIds.push(compoundBatchId);
      }
    },
    
    // Compound Batch CRUD operations
    async saveCompoundBatch() {
      try {
        const data = { ...this.compoundBatchForm };
        delete data.experimentIds;
        delete data.dateUnknown;
        
        // Handle date field
        if (data.createdDate === '' || this.compoundBatchForm.dateUnknown) {
          data.createdDate = null;
        }
        
        let result;
        if (this.editingCompoundBatch) {
          result = await API.compoundBatch.update(this.editingCompoundBatch.id, {
            ...data,
            experimentIds: this.compoundBatchForm.experimentIds
          });
        } else {
          result = await API.compoundBatch.create({
            ...data,
            experimentIds: this.compoundBatchForm.experimentIds
          });
        }
        
        await this.loadCompoundBatches();
        this.closeCompoundBatchForm();
      } catch (error) {
        console.error('Failed to save compound batch:', error);
        alert(`Failed to save compound batch: ${error.message}`);
      }
    },
    
    editCompoundBatch(batch) {
      this.editingCompoundBatch = batch;
      this.compoundBatchForm = {
        batchNumber: batch.batchNumber || '',
        batchName: batch.batchName || '',
        createdDate: batch.createdDate ? new Date(batch.createdDate).toISOString().split('T')[0] : '',
        dateUnknown: !batch.createdDate,
        totalOutput: batch.totalOutput || '',
        description: batch.description || '',
        experimentIds: batch.experiments ? batch.experiments.map(exp => exp.grapheneId) : []
      };
      this.showCompoundBatchModal = true;
    },
    
    async deleteCompoundBatch(id) {
      if (confirm('Are you sure you want to delete this compound batch? This will not delete the individual graphene experiments.')) {
        try {
          await API.compoundBatch.delete(id);
          await this.loadCompoundBatches();
        } catch (error) {
          console.error('Failed to delete compound batch:', error);
          alert(`Failed to delete compound batch: ${error.message}`);
        }
      }
    },
    
    closeCompoundBatchForm() {
      this.showCompoundBatchModal = false;
      this.editingCompoundBatch = null;
      this.compoundBatchForm = { ...DEFAULT_FORMS.compoundBatch };
      this.selectedGrapheneIds = [];
      this.experimentSearchTerm = '';
    },
    
    toggleGrapheneSelection(grapheneId) {
      const index = this.selectedGrapheneIds.indexOf(grapheneId);
      if (index > -1) {
        this.selectedGrapheneIds.splice(index, 1);
      } else {
        this.selectedGrapheneIds.push(grapheneId);
      }
      
      // Update form
      this.compoundBatchForm.experimentIds = [...this.selectedGrapheneIds];
    },
    
    // Compound Batch Management Tab Functions
    openCompoundBatchForm() {
      this.compoundBatchForm = { ...DEFAULT_FORMS.compoundBatch };
      this.editingCompoundBatch = null;
      this.experimentSearchTerm = '';
      this.showCompoundBatchModal = true;
    },
    
    
    async searchCompoundBatches() {
      try {
        this.compoundBatchRecords = await API.compoundBatch.getAll(this.compoundBatchSearch);
      } catch (error) {
        console.error('Failed to search compound batches:', error);
      }
    },
    
    sortCompoundBatches(column) {
      if (this.compoundBatchSortColumn === column) {
        this.compoundBatchSortOrder = this.compoundBatchSortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.compoundBatchSortColumn = column;
        this.compoundBatchSortOrder = 'asc';
      }
      
      this.compoundBatchRecords.sort((a, b) => {
        let aVal = a[column] || '';
        let bVal = b[column] || '';
        
        // Handle dates
        if (column === 'createdDate') {
          aVal = new Date(aVal || '1900-01-01');
          bVal = new Date(bVal || '1900-01-01');
        }
        
        // Handle numbers
        if (column === 'totalOutput') {
          aVal = parseFloat(aVal) || 0;
          bVal = parseFloat(bVal) || 0;
        }
        
        if (aVal < bVal) return this.compoundBatchSortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.compoundBatchSortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    },
    
    getCompoundBatchSortIcon(column) {
      if (this.compoundBatchSortColumn !== column) return '';
      return this.compoundBatchSortOrder === 'asc' 
        ? '<svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>'
        : '<svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd"/></svg>';
    },
    
    // Modal experiment selection functions
    getFilteredExperiments() {
      if (!this.grapheneRecords || this.grapheneRecords.length === 0) {
        return [];
      }
      
      if (!this.experimentSearchTerm) {
        return this.grapheneRecords;
      }
      
      const searchTerm = this.experimentSearchTerm.toLowerCase();
      return this.grapheneRecords.filter(record => {
        return (
          (record.experimentNumber && record.experimentNumber.toLowerCase().includes(searchTerm)) ||
          (record.species && record.species.toLowerCase().includes(searchTerm)) ||
          (record.biocharExperiment && record.biocharExperiment.toLowerCase().includes(searchTerm)) ||
          (record.biocharLotNumber && record.biocharLotNumber.toLowerCase().includes(searchTerm)) ||
          (record.experimentDate && record.experimentDate.includes(searchTerm))
        );
      });
    },
    
    toggleExperimentSelection(experimentId) {
      const index = this.compoundBatchForm.experimentIds.indexOf(experimentId);
      if (index > -1) {
        this.compoundBatchForm.experimentIds.splice(index, 1);
      } else {
        this.compoundBatchForm.experimentIds.push(experimentId);
      }
      
      // Recalculate total output
      this.updateCompoundBatchTotalOutput();
    },
    
    updateCompoundBatchTotalOutput() {
      const totalOutput = this.compoundBatchForm.experimentIds.reduce((sum, experimentId) => {
        const experiment = this.grapheneRecords.find(record => record.id === experimentId);
        return sum + (experiment && experiment.output ? Number(experiment.output) : 0);
      }, 0);
      
      this.compoundBatchForm.totalOutput = totalOutput.toFixed(2);
    },
    
    createCompoundBatchFromSelected() {
      if (this.selectedGrapheneIds.length === 0) {
        alert('Please select at least one graphene experiment to create a compound batch.');
        return;
      }
      
      // Calculate total output from selected experiments
      const totalOutput = this.selectedGrapheneIds.reduce((sum, grapheneId) => {
        const experiment = this.grapheneRecords.find(record => record.id === grapheneId);
        return sum + (experiment && experiment.output ? Number(experiment.output) : 0);
      }, 0);
      
      this.compoundBatchForm = {
        ...DEFAULT_FORMS.compoundBatch,
        experimentIds: [...this.selectedGrapheneIds],
        totalOutput: totalOutput.toFixed(2)
      };
      
      this.showCompoundBatchModal = true;
    },

    // Shipment CRUD operations
    openShipmentForm(shipment = null) {
      if (shipment) {
        this.editingShipment = shipment;
        this.shipmentForm = {
          shipmentNumber: shipment.shipmentNumber || '',
          shipFromLocation: shipment.shipFromLocation || 'Curia Frankfurt',
          shipToLocation: shipment.shipToLocation || '',
          shipmentDate: shipment.shipmentDate ? new Date(shipment.shipmentDate).toISOString().split('T')[0] : '',
          dateUnknown: !shipment.shipmentDate,
          receivedDate: shipment.receivedDate ? new Date(shipment.receivedDate).toISOString().split('T')[0] : '',
          receivedDateUnknown: !shipment.receivedDate,
          materialType: shipment.grapheneSample ? 'graphene' : shipment.compoundBatchNumber ? 'compound' : 'micronized',
          grapheneSample: shipment.grapheneSample || '',
          compoundBatchNumber: shipment.compoundBatchNumber || '',
          micronizationSku: shipment.micronizationSku || '',
          amountShipped: shipment.amountShipped || '',
          unit: shipment.unit || 'g',
          purpose: shipment.purpose || '',
          status: shipment.status || 'shipped',
          comments: shipment.comments || ''
        };
      } else {
        this.editingShipment = null;
        this.shipmentForm = { ...DEFAULT_FORMS.shipment };
      }
      this.showAddShipment = true;
    },

    async saveShipment() {
      try {
        const data = { ...this.shipmentForm };
        
        // Remove UI-only fields
        delete data.materialType;
        delete data.dateUnknown;
        delete data.receivedDateUnknown;
        
        // Handle date fields
        if (data.shipmentDate === '' || this.shipmentForm.dateUnknown) {
          data.shipmentDate = null;
        }
        if (data.receivedDate === '' || this.shipmentForm.receivedDateUnknown) {
          data.receivedDate = null;
        }

        // Clear the non-selected material reference
        if (this.shipmentForm.materialType === 'graphene') {
          data.compoundBatchNumber = null;
        } else {
          data.grapheneSample = null;
        }

        if (this.editingShipment) {
          await API.shipment.update(this.editingShipment.id, data);
        } else {
          await API.shipment.create(data);
        }

        await this.loadShipments();
        this.closeShipmentForm();
      } catch (error) {
        console.error('Failed to save shipment:', error);
        alert(`Failed to save shipment: ${error.message}`);
      }
    },

    async deleteShipment(id) {
      if (confirm('Are you sure you want to delete this shipment record?')) {
        try {
          await API.shipment.delete(id);
          await this.loadShipments();
        } catch (error) {
          console.error('Failed to delete shipment:', error);
          alert(`Failed to delete shipment: ${error.message}`);
        }
      }
    },

    duplicateShipment(shipment) {
      this.editingShipment = null;
      this.shipmentForm = {
        shipmentNumber: '', // Clear shipment number for new shipment
        shipFromLocation: shipment.shipFromLocation || 'Curia Frankfurt',
        shipToLocation: shipment.shipToLocation || '',
        shipmentDate: new Date().toISOString().split('T')[0], // Today's date
        dateUnknown: false,
        receivedDate: '',
        receivedDateUnknown: true,
        materialType: shipment.grapheneSample ? 'graphene' : shipment.compoundBatchNumber ? 'compound' : 'micronized',
        grapheneSample: shipment.grapheneSample || '',
        compoundBatchNumber: shipment.compoundBatchNumber || '',
        micronizationSku: shipment.micronizationSku || '',
        amountShipped: shipment.amountShipped || '',
        unit: shipment.unit || 'g',
        purpose: shipment.purpose || '',
        status: 'pending', // Default to pending for new shipment
        comments: shipment.comments || ''
      };
      this.showAddShipment = true;
    },

    closeShipmentForm() {
      this.showAddShipment = false;
      this.editingShipment = null;
      this.shipmentForm = { ...DEFAULT_FORMS.shipment };
    },

    addShipmentLocation() {
      if (this.newShipmentLocation.trim()) {
        this.shipmentLocations.push(this.newShipmentLocation.trim());
        this.shipmentLocations.sort();
        this.newShipmentLocation = '';
        this.showAddShipmentLocation = false;
      }
    },
    
    // Micronization CRUD operations
    openMicronizationForm(micronization = null) {
      if (micronization) {
        this.editingMicronization = micronization;
        this.micronizationForm = {
          micronizationNumber: micronization.micronizationNumber || '',
          date: micronization.date ? new Date(micronization.date).toISOString().split('T')[0] : '',
          dateUnknown: !micronization.date,
          sku: micronization.sku || '',
          materialType: micronization.grapheneSample ? 'graphene' : 'compound',
          grapheneSample: micronization.grapheneSample || '',
          compoundBatchNumber: micronization.compoundBatchNumber || '',
          startingMaterialAmount: micronization.startingMaterialAmount || '',
          recoveredAmount: micronization.recoveredAmount || '',
          grindPressure: micronization.grindPressure || '',
          micronizationReportFile: null,
          removeMicronizationReport: false,
          replaceMicronizationReport: false
        };
      } else {
        this.editingMicronization = null;
        this.micronizationForm = { ...DEFAULT_FORMS.micronization };
      }
      this.showMicronizationModal = true;
    },

    async saveMicronization() {
      try {
        const data = { ...this.micronizationForm };
        
        // Remove UI-only fields
        delete data.materialType;
        delete data.dateUnknown;
        delete data.micronizationReportFile;
        delete data.removeMicronizationReport;
        delete data.replaceMicronizationReport;
        
        // Handle date field
        if (data.date === '' || this.micronizationForm.dateUnknown) {
          data.date = null;
        }

        // Clear the non-selected material reference
        if (this.micronizationForm.materialType === 'graphene') {
          data.compoundBatchNumber = null;
        } else {
          data.grapheneSample = null;
        }

        const file = this.micronizationForm.micronizationReportFile;

        if (this.editingMicronization) {
          await API.micronization.update(this.editingMicronization.id, data, file);
        } else {
          await API.micronization.create(data, file);
        }

        await this.loadMicronizations();
        this.closeMicronizationForm();
      } catch (error) {
        console.error('Failed to save micronization:', error);
        alert(`Failed to save micronization: ${error.message}`);
      }
    },

    async deleteMicronization(id) {
      if (confirm('Are you sure you want to delete this micronization record?')) {
        try {
          await API.micronization.delete(id);
          await this.loadMicronizations();
        } catch (error) {
          console.error('Failed to delete micronization:', error);
          alert(`Failed to delete micronization: ${error.message}`);
        }
      }
    },

    duplicateMicronization(micronization) {
      this.editingMicronization = null;
      this.micronizationForm = {
        micronizationNumber: '', // Clear number for new record
        date: new Date().toISOString().split('T')[0], // Today's date
        dateUnknown: false,
        sku: '', // Clear SKU for new record
        materialType: micronization.grapheneSample ? 'graphene' : 'compound',
        grapheneSample: micronization.grapheneSample || '',
        compoundBatchNumber: micronization.compoundBatchNumber || '',
        startingMaterialAmount: micronization.startingMaterialAmount || '',
        recoveredAmount: '', // Clear recovered amount
        grindPressure: micronization.grindPressure || '',
        micronizationReportFile: null,
        removeMicronizationReport: false,
        replaceMicronizationReport: false
      };
      this.showMicronizationModal = true;
    },

    closeMicronizationForm() {
      this.showMicronizationModal = false;
      this.editingMicronization = null;
      this.micronizationForm = { ...DEFAULT_FORMS.micronization };
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
    
    // Filter system methods
    async initFilters(tableName) {
      this.filterLoading = true;
      this.filterError = null;
      
      try {
        // Load filter configuration
        const configResponse = await fetch(`/api/${tableName}/filters/config`);
        if (!configResponse.ok) {
          throw new Error(`Failed to load filter configuration: ${configResponse.statusText}`);
        }
        
        const config = await configResponse.json();
        this.filterConfigs[tableName] = config;
        
        // Initialize filter options object
        this.filterOptions[tableName] = {};
        
        // Load dynamic filter options
        await this.loadFilterOptions(tableName);
        
        // Initialize active filters state
        this.initializeFilterValues(tableName);
        
      } catch (error) {
        console.error('Error initializing filters:', error);
        this.filterError = error.message;
      } finally {
        this.filterLoading = false;
      }
    },
    
    async loadFilterOptions(tableName) {
      const config = this.filterConfigs[tableName];
      if (!config || !config.filters) return;
      
      const optionPromises = config.filters
        .filter(filter => filter.optionsQuery || (filter.type === 'select' && !filter.options))
        .map(async (filter) => {
          try {
            const response = await fetch(`/api/${tableName}/filters/${filter.field}/options`);
            if (response.ok) {
              const options = await response.json();
              this.filterOptions[tableName][filter.field] = options;
            }
          } catch (error) {
            console.warn(`Failed to load options for ${filter.field}:`, error);
            this.filterOptions[tableName][filter.field] = [];
          }
        });
      
      await Promise.all(optionPromises);
    },
    
    initializeFilterValues(tableName) {
      const config = this.filterConfigs[tableName];
      if (!config || !config.filters) return;
      
      this.activeFilters[tableName] = {};
      this.grapheneFilterState.filters = {};
      
      config.filters.forEach(filter => {
        let defaultValue;
        switch (filter.type) {
          case 'text':
          case 'select':
            defaultValue = filter.multiple ? [] : '';
            break;
          case 'multiSelect':
            defaultValue = [];
            break;
          case 'dateRange':
            defaultValue = { from: '', to: '' };
            break;
          case 'numericRange':
            defaultValue = { min: null, max: null };
            break;
          case 'boolean':
            defaultValue = '';
            break;
          default:
            defaultValue = '';
        }
        this.activeFilters[tableName][filter.field] = defaultValue;
        this.grapheneFilterState.filters[filter.field] = defaultValue;
      });
    },
    
    generateFilterFields(tableName, filterStateVariable, onFilterChange) {
      const config = this.filterConfigs[tableName];
      if (!config || !config.filters) {
        return '<div class="text-xs text-gray-500">No filters available</div>';
      }
      
      return config.filters
        .map(filterConfig => {
          const { field, type, label, multiple, options, min, max, step } = filterConfig;
          
          switch (type) {
            case 'text':
              return `
                <div class="space-y-2">
                  <label class="text-xs font-medium text-gray-700">${label}</label>
                  <input type="text"
                         x-model="${filterStateVariable}.filters.${field}"
                         @input.debounce.300ms="${onFilterChange}"
                         placeholder="Search ${label.toLowerCase()}..."
                         class="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
              `;
            
            case 'select':
              const modelAttribute = `x-model="${filterStateVariable}.filters.${field}"`;
              const multipleAttribute = multiple ? 'multiple' : '';
              const sizeAttribute = multiple ? 'size="4"' : '';
              
              return `
                <div class="space-y-2">
                  <label class="text-xs font-medium text-gray-700">${label}</label>
                  <select ${modelAttribute}
                          @change="${onFilterChange}"
                          ${multipleAttribute}
                          ${sizeAttribute}
                          class="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${multiple ? 'h-20' : ''}">
                    <option value="">All ${label}</option>
                    <template x-for="option in filterOptions['${tableName}']['${field}'] || []" :key="option.value">
                      <option :value="option.value" x-text="option.label"></option>
                    </template>
                  </select>
                </div>
              `;
            
            case 'dateRange':
              return `
                <div class="space-y-2">
                  <label class="text-xs font-medium text-gray-700">${label}</label>
                  <div class="grid grid-cols-2 gap-2">
                    <input type="date"
                           x-model="${filterStateVariable}.filters.${field}.from"
                           @change="${onFilterChange}"
                           placeholder="From"
                           class="px-2 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <input type="date"
                           x-model="${filterStateVariable}.filters.${field}.to"
                           @change="${onFilterChange}"
                           placeholder="To"
                           class="px-2 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  </div>
                </div>
              `;
            
            case 'numericRange':
              return `
                <div class="space-y-2">
                  <label class="text-xs font-medium text-gray-700">${label}</label>
                  <div class="grid grid-cols-2 gap-2">
                    <input type="number"
                           x-model.number="${filterStateVariable}.filters.${field}.min"
                           @input.debounce.300ms="${onFilterChange}"
                           placeholder="Min"
                           min="${min || ''}"
                           max="${max || ''}"
                           step="${step || 'any'}"
                           class="px-2 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <input type="number"
                           x-model.number="${filterStateVariable}.filters.${field}.max"
                           @input.debounce.300ms="${onFilterChange}"
                           placeholder="Max"
                           min="${min || ''}"
                           max="${max || ''}"
                           step="${step || 'any'}"
                           class="px-2 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  </div>
                </div>
              `;
            
            case 'multiSelect':
              return `
                <div class="space-y-2">
                  <label class="text-xs font-medium text-gray-700">${label}</label>
                  <div class="space-y-1 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                    ${options.map(option => `
                      <label class="flex items-center space-x-2 text-xs">
                        <input type="checkbox"
                               :checked="(${filterStateVariable}.filters.${field} || []).includes('${option}')"
                               @change="toggleMultiSelectOption('${field}', '${option}', $event.target.checked, '${filterStateVariable}'); ${onFilterChange}"
                               class="rounded text-blue-600">
                        <span>${option}</span>
                      </label>
                    `).join('')}
                  </div>
                </div>
              `;
            
            case 'boolean':
              return `
                <div class="space-y-2">
                  <label class="text-xs font-medium text-gray-700">${label}</label>
                  <select x-model="${filterStateVariable}.filters.${field}"
                          @change="${onFilterChange}"
                          class="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All</option>
                    ${options.map(option => `
                      <option value="${option.value}">${option.label}</option>
                    `).join('')}
                  </select>
                </div>
              `;
            
            default:
              return '';
          }
        })
        .join('');
    },
    
    getActiveFilterCount(filterState) {
      if (!filterState || !filterState.filters) return 0;
      
      return Object.values(filterState.filters).filter(value => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        if (typeof value === 'object' && value !== null) {
          return Object.values(value).some(v => v !== null && v !== '');
        }
        return value !== null && value !== '';
      }).length;
    },
    
    clearAllFilters(tableName) {
      this.initializeFilterValues(tableName);
      this.loadGrapheneRecords();
    },
    
    toggleMultiSelectOption(field, option, checked, stateVariable) {
      const filterState = this[stateVariable];
      if (!filterState.filters[field]) {
        filterState.filters[field] = [];
      }
      
      if (checked) {
        if (!filterState.filters[field].includes(option)) {
          filterState.filters[field].push(option);
        }
      } else {
        filterState.filters[field] = filterState.filters[field].filter(item => item !== option);
      }
    },
    
    buildFilterQueryParams(tableName, additionalParams = {}) {
      const filters = this.grapheneFilterState.filters;
      if (!filters) return additionalParams;
      
      const params = { ...additionalParams };
      
      // Add filters as JSON string
      const activeFilters = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          activeFilters[key] = value;
        } else if (typeof value === 'object' && value !== null) {
          const hasValues = Object.values(value).some(v => v !== null && v !== '');
          if (hasValues) {
            activeFilters[key] = value;
          }
        } else if (value !== null && value !== '') {
          activeFilters[key] = value;
        }
      });
      
      if (Object.keys(activeFilters).length > 0) {
        params.filters = JSON.stringify(activeFilters);
      }
      
      return params;
    },
    
    applyFilters() {
      this.loadGrapheneRecords();
    },
    
    // Dashboard methods
    async loadDashboardData() {
      try {
        // Load all dashboard data in parallel
        await Promise.all([
          this.loadProductionMetrics(),
          this.loadInventoryData(), 
          this.loadTestResultsData(),
          this.loadActivityData(),
          this.loadLatestProductionCards()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        this.dashboardError = 'Failed to load dashboard data';
      }
    },
    
    async loadProductionMetrics() {
      this.dashboardLoading.production = true;
      try {
        const response = await fetch('/api/dashboard/production-metrics');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        this.dashboardData.production = await response.json();
      } catch (error) {
        console.error('Error loading production metrics:', error);
        this.dashboardData.production = null;
      } finally {
        this.dashboardLoading.production = false;
      }
    },
    
    async loadInventoryData() {
      this.dashboardLoading.inventory = true;
      try {
        const response = await fetch('/api/dashboard/inventory-by-location');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        this.dashboardData.inventory = await response.json();
      } catch (error) {
        console.error('Error loading inventory data:', error);
        this.dashboardData.inventory = null;
      } finally {
        this.dashboardLoading.inventory = false;
      }
    },
    
    async loadTestResultsData() {
      this.dashboardLoading.testResults = true;
      try {
        const response = await fetch('/api/dashboard/best-test-results');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        this.dashboardData.testResults = await response.json();
      } catch (error) {
        console.error('Error loading test results data:', error);
        this.dashboardData.testResults = null;
      } finally {
        this.dashboardLoading.testResults = false;
      }
    },
    
    async loadActivityData() {
      this.dashboardLoading.activity = true;
      try {
        const response = await fetch('/api/dashboard/recent-activity');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        this.dashboardData.activity = await response.json();
      } catch (error) {
        console.error('Error loading activity data:', error);
        this.dashboardData.activity = null;
      } finally {
        this.dashboardLoading.activity = false;
      }
    },
    
    async loadLatestProductionCards() {
      try {
        // Load all latest production data in parallel
        const [latestGraphene, latestBatches, latestShipments] = await Promise.all([
          window.CardService.getLatestGrapheneCards(4),
          window.CardService.getLatestCompoundBatches(4),
          window.CardService.getLatestShipments(4)
        ]);
        
        this.latestGrapheneCards = latestGraphene;
        this.latestCompoundBatches = latestBatches;
        this.latestShipments = latestShipments;
      } catch (error) {
        console.error('Error loading latest production cards:', error);
        this.latestGrapheneCards = [];
        this.latestCompoundBatches = [];
        this.latestShipments = [];
      }
    },
    
    // Card creation methods for dashboard
    createGrapheneCard(experiment) {
      return createSimplifiedGrapheneCard(experiment, {
        context: 'dashboard'
      });
    },
    
    createCompoundBatchCard(batch) {
      return window.CardFactory.createCard(batch, {
        preset: 'compoundBatch',
        context: 'dashboard'
      });
    },
    
    createShipmentCard(shipment) {
      return window.CardFactory.createCard(shipment, {
        preset: 'shipment',
        context: 'dashboard'
      });
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
          // For now, use existing shipment data
          const shipmentData = this.shipments.find(s => s.shipmentNumber === shipmentNumber);
          if (shipmentData) {
            this.modalCardData = {
              ...this.modalCardData,
              [shipmentNumber]: shipmentData
            };
          } else {
            throw new Error('Shipment not found');
          }
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
      } else if (tab === 'news') {
        await this.initializeNewsTab();
      }
    },

    // News system methods
    async fetchNewsArticles() {
      this.newsLoading = true;
      this.newsError = null;

      try {
        const queryParams = new URLSearchParams();
        
        if (this.newsFilters.search) queryParams.append('search', this.newsFilters.search);
        if (this.newsFilters.category) queryParams.append('category', this.newsFilters.category);
        if (this.newsFilters.source) queryParams.append('source', this.newsFilters.source);
        if (this.newsFilters.sortBy) queryParams.append('sortBy', this.newsFilters.sortBy);
        if (this.newsFilters.sortOrder) queryParams.append('sortOrder', this.newsFilters.sortOrder);
        
        const dateRange = this.getDateRange();
        if (dateRange.startDate) queryParams.append('startDate', dateRange.startDate);
        if (dateRange.endDate) queryParams.append('endDate', dateRange.endDate);

        queryParams.append('page', '1');
        queryParams.append('limit', '50');

        const response = await fetch(`/api/news/articles?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch news articles');
        }

        const data = await response.json();
        
        if (data.success) {
          this.newsArticles = data.data.articles;
          this.filteredNewsArticles = [...this.newsArticles];
          this.applyClientSideFilters();
          this.updatePagination();
        } else {
          throw new Error(data.error || 'Failed to fetch news articles');
        }

      } catch (error) {
        console.error('Error fetching news articles:', error);
        this.newsError = error.message;
        this.showNotification('Error loading news articles: ' + error.message, 'error');
      } finally {
        this.newsLoading = false;
      }
    },

    async refreshNewsFeed() {
      await this.fetchNewsArticles();
      this.showNotification('News feed refreshed successfully', 'success');
    },

    filterNews() {
      this.applyClientSideFilters();
      this.newsCurrentPage = 1;
      this.updatePagination();
    },

    applyClientSideFilters() {
      let filtered = [...this.newsArticles];

      // Filter by high-impact keywords first
      if (this.highImpactKeywords.length > 0) {
        filtered = filtered.filter(article => {
          const articleText = (
            article.title + ' ' + 
            (article.summary || '') + ' ' + 
            (article.keywordTags ? article.keywordTags.join(' ') : '')
          ).toLowerCase();
          
          return this.highImpactKeywords.some(keyword => 
            articleText.includes(keyword.toLowerCase())
          );
        });
      }

      if (this.newsFilters.search) {
        const searchTerm = this.newsFilters.search.toLowerCase();
        filtered = filtered.filter(article => 
          article.title.toLowerCase().includes(searchTerm) ||
          (article.summary && article.summary.toLowerCase().includes(searchTerm)) ||
          (article.keywordTags && article.keywordTags.some(tag => 
            tag.toLowerCase().includes(searchTerm)
          ))
        );
      }

      if (this.newsFilters.category) {
        filtered = filtered.filter(article => article.category === this.newsFilters.category);
      }

      filtered.sort((a, b) => {
        const field = this.newsFilters.sortBy;
        const order = this.newsFilters.sortOrder;
        
        let aValue = a[field];
        let bValue = b[field];

        if (field === 'publishDate') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (order === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });

      this.filteredNewsArticles = filtered;
    },

    updatePagination() {
      this.newsTotalPages = Math.ceil(this.filteredNewsArticles.length / this.newsPageSize);
      this.newsHasMorePages = this.newsCurrentPage < this.newsTotalPages;
      
      const start = (this.newsCurrentPage - 1) * this.newsPageSize;
      const end = start + this.newsPageSize;
      this.paginatedNewsArticles = this.filteredNewsArticles.slice(start, end);
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

    getNewsPageNumbers() {
      const pages = [];
      const total = this.newsTotalPages;
      const current = this.newsCurrentPage;
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i);
          pages.push('...');
          pages.push(total);
        } else if (current >= total - 3) {
          pages.push(1);
          pages.push('...');
          for (let i = total - 4; i <= total; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = current - 1; i <= current + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(total);
        }
      }
      
      return pages.filter(p => p !== '...' || pages.indexOf(p) === pages.lastIndexOf(p));
    },

    getDateRange() {
      const now = new Date();
      const range = { startDate: null, endDate: null };

      switch (this.newsFilters.dateRange) {
        case 'today':
          range.startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          range.startDate = weekAgo.toISOString();
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          range.startDate = monthAgo.toISOString();
          break;
        case 'quarter':
          const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          range.startDate = quarterAgo.toISOString();
          break;
      }

      return range;
    },

    updateDateFilters() {
      // Called when date range filter changes
    },

    formatCategory(category) {
      const categoryMap = {
        'RESEARCH_BREAKTHROUGH': 'Research',
        'INDUSTRY_NEWS': 'Industry',
        'MARKET_ANALYSIS': 'Market',
        'APPLICATIONS': 'Applications',
        'PRODUCTION_METHODS': 'Production',
        'PATENTS': 'Patents',
        'COMPANY_NEWS': 'Company',
        'FUNDING_INVESTMENT': 'Funding'
      };
      return categoryMap[category] || category;
    },

    getCategoryColor(category) {
      const colorMap = {
        'RESEARCH_BREAKTHROUGH': 'bg-blue-100 text-blue-800',
        'INDUSTRY_NEWS': 'bg-gray-100 text-gray-800',
        'MARKET_ANALYSIS': 'bg-green-100 text-green-800',
        'APPLICATIONS': 'bg-purple-100 text-purple-800',
        'PRODUCTION_METHODS': 'bg-orange-100 text-orange-800',
        'PATENTS': 'bg-red-100 text-red-800',
        'COMPANY_NEWS': 'bg-indigo-100 text-indigo-800',
        'FUNDING_INVESTMENT': 'bg-yellow-100 text-yellow-800'
      };
      return colorMap[category] || 'bg-gray-100 text-gray-800';
    },

    hasActiveFilters() {
      return !!(this.newsFilters.search || 
                this.newsFilters.category || 
                this.newsFilters.dateRange ||
                this.newsFilters.source);
    },

    getActiveFilters() {
      const filters = [];
      
      if (this.newsFilters.search) {
        filters.push({ key: 'search', label: `Search: "${this.newsFilters.search}"` });
      }
      if (this.newsFilters.category) {
        filters.push({ key: 'category', label: `Category: ${this.formatCategory(this.newsFilters.category)}` });
      }
      if (this.newsFilters.dateRange) {
        filters.push({ key: 'dateRange', label: `Date: ${this.newsFilters.dateRange}` });
      }
      if (this.newsFilters.source) {
        filters.push({ key: 'source', label: `Source: ${this.newsFilters.source}` });
      }
      
      return filters;
    },

    removeFilter(filterKey) {
      this.newsFilters[filterKey] = '';
      this.filterNews();
    },

    clearAllFilters() {
      this.newsFilters = {
        search: '',
        category: '',
        source: '',
        dateRange: '',
        sortBy: 'publishDate',
        sortOrder: 'desc'
      };
      this.filterNews();
    },

    async toggleBookmark(articleId) {
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
          const article = this.newsArticles.find(a => a.id === articleId);
          if (article) {
            article.isBookmarked = data.isBookmarked;
          }
          
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
      }
    },

    async trackArticleView(articleId) {
      try {
        await fetch(`/api/news/articles/${articleId}`, {
          method: 'GET'
        });
      } catch (error) {
        console.error('Error tracking article view:', error);
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
        navigator.clipboard.writeText(article.url).then(() => {
          this.showNotification('Article URL copied to clipboard', 'success');
        }).catch(err => {
          console.error('Error copying to clipboard:', err);
          this.showNotification('Could not copy URL', 'error');
        });
      }
    },

    // High-impact keyword methods
    toggleHighImpactKeyword(keyword) {
      const index = this.highImpactKeywords.indexOf(keyword);
      if (index > -1) {
        this.highImpactKeywords.splice(index, 1);
      } else {
        this.highImpactKeywords.push(keyword);
      }
      this.filterNews();
    },

    clearHighImpactKeywords() {
      this.highImpactKeywords = [];
      this.filterNews();
    },

    hasHighImpactKeyword(article) {
      if (!article.keywordTags || article.keywordTags.length === 0) return false;
      
      const articleKeywords = article.keywordTags.map(tag => tag.toLowerCase());
      return this.allHighImpactKeywords.some(keyword => 
        articleKeywords.includes(keyword.toLowerCase()) ||
        articleKeywords.some(tag => tag.includes(keyword.toLowerCase()))
      );
    },

    isHighImpactKeyword(tag) {
      const tagLower = tag.toLowerCase();
      return this.allHighImpactKeywords.some(keyword => 
        tagLower === keyword.toLowerCase() || 
        tagLower.includes(keyword.toLowerCase())
      );
    },

    // Summary system methods
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
      this.summaryLoading[articleId] = true;
      this.summaryError[articleId] = null;

      try {
        const response = await fetch(`/api/news/articles/${articleId}/generate-summary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
          // Update the article in our local state
          const article = this.newsArticles.find(a => a.id === articleId);
          if (article) {
            article.laymanSummary = result.data.summary;
            article.summaryGenerated = true;
            article.summaryError = null;
          }

          // Show the summary
          this.showSummary[articleId] = true;
          
          // Show success notification
          this.showNotification(
            `Summary generated! ${result.data.cached ? '(Cached)' : `Cost: $${result.data.cost?.toFixed(4) || '0.001'}`}`,
            'success'
          );

          // Re-filter to update display
          this.applyClientSideFilters();
        } else {
          throw new Error(result.error || 'Failed to generate summary');
        }

      } catch (error) {
        console.error('Error generating summary:', error);
        this.summaryError[articleId] = error.message;
        this.showNotification('Failed to generate summary: ' + error.message, 'error');
      } finally {
        this.summaryLoading[articleId] = false;
      }
    },

    async regenerateSummary(articleId) {
      // Find and update the article to force regeneration
      const article = this.newsArticles.find(a => a.id === articleId);
      if (article) {
        article.summaryGenerated = false;
        article.laymanSummary = null;
        article.summaryError = null;
      }
      
      await this.generateSummary(articleId);
    },

    async retryGenerateSummary(articleId) {
      // Clear error and retry
      this.summaryError[articleId] = null;
      await this.generateSummary(articleId);
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
    },

    async initializeNewsTab() {
      if (this.newsArticles.length === 0) {
        await this.fetchNewsArticles();
      }
    },

    async fetchHeadlines() {
      this.headlinesLoading = true;
      this.headlinesError = null;

      try {
        const response = await fetch('/api/news/headlines?limit=5');
        
        if (!response.ok) {
          throw new Error('Failed to fetch headlines');
        }

        const data = await response.json();
        
        if (data.success) {
          this.headlines = data.data;
        } else {
          throw new Error(data.error || 'Failed to fetch headlines');
        }

      } catch (error) {
        console.error('Error fetching headlines:', error);
        this.headlinesError = error.message;
        this.headlines = [];
      } finally {
        this.headlinesLoading = false;
      }
    },

    async refreshHeadlines() {
      await this.fetchHeadlines();
    },

    openNewsArticle(article) {
      this.trackArticleView(article.id);
      window.open(article.url, '_blank', 'noopener,noreferrer');
    }
  };
};