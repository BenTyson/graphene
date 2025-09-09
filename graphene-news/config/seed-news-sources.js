import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function seedNewsSources() {
  try {
    console.log('Starting news sources seeding...');
    
    // Read the news sources configuration
    const configPath = join(__dirname, 'news-sources.json');
    const configData = JSON.parse(readFileSync(configPath, 'utf8'));
    
    // Clear existing sources (optional - comment out if you want to preserve existing data)
    console.log('Clearing existing news sources...');
    await prisma.newsSource.deleteMany({});
    console.log('Existing sources cleared');
    
    // Seed new sources
    console.log('Seeding news sources...');
    
    for (const sourceData of configData.sources) {
      const source = await prisma.newsSource.create({
        data: {
          name: sourceData.name,
          url: sourceData.url,
          sourceType: sourceData.sourceType,
          rateLimit: sourceData.rateLimit,
          isActive: sourceData.isActive,
          reliabilityScore: sourceData.reliabilityScore,
          termsAccepted: sourceData.termsAccepted
        }
      });
      
      console.log(`Created source: ${source.name}`);
    }
    
    // Get count of created sources
    const sourceCount = await prisma.newsSource.count();
    console.log(`Successfully seeded ${sourceCount} news sources`);
    
    // Display summary
    const sources = await prisma.newsSource.findMany({
      select: {
        name: true,
        sourceType: true,
        isActive: true,
        reliabilityScore: true
      },
      orderBy: {
        reliabilityScore: 'desc'
      }
    });
    
    console.log('\nSeeded sources summary:');
    console.log('========================');
    sources.forEach(source => {
      console.log(`${source.name} (${source.sourceType}) - Active: ${source.isActive}, Reliability: ${source.reliabilityScore}`);
    });
    
  } catch (error) {
    console.error('Error seeding news sources:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedNewsSources()
    .then(() => {
      console.log('\nNews sources seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('News sources seeding failed:', error);
      process.exit(1);
    });
}

export { seedNewsSources };