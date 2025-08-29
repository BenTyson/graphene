// Centralized API Service Module
// Handles all HTTP requests to the backend

const API_BASE = '/api';

// Helper function for handling responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
};

// Helper function for JSON requests
const jsonRequest = (url, method, data) => {
  return fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined
  }).then(handleResponse);
};

// Biochar API endpoints
export const biocharAPI = {
  // Get all biochar records with optional search
  getAll: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetch(`${API_BASE}/biochar${query}`).then(handleResponse);
  },

  // Get single biochar record
  getById: (id) => {
    return fetch(`${API_BASE}/biochar/${id}`).then(handleResponse);
  },

  // Create new biochar record
  create: (data) => {
    return jsonRequest(`${API_BASE}/biochar`, 'POST', data);
  },

  // Update biochar record
  update: (id, data) => {
    return jsonRequest(`${API_BASE}/biochar/${id}`, 'PUT', data);
  },

  // Delete biochar record
  delete: (id) => {
    return fetch(`${API_BASE}/biochar/${id}`, { method: 'DELETE' }).then(handleResponse);
  },

  // Get all lots
  getLots: () => {
    return fetch(`${API_BASE}/biochar/lots`).then(handleResponse);
  },

  // Combine experiments into lot
  combineLots: (data) => {
    return jsonRequest(`${API_BASE}/biochar/combine-lot`, 'POST', data);
  },

  // Export to CSV
  exportCSV: () => {
    window.open(`${API_BASE}/biochar/export/csv`, '_blank');
  },

  // Get related graphene and BET data for a biochar experiment
  getRelated: (experimentNumber) => {
    return fetch(`${API_BASE}/biochar/${experimentNumber}/related`).then(handleResponse);
  }
};

// Graphene API endpoints
export const grapheneAPI = {
  // Get all graphene records with optional search
  getAll: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetch(`${API_BASE}/graphene${query}`).then(handleResponse);
  },

  // Get single graphene record
  getById: (id) => {
    return fetch(`${API_BASE}/graphene/${id}`).then(handleResponse);
  },

  // Create new graphene record (with file upload support)
  create: async (data, file = null) => {
    const formData = new FormData();
    
    // Handle appearanceTags array
    if (data.appearanceTags) {
      formData.append('appearanceTags', JSON.stringify(data.appearanceTags));
      delete data.appearanceTags;
    }
    
    // Handle updateReportIds array
    if (data.updateReportIds) {
      formData.append('updateReportIds', JSON.stringify(data.updateReportIds));
      delete data.updateReportIds;
    }
    
    // Add all other fields
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    // Add file if provided
    if (file) {
      formData.append('semReport', file);
    }
    
    return fetch(`${API_BASE}/graphene`, {
      method: 'POST',
      body: formData
    }).then(handleResponse);
  },

  // Update graphene record (with file upload support)
  update: async (id, data, file = null) => {
    const formData = new FormData();
    
    // Handle appearanceTags array
    if (data.appearanceTags) {
      formData.append('appearanceTags', JSON.stringify(data.appearanceTags));
      delete data.appearanceTags;
    }
    
    // Handle updateReportIds array
    if (data.updateReportIds) {
      formData.append('updateReportIds', JSON.stringify(data.updateReportIds));
      delete data.updateReportIds;
    }
    
    // Add all other fields
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    // Add file if provided
    if (file) {
      formData.append('semReport', file);
    }
    
    return fetch(`${API_BASE}/graphene/${id}`, {
      method: 'PUT',
      body: formData
    }).then(handleResponse);
  },

  // Delete graphene record
  delete: (id) => {
    return fetch(`${API_BASE}/graphene/${id}`, { method: 'DELETE' }).then(handleResponse);
  },

  // Export to CSV
  exportCSV: () => {
    window.open(`${API_BASE}/graphene/export/csv`, '_blank');
  },

  // Get related biochar and BET data for a graphene experiment
  getRelated: (experimentNumber) => {
    return fetch(`${API_BASE}/graphene/${experimentNumber}/related`).then(handleResponse);
  }
};

