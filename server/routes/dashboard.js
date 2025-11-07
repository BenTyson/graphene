import express from 'express';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Get production metrics
router.get('/production-metrics', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  try {
    // Total graphene produced (sum of all outputs)
    const totalProduction = await prisma.graphene.aggregate({
      _sum: {
        output: true
      }
    });
    
    // Count of all experiments
    const totalExperiments = await prisma.graphene.count();
    
    // Average output per experiment
    const avgOutput = await prisma.graphene.aggregate({
      _avg: {
        output: true
      }
    });
    
    // Current month production
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);
    
    const currentMonthProduction = await prisma.graphene.aggregate({
      where: {
        experimentDate: {
          gte: currentMonthStart
        }
      },
      _sum: {
        output: true
      },
      _count: true
    });
    
    // Previous month production
    const previousMonthStart = new Date(currentMonthStart);
    previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
    const previousMonthEnd = new Date(currentMonthStart);
    previousMonthEnd.setDate(0);
    
    const previousMonthProduction = await prisma.graphene.aggregate({
      where: {
        experimentDate: {
          gte: previousMonthStart,
          lt: currentMonthStart
        }
      },
      _sum: {
        output: true
      },
      _count: true
    });
    
    // Recent experiments (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentExperiments = await prisma.graphene.count({
      where: {
        experimentDate: {
          gte: sevenDaysAgo
        }
      }
    });
    
    // Production by month (last 6 months)
    const monthlyProduction = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const monthData = await prisma.graphene.aggregate({
        where: {
          experimentDate: {
            gte: monthStart,
            lt: monthEnd
          }
        },
        _sum: {
          output: true
        },
        _count: true
      });
      
      monthlyProduction.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        production: monthData._sum.output || 0,
        experiments: monthData._count || 0
      });
    }
    
    res.json({
      totalProduction: totalProduction._sum.output || 0,
      totalExperiments,
      averageOutput: avgOutput._avg.output || 0,
      currentMonth: {
        production: currentMonthProduction._sum.output || 0,
        experiments: currentMonthProduction._count || 0
      },
      previousMonth: {
        production: previousMonthProduction._sum.output || 0,
        experiments: previousMonthProduction._count || 0
      },
      recentExperiments,
      monthlyTrend: monthlyProduction
    });
  } catch (error) {
    console.error('Error fetching production metrics:', error);
    res.status(500).json({ error: 'Failed to fetch production metrics' });
  }
}));

