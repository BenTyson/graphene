# Add Test Type Skill

This skill guides you through adding a new test type to the Graphene Production Control system, following the established architecture patterns.

## Overview

You will create a complete test type implementation including:
- Database schema and migrations
- Backend API routes with CRUD operations
- Frontend tab and modal components
- Service layer integration
- Data page integration
- Navigation and initialization

## Step 1: Gather Requirements

Ask the user for the following information:

1. **Test Name** (e.g., "Particle Size", "XRD", "SEM")
   - PascalCase: `ParticleSize`
   - camelCase: `particleSize`
   - kebab-case: `particle-size`
   - Database table: `particle_size_test`

2. **Test Fields** - For each field, collect:
   - Field name
   - Data type (String, Int, Float/Decimal, DateTime, Boolean)
   - Required or optional
   - Special properties (precision for decimals, max length for strings)
   - Display label and unit (if applicable)

3. **Sample Types** - Which materials can this test be run on?
   - Individual Graphene (grapheneSample)
   - Compound Batch (compoundBatchNumber)
   - Micronization (micronizationSku)
   - MCB (mcbNumber)
   - Biochar (biocharExperiment)

4. **File Upload** - Does this test need file upload?
   - If yes: accepted file types (PDF, images, Excel, etc.)
   - Field name for the file path

5. **Additional Features**:
   - Testing lab dropdown? (yes/no)
   - Testing method dropdown? (yes/no and provide options)
   - Research team field? (yes/no)
   - Custom dropdowns or fields?

## Step 2: Create Database Schema

Update `prisma/schema.prisma`:

```prisma
model TestNameTest {
  id                    String        @id @default(cuid())
  testDate              DateTime?     @map("test_date")

  // Sample references (pick relevant ones)
  grapheneSample        String?       @map("graphene_sample")
  compoundBatchNumber   String?       @map("compound_batch_number")
  micronizationSku      String?       @map("micronization_sku")
  mcbNumber             String?       @map("mcb_number")

  // Test-specific fields
  fieldName1            Decimal?      @db.Decimal(10, 4)  // for numeric measurements
  fieldName2            String?
  fieldName3            Int?

  // Optional standard fields
  testingLab            String?       @map("testing_lab")
  testingMethod         String?       @map("testing_method")
  researchTeam          String?       @map("research_team")

  // File upload field
  reportPath            String?       @map("report_path")

  comments              String?
  createdAt             DateTime      @default(now()) @map("created_at")
  updatedAt             DateTime      @updatedAt @map("updated_at")

  // Relations
  grapheneRef           Graphene?             @relation(fields: [grapheneSample], references: [experimentNumber])
  compoundBatchRef      CompoundBatch?        @relation(fields: [compoundBatchNumber], references: [batchNumber])
  micronizationRef      Micronization?        @relation(fields: [micronizationSku], references: [sku])
  mcbRef                MicronizedCompoundBatch? @relation(fields: [mcbNumber], references: [mcbNumber])

  @@index([grapheneSample])
  @@index([compoundBatchNumber])
  @@index([micronizationSku])
  @@index([mcbNumber])
  @@index([testDate])
  @@map("test_name_test")
}
```

Also add the reverse relations to Graphene, CompoundBatch, Micronization, and MCB models:

```prisma
model Graphene {
  // ... existing fields
  testNameTests         TestNameTest[]
}

model CompoundBatch {
  // ... existing fields
  testNameTests         TestNameTest[]
}

model Micronization {
  // ... existing fields
  testNameTests         TestNameTest[]
}

model MicronizedCompoundBatch {
  // ... existing fields
  testNameTests         TestNameTest[]
}
```

**Run migration**: `npx prisma db push` (or create a proper migration)

## Step 3: Create Backend API Route

Create `server/routes/testName.js`:

```javascript
import express from 'express';
import asyncHandler from 'express-async-handler';
import path from 'path';
import { createFileUploadMiddleware, uploadFile, replaceFileInStorage, deleteFileFromStorage } from '../utils/fileUpload.js';
import { buildSearchQuery, buildOrderBy } from '../utils/queryHelpers.js';
import { prepareDataForDB } from '../utils/dataConversion.js';
import AIInsightsService from '../services/AIInsightsService.js';

const router = express.Router();

// Configure file upload middleware if needed
const upload = createFileUploadMiddleware('test-name-reports', {
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
  validateContent: false
});

// GET all records
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { sortBy = 'chronological', order = 'desc', search } = req.query;

  const searchFields = ['grapheneSample', 'compoundBatchNumber', 'micronizationSku', 'mcbNumber', 'testingLab', 'testingMethod', 'comments'];
  const where = buildSearchQuery(searchFields, search);

  const sortMappings = { chronological: 'testDate' };
  let orderBy = buildOrderBy(sortBy, order, sortMappings);

  if (sortBy === 'chronological') {
    orderBy = [{ testDate: order }, { createdAt: order }];
  }

  const records = await prisma.testNameTest.findMany({
    where,
    orderBy,
    include: {
      grapheneRef: { select: { experimentNumber: true } },
      compoundBatchRef: { select: { batchNumber: true, batchName: true } },
      micronizationRef: { select: { micronizationNumber: true, sku: true } },
      mcbRef: { select: { mcbNumber: true } }
    }
  });

  // Convert Decimal fields to numbers for frontend
  const processedRecords = records.map(record => ({
    ...record,
    // Add decimal conversions for your numeric fields
    fieldName1: record.fieldName1 ? Number(record.fieldName1) : null,
  }));

  res.json(processedRecords);
}));

// GET single record
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  const record = await prisma.testNameTest.findUnique({
    where: { id },
    include: {
      grapheneRef: true,
      compoundBatchRef: true,
      micronizationRef: true,
      mcbRef: true
    }
  });

  if (!record) {
    res.status(404);
    throw new Error('Record not found');
  }

  const processedRecord = {
    ...record,
    fieldName1: record.fieldName1 ? Number(record.fieldName1) : null,
  };

  res.json(processedRecord);
}));

// POST create new record
router.post('/', upload.single('report'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  const data = prepareDataForDB(req.body, {
    numericFields: ['fieldName1'], // list all numeric/decimal fields
    dateFields: ['testDate'],
    fieldsToRemove: ['reportFile', 'removeReport', 'replaceReport', 'grapheneRef', 'compoundBatchRef', 'micronizationRef', 'mcbRef', 'materialType', 'dateUnknown']
  });

  // Handle file upload
  if (req.file) {
    const uploadResult = await uploadFile(req.file, 'test-name-reports');
    if (uploadResult.success) {
      data.reportPath = uploadResult.path;
    }
  }

  // Handle material selection
  if (!data.grapheneSample) data.grapheneSample = null;
  if (!data.compoundBatchNumber) data.compoundBatchNumber = null;
  if (!data.micronizationSku) data.micronizationSku = null;
  if (!data.mcbNumber) data.mcbNumber = null;

  // Remove system fields
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;

  const record = await prisma.testNameTest.create({ data });

  AIInsightsService.onNewData('testName');

  const processedRecord = {
    ...record,
    fieldName1: record.fieldName1 ? Number(record.fieldName1) : null,
  };

  res.status(201).json(processedRecord);
}));

// PUT update record
router.put('/:id', upload.single('report'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  const existingRecord = await prisma.testNameTest.findUnique({ where: { id } });
  if (!existingRecord) {
    res.status(404);
    throw new Error('Record not found');
  }

  const data = prepareDataForDB(req.body, {
    numericFields: ['fieldName1'],
    dateFields: ['testDate'],
    fieldsToRemove: ['reportFile', 'removeReport', 'replaceReport', 'grapheneRef', 'compoundBatchRef', 'micronizationRef', 'mcbRef', 'materialType', 'dateUnknown']
  });

  // Handle file operations
  if (req.body.removeReport === 'true') {
    data.reportPath = null;
    if (existingRecord.reportPath) {
      await deleteFileFromStorage(existingRecord.reportPath);
    }
  } else if (req.file) {
    const replaceResult = await replaceFileInStorage(existingRecord.reportPath, req.file, 'test-name-reports');
    if (replaceResult.success) {
      data.reportPath = replaceResult.path;
    }
  }

  // Handle material selection
  if (!data.grapheneSample) data.grapheneSample = null;
  if (!data.compoundBatchNumber) data.compoundBatchNumber = null;
  if (!data.micronizationSku) data.micronizationSku = null;
  if (!data.mcbNumber) data.mcbNumber = null;

  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;

  const record = await prisma.testNameTest.update({ where: { id }, data });

  AIInsightsService.onNewData('testName');

  const processedRecord = {
    ...record,
    fieldName1: record.fieldName1 ? Number(record.fieldName1) : null,
  };

  res.json(processedRecord);
}));

// DELETE record
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  const existingRecord = await prisma.testNameTest.findUnique({ where: { id } });
  if (existingRecord?.reportPath) {
    await deleteFileFromStorage(existingRecord.reportPath);
  }

  await prisma.testNameTest.delete({ where: { id } });
  res.status(204).send();
}));

// Export to CSV
router.get('/export/csv', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  const records = await prisma.testNameTest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      grapheneRef: true,
      compoundBatchRef: true,
      micronizationRef: true,
      mcbRef: true
    }
  });

  const headers = ['Test Date', 'Sample Type', 'Sample ID', 'Field 1', 'Field 2', 'Testing Lab', 'Comments', 'Created At'];
  let csv = headers.join(',') + '\n';

  records.forEach(r => {
    let sampleType = '';
    let sampleId = '';
    if (r.grapheneSample) { sampleType = 'Graphene'; sampleId = r.grapheneSample; }
    else if (r.compoundBatchNumber) { sampleType = 'Compound Batch'; sampleId = r.compoundBatchNumber; }
    else if (r.micronizationSku) { sampleType = 'Micronization'; sampleId = r.micronizationSku; }
    else if (r.mcbNumber) { sampleType = 'MCB'; sampleId = r.mcbNumber; }

    const row = [
      r.testDate ? r.testDate.toISOString().split('T')[0] : '',
      sampleType,
      sampleId,
      r.fieldName1 || '',
      r.fieldName2 || '',
      r.testingLab || '',
      `"${(r.comments || '').replace(/"/g, '""')}"`,
      r.createdAt.toISOString()
    ];
    csv += row.join(',') + '\n';
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="test_name_export.csv"');
  res.send(csv);
}));

