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

export default router;