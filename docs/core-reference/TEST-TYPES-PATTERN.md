# Test Types Architecture Pattern

Complete reference for adding new test types to the system. Last updated: January 2025 (Particle Size implementation).

---

## Overview

Test types follow a consistent full-stack pattern that includes database schema, backend API, frontend UI, and integration points. This document captures the established architecture for future implementations.

---

## Current Test Types

- **BET** - Surface area analysis (Multipoint BET, Langmuir)
- **Conductivity** - Electrical conductivity at multiple pressures (1kN, 8kN, 12kN, 20kN)
- **RAMAN** - Spectroscopy analysis (2D, G, D, D/G peaks with integration ranges)
- **TEM** - Transmission Electron Microscopy
- **Particle Size** - Particle size distribution analysis (D10, D50, D90, Mean, Span)

---

## Architecture Pattern

### 1. Database Layer (Prisma Schema)

**File**: `prisma/schema.prisma`

**Pattern**:
```prisma
model TestNameTest {
  id                    String        @id @default(cuid())
  testDate              DateTime?     @map("test_date")

  // Sample references (supports multiple material types)
  grapheneSample        String?       @map("graphene_sample")
  compoundBatchNumber   String?       @map("compound_batch_number")
  micronizationSku      String?       @map("micronization_sku")
  mcbNumber             String?       @map("mcb_number")

  // Test-specific measurement fields (use Decimal for precision)
  measurementField1     Decimal?      @db.Decimal(10, 4)
  measurementField2     Decimal?      @db.Decimal(10, 4)

  // Optional standard fields
  testingLab            String?       @map("testing_lab")
  testingMethod         String?       @map("testing_method")
  researchTeam          String?       @map("research_team")

  // File upload support
  reportPath            String?       @map("report_path")

  comments              String?
  createdAt             DateTime      @default(now()) @map("created_at")
  updatedAt             DateTime      @updatedAt @map("updated_at")

  // Relations (add all supported material types)
  grapheneRef           Graphene?             @relation(fields: [grapheneSample], references: [experimentNumber])
  compoundBatchRef      CompoundBatch?        @relation(fields: [compoundBatchNumber], references: [batchNumber])
  micronizationRef      Micronization?        @relation(fields: [micronizationSku], references: [sku])
  mcbRef                MicronizedCompoundBatch? @relation(fields: [mcbNumber], references: [mcbNumber])

  // Indexes for performance
  @@index([grapheneSample])
  @@index([compoundBatchNumber])
  @@index([micronizationSku])
  @@index([mcbNumber])
  @@index([testDate])
  @@map("test_name_test")
}
```

**Don't forget**: Add reverse relations to Graphene, CompoundBatch, Micronization, MCB models.

**Migration**: Use `npx prisma db push` for development or create proper migration.

---

### 2. Backend API Layer

**File Structure**:
- Route: `server/routes/testName.js`
- Registration: `server/index.js`

**Endpoints Pattern**:
```javascript
// CRUD operations
GET    /api/test-name              // List all with search/sort
GET    /api/test-name/:id          // Get single record
POST   /api/test-name              // Create new (with file upload)
PUT    /api/test-name/:id          // Update (with file upload)
DELETE /api/test-name/:id          // Delete (with file cleanup)
GET    /api/test-name/export/csv   // Export to CSV
```

**Key Features**:
- File upload middleware with validation
- Decimal field conversion (Prisma Decimal → Number for frontend)
- Material type handling (ensure only one sample reference is set)
- Search across multiple fields
- Sorted by testDate DESC by default
- AI insights cache invalidation on changes

**File Upload Configuration**:
```javascript
const upload = createFileUploadMiddleware('test-name-reports', {
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
  validateContent: false  // Disable for images
});
```

---

### 3. Frontend Components

#### Tab Component
**File**: `client/src/js/components/tabs/TestResultsTestNameTab.js`

**Features**:
- Search bar with live filtering
- Data table with all relevant columns
- Material type badges (G/CB/M/MCB) with color coding
- Export CSV button
- Add Record button
- Edit/Delete actions
- Report viewing (PDF/images)
- Empty state handling

**Table Columns Pattern**:
1. Test Date
2. Sample (with type badge)
3. Measurement fields
4. Testing Lab
5. Testing Method (if applicable)
6. Comments (icon with modal)
7. Report (view link)
8. Actions (edit/delete)

#### Modal Component
**File**: `client/src/js/components/modals/TestNameModal.js`

**Features**:
- Date field with "Unknown" checkbox
- Material type radio buttons (Graphene/Compound/Micronization/MCB)
- Dynamic sample dropdowns (only show selected type)
- Test-specific measurement inputs (use `getNumericFieldHtml` helper)
- Testing Lab dropdown (from global testingLabs array)
- Testing Method dropdown (if applicable)
- File upload field (PDF/JPG/PNG support)
- Comments textarea
- Cancel/Submit buttons with loading states

**Form Validation**:
- Require sample selection based on material type
- Clear other sample fields when switching types
- Handle decimal precision appropriately

---

### 4. Service Layer

#### API Service
**File**: `client/src/js/services/api.js`

**Pattern**:
```javascript
export const testNameAPI = {
  getAll: (search = '') => fetch(`${API_BASE}/test-name${search ? `?search=${encodeURIComponent(search)}` : ''}`).then(handleResponse),
  getById: (id) => fetch(`${API_BASE}/test-name/${id}`).then(handleResponse),
  create: async (data, file) => { /* FormData with file */ },
  update: async (id, data, file) => { /* FormData with file */ },
  delete: (id) => fetch(`${API_BASE}/test-name/${id}`, { method: 'DELETE' }).then(handleResponse),
  exportCSV: () => window.open(`${API_BASE}/test-name/export/csv`, '_blank')
};
```

#### CRUD Service
**File**: `client/src/js/services/CRUDService.js`

**Required Methods**:
- `initTestNameForm(appContext)` - Initialize empty form
- `editTestName(record, appContext)` - Populate form for editing
- `saveTestName(appContext)` - Create or update record
- `deleteTestName(id, appContext)` - Delete with confirmation
- `viewTestNamePdf(path, appContext)` - Open report viewer
- `closeTestNameModal(appContext)` - Close modal and cleanup

#### Constants
**File**: `client/src/js/utils/constants.js`

**Pattern**:
```javascript
testName: {
  testDate: '',
  dateUnknown: false,
  materialType: 'graphene',
  grapheneSample: '',
  compoundBatchNumber: '',
  micronizationSku: '',
  mcbNumber: '',
  // Test-specific fields
  measurementField1: '',
  testingLab: '',
  testingMethod: '',
  reportFile: null,
  removeReport: false,
  comments: ''
}
```

---

### 5. Application Integration

#### App State
**File**: `client/src/js/app-refactored.js`

**Required State Variables**:
```javascript
testNameRecords: [],
testNameSearch: '',
testNameForm: {},
editingTestName: null,
showAddTestName: false,
showTestNameModal: false,
currentTestNamePdf: null,
```

**Required Methods**:
```javascript
async loadTestNameRecords() { /* Fetch and set records */ }
initTestNameForm() { /* Delegate to CRUDService */ }
editTestName(record) { /* Delegate to CRUDService */ }
async saveTestName() { /* Delegate to CRUDService */ }
async deleteTestName(id) { /* Delegate to CRUDService */ }
viewTestNamePdf(path) { /* Delegate to CRUDService */ }
closeTestNameModal() { /* Delegate to CRUDService */ }
```

**CRITICAL**: Add `loadTestNameRecords()` to init Promise.all:
```javascript
await Promise.all([
  // ... other loaders
  this.loadTestNameRecords(),
  // ...
]);
```

---

### 6. Navigation & UI Integration

#### Navigation Registration
**File**: `client/index.html`

**Desktop Navigation**:
```html
<button @click="activeTab = 'test-test-name'"
        :class="activeTab === 'test-test-name' ? 'bg-gray-100' : ''"
        class="nav-button">
  Test Name
</button>
```

**Mobile Navigation**:
```html
<option value="test-test-name">Test Name</option>
```

**Tab Rendering**:
```html
<div x-html="getTestNameTabHtml()"></div>
```

**Modal Rendering**:
```html
<div x-html="getTestNameModalHtml()"></div>
```

**PDF Viewer Modal** (if file uploads supported):
```html
<div x-show="showTestNameModal" x-cloak
     @click.away="closeTestNameModal()"
     class="fixed inset-0 z-50 overflow-y-auto">
  <!-- Modal with iframe for PDF viewing -->
</div>
```

