import express from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for SEM report uploads
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
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 10 // Max 10 files at once
  }
});

// Get all SEM reports with associated graphene experiments
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  const semReports = await prisma.semReport.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      grapheneReports: {
        include: {
          graphene: {
            select: { 
              id: true, 
              experimentNumber: true, 
              species: true 
            }
          }
        }
      }
    }
  });
  
  res.json(semReports);
}));

// Get single SEM report
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  const semReport = await prisma.semReport.findUnique({
    where: { id },
    include: {
      grapheneReports: {
        include: {
          graphene: true
        }
      }
    }
  });
  
  if (!semReport) {
    res.status(404);
    throw new Error('SEM report not found');
  }
  
  res.json(semReport);
}));

// Get SEM reports for specific graphene experiment
router.get('/graphene/:experimentNumber', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { experimentNumber } = req.params;
  
  const reports = await prisma.semReport.findMany({
    where: {
      grapheneReports: {
        some: {
          graphene: {
            experimentNumber: experimentNumber
          }
        }
      }
    },
    include: {
      grapheneReports: {
        where: {
          graphene: {
            experimentNumber: experimentNumber
          }
        },
        include: {
          graphene: {
            select: { 
              id: true, 
              experimentNumber: true, 
              species: true 
            }
          }
        }
      }
    }
  });
  
  res.json(reports);
}));

// Create new SEM reports with bulk file upload
router.post('/', upload.array('semFiles', 10), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('No files uploaded');
  }
  
  const { reportDate, grapheneIds } = req.body;
  let parsedGrapheneIds = [];
  
  // Parse graphene IDs if provided
  if (grapheneIds) {
    try {
      parsedGrapheneIds = Array.isArray(grapheneIds) ? grapheneIds : JSON.parse(grapheneIds);
    } catch (error) {
      console.error('Error parsing grapheneIds:', error);
    }
  }
  
  const createdReports = [];
  
  // Process each uploaded file
  for (const file of req.files) {
    const semReportData = {
      filename: file.filename,
      originalName: file.originalname,
      filePath: path.join('sem-reports', file.filename),
      reportDate: reportDate ? new Date(reportDate) : new Date()
    };
    
    // Create the SEM report
    const semReport = await prisma.semReport.create({
      data: semReportData
    });
    
    // Create associations with graphene experiments if provided
    if (parsedGrapheneIds.length > 0) {
      const associations = parsedGrapheneIds.map(grapheneId => ({
        semReportId: semReport.id,
        grapheneId: grapheneId
      }));
      
      await prisma.grapheneSemReport.createMany({
        data: associations
      });
    }
    
    createdReports.push(semReport);
  }
  
  // Return reports with associations
  const reportsWithAssociations = await prisma.semReport.findMany({
    where: {
      id: { in: createdReports.map(r => r.id) }
    },
    include: {
      grapheneReports: {
        include: {
          graphene: {
            select: { 
              id: true, 
              experimentNumber: true, 
              species: true 
            }
          }
        }
      }
    }
  });
  
  res.status(201).json(reportsWithAssociations);
}));

// Update SEM report metadata and associations
router.put('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  const { reportDate, grapheneIds } = req.body;
  
  let parsedGrapheneIds = [];
  if (grapheneIds) {
    try {
      parsedGrapheneIds = Array.isArray(grapheneIds) ? grapheneIds : JSON.parse(grapheneIds);
    } catch (error) {
      console.error('Error parsing grapheneIds:', error);
    }
  }
  
  // Update the report metadata
  const updatedReport = await prisma.semReport.update({
    where: { id },
    data: {
      reportDate: reportDate ? new Date(reportDate) : null
    }
  });
  
  // Update associations if grapheneIds provided
  if (grapheneIds !== undefined) {
    // Delete existing associations
    await prisma.grapheneSemReport.deleteMany({
      where: { semReportId: id }
    });
    
    // Create new associations
    if (parsedGrapheneIds.length > 0) {
      const associations = parsedGrapheneIds.map(grapheneId => ({
        semReportId: id,
        grapheneId: grapheneId
      }));
      
      await prisma.grapheneSemReport.createMany({
        data: associations
      });
    }
  }
  
  // Return updated report with associations
  const reportWithAssociations = await prisma.semReport.findUnique({
    where: { id },
    include: {
      grapheneReports: {
        include: {
          graphene: {
            select: { 
              id: true, 
              experimentNumber: true, 
              species: true 
            }
          }
        }
      }
    }
  });
  
  res.json(reportWithAssociations);
}));

// Delete SEM report
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  
  // Get existing report to delete associated file
  const existingReport = await prisma.semReport.findUnique({
    where: { id }
  });
  
  if (existingReport && existingReport.filePath) {
    const fullFilePath = path.join(process.cwd(), 'uploads', existingReport.filePath);
    if (fs.existsSync(fullFilePath)) {
      fs.unlinkSync(fullFilePath);
    }
  }
  
  // Delete report (associations will be cascade deleted)
  await prisma.semReport.delete({
    where: { id }
  });
  
  res.status(204).send();
}));

// Add graphene association to existing SEM report
router.post('/:id/graphene/:grapheneId', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id: semReportId, grapheneId } = req.params;
  
  // Check if association already exists
  const existingAssociation = await prisma.grapheneSemReport.findUnique({
    where: {
      grapheneId_semReportId: {
        grapheneId: grapheneId,
        semReportId: semReportId
      }
    }
  });
  
  if (existingAssociation) {
    res.status(400);
    throw new Error('Association already exists');
  }
  
  // Create association
  const association = await prisma.grapheneSemReport.create({
    data: {
      semReportId: semReportId,
      grapheneId: grapheneId
    },
    include: {
      graphene: {
        select: { 
          id: true, 
          experimentNumber: true, 
          species: true 
        }
      }
    }
  });
  
  res.status(201).json(association);
}));

// Remove graphene association from SEM report
router.delete('/:id/graphene/:grapheneId', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id: semReportId, grapheneId } = req.params;
  
  await prisma.grapheneSemReport.deleteMany({
    where: {
      semReportId: semReportId,
      grapheneId: grapheneId
    }
  });
  
  res.status(204).send();
}));

export default router;