import express from 'express';
import asyncHandler from 'express-async-handler';

const router = express.Router();

router.get('/competitive-metrics', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  try {
    // Get best BET surface area result
    const bestBET = await prisma.bET.findFirst({
      where: {
        multipointBetArea: { not: null }
      },
      orderBy: {
        multipointBetArea: 'desc'
      },
      include: {
        grapheneRef: {
          select: {
            experimentNumber: true,
            species: true
          }
        },
        compoundBatchRef: {
          select: {
            batchNumber: true,
            batchName: true
          }
        }
      }
    });

    // Get best conductivity result at 20kN
    const bestConductivity = await prisma.conductivityTest.findFirst({
      where: {
        conductivity20kN: { not: null }
      },
      orderBy: {
        conductivity20kN: 'desc'
      },
      include: {
        grapheneRef: {
          select: {
            experimentNumber: true,
            species: true
          }
        },
        compoundBatchRef: {
          select: {
            batchNumber: true,
            batchName: true
          }
        }
      }
    });

    // Get best RAMAN D/G ratio (lowest is best)
    const bestRAMAN = await prisma.ramanTest.findFirst({
      where: {
        integralTypADG1: { not: null }
      },
      orderBy: {
        integralTypADG1: 'asc'
      },
      include: {
        grapheneRef: {
          select: {
            experimentNumber: true,
            species: true
          }
        },
        compoundBatchRef: {
          select: {
            batchNumber: true,
            batchName: true
          }
        }
      }
    });

    // Prepare response data with industry benchmarks
    const analysisData = {
      bet: {
        yourBest: bestBET?.multipointBetArea ? parseFloat(bestBET.multipointBetArea.toString()) : null,
        sampleId: bestBET?.grapheneRef?.experimentNumber || bestBET?.compoundBatchRef?.batchNumber || null,
        sampleType: bestBET?.grapheneRef ? 'graphene' : 'compound',
        species: bestBET?.grapheneRef?.species || bestBET?.compoundBatchRef?.batchName || null,
        status: bestBET?.multipointBetArea ? 
          (parseFloat(bestBET.multipointBetArea.toString()) > 1500 ? 'leading' : 
           parseFloat(bestBET.multipointBetArea.toString()) > 500 ? 'competitive' : 'developing') : null,
        benchmarks: {
          activatedCarbon: '500-2,000 m²/g',
          carbonBlack: '50-1,500 m²/g',
          syntheticGraphite: '1-20 m²/g'
        }
      },
      conductivity: {
        yourBest: bestConductivity?.conductivity20kN ? parseFloat(bestConductivity.conductivity20kN.toString()) : null,
        sampleId: bestConductivity?.grapheneRef?.experimentNumber || bestConductivity?.compoundBatchRef?.batchNumber || null,
        sampleType: bestConductivity?.grapheneRef ? 'graphene' : 'compound',
        species: bestConductivity?.grapheneRef?.species || bestConductivity?.compoundBatchRef?.batchName || null,
        status: bestConductivity?.conductivity20kN ?
          (parseFloat(bestConductivity.conductivity20kN.toString()) > 100 ? 'leading' :
           parseFloat(bestConductivity.conductivity20kN.toString()) > 10 ? 'competitive' : 'developing') : null,
        benchmarks: {
          carbonBlack: '0.1-100 S/cm',
          activatedCarbon: '0.1-10 S/cm',
          syntheticGraphite: '100-10,000 S/cm'
        }
      },
      raman: {
        yourBest: bestRAMAN?.integralTypADG1 ? parseFloat(bestRAMAN.integralTypADG1.toString()) : null,
        sampleId: bestRAMAN?.grapheneRef?.experimentNumber || bestRAMAN?.compoundBatchRef?.batchNumber || null,
        sampleType: bestRAMAN?.grapheneRef ? 'graphene' : 'compound',
        species: bestRAMAN?.grapheneRef?.species || bestRAMAN?.compoundBatchRef?.batchName || null,
        status: bestRAMAN?.integralTypADG1 ?
          (parseFloat(bestRAMAN.integralTypADG1.toString()) < 0.5 ? 'leading' :
           parseFloat(bestRAMAN.integralTypADG1.toString()) < 1.0 ? 'competitive' : 'developing') : null,
        benchmarks: {
          highQualityGraphene: '<0.5',
          commercialGraphite: '0.05-0.2',
          carbonMaterials: '0.8-2.0+'
        }
      }
    };

    res.json({ data: analysisData });

  } catch (error) {
    console.error('Error fetching competitive metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch competitive analysis data',
      message: error.message 
    });
  }
}));

