import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

const referenceData = [
  // Dr. Li Academic Research
  {
    source: 'Dr. Li',
    sourceType: 'academic',
    testType: 'BET',
    value: 1505,
    unit: 'm²/g',
    testDate: new Date('2024-01-15'),
    notes: 'Small scale lab setting baseline',
    conditions: { lab: 'Academic Research Lab', method: 'Standard BET' }
  },
  {
    source: 'Dr. Li',
    sourceType: 'academic',
    testType: 'Conductivity',
    value: 2.26,
    unit: 'S/cm',
    testDate: new Date('2024-01-15'),
    notes: 'Pressure conditions unknown',
    conditions: { pressure: 'unknown' }
  },

  // GEIC Characterization
  {
    source: 'GEIC Raw',
    sourceType: 'external_lab',
    testType: 'BET',
    value: 1476,
    unit: 'm²/g',
    testDate: new Date('2025-02-01'),
    notes: 'Un-milled master batch',
    conditions: { sample: 'unmilled', lab: 'GEIC' }
  },
  {
    source: 'GEIC Milled',
    sourceType: 'external_lab',
    testType: 'BET',
    value: 1729,
    unit: 'm²/g',
    testDate: new Date('2025-02-01'),
    notes: 'Milled master batch',
    conditions: { sample: 'milled', lab: 'GEIC' }
  },
  {
    source: 'GEIC',
    sourceType: 'external_lab',
    testType: 'Conductivity',
    value: 0.14,
    unit: 'S/cm',
    testDate: new Date('2025-02-01'),
    notes: 'Lower than Curia results',
    conditions: { pressure: '20kN', lab: 'GEIC' }
  },

  // ISO Standards
  {
    source: 'ISO 9277',
    sourceType: 'standard',
    testType: 'BET',
    isRange: true,
    minValue: 1200,
    maxValue: 2000,
    unit: 'm²/g',
    notes: 'Standard for BET surface area measurement',
    conditions: { standard: 'ISO 9277' }
  },

  // ASTM Standards
  {
    source: 'ASTM D6556',
    sourceType: 'standard',
    testType: 'BET',
    isRange: true,
    minValue: 1000,
    maxValue: 2500,
    unit: 'm²/g',
    notes: 'ASTM standard for carbon black surface area',
    conditions: { standard: 'ASTM D6556' }
  },

  // Additional test types for demonstration
  {
    source: 'Dr. Li',
    sourceType: 'academic',
    testType: 'RAMAN',
    valueString: 'Peaks are broad, difficult to define',
    unit: 'D/G Ratio',
    testDate: new Date('2024-01-15'),
    notes: 'Qualitative assessment',
    conditions: { lab: 'Academic Research Lab' }
  },

  {
    source: 'GEIC',
    sourceType: 'external_lab',
    testType: 'RAMAN',
    valueString: 'Peaks are broad, difficult to define',
    unit: 'D/G Ratio',
    testDate: new Date('2025-02-01'),
    notes: 'Similar to Dr. Li findings',
    conditions: { lab: 'GEIC' }
  },

  {
    source: 'ISO 21551',
    sourceType: 'standard',
    testType: 'RAMAN',
    isRange: true,
    minValue: 0.05,
    maxValue: 0.2,
    unit: 'D/G Ratio',
    notes: 'Commercial graphite quality range',
    conditions: { standard: 'ISO 21551' }
  }
];

async function seedCharacterizationReferences() {
  console.log('🌱 Seeding characterization reference data...');

  try {
    // Clear existing data (optional - comment out if you want to preserve existing data)
    console.log('Clearing existing reference data...');
    await prisma.characterizationReference.deleteMany({});

    // Insert seed data
    console.log('Inserting reference data...');
    for (const data of referenceData) {
      await prisma.characterizationReference.create({
        data
      });
      console.log(`✅ Added: ${data.source} - ${data.testType}`);
    }

    console.log(`\n🎉 Successfully seeded ${referenceData.length} characterization references!`);

    // Display summary
    const summary = await prisma.characterizationReference.groupBy({
      by: ['testType'],
      _count: {
        id: true
      }
    });

    console.log('\n📊 Summary by test type:');
    summary.forEach(item => {
      console.log(`  ${item.testType}: ${item._count.id} references`);
    });

  } catch (error) {
    console.error('❌ Error seeding characterization references:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedCharacterizationReferences()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });