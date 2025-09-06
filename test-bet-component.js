// BET Component Integration Test
// This script validates that the BET component loads and functions correctly

console.log('🧪 Starting BET Component Test...');

// Test 1: Check if getBETTabHtml function is available
function testComponentLoading() {
  if (typeof getBETTabHtml === 'function') {
    console.log('✅ BET component function loaded successfully');
    return true;
  } else {
    console.log('❌ BET component function not found');
    return false;
  }
}

// Test 2: Check if component generates valid HTML
function testComponentHTML() {
  try {
    const html = getBETTabHtml();
    if (html && html.includes('test-bet') && html.includes('BET Surface Area Analysis')) {
      console.log('✅ BET component generates valid HTML');
      return true;
    } else {
      console.log('❌ BET component HTML is invalid or incomplete');
      return false;
    }
  } catch (error) {
    console.log('❌ Error generating BET component HTML:', error.message);
    return false;
  }
}

// Test 3: Check if component contains required Alpine.js directives
function testAlpineDirectives() {
  try {
    const html = getBETTabHtml();
    const requiredDirectives = [
      'x-show="activeTab === \'test-bet\'"',
      'x-model="betSearch"',
      'x-for="record in betRecords"',
      '@click="exportData(\'test-bet\')"',
      '@click="initBetForm()"'
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

// Test 4: Check if component uses standardized table classes
function testTableStyling() {
  try {
    const html = getBETTabHtml();
    if (html.includes('table-cell-standard') && html.includes('table-cell-compact')) {
      console.log('✅ Component uses standardized table classes');
      return true;
    } else {
      console.log('❌ Component missing standardized table classes');
      return false;
    }
  } catch (error) {
    console.log('❌ Error checking table styling:', error.message);
    return false;
  }
}

// Run all tests
function runBETComponentTests() {
  console.log('\n=== BET Component Integration Test Results ===');
  
  const tests = [
    { name: 'Component Loading', test: testComponentLoading },
    { name: 'HTML Generation', test: testComponentHTML },
    { name: 'Alpine.js Directives', test: testAlpineDirectives },
    { name: 'Table Styling', test: testTableStyling }
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
    console.log('🎉 All BET component tests passed! Component integration successful.');
    return true;
  } else {
    console.log('⚠️  Some BET component tests failed. Check implementation.');
    return false;
  }
}

// Export for use in browser console or testing
if (typeof window !== 'undefined') {
  window.runBETComponentTests = runBETComponentTests;
  // Auto-run tests when loaded in browser
  setTimeout(runBETComponentTests, 1000);
} else if (typeof module !== 'undefined') {
  module.exports = { runBETComponentTests };
}