**Component Imports**:
```javascript
import './components/modals/TestNameModal.js';
import './components/tabs/TestResultsTestNameTab.js';
```

---

### 7. Data Page Integration

#### Test Results Helper
**File**: `client/src/js/components/dropdownSections/testResultsHelper.js`

**Add to switch statement**:
```javascript
case 'testName':
  return createTestNameTestSection(dataPath);
```

**Create section function**:
- Shows test icon and title
- Displays test data in cards
- Shows "View Report" buttons
- Handles empty state

#### Data Page Section
**File**: `client/src/js/components/dataPage/DataPageSection.js`

**Updates Required**:
1. Add to `testTypes` array: `'testNameTests'`
2. Add case in `createTestTypeSection()`: `case 'testNameTests': return createDetailedTestNameSection(label, tests);`
3. Add to `getTestTypeLabel()`: `testNameTests: 'Test Name Tests'`
4. Create `createDetailedTestNameSection()` function

#### Backend Data Routes
**File**: `server/routes/data.js`

**Add to includes**:
```javascript
// In getGrapheneData
testNameTests: {
  orderBy: { testDate: 'desc' }
}

// In getCompoundBatchData
testNameTests: {
  orderBy: { testDate: 'desc' }
}

// In getTestCount
if (experiment.testNameTests) count += experiment.testNameTests.length;
```

**File**: `server/routes/compoundBatch.js`

**Updates for /:id/related endpoint**:
1. Fetch tests: `const testNameTests = await prisma.testNameTest.findMany(...)`
2. Process decimals: Convert Decimal fields to Number
3. Add to response: `testNameTests: processedTestNameTests`
4. Add to single batch include: `testNameTests: true`

---

## File Upload Patterns

### Supported File Types
- **PDF only**: `allowedTypes: ['application/pdf']`, `allowedExtensions: ['.pdf']`, `validateContent: true`
- **PDF + Images**: `allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']`, `allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png']`, `validateContent: false`
- **Excel files**: `allowedTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']`, etc.

### File Upload Helpers
- Frontend: `getFileFieldHtml({ label, fileModelVariable, editingVariable, currentFilePathField, removeFileVariable, acceptTypes })`
- Backend: `uploadFile()`, `replaceFileInStorage()`, `deleteFileFromStorage()`

---

## Material Type Support

### Sample Reference Fields
- `grapheneSample` - Individual graphene experiments
- `compoundBatchNumber` - Compound batches
- `micronizationSku` - Micronizations
- `mcbNumber` - Micronized Compound Batches (MCB)

### Frontend Pattern
```javascript
// Radio buttons for selection
materialType: 'graphene' | 'compound' | 'micronization' | 'mcb'

// Dynamic dropdowns (only show selected type)
x-show="testNameForm.materialType === 'graphene'"

// Clear other fields on type change
@change="testNameForm.compoundBatchNumber = ''; testNameForm.micronizationSku = ''; testNameForm.mcbNumber = ''"

// Backend: Nullify unused fields
if (!data.grapheneSample) data.grapheneSample = null;
```

### Color Coding (Table Badges)
- Graphene: `bg-blue-100 text-blue-800` - "G"
- Compound Batch: `bg-green-100 text-green-800` - "CB"
- Micronization: `bg-purple-100 text-purple-800` - "M"
- MCB: `bg-orange-100 text-orange-800` - "MCB"

---

## Decimal Field Handling

### Database
Use `Decimal` type with precision: `@db.Decimal(10, 4)`

### Backend Conversion
```javascript
// Prisma returns Decimal objects - convert to Number for frontend
const processedRecord = {
  ...record,
  fieldName: record.fieldName ? Number(record.fieldName) : null
};
```

### Frontend Display
```javascript
// Format with fixed decimals
x-text="record.d50 !== null ? record.d50.toFixed(2) : '-'"
```

### Form Input
Use `step` attribute for precision:
```javascript
getNumericFieldHtml({
  label: 'Field Name',
  unit: 'μm',
  modelVariable: 'testNameForm.fieldName',
  inputType: 'number',
  step: '0.0001'  // or '0.01' for 2 decimals
})
```

---

## Common Pitfalls & Solutions

### ❌ Forgot to load records on init
**Problem**: Table empty on page load, populates only after adding record
**Solution**: Add `this.loadTestNameRecords()` to Promise.all in init()

