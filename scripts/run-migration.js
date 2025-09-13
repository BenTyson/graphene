// One-time migration script to add missing columns
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runMigration() {
  console.log('🔄 Running production database migration...');
  
  try {
    // Add missing columns using raw SQL
    await prisma.$executeRaw`
      ALTER TABLE graphene ADD COLUMN IF NOT EXISTS base_type VARCHAR(255);
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE graphene ADD COLUMN IF NOT EXISTS research_team VARCHAR(255);
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE biochar ADD COLUMN IF NOT EXISTS research_team VARCHAR(255);
    `;
    
    // Create enum type if it doesn't exist
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GrindingMethod') THEN
              CREATE TYPE "GrindingMethod" AS ENUM ('MANUAL', 'AUTOMATIC', 'MIXER');
          END IF;
      END
      $$;
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE graphene ADD COLUMN IF NOT EXISTS grinding_method "GrindingMethod";
    `;
    
    console.log('✅ Migration completed successfully!');
    
    // Verify columns were added
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'graphene' 
      AND column_name IN ('base_type', 'research_team', 'grinding_method');
    `;
    
    console.log('📋 Added columns:', result);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
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