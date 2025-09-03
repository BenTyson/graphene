import express from 'express';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Get all compound batches
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { sortBy = 'chronological', order = 'desc', search } = req.query;
  
  let where = {};
  if (search) {
    where = {
      OR: [
        { batchNumber: { contains: search, mode: 'insensitive' } },
        { batchName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    };
  }
  
  let orderBy;
  if (sortBy === 'chronological') {
    orderBy = [
      { createdDate: order },
      { createdAt: order }
    ];
  } else {
    orderBy = { [sortBy]: order };
  }
  
  const compoundBatches = await prisma.compoundBatch.findMany({
    where,
    orderBy,
    include: {
      experiments: {
        include: {
          graphene: {
            select: {
              experimentNumber: true,
              output: true,
              experimentDate: true
            }
          }
        }
      }
    }
  });
  
  // Convert dates to date-only strings to avoid timezone issues
  const batchesWithFixedDates = compoundBatches.map(batch => ({
    ...batch,
    createdDate: batch.createdDate ? batch.createdDate.toISOString().split('T')[0] : null,
    totalOutput: batch.totalOutput ? Number(batch.totalOutput) : null
  }));
  
  res.json(batchesWithFixedDates);
}));

// Get related test data for a compound batch - MUST BE BEFORE /:id route
router.get('/:id/related', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Get the compound batch record
  const compoundBatch = await prisma.compoundBatch.findUnique({
    where: { id },
    include: {
      experiments: {
        include: {
          graphene: {
            select: {
              id: true,
              experimentNumber: true,
              experimentDate: true,
              species: true,
              output: true,
              biocharExperiment: true,
              biocharLotNumber: true
            }
          }
        }
      },
      semReports: {
        include: {
          semReport: true
        }
      }
    }
  });
  
  if (!compoundBatch) {
    res.status(404);
    throw new Error('Compound batch not found');
  }
  
  // Get BET tests for this compound batch
  const betTests = await prisma.bET.findMany({
    where: { compoundBatchNumber: compoundBatch.batchNumber },
    orderBy: { createdAt: 'desc' }
  });

  // Get RAMAN tests for this compound batch
  const ramanTests = await prisma.ramanTest.findMany({
    where: { compoundBatchNumber: compoundBatch.batchNumber },
    orderBy: { createdAt: 'desc' }
  });

  // Get conductivity tests for this compound batch
  const conductivityTests = await prisma.conductivityTest.findMany({
    where: { compoundBatchNumber: compoundBatch.batchNumber },
    orderBy: { createdAt: 'desc' }
  });

  // Get TEM tests for this compound batch
  const temTests = await prisma.tEMTest.findMany({
    where: { compoundBatchNumber: compoundBatch.batchNumber },
    orderBy: { createdAt: 'desc' }
  });

  // Get shipments for this compound batch
  const shipments = await prisma.materialShipment.findMany({
    where: { compoundBatchNumber: compoundBatch.batchNumber },
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
  
  res.json({
    compoundBatch: {
      ...compoundBatch,
      totalOutput: compoundBatch.totalOutput ? Number(compoundBatch.totalOutput) : null,
      createdDate: compoundBatch.createdDate ? compoundBatch.createdDate.toISOString().split('T')[0] : null
    },
    betTests: processedBetTests,
    ramanTests,
    conductivityTests: processedConductivityTests,
    temTests,
    shipments
  });
}));

// Get single compound batch
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  const compoundBatch = await prisma.compoundBatch.findUnique({
    where: { id },
    include: {
      experiments: {
        include: {
          graphene: {
            select: {
              experimentNumber: true,
              output: true,
              experimentDate: true,
              species: true,
              biocharExperiment: true
            }
          }
        }
      },
      betTests: true,
      conductivityTests: true,
      ramanTests: true,
      temTests: true
    }
  });
  
  if (!compoundBatch) {
    res.status(404);
    throw new Error('Compound batch not found');
  }
  
  // Convert date to date-only string to avoid timezone issues
  const batchWithFixedDate = {
    ...compoundBatch,
    createdDate: compoundBatch.createdDate ? compoundBatch.createdDate.toISOString().split('T')[0] : null,
    totalOutput: compoundBatch.totalOutput ? Number(compoundBatch.totalOutput) : null
  };
  
  res.json(batchWithFixedDate);
}));

