/**
 * Card Data Service
 * Centralized service for fetching and managing card data
 */

class CardService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get graphene experiment card data
   * @param {string} experimentNumber - The graphene experiment number
   * @returns {Promise<Object>} Card data
   */
  async getGrapheneCard(experimentNumber) {
    const cacheKey = `graphene_${experimentNumber}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // Fetch related data
      const response = await fetch(`/api/graphene/${experimentNumber}/related`);
      if (!response.ok) {
        throw new Error(`Failed to fetch graphene data: ${response.status}`);
      }
      const relatedData = await response.json();

      // Fetch main record
      const mainResponse = await fetch(`/api/graphene?search=${experimentNumber}&limit=1`);
      if (!mainResponse.ok) {
        throw new Error(`Failed to fetch graphene record: ${mainResponse.status}`);
      }
      const mainResult = await mainResponse.json();
      const mainRecord = mainResult.data?.[0];

      if (!mainRecord) {
        throw new Error(`Graphene experiment ${experimentNumber} not found`);
      }

      const data = { ...mainRecord, ...relatedData };
      
      // Cache the result
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error(`Failed to fetch graphene card ${experimentNumber}:`, error);
      throw error;
    }
  }

  /**
   * Get biochar experiment card data
   * @param {string} experimentNumber - The biochar experiment number
   * @returns {Promise<Object>} Card data
   */
  async getBiocharCard(experimentNumber) {
    const cacheKey = `biochar_${experimentNumber}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // Fetch biochar with related data
      const response = await fetch(`/api/biochar/${experimentNumber}/related`);
      if (!response.ok) {
        throw new Error(`Failed to fetch biochar data: ${response.status}`);
      }
      const data = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error(`Failed to fetch biochar card ${experimentNumber}:`, error);
      throw error;
    }
  }

  /**
   * Get compound batch card data
   * @param {string} batchNumber - The compound batch number
   * @returns {Promise<Object>} Card data
   */
  async getCompoundBatchCard(batchNumber) {
    const cacheKey = `batch_${batchNumber}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // Fetch all batches
      const batchesResponse = await fetch('/api/compound-batches');
      if (!batchesResponse.ok) {
        throw new Error(`Failed to fetch compound batches: ${batchesResponse.status}`);
      }
      const batches = await batchesResponse.json();
      
      // Find the specific batch
      const batch = batches.find(b => b.batchNumber === batchNumber);
      if (!batch) {
        throw new Error(`Compound batch ${batchNumber} not found`);
      }

      // Fetch related data
      const relatedResponse = await fetch(`/api/compound-batches/${batch.id}/related`);
      if (!relatedResponse.ok) {
        throw new Error(`Failed to fetch batch related data: ${relatedResponse.status}`);
      }
      const relatedData = await relatedResponse.json();

      // Fetch micronization data
      const micronResponse = await fetch(`/api/micronization?compoundBatchNumber=${batchNumber}`);
      const micronizations = micronResponse.ok ? await micronResponse.json() : [];

      const data = {
        ...batch,
        ...relatedData,
        micronizations: micronizations || [],
        isCompoundBatch: true
      };
      
      // Cache the result
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error(`Failed to fetch compound batch card ${batchNumber}:`, error);
      throw error;
    }
  }

  /**
   * Get micronization card data
   * @param {string} micronizationNumber - The micronization number
   * @returns {Promise<Object>} Card data
   */
  async getMicronizationCard(micronizationNumber) {
    const cacheKey = `micron_${micronizationNumber}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // Fetch micronization data
      const response = await fetch(`/api/micronization?search=${micronizationNumber}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch micronization data: ${response.status}`);
      }
      const result = await response.json();
      const data = result.data?.[0];

      if (!data) {
        throw new Error(`Micronization ${micronizationNumber} not found`);
      }
      
      // Cache the result
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error(`Failed to fetch micronization card ${micronizationNumber}:`, error);
      throw error;
    }
  }

  /**
   * Get card data by type and identifier
   * @param {string} type - The type of card (graphene, biochar, batch, micronization)
   * @param {string} identifier - The experiment/batch number
   * @returns {Promise<Object>} Card data
   */
  async getCardByType(type, identifier) {
    switch (type.toLowerCase()) {
      case 'graphene':
        return this.getGrapheneCard(identifier);
      case 'biochar':
        return this.getBiocharCard(identifier);
      case 'batch':
      case 'compound':
        return this.getCompoundBatchCard(identifier);
      case 'micronization':
        return this.getMicronizationCard(identifier);
      default:
        // Try to auto-detect based on identifier pattern
        return this.getCardByIdentifier(identifier);
    }
  }

  /**
   * Auto-detect card type by identifier pattern
   * @param {string} identifier - The experiment/batch number
   * @returns {Promise<Object>} Card data
   */
  async getCardByIdentifier(identifier) {
    if (!identifier) {
      throw new Error('No identifier provided');
    }

    // Detect type by prefix
    if (identifier.startsWith('MRa')) {
      return this.getGrapheneCard(identifier);
    } else if (identifier.startsWith('MB') || identifier.startsWith('BC')) {
      return this.getBiocharCard(identifier);
    } else if (identifier.startsWith('CB')) {
      return this.getCompoundBatchCard(identifier);
    } else if (identifier.startsWith('M')) {
      return this.getMicronizationCard(identifier);
    } else {
      throw new Error(`Unknown identifier type: ${identifier}`);
    }
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Clear specific cache entry
   * @param {string} type - The type of card
   * @param {string} identifier - The experiment/batch number
   */
  clearCacheEntry(type, identifier) {
    const cacheKey = `${type}_${identifier}`;
    this.cache.delete(cacheKey);
  }

  /**
   * Get latest experiments for dashboard
   * @param {number} limit - Number of experiments to fetch
   * @returns {Promise<Array>} Array of experiment cards
   */
  async getLatestExperiments(limit = 5) {
    try {
      const response = await fetch(`/api/graphene?limit=${limit}&sort=desc`);
      if (!response.ok) {
        throw new Error(`Failed to fetch latest experiments: ${response.status}`);
      }
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Failed to fetch latest experiments:', error);
      return [];
    }
  }

  /**
   * Search for experiments
   * @param {string} query - Search query
   * @param {string} type - Type to search (all, graphene, biochar, batch)
   * @returns {Promise<Array>} Search results
   */
  async searchCards(query, type = 'all') {
    const results = [];

    try {
      if (type === 'all' || type === 'graphene') {
        const response = await fetch(`/api/graphene?search=${query}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          results.push(...(data.data || []).map(item => ({ ...item, type: 'graphene' })));
        }
      }

      if (type === 'all' || type === 'biochar') {
        const response = await fetch(`/api/biochar?search=${query}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          results.push(...(data.data || []).map(item => ({ ...item, type: 'biochar' })));
        }
      }

      if (type === 'all' || type === 'batch') {
        const response = await fetch(`/api/compound-batches?search=${query}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          results.push(...(data || []).map(item => ({ ...item, type: 'batch', isCompoundBatch: true })));
        }
      }

      return results;
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }
}

// Create singleton instance
const cardService = new CardService();

// Export for use in other modules
window.CardService = cardService;