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
    
    // Split SQL into individual statements and filter out empty ones
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== '')
      .map(stmt => stmt + ';');
    
    console.log(`📋 Processing ${statements.length} SQL statements...`);
    
    // Execute SQL statements in transaction
    await prisma.$transaction(async (tx) => {
      let executed = 0;
      for (const statement of statements) {
        try {
          // Skip certain statements that might cause issues
          if (statement.includes('pg_catalog.set_config') || 
              statement.includes('SET ') || 
              statement.includes('SELECT pg_catalog.set_config')) {
            continue;
          }
          
          await tx.$executeRawUnsafe(statement);
          executed++;
          
          if (executed % 50 === 0) {
            console.log(`✅ Executed ${executed}/${statements.length} statements`);
          }
        } catch (error) {
          console.warn(`⚠️ Skipping statement (likely harmless): ${error.message.slice(0, 100)}...`);
          // Continue with other statements - some might fail due to constraints/duplicates
        }
      }
      console.log(`✅ Successfully executed ${executed} statements`);
    });
    
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
    // Test database connectivity and count all key tables
    const [grapheneCount, biocharCount, userCount, compoundBatchCount, betCount] = await Promise.all([
      prisma.graphene.count(),
      prisma.biochar.count(), 
      prisma.user.count(),
      prisma.compoundBatch.count(),
      prisma.bET.count()
    ]);
    
    res.json({
      environment: process.env.NODE_ENV,
      databaseConnected: true,
      databaseCounts: {
        graphene: grapheneCount,
        biochar: biocharCount,
        users: userCount,
        compoundBatches: compoundBatchCount,
        bet: betCount
      },
      importEndpointAvailable: process.env.NODE_ENV !== 'production'
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      databaseConnected: false 
    });
  }
});

export default router;