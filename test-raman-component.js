// RAMAN Component Integration Test
// This script validates the complex RAMAN matrix component functionality

console.log('🧪 Starting RAMAN Component Test...');

// Test 1: Check if getRAMANTabHtml function is available
function testComponentLoading() {
  if (typeof getRAMANTabHtml === 'function') {
    console.log('✅ RAMAN component function loaded successfully');
    return true;
  } else {
    console.log('❌ RAMAN component function not found');
    return false;
  }
}

// Test 2: Check if component generates valid HTML
function testComponentHTML() {
  try {
    const html = getRAMANTabHtml();
    if (html && html.includes('test-raman') && html.includes('RAMAN Analysis Results')) {
      console.log('✅ RAMAN component generates valid HTML');
      return true;
    } else {
      console.log('❌ RAMAN component HTML is invalid or incomplete');
      return false;
    }
  } catch (error) {
    console.log('❌ Error generating RAMAN component HTML:', error.message);
    return false;
  }
}

// Test 3: Check if component contains required Alpine.js directives
function testAlpineDirectives() {
  try {
    const html = getRAMANTabHtml();
    const requiredDirectives = [
      'x-show="activeTab === \'test-raman\'"',
      'x-model="ramanSearch"',
      'x-for="record in ramanRecords"',
      '@click="exportData(\'test-raman\')"',
      '@click="initRamanForm()"',
      '@click="editRaman(record)"',
      '@click="deleteRaman(record.id)"',
      '@click="viewRamanPdf(record.ramanReportPath)"'
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

// Test 4: Check if component includes RAMAN matrix structure
function testRAMANMatrixStructure() {
  try {
    const html = getRAMANTabHtml();
    const matrixStructure = [
      'Integration Range',
      'Integral Typ A',
      'Integral Typ B',
      'Peak High Typ J',
      '2D Band',
      'G Band', 
      'D Band',
      'D/G Ratio',
      'colspan="4"',
      'colspan="17"'
    ];
    
    let allPresent = true;
    matrixStructure.forEach(element => {
      if (!html.includes(element)) {
        console.log('❌ Missing matrix structure element:', element);
        allPresent = false;
      }
    });
    
    if (allPresent) {
      console.log('✅ RAMAN matrix structure complete');
      return true;
    }
    return false;
  } catch (error) {
    console.log('❌ Error checking matrix structure:', error.message);
    return false;
  }
}

// Test 5: Check if component includes all RAMAN data fields
function testRAMANDataFields() {
  try {
    const html = getRAMANTabHtml();
    const ramanFields = [
      // Integration Range fields
      'integrationRange2DLow',
      'integrationRange2DHigh',
      'integrationRangeGLow',
      'integrationRangeGHigh',
      'integrationRangeDLow',
      'integrationRangeDHigh',
      'integrationRangeDGLow',
      'integrationRangeDGHigh',
      // Integral Typ A fields
      'integralTypA2D1',
      'integralTypA2D2',
      'integralTypAG1',
      'integralTypAG2',
      'integralTypAD1',
      'integralTypAD2',
      'integralTypADG1',
      'integralTypADG2',
      // Integral Typ B fields
      'integralTypB2D1',
      'integralTypB2D2',
      'integralTypBG1',
      'integralTypBG2',
      'integralTypBD1',
      'integralTypBD2',
      'integralTypBDG1',
      'integralTypBDG2',
      // Peak High Typ J fields
      'peakHighTypJ2D1',
      'peakHighTypJ2D2',
      'peakHighTypJG1',
      'peakHighTypJG2',
      'peakHighTypJD1',
      'peakHighTypJD2',
      'peakHighTypJDG1',
      'peakHighTypJDG2'
    ];
    
    let allPresent = true;
    ramanFields.forEach(field => {
      if (!html.includes(field)) {
        console.log('❌ Missing RAMAN data field:', field);
        allPresent = false;
      }
    });
    
    if (allPresent) {
      console.log('✅ All RAMAN data fields present');
      return true;
    }
    return false;
  } catch (error) {
    console.log('❌ Error checking RAMAN data fields:', error.message);
    return false;
  }
}

// Test 6: Check if component uses standardized table classes
function testTableStyling() {
  try {
    const html = getRAMANTabHtml();
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

// Test 7: Check expandable matrix display
function testExpandableMatrix() {
  try {
    const html = getRAMANTabHtml();
    const expandableFeatures = [
      'Absorption Band Analysis',
      'x-show="expandedRows[\'raman_\' + record.id]"',
      'toggleExpanded(\'raman\', record.id)',
      '<table class="w-full text-xs border border-gray-200">',
      'Additional Info'
    ];
    
    let allPresent = true;
    expandableFeatures.forEach(feature => {
      if (!html.includes(feature)) {
        console.log('❌ Missing expandable matrix feature:', feature);
        allPresent = false;
      }
    });
    
    if (allPresent) {
      console.log('✅ Expandable matrix functionality present');
      return true;
    }
    return false;
  } catch (error) {
    console.log('❌ Error checking expandable matrix:', error.message);
    return false;
  }
}

// Test 8: Check PDF viewing functionality
function testPDFViewing() {
  try {
    const html = getRAMANTabHtml();
    const pdfFeatures = [
      'viewRamanPdf',
      'View PDF',
      'ramanReportPath',
      'RAMAN Report'
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
function runRAMANComponentTests() {
  console.log('\n=== RAMAN Component Integration Test Results ===');
  
  const tests = [
    { name: 'Component Loading', test: testComponentLoading },
    { name: 'HTML Generation', test: testComponentHTML },
    { name: 'Alpine.js Directives', test: testAlpineDirectives },
    { name: 'Matrix Structure', test: testRAMANMatrixStructure },
    { name: 'RAMAN Data Fields', test: testRAMANDataFields },
    { name: 'Table Styling', test: testTableStyling },
    { name: 'Expandable Matrix', test: testExpandableMatrix },
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
    console.log('🎉 All RAMAN component tests passed! Complex matrix component integration successful.');
    console.log('🔬 RAMAN matrix supports 4x4 spectroscopy data structure with Integration Range, Integral Typ A, Integral Typ B, and Peak High Typ J measurements.');
    return true;
  } else {
    console.log('⚠️  Some RAMAN component tests failed. Check matrix implementation.');
    return false;
  }
}

// Export for use in browser console or testing
if (typeof window !== 'undefined') {
  window.runRAMANComponentTests = runRAMANComponentTests;
  // Auto-run tests when loaded in browser
  setTimeout(runRAMANComponentTests, 2000);
} else if (typeof module !== 'undefined') {
  module.exports = { runRAMANComponentTests };
}