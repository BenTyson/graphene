# Test Types Architecture Pattern

Complete reference for adding new test types to the system. Last updated: November 2025 (XRD/XPS implementation with multi-file upload support).

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
- **XRD** - X-Ray Diffraction (Peak positions, assignments, crystallite size) - **Multi-file upload**
- **XPS** - X-ray Photoelectron Spectroscopy (Elemental composition, C-1s decomposition) - **Multi-file upload**

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

### Single-File Upload

#### Supported File Types
- **PDF only**: `allowedTypes: ['application/pdf']`, `allowedExtensions: ['.pdf']`, `validateContent: true`
- **PDF + Images**: `allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']`, `allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png']`, `validateContent: false`
- **Excel files**: `allowedTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']`, etc.

#### File Upload Helpers
- Frontend: `getFileFieldHtml({ label, fileModelVariable, editingVariable, currentFilePathField, removeFileVariable, acceptTypes })`
- Backend: `uploadFile()`, `replaceFileInStorage()`, `deleteFileFromStorage()`

#### Database Schema
```prisma
reportPath  String?  @map("report_path")  // Single file
```

#### Backend Route
```javascript
const upload = createFileUploadMiddleware('test-reports', { /* config */ });
router.post('/', upload.single('reportFile'), asyncHandler(async (req, res) => {
  if (req.file) {
    const result = await uploadFile(req.file, 'test-reports');
    if (result.success) data.reportPath = result.path;
  }
}));
```

---

### Multi-File Upload

**Added**: November 2025 (XRD/XPS implementation)

Multi-file upload allows tests to attach multiple reports, charts, or images per record.

#### Database Schema
```prisma
reportPaths  String[]  @map("report_paths")  // Array for multiple files
```

#### Backend Route
```javascript
// Use upload.array() instead of upload.single()
const upload = createFileUploadMiddleware('test-reports', {
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
  validateContent: false
});

// CREATE: Process multiple files
router.post('/', upload.array('reportFiles', 10), asyncHandler(async (req, res) => {
  const data = prepareDataForDB(req.body, {
    numericFields: ['field1', 'field2'],
    dateFields: ['testDate'],
    fieldsToRemove: ['reportFiles', 'removeFileIndices', 'materialType', 'dateUnknown']
  });

  // Upload all files in parallel
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file => uploadFile(file, 'test-reports'));
    const results = await Promise.all(uploadPromises);
    data.reportPaths = results.filter(r => r.success).map(r => r.path);
  }

  const record = await prisma.testType.create({ data });
  res.status(201).json(record);
}));

// UPDATE: Handle individual file deletion and new file addition
router.put('/:id', upload.array('reportFiles', 10), asyncHandler(async (req, res) => {
  const existingRecord = await prisma.testType.findUnique({ where: { id } });

  // Handle file deletions by index
  if (req.body.removeFileIndices) {
    const indicesToRemove = JSON.parse(req.body.removeFileIndices);
    const newPaths = existingRecord.reportPaths.filter((_, index) =>
      !indicesToRemove.includes(index)
    );

    // Delete removed files from storage
    for (const index of indicesToRemove) {
      await deleteFileFromStorage(existingRecord.reportPaths[index]);
    }

    data.reportPaths = newPaths;
  }

  // Add new files to existing array
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file => uploadFile(file, 'test-reports'));
    const results = await Promise.all(uploadPromises);
    const newPaths = results.filter(r => r.success).map(r => r.path);
    data.reportPaths = [...(data.reportPaths || existingRecord.reportPaths || []), ...newPaths];
  }

  const updated = await prisma.testType.update({ where: { id }, data });
  res.json(updated);
}));
```

#### Frontend Helper
**File**: `client/src/js/components/forms/fileFieldHelpers.js`

