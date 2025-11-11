import express from 'express';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Convert numeric fields from strings to proper types
function convertNumericFields(data) {
  const numericFields = ['totalRecoveredAmount'];

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

  return data;
}

// Get all MCBs
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { search = '' } = req.query;

  let where = {};
  if (search) {
    where = {
      OR: [
        { mcbNumber: { contains: search, mode: 'insensitive' } },
        { mcbLocation: { contains: search, mode: 'insensitive' } }
      ]
    };
  }

  const mcbs = await prisma.micronizedCompoundBatch.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      micronizations: {
        include: {
          micronization: {
            select: {
              id: true,
              micronizationNumber: true,
              recoveredAmount: true,
              grapheneSample: true,
              compoundBatchNumber: true,
              date: true
            }
          }
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
  const processedRecords = mcbs.map(record => ({
    ...record,
    totalRecoveredAmount: record.totalRecoveredAmount ? Number(record.totalRecoveredAmount) : null,
    // Calculate shipped amount and available amount
    totalShipped: record.shipments?.reduce((sum, shipment) =>
      sum + (shipment.amountShipped ? Number(shipment.amountShipped) : 0), 0) || 0,
    availableAmount: record.totalRecoveredAmount ?
      Number(record.totalRecoveredAmount) - (record.shipments?.reduce((sum, shipment) =>
        sum + (shipment.amountShipped ? Number(shipment.amountShipped) : 0), 0) || 0) : null,
    // Include micronization details
    micronizations: record.micronizations.map(m => ({
      ...m.micronization,
      recoveredAmount: m.micronization.recoveredAmount ? Number(m.micronization.recoveredAmount) : null
    })),
    micronizationCount: record.micronizations.length
  }));

  res.json(processedRecords);
}));

// Get single MCB record
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  const mcb = await prisma.micronizedCompoundBatch.findUnique({
    where: { id },
    include: {
      micronizations: {
        include: {
          micronization: true
        }
      },
      shipments: true
    }
  });

  if (!mcb) {
    res.status(404);
    throw new Error('MCB record not found');
  }

  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...mcb,
    totalRecoveredAmount: mcb.totalRecoveredAmount ? Number(mcb.totalRecoveredAmount) : null,
    micronizations: mcb.micronizations.map(m => ({
      ...m.micronization,
      startingMaterialAmount: m.micronization.startingMaterialAmount ? Number(m.micronization.startingMaterialAmount) : null,
      recoveredAmount: m.micronization.recoveredAmount ? Number(m.micronization.recoveredAmount) : null
    })),
    // Extract selected micronization IDs for editing
    selectedMicronizationIds: mcb.micronizations.map(m => m.micronizationId)
  };

  res.json(processedRecord);
}));

// Get available micronizations (not yet in any MCB)
router.get('/available/micronizations', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  // Get all micronizations that don't have an mcbMembership
  const availableMicronizations = await prisma.micronization.findMany({
    where: {
      mcbMembership: null
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      micronizationNumber: true,
      sku: true,
      recoveredAmount: true,
      grapheneSample: true,
      compoundBatchNumber: true,
      date: true
    }
  });

  // Convert Decimal fields to numbers for frontend
  const processedRecords = availableMicronizations.map(record => ({
    ...record,
    recoveredAmount: record.recoveredAmount ? Number(record.recoveredAmount) : null
  }));

  res.json(processedRecords);
}));

// Create new MCB record
router.post('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  // Convert numeric fields from strings to proper types
  const data = convertNumericFields({ ...req.body });

  // Extract micronization IDs (from selectedMicronizationIds)
  const micronizationIds = data.selectedMicronizationIds || data.micronizationIds || [];
  delete data.selectedMicronizationIds;
  delete data.micronizationIds;

  // Handle combinedDate field
  if (data.combinedDate && data.combinedDate !== '') {
    data.combinedDate = new Date(data.combinedDate);
  } else {
    // Default to today for new MCBs
    data.combinedDate = new Date();
  }

  // Remove UI-only fields from data
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  delete data.micronizations;
  delete data.shipments;
  delete data.micronizationCount;
  delete data.totalShipped;
  delete data.availableAmount;

  // Calculate total recovered amount from selected micronizations
  if (micronizationIds.length > 0) {
    const selectedMicronizations = await prisma.micronization.findMany({
      where: { id: { in: micronizationIds } },
      select: { recoveredAmount: true }
    });
    data.totalRecoveredAmount = selectedMicronizations.reduce(
      (sum, m) => sum + (m.recoveredAmount ? Number(m.recoveredAmount) : 0),
      0
    );
  } else {
    data.totalRecoveredAmount = 0;
  }

  // Create MCB with micronization relationships in a transaction
  const mcb = await prisma.$transaction(async (tx) => {
    // Create the MCB
    const newMcb = await tx.micronizedCompoundBatch.create({
      data
    });

    // Create the relationships
    if (micronizationIds.length > 0) {
      await tx.micronizationMCB.createMany({
        data: micronizationIds.map(micId => ({
          micronizationId: micId,
          micronizedCompoundBatchId: newMcb.id
        }))
      });
    }

    // Fetch the created MCB with all relationships
    return await tx.micronizedCompoundBatch.findUnique({
      where: { id: newMcb.id },
      include: {
        micronizations: {
          include: {
            micronization: {
              select: {
                id: true,
                micronizationNumber: true,
                sku: true,
                recoveredAmount: true,
                grapheneSample: true,
                compoundBatchNumber: true
              }
            }
          }
        },
        shipments: true
      }
    });
  });

  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...mcb,
    totalRecoveredAmount: mcb.totalRecoveredAmount ? Number(mcb.totalRecoveredAmount) : null,
    micronizations: mcb.micronizations.map(m => ({
      ...m.micronization,
      recoveredAmount: m.micronization.recoveredAmount ? Number(m.micronization.recoveredAmount) : null
    })),
    micronizationCount: mcb.micronizations.length
  };

  res.status(201).json(processedRecord);
}));