// Get compound batch by batch number
router.get('/by-number/:batchNumber', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { batchNumber } = req.params;
  
  const compoundBatch = await prisma.compoundBatch.findUnique({
    where: { batchNumber },
    include: {
      experiments: {
        include: {
          graphene: {
            select: {
              experimentNumber: true,
              output: true,
              experimentDate: true,
              species: true,
              biocharExperiment: true
            }
          }
        }
      }
    }
  });
  
  if (!compoundBatch) {
    res.status(404);
    throw new Error('Compound batch not found');
  }
  
  res.json(compoundBatch);
}));

// Create new compound batch
router.post('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  const data = { ...req.body };
  
  // Extract experiment IDs and remove from main data
  let experimentIds = [];
  if (data.experimentIds) {
    try {
      experimentIds = JSON.parse(data.experimentIds);
    } catch (e) {
      experimentIds = Array.isArray(data.experimentIds) ? data.experimentIds : [];
    }
    delete data.experimentIds;
  }
  
  // Convert numeric fields from strings to proper types
  const numericFields = ['totalOutput'];
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
  
  // Handle date field - treat as local date to avoid timezone issues
  if (data.createdDate && data.createdDate !== '') {
    // If it's a date-only string (YYYY-MM-DD), create local date
    if (data.createdDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = data.createdDate.split('-');
      data.createdDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      data.createdDate = new Date(data.createdDate);
    }
  } else {
    data.createdDate = null;
  }
  
  // Convert empty strings to null
  Object.keys(data).forEach(key => {
    if (data[key] === '') {
      data[key] = null;
    }
  });
  
  const compoundBatch = await prisma.compoundBatch.create({
    data
  });
  
  // Create experiment associations if provided
  if (experimentIds.length > 0) {
    const experimentAssociations = experimentIds.map(grapheneId => ({
      grapheneId,
      compoundBatchId: compoundBatch.id
    }));
    
    await prisma.grapheneCompoundBatch.createMany({
      data: experimentAssociations,
      skipDuplicates: true
    });
  }
  
  res.status(201).json(compoundBatch);
}));

// Update compound batch
router.put('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  const data = { ...req.body };
  
  // Extract experiment IDs and remove from main data
  let experimentIds = [];
  let hasExperimentIds = false;
  if (data.experimentIds !== undefined) {
    hasExperimentIds = true;
    try {
      experimentIds = JSON.parse(data.experimentIds);
    } catch (e) {
      experimentIds = Array.isArray(data.experimentIds) ? data.experimentIds : [];
    }
    delete data.experimentIds;
  }
  
  // Convert numeric fields from strings to proper types
  const numericFields = ['totalOutput'];
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
  
  // Handle date field - treat as local date to avoid timezone issues
  if (data.createdDate && data.createdDate !== '') {
    // If it's a date-only string (YYYY-MM-DD), create local date
    if (data.createdDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = data.createdDate.split('-');
      data.createdDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      data.createdDate = new Date(data.createdDate);
    }
  } else {
    data.createdDate = null;
  }
  
  // Convert empty strings to null
  Object.keys(data).forEach(key => {
    if (data[key] === '') {
      data[key] = null;
    }
  });
  
  const compoundBatch = await prisma.compoundBatch.update({
    where: { id },
    data
  });
  
  // Update experiment associations if provided
  if (hasExperimentIds) {
    // Remove existing associations
    await prisma.grapheneCompoundBatch.deleteMany({
      where: { compoundBatchId: id }
    });
    
    // Create new associations
    if (experimentIds.length > 0) {
      const experimentAssociations = experimentIds.map(grapheneId => ({
        grapheneId,
        compoundBatchId: id
      }));
      
      await prisma.grapheneCompoundBatch.createMany({
        data: experimentAssociations,
        skipDuplicates: true
      });
    }
    
    // Recalculate total output based on associated experiments
    const associatedExperiments = await prisma.graphene.findMany({
      where: {
        id: { in: experimentIds }
      },
      select: {
        output: true
      }
    });
    
    const calculatedTotal = associatedExperiments.reduce((sum, exp) => {
      return sum + (parseFloat(exp.output || 0));
    }, 0);
    
    // Update the compound batch with the recalculated total
    const updatedBatch = await prisma.compoundBatch.update({
      where: { id },
      data: {
        totalOutput: calculatedTotal
      }
    });
    
    res.json(updatedBatch);
  } else {
    res.json(compoundBatch);
  }
}));