// Get inventory by location with micronization accounting
router.get('/inventory-by-location', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  try {
    // Get all unique locations
    const locations = await prisma.materialShipment.findMany({
      select: {
        shipToLocation: true,
        shipFromLocation: true
      },
      distinct: ['shipToLocation', 'shipFromLocation']
    });
    
    const uniqueLocations = new Set();
    locations.forEach(l => {
      if (l.shipToLocation) uniqueLocations.add(l.shipToLocation);
      if (l.shipFromLocation) uniqueLocations.add(l.shipFromLocation);
    });
    
    // Get total production for Curia Frankfurt (origin location)
    const totalProduction = await prisma.graphene.aggregate({
      _sum: {
        output: true
      }
    });
    
    // Get all micronization data grouped by location to track transformations
    // EXCLUDE micronizations that are part of an MCB to avoid double-counting
    const micronizations = await prisma.micronization.findMany({
      where: {
        mcbMembership: null  // Only count micronizations NOT in an MCB
      },
      select: {
        startingMaterialAmount: true,
        recoveredAmount: true,
        micronizationLocation: true,
        grapheneSample: true,
        compoundBatchNumber: true
      }
    });

    // Get all MCBs grouped by location
    const mcbs = await prisma.micronizedCompoundBatch.findMany({
      select: {
        totalRecoveredAmount: true,
        mcbLocation: true
      }
    });
    
    // Calculate micronization totals by location (excluding MCB members)
    const micronizationByLocation = {};
    let totalMicronizationInput = 0;
    let totalMicronizationRecovered = 0;

    micronizations.forEach(m => {
      const input = m.startingMaterialAmount ? parseFloat(m.startingMaterialAmount) : 0;
      const recovered = m.recoveredAmount ? parseFloat(m.recoveredAmount) : 0;
      const location = m.micronizationLocation || 'Unknown';

      if (!micronizationByLocation[location]) {
        micronizationByLocation[location] = { input: 0, recovered: 0 };
      }

      micronizationByLocation[location].input += input;
      micronizationByLocation[location].recovered += recovered;

      totalMicronizationInput += input;
      totalMicronizationRecovered += recovered;
    });

    // Calculate MCB totals by location
    const mcbByLocation = {};
    let totalMCBAmount = 0;

    mcbs.forEach(mcb => {
      const amount = mcb.totalRecoveredAmount ? parseFloat(mcb.totalRecoveredAmount) : 0;
      const location = mcb.mcbLocation || 'Unknown';

      if (!mcbByLocation[location]) {
        mcbByLocation[location] = 0;
      }

      mcbByLocation[location] += amount;
      totalMCBAmount += amount;
    });

    const micronizationLoss = totalMicronizationInput - totalMicronizationRecovered;
    
    // Calculate true physical inventory at each location
    const locationInventory = {};
    
    for (const location of uniqueLocations) {
      // Raw graphene shipments IN and OUT
      const rawGrapheneIn = await prisma.materialShipment.aggregate({
        where: {
          shipToLocation: location,
          status: 'received',
          grapheneSample: { not: null }
        },
        _sum: { amountShipped: true }
      });
      
      const rawGrapheneOut = await prisma.materialShipment.aggregate({
        where: {
          shipFromLocation: location,
          status: { in: ['shipped', 'in_transit', 'received'] },
          grapheneSample: { not: null }
        },
        _sum: { amountShipped: true }
      });
      
      // Compound batch shipments IN
      const compoundBatchIn = await prisma.materialShipment.aggregate({
        where: {
          shipToLocation: location,
          status: 'received',
          compoundBatchNumber: { not: null }
        },
        _sum: { amountShipped: true }
      });
      
      // Compound batch shipments OUT  
      const compoundBatchOut = await prisma.materialShipment.aggregate({
        where: {
          shipFromLocation: location,
          status: { in: ['shipped', 'in_transit', 'received'] },
          compoundBatchNumber: { not: null }
        },
        _sum: { amountShipped: true }
      });
      
      // Micronized material shipments IN and OUT (individual micronizations)
      const micronizedIn = await prisma.materialShipment.aggregate({
        where: {
          shipToLocation: location,
          status: 'received',
          micronizationSku: { not: null }
        },
        _sum: { amountShipped: true }
      });

      const micronizedOut = await prisma.materialShipment.aggregate({
        where: {
          shipFromLocation: location,
          status: { in: ['shipped', 'in_transit', 'received'] },
          micronizationSku: { not: null }
        },
        _sum: { amountShipped: true }
      });

      // MCB shipments IN and OUT
      const mcbIn = await prisma.materialShipment.aggregate({
        where: {
          shipToLocation: location,
          status: 'received',
          mcbNumber: { not: null }
        },
        _sum: { amountShipped: true }
      });

      const mcbOut = await prisma.materialShipment.aggregate({
        where: {
          shipFromLocation: location,
          status: { in: ['shipped', 'in_transit', 'received'] },
          mcbNumber: { not: null }
        },
        _sum: { amountShipped: true }
      });
      
      const rawGrapheneInAmount = rawGrapheneIn._sum.amountShipped || 0;
      const rawGrapheneOutAmount = rawGrapheneOut._sum.amountShipped || 0;
      const compoundBatchInAmount = compoundBatchIn._sum.amountShipped || 0;
      const compoundBatchOutAmount = compoundBatchOut._sum.amountShipped || 0;
      const micronizedInAmount = micronizedIn._sum.amountShipped || 0;
      const micronizedOutAmount = micronizedOut._sum.amountShipped || 0;
      const mcbInAmount = mcbIn._sum.amountShipped || 0;
      const mcbOutAmount = mcbOut._sum.amountShipped || 0;

      // Calculate PHYSICAL inventory currently at location
      let rawGraphenePhysical = rawGrapheneInAmount - rawGrapheneOutAmount;
      let compoundBatchPhysical = compoundBatchInAmount - compoundBatchOutAmount;
      let micronizedPhysical = micronizedInAmount - micronizedOutAmount;
      let mcbPhysical = mcbInAmount - mcbOutAmount;
      
      // For Curia Frankfurt (production origin), add total production
      if (location === 'Curia Frankfurt') {
        rawGraphenePhysical = (totalProduction._sum.output || 0) - (compoundBatchOutAmount - compoundBatchInAmount);
        // Frankfurt compound batch physical = 0 (all shipped out for processing)
        compoundBatchPhysical = Math.max(0, compoundBatchInAmount - compoundBatchOutAmount);
      }
      
      // For locations with micronization processing
      if (micronizationByLocation[location]) {
        const locationMicronization = micronizationByLocation[location];

        // Compound batch physical = received - what was actually processed
        compoundBatchPhysical = Math.max(0, compoundBatchInAmount - locationMicronization.input);

        // Micronized physical = local processing recovered + received - shipped out
        micronizedPhysical = locationMicronization.recovered + micronizedInAmount - micronizedOutAmount;
      }

      // Add MCBs stored at this location
      if (mcbByLocation[location]) {
        mcbPhysical += mcbByLocation[location];
      }

      const totalPhysicalInventory = rawGraphenePhysical + compoundBatchPhysical + micronizedPhysical + mcbPhysical;
      
      locationInventory[location] = {
        location,
        rawGraphene: {
          received: rawGrapheneInAmount,
          shipped: rawGrapheneOutAmount,
          current: rawGraphenePhysical
        },
        compoundBatch: {
          received: compoundBatchInAmount,
          shipped: compoundBatchOutAmount,
          processed: micronizationByLocation[location]?.input || 0,
          current: compoundBatchPhysical
        },
        micronized: {
          received: micronizedInAmount,
          shipped: micronizedOutAmount,
          producedHere: micronizationByLocation[location]?.recovered || 0,
          current: micronizedPhysical
        },
        mcb: {
          received: mcbInAmount,
          shipped: mcbOutAmount,
          storedHere: mcbByLocation[location] || 0,
          current: mcbPhysical
        },
        totalCurrent: totalPhysicalInventory,
        isProductionOrigin: location === 'Curia Frankfurt'
      };
    }
    
    // Materials in transit by type
    const rawGrapheneInTransit = await prisma.materialShipment.aggregate({
      where: {
        status: 'in_transit',
        grapheneSample: { not: null }
      },
      _sum: {
        amountShipped: true
      },
      _count: true
    });
    
    const compoundBatchInTransit = await prisma.materialShipment.aggregate({
      where: {
        status: 'in_transit',
        compoundBatchNumber: { not: null }
      },
      _sum: {
        amountShipped: true
      },
      _count: true
    });
    
    const micronizedInTransit = await prisma.materialShipment.aggregate({
      where: {
        status: 'in_transit',
        micronizationSku: { not: null }
      },
      _sum: {
        amountShipped: true
      },
      _count: true
    });

    const mcbInTransit = await prisma.materialShipment.aggregate({
      where: {
        status: 'in_transit',
        mcbNumber: { not: null }
      },
      _sum: {
        amountShipped: true
      },
      _count: true
    });
    
    // Unshipped materials
    const totalRawShipped = await prisma.materialShipment.aggregate({
      where: {
        grapheneSample: { not: null }
      },
      _sum: {
        amountShipped: true
      }
    });
    
    const totalCompoundShipped = await prisma.materialShipment.aggregate({
      where: {
        compoundBatchNumber: { not: null }
      },
      _sum: {
        amountShipped: true
      }
    });
    
    const totalMicronizedShipped = await prisma.materialShipment.aggregate({
      where: {
        micronizationSku: { not: null }
      },
      _sum: {
        amountShipped: true
      }
    });

    const totalMCBShipped = await prisma.materialShipment.aggregate({
      where: {
        mcbNumber: { not: null }
      },
      _sum: {
        amountShipped: true
      }
    });

    // Calculate unshipped amounts accounting for materials sent for processing
    const totalRawGrapheneShipped = (totalRawShipped._sum.amountShipped || 0) + (totalCompoundShipped._sum.amountShipped || 0);
    const unshippedRaw = (totalProduction._sum.output || 0) - totalRawGrapheneShipped;
    const unshippedMicronized = totalMicronizationRecovered - (totalMicronizedShipped._sum.amountShipped || 0);
    const unshippedMCB = totalMCBAmount - (totalMCBShipped._sum.amountShipped || 0);
    
    res.json({
      locations: Object.values(locationInventory),
      inTransit: {
        rawGraphene: {
          amount: rawGrapheneInTransit._sum.amountShipped || 0,
          count: rawGrapheneInTransit._count || 0
        },
        compoundBatch: {
          amount: compoundBatchInTransit._sum.amountShipped || 0,
          count: compoundBatchInTransit._count || 0
        },
        micronized: {
          amount: micronizedInTransit._sum.amountShipped || 0,
          count: micronizedInTransit._count || 0
        },
        mcb: {
          amount: mcbInTransit._sum.amountShipped || 0,
          count: mcbInTransit._count || 0
        },
        total: {
          amount: (rawGrapheneInTransit._sum.amountShipped || 0) +
                  (compoundBatchInTransit._sum.amountShipped || 0) +
                  (micronizedInTransit._sum.amountShipped || 0) +
                  (mcbInTransit._sum.amountShipped || 0),
          count: (rawGrapheneInTransit._count || 0) +
                 (compoundBatchInTransit._count || 0) +
                 (micronizedInTransit._count || 0) +
                 (mcbInTransit._count || 0)
        }
      },
      unshipped: {
        rawGraphene: unshippedRaw,
        micronized: unshippedMicronized,
        mcb: unshippedMCB,
        total: unshippedRaw + unshippedMicronized + unshippedMCB
      },
      micronizationSummary: {
        totalInput: totalMicronizationInput,
        totalRecovered: totalMicronizationRecovered,
        totalLoss: micronizationLoss,
        recoveryRate: totalMicronizationInput > 0 ? (totalMicronizationRecovered / totalMicronizationInput * 100) : 0
      },
      totalInventory: {
        original: totalProduction._sum.output || 0,
        accounting: (totalProduction._sum.output || 0) - micronizationLoss
      }
    });
  } catch (error) {
    console.error('Error fetching inventory by location:', error);
    res.status(500).json({ error: 'Failed to fetch inventory data' });
  }
}));

