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
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('limit', '500'); // Request higher limit to get all records
    return fetch(`${API_BASE}/graphene?${params.toString()}`).then(handleResponse);
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

  // Create new conductivity record (with file upload support)
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
      formData.append('conductivityReport', file);
    }
    
    return fetch(`${API_BASE}/conductivity`, {
      method: 'POST',
      body: formData
    }).then(handleResponse);
  },

  // Update conductivity record (with file upload support)
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
      formData.append('conductivityReport', file);
    }
    
    return fetch(`${API_BASE}/conductivity/${id}`, {
      method: 'PUT',
      body: formData
    }).then(handleResponse);
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

// Particle Size API endpoints
export const particleSizeAPI = {
  // Get all Particle Size records with optional search
  getAll: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetch(`${API_BASE}/particle-size${query}`).then(handleResponse);
  },

  // Get single Particle Size record
  getById: (id) => {
    return fetch(`${API_BASE}/particle-size/${id}`).then(handleResponse);
  },

  // Create new Particle Size record (with file upload support)
  create: async (data, file = null) => {
    const formData = new FormData();

    // Add all other fields (excluding file field)
    Object.keys(data).forEach(key => {
      if (key !== 'particleSizeReportFile' && data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    // Add file if provided
    if (file) {
      formData.append('particleSizeReport', file);
    }

    return fetch(`${API_BASE}/particle-size`, {
      method: 'POST',
      body: formData
    }).then(handleResponse);
  },

  // Update Particle Size record (with file upload support)
  update: async (id, data, file = null) => {
    const formData = new FormData();

    // Add all other fields (excluding file field)
    Object.keys(data).forEach(key => {
      if (key !== 'particleSizeReportFile' && data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    // Add file if provided
    if (file) {
      formData.append('particleSizeReport', file);
    }

    return fetch(`${API_BASE}/particle-size/${id}`, {
      method: 'PUT',
      body: formData
    }).then(handleResponse);
  },

  // Delete Particle Size record
  delete: (id) => {
    return fetch(`${API_BASE}/particle-size/${id}`, { method: 'DELETE' }).then(handleResponse);
  },

  // Export to CSV
  exportCSV: () => {
    window.open(`${API_BASE}/particle-size/export/csv`, '_blank');
  }
};

// XRD API endpoints
export const xrdAPI = {
  // Get all XRD records with optional search
  getAll: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetch(`${API_BASE}/xrd${query}`).then(handleResponse);
  },

  // Get single XRD record
  getById: (id) => {
    return fetch(`${API_BASE}/xrd/${id}`).then(handleResponse);
  },

  // Create new XRD record (with MULTIPLE file upload support)
  create: async (data, files = []) => {
    const formData = new FormData();

    // Add all other fields (excluding file fields)
    Object.keys(data).forEach(key => {
      if (key !== 'xrdReportFiles' && key !== 'removeFileIndices' && data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    // Add MULTIPLE files if provided
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('xrdReports', file);
      });
    }

    return fetch(`${API_BASE}/xrd`, {
      method: 'POST',
      body: formData
    }).then(handleResponse);
  },

  // Update XRD record (with MULTIPLE file upload support)
  update: async (id, data, files = []) => {
    const formData = new FormData();

    // Add all other fields (excluding file fields)
    Object.keys(data).forEach(key => {
      if (key !== 'xrdReportFiles' && data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    // Add MULTIPLE new files if provided
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('xrdReports', file);
      });
    }

    return fetch(`${API_BASE}/xrd/${id}`, {
      method: 'PUT',
      body: formData
    }).then(handleResponse);
  },

  // Delete XRD record
  delete: (id) => {
    return fetch(`${API_BASE}/xrd/${id}`, { method: 'DELETE' }).then(handleResponse);
  },

  // Export to CSV
  exportCSV: () => {
    window.open(`${API_BASE}/xrd/export/csv`, '_blank');
  }
};

// XPS API endpoints
export const xpsAPI = {
  // Get all XPS records with optional search
  getAll: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetch(`${API_BASE}/xps${query}`).then(handleResponse);
  },

  // Get single XPS record
  getById: (id) => {
    return fetch(`${API_BASE}/xps/${id}`).then(handleResponse);
  },

  // Create new XPS record (with MULTIPLE file upload support)
  create: async (data, files = []) => {
    const formData = new FormData();

    // Add all other fields (excluding file fields)
    Object.keys(data).forEach(key => {
      if (key !== 'xpsReportFiles' && key !== 'removeFileIndices' && data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    // Add MULTIPLE files if provided
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('xpsReports', file);
      });
    }

    return fetch(`${API_BASE}/xps`, {
      method: 'POST',
      body: formData
    }).then(handleResponse);
  },

  // Update XPS record (with MULTIPLE file upload support)
  update: async (id, data, files = []) => {
    const formData = new FormData();

    // Add all other fields (excluding file fields)
    Object.keys(data).forEach(key => {
      if (key !== 'xpsReportFiles' && data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    // Add MULTIPLE new files if provided
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('xpsReports', file);
      });
    }

    return fetch(`${API_BASE}/xps/${id}`, {
      method: 'PUT',
      body: formData
    }).then(handleResponse);
  },

  // Delete XPS record
  delete: (id) => {
    return fetch(`${API_BASE}/xps/${id}`, { method: 'DELETE' }).then(handleResponse);
  },

  // Export to CSV
  exportCSV: () => {
    window.open(`${API_BASE}/xps/export/csv`, '_blank');
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
        if ((key === 'grapheneIds' || key === 'compoundBatchIds') && Array.isArray(data[key])) {
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

  // Update update report metadata and associations (with optional file)
  update: (id, data, file = null) => {
    // If there's a file, use FormData; otherwise use JSON
    if (file) {
      const formData = new FormData();
      
      // Add all data fields
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          if ((key === 'grapheneIds' || key === 'compoundBatchIds') && Array.isArray(data[key])) {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        }
      });
      
      // Add the file
      formData.append('updateFile', file);
      
      return fetch(`${API_BASE}/update-reports/${id}`, {
        method: 'PUT',
        body: formData
      }).then(handleResponse);
    } else {
      // No file, use JSON
      const payload = { ...data };
      
      // Convert arrays to JSON strings if needed
      if (payload.grapheneIds && Array.isArray(payload.grapheneIds)) {
        payload.grapheneIds = JSON.stringify(payload.grapheneIds);
      }
      if (payload.compoundBatchIds && Array.isArray(payload.compoundBatchIds)) {
        payload.compoundBatchIds = JSON.stringify(payload.compoundBatchIds);
      }
      
      return jsonRequest(`${API_BASE}/update-reports/${id}`, 'PUT', payload);
    }
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
        if ((key === 'grapheneIds' || key === 'compoundBatchIds') && Array.isArray(data[key])) {
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
    
    // Convert compoundBatchIds array to JSON string if needed
    if (payload.compoundBatchIds && Array.isArray(payload.compoundBatchIds)) {
      payload.compoundBatchIds = JSON.stringify(payload.compoundBatchIds);
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

// Micronization API endpoints
export const micronizationAPI = {
  // Get all micronization records with optional search
  getAll: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetch(`${API_BASE}/micronization${query}`).then(handleResponse);
  },

  // Get single micronization record
  getById: (id) => {
    return fetch(`${API_BASE}/micronization/${id}`).then(handleResponse);
  },

  // Create new micronization record (with file upload support)
  create: async (data, file = null) => {
    const formData = new FormData();
    
    // Add all other fields except the file object
    Object.keys(data).forEach(key => {
      if (key !== 'micronizationReportFile' && data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    // Add file if provided
    if (file) {
      formData.append('micronizationReport', file);
    }
    
    return fetch(`${API_BASE}/micronization`, {
      method: 'POST',
      body: formData
    }).then(handleResponse);
  },

  // Update micronization record (with file upload support)
  update: async (id, data, file = null) => {
    const formData = new FormData();
    
    // Add all other fields except the file object
    Object.keys(data).forEach(key => {
      if (key !== 'micronizationReportFile' && data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    // Add file if provided
    if (file) {
      formData.append('micronizationReport', file);
    }
    
    return fetch(`${API_BASE}/micronization/${id}`, {
      method: 'PUT',
      body: formData
    }).then(handleResponse);
  },

  // Delete micronization record
  delete: (id) => {
    return fetch(`${API_BASE}/micronization/${id}`, { method: 'DELETE' }).then(handleResponse);
  },

  // Export to CSV
  exportCSV: () => {
    window.open(`${API_BASE}/micronization/export/csv`, '_blank');
  },

  // Get micronizations for specific graphene experiment
  getByGraphene: (experimentNumber) => {
    return fetch(`${API_BASE}/micronization/graphene/${experimentNumber}`).then(handleResponse);
  },

  // Get micronizations for specific compound batch
  getByCompoundBatch: (batchNumber) => {
    return fetch(`${API_BASE}/micronization/compound-batch/${batchNumber}`).then(handleResponse);
  }
};

export const mcbAPI = {
  // Get all MCBs with optional search
  getAll: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetch(`${API_BASE}/mcb${query}`).then(handleResponse);
  },

  // Get single MCB record
  getById: (id) => {
    return fetch(`${API_BASE}/mcb/${id}`).then(handleResponse);
  },

  // Get available micronizations (not yet in any MCB)
  getAvailableMicronizations: () => {
    return fetch(`${API_BASE}/mcb/available/micronizations`).then(handleResponse);
  },

  // Create new MCB record
  create: (data) => {
    return jsonRequest(`${API_BASE}/mcb`, 'POST', data);
  },

  // Update MCB record
  update: (id, data) => {
    return jsonRequest(`${API_BASE}/mcb/${id}`, 'PUT', data);
  },

  // Delete MCB record
  delete: (id) => {
    return fetch(`${API_BASE}/mcb/${id}`, { method: 'DELETE' }).then(handleResponse);
  },

  // Export to CSV
  exportCSV: () => {
    window.open(`${API_BASE}/mcb/export/csv`, '_blank');
  }
};

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

  // Get shipments for specific micronization SKU
  getByMicronization: (sku) => {
    return fetch(`${API_BASE}/shipments/micronization/${sku}`).then(handleResponse);
  },

  // Get unique locations
  getLocations: () => {
    return fetch(`${API_BASE}/shipments/locations`).then(handleResponse);
  }
};

// Users API endpoints
export const usersAPI = {
  // Get all users with optional search
  getAll: (params = {}) => {
    const query = params.search ? `?search=${encodeURIComponent(params.search)}` : '';
    const headers = {
      ...window.authService?.getAuthHeader()
    };
    return fetch(`${API_BASE}/users${query}`, { headers }).then(handleResponse);
  },

  // Get single user
  getById: (id) => {
    const headers = {
      ...window.authService?.getAuthHeader()
    };
    return fetch(`${API_BASE}/users/${id}`, { headers }).then(handleResponse);
  },

  // Create new user
  create: (data) => {
    const headers = {
      'Content-Type': 'application/json',
      ...window.authService?.getAuthHeader()
    };
    return fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    }).then(handleResponse);
  },

  // Update user
  update: (id, data) => {
    const headers = {
      'Content-Type': 'application/json',
      ...window.authService?.getAuthHeader()
    };
    return fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    }).then(handleResponse);
  },

  // Delete user
  delete: (id) => {
    const headers = {
      ...window.authService?.getAuthHeader()
    };
    return fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers
    }).then(handleResponse);
  },

  // Toggle user status
  toggleStatus: (id) => {
    const headers = {
      ...window.authService?.getAuthHeader()
    };
    return fetch(`${API_BASE}/users/${id}/toggle-status`, {
      method: 'POST',
      headers
    }).then(handleResponse);
  }
};

// Tasks API endpoints
export const tasksAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.priority) query.append('priority', params.priority);
    if (params.assigneeId) query.append('assigneeId', params.assigneeId);
    if (params.search) query.append('search', params.search);
    if (params.parentId !== undefined) query.append('parentId', params.parentId);
    if (params.overdue) query.append('overdue', 'true');
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.order) query.append('order', params.order);
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);
    const qs = query.toString();
    const headers = { ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/tasks${qs ? '?' + qs : ''}`, { headers }).then(handleResponse);
  },

  getById: (id) => {
    const headers = { ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/tasks/${id}`, { headers }).then(handleResponse);
  },

  create: (data) => {
    const headers = { 'Content-Type': 'application/json', ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/tasks`, { method: 'POST', headers, body: JSON.stringify(data) }).then(handleResponse);
  },

  update: (id, data) => {
    const headers = { 'Content-Type': 'application/json', ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/tasks/${id}`, { method: 'PUT', headers, body: JSON.stringify(data) }).then(handleResponse);
  },

  delete: (id) => {
    const headers = { ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE', headers }).then(handleResponse);
  },

  reorder: (taskId, newStatus, positions) => {
    const headers = { 'Content-Type': 'application/json', ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/tasks/reorder`, {
      method: 'PATCH', headers,
      body: JSON.stringify({ taskId, newStatus, positions })
    }).then(handleResponse);
  },

  updateStatus: (id, status, position) => {
    const headers = { 'Content-Type': 'application/json', ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/tasks/${id}/status`, {
      method: 'PATCH', headers, body: JSON.stringify({ status, position })
    }).then(handleResponse);
  },

  addComment: (taskId, content) => {
    const headers = { 'Content-Type': 'application/json', ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/tasks/${taskId}/comments`, {
      method: 'POST', headers, body: JSON.stringify({ content })
    }).then(handleResponse);
  },

  deleteComment: (taskId, commentId) => {
    const headers = { ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/tasks/${taskId}/comments/${commentId}`, {
      method: 'DELETE', headers
    }).then(handleResponse);
  },

  uploadAttachments: (taskId, files) => {
    const formData = new FormData();
    for (const file of files) formData.append('attachments', file);
    const headers = { ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/tasks/${taskId}/attachments`, {
      method: 'POST', headers, body: formData
    }).then(handleResponse);
  },

  deleteAttachment: (taskId, attachmentId) => {
    const headers = { ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/tasks/${taskId}/attachments/${attachmentId}`, {
      method: 'DELETE', headers
    }).then(handleResponse);
  },

  getAssignees: () => {
    const headers = { ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/tasks/assignees`, { headers }).then(handleResponse);
  },

  getStats: () => {
    const headers = { ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/tasks/stats`, { headers }).then(handleResponse);
  }
};

