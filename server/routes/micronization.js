import express from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for micronization report uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'micronization-reports');
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

// Convert numeric fields from strings to proper types
function convertNumericFields(data) {
  const numericFields = ['startingMaterialAmount', 'recoveredAmount'];
  const integerFields = ['grindPressure'];
  
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

  integerFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      const num = parseInt(data[field]);
      if (!isNaN(num)) {
        data[field] = num;
      }
    } else {
      data[field] = null;
    }
  });
  
  return data;
}

// Get all micronization records
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { search = '' } = req.query;
  
  let where = {};
  if (search) {
    where = {
      OR: [
        { micronizationNumber: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { grapheneSample: { contains: search, mode: 'insensitive' } },
        { compoundBatchNumber: { contains: search, mode: 'insensitive' } }
      ]
    };
  }
  
  const micronizations = await prisma.micronization.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      grapheneRef: {
        select: {
          experimentNumber: true,
          species: true,
          output: true
        }
      },
      compoundBatchRef: {
        select: {
          batchNumber: true,
          batchName: true,
          totalOutput: true
        }
      },
      shipments: {
        select: {
          id: true,
          shipmentNumber: true,
          amountShipped: true
        }
      }
    }
  });

  // Convert Decimal fields to numbers for frontend
  const processedRecords = micronizations.map(record => ({
    ...record,
    startingMaterialAmount: record.startingMaterialAmount ? Number(record.startingMaterialAmount) : null,
    recoveredAmount: record.recoveredAmount ? Number(record.recoveredAmount) : null,
    // Calculate shipped amount and available amount
    totalShipped: record.shipments?.reduce((sum, shipment) => 
      sum + (shipment.amountShipped ? Number(shipment.amountShipped) : 0), 0) || 0,
    availableAmount: record.recoveredAmount ? 
      Number(record.recoveredAmount) - (record.shipments?.reduce((sum, shipment) => 
        sum + (shipment.amountShipped ? Number(shipment.amountShipped) : 0), 0) || 0) : null
  }));

  res.json(processedRecords);
}));

// Get single micronization record
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  const micronization = await prisma.micronization.findUnique({
    where: { id },
    include: {
      grapheneRef: true,
      compoundBatchRef: true,
      shipments: true
    }
  });
  
  if (!micronization) {
    res.status(404);
    throw new Error('Micronization record not found');
  }
  
  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...micronization,
    startingMaterialAmount: micronization.startingMaterialAmount ? Number(micronization.startingMaterialAmount) : null,
    recoveredAmount: micronization.recoveredAmount ? Number(micronization.recoveredAmount) : null
  };
  
  res.json(processedRecord);
}));

// Create new micronization record
router.post('/', upload.single('micronizationReport'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  // Convert numeric fields from strings to proper types
  const data = convertNumericFields({ ...req.body });
  
  // Handle date field
  if (data.date && data.date !== '') {
    data.date = new Date(data.date);
  } else {
    data.date = null;
  }
  
  // Handle micronization report file upload
  if (req.file) {
    data.micronizationReportPath = path.join('micronization-reports', req.file.filename);
  }
  
  // Remove UI-only fields from data
  delete data.micronizationReportFile;
  delete data.removeMicronizationReport;
  delete data.replaceMicronizationReport;
  delete data.materialType;
  delete data.grapheneRef;
  delete data.compoundBatchRef;
  delete data.dateUnknown;
  
  // Remove id and timestamps if present
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  
  const micronization = await prisma.micronization.create({
    data,
    include: {
      grapheneRef: {
        select: {
          experimentNumber: true,
          species: true,
          output: true
        }
      },
      compoundBatchRef: {
        select: {
          batchNumber: true,
          batchName: true,
          totalOutput: true
        }
      },
      shipments: true
    }
  });
  
  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...micronization,
    startingMaterialAmount: micronization.startingMaterialAmount ? Number(micronization.startingMaterialAmount) : null,
    recoveredAmount: micronization.recoveredAmount ? Number(micronization.recoveredAmount) : null
  };
  
  res.status(201).json(processedRecord);
}));

