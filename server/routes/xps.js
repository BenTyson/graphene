import express from 'express';
import asyncHandler from 'express-async-handler';
import { csvDateOnly, sendCsv } from '../utils/csv.js';
import path from 'path';
import { createFileUploadMiddleware, uploadFile, deleteFileFromStorage } from '../utils/fileUpload.js';
import { buildSearchQuery, buildOrderBy } from '../utils/queryHelpers.js';
import { prepareDataForDB } from '../utils/dataConversion.js';
import AIInsightsService from '../services/AIInsightsService.js';

const router = express.Router();

// Configure file upload middleware - accepting PDF, JPG, PNG (multiple files)
const upload = createFileUploadMiddleware('xps-reports', {
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.xls', '.xlsx'],
  validateContent: false
});

// Get all XPS records
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { sortBy = 'chronological', order = 'desc', search } = req.query;

  const searchFields = ['grapheneSample', 'compoundBatchNumber', 'micronizationSku', 'mcbNumber', 'testingLab', 'comments'];
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

  const xpsRecords = await prisma.xPSTest.findMany({
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
  const processedRecords = xpsRecords.map(record => ({
    ...record,
    c1s_percent: record.c1s_percent ? Number(record.c1s_percent) : null,
    c1s_percent_error: record.c1s_percent_error ? Number(record.c1s_percent_error) : null,
    cl2p_percent: record.cl2p_percent ? Number(record.cl2p_percent) : null,
    cl2p_percent_error: record.cl2p_percent_error ? Number(record.cl2p_percent_error) : null,
    mo3d_percent: record.mo3d_percent ? Number(record.mo3d_percent) : null,
    mo3d_percent_error: record.mo3d_percent_error ? Number(record.mo3d_percent_error) : null,
    n1s_percent: record.n1s_percent ? Number(record.n1s_percent) : null,
    n1s_percent_error: record.n1s_percent_error ? Number(record.n1s_percent_error) : null,
    o1s_percent: record.o1s_percent ? Number(record.o1s_percent) : null,
    o1s_percent_error: record.o1s_percent_error ? Number(record.o1s_percent_error) : null,
    s2p_percent: record.s2p_percent ? Number(record.s2p_percent) : null,
    s2p_percent_error: record.s2p_percent_error ? Number(record.s2p_percent_error) : null,
    si2p_percent: record.si2p_percent ? Number(record.si2p_percent) : null,
    si2p_percent_error: record.si2p_percent_error ? Number(record.si2p_percent_error) : null,
    c1s_cc_percent: record.c1s_cc_percent ? Number(record.c1s_cc_percent) : null,
    c1s_cc_error: record.c1s_cc_error ? Number(record.c1s_cc_error) : null,
    c1s_co_percent: record.c1s_co_percent ? Number(record.c1s_co_percent) : null,
    c1s_co_error: record.c1s_co_error ? Number(record.c1s_co_error) : null,
    c1s_ceo_percent: record.c1s_ceo_percent ? Number(record.c1s_ceo_percent) : null,
    c1s_ceo_error: record.c1s_ceo_error ? Number(record.c1s_ceo_error) : null,
    c1s_co3_percent: record.c1s_co3_percent ? Number(record.c1s_co3_percent) : null,
    c1s_co3_error: record.c1s_co3_error ? Number(record.c1s_co3_error) : null,
    c1s_oceo_percent: record.c1s_oceo_percent ? Number(record.c1s_oceo_percent) : null,
    c1s_oceo_error: record.c1s_oceo_error ? Number(record.c1s_oceo_error) : null,
    c1s_sp2_percent: record.c1s_sp2_percent ? Number(record.c1s_sp2_percent) : null,
    c1s_sp2_error: record.c1s_sp2_error ? Number(record.c1s_sp2_error) : null
  }));

  res.json(processedRecords);
}));

