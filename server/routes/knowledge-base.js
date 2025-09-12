import express from 'express';
import asyncHandler from 'express-async-handler';
import { createFileUploadMiddleware, deleteFile } from '../utils/fileUpload.js';
import DocumentProcessingService from '../services/DocumentProcessingService.js';

const router = express.Router();

// Configure file upload middleware for knowledge documents
const uploadKnowledge = createFileUploadMiddleware('knowledge-documents', {
  allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  maxSize: 50 * 1024 * 1024, // 50MB for research documents
  allowedExtensions: ['.pdf', '.doc', '.docx', '.txt'],
  validateContent: true
});

// Get all knowledge documents
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { 
    documentType, 
    documentCategory, 
    processingStatus, 
    page = 1, 
    limit = 20,
    search
  } = req.query;

  try {
    const where = {
      isActive: true
    };

    if (documentType) where.documentType = documentType;
    if (documentCategory) where.documentCategory = documentCategory;
    if (processingStatus) where.processingStatus = processingStatus;
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { keywords: { hasSome: [search] } },
        { authors: { hasSome: [search] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [documents, totalCount] = await Promise.all([
      prisma.knowledgeDocument.findMany({
        where,
        orderBy: [
          { relevanceScore: 'desc' },
          { uploadedAt: 'desc' }
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.knowledgeDocument.count({ where })
    ]);

    res.json({
      documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Knowledge base list error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve knowledge documents',
      details: error.message 
    });
  }
}));

// Get a specific knowledge document
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  try {
    const document = await prisma.knowledgeDocument.findUnique({
      where: { id }
    });

    if (!document) {
      return res.status(404).json({ error: 'Knowledge document not found' });
    }

    res.json(document);

  } catch (error) {
    console.error('Knowledge document fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve knowledge document',
      details: error.message 
    });
  }
}));

// Upload a new knowledge document
router.post('/upload', uploadKnowledge.single('document'), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document file uploaded' });
    }

    const {
      title,
      description,
      documentType,
      documentCategory,
      researchAreas,
      keywords,
      authors,
      publicationDate,
      tags
    } = req.body;

    // Validate required fields
    if (!title || !documentType) {
      // Clean up uploaded file on validation error
      deleteFile(req.file.path);
      return res.status(400).json({ 
        error: 'Title and document type are required' 
      });
    }

    // Parse array fields from form data
    const parseArrayField = (field) => {
      if (!field) return [];
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch {
          return field.split(',').map(item => item.trim()).filter(Boolean);
        }
      }
      return Array.isArray(field) ? field : [field];
    };

    // Calculate content hash for duplicate detection
    const crypto = await import('crypto');
    const fs = await import('fs');
    const fileBuffer = fs.readFileSync(req.file.path);
    const contentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Check for duplicates
    const existingDocument = await prisma.knowledgeDocument.findUnique({
      where: { contentHash }
    });

    if (existingDocument) {
      deleteFile(req.file.path);
      return res.status(409).json({ 
        error: 'Document already exists in knowledge base',
        existingDocument: {
          id: existingDocument.id,
          title: existingDocument.title,
          uploadedAt: existingDocument.uploadedAt
        }
      });
    }

    // Create knowledge document record
    const knowledgeDocument = await prisma.knowledgeDocument.create({
      data: {
        title,
        description: description || null,
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        documentType,
        documentCategory: documentCategory || null,
        researchAreas: parseArrayField(researchAreas),
        keywords: parseArrayField(keywords),
        authors: parseArrayField(authors),
        publicationDate: publicationDate ? new Date(publicationDate) : null,
        tags: parseArrayField(tags),
        contentHash,
        processingStatus: 'PENDING'
      }
    });

    res.status(201).json({
      message: 'Knowledge document uploaded successfully',
      document: knowledgeDocument
    });

  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    console.error('Knowledge document upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload knowledge document',
      details: error.message 
    });
  }
}));

// Update knowledge document metadata
router.patch('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  const updates = req.body;

  try {
    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.filePath;
    delete updates.filename;
    delete updates.fileSize;
    delete updates.contentHash;
    delete updates.uploadedAt;

    const updatedDocument = await prisma.knowledgeDocument.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    });

    res.json({
      message: 'Knowledge document updated successfully',
      document: updatedDocument
    });

  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Knowledge document not found' });
    }
    
    console.error('Knowledge document update error:', error);
    res.status(500).json({ 
      error: 'Failed to update knowledge document',
      details: error.message 
    });
  }
}));

// Delete knowledge document
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  try {
    const document = await prisma.knowledgeDocument.findUnique({
      where: { id }
    });

    if (!document) {
      return res.status(404).json({ error: 'Knowledge document not found' });
    }

    // Delete file from filesystem
    deleteFile(document.filePath);

    // Delete from database
    await prisma.knowledgeDocument.delete({
      where: { id }
    });

    res.json({
      message: 'Knowledge document deleted successfully'
    });

  } catch (error) {
    console.error('Knowledge document delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete knowledge document',
      details: error.message 
    });
  }
}));

