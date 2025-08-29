import express from 'express';
import asyncHandler from 'express-async-handler';
import path from 'path';
import { createFileUploadMiddleware, replaceFile, deleteFile } from '../utils/fileUpload.js';
import { buildSearchQuery, buildOrderBy } from '../utils/queryHelpers.js';
import { prepareDataForDB } from '../utils/dataConversion.js';

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
    fieldsToRemove: ['betReportFile', 'removeBetReport', 'replaceBetReport', 'grapheneRef', 'species']
  });
  
  // Handle file upload
  if (req.file) {
    data.betReportPath = path.join('bet-reports', req.file.filename);
  }
  
  // Remove system fields
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  
  const betRecord = await prisma.bET.create({
    data
  });
  
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
    fieldsToRemove: ['betReportFile', 'removeBetReport', 'replaceBetReport', 'grapheneRef', 'species']
  });
  
  // Handle file operations
  if (req.body.removeBetReport === 'true') {
    // Remove existing file
    if (existingRecord.betReportPath) {
      deleteFile(path.join(process.cwd(), 'uploads', existingRecord.betReportPath));
    }
    data.betReportPath = null;
  } else if (req.file) {
    // Replace existing file
    data.betReportPath = replaceFile(existingRecord.betReportPath, req.file);
  }
  
  // Remove system fields
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  
  const betRecord = await prisma.bET.update({
    where: { id },
    data
  });
  
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
  
  const headers = [
    'Test Date', 'Graphene Sample', 'Mass (g)', 'Research Team', 'Testing Lab',
    'Multipoint BET Area (m²/g)', 'Langmuir Surface Area (m²/g)', 
    'BET Report', 'Comments', 'Created At'
  ];
  
  let csv = headers.join(',') + '\n';
  
  betRecords.forEach(b => {
    const row = [
      b.testDate ? b.testDate.toISOString().split('T')[0] : '',
      b.grapheneSample || '',
      b.mass || '',
      b.researchTeam || '',
      b.testingLab || '',
      b.multipointBetArea || '',
      b.langmuirSurfaceArea || '',
      b.betReportPath ? 'Yes' : 'No',
      `"${(b.comments || '').replace(/"/g, '""')}"`,
      b.createdAt.toISOString()
    ];
    csv += row.join(',') + '\n';
  });
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="bet_export.csv"');
  res.send(csv);
}));

export default router;