### ❌ File upload only accepts PDFs
**Problem**: Modal accepts images but backend rejects them
**Solution**: Update backend `allowedTypes` and `allowedExtensions`, set `validateContent: false`

### ❌ Decimal fields show as objects
**Problem**: Frontend displays `[object Object]` instead of numbers
**Solution**: Convert Decimal to Number in backend: `Number(record.fieldName)`

### ❌ Comments not visible in table
**Problem**: No way to see comments in table view
**Solution**: Add comment icon column with modal viewer

### ❌ Testing labs missing
**Problem**: Dropdown empty or missing labs
**Solution**: Update `testingLabs` array in app-refactored.js

### ❌ Material selection breaks
**Problem**: Multiple sample fields populated or validation fails
**Solution**: Ensure `@change` handlers clear other fields, backend nullifies unused fields

### ❌ Data page shows no tests
**Problem**: Individual record pages don't show test results
**Solution**: Add test type to data.js includes and compound batch routes

---

## Testing Checklist

After implementing a new test type, verify:

- [ ] Database migration successful
- [ ] Backend route registered in server/index.js
- [ ] Can create record via API
- [ ] Can update record via API
- [ ] Can delete record via API
- [ ] File upload works (if applicable)
- [ ] CSV export works
- [ ] Frontend tab renders
- [ ] Frontend modal renders
- [ ] Can add record via UI
- [ ] Can edit record via UI
- [ ] Can delete record via UI
- [ ] Search works
- [ ] Material type selection works for all types
- [ ] Decimal fields display correctly
- [ ] Records load on page refresh
- [ ] Testing lab dropdown populated
- [ ] Comments column works (if applicable)
- [ ] Report viewing works (if applicable)
- [ ] Individual graphene pages show tests
- [ ] Individual compound batch pages show tests
- [ ] Navigation works (desktop and mobile)
- [ ] Export CSV includes all fields
- [ ] Empty states display correctly

---

## Example Implementation: Particle Size

**Added**: January 2025

**Fields**:
- D10, D50, D90 (Decimal, μm)
- Mean Size, Span Value (Decimal)
- Testing Lab, Testing Method (String)
- Comments (String)
- Report Path (PDF/JPG/PNG)

**Material Support**: Graphene, Compound Batch, Micronization, MCB

**Special Features**:
- Comment column with modal viewer
- Testing method dropdown (Laser Diffraction, DLS, SEM Image Analysis, Other)
- Multi-format file upload support

**Files Modified**: 26 files total
- 1 schema file
- 3 backend route files
- 2 frontend component files
- 5 service files
- 2 data page files
- 1 constants file
- 1 app integration file
- 1 index.html file

---

## Reference: Complete File Checklist

When adding a new test type, these files need updates:

### Database & Migration
- [ ] `prisma/schema.prisma` - Model + reverse relations

### Backend
- [ ] `server/routes/testName.js` - New route file
- [ ] `server/index.js` - Route registration
- [ ] `server/routes/data.js` - Data page includes + getTestCount
- [ ] `server/routes/compoundBatch.js` - Related endpoint + includes

### Frontend Components
- [ ] `client/src/js/components/tabs/TestResultsTestNameTab.js` - New tab
- [ ] `client/src/js/components/modals/TestNameModal.js` - New modal

### Services
- [ ] `client/src/js/services/api.js` - API client methods
- [ ] `client/src/js/services/CRUDService.js` - CRUD operations
- [ ] `client/src/js/utils/constants.js` - Default form

### Data Pages
- [ ] `client/src/js/components/dropdownSections/testResultsHelper.js` - Helper section
- [ ] `client/src/js/components/dataPage/DataPageSection.js` - Detail section

### App Integration
- [ ] `client/src/js/app-refactored.js` - State, methods, init loader
- [ ] `client/index.html` - Navigation, rendering, imports

---

## Automation

A skill is available to automate this process:

**Location**: `.claude/skills/add-test-type.md`

**Usage**: Say "Add a new test type" to invoke the skill, which will guide through requirements gathering and code generation.

---

## Additional Resources

- **Database Schema**: `/docs/core-reference/DATABASE-SCHEMA.md`
- **API Reference**: `/docs/core-reference/API-REFERENCE.md`
- **Architecture Overview**: `/docs/core-reference/ARCHITECTURE.md`
- **Add Test Type Skill**: `/.claude/skills/add-test-type.md`