```javascript
export function createMultiFileUploadField(config) {
  const {
    label,
    fileModelVariable,           // e.g., 'xrdForm.reportFiles'
    editingVariable,              // e.g., 'editingXRD'
    currentFilePathsField,        // e.g., 'reportPaths' (array field name)
    removeFileIndicesVariable,    // e.g., 'xrdForm.removeFileIndices'
    acceptTypes = 'application/pdf',
    maxFiles = 10,
    required = false
  } = config;

  return `
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">${label}</label>

      <!-- File input for multiple files -->
      <input type="file"
             accept="${acceptTypes}"
             multiple
             @change="${fileModelVariable} = Array.from($event.target.files).slice(0, ${maxFiles})"
             class="w-full px-3 py-2 border border-gray-300 rounded-md">

      <!-- Display newly selected files -->
      <template x-if="${fileModelVariable} && ${fileModelVariable}.length > 0">
        <div class="mt-2 space-y-1">
          <template x-for="(file, index) in ${fileModelVariable}" :key="index">
            <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span class="text-sm" x-text="file.name"></span>
              <button type="button" @click="${fileModelVariable}.splice(index, 1)"
                      class="text-red-600 hover:text-red-800">Remove</button>
            </div>
          </template>
        </div>
      </template>

      <!-- Display existing files when editing -->
      <template x-if="${editingVariable} && ${editingVariable}.${currentFilePathsField} && ${editingVariable}.${currentFilePathsField}.length > 0">
        <div class="mt-2 space-y-1">
          <div class="text-sm font-medium text-gray-700">Current Files:</div>
          <template x-for="(filePath, index) in ${editingVariable}.${currentFilePathsField}" :key="index">
            <div class="flex items-center justify-between p-2 bg-blue-50 rounded"
                 x-show="!${removeFileIndicesVariable}.includes(index)">
              <span class="text-sm" x-text="filePath.split('/').pop()"></span>
              <div class="flex space-x-2">
                <button type="button" @click="window.open(filePath.startsWith('https://') ? filePath : '/uploads/' + filePath, '_blank')"
                        class="text-blue-600 hover:text-blue-800">View</button>
                <button type="button" @click="${removeFileIndicesVariable}.push(index)"
                        class="text-red-600 hover:text-red-800">Remove</button>
              </div>
            </div>
          </template>
        </div>
      </template>
    </div>
  `;
}
```

#### Frontend Modal Usage
```javascript
// In modal component
<div x-html="getMultiFileFieldHtml({
  label: 'Reports (PDF, JPG, PNG)',
  fileModelVariable: 'testNameForm.reportFiles',
  editingVariable: 'editingTestName',
  currentFilePathsField: 'reportPaths',
  removeFileIndicesVariable: 'testNameForm.removeFileIndices',
  acceptTypes: 'application/pdf,image/jpeg,image/png',
  maxFiles: 10
})"></div>
```

#### Frontend API Service
```javascript
export const testNameAPI = {
  create: async (data, files = []) => {
    const formData = new FormData();

    // Add all data fields except file-related ones
    Object.keys(data).forEach(key => {
      if (key !== 'reportFiles' && key !== 'removeFileIndices') {
        formData.append(key, data[key]);
      }
    });

    // Append MULTIPLE files with same field name
    if (files && files.length > 0) {
      files.forEach(file => formData.append('reportFiles', file));
    }

    return fetch(`${API_BASE}/test-name`, {
      method: 'POST',
      body: formData
    }).then(handleResponse);
  },

  update: async (id, data, files = []) => {
    const formData = new FormData();

    // Include removeFileIndices for backend processing
    if (data.removeFileIndices && data.removeFileIndices.length > 0) {
      formData.append('removeFileIndices', JSON.stringify(data.removeFileIndices));
    }

    // Same pattern as create
    Object.keys(data).forEach(key => {
      if (key !== 'reportFiles' && key !== 'removeFileIndices') {
        formData.append(key, data[key]);
      }
    });

    if (files && files.length > 0) {
      files.forEach(file => formData.append('reportFiles', file));
    }

    return fetch(`${API_BASE}/test-name/${id}`, {
      method: 'PUT',
      body: formData
    }).then(handleResponse);
  }
};
```

#### Frontend Constants
```javascript
testName: {
  // ... other fields
  reportFiles: [],        // Array for new files
  removeFileIndices: [],  // Array of indices to remove from existing files
  // ... other fields
}
```

#### Frontend Table Display
```javascript
// Show file count with viewer button
<td class="table-cell-compact">
  <template x-if="record.reportPaths && record.reportPaths.length > 0">
    <div class="flex items-center space-x-2">
      <span class="text-xs text-gray-600" x-text="record.reportPaths.length + ' file(s)'"></span>
      <button @click="showReports = true; currentReports = record.reportPaths; currentSample = record.grapheneSample || record.compoundBatchNumber || record.micronizationSku || record.mcbNumber"
              class="text-link text-link-hover text-xs">
        View
      </button>
    </div>
  </template>
  <template x-if="!record.reportPaths || record.reportPaths.length === 0">
    <span class="text-gray-400 text-xs">-</span>
  </template>
</td>

// Multi-file viewer modal
<div x-show="showReports" x-cloak @click.away="showReports = false"
     class="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 flex items-center justify-center">
  <div class="bg-white rounded-lg p-6 max-w-md w-full" @click.stop>
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">
        Reports - <span x-text="currentSample"></span>
      </h3>
      <button @click="showReports = false" class="text-gray-500 hover:text-gray-700">✕</button>
    </div>
    <div class="space-y-2">
      <template x-for="(filePath, index) in currentReports" :key="index">
        <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span class="text-sm" x-text="'File ' + (index + 1) + ': ' + filePath.split('/').pop()"></span>
          <button @click="window.open(filePath.startsWith('https://') ? filePath : '/uploads/' + filePath, '_blank')"
                  class="text-blue-600 hover:text-blue-800 text-sm">
            View
          </button>
        </div>
      </template>
    </div>
  </div>
</div>
```

