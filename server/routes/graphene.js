import express from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { buildQueryOptions, buildResponseMeta, formatResponse } from '../utils/queryHelpers.js';
import { buildFilterWhere, buildFilterAwareOrderBy, getFilterOptions } from '../utils/filterQueryBuilder.js';
import { getFilterConfig } from '../utils/filterConfig.js';

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

// Get all graphene records with advanced filtering
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const tableName = 'graphene';
  
  try {
    // Parse request parameters using the new query helpers
    const queryOptions = buildQueryOptions(req, tableName);
    const { filters, search, pagination, sort } = queryOptions;
    
    // Build enhanced where clause using the filter system
    const where = buildFilterWhere(tableName, filters, search);
    
    // Build enhanced order by clause
    const sortMappings = {
      chronological: 'experimentDate'
    };
    const orderBy = buildFilterAwareOrderBy(sort.sortBy, sort.order, sortMappings);
    
    // Get total count before filtering for metadata
    const totalCount = await prisma.graphene.count();
    
    // Get filtered count
    const filteredCount = await prisma.graphene.count({ where });
    
    // Build pagination options
    const paginationOptions = pagination.page ? {
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit
    } : {};
    
    // Execute main query with filtering
    const graphenes = await prisma.graphene.findMany({
      where,
      orderBy,
      ...paginationOptions,
      include: { 
        biocharLotRef: true,
        updateReports: {
          include: {
            updateReport: true
          }
        },
        semReports: {
          include: {
            semReport: true
          }
        }
      }
    });
    
    // Convert dates to date-only strings to avoid timezone issues
    const graphenesWithFixedDates = graphenes.map(g => ({
      ...g,
      experimentDate: g.experimentDate ? g.experimentDate.toISOString().split('T')[0] : null
    }));
    
    // Build response metadata
    const meta = buildResponseMeta(totalCount, filteredCount, pagination, filters);
    
    // Return formatted response with metadata
    res.json(formatResponse(graphenesWithFixedDates, meta));
    
  } catch (error) {
    console.error('Error in graphene filtering:', error);
    res.status(500).json({ error: 'Failed to retrieve graphene records', details: error.message });
  }
}));

// Get single graphene record
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  const graphene = await prisma.graphene.findUnique({
    where: { id },
    include: { 
      biocharLotRef: true,
      updateReports: {
        include: {
          updateReport: true
        }
      },
      semReports: {
        include: {
          semReport: true
        }
      }
    }
  });
  
  if (!graphene) {
    res.status(404);
    throw new Error('Graphene record not found');
  }
  
  // Convert date to date-only string to avoid timezone issues
  const grapheneWithFixedDate = {
    ...graphene,
    experimentDate: graphene.experimentDate ? graphene.experimentDate.toISOString().split('T')[0] : null
  };
  
  res.json(grapheneWithFixedDate);
}));

// Get graphene records by biochar experiment
router.get('/by-biochar/:biocharExperiment', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { biocharExperiment } = req.params;
  
  const graphenes = await prisma.graphene.findMany({
    where: { biocharExperiment },
    orderBy: { createdAt: 'desc' },
    include: { 
      biocharLotRef: true,
      updateReports: {
        include: {
          updateReport: true
        }
      },
      semReports: {
        include: {
          semReport: true
        }
      }
    }
  });
  
  // Convert dates to date-only strings to avoid timezone issues
  const graphenesWithFixedDates = graphenes.map(g => ({
    ...g,
    experimentDate: g.experimentDate ? g.experimentDate.toISOString().split('T')[0] : null
  }));
  
  res.json(graphenesWithFixedDates);
}));

// Get related data for a graphene experiment - MUST BE BEFORE /:id route
router.get('/:experimentNumber/related', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { experimentNumber } = req.params;
  
  // Get the graphene record to find its biochar reference
  const graphene = await prisma.graphene.findUnique({
    where: { experimentNumber },
    include: { 
      biocharLotRef: true,
      updateReports: {
        include: {
          updateReport: true
        }
      },
      semReports: {
        include: {
          semReport: true
        }
      }
    }
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

  // Get RAMAN tests for this graphene
  const ramanTests = await prisma.ramanTest.findMany({
    where: { grapheneSample: experimentNumber },
    orderBy: { createdAt: 'desc' }
  });

  // Get conductivity tests for this graphene
  const conductivityTests = await prisma.conductivityTest.findMany({
    where: { grapheneSample: experimentNumber },
    orderBy: { createdAt: 'desc' }
  });

  // Get shipments for this graphene
  const shipments = await prisma.materialShipment.findMany({
    where: { grapheneSample: experimentNumber },
    orderBy: { createdAt: 'desc' }
  });

  // Get compound batches that include this graphene experiment
  const compoundBatches = await prisma.grapheneCompoundBatch.findMany({
    where: { grapheneId: graphene.id },
    include: {
      compoundBatch: {
        include: {
          experiments: {
            include: {
              graphene: {
                select: {
                  experimentNumber: true,
                  output: true
                }
              }
            }
          },
          betTests: true,
          conductivityTests: true,
          ramanTests: true,
          temTests: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Process decimal fields for frontend display
  const processedBetTests = betTests.map(record => ({
    ...record,
    mass: record.mass ? Number(record.mass) : null,
    multipointBetArea: record.multipointBetArea ? Number(record.multipointBetArea) : null,
    langmuirSurfaceArea: record.langmuirSurfaceArea ? Number(record.langmuirSurfaceArea) : null
  }));

  const processedConductivityTests = conductivityTests.map(record => ({
    ...record,
    conductivity1kN: record.conductivity1kN ? Number(record.conductivity1kN) : null,
    conductivity8kN: record.conductivity8kN ? Number(record.conductivity8kN) : null,
    conductivity12kN: record.conductivity12kN ? Number(record.conductivity12kN) : null,
    conductivity20kN: record.conductivity20kN ? Number(record.conductivity20kN) : null
  }));

  // Process compound batches to convert decimal fields
  const processedCompoundBatches = compoundBatches.map(cb => ({
    ...cb,
    compoundBatch: {
      ...cb.compoundBatch,
      totalOutput: cb.compoundBatch.totalOutput ? Number(cb.compoundBatch.totalOutput) : null,
      createdDate: cb.compoundBatch.createdDate ? cb.compoundBatch.createdDate.toISOString().split('T')[0] : null
    }
  }));
  
  res.json({
    sourceBiochar,
    lotBiocharExperiments,
    betTests: processedBetTests,
    ramanTests,
    conductivityTests: processedConductivityTests,
    compoundBatches: processedCompoundBatches,
    shipments,
    lotInfo: graphene.biocharLotRef
  });
}));

// Create new graphene record with optional SEM file
router.post('/', upload.single('semReport'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  // Prepare data (no longer setting semReportPath as we use SEM report associations)
  const data = { ...req.body };
  
  // Remove UI-only fields that don't exist in database schema
  delete data.biocharSource;
  delete data.dateUnknown;
  delete data.semReportFile;
  delete data.objectivePaste;
  delete data.removeSemReport;
  delete data.replaceSemReport;
  delete data.density; // Density is calculated, not stored
  delete data.semReports; // Relational field, not stored directly
  
  // Handle appearanceTags array from FormData
  if (data.appearanceTags && typeof data.appearanceTags === 'string') {
    try {
      data.appearanceTags = JSON.parse(data.appearanceTags);
    } catch (e) {
      data.appearanceTags = [];
    }
  }
  
  // Convert numeric fields from strings to proper types
  const numericFields = ['testOrder', 'quantity', 'baseAmount', 'baseConcentration', 
                        'base2Amount', 'base2Concentration', 'grindingCount', 'grindingTime', 'grindingFrequency',
                        'tempMax', 'time', 'washAmount', 'washConcentration', 'dryingTemp', 
                        'volumeMl', 'output'];
  
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
  
  // Handle boolean field
  if (data.homogeneous !== undefined && data.homogeneous !== null && data.homogeneous !== '') {
    data.homogeneous = data.homogeneous === 'true' || data.homogeneous === true;
  } else {
    data.homogeneous = null;
  }
  
  // Handle date field - treat as local date to avoid timezone issues
  if (data.experimentDate && data.experimentDate !== '') {
    // If it's a date-only string (YYYY-MM-DD), create local date
    if (data.experimentDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = data.experimentDate.split('-');
      data.experimentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      data.experimentDate = new Date(data.experimentDate);
    }
  } else {
    data.experimentDate = null;
  }
  
  // Handle reference fields - convert empty strings to null
  const referenceFields = ['biocharExperiment', 'biocharLotNumber'];
  referenceFields.forEach(field => {
    if (data[field] === '') {
      data[field] = null;
    }
  });
  
  // Extract update report IDs and remove from main data
  let updateReportIds = [];
  if (data.updateReportIds) {
    try {
      updateReportIds = JSON.parse(data.updateReportIds);
    } catch (e) {
      updateReportIds = Array.isArray(data.updateReportIds) ? data.updateReportIds : [];
    }
    delete data.updateReportIds;
  }
  
  const graphene = await prisma.graphene.create({
    data
  });
  
  // Create SEM report entry if file was uploaded directly
  if (req.file) {
    const semReportData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: `sem-reports/${req.file.filename}`,
      reportDate: data.experimentDate || new Date()
    };
    
    const semReport = await prisma.semReport.create({
      data: semReportData
    });
    
    // Create association between graphene and SEM report
    await prisma.grapheneSemReport.create({
      data: {
        grapheneId: graphene.id,
        semReportId: semReport.id
      }
    });
  }
  
  // Create update report associations if provided
  if (updateReportIds.length > 0) {
    const updateReportAssociations = updateReportIds.map(reportId => ({
      grapheneId: graphene.id,
      updateReportId: reportId
    }));
    
    await prisma.grapheneUpdateReport.createMany({
      data: updateReportAssociations,
      skipDuplicates: true
    });
  }
  
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
  
  // Handle SEM report removal
  if (data.removeSemReport === 'true' || data.removeSemReport === true) {
    data.semReportPath = null;
    
    // Delete the file if it exists
    if (existingRecord.semReportPath) {
      const oldFilePath = path.join(process.cwd(), existingRecord.semReportPath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
  } else if (req.file) {
    // New file uploaded - clear old semReportPath and delete old file
    data.semReportPath = null;
    if (existingRecord.semReportPath) {
      const oldFilePath = path.join(process.cwd(), existingRecord.semReportPath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
  }
  
  // Remove UI-only fields that don't exist in database schema
  delete data.biocharSource;
  delete data.dateUnknown;
  delete data.semReportFile;
  delete data.removeSemReport;
  delete data.replaceSemReport;
  delete data.objectivePaste;
  delete data.density; // Density is calculated, not stored
  delete data.semReports; // Relational field, not stored directly
  
  // Handle appearanceTags array from FormData
  if (data.appearanceTags && typeof data.appearanceTags === 'string') {
    try {
      data.appearanceTags = JSON.parse(data.appearanceTags);
    } catch (e) {
      data.appearanceTags = [];
    }
  }
  
  // Convert numeric fields from strings to proper types
  const numericFields = ['testOrder', 'quantity', 'baseAmount', 'baseConcentration', 
                        'base2Amount', 'base2Concentration', 'grindingCount', 'grindingTime', 'grindingFrequency',
                        'tempMax', 'time', 'washAmount', 'washConcentration', 'dryingTemp', 
                        'volumeMl', 'output'];
  
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
  
  // Handle boolean field
  if (data.homogeneous !== undefined && data.homogeneous !== null && data.homogeneous !== '') {
    data.homogeneous = data.homogeneous === 'true' || data.homogeneous === true;
  } else {
    data.homogeneous = null;
  }
  
  // Handle date field - treat as local date to avoid timezone issues
  if (data.experimentDate && data.experimentDate !== '') {
    // If it's a date-only string (YYYY-MM-DD), create local date
    if (data.experimentDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = data.experimentDate.split('-');
      data.experimentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      data.experimentDate = new Date(data.experimentDate);
    }
  } else {
    data.experimentDate = null;
  }
  
  // Handle reference fields - convert empty strings to null
  const referenceFields = ['biocharExperiment', 'biocharLotNumber'];
  referenceFields.forEach(field => {
    if (data[field] === '') {
      data[field] = null;
    }
  });
  
  // Extract update report IDs and remove from main data
  let updateReportIds = [];
  let hasUpdateReportIds = false;
  if (data.updateReportIds !== undefined) {
    hasUpdateReportIds = true;
    try {
      updateReportIds = JSON.parse(data.updateReportIds);
    } catch (e) {
      updateReportIds = Array.isArray(data.updateReportIds) ? data.updateReportIds : [];
    }
    delete data.updateReportIds;
  }
  
  const graphene = await prisma.graphene.update({
    where: { id },
    data
  });
  
  // Handle SEM report creation for direct uploads
  if (req.file && !data.removeSemReport) {
    const semReportData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: `sem-reports/${req.file.filename}`,
      reportDate: data.experimentDate || new Date()
    };
    
    const semReport = await prisma.semReport.create({
      data: semReportData
    });
    
    // Create association between graphene and SEM report
    await prisma.grapheneSemReport.create({
      data: {
        grapheneId: id,
        semReportId: semReport.id
      }
    });
  }
  
  // Update report associations if provided
  if (hasUpdateReportIds) {
    // Remove existing associations
    await prisma.grapheneUpdateReport.deleteMany({
      where: { grapheneId: id }
    });
    
    // Create new associations
    if (updateReportIds.length > 0) {
      const updateReportAssociations = updateReportIds.map(reportId => ({
        grapheneId: id,
        updateReportId: reportId
      }));
      
      await prisma.grapheneUpdateReport.createMany({
        data: updateReportAssociations,
        skipDuplicates: true
      });
    }
  }
  
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
    include: { biocharLotRef: true }
  });
  
  const headers = [
    'Experiment #', 'Title Note', 'Oven', 'Quantity (g)', 'Biochar Experiment', 'Base Amount (g)',
    'Base Type', 'Base Concentration (%)', 'Grinding Method', '# of Grinds', 'Grinding Time (min)', 'Grinding Frequency (Hz)', 'Homogeneous',
    'Gas', 'Temp Rate', 'Temp Max (°C)', 'Time (min)', 'Wash Amount (g)',
    'Wash Solution', 'Wash Concentration (%)', 'Wash Water', 'Drying Temp (°C)', 'Drying Atmosphere', 'Drying Pressure',
    'Volume (ml)', 'Density (ml/g)', 'Species', 'Appearance Tags', 'Output (g)', 'Comments', 'Created At'
  ];
  
  let csv = headers.join(',') + '\n';
  
  graphenes.forEach(g => {
    const row = [
      g.experimentNumber,
      g.titleNote || '',
      g.oven || '',
      g.quantity || '',
      g.biocharExperiment || '',
      g.baseAmount || '',
      g.baseType || '',
      g.baseConcentration || '',
      g.grindingMethod || '',
      g.grindingCount || '',
      g.grindingTime || '',
      g.grindingFrequency || '',
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
      (g.volumeMl && g.output) ? (g.volumeMl / g.output).toFixed(4) : '',
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

// Get filter configuration for graphene table
router.get('/filters/config', asyncHandler(async (req, res) => {
  try {
    const config = getFilterConfig('graphene');
    if (!config) {
      return res.status(404).json({ error: 'Filter configuration not found for graphene table' });
    }
    res.json(config);
  } catch (error) {
    console.error('Error getting filter config:', error);
    res.status(500).json({ error: 'Failed to get filter configuration', details: error.message });
  }
}));

// Get filter options for specific field
router.get('/filters/:filterField/options', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { filterField } = req.params;
  
  try {
    const options = await getFilterOptions(prisma, 'graphene', filterField);
    res.json(options);
  } catch (error) {
    console.error(`Error getting filter options for ${filterField}:`, error);
    res.status(500).json({ error: `Failed to get options for ${filterField}`, details: error.message });
  }
}));

export default router;