// Update MCB record
router.put('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  // Convert numeric fields from strings to proper types
  const data = convertNumericFields({ ...req.body });

  // Extract micronization IDs (from selectedMicronizationIds)
  const micronizationIds = data.selectedMicronizationIds || data.micronizationIds || [];
  delete data.selectedMicronizationIds;
  delete data.micronizationIds;

  // Get existing record
  const existingRecord = await prisma.micronizedCompoundBatch.findUnique({
    where: { id }
  });

  if (!existingRecord) {
    res.status(404);
    throw new Error('MCB record not found');
  }

  // Handle combinedDate field
  if (data.combinedDate && data.combinedDate !== '') {
    data.combinedDate = new Date(data.combinedDate);
  } else if (data.combinedDate === null || data.combinedDate === '') {
    data.combinedDate = null;
  }
  // If combinedDate is undefined, it won't be updated (keeps existing value)

  // Remove UI-only and relational fields from data
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  delete data.micronizations;
  delete data.shipments;
  delete data.micronizationCount;
  delete data.totalShipped;
  delete data.availableAmount;
  delete data.selectedMicronizationIds;

  // Update MCB and relationships in a transaction
  const mcb = await prisma.$transaction(async (tx) => {
    // Calculate total recovered amount from selected micronizations
    if (micronizationIds.length > 0) {
      const selectedMicronizations = await tx.micronization.findMany({
        where: { id: { in: micronizationIds } },
        select: { recoveredAmount: true }
      });
      data.totalRecoveredAmount = selectedMicronizations.reduce(
        (sum, m) => sum + (m.recoveredAmount ? Number(m.recoveredAmount) : 0),
        0
      );
    } else {
      data.totalRecoveredAmount = 0;
    }

    // Update the MCB
    const updatedMcb = await tx.micronizedCompoundBatch.update({
      where: { id },
      data
    });

    // Delete existing relationships
    await tx.micronizationMCB.deleteMany({
      where: { micronizedCompoundBatchId: id }
    });

    // Create new relationships
    if (micronizationIds.length > 0) {
      await tx.micronizationMCB.createMany({
        data: micronizationIds.map(micId => ({
          micronizationId: micId,
          micronizedCompoundBatchId: id
        }))
      });
    }

    // Fetch the updated MCB with all relationships
    return await tx.micronizedCompoundBatch.findUnique({
      where: { id },
      include: {
        micronizations: {
          include: {
            micronization: {
              select: {
                id: true,
                micronizationNumber: true,
                sku: true,
                recoveredAmount: true,
                grapheneSample: true,
                compoundBatchNumber: true
              }
            }
          }
        },
        shipments: true
      }
    });
  });

  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...mcb,
    totalRecoveredAmount: mcb.totalRecoveredAmount ? Number(mcb.totalRecoveredAmount) : null,
    micronizations: mcb.micronizations.map(m => ({
      ...m.micronization,
      recoveredAmount: m.micronization.recoveredAmount ? Number(m.micronization.recoveredAmount) : null
    })),
    micronizationCount: mcb.micronizations.length
  };

  res.json(processedRecord);
}));

// Delete MCB record
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  await prisma.micronizedCompoundBatch.delete({
    where: { id }
  });

  res.status(204).send();
}));

// Export to CSV
router.get('/export/csv', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  const mcbs = await prisma.micronizedCompoundBatch.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      micronizations: {
        include: {
          micronization: true
        }
      }
    }
  });

  const headers = [
    'MCB #', 'Total Recovered Amount (g)', 'Location',
    'Micronization Count', 'Component Micronizations', 'Combined Date', 'Created At'
  ];

  let csv = headers.join(',') + '\n';

  mcbs.forEach(m => {
    const componentMicronizations = m.micronizations
      .map(mic => mic.micronization.micronizationNumber)
      .join('; ');

    const row = [
      m.mcbNumber || '',
      m.totalRecoveredAmount || '',
      m.mcbLocation || '',
      m.micronizations.length,
      componentMicronizations,
      m.combinedDate ? new Date(m.combinedDate).toISOString() : '',
      m.createdAt.toISOString()
    ];
    csv += row.join(',') + '\n';
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="mcb_export.csv"');
  res.send(csv);
}));

export default router;
