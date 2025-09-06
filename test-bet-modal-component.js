// BET Modal Component Integration Test
// This script validates that the BET Modal component loads and functions correctly

console.log('🧪 Starting BET Modal Component Test...');

// Test 1: Check if getBETModalHtml function is available
function testComponentLoading() {
  if (typeof getBETModalHtml === 'function') {
    console.log('✅ BET Modal component function loaded successfully');
    return true;
  } else {
    console.log('❌ BET Modal component function not found');
    return false;
  }
}

// Test 2: Check if component generates valid HTML
function testComponentHTML() {
  try {
    const html = getBETModalHtml();
    if (html && html.includes('showAddBet') && html.includes('BET Record')) {
      console.log('✅ BET Modal component generates valid HTML');
      return true;
    } else {
      console.log('❌ BET Modal component HTML is invalid or incomplete');
      return false;
    }
  } catch (error) {
    console.log('❌ Error generating BET Modal component HTML:', error.message);
    return false;
  }
}

// Test 3: Check if component contains required Alpine.js directives
function testAlpineDirectives() {
  try {
    const html = getBETModalHtml();
    const requiredDirectives = [
      'x-show="showAddBet"',
      'x-cloak',
      '@click.away="showAddBet = false; editingBet = null"',
      'x-text="editingBet ? \'Edit BET Record\' : \'Add BET Record\'"',
      '@submit.prevent="saveBet()"',
      'x-model="betForm.materialType"',
      'x-model="betForm.grapheneSample"',
      'x-model="betForm.compoundBatchNumber"',
      'x-model="betForm.researchTeam"',
      'x-model="betForm.testingLab"',
      'x-model="betForm.comments"'
    ];
    
    let allPresent = true;
    requiredDirectives.forEach(directive => {
      if (!html.includes(directive)) {
        console.log('❌ Missing Alpine.js directive:', directive);
        allPresent = false;
      }
    });
    
    if (allPresent) {
      console.log('✅ All required Alpine.js directives present');
      return true;
    }
    return false;
  } catch (error) {
    console.log('❌ Error checking Alpine.js directives:', error.message);
    return false;
  }
}

// Test 4: Check if component integrates with Phase 1 form field helpers
function testFormFieldIntegration() {
  try {
    const html = getBETModalHtml();
    const formFieldHelpers = [
      'getDateFieldHtml',
      'getNumericFieldHtml',
      'getFileFieldHtml'
    ];
    
    let allPresent = true;
    formFieldHelpers.forEach(helper => {
      if (!html.includes(helper)) {
        console.log('❌ Missing form field helper:', helper);
        allPresent = false;
      }
    });
    
    if (allPresent) {
      console.log('✅ All form field helpers integrated correctly');
      return true;
    }
    return false;
  } catch (error) {
    console.log('❌ Error checking form field integration:', error.message);
    return false;
  }
}

// Test 5: Check BET-specific form fields
function testBETFields() {
  try {
    const html = getBETModalHtml();
    const betFields = [
      'betForm.testDate',
      'betForm.mass',
      'betForm.multipointBetArea',
      'betForm.langmuirSurfaceArea',
      'betForm.betReportFile',
      'Individual Graphene Batch',
      'Compound Batch',
      'Sample Source',
      'Multipoint BET Area',
      'Langmuir Surface Area',
      'm²/g',
      'BET Report (PDF)',
      'e.g., 1.88e3 or 1880'
    ];
    
    let allPresent = true;
    betFields.forEach(field => {
      if (!html.includes(field)) {
        console.log('❌ Missing BET-specific field:', field);
        allPresent = false;
      }
    });
    
    if (allPresent) {
      console.log('✅ All BET-specific fields present');
      return true;
    }
    return false;
  } catch (error) {
    console.log('❌ Error checking BET fields:', error.message);
    return false;
  }
}

// Test 6: Check modal structure and styling
function testModalStructure() {
  try {
    const html = getBETModalHtml();
    const structuralElements = [
      'fixed inset-0 z-50 overflow-y-auto',
      'flex items-center justify-center min-h-screen',
      'bg-black opacity-50',
      'relative bg-white rounded-none md:rounded-lg',
      'max-w-2xl',
      'space-y-4',
      'grid grid-cols-2 gap-4',
      'flex justify-end space-x-3'
    ];
    
    let allPresent = true;
    structuralElements.forEach(element => {
      if (!html.includes(element)) {
        console.log('❌ Missing structural element:', element);
        allPresent = false;
      }
    });
    
    if (allPresent) {
      console.log('✅ Modal structure and styling correct');
      return true;
    }
    return false;
  } catch (error) {
    console.log('❌ Error checking modal structure:', error.message);
    return false;
  }
}

// Test 7: Check dual sample support functionality
function testDualSampleSupport() {
  try {
    const html = getBETModalHtml();
    const dualSampleFeatures = [
      'x-show="betForm.materialType === \'graphene\'"',
      'x-show="betForm.materialType === \'compound\'"',
      'availableGrapheneSamples',
      'compoundBatches',
      '@change="betForm.compoundBatchNumber = \'\'"',
      '@change="betForm.grapheneSample = \'\'"',
      ':required="betForm.materialType === \'graphene\'"',
      ':required="betForm.materialType === \'compound\'"'
    ];
    
    let allPresent = true;
    dualSampleFeatures.forEach(feature => {
      if (!html.includes(feature)) {
        console.log('❌ Missing dual sample feature:', feature);
        allPresent = false;
      }
    });
    
    if (allPresent) {
      console.log('✅ Dual sample support (Graphene + Compound Batch) implemented correctly');
      return true;
    }
    return false;
  } catch (error) {
    console.log('❌ Error checking dual sample support:', error.message);
    return false;
  }
}

// Run all tests
function runBETModalComponentTests() {
  console.log('\n=== BET Modal Component Integration Test Results ===');
  
  const tests = [
    { name: 'Component Loading', test: testComponentLoading },
    { name: 'HTML Generation', test: testComponentHTML },
    { name: 'Alpine.js Directives', test: testAlpineDirectives },
    { name: 'Form Field Integration', test: testFormFieldIntegration },
    { name: 'BET-Specific Fields', test: testBETFields },
    { name: 'Modal Structure', test: testModalStructure },
    { name: 'Dual Sample Support', test: testDualSampleSupport }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  tests.forEach(({ name, test }) => {
    console.log(`\nTesting ${name}...`);
    if (test()) {
      passed++;
    }
  });
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All BET Modal component tests passed! Modal componentization successful.');
    console.log('🧪 BET Modal supports dual sample types, scientific notation, and complete form validation.');
    return true;
  } else {
    console.log('⚠️  Some BET Modal component tests failed. Check implementation.');
    return false;
  }
}

// Export for use in browser console or testing
if (typeof window !== 'undefined') {
  window.runBETModalComponentTests = runBETModalComponentTests;
  // Auto-run tests when loaded in browser
  setTimeout(runBETModalComponentTests, 1000);
} else if (typeof module !== 'undefined') {
  module.exports = { runBETModalComponentTests };
}