export default router;
```

**Register route** in `server/index.js`:

```javascript
import testNameRoutes from './routes/testName.js';
app.use('/api/test-name', testNameRoutes);
```

## Step 4: Create Frontend Tab Component

Create `client/src/js/components/tabs/TestResultsTestNameTab.js`:

```javascript
function getTestNameTabHtml() {
  return `
    <div x-show="activeTab === 'test-test-name'" x-cloak>
      <div class="mb-6 flex justify-between items-center">
        <h2 class="text-xl font-semibold">Test Name Results</h2>
        <div class="flex space-x-2">
          <button @click="exportData('test-test-name')" class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 touch-target">
            Export CSV
          </button>
          <button @click="initTestNameForm()" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 touch-target">
            Add Record
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <input
          type="text"
          x-model="testNameSearch"
          @input="loadTestNameRecords()"
          placeholder="Search samples, labs..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        >
      </div>

      <!-- Table -->
      <div class="overflow-x-auto border border-gray-200 rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-100">
            <tr>
              <th class="table-cell-standard">Test Date</th>
              <th class="table-cell-standard">Sample</th>
              <th class="table-cell-standard">Field 1</th>
              <th class="table-cell-standard">Field 2</th>
              <th class="table-cell-standard">Testing Lab</th>
              <th class="table-cell-standard">Report</th>
              <th class="table-cell-standard">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template x-if="testNameRecords.length === 0">
              <tr>
                <td colspan="7" class="table-cell-compact text-center text-gray-500 py-8">
                  No records found
                </td>
              </tr>
            </template>
            <template x-for="record in testNameRecords" :key="record.id">
              <tr class="hover:bg-gray-50">
                <td class="table-cell-compact" x-text="record.testDate ? window.formatDateSafe(record.testDate) : ''"></td>
                <td class="table-cell-compact">
                  <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          :class="{
                            'bg-blue-100 text-blue-800': record.grapheneSample,
                            'bg-green-100 text-green-800': record.compoundBatchNumber,
                            'bg-purple-100 text-purple-800': record.micronizationSku,
                            'bg-orange-100 text-orange-800': record.mcbNumber
                          }"
                          x-text="record.grapheneSample ? 'G' : record.compoundBatchNumber ? 'CB' : record.micronizationSku ? 'M' : 'MCB'"></span>
                    <span x-text="record.grapheneSample || record.compoundBatchNumber || record.micronizationSku || record.mcbNumber" class="text-link font-medium"></span>
                  </div>
                </td>
                <td class="table-cell-compact" x-text="record.fieldName1 || '-'"></td>
                <td class="table-cell-compact" x-text="record.fieldName2 || '-'"></td>
                <td class="table-cell-compact" x-text="record.testingLab || '-'"></td>
                <td class="table-cell-compact">
                  <template x-if="record.reportPath">
                    <button @click="viewTestNamePdf(record.reportPath)" class="text-link text-link-hover">
                      View Report
                    </button>
                  </template>
                  <template x-if="!record.reportPath">
                    <span class="text-gray-400">No report</span>
                  </template>
                </td>
                <td class="table-cell-actions-compact">
                  <div class="flex justify-end space-x-2">
                    <button @click="editTestName(record)" class="text-link hover:text-link-hover" title="Edit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button @click="deleteTestName(record.id)" class="text-red-400 hover:text-red-600" title="Delete">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.getTestNameTabHtml = getTestNameTabHtml;
```

## Step 5: Create Frontend Modal Component

Create `client/src/js/components/modals/TestNameModal.js`:

```javascript
function getTestNameModalHtml() {
  return `
    <div x-show="showAddTestName" x-cloak
         @click.away="showAddTestName = false; editingTestName = null"
         class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white rounded-none md:rounded-lg w-full md:max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <h3 class="text-lg font-semibold mb-4" x-text="editingTestName ? 'Edit Test Name' : 'Add Test Name'"></h3>

          <form @submit.prevent="saveTestName()" class="space-y-4">
            <!-- Test Date -->
            <div class="grid grid-cols-1 gap-4">
              <div x-html="getDateFieldHtml({
                label: 'Test Date',
                dateModelVariable: 'testNameForm.testDate',
                unknownModelVariable: 'testNameForm.dateUnknown'
              })"></div>
            </div>

            <!-- Sample Source Selection -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Sample Source</label>
              <div class="grid grid-cols-2 gap-2">
                <label class="flex items-center">
                  <input type="radio" x-model="testNameForm.materialType" value="graphene" class="mr-2">
                  <span>Individual Graphene</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" x-model="testNameForm.materialType" value="compound" class="mr-2">
                  <span>Compound Batch</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" x-model="testNameForm.materialType" value="micronization" class="mr-2">
                  <span>Micronization</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" x-model="testNameForm.materialType" value="mcb" class="mr-2">
                  <span>MCB</span>
                </label>
              </div>
            </div>

            <!-- Dynamic Sample Selectors -->
            <div class="grid grid-cols-1 gap-4">
              <div x-show="testNameForm.materialType === 'graphene'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Graphene Sample</label>
                <select x-model="testNameForm.grapheneSample"
                        @change="testNameForm.compoundBatchNumber = ''; testNameForm.micronizationSku = ''; testNameForm.mcbNumber = ''"
                        :required="testNameForm.materialType === 'graphene'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select graphene sample...</option>
                  <template x-for="exp in availableGrapheneSamples" :key="exp">
                    <option :value="exp" x-text="exp"></option>
                  </template>
                </select>
              </div>

              <div x-show="testNameForm.materialType === 'compound'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Compound Batch</label>
                <select x-model="testNameForm.compoundBatchNumber"
                        @change="testNameForm.grapheneSample = ''; testNameForm.micronizationSku = ''; testNameForm.mcbNumber = ''"
                        :required="testNameForm.materialType === 'compound'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select compound batch...</option>
                  <template x-for="batch in compoundBatches" :key="batch.id">
                    <option :value="batch.batchNumber" x-text="\`\${batch.batchNumber} - \${batch.batchName || 'Unnamed'}\`"></option>
                  </template>
                </select>
              </div>

              <div x-show="testNameForm.materialType === 'micronization'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Micronization</label>
                <select x-model="testNameForm.micronizationSku"
                        @change="testNameForm.grapheneSample = ''; testNameForm.compoundBatchNumber = ''; testNameForm.mcbNumber = ''"
                        :required="testNameForm.materialType === 'micronization'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select micronization...</option>
                  <template x-for="micro in micronizations" :key="micro.id">
                    <option :value="micro.sku" x-text="\`\${micro.micronizationNumber} - \${micro.sku}\`"></option>
                  </template>
                </select>
              </div>

              <div x-show="testNameForm.materialType === 'mcb'">
                <label class="block text-sm font-medium text-gray-700 mb-1">MCB</label>
                <select x-model="testNameForm.mcbNumber"
                        @change="testNameForm.grapheneSample = ''; testNameForm.compoundBatchNumber = ''; testNameForm.micronizationSku = ''"
                        :required="testNameForm.materialType === 'mcb'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <option value="">Select MCB...</option>
                  <template x-for="mcb in mcbs" :key="mcb.id">
                    <option :value="mcb.mcbNumber" x-text="mcb.mcbNumber"></option>
                  </template>
                </select>
              </div>
            </div>

            <!-- Test-specific fields -->
            <div x-html="getNumericFieldHtml({
              label: 'Field 1',
              unit: 'unit',
              modelVariable: 'testNameForm.fieldName1',
              inputType: 'number',
              step: '0.01'
            })"></div>

            <!-- Testing Lab -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Testing Lab</label>
              <select x-model="testNameForm.testingLab"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                <option value="">Select lab...</option>
                <template x-for="lab in testingLabs" :key="lab">
                  <option :value="lab" x-text="lab"></option>
                </template>
              </select>
            </div>

            <!-- File Upload -->
            <div x-html="getFileFieldHtml({
              label: 'Test Report (PDF, JPG, PNG)',
              fileModelVariable: 'testNameForm.reportFile',
              editingVariable: 'editingTestName',
              currentFilePathField: 'reportPath',
              removeFileVariable: 'testNameForm.removeReport',
              acceptTypes: 'application/pdf,image/jpeg,image/png'
            })"></div>

            <!-- Comments -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Comments</label>
              <textarea x-model="testNameForm.comments" rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"></textarea>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-3">
              <button type="button" @click="showAddTestName = false; editingTestName = null; testNameForm = {}"
                      class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800">
                <span x-text="editingTestName ? 'Update' : 'Create'"></span> Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

