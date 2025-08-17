window.grapheneApp = function() {
  return {
    activeTab: 'biochar',
    biocharRecords: [],
    grapheneRecords: [],
    biocharSearch: '',
    grapheneSearch: '',
    showAddBiochar: false,
    showAddGraphene: false,
    editingBiochar: null,
    editingGraphene: null,
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
    gases: ['Ar'],
    washSolutions: ['HCl'],
    dryingAtmospheres: ['N2 stream'],
    ovens: ['A', 'B', 'C'],
    species: ['1', '2', '1/2 Mix', 'Mostly 1', 'Mostly 2', 'Mostly 1/2 Mix', '1 + Fibres'],
    availableExperiments: [],
    
    // Modal states for adding new options
    showAddAcidType: false,
    showAddWashMedium: false,
    showAddReactor: false,
    showAddBaseType: false,
    showAddGas: false,
    showAddWashSolution: false,
    showAddDryingAtmosphere: false,
    showAddOven: false,
    
    // New values for adding
    newAcidType: '',
    newWashMedium: '',
    newReactor: '',
    newBaseType: '',
    newGas: '',
    newWashSolution: '',
    newDryingAtmosphere: '',
    newOven: '',
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
      baseAmount: '',
      baseType: '',
      baseConcentration: '',
      grindingMethod: '',
      grindingTime: '',
      gas: '',
      tempRate: '',
      tempMax: '',
      time: '',
      washAmount: '',
      washSolution: '',
      dryingTemp: '',
      dryingAtmosphere: '',
      dryingPressure: '',
      output: '',
      volume: '',
      species: '',
      appearance: '',
      comments: ''
    },
    
    async init() {
      await this.loadBiocharRecords();
      await this.loadGrapheneRecords();
      this.loadRawMaterials();
      this.loadAvailableExperiments();
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
      // Load experiment numbers from biochar records
      const experiments = new Set();
      this.biocharRecords.forEach(record => {
        if (record.experimentNumber) {
          experiments.add(record.experimentNumber);
        }
      });
      this.availableExperiments = Array.from(experiments).sort();
    },
    
    async loadBiocharRecords() {
      try {
        const response = await fetch('/api/biochar');
        this.biocharRecords = await response.json();
        this.loadAvailableExperiments(); // Refresh experiments when biochar data changes
      } catch (error) {
        console.error('Failed to load biochar records:', error);
      }
    },
    
    async loadGrapheneRecords() {
      try {
        const response = await fetch('/api/graphene');
        this.grapheneRecords = await response.json();
      } catch (error) {
        console.error('Failed to load graphene records:', error);
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
      this.biocharForm = { ...record };
      this.showAddBiochar = true;
    },
    
    editGraphene(record) {
      this.editingGraphene = record;
      this.grapheneForm = { ...record };
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
          if (data[field]) data[field] = field === 'testOrder' ? parseInt(data[field]) : parseFloat(data[field]);
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
         'tempMax', 'time', 'washAmount', 'dryingTemp', 'output', 
         'volume', 'testOrder'].forEach(field => {
          if (data[field]) data[field] = field === 'testOrder' ? parseInt(data[field]) : parseFloat(data[field]);
        });
        
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
      const url = type === 'biochar' ? '/api/biochar/export/csv' : '/api/graphene/export/csv';
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
    
    addNewOven() {
      if (this.newOven && !this.ovens.includes(this.newOven)) {
        this.ovens.push(this.newOven);
        this.grapheneForm.oven = this.newOven;
        this.newOven = '';
        this.showAddOven = false;
      }
    },
    
  };
};