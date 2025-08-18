import express from 'express';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Get all BET records
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { sortBy = 'chronological', order = 'asc', search } = req.query;
  
  let where = {};
  if (search) {
    where = {
      OR: [
        { grapheneSample: { contains: search, mode: 'insensitive' } },
        { species: { contains: search, mode: 'insensitive' } },
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
  
  const betRecords = await prisma.bET.findMany({
    where,
    orderBy,
    include: {
      grapheneRef: {
        select: { experimentNumber: true, species: true }
      }
    }
  });
  
  res.json(betRecords);
}));

// Get single BET record
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  const betRecord = await prisma.bET.findUnique({
    where: { id },
    include: { grapheneRef: true }
  });
  
  if (!betRecord) {
    res.status(404);
    throw new Error('BET record not found');
  }
  
  res.json(betRecord);
}));

// Create new BET record
router.post('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  const betRecord = await prisma.bET.create({
    data: req.body
  });
  
  res.status(201).json(betRecord);
}));

// Update BET record
router.put('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  const betRecord = await prisma.bET.update({
    where: { id },
    data: req.body
  });
  
  res.json(betRecord);
}));

// Delete BET record
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  await prisma.bET.delete({
    where: { id }
  });
  
  res.status(204).send();
}));

// Export to CSV
router.get('/export/csv', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  const betRecords = await prisma.bET.findMany({
    orderBy: { createdAt: 'desc' },
    include: { grapheneRef: true }
  });
  
  const headers = [
    'Test Date', 'Graphene Sample', 
    'Multipoint BET Area (m²/g)', 'Langmuir Surface Area (m²/g)', 
    'Species', 'Comments', 'Created At'
  ];
  
  let csv = headers.join(',') + '\n';
  
  betRecords.forEach(b => {
    const row = [
      b.testDate ? b.testDate.toISOString().split('T')[0] : '',
      b.grapheneSample || '',
      b.multipointBetArea || '',
      b.langmuirSurfaceArea || '',
      b.species || '',
      `"${(b.comments || '').replace(/"/g, '""')}"`,
      b.createdAt.toISOString()
    ];
    csv += row.join(',') + '\n';
  });
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="bet_export.csv"');
  res.send(csv);
}));

export default router;