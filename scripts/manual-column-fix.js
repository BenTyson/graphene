// Manual script to add missing database columns
// Run this directly: node scripts/manual-column-fix.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMissingColumns() {
  console.log('🔧 Manual Column Fix Starting...');
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);
  
  try {
    // Test connection
    console.log('🔗 Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected');

    // Add columns one by one with individual error handling
    const operations = [
      {
        name: 'base_type column for graphene',
        sql: `ALTER TABLE graphene ADD COLUMN IF NOT EXISTS base_type VARCHAR(255);`
      },
      {
        name: 'research_team column for graphene', 
        sql: `ALTER TABLE graphene ADD COLUMN IF NOT EXISTS research_team VARCHAR(255);`
      },
      {
        name: 'research_team column for biochar',
        sql: `ALTER TABLE biochar ADD COLUMN IF NOT EXISTS research_team VARCHAR(255);`
      },
      {
        name: 'GrindingMethod enum type',
        sql: `DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GrindingMethod') THEN
              CREATE TYPE "GrindingMethod" AS ENUM ('MANUAL', 'AUTOMATIC', 'MIXER');
          END IF;
        END $$;`
      },
      {
        name: 'grinding_method column for graphene',
        sql: `ALTER TABLE graphene ADD COLUMN IF NOT EXISTS grinding_method "GrindingMethod";`
      }
    ];

    let successCount = 0;
    let failCount = 0;

    for (const op of operations) {
      try {
        console.log(`\n📝 Attempting: ${op.name}...`);
        console.log(`   SQL: ${op.sql.substring(0, 50)}...`);
        await prisma.$executeRawUnsafe(op.sql);
        console.log(`✅ SUCCESS: ${op.name}`);
        successCount++;
      } catch (error) {
        console.error(`❌ FAILED: ${op.name}`);
        console.error(`   Error Code: ${error.code}`);
        console.error(`   Error Message: ${error.message}`);
        failCount++;
      }
    }

    // Verify results
    console.log('\n🔍 Verifying columns in database...');
    try {
      const result = await prisma.$queryRaw`
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name IN ('graphene', 'biochar') 
        AND column_name IN ('base_type', 'research_team', 'grinding_method')
        ORDER BY table_name, column_name;
      `;
      
      console.log('📋 Current columns found:');
      if (result.length === 0) {
        console.log('   ⚠️ No columns found - they may not have been created');
      } else {
        result.forEach(col => {
          console.log(`   ✓ ${col.table_name}.${col.column_name} (${col.data_type})`);
        });
      }
    } catch (error) {
      console.error('❌ Failed to verify columns:', error.message);
    }

    console.log(`\n📊 Summary: ${successCount} succeeded, ${failCount} failed`);
    
    if (failCount > 0) {
      console.log('\n⚠️ Some operations failed. You may need to run the SQL manually in Railway console.');
      console.log('📄 Check scripts/fix-columns-direct.sql for the SQL commands.');
    } else {
      console.log('\n🎉 All columns added successfully!');
    }
    
  } catch (error) {
    console.error('\n❌ Manual fix script failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
addMissingColumns();