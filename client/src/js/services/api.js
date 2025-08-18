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

  // Create new BET record
  create: (data) => {
    return jsonRequest(`${API_BASE}/bet`, 'POST', data);
  },

  // Update BET record
  update: (id, data) => {
    return jsonRequest(`${API_BASE}/bet/${id}`, 'PUT', data);
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

// Default export with all APIs
export default {
  biochar: biocharAPI,
  graphene: grapheneAPI,
  bet: betAPI
};