window.getTestNameModalHtml = getTestNameModalHtml;
```

## Step 6: Update API Service

Add to `client/src/js/services/api.js`:

```javascript
export const testNameAPI = {
  getAll: (search = '') => fetch(`${API_BASE}/test-name${search ? `?search=${encodeURIComponent(search)}` : ''}`).then(handleResponse),
  getById: (id) => fetch(`${API_BASE}/test-name/${id}`).then(handleResponse),
  create: async (data, file) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    if (file) formData.append('report', file);
    return fetch(`${API_BASE}/test-name`, {
      method: 'POST',
      body: formData
    }).then(handleResponse);
  },
  update: async (id, data, file) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    if (file) formData.append('report', file);
    return fetch(`${API_BASE}/test-name/${id}`, {
      method: 'PUT',
      body: formData
    }).then(handleResponse);
  },
  delete: (id) => fetch(`${API_BASE}/test-name/${id}`, { method: 'DELETE' }).then(handleResponse),
  exportCSV: () => window.open(`${API_BASE}/test-name/export/csv`, '_blank')
};
```

Export it in the API object.

## Step 7: Update CRUD Service

Add to `client/src/js/services/CRUDService.js`:

```javascript
// Initialize form
initTestNameForm(appContext) {
  appContext.testNameForm = { ...DEFAULT_FORMS.testName };
  appContext.showAddTestName = true;
  appContext.editingTestName = null;
},