// Get single XPS record
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  const xpsRecord = await prisma.xPSTest.findUnique({
    where: { id },
    include: {
      grapheneRef: true,
      compoundBatchRef: true,
      micronizationRef: true,
      mcbRef: true
    }
  });

  if (!xpsRecord) {
    res.status(404);
    throw new Error('XPS record not found');
  }

  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...xpsRecord,
    c1s_percent: xpsRecord.c1s_percent ? Number(xpsRecord.c1s_percent) : null,
    c1s_percent_error: xpsRecord.c1s_percent_error ? Number(xpsRecord.c1s_percent_error) : null,
    cl2p_percent: xpsRecord.cl2p_percent ? Number(xpsRecord.cl2p_percent) : null,
    cl2p_percent_error: xpsRecord.cl2p_percent_error ? Number(xpsRecord.cl2p_percent_error) : null,
    mo3d_percent: xpsRecord.mo3d_percent ? Number(xpsRecord.mo3d_percent) : null,
    mo3d_percent_error: xpsRecord.mo3d_percent_error ? Number(xpsRecord.mo3d_percent_error) : null,
    n1s_percent: xpsRecord.n1s_percent ? Number(xpsRecord.n1s_percent) : null,
    n1s_percent_error: xpsRecord.n1s_percent_error ? Number(xpsRecord.n1s_percent_error) : null,
    o1s_percent: xpsRecord.o1s_percent ? Number(xpsRecord.o1s_percent) : null,
    o1s_percent_error: xpsRecord.o1s_percent_error ? Number(xpsRecord.o1s_percent_error) : null,
    s2p_percent: xpsRecord.s2p_percent ? Number(xpsRecord.s2p_percent) : null,
    s2p_percent_error: xpsRecord.s2p_percent_error ? Number(xpsRecord.s2p_percent_error) : null,
    si2p_percent: xpsRecord.si2p_percent ? Number(xpsRecord.si2p_percent) : null,
    si2p_percent_error: xpsRecord.si2p_percent_error ? Number(xpsRecord.si2p_percent_error) : null,
    c1s_cc_percent: xpsRecord.c1s_cc_percent ? Number(xpsRecord.c1s_cc_percent) : null,
    c1s_cc_error: xpsRecord.c1s_cc_error ? Number(xpsRecord.c1s_cc_error) : null,
    c1s_co_percent: xpsRecord.c1s_co_percent ? Number(xpsRecord.c1s_co_percent) : null,
    c1s_co_error: xpsRecord.c1s_co_error ? Number(xpsRecord.c1s_co_error) : null,
    c1s_ceo_percent: xpsRecord.c1s_ceo_percent ? Number(xpsRecord.c1s_ceo_percent) : null,
    c1s_ceo_error: xpsRecord.c1s_ceo_error ? Number(xpsRecord.c1s_ceo_error) : null,
    c1s_co3_percent: xpsRecord.c1s_co3_percent ? Number(xpsRecord.c1s_co3_percent) : null,
    c1s_co3_error: xpsRecord.c1s_co3_error ? Number(xpsRecord.c1s_co3_error) : null,
    c1s_oceo_percent: xpsRecord.c1s_oceo_percent ? Number(xpsRecord.c1s_oceo_percent) : null,
    c1s_oceo_error: xpsRecord.c1s_oceo_error ? Number(xpsRecord.c1s_oceo_error) : null,
    c1s_sp2_percent: xpsRecord.c1s_sp2_percent ? Number(xpsRecord.c1s_sp2_percent) : null,
    c1s_sp2_error: xpsRecord.c1s_sp2_error ? Number(xpsRecord.c1s_sp2_error) : null
  };

  res.json(processedRecord);
}));

