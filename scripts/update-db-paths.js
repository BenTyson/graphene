#!/usr/bin/env node

/**
 * Update database file paths from local paths to Cloudinary URLs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:teCvBAtujXRtWeOixMQyDosTqGFdorTI@centerbeam.proxy.rlwy.net:16654/railway"
    }
  }
});

const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dlbztbaaa';

/**
 * Convert local path to Cloudinary URL
 */
function localPathToCloudinaryUrl(localPath) {
  // Remove file extension and encode spaces and special characters
  const pathWithoutExt = localPath.replace(/\.[^.]+$/, '');
  const encodedPath = pathWithoutExt.replace(/ /g, '%20').replace(/\&/g, '%26');
  
  // Get file extension
  const ext = localPath.match(/\.[^.]+$/)?.[0] || '';
  
  // Determine resource type based on extension
  const isRaw = ['.xlsm', '.xlsx', '.docx'].includes(ext.toLowerCase());
  const resourceType = isRaw ? 'raw' : 'image';
  
  // Construct Cloudinary URL
  return `${CLOUDINARY_BASE_URL}/${resourceType}/upload/v1757814746/graphene-uploads/${encodedPath}${isRaw ? ext : ext + '.pdf'}`;
}

async function updateDatabasePaths() {
  console.log('🔄 Updating database file paths to Cloudinary URLs...\n');
  
  const updates = [
    { table: 'sem_reports', column: 'file_path' },
    { table: 'update_reports', column: 'file_path' },
    { table: 'bet', column: 'betReportPath' },
    { table: 'conductivity_tests', column: 'reportPath' },
    { table: 'raman_tests', column: 'reportPath' },
    { table: 'tem_tests', column: 'reportPath' },
  ];
  
  let totalUpdated = 0;
  
  for (const { table, column } of updates) {
    try {
      console.log(`📋 Processing ${table}.${column}...`);
      
      // Get all records with local file paths
      const records = await prisma.$queryRawUnsafe(
        `SELECT id, "${column}" as path FROM "${table}" WHERE "${column}" IS NOT NULL AND "${column}" NOT LIKE 'https://%'`
      );
      
      console.log(`   Found ${records.length} records to update`);
      
      for (const record of records) {
        const newUrl = localPathToCloudinaryUrl(record.path);
        
        await prisma.$executeRawUnsafe(
          `UPDATE "${table}" SET "${column}" = $1 WHERE id = $2`,
          newUrl,
          record.id
        );
        
        console.log(`   ✅ Updated: ${record.path} → ${newUrl}`);
        totalUpdated++;
      }
      
    } catch (error) {
      console.error(`❌ Error updating ${table}.${column}:`, error.message);
    }
  }
  
  console.log(`\n📊 Total records updated: ${totalUpdated}`);
  
  // Verify updates
  console.log('\n🔍 Verification - Sample updated paths:');
  const sample = await prisma.$queryRaw`
    SELECT file_path FROM sem_reports 
    WHERE file_path LIKE 'https://res.cloudinary.com/%' 
    LIMIT 3
  `;
  
  sample.forEach((record, i) => {
    console.log(`   ${i + 1}. ${record.file_path}`);
  });
  
  console.log('\n🎉 Database path update complete!');
}

updateDatabasePaths()
  .catch(console.error)
  .finally(() => prisma.$disconnect());