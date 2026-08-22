import express from 'express';
import asyncHandler from 'express-async-handler';
import { csvDateOnly, sendCsv } from '../utils/csv.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for TEM report uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'tem-reports');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}_${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get all TEM records
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { sortBy = 'chronological', order = 'desc', search } = req.query;
  
  let where = {};
  if (search) {
    where = {
      OR: [
        { grapheneSample: { contains: search, mode: 'insensitive' } },
        { researchTeam: { contains: search, mode: 'insensitive' } },
        { testingLab: { contains: search, mode: 'insensitive' } },
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
  
  const temRecords = await prisma.tEMTest.findMany({
    where,
    orderBy
  });
  
  res.json(temRecords);
}));

// Get single TEM record
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  const temRecord = await prisma.tEMTest.findUnique({
    where: { id }
  });
  
  if (!temRecord) {
    res.status(404);
    throw new Error('TEM record not found');
  }
  
  res.json(temRecord);
}));

// Create new TEM record
router.post('/', upload.single('temReport'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  const data = { ...req.body };
  
  // Remove UI-only fields from data (handled separately)
  delete data.temReportFile;
  delete data.removeTEMReport;
  delete data.replaceTEMReport;
  delete data.dateUnknown;
  delete data.materialType;
  
  // Convert empty strings to null
  Object.keys(data).forEach(key => {
    if (data[key] === '') {
      data[key] = null;
    }
  });
  
  // Handle date field - treat as local date to avoid timezone issues
  if (data.testDate && data.testDate !== '') {
    // If it's a date-only string (YYYY-MM-DD), create local date
    if (data.testDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = data.testDate.split('-');
      data.testDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      data.testDate = new Date(data.testDate);
    }
  } else {
    data.testDate = null;
  }
  
  // Add file path if uploaded
  if (req.file) {
    data.temReportPath = `tem-reports/${req.file.filename}`;
  }
  
  const temRecord = await prisma.tEMTest.create({
    data
  });
  
  res.status(201).json(temRecord);
}));

// Update TEM record
router.put('/:id', upload.single('temReport'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Get existing record to handle file replacement
  const existingRecord = await prisma.tEMTest.findUnique({
    where: { id }
  });
  
  if (!existingRecord) {
    res.status(404);
    throw new Error('TEM record not found');
  }
  
  const data = { ...req.body };
  
  // Handle TEM report removal
  if (data.removeTEMReport === 'true' || data.removeTEMReport === true) {
    data.temReportPath = null;
    
    // Delete the file if it exists
    if (existingRecord.temReportPath) {
      const oldFilePath = path.join(process.cwd(), 'uploads', existingRecord.temReportPath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
  } else if (req.file) {
    // New file uploaded - replace old file
    if (existingRecord.temReportPath) {
      const oldFilePath = path.join(process.cwd(), 'uploads', existingRecord.temReportPath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    data.temReportPath = `tem-reports/${req.file.filename}`;
  }
  
  // Remove UI fields
  delete data.temReportFile;
  delete data.removeTEMReport;
  delete data.replaceTEMReport;
  delete data.dateUnknown;
  delete data.materialType;
  
  // Convert empty strings to null
  Object.keys(data).forEach(key => {
    if (data[key] === '') {
      data[key] = null;
    }
  });
  
  // Handle date field - treat as local date to avoid timezone issues
  if (data.testDate && data.testDate !== '') {
    // If it's a date-only string (YYYY-MM-DD), create local date
    if (data.testDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = data.testDate.split('-');
      data.testDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      data.testDate = new Date(data.testDate);
    }
  } else {
    data.testDate = null;
  }
  
  const temRecord = await prisma.tEMTest.update({
    where: { id },
    data
  });
  
  res.json(temRecord);
}));

// Delete TEM record
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Get record to delete associated file
  const existingRecord = await prisma.tEMTest.findUnique({
    where: { id }
  });
  
  if (existingRecord && existingRecord.temReportPath) {
    const filePath = path.join(process.cwd(), 'uploads', existingRecord.temReportPath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  
  await prisma.tEMTest.delete({
    where: { id }
  });
  
  res.status(204).send();
}));

// Export to CSV
router.get('/export/csv', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  const temRecords = await prisma.tEMTest.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  // Single header row: the TEM table's <thead> is flat — Test Date, Graphene Sample,
  // Testing Lab, PDF Report, Actions (TestResultsTEMTab.js). No grouping to mirror.
  //
  // Two columns are new, both visible on screen and previously absent:
  //  - `TEM Report`: the tab renders a View-PDF button whenever `temReportPath` is set
  //    (TestResultsTEMTab.js:83). Emitted as Yes/No, matching how every other export in
  //    this codebase reports a report's presence — the stored value is an internal path,
  //    not a URL anyone can open from a spreadsheet.
  //  - `Compound Batch`: the sample cell renders `grapheneSample || compoundBatchNumber`
  //    (TestResultsTEMTab.js:78), so a TEM run on a compound batch exported a blank.
  const headers = [
    'Test Date', 'Graphene Sample', 'Compound Batch', 'Research Team', 'Testing Lab',
    'TEM Report', 'Comments', 'Created At', 'Updated At'
  ];

  const rows = temRecords.map(record => [
    csvDateOnly(record.testDate),
    record.grapheneSample,
    record.compoundBatchNumber,
    record.researchTeam,
    record.testingLab,
    record.temReportPath ? 'Yes' : 'No',
    record.comments,
    record.createdAt,
    record.updatedAt
  ]);

  sendCsv(res, 'tem_export.csv', headers, rows);
}));

export default router;