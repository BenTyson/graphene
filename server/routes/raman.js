import express from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for RAMAN report uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'raman-reports');
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

// Get all RAMAN records
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
    // Sort by date first, then by creation time
    orderBy = [
      { testDate: order },
      { createdAt: order }
    ];
  } else {
    orderBy = { [sortBy]: order };
  }
  
  const ramanRecords = await prisma.ramanTest.findMany({
    where,
    orderBy,
    include: {
      grapheneRef: {
        select: { experimentNumber: true, species: true }
      }
    }
  });
  
  // Convert Decimal fields to numbers for frontend
  const processedRecords = ramanRecords.map(record => {
    const processed = { ...record };
    // Convert all Decimal fields to numbers
    const decimalFields = [
      'integrationRange2DLow', 'integrationRange2DHigh', 'integrationRangeGLow', 'integrationRangeGHigh',
      'integrationRangeDLow', 'integrationRangeDHigh', 'integrationRangeDGLow', 'integrationRangeDGHigh',
      'integralTypA2D1', 'integralTypA2D2', 'integralTypAG1', 'integralTypAG2',
      'integralTypAD1', 'integralTypAD2', 'integralTypADG1', 'integralTypADG2',
      'peakHighTypJ2D1', 'peakHighTypJ2D2', 'peakHighTypJG1', 'peakHighTypJG2',
      'peakHighTypJD1', 'peakHighTypJD2', 'peakHighTypJDG1', 'peakHighTypJDG2'
    ];
    
    decimalFields.forEach(field => {
      processed[field] = record[field] ? Number(record[field]) : null;
    });
    
    return processed;
  });
  
  res.json(processedRecords);
}));

// Get single RAMAN record
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  const ramanRecord = await prisma.ramanTest.findUnique({
    where: { id },
    include: { grapheneRef: true }
  });
  
  if (!ramanRecord) {
    res.status(404);
    throw new Error('RAMAN record not found');
  }
  
  // Convert Decimal fields to numbers for frontend
  const processedRecord = { ...ramanRecord };
  const decimalFields = [
    'integrationRange2DLow', 'integrationRange2DHigh', 'integrationRangeGLow', 'integrationRangeGHigh',
    'integrationRangeDLow', 'integrationRangeDHigh', 'integrationRangeDGLow', 'integrationRangeDGHigh',
    'integralTypA2D1', 'integralTypA2D2', 'integralTypAG1', 'integralTypAG2',
    'integralTypAD1', 'integralTypAD2', 'integralTypADG1', 'integralTypADG2',
    'peakHighTypJ2D1', 'peakHighTypJ2D2', 'peakHighTypJG1', 'peakHighTypJG2',
    'peakHighTypJD1', 'peakHighTypJD2', 'peakHighTypJDG1', 'peakHighTypJDG2'
  ];
  
  decimalFields.forEach(field => {
    processedRecord[field] = ramanRecord[field] ? Number(ramanRecord[field]) : null;
  });
  
  res.json(processedRecord);
}));

