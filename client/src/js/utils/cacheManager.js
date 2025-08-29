/**
 * Simple cache manager for API responses
 * Reduces unnecessary API calls and improves performance
 */
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Generate cache key from endpoint and parameters
   * @param {string} endpoint - API endpoint
   * @param {object} params - Request parameters
   * @returns {string} Cache key
   */
  generateKey(endpoint, params = {}) {
    const paramString = JSON.stringify(params);
    return `${endpoint}:${paramString}`;
  }

  /**
   * Get cached data if available and not expired
   * @param {string} key - Cache key
   * @returns {any|null} Cached data or null
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    const now = Date.now();
    if (now > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Store data in cache with expiration
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
   */
  set(key, data, ttl = this.cacheTimeout) {
    const expires = Date.now() + ttl;
    this.cache.set(key, { data, expires });
  }

  /**
   * Invalidate cache entries by pattern
   * @param {string} pattern - Pattern to match against keys
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Remove expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
}

// Create global cache instance
const cacheManager = new CacheManager();

// Setup automatic cleanup every 10 minutes
setInterval(() => {
  cacheManager.cleanup();
}, 10 * 60 * 1000);

export default cacheManager;