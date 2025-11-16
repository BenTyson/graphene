import express from 'express';
import asyncHandler from 'express-async-handler';
import path from 'path';
import { createFileUploadMiddleware, uploadFile, deleteFileFromStorage } from '../utils/fileUpload.js';
import { buildSearchQuery, buildOrderBy } from '../utils/queryHelpers.js';
import { prepareDataForDB } from '../utils/dataConversion.js';
import AIInsightsService from '../services/AIInsightsService.js';

const router = express.Router();

// Configure file upload middleware - accepting PDF, JPG, PNG (multiple files)
const upload = createFileUploadMiddleware('xrd-reports', {
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
  validateContent: false
});

// Get all XRD records
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { sortBy = 'chronological', order = 'desc', search } = req.query;

  const searchFields = ['grapheneSample', 'compoundBatchNumber', 'micronizationSku', 'mcbNumber', 'testingLab', 'peak1_assignment', 'peak2_assignment', 'comments'];
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

  const xrdRecords = await prisma.xRDTest.findMany({
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
  const processedRecords = xrdRecords.map(record => ({
    ...record,
    peak1_position: record.peak1_position ? Number(record.peak1_position) : null,
    peak2_position: record.peak2_position ? Number(record.peak2_position) : null,
    crystallite_size: record.crystallite_size ? Number(record.crystallite_size) : null
  }));

  res.json(processedRecords);
}));

// Get single XRD record
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  const xrdRecord = await prisma.xRDTest.findUnique({
    where: { id },
    include: {
      grapheneRef: true,
      compoundBatchRef: true,
      micronizationRef: true,
      mcbRef: true
    }
  });

  if (!xrdRecord) {
    res.status(404);
    throw new Error('XRD record not found');
  }

  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...xrdRecord,
    peak1_position: xrdRecord.peak1_position ? Number(xrdRecord.peak1_position) : null,
    peak2_position: xrdRecord.peak2_position ? Number(xrdRecord.peak2_position) : null,
    crystallite_size: xrdRecord.crystallite_size ? Number(xrdRecord.crystallite_size) : null
  };

  res.json(processedRecord);
}));

// Create new XRD record
router.post('/', upload.array('xrdReports', 10), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  // Prepare data using utility function
  const data = prepareDataForDB(req.body, {
    numericFields: ['peak1_position', 'peak2_position', 'crystallite_size'],
    dateFields: ['testDate'],
    fieldsToRemove: ['xrdReportFiles', 'removeFileIndices', 'grapheneRef', 'compoundBatchRef', 'micronizationRef', 'mcbRef', 'materialType', 'dateUnknown']
  });

  // Handle MULTIPLE file uploads
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file => uploadFile(file, 'xrd-reports'));
    const results = await Promise.all(uploadPromises);

    // Collect successful uploads
    data.xrdReportPaths = results
      .filter(r => r.success)
      .map(r => r.path);

    // Log any failed uploads
    results.forEach((result, index) => {
      if (!result.success) {
        console.error(`Failed to upload XRD report ${index + 1}:`, result.error);
      }
    });
  } else {
    data.xrdReportPaths = [];
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

  const xrdRecord = await prisma.xRDTest.create({
    data
  });

  // Trigger AI insights cache invalidation for new XRD data
  AIInsightsService.onNewData('xrd');

  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...xrdRecord,
    peak1_position: xrdRecord.peak1_position ? Number(xrdRecord.peak1_position) : null,
    peak2_position: xrdRecord.peak2_position ? Number(xrdRecord.peak2_position) : null,
    crystallite_size: xrdRecord.crystallite_size ? Number(xrdRecord.crystallite_size) : null
  };

  res.status(201).json(processedRecord);
}));

// Update XRD record
router.put('/:id', upload.array('xrdReports', 10), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  // Get existing record for file operations
  const existingRecord = await prisma.xRDTest.findUnique({
    where: { id }
  });

  if (!existingRecord) {
    res.status(404);
    throw new Error('XRD record not found');
  }

  // Prepare data using utility function
  const data = prepareDataForDB(req.body, {
    numericFields: ['peak1_position', 'peak2_position', 'crystallite_size'],
    dateFields: ['testDate'],
    fieldsToRemove: ['xrdReportFiles', 'removeFileIndices', 'grapheneRef', 'compoundBatchRef', 'micronizationRef', 'mcbRef', 'materialType', 'dateUnknown']
  });

  // Start with existing file paths
  let updatedFilePaths = [...(existingRecord.xrdReportPaths || [])];

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
    const uploadPromises = req.files.map(file => uploadFile(file, 'xrd-reports'));
    const results = await Promise.all(uploadPromises);

    // Collect successful uploads
    const newPaths = results
      .filter(r => r.success)
      .map(r => r.path);

    updatedFilePaths = [...updatedFilePaths, ...newPaths];

    // Log any failed uploads
    results.forEach((result, index) => {
      if (!result.success) {
        console.error(`Failed to upload XRD report ${index + 1}:`, result.error);
      }
    });
  }

  data.xrdReportPaths = updatedFilePaths;

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

  const xrdRecord = await prisma.xRDTest.update({
    where: { id },
    data
  });

  // Trigger AI insights cache invalidation for updated XRD data
  AIInsightsService.onNewData('xrd');

  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...xrdRecord,
    peak1_position: xrdRecord.peak1_position ? Number(xrdRecord.peak1_position) : null,
    peak2_position: xrdRecord.peak2_position ? Number(xrdRecord.peak2_position) : null,
    crystallite_size: xrdRecord.crystallite_size ? Number(xrdRecord.crystallite_size) : null
  };

  res.json(processedRecord);
}));

// Delete XRD record
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  // Get existing record to delete associated files
  const existingRecord = await prisma.xRDTest.findUnique({
    where: { id }
  });

  // Delete ALL associated files
  if (existingRecord && existingRecord.xrdReportPaths && existingRecord.xrdReportPaths.length > 0) {
    await Promise.all(
      existingRecord.xrdReportPaths.map(path => deleteFileFromStorage(path))
    );
  }

  await prisma.xRDTest.delete({
    where: { id }
  });

  res.status(204).send();
}));

// Export to CSV
router.get('/export/csv', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  const xrdRecords = await prisma.xRDTest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      grapheneRef: true,
      compoundBatchRef: true,
      micronizationRef: true,
      mcbRef: true
    }
  });

  const headers = [
    'Test Date', 'Sample Type', 'Sample ID',
    'Peak 1 Position (2θ)', 'Peak 1 Assignment',
    'Peak 2 Position (2θ)', 'Peak 2 Assignment',
    'Crystallite Size (nm)', 'Testing Lab',
    'Number of Reports', 'Comments', 'Created At'
  ];

  let csv = headers.join(',') + '\n';

  xrdRecords.forEach(r => {
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

    const row = [
      r.testDate ? r.testDate.toISOString().split('T')[0] : '',
      sampleType,
      sampleId,
      r.peak1_position || '',
      r.peak1_assignment || '',
      r.peak2_position || '',
      r.peak2_assignment || '',
      r.crystallite_size || '',
      r.testingLab || '',
      r.xrdReportPaths ? r.xrdReportPaths.length : 0,
      `"${(r.comments || '').replace(/"/g, '""')}"`,
      r.createdAt.toISOString()
    ];
    csv += row.join(',') + '\n';
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="xrd_export.csv"');
  res.send(csv);
}));

export default router;