// Get document processing status
router.get('/:id/status', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  try {
    const document = await prisma.knowledgeDocument.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        processingStatus: true,
        processingError: true,
        processingAttempts: true,
        lastProcessedAt: true
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Knowledge document not found' });
    }

    res.json(document);

  } catch (error) {
    console.error('Document status fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve document status',
      details: error.message 
    });
  }
}));

// Get document types and categories for UI
router.get('/metadata/options', asyncHandler(async (req, res) => {
  try {
    const documentTypes = [
      'RESEARCH_PAPER',
      'PATENT', 
      'TECHNICAL_REPORT',
      'WHITEPAPER',
      'THESIS',
      'CONFERENCE_PAPER',
      'BOOK_CHAPTER',
      'MANUAL',
      'SPECIFICATION',
      'OTHER'
    ];

    const documentCategories = [
      'GRAPHENE_PRODUCTION',
      'BIOCHAR_PROCESSING',
      'MATERIAL_CHARACTERIZATION',
      'CONDUCTIVITY_TESTING',
      'SURFACE_ANALYSIS',
      'SCALING_METHODS',
      'QUALITY_CONTROL',
      'EQUIPMENT_OPERATION',
      'SAFETY_PROCEDURES',
      'MARKET_ANALYSIS',
      'APPLICATIONS',
      'GENERAL'
    ];

    res.json({
      documentTypes,
      documentCategories
    });

  } catch (error) {
    console.error('Metadata options error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve metadata options',
      details: error.message 
    });
  }
}));

// Process a specific document
router.post('/:id/process', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  try {
    const document = await prisma.knowledgeDocument.findUnique({
      where: { id }
    });

    if (!document) {
      return res.status(404).json({ error: 'Knowledge document not found' });
    }

    // Start processing (runs asynchronously)
    DocumentProcessingService.processDocument(id, prisma)
      .then(result => {
        console.log(`Document processing completed for ${id}:`, result.success);
      })
      .catch(error => {
        console.error(`Document processing failed for ${id}:`, error);
      });

    res.json({
      message: 'Document processing started',
      documentId: id,
      status: 'processing'
    });

  } catch (error) {
    console.error('Document processing trigger error:', error);
    res.status(500).json({ 
      error: 'Failed to start document processing',
      details: error.message 
    });
  }
}));

// Process all pending documents
router.post('/process-all', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  try {
    // Start batch processing (runs asynchronously)
    DocumentProcessingService.processPendingDocuments(prisma)
      .then(results => {
        console.log('Batch processing completed:', results);
      })
      .catch(error => {
        console.error('Batch processing failed:', error);
      });

    res.json({
      message: 'Batch document processing started',
      status: 'processing'
    });

  } catch (error) {
    console.error('Batch processing trigger error:', error);
    res.status(500).json({ 
      error: 'Failed to start batch processing',
      details: error.message 
    });
  }
}));

// Reprocess a specific document (retry failed processing)
router.post('/:id/reprocess', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  try {
    const document = await prisma.knowledgeDocument.findUnique({
      where: { id }
    });

    if (!document) {
      return res.status(404).json({ error: 'Knowledge document not found' });
    }

    // Start reprocessing (runs asynchronously)
    DocumentProcessingService.reprocessDocument(id, prisma)
      .then(result => {
        console.log(`Document reprocessing completed for ${id}:`, result.success);
      })
      .catch(error => {
        console.error(`Document reprocessing failed for ${id}:`, error);
      });

    res.json({
      message: 'Document reprocessing started',
      documentId: id,
      status: 'reprocessing'
    });

  } catch (error) {
    console.error('Document reprocessing trigger error:', error);
    res.status(500).json({ 
      error: 'Failed to start document reprocessing',
      details: error.message 
    });
  }
}));

// Get processing statistics
router.get('/processing/stats', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  try {
    const stats = await prisma.knowledgeDocument.groupBy({
      by: ['processingStatus'],
      _count: {
        processingStatus: true
      }
    });

    const totalDocuments = await prisma.knowledgeDocument.count({
      where: { isActive: true }
    });

    const processingStats = {
      total: totalDocuments,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      skipped: 0
    };

    stats.forEach(stat => {
      processingStats[stat.processingStatus.toLowerCase()] = stat._count.processingStatus;
    });

    // Get recently processed documents
    const recentlyProcessed = await prisma.knowledgeDocument.findMany({
      where: {
        processingStatus: 'COMPLETED',
        lastProcessedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      select: {
        id: true,
        title: true,
        lastProcessedAt: true,
        relevanceScore: true
      },
      orderBy: { lastProcessedAt: 'desc' },
      take: 5
    });

    res.json({
      stats: processingStats,
      recentlyProcessed
    });

  } catch (error) {
    console.error('Processing stats error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve processing statistics',
      details: error.message 
    });
  }
}));

export default router;