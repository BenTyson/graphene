// One-time migration script to add missing columns
import { PrismaClient } from '@prisma/client';

console.log(`🔄 [${new Date().toISOString()}] MIGRATION SCRIPT STARTING`);
console.log('📍 Current working directory:', process.cwd());
console.log('📍 Script path:', import.meta.url);
console.log('📍 Node version:', process.version);

let prisma;

async function runMigration() {
  try {
    console.log(`🔗 [${new Date().toISOString()}] Initializing Prisma client...`);
    prisma = new PrismaClient();
    console.log('✅ Prisma client initialized successfully');

    console.log(`🔗 [${new Date().toISOString()}] Testing database connection...`);
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful');

    console.log(`🏗️ [${new Date().toISOString()}] Starting migration operations...`);
    
    // Add missing columns using raw SQL
    console.log('📝 Executing: ALTER TABLE graphene ADD COLUMN IF NOT EXISTS base_type');
    await prisma.$executeRaw`
      ALTER TABLE graphene ADD COLUMN IF NOT EXISTS base_type VARCHAR(255);
    `;
    console.log('✅ base_type column operation completed');
    
    console.log('📝 Executing: ALTER TABLE graphene ADD COLUMN IF NOT EXISTS research_team');
    await prisma.$executeRaw`
      ALTER TABLE graphene ADD COLUMN IF NOT EXISTS research_team VARCHAR(255);
    `;
    console.log('✅ research_team column operation completed');
    
    console.log('📝 Executing: ALTER TABLE biochar ADD COLUMN IF NOT EXISTS research_team');
    await prisma.$executeRaw`
      ALTER TABLE biochar ADD COLUMN IF NOT EXISTS research_team VARCHAR(255);
    `;
    console.log('✅ biochar research_team column operation completed');
    
    // Create enum type if it doesn't exist
    console.log('📝 Executing: CREATE TYPE GrindingMethod ENUM (if not exists)');
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GrindingMethod') THEN
              CREATE TYPE "GrindingMethod" AS ENUM ('MANUAL', 'AUTOMATIC', 'MIXER');
          END IF;
      END
      $$;
    `;
    console.log('✅ GrindingMethod enum operation completed');
    
    console.log('📝 Executing: ALTER TABLE graphene ADD COLUMN IF NOT EXISTS grinding_method');
    await prisma.$executeRaw`
      ALTER TABLE graphene ADD COLUMN IF NOT EXISTS grinding_method "GrindingMethod";
    `;
    console.log('✅ grinding_method column operation completed');
    
    console.log(`🔍 [${new Date().toISOString()}] Verifying migration results...`);
    
    // Verify columns were added
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'graphene' 
      AND column_name IN ('base_type', 'research_team', 'grinding_method');
    `;
    
    console.log('📋 Migration verification result:', JSON.stringify(result, null, 2));
    console.log(`✅ [${new Date().toISOString()}] MIGRATION COMPLETED SUCCESSFULLY!`);
    
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] MIGRATION FAILED!`);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    if (prisma) {
      console.log(`🔌 [${new Date().toISOString()}] Disconnecting from database...`);
      await prisma.$disconnect();
      console.log('✅ Database disconnected');
    }
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { runMigration };