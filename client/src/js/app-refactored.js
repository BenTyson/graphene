// Main Application Module - Refactored Version
// Uses modular components for better maintainability

import API from './services/api.js';
import kanbanService from './services/KanbanService.js';
import taskService from './services/TaskService.js';
import pipelineService, { PIPELINE_STAGES } from './services/PipelineService.js';
import formatters, { getRelativeDateLabel, getRelativeDateClass, getUserDisplayName, getUserInitials } from './utils/formatters.js';
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
import { getUserManagementTabHtml } from './components/tabs/UserManagementTab.js';
// Tab components are loaded as separate scripts and made available globally
// import { getAnalysisTabHtml } from './components/tabs/AnalysisTab.js';
import { getAIInsightsTabHtml } from './components/tabs/AIInsightsTab.js';
import { getNewsTabHtml } from './components/tabs/NewsTab.js';
import { getBiocharModalHtml } from './components/modals/BiocharModal.js';
import { getCompoundBatchModalHtml } from './components/modals/CompoundBatchModal.js';
import { getUserModalHtml } from './components/modals/UserModal.js';
import { getMicronizationModalHtml } from './components/modals/MicronizationModal.js';
import { getMCBModalHtml } from './components/modals/MCBModal.js';
import { getRAMANModalHtml } from './components/modals/RAMANModal.js';
import { getTasksTabHtml } from './components/tabs/TasksTab.js';
import { getTaskModalHtml } from './components/modals/TaskModal.js';
import { getTaskDetailPanelHtml } from './components/modals/TaskDetailPanel.js';
import { getGoalsTabHtml } from './components/tabs/GoalsTab.js';
import { getGoalModalHtml } from './components/modals/GoalModal.js';
import { getGoalDetailPanelHtml } from './components/modals/GoalDetailPanel.js';
import goalService from './services/GoalService.js';
import { getPipelineTabHtml } from './components/tabs/PipelineTab.js';
import { getContactModalHtml } from './components/modals/ContactModal.js';
import { getAddToPipelineModalHtml } from './components/modals/AddToPipelineModal.js';
import { getContactDetailPanelHtml } from './components/modals/ContactDetailPanel.js';
import { getProformaTabHtml } from './components/tabs/ProformaTab.js';
import proformaService from './services/ProformaService.js';
import { explainCell as explainProformaCell, findUnregisteredOutlookKeys as findUnregisteredProformaKeys } from '@shared/proformaExplain.js';
import { getEmailAdminTabHtml } from './components/tabs/EmailAdminTab.js';
import { getEmailPreferencesModalHtml } from './components/modals/EmailPreferencesModal.js';
import emailService from './services/EmailService.js';

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
import './components/modals/ParticleSizeModal.js';
import './components/modals/XRDModal.js';
import './components/modals/XPSModal.js';
import './components/modals/ShipmentModal.js';
import './components/modals/GrapheneModal.js';

// Import tab components
import './components/tabs/TestResultsBETTab.js';
import './components/tabs/TestResultsConductivityTab.js';
import './components/tabs/TestResultsRAMANTab.js';
import './components/tabs/TestResultsTEMTab.js';
import './components/tabs/TestResultsParticleSizeTab.js';
import './components/tabs/TestResultsXRDTab.js';
import './components/tabs/TestResultsXPSTab.js';
import './components/tabs/SEMReportsTab.js';
import './components/tabs/UpdateReportsTab.js';
import './components/tabs/AnalysisTab.js';
import './components/analysis/CharacterizationComparison.js';
import { getSummaryToggleHtml, shouldShowSummaryToggle, formatSummaryWithSections, getSimplifiedTitle } from './components/SummaryToggle.js';
import FilterService from './services/FilterService.js';
import NewsService from './services/NewsService.js';
import CRUDService from './services/CRUDService.js';
import DashboardService from './services/DashboardService.js';

// Import data page system
import './services/RouterService.js';
import './components/dataPage/DataPageLayout.js';
import './components/dataPage/DataPageHeader.js';
import './components/dataPage/DataPageSummary.js';
import './components/dataPage/DataPageSection.js';
import { DEFAULT_FORMS } from './utils/constants.js';

console.log('Loading app-refactored.js...');

// Make tab functions globally available for Alpine.js templates
window.getDashboardTabHtml = getDashboardTabHtml;
window.getShipmentsTabHtml = getShipmentsTabHtml;
window.getMicronizationTabHtml = getMicronizationTabHtml;
window.getCompoundBatchesTabHtml = getCompoundBatchesTabHtml;
window.getBiocharTabHtml = getBiocharTabHtml;
window.getGrapheneTabHtml = getGrapheneTabHtml;
window.getUserManagementTabHtml = getUserManagementTabHtml;
window.getUserModalHtml = getUserModalHtml;
// Tab functions are made globally available in their component files
// window.getAnalysisTabHtml = getAnalysisTabHtml;

// AI Insights tab is now loaded from the actual component
window.getAIInsightsTabHtml = getAIInsightsTabHtml;

window.getNewsTabHtml = getNewsTabHtml;
window.getProformaTabHtml = getProformaTabHtml;
window.getEmailAdminTabHtml = getEmailAdminTabHtml;
window.getEmailPreferencesModalHtml = getEmailPreferencesModalHtml;

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

