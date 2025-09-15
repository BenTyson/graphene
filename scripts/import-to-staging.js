#!/usr/bin/env node

/**
 * Import local data to staging database via API
 * Uploads the SQL file and executes it on staging
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STAGING_URL = 'https://hg-staging-production.up.railway.app';
const SQL_FILE = path.join(__dirname, '..', 'staging_data.sql');

async function importDataToStaging() {
  try {
    console.log('📤 Importing local data to staging database...');
    
    // Check if SQL file exists
    if (!fs.existsSync(SQL_FILE)) {
      throw new Error('SQL file not found. Run pg_dump first.');
    }
    
    const sqlContent = fs.readFileSync(SQL_FILE, 'utf8');
    const fileSizeMB = (fs.statSync(SQL_FILE).size / 1024 / 1024).toFixed(2);
    
    console.log(`📋 SQL file: ${path.basename(SQL_FILE)}`);
    console.log(`📦 Size: ${fileSizeMB} MB`);
    
    // For now, just output instructions since we need to create the API endpoint
    console.log(`
📋 Manual Import Instructions:

1. The SQL file is ready: ${SQL_FILE}
2. You can either:
   
   Option A: Railway Dashboard Import
   - Go to Railway dashboard → Staging project → PostgreSQL service
   - Use the "Import" feature to upload ${path.basename(SQL_FILE)}
   
   Option B: Direct connection (if available)
   - Use a database client like pgAdmin or DBeaver
   - Connect to staging database with the URL you provided
   - Execute the SQL file
   
   Option C: Create API endpoint (advanced)
   - Add a temporary /api/import route to staging
   - Upload and execute the SQL via the staging app
   
The SQL file contains all your local data with INSERT statements.
It's ${fileSizeMB} MB and includes all tables with data.
    `);
    
  } catch (error) {
    console.error('❌ Import preparation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importDataToStaging().catch(console.error);
}