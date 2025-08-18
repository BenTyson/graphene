// Main Application Module - Refactored Version
// Uses modular components for better maintainability

import API from './services/api.js';
import formatters from './utils/formatters.js';
import validators from './utils/validators.js';
import dataHelpers from './utils/dataHelpers.js';

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
    grindingMethod: '',
    grindingTime: '',
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
    density: '',
    species: '',
    appearanceTags: [],
    semReportFile: null,
    output: '',
    comments: ''
  },
  bet: {
    testDate: '',
    dateUnknown: false,
    grapheneSample: '',
    multipointBetArea: '',
    langmuirSurfaceArea: '',
    species: '',
    comments: ''
  },
  combine: {
    lotNumber: '',
    lotName: '',
    description: ''
  }
};

// Main Alpine.js application
window.grapheneApp = function() {
  return {
    // Tab management
    activeTab: 'biochar',
    
    // Data storage
    biocharRecords: [],
    grapheneRecords: [],
    betRecords: [],
    availableExperiments: [],
    availableLots: [],
    availableGrapheneSamples: [],
    
    // Search states
    biocharSearch: '',
    grapheneSearch: '',
    betSearch: '',
    
    // Modal states
    showAddBiochar: false,
    showAddGraphene: false,
    showAddBet: false,
    showCombineModal: false,
    showSemModal: false,
    currentSemPdf: null,
    
    // Editing states
    editingBiochar: null,
    editingGraphene: null,
    editingBet: null,
    
    // Forms
    biocharForm: { ...DEFAULT_FORMS.biochar },
    grapheneForm: { ...DEFAULT_FORMS.graphene },
    betForm: { ...DEFAULT_FORMS.bet },
    combineForm: { ...DEFAULT_FORMS.combine },
    
    // Selection states
    selectedBiocharIds: [],
    
    // Dropdown options
    rawMaterials: ['BAFA neu Hemp Fibre VF', 'Canadian Rockies Hemp'],
    acidTypes: ['Sulfuric Acid'],
    washMediums: ['Water'],
    reactors: ['AV1', 'AV5'],
    researchTeams: ['Curia - Germany'],
    baseTypes: ['KOH'],
    gases: ['Ar', 'N2'],
    washSolutions: ['HCl'],
    washWaters: ['+ Water'],
    dryingAtmospheres: ['N2 stream'],
    dryingPressures: ['atm. Pressure'],
    ovens: ['A', 'B', 'C'],
    species: ['1', '2', '1/2 Mix', 'Mostly 1', 'Mostly 2', 'Mostly 1/2 Mix', '1 + Fibres'],
    appearanceTags: ['Shiny', 'Somewhat Shiny', 'Barely Shiny', 'Black', 'Black/Grey', 'Voluminous', 'Very Voluminous'],
    
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
    
    // Import utilities as methods
    ...formatters,
    
    // Initialization
    async init() {
      await Promise.all([
        this.loadBiocharRecords(),
        this.loadGrapheneRecords(),
        this.loadBetRecords()
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
    searchBiochar: dataHelpers.debounce(async function() {
      await this.loadBiocharRecords();
    }, 300),
    
    searchGraphene: dataHelpers.debounce(async function() {
      await this.loadGrapheneRecords();
    }, 300),
    
    searchBet: dataHelpers.debounce(async function() {
      await this.loadBetRecords();
    }, 300),
    
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
      const editableFields = dataHelpers.extractEditableFields(record, ['biocharLot', 'biocharExperimentRef', 'biocharLotRef', 'betTests']);
      this.grapheneForm = { ...editableFields };
      
      // Set biocharSource based on what's populated
      if (record.biocharExperiment) {
        this.grapheneForm.biocharSource = 'exp:' + record.biocharExperiment;
      } else if (record.biocharLotNumber) {
        this.grapheneForm.biocharSource = 'lot:' + record.biocharLotNumber;
      }
      
      this.showAddGraphene = true;
    },
    
    async saveGraphene() {
      try {
        const data = validators.processGrapheneForm(this.grapheneForm);
        const file = this.grapheneForm.semReportFile;
        
        if (this.editingGraphene) {
          await API.graphene.update(this.editingGraphene.id, data, file);
        } else {
          await API.graphene.create(data, file);
        }
        
        await this.loadGrapheneRecords();
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
    
    closeGrapheneForm() {
      this.showAddGraphene = false;
      this.editingGraphene = null;
      this.grapheneForm = { ...DEFAULT_FORMS.graphene };
    },
    
    // BET CRUD operations
    editBet(record) {
      this.editingBet = record;
      const editableFields = dataHelpers.extractEditableFields(record, ['grapheneRef']);
      this.betForm = { ...editableFields };
      this.showAddBet = true;
    },
    
    async saveBet() {
      try {
        const data = validators.processBetForm(this.betForm);
        
        if (this.editingBet) {
          await API.bet.update(this.editingBet.id, data);
        } else {
          await API.bet.create(data);
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
    
    // Export methods
    exportData(type) {
      if (type === 'biochar') {
        API.biochar.exportCSV();
      } else if (type === 'graphene') {
        API.graphene.exportCSV();
      } else if (type === 'bet') {
        API.bet.exportCSV();
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
        this.currentSemPdf = semReportPath;
        this.showSemModal = true;
      }
    },
    
    closeSemModal() {
      this.showSemModal = false;
      this.currentSemPdf = null;
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
    }
  };
};