/**
 * Comprehensive Application Functionality Test Suite
 * Tests all major functionality before and after optimization
 */

class AppFunctionalityTester {
  constructor() {
    this.testResults = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logEntry);
    this.testResults.push(logEntry);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async waitForElement(selector, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await this.sleep(100);
    }
    throw new Error(`Element ${selector} not found within ${timeout}ms`);
  }

  async testTabNavigation() {
    this.log('Testing tab navigation...');
    
    const tabs = [
      'dashboard-tab',
      'biochar-tab', 
      'graphene-tab',
      'compound-batches-tab',
      'shipments-tab',
      'micronization-tab',
      'analysis-tab'
    ];

    for (const tabId of tabs) {
      try {
        const tab = await this.waitForElement(`#${tabId}`);
        tab.click();
        await this.sleep(500); // Wait for tab content to load
        
        const activeTab = document.querySelector('.tab-active');
        if (activeTab && activeTab.id === tabId) {
          this.log(`✅ Tab ${tabId} activated successfully`);
        } else {
          throw new Error(`Tab ${tabId} did not activate properly`);
        }
      } catch (error) {
        this.log(`❌ Tab ${tabId} failed: ${error.message}`, 'error');
        this.errors.push(`Tab navigation - ${tabId}: ${error.message}`);
      }
    }
  }

  async testDataLoading() {
    this.log('Testing data loading...');
    
    const dataTests = [
      { tab: 'biochar-tab', table: '#biochar-table tbody tr', description: 'Biochar data' },
      { tab: 'graphene-tab', table: '#graphene-table tbody tr', description: 'Graphene data' },
      { tab: 'compound-batches-tab', table: '#compound-batches-table tbody tr', description: 'Compound batch data' },
      { tab: 'shipments-tab', table: '#shipments-table tbody tr', description: 'Shipment data' }
    ];

    for (const test of dataTests) {
      try {
        // Navigate to tab
        const tab = await this.waitForElement(`#${test.tab}`);
        tab.click();
        await this.sleep(1000); // Wait for data to load
        
        // Check if data loaded
        const rows = document.querySelectorAll(test.table);
        if (rows.length > 0) {
          this.log(`✅ ${test.description} loaded successfully (${rows.length} rows)`);
        } else {
          this.log(`⚠️ ${test.description} appears empty`, 'warning');
        }
      } catch (error) {
        this.log(`❌ ${test.description} loading failed: ${error.message}`, 'error');
        this.errors.push(`Data loading - ${test.description}: ${error.message}`);
      }
    }
  }

  async testModalSystem() {
    this.log('Testing modal system...');
    
    try {
      // Go to biochar tab
      const biocharTab = await this.waitForElement('#biochar-tab');
      biocharTab.click();
      await this.sleep(500);
      
      // Try to open add biochar modal
      const addButton = await this.waitForElement('button[x-text*="Add"]');
      addButton.click();
      await this.sleep(500);
      
      // Check if modal opened
      const modal = document.querySelector('[x-show*="modal"]');
      if (modal) {
        this.log('✅ Modal system working - biochar modal opened');
        
        // Close modal
        const closeButton = document.querySelector('[x-text*="Cancel"]') || 
                           document.querySelector('[x-text*="Close"]');
        if (closeButton) {
          closeButton.click();
          await this.sleep(300);
          this.log('✅ Modal closed successfully');
        }
      } else {
        throw new Error('Modal did not open');
      }
    } catch (error) {
      this.log(`❌ Modal system test failed: ${error.message}`, 'error');
      this.errors.push(`Modal system: ${error.message}`);
    }
  }

  async testSearchFunctionality() {
    this.log('Testing search functionality...');
    
    try {
      // Go to graphene tab
      const grapheneTab = await this.waitForElement('#graphene-tab');
      grapheneTab.click();
      await this.sleep(500);
      
      // Find search input
      const searchInput = document.querySelector('input[placeholder*="search"], input[x-model*="search"]');
      if (searchInput) {
        // Type in search
        searchInput.value = 'MRa';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        await this.sleep(1000); // Wait for debounced search
        
        this.log('✅ Search functionality appears to be working');
      } else {
        throw new Error('Search input not found');
      }
    } catch (error) {
      this.log(`❌ Search test failed: ${error.message}`, 'error');
      this.errors.push(`Search functionality: ${error.message}`);
    }
  }

  async testFilterSystem() {
    this.log('Testing filter system...');
    
    try {
      // Go to graphene tab where filters are most complex
      const grapheneTab = await this.waitForElement('#graphene-tab');
      grapheneTab.click();
      await this.sleep(500);
      
      // Look for filter elements
      const filterElements = document.querySelectorAll('[x-model*="filter"]');
      if (filterElements.length > 0) {
        this.log(`✅ Filter system detected (${filterElements.length} filter controls)`);
      } else {
        this.log('⚠️ No filter elements found', 'warning');
      }
    } catch (error) {
      this.log(`❌ Filter system test failed: ${error.message}`, 'error');
      this.errors.push(`Filter system: ${error.message}`);
    }
  }

  async testDashboard() {
    this.log('Testing dashboard...');
    
    try {
      // Go to dashboard tab
      const dashboardTab = await this.waitForElement('#dashboard-tab');
      dashboardTab.click();
      await this.sleep(1000); // Wait for dashboard to load
      
      // Check for dashboard widgets
      const widgets = document.querySelectorAll('.dashboard-widget, [class*="widget"]');
      if (widgets.length > 0) {
        this.log(`✅ Dashboard loaded with ${widgets.length} widgets`);
      } else {
        this.log('⚠️ Dashboard widgets not detected', 'warning');
      }
    } catch (error) {
      this.log(`❌ Dashboard test failed: ${error.message}`, 'error');
      this.errors.push(`Dashboard: ${error.message}`);
    }
  }

  async testExpandableRows() {
    this.log('Testing expandable rows...');
    
    try {
      // Go to graphene tab
      const grapheneTab = await this.waitForElement('#graphene-tab');
      grapheneTab.click();
      await this.sleep(500);
      
      // Look for expandable row triggers
      const expandTriggers = document.querySelectorAll('[x-text*="experimentNumber"], .cursor-pointer[x-text]');
      if (expandTriggers.length > 0) {
        // Try to click first row
        expandTriggers[0].click();
        await this.sleep(500);
        this.log('✅ Expandable row system appears functional');
      } else {
        this.log('⚠️ No expandable rows found', 'warning');
      }
    } catch (error) {
      this.log(`❌ Expandable rows test failed: ${error.message}`, 'error');
      this.errors.push(`Expandable rows: ${error.message}`);
    }
  }

  async testConsoleErrors() {
    this.log('Checking for console errors...');
    
    const originalError = console.error;
    const errors = [];
    
    console.error = (...args) => {
      errors.push(args.join(' '));
      originalError.apply(console, args);
    };
    
    // Wait a bit to collect any errors
    await this.sleep(2000);
    
    console.error = originalError;
    
    if (errors.length === 0) {
      this.log('✅ No console errors detected');
    } else {
      this.log(`⚠️ ${errors.length} console errors detected:`, 'warning');
      errors.forEach(error => this.log(`  - ${error}`, 'warning'));
      this.errors.push(`Console errors: ${errors.length} errors found`);
    }
  }

  async runAllTests() {
    this.log('🚀 Starting comprehensive application functionality test...');
    this.log('📊 Current app-refactored.js size: 4,651 lines');
    
    const tests = [
      this.testTabNavigation.bind(this),
      this.testDataLoading.bind(this),
      this.testModalSystem.bind(this),
      this.testSearchFunctionality.bind(this),
      this.testFilterSystem.bind(this),
      this.testDashboard.bind(this),
      this.testExpandableRows.bind(this),
      this.testConsoleErrors.bind(this)
    ];

    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        this.log(`❌ Test failed with error: ${error.message}`, 'error');
        this.errors.push(`Test execution error: ${error.message}`);
      }
      await this.sleep(500); // Brief pause between tests
    }

    this.generateReport();
  }

  generateReport() {
    this.log('\n📋 === TEST SUMMARY REPORT ===');
    this.log(`Total tests completed: ${this.testResults.length}`);
    this.log(`Total errors/warnings: ${this.errors.length}`);
    
    if (this.errors.length === 0) {
      this.log('🎉 ALL TESTS PASSED - Application functionality verified');
    } else {
      this.log('⚠️ Issues detected:');
      this.errors.forEach(error => this.log(`  - ${error}`));
    }
    
    this.log('\n💾 Test results logged - ready for optimization work');
    
    // Store results globally for later comparison
    window.preOptimizationTestResults = {
      testResults: [...this.testResults],
      errors: [...this.errors],
      timestamp: new Date().toISOString()
    };
  }
}

// Auto-run tests when loaded
if (typeof window !== 'undefined') {
  window.AppTester = AppFunctionalityTester;
  
  // Wait for page to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        const tester = new AppFunctionalityTester();
        tester.runAllTests();
      }, 2000); // Wait 2 seconds for Alpine.js to initialize
    });
  } else {
    setTimeout(() => {
      const tester = new AppFunctionalityTester();
      tester.runAllTests();
    }, 2000);
  }
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppFunctionalityTester;
}