// Get best test results
router.get('/best-test-results', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  try {
    // Test each table individually to find the problematic one
    let bestBET = null;
    try {
      bestBET = await prisma.BET.findFirst({
        orderBy: {
          multipointBetArea: 'desc'
        }
      });
    } catch (betError) {
      console.error('BET query error:', betError);
    }
    
    let bestConductivity = null;
    try {
      bestConductivity = await prisma.ConductivityTest.findFirst({
        orderBy: {
          conductivity20kN: 'desc'
        }
      });
    } catch (condError) {
      console.error('Conductivity query error:', condError);
    }
    
    let bestRAMAN = null;
    try {
      // Best RAMAN is lowest D/G ratio (better quality)
      bestRAMAN = await prisma.RamanTest.findFirst({
        where: {
          integralTypADG1: { not: null }
        },
        orderBy: {
          integralTypADG1: 'asc'  // Lowest D/G ratio is best
        }
      });
    } catch (ramanError) {
      console.error('RAMAN query error:', ramanError);
    }
    
    let latestTEM = null;
    let temCount = 0;
    try {
      temCount = await prisma.TEMTest.count();
      latestTEM = await prisma.TEMTest.findFirst({
        orderBy: {
          testDate: 'desc'
        }
      });
    } catch (temError) {
      console.error('TEM query error:', temError);
    }
    
    res.json({
      bet: bestBET ? {
        value: bestBET.multipointBetArea,
        experimentNumber: bestBET.grapheneSample || bestBET.compoundBatchNumber,
        testingLab: bestBET.testingLab,
        date: bestBET.testDate
      } : null,
      conductivity: bestConductivity ? {
        value20kN: bestConductivity.conductivity20kN,
        experimentNumber: bestConductivity.grapheneSample || bestConductivity.compoundBatchNumber,
        date: bestConductivity.testDate
      } : null,
      raman: bestRAMAN ? {
        dgRatio: bestRAMAN.integralTypADG1,
        experimentNumber: bestRAMAN.grapheneSample || bestRAMAN.compoundBatchNumber,
        testingLab: bestRAMAN.testingLab,
        date: bestRAMAN.testDate
      } : null,
      tem: {
        totalTests: temCount,
        latest: latestTEM ? {
          experimentNumber: latestTEM.grapheneSample || latestTEM.compoundBatchNumber,
          testDate: latestTEM.testDate,
          testingLab: latestTEM.testingLab
        } : null
      }
    });
  } catch (error) {
    console.error('Error fetching best test results:', error);
    res.status(500).json({ error: 'Failed to fetch test results' });
  }
}));

