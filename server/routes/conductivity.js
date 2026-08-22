import express from 'express';
import asyncHandler from 'express-async-handler';
import { csvDateOnly, sendCsv } from '../utils/csv.js';
import path from 'path';
import { createFileUploadMiddleware, replaceFile, deleteFile } from '../utils/fileUpload.js';
import AIInsightsService from '../services/AIInsightsService.js';

const router = express.Router();

// Configure file upload middleware
const upload = createFileUploadMiddleware('conductivity-reports', {
  allowedTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm (Windows)
    'application/vnd.ms-excel.sheet.macroenabled.12' // .xlsm (lowercase variant)
  ],
  allowedExtensions: ['.pdf', '.xlsx', '.xls', '.xlsm'],
  maxSize: 10 * 1024 * 1024, // 10MB
  validateContent: false // Disable content validation for Excel files
});

// Test endpoint
router.get('/test', (req, res) => {
  console.log('Conductivity test endpoint hit!');
  res.json({ message: 'Conductivity API is working' });
});

router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { sortBy = 'chronological', order = 'desc', search } = req.query;
  
  let where = {};
  if (search) {
    where = {
      OR: [
        { grapheneSample: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { comments: { contains: search, mode: 'insensitive' } }
      ]
    };
  }
  
  let orderBy;
  if (sortBy === 'chronological') {
    orderBy = [
      { testDate: order },
      { createdAt: order }
    ];
  } else {
    orderBy = { [sortBy]: order };
  }
  
  const conductivityRecords = await prisma.conductivityTest.findMany({
    where,
    orderBy,
    include: {
      grapheneRef: {
        select: { experimentNumber: true, species: true }
      }
    }
  });
  
  // Convert Decimal fields to numbers for frontend
  const processedRecords = conductivityRecords.map(record => ({
    ...record,
    conductivity1kN: record.conductivity1kN ? Number(record.conductivity1kN) : null,
    conductivity8kN: record.conductivity8kN ? Number(record.conductivity8kN) : null,
    conductivity12kN: record.conductivity12kN ? Number(record.conductivity12kN) : null,
    conductivity20kN: record.conductivity20kN ? Number(record.conductivity20kN) : null
  }));
  
  // Debug logging
  console.log('Raw conductivity records:', JSON.stringify(conductivityRecords, null, 2));
  console.log('Processed conductivity records:', JSON.stringify(processedRecords, null, 2));
  
  res.json(processedRecords);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  const conductivityRecord = await prisma.conductivityTest.findUnique({
    where: { id },
    include: { grapheneRef: true }
  });
  
  if (!conductivityRecord) {
    res.status(404);
    throw new Error('Conductivity record not found');
  }
  
  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...conductivityRecord,
    conductivity1kN: conductivityRecord.conductivity1kN ? Number(conductivityRecord.conductivity1kN) : null,
    conductivity8kN: conductivityRecord.conductivity8kN ? Number(conductivityRecord.conductivity8kN) : null,
    conductivity12kN: conductivityRecord.conductivity12kN ? Number(conductivityRecord.conductivity12kN) : null,
    conductivity20kN: conductivityRecord.conductivity20kN ? Number(conductivityRecord.conductivity20kN) : null
  };
  
  res.json(processedRecord);
}));

router.post('/', upload.single('conductivityReport'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  const data = { ...req.body };
  const numericFields = ['conductivity1kN', 'conductivity8kN', 'conductivity12kN', 'conductivity20kN'];
  
  numericFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      const num = parseFloat(data[field]);
      if (!isNaN(num)) {
        data[field] = num;
      }
    } else {
      data[field] = null;
    }
  });
  
  if (data.testDate && data.testDate !== '') {
    data.testDate = new Date(data.testDate);
  } else {
    data.testDate = null;
  }
  
  // Handle material selection - only one should be set, others should be null
  if (!data.grapheneSample || data.grapheneSample === '') {
    data.grapheneSample = null;
  }
  if (!data.compoundBatchNumber || data.compoundBatchNumber === '') {
    data.compoundBatchNumber = null;
  }
  
  // Handle file upload
  if (req.file) {
    data.conductivityReportPath = path.join('conductivity-reports', req.file.filename);
  }
  
  // Remove UI-only fields from data
  delete data.materialType;
  delete data.dateUnknown;
  delete data.conductivityReportFile;
  delete data.removeConductivityReport;
  delete data.replaceConductivityReport;
  
  // Remove id and timestamps if present
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  
  const conductivityRecord = await prisma.conductivityTest.create({
    data
  });
  
  // Trigger AI insights cache invalidation for new conductivity data
  AIInsightsService.onNewData('conductivity');
  
  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...conductivityRecord,
    conductivity1kN: conductivityRecord.conductivity1kN ? Number(conductivityRecord.conductivity1kN) : null,
    conductivity8kN: conductivityRecord.conductivity8kN ? Number(conductivityRecord.conductivity8kN) : null,
    conductivity12kN: conductivityRecord.conductivity12kN ? Number(conductivityRecord.conductivity12kN) : null,
    conductivity20kN: conductivityRecord.conductivity20kN ? Number(conductivityRecord.conductivity20kN) : null
  };
  
  res.status(201).json(processedRecord);
}));

