// SEM Reports Component Integration Test
// This script validates that the SEM Reports component loads and functions correctly

console.log('🧪 Starting SEM Reports Component Test...');

// Test 1: Check if getSEMReportsTabHtml function is available
function testComponentLoading() {
  if (typeof getSEMReportsTabHtml === 'function') {
    console.log('✅ SEM Reports component function loaded successfully');
    return true;
  } else {
    console.log('❌ SEM Reports component function not found');
    return false;
  }
}

// Test 2: Check if component generates valid HTML
function testComponentHTML() {
  try {
    const html = getSEMReportsTabHtml();
    if (html && html.includes('test-sem') && html.includes('SEM Report Management')) {
      console.log('✅ SEM Reports component generates valid HTML');
      return true;
    } else {
      console.log('❌ SEM Reports component HTML is invalid or incomplete');
      return false;
    }
  } catch (error) {
    console.log('❌ Error generating SEM Reports component HTML:', error.message);
    return false;
  }
}

// Test 3: Check if component contains required Alpine.js directives
function testAlpineDirectives() {
  try {
    const html = getSEMReportsTabHtml();
    const requiredDirectives = [
      'x-show="activeTab === \'test-sem\'"',
      'x-model="semReportSearch"',
      'x-for="report in filteredSemReports"',
      '@click="viewSemPdf',
      '@click="editSemReport(report)"',
      '@click="deleteSemReport(report.id)"',
      'showAddSemReport = true'
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

// Test 4: Check if component includes SEM-specific fields
function testSEMFields() {
  try {
    const html = getSEMReportsTabHtml();
    const requiredFields = [
      'Sample #',
      'Date', 
      'Species',
      'PDF Name',
      'Actions',
      'filteredSemReports',
      'semReportSearch',
      'report.grapheneReports',
      'report.originalName',
      'formatDate(report.reportDate)'
    ];
    
    let allPresent = true;
    requiredFields.forEach(field => {
      if (!html.includes(field)) {
        console.log('❌ Missing SEM field:', field);
        allPresent = false;
      }
    });
    
    if (allPresent) {
      console.log('✅ All SEM-specific fields present');
      return true;
    }
    return false;
  } catch (error) {
    console.log('❌ Error checking SEM fields:', error.message);
    return false;
  }
}

// Test 5: Check if component uses standardized table classes
function testTableStyling() {
  try {
    const html = getSEMReportsTabHtml();
    if (html.includes('table-cell-standard') && html.includes('table-cell-actions')) {
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

// Test 6: Check multi-experiment association support
function testMultiAssociationSupport() {
  try {
    const html = getSEMReportsTabHtml();
    const associationFeatures = [
      'report.grapheneReports && report.grapheneReports.length > 0',
      'x-for="gr in report.grapheneReports"',
      'gr.graphene.experimentNumber',
      'gr.graphene.species',
      'No reports matching your search'
    ];
    
    let allPresent = true;
    associationFeatures.forEach(feature => {
      if (!html.includes(feature)) {
        console.log('❌ Missing association feature:', feature);
        allPresent = false;
      }
    });
    
    if (allPresent) {
      console.log('✅ Multi-experiment association support present');
      return true;
    }
    return false;
  } catch (error) {
    console.log('❌ Error checking association support:', error.message);
    return false;
  }
}

// Test 7: Check PDF functionality and UI elements
function testPDFAndUIElements() {
  try {
    const html = getSEMReportsTabHtml();
    const uiFeatures = [
      'Upload Reports',
      'View PDF',
      'text-red-500', // PDF icon color
      'hover:bg-gray-50',
      'Search filenames, experiment numbers, species...',
      '/uploads/',
      'No SEM reports found'
    ];
    
    let allPresent = true;
    uiFeatures.forEach(feature => {
      if (!html.includes(feature)) {
        console.log('❌ Missing UI feature:', feature);
        allPresent = false;
      }
    });
    
    if (allPresent) {
      console.log('✅ PDF functionality and UI elements present');
      return true;
    }
    return false;
  } catch (error) {
    console.log('❌ Error checking PDF and UI elements:', error.message);
    return false;
  }
}

// Run all tests
function runSEMReportsComponentTests() {
  console.log('\n=== SEM Reports Component Integration Test Results ===');
  
  const tests = [
    { name: 'Component Loading', test: testComponentLoading },
    { name: 'HTML Generation', test: testComponentHTML },
    { name: 'Alpine.js Directives', test: testAlpineDirectives },
    { name: 'SEM Fields', test: testSEMFields },
    { name: 'Table Styling', test: testTableStyling },
    { name: 'Multi-Association Support', test: testMultiAssociationSupport },
    { name: 'PDF & UI Elements', test: testPDFAndUIElements }
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
    console.log('🎉 All SEM Reports component tests passed! Component integration successful.');
    console.log('📄 SEM component supports bulk upload, multi-experiment associations, and PDF management.');
    return true;
  } else {
    console.log('⚠️  Some SEM Reports component tests failed. Check implementation.');
    return false;
  }
}

// Export for use in browser console or testing
if (typeof window !== 'undefined') {
  window.runSEMReportsComponentTests = runSEMReportsComponentTests;
  // Auto-run tests when loaded in browser
  setTimeout(runSEMReportsComponentTests, 3000);
} else if (typeof module !== 'undefined') {
  module.exports = { runSEMReportsComponentTests };
}