// Get recent activity
router.get('/recent-activity', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  try {
    // Recent experiments (last 5)
    const recentExperiments = await prisma.graphene.findMany({
      orderBy: {
        experimentDate: 'desc'
      },
      take: 5,
      select: {
        experimentNumber: true,
        experimentDate: true,
        species: true,
        output: true,
        researchTeam: true
      }
    });
    
    // Recent shipments (last 5)
    const recentShipments = await prisma.materialShipment.findMany({
      orderBy: {
        shipmentDate: 'desc'
      },
      take: 5,
      select: {
        shipmentNumber: true,
        shipmentDate: true,
        shipFromLocation: true,
        shipToLocation: true,
        amountShipped: true,
        status: true,
        grapheneSample: true,
        compoundBatchNumber: true
      }
    });
    
    // Recent tests (last 5 of any type)
    const recentBET = await prisma.bET.findMany({
      orderBy: { testDate: 'desc' },
      take: 5,
      select: {
        testDate: true,
        grapheneSample: true,
        compoundBatchNumber: true,
        multipointBetArea: true
      }
    });
    
    const recentTests = recentBET.map(test => ({
      type: 'BET',
      date: test.testDate,
      sample: test.grapheneSample || test.compoundBatchNumber,
      result: `${test.multipointBetArea} m²/g`
    }));
    
    res.json({
      experiments: recentExperiments,
      shipments: recentShipments,
      tests: recentTests
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
}));

export default router;