// Create new RAMAN record
router.post('/', upload.single('ramanReport'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  // Debug: log the incoming data
  console.log('Incoming RAMAN data:', Object.keys(req.body));
  console.log('Full data:', req.body);
  
  // Convert numeric fields from strings to proper types
  const data = { ...req.body };
  const numericFields = [
    'integrationRange2DLow', 'integrationRange2DHigh', 'integrationRangeGLow', 'integrationRangeGHigh',
    'integrationRangeDLow', 'integrationRangeDHigh', 'integrationRangeDGLow', 'integrationRangeDGHigh',
    'integralTypA2D1', 'integralTypA2D2', 'integralTypAG1', 'integralTypAG2',
    'integralTypAD1', 'integralTypAD2', 'integralTypADG1', 'integralTypADG2',
    'peakHighTypJ2D1', 'peakHighTypJ2D2', 'peakHighTypJG1', 'peakHighTypJG2',
    'peakHighTypJD1', 'peakHighTypJD2', 'peakHighTypJDG1', 'peakHighTypJDG2'
  ];
  
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
  
  // Handle RAMAN report file upload
  if (req.file) {
    data.ramanReportPath = path.join('raman-reports', req.file.filename);
  }
  
  // Remove UI-only fields from data
  delete data.ramanReportFile;
  delete data.removeRamanReport;
  delete data.replaceRamanReport;
  delete data.grapheneRef;
  delete data.dateUnknown;
  
  // Remove id and timestamps if present
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  
  console.log('Final data being sent to Prisma:', data);
  console.log('Data keys after cleanup:', Object.keys(data));
  
  const ramanRecord = await prisma.ramanTest.create({
    data
  });
  
  // Convert Decimal fields to numbers for frontend
  const processedRecord = { ...ramanRecord };
  const decimalFields = [
    'integrationRange2DLow', 'integrationRange2DHigh', 'integrationRangeGLow', 'integrationRangeGHigh',
    'integrationRangeDLow', 'integrationRangeDHigh', 'integrationRangeDGLow', 'integrationRangeDGHigh',
    'integralTypA2D1', 'integralTypA2D2', 'integralTypAG1', 'integralTypAG2',
    'integralTypAD1', 'integralTypAD2', 'integralTypADG1', 'integralTypADG2',
    'peakHighTypJ2D1', 'peakHighTypJ2D2', 'peakHighTypJG1', 'peakHighTypJG2',
    'peakHighTypJD1', 'peakHighTypJD2', 'peakHighTypJDG1', 'peakHighTypJDG2'
  ];
  
  decimalFields.forEach(field => {
    processedRecord[field] = ramanRecord[field] ? Number(ramanRecord[field]) : null;
  });
  
  res.status(201).json(processedRecord);
}));