// Delete compound batch
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Note: GrapheneCompoundBatch associations will be deleted automatically due to onDelete: Cascade
  await prisma.compoundBatch.delete({
    where: { id }
  });
  
  res.status(204).send();
}));

// Add graphene experiment to compound batch
router.post('/:id/experiments/:grapheneId', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id, grapheneId } = req.params;
  
  // Check if association already exists
  const existing = await prisma.grapheneCompoundBatch.findFirst({
    where: {
      compoundBatchId: id,
      grapheneId: grapheneId
    }
  });
  
  if (existing) {
    res.status(409);
    throw new Error('Experiment already associated with this compound batch');
  }
  
  const association = await prisma.grapheneCompoundBatch.create({
    data: {
      compoundBatchId: id,
      grapheneId: grapheneId
    }
  });
  
  res.status(201).json(association);
}));

// Remove graphene experiment from compound batch
router.delete('/:id/experiments/:grapheneId', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id, grapheneId } = req.params;
  
  await prisma.grapheneCompoundBatch.deleteMany({
    where: {
      compoundBatchId: id,
      grapheneId: grapheneId
    }
  });
  
  res.status(204).send();
}));

// Add SEM report association to compound batch
router.post('/:id/sem-reports/:semReportId', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id, semReportId } = req.params;
  
  // Check if association already exists
  const existing = await prisma.compoundBatchSemReport.findFirst({
    where: {
      compoundBatchId: id,
      semReportId: semReportId
    }
  });
  
  if (existing) {
    res.status(409);
    throw new Error('SEM report already associated with this compound batch');
  }
  
  const association = await prisma.compoundBatchSemReport.create({
    data: {
      compoundBatchId: id,
      semReportId: semReportId
    }
  });
  
  res.status(201).json(association);
}));

// Remove SEM report association from compound batch
router.delete('/:id/sem-reports/:semReportId', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id, semReportId } = req.params;
  
  await prisma.compoundBatchSemReport.deleteMany({
    where: {
      compoundBatchId: id,
      semReportId: semReportId
    }
  });
  
  res.status(204).send();
}));


// Export to CSV
router.get('/export/csv', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  const compoundBatches = await prisma.compoundBatch.findMany({
    orderBy: { createdAt: 'desc' },
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
      }
    }
  });
  
  const headers = [
    'Batch Number', 'Batch Name', 'Created Date', 'Total Output (g)', 
    'Experiments', 'Description', 'Created At'
  ];
  
  let csv = headers.join(',') + '\n';
  
  compoundBatches.forEach(batch => {
    const experimentNumbers = batch.experiments.map(exp => exp.graphene.experimentNumber).join('; ');
    const row = [
      batch.batchNumber || '',
      batch.batchName || '',
      batch.createdDate ? batch.createdDate.toISOString().split('T')[0] : '',
      batch.totalOutput || '',
      experimentNumbers,
      `"${(batch.description || '').replace(/"/g, '""')}"`,
      batch.createdAt.toISOString()
    ];
    csv += row.join(',') + '\n';
  });
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="compound_batches_export.csv"');
  res.send(csv);
}));

export default router;