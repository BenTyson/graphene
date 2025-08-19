#!/usr/bin/env node

/**
 * Database Backup Utility
 * Creates PostgreSQL database backups with timestamps
 * Usage: npm run backup:create
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const MAX_BACKUPS = 10; // Keep last 10 backups

/**
 * Ensure backup directory exists
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
  }
}

/**
 * Get database connection details from environment or .env
 */
function getDatabaseConfig() {
  // Try to load .env file
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    const envVars = {};
    
    envLines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim().replace(/"/g, '');
      }
    });
    
    // Parse DATABASE_URL if present
    if (envVars.DATABASE_URL) {
      const url = new URL(envVars.DATABASE_URL);
      return {
        host: url.hostname,
        port: url.port || '5432',
        database: url.pathname.slice(1), // Remove leading slash
        username: url.username,
        password: url.password
      };
    }
  }
  
  // Fallback to environment variables or defaults
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
    database: process.env.DB_NAME || 'graphene',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || ''
  };
}

/**
 * Create a database backup
 */
async function createBackup() {
  try {
    console.log('🔄 Starting database backup...');
    
    ensureBackupDir();
    const config = getDatabaseConfig();
    
    // Create timestamp for backup filename
    const timestamp = new Date().toISOString()
      .replace(/:/g, '-')
      .replace(/\./g, '-')
      .slice(0, -5); // Remove milliseconds and Z
    
    const backupFileName = `graphene_backup_${timestamp}.sql`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);
    
    // Build pg_dump command
    const pgDumpCmd = [
      'pg_dump',
      `--host=${config.host}`,
      `--port=${config.port}`,
      `--username=${config.username}`,
      '--verbose',
      '--clean',
      '--no-owner',
      '--no-privileges',
      '--format=custom',
      `--file=${backupPath}`,
      config.database
    ].join(' ');
    
    // Set password environment variable
    const env = { ...process.env };
    if (config.password) {
      env.PGPASSWORD = config.password;
    }
    
    console.log(`📋 Database: ${config.database}@${config.host}:${config.port}`);
    console.log(`💾 Backup file: ${backupFileName}`);
    
    // Execute backup
    const { stdout, stderr } = await execAsync(pgDumpCmd, { env });
    
    if (stderr && !stderr.includes('NOTICE')) {
      console.log('⚠️  Backup warnings:', stderr);
    }
    
    // Verify backup file was created
    if (fs.existsSync(backupPath)) {
      const stats = fs.statSync(backupPath);
      console.log(`✅ Backup completed successfully!`);
      console.log(`📁 File: ${backupPath}`);
      console.log(`📦 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      
      // Clean up old backups
      await cleanupOldBackups();
      
      return backupPath;
    } else {
      throw new Error('Backup file was not created');
    }
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    
    if (error.message.includes('pg_dump: command not found')) {
      console.error('💡 Install PostgreSQL client tools: brew install postgresql');
    } else if (error.message.includes('password authentication failed')) {
      console.error('💡 Check your database credentials in .env file');
    } else if (error.message.includes('could not connect to server')) {
      console.error('💡 Make sure PostgreSQL is running and accessible');
    }
    
    process.exit(1);
  }
}

/**
 * List available backups
 */
function listBackups() {
  ensureBackupDir();
  
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('graphene_backup_') && file.endsWith('.sql'))
    .map(file => {
      const filepath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filepath);
      return {
        name: file,
        path: filepath,
        size: stats.size,
        created: stats.birthtime
      };
    })
    .sort((a, b) => b.created - a.created);
  
  if (files.length === 0) {
    console.log('📁 No backups found');
    return [];
  }
  
  console.log('📋 Available backups:');
  files.forEach((file, index) => {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    const age = Math.round((Date.now() - file.created) / (1000 * 60 * 60 * 24));
    console.log(`  ${index + 1}. ${file.name} (${sizeMB} MB, ${age} days old)`);
  });
  
  return files;
}

/**
 * Clean up old backups, keeping only the most recent ones
 */
async function cleanupOldBackups() {
  const backups = listBackups();
  
  if (backups.length > MAX_BACKUPS) {
    const toDelete = backups.slice(MAX_BACKUPS);
    console.log(`🗑️  Cleaning up ${toDelete.length} old backups...`);
    
    toDelete.forEach(backup => {
      fs.unlinkSync(backup.path);
      console.log(`  Deleted: ${backup.name}`);
    });
  }
}

/**
 * Main execution
 */
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'create':
      await createBackup();
      break;
      
    case 'list':
      listBackups();
      break;
      
    case 'cleanup':
      await cleanupOldBackups();
      break;
      
    default:
      console.log(`
Database Backup Utility

Usage:
  npm run backup:create  - Create a new backup
  npm run backup:list    - List available backups  
  npm run backup:cleanup - Remove old backups

Configuration:
  - Backups are stored in ./backups/
  - Keeps last ${MAX_BACKUPS} backups automatically
  - Uses DATABASE_URL from .env or individual DB_* environment variables
      `);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { createBackup, listBackups, cleanupOldBackups };