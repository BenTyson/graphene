/**
 * CRUD Service
 * Centralized service for all Create, Read, Update, Delete operations
 * Extracted from app-refactored.js for better maintainability
 */

import { DEFAULT_FORMS } from '../utils/constants.js';
import API from './api.js';
import dataHelpers from '../utils/dataHelpers.js';
import validators from '../utils/validators.js';
import formatters from '../utils/formatters.js';

class CRUDService {
  constructor() {
    // Service will operate on the main app context passed to methods
  }

  // Biochar CRUD operations
  editBiochar(record, appContext) {
    appContext.editingBiochar = record;
    const editableFields = dataHelpers.extractEditableFields(record, ['grapheneProductions', 'lot', 'lotNumber']);
    appContext.biocharForm = { ...editableFields };
    appContext.showAddBiochar = true;
  }

  copyBiochar(record, appContext) {
    appContext.editingBiochar = null;
    const editableFields = dataHelpers.extractEditableFields(record, ['grapheneProductions', 'lot', 'lotNumber', 'experimentNumber']);
    appContext.biocharForm = { 
      ...editableFields,
      experimentNumber: '',
      testOrder: record.testOrder ? record.testOrder + 1 : null
    };
    appContext.showAddBiochar = true;
  }

  async saveBiochar(appContext) {
    try {
      const data = validators.processBiocharForm(appContext.biocharForm);
      
      if (appContext.editingBiochar) {
        await API.biochar.update(appContext.editingBiochar.id, data);
      } else {
        await API.biochar.create(data);
      }
      
      await appContext.loadBiocharRecords();
      this.closeBiocharForm(appContext);
    } catch (error) {
      console.error('Failed to save biochar record:', error);
      alert(`Failed to save record: ${error.message}`);
    }
  }

