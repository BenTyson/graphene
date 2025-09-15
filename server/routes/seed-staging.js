import express from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * TEMPORARY ENDPOINT: Seed staging database with JSON data
 * This endpoint should be removed after seeding
 */
router.post('/seed', async (req, res) => {
  try {
    // Security check - only allow in staging/development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ 
        error: 'Seed endpoint disabled in production' 
      });
    }

    console.log('🌱 Starting database seeding...');
    
    // Load seed data from JSON file
    const seedDataPath = path.join(__dirname, '..', '..', 'staging-seed-data.json');
    if (!fs.existsSync(seedDataPath)) {
      return res.status(400).json({ error: 'Seed data file not found' });
    }
    
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
    let totalInserted = 0;
    
    // Clear existing data first (except users - keep the existing staging user)
    console.log('🗑️ Clearing existing data...');
    await prisma.newsArticle.deleteMany();
    await prisma.newsSource.deleteMany();
    await prisma.micronization.deleteMany();
    await prisma.materialShipment.deleteMany();
    await prisma.updateReport.deleteMany();
    await prisma.semReport.deleteMany();
    await prisma.tEMTest.deleteMany();
    await prisma.ramanTest.deleteMany();
    await prisma.conductivityTest.deleteMany();
    await prisma.bET.deleteMany();
    await prisma.compoundBatch.deleteMany();
    await prisma.graphene.deleteMany();
    await prisma.biochar.deleteMany();
    await prisma.biocharLot.deleteMany();
    
    // Seed data in order (respecting foreign key dependencies)
    
    // 1. Biochar lots first (referenced by biochar)
    if (seedData.biocharLots?.length > 0) {
      console.log(`📋 Seeding ${seedData.biocharLots.length} biochar lots...`);
      for (const lot of seedData.biocharLots) {
        await prisma.biocharLot.create({ data: lot });
        totalInserted++;
      }
    }
    
    // 2. Biochar
    if (seedData.biochar?.length > 0) {
      console.log(`📋 Seeding ${seedData.biochar.length} biochar records...`);
      for (const record of seedData.biochar) {
        await prisma.biochar.create({ data: record });
        totalInserted++;
      }
    }
    
    // 3. Graphene
    if (seedData.graphene?.length > 0) {
      console.log(`📋 Seeding ${seedData.graphene.length} graphene records...`);
      for (const record of seedData.graphene) {
        await prisma.graphene.create({ data: record });
        totalInserted++;
      }
    }
    
    // 4. Compound batches
    if (seedData.compoundBatches?.length > 0) {
      console.log(`📋 Seeding ${seedData.compoundBatches.length} compound batches...`);
      for (const record of seedData.compoundBatches) {
        await prisma.compoundBatch.create({ data: record });
        totalInserted++;
      }
    }
    
    // 5. Test results
    if (seedData.bet?.length > 0) {
      console.log(`📋 Seeding ${seedData.bet.length} BET tests...`);
      for (const record of seedData.bet) {
        await prisma.bET.create({ data: record });
        totalInserted++;
      }
    }
    
    if (seedData.conductivityTests?.length > 0) {
      console.log(`📋 Seeding ${seedData.conductivityTests.length} conductivity tests...`);
      for (const record of seedData.conductivityTests) {
        await prisma.conductivityTest.create({ data: record });
        totalInserted++;
      }
    }
    
    if (seedData.ramanTests?.length > 0) {
      console.log(`📋 Seeding ${seedData.ramanTests.length} RAMAN tests...`);
      for (const record of seedData.ramanTests) {
        await prisma.ramanTest.create({ data: record });
        totalInserted++;
      }
    }
    
    if (seedData.temTests?.length > 0) {
      console.log(`📋 Seeding ${seedData.temTests.length} TEM tests...`);
      for (const record of seedData.temTests) {
        await prisma.tEMTest.create({ data: record });
        totalInserted++;
      }
    }
    
    // 6. Reports
    if (seedData.semReports?.length > 0) {
      console.log(`📋 Seeding ${seedData.semReports.length} SEM reports...`);
      for (const record of seedData.semReports) {
        await prisma.semReport.create({ data: record });
        totalInserted++;
      }
    }
    
    if (seedData.updateReports?.length > 0) {
      console.log(`📋 Seeding ${seedData.updateReports.length} update reports...`);
      for (const record of seedData.updateReports) {
        await prisma.updateReport.create({ data: record });
        totalInserted++;
      }
    }
    
    // 7. Shipments and micronizations
    if (seedData.micronizations?.length > 0) {
      console.log(`📋 Seeding ${seedData.micronizations.length} micronizations...`);
      for (const record of seedData.micronizations) {
        await prisma.micronization.create({ data: record });
        totalInserted++;
      }
    }
    
    if (seedData.materialShipments?.length > 0) {
      console.log(`📋 Seeding ${seedData.materialShipments.length} material shipments...`);
      for (const record of seedData.materialShipments) {
        await prisma.materialShipment.create({ data: record });
        totalInserted++;
      }
    }
    
    // 8. News data
    if (seedData.newsSources?.length > 0) {
      console.log(`📋 Seeding ${seedData.newsSources.length} news sources...`);
      for (const record of seedData.newsSources) {
        await prisma.newsSource.create({ data: record });
        totalInserted++;
      }
    }
    
    if (seedData.newsArticles?.length > 0) {
      console.log(`📋 Seeding ${seedData.newsArticles.length} news articles...`);
      for (const record of seedData.newsArticles) {
        await prisma.newsArticle.create({ data: record });
        totalInserted++;
      }
    }
    
    console.log(`✅ Seeding completed: ${totalInserted} records inserted`);
    
    res.json({
      success: true,
      message: 'Database seeding completed',
      recordsInserted: totalInserted
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    
    res.status(500).json({
      error: 'Seeding failed',
      message: error.message
    });
  }
});

/**
 * Clear all data from staging database
 */
router.post('/clear', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ 
        error: 'Clear endpoint disabled in production' 
      });
    }

    console.log('🗑️ Clearing all staging data...');
    
    // Clear in reverse dependency order
    await prisma.newsArticle.deleteMany();
    await prisma.newsSource.deleteMany();
    await prisma.micronization.deleteMany();
    await prisma.materialShipment.deleteMany();
    await prisma.updateReport.deleteMany();
    await prisma.semReport.deleteMany();
    await prisma.tEMTest.deleteMany();
    await prisma.ramanTest.deleteMany();
    await prisma.conductivityTest.deleteMany();
    await prisma.bET.deleteMany();
    await prisma.compoundBatch.deleteMany();
    await prisma.graphene.deleteMany();
    await prisma.biochar.deleteMany();
    await prisma.biocharLot.deleteMany();
    
    res.json({ success: true, message: 'All data cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;