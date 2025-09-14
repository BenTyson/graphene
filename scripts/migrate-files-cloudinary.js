#!/usr/bin/env node

/**
 * Cloudinary File Migration Script
 * Uploads all local files to Cloudinary and updates database paths
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Cloudinary config
dotenv.config({ path: path.join(__dirname, '..', '.env.cloudinary') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Track migration progress
let stats = {
  processed: 0,
  successful: 0,
  failed: 0,
  skipped: 0,
  totalSize: 0,
  startTime: Date.now()
};

/**
 * Get all files in uploads directory with their relative paths
 */
function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else if (stat.isFile() && item !== '.gitkeep') {
      const relativePath = path.relative(baseDir, fullPath);
      files.push({
        fullPath,
        relativePath: relativePath.replace(/\\\\/g, '/'), // Normalize path separators
        size: stat.size
      });
    }
  }
  
  return files;
}

/**
 * Upload file to Cloudinary
 */
async function uploadToCloudinary(file) {
  try {
    console.log(`📤 Uploading: ${file.relativePath} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    
    const result = await cloudinary.uploader.upload(file.fullPath, {
      // Use the original path structure as the public_id
      public_id: file.relativePath.replace(/\\.[^.]+$/, ''), // Remove file extension
      resource_type: 'auto', // Auto-detect file type
      folder: 'graphene-uploads', // Optional: organize in folder
    });
    
    console.log(`✅ Success: ${result.secure_url}`);
    return {
      success: true,
      originalPath: file.relativePath,
      cloudinaryUrl: result.secure_url,
      publicId: result.public_id
    };
    
  } catch (error) {
    console.error(`❌ Failed: ${file.relativePath} - ${error.message}`);
    return {
      success: false,
      originalPath: file.relativePath,
      error: error.message
    };
  }
}

/**
 * Update database file paths
 */
async function updateDatabasePaths(pathMappings) {
  console.log('\\n🔄 Updating database file paths...');
  
  const tables = [
    { table: 'sem_reports', column: 'file_path' },
    { table: 'update_reports', column: 'file_path' },
    { table: 'bet', column: 'betReportPath' },
    { table: 'conductivity_tests', column: 'reportPath' },
    { table: 'raman_tests', column: 'reportPath' },
    { table: 'tem_tests', column: 'reportPath' },
  ];
  
  let totalUpdated = 0;
  
  for (const { table, column } of tables) {
    try {
      for (const [oldPath, newUrl] of Object.entries(pathMappings)) {
        const query = `UPDATE "${table}" SET "${column}" = $1 WHERE "${column}" = $2`;
        const result = await prisma.$executeRawUnsafe(query, newUrl, oldPath);
        
        if (result > 0) {
          console.log(`✅ Updated ${result} records in ${table}.${column}: ${oldPath} → ${newUrl}`);
          totalUpdated += result;
        }
      }
    } catch (error) {
      console.error(`⚠️  Error updating ${table}.${column}:`, error.message);
    }
  }
  
  console.log(`\\n📊 Total database records updated: ${totalUpdated}`);
  return totalUpdated;
}

/**
 * Main migration function
 */
async function migrateFiles() {
  console.log('🚀 Starting Cloudinary File Migration');
  console.log('=====================================\\n');
  
  // Check Cloudinary config
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error('❌ Missing CLOUDINARY_CLOUD_NAME in .env.cloudinary');
    process.exit(1);
  }
  
  // Test Cloudinary connection
  try {
    await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful\\n');
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    process.exit(1);
  }
  
  // Get all files
  const files = getAllFiles(UPLOADS_DIR);
  stats.totalSize = files.reduce((sum, file) => sum + file.size, 0);
  
  console.log(`📁 Found ${files.length} files (${(stats.totalSize / 1024 / 1024).toFixed(2)}MB total)`);
  console.log('Files by directory:');
  
  const filesByDir = files.reduce((acc, file) => {
    const dir = path.dirname(file.relativePath);
    acc[dir] = (acc[dir] || 0) + 1;
    return acc;
  }, {});
  
  Object.entries(filesByDir).forEach(([dir, count]) => {
    console.log(`  ${dir}: ${count} files`);
  });
  
  console.log('\\n🔄 Starting uploads...\\n');
  
  // Upload files
  const pathMappings = {};
  const failedFiles = [];
  
  for (const file of files) {
    stats.processed++;
    const result = await uploadToCloudinary(file);
    
    if (result.success) {
      stats.successful++;
      pathMappings[result.originalPath] = result.cloudinaryUrl;
    } else {
      stats.failed++;
      failedFiles.push(result);
    }
    
    // Progress update every 10 files
    if (stats.processed % 10 === 0) {
      const progress = (stats.processed / files.length * 100).toFixed(1);
      console.log(`\\n📊 Progress: ${progress}% (${stats.processed}/${files.length})`);
    }
  }
  
  // Update database
  if (Object.keys(pathMappings).length > 0) {
    await updateDatabasePaths(pathMappings);
  }
  
  // Final report
  const duration = (Date.now() - stats.startTime) / 1000;
  console.log('\\n🎉 Migration Complete!');
  console.log('======================');
  console.log(`📊 Processed: ${stats.processed} files`);
  console.log(`✅ Successful: ${stats.successful}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`⏱️  Duration: ${duration.toFixed(1)} seconds`);
  console.log(`💾 Total size: ${(stats.totalSize / 1024 / 1024).toFixed(2)}MB`);
  
  if (failedFiles.length > 0) {
    console.log('\\n❌ Failed files:');
    failedFiles.forEach(file => {
      console.log(`  ${file.originalPath}: ${file.error}`);
    });
  }
  
  console.log('\\n🔗 Your files are now available on Cloudinary!');
  console.log('Next: Test your Railway app - file links should now work.');
}

// Run migration
migrateFiles()
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });