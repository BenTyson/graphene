// Main Application Module - Refactored Version
// Uses modular components for better maintainability

import API from './services/api.js';
import formatters from './utils/formatters.js';
import validators from './utils/validators.js';
import dataHelpers from './utils/dataHelpers.js';
import objectiveParser from './utils/objectiveParser.js';
import modalHelpers from './components/modals/modalHelpers.js';
import dateFieldHelpers from './components/forms/dateFieldHelpers.js';
import selectFieldHelpers from './components/forms/selectFieldHelpers.js';

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
    grapheneSample: '',
    researchTeam: 'Curia - Germany',
    testingLab: 'Fraunhofer-Institut',
    multipointBetArea: '',
    langmuirSurfaceArea: '',
    species: '',
    betReportFile: null,
    removeBetReport: false,
    replaceBetReport: false,
    comments: ''
  },
  conductivity: {
    testDate: '',
    dateUnknown: false,
    grapheneSample: '',
    description: '',
    conductivity1kN: '',
    conductivity8kN: '',
    conductivity12kN: '',
    conductivity20kN: '',
    comments: ''
  },
  raman: {
    testDate: '',
    dateUnknown: false,
    grapheneSample: '',
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
  combine: {
    lotNumber: '',
    lotName: '',
    description: ''
  },
  updateReport: {
    description: '',
    weekOf: '',
    grapheneIds: [],
    updateFile: null
  },
  semReport: {
    reportDate: '',
    grapheneIds: [],
    semFiles: null
  }
};

