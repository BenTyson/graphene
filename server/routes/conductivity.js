import express from 'express';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  console.log('Conductivity test endpoint hit!');
  res.json({ message: 'Conductivity API is working' });
});

router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { sortBy = 'chronological', order = 'desc', search } = req.query;
  
  let where = {};
  if (search) {
    where = {
      OR: [
        { grapheneSample: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { comments: { contains: search, mode: 'insensitive' } }
      ]
    };
  }
  
  let orderBy;
  if (sortBy === 'chronological') {
    orderBy = [
      { testDate: order },
      { createdAt: order }
    ];
  } else {
    orderBy = { [sortBy]: order };
  }
  
  const conductivityRecords = await prisma.conductivityTest.findMany({
    where,
    orderBy,
    include: {
      grapheneRef: {
        select: { experimentNumber: true, species: true }
      }
    }
  });
  
  // Convert Decimal fields to numbers for frontend
  const processedRecords = conductivityRecords.map(record => ({
    ...record,
    conductivity1kN: record.conductivity1kN ? Number(record.conductivity1kN) : null,
    conductivity8kN: record.conductivity8kN ? Number(record.conductivity8kN) : null,
    conductivity12kN: record.conductivity12kN ? Number(record.conductivity12kN) : null,
    conductivity20kN: record.conductivity20kN ? Number(record.conductivity20kN) : null
  }));
  
  // Debug logging
  console.log('Raw conductivity records:', JSON.stringify(conductivityRecords, null, 2));
  console.log('Processed conductivity records:', JSON.stringify(processedRecords, null, 2));
  
  res.json(processedRecords);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  const conductivityRecord = await prisma.conductivityTest.findUnique({
    where: { id },
    include: { grapheneRef: true }
  });
  
  if (!conductivityRecord) {
    res.status(404);
    throw new Error('Conductivity record not found');
  }
  
  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...conductivityRecord,
    conductivity1kN: conductivityRecord.conductivity1kN ? Number(conductivityRecord.conductivity1kN) : null,
    conductivity8kN: conductivityRecord.conductivity8kN ? Number(conductivityRecord.conductivity8kN) : null,
    conductivity12kN: conductivityRecord.conductivity12kN ? Number(conductivityRecord.conductivity12kN) : null,
    conductivity20kN: conductivityRecord.conductivity20kN ? Number(conductivityRecord.conductivity20kN) : null
  };
  
  res.json(processedRecord);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  const data = { ...req.body };
  const numericFields = ['conductivity1kN', 'conductivity8kN', 'conductivity12kN', 'conductivity20kN'];
  
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
  
  if (data.testDate && data.testDate !== '') {
    data.testDate = new Date(data.testDate);
  } else {
    data.testDate = null;
  }
  
  const conductivityRecord = await prisma.conductivityTest.create({
    data
  });
  
  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...conductivityRecord,
    conductivity1kN: conductivityRecord.conductivity1kN ? Number(conductivityRecord.conductivity1kN) : null,
    conductivity8kN: conductivityRecord.conductivity8kN ? Number(conductivityRecord.conductivity8kN) : null,
    conductivity12kN: conductivityRecord.conductivity12kN ? Number(conductivityRecord.conductivity12kN) : null,
    conductivity20kN: conductivityRecord.conductivity20kN ? Number(conductivityRecord.conductivity20kN) : null
  };
  
  res.status(201).json(processedRecord);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  const data = { ...req.body };
  const numericFields = ['conductivity1kN', 'conductivity8kN', 'conductivity12kN', 'conductivity20kN'];
  
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
  
  if (data.testDate && data.testDate !== '') {
    data.testDate = new Date(data.testDate);
  } else {
    data.testDate = null;
  }
  
  const conductivityRecord = await prisma.conductivityTest.update({
    where: { id },
    data
  });
  
  // Convert Decimal fields to numbers for frontend
  const processedRecord = {
    ...conductivityRecord,
    conductivity1kN: conductivityRecord.conductivity1kN ? Number(conductivityRecord.conductivity1kN) : null,
    conductivity8kN: conductivityRecord.conductivity8kN ? Number(conductivityRecord.conductivity8kN) : null,
    conductivity12kN: conductivityRecord.conductivity12kN ? Number(conductivityRecord.conductivity12kN) : null,
    conductivity20kN: conductivityRecord.conductivity20kN ? Number(conductivityRecord.conductivity20kN) : null
  };
  
  res.json(processedRecord);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  await prisma.conductivityTest.delete({
    where: { id }
  });
  
  res.status(204).send();
}));

router.get('/export/csv', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  const conductivityRecords = await prisma.conductivityTest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { grapheneRef: true }
  });
  
  const headers = [
    'Test Date', 'Graphene Sample', 'Description',
    'Conductivity 1kN (S/cm²)', 'Conductivity 8kN (S/cm²)', 
    'Conductivity 12kN (S/cm²)', 'Conductivity 20kN (S/cm²)', 
    'Comments', 'Created At'
  ];
  
  let csv = headers.join(',') + '\n';
  
  conductivityRecords.forEach(c => {
    const row = [
      c.testDate ? c.testDate.toISOString().split('T')[0] : '',
      c.grapheneSample || '',
      `"${(c.description || '').replace(/"/g, '""')}"`,
      c.conductivity1kN || '',
      c.conductivity8kN || '',
      c.conductivity12kN || '',
      c.conductivity20kN || '',
      `"${(c.comments || '').replace(/"/g, '""')}"`,
      c.createdAt.toISOString()
    ];
    csv += row.join(',') + '\n';
  });
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="conductivity_export.csv"');
  res.send(csv);
}));

export default router;