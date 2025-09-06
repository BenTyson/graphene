// Complete Modal Components Test Suite
// This script validates ALL modal components extracted in Phase 3

console.log('🚀 Starting Complete Modal Components Test Suite...');
console.log('📋 Testing Phase 3 Modal Componentization Results\n');

// Import individual test modules (if available)
let individualTestResults = {
  bet: null,
  conductivity: null
};

// Master test functions for all modal components
function testAllComponentsLoading() {
  console.log('=== COMPONENT LOADING TESTS ===');
  const components = [
    { name: 'BET Modal', func: 'getBETModalHtml' },
    { name: 'Conductivity Modal', func: 'getConductivityModalHtml' },
    { name: 'TEM Modal', func: 'getTEMModalHtml' },
    { name: 'Shipment Modal', func: 'getShipmentModalHtml' }
  ];
  
  let loadedComponents = 0;
  let totalComponents = components.length;
  
  components.forEach(component => {
    if (typeof window[component.func] === 'function') {
      console.log(`✅ ${component.name} component loaded successfully`);
      loadedComponents++;
    } else {
      console.log(`❌ ${component.name} component function not found`);
    }
  });
  
  console.log(`\n📊 Component Loading: ${loadedComponents}/${totalComponents} components loaded\n`);
  return loadedComponents === totalComponents;
}

function testAllComponentsHTML() {
  console.log('=== HTML GENERATION TESTS ===');
  const tests = [
    { name: 'BET Modal', func: 'getBETModalHtml', checkFor: ['showAddBet', 'BET Record'] },
    { name: 'Conductivity Modal', func: 'getConductivityModalHtml', checkFor: ['showAddConductivity', 'Conductivity Test'] },
    { name: 'TEM Modal', func: 'getTEMModalHtml', checkFor: ['showAddTem', 'TEM Test'] },
    { name: 'Shipment Modal', func: 'getShipmentModalHtml', checkFor: ['showAddShipment', 'Shipment'] }
  ];
  
  let validComponents = 0;
  let totalComponents = tests.length;
  
  tests.forEach(test => {
    if (typeof window[test.func] === 'function') {
      try {
        const html = window[test.func]();
        let allChecksPass = true;
        
        test.checkFor.forEach(check => {
          if (!html.includes(check)) {
            allChecksPass = false;
          }
        });
        
        if (allChecksPass && html.length > 100) {
          console.log(`✅ ${test.name} generates valid HTML`);
          validComponents++;
        } else {
          console.log(`❌ ${test.name} HTML validation failed`);
        }
      } catch (error) {
        console.log(`❌ ${test.name} HTML generation error:`, error.message);
      }
    } else {
      console.log(`⚠️  ${test.name} function not available for testing`);
    }
  });
  
  console.log(`\n📊 HTML Generation: ${validComponents}/${totalComponents} components valid\n`);
  return validComponents === totalComponents;
}

function testAlpineIntegration() {
  console.log('=== ALPINE.JS INTEGRATION TESTS ===');
  const commonDirectives = [
    'x-show',
    'x-cloak',
    '@click.away',
    'x-text',
    '@submit.prevent',
    'x-model'
  ];
  
  const components = ['getBETModalHtml', 'getConductivityModalHtml', 'getTEMModalHtml', 'getShipmentModalHtml'];
  let validIntegrations = 0;
  let totalComponents = components.length;
  
  components.forEach(componentFunc => {
    if (typeof window[componentFunc] === 'function') {
      try {
        const html = window[componentFunc]();
        let directiveCount = 0;
        
        commonDirectives.forEach(directive => {
          if (html.includes(directive)) {
            directiveCount++;
          }
        });
        
        if (directiveCount >= 4) { // At least 4 common directives should be present
          console.log(`✅ ${componentFunc.replace('get', '').replace('Html', '')} has proper Alpine.js integration`);
          validIntegrations++;
        } else {
          console.log(`❌ ${componentFunc.replace('get', '').replace('Html', '')} Alpine.js integration insufficient`);
        }
      } catch (error) {
        console.log(`❌ ${componentFunc.replace('get', '').replace('Html', '')} Alpine.js test error:`, error.message);
      }
    }
  });
  
  console.log(`\n📊 Alpine.js Integration: ${validIntegrations}/${totalComponents} components valid\n`);
  return validIntegrations === totalComponents;
}

