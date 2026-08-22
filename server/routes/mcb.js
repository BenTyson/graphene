import express from 'express';
import asyncHandler from 'express-async-handler';
import { csvDateOnly, sendCsv } from '../utils/csv.js';

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
      },
      // Needed for the derived Shipped / Available columns below, which the MCB table
      // shows and this export did not carry.
      shipments: {
        select: { amountShipped: true }
      }
    }
  });

  // Single header row: the MCB table's <thead> is flat — MCB Number, Combined Date,
  // Location, Combined Batches, Total Amount (g), Available (g), Actions
  // (client/src/js/components/tabs/MicronizationTab.js:208-230). No grouping to mirror.
  //
  // `Available (g)` is new and is derived, reproducing the server's own computation for
  // the list endpoint at mcb.js:74-76 — the same value the table renders from
  // `mcb.availableAmount` (MicronizationTab.js:266). `Shipped (g)` is exported alongside
  // it so the subtraction is auditable inside the spreadsheet; without it a reader
  // seeing Available < Total has no way to see why.
  const headers = [
    'MCB #', 'Combined Date', 'Location', 'Micronization Count', 'Component Micronizations',
    'Total Recovered Amount (g)', 'Shipped (g)', 'Available (g)',
    'Comments', 'Created At', 'Updated At'
  ];

  const rows = mcbs.map(m => {
    const componentMicronizations = m.micronizations
      .map(mic => mic.micronization.micronizationNumber)
      .join('; ');

    // Verbatim the list endpoint's formula (mcb.js:70-76): total minus the sum of every
    // linked shipment's amountShipped, and null total means no available figure at all.
    const totalShipped = m.shipments?.reduce(
      (sum, s) => sum + (s.amountShipped ? Number(s.amountShipped) : 0), 0) || 0;
    const availableAmount = m.totalRecoveredAmount
      ? Number(m.totalRecoveredAmount) - totalShipped
      : '';

    return [
      m.mcbNumber,
      csvDateOnly(m.combinedDate),
      m.mcbLocation,
      m.micronizations.length,
      componentMicronizations,
      m.totalRecoveredAmount,
      totalShipped,
      availableAmount,
      m.comments,
      m.createdAt,
      m.updatedAt
    ];
  });

  sendCsv(res, 'mcb_export.csv', headers, rows);
}));

export default router;
