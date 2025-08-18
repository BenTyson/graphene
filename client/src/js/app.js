window.grapheneApp = function() {
  return {
    activeTab: 'biochar',
    biocharRecords: [],
    grapheneRecords: [],
    betRecords: [],
    biocharSearch: '',
    grapheneSearch: '',
    betSearch: '',
    showAddBiochar: false,
    showAddGraphene: false,
    showAddBet: false,
    showCombineModal: false,
    editingBiochar: null,
    editingGraphene: null,
    editingBet: null,
    selectedBiocharIds: [],
    combineForm: {
      lotNumber: '',
      lotName: '',
      description: ''
    },
    rawMaterials: [
      'BAFA neu Hemp Fibre VF',
      'Canadian Rockies Hemp'
    ],
    showAddMaterial: false,
    newMaterial: '',
    
    // Biochar dropdowns
    acidTypes: ['Sulfuric Acid'],
    washMediums: ['Water'],
    reactors: ['AV1', 'AV5'],
    
    // Graphene dropdowns
    baseTypes: ['KOH'],
    gases: ['Ar', 'N2'],
    washSolutions: ['HCl'],
    washWaters: ['+ Water'],
    dryingAtmospheres: ['N2 stream'],
    dryingPressures: ['atm. Pressure'],
    ovens: ['A', 'B', 'C'],
    species: ['1', '2', '1/2 Mix', 'Mostly 1', 'Mostly 2', 'Mostly 1/2 Mix', '1 + Fibres'],
    appearanceTags: ['Shiny', 'Somewhat Shiny', 'Barely Shiny', 'Black', 'Black/Grey', 'Voluminous', 'Very Voluminous'],
    availableExperiments: [],
    availableLots: [],
    availableGrapheneSamples: [],
    
    // Modal states for adding new options
    showAddAcidType: false,
    showAddWashMedium: false,
    showAddReactor: false,
    showAddBaseType: false,
    showAddGas: false,
    showAddWashSolution: false,
    showAddDryingAtmosphere: false,
    showAddDryingPressure: false,
    showAddOven: false,
    showAddAppearanceTag: false,
    
    // New values for adding
    newAcidType: '',
    newWashMedium: '',
    newReactor: '',
    newBaseType: '',
    newGas: '',
    newWashSolution: '',
    newDryingAtmosphere: '',
    newDryingPressure: '',
    newOven: '',
    newAppearanceTag: '',
    biocharForm: {
      experimentNumber: '',
      testOrder: '',
      experimentDate: '',
      dateUnknown: false,
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
    grapheneForm: {
      experimentNumber: '',
      testOrder: '',
      experimentDate: '',
      dateUnknown: false,
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
      output: '',
      comments: ''
    },
    betForm: {
      testDate: '',
      dateUnknown: false,
      grapheneSample: '',
      multipointBetArea: '',
      langmuirSurfaceArea: '',
      species: '',
      comments: ''
    },
    
    async init() {
      await this.loadBiocharRecords();
      await this.loadGrapheneRecords();
      await this.loadBetRecords();
      this.loadRawMaterials();
      this.loadAvailableExperiments();
      this.loadAvailableGrapheneSamples();
      await this.loadAvailableLots();
    },
    
    loadRawMaterials() {
      // Load unique materials from existing records
      const materials = new Set(this.rawMaterials);
      this.biocharRecords.forEach(record => {
        if (record.rawMaterial && !materials.has(record.rawMaterial)) {
          materials.add(record.rawMaterial);
        }
      });
      this.rawMaterials = Array.from(materials).sort();
    },
    
    loadAvailableExperiments() {
      // Load experiment numbers from biochar records that aren't in lots
      const experiments = new Set();
      if (Array.isArray(this.biocharRecords)) {
        this.biocharRecords.forEach(record => {
          if (record.experimentNumber && !record.lotNumber) {
            experiments.add(record.experimentNumber);
          }
        });
      }
      this.availableExperiments = Array.from(experiments).sort();
    },
    
    loadAvailableGrapheneSamples() {
      // Load experiment numbers from graphene records
      const samples = new Set();
      if (Array.isArray(this.grapheneRecords)) {
        this.grapheneRecords.forEach(record => {
          if (record.experimentNumber) {
            samples.add(record.experimentNumber);
          }
        });
      }
      this.availableGrapheneSamples = Array.from(samples).sort();
    },
    
    async loadAvailableLots() {
      try {
        const response = await fetch('/api/biochar/lots');
        this.availableLots = await response.json();
      } catch (error) {
        console.error('Failed to load available lots:', error);
        this.availableLots = [];
      }
    },
    
    async loadBiocharRecords() {
      try {
        const response = await fetch('/api/biochar');
        if (response.ok) {
          this.biocharRecords = await response.json();
          this.loadAvailableExperiments(); // Refresh experiments when biochar data changes
          await this.loadAvailableLots(); // Refresh lots when biochar data changes
        } else {
          console.error('Failed to load biochar records:', response.status);
          this.biocharRecords = [];
        }
      } catch (error) {
        console.error('Failed to load biochar records:', error);
        this.biocharRecords = [];
      }
    },
    
    async loadGrapheneRecords() {
      try {
        const response = await fetch('/api/graphene');
        if (response.ok) {
          this.grapheneRecords = await response.json();
          this.loadAvailableGrapheneSamples(); // Refresh graphene samples when data changes
        } else {
          console.error('Failed to load graphene records:', response.status);
          this.grapheneRecords = [];
        }
      } catch (error) {
        console.error('Failed to load graphene records:', error);
        this.grapheneRecords = [];
      }
    },
    
    async searchBiochar() {
      try {
        const response = await fetch(`/api/biochar?search=${encodeURIComponent(this.biocharSearch)}`);
        this.biocharRecords = await response.json();
      } catch (error) {
        console.error('Failed to search biochar records:', error);
      }
    },
    
    async searchGraphene() {
      try {
        const response = await fetch(`/api/graphene?search=${encodeURIComponent(this.grapheneSearch)}`);
        this.grapheneRecords = await response.json();
      } catch (error) {
        console.error('Failed to search graphene records:', error);
      }
    },
    
    async loadBetRecords() {
      try {
        const response = await fetch('/api/bet');
        if (response.ok) {
          this.betRecords = await response.json();
        } else {
          console.error('Failed to load BET records:', response.status);
          this.betRecords = [];
        }
      } catch (error) {
        console.error('Failed to load BET records:', error);
        this.betRecords = [];
      }
    },
    
    async searchBet() {
      try {
        const response = await fetch(`/api/bet?search=${encodeURIComponent(this.betSearch)}`);
        this.betRecords = await response.json();
      } catch (error) {
        console.error('Failed to search BET records:', error);
      }
    },
    
    formatAcid(record) {
      const parts = [];
      if (record.acidAmount) parts.push(`${record.acidAmount}g`);
      if (record.acidConcentration) parts.push(`${record.acidConcentration}%`);
      if (record.acidMolarity) parts.push(`${record.acidMolarity}M`);
      if (record.acidType) parts.push(record.acidType);
      return parts.join(' | ');
    },
    
    formatBase(record) {
      const parts = [];
      if (record.baseAmount) parts.push(`${record.baseAmount}g`);
      if (record.baseType) parts.push(record.baseType);
      if (record.baseConcentration) parts.push(`${record.baseConcentration}%`);
      return parts.join(' | ');
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Unknown';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    },
    
    editBiochar(record) {
      this.editingBiochar = record;
      // Copy only the fields that should be editable
      const { id, createdAt, updatedAt, _count, grapheneProductions, lot, lotNumber, ...editableFields } = record;
      this.biocharForm = { ...editableFields };
      this.showAddBiochar = true;
    },
    
    editGraphene(record) {
      this.editingGraphene = record;
      // Copy only the fields that should be editable
      const { id, createdAt, updatedAt, biocharLot, biocharExperimentRef, biocharLotRef, betTests, ...editableFields } = record;
      this.grapheneForm = { ...editableFields };
      
      // Set biocharSource based on what's populated
      if (record.biocharExperiment) {
        this.grapheneForm.biocharSource = 'exp:' + record.biocharExperiment;
      } else if (record.biocharLotNumber) {
        this.grapheneForm.biocharSource = 'lot:' + record.biocharLotNumber;
      } else {
        this.grapheneForm.biocharSource = '';
      }
      
      this.showAddGraphene = true;
    },
    
    async saveBiochar() {
      try {
        const url = this.editingBiochar 
          ? `/api/biochar/${this.editingBiochar.id}` 
          : '/api/biochar';
        const method = this.editingBiochar ? 'PUT' : 'POST';
        
        // Convert string numbers to actual numbers
        const data = { ...this.biocharForm };
        
        // Handle date
        if (data.dateUnknown || !data.experimentDate) {
          data.experimentDate = null;
        }
        delete data.dateUnknown;
        
        ['startingAmount', 'acidAmount', 'acidConcentration', 'acidMolarity', 'temperature', 'time', 
         'pressureInitial', 'pressureFinal', 'washAmount', 'output', 'dryingTemp', 
         'kftPercentage', 'testOrder'].forEach(field => {
          if (data[field] === '' || data[field] === null || data[field] === undefined) {
            data[field] = null;
          } else if (data[field]) {
            data[field] = field === 'testOrder' ? parseInt(data[field]) : parseFloat(data[field]);
          }
        });
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          await this.loadBiocharRecords();
          this.showAddBiochar = false;
          this.editingBiochar = null;
          this.biocharForm = {};
        } else {
          const errorData = await response.json();
          console.error('Server error:', errorData);
          alert(`Failed to save record: ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Failed to save biochar record:', error);
        alert('Failed to save record. Please try again.');
      }
    },
    
    async saveGraphene() {
      try {
        const url = this.editingGraphene 
          ? `/api/graphene/${this.editingGraphene.id}` 
          : '/api/graphene';
        const method = this.editingGraphene ? 'PUT' : 'POST';
        
        // Convert string numbers to actual numbers
        const data = { ...this.grapheneForm };
        
        // Handle date
        if (data.dateUnknown || !data.experimentDate) {
          data.experimentDate = null;
        }
        delete data.dateUnknown;
        
        ['quantity', 'baseAmount', 'baseConcentration', 'grindingTime', 
         'tempMax', 'time', 'washAmount', 'washConcentration', 'dryingTemp', 
         'volumeMl', 'density', 'output', 'testOrder'].forEach(field => {
          if (data[field] === '' || data[field] === null || data[field] === undefined) {
            data[field] = null;
          } else if (data[field]) {
            data[field] = field === 'testOrder' ? parseInt(data[field]) : parseFloat(data[field]);
          }
        });
        
        // Handle homogeneous boolean conversion
        if (data.homogeneous === 'true') data.homogeneous = true;
        else if (data.homogeneous === 'false') data.homogeneous = false;
        else if (data.homogeneous === '' || data.homogeneous === null || data.homogeneous === undefined) data.homogeneous = null;
        else data.homogeneous = null;
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          await this.loadGrapheneRecords();
          this.showAddGraphene = false;
          this.editingGraphene = null;
          this.grapheneForm = {};
        } else {
          const errorData = await response.json();
          console.error('Server error:', errorData);
          alert(`Failed to save record: ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Failed to save graphene record:', error);
        alert('Failed to save record. Please try again.');
      }
    },
    
    async deleteBiochar(id) {
      if (!confirm('Are you sure you want to delete this record?')) return;
      
      try {
        await fetch(`/api/biochar/${id}`, { method: 'DELETE' });
        await this.loadBiocharRecords();
      } catch (error) {
        console.error('Failed to delete biochar record:', error);
      }
    },
    
    async deleteGraphene(id) {
      if (!confirm('Are you sure you want to delete this record?')) return;
      
      try {
        await fetch(`/api/graphene/${id}`, { method: 'DELETE' });
        await this.loadGrapheneRecords();
      } catch (error) {
        console.error('Failed to delete graphene record:', error);
      }
    },
    
    async exportData(type) {
      let url;
      if (type === 'biochar') {
        url = '/api/biochar/export/csv';
      } else if (type === 'graphene') {
        url = '/api/graphene/export/csv';
      } else if (type === 'bet') {
        url = '/api/bet/export/csv';
      }
      window.open(url, '_blank');
    },
    
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
    
    toggleAppearanceTag(tag) {
      const index = this.grapheneForm.appearanceTags.indexOf(tag);
      if (index > -1) {
        this.grapheneForm.appearanceTags.splice(index, 1);
      } else {
        this.grapheneForm.appearanceTags.push(tag);
      }
    },
    
    formatAppearanceTags(tags) {
      return tags && tags.length > 0 ? tags.join(', ') : '';
    },
    
    calculateOutputPercentage(record) {
      // Calculate output percentage based on quantity (input) and output
      if (record.quantity && record.output && record.quantity > 0) {
        const percentage = (record.output / record.quantity) * 100;
        return percentage.toFixed(1) + '%';
      }
      return '';
    },
    
    formatScientificNotation(value) {
      // Format scientific notation values like 1.520e3 or regular numbers
      if (!value) return '';
      
      const num = parseFloat(value);
      if (isNaN(num)) return value; // Return as-is if not a number
      
      // If the number is large (>= 1000), show in scientific notation
      if (num >= 1000) {
        return num.toExponential(3);
      }
      // Otherwise show as regular number with appropriate decimal places
      return num.toFixed(3);
    },
    
    editBet(record) {
      this.editingBet = record;
      // Copy only the fields that should be editable
      const { id, createdAt, updatedAt, grapheneRef, ...editableFields } = record;
      this.betForm = { ...editableFields };
      this.showAddBet = true;
    },
    
    async saveBet() {
      try {
        const url = this.editingBet 
          ? `/api/bet/${this.editingBet.id}` 
          : '/api/bet';
        const method = this.editingBet ? 'PUT' : 'POST';
        
        // Convert string numbers to actual numbers
        const data = { ...this.betForm };
        
        // Handle date
        if (data.dateUnknown || !data.testDate) {
          data.testDate = null;
        }
        delete data.dateUnknown;
        
        // Handle numeric fields
        ['multipointBetArea', 'langmuirSurfaceArea'].forEach(field => {
          if (data[field] === '' || data[field] === null || data[field] === undefined) {
            data[field] = null;
          } else if (data[field]) {
            data[field] = parseFloat(data[field]);
          }
        });
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          await this.loadBetRecords();
          this.showAddBet = false;
          this.editingBet = null;
          this.betForm = {};
        } else {
          const errorData = await response.json();
          console.error('Server error:', errorData);
          alert(`Failed to save record: ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Failed to save BET record:', error);
        alert('Failed to save record. Please try again.');
      }
    },
    
    async deleteBet(id) {
      if (!confirm('Are you sure you want to delete this record?')) return;
      
      try {
        await fetch(`/api/bet/${id}`, { method: 'DELETE' });
        await this.loadBetRecords();
      } catch (error) {
        console.error('Failed to delete BET record:', error);
      }
    },
    
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
        
        const response = await fetch('/api/biochar/combine-lot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lotNumber: this.combineForm.lotNumber.trim(),
            lotName: this.combineForm.lotName.trim() || null,
            description: this.combineForm.description.trim() || null,
            experimentIds: this.selectedBiocharIds
          })
        });
        
        if (response.ok) {
          const selectedCount = this.selectedBiocharIds.length;
          const lotNumber = this.combineForm.lotNumber;
          await this.loadBiocharRecords();
          this.showCombineModal = false;
          this.selectedBiocharIds = [];
          this.combineForm = { lotNumber: '', lotName: '', description: '' };
          alert(`Successfully created lot ${lotNumber} with ${selectedCount} experiments.`);
        } else {
          const errorData = await response.json();
          alert(`Failed to create lot: ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Failed to combine biochar into lot:', error);
        alert('Failed to create lot. Please try again.');
      }
    },
    
  };
};