// Edit record
editTestName(record, appContext) {
  appContext.editingTestName = record;
  appContext.testNameForm = {
    testDate: record.testDate ? record.testDate.split('T')[0] : '',
    dateUnknown: !record.testDate,
    materialType: record.grapheneSample ? 'graphene' :
                  record.compoundBatchNumber ? 'compound' :
                  record.micronizationSku ? 'micronization' : 'mcb',
    grapheneSample: record.grapheneSample || '',
    compoundBatchNumber: record.compoundBatchNumber || '',
    micronizationSku: record.micronizationSku || '',
    mcbNumber: record.mcbNumber || '',
    fieldName1: record.fieldName1 || '',
    testingLab: record.testingLab || '',
    reportPath: record.reportPath || '',
    reportFile: null,
    removeReport: false,
    comments: record.comments || ''
  };
  appContext.showAddTestName = true;
},

// Save record
async saveTestName(appContext) {
  try {
    const form = appContext.testNameForm;
    const data = {
      testDate: form.dateUnknown ? null : form.testDate,
      grapheneSample: form.materialType === 'graphene' ? form.grapheneSample : null,
      compoundBatchNumber: form.materialType === 'compound' ? form.compoundBatchNumber : null,
      micronizationSku: form.materialType === 'micronization' ? form.micronizationSku : null,
      mcbNumber: form.materialType === 'mcb' ? form.mcbNumber : null,
      fieldName1: form.fieldName1,
      testingLab: form.testingLab,
      removeReport: form.removeReport,
      comments: form.comments
    };

    if (appContext.editingTestName) {
      await API.testName.update(appContext.editingTestName.id, data, form.reportFile);
    } else {
      await API.testName.create(data, form.reportFile);
    }

    appContext.showAddTestName = false;
    appContext.editingTestName = null;
    await appContext.loadTestNameRecords();
  } catch (error) {
    console.error('Failed to save record:', error);
    alert(`Failed to save record: ${error.message}`);
  }
},