// BET API endpoints
export const betAPI = {
  // Get all BET records with optional search
  getAll: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetch(`${API_BASE}/bet${query}`).then(handleResponse);
  },

  // Get single BET record
  getById: (id) => {
    return fetch(`${API_BASE}/bet/${id}`).then(handleResponse);
  },

  // Create new BET record (with file upload support)
  create: async (data, file = null) => {
    const formData = new FormData();
    
    // Add all other fields
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    // Add file if provided
    if (file) {
      formData.append('betReport', file);
    }
    
    return fetch(`${API_BASE}/bet`, {
      method: 'POST',
      body: formData
    }).then(handleResponse);
  },

  // Update BET record (with file upload support)
  update: async (id, data, file = null) => {
    const formData = new FormData();
    
    // Add all other fields
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    // Add file if provided
    if (file) {
      formData.append('betReport', file);
    }
    
    return fetch(`${API_BASE}/bet/${id}`, {
      method: 'PUT',
      body: formData
    }).then(handleResponse);
  },

  // Delete BET record
  delete: (id) => {
    return fetch(`${API_BASE}/bet/${id}`, { method: 'DELETE' }).then(handleResponse);
  },

  // Export to CSV
  exportCSV: () => {
    window.open(`${API_BASE}/bet/export/csv`, '_blank');
  }
};

// Conductivity API endpoints
export const conductivityAPI = {
  // Get all conductivity records with optional search
  getAll: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetch(`${API_BASE}/conductivity${query}`).then(handleResponse);
  },

  // Get single conductivity record
  getById: (id) => {
    return fetch(`${API_BASE}/conductivity/${id}`).then(handleResponse);
  },

  // Create new conductivity record
  create: (data) => {
    return jsonRequest(`${API_BASE}/conductivity`, 'POST', data);
  },

  // Update conductivity record
  update: (id, data) => {
    return jsonRequest(`${API_BASE}/conductivity/${id}`, 'PUT', data);
  },

  // Delete conductivity record
  delete: (id) => {
    return fetch(`${API_BASE}/conductivity/${id}`, { method: 'DELETE' }).then(handleResponse);
  },

  // Export to CSV
  exportCSV: () => {
    window.open(`${API_BASE}/conductivity/export/csv`, '_blank');
  }
};

