import express from 'express';
import asyncHandler from 'express-async-handler';
import { csvDateOnly, sendCsv } from '../utils/csv.js';

const router = express.Router();

// Get all biochar records
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { sortBy = 'chronological', order = 'desc', search } = req.query;
  
  let where = {};
  if (search) {
    where = {
      OR: [
        { experimentNumber: { contains: search, mode: 'insensitive' } },
        { reactor: { contains: search, mode: 'insensitive' } },
        { rawMaterial: { contains: search, mode: 'insensitive' } },
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
  
  const biochars = await prisma.biochar.findMany({
    where,
    orderBy,
    include: {
      _count: {
        select: { grapheneProductions: true }
      }
    }
  });
  
  // Convert dates to date-only strings to avoid timezone issues
  const biocharsWithFixedDates = biochars.map(b => ({
    ...b,
    experimentDate: b.experimentDate ? b.experimentDate.toISOString().split('T')[0] : null
  }));
  
  res.json(biocharsWithFixedDates);
}));

// Get all lots - MUST BE BEFORE /:id route
router.get('/lots', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  const lots = await prisma.biocharLot.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      experiments: {
        select: { experimentNumber: true, id: true }
      },
      _count: {
        select: { experiments: true }
      }
    }
  });
  
  res.json(lots);
}));

// Get related graphene productions for a biochar experiment - MUST BE BEFORE /:id route
router.get('/:experimentNumber/related', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { experimentNumber } = req.params;
  
  // Find graphene productions that reference this biochar experiment directly
  const directGraphene = await prisma.graphene.findMany({
    where: { biocharExperiment: experimentNumber },
    orderBy: { createdAt: 'desc' }
  });
  
  // Find graphene productions that reference this biochar via lot number
  // First get the lot number for this biochar experiment
  const biochar = await prisma.biochar.findUnique({
    where: { experimentNumber }
  });
  
  let lotGraphene = [];
  if (biochar?.lotNumber) {
    lotGraphene = await prisma.graphene.findMany({
      where: { biocharLotNumber: biochar.lotNumber },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  // Get BET tests for all related graphene
  const allGraphene = [...directGraphene, ...lotGraphene];
  const grapheneNumbers = allGraphene.map(g => g.experimentNumber);
  
  const betTests = await prisma.bET.findMany({
    where: { grapheneSample: { in: grapheneNumbers } },
    orderBy: { createdAt: 'desc' }
  });
  
  res.json({
    directGraphene,
    lotGraphene,
    betTests,
    lotNumber: biochar?.lotNumber
  });
}));

/**
 * Two-row grouped header, mirroring the Biochar table's own grouped <thead>
 * (client/src/js/components/tabs/BiocharTab.js:~100-160): a group band of
 * Basic Info(4) / Material(2) / Process(8) / Output(5) over per-column sub-labels,
 * with `Lot #` as a rowspan=2 standalone. Entries are [groupLabel, subLabel]; '' as a
 * group label is the CSV equivalent of colspan, and a rowspan=2 column carries its
 * label on row 1 with an empty row 2, exactly as the table shows it once across both.
 *
 * The `Select` checkbox and `Actions` columns are omitted — they are controls, not data.
 *
 * The group boundaries are the table's, not mine: Wash and Drying sit under `Output`
 * on screen, which reads oddly, but the export mirrors the screen rather than
 * correcting it.
 *
 * Four columns are new to this export and are the reason this route was in scope —
 * all four are rendered in the table and reached the CSV nowhere: `testOrder`,
 * `experimentDate`, `lotNumber`, and (record-level, form-only) `researchTeam`.
 */
const BIOCHAR_CSV_COLUMNS = [
  ['Basic Info', 'Order'],
  ['', 'Exp #'],
  ['', 'Date'],
  ['', 'Reactor'],
  ['Material', 'Raw Material'],
  ['', 'Start (g)'],
  ['Process', 'Acid Amt'],
  ['', 'Acid %'],
  ['', 'Molarity'],
  ['', 'Acid Type'],
  ['', 'Temp'],
  ['', 'Time'],
  ['', 'P Initial'],
  ['', 'P Final'],
  ['Output', 'Wash Amt'],
  ['', 'Wash Med'],
  ['', 'Drying'],
  ['', 'Output (g)'],
  ['', 'KFT %'],
  ['Lot #', ''],
  // Trailing groups for fields with no on-screen column of their own, following the
  // graphene export's layout: short record facts first, free text last so the
  // row-bloating columns sit to the right of everything a reader normally scans.
  // `researchTeam` is on the model and in the add/edit form (BiocharTab.js:28) but has
  // no table column; `comments` lives in the Actions-column tooltip (BiocharTab.js:178).
  ['Record', 'Team'],
  ['', 'Created'],
  ['', 'Updated'],
  ['Notes', 'Comments']
];

// Export to CSV - MUST BE BEFORE /:id route
router.get('/export/csv', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  const biochars = await prisma.biochar.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const rows = biochars.map(b => [
    b.testOrder,
    b.experimentNumber,
    csvDateOnly(b.experimentDate),
    b.reactor,
    b.rawMaterial,
    b.startingAmount,
    b.acidAmount,
    b.acidConcentration,
    b.acidMolarity,
    b.acidType,
    b.temperature,
    b.time,
    b.pressureInitial,
    b.pressureFinal,
    b.washAmount,
    b.washMedium,
    b.dryingTemp,
    b.output,
    b.kftPercentage,
    b.lotNumber,
    b.researchTeam,
    b.createdAt,
    b.updatedAt,
    b.comments
  ]);

  sendCsv(res, 'biochar_export.csv', BIOCHAR_CSV_COLUMNS, rows);
}));

// Get single biochar record
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  const biochar = await prisma.biochar.findUnique({
    where: { id },
    include: { grapheneProductions: true }
  });
  
  if (!biochar) {
    res.status(404);
    throw new Error('Biochar record not found');
  }
  
  res.json(biochar);
}));

// Create new biochar record
router.post('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  // Convert numeric fields from strings to proper types
  const data = { ...req.body };
  const numericFields = ['testOrder', 'startingAmount', 'acidAmount', 'acidConcentration', 'acidMolarity', 
                        'temperature', 'time', 'pressureInitial', 'pressureFinal', 'washAmount', 
                        'output', 'dryingTemp', 'kftPercentage'];
  
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
  
  const biochar = await prisma.biochar.create({
    data
  });
  
  res.status(201).json(biochar);
}));

// Update biochar record
router.put('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Convert numeric fields from strings to proper types
  const data = { ...req.body };
  const numericFields = ['testOrder', 'startingAmount', 'acidAmount', 'acidConcentration', 'acidMolarity', 
                        'temperature', 'time', 'pressureInitial', 'pressureFinal', 'washAmount', 
                        'output', 'dryingTemp', 'kftPercentage'];
  
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
  
  const biochar = await prisma.biochar.update({
    where: { id },
    data
  });
  
  res.json(biochar);
}));

// Delete biochar record
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  await prisma.biochar.delete({
    where: { id }
  });
  
  res.status(204).send();
}));

// Combine experiments into a lot
router.post('/combine-lot', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { lotNumber, lotName, description, experimentIds } = req.body;
  
  if (!lotNumber || !experimentIds || experimentIds.length === 0) {
    res.status(400);
    throw new Error('Lot number and experiment IDs are required');
  }
  
  // Check if lot number already exists
  const existingLot = await prisma.biocharLot.findUnique({
    where: { lotNumber }
  });
  
  if (existingLot) {
    res.status(400);
    throw new Error('Lot number already exists');
  }
  
  // Check if any experiments are already in lots
  const experimentsInLots = await prisma.biochar.findMany({
    where: {
      id: { in: experimentIds },
      lotNumber: { not: null }
    }
  });
  
  if (experimentsInLots.length > 0) {
    res.status(400);
    throw new Error('Some experiments are already assigned to lots');
  }
  
  // Create lot and update experiments
  const result = await prisma.$transaction(async (tx) => {
    // Create the lot
    const lot = await tx.biocharLot.create({
      data: {
        lotNumber,
        lotName,
        description
      }
    });
    
    // Update experiments to reference the lot
    await tx.biochar.updateMany({
      where: { id: { in: experimentIds } },
      data: { lotNumber }
    });
    
    return lot;
  });
  
  res.status(201).json({ success: true, lot: result });
}));

export default router;