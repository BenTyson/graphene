import express from 'express';
import asyncHandler from 'express-async-handler';
import { csvDateOnly, sendCsv } from '../utils/csv.js';
import path from 'path';
import { createFileUploadMiddleware, uploadFile, replaceFileInStorage, deleteFileFromStorage } from '../utils/fileUpload.js';
import { buildSearchQuery, buildOrderBy } from '../utils/queryHelpers.js';
import { prepareDataForDB } from '../utils/dataConversion.js';
import AIInsightsService from '../services/AIInsightsService.js';

const router = express.Router();

// Configure file upload middleware - accepting PDF, JPG, PNG
const upload = createFileUploadMiddleware('particle-size-reports', {
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
  validateContent: false // Disable content validation for image files
});

// Get all Particle Size records
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { sortBy = 'chronological', order = 'desc', search } = req.query;

  const searchFields = ['grapheneSample', 'compoundBatchNumber', 'micronizationSku', 'mcbNumber', 'testingLab', 'testingMethod', 'comments'];
  const where = buildSearchQuery(searchFields, search);

  const sortMappings = {
    chronological: 'testDate'
  };
  let orderBy = buildOrderBy(sortBy, order, sortMappings);

  // For chronological, use multiple sort fields
  if (sortBy === 'chronological') {
    orderBy = [
      { testDate: order },
      { createdAt: order }
    ];
  }

  const particleSizeRecords = await prisma.particleSizeTest.findMany({
    where,
    orderBy,
    include: {
      grapheneRef: {
        select: { experimentNumber: true }
      },
      compoundBatchRef: {
        select: { batchNumber: true, batchName: true }
      },
      micronizationRef: {
        select: { micronizationNumber: true, sku: true }
      },
      mcbRef: {
        select: { mcbNumber: true }
      }
    }
  });

  // Convert Decimal fields to numbers for frontend
  const processedRecords = particleSizeRecords.map(record => ({
    ...record,
    d10: record.d10 ? Number(record.d10) : null,
    d50: record.d50 ? Number(record.d50) : null,
    d90: record.d90 ? Number(record.d90) : null,
    meanSize: record.meanSize ? Number(record.meanSize) : null,
    spanValue: record.spanValue ? Number(record.spanValue) : null
  }));

  res.json(processedRecords);
}));

// Get single Particle Size record
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  const particleSizeRecord = await prisma.particleSizeTest.findUnique({
    where: { id },
    include: {
      grapheneRef: true,
      compoundBatchRef: true,
      micronizationRef: true,
      mcbRef: true
    }
  });

  if (!particleSizeRecord) {
    res.status(404);
    throw new Error('Particle Size record not found');
  }

  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...particleSizeRecord,
    d10: particleSizeRecord.d10 ? Number(particleSizeRecord.d10) : null,
    d50: particleSizeRecord.d50 ? Number(particleSizeRecord.d50) : null,
    d90: particleSizeRecord.d90 ? Number(particleSizeRecord.d90) : null,
    meanSize: particleSizeRecord.meanSize ? Number(particleSizeRecord.meanSize) : null,
    spanValue: particleSizeRecord.spanValue ? Number(particleSizeRecord.spanValue) : null
  };

  res.json(processedRecord);
}));

// Create new Particle Size record
router.post('/', upload.single('particleSizeReport'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  // Prepare data using utility function
  const data = prepareDataForDB(req.body, {
    numericFields: ['d10', 'd50', 'd90', 'meanSize', 'spanValue'],
    dateFields: ['testDate'],
    fieldsToRemove: ['particleSizeReportFile', 'removeParticleSizeReport', 'replaceParticleSizeReport', 'grapheneRef', 'compoundBatchRef', 'micronizationRef', 'mcbRef', 'materialType', 'dateUnknown']
  });

  // Handle file upload
  if (req.file) {
    const uploadResult = await uploadFile(req.file, 'particle-size-reports');
    if (uploadResult.success) {
      data.particleSizeReportPath = uploadResult.path;
    } else {
      console.error('Failed to upload Particle Size report:', uploadResult.error);
    }
  }

  // Handle material selection - only one should be set, others should be null
  if (!data.grapheneSample || data.grapheneSample === '') {
    data.grapheneSample = null;
  }
  if (!data.compoundBatchNumber || data.compoundBatchNumber === '') {
    data.compoundBatchNumber = null;
  }
  if (!data.micronizationSku || data.micronizationSku === '') {
    data.micronizationSku = null;
  }
  if (!data.mcbNumber || data.mcbNumber === '') {
    data.mcbNumber = null;
  }

  // Remove system fields
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;

  const particleSizeRecord = await prisma.particleSizeTest.create({
    data
  });

  // Trigger AI insights cache invalidation for new Particle Size data
  AIInsightsService.onNewData('particleSize');

  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...particleSizeRecord,
    d10: particleSizeRecord.d10 ? Number(particleSizeRecord.d10) : null,
    d50: particleSizeRecord.d50 ? Number(particleSizeRecord.d50) : null,
    d90: particleSizeRecord.d90 ? Number(particleSizeRecord.d90) : null,
    meanSize: particleSizeRecord.meanSize ? Number(particleSizeRecord.meanSize) : null,
    spanValue: particleSizeRecord.spanValue ? Number(particleSizeRecord.spanValue) : null
  };

  res.status(201).json(processedRecord);
}));

