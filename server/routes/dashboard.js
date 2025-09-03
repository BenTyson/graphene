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

// Get inventory by location
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
    
    // Calculate inventory at each location
    const locationInventory = {};
    
    for (const location of uniqueLocations) {
      // Materials shipped TO this location
      const shipmentsIn = await prisma.materialShipment.aggregate({
        where: {
          shipToLocation: location,
          status: 'received'
        },
        _sum: {
          amountShipped: true
        }
      });
      
      // Materials shipped FROM this location
      const shipmentsOut = await prisma.materialShipment.aggregate({
        where: {
          shipFromLocation: location,
          status: { in: ['shipped', 'in_transit', 'received'] }
        },
        _sum: {
          amountShipped: true
        }
      });
      
      const inAmount = shipmentsIn._sum.amountShipped || 0;
      const outAmount = shipmentsOut._sum.amountShipped || 0;
      
      locationInventory[location] = {
        location,
        received: inAmount,
        shipped: outAmount,
        currentInventory: inAmount - outAmount
      };
    }
    
    // Materials in transit
    const inTransit = await prisma.materialShipment.aggregate({
      where: {
        status: 'in_transit'
      },
      _sum: {
        amountShipped: true
      },
      _count: true
    });
    
    // Unshipped graphene (produced but not shipped)
    const totalProduced = await prisma.graphene.aggregate({
      _sum: {
        output: true
      }
    });
    
    const totalShipped = await prisma.materialShipment.aggregate({
      where: {
        grapheneSample: { not: null }
      },
      _sum: {
        amountShipped: true
      }
    });
    
    const unshipped = (totalProduced._sum.output || 0) - (totalShipped._sum.amountShipped || 0);
    
    res.json({
      locations: Object.values(locationInventory),
      inTransit: {
        amount: inTransit._sum.amountShipped || 0,
        count: inTransit._count || 0
      },
      unshipped,
      totalInventory: totalProduced._sum.output || 0
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
    
    res.json({
      bet: bestBET ? {
        value: bestBET.multipointBetArea,
        sample: bestBET.grapheneSample || bestBET.compoundBatchNumber,
        date: bestBET.testDate
      } : null,
      conductivity: bestConductivity ? {
        value20kN: bestConductivity.conductivity20kN,
        sample: bestConductivity.grapheneSample || bestConductivity.compoundBatchNumber,
        date: bestConductivity.testDate
      } : null,
      raman: null,
      tem: { totalTests: 0, latest: null }
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