router.get('/chart-data', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  try {
    // Get BET test results from last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const betResults = await prisma.bET.findMany({
      where: {
        AND: [
          { testDate: { gte: twelveMonthsAgo } },
          { multipointBetArea: { not: null } }
        ]
      },
      select: {
        testDate: true,
        multipointBetArea: true,
        grapheneSample: true,
        compoundBatchNumber: true,
        grapheneRef: {
          select: {
            experimentNumber: true,
            species: true
          }
        },
        compoundBatchRef: {
          select: {
            batchNumber: true,
            batchName: true
          }
        }
      },
      orderBy: { testDate: 'asc' }
    });

    // Get Conductivity test results from last 12 months
    const conductivityResults = await prisma.conductivityTest.findMany({
      where: {
        AND: [
          { testDate: { gte: twelveMonthsAgo } },
          { conductivity20kN: { not: null } }
        ]
      },
      select: {
        testDate: true,
        conductivity1kN: true,
        conductivity8kN: true,
        conductivity12kN: true,
        conductivity20kN: true,
        grapheneSample: true,
        compoundBatchNumber: true,
        grapheneRef: {
          select: {
            experimentNumber: true,
            species: true
          }
        },
        compoundBatchRef: {
          select: {
            batchNumber: true,
            batchName: true
          }
        }
      },
      orderBy: { testDate: 'asc' }
    });

    // Get RAMAN test results from last 12 months
    const ramanResults = await prisma.ramanTest.findMany({
      where: {
        AND: [
          { testDate: { gte: twelveMonthsAgo } },
          { integralTypADG1: { not: null } }
        ]
      },
      select: {
        testDate: true,
        integralTypADG1: true,
        integralTypADG2: true,
        grapheneSample: true,
        compoundBatchNumber: true,
        grapheneRef: {
          select: {
            experimentNumber: true,
            species: true
          }
        },
        compoundBatchRef: {
          select: {
            batchNumber: true,
            batchName: true
          }
        }
      },
      orderBy: { testDate: 'asc' }
    });

    // Format data for Chart.js
    const chartData = {
      bet: {
        datasets: [{
          label: 'Our BET Results',
          data: betResults.map(result => ({
            x: result.testDate,
            y: parseFloat(result.multipointBetArea.toString()),
            sampleId: result.grapheneRef?.experimentNumber || result.compoundBatchRef?.batchNumber,
            sampleType: result.grapheneRef ? 'Graphene' : 'Compound Batch',
            species: result.grapheneRef?.species || result.compoundBatchRef?.batchName
          })),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          pointRadius: 6,
          pointHoverRadius: 8
        }],
        benchmarks: {
          activatedCarbon: { min: 500, max: 2000, color: 'rgba(59, 130, 246, 0.1)' },
          carbonBlack: { min: 50, max: 1500, color: 'rgba(147, 51, 234, 0.1)' },
          syntheticGraphite: { min: 1, max: 20, color: 'rgba(107, 114, 128, 0.1)' }
        }
      },
      conductivity: {
        datasets: [
          {
            label: 'Our Results (20kN)',
            data: conductivityResults.map((result, index) => ({
              x: new Date(result.testDate.getTime() + (index * 2 * 60 * 60 * 1000)), // Add 2-hour offset for same-date points
              y: parseFloat(result.conductivity20kN.toString()),
              sampleId: result.grapheneRef?.experimentNumber || result.compoundBatchRef?.batchNumber,
              sampleType: result.grapheneRef ? 'Graphene' : 'Compound Batch',
              species: result.grapheneRef?.species || result.compoundBatchRef?.batchName,
              pressure: '20kN',
              conductivity1kN: result.conductivity1kN ? parseFloat(result.conductivity1kN.toString()) : null,
              conductivity8kN: result.conductivity8kN ? parseFloat(result.conductivity8kN.toString()) : null,
              conductivity12kN: result.conductivity12kN ? parseFloat(result.conductivity12kN.toString()) : null,
              conductivity20kN: parseFloat(result.conductivity20kN.toString())
            })),
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            pointRadius: 6,
            pointHoverRadius: 8
          }
        ],
        benchmarks: {
          carbonBlack: { min: 0.1, max: 100, color: 'rgba(147, 51, 234, 0.1)' },
          activatedCarbon: { min: 0.1, max: 10, color: 'rgba(59, 130, 246, 0.1)' },
          syntheticGraphite: { min: 100, max: 10000, color: 'rgba(107, 114, 128, 0.1)' }
        }
      },
      raman: {
        datasets: [{
          label: 'Our RAMAN D/G Ratios',
          data: ramanResults.map(result => ({
            x: result.testDate,
            y: parseFloat(result.integralTypADG1.toString()),
            sampleId: result.grapheneRef?.experimentNumber || result.compoundBatchRef?.batchNumber,
            sampleType: result.grapheneRef ? 'Graphene' : 'Compound Batch',
            species: result.grapheneRef?.species || result.compoundBatchRef?.batchName
          })),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          pointRadius: 6,
          pointHoverRadius: 8
        }],
        benchmarks: {
          highQuality: { max: 0.5, color: 'rgba(34, 197, 94, 0.1)' },
          commercialGraphite: { min: 0.05, max: 0.2, color: 'rgba(107, 114, 128, 0.1)' },
          carbonMaterials: { min: 0.8, max: 2.0, color: 'rgba(249, 115, 22, 0.1)' }
        }
      }
    };

    res.json({ data: chartData });

  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch chart data',
      message: error.message 
    });
  }
}));