#### App State Variables
```javascript
// In app-refactored.js
showReports: false,
currentReports: [],
currentSample: '',

// Helper method
getMultiFileFieldHtml(config) {
  return fileFieldHelpers.createMultiFileUploadField(config);
},
```

#### Key Differences from Single-File
| Aspect | Single-File | Multi-File |
|--------|-------------|------------|
| **Schema Field** | `String?` | `String[]` |
| **Middleware** | `upload.single('fieldName')` | `upload.array('fieldName', maxCount)` |
| **Upload Logic** | Single `uploadFile()` call | `Promise.all()` with multiple uploads |
| **Form State** | `reportFile: null` | `reportFiles: [], removeFileIndices: []` |
| **Update Logic** | Replace entire file | Filter by indices + append new |
| **FormData** | Single `formData.append('file', file)` | Multiple `files.forEach(f => formData.append('files', f))` |
| **Table Display** | Direct "View" link | File count + modal viewer |
| **Helper Function** | `getFileFieldHtml()` | `createMultiFileUploadField()` |

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

## Example Implementation: XRD/XPS

**Added**: November 2025

**First multi-file upload implementation** in the system. Established patterns for handling multiple file attachments per test record.

### XRD Test Type

**Fields**:
- Peak 1 Position (2θ angle, Decimal)
- Peak 1 Assignment (String)
- Peak 2 Position (2θ angle, Decimal)
- Peak 2 Assignment (String)
- Crystallite Size (nm, Decimal, calculated from Scherrer equation)
- Testing Lab (String)
- XRD Reports (PDF/JPG/PNG, **multi-file**, up to 10)
- Comments (String)

**Material Support**: Graphene, Compound Batch, Micronization, MCB

**Special Features**:
- **Multi-file upload support** (first implementation)
- File count display with viewer modal
- Individual file viewing from array
- File deletion by index during editing

### XPS Test Type

**Fields**:
- **Elemental Composition** (7 elements, each with percentage and error):
  - C-1s, Cl-2p, Mo-3d, N-1s, O-1s, S-2p, Si-2p
  - Each: `element_percent` and `element_percent_error` (Decimal, @db.Decimal(10, 4))
- **C-1s Decomposition** (6 components, each with percentage and error):
  - C-C, C-O, C=O, CO₃, O-C=O, sp²
  - Each: `c1s_component_percent` and `c1s_component_error` (Decimal)
- Testing Lab (String)
- XPS Reports (PDF/JPG/PNG/Excel, **multi-file**, up to 10)
- Comments (String)

**Total Fields**: 26 numeric fields (13 measurements + 13 errors) + metadata

**Material Support**: Graphene, Compound Batch, Micronization, MCB

**Special Features**:
- **Multi-file upload support** for charts, reports, and Excel files
- Organized modal sections (Elemental Composition, C-1s Decomposition)
- Comprehensive decimal field handling (26 fields)
- Excel file upload support (.xlsx)
- Detailed data display in data page sections

### Implementation Highlights

**Multi-File Upload Pattern Established**:
- Created `createMultiFileUploadField()` helper in `fileFieldHelpers.js`
- Backend: `upload.array('fieldName', 10)` instead of `upload.single()`
- Database: `String[]` schema type for file paths
- Individual file deletion by index using `removeFileIndices` array
- Multi-file viewer modal with individual file access

**Backend Processing**:
- Parallel file uploads using `Promise.all()`
- File array management on update (remove by index + append new)
- Decimal to Number conversion for frontend (26 fields for XPS)

**Frontend Features**:
- File count badge in table with "View" button
- Modal viewer listing all files with individual view buttons
- Selected file display with individual remove during creation
- Existing file display with individual remove during editing

**Files Modified**: 20 files total
- 1 schema file (2 new models with reverse relations)
- 2 backend route files (xrd.js, xps.js)
- 3 backend integration files (server/index.js, data.js, compoundBatch.js)
- 2 frontend component files (XRDModal.js, XPSModal.js)
- 2 frontend tab files (TestResultsXRDTab.js, TestResultsXPSTab.js)
- 1 file upload helper (fileFieldHelpers.js)
- 4 service files (api.js, CRUDService.js, constants.js, app-refactored.js)
- 2 data page files (testResultsHelper.js, DataPageSection.js)
- 1 index.html file (navigation + rendering)

**Key Learnings**:
- Multi-file upload requires coordinated changes across 7 layers (schema, routes, helpers, modals, tabs, services, integration)
- File arrays need special handling for individual deletion (can't just replace entire array)
- Frontend needs separate state for new files (`reportFiles[]`) and removal tracking (`removeFileIndices[]`)
- Backend needs to process `removeFileIndices` as JSON string from FormData
- Table display pattern: Show count + modal viewer (instead of direct link)

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