// Update Particle Size record
router.put('/:id', upload.single('particleSizeReport'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  // Get existing record for file operations
  const existingRecord = await prisma.particleSizeTest.findUnique({
    where: { id }
  });

  if (!existingRecord) {
    res.status(404);
    throw new Error('Particle Size record not found');
  }

  // Prepare data using utility function
  const data = prepareDataForDB(req.body, {
    numericFields: ['d10', 'd50', 'd90', 'meanSize', 'spanValue'],
    dateFields: ['testDate'],
    fieldsToRemove: ['particleSizeReportFile', 'removeParticleSizeReport', 'replaceParticleSizeReport', 'grapheneRef', 'compoundBatchRef', 'micronizationRef', 'mcbRef', 'materialType', 'dateUnknown']
  });

  // Handle file operations
  if (req.body.removeParticleSizeReport === 'true') {
    data.particleSizeReportPath = null;
    // Delete existing file
    if (existingRecord.particleSizeReportPath) {
      await deleteFileFromStorage(existingRecord.particleSizeReportPath);
    }
  } else if (req.file) {
    // Replace existing file
    const replaceResult = await replaceFileInStorage(existingRecord.particleSizeReportPath, req.file, 'particle-size-reports');
    if (replaceResult.success) {
      data.particleSizeReportPath = replaceResult.path;
    } else {
      console.error('Failed to replace Particle Size report:', replaceResult.error);
    }
  }

  // Handle material selection - only one should be set, others should be null
  if (!data.grapheneSample || data.grapheneSample === '') {
    data.grapheneSample = null;
  }
  if (!data.compoundBatchNumber || data.compoundBatchNumber === '') {
    data.compoundBatchNumber = null;
  }
  if (!data.micronizationSku || data.micronizationSku === '') {
    data.micronizationSku = null;
  }
  if (!data.mcbNumber || data.mcbNumber === '') {
    data.mcbNumber = null;
  }

  // Remove system fields
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;

  const particleSizeRecord = await prisma.particleSizeTest.update({
    where: { id },
    data
  });

  // Trigger AI insights cache invalidation for updated Particle Size data
  AIInsightsService.onNewData('particleSize');

  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...particleSizeRecord,
    d10: particleSizeRecord.d10 ? Number(particleSizeRecord.d10) : null,
    d50: particleSizeRecord.d50 ? Number(particleSizeRecord.d50) : null,
    d90: particleSizeRecord.d90 ? Number(particleSizeRecord.d90) : null,
    meanSize: particleSizeRecord.meanSize ? Number(particleSizeRecord.meanSize) : null,
    spanValue: particleSizeRecord.spanValue ? Number(particleSizeRecord.spanValue) : null
  };

  res.json(processedRecord);
}));

// Delete Particle Size record
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  // Get existing record to delete associated file
  const existingRecord = await prisma.particleSizeTest.findUnique({
    where: { id }
  });

  if (existingRecord && existingRecord.particleSizeReportPath) {
    await deleteFileFromStorage(existingRecord.particleSizeReportPath);
  }

  await prisma.particleSizeTest.delete({
    where: { id }
  });

  res.status(204).send();
}));

// Export to CSV
router.get('/export/csv', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  const particleSizeRecords = await prisma.particleSizeTest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      grapheneRef: true,
      compoundBatchRef: true,
      micronizationRef: true,
      mcbRef: true
    }
  });

  // Single header row: the Particle Size table's <thead> is flat — no colspan band
  // (client/src/js/components/tabs/TestResultsParticleSizeTab.js). The export is a
  // superset of the table, which shows only D10/D50/D90 of the numeric columns.
  //
  // The Sample Type / Sample ID pair already splits the table's single Sample cell,
  // which is the graphene composite rule applied before this chip existed. Left as is.
  const headers = [
    'Test Date', 'Sample Type', 'Sample ID', 'D10 (μm)', 'D50 (μm)', 'D90 (μm)',
    'Mean Size (μm)', 'Span Value', 'Testing Lab', 'Testing Method',
    'Report', 'Comments', 'Created At', 'Updated At'
  ];

  const rows = particleSizeRecords.map(r => {
    // Determine sample type and ID
    let sampleType = '';
    let sampleId = '';
    if (r.grapheneSample) {
      sampleType = 'Graphene';
      sampleId = r.grapheneSample;
    } else if (r.compoundBatchNumber) {
      sampleType = 'Compound Batch';
      sampleId = r.compoundBatchNumber;
    } else if (r.micronizationSku) {
      sampleType = 'Micronization';
      sampleId = r.micronizationSku;
    } else if (r.mcbNumber) {
      sampleType = 'MCB';
      sampleId = r.mcbNumber;
    }

    return [
      csvDateOnly(r.testDate),
      sampleType,
      sampleId,
      r.d10,
      r.d50,
      r.d90,
      r.meanSize,
      r.spanValue,
      r.testingLab,
      r.testingMethod,
      r.particleSizeReportPath ? 'Yes' : 'No',
      r.comments,
      r.createdAt,
      r.updatedAt
    ];
  });

  sendCsv(res, 'particle_size_export.csv', headers, rows);
}));

export default router;