// Get characterization comparison data (combines manual references + system data)
router.get('/characterization-comparison', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { testType = 'BET' } = req.query;

  try {
    // Get manual reference data for the test type
    const references = await prisma.characterizationReference.findMany({
      where: { testType },
      orderBy: { source: 'asc' }
    });

    // Get system test data based on test type
    let systemData = {};

    if (testType === 'BET') {
      // Get best and latest BET results from Curia
      const bestBET = await prisma.bET.findFirst({
        where: {
          multipointBetArea: { not: null }
        },
        orderBy: { multipointBetArea: 'desc' },
        include: {
          grapheneRef: { select: { experimentNumber: true, species: true } },
          compoundBatchRef: { select: { batchNumber: true, batchName: true } }
        }
      });

      const latestBET = await prisma.bET.findFirst({
        where: {
          multipointBetArea: { not: null }
        },
        orderBy: { testDate: 'desc' },
        include: {
          grapheneRef: { select: { experimentNumber: true, species: true } },
          compoundBatchRef: { select: { batchNumber: true, batchName: true } }
        }
      });

      if (bestBET) {
        systemData.curiaBest = {
          value: parseFloat(bestBET.multipointBetArea.toString()),
          unit: 'm²/g',
          type: 'system',
          sampleId: bestBET.grapheneRef?.experimentNumber || bestBET.compoundBatchRef?.batchNumber,
          sampleType: bestBET.grapheneRef ? 'graphene' : 'compound-batch',
          testDate: bestBET.testDate,
          conditions: { lab: bestBET.testingLab }
        };
      }

      if (latestBET) {
        systemData.curiaLatest = {
          value: parseFloat(latestBET.multipointBetArea.toString()),
          unit: 'm²/g',
          type: 'system',
          sampleId: latestBET.grapheneRef?.experimentNumber || latestBET.compoundBatchRef?.batchNumber,
          sampleType: latestBET.grapheneRef ? 'graphene' : 'compound-batch',
          testDate: latestBET.testDate,
          conditions: { lab: latestBET.testingLab }
        };
      }
    } else if (testType === 'Conductivity') {
      // Get best and latest Conductivity results
      const bestConductivity = await prisma.conductivityTest.findFirst({
        where: {
          conductivity20kN: { not: null }
        },
        orderBy: { conductivity20kN: 'desc' },
        include: {
          grapheneRef: { select: { experimentNumber: true, species: true } },
          compoundBatchRef: { select: { batchNumber: true, batchName: true } }
        }
      });

      const latestConductivity = await prisma.conductivityTest.findFirst({
        where: {
          conductivity20kN: { not: null }
        },
        orderBy: { testDate: 'desc' },
        include: {
          grapheneRef: { select: { experimentNumber: true, species: true } },
          compoundBatchRef: { select: { batchNumber: true, batchName: true } }
        }
      });

      if (bestConductivity) {
        systemData.curiaBest = {
          value: parseFloat(bestConductivity.conductivity20kN.toString()),
          unit: 'S/cm',
          type: 'system',
          sampleId: bestConductivity.grapheneRef?.experimentNumber || bestConductivity.compoundBatchRef?.batchNumber,
          sampleType: bestConductivity.grapheneRef ? 'graphene' : 'compound-batch',
          testDate: bestConductivity.testDate,
          conditions: {
            pressure: '20kN',
            '1kN': bestConductivity.conductivity1kN ? parseFloat(bestConductivity.conductivity1kN.toString()) : null,
            '8kN': bestConductivity.conductivity8kN ? parseFloat(bestConductivity.conductivity8kN.toString()) : null,
            '12kN': bestConductivity.conductivity12kN ? parseFloat(bestConductivity.conductivity12kN.toString()) : null
          }
        };
      }

      if (latestConductivity) {
        systemData.curiaLatest = {
          value: parseFloat(latestConductivity.conductivity20kN.toString()),
          unit: 'S/cm',
          type: 'system',
          sampleId: latestConductivity.grapheneRef?.experimentNumber || latestConductivity.compoundBatchRef?.batchNumber,
          sampleType: latestConductivity.grapheneRef ? 'graphene' : 'compound-batch',
          testDate: latestConductivity.testDate,
          conditions: {
            pressure: '20kN',
            '1kN': latestConductivity.conductivity1kN ? parseFloat(latestConductivity.conductivity1kN.toString()) : null,
            '8kN': latestConductivity.conductivity8kN ? parseFloat(latestConductivity.conductivity8kN.toString()) : null,
            '12kN': latestConductivity.conductivity12kN ? parseFloat(latestConductivity.conductivity12kN.toString()) : null
          }
        };
      }
    } else if (testType === 'RAMAN') {
      // Get best and latest RAMAN results
      const bestRAMAN = await prisma.ramanTest.findFirst({
        where: {
          integralTypADG1: { not: null }
        },
        orderBy: { integralTypADG1: 'asc' }, // Lower is better for RAMAN
        include: {
          grapheneRef: { select: { experimentNumber: true, species: true } },
          compoundBatchRef: { select: { batchNumber: true, batchName: true } }
        }
      });

      const latestRAMAN = await prisma.ramanTest.findFirst({
        where: {
          integralTypADG1: { not: null }
        },
        orderBy: { testDate: 'desc' },
        include: {
          grapheneRef: { select: { experimentNumber: true, species: true } },
          compoundBatchRef: { select: { batchNumber: true, batchName: true } }
        }
      });

      if (bestRAMAN) {
        systemData.curiaBest = {
          value: parseFloat(bestRAMAN.integralTypADG1.toString()),
          unit: 'D/G Ratio',
          type: 'system',
          sampleId: bestRAMAN.grapheneRef?.experimentNumber || bestRAMAN.compoundBatchRef?.batchNumber,
          sampleType: bestRAMAN.grapheneRef ? 'graphene' : 'compound-batch',
          testDate: bestRAMAN.testDate,
          conditions: { lab: bestRAMAN.testingLab }
        };
      }

      if (latestRAMAN) {
        systemData.curiaLatest = {
          value: parseFloat(latestRAMAN.integralTypADG1.toString()),
          unit: 'D/G Ratio',
          type: 'system',
          sampleId: latestRAMAN.grapheneRef?.experimentNumber || latestRAMAN.compoundBatchRef?.batchNumber,
          sampleType: latestRAMAN.grapheneRef ? 'graphene' : 'compound-batch',
          testDate: latestRAMAN.testDate,
          conditions: { lab: latestRAMAN.testingLab }
        };
      }
    }

    // Format manual references for response
    const formattedReferences = {};
    references.forEach(ref => {
      const key = ref.source.toLowerCase().replace(/\s+/g, '_').replace(/[.-]/g, '');
      formattedReferences[key] = {
        source: ref.source,
        sourceType: ref.sourceType,
        type: 'manual',
        value: ref.value ? parseFloat(ref.value.toString()) : null,
        valueString: ref.valueString,
        unit: ref.unit,
        isRange: ref.isRange,
        minValue: ref.minValue ? parseFloat(ref.minValue.toString()) : null,
        maxValue: ref.maxValue ? parseFloat(ref.maxValue.toString()) : null,
        conditions: ref.conditions,
        testDate: ref.testDate,
        notes: ref.notes
      };
    });

    // Combine all data sources
    const combinedData = {
      testType,
      sources: {
        ...formattedReferences,
        ...systemData
      }
    };

    res.json({ data: combinedData });

  } catch (error) {
    console.error('Error fetching characterization comparison data:', error);
    res.status(500).json({
      error: 'Failed to fetch characterization comparison data',
      message: error.message
    });
  }
}));

