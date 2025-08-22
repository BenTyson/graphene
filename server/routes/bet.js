import express from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for BET report uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'bet-reports');
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

// Get all BET records
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { sortBy = 'chronological', order = 'desc', search } = req.query;
  
  let where = {};
  if (search) {
    where = {
      OR: [
        { grapheneSample: { contains: search, mode: 'insensitive' } },
        { species: { contains: search, mode: 'insensitive' } },
        { comments: { contains: search, mode: 'insensitive' } }
      ]
    };
  }
  
  let orderBy;
  if (sortBy === 'chronological') {
    // Sort by date first, then by creation time
    orderBy = [
      { testDate: order },
      { createdAt: order }
    ];
  } else {
    orderBy = { [sortBy]: order };
  }
  
  const betRecords = await prisma.bET.findMany({
    where,
    orderBy,
    include: {
      grapheneRef: {
        select: { experimentNumber: true, species: true }
      }
    }
  });
  
  // Convert Decimal fields to numbers for frontend
  const processedRecords = betRecords.map(record => ({
    ...record,
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
    multipointBetArea: betRecord.multipointBetArea ? Number(betRecord.multipointBetArea) : null,
    langmuirSurfaceArea: betRecord.langmuirSurfaceArea ? Number(betRecord.langmuirSurfaceArea) : null
  };
  
  res.json(processedRecord);
}));

// Create new BET record
router.post('/', upload.single('betReport'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  // Convert numeric fields from strings to proper types
  const data = { ...req.body };
  const numericFields = ['multipointBetArea', 'langmuirSurfaceArea'];
  
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
  
  // Handle date field
  if (data.testDate && data.testDate !== '') {
    data.testDate = new Date(data.testDate);
  } else {
    data.testDate = null;
  }
  
  // Handle BET report file upload
  if (req.file) {
    data.betReportPath = path.join('bet-reports', req.file.filename);
  }
  
  // Remove UI-only fields from data
  delete data.betReportFile;
  delete data.removeBetReport;
  delete data.replaceBetReport;
  delete data.grapheneRef;
  
  // Remove id and timestamps if present
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  
  const betRecord = await prisma.bET.create({
    data
  });
  
  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...betRecord,
    multipointBetArea: betRecord.multipointBetArea ? Number(betRecord.multipointBetArea) : null,
    langmuirSurfaceArea: betRecord.langmuirSurfaceArea ? Number(betRecord.langmuirSurfaceArea) : null
  };
  
  res.status(201).json(processedRecord);
}));

// Update BET record
router.put('/:id', upload.single('betReport'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Convert numeric fields from strings to proper types
  const data = { ...req.body };
  const numericFields = ['multipointBetArea', 'langmuirSurfaceArea'];
  
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
  
  // Handle date field
  if (data.testDate && data.testDate !== '') {
    data.testDate = new Date(data.testDate);
  } else {
    data.testDate = null;
  }
  
  // Get existing record to handle file operations
  const existingRecord = await prisma.bET.findUnique({
    where: { id }
  });
  
  if (!existingRecord) {
    res.status(404);
    throw new Error('BET record not found');
  }
  
  // Handle BET report file operations
  if (data.removeBetReport === 'true') {
    // Remove existing file
    if (existingRecord.betReportPath) {
      const filePath = path.join(process.cwd(), 'uploads', existingRecord.betReportPath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    data.betReportPath = null;
  } else if (req.file) {
    // Replace existing file
    if (existingRecord.betReportPath) {
      const oldFilePath = path.join(process.cwd(), 'uploads', existingRecord.betReportPath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    data.betReportPath = path.join('bet-reports', req.file.filename);
  }
  
  // Remove UI-only fields and relational fields from data
  delete data.betReportFile;
  delete data.removeBetReport;
  delete data.replaceBetReport;
  delete data.grapheneRef; // Remove any relational data
  
  // Remove id and timestamps if present (Prisma handles these automatically)
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
    const filePath = path.join(process.cwd(), 'uploads', existingRecord.betReportPath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
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
    'Test Date', 'Graphene Sample', 'Research Team', 'Testing Lab',
    'Multipoint BET Area (m²/g)', 'Langmuir Surface Area (m²/g)', 
    'Species', 'BET Report', 'Comments', 'Created At'
  ];
  
  let csv = headers.join(',') + '\n';
  
  betRecords.forEach(b => {
    const row = [
      b.testDate ? b.testDate.toISOString().split('T')[0] : '',
      b.grapheneSample || '',
      b.researchTeam || '',
      b.testingLab || '',
      b.multipointBetArea || '',
      b.langmuirSurfaceArea || '',
      b.species || '',
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