// Delete record
async deleteTestName(id, appContext) {
  if (!confirm('Are you sure you want to delete this record?')) return;
  try {
    await API.testName.delete(id);
    await appContext.loadTestNameRecords();
  } catch (error) {
    console.error('Failed to delete record:', error);
    alert('Failed to delete record');
  }
},

// View PDF
viewTestNamePdf(path, appContext) {
  if (path.startsWith('https://')) {
    window.open(path, '_blank');
  } else {
    appContext.currentTestNamePdf = `/uploads/${path}`;
    appContext.showTestNameModal = true;
  }
},

// Close modal
closeTestNameModal(appContext) {
  appContext.showTestNameModal = false;
  appContext.currentTestNamePdf = null;
}
```

## Step 8: Update Constants

Add to `client/src/js/utils/constants.js`:

```javascript
testName: {
  testDate: '',
  dateUnknown: false,
  materialType: 'graphene',
  grapheneSample: '',
  compoundBatchNumber: '',
  micronizationSku: '',
  mcbNumber: '',
  fieldName1: '',
  testingLab: '',
  reportFile: null,
  removeReport: false,
  comments: ''
}
```

## Step 9: Update App State and Methods

In `client/src/js/app-refactored.js`:

**Add state variables:**
```javascript
testNameRecords: [],
testNameSearch: '',
testNameForm: {},
editingTestName: null,
showAddTestName: false,
showTestNameModal: false,
currentTestNamePdf: null,
```

**Add load method:**
```javascript
async loadTestNameRecords() {
  try {
    this.testNameRecords = await API.testName.getAll(this.testNameSearch);
  } catch (error) {
    console.error('Failed to load records:', error);
    this.testNameRecords = [];
  }
},
```

**Add to init Promise.all:**
```javascript
this.loadTestNameRecords(),
```

**Add CRUD methods:**
```javascript
initTestNameForm() {
  CRUDService.initTestNameForm(this);
},

