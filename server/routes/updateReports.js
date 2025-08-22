import express from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for update report uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'update-reports');
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
    fileSize: 50 * 1024 * 1024 // 50MB limit for update reports
  }
});

// Get all update reports
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  const updateReports = await prisma.updateReport.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      grapheneReports: {
        include: {
          graphene: {
            select: {
              experimentNumber: true,
              species: true
            }
          }
        }
      }
    }
  });
  
  res.json(updateReports);
}));

// Get single update report
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  const updateReport = await prisma.updateReport.findUnique({
    where: { id },
    include: {
      grapheneReports: {
        include: {
          graphene: {
            select: {
              id: true,
              experimentNumber: true,
              species: true,
              createdAt: true
            }
          }
        }
      }
    }
  });
  
  if (!updateReport) {
    res.status(404);
    throw new Error('Update report not found');
  }
  
  res.json(updateReport);
}));

// Create new update report
router.post('/', upload.single('updateFile'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  if (!req.file) {
    res.status(400);
    throw new Error('Update report file is required');
  }
  
  const { description, weekOf, grapheneIds } = req.body;
  
  // Parse grapheneIds if provided as JSON string
  let parsedGrapheneIds = [];
  if (grapheneIds) {
    try {
      parsedGrapheneIds = JSON.parse(grapheneIds);
    } catch (e) {
      parsedGrapheneIds = Array.isArray(grapheneIds) ? grapheneIds : [grapheneIds];
    }
  }
  
  // Create the update report
  const updateReport = await prisma.updateReport.create({
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: `/uploads/update-reports/${req.file.filename}`,
      description: description || null,
      weekOf: weekOf ? new Date(weekOf) : null
    }
  });
  
  // Create associations with graphene experiments if provided
  if (parsedGrapheneIds.length > 0) {
    const grapheneReportData = parsedGrapheneIds.map(grapheneId => ({
      grapheneId,
      updateReportId: updateReport.id
    }));
    
    await prisma.grapheneUpdateReport.createMany({
      data: grapheneReportData,
      skipDuplicates: true
    });
  }
  
  // Fetch the complete report with associations
  const completeReport = await prisma.updateReport.findUnique({
    where: { id: updateReport.id },
    include: {
      grapheneReports: {
        include: {
          graphene: {
            select: {
              experimentNumber: true,
              species: true
            }
          }
        }
      }
    }
  });
  
  res.status(201).json(completeReport);
}));

// Update update report (metadata only, not file)
router.put('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  const { description, weekOf, grapheneIds } = req.body;
  
  // Check if update report exists
  const existingReport = await prisma.updateReport.findUnique({
    where: { id }
  });
  
  if (!existingReport) {
    res.status(404);
    throw new Error('Update report not found');
  }
  
  // Update the report metadata
  const updateReport = await prisma.updateReport.update({
    where: { id },
    data: {
      description: description || null,
      weekOf: weekOf ? new Date(weekOf) : null
    }
  });
  
  // Handle graphene associations if provided
  if (grapheneIds !== undefined) {
    let parsedGrapheneIds = [];
    if (grapheneIds) {
      try {
        parsedGrapheneIds = JSON.parse(grapheneIds);
      } catch (e) {
        parsedGrapheneIds = Array.isArray(grapheneIds) ? grapheneIds : [grapheneIds];
      }
    }
    
    // Remove existing associations
    await prisma.grapheneUpdateReport.deleteMany({
      where: { updateReportId: id }
    });
    
    // Create new associations
    if (parsedGrapheneIds.length > 0) {
      const grapheneReportData = parsedGrapheneIds.map(grapheneId => ({
        grapheneId,
        updateReportId: id
      }));
      
      await prisma.grapheneUpdateReport.createMany({
        data: grapheneReportData,
        skipDuplicates: true
      });
    }
  }
  
  // Fetch the complete updated report
  const completeReport = await prisma.updateReport.findUnique({
    where: { id },
    include: {
      grapheneReports: {
        include: {
          graphene: {
            select: {
              experimentNumber: true,
              species: true
            }
          }
        }
      }
    }
  });
  
  res.json(completeReport);
}));

// Delete update report
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Get report to delete associated file
  const existingReport = await prisma.updateReport.findUnique({
    where: { id }
  });
  
  if (!existingReport) {
    res.status(404);
    throw new Error('Update report not found');
  }
  
  // Delete the file if it exists
  if (existingReport.filePath) {
    const filePath = path.join(process.cwd(), existingReport.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  
  // Delete from database (associations will be deleted due to CASCADE)
  await prisma.updateReport.delete({
    where: { id }
  });
  
  res.status(204).send();
}));

// Add/remove graphene associations to existing update report
router.post('/:id/graphene/:grapheneId', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id, grapheneId } = req.params;
  
  try {
    await prisma.grapheneUpdateReport.create({
      data: {
        updateReportId: id,
        grapheneId: grapheneId
      }
    });
    
    res.status(201).json({ message: 'Association created' });
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(409);
      throw new Error('Association already exists');
    }
    throw error;
  }
}));

router.delete('/:id/graphene/:grapheneId', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id, grapheneId } = req.params;
  
  await prisma.grapheneUpdateReport.deleteMany({
    where: {
      updateReportId: id,
      grapheneId: grapheneId
    }
  });
  
  res.status(204).send();
}));

// Get update reports for a specific graphene experiment
router.get('/graphene/:experimentNumber', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { experimentNumber } = req.params;
  
  // First get the graphene record
  const graphene = await prisma.graphene.findUnique({
    where: { experimentNumber }
  });
  
  if (!graphene) {
    res.status(404);
    throw new Error('Graphene experiment not found');
  }
  
  // Get associated update reports
  const updateReports = await prisma.updateReport.findMany({
    where: {
      grapheneReports: {
        some: {
          grapheneId: graphene.id
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      grapheneReports: {
        where: {
          grapheneId: graphene.id
        }
      }
    }
  });
  
  res.json(updateReports);
}));

export default router;