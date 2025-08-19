#!/usr/bin/env node

/**
 * Database Restore Utility
 * Restores PostgreSQL database from backup files
 * Usage: npm run backup:restore [backup-file]
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUP_DIR = path.join(__dirname, '..', 'backups');

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
 * Get available backup files
 */
function getAvailableBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    return [];
  }
  
  return fs.readdirSync(BACKUP_DIR)
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
}

/**
 * Prompt user for confirmation
 */
function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().startsWith('y'));
    });
  });
}

/**
 * Select backup file interactively
 */
async function selectBackupFile() {
  const backups = getAvailableBackups();
  
  if (backups.length === 0) {
    console.error('❌ No backup files found in ./backups/');
    console.log('💡 Create a backup first: npm run backup:create');
    process.exit(1);
  }
  
  console.log('📋 Available backups:');
  backups.forEach((backup, index) => {
    const sizeMB = (backup.size / 1024 / 1024).toFixed(2);
    const age = Math.round((Date.now() - backup.created) / (1000 * 60 * 60 * 24));
    console.log(`  ${index + 1}. ${backup.name} (${sizeMB} MB, ${age} days old)`);
  });
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('\nSelect backup number (or press Enter for most recent): ', (answer) => {
      rl.close();
      
      if (!answer.trim()) {
        resolve(backups[0].path);
      } else {
        const index = parseInt(answer) - 1;
        if (index >= 0 && index < backups.length) {
          resolve(backups[index].path);
        } else {
          console.error('❌ Invalid selection');
          process.exit(1);
        }
      }
    });
  });
}

/**
 * Restore database from backup
 */
async function restoreBackup(backupPath) {
  try {
    console.log('🔄 Starting database restore...');
    
    // Verify backup file exists
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }
    
    const config = getDatabaseConfig();
    const stats = fs.statSync(backupPath);
    
    console.log(`📋 Database: ${config.database}@${config.host}:${config.port}`);
    console.log(`💾 Backup file: ${path.basename(backupPath)}`);
    console.log(`📦 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Confirm destructive operation
    const confirmed = await askConfirmation(
      `⚠️  This will REPLACE all data in database "${config.database}". Continue? (y/N): `
    );
    
    if (!confirmed) {
      console.log('🛑 Restore cancelled');
      process.exit(0);
    }
    
    // Build pg_restore command
    const pgRestoreCmd = [
      'pg_restore',
      `--host=${config.host}`,
      `--port=${config.port}`,
      `--username=${config.username}`,
      `--dbname=${config.database}`,
      '--verbose',
      '--clean',
      '--if-exists',
      '--no-owner',
      '--no-privileges',
      backupPath
    ].join(' ');
    
    // Set password environment variable
    const env = { ...process.env };
    if (config.password) {
      env.PGPASSWORD = config.password;
    }
    
    console.log('🔄 Restoring database...');
    
    // Execute restore
    const { stdout, stderr } = await execAsync(pgRestoreCmd, { env });
    
    if (stderr && !stderr.includes('NOTICE') && !stderr.includes('WARNING')) {
      console.log('⚠️  Restore warnings:', stderr);
    }
    
    console.log('✅ Database restore completed successfully!');
    console.log('💡 Run "npx prisma generate" to update Prisma client if needed');
    
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    
    if (error.message.includes('pg_restore: command not found')) {
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
 * Main execution
 */
async function main() {
  const backupFile = process.argv[2];
  
  let backupPath;
  
  if (backupFile) {
    // Use specified backup file
    if (path.isAbsolute(backupFile)) {
      backupPath = backupFile;
    } else {
      backupPath = path.join(BACKUP_DIR, backupFile);
    }
  } else {
    // Interactive selection
    backupPath = await selectBackupFile();
  }
  
  await restoreBackup(backupPath);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { restoreBackup };