// Pipeline/CRM API endpoints
export const pipelineAPI = {
  // Contacts
  getContacts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.contactType) query.append('contactType', params.contactType);
    if (params.ownerId) query.append('ownerId', params.ownerId);
    if (params.search) query.append('search', params.search);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.order) query.append('order', params.order);
    const qs = query.toString();
    const headers = { ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/pipeline/contacts${qs ? '?' + qs : ''}`, { headers }).then(handleResponse);
  },

  getContact: (id) => {
    const headers = { ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/pipeline/contacts/${id}`, { headers }).then(handleResponse);
  },

  createContact: (data) => {
    const headers = { 'Content-Type': 'application/json', ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/pipeline/contacts`, { method: 'POST', headers, body: JSON.stringify(data) }).then(handleResponse);
  },

  updateContact: (id, data) => {
    const headers = { 'Content-Type': 'application/json', ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/pipeline/contacts/${id}`, { method: 'PUT', headers, body: JSON.stringify(data) }).then(handleResponse);
  },

  deleteContact: (id) => {
    const headers = { ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/pipeline/contacts/${id}`, { method: 'DELETE', headers }).then(handleResponse);
  },

  addContactActivity: (contactId, data) => {
    const headers = { 'Content-Type': 'application/json', ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/pipeline/contacts/${contactId}/activities`, {
      method: 'POST', headers, body: JSON.stringify(data)
    }).then(handleResponse);
  },

  uploadContactAttachments: (contactId, files) => {
    const formData = new FormData();
    for (const file of files) formData.append('attachments', file);
    const headers = { ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/pipeline/contacts/${contactId}/attachments`, {
      method: 'POST', headers, body: formData
    }).then(handleResponse);
  },

  deleteContactAttachment: (contactId, attachmentId) => {
    const headers = { ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/pipeline/contacts/${contactId}/attachments/${attachmentId}`, {
      method: 'DELETE', headers
    }).then(handleResponse);
  },

  // Deals
  getDeals: (params = {}) => {
    const query = new URLSearchParams();
    if (params.contactType) query.append('contactType', params.contactType);
    if (params.stage) query.append('stage', params.stage);
    if (params.ownerId) query.append('ownerId', params.ownerId);
    if (params.contactId) query.append('contactId', params.contactId);
    if (params.search) query.append('search', params.search);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.order) query.append('order', params.order);
    const qs = query.toString();
    const headers = { ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/pipeline/deals${qs ? '?' + qs : ''}`, { headers }).then(handleResponse);
  },

  getDeal: (id) => {
    const headers = { ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/pipeline/deals/${id}`, { headers }).then(handleResponse);
  },

  createDeal: (data) => {
    const headers = { 'Content-Type': 'application/json', ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/pipeline/deals`, { method: 'POST', headers, body: JSON.stringify(data) }).then(handleResponse);
  },

  updateDeal: (id, data) => {
    const headers = { 'Content-Type': 'application/json', ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/pipeline/deals/${id}`, { method: 'PUT', headers, body: JSON.stringify(data) }).then(handleResponse);
  },

  deleteDeal: (id) => {
    const headers = { ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/pipeline/deals/${id}`, { method: 'DELETE', headers }).then(handleResponse);
  },

  reorderDeals: (dealId, newStage, positions) => {
    const headers = { 'Content-Type': 'application/json', ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/pipeline/deals/reorder`, {
      method: 'PATCH', headers,
      body: JSON.stringify({ dealId, newStage, positions })
    }).then(handleResponse);
  },

  addDealActivity: (dealId, data) => {
    const headers = { 'Content-Type': 'application/json', ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/pipeline/deals/${dealId}/activities`, {
      method: 'POST', headers, body: JSON.stringify(data)
    }).then(handleResponse);
  },

  // Meta
  getOwners: () => {
    const headers = { ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/pipeline/owners`, { headers }).then(handleResponse);
  },

  getStats: () => {
    const headers = { ...window.authService?.getAuthHeader() };
    return fetch(`${API_BASE}/pipeline/stats`, { headers }).then(handleResponse);
  }
};

// Default export with all APIs
export default {
  biochar: biocharAPI,
  graphene: grapheneAPI,
  bet: betAPI,
  conductivity: conductivityAPI,
  tem: temAPI,
  particleSize: particleSizeAPI,
  xrd: xrdAPI,
  xps: xpsAPI,
  raman: ramanAPI,
  updateReport: updateReportAPI,
  semReport: semReportAPI,
  compoundBatch: compoundBatchAPI,
  micronization: micronizationAPI,
  mcb: mcbAPI,
  shipment: shipmentAPI,
  users: usersAPI,
  tasks: tasksAPI,
  pipeline: pipelineAPI
};