// Update micronization record
router.put('/:id', upload.single('micronizationReport'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Convert numeric fields from strings to proper types
  const data = convertNumericFields({ ...req.body });
  
  // Handle date field
  if (data.date && data.date !== '') {
    data.date = new Date(data.date);
  } else {
    data.date = null;
  }
  
  // Get existing record to handle file operations
  const existingRecord = await prisma.micronization.findUnique({
    where: { id }
  });
  
  if (!existingRecord) {
    res.status(404);
    throw new Error('Micronization record not found');
  }
  
  // Handle micronization report file operations
  if (data.removeMicronizationReport === 'true') {
    // Remove existing file
    if (existingRecord.micronizationReportPath) {
      const filePath = path.join(process.cwd(), 'uploads', existingRecord.micronizationReportPath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    data.micronizationReportPath = null;
  } else if (req.file) {
    // Replace existing file
    if (existingRecord.micronizationReportPath) {
      const oldFilePath = path.join(process.cwd(), 'uploads', existingRecord.micronizationReportPath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    data.micronizationReportPath = path.join('micronization-reports', req.file.filename);
  }
  
  // Remove UI-only fields and relational fields from data
  delete data.micronizationReportFile;
  delete data.removeMicronizationReport;
  delete data.replaceMicronizationReport;
  delete data.materialType;
  delete data.grapheneRef;
  delete data.compoundBatchRef;
  delete data.dateUnknown;
  
  // Remove id and timestamps if present
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  
  const micronization = await prisma.micronization.update({
    where: { id },
    data,
    include: {
      grapheneRef: {
        select: {
          experimentNumber: true,
          species: true,
          output: true
        }
      },
      compoundBatchRef: {
        select: {
          batchNumber: true,
          batchName: true,
          totalOutput: true
        }
      },
      shipments: true
    }
  });
  
  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...micronization,
    startingMaterialAmount: micronization.startingMaterialAmount ? Number(micronization.startingMaterialAmount) : null,
    recoveredAmount: micronization.recoveredAmount ? Number(micronization.recoveredAmount) : null
  };
  
  res.json(processedRecord);
}));

// Delete micronization record
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Get existing record to delete associated file
  const existingRecord = await prisma.micronization.findUnique({
    where: { id }
  });
  
  if (existingRecord && existingRecord.micronizationReportPath) {
    const filePath = path.join(process.cwd(), 'uploads', existingRecord.micronizationReportPath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  
  await prisma.micronization.delete({
    where: { id }
  });
  
  res.status(204).send();
}));

// Export to CSV
router.get('/export/csv', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  const micronizations = await prisma.micronization.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      grapheneRef: true,
      compoundBatchRef: true
    }
  });
  
  const headers = [
    'Micronization #', 'Date', 'Material Source', 'SKU', 'Starting Amount (g)', 
    'Recovered Amount (g)', 'Recovery %', 'Grind Pressure (psi)', 'Report', 'Created At'
  ];
  
  let csv = headers.join(',') + '\n';
  
  micronizations.forEach(m => {
    const materialSource = m.grapheneSample || m.compoundBatchNumber || '';
    const recoveryPercent = (m.startingMaterialAmount && m.recoveredAmount) ? 
      ((Number(m.recoveredAmount) / Number(m.startingMaterialAmount)) * 100).toFixed(1) : '';
    
    const row = [
      m.micronizationNumber || '',
      m.date ? m.date.toISOString().split('T')[0] : '',
      materialSource,
      m.sku || '',
      m.startingMaterialAmount || '',
      m.recoveredAmount || '',
      recoveryPercent,
      m.grindPressure || '',
      m.micronizationReportPath ? 'Yes' : 'No',
      m.createdAt.toISOString()
    ];
    csv += row.join(',') + '\n';
  });
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="micronization_export.csv"');
  res.send(csv);
}));

// Get micronizations for specific graphene experiment
router.get('/graphene/:experimentNumber', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { experimentNumber } = req.params;
  
  const micronizations = await prisma.micronization.findMany({
    where: { grapheneSample: experimentNumber },
    orderBy: { createdAt: 'desc' },
    include: {
      shipments: true
    }
  });

  // Convert Decimal fields to numbers for frontend
  const processedRecords = micronizations.map(record => ({
    ...record,
    startingMaterialAmount: record.startingMaterialAmount ? Number(record.startingMaterialAmount) : null,
    recoveredAmount: record.recoveredAmount ? Number(record.recoveredAmount) : null
  }));
  
  res.json(processedRecords);
}));

// Get micronizations for specific compound batch
router.get('/compound-batch/:batchNumber', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { batchNumber } = req.params;
  
  const micronizations = await prisma.micronization.findMany({
    where: { compoundBatchNumber: batchNumber },
    orderBy: { createdAt: 'desc' },
    include: {
      shipments: true
    }
  });

  // Convert Decimal fields to numbers for frontend
  const processedRecords = micronizations.map(record => ({
    ...record,
    startingMaterialAmount: record.startingMaterialAmount ? Number(record.startingMaterialAmount) : null,
    recoveredAmount: record.recoveredAmount ? Number(record.recoveredAmount) : null
  }));
  
  res.json(processedRecords);
}));

export default router;