  async deleteBiochar(id, appContext) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await API.biochar.delete(id);
      await appContext.loadBiocharRecords();
    } catch (error) {
      console.error('Failed to delete biochar record:', error);
      alert(`Failed to delete record: ${error.message}`);
    }
  }

  closeBiocharForm(appContext) {
    appContext.showAddBiochar = false;
    appContext.editingBiochar = null;
    appContext.biocharForm = { ...DEFAULT_FORMS.biochar };
  }

  // Graphene CRUD operations
  editGraphene(record, appContext) {
    appContext.editingGraphene = record;
    const editableFields = dataHelpers.extractEditableFields(record, ['biocharLot', 'biocharExperimentRef', 'biocharLotRef', 'betTests', 'updateReports']);
    appContext.grapheneForm = { ...editableFields };
    
    // Ensure appearanceTags is always an array
    if (!appContext.grapheneForm.appearanceTags || !Array.isArray(appContext.grapheneForm.appearanceTags)) {
      appContext.grapheneForm.appearanceTags = [];
    }
    
    // Set biocharSource based on what's populated
    if (record.biocharExperiment) {
      appContext.grapheneForm.biocharSource = 'exp:' + record.biocharExperiment;
    } else if (record.biocharLotNumber) {
      appContext.grapheneForm.biocharSource = 'lot:' + record.biocharLotNumber;
    } else {
      appContext.grapheneForm.biocharSource = '';  // Could be 'various' or empty
    }
    
    // Initialize SEM-related flags
    appContext.grapheneForm.removeSemReport = false;
    appContext.grapheneForm.replaceSemReport = false;
    
    // Initialize update report IDs from existing associations
    appContext.grapheneForm.updateReportIds = record.updateReports?.map(ur => ur.updateReportId) || [];
    
    appContext.showAddGraphene = true;
  }

  copyGraphene(record, appContext) {
    appContext.editingGraphene = null;
    const editableFields = dataHelpers.extractEditableFields(record, ['biocharLot', 'biocharExperimentRef', 'biocharLotRef', 'betTests', 'updateReports', 'experimentNumber', 'semReportPath']);
    appContext.grapheneForm = { 
      ...editableFields,
      experimentNumber: '',
      testOrder: record.testOrder ? record.testOrder + 1 : null
    };
    
    // Ensure appearanceTags is always an array
    if (!appContext.grapheneForm.appearanceTags || !Array.isArray(appContext.grapheneForm.appearanceTags)) {
      appContext.grapheneForm.appearanceTags = [];
    }
    
    // Set biocharSource based on what's populated
    if (record.biocharExperiment) {
      appContext.grapheneForm.biocharSource = 'exp:' + record.biocharExperiment;
    } else if (record.biocharLotNumber) {
      appContext.grapheneForm.biocharSource = 'lot:' + record.biocharLotNumber;
    } else {
      appContext.grapheneForm.biocharSource = '';  // Could be 'various' or empty
    }
    
    // Initialize SEM-related flags
    appContext.grapheneForm.removeSemReport = false;
    appContext.grapheneForm.replaceSemReport = false;
    
    // Copy update report associations from original record
    appContext.grapheneForm.updateReportIds = record.updateReports?.map(ur => ur.updateReportId) || [];
    
    appContext.showAddGraphene = true;
  }

  async saveGraphene(appContext) {
    try {
      const data = validators.processGrapheneForm(appContext.grapheneForm);
      const file = appContext.grapheneForm.semReportFile;
      
      // Add removal flag if user wants to remove SEM report
      if (appContext.grapheneForm.removeSemReport) {
        data.removeSemReport = true;
      }
      
      if (appContext.editingGraphene) {
        await API.graphene.update(appContext.editingGraphene.id, data, file);
      } else {
        await API.graphene.create(data, file);
      }
      
      await appContext.loadGrapheneRecords();
      await appContext.loadSemReports(); // Refresh SEM reports if one was uploaded
      this.closeGrapheneForm(appContext);
    } catch (error) {
      console.error('Failed to save graphene record:', error);
      alert(`Failed to save record: ${error.message}`);
    }
  }

  async deleteGraphene(id, appContext) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await API.graphene.delete(id);
      await appContext.loadGrapheneRecords();
    } catch (error) {
      console.error('Failed to delete graphene record:', error);
      alert(`Failed to delete record: ${error.message}`);
    }
  }

  async removeSemReportAssociation(semReportId, appContext) {
    if (!confirm('Remove the association between this SEM report and the graphene experiment?')) return;
    
    try {
      await API.semReport.removeGrapheneAssociation(semReportId, appContext.editingGraphene.id);
      
      // Update the editingGraphene record to reflect the change
      appContext.editingGraphene.semReports = appContext.editingGraphene.semReports.filter(
        sr => sr.semReport.id !== semReportId
      );
      
      // Also refresh the main graphene list
      await appContext.loadGrapheneRecords();
      
      alert('SEM report association removed successfully');
    } catch (error) {
      console.error('Failed to remove SEM report association:', error);
      alert(`Failed to remove association: ${error.message}`);
    }
  }

  closeGrapheneForm(appContext) {
    appContext.showAddGraphene = false;
    appContext.editingGraphene = null;
    appContext.grapheneForm = { ...DEFAULT_FORMS.graphene };
    // Ensure appearanceTags is always an array
    appContext.grapheneForm.appearanceTags = [];
    // Reset SEM-related flags
    appContext.grapheneForm.removeSemReport = false;
    appContext.grapheneForm.replaceSemReport = false;
    // Reset update report IDs
    appContext.grapheneForm.updateReportIds = [];
  }

  // BET CRUD operations
  editBet(record, appContext) {
    appContext.editingBet = record;
    appContext.betForm = {
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
    appContext.showAddBet = true;
  }

  async saveBet(appContext) {
    try {
      // Extract file before processing
      const file = appContext.betForm.betReportFile;
      
      // Process form data through validator
      const data = validators.processBetForm(appContext.betForm);
      
      if (appContext.editingBet) {
        await API.bet.update(appContext.editingBet.id, data, file);
      } else {
        await API.bet.create(data, file);
      }
      
      await appContext.loadBetRecords();
      this.closeBetForm(appContext);
    } catch (error) {
      console.error('Failed to save BET record:', error);
      alert(`Failed to save record: ${error.message}`);
    }
  }

  async deleteBet(id, appContext) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await API.bet.delete(id);
      await appContext.loadBetRecords();
    } catch (error) {
      console.error('Failed to delete BET record:', error);
      alert(`Failed to delete record: ${error.message}`);
    }
  }

  closeBetForm(appContext) {
    appContext.showAddBet = false;
    appContext.editingBet = null;
    appContext.betForm = { ...DEFAULT_FORMS.bet };
  }

  // Conductivity CRUD operations
  editConductivity(record, appContext) {
    appContext.editingConductivity = record;
    appContext.conductivityForm = {
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
    appContext.showAddConductivity = true;
  }

  async saveConductivity(appContext) {
    try {
      // Extract file before processing
      const file = appContext.conductivityForm.conductivityReportFile;
      
      const data = { ...appContext.conductivityForm };
      
      if (data.dateUnknown) {
        data.testDate = null;
      }
      delete data.dateUnknown;
      delete data.conductivityReportFile; // Remove file from data object
      delete data.conductivityReportPath; // Don't send the path from frontend
      delete data.replaceConductivityReport; // Remove UI-only field
      
      if (appContext.editingConductivity) {
        await API.conductivity.update(appContext.editingConductivity.id, data, file);
      } else {
        await API.conductivity.create(data, file);
      }
      
      await appContext.loadConductivityRecords();
      this.closeConductivityForm(appContext);
    } catch (error) {
      console.error('Failed to save conductivity record:', error);
      alert(`Failed to save record: ${error.message}`);
    }
  }

  async deleteConductivity(id, appContext) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await API.conductivity.delete(id);
      await appContext.loadConductivityRecords();
    } catch (error) {
      console.error('Failed to delete conductivity record:', error);
      alert(`Failed to delete record: ${error.message}`);
    }
  }

  closeConductivityForm(appContext) {
    appContext.showAddConductivity = false;
    appContext.editingConductivity = null;
    appContext.conductivityForm = { ...DEFAULT_FORMS.conductivity };
  }

  // RAMAN Test management
  editRaman(record, appContext) {
    appContext.editingRaman = record;
    appContext.ramanForm = {
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
    appContext.showAddRaman = true;
  }

  async saveRaman(appContext) {
    try {
      const data = { ...appContext.ramanForm };
      
      if (data.dateUnknown) {
        data.testDate = null;
      }
      delete data.dateUnknown;
      
      // Handle file removal
      if (data.removeRamanReport) {
        data.removeRamanReport = 'true';
      }
      
      let result;
      if (appContext.editingRaman) {
        result = await API.raman.update(appContext.editingRaman.id, data, data.ramanReportFile);
      } else {
        result = await API.raman.create(data, data.ramanReportFile);
      }
      
      await appContext.loadRamanRecords();
      this.closeRamanForm(appContext);
    } catch (error) {
      console.error('Failed to save RAMAN record:', error);
      alert(`Failed to save record: ${error.message}`);
    }
  }

  async deleteRaman(id, appContext) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await API.raman.delete(id);
      await appContext.loadRamanRecords();
    } catch (error) {
      console.error('Failed to delete RAMAN record:', error);
      alert(`Failed to delete record: ${error.message}`);
    }
  }

  closeRamanForm(appContext) {
    appContext.showAddRaman = false;
    appContext.editingRaman = null;
    appContext.ramanForm = { ...DEFAULT_FORMS.raman };
  }

  // TEM CRUD operations
  editTem(record, appContext) {
    appContext.editingTem = record;
    appContext.temForm = {
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
    appContext.showAddTem = true;
  }

  async saveTem(appContext) {
    try {
      // Extract file before processing
      const file = appContext.temForm.temReportFile;
      
      // Create clean data object
      const data = { ...appContext.temForm };
      
      // Remove file and UI fields
      delete data.temReportFile;
      
      // Handle report removal
      if (data.removeTEMReport) {
        data.removeTEMReport = 'true';
      }
      
      let result;
      if (appContext.editingTem) {
        result = await API.tem.update(appContext.editingTem.id, data, file);
      } else {
        result = await API.tem.create(data, file);
      }
      
      await appContext.loadTemRecords();
      this.closeTemForm(appContext);
    } catch (error) {
      console.error('Failed to save TEM record:', error);
      alert(`Failed to save record: ${error.message}`);
    }
  }

  async deleteTem(id, appContext) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await API.tem.delete(id);
      await appContext.loadTemRecords();
    } catch (error) {
      console.error('Failed to delete TEM record:', error);
      alert(`Failed to delete record: ${error.message}`);
    }
  }

  closeTemForm(appContext) {
    appContext.showAddTem = false;
    appContext.editingTem = null;
    appContext.temForm = { ...DEFAULT_FORMS.tem };
  }

  // Update Report CRUD operations
  editUpdateReport(record, appContext) {
    appContext.editingUpdateReport = record;
    appContext.updateReportForm = {
      description: record.description || '',
      weekOf: record.weekOf ? record.weekOf.split('T')[0] : '',
      grapheneIds: record.grapheneReports?.map(gr => gr.grapheneId) || [],
      updateFile: null
    };
    appContext.showAddUpdateReport = true;
  }

  async saveUpdateReport(appContext) {
    try {
      const data = { ...appContext.updateReportForm };
      const file = appContext.updateReportForm.updateFile;
      
      // Remove the file object from data since it's handled separately
      delete data.updateFile;
      
      if (appContext.editingUpdateReport) {
        // For edit, file is optional
        await API.updateReport.update(appContext.editingUpdateReport.id, data, file);
      } else {
        if (!file) {
          alert('Please select an update report file');
          return;
        }
        await API.updateReport.create(data, file);
      }
      
      await appContext.loadUpdateReports();
      await appContext.loadGrapheneRecords(); // Refresh graphene records to show new associations
      this.closeUpdateReportForm(appContext);
    } catch (error) {
      console.error('Failed to save update report:', error);
      alert(`Failed to save update report: ${error.message}`);
    }
  }

  async deleteUpdateReport(id, appContext) {
    if (!confirm('Are you sure you want to delete this update report?')) return;
    
    try {
      await API.updateReport.delete(id);
      await appContext.loadUpdateReports();
      await appContext.loadGrapheneRecords(); // Refresh graphene records to update associations
    } catch (error) {
      console.error('Failed to delete update report:', error);
      alert(`Failed to delete update report: ${error.message}`);
    }
  }

  closeUpdateReportForm(appContext) {
    appContext.showAddUpdateReport = false;
    appContext.editingUpdateReport = null;
    appContext.updateReportForm = { ...DEFAULT_FORMS.updateReport };
  }

  viewUpdateReport(filePath, appContext) {
    if (filePath) {
      appContext.currentUpdateReport = filePath + '#navpanes=0&toolbar=0';
      appContext.showUpdateReportModal = true;
    }
  }

  closeUpdateReportModal(appContext) {
    appContext.showUpdateReportModal = false;
    appContext.currentUpdateReport = null;
  }

  handleUpdateFileChange(event, appContext) {
    const file = event.target.files[0];
    const validation = validators.validatePDFFile(file);
    
    if (validation.isValid) {
      appContext.updateReportForm.updateFile = file;
    } else {
      alert(validation.message);
      event.target.value = '';
      appContext.updateReportForm.updateFile = null;
    }
  }

  toggleGrapheneSelection(grapheneId, appContext) {
    const index = appContext.updateReportForm.grapheneIds.indexOf(grapheneId);
    if (index > -1) {
      appContext.updateReportForm.grapheneIds.splice(index, 1);
    } else {
      appContext.updateReportForm.grapheneIds.push(grapheneId);
    }
  }

  // New Update Report functions for compound batch support
  toggleUpdateReportGraphene(grapheneId, appContext) {
    const index = appContext.updateReportForm.grapheneIds.indexOf(grapheneId);
    if (index > -1) {
      appContext.updateReportForm.grapheneIds.splice(index, 1);
    } else {
      appContext.updateReportForm.grapheneIds.push(grapheneId);
    }
  }

  toggleUpdateReportCompoundBatch(batchId, appContext) {
    const index = appContext.updateReportForm.compoundBatchIds.indexOf(batchId);
    if (index > -1) {
      appContext.updateReportForm.compoundBatchIds.splice(index, 1);
    } else {
      appContext.updateReportForm.compoundBatchIds.push(batchId);
    }
  }

  filterUpdateReportMaterials(appContext) {
    const searchTerm = appContext.updateReportSearchTerm.toLowerCase();
    
    // Filter graphene experiments
    if (!searchTerm) {
      appContext.filteredGrapheneForUpdate = appContext.grapheneRecords;
    } else {
      appContext.filteredGrapheneForUpdate = appContext.grapheneRecords.filter(g => 
        g.experimentNumber?.toLowerCase().includes(searchTerm) ||
        g.species?.toLowerCase().includes(searchTerm) ||
        (g.experimentDate && formatters.formatDate(g.experimentDate).toLowerCase().includes(searchTerm))
      );
    }
    
    // Filter compound batches
    if (!searchTerm) {
      appContext.filteredCompoundBatchesForUpdate = appContext.compoundBatchRecords;
    } else {
      appContext.filteredCompoundBatchesForUpdate = appContext.compoundBatchRecords.filter(b => 
        b.batchNumber?.toLowerCase().includes(searchTerm) ||
        b.batchName?.toLowerCase().includes(searchTerm) ||
        b.description?.toLowerCase().includes(searchTerm)
      );
    }
  }

  // SEM Report methods
  async saveSemReport(appContext) {
    try {
      const files = appContext.semReportForm.semFiles;
      
      console.log('Saving SEM report, files:', files);
      console.log('Is editing:', appContext.editingSemReport);
      console.log('Files length:', files ? files.length : 0);
      
      // Only require files for new uploads, not edits
      if (!appContext.editingSemReport && (!files || files.length === 0)) {
        alert('Please select at least one PDF file to upload');
        return;
      }
      
      const data = {
        reportDate: appContext.semReportForm.reportDate,
        grapheneIds: appContext.semReportForm.grapheneIds,
        compoundBatchIds: appContext.semReportForm.compoundBatchIds
      };
      
      if (appContext.editingSemReport) {
        await API.semReport.update(appContext.editingSemReport.id, data);
      } else {
        await API.semReport.create(data, files);
      }
      
      await appContext.loadSemReports();
      this.closeSemReportForm(appContext);
    } catch (error) {
      console.error('Failed to save SEM report:', error);
      alert(`Failed to save SEM report: ${error.message}`);
    }
  }

  editSemReport(record, appContext) {
    appContext.editingSemReport = record;
    appContext.semReportForm = {
      reportDate: record.reportDate ? new Date(record.reportDate).toISOString().split('T')[0] : '',
      grapheneIds: record.grapheneReports ? record.grapheneReports.map(gr => gr.graphene.id) : [],
      compoundBatchIds: record.compoundBatchReports ? record.compoundBatchReports.map(cbr => cbr.compoundBatch.id) : [],
      semFiles: null
    };
    appContext.showAddSemReport = true;
  }

  async deleteSemReport(id, appContext) {
    if (confirm('Are you sure you want to delete this SEM report?')) {
      try {
        await API.semReport.delete(id);
        await appContext.loadSemReports();
      } catch (error) {
        console.error('Failed to delete SEM report:', error);
        alert(`Failed to delete SEM report: ${error.message}`);
      }
    }
  }

  closeSemReportForm(appContext) {
    appContext.showAddSemReport = false;
    appContext.editingSemReport = null;
    appContext.semReportForm = { ...DEFAULT_FORMS.semReport };
  }

  viewSemPdf(filePath, appContext) {
    if (filePath) {
      appContext.currentSemPdf = filePath + '#navpanes=0&toolbar=0';
      appContext.showSemModal = true;
    }
  }

  closeSemModal(appContext) {
    appContext.showSemModal = false;
    appContext.currentSemPdf = null;
  }

  handleSemFileChange(event, appContext) {
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
      appContext.semReportForm.semFiles = filesArray;
      console.log('Files stored in form:', appContext.semReportForm.semFiles);
      console.log('Form state after file selection:', appContext.semReportForm);
    } else {
      event.target.value = null;
      appContext.semReportForm.semFiles = null;
    }
  }

  toggleSemGrapheneSelection(grapheneId, appContext) {
    const index = appContext.semReportForm.grapheneIds.indexOf(grapheneId);
    if (index > -1) {
      appContext.semReportForm.grapheneIds.splice(index, 1);
    } else {
      appContext.semReportForm.grapheneIds.push(grapheneId);
    }
  }

  toggleSemCompoundBatchSelection(compoundBatchId, appContext) {
    const index = appContext.semReportForm.compoundBatchIds.indexOf(compoundBatchId);
    if (index > -1) {
      appContext.semReportForm.compoundBatchIds.splice(index, 1);
    } else {
      appContext.semReportForm.compoundBatchIds.push(compoundBatchId);
    }
  }

  // Compound Batch CRUD operations
  async saveCompoundBatch(appContext) {
    try {
      const data = { ...appContext.compoundBatchForm };
      delete data.experimentIds;
      delete data.dateUnknown;
      
      // Handle date field
      if (data.createdDate === '' || appContext.compoundBatchForm.dateUnknown) {
        data.createdDate = null;
      }
      
      let result;
      if (appContext.editingCompoundBatch) {
        result = await API.compoundBatch.update(appContext.editingCompoundBatch.id, {
          ...data,
          experimentIds: appContext.compoundBatchForm.experimentIds
        });
      } else {
        result = await API.compoundBatch.create({
          ...data,
          experimentIds: appContext.compoundBatchForm.experimentIds
        });
      }
      
      await appContext.loadCompoundBatches();
      this.closeCompoundBatchForm(appContext);
    } catch (error) {
      console.error('Failed to save compound batch:', error);
      alert(`Failed to save compound batch: ${error.message}`);
    }
  }

  editCompoundBatch(batch, appContext) {
    appContext.editingCompoundBatch = batch;
    appContext.compoundBatchForm = {
      batchNumber: batch.batchNumber || '',
      batchName: batch.batchName || '',
      createdDate: batch.createdDate ? new Date(batch.createdDate).toISOString().split('T')[0] : '',
      dateUnknown: !batch.createdDate,
      totalOutput: batch.totalOutput || '',
      description: batch.description || '',
      experimentIds: batch.experiments ? batch.experiments.map(exp => exp.grapheneId) : []
    };
    appContext.showCompoundBatchModal = true;
  }

  async deleteCompoundBatch(id, appContext) {
    if (confirm('Are you sure you want to delete this compound batch? This will not delete the individual graphene experiments.')) {
      try {
        await API.compoundBatch.delete(id);
        await appContext.loadCompoundBatches();
      } catch (error) {
        console.error('Failed to delete compound batch:', error);
        alert(`Failed to delete compound batch: ${error.message}`);
      }
    }
  }

  closeCompoundBatchForm(appContext) {
    appContext.showCompoundBatchModal = false;
    appContext.editingCompoundBatch = null;
    appContext.compoundBatchForm = { ...DEFAULT_FORMS.compoundBatch };
    appContext.selectedGrapheneIds = [];
    appContext.experimentSearchTerm = '';
  }

  toggleGrapheneSelection(grapheneId, appContext) {
    const index = appContext.selectedGrapheneIds.indexOf(grapheneId);
    if (index > -1) {
      appContext.selectedGrapheneIds.splice(index, 1);
    } else {
      appContext.selectedGrapheneIds.push(grapheneId);
    }
    
    // Update form
    appContext.compoundBatchForm.experimentIds = [...appContext.selectedGrapheneIds];
  }

  // Compound Batch Management Tab Functions
  openCompoundBatchForm(appContext) {
    appContext.compoundBatchForm = { ...DEFAULT_FORMS.compoundBatch };
    appContext.editingCompoundBatch = null;
    appContext.experimentSearchTerm = '';
    appContext.showCompoundBatchModal = true;
  }

  async searchCompoundBatches(appContext) {
    try {
      appContext.compoundBatchRecords = await API.compoundBatch.getAll(appContext.compoundBatchSearch);
    } catch (error) {
      console.error('Failed to search compound batches:', error);
    }
  }

  sortCompoundBatches(column, appContext) {
    if (appContext.compoundBatchSortColumn === column) {
      appContext.compoundBatchSortOrder = appContext.compoundBatchSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      appContext.compoundBatchSortColumn = column;
      appContext.compoundBatchSortOrder = 'asc';
    }
    
    appContext.compoundBatchRecords.sort((a, b) => {
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
      
      if (aVal < bVal) return appContext.compoundBatchSortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return appContext.compoundBatchSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getCompoundBatchSortIcon(column, appContext) {
    if (appContext.compoundBatchSortColumn !== column) return '';
    return appContext.compoundBatchSortOrder === 'asc' 
      ? '<svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>'
      : '<svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd"/></svg>';
  }

  // Modal experiment selection functions
  getFilteredExperiments(appContext) {
    if (!appContext.grapheneRecords || appContext.grapheneRecords.length === 0) {
      return [];
    }
    
    if (!appContext.experimentSearchTerm) {
      return appContext.grapheneRecords;
    }
    
    const searchTerm = appContext.experimentSearchTerm.toLowerCase();
    return appContext.grapheneRecords.filter(record => {
      return (
        (record.experimentNumber && record.experimentNumber.toLowerCase().includes(searchTerm)) ||
        (record.species && record.species.toLowerCase().includes(searchTerm)) ||
        (record.biocharExperiment && record.biocharExperiment.toLowerCase().includes(searchTerm)) ||
        (record.biocharLotNumber && record.biocharLotNumber.toLowerCase().includes(searchTerm)) ||
        (record.experimentDate && record.experimentDate.includes(searchTerm))
      );
    });
  }

  toggleExperimentSelection(experimentId, appContext) {
    const index = appContext.compoundBatchForm.experimentIds.indexOf(experimentId);
    if (index > -1) {
      appContext.compoundBatchForm.experimentIds.splice(index, 1);
    } else {
      appContext.compoundBatchForm.experimentIds.push(experimentId);
    }
    
    // Recalculate total output
    this.updateCompoundBatchTotalOutput(appContext);
  }

  updateCompoundBatchTotalOutput(appContext) {
    const totalOutput = appContext.compoundBatchForm.experimentIds.reduce((sum, experimentId) => {
      const experiment = appContext.grapheneRecords.find(record => record.id === experimentId);
      return sum + (experiment && experiment.output ? Number(experiment.output) : 0);
    }, 0);
    
    appContext.compoundBatchForm.totalOutput = totalOutput.toFixed(2);
  }

  createCompoundBatchFromSelected(appContext) {
    if (appContext.selectedGrapheneIds.length === 0) {
      alert('Please select at least one graphene experiment to create a compound batch.');
      return;
    }
    
    // Calculate total output from selected experiments
    const totalOutput = appContext.selectedGrapheneIds.reduce((sum, grapheneId) => {
      const experiment = appContext.grapheneRecords.find(record => record.id === grapheneId);
      return sum + (experiment && experiment.output ? Number(experiment.output) : 0);
    }, 0);
    
    appContext.compoundBatchForm = {
      ...DEFAULT_FORMS.compoundBatch,
      experimentIds: [...appContext.selectedGrapheneIds],
      totalOutput: totalOutput.toFixed(2)
    };
    
    appContext.showCompoundBatchModal = true;
  }

  // Shipment CRUD operations
  openShipmentForm(shipment, appContext) {
    if (shipment) {
      appContext.editingShipment = shipment;
      appContext.shipmentForm = {
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
      appContext.editingShipment = null;
      appContext.shipmentForm = { ...DEFAULT_FORMS.shipment };
    }
    appContext.showAddShipment = true;
  }

  async saveShipment(appContext) {
    try {
      const data = { ...appContext.shipmentForm };
      
      // Remove UI-only fields
      delete data.materialType;
      delete data.dateUnknown;
      delete data.receivedDateUnknown;
      
      // Handle date fields
      if (data.shipmentDate === '' || appContext.shipmentForm.dateUnknown) {
        data.shipmentDate = null;
      }
      if (data.receivedDate === '' || appContext.shipmentForm.receivedDateUnknown) {
        data.receivedDate = null;
      }

      // Clear the non-selected material reference
      if (appContext.shipmentForm.materialType === 'graphene') {
        data.compoundBatchNumber = null;
      } else {
        data.grapheneSample = null;
      }

      if (appContext.editingShipment) {
        await API.shipment.update(appContext.editingShipment.id, data);
      } else {
        await API.shipment.create(data);
      }

      await appContext.loadShipments();
      this.closeShipmentForm(appContext);
    } catch (error) {
      console.error('Failed to save shipment:', error);
      alert(`Failed to save shipment: ${error.message}`);
    }
  }

  async deleteShipment(id, appContext) {
    if (confirm('Are you sure you want to delete this shipment record?')) {
      try {
        await API.shipment.delete(id);
        await appContext.loadShipments();
      } catch (error) {
        console.error('Failed to delete shipment:', error);
        alert(`Failed to delete shipment: ${error.message}`);
      }
    }
  }

  duplicateShipment(shipment, appContext) {
    appContext.editingShipment = null;
    appContext.shipmentForm = {
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
    appContext.showAddShipment = true;
  }

  closeShipmentForm(appContext) {
    appContext.showAddShipment = false;
    appContext.editingShipment = null;
    appContext.shipmentForm = { ...DEFAULT_FORMS.shipment };
  }

  addShipmentLocation(appContext) {
    if (appContext.newShipmentLocation.trim()) {
      appContext.shipmentLocations.push(appContext.newShipmentLocation.trim());
      appContext.shipmentLocations.sort();
      appContext.newShipmentLocation = '';
      appContext.showAddShipmentLocation = false;
    }
  }

  // Micronization CRUD operations
  openMicronizationForm(micronization, appContext) {
    if (micronization) {
      appContext.editingMicronization = micronization;
      appContext.micronizationForm = {
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
      appContext.editingMicronization = null;
      appContext.micronizationForm = { ...DEFAULT_FORMS.micronization };
    }
    appContext.showMicronizationModal = true;
  }

  async saveMicronization(appContext) {
    try {
      const data = { ...appContext.micronizationForm };
      
      // Remove UI-only fields
      delete data.materialType;
      delete data.dateUnknown;
      delete data.micronizationReportFile;
      delete data.removeMicronizationReport;
      delete data.replaceMicronizationReport;
      
      // Handle date field
      if (data.date === '' || appContext.micronizationForm.dateUnknown) {
        data.date = null;
      }

      // Clear the non-selected material reference
      if (appContext.micronizationForm.materialType === 'graphene') {
        data.compoundBatchNumber = null;
      } else {
        data.grapheneSample = null;
      }

      const file = appContext.micronizationForm.micronizationReportFile;

      if (appContext.editingMicronization) {
        await API.micronization.update(appContext.editingMicronization.id, data, file);
      } else {
        await API.micronization.create(data, file);
      }

      await appContext.loadMicronizations();
      this.closeMicronizationForm(appContext);
    } catch (error) {
      console.error('Failed to save micronization:', error);
      alert(`Failed to save micronization: ${error.message}`);
    }
  }

  async deleteMicronization(id, appContext) {
    if (confirm('Are you sure you want to delete this micronization record?')) {
      try {
        await API.micronization.delete(id);
        await appContext.loadMicronizations();
      } catch (error) {
        console.error('Failed to delete micronization:', error);
        alert(`Failed to delete micronization: ${error.message}`);
      }
    }
  }

  duplicateMicronization(micronization, appContext) {
    appContext.editingMicronization = null;
    appContext.micronizationForm = {
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
    appContext.showMicronizationModal = true;
  }

  closeMicronizationForm(appContext) {
    appContext.showMicronizationModal = false;
    appContext.editingMicronization = null;
    appContext.micronizationForm = { ...DEFAULT_FORMS.micronization };
  }
}

// Create singleton instance
const crudService = new CRUDService();

// Export for use in other modules
window.CRUDService = crudService;

export default crudService;