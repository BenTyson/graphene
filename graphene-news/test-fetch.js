import { PrismaClient } from '@prisma/client';
import { ContentAcquisitionService } from './backend/services/ContentAcquisitionService.js';

const prisma = new PrismaClient();

async function testFetch() {
  try {
    console.log('Testing content acquisition service...');
    
    const service = new ContentAcquisitionService(prisma);
    const results = await service.fetchAllContent();
    
    console.log('Fetch completed successfully!');
    console.log('Results:', results);
    
  } catch (error) {
    console.error('Error during test fetch:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

testFetch();