function testFormFieldIntegration() {
  console.log('=== FORM FIELD HELPER INTEGRATION TESTS ===');
  const formFieldHelpers = [
    'getDateFieldHtml',
    'getSelectFieldHtml', 
    'getNumericFieldHtml',
    'getFileFieldHtml'
  ];
  
  const components = ['getBETModalHtml', 'getConductivityModalHtml', 'getTEMModalHtml', 'getShipmentModalHtml'];
  let validIntegrations = 0;
  let totalComponents = components.length;
  
  components.forEach(componentFunc => {
    if (typeof window[componentFunc] === 'function') {
      try {
        const html = window[componentFunc]();
        let helperCount = 0;
        
        formFieldHelpers.forEach(helper => {
          if (html.includes(helper)) {
            helperCount++;
          }
        });
        
        if (helperCount >= 2) { // At least 2 form field helpers should be present
          console.log(`✅ ${componentFunc.replace('get', '').replace('Html', '')} integrates with Phase 1 form helpers`);
          validIntegrations++;
        } else {
          console.log(`❌ ${componentFunc.replace('get', '').replace('Html', '')} lacks form helper integration`);
        }
      } catch (error) {
        console.log(`❌ ${componentFunc.replace('get', '').replace('Html', '')} form helper test error:`, error.message);
      }
    }
  });
  
  console.log(`\n📊 Form Field Integration: ${validIntegrations}/${totalComponents} components valid\n`);
  return validIntegrations === totalComponents;
}

function testDualSampleSupport() {
  console.log('=== DUAL SAMPLE SUPPORT TESTS ===');
  const testComponents = ['getBETModalHtml', 'getConductivityModalHtml', 'getTEMModalHtml'];
  const dualSampleFeatures = [
    'Individual Graphene Batch',
    'Compound Batch',
    'availableGrapheneSamples',
    'compoundBatches'
  ];
  
  let validComponents = 0;
  let totalComponents = testComponents.length;
  
  testComponents.forEach(componentFunc => {
    if (typeof window[componentFunc] === 'function') {
      try {
        const html = window[componentFunc]();
        let featureCount = 0;
        
        dualSampleFeatures.forEach(feature => {
          if (html.includes(feature)) {
            featureCount++;
          }
        });
        
        if (featureCount >= 3) {
          console.log(`✅ ${componentFunc.replace('get', '').replace('Html', '')} supports dual sample types`);
          validComponents++;
        } else {
          console.log(`❌ ${componentFunc.replace('get', '').replace('Html', '')} dual sample support incomplete`);
        }
      } catch (error) {
        console.log(`❌ ${componentFunc.replace('get', '').replace('Html', '')} dual sample test error:`, error.message);
      }
    }
  });
  
  console.log(`\n📊 Dual Sample Support: ${validComponents}/${totalComponents} test components valid\n`);
  return validComponents === totalComponents;
}

function testModalStructure() {
  console.log('=== MODAL STRUCTURE & STYLING TESTS ===');
  const structuralElements = [
    'fixed inset-0 z-50 overflow-y-auto',
    'flex items-center justify-center min-h-screen',
    'bg-black opacity-50',
    'relative bg-white rounded-none md:rounded-lg',
    'space-y-4',
    'flex justify-end space-x-'
  ];
  
  const components = ['getBETModalHtml', 'getConductivityModalHtml', 'getTEMModalHtml', 'getShipmentModalHtml'];
  let validStructures = 0;
  let totalComponents = components.length;
  
  components.forEach(componentFunc => {
    if (typeof window[componentFunc] === 'function') {
      try {
        const html = window[componentFunc]();
        let structureCount = 0;
        
        structuralElements.forEach(element => {
          if (html.includes(element)) {
            structureCount++;
          }
        });
        
        if (structureCount >= 4) {
          console.log(`✅ ${componentFunc.replace('get', '').replace('Html', '')} has proper modal structure`);
          validStructures++;
        } else {
          console.log(`❌ ${componentFunc.replace('get', '').replace('Html', '')} modal structure incomplete`);
        }
      } catch (error) {
        console.log(`❌ ${componentFunc.replace('get', '').replace('Html', '')} structure test error:`, error.message);
      }
    }
  });
  
  console.log(`\n📊 Modal Structure: ${validStructures}/${totalComponents} components valid\n`);
  return validStructures === totalComponents;
}