// Update RAMAN record
router.put('/:id', upload.single('ramanReport'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Convert numeric fields from strings to proper types
  const data = { ...req.body };
  const numericFields = [
    'integrationRange2DLow', 'integrationRange2DHigh', 'integrationRangeGLow', 'integrationRangeGHigh',
    'integrationRangeDLow', 'integrationRangeDHigh', 'integrationRangeDGLow', 'integrationRangeDGHigh',
    'integralTypA2D1', 'integralTypA2D2', 'integralTypAG1', 'integralTypAG2',
    'integralTypAD1', 'integralTypAD2', 'integralTypADG1', 'integralTypADG2',
    'peakHighTypJ2D1', 'peakHighTypJ2D2', 'peakHighTypJG1', 'peakHighTypJG2',
    'peakHighTypJD1', 'peakHighTypJD2', 'peakHighTypJDG1', 'peakHighTypJDG2'
  ];
  
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
  const existingRecord = await prisma.ramanTest.findUnique({
    where: { id }
  });
  
  if (!existingRecord) {
    res.status(404);
    throw new Error('RAMAN record not found');
  }
  
  // Handle RAMAN report file operations
  if (data.removeRamanReport === 'true') {
    // Remove existing file
    if (existingRecord.ramanReportPath) {
      const filePath = path.join(process.cwd(), 'uploads', existingRecord.ramanReportPath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    data.ramanReportPath = null;
  } else if (req.file) {
    // Replace existing file
    if (existingRecord.ramanReportPath) {
      const oldFilePath = path.join(process.cwd(), 'uploads', existingRecord.ramanReportPath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    data.ramanReportPath = path.join('raman-reports', req.file.filename);
  }
  
  // Remove UI-only fields and relational fields from data
  delete data.ramanReportFile;
  delete data.removeRamanReport;
  delete data.replaceRamanReport;
  delete data.grapheneRef;
  delete data.dateUnknown;
  
  // Remove id and timestamps if present
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  
  const ramanRecord = await prisma.ramanTest.update({
    where: { id },
    data
  });
  
  // Convert Decimal fields to numbers for frontend
  const processedRecord = { ...ramanRecord };
  const decimalFields = [
    'integrationRange2DLow', 'integrationRange2DHigh', 'integrationRangeGLow', 'integrationRangeGHigh',
    'integrationRangeDLow', 'integrationRangeDHigh', 'integrationRangeDGLow', 'integrationRangeDGHigh',
    'integralTypA2D1', 'integralTypA2D2', 'integralTypAG1', 'integralTypAG2',
    'integralTypAD1', 'integralTypAD2', 'integralTypADG1', 'integralTypADG2',
    'peakHighTypJ2D1', 'peakHighTypJ2D2', 'peakHighTypJG1', 'peakHighTypJG2',
    'peakHighTypJD1', 'peakHighTypJD2', 'peakHighTypJDG1', 'peakHighTypJDG2'
  ];
  
  decimalFields.forEach(field => {
    processedRecord[field] = ramanRecord[field] ? Number(ramanRecord[field]) : null;
  });
  
  res.json(processedRecord);
}));

// Delete RAMAN record
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Get existing record to delete associated file
  const existingRecord = await prisma.ramanTest.findUnique({
    where: { id }
  });
  
  if (existingRecord && existingRecord.ramanReportPath) {
    const filePath = path.join(process.cwd(), 'uploads', existingRecord.ramanReportPath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  
  await prisma.ramanTest.delete({
    where: { id }
  });
  
  res.status(204).send();
}));

// Export to CSV
router.get('/export/csv', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  const ramanRecords = await prisma.ramanTest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { grapheneRef: true }
  });
  
  const headers = [
    'Test Date', 'Graphene Sample', 'Research Team', 'Testing Lab',
    'Integration Range 2D', 'Integration Range G', 'Integration Range D', 'Integration Range D/G',
    'Integral Typ A 2D', 'Integral Typ A G', 'Integral Typ A D', 'Integral Typ A D/G',
    'Peak High Typ J 2D', 'Peak High Typ J G', 'Peak High Typ J D', 'Peak High Typ J D/G',
    'RAMAN Report', 'Comments', 'Created At'
  ];
  
  let csv = headers.join(',') + '\n';
  
  ramanRecords.forEach(r => {
    const row = [
      r.testDate ? r.testDate.toISOString().split('T')[0] : '',
      r.grapheneSample || '',
      r.researchTeam || '',
      r.testingLab || '',
      r.integrationRange2DLow && r.integrationRange2DHigh ? `${r.integrationRange2DLow}-${r.integrationRange2DHigh}` : '',
      r.integrationRangeGLow && r.integrationRangeGHigh ? `${r.integrationRangeGLow}-${r.integrationRangeGHigh}` : '',
      r.integrationRangeDLow && r.integrationRangeDHigh ? `${r.integrationRangeDLow}-${r.integrationRangeDHigh}` : '',
      r.integrationRangeDGLow && r.integrationRangeDGHigh ? `${r.integrationRangeDGLow}-${r.integrationRangeDGHigh}` : '',
      r.integralTypA2D1 && r.integralTypA2D2 ? `${r.integralTypA2D1},${r.integralTypA2D2}` : '',
      r.integralTypAG1 && r.integralTypAG2 ? `${r.integralTypAG1},${r.integralTypAG2}` : '',
      r.integralTypAD1 && r.integralTypAD2 ? `${r.integralTypAD1},${r.integralTypAD2}` : '',
      r.integralTypADG1 && r.integralTypADG2 ? `${r.integralTypADG1},${r.integralTypADG2}` : '',
      r.peakHighTypJ2D1 && r.peakHighTypJ2D2 ? `${r.peakHighTypJ2D1},${r.peakHighTypJ2D2}` : '',
      r.peakHighTypJG1 && r.peakHighTypJG2 ? `${r.peakHighTypJG1},${r.peakHighTypJG2}` : '',
      r.peakHighTypJD1 && r.peakHighTypJD2 ? `${r.peakHighTypJD1},${r.peakHighTypJD2}` : '',
      r.peakHighTypJDG1 && r.peakHighTypJDG2 ? `${r.peakHighTypJDG1},${r.peakHighTypJDG2}` : '',
      r.ramanReportPath ? 'Yes' : 'No',
      `"${(r.comments || '').replace(/"/g, '""')}"`,
      r.createdAt.toISOString()
    ];
    csv += row.join(',') + '\n';
  });
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="raman_export.csv"');
  res.send(csv);
}));

export default router;