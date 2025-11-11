import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Backfill script: Set combinedDate = createdAt for existing MCB records
 * This ensures all MCBs have a combinedDate value after adding the new field
 */
async function backfillMCBCombinedDate() {
  try {
    console.log('🔄 Starting MCB combinedDate backfill...');

    // Find all MCBs without a combinedDate
    const mcbsToUpdate = await prisma.micronizedCompoundBatch.findMany({
      where: {
        combinedDate: null
      },
      select: {
        id: true,
        mcbNumber: true,
        createdAt: true
      }
    });

    console.log(`📊 Found ${mcbsToUpdate.length} MCBs without combinedDate`);

    if (mcbsToUpdate.length === 0) {
      console.log('✅ No MCBs need backfilling. All done!');
      return;
    }

    // Update each MCB to set combinedDate = createdAt
    let successCount = 0;
    let errorCount = 0;

    for (const mcb of mcbsToUpdate) {
      try {
        await prisma.micronizedCompoundBatch.update({
          where: { id: mcb.id },
          data: { combinedDate: mcb.createdAt }
        });
        console.log(`  ✓ Updated ${mcb.mcbNumber}: ${mcb.createdAt.toISOString()}`);
        successCount++;
      } catch (error) {
        console.error(`  ✗ Failed to update ${mcb.mcbNumber}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📈 Backfill Summary:');
    console.log(`  Success: ${successCount}`);
    console.log(`  Errors: ${errorCount}`);
    console.log(`  Total: ${mcbsToUpdate.length}`);

    if (errorCount === 0) {
      console.log('\n✅ MCB combinedDate backfill completed successfully!');
    } else {
      console.log('\n⚠️  Some records failed to update. Please review errors above.');
    }

  } catch (error) {
    console.error('❌ Fatal error during backfill:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backfill
backfillMCBCombinedDate()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
