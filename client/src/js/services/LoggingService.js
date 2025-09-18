/**
 * Logging Service
 * 
 * Provides tiered logging with environment-based controls
 * Replaces excessive console.log statements throughout the application
 * 
 * Usage:
 * - logger.error() - Always shown, for errors
 * - logger.warn() - Always shown, for warnings
 * - logger.info() - Shown in development, for important info
 * - logger.debug() - Only shown when DEBUG=true, for detailed debugging
 */

class LoggingService {
  constructor() {
    // Determine environment - check for development indicators
    this.isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.port !== '';
    
    // Enable debug logging via localStorage or URL param
    this.isDebugEnabled = localStorage.getItem('debug') === 'true' ||
                         new URLSearchParams(window.location.search).has('debug');
    
    this.init();
  }
  
  init() {
    if (this.isDevelopment) {
      console.log(`🐞 LoggingService initialized - Debug: ${this.isDebugEnabled ? 'ON' : 'OFF'}`);
    }
  }
  
  /**
   * Error logging - always shown
   */
  error(message, ...args) {
    console.error(`❌ ${message}`, ...args);
  }
  
  /**
   * Warning logging - always shown
   */
  warn(message, ...args) {
    console.warn(`⚠️ ${message}`, ...args);
  }
  
  /**
   * Info logging - shown in development
   */
  info(message, ...args) {
    if (this.isDevelopment) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  }
  
  /**
   * Debug logging - only when explicitly enabled
   */
  debug(message, ...args) {
    if (this.isDebugEnabled) {
      console.log(`🐞 ${message}`, ...args);
    }
  }
  
  /**
   * Navigation logging - specialized for nav debugging
   */
  navigation(message, ...args) {
    if (this.isDebugEnabled) {
      console.log(`🧭 [Navigation] ${message}`, ...args);
    }
  }
  
  /**
   * Component logging - only when debug enabled
   */
  component(componentName, message = 'initialized', ...args) {
    if (this.isDebugEnabled) {
      console.log(`🔧 [${componentName}] ${message}`, ...args);
    }
  }
  
  /**
   * Router logging - specialized for routing debugging
   */
  router(message, ...args) {
    if (this.isDebugEnabled) {
      console.log(`🛣️ [Router] ${message}`, ...args);
    }
  }
  
  /**
   * API logging - for API calls and responses
   */
  api(message, ...args) {
    if (this.isDebugEnabled) {
      console.log(`📡 [API] ${message}`, ...args);
    }
  }
  
  /**
   * Success logging - important successes in development
   */
  success(message, ...args) {
    if (this.isDevelopment) {
      console.log(`✅ ${message}`, ...args);
    }
  }
  
  /**
   * Enable debug mode programmatically
   */
  enableDebug() {
    this.isDebugEnabled = true;
    localStorage.setItem('debug', 'true');
    console.log('🐞 Debug logging enabled');
  }
  
  /**
   * Disable debug mode programmatically
   */
  disableDebug() {
    this.isDebugEnabled = false;
    localStorage.removeItem('debug');
    console.log('🐞 Debug logging disabled');
  }
  
  /**
   * Get current logging status
   */
  getStatus() {
    return {
      isDevelopment: this.isDevelopment,
      isDebugEnabled: this.isDebugEnabled
    };
  }
}

// Create singleton instance
const logger = new LoggingService();

// Make globally available
window.logger = logger;

export default logger;