// TEM API endpoints
export const temAPI = {
  // Get all TEM records with optional search
  getAll: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetch(`${API_BASE}/tem${query}`).then(handleResponse);
  },

  // Get single TEM record
  getById: (id) => {
    return fetch(`${API_BASE}/tem/${id}`).then(handleResponse);
  },

  // Create new TEM record (with file upload support)
  create: async (data, file = null) => {
    const formData = new FormData();
    
    // Add all other fields (excluding file field)
    Object.keys(data).forEach(key => {
      if (key !== 'temReportFile' && data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    // Add file if provided
    if (file) {
      formData.append('temReport', file);
    }
    
    return fetch(`${API_BASE}/tem`, {
      method: 'POST',
      body: formData
    }).then(handleResponse);
  },

  // Update TEM record (with file upload support)
  update: async (id, data, file = null) => {
    const formData = new FormData();
    
    // Add all other fields (excluding file field)
    Object.keys(data).forEach(key => {
      if (key !== 'temReportFile' && data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    // Add file if provided
    if (file) {
      formData.append('temReport', file);
    }
    
    return fetch(`${API_BASE}/tem/${id}`, {
      method: 'PUT',
      body: formData
    }).then(handleResponse);
  },

  // Delete TEM record
  delete: (id) => {
    return fetch(`${API_BASE}/tem/${id}`, { method: 'DELETE' }).then(handleResponse);
  },

  // Export to CSV
  exportCSV: () => {
    window.open(`${API_BASE}/tem/export/csv`, '_blank');
  }
};

// RAMAN API endpoints
export const ramanAPI = {
  // Get all RAMAN records with optional search
  getAll: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetch(`${API_BASE}/raman${query}`).then(handleResponse);
  },

  // Get single RAMAN record
  getById: (id) => {
    return fetch(`${API_BASE}/raman/${id}`).then(handleResponse);
  },

  // Create new RAMAN record (with file upload support)
  create: async (data, file = null) => {
    const formData = new FormData();
    
    // Add all other fields (excluding file field)
    Object.keys(data).forEach(key => {
      if (key !== 'ramanReportFile' && data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    // Add file if provided
    if (file) {
      formData.append('ramanReport', file);
    }
    
    return fetch(`${API_BASE}/raman`, {
      method: 'POST',
      body: formData
    }).then(handleResponse);
  },

  // Update RAMAN record (with file upload support)
  update: async (id, data, file = null) => {
    const formData = new FormData();
    
    // Add all other fields (excluding file field)
    Object.keys(data).forEach(key => {
      if (key !== 'ramanReportFile' && data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    // Add file if provided
    if (file) {
      formData.append('ramanReport', file);
    }
    
    return fetch(`${API_BASE}/raman/${id}`, {
      method: 'PUT',
      body: formData
    }).then(handleResponse);
  },

  // Delete RAMAN record
  delete: (id) => {
    return fetch(`${API_BASE}/raman/${id}`, { method: 'DELETE' }).then(handleResponse);
  },

  // Export to CSV
  exportCSV: () => {
    window.open(`${API_BASE}/raman/export/csv`, '_blank');
  }
};

// Update Reports API endpoints
export const updateReportAPI = {
  // Get all update reports
  getAll: () => {
    return fetch(`${API_BASE}/update-reports`).then(handleResponse);
  },

  // Get single update report
  getById: (id) => {
    return fetch(`${API_BASE}/update-reports/${id}`).then(handleResponse);
  },

  // Get update reports for specific graphene experiment
  getByGrapheneExperiment: (experimentNumber) => {
    return fetch(`${API_BASE}/update-reports/graphene/${experimentNumber}`).then(handleResponse);
  },

  // Create new update report with file
  create: (data, file) => {
    const formData = new FormData();
    
    // Add all data fields
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        if (key === 'grapheneIds' && Array.isArray(data[key])) {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      }
    });
    
    // Add file
    if (file) {
      formData.append('updateFile', file);
    }
    
    return fetch(`${API_BASE}/update-reports`, {
      method: 'POST',
      body: formData
    }).then(handleResponse);
  },

  // Update update report metadata and associations
  update: (id, data) => {
    const payload = { ...data };
    
    // Convert grapheneIds array to JSON string if needed
    if (payload.grapheneIds && Array.isArray(payload.grapheneIds)) {
      payload.grapheneIds = JSON.stringify(payload.grapheneIds);
    }
    
    return jsonRequest(`${API_BASE}/update-reports/${id}`, 'PUT', payload);
  },

  // Delete update report
  delete: (id) => {
    return fetch(`${API_BASE}/update-reports/${id}`, { method: 'DELETE' }).then(handleResponse);
  },

  // Add graphene association to existing report
  addGrapheneAssociation: (reportId, grapheneId) => {
    return fetch(`${API_BASE}/update-reports/${reportId}/graphene/${grapheneId}`, {
      method: 'POST'
    }).then(handleResponse);
  },

  // Remove graphene association from report
  removeGrapheneAssociation: (reportId, grapheneId) => {
    return fetch(`${API_BASE}/update-reports/${reportId}/graphene/${grapheneId}`, {
      method: 'DELETE'
    }).then(handleResponse);
  }
};

// SEM Reports API endpoints
export const semReportAPI = {
  // Get all SEM reports
  getAll: () => {
    return fetch(`${API_BASE}/sem-reports`).then(handleResponse);
  },

  // Get single SEM report
  getById: (id) => {
    return fetch(`${API_BASE}/sem-reports/${id}`).then(handleResponse);
  },

  // Get SEM reports for specific graphene experiment
  getByGrapheneExperiment: (experimentNumber) => {
    return fetch(`${API_BASE}/sem-reports/graphene/${experimentNumber}`).then(handleResponse);
  },

  // Create new SEM reports with bulk file upload
  create: (data, files) => {
    const formData = new FormData();
    
    // Add all data fields
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        if (key === 'grapheneIds' && Array.isArray(data[key])) {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      }
    });
    
    // Add files
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        formData.append('semFiles', files[i]);
      }
    }
    
    return fetch(`${API_BASE}/sem-reports`, {
      method: 'POST',
      body: formData
    }).then(handleResponse);
  },

  // Update SEM report metadata and associations
  update: (id, data) => {
    const payload = { ...data };
    
    // Convert grapheneIds array to JSON string if needed
    if (payload.grapheneIds && Array.isArray(payload.grapheneIds)) {
      payload.grapheneIds = JSON.stringify(payload.grapheneIds);
    }
    
    return jsonRequest(`${API_BASE}/sem-reports/${id}`, 'PUT', payload);
  },

  // Delete SEM report
  delete: (id) => {
    return fetch(`${API_BASE}/sem-reports/${id}`, { method: 'DELETE' }).then(handleResponse);
  },

  // Add graphene association to existing report
  addGrapheneAssociation: (reportId, grapheneId) => {
    return fetch(`${API_BASE}/sem-reports/${reportId}/graphene/${grapheneId}`, {
      method: 'POST'
    }).then(handleResponse);
  },

  // Remove graphene association from report
  removeGrapheneAssociation: (reportId, grapheneId) => {
    return fetch(`${API_BASE}/sem-reports/${reportId}/graphene/${grapheneId}`, {
      method: 'DELETE'
    }).then(handleResponse);
  }
};

// Compound Batch API endpoints
export const compoundBatchAPI = {
  // Get all compound batches with optional search
  getAll: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetch(`${API_BASE}/compound-batches${query}`).then(handleResponse);
  },

  // Get single compound batch
  getById: (id) => {
    return fetch(`${API_BASE}/compound-batches/${id}`).then(handleResponse);
  },

  // Get compound batch by batch number
  getByBatchNumber: (batchNumber) => {
    return fetch(`${API_BASE}/compound-batches/by-number/${batchNumber}`).then(handleResponse);
  },

  // Create compound batch
  create: (data) => {
    const payload = { ...data };
    
    // Convert experimentIds array to JSON string if needed
    if (payload.experimentIds && Array.isArray(payload.experimentIds)) {
      payload.experimentIds = JSON.stringify(payload.experimentIds);
    }
    
    return jsonRequest(`${API_BASE}/compound-batches`, 'POST', payload);
  },

  // Update compound batch
  update: (id, data) => {
    const payload = { ...data };
    
    // Convert experimentIds array to JSON string if needed
    if (payload.experimentIds && Array.isArray(payload.experimentIds)) {
      payload.experimentIds = JSON.stringify(payload.experimentIds);
    }
    
    return jsonRequest(`${API_BASE}/compound-batches/${id}`, 'PUT', payload);
  },

  // Delete compound batch
  delete: (id) => {
    return fetch(`${API_BASE}/compound-batches/${id}`, { method: 'DELETE' }).then(handleResponse);
  },

  // Add graphene experiment to compound batch
  addExperiment: (batchId, grapheneId) => {
    return fetch(`${API_BASE}/compound-batches/${batchId}/experiments/${grapheneId}`, {
      method: 'POST'
    }).then(handleResponse);
  },

  // Remove graphene experiment from compound batch
  removeExperiment: (batchId, grapheneId) => {
    return fetch(`${API_BASE}/compound-batches/${batchId}/experiments/${grapheneId}`, {
      method: 'DELETE'
    }).then(handleResponse);
  },

  // Export to CSV
  exportCSV: () => {
    window.open(`${API_BASE}/compound-batches/export/csv`, '_blank');
  },

  // Get related test data for a compound batch
  getRelated: (batchId) => {
    return fetch(`${API_BASE}/compound-batches/${batchId}/related`).then(handleResponse);
  },

  // Add SEM report association to compound batch
  addSemReportAssociation: (batchId, semReportId) => {
    return fetch(`${API_BASE}/compound-batches/${batchId}/sem-reports/${semReportId}`, {
      method: 'POST'
    }).then(handleResponse);
  },

  // Remove SEM report association from compound batch
  removeSemReportAssociation: (batchId, semReportId) => {
    return fetch(`${API_BASE}/compound-batches/${batchId}/sem-reports/${semReportId}`, {
      method: 'DELETE'
    }).then(handleResponse);
  }
};

// Shipment API endpoints
export const shipmentAPI = {
  // Get all shipments with optional search
  getAll: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetch(`${API_BASE}/shipments${query}`).then(handleResponse);
  },

  // Get single shipment
  getById: (id) => {
    return fetch(`${API_BASE}/shipments/${id}`).then(handleResponse);
  },

  // Create new shipment
  create: (data) => {
    return jsonRequest(`${API_BASE}/shipments`, 'POST', data);
  },

  // Update shipment
  update: (id, data) => {
    return jsonRequest(`${API_BASE}/shipments/${id}`, 'PUT', data);
  },

  // Delete shipment
  delete: (id) => {
    return fetch(`${API_BASE}/shipments/${id}`, { method: 'DELETE' }).then(handleResponse);
  },

  // Export to CSV
  exportCSV: () => {
    window.open(`${API_BASE}/shipments/export/csv`, '_blank');
  },

  // Get shipments for specific graphene experiment
  getByGraphene: (experimentNumber) => {
    return fetch(`${API_BASE}/shipments/graphene/${experimentNumber}`).then(handleResponse);
  },

  // Get shipments for specific compound batch
  getByCompoundBatch: (batchNumber) => {
    return fetch(`${API_BASE}/shipments/compound-batch/${batchNumber}`).then(handleResponse);
  },

  // Get unique locations
  getLocations: () => {
    return fetch(`${API_BASE}/shipments/locations`).then(handleResponse);
  }
};

// Default export with all APIs
export default {
  biochar: biocharAPI,
  graphene: grapheneAPI,
  bet: betAPI,
  conductivity: conductivityAPI,
  tem: temAPI,
  raman: ramanAPI,
  updateReport: updateReportAPI,
  semReport: semReportAPI,
  compoundBatch: compoundBatchAPI,
  shipment: shipmentAPI
};