// Get all characterization references
router.get('/characterization-references', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { testType, source, sourceType } = req.query;

  try {
    const where = {};
    if (testType) where.testType = testType;
    if (source) where.source = source;
    if (sourceType) where.sourceType = sourceType;

    const references = await prisma.characterizationReference.findMany({
      where,
      orderBy: [
        { testType: 'asc' },
        { source: 'asc' }
      ]
    });

    res.json({ data: references });

  } catch (error) {
    console.error('Error fetching characterization references:', error);
    res.status(500).json({
      error: 'Failed to fetch characterization references',
      message: error.message
    });
  }
}));

// Create or update characterization reference
router.post('/characterization-references', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const data = req.body;

  try {
    // Validate required fields
    if (!data.source || !data.testType) {
      return res.status(400).json({
        error: 'Source and testType are required fields'
      });
    }

    // Convert string numbers to Decimal if provided
    if (data.value !== undefined && data.value !== null && data.value !== '') {
      data.value = parseFloat(data.value);
    } else {
      data.value = null;
    }

    if (data.minValue !== undefined && data.minValue !== null && data.minValue !== '') {
      data.minValue = parseFloat(data.minValue);
    } else {
      data.minValue = null;
    }

    if (data.maxValue !== undefined && data.maxValue !== null && data.maxValue !== '') {
      data.maxValue = parseFloat(data.maxValue);
    } else {
      data.maxValue = null;
    }

    // Use upsert to create or update based on unique constraint
    const reference = await prisma.characterizationReference.upsert({
      where: {
        source_testType: {
          source: data.source,
          testType: data.testType
        }
      },
      update: {
        sourceType: data.sourceType,
        value: data.value,
        valueString: data.valueString,
        unit: data.unit,
        conditions: data.conditions || {},
        testDate: data.testDate ? new Date(data.testDate) : null,
        notes: data.notes,
        isRange: data.isRange || false,
        minValue: data.minValue,
        maxValue: data.maxValue
      },
      create: {
        source: data.source,
        sourceType: data.sourceType,
        testType: data.testType,
        value: data.value,
        valueString: data.valueString,
        unit: data.unit,
        conditions: data.conditions || {},
        testDate: data.testDate ? new Date(data.testDate) : null,
        notes: data.notes,
        isRange: data.isRange || false,
        minValue: data.minValue,
        maxValue: data.maxValue
      }
    });

    res.json({ data: reference });

  } catch (error) {
    console.error('Error creating/updating characterization reference:', error);
    res.status(500).json({
      error: 'Failed to save characterization reference',
      message: error.message
    });
  }
}));

