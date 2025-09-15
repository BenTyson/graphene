import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file upload
const upload = multer({ 
  dest: 'uploads/temp/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * TEMPORARY ENDPOINT: Import SQL data to staging database
 * This endpoint should be removed after importing data
 */
router.post('/import-sql', upload.single('sqlFile'), async (req, res) => {
  try {
    // Security check - only allow in staging/development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ 
        error: 'Import endpoint disabled in production' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No SQL file provided' });
    }

    console.log('📤 Starting SQL import...');
    console.log(`📋 File: ${req.file.originalname}`);
    console.log(`📦 Size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);

    // Read SQL file content
    const sqlContent = fs.readFileSync(req.file.path, 'utf8');
    
    // Execute SQL in transaction
    await prisma.$executeRawUnsafe(sqlContent);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    console.log('✅ SQL import completed successfully');
    
    res.json({
      success: true,
      message: 'Database import completed',
      filename: req.file.originalname,
      size: req.file.size
    });

  } catch (error) {
    console.error('❌ SQL import failed:', error);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      error: 'Import failed',
      message: error.message
    });
  }
});

/**
 * Get import status/info
 */
router.get('/status', async (req, res) => {
  try {
    // Count records in key tables
    const counts = await Promise.all([
      prisma.graphene.count(),
      prisma.biochar.count(),
      prisma.users.count(),
      prisma.compoundBatch.count()
    ]);

    res.json({
      environment: process.env.NODE_ENV,
      databaseCounts: {
        graphene: counts[0],
        biochar: counts[1], 
        users: counts[2],
        compoundBatches: counts[3]
      },
      importEndpointAvailable: process.env.NODE_ENV !== 'production'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;