// Create new XPS record
router.post('/', upload.array('xpsReports', 10), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  // Prepare data using utility function
  const data = prepareDataForDB(req.body, {
    numericFields: [
      'c1s_percent', 'c1s_percent_error',
      'cl2p_percent', 'cl2p_percent_error',
      'mo3d_percent', 'mo3d_percent_error',
      'n1s_percent', 'n1s_percent_error',
      'o1s_percent', 'o1s_percent_error',
      's2p_percent', 's2p_percent_error',
      'si2p_percent', 'si2p_percent_error',
      'c1s_cc_percent', 'c1s_cc_error',
      'c1s_co_percent', 'c1s_co_error',
      'c1s_ceo_percent', 'c1s_ceo_error',
      'c1s_co3_percent', 'c1s_co3_error',
      'c1s_oceo_percent', 'c1s_oceo_error',
      'c1s_sp2_percent', 'c1s_sp2_error'
    ],
    dateFields: ['testDate'],
    fieldsToRemove: ['xpsReportFiles', 'removeFileIndices', 'grapheneRef', 'compoundBatchRef', 'micronizationRef', 'mcbRef', 'materialType', 'dateUnknown']
  });

  // Handle MULTIPLE file uploads
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file => uploadFile(file, 'xps-reports'));
    const results = await Promise.all(uploadPromises);

    // Collect successful uploads
    data.xpsReportPaths = results
      .filter(r => r.success)
      .map(r => r.path);

    // Log any failed uploads
    results.forEach((result, index) => {
      if (!result.success) {
        console.error(`Failed to upload XPS report ${index + 1}:`, result.error);
      }
    });
  } else {
    data.xpsReportPaths = [];
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

  const xpsRecord = await prisma.xPSTest.create({
    data
  });

  // Trigger AI insights cache invalidation for new XPS data
  AIInsightsService.onNewData('xps');

  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...xpsRecord,
    c1s_percent: xpsRecord.c1s_percent ? Number(xpsRecord.c1s_percent) : null,
    c1s_percent_error: xpsRecord.c1s_percent_error ? Number(xpsRecord.c1s_percent_error) : null,
    cl2p_percent: xpsRecord.cl2p_percent ? Number(xpsRecord.cl2p_percent) : null,
    cl2p_percent_error: xpsRecord.cl2p_percent_error ? Number(xpsRecord.cl2p_percent_error) : null,
    mo3d_percent: xpsRecord.mo3d_percent ? Number(xpsRecord.mo3d_percent) : null,
    mo3d_percent_error: xpsRecord.mo3d_percent_error ? Number(xpsRecord.mo3d_percent_error) : null,
    n1s_percent: xpsRecord.n1s_percent ? Number(xpsRecord.n1s_percent) : null,
    n1s_percent_error: xpsRecord.n1s_percent_error ? Number(xpsRecord.n1s_percent_error) : null,
    o1s_percent: xpsRecord.o1s_percent ? Number(xpsRecord.o1s_percent) : null,
    o1s_percent_error: xpsRecord.o1s_percent_error ? Number(xpsRecord.o1s_percent_error) : null,
    s2p_percent: xpsRecord.s2p_percent ? Number(xpsRecord.s2p_percent) : null,
    s2p_percent_error: xpsRecord.s2p_percent_error ? Number(xpsRecord.s2p_percent_error) : null,
    si2p_percent: xpsRecord.si2p_percent ? Number(xpsRecord.si2p_percent) : null,
    si2p_percent_error: xpsRecord.si2p_percent_error ? Number(xpsRecord.si2p_percent_error) : null,
    c1s_cc_percent: xpsRecord.c1s_cc_percent ? Number(xpsRecord.c1s_cc_percent) : null,
    c1s_cc_error: xpsRecord.c1s_cc_error ? Number(xpsRecord.c1s_cc_error) : null,
    c1s_co_percent: xpsRecord.c1s_co_percent ? Number(xpsRecord.c1s_co_percent) : null,
    c1s_co_error: xpsRecord.c1s_co_error ? Number(xpsRecord.c1s_co_error) : null,
    c1s_ceo_percent: xpsRecord.c1s_ceo_percent ? Number(xpsRecord.c1s_ceo_percent) : null,
    c1s_ceo_error: xpsRecord.c1s_ceo_error ? Number(xpsRecord.c1s_ceo_error) : null,
    c1s_co3_percent: xpsRecord.c1s_co3_percent ? Number(xpsRecord.c1s_co3_percent) : null,
    c1s_co3_error: xpsRecord.c1s_co3_error ? Number(xpsRecord.c1s_co3_error) : null,
    c1s_oceo_percent: xpsRecord.c1s_oceo_percent ? Number(xpsRecord.c1s_oceo_percent) : null,
    c1s_oceo_error: xpsRecord.c1s_oceo_error ? Number(xpsRecord.c1s_oceo_error) : null,
    c1s_sp2_percent: xpsRecord.c1s_sp2_percent ? Number(xpsRecord.c1s_sp2_percent) : null,
    c1s_sp2_error: xpsRecord.c1s_sp2_error ? Number(xpsRecord.c1s_sp2_error) : null
  };

  res.status(201).json(processedRecord);
}));

