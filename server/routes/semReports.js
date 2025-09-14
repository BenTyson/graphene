import express from 'express';
import asyncHandler from 'express-async-handler';
import { createFileUploadMiddleware, uploadFile, deleteFileFromStorage } from '../utils/fileUpload.js';

const router = express.Router();

// Configure file upload middleware for SEM reports (supports multiple files)
const upload = createFileUploadMiddleware('sem-reports', {
  allowedTypes: ['application/pdf'],
  maxSize: 10 * 1024 * 1024, // 10MB per file
  allowedExtensions: ['.pdf'],
  validateContent: true
});

// Override the array method to support multiple files
const uploadMultiple = upload.array('semReports', 10); // Max 10 files

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
      },
      compoundBatchReports: {
        include: {
          compoundBatch: {
            select: {
              id: true,
              batchNumber: true,
              batchName: true,
              totalOutput: true
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
      },
      compoundBatchReports: {
        include: {
          compoundBatch: true
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
router.post('/', uploadMultiple, asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('No files uploaded');
  }
  
  const { reportDate, grapheneIds, compoundBatchIds } = req.body;
  let parsedGrapheneIds = [];
  let parsedCompoundBatchIds = [];
  
  // Parse graphene IDs if provided
  if (grapheneIds) {
    try {
      parsedGrapheneIds = Array.isArray(grapheneIds) ? grapheneIds : JSON.parse(grapheneIds);
    } catch (error) {
      console.error('Error parsing grapheneIds:', error);
    }
  }
  
  // Parse compound batch IDs if provided
  if (compoundBatchIds) {
    try {
      parsedCompoundBatchIds = Array.isArray(compoundBatchIds) ? compoundBatchIds : JSON.parse(compoundBatchIds);
    } catch (error) {
      console.error('Error parsing compoundBatchIds:', error);
    }
  }
  
  const createdReports = [];
  
  // Process each uploaded file
  for (const file of req.files) {
    const uploadResult = await uploadFile(file, 'sem-reports');
    
    if (uploadResult.success) {
      const semReportData = {
        filename: file.filename,
        originalName: file.originalname,
        filePath: uploadResult.path, // Will be Cloudinary URL or local path
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
      
      // Create associations with compound batches if provided
      if (parsedCompoundBatchIds.length > 0) {
        const compoundAssociations = parsedCompoundBatchIds.map(compoundBatchId => ({
          semReportId: semReport.id,
          compoundBatchId: compoundBatchId
        }));
        
        await prisma.compoundBatchSemReport.createMany({
          data: compoundAssociations
        });
      }
      
      createdReports.push(semReport);
    } else {
      console.error('Failed to upload SEM report file:', file.originalname, uploadResult.error);
    }
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
  const { reportDate, grapheneIds, compoundBatchIds } = req.body;
  
  let parsedGrapheneIds = [];
  let parsedCompoundBatchIds = [];
  
  if (grapheneIds) {
    try {
      parsedGrapheneIds = Array.isArray(grapheneIds) ? grapheneIds : JSON.parse(grapheneIds);
    } catch (error) {
      console.error('Error parsing grapheneIds:', error);
    }
  }
  
  if (compoundBatchIds) {
    try {
      parsedCompoundBatchIds = Array.isArray(compoundBatchIds) ? compoundBatchIds : JSON.parse(compoundBatchIds);
    } catch (error) {
      console.error('Error parsing compoundBatchIds:', error);
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
    // Delete existing graphene associations
    await prisma.grapheneSemReport.deleteMany({
      where: { semReportId: id }
    });
    
    // Create new graphene associations
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
  
  // Update compound batch associations if compoundBatchIds provided
  if (compoundBatchIds !== undefined) {
    // Delete existing compound batch associations
    await prisma.compoundBatchSemReport.deleteMany({
      where: { semReportId: id }
    });
    
    // Create new compound batch associations
    if (parsedCompoundBatchIds.length > 0) {
      const compoundAssociations = parsedCompoundBatchIds.map(compoundBatchId => ({
        semReportId: id,
        compoundBatchId: compoundBatchId
      }));
      
      await prisma.compoundBatchSemReport.createMany({
        data: compoundAssociations
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
      },
      compoundBatchReports: {
        include: {
          compoundBatch: {
            select: {
              id: true,
              batchNumber: true,
              batchName: true,
              totalOutput: true
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
    await deleteFileFromStorage(existingReport.filePath);
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