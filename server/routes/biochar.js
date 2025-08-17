import express from 'express';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Get all biochar records
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { sortBy = 'chronological', order = 'asc', search } = req.query;
  
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
      { testOrder: { sort: order, nulls: 'last' } },
      { experimentDate: { sort: order, nulls: 'last' } },
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
  
  res.json(biochars);
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
  
  const biochar = await prisma.biochar.create({
    data: req.body
  });
  
  res.status(201).json(biochar);
}));

// Update biochar record
router.put('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  const biochar = await prisma.biochar.update({
    where: { id },
    data: req.body
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

// Export to CSV
router.get('/export/csv', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  const biochars = await prisma.biochar.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  const headers = [
    'Experiment #', 'Reactor', 'Raw Material', 'Starting Amount (g)', 'Acid Amount (g)', 'Acid Concentration (%)',
    'Acid Molarity (M)', 'Acid Type', 'Temperature (°C)', 'Time (hr)',
    'Pressure Initial (bar)', 'Pressure Final (bar)', 'Wash Amount (g)', 'Wash Medium',
    'Output (g)', 'Drying Temp (°C)', 'KFT (%)', 'Comments', 'Created At'
  ];
  
  let csv = headers.join(',') + '\n';
  
  biochars.forEach(b => {
    const row = [
      b.experimentNumber,
      b.reactor || '',
      b.rawMaterial || '',
      b.startingAmount || '',
      b.acidAmount || '',
      b.acidConcentration || '',
      b.acidMolarity || '',
      b.acidType || '',
      b.temperature || '',
      b.time || '',
      b.pressureInitial || '',
      b.pressureFinal || '',
      b.washAmount || '',
      b.washMedium || '',
      b.output || '',
      b.dryingTemp || '',
      b.kftPercentage || '',
      `"${(b.comments || '').replace(/"/g, '""')}"`,
      b.createdAt.toISOString()
    ];
    csv += row.join(',') + '\n';
  });
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="biochar_export.csv"');
  res.send(csv);
}));

export default router;