editTestName(record) {
  CRUDService.editTestName(record, this);
},

async saveTestName() {
  await CRUDService.saveTestName(this);
},

async deleteTestName(id) {
  await CRUDService.deleteTestName(id, this);
},

viewTestNamePdf(path) {
  CRUDService.viewTestNamePdf(path, this);
},

closeTestNameModal() {
  CRUDService.closeTestNameModal(this);
}
```

## Step 10: Update Navigation

In `client/index.html`:

**Add tab navigation (desktop and mobile):**
```html
<!-- Desktop -->
<button @click="activeTab = 'test-test-name'"
        :class="activeTab === 'test-test-name' ? 'bg-gray-100' : ''"
        class="nav-button">
  Test Name
</button>

<!-- Mobile -->
<option value="test-test-name">Test Name</option>
```

**Add tab render:**
```html
<div x-html="getTestNameTabHtml()"></div>
```

**Add modal render:**
```html
<div x-html="getTestNameModalHtml()"></div>
```

**Add PDF viewer modal:**
```html
<div x-show="showTestNameModal" x-cloak @click.away="closeTestNameModal()"
     class="fixed inset-0 z-50 overflow-y-auto">
  <div class="flex items-center justify-center min-h-screen px-4">
    <div class="fixed inset-0 bg-black opacity-75"></div>
    <div class="relative bg-white rounded-lg w-full max-w-6xl h-[90vh] p-4">
      <button @click="closeTestNameModal()" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      <iframe :src="currentTestNamePdf" class="w-full h-full"></iframe>
    </div>
  </div>
</div>
```

**Add component imports:**
```javascript
import './components/modals/TestNameModal.js';
import './components/tabs/TestResultsTestNameTab.js';
```

## Step 11: Update Data Pages

In `client/src/js/components/dropdownSections/testResultsHelper.js`:

**Add case:**
```javascript
case 'testName':
  return createTestNameTestSection(dataPath);
```

**Add function:**
```javascript
function createTestNameTestSection(dataPath) {
  return `
    <div>
      <h4 class="text-md font-semibold text-gray-700 mb-3 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        Test Name Analysis
      </h4>
      <template x-if="${dataPath} && ${dataPath}.length > 0">
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div class="space-y-2">
            <template x-for="test in ${dataPath}">
              <div class="bg-white rounded p-2 text-xs border">
                <div class="flex justify-between mb-1">
                  <span class="font-medium">Test Name</span>
                  <span x-text="window.formatDateSafe(test.testDate)"></span>
                </div>
                <table class="w-full text-xs">
                  <tr><td class="font-medium">Field 1:</td><td x-text="test.fieldName1 || 'N/A'"></td></tr>
                  <tr x-show="test.testingLab"><td class="font-medium">Testing Lab:</td><td x-text="test.testingLab"></td></tr>
                </table>
                <template x-if="test.comments">
                  <p class="text-gray-600 mt-1" x-text="test.comments"></p>
                </template>
                <template x-if="test.reportPath">
                  <div class="mt-2 pt-2 border-t border-gray-200">
                    <button @click="viewTestNamePdf(test.reportPath)" class="text-link text-link-hover text-xs">
                      View Report
                    </button>
                  </div>
                </template>
              </div>
            </template>
          </div>
        </div>
      </template>
      <template x-if="!${dataPath} || ${dataPath}.length === 0">
        <div class="bg-gray-100 border border-gray-200 rounded-lg p-3 text-center text-gray-500 text-sm">
          No test name analysis found for this sample
        </div>
      </template>
    </div>
  `;
}
```

In `client/src/js/components/dataPage/DataPageSection.js`:

**Add to testTypes array:**
```javascript
const testTypes = ['betTests', 'conductivityTests', 'ramanTests', 'temTests', 'particleSizeTests', 'testNameTests'];
```

**Add case:**
```javascript
case 'testNameTests':
  return createDetailedTestNameSection(label, tests);