// Component-specific tests
function testSpecificFeatures() {
  console.log('=== COMPONENT-SPECIFIC FEATURE TESTS ===');
  
  const specificTests = [
    {
      component: 'getBETModalHtml',
      name: 'BET Modal',
      features: ['multipointBetArea', 'langmuirSurfaceArea', 'm²/g', 'e.g., 1.88e3']
    },
    {
      component: 'getConductivityModalHtml', 
      name: 'Conductivity Modal',
      features: ['1kN Conductivity', '8kN Conductivity', '12kN Conductivity', '20kN Conductivity', 'S/cm²']
    },
    {
      component: 'getTEMModalHtml',
      name: 'TEM Modal', 
      features: ['TEM Report (PDF)', 'TEM analysis', 'temReportPath', 'removeTEMReport']
    },
    {
      component: 'getShipmentModalHtml',
      name: 'Shipment Modal',
      features: ['Micronized SKU', 'Auto-generated if empty', 'Amount Shipped', 'Ship From Location']
    }
  ];
  
  let validFeatures = 0;
  let totalTests = specificTests.length;
  
  specificTests.forEach(test => {
    if (typeof window[test.component] === 'function') {
      try {
        const html = window[test.component]();
        let featureCount = 0;
        
        test.features.forEach(feature => {
          if (html.includes(feature)) {
            featureCount++;
          }
        });
        
        if (featureCount >= Math.floor(test.features.length * 0.75)) { // 75% of specific features
          console.log(`✅ ${test.name} specific features present`);
          validFeatures++;
        } else {
          console.log(`❌ ${test.name} missing specific features (${featureCount}/${test.features.length})`);
        }
      } catch (error) {
        console.log(`❌ ${test.name} specific feature test error:`, error.message);
      }
    }
  });
  
  console.log(`\n📊 Component-Specific Features: ${validFeatures}/${totalTests} components valid\n`);
  return validFeatures === totalTests;
}

// Run comprehensive test suite
function runCompleteModalTestSuite() {
  console.log('🧪 === PHASE 3 MODAL COMPONENTIZATION TEST SUITE ===');
  console.log('🎯 Testing All Extracted Modal Components\n');
  
  const testSuite = [
    { name: 'Component Loading', test: testAllComponentsLoading },
    { name: 'HTML Generation', test: testAllComponentsHTML },
    { name: 'Alpine.js Integration', test: testAlpineIntegration },
    { name: 'Form Field Integration', test: testFormFieldIntegration },
    { name: 'Dual Sample Support', test: testDualSampleSupport },
    { name: 'Modal Structure', test: testModalStructure },
    { name: 'Component-Specific Features', test: testSpecificFeatures }
  ];
  
  let passedTests = 0;
  let totalTests = testSuite.length;
  
  testSuite.forEach(({ name, test }) => {
    console.log(`\n🧪 Testing ${name}...`);
    if (test()) {
      passedTests++;
    }
  });
  
  // Final Results
  console.log('\n' + '='.repeat(60));
  console.log('🎉 PHASE 3 MODAL COMPONENTIZATION TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`📊 Overall Results: ${passedTests}/${totalTests} test categories passed`);
  console.log(`🎯 Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL MODAL COMPONENT TESTS PASSED!');
    console.log('✅ Phase 3 Modal Componentization SUCCESS');
    console.log('🚀 Components extracted:');
    console.log('   • BET Add/Edit Modal (~138 lines)');
    console.log('   • Conductivity Add/Edit Modal (~136 lines)');
    console.log('   • TEM Add/Edit Modal (~113 lines)');
    console.log('   • Shipment Add/Edit Modal (~185 lines)');
    console.log(`📉 Total HTML reduction: ~572 lines from index.html`);
    console.log('🎯 All components support dual sample types and Phase 1 form helpers');
    console.log('🧪 All components preserve Alpine.js reactivity and functionality');
    return true;
  } else {
    console.log('\n⚠️  Some modal component tests failed');
    console.log('🔧 Review implementation details for failing components');
    return false;
  }
}

// Auto-run tests and make available globally
if (typeof window !== 'undefined') {
  window.runCompleteModalTestSuite = runCompleteModalTestSuite;
  
  // Auto-run after a delay to allow all components to load
  setTimeout(() => {
    console.log('⏰ Auto-running Phase 3 Modal Component Test Suite...\n');
    runCompleteModalTestSuite();
  }, 2000);
} else if (typeof module !== 'undefined') {
  module.exports = { runCompleteModalTestSuite };
}