// Update XPS record
router.put('/:id', upload.array('xpsReports', 10), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  // Get existing record for file operations
  const existingRecord = await prisma.xPSTest.findUnique({
    where: { id }
  });

  if (!existingRecord) {
    res.status(404);
    throw new Error('XPS record not found');
  }

  // Prepare data using utility function
  const data = prepareDataForDB(req.body, {
    numericFields: [
      'c1s_percent', 'c1s_percent_error',
      'cl2p_percent', 'cl2p_percent_error',
      'mo3d_percent', 'mo3d_percent_error',
      'n1s_percent', 'n1s_percent_error',
      'o1s_percent', 'o1s_percent_error',
      's2p_percent', 's2p_percent_error',
      'si2p_percent', 'si2p_percent_error',
      'c1s_cc_percent', 'c1s_cc_error',
      'c1s_co_percent', 'c1s_co_error',
      'c1s_ceo_percent', 'c1s_ceo_error',
      'c1s_co3_percent', 'c1s_co3_error',
      'c1s_oceo_percent', 'c1s_oceo_error',
      'c1s_sp2_percent', 'c1s_sp2_error'
    ],
    dateFields: ['testDate'],
    fieldsToRemove: ['xpsReportFiles', 'removeFileIndices', 'grapheneRef', 'compoundBatchRef', 'micronizationRef', 'mcbRef', 'materialType', 'dateUnknown']
  });

  // Start with existing file paths
  let updatedFilePaths = [...(existingRecord.xpsReportPaths || [])];

  // Handle file removal by indices
  if (req.body.removeFileIndices) {
    try {
      const indicesToRemove = JSON.parse(req.body.removeFileIndices);
      if (Array.isArray(indicesToRemove) && indicesToRemove.length > 0) {
        // Get file paths to delete
        const filesToDelete = indicesToRemove
          .sort((a, b) => b - a) // Sort descending to remove from end first
          .map(index => updatedFilePaths[index])
          .filter(path => path); // Filter out undefined

        // Delete files from storage
        await Promise.all(filesToDelete.map(path => deleteFileFromStorage(path)));

        // Remove from array
        updatedFilePaths = updatedFilePaths.filter((_, index) => !indicesToRemove.includes(index));
      }
    } catch (error) {
      console.error('Error processing removeFileIndices:', error);
    }
  }

  // Handle NEW file uploads (add to existing)
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file => uploadFile(file, 'xps-reports'));
    const results = await Promise.all(uploadPromises);

    // Collect successful uploads
    const newPaths = results
      .filter(r => r.success)
      .map(r => r.path);

    updatedFilePaths = [...updatedFilePaths, ...newPaths];

    // Log any failed uploads
    results.forEach((result, index) => {
      if (!result.success) {
        console.error(`Failed to upload XPS report ${index + 1}:`, result.error);
      }
    });
  }

  data.xpsReportPaths = updatedFilePaths;

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

  const xpsRecord = await prisma.xPSTest.update({
    where: { id },
    data
  });

  // Trigger AI insights cache invalidation for updated XPS data
  AIInsightsService.onNewData('xps');

  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...xpsRecord,
    c1s_percent: xpsRecord.c1s_percent ? Number(xpsRecord.c1s_percent) : null,
    c1s_percent_error: xpsRecord.c1s_percent_error ? Number(xpsRecord.c1s_percent_error) : null,
    cl2p_percent: xpsRecord.cl2p_percent ? Number(xpsRecord.cl2p_percent) : null,
    cl2p_percent_error: xpsRecord.cl2p_percent_error ? Number(xpsRecord.cl2p_percent_error) : null,
    mo3d_percent: xpsRecord.mo3d_percent ? Number(xpsRecord.mo3d_percent) : null,
    mo3d_percent_error: xpsRecord.mo3d_percent_error ? Number(xpsRecord.mo3d_percent_error) : null,
    n1s_percent: xpsRecord.n1s_percent ? Number(xpsRecord.n1s_percent) : null,
    n1s_percent_error: xpsRecord.n1s_percent_error ? Number(xpsRecord.n1s_percent_error) : null,
    o1s_percent: xpsRecord.o1s_percent ? Number(xpsRecord.o1s_percent) : null,
    o1s_percent_error: xpsRecord.o1s_percent_error ? Number(xpsRecord.o1s_percent_error) : null,
    s2p_percent: xpsRecord.s2p_percent ? Number(xpsRecord.s2p_percent) : null,
    s2p_percent_error: xpsRecord.s2p_percent_error ? Number(xpsRecord.s2p_percent_error) : null,
    si2p_percent: xpsRecord.si2p_percent ? Number(xpsRecord.si2p_percent) : null,
    si2p_percent_error: xpsRecord.si2p_percent_error ? Number(xpsRecord.si2p_percent_error) : null,
    c1s_cc_percent: xpsRecord.c1s_cc_percent ? Number(xpsRecord.c1s_cc_percent) : null,
    c1s_cc_error: xpsRecord.c1s_cc_error ? Number(xpsRecord.c1s_cc_error) : null,
    c1s_co_percent: xpsRecord.c1s_co_percent ? Number(xpsRecord.c1s_co_percent) : null,
    c1s_co_error: xpsRecord.c1s_co_error ? Number(xpsRecord.c1s_co_error) : null,
    c1s_ceo_percent: xpsRecord.c1s_ceo_percent ? Number(xpsRecord.c1s_ceo_percent) : null,
    c1s_ceo_error: xpsRecord.c1s_ceo_error ? Number(xpsRecord.c1s_ceo_error) : null,
    c1s_co3_percent: xpsRecord.c1s_co3_percent ? Number(xpsRecord.c1s_co3_percent) : null,
    c1s_co3_error: xpsRecord.c1s_co3_error ? Number(xpsRecord.c1s_co3_error) : null,
    c1s_oceo_percent: xpsRecord.c1s_oceo_percent ? Number(xpsRecord.c1s_oceo_percent) : null,
    c1s_oceo_error: xpsRecord.c1s_oceo_error ? Number(xpsRecord.c1s_oceo_error) : null,
    c1s_sp2_percent: xpsRecord.c1s_sp2_percent ? Number(xpsRecord.c1s_sp2_percent) : null,
    c1s_sp2_error: xpsRecord.c1s_sp2_error ? Number(xpsRecord.c1s_sp2_error) : null
  };

  res.json(processedRecord);
}));

// Delete XPS record
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  // Get existing record to delete associated files
  const existingRecord = await prisma.xPSTest.findUnique({
    where: { id }
  });

  // Delete ALL associated files
  if (existingRecord && existingRecord.xpsReportPaths && existingRecord.xpsReportPaths.length > 0) {
    await Promise.all(
      existingRecord.xpsReportPaths.map(path => deleteFileFromStorage(path))
    );
  }

  await prisma.xPSTest.delete({
    where: { id }
  });

  res.status(204).send();
}));

// Export to CSV
router.get('/export/csv', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  const xpsRecords = await prisma.xPSTest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      grapheneRef: true,
      compoundBatchRef: true,
      micronizationRef: true,
      mcbRef: true
    }
  });

  // Single header row. The XPS table's <thead> is flat and shows only a summary
  // (Test Date, Sample, C-1s %, O-1s %, N-1s %, Testing Lab, Comments, Reports) —
  // TestResultsXPSTab.js. There is no colspan band to mirror, so the natural
  // element/error pairing below stays a flat label like 'C-1s Error' rather than
  // becoming an invented two-row group the screen does not have.
  //
  // The non-ASCII labels ('CO₃ %', 'sp² %') are why the shared sendCsv sets
  // charset=utf-8; before this change the response declared no charset at all.
  const headers = [
    'Test Date', 'Sample Type', 'Sample ID',
    'C-1s %', 'C-1s Error', 'Cl-2p %', 'Cl-2p Error',
    'Mo-3d %', 'Mo-3d Error', 'N-1s %', 'N-1s Error',
    'O-1s %', 'O-1s Error', 'S-2p %', 'S-2p Error',
    'Si-2p %', 'Si-2p Error',
    'C-C %', 'C-C Error', 'C-O %', 'C-O Error',
    'C=O %', 'C=O Error', 'CO₃ %', 'CO₃ Error',
    'O-C=O %', 'O-C=O Error', 'sp² %', 'sp² Error',
    'Testing Lab', 'Number of Reports', 'Comments', 'Created At', 'Updated At'
  ];

  const rows = xpsRecords.map(r => {
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
      r.c1s_percent, r.c1s_percent_error,
      r.cl2p_percent, r.cl2p_percent_error,
      r.mo3d_percent, r.mo3d_percent_error,
      r.n1s_percent, r.n1s_percent_error,
      r.o1s_percent, r.o1s_percent_error,
      r.s2p_percent, r.s2p_percent_error,
      r.si2p_percent, r.si2p_percent_error,
      r.c1s_cc_percent, r.c1s_cc_error,
      r.c1s_co_percent, r.c1s_co_error,
      r.c1s_ceo_percent, r.c1s_ceo_error,
      r.c1s_co3_percent, r.c1s_co3_error,
      r.c1s_oceo_percent, r.c1s_oceo_error,
      r.c1s_sp2_percent, r.c1s_sp2_error,
      r.testingLab,
      r.xpsReportPaths ? r.xpsReportPaths.length : 0,
      r.comments,
      r.createdAt,
      r.updatedAt
    ];
  });

  sendCsv(res, 'xps_export.csv', headers, rows);
}));

export default router;
