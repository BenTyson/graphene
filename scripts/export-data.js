#!/usr/bin/env node

/**
 * Export database data to JSON format for seeding
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function exportData() {
  try {
    console.log('📤 Exporting local database data...');
    
    // Export all main data tables
    const data = {
      users: await prisma.user.findMany(),
      biochar: await prisma.biochar.findMany(),
      biocharLots: await prisma.biocharLot.findMany(),
      graphene: await prisma.graphene.findMany(),
      compoundBatches: await prisma.compoundBatch.findMany(),
      bet: await prisma.bET.findMany(),
      conductivityTests: await prisma.conductivityTest.findMany(),
      ramanTests: await prisma.ramanTest.findMany(),
      temTests: await prisma.tEMTest.findMany(),
      semReports: await prisma.semReport.findMany(),
      updateReports: await prisma.updateReport.findMany(),
      materialShipments: await prisma.materialShipment.findMany(),
      micronizations: await prisma.micronization.findMany(),
      newsArticles: await prisma.newsArticle.findMany(),
      newsSources: await prisma.newsSource.findMany()
    };
    
    // Calculate totals
    const totals = Object.keys(data).reduce((acc, key) => {
      acc[key] = data[key].length;
      return acc;
    }, {});
    
    console.log('📋 Data export summary:');
    Object.entries(totals).forEach(([table, count]) => {
      if (count > 0) {
        console.log(`  ${table}: ${count} records`);
      }
    });
    
    // Write to JSON file
    const outputPath = path.join(__dirname, '..', 'staging-seed-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    const stats = fs.statSync(outputPath);
    console.log(`✅ Data exported to: ${outputPath}`);
    console.log(`📦 File size: ${(stats.size / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exportData().catch(console.error);
}