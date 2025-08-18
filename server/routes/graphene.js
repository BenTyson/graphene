import express from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'sem-reports');
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

// Get all graphene records
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { sortBy = 'chronological', order = 'desc', search, biocharExperiment } = req.query;
  
  let where = {};
  
  if (biocharExperiment) {
    where.biocharExperiment = biocharExperiment;
  }
  
  if (search) {
    where = {
      ...where,
      OR: [
        { experimentNumber: { contains: search, mode: 'insensitive' } },
        { biocharExperiment: { contains: search, mode: 'insensitive' } },
        { oven: { contains: search, mode: 'insensitive' } },
        { species: { contains: search, mode: 'insensitive' } },
        { comments: { contains: search, mode: 'insensitive' } }
      ]
    };
  }
  
  let orderBy;
  if (sortBy === 'chronological') {
    // Sort by test order first, then by date, then by creation time
    orderBy = [
      { testOrder: order },
      { experimentDate: order },
      { createdAt: order }
    ];
  } else {
    orderBy = { [sortBy]: order };
  }
  
  const graphenes = await prisma.graphene.findMany({
    where,
    orderBy,
    include: { biocharLot: true }
  });
  
  res.json(graphenes);
}));

// Get single graphene record
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  const graphene = await prisma.graphene.findUnique({
    where: { id },
    include: { biocharLot: true }
  });
  
  if (!graphene) {
    res.status(404);
    throw new Error('Graphene record not found');
  }
  
  res.json(graphene);
}));

// Get graphene records by biochar experiment
router.get('/by-biochar/:biocharExperiment', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { biocharExperiment } = req.params;
  
  const graphenes = await prisma.graphene.findMany({
    where: { biocharExperiment },
    orderBy: { createdAt: 'desc' },
    include: { biocharLot: true }
  });
  
  res.json(graphenes);
}));

// Get related data for a graphene experiment - MUST BE BEFORE /:id route
router.get('/:experimentNumber/related', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { experimentNumber } = req.params;
  
  // Get the graphene record to find its biochar reference
  const graphene = await prisma.graphene.findUnique({
    where: { experimentNumber },
    include: { biocharLot: true }
  });
  
  if (!graphene) {
    res.status(404);
    throw new Error('Graphene record not found');
  }
  
  // Get source biochar data
  let sourceBiochar = null;
  let lotBiocharExperiments = [];
  
  if (graphene.biocharExperiment) {
    // Direct biochar reference
    sourceBiochar = await prisma.biochar.findUnique({
      where: { experimentNumber: graphene.biocharExperiment }
    });
  } else if (graphene.biocharLotNumber) {
    // Lot reference - get all biochar experiments in the lot
    lotBiocharExperiments = await prisma.biochar.findMany({
      where: { lotNumber: graphene.biocharLotNumber },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  // Get BET tests for this graphene
  const betTests = await prisma.bET.findMany({
    where: { grapheneSample: experimentNumber },
    orderBy: { createdAt: 'desc' }
  });
  
  res.json({
    sourceBiochar,
    lotBiocharExperiments,
    betTests,
    lotInfo: graphene.biocharLot
  });
}));

// Create new graphene record with optional SEM file
router.post('/', upload.single('semReport'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  // If file was uploaded, add the path to the data
  const data = { ...req.body };
  if (req.file) {
    data.semReportPath = `/uploads/sem-reports/${req.file.filename}`;
  }
  
  // Handle appearanceTags array from FormData
  if (data.appearanceTags && typeof data.appearanceTags === 'string') {
    try {
      data.appearanceTags = JSON.parse(data.appearanceTags);
    } catch (e) {
      data.appearanceTags = [];
    }
  }
  
  const graphene = await prisma.graphene.create({
    data
  });
  
  res.status(201).json(graphene);
}));

// Update graphene record with optional SEM file
router.put('/:id', upload.single('semReport'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Get existing record to handle file replacement
  const existingRecord = await prisma.graphene.findUnique({
    where: { id }
  });
  
  if (!existingRecord) {
    res.status(404);
    throw new Error('Graphene record not found');
  }
  
  // If new file was uploaded, add the path to the data and delete old file
  const data = { ...req.body };
  if (req.file) {
    data.semReportPath = `/uploads/sem-reports/${req.file.filename}`;
    
    // Delete old file if it exists
    if (existingRecord.semReportPath) {
      const oldFilePath = path.join(process.cwd(), existingRecord.semReportPath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
  }
  
  // Handle appearanceTags array from FormData
  if (data.appearanceTags && typeof data.appearanceTags === 'string') {
    try {
      data.appearanceTags = JSON.parse(data.appearanceTags);
    } catch (e) {
      data.appearanceTags = [];
    }
  }
  
  const graphene = await prisma.graphene.update({
    where: { id },
    data
  });
  
  res.json(graphene);
}));

// Delete graphene record
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Get record to delete associated file
  const existingRecord = await prisma.graphene.findUnique({
    where: { id }
  });
  
  if (existingRecord && existingRecord.semReportPath) {
    const filePath = path.join(process.cwd(), existingRecord.semReportPath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  
  await prisma.graphene.delete({
    where: { id }
  });
  
  res.status(204).send();
}));

// Export to CSV
router.get('/export/csv', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  const graphenes = await prisma.graphene.findMany({
    orderBy: { createdAt: 'desc' },
    include: { biocharLot: true }
  });
  
  const headers = [
    'Experiment #', 'Oven', 'Quantity (g)', 'Biochar Experiment', 'Base Amount (g)',
    'Base Type', 'Base Concentration (%)', 'Grinding Method', 'Grinding Time (min)', 'Homogeneous',
    'Gas', 'Temp Rate', 'Temp Max (°C)', 'Time (min)', 'Wash Amount (g)',
    'Wash Solution', 'Wash Concentration (%)', 'Wash Water', 'Drying Temp (°C)', 'Drying Atmosphere', 'Drying Pressure',
    'Volume (ml)', 'Density (ml/g)', 'Species', 'Appearance Tags', 'Output (g)', 'Comments', 'Created At'
  ];
  
  let csv = headers.join(',') + '\n';
  
  graphenes.forEach(g => {
    const row = [
      g.experimentNumber,
      g.oven || '',
      g.quantity || '',
      g.biocharExperiment || '',
      g.baseAmount || '',
      g.baseType || '',
      g.baseConcentration || '',
      g.grindingMethod || '',
      g.grindingTime || '',
      g.homogeneous !== null ? (g.homogeneous ? 'Yes' : 'No') : '',
      g.gas || '',
      `"${(g.tempRate || '').replace(/"/g, '""')}"`,
      g.tempMax || '',
      g.time || '',
      g.washAmount || '',
      `"${(g.washSolution || '').replace(/"/g, '""')}"`,
      g.washConcentration || '',
      `"${(g.washWater || '').replace(/"/g, '""')}"`,
      g.dryingTemp || '',
      `"${(g.dryingAtmosphere || '').replace(/"/g, '""')}"`,
      `"${(g.dryingPressure || '').replace(/"/g, '""')}"`,
      g.volumeMl || '',
      g.density || '',
      g.species || '',
      `"${(g.appearanceTags || []).join(', ')}"`,
      g.output || '',
      `"${(g.comments || '').replace(/"/g, '""')}"`,
      g.createdAt.toISOString()
    ];
    csv += row.join(',') + '\n';
  });
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="graphene_export.csv"');
  res.send(csv);
}));

export default router;