router.put('/:id', upload.single('conductivityReport'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Get existing record for file operations
  const existingRecord = await prisma.conductivityTest.findUnique({
    where: { id }
  });
  
  if (!existingRecord) {
    res.status(404);
    throw new Error('Conductivity record not found');
  }
  
  const data = { ...req.body };
  const numericFields = ['conductivity1kN', 'conductivity8kN', 'conductivity12kN', 'conductivity20kN'];
  
  numericFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      const num = parseFloat(data[field]);
      if (!isNaN(num)) {
        data[field] = num;
      }
    } else {
      data[field] = null;
    }
  });
  
  if (data.testDate && data.testDate !== '') {
    data.testDate = new Date(data.testDate);
  } else {
    data.testDate = null;
  }
  
  // Handle material selection - only one should be set, others should be null
  if (!data.grapheneSample || data.grapheneSample === '') {
    data.grapheneSample = null;
  }
  if (!data.compoundBatchNumber || data.compoundBatchNumber === '') {
    data.compoundBatchNumber = null;
  }
  
  // Handle file operations
  if (data.removeConductivityReport === 'true') {
    // Remove existing file
    if (existingRecord.conductivityReportPath) {
      deleteFile(path.join(process.cwd(), 'uploads', existingRecord.conductivityReportPath));
    }
    data.conductivityReportPath = null;
  } else if (req.file) {
    // Replace existing file
    data.conductivityReportPath = replaceFile(existingRecord.conductivityReportPath, req.file);
  }
  
  // Remove UI-only fields from data
  delete data.materialType;
  delete data.dateUnknown;
  delete data.conductivityReportFile;
  delete data.removeConductivityReport;
  delete data.replaceConductivityReport;
  
  // Remove id and timestamps if present
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  
  const conductivityRecord = await prisma.conductivityTest.update({
    where: { id },
    data
  });
  
  // Trigger AI insights cache invalidation for updated conductivity data
  AIInsightsService.onNewData('conductivity');
  
  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...conductivityRecord,
    conductivity1kN: conductivityRecord.conductivity1kN ? Number(conductivityRecord.conductivity1kN) : null,
    conductivity8kN: conductivityRecord.conductivity8kN ? Number(conductivityRecord.conductivity8kN) : null,
    conductivity12kN: conductivityRecord.conductivity12kN ? Number(conductivityRecord.conductivity12kN) : null,
    conductivity20kN: conductivityRecord.conductivity20kN ? Number(conductivityRecord.conductivity20kN) : null
  };
  
  res.json(processedRecord);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Get existing record to delete associated file
  const existingRecord = await prisma.conductivityTest.findUnique({
    where: { id }
  });
  
  if (existingRecord && existingRecord.conductivityReportPath) {
    deleteFile(path.join(process.cwd(), 'uploads', existingRecord.conductivityReportPath));
  }
  
  await prisma.conductivityTest.delete({
    where: { id }
  });
  
  res.status(204).send();
}));

router.get('/export/csv', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  const conductivityRecords = await prisma.conductivityTest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { grapheneRef: true }
  });
  
  // Single header row: the Conductivity table's <thead> is flat — no colspan band
  // (client/src/js/components/tabs/TestResultsConductivityTab.js).
  //
  // `Compound Batch` is new: the table's sample cell renders
  // `grapheneSample || compoundBatchNumber` (TestResultsConductivityTab.js:76), so a
  // test run on a compound batch previously exported a blank sample.
  const headers = [
    'Test Date', 'Graphene Sample', 'Compound Batch', 'Name', 'Description',
    'Conductivity 1kN (S/cm²)', 'Conductivity 8kN (S/cm²)',
    'Conductivity 12kN (S/cm²)', 'Conductivity 20kN (S/cm²)',
    'Report', 'Comments', 'Created At', 'Updated At'
  ];

  const rows = conductivityRecords.map(c => [
    csvDateOnly(c.testDate),
    c.grapheneSample,
    c.compoundBatchNumber,
    c.name,
    c.description,
    c.conductivity1kN,
    c.conductivity8kN,
    c.conductivity12kN,
    c.conductivity20kN,
    c.conductivityReportPath ? 'Yes' : 'No',
    c.comments,
    c.createdAt,
    c.updatedAt
  ]);

  sendCsv(res, 'conductivity_export.csv', headers, rows);
}));

export default router;