// Main Alpine.js application
window.grapheneApp = function() {
  return {
    // Tab management
    activeTab: 'graphene',
    
    // Data storage
    biocharRecords: [],
    grapheneRecords: [],
    betRecords: [],
    conductivityRecords: [],
    ramanRecords: [],
    updateReports: [],
    semReports: [],
    availableExperiments: [],
    availableLots: [],
    availableGrapheneSamples: [],
    
    // Search states
    biocharSearch: '',
    grapheneSearch: '',
    betSearch: '',
    conductivitySearch: '',
    ramanSearch: '',
    updateReportSearch: '',
    semReportSearch: '',
    
    // Modal states
    showAddBiochar: false,
    showAddGraphene: false,
    showAddBet: false,
    showAddConductivity: false,
    showAddRaman: false,
    showCombineModal: false,
    showSemModal: false,
    currentSemPdf: null,
    showRamanModal: false,
    currentRamanPdf: null,
    showAddUpdateReport: false,
    showAddSemReport: false,
    showUpdateReportModal: false,
    currentUpdateReport: null,
    
    // Editing states
    editingBiochar: null,
    editingGraphene: null,
    editingBet: null,
    editingConductivity: null,
    editingRaman: null,
    editingUpdateReport: null,
    editingSemReport: null,
    
    // Forms
    biocharForm: { ...DEFAULT_FORMS.biochar },
    grapheneForm: { ...DEFAULT_FORMS.graphene },
    betForm: { ...DEFAULT_FORMS.bet },
    conductivityForm: { ...DEFAULT_FORMS.conductivity },
    ramanForm: { ...DEFAULT_FORMS.raman },
    combineForm: { ...DEFAULT_FORMS.combine },
    updateReportForm: { ...DEFAULT_FORMS.updateReport },
    semReportForm: { ...DEFAULT_FORMS.semReport },
    
    // Selection states
    selectedBiocharIds: [],
    
    // Expandable row states
    expandedRows: {},
    expandedBiocharRows: {},
    expandedGrapheneRows: {},
    biocharRelatedData: {},
    grapheneRelatedData: {},
    loadingBiocharRelated: {},
    loadingGrapheneRelated: {},
    
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
    species: ['1', '2', '1/2 Mix', 'Mostly 1', 'Mostly 2', 'Mostly 1/2 Mix', '1 + Fibres'],
    appearanceTags: ['Shiny', 'Somewhat Shiny', 'Barely Shiny', 'Black', 'Black/Grey', 'Grey', 'Voluminous', 'Very Voluminous', 'Brittle'],
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
    
    // Import utilities as methods
    ...formatters,
    
    // Alias for scientific notation formatting (used in HTML)
    formatScientific(value) {
      return formatters.formatScientificNotation(value);
    },
    
    // Initialization
    async init() {
      await Promise.all([
        this.loadBiocharRecords(),
        this.loadGrapheneRecords(),
        this.loadBetRecords(),
        this.loadConductivityRecords(),
        this.loadRamanRecords(),
        this.loadUpdateReports(),
        this.loadSemReports()
      ]);
      this.loadDropdownOptions();
    },
    
    // Data loading methods
    async loadBiocharRecords() {
      try {
        this.biocharRecords = await API.biochar.getAll(this.biocharSearch);
        this.loadAvailableExperiments();
        await this.loadAvailableLots();
      } catch (error) {
        console.error('Failed to load biochar records:', error);
        this.biocharRecords = [];
      }
    },
    
    async loadGrapheneRecords() {
      try {
        this.grapheneRecords = await API.graphene.getAll(this.grapheneSearch);
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
        console.log('Loaded conductivity records:', this.conductivityRecords);
        if (this.conductivityRecords.length > 0) {
          console.log('First record structure:', this.conductivityRecords[0]);
        }
      } catch (error) {
        console.error('Failed to load conductivity records:', error);
        this.conductivityRecords = [];
      }
    },

    async loadRamanRecords() {
      try {
        this.ramanRecords = await API.raman.getAll(this.ramanSearch);
        console.log('Loaded RAMAN records:', this.ramanRecords);
      } catch (error) {
        console.error('Failed to load RAMAN records:', error);
        this.ramanRecords = [];
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
    
    // Generic toggle method for simple expandable rows
    toggleExpanded(type, id) {
      const key = `${type}_${id}`;
      this.expandedRows = {
        ...this.expandedRows,
        [key]: !this.expandedRows[key]
      };
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
        researchTeam: record.researchTeam || 'Curia - Germany',
        testingLab: record.testingLab || 'Fraunhofer-Institut',
        multipointBetArea: record.multipointBetArea || '',
        langmuirSurfaceArea: record.langmuirSurfaceArea || '',
        species: record.species || '',
        betReportFile: null,
        removeBetReport: false,
        replaceBetReport: false,
        comments: record.comments || ''
      };
      this.showAddBet = true;
    },
    
    async saveBet() {
      try {
        const data = { ...this.betForm };
        
        // Handle date
        if (data.dateUnknown) {
          data.testDate = null;
        }
        delete data.dateUnknown;
        
        // Extract file from form data
        const file = data.betReportFile;
        delete data.betReportFile;
        
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
        grapheneSample: record.grapheneSample || '',
        description: record.description || '',
        conductivity1kN: record.conductivity1kN || '',
        conductivity8kN: record.conductivity8kN || '',
        conductivity12kN: record.conductivity12kN || '',
        conductivity20kN: record.conductivity20kN || '',
        comments: record.comments || ''
      };
      this.showAddConductivity = true;
    },
    
    async saveConductivity() {
      try {
        const data = { ...this.conductivityForm };
        
        if (data.dateUnknown) {
          data.testDate = null;
        }
        delete data.dateUnknown;
        
        if (this.editingConductivity) {
          await API.conductivity.update(this.editingConductivity.id, data);
        } else {
          await API.conductivity.create(data);
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
          await API.updateReport.update(this.editingUpdateReport.id, data);
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
          grapheneIds: this.semReportForm.grapheneIds
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

    // Date field HTML generation using helpers
    getDateFieldHtml(config) {
      return dateFieldHelpers.createDateFieldWithUnknown(config);
    },

    // Select field HTML generation using helpers
    getSelectFieldHtml(config) {
      return selectFieldHelpers.createSelectWithAdd(config);
    }
  };
};