```

**Add to getTestTypeLabel:**
```javascript
testNameTests: 'Test Name Tests'
```

**Add section function:**
```javascript
function createDetailedTestNameSection(label, tests) {
  return `
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="font-medium text-gray-900 mb-3 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        ${label}
      </h4>
      ${tests.length === 0 ? `
        <div class="text-center py-4 text-gray-500 text-sm">
          No test name tests found
        </div>
      ` : `
        <div class="space-y-3">
          ${tests.map(test => `
            <div class="bg-white rounded border p-3">
              <div class="flex justify-between items-start mb-2">
                <span class="font-medium text-sm">Test Name</span>
                <span class="text-sm text-gray-600">\${test.testDate ? window.formatDateSafe(test.testDate) : 'N/A'}</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs">
                \${test.fieldName1 ? \`<div><span class="text-gray-600">Field 1:</span> <span class="font-medium">\${test.fieldName1}</span></div>\` : ''}
                \${test.testingLab ? \`<div><span class="text-gray-600">Lab:</span> <span class="font-medium">\${test.testingLab}</span></div>\` : ''}
              </div>
              \${test.comments ? \`<div class="mt-2 text-xs text-gray-600">\${test.comments}</div>\` : ''}
              \${test.reportPath ? \`
                <div class="mt-2 pt-2 border-t">
                  <button @click="window.openPdfInModal('\${test.reportPath}', 'Test Name Report')"
                          class="text-blue-600 hover:text-blue-800 text-xs flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    View Report
                  </button>
                </div>
              \` : ''}
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}
```

## Step 12: Update Backend Data Routes

In `server/routes/data.js`:

**Add to getGrapheneData include:**
```javascript
testNameTests: {
  orderBy: { testDate: 'desc' }
}
```

**Add to getCompoundBatchData include:**
```javascript
testNameTests: {
  orderBy: { testDate: 'desc' }
}
```

**Add to getTestCount:**
```javascript
if (experiment.testNameTests) count += experiment.testNameTests.length;
```

In `server/routes/compoundBatch.js` (/:id/related endpoint):

**Fetch tests:**
```javascript
const testNameTests = await prisma.testNameTest.findMany({
  where: { compoundBatchNumber: compoundBatch.batchNumber },
  orderBy: { createdAt: 'desc' }
});
```

**Process decimals:**
```javascript
const processedTestNameTests = testNameTests.map(record => ({
  ...record,
  fieldName1: record.fieldName1 ? Number(record.fieldName1) : null
}));
```

**Add to response:**
```javascript
res.json({
  // ... existing
  testNameTests: processedTestNameTests
});
```

**Add to single batch endpoint include:**
```javascript
testNameTests: true
```

## Final Checklist

- [ ] Database schema created and migrated
- [ ] Backend route created and registered
- [ ] Frontend tab component created
- [ ] Frontend modal component created
- [ ] API service updated
- [ ] CRUD service updated
- [ ] Constants updated
- [ ] App state and methods added
- [ ] Navigation added (desktop and mobile)
- [ ] Tab and modal rendered
- [ ] PDF viewer added (if applicable)
- [ ] Component imports added
- [ ] Test results helper updated
- [ ] Data page section updated
- [ ] Backend data routes updated
- [ ] Compound batch route updated
- [ ] Load function added to init
- [ ] Server restarted
- [ ] Browser refreshed
- [ ] Functionality tested

## Notes

- Replace all instances of "TestName", "testName", "test-name", etc. with your actual test name
- Adjust field names, types, and validation as needed
- Add custom dropdowns or fields as required
- Update CSV export headers and data mapping
- Customize table columns and display logic
- Add any test-specific calculations or formatting
