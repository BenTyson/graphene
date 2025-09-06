// TEM Component Integration Test
// This script validates that the TEM component loads and functions correctly

console.log('🧪 Starting TEM Component Test...');

// Test 1: Check if getTEMTabHtml function is available
function testComponentLoading() {
  if (typeof getTEMTabHtml === 'function') {
    console.log('✅ TEM component function loaded successfully');
    return true;
  } else {
    console.log('❌ TEM component function not found');
    return false;
  }
}

// Test 2: Check if component generates valid HTML
function testComponentHTML() {
  try {
    const html = getTEMTabHtml();
    if (html && html.includes('test-tem') && html.includes('TEM Analysis Results')) {
      console.log('✅ TEM component generates valid HTML');
      return true;
    } else {
      console.log('❌ TEM component HTML is invalid or incomplete');
      return false;
    }
  } catch (error) {
    console.log('❌ Error generating TEM component HTML:', error.message);
    return false;
  }
}

// Test 3: Check if component contains required Alpine.js directives
function testAlpineDirectives() {
  try {
    const html = getTEMTabHtml();
    const requiredDirectives = [
      'x-show="activeTab === \'test-tem\'"',
      'x-model="temSearch"',
      'x-for="record in temRecords"',
      '@click="exportData(\'test-tem\')"',
      '@click="initTemForm()"',
      '@click="editTem(record)"',
      '@click="deleteTem(record.id)"',
      '@click="viewTemPdf(record.temReportPath)"'
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

// Test 4: Check if component includes TEM-specific fields
function testTEMFields() {
  try {
    const html = getTEMTabHtml();
    const requiredFields = [
      'Test Date',
      'Graphene Sample', 
      'Testing Lab',
      'PDF Report',
      'Actions',
      'temReportPath',
      'compoundBatchNumber',
      'grapheneSample'
    ];
    
    let allPresent = true;
    requiredFields.forEach(field => {
      if (!html.includes(field)) {
        console.log('❌ Missing TEM field:', field);
        allPresent = false;
      }
    });
    
    if (allPresent) {
      console.log('✅ All TEM-specific fields present');
      return true;
    }
    return false;
  } catch (error) {
    console.log('❌ Error checking TEM fields:', error.message);
    return false;
  }
}

// Test 5: Check if component uses standardized table classes
function testTableStyling() {
  try {
    const html = getTEMTabHtml();
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

// Test 6: Check dual sample support (Graphene + Compound Batch)
function testDualSampleSupport() {
  try {
    const html = getTEMTabHtml();
    const dualSampleFeatures = [
      'record.grapheneSample',
      'record.compoundBatchNumber',
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'record.grapheneSample ? \'G\' : \'CB\''
    ];
    
    let allPresent = true;
    dualSampleFeatures.forEach(feature => {
      if (!html.includes(feature)) {
        console.log('❌ Missing dual sample feature:', feature);
        allPresent = false;
      }
    });
    
    if (allPresent) {
      console.log('✅ Dual sample support (Graphene + Compound Batch) present');
      return true;
    }
    return false;
  } catch (error) {
    console.log('❌ Error checking dual sample support:', error.message);
    return false;
  }
}

// Test 7: Check PDF viewing functionality
function testPDFViewing() {
  try {
    const html = getTEMTabHtml();
    const pdfFeatures = [
      'viewTemPdf',
      'View PDF',
      'temReportPath',
      'No report'
    ];
    
    let allPresent = true;
    pdfFeatures.forEach(feature => {
      if (!html.includes(feature)) {
        console.log('❌ Missing PDF feature:', feature);
        allPresent = false;
      }
    });
    
    if (allPresent) {
      console.log('✅ PDF viewing functionality present');
      return true;
    }
    return false;
  } catch (error) {
    console.log('❌ Error checking PDF functionality:', error.message);
    return false;
  }
}

// Run all tests
function runTEMComponentTests() {
  console.log('\n=== TEM Component Integration Test Results ===');
  
  const tests = [
    { name: 'Component Loading', test: testComponentLoading },
    { name: 'HTML Generation', test: testComponentHTML },
    { name: 'Alpine.js Directives', test: testAlpineDirectives },
    { name: 'TEM Fields', test: testTEMFields },
    { name: 'Table Styling', test: testTableStyling },
    { name: 'Dual Sample Support', test: testDualSampleSupport },
    { name: 'PDF Viewing', test: testPDFViewing }
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
    console.log('🎉 All TEM component tests passed! Component integration successful.');
    return true;
  } else {
    console.log('⚠️  Some TEM component tests failed. Check implementation.');
    return false;
  }
}

// Export for use in browser console or testing
if (typeof window !== 'undefined') {
  window.runTEMComponentTests = runTEMComponentTests;
  // Auto-run tests when loaded in browser
  setTimeout(runTEMComponentTests, 2500);
} else if (typeof module !== 'undefined') {
  module.exports = { runTEMComponentTests };
}