// Update characterization reference by ID
router.put('/characterization-references/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  const data = req.body;

  try {
    // Convert string numbers to Decimal if provided
    if (data.value !== undefined && data.value !== null && data.value !== '') {
      data.value = parseFloat(data.value);
    }

    if (data.minValue !== undefined && data.minValue !== null && data.minValue !== '') {
      data.minValue = parseFloat(data.minValue);
    }

    if (data.maxValue !== undefined && data.maxValue !== null && data.maxValue !== '') {
      data.maxValue = parseFloat(data.maxValue);
    }

    const reference = await prisma.characterizationReference.update({
      where: { id },
      data: {
        ...data,
        testDate: data.testDate ? new Date(data.testDate) : null,
        conditions: data.conditions || {}
      }
    });

    res.json({ data: reference });

  } catch (error) {
    console.error('Error updating characterization reference:', error);
    res.status(500).json({
      error: 'Failed to update characterization reference',
      message: error.message
    });
  }
}));

// Delete characterization reference
router.delete('/characterization-references/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  try {
    await prisma.characterizationReference.delete({
      where: { id }
    });

    res.json({ message: 'Characterization reference deleted successfully' });

  } catch (error) {
    console.error('Error deleting characterization reference:', error);
    res.status(500).json({
      error: 'Failed to delete characterization reference',
      message: error.message
    });
  }
}));

// Seed characterization references (for staging deployment)
router.post('/characterization-references/seed', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  try {
    // Reference data from seed script
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

    // Clear existing data
    await prisma.characterizationReference.deleteMany({});

    // Insert seed data
    const results = [];
    for (const data of referenceData) {
      const reference = await prisma.characterizationReference.create({
        data
      });
      results.push(reference);
    }

    res.json({
      message: `Successfully seeded ${results.length} characterization references`,
      data: results
    });

  } catch (error) {
    console.error('Error seeding characterization references:', error);
    res.status(500).json({
      error: 'Failed to seed characterization references',
      message: error.message
    });
  }
}));

// Safe seed endpoint for production - only adds missing data, never deletes
router.post('/characterization-references/seed-safe', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  try {
    // Reference data - same as original seed but will use upsert
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

    // Check existing references first
    const existingCount = await prisma.characterizationReference.count();
    console.log(`Found ${existingCount} existing characterization references`);

    // Upsert each reference - creates if not exists, updates if exists
    const results = [];
    let created = 0;
    let updated = 0;

    for (const data of referenceData) {
      try {
        const existing = await prisma.characterizationReference.findUnique({
          where: {
            source_testType: {
              source: data.source,
              testType: data.testType
            }
          }
        });

        const reference = await prisma.characterizationReference.upsert({
          where: {
            source_testType: {
              source: data.source,
              testType: data.testType
            }
          },
          update: {
            sourceType: data.sourceType,
            value: data.value || null,
            valueString: data.valueString || null,
            unit: data.unit,
            isRange: data.isRange || false,
            minValue: data.minValue || null,
            maxValue: data.maxValue || null,
            testDate: data.testDate,
            notes: data.notes,
            conditions: data.conditions || {}
          },
          create: data
        });

        if (existing) {
          updated++;
          console.log(`Updated: ${data.source} - ${data.testType}`);
        } else {
          created++;
          console.log(`Created: ${data.source} - ${data.testType}`);
        }

        results.push(reference);
      } catch (error) {
        console.error(`Error upserting ${data.source} - ${data.testType}:`, error.message);
      }
    }

    const finalCount = await prisma.characterizationReference.count();

    res.json({
      message: `Safe seed completed: ${created} created, ${updated} updated`,
      stats: {
        before: existingCount,
        after: finalCount,
        created,
        updated,
        total: results.length
      },
      data: results
    });

  } catch (error) {
    console.error('Error in safe seed of characterization references:', error);
    res.status(500).json({
      error: 'Failed to safely seed characterization references',
      message: error.message
    });
  }
}));

export default router;