import express from 'express';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Get all graphene records
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { sortBy = 'chronological', order = 'asc', search, biocharExperiment } = req.query;
  
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
      { testOrder: { sort: order, nulls: 'last' } },
      { experimentDate: { sort: order, nulls: 'last' } },
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

// Create new graphene record
router.post('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  const graphene = await prisma.graphene.create({
    data: req.body
  });
  
  res.status(201).json(graphene);
}));

// Update graphene record
router.put('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  const graphene = await prisma.graphene.update({
    where: { id },
    data: req.body
  });
  
  res.json(graphene);
}));

// Delete graphene record
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
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