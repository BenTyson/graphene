import express from 'express';
import asyncHandler from 'express-async-handler';
import { csvDateOnly, sendCsv } from '../utils/csv.js';
import path from 'path';
import { createFileUploadMiddleware, uploadFile, replaceFileInStorage, deleteFileFromStorage } from '../utils/fileUpload.js';
import { buildSearchQuery, buildOrderBy } from '../utils/queryHelpers.js';
import { prepareDataForDB } from '../utils/dataConversion.js';
import AIInsightsService from '../services/AIInsightsService.js';

const router = express.Router();

// Configure file upload middleware
const upload = createFileUploadMiddleware('bet-reports');

// Get all BET records
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { sortBy = 'chronological', order = 'desc', search } = req.query;
  
  const searchFields = ['grapheneSample', 'comments'];
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
  
  const betRecords = await prisma.bET.findMany({
    where,
    orderBy,
    include: {
      grapheneRef: {
        select: { experimentNumber: true }
      }
    }
  });
  
  // Convert Decimal fields to numbers for frontend
  const processedRecords = betRecords.map(record => ({
    ...record,
    mass: record.mass ? Number(record.mass) : null,
    multipointBetArea: record.multipointBetArea ? Number(record.multipointBetArea) : null,
    langmuirSurfaceArea: record.langmuirSurfaceArea ? Number(record.langmuirSurfaceArea) : null
  }));
  
  res.json(processedRecords);
}));

// Get single BET record
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  const betRecord = await prisma.bET.findUnique({
    where: { id },
    include: { grapheneRef: true }
  });
  
  if (!betRecord) {
    res.status(404);
    throw new Error('BET record not found');
  }
  
  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...betRecord,
    mass: betRecord.mass ? Number(betRecord.mass) : null,
    multipointBetArea: betRecord.multipointBetArea ? Number(betRecord.multipointBetArea) : null,
    langmuirSurfaceArea: betRecord.langmuirSurfaceArea ? Number(betRecord.langmuirSurfaceArea) : null
  };
  
  res.json(processedRecord);
}));

// Create new BET record
router.post('/', upload.single('betReport'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  // Prepare data using utility function
  const data = prepareDataForDB(req.body, {
    numericFields: ['mass', 'multipointBetArea', 'langmuirSurfaceArea'],
    dateFields: ['testDate'],
    fieldsToRemove: ['betReportFile', 'removeBetReport', 'replaceBetReport', 'grapheneRef', 'species', 'materialType', 'dateUnknown']
  });
  
  // Handle file upload
  if (req.file) {
    const uploadResult = await uploadFile(req.file, 'bet-reports');
    if (uploadResult.success) {
      data.betReportPath = uploadResult.path;
    } else {
      console.error('Failed to upload BET report:', uploadResult.error);
    }
  }

  // Handle material selection - only one should be set, others should be null
  if (!data.grapheneSample || data.grapheneSample === '') {
    data.grapheneSample = null;
  }
  if (!data.compoundBatchNumber || data.compoundBatchNumber === '') {
    data.compoundBatchNumber = null;
  }

  // Remove system fields
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  
  const betRecord = await prisma.bET.create({
    data
  });
  
  // Trigger AI insights cache invalidation for new BET data
  AIInsightsService.onNewData('bet');
  
  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...betRecord,
    mass: betRecord.mass ? Number(betRecord.mass) : null,
    multipointBetArea: betRecord.multipointBetArea ? Number(betRecord.multipointBetArea) : null,
    langmuirSurfaceArea: betRecord.langmuirSurfaceArea ? Number(betRecord.langmuirSurfaceArea) : null
  };
  
  res.status(201).json(processedRecord);
}));

// Update BET record
router.put('/:id', upload.single('betReport'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Get existing record for file operations
  const existingRecord = await prisma.bET.findUnique({
    where: { id }
  });
  
  if (!existingRecord) {
    res.status(404);
    throw new Error('BET record not found');
  }
  
  // Prepare data using utility function
  const data = prepareDataForDB(req.body, {
    numericFields: ['mass', 'multipointBetArea', 'langmuirSurfaceArea'],
    dateFields: ['testDate'],
    fieldsToRemove: ['betReportFile', 'removeBetReport', 'replaceBetReport', 'grapheneRef', 'species', 'materialType', 'dateUnknown']
  });

  // Handle file operations
  if (req.body.removeBetReport === 'true') {
    data.betReportPath = null;
    // Delete existing file
    if (existingRecord.betReportPath) {
      await deleteFileFromStorage(existingRecord.betReportPath);
    }
  } else if (req.file) {
    // Replace existing file
    const replaceResult = await replaceFileInStorage(existingRecord.betReportPath, req.file, 'bet-reports');
    if (replaceResult.success) {
      data.betReportPath = replaceResult.path;
    } else {
      console.error('Failed to replace BET report:', replaceResult.error);
    }
  }

  // Handle material selection - only one should be set, others should be null
  if (!data.grapheneSample || data.grapheneSample === '') {
    data.grapheneSample = null;
  }
  if (!data.compoundBatchNumber || data.compoundBatchNumber === '') {
    data.compoundBatchNumber = null;
  }

  // Remove system fields
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  
  const betRecord = await prisma.bET.update({
    where: { id },
    data
  });
  
  // Trigger AI insights cache invalidation for updated BET data
  AIInsightsService.onNewData('bet');
  
  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...betRecord,
    mass: betRecord.mass ? Number(betRecord.mass) : null,
    multipointBetArea: betRecord.multipointBetArea ? Number(betRecord.multipointBetArea) : null,
    langmuirSurfaceArea: betRecord.langmuirSurfaceArea ? Number(betRecord.langmuirSurfaceArea) : null
  };
  
  res.json(processedRecord);
}));

// Delete BET record
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Get existing record to delete associated file
  const existingRecord = await prisma.bET.findUnique({
    where: { id }
  });
  
  if (existingRecord && existingRecord.betReportPath) {
    deleteFile(path.join(process.cwd(), 'uploads', existingRecord.betReportPath));
  }
  
  await prisma.bET.delete({
    where: { id }
  });
  
  res.status(204).send();
}));

// Export to CSV
router.get('/export/csv', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  const betRecords = await prisma.bET.findMany({
    orderBy: { createdAt: 'desc' },
    include: { grapheneRef: true }
  });
  
  // Single header row: the BET table's <thead> is flat — no colspan band
  // (client/src/js/components/tabs/TestResultsBETTab.js). A two-row grouped header
  // here would be ceremony that breaks naive parsers for nothing.
  //
  // `Compound Batch` is new: the table's sample cell renders
  // `grapheneSample || compoundBatchNumber` (TestResultsBETTab.js:75), so a BET run on
  // a compound batch previously exported a blank sample. Split into two columns rather
  // than coalesced, so each stays filterable.
  const headers = [
    'Test Date', 'Graphene Sample', 'Compound Batch', 'Mass (g)', 'Research Team', 'Testing Lab',
    'Multipoint BET Area (m²/g)', 'Langmuir Surface Area (m²/g)',
    'BET Report', 'Comments', 'Created At', 'Updated At'
  ];

  const rows = betRecords.map(b => [
    csvDateOnly(b.testDate),
    b.grapheneSample,
    b.compoundBatchNumber,
    b.mass,
    b.researchTeam,
    b.testingLab,
    b.multipointBetArea,
    b.langmuirSurfaceArea,
    b.betReportPath ? 'Yes' : 'No',
    b.comments,
    b.createdAt,
    b.updatedAt
  ]);

  sendCsv(res, 'bet_export.csv', headers, rows);
}));

export default router;