// Relative timestamp helper — "2h ago", "3d ago", etc.
window.formatRelativeTime = function(dateString) {
  if (!dateString) return '—';
  try {
    const diff = Date.now() - new Date(dateString).getTime();
    if (isNaN(diff)) return '—';
    const abs = Math.abs(diff);
    if (abs < 60000) return 'just now';
    if (abs < 3600000) return Math.floor(abs / 60000) + 'm ago';
    if (abs < 86400000) return Math.floor(abs / 3600000) + 'h ago';
    if (abs < 604800000) return Math.floor(abs / 86400000) + 'd ago';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
};

// Main Alpine.js application
window.grapheneApp = function() {
  return {
    // Tab management
    activeTab: 'dashboard',
    
    // Sidebar state
    sidebarExpanded: true,
    sidebarOpen: false,
    sidebarProductionOpen: false,
    sidebarAnalyticsOpen: false,
    sidebarTestResultsOpen: false,

    // Email admin tab state
    emailAdminSection: 'settings',
    emailSettings: null,
    emailSettingsForm: null,
    emailSettingsLoading: false,
    emailSettingsSaving: false,
    emailSettingsSuccess: false,
    emailSparrowConfigured: false,
    emailTestForm: { to: '', kind: 'transactional', templateId: '', data: '{}', subject: '', html: '' },
    emailTestSending: false,
    emailTestResults: [],
    emailLogs: [],
    emailLogsLoading: false,
    emailLogsFilter: { type: '', status: '', userId: '' },
    emailLogsExpanded: null,

    // Email preferences modal state
    showEmailPrefs: false,
    emailPrefs: null,
    emailPrefsForm: null,
    emailPrefsLoading: false,
    emailPrefsSaving: false,
    emailPrefsSuccess: false,
    emailTimezones: emailService.getTimezoneList(),

    // Initialize app and handle initial route
    init() {
      this.initSidebarState();
      this.handleInitialRoute();
      this.autoExpandParentGroup(this.activeTab);
    },
    
    // Handle initial route from URL path and hash
    handleInitialRoute() {
      const hash = window.location.hash;
      const path = window.location.pathname;
      
      console.log('[Navigation] handleInitialRoute called', {
        hash,
        path,
        fullUrl: window.location.href
      });
      
      // If it's a data page route (hash-based), let RouterService handle it
      if (hash && window.routerService?.isDataPageRoute(hash)) {
        console.log('[Navigation] Data page route detected, letting RouterService handle it');
        return;
      }
      
      // Handle path-based normal tab navigation
      if (path && path !== '/') {
        const tabName = path.slice(1); // Remove leading /
        const validTabs = ['dashboard', 'graphene', 'biochar', 'compound-batches', 'micronization', 'shipments', 'analysis', 'ai-insights', 'news', 'user-management', 'email-admin', 'tasks', 'goals', 'pipeline', 'proforma', 'test-bet', 'test-conductivity', 'test-raman', 'test-tem', 'test-particle-size', 'test-xrd', 'test-xps', 'test-sem', 'test-updates'];

        if (validTabs.includes(tabName)) {
          console.log(`[Navigation] Setting initial tab from path: ${tabName}`);
          this.activeTab = tabName;
          return;
        }
      }

      // Handle legacy hash-based navigation (for backward compatibility)
      if (hash && hash !== '#') {
        const tabName = hash.slice(1); // Remove #
        const validTabs = ['dashboard', 'graphene', 'biochar', 'compound-batches', 'micronization', 'shipments', 'analysis', 'ai-insights', 'news', 'user-management', 'email-admin', 'tasks', 'goals', 'pipeline', 'proforma', 'test-bet', 'test-conductivity', 'test-raman', 'test-tem', 'test-particle-size', 'test-xrd', 'test-xps', 'test-sem', 'test-updates'];
        
        if (validTabs.includes(tabName)) {
          console.log(`[Navigation] Converting legacy hash navigation to path: ${tabName}`);
          this.switchTab(tabName); // This will convert to path-based URL
          return;
        }
      }
      
      // Default to dashboard if no valid route found
      if (path === '/' && (!hash || hash === '#')) {
        console.log('[Navigation] Setting default dashboard tab');
        this.activeTab = 'dashboard';
      }
    },
    
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

    // Characterization reference data
    characterizationData: null,
    characterizationLoading: false,
    characterizationError: null,
    selectedCharacterizationTest: 'BET',
    characterizationReferences: [],
    showCharacterizationModal: false,
    characterizationChart: null,
    characterizationChartInitialized: false,
    characterizationSortOrder: 'desc', // 'asc' or 'desc'
    characterizationForm: {
      source: '',
      sourceType: 'academic',
      testType: 'BET',
      value: '',
      valueString: '',
      unit: 'm²/g',
      isRange: false,
      minValue: '',
      maxValue: '',
      conditions: {},
      testDate: null,
      notes: ''
    },
    
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
    particleSizeRecords: [],
    xrdRecords: [],
    xpsRecords: [],
    updateReports: [],
    semReports: [],
    compoundBatches: [],
    compoundBatchRecords: [],
    shipments: [],
    micronizations: [],
    mcbs: [],
    availableMicronizations: [],
    availableExperiments: [],
    availableLots: [],
    availableGrapheneSamples: [],
    availableCompoundBatches: [],
    users: [],

    // System tag library (loaded from /api/tags) — replaces hardcoded constants
    systemCategoryTags: [],
    systemInstitutionTags: [],
    addingTagKind: null,   // 'CATEGORY' | 'INSTITUTION' | null — controls inline add input visibility
    newTagInput: '',

    // Task management
    tasks: [],
    taskAssignees: [],
    taskViewMode: 'kanban',
    taskListGroupBy: localStorage.getItem('taskListGroupBy') || 'none',
    taskCostsGroupBy: localStorage.getItem('taskCostsGroupBy') || 'none',
    taskCostsFilter: 'open', // 'open' | 'paid' | 'all'
    taskCostsSummary: { openTotal: 0, paidTotal: 0, grandTotal: 0, openCount: 0, paidCount: 0, totalCount: 0 },
    taskCollapsedGroups: {},
    calendarCursor: (() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d; })(),
    calendarSubMode: localStorage.getItem('taskCalendarSubMode') || 'month', // 'month' | 'agenda'
    taskSearch: '',
    taskFilters: { status: '', priority: '', assigneeId: '', overdue: false, tag: '', institution: '', goalId: '' },

    // Goal management
    goals: [],
    goalLoading: false,
    goalSearch: '',
    goalFilters: { status: '', ownerId: '' },
    showArchivedGoals: false,
    showGoalForm: false,
    editingGoal: null,
    goalForm: { title: '', description: '', status: 'ACTIVE', targetDate: '', ownerId: '', tags: [] },
    showGoalDetail: false,
    selectedGoal: null,
    goalLinkSearch: '',
    showAddTask: false,
    showTaskDetail: false,
    selectedTask: null,
    editingTask: null,
    taskForm: { title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assigneeIds: [], parentId: null, goalId: '', tags: [], cost: '', costPaid: false },
    taskCommentForm: { content: '' },
    taskLoading: false,
    taskTagInput: '',
    showArchivedTasks: false,
    taskAttachmentUploading: false,
    depPickerOpenFor: null, // 'blockedBy' | 'blocking' | null
    depPickerQuery: '',
    depPickerResults: [],

    // Pipeline / CRM
    pipelineContacts: [],
    pipelineBoardContacts: [],
    pipelineOwners: [],
    pipelineViewMode: 'kanban',
    pipelineType: 'INVESTOR',
    pipelineSearch: '',
    pipelineFilters: { ownerId: '', contactType: '', onPipeline: '' },
    pipelineContactKindFilter: '',
    pipelineContactSort: { field: 'name', order: 'asc' },
    showAddContact: false,
    showAddToPipeline: false,
    showContactDetail: false,
    selectedContact: null,
    editingContact: null,
    contactForm: { name: '', contactKind: 'PERSON', email: '', phone: '', role: '', contactType: '', contactTypes: [], source: '', tags: [], notes: '', linkedInUrl: '', website: '', companyId: '', linkPersonId: '', ownerId: '', nextFollowUpAt: '' },
    addToPipelineForm: { contactId: '', pipelineType: 'INVESTOR', pipelineTitle: '' },
    addToPipelineSearch: '',
    addToPipelinePresetStage: '',
    contactActivityForm: { action: 'note_added', content: '' },
    pipelineLoading: false,
    pipelineStats: null,
    pipelineTagInput: '',
    contactDetailTagInput: '',
    contactAttachmentUploading: false,

    // Proforma
    proformaScenarios: [],
    proformaScenario: null,
    proformaAssumptions: null,
    proformaComputed: null,
    proformaBaseline: null,
    proformaView: 'list',
    proformaEditorTab: 'assumptions',
    proformaFullscreenChart: null,
    proformaOutlookView: 'monthly',
    proformaLoading: false,
    proformaDirty: false,
    proformaCollapsed: {},
    proformaProductionCollapsed: {},
    proformaSection: 'revenue',
    proformaSectionsReviewed: {},
    proformaAdvancedOpen: {},
    proformaMachineHover: null,
    proformaStaffingYear: 'year0',
    proformaMarketSources: [],
    // Outlook cell explainer: double-click a cell to see how it was calculated.
    proformaExplainer: null, // { rowKey, periodIndex, view, label, anchor: {top,left,width,height} }
    proformaExplainerStack: [], // back-stack so drilling into a part is reversible

    // Current authenticated user (reactive)
    currentUser: null,

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
    particleSizeSearch: '',
    xrdSearch: '',
    xpsSearch: '',
    updateReportSearch: '',
    semReportSearch: '',
    compoundBatchSearch: '',
    shipmentSearch: '',
    micronizationSearch: '',
    mcbSearch: '',
    userSearch: '',

    // Micronization sub-tab state
    activeMicronizationSubTab: 'individual', // 'individual' or 'mcb'
    expandedMCBRows: {}, // Track which MCB rows are expanded

    // Sorting states
    biocharSortColumn: null,
    biocharSortDirection: 'asc',
    grapheneSortColumn: 'experimentDate',
    grapheneSortDirection: 'desc',
    
    // Modal states
    showAddBiochar: false,
    showAddGraphene: false,
    showAddBet: false,
    showAddConductivity: false,
    showAddRaman: false,
    showAddTem: false,
    showAddParticleSize: false,
    showAddXRD: false,
    showAddXPS: false,
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
    showParticleSizeModal: false,
    currentParticleSizePdf: null,
    showXRDReports: false,
    currentXRDReports: [],
    currentXRDSample: '',
    showXPSReports: false,
    currentXPSReports: [],
    currentXPSSample: '',
    showAddUpdateReport: false,
    showAddSemReport: false,
    showUpdateReportModal: false,
    currentUpdateReport: null,
    showAddShipment: false,
    showMicronizationModal: false,
    showMCBModal: false,
    showAddUser: false,

    // Editing states
    editingBiochar: null,
    editingGraphene: null,
    editingBet: null,
    editingConductivity: null,
    editingRaman: null,
    editingTem: null,
    editingParticleSize: null,
    editingXRD: null,
    editingXPS: null,
    editingUpdateReport: null,
    editingSemReport: null,
    editingCompoundBatch: null,
    editingShipment: null,
    editingMicronization: null,
    editingMCB: null,
    editingUser: null,

    // Forms
    biocharForm: { ...DEFAULT_FORMS.biochar },
    grapheneForm: { ...DEFAULT_FORMS.graphene },
    betForm: { ...DEFAULT_FORMS.bet },
    conductivityForm: { ...DEFAULT_FORMS.conductivity },
    ramanForm: { ...DEFAULT_FORMS.raman },
    temForm: { ...DEFAULT_FORMS.tem },
    particleSizeForm: { ...DEFAULT_FORMS.particleSize },
    xrdForm: { ...DEFAULT_FORMS.xrd },
    xpsForm: { ...DEFAULT_FORMS.xps },
    combineForm: { ...DEFAULT_FORMS.combine },
    updateReportForm: { ...DEFAULT_FORMS.updateReport },
    semReportForm: { ...DEFAULT_FORMS.semReport },
    compoundBatchForm: { ...DEFAULT_FORMS.compoundBatch },
    shipmentForm: { ...DEFAULT_FORMS.shipment },
    micronizationForm: { ...DEFAULT_FORMS.micronization },
    mcbForm: { ...DEFAULT_FORMS.mcb },
    userForm: { ...DEFAULT_FORMS.user },

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
    
    // Species filter
    grapheneSpeciesFilter: 'all',

    // Tested filters (multi-select)
    grapheneTestedFilters: [],
    
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
    testingLabs: ['Fraunhofer-Institut', 'Clariant', 'NEI', 'SpectraPower', 'GEIC'],
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
    
    // Data Page System
    showDataPage: false,
    currentDataPage: null,
    dataPageData: null,
    dataPageLoading: false,
    dataPageError: null,
    
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
      
      // Testing infrastructure initialized - reduced logging
    },

    // Data Page System Methods
    setupDataPageRouting() {
      // Listen for route changes
      window.routerService.addRouteChangeListener((route, previousRoute) => {
        this.handleRouteChange(route, previousRoute);
      });
      
      // Handle initial route
      const currentRoute = window.routerService.getCurrentRoute();
      if (currentRoute && currentRoute.isDataPage) {
        this.handleRouteChange(currentRoute, null);
      }
      
      // Data page routing initialized - reduced logging
    },

    async handleRouteChange(route, previousRoute) {
      // Route changed - reduced logging
      window.logger?.debug('Route changed in handleRouteChange', { type: route.type, isDataPage: route.isDataPage });
      
      if (route.isDataPage) {
        // Check authentication before showing data page
        if (!this.isAuthenticated) {
          console.log('⚠️ Attempted to access data page without authentication, ignoring route');
          return;
        }
        
        // Show data page
        this.showDataPage = true;
        this.activeTab = 'data-page'; // Set a special tab for data pages
        await this.loadDataPage(route.type, route.identifier);
      } else {
        // Hide data page and return to normal tabs
        this.showDataPage = false;
        if (this.activeTab === 'data-page') {
          this.activeTab = 'dashboard'; // Default back to dashboard
        }
      }
    },

    async loadDataPage(type, identifier) {
      console.log(`🔍 Loading data page: ${type}/${identifier}`);
      
      // Check if user is authenticated first
      if (!this.isAuthenticated) {
        console.log('⚠️ User not authenticated, redirecting to login');
        this.showDataPage = false;
        this.activeTab = 'dashboard';
        return;
      }
      
      this.dataPageLoading = true;
      this.dataPageError = null;
      this.currentDataPage = { type, identifier };
      
      try {
        let data = null;
        
        // Load data from existing app data instead of API
        if (type === 'compound-batch') {
          // Ensure compound batches are loaded
          if (!this.compoundBatchRecords || this.compoundBatchRecords.length === 0) {
            console.log('⏳ Compound batches not loaded yet, loading now...');
            await this.loadCompoundBatches();
          }
          
          console.log('🔍 Available compound batches:', this.compoundBatchRecords.map(b => b.batchNumber));
          
          // Find compound batch in existing data
          const batch = this.compoundBatchRecords.find(b => b.batchNumber === identifier);
          if (!batch) {
            throw new Error(`Compound batch ${identifier} not found in ${this.compoundBatchRecords.length} available batches: ${this.compoundBatchRecords.map(b => b.batchNumber).join(', ')}`);
          }
          
          // Get related data using existing API methods
          console.log(`🔍 Loading related data for batch ID: ${batch.id}, batch number: ${batch.batchNumber}`);
          const relatedData = await API.compoundBatch.getRelated(batch.id);
          const micronizations = await API.micronization.getByCompoundBatch(batch.batchNumber);
          
          console.log('📊 Related data received:', {
            constituents: relatedData?.constituents?.length || 0,
            micronizations: micronizations?.length || 0,
            shipments: relatedData?.shipments?.length || 0,
            betTests: relatedData?.betTests?.length || 0,
            relatedDataKeys: Object.keys(relatedData || {}),
            fullRelatedData: relatedData
          });
          
          // Combine all data
          data = {
            ...batch,
            constituents: relatedData.compoundBatch?.experiments || [],
            micronizations: micronizations || [],
            shipments: relatedData.shipments || [],
            betTests: relatedData.betTests || [],
            conductivityTests: relatedData.conductivityTests || [],
            ramanTests: relatedData.ramanTests || [],
            temTests: relatedData.temTests || [],
            semReports: relatedData.semReports || [],
            updateReports: relatedData.updateReports || []
          };
        } else if (type === 'graphene') {
          // Find graphene experiment in existing data
          const experiment = this.grapheneRecords.find(e => e.experimentNumber === identifier);
          if (!experiment) {
            throw new Error(`Graphene experiment ${identifier} not found`);
          }

          // Fetch related data to get biochar information
          const relatedData = await API.graphene.getRelated(identifier);

          // Merge the related data with the experiment data
          data = {
            ...experiment,
            sourceBiochar: relatedData.sourceBiochar,
            lotBiocharExperiments: relatedData.lotBiocharExperiments,
            betTests: relatedData.betTests || [],
            conductivityTests: relatedData.conductivityTests || [],
            ramanTests: relatedData.ramanTests || [],
            temTests: relatedData.temTests || [],
            semReports: relatedData.semReports || [],
            updateReports: relatedData.updateReports || [],
            shipments: relatedData.shipments || [],
            compoundBatches: relatedData.compoundBatches || []
          };
        } else if (type === 'biochar') {
          // Find biochar experiment in existing data
          const experiment = this.biocharRecords.find(e => e.experimentNumber === identifier);
          if (!experiment) {
            throw new Error(`Biochar experiment ${identifier} not found`);
          }
          data = experiment;
        } else if (type === 'micronization') {
          // Find micronization in existing data
          const micronization = this.micronizations.find(m => m.micronizationNumber === identifier);
          if (!micronization) {
            throw new Error(`Micronization ${identifier} not found`);
          }
          data = micronization;
        } else {
          throw new Error(`Unsupported data type: ${type}`);
        }
        
        this.dataPageData = data;
        // Data page loaded successfully - reduced logging
        window.logger?.success(`Data page loaded: ${type}/${identifier}`);
        
      } catch (error) {
        console.error('❌ Failed to load data page:', error);
        this.dataPageError = error.message;
        this.dataPageData = null;
      } finally {
        this.dataPageLoading = false;
      }
    },

    getDataPageHtml() {
      if (!this.showDataPage || !this.currentDataPage) {
        return '';
      }

      if (this.dataPageLoading) {
        return window.createDataPageLoading(this.currentDataPage.type, this.currentDataPage.identifier);
      }

      if (this.dataPageError) {
        return window.createDataPageError('Failed to Load Data', this.dataPageError);
      }

      if (!this.dataPageData) {
        return window.createDataPageError('No Data Available', 'The requested data could not be found.');
      }

      // Get sections configuration based on data type
      const sections = this.getDataPageSections(this.currentDataPage.type);
      
      return window.createDataPageLayout({
        type: this.currentDataPage.type,
        identifier: this.currentDataPage.identifier,
        data: this.dataPageData,
        sections: sections,
        actions: this.getDataPageActions(this.currentDataPage.type, this.dataPageData)
      });
    },

    getDataPageSections(type) {
      const sectionConfigs = {
        graphene: [
          { id: 'process', title: 'Process Details', component: 'ProcessSection', visible: true },
          { id: 'source', title: 'Source Materials', component: 'SourceSection', visible: true },
          { id: 'tests', title: 'Test Results', component: 'TestSection', visible: true },
          { id: 'reports', title: 'Reports & Documentation', component: 'ReportsSection', visible: true },
          { id: 'shipments', title: 'Shipments', component: 'ShipmentsSection', visible: true },
          { id: 'related', title: 'Compound Batches', component: 'RelatedSection', visible: true }
        ],
        biochar: [
          { id: 'process', title: 'Process Parameters', component: 'ProcessSection', visible: true },
          { id: 'materials', title: 'Source Materials', component: 'MaterialsSection', visible: true },
          { id: 'properties', title: 'Output & Finishing', component: 'PropertiesSection', visible: true },
          { id: 'downstream', title: 'Downstream Usage', component: 'DownstreamSection', visible: true }
        ],
        'compound-batch': [
          { id: 'process', title: 'Batch Details', component: 'ProcessSection', visible: true },
          { id: 'constituents', title: 'Constituent Experiments', component: 'ConstituentsSection', visible: true },
          { id: 'tests', title: 'Test Results', component: 'TestSection', visible: true },
          { id: 'micronizations', title: 'Micronizations', component: 'MicronizationsSection', visible: true },
          { id: 'shipments', title: 'Shipments', component: 'ShipmentsSection', visible: true },
          { id: 'reports', title: 'Reports & Documents', component: 'ReportsSection', visible: true }
        ],
        micronization: [
          { id: 'source', title: 'Source Compound Batch', component: 'SourceSection', visible: true },
          { id: 'process', title: 'Processing Parameters', component: 'ProcessSection', visible: true },
          { id: 'tests', title: 'Quality Tests', component: 'TestSection', visible: true },
          { id: 'shipments', title: 'Output Tracking', component: 'ShipmentsSection', visible: true }
        ],
        shipment: [
          { id: 'details', title: 'Shipment Details', component: 'DetailsSection', visible: true },
          { id: 'source', title: 'Source Materials', component: 'SourceSection', visible: true },
          { id: 'tracking', title: 'Tracking Information', component: 'TrackingSection', visible: true }
        ]
      };

      return sectionConfigs[type] || [];
    },

    getDataPageActions(type, data) {
      const identifier = data.experimentNumber || data.batchNumber || data.shipmentNumber;

      // Third Party users get no edit/duplicate actions
      if (this.isThirdParty()) {
        return {
          export: `exportDataRecord('${type}', '${identifier}')`
        };
      }

      return {
        edit: `editDataRecord('${type}', '${identifier}')`,
        export: `exportDataRecord('${type}', '${identifier}')`,
        duplicate: `duplicateDataRecord('${type}', '${identifier}')`
      };
    },

    // Data page helper methods for Alpine.js templates
    getDataPageHeader() {
      if (!this.currentDataPage || !this.dataPageData) {
        return '';
      }

      const breadcrumbs = window.routerService.getBreadcrumbs();
      
      return window.createDataPageHeader({
        type: this.currentDataPage.type,
        identifier: this.currentDataPage.identifier,
        data: this.dataPageData,
        breadcrumbs: breadcrumbs,
        actions: this.getDataPageActions(this.currentDataPage.type, this.dataPageData)
      });
    },

    getDataPageSummary() {
      if (!this.currentDataPage || !this.dataPageData) {
        return '';
      }

      return window.createDataPageSummary({
        type: this.currentDataPage.type,
        data: this.dataPageData
      });
    },

    getDataPageNavigation() {
      // For now, return empty - we'll implement section navigation later if needed
      return '';
    },

    getDataPageSectionContent(sectionId, component) {
      if (!this.currentDataPage || !this.dataPageData) {
        return '';
      }

      return window.getSectionContent(sectionId, this.dataPageData, this.currentDataPage.type);
    },

    getDataPageFooter() {
      if (!this.currentDataPage || !this.dataPageData) {
        return '';
      }

      const auditData = this.dataPageData.auditTrail || {};
      const createdDate = auditData.createdAt || this.dataPageData.createdDate || this.dataPageData.experimentDate;
      const updatedDate = auditData.updatedAt || this.dataPageData.updatedDate;

      return `
        <div class="data-page-footer mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
          <div class="flex justify-between items-center">
            <div>
              ${createdDate ? `Created: ${window.formatDateSafe(createdDate)}` : ''}
              ${updatedDate ? ` • Updated: ${window.formatDateSafe(updatedDate)}` : ''}
            </div>
            <div>
              <button onclick="window.routerService.goBack()" 
                      class="text-blue-600 hover:text-blue-800">
                ← Back
              </button>
            </div>
          </div>
        </div>
      `;
    },
    
    validateApplicationState() {
      const requiredStateProperties = [
        'biocharRecords', 'grapheneRecords', 'betRecords', 'conductivityRecords',
        'ramanRecords', 'temRecords', 'particleSizeRecords', 'xrdRecords', 'xpsRecords',
        'updateReports', 'semReports', 'compoundBatches', 'shipments', 'micronizations'
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
        // Application state validation passed - reduced logging
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
      
      // API Health Check completed - reduced logging
      window.logger?.debug('API Health Check completed', { 
        endpoints: Object.keys(results).length,
        errors: Object.values(results).filter(r => r.status === 'error').length
      });
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

      // Setup data page routing
      this.setupDataPageRouting();

      // Listen for auth:login event to update currentUser
      window.addEventListener('auth:login', (event) => {
        console.log('[Auth] Login event received, updating currentUser');
        this.currentUser = event.detail.user;
        this.enforceThirdPartyRestrictions();
      });

      // Initialize currentUser from authService
      this.updateCurrentUser();

      // Load dashboard data first if dashboard is active (and user can see it)
      if (this.activeTab === 'dashboard' && !this.isThirdParty()) {
        await this.loadDashboardData();
      }

      await Promise.all([
        this.loadBiocharRecords(),
        this.loadGrapheneRecords(),
        this.loadBetRecords(),
        this.loadConductivityRecords(),
        this.loadRamanRecords(),
        this.loadTemRecords(),
        this.loadParticleSizeRecords(),
        this.loadXRDRecords(),
        this.loadXPSRecords(),
        this.loadUpdateReports(),
        this.loadSemReports(),
        this.loadCompoundBatches(),
        this.loadShipments(),
        this.loadMicronizations(),
        this.loadMCBs(),
        this.loadAvailableMicronizations()
      ]);
      this.loadDropdownOptions();
      this.loadSystemTags();

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
        // Build query parameters
        const params = new URLSearchParams();

        if (this.grapheneSearch) {
          params.append('search', this.grapheneSearch);
        }

        if (this.grapheneSpeciesFilter) {
          params.append('species', this.grapheneSpeciesFilter);
        }

        // Add tested filters if any selected
        if (this.grapheneTestedFilters && this.grapheneTestedFilters.length > 0) {
          this.grapheneTestedFilters.forEach(testType => {
            params.append('tested[]', testType);
          });
        }

        params.append('limit', '500'); // Request all records

        const response = await fetch(`/api/graphene?${params}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Handle both old format (direct array) and new format (with metadata)
        if (result.success !== undefined) {
          // New format with metadata
          this.grapheneRecords = result.data || [];
        } else {
          // Old format - direct array
          this.grapheneRecords = Array.isArray(result) ? result : [];
        }

        this.applySortingToGraphene();
        this.loadAvailableGrapheneSamples();
      } catch (error) {
        console.error('Failed to load graphene records:', error);
        this.grapheneRecords = [];
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

    async loadParticleSizeRecords() {
      try {
        this.particleSizeRecords = await API.particleSize.getAll(this.particleSizeSearch);
      } catch (error) {
        console.error('Failed to load Particle Size records:', error);
        this.particleSizeRecords = [];
      }
    },

    async loadXRDRecords() {
      try {
        this.xrdRecords = await API.xrd.getAll(this.xrdSearch);
      } catch (error) {
        console.error('Failed to load XRD records:', error);
        this.xrdRecords = [];
      }
    },

    async loadXPSRecords() {
      try {
        this.xpsRecords = await API.xps.getAll(this.xpsSearch);
      } catch (error) {
        console.error('Failed to load XPS records:', error);
        this.xpsRecords = [];
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

    async loadMCBs() {
      try {
        console.log('[loadMCBs] Starting MCB load...');
        const data = await API.mcb.getAll(this.mcbSearch);
        console.log('[loadMCBs] Received MCB data:', data);
        console.log('[loadMCBs] Number of MCBs:', data?.length);
        this.mcbs = data;
        console.log('[loadMCBs] Set this.mcbs to:', this.mcbs);
      } catch (error) {
        console.error('[loadMCBs] Failed to load MCBs:', error);
        this.mcbs = [];
      }
    },

    async loadAvailableMicronizations() {
      try {
        this.availableMicronizations = await API.mcb.getAvailableMicronizations();
      } catch (error) {
        console.error('Failed to load available micronizations:', error);
        this.availableMicronizations = [];
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

    // Toggle tested filter selection (multi-select)
    toggleTestedFilter(testType) {
      const index = this.grapheneTestedFilters.indexOf(testType);
      if (index > -1) {
        // Remove if already selected - create new array to trigger Alpine reactivity
        this.grapheneTestedFilters = this.grapheneTestedFilters.filter(t => t !== testType);
      } else {
        // Add if not selected - create new array to trigger Alpine reactivity
        this.grapheneTestedFilters = [...this.grapheneTestedFilters, testType];
      }
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
        
        // Special handling for date column
        if (this.grapheneSortColumn === 'experimentDate') {
          // Check for null/undefined/empty values
          const aIsEmpty = !aVal || aVal === '' || aVal === 'null' || aVal === '0';
          const bIsEmpty = !bVal || bVal === '' || bVal === 'null' || bVal === '0';
          
          // Both empty - maintain current order
          if (aIsEmpty && bIsEmpty) return 0;
          // Always sort empty dates to the end regardless of sort direction
          if (aIsEmpty) return 1;
          if (bIsEmpty) return -1;
          
          // Check for invalid dates (1969-1970)
          const aDate = new Date(aVal);
          const bDate = new Date(bVal);
          const aIsInvalid = isNaN(aDate.getTime()) || aDate.getFullYear() <= 1970;
          const bIsInvalid = isNaN(bDate.getTime()) || bDate.getFullYear() <= 1970;
          
          // Both invalid - maintain current order
          if (aIsInvalid && bIsInvalid) return 0;
          // Always sort invalid dates to the end
          if (aIsInvalid) return 1;
          if (bIsInvalid) return -1;
          
          // Both are valid dates - sort normally
          aVal = aDate;
          bVal = bDate;
        } else {
          // Handle null/undefined values for non-date columns
          if (aVal == null && bVal == null) return 0;
          if (aVal == null) return 1;
          if (bVal == null) return -1;
        }
        
        // Convert to appropriate types for comparison
        if (this.grapheneSortColumn === 'experimentDate') {
          // Already converted to Date objects above
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

    get filteredIndividualMicronizations() {
      // Only return micronizations that are NOT part of an MCB
      const searchLower = this.micronizationSearch.toLowerCase();
      if (!searchLower) {
        return this.micronizations;
      }

      return this.micronizations.filter(m => {
        return (m.micronizationNumber && m.micronizationNumber.toLowerCase().includes(searchLower)) ||
               (m.sku && m.sku.toLowerCase().includes(searchLower)) ||
               (m.grapheneSample && m.grapheneSample.toLowerCase().includes(searchLower)) ||
               (m.compoundBatchNumber && m.compoundBatchNumber.toLowerCase().includes(searchLower)) ||
               (m.dx50 && m.dx50.toLowerCase().includes(searchLower)) ||
               (m.micronizationLocation && m.micronizationLocation.toLowerCase().includes(searchLower));
      });
    },

    get filteredMCBs() {
      const searchLower = this.micronizationSearch.toLowerCase();
      if (!searchLower) {
        return this.mcbs;
      }

      return this.mcbs.filter(mcb => {
        return (mcb.mcbNumber && mcb.mcbNumber.toLowerCase().includes(searchLower)) ||
               (mcb.mcbName && mcb.mcbName.toLowerCase().includes(searchLower)) ||
               (mcb.sku && mcb.sku.toLowerCase().includes(searchLower)) ||
               (mcb.mcbLocation && mcb.mcbLocation.toLowerCase().includes(searchLower));
      });
    },

    // Legacy getter for backward compatibility (used by old combined table view)
    get filteredMicronizations() {
      // Return individual micronizations by default
      return this.filteredIndividualMicronizations;
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

    // Particle Size CRUD operations - Delegated to CRUDService
    editParticleSize(record) {
      CRUDService.editParticleSize(record, this);
    },

    async saveParticleSize() {
      await CRUDService.saveParticleSize(this);
    },

    async deleteParticleSize(id) {
      await CRUDService.deleteParticleSize(id, this);
    },

    closeParticleSizeForm() {
      CRUDService.closeParticleSizeForm(this);
    },

    // XRD CRUD operations - Delegated to CRUDService
    editXRD(record) {
      CRUDService.editXRD(record, this);
    },

    async saveXRD() {
      await CRUDService.saveXRD(this);
    },

    async deleteXRD(id) {
      await CRUDService.deleteXRD(id, this);
    },

    // XPS CRUD operations - Delegated to CRUDService
    editXPS(record) {
      CRUDService.editXPS(record, this);
    },

    async saveXPS() {
      await CRUDService.saveXPS(this);
    },

    async deleteXPS(id) {
      await CRUDService.deleteXPS(id, this);
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

    // MCB CRUD operations - Delegated to CRUDService
    async openMCBForm(mcb = null) {
      await CRUDService.openMCBForm(mcb, this);
    },

    async saveMCB() {
      await CRUDService.saveMCB(this);
    },

    async deleteMCB(id) {
      await CRUDService.deleteMCB(id, this);
    },

    duplicateMCB(mcb) {
      CRUDService.duplicateMCB(mcb, this);
    },

    closeMCBForm() {
      CRUDService.closeMCBForm(this);
    },

    searchMCBs() {
      this.loadMCBs();
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
      } else if (type === 'particle-size' || type === 'test-particle-size') {
        API.particleSize.exportCSV();
      } else if (type === 'xrd' || type === 'test-xrd') {
        API.xrd.exportCSV();
      } else if (type === 'xps' || type === 'test-xps') {
        API.xps.exportCSV();
      } else if (type === 'compound-batches') {
        API.compoundBatch.exportCSV();
      } else if (type === 'shipments') {
        API.shipment.exportCSV();
      } else if (type === 'micronization') {
        API.micronization.exportCSV();
      } else if (type === 'mcb') {
        API.mcb.exportCSV();
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
        console.log('📋 SEM Report - Processing path [v2]:', semReportPath);
        
        // Handle both Cloudinary URLs and local paths
        if (semReportPath.startsWith('https://') || semReportPath.startsWith('http://')) {
          // Cloudinary URL - use as-is without viewer parameters
          this.currentSemPdf = semReportPath;
          console.log('✅ SEM Report - Using Cloudinary URL as-is:', this.currentSemPdf);
        } else {
          // Local path - add /uploads prefix and viewer parameters
          this.currentSemPdf = '/uploads/' + semReportPath + '#navpanes=0&toolbar=0';
          console.log('📁 SEM Report - Using local path:', this.currentSemPdf);
        }
        
        this.showSemModal = true;
      }
    },
    
    closeSemModal() {
      this.showSemModal = false;
      this.currentSemPdf = null;
    },

    viewRamanPdf(ramanReportPath) {
      if (ramanReportPath) {
        // Handle both Cloudinary URLs and local paths
        if (ramanReportPath.startsWith('https://')) {
          this.currentRamanPdf = ramanReportPath; // Cloudinary URL - use as is
        } else {
          this.currentRamanPdf = '/uploads/' + ramanReportPath + '#navpanes=0&toolbar=0'; // Local path
        }
        this.showRamanModal = true;
      }
    },

    closeRamanModal() {
      this.showRamanModal = false;
      this.currentRamanPdf = null;
    },

    viewTemPdf(temReportPath) {
      if (temReportPath) {
        // Handle both Cloudinary URLs and local paths
        if (temReportPath.startsWith('https://')) {
          this.currentTemPdf = temReportPath; // Cloudinary URL - use as is
        } else {
          this.currentTemPdf = '/uploads/' + temReportPath + '#navpanes=0&toolbar=0'; // Local path
        }
        this.showTemModal = true;
      }
    },

    closeTemModal() {
      this.showTemModal = false;
      this.currentTemPdf = null;
    },

    viewParticleSizePdf(particleSizeReportPath) {
      if (particleSizeReportPath) {
        // Handle both Cloudinary URLs and local paths
        if (particleSizeReportPath.startsWith('https://')) {
          this.currentParticleSizePdf = particleSizeReportPath; // Cloudinary URL - use as is
        } else {
          this.currentParticleSizePdf = '/uploads/' + particleSizeReportPath + '#navpanes=0&toolbar=0'; // Local path
        }
        this.showParticleSizeModal = true;
      }
    },

    closeParticleSizeModal() {
      this.showParticleSizeModal = false;
      this.currentParticleSizePdf = null;
    },

    viewBetPdf(betReportPath) {
      if (betReportPath) {
        // Handle both Cloudinary URLs and local paths
        if (betReportPath.startsWith('https://')) {
          this.currentBetPdf = betReportPath; // Cloudinary URL - use as is
        } else {
          this.currentBetPdf = '/uploads/' + betReportPath + '#navpanes=0&toolbar=0'; // Local path
        }
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

    initParticleSizeForm() {
      this.particleSizeForm = { ...DEFAULT_FORMS.particleSize };
      this.editingParticleSize = null;
      this.showAddParticleSize = true;
    },

    initXRDForm() {
      CRUDService.initXRDForm(this);
    },

    initXPSForm() {
      CRUDService.initXPSForm(this);
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

    // Multi-file upload field HTML generation using helpers
    getMultiFileFieldHtml(config) {
      return fileFieldHelpers.createMultiFileUploadField(config);
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
      console.log('Opening PDF Modal - URL:', pdfUrl, 'Title:', pdfTitle);
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

    getMCBModalHtml() {
      return getMCBModalHtml();
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
        console.error('Failed to load analysis chart data:', error);
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

    // Load characterization comparison data
    async loadCharacterizationData(testType = null) {
      this.characterizationLoading = true;
      this.characterizationError = null;

      const test = testType || this.selectedCharacterizationTest;

      try {
        const response = await fetch(`/api/analysis/characterization-comparison?testType=${test}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        this.characterizationData = result.data;

        // Initialize chart after data is loaded
        await this.$nextTick();
        this.initializeCharacterizationChart();
      } catch (error) {
        console.error('Failed to load characterization data:', error);
        this.characterizationError = 'Failed to load characterization comparison data.';
      } finally {
        this.characterizationLoading = false;
      }
    },

    // Initialize characterization comparison chart
    initializeCharacterizationChart() {
      // Wait for DOM to be fully ready
      setTimeout(() => {
        try {
          const ctx = document.getElementById('characterizationChart');

          // Detailed logging for debugging
          console.log('Chart initialization:', {
            canvasFound: !!ctx,
            hasData: !!this.characterizationData,
            hasSources: !!this.characterizationData?.sources,
            sourceCount: this.characterizationData?.sources ? Object.keys(this.characterizationData.sources).length : 0
          });

          if (!ctx) {
            console.error('Canvas element not found in DOM');
            return;
          }

          if (!this.characterizationData?.sources) {
            console.log('No characterization data available yet');
            return;
          }

          // Check if canvas has valid context
          const testContext = ctx.getContext('2d');
          if (!testContext) {
            console.error('Cannot get 2D context from canvas');
            return;
          }

          // Destroy existing chart if it exists
          if (this.characterizationChart) {
            console.log('Destroying existing chart');
            try {
              // Stop the chart's animations before destroying
              this.characterizationChart.stop();
              this.characterizationChart.destroy();
            } catch (destroyError) {
              console.warn('Error destroying chart:', destroyError);
            }
            this.characterizationChart = null;
            this.characterizationChartInitialized = false;
          }

          // Prepare data for chart
          const sources = this.characterizationData.sources;
          const labels = [];
          const values = [];
          const backgroundColors = [];
          const borderColors = [];

          // Define custom ordering for sources
          const getSourceOrder = (key, source) => {
            const sourceName = (source.source || '').toLowerCase();

            // Priority order: Dr Li (1), Curia (2), GEIC (3), ISO/ASTM (4), Others (5)
            if (sourceName.includes('dr') && sourceName.includes('li')) return 1;
            if (sourceName.includes('curia') || key.includes('curia')) return 2;
            if (sourceName.includes('geic')) return 3;
            if (sourceName.includes('iso') || sourceName.includes('astm')) return 4;
            return 5; // Others go last
          };

          // Sort sources by custom order
          const sortedSources = Object.entries(sources).sort(([keyA, sourceA], [keyB, sourceB]) => {
            const orderA = getSourceOrder(keyA, sourceA);
            const orderB = getSourceOrder(keyB, sourceB);

            if (orderA !== orderB) return orderA - orderB;

            // If same priority, sort alphabetically by source name
            const nameA = sourceA.source || keyA;
            const nameB = sourceB.source || keyB;
            return nameA.localeCompare(nameB);
          });

          // Process each source in sorted order
          sortedSources.forEach(([key, source]) => {
            // Create label
            const label = source.source || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            labels.push(label);

            // Get value (handle ranges)
            let value = null;
            if (source.isRange && source.minValue !== null && source.maxValue !== null) {
              // For ranges, show the average
              value = (parseFloat(source.minValue) + parseFloat(source.maxValue)) / 2;
            } else if (source.value !== null) {
              value = parseFloat(source.value);
            }
            values.push(value);

            // Set colors based on source type and specific source names
            let bgColor, borderColor;
            const sourceName = (source.source || '').toLowerCase();

            // Check for specific source names first
            if (sourceName.includes('curia') || key.includes('curia')) {
              bgColor = 'rgba(88, 28, 135, 0.8)';  // Dark purple for Curia
              borderColor = 'rgba(88, 28, 135, 1)';
            } else if (sourceName.includes('geic')) {
              bgColor = 'rgba(0, 0, 0, 0.8)';  // Black for GEIC
              borderColor = 'rgba(0, 0, 0, 1)';
            } else if (source.type === 'system') {
              bgColor = 'rgba(0, 0, 0, 0.8)';  // Black for system data
              borderColor = 'rgba(0, 0, 0, 1)';
            } else if (source.sourceType === 'academic') {
              bgColor = 'rgba(184, 115, 51, 0.8)';  // Copper for academic
              borderColor = 'rgba(184, 115, 51, 1)';
            } else if (source.sourceType === 'standard') {
              bgColor = 'rgba(156, 163, 175, 0.8)';  // Gray for standards
              borderColor = 'rgba(156, 163, 175, 1)';
            } else if (source.sourceType === 'external_lab') {
              bgColor = 'rgba(107, 114, 128, 0.8)';  // Dark gray for external lab
              borderColor = 'rgba(107, 114, 128, 1)';
            } else {
              bgColor = 'rgba(75, 85, 99, 0.8)';  // Medium gray for others
              borderColor = 'rgba(75, 85, 99, 1)';
            }
            backgroundColors.push(bgColor);
            borderColors.push(borderColor);
          });

          // Create chart
          this.characterizationChart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: labels,
              datasets: [{
                label: this.selectedCharacterizationTest,
                data: values,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
                borderRadius: 3, // Very slight rounded edges
                borderSkipped: false
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              animation: false, // Disable animations to prevent canvas access errors
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const source = Object.values(sources)[context.dataIndex];
                      const lines = [];

                      // Value line
                      if (source.isRange) {
                        lines.push(`Range: ${source.minValue} - ${source.maxValue} ${source.unit || ''}`);
                      } else if (context.parsed.y !== null) {
                        lines.push(`Value: ${context.parsed.y} ${source.unit || ''}`);
                      } else if (source.valueString) {
                        lines.push(`Value: ${source.valueString}`);
                      }

                      // Type line
                      lines.push(`Type: ${source.type === 'system' ? 'System Data' : source.sourceType}`);

                      // Sample ID if available
                      if (source.sampleId) {
                        lines.push(`Sample: ${source.sampleId}`);
                      }

                      // Conditions if available
                      if (source.conditions && Object.keys(source.conditions).length > 0) {
                        Object.entries(source.conditions).forEach(([key, value]) => {
                          if (value) lines.push(`${key}: ${value}`);
                        });
                      }

                      // Notes if available
                      if (source.notes) {
                        lines.push(`Notes: ${source.notes}`);
                      }

                      return lines;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: sources[Object.keys(sources)[0]]?.unit || 'Value'
                  }
                },
                x: {
                  ticks: {
                    autoSkip: false,
                    maxRotation: 45,
                    minRotation: 45
                  }
                }
              }
            }
          });

          // Mark as initialized
          this.characterizationChartInitialized = true;
          console.log('Chart successfully initialized');

        } catch (error) {
          console.error('Error initializing characterization chart:', error);
          console.error('Error stack:', error.stack);
          this.characterizationChartInitialized = false;
        }
      }, 300); // Increased delay to ensure DOM is stable
    },

    // Load all characterization references
    async loadCharacterizationReferences() {
      try {
        const response = await fetch('/api/analysis/characterization-references');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        this.characterizationReferences = result.data;
      } catch (error) {
        console.error('Failed to load characterization references:', error);
      }
    },

    // Save characterization reference
    async saveCharacterizationReference() {
      try {
        const formData = { ...this.characterizationForm };

        // Clean up data based on isRange
        if (formData.isRange) {
          formData.value = null;
          formData.valueString = null;
        } else {
          formData.minValue = null;
          formData.maxValue = null;
        }

        const response = await fetch('/api/analysis/characterization-references', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Reload data
        await this.loadCharacterizationReferences();
        await this.loadCharacterizationData();

        // Close modal and reset form
        this.showCharacterizationModal = false;
        this.resetCharacterizationForm();

      } catch (error) {
        console.error('Failed to save characterization reference:', error);
        alert('Failed to save reference data. Please try again.');
      }
    },

    // Delete characterization reference
    async deleteCharacterizationReference(id) {
      if (!confirm('Are you sure you want to delete this reference?')) return;

      try {
        const response = await fetch(`/api/analysis/characterization-references/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Reload data
        await this.loadCharacterizationReferences();
        await this.loadCharacterizationData();

      } catch (error) {
        console.error('Failed to delete characterization reference:', error);
        alert('Failed to delete reference. Please try again.');
      }
    },

    // Reset characterization form
    resetCharacterizationForm() {
      this.characterizationForm = {
        source: '',
        sourceType: 'academic',
        testType: 'BET',
        value: '',
        valueString: '',
        unit: 'm²/g',
        isRange: false,
        minValue: '',
        maxValue: '',
        conditions: {},
        testDate: null,
        notes: ''
      };
    },

    // Update characterization test type
    async selectCharacterizationTest(testType) {
      this.selectedCharacterizationTest = testType;

      // Update form defaults based on test type
      if (testType === 'BET') {
        this.characterizationForm.unit = 'm²/g';
      } else if (testType === 'Conductivity') {
        this.characterizationForm.unit = 'S/cm';
      } else if (testType === 'RAMAN') {
        this.characterizationForm.unit = 'D/G Ratio';
      }

      await this.loadCharacterizationData(testType);
    },

    // Get sorted characterization sources with percentage calculations
    getSortedCharacterizationSources() {
      if (!this.characterizationData?.sources) return [];

      const entries = Object.entries(this.characterizationData.sources);

      // Calculate numeric values and find highest/lowest
      const sourcesWithValues = entries.map(([key, source]) => {
        let numericValue = null;
        if (source.isRange && source.minValue !== null && source.maxValue !== null) {
          numericValue = (parseFloat(source.minValue) + parseFloat(source.maxValue)) / 2;
        } else if (source.value !== null) {
          numericValue = parseFloat(source.value);
        }
        return { key, source, numericValue };
      });

      // Find highest and lowest values
      const validValues = sourcesWithValues.filter(s => s.numericValue !== null).map(s => s.numericValue);
      const highest = validValues.length > 0 ? Math.max(...validValues) : null;
      const lowest = validValues.length > 0 ? Math.min(...validValues) : null;

      // Determine if lower is better (for RAMAN D/G ratio)
      const lowerIsBetter = this.selectedCharacterizationTest === 'RAMAN';

      // Add percentage calculations
      const sourcesWithPercentages = sourcesWithValues.map(item => {
        let percentChange = null;
        if (item.numericValue !== null && highest !== null && lowest !== null) {
          const reference = lowerIsBetter ? lowest : highest;
          if (reference !== 0) {
            percentChange = ((item.numericValue - reference) / reference) * 100;
          }
        }
        return { ...item, percentChange };
      });

      // Sort by numeric value
      const sorted = sourcesWithPercentages.sort((a, b) => {
        if (a.numericValue === null) return 1;
        if (b.numericValue === null) return -1;
        return this.characterizationSortOrder === 'desc'
          ? b.numericValue - a.numericValue
          : a.numericValue - b.numericValue;
      });

      return sorted;
    },

    // Toggle sort order
    toggleCharacterizationSort() {
      this.characterizationSortOrder = this.characterizationSortOrder === 'desc' ? 'asc' : 'desc';
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
      const timestamp = new Date().toISOString();
      const previousTab = this.activeTab;
      const user = window.authService?.getCurrentUser();
      
      // Log navigation with debug level only
      window.logger?.navigation(`switchTab: ${previousTab} -> ${tab}`, {
        user: user?.username || 'unknown',
        isDataPage: window.routerService?.isOnDataPage() || false
      });
      
      try {
        this.activeTab = tab;
        this.autoExpandParentGroup(tab);
        
        // Reset data page visibility for normal tab navigation
        if (previousTab === 'data-page' || this.showDataPage) {
          this.showDataPage = false;
          // showDataPage reset - reduced logging
        }
        
        // Reset RouterService to normal navigation mode for tab switching
        if (window.routerService && window.routerService.isOnDataPage()) {
          console.log(`[Navigation] Clearing data page state for normal tab navigation`);
          // Force RouterService to recognize this as normal tab navigation
          window.routerService.currentRoute = { 
            type: tab, 
            identifier: null, 
            isDataPage: false,
            fullPath: tab === 'dashboard' ? '' : tab,
            params: {}
          };
        }
        
        // Use path-based URLs for normal tabs, hash-based only for data pages
        const newPath = tab === 'dashboard' ? '/' : `/${tab}`;
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;
        
        // Always use path-based URLs for normal tab navigation
        const newUrl = `${window.location.origin}${newPath}`;
        
        // Transitioning to path-based URL - reduced logging
        window.logger?.navigation(`URL transition: ${tab}`, { from: currentPath, to: newPath });
        
        // Use replaceState to set the correct path-based URL
        window.history.replaceState(null, '', newUrl);
        // URL updated to path-based - reduced logging
        
        // Handle tab-specific data loading
        if (tab === 'dashboard' && !this.dashboardData.production) {
          // Loading dashboard data - reduced logging
          await this.loadDashboardData();
        } else if (tab === 'analysis') {
          if (!this.analysisData) {
            // Loading analysis data - reduced logging
            await this.loadAnalysisData();
          }
          if (!this.analysisChartData) {
            // Loading analysis chart data - reduced logging
            await this.loadAnalysisChartData();
          }
        } else if (tab === 'ai-insights') {
          if (!this.aiInsightsData) {
            // Loading AI insights data - reduced logging
            await this.loadAIInsightsDashboard();
          }
        } else if (tab === 'tasks') {
          if (!this.tasks.length) {
            await this.loadTasks();
            await this.loadTaskAssignees();
          }
          await this.loadCostsSummary();
          this.$nextTick(() => {
            if (this.taskViewMode === 'kanban') this.initKanbanDragDrop();
          });
        } else if (tab === 'goals') {
          if (!this.goals.length) {
            await this.loadGoals();
            if (!this.taskAssignees.length) await this.loadTaskAssignees();
          }
        } else if (tab === 'pipeline') {
          if (!this.pipelineContacts.length && !this.pipelineBoardContacts.length) {
            await this.loadPipelineContacts();
            await this.loadPipelineBoard();
            await this.loadPipelineOwners();
          }
          this.$nextTick(() => {
            if (this.pipelineViewMode === 'kanban') this.initPipelineKanban();
          });
        } else if (tab === 'proforma') {
          if (!this.proformaScenarios.length) {
            await this.loadProformaScenarios();
          }
        } else if (tab === 'user-management') {
          await this.loadUsers();
        } else if (tab === 'email-admin') {
          await this.loadEmailSettings();
          await this.loadEmailLogs();
        } else if (tab === 'news') {
          console.log(`[Navigation] Initializing news tab: ${tab}`);
          await this.initializeNewsTab();
          // News tab initialized successfully - reduced logging
        } else {
          // No data loading required - reduced logging
        }
        
        // switchTab completed successfully - reduced logging
        
      } catch (error) {
        window.logger?.error(`Navigation error in switchTab(${tab})`, error.message);
        
        // Revert activeTab on error
        this.activeTab = previousTab;
        // Reverted activeTab due to error - reduced logging
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
    },

    // User Management Methods
    async loadUsers() {
      try {
        const response = await API.users.getAll({ search: this.userSearch });
        this.users = response.data.users || [];
      } catch (error) {
        console.error('Error loading users:', error);
        alert('Failed to load users');
      }
    },

    async searchUsers() {
      await this.loadUsers();
    },

    openUserForm() {
      this.editingUser = null;
      this.userForm = { ...DEFAULT_FORMS.user };
      this.showAddUser = true;
    },

    editUser(user) {
      this.editingUser = user;
      this.userForm = {
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        password: '',
        confirmPassword: '',
        role: user.role,
        isActive: user.isActive ? 'true' : 'false',
        changePassword: false
      };
      this.showAddUser = true;
    },

    async saveUser() {
      try {
        // Validate form
        if (!this.userForm.username || !this.userForm.email || !this.userForm.role) {
          alert('Please fill in all required fields');
          return;
        }

        if (!this.editingUser && !this.userForm.password) {
          alert('Password is required for new users');
          return;
        }

        if (this.userForm.password && this.userForm.password !== this.userForm.confirmPassword) {
          alert('Passwords do not match');
          return;
        }

        const userData = {
          username: this.userForm.username,
          email: this.userForm.email,
          firstName: this.userForm.firstName,
          lastName: this.userForm.lastName,
          role: this.userForm.role,
          isActive: this.userForm.isActive === 'true'
        };

        if (this.userForm.password) {
          userData.password = this.userForm.password;
        }

        let response;
        if (this.editingUser) {
          response = await API.users.update(this.editingUser.id, userData);
        } else {
          response = await API.users.create(userData);
        }

        if (response.success) {
          await this.loadUsers();
          this.showAddUser = false;
          this.editingUser = null;
          this.userForm = { ...DEFAULT_FORMS.user };
          alert(this.editingUser ? 'User updated successfully' : 'User created successfully');
        } else {
          alert(response.error || 'Failed to save user');
        }
      } catch (error) {
        console.error('Error saving user:', error);
        alert('Failed to save user');
      }
    },

    async deleteUser(user) {
      if (!confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
        return;
      }

      try {
        const response = await API.users.delete(user.id);
        if (response.success) {
          await this.loadUsers();
          alert('User deleted successfully');
        } else {
          alert(response.error || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    },

    async toggleUserStatus(user) {
      try {
        const response = await API.users.toggleStatus(user.id);
        if (response.success) {
          await this.loadUsers();
          alert(`User ${response.data.user.isActive ? 'activated' : 'deactivated'} successfully`);
        } else {
          alert(response.error || 'Failed to update user status');
        }
      } catch (error) {
        console.error('Error toggling user status:', error);
        alert('Failed to update user status');
      }
    },

    async exportData(type) {
      if (type === 'users') {
        try {
          const csvContent = this.generateUserCSV();
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Error exporting users:', error);
          alert('Failed to export users');
        }
      }
    },

    generateUserCSV() {
      const headers = ['Username', 'Email', 'First Name', 'Last Name', 'Role', 'Status', 'Last Login', 'Created'];
      const rows = this.users.map(user => [
        user.username,
        user.email,
        user.firstName || '',
        user.lastName || '',
        this.getRoleLabel(user.role),
        user.isActive ? 'Active' : 'Inactive',
        user.lastLogin ? window.formatDateSafe(user.lastLogin) : 'Never',
        window.formatDateSafe(user.createdAt)
      ]);

      return [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
    },

    getCurrentUserId() {
      const currentUser = window.authService?.getCurrentUser();
      return currentUser?.id;
    },

    // Initialize user management tab
    async initializeUserManagementTab() {
      if (this.activeTab === 'user-management') {
        await this.loadUsers();
      }
    },

    // Email admin — delegate methods
    async loadEmailSettings() { await emailService.loadEmailSettings(this); },
    async saveEmailSettings() { await emailService.saveEmailSettings(this); },
    async sendTestEmail() { await emailService.sendTestEmail(this); },
    async loadEmailLogs() { await emailService.loadEmailLogs(this); },
    async subscribeUserToEmail(userId) { await emailService.subscribeUser(this, userId); },

    // Email preferences — delegate methods
    async openEmailPrefs() { emailService.openEmailPrefs(this); },
    closeEmailPrefs() { emailService.closeEmailPrefs(this); },
    async saveEmailPreferences() { await emailService.saveEmailPreferences(this); },
    async pauseEmails() { await emailService.pauseEmails(this); },
    async resumeEmails() { await emailService.resumeEmails(this); },

    // Update current user from AuthService
    updateCurrentUser() {
      this.currentUser = window.authService?.getCurrentUser() || null;

      // If no user found, wait for AuthService to finish initialization
      if (!this.currentUser && window.authService) {
        // Keep checking until we get user data or max attempts reached
        let attempts = 0;
        const maxAttempts = 20; // 10 seconds total
        const checkInterval = 500; // Check every 500ms

        const checkForUser = () => {
          attempts++;
          this.currentUser = window.authService?.getCurrentUser() || null;

          if (this.currentUser) {
            // User found - Alpine should automatically update the UI
            // Redirect Third Party users away from restricted tabs
            this.enforceThirdPartyRestrictions();
            return;
          }

          if (attempts < maxAttempts) {
            setTimeout(checkForUser, checkInterval);
          }
        };

        // Start checking
        setTimeout(checkForUser, checkInterval);
      } else if (this.currentUser) {
        // User already loaded - enforce restrictions
        this.enforceThirdPartyRestrictions();
      }
    },

    // ===== SYSTEM TAGS (org-wide tag/institution library) =====
    async loadSystemTags() {
      try {
        const tags = await API.tags.getAll();
        this.systemCategoryTags = tags.filter(t => t.kind === 'CATEGORY').map(t => t.name);
        this.systemInstitutionTags = tags.filter(t => t.kind === 'INSTITUTION').map(t => t.name);
      } catch (error) {
        console.error('Failed to load system tags:', error);
      }
    },
    showAddTagInput(kind) {
      this.addingTagKind = kind;
      this.newTagInput = '';
      this.$nextTick(() => {
        const el = document.querySelector('[data-add-tag-input]');
        if (el) el.focus();
      });
    },
    cancelAddTag() {
      this.addingTagKind = null;
      this.newTagInput = '';
    },
    async submitAddTag(applyToContext) {
      const name = (this.newTagInput || '').trim();
      const kind = this.addingTagKind;
      if (!name || !kind) { this.cancelAddTag(); return; }
      try {
        await API.tags.create(name, kind);
        await this.loadSystemTags();
        // Auto-apply the new tag to whatever context the user was editing
        if (applyToContext === 'taskForm' && !this.taskForm.tags.includes(name)) {
          this.taskForm.tags.push(name);
        } else if (applyToContext === 'taskDetail' && this.selectedTask && !(this.selectedTask.tags || []).includes(name)) {
          await this.toggleDetailTaskTag(name);
        } else if (applyToContext === 'goalForm' && !this.goalForm.tags.includes(name)) {
          this.goalForm.tags.push(name);
        }
      } catch (error) {
        alert(error.message || 'Failed to add tag');
      } finally {
        this.cancelAddTag();
      }
    },
    isSystemTag(tag) {
      return this.systemCategoryTags.includes(tag) || this.systemInstitutionTags.includes(tag);
    },

    // ===== TASK MANAGEMENT METHODS (delegated to TaskService) =====

    async loadTasks() { await taskService.loadTasks(this); },
    async loadTaskAssignees() { await taskService.loadTaskAssignees(this); },
    getTasksByStatus(status) { return this.getFilteredTasks().filter(t => t.status === status); },
    getFilteredTasks() {
      let filtered = this.tasks.filter(t => this.showArchivedTasks || t.status !== 'ARCHIVED');
      if (this.taskSearch) {
        const q = this.taskSearch.toLowerCase();
        filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q));
      }
      if (this.taskFilters.tag) {
        filtered = filtered.filter(t => (t.tags || []).includes(this.taskFilters.tag));
      }
      if (this.taskFilters.institution) {
        filtered = filtered.filter(t => (t.tags || []).includes(this.taskFilters.institution));
      }
      return filtered;
    },
    openTaskForm(parentId = null) { taskService.openTaskForm(this, parentId); },
    openEditTaskForm(task) { taskService.openEditTaskForm(this, task); },
    closeTaskForm() { taskService.closeTaskForm(this); },
    async saveTask() { await taskService.saveTask(this); },
    async deleteTask(taskId) { await taskService.deleteTask(this, taskId); },
    async updateTaskStatus(taskId, newStatus) { await taskService.updateTaskStatus(this, taskId, newStatus); },
    async openTaskDetail(taskId) { await taskService.openTaskDetail(this, taskId); },
    closeTaskDetail() { taskService.closeTaskDetail(this); },
    async addTaskComment() { await taskService.addTaskComment(this); },
    async deleteTaskComment(commentId) { await taskService.deleteTaskComment(this, commentId); },
    async uploadTaskAttachments(files) { await taskService.uploadTaskAttachments(this, files); },
    async deleteTaskAttachment(attachmentId, fileName) { await taskService.deleteTaskAttachment(this, attachmentId, fileName); },
    async updateTaskInline(taskId, field, value) { await taskService.updateTaskInline(this, taskId, field, value); },
    async addSubtask(parentId) { await taskService.addSubtask(this, parentId); },
    async toggleSubtaskDone(subtask) { await taskService.toggleSubtaskDone(this, subtask); },
    async updateSubtaskDueDate(subtaskId, date) { await taskService.updateSubtaskDueDate(this, subtaskId, date); },
    addTaskTag() {
      const tag = this.taskTagInput.trim();
      if (tag && !this.taskForm.tags.includes(tag)) { this.taskForm.tags.push(tag); }
      this.taskTagInput = '';
    },
    removeTaskTag(tag) { this.taskForm.tags = this.taskForm.tags.filter(t => t !== tag); },
    async toggleDetailTaskTag(tag) {
      if (!this.selectedTask) return;
      const tags = [...(this.selectedTask.tags || [])];
      const idx = tags.indexOf(tag);
      if (idx >= 0) { tags.splice(idx, 1); } else { tags.push(tag); }
      await taskService.updateTaskInline(this, this.selectedTask.id, 'tags', tags);
    },
    getTaskDueLabel(dueDate) { return getRelativeDateLabel(dueDate); },
    getTaskDueClass(dueDate, status) { return getRelativeDateClass(dueDate, ['DONE', 'ARCHIVED'], status); },
    getTaskAssigneeUsers(task) {
      return (task?.assignees || []).map(a => a.user).filter(Boolean);
    },
    getAssigneeLabelById(userId) {
      if (!userId) return '';
      const u = (this.taskAssignees || []).find(x => x.id === userId);
      return u ? getUserDisplayName(u) : '';
    },
    getTaskAssigneeNames(task) {
      const users = this.getTaskAssigneeUsers(task);
      if (!users.length) return 'Unassigned';
      return users.map(u => getUserDisplayName(u)).join(', ');
    },
    toggleTaskFormAssignee(userId) {
      const ids = this.taskForm.assigneeIds || [];
      const idx = ids.indexOf(userId);
      if (idx >= 0) ids.splice(idx, 1); else ids.push(userId);
      this.taskForm.assigneeIds = ids;
    },
    async toggleDetailTaskAssignee(userId) {
      if (!this.selectedTask) return;
      const current = this.getTaskAssigneeUsers(this.selectedTask).map(u => u.id);
      const idx = current.indexOf(userId);
      if (idx >= 0) current.splice(idx, 1); else current.push(userId);
      await taskService.updateTaskInline(this, this.selectedTask.id, 'assigneeIds', current);
    },
    getSubtaskProgress(task) {
      if (!task.subtasks?.length) return null;
      const done = task.subtasks.filter(s => s.status === 'DONE').length;
      return { done, total: task.subtasks.length, percent: Math.round((done / task.subtasks.length) * 100) };
    },
    getOverdueSubtaskCount(task) {
      if (!task.subtasks?.length) return 0;
      const now = new Date().toISOString().split('T')[0];
      return task.subtasks.filter(s => s.dueDate && s.dueDate < now && s.status !== 'DONE' && s.status !== 'ARCHIVED').length;
    },
    getPriorityBadgeClass(priority) {
      const classes = { LOW: 'bg-gray-100 text-gray-600', MEDIUM: 'bg-blue-100 text-blue-700', HIGH: 'bg-orange-100 text-orange-700', URGENT: 'bg-red-100 text-red-700' };
      return classes[priority] || classes.MEDIUM;
    },
    getPriorityDotClass(priority) {
      const classes = { LOW: 'bg-gray-300', MEDIUM: 'bg-blue-400', HIGH: 'bg-orange-400', URGENT: 'bg-red-500' };
      return classes[priority] || classes.MEDIUM;
    },
    getPriorityLabel(priority) {
      const labels = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', URGENT: 'Urgent' };
      return labels[priority] || 'Medium';
    },
    getTaskPrimaryAssigneeShort(task) {
      const users = this.getTaskAssigneeUsers(task);
      if (!users.length) return '';
      const u = users[0];
      return u.firstName || u.username || '';
    },
    setTaskListGroupBy(value) {
      this.taskListGroupBy = value;
      localStorage.setItem('taskListGroupBy', value);
      this.taskCollapsedGroups = {};
    },
    toggleTaskGroup(key) {
      this.taskCollapsedGroups = { ...this.taskCollapsedGroups, [key]: !this.taskCollapsedGroups[key] };
    },
    getGroupedTasks() {
      const tasks = this.getFilteredTasks();
      const mode = this.taskListGroupBy;
      if (!mode || mode === 'none') {
        return [{ key: 'all', label: '', tasks }];
      }
      const groups = new Map();
      const push = (key, label, sortKey, task) => {
        if (!groups.has(key)) groups.set(key, { key, label, sortKey, tasks: [] });
        groups.get(key).tasks.push(task);
      };
      const statusOrder = { TODO: 0, IN_PROGRESS: 1, IN_REVIEW: 2, DONE: 3, ARCHIVED: 4 };
      const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      const tagSet = new Set(this.systemCategoryTags);
      const instSet = new Set(this.systemInstitutionTags);
      for (const task of tasks) {
        if (mode === 'status') {
          push(task.status, this.formatStatusLabel(task.status), statusOrder[task.status] ?? 99, task);
        } else if (mode === 'priority') {
          push(task.priority, this.getPriorityLabel(task.priority), priorityOrder[task.priority] ?? 99, task);
        } else if (mode === 'assignee') {
          const users = this.getTaskAssigneeUsers(task);
          if (!users.length) { push('__unassigned', 'Unassigned', 999, task); continue; }
          for (const u of users) push('user:' + u.id, getUserDisplayName(u), getUserDisplayName(u).toLowerCase(), task);
        } else if (mode === 'tag') {
          const matched = (task.tags || []).filter(t => tagSet.has(t));
          if (!matched.length) { push('__untagged', 'Untagged', 999, task); continue; }
          for (const t of matched) push('tag:' + t, t, t.toLowerCase(), task);
        } else if (mode === 'institution') {
          const matched = (task.tags || []).filter(t => instSet.has(t));
          if (!matched.length) { push('__none', 'No institution', 999, task); continue; }
          for (const t of matched) push('inst:' + t, t, t.toLowerCase(), task);
        } else if (mode === 'goal') {
          if (!task.goalId) { push('__nogoal', 'No goal', 999, task); continue; }
          const label = task.goal?.title || 'Goal';
          push('goal:' + task.goalId, label, label.toLowerCase(), task);
        }
      }
      return [...groups.values()].sort((a, b) => {
        if (typeof a.sortKey === 'number' && typeof b.sortKey === 'number') return a.sortKey - b.sortKey;
        return String(a.sortKey).localeCompare(String(b.sortKey));
      });
    },
    getTaskListRows() {
      const groups = this.getGroupedTasks();
      const showHeaders = this.taskListGroupBy && this.taskListGroupBy !== 'none';
      const rows = [];
      for (const group of groups) {
        if (!group.tasks.length) continue;
        if (showHeaders) {
          rows.push({ rowKey: 'h:' + group.key, type: 'header', group });
        }
        if (this.taskCollapsedGroups[group.key]) continue;
        for (const task of group.tasks) {
          rows.push({ rowKey: 't:' + group.key + ':' + task.id, type: 'task', task, groupKey: group.key });
        }
      }
      return rows;
    },
    getStatusBadgeClass(status) {
      const classes = { TODO: 'bg-gray-100 text-gray-700', IN_PROGRESS: 'bg-blue-100 text-blue-700', IN_REVIEW: 'bg-amber-100 text-amber-700', DONE: 'bg-green-100 text-green-700', ARCHIVED: 'bg-gray-100 text-gray-400' };
      return classes[status] || classes.TODO;
    },
    formatStatusLabel(status) {
      const labels = { TODO: 'To Do', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review', DONE: 'Done', ARCHIVED: 'Archived' };
      return labels[status] || status;
    },
    openTaskFormWithStatus(status) { this.openTaskForm(); this.taskForm.status = status; },
    async archiveTask(taskId) { await taskService.archiveTask(this, taskId); },
    async unarchiveTask(taskId) { await taskService.unarchiveTask(this, taskId); },
    async toggleCostPaid(taskId, paid) { await taskService.toggleCostPaid(this, taskId, paid); },
    async loadCostsSummary() { await taskService.loadCostsSummary(this); },
    formatCost(value) {
      if (value == null || value === '') return '';
      const n = Number(value);
      if (!Number.isFinite(n)) return '';
      return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 });
    },
    getTaskCostStatusClass(task) {
      if (task?.cost == null) return '';
      return task.costPaid
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        : 'bg-amber-50 text-amber-800 border border-amber-200';
    },
    getCostsViewTasks() {
      const all = this.tasks || [];
      let list = all.filter(t => t.cost != null);
      if (this.taskCostsFilter === 'open') list = list.filter(t => !t.costPaid);
      else if (this.taskCostsFilter === 'paid') list = list.filter(t => t.costPaid);
      // Honor the assignee/goal/tag filters from the main tasks tab too
      if (this.taskFilters.goalId) {
        list = this.taskFilters.goalId === 'none'
          ? list.filter(t => !t.goalId && !t.goal?.id)
          : list.filter(t => (t.goalId || t.goal?.id) === this.taskFilters.goalId);
      }
      if (this.taskFilters.assigneeId) {
        list = list.filter(t => (t.assignees || []).some(a => (a.user?.id || a.userId) === this.taskFilters.assigneeId));
      }
      if (this.taskFilters.tag) {
        list = list.filter(t => (t.tags || []).includes(this.taskFilters.tag));
      }
      if (this.taskFilters.institution) {
        list = list.filter(t => (t.tags || []).includes(this.taskFilters.institution));
      }
      if (this.taskSearch) {
        const q = this.taskSearch.toLowerCase();
        list = list.filter(t => t.title?.toLowerCase().includes(q));
      }
      // Sort by cost descending by default
      return list.slice().sort((a, b) => Number(b.cost || 0) - Number(a.cost || 0));
    },
    getCostsViewGroups() {
      const list = this.getCostsViewTasks();
      const groupBy = this.taskCostsGroupBy;
      if (groupBy === 'none') {
        return [{ key: 'all', label: '', tasks: list, total: list.reduce((s, t) => s + Number(t.cost || 0), 0) }];
      }
      const map = new Map();
      for (const t of list) {
        let key, label;
        if (groupBy === 'goal') {
          key = t.goal?.id || t.goalId || '__none';
          label = t.goal?.title || (key === '__none' ? 'No goal' : '(unknown goal)');
        } else if (groupBy === 'assignee') {
          const first = (t.assignees || [])[0];
          key = first?.user?.id || first?.userId || '__none';
          label = first?.user
            ? [first.user.firstName, first.user.lastName].filter(Boolean).join(' ') || first.user.username
            : 'Unassigned';
        } else if (groupBy === 'category') {
          const cats = (t.tags || []).filter(tag => (this.systemCategoryTags || []).some(s => s.name === tag));
          if (cats.length === 0) { key = '__none'; label = 'No category'; }
          else { key = cats[0]; label = cats[0]; }
        } else {
          key = '__all'; label = '';
        }
        if (!map.has(key)) map.set(key, { key, label, tasks: [], total: 0 });
        const g = map.get(key);
        g.tasks.push(t);
        g.total += Number(t.cost || 0);
      }
      return Array.from(map.values()).sort((a, b) => b.total - a.total);
    },
    getCostsRows() {
      const groups = this.getCostsViewGroups();
      const rows = [];
      for (const g of groups) {
        if (g.label) {
          rows.push({ type: 'header', group: g, rowKey: 'h-' + g.key });
        }
        for (const t of g.tasks) {
          rows.push({ type: 'task', task: t, rowKey: 't-' + g.key + '-' + t.id });
        }
      }
      return rows;
    },

    // ===== CALENDAR VIEW =====
    setCalendarSubMode(mode) {
      this.calendarSubMode = mode;
      localStorage.setItem('taskCalendarSubMode', mode);
    },
    prevCalendarMonth() {
      const d = new Date(this.calendarCursor);
      d.setMonth(d.getMonth() - 1);
      this.calendarCursor = d;
    },
    nextCalendarMonth() {
      const d = new Date(this.calendarCursor);
      d.setMonth(d.getMonth() + 1);
      this.calendarCursor = d;
    },
    gotoCalendarToday() {
      const d = new Date();
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      this.calendarCursor = d;
    },
    getCalendarMonthLabel() {
      return this.calendarCursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    },
    _ymd(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    },
    _todayYmd() {
      return this._ymd(new Date());
    },
    getTasksByDueDate() {
      const map = new Map();
      for (const t of this.getFilteredTasks()) {
        if (!t.dueDate) continue;
        const ymd = String(t.dueDate).split('T')[0];
        if (!map.has(ymd)) map.set(ymd, []);
        map.get(ymd).push(t);
      }
      const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      for (const list of map.values()) {
        list.sort((a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9));
      }
      return map;
    },
    getCalendarWeeks() {
      const cursor = this.calendarCursor;
      const year = cursor.getFullYear();
      const month = cursor.getMonth();
      const first = new Date(year, month, 1);
      const start = new Date(first);
      start.setDate(1 - first.getDay()); // back up to Sunday
      const todayYmd = this._todayYmd();
      const tasksByDay = this.getTasksByDueDate();
      const weeks = [];
      const cur = new Date(start);
      for (let w = 0; w < 6; w++) {
        const days = [];
        for (let i = 0; i < 7; i++) {
          const ymd = this._ymd(cur);
          const tasks = tasksByDay.get(ymd) || [];
          days.push({
            date: new Date(cur),
            ymd,
            day: cur.getDate(),
            isCurrentMonth: cur.getMonth() === month,
            isToday: ymd === todayYmd,
            isPast: ymd < todayYmd,
            isWeekend: cur.getDay() === 0 || cur.getDay() === 6,
            tasks,
          });
          cur.setDate(cur.getDate() + 1);
        }
        weeks.push(days);
        // Stop early if we've covered the month and started next month
        if (w >= 3 && days[6].date.getMonth() !== month && days[0].date.getMonth() !== month) break;
      }
      return weeks;
    },
    getCalendarAgenda() {
      const tasksByDay = this.getTasksByDueDate();
      const todayYmd = this._todayYmd();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const horizon = new Date(today);
      horizon.setDate(today.getDate() + 60);
      const horizonYmd = this._ymd(horizon);
      const overdue = [];
      const upcomingMap = new Map();
      for (const [ymd, tasks] of tasksByDay.entries()) {
        const incomplete = tasks.filter(t => t.status !== 'DONE' && t.status !== 'ARCHIVED');
        if (ymd < todayYmd) {
          if (incomplete.length) overdue.push(...incomplete);
        } else if (ymd <= horizonYmd) {
          upcomingMap.set(ymd, tasks);
        }
      }
      overdue.sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));
      const groups = [];
      if (overdue.length) {
        groups.push({ ymd: '__overdue', label: 'Overdue', sublabel: `${overdue.length} task${overdue.length === 1 ? '' : 's'}`, tasks: overdue, isOverdue: true });
      }
      const sortedYmds = [...upcomingMap.keys()].sort();
      for (const ymd of sortedYmds) {
        groups.push({
          ymd,
          label: this.getAgendaDateLabel(ymd),
          sublabel: this.getAgendaDateSublabel(ymd),
          tasks: upcomingMap.get(ymd),
          isOverdue: false,
        });
      }
      return groups;
    },
    getAgendaDateLabel(ymd) {
      const d = new Date(ymd + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diff = Math.round((d - today) / 86400000);
      if (diff === 0) return 'Today';
      if (diff === 1) return 'Tomorrow';
      if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    },
    getAgendaDateSublabel(ymd) {
      const d = new Date(ymd + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },
    getCalendarPillClass(task) {
      const isDone = task.status === 'DONE' || task.status === 'ARCHIVED';
      if (isDone) return 'bg-gray-100 text-gray-400 line-through hover:bg-gray-200';
      const todayYmd = this._todayYmd();
      const ymd = String(task.dueDate || '').split('T')[0];
      if (ymd && ymd < todayYmd) return 'bg-red-50 text-red-700 hover:bg-red-100 border-l-2 border-red-500';
      const map = {
        URGENT: 'bg-red-50 text-red-700 hover:bg-red-100 border-l-2 border-red-500',
        HIGH: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-l-2 border-orange-400',
        MEDIUM: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-l-2 border-blue-400',
        LOW: 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-l-2 border-gray-300',
      };
      return map[task.priority] || map.MEDIUM;
    },
    openTaskFormForDate(ymd) {
      this.openTaskForm();
      this.taskForm.dueDate = ymd;
    },

    // Dependency delegates
    async linkDependency(taskId, blockingTaskId) { await taskService.linkDependency(this, taskId, blockingTaskId); },
    async unlinkDependency(taskId, linkId) { await taskService.unlinkDependency(this, taskId, linkId); },
    openDepPicker(direction) {
      this.depPickerOpenFor = direction;
      this.depPickerQuery = '';
      this.depPickerResults = [];
    },
    closeDepPicker() {
      this.depPickerOpenFor = null;
      this.depPickerQuery = '';
      this.depPickerResults = [];
    },
    async searchDependencyCandidates(query, direction) {
      await taskService.searchDependencyCandidates(this, query, direction);
    },
    initKanbanDragDrop() {
      kanbanService.invalidate('kanban');
      kanbanService.init({
        group: 'kanban',
        columnIds: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map(s => `kanban-col-${s}`),
        itemIdAttr: 'data-task-id',
        statusAttr: 'data-status',
        onReorder: async (taskId, newStatus, oldStatus, positions) => {
          // Guard DONE transitions when the task has incomplete blockers.
          if (newStatus === 'DONE' && newStatus !== oldStatus) {
            let task = this.tasks.find(t => t.id === taskId);
            if (task && !Array.isArray(task.blockedBy)) {
              try { task = await API.tasks.getById(taskId); } catch (e) { task = null; }
            }
            if (task && !taskService.confirmDoneIfBlocked(task)) {
              await this.loadTasks();
              return;
            }
          }
          try {
            await API.tasks.reorder(taskId, newStatus !== oldStatus ? newStatus : null, positions);
            await this.loadTasks();
          } catch (error) {
            console.error('Failed to reorder:', error);
            await this.loadTasks();
          }
        },
        sortableOptions: { filter: 'select', preventOnFilter: false }
      });
    },

    getTasksTabHtml() { return getTasksTabHtml(); },
    getTaskModalHtml() { return getTaskModalHtml(); },
    getTaskDetailPanelHtml() { return getTaskDetailPanelHtml(); },
    getGoalsTabHtml() { return getGoalsTabHtml(); },
    getGoalModalHtml() { return getGoalModalHtml(); },
    getGoalDetailPanelHtml() { return getGoalDetailPanelHtml(); },

    // ===== GOAL MANAGEMENT METHODS (delegated to GoalService) =====
    async loadGoals() { await goalService.loadGoals(this); },
    openGoalForm() { goalService.openGoalForm(this); },
    openEditGoalForm(goal) { goalService.openEditGoalForm(this, goal); },
    closeGoalForm() { goalService.closeGoalForm(this); },
    async saveGoal() { await goalService.saveGoal(this); },
    async deleteGoal(goalId) { await goalService.deleteGoal(this, goalId); },
    async restoreGoal(goalId) { await goalService.restoreGoal(this, goalId); },
    async openGoalDetail(goalId) { await goalService.openGoalDetail(this, goalId); },
    closeGoalDetail() { goalService.closeGoalDetail(this); },
    async updateGoalInline(goalId, field, value) { await goalService.updateGoalInline(this, goalId, field, value); },
    async linkTasksToGoal(goalId, taskIds) { await goalService.linkTasksToGoal(this, goalId, taskIds); },
    async unlinkTaskFromGoal(goalId, taskId) { await goalService.unlinkTaskFromGoal(this, goalId, taskId); },
    getGoalStatusLabel(status) {
      const labels = { ACTIVE: 'Active', ON_HOLD: 'On Hold', ACHIEVED: 'Achieved', ABANDONED: 'Abandoned' };
      return labels[status] || status;
    },
    getGoalStatusBadgeClass(status) {
      const classes = {
        ACTIVE: 'bg-blue-100 text-blue-700',
        ON_HOLD: 'bg-amber-100 text-amber-700',
        ACHIEVED: 'bg-green-100 text-green-700',
        ABANDONED: 'bg-gray-200 text-gray-500'
      };
      return classes[status] || classes.ACTIVE;
    },
    getGoalProgressColor(goal) {
      if (goal.status === 'ACHIEVED') return 'bg-green-500';
      if (goal.status === 'ABANDONED') return 'bg-gray-300';
      if (goal.status === 'ON_HOLD') return 'bg-amber-400';
      return 'bg-blue-500';
    },
    getActiveGoals() {
      return (this.goals || []).filter(g => g.status === 'ACTIVE' && !g.archivedAt);
    },
    getGoalById(goalId) {
      return (this.goals || []).find(g => g.id === goalId) || null;
    },

    // Pipeline / CRM methods
    getPipelineTabHtml() { return getPipelineTabHtml(); },
    getContactModalHtml() { return getContactModalHtml(); },
    getAddToPipelineModalHtml() { return getAddToPipelineModalHtml(); },
    getContactDetailPanelHtml() { return getContactDetailPanelHtml(); },

    // ===== PIPELINE / CRM METHODS (delegated to PipelineService) =====

    PIPELINE_STAGES,
    getPipelineStages(type) { return pipelineService.getPipelineStages(type || this.pipelineType); },
    getStageLabel(stageKey) { return pipelineService.getStageLabel(stageKey); },
    getStageBadgeClass(stageKey) { return pipelineService.getStageBadgeClass(stageKey); },
    getContactTypeBadgeClass(type) {
      const classes = {
        CLIENT: 'bg-blue-100 text-blue-700',
        INVESTOR: 'bg-purple-100 text-purple-700',
        EXISTING_INVESTOR: 'bg-emerald-100 text-emerald-700',
        PARTNER: 'bg-teal-100 text-teal-700',
        OTHER: 'bg-gray-100 text-gray-700'
      };
      return classes[type] || classes.OTHER;
    },
    getContactTypeLabel(type) {
      const labels = {
        CLIENT: 'Client',
        INVESTOR: 'Potential Investor',
        EXISTING_INVESTOR: 'Existing Investor',
        PARTNER: 'Partner',
        OTHER: 'Other'
      };
      return labels[type] || type;
    },
    ALL_CONTACT_TYPES: ['CLIENT', 'INVESTOR', 'EXISTING_INVESTOR', 'PARTNER', 'OTHER'],
    toggleContactTypeOnForm(type) {
      const arr = this.contactForm.contactTypes || [];
      this.contactForm.contactTypes = arr.includes(type) ? arr.filter(t => t !== type) : [...arr, type];
    },
    toggleContactTypeOnSelected(type) {
      if (!this.selectedContact) return;
      const arr = this.selectedContact.contactTypes || [];
      const next = arr.includes(type) ? arr.filter(t => t !== type) : [...arr, type];
      this.updateContactInline(this.selectedContact.id, 'contactTypes', next);
    },
    getContactsByStage(stage) { return this.pipelineBoardContacts.filter(c => c.stage === stage); },
    getFollowUpLabel(date) { return getRelativeDateLabel(date, { todayLabel: 'Today', tomorrowLabel: 'Tomorrow', withinWeekFmt: d => `In ${d}d` }); },
    getFollowUpClass(date) { return getRelativeDateClass(date); },
    getOwnerName(entity) { return getUserDisplayName(entity?.owner); },
    getOwnerInitials(entity) { return getUserInitials(entity?.owner); },
    getCompanyContacts() { return this.pipelineContacts.filter(c => c.contactKind === 'COMPANY'); },
    getPersonContacts() { return this.pipelineContacts.filter(c => c.contactKind === 'PERSON'); },
    getContactCompanyName(contact) {
      if (contact.contactKind === 'COMPANY') return null;
      return contact.companyContact?.name || null;
    },
    getFilteredContacts() {
      let filtered = this.pipelineContacts;
      if (this.pipelineContactKindFilter) {
        filtered = filtered.filter(c => c.contactKind === this.pipelineContactKindFilter);
      }
      if (this.pipelineSearch) {
        const q = this.pipelineSearch.toLowerCase();
        filtered = filtered.filter(c =>
          c.name.toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.companyContact?.name || '').toLowerCase().includes(q)
        );
      }
      if (this.pipelineFilters.ownerId) {
        filtered = filtered.filter(c => c.ownerId === this.pipelineFilters.ownerId);
      }
      if (this.pipelineFilters.contactType) {
        const want = this.pipelineFilters.contactType;
        filtered = filtered.filter(c => (c.contactTypes || []).includes(want) || c.contactType === want);
      }
      if (this.pipelineFilters.onPipeline === 'yes') {
        filtered = filtered.filter(c => c.stage);
      } else if (this.pipelineFilters.onPipeline === 'no') {
        filtered = filtered.filter(c => !c.stage);
      }
      // Sort
      const { field, order } = this.pipelineContactSort;
      filtered = [...filtered].sort((a, b) => {
        let va, vb;
        if (field === 'name') { va = a.name?.toLowerCase() || ''; vb = b.name?.toLowerCase() || ''; }
        else if (field === 'company') { va = (a.contactKind === 'PERSON' ? a.companyContact?.name?.toLowerCase() : a.name?.toLowerCase()) || ''; vb = (b.contactKind === 'PERSON' ? b.companyContact?.name?.toLowerCase() : b.name?.toLowerCase()) || ''; }
        else if (field === 'type') { va = (a.contactTypes && a.contactTypes[0]) || a.contactType || ''; vb = (b.contactTypes && b.contactTypes[0]) || b.contactType || ''; }
        else if (field === 'stage') { va = a.stage || ''; vb = b.stage || ''; }
        else if (field === 'followUp') { va = a.nextFollowUpAt || '9999'; vb = b.nextFollowUpAt || '9999'; }
        else if (field === 'lastContact') { va = a.lastContactedAt || ''; vb = b.lastContactedAt || ''; }
        else { va = a.name?.toLowerCase() || ''; vb = b.name?.toLowerCase() || ''; }
        if (va < vb) return order === 'asc' ? -1 : 1;
        if (va > vb) return order === 'asc' ? 1 : -1;
        return 0;
      });
      return filtered;
    },
    toggleContactSort(field) {
      if (this.pipelineContactSort.field === field) {
        this.pipelineContactSort.order = this.pipelineContactSort.order === 'asc' ? 'desc' : 'asc';
      } else {
        this.pipelineContactSort = { field, order: 'asc' };
      }
    },
    getAvailableContactsForPipeline() {
      let contacts = this.pipelineContacts.filter(c => !c.stage);
      if (this.addToPipelineSearch) {
        const q = this.addToPipelineSearch.toLowerCase();
        contacts = contacts.filter(c =>
          c.name.toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.companyContact?.name || '').toLowerCase().includes(q)
        );
      }
      return contacts;
    },

    // Contact CRUD
    async loadPipelineContacts() { await pipelineService.loadPipelineContacts(this); },
    async loadPipelineBoard() { await pipelineService.loadPipelineBoard(this); },
    async loadPipelineOwners() { await pipelineService.loadPipelineOwners(this); },
    openContactForm(type, kind) { pipelineService.openContactForm(this, type, kind); },
    openPersonForm(type) { this.openContactForm(type, 'PERSON'); },
    openCompanyForm(type) { this.openContactForm(type, 'COMPANY'); },
    openEditContactForm(contact) { pipelineService.openEditContactForm(this, contact); },
    closeContactForm() { pipelineService.closeContactForm(this); },
    async saveContact() { await pipelineService.saveContact(this); },
    async deleteContact(contactId) { await pipelineService.deleteContact(this, contactId); },
    async openContactDetail(contactId) { await pipelineService.openContactDetail(this, contactId); },
    closeContactDetail() { pipelineService.closeContactDetail(this); },
    async updateContactInline(contactId, field, value) { await pipelineService.updateContactInline(this, contactId, field, value); },
    async addContactActivity() { await pipelineService.addContactActivity(this); },
    async uploadContactAttachments(files) { await pipelineService.uploadContactAttachments(this, files); },
    async deleteContactAttachment(attachmentId, fileName) { await pipelineService.deleteContactAttachment(this, attachmentId, fileName); },

    // Pipeline operations
    openAddToPipeline(presetStage) { pipelineService.openAddToPipeline(this, presetStage); },
    closeAddToPipeline() { pipelineService.closeAddToPipeline(this); },
    async addToPipeline() { await pipelineService.addToPipeline(this); },
    async removeFromPipeline(contactId) { await pipelineService.removeFromPipeline(this, contactId); },
    openAddToPipelineForContact(contactId) {
      pipelineService.openAddToPipeline(this);
      this.addToPipelineForm.contactId = contactId;
    },
    addPipelineTag() {
      const tag = this.pipelineTagInput.trim();
      if (this.showAddContact && tag && !this.contactForm.tags.includes(tag)) {
        this.contactForm.tags.push(tag);
      }
      this.pipelineTagInput = '';
    },
    removePipelineTag(tag) {
      if (this.showAddContact) {
        this.contactForm.tags = this.contactForm.tags.filter(t => t !== tag);
      }
    },

    // Pipeline Kanban & view switching
    initPipelineKanban() {
      kanbanService.invalidate('pipeline-kanban');
      kanbanService.init({
        group: 'pipeline-kanban',
        columnIds: this.getPipelineStages().map(s => `pipeline-col-${s.key}`),
        itemIdAttr: 'data-contact-id',
        statusAttr: 'data-stage',
        onReorder: async (contactId, newStage, oldStage, positions) => {
          try {
            await API.pipeline.reorderContacts(contactId, newStage !== oldStage ? newStage : null, positions);
            await this.loadPipelineBoard();
          } catch (error) {
            console.error('Failed to reorder pipeline:', error);
            await this.loadPipelineBoard();
          }
        }
      });
    },
    async switchPipelineType(type) { await pipelineService.switchPipelineType(this, type); },
    async switchPipelineView(mode) { await pipelineService.switchPipelineView(this, mode); },
    async pipelineSearchDebounced() { pipelineService.pipelineSearchDebounced(this); },
    formatActivityAction(action) { return pipelineService.formatActivityAction(action); },
    getActivityIcon(action) { return pipelineService.getActivityIcon(action); },

    // ── Proforma delegates ──
    async loadProformaScenarios() {
      this.proformaMarketSources = proformaService.getMarketSourceCatalog(this);
      await proformaService.loadScenarios(this);
    },
    async openProformaScenario(id) { await proformaService.openScenario(this, id); },
    async createProformaScenario() { await proformaService.createScenario(this); },
    async createProformaDemoScenario() { await proformaService.createDemoScenario(this); },
    async cloneProformaToReal() { await proformaService.cloneToReal(this); },
    async resetProformaToBaseline() { await proformaService.resetToBaseline(this); },
    async toggleProformaLock(id) { await proformaService.toggleLock(this, id); },
    async deleteProformaScenario(id) { await proformaService.deleteScenario(this, id); },
    async saveProformaScenario() { await proformaService.saveScenario(this); },
    proformaRecompute() { proformaService.recompute(this); },
    proformaBackToList() { proformaService.backToList(this); },
    proformaMarkDirty() { proformaService.markDirty(this); },
    addProformaMachine() { proformaService.addMachine(this); },
    removeProformaMachine(index) { proformaService.removeMachine(this, index); },
    addProformaRaise() { proformaService.addRaise(this); },
    removeProformaRaise(index) { proformaService.removeRaise(this, index); },
    addProformaRevenueStream(opts) { proformaService.addRevenueStream(this, opts); },
    removeProformaRevenueStream(streamId) { proformaService.removeRevenueStream(this, streamId); },
    toggleProformaRevenueStream(streamId) { proformaService.toggleRevenueStream(this, streamId); },
    setProformaStreamMarketMode(streamId, mode) { proformaService.setStreamMarketMode(this, streamId, mode); },
    setProformaStreamDirectInput(streamId, input) { proformaService.setStreamDirectInput(this, streamId, input); },
    addProformaMarketSource(opts) { return proformaService.addMarketSource(this, opts); },
    removeProformaMarketSource(sourceId) { proformaService.removeMarketSource(this, sourceId); },
    countProformaStreamsLinkedToSource(sourceId) { return proformaService.countStreamsLinkedToSource(this, sourceId); },
    reseedProformaMarketSources() { proformaService._reseedMarketSources(this); },
    onDeleteProformaMarketSource(sourceId) {
      const n = proformaService.countStreamsLinkedToSource(this, sourceId);
      const msg = n > 0
        ? `This source is linked by ${n} revenue stream${n === 1 ? '' : 's'}. Deleting it will leave those streams with $0 revenue until you re-link them. Delete anyway?`
        : 'Delete this market source?';
      if (confirm(msg)) proformaService.removeMarketSource(this, sourceId);
    },
    normalizeProformaQDist(arr) { proformaService.normalizeQDist(arr); proformaService.recompute(this); },
    toggleProformaSalaryMode(yearKey, role) { proformaService.toggleSalaryMode(this, yearKey, role); },
    addProformaMachinePayment(mi) { proformaService.addMachinePayment(this, mi); },
    removeProformaMachinePayment(mi, pi) { proformaService.removeMachinePayment(this, mi, pi); },
    addProformaFteRole() { proformaService.addFteRole(this); },
    removeProformaFteRole(index) { proformaService.removeFteRole(this, index); },
    getProformaOutlookRows() { return proformaService.getOutlookRows(this); },
    getProformaColumns() { return proformaService.getColumnLabels(this); },
    getProformaDisplayColumns() { return proformaService.getDisplayColumns(this); },
    getProformaDisplayData(row) { return proformaService.getDisplayData(row, this); },
    getProformaGanttRows() { return proformaService.getProductionGanttRows(this); },
    getProformaProductionRows() { return proformaService.getProductionTableRows(this); },
    getProformaSummary() { return proformaService.getSummary(this); },

    // ── Outlook cell explainer ──
    // Called from @dblclick on each Outlook cell. The label arg is the row's
    // user-facing label so the panel header reads naturally even though we
    // key off rowKey internally.
    // Translate a (row, displayColumnIndex) pair from the rendered table into
    // a clean (view, periodIndex) tuple. Total cells (Y0 Total, Y1 Total …)
    // in monthly/quarterly views collapse to a yearly period in the explainer.
    openProformaExplainerFromCell(row, displayIndex, isTotal, event) {
      const view = this.proformaOutlookView;
      let targetView = view;
      let periodIndex;
      if (view === 'yearly') {
        periodIndex = displayIndex;
      } else {
        // monthly: blocks of 13 (12 months + 1 total). quarterly: blocks of 5.
        const block = view === 'monthly' ? 13 : 5;
        const yearIdx = Math.floor(displayIndex / block);
        if (isTotal) {
          targetView = 'yearly';
          periodIndex = yearIdx;
        } else {
          periodIndex = displayIndex - yearIdx;
        }
      }
      this._openProformaExplainerInternal(row.key, periodIndex, row.label, targetView, event);
    },
    _openProformaExplainerInternal(rowKey, periodIndex, label, view, event) {
      let anchor = null;
      if (event && event.currentTarget) {
        const r = event.currentTarget.getBoundingClientRect();
        anchor = { top: r.top, left: r.left, width: r.width, height: r.height };
      }
      this.proformaExplainerStack = [];
      this.proformaExplainer = { rowKey, periodIndex, label, view, anchor };
      if (window.getSelection) {
        try { window.getSelection().removeAllRanges(); } catch (e) { /* ignore */ }
      }
    },
    closeProformaExplainer() {
      this.proformaExplainer = null;
      this.proformaExplainerStack = [];
    },
    drillProformaExplainer(rowKey, label) {
      if (!this.proformaExplainer) return;
      this.proformaExplainerStack.push({ ...this.proformaExplainer });
      this.proformaExplainer = {
        ...this.proformaExplainer,
        rowKey,
        label: label || rowKey
      };
    },
    backProformaExplainer() {
      const prev = this.proformaExplainerStack.pop();
      if (prev) this.proformaExplainer = prev;
    },
    getProformaExplain() {
      const e = this.proformaExplainer;
      if (!e) return null;
      return explainProformaCell({
        computed: this.proformaComputed,
        assumptions: this.proformaAssumptions,
        rowKey: e.rowKey,
        periodIndex: e.periodIndex,
        view: e.view,
        label: e.label
      });
    },
    // Helper used by the panel template for inline value formatting.
    // Jump from a leaf-input row in the explainer to the matching journey pill
    // in the Assumptions editor. Closes the panel so the section isn't obscured.
    jumpToProformaSection(section) {
      if (!section) return;
      this.proformaEditorTab = 'assumptions';
      this.proformaSection = section;
      this.closeProformaExplainer();
    },
    formatProformaExplainValue(val, format) {
      if (val === '—' || val == null) return val ?? '—';
      if (typeof val !== 'number') return val;
      if (format === 'percent') return (val * 100).toFixed(2) + '%';
      if (format === 'kg') return Math.round(val).toLocaleString() + ' kg';
      if (format === 'count') return Math.round(val).toLocaleString();
      if (format === 'pricePerKg') return '$' + val.toFixed(2) + '/kg';
      if (format === 'multiplier') return val.toFixed(2) + '×';
      if (format === 'none') return String(val);
      return window._pfFmtC(val, true);
    },
    getStreamCommissionIncome(streamIndex, yr) {
      const stream = this.proformaAssumptions?.revenue?.streams?.[streamIndex];
      if (!stream) return '$0';
      const rev = stream.market?.revenueByYear?.[yr] || 0;
      const rate = stream.commission?.rateByYear?.[yr] || 0;
      return '$' + Math.round(rev * rate).toLocaleString();
    },
    renderProformaCharts() { proformaService.renderCharts(this); },
    openProformaFullscreenChart(canvasId) {
      this.proformaFullscreenChart = canvasId;
      this.$nextTick(() => proformaService.renderFullscreenChart(canvasId));
    },
    closeProformaFullscreenChart() {
      proformaService.destroyFullscreenChart();
      this.proformaFullscreenChart = null;
    },
    getProformaTabHtml() { return getProformaTabHtml(); },

    // Redirect restricted users away from tabs they can't access
    enforceThirdPartyRestrictions() {
      if (this.isThirdParty()) {
        const restrictedTabs = ['dashboard', 'news', 'ai-insights', 'shipments', 'user-management', 'tasks', 'pipeline', 'proforma'];
        if (restrictedTabs.includes(this.activeTab)) {
          this.activeTab = 'graphene';
        }
      } else if (this.currentUser?.role === 'INVESTOR') {
        const restrictedTabs = ['tasks', 'pipeline'];
        if (restrictedTabs.includes(this.activeTab)) {
          this.activeTab = 'graphene';
        }
      }
    },

    // Check if current user is super admin
    isSuperAdmin() {
      return this.currentUser?.role === 'SUPER_ADMIN';
    },

    // Check if current user is third party (view-only)
    isThirdParty() {
      return this.currentUser?.role === 'THIRD_PARTY';
    },

    // Format role name for display
    formatRoleName(role) {
      const roleNames = {
        'SUPER_ADMIN': 'Super Admin',
        'SCIENCE_TEAM': 'Science Team',
        'EXECUTIVE_TEAM': 'Executive',
        'INVESTOR': 'Investor',
        'TEAM_MEMBER': 'Team Member',
        'THIRD_PARTY': 'Third Party'
      };
      return roleNames[role] || role || '';
    },

    // Check if current user can edit (not third party)
    canEdit() {
      return this.currentUser && !this.isThirdParty();
    },

    // Sidebar helpers
    toggleSidebar() {
      this.sidebarExpanded = !this.sidebarExpanded;
      localStorage.setItem('sidebarExpanded', this.sidebarExpanded);
    },

    initSidebarState() {
      const saved = localStorage.getItem('sidebarExpanded');
      if (saved !== null) this.sidebarExpanded = saved === 'true';
    },

    sidebarNavigate(tab) {
      this.switchTab(tab);
      if (window.innerWidth < 1024) this.sidebarOpen = false;
    },

    isProductionTab() {
      return ['graphene', 'biochar', 'compound-batches', 'micronization', 'shipments'].includes(this.activeTab);
    },

    isAnalyticsTab() {
      return ['analysis', 'ai-insights'].includes(this.activeTab);
    },

    isTestResultsTab() {
      return this.activeTab.startsWith('test-');
    },

    getPageTitle() {
      const titles = {
        'dashboard': 'Dashboard',
        'graphene': 'Graphene', 'biochar': 'Biochar',
        'compound-batches': 'Compound Batches', 'micronization': 'Micronization',
        'shipments': 'Shipments', 'analysis': 'Analysis',
        'ai-insights': 'Insights', 'tasks': 'Tasks', 'goals': 'Goals', 'pipeline': 'Pipeline', 'proforma': 'Proforma',
        'user-management': 'User Management',
        'email-admin': 'Email',
        'test-bet': 'BET', 'test-conductivity': 'Conductivity',
        'test-raman': 'RAMAN', 'test-tem': 'TEM',
        'test-particle-size': 'Particle Size', 'test-xrd': 'XRD',
        'test-xps': 'XPS', 'test-sem': 'SEM Reports',
        'test-updates': 'Curia Updates',
      };
      return titles[this.activeTab] || 'Dashboard';
    },

    getPageSection() {
      if (this.isProductionTab()) return 'Production';
      if (this.isAnalyticsTab()) return 'Analytics';
      if (this.isTestResultsTab()) return 'Test Results';
      return '';
    },

    autoExpandParentGroup(tab) {
      if (['graphene', 'biochar', 'compound-batches', 'micronization', 'shipments'].includes(tab))
        this.sidebarProductionOpen = true;
      else if (['analysis', 'ai-insights'].includes(tab))
        this.sidebarAnalyticsOpen = true;
      else if (tab.startsWith('test-'))
        this.sidebarTestResultsOpen = true;
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
      window.closePdfViewer = appData.closePdfViewer ? appData.closePdfViewer.bind(appData) : () => console.log('closePdfViewer not available');
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
      
      // Expose modal fallback functions that redirect to data pages
      window.openGrapheneModal = function(experimentNumber) {
        console.log('openGrapheneModal called, redirecting to data page for:', experimentNumber);
        if (window.routerService) {
          window.routerService.navigateToDataPage('graphene', experimentNumber);
        }
      };
      
      window.openCompoundBatchModal = function(batchNumber) {
        console.log('openCompoundBatchModal called, redirecting to data page for:', batchNumber);
        if (window.routerService) {
          window.routerService.navigateToDataPage('compound-batch', batchNumber);
        }
      };
      
      window.openShipmentModal = function(shipmentNumber) {
        console.log('openShipmentModal called, redirecting to data page for:', shipmentNumber);
        if (window.routerService) {
          window.routerService.navigateToDataPage('shipment', shipmentNumber);
        }
      };
      
      // Breadcrumb navigation functions
      window.navigateToCompoundBatches = function() {
        console.log('Navigating to compound batches tab');
        if (appData.hideDataPage) {
          appData.hideDataPage();
        }
        appData.activeTab = 'compound-batches';
        window.location.hash = '#';
      };
      
      window.navigateToGraphene = function() {
        console.log('Navigating to graphene tab');
        if (appData.hideDataPage) {
          appData.hideDataPage();
        }
        appData.activeTab = 'graphene';
        window.location.hash = '#';
      };
      
      window.navigateToBiochar = function() {
        console.log('Navigating to biochar tab');
        if (appData.hideDataPage) {
          appData.hideDataPage();
        }
        appData.activeTab = 'biochar';
        window.location.hash = '#';
      };
      
      console.log('Modal fallback functions exposed globally');
    }
  }, 100);
});
