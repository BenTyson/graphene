import express from 'express';
import asyncHandler from 'express-async-handler';
import AIInsightsService from '../services/AIInsightsService.js';

const router = express.Router();

// Helper function to extract filters from query parameters
function extractFilters(query) {
  const filters = {};
  
  if (query.timeRange) filters.timeRange = parseInt(query.timeRange);
  if (query.oven) filters.oven = query.oven;
  if (query.species) filters.species = query.species;
  if (query.includeCompoundBatches === 'true') filters.includeCompoundBatches = true;
  if (query.includeMicronization === 'true') filters.includeMicronization = true;
  
  return filters;
}

// Get main AI insights dashboard data
router.get('/dashboard', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  
  try {
    // Get basic production metrics
    const totalExperiments = await prisma.graphene.count();
    const totalProduction = await prisma.graphene.aggregate({
      _sum: { output: true }
    });

    // Get recent performance metrics
    const recentExperiments = await prisma.graphene.findMany({
      where: {
        experimentDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        },
        output: { not: null }
      },
      include: {
        betTests: { orderBy: { multipointBetArea: 'desc' } },
        conductivityTests: { orderBy: { conductivity20kN: 'desc' } },
        ramanTests: { orderBy: { integralTypADG1: 'asc' } }
      }
    });

    // Calculate key performance indicators
    const recentAvgYield = recentExperiments.length > 0 ? 
      recentExperiments.reduce((sum, exp) => sum + (exp.output || 0), 0) / recentExperiments.length : 0;
    
    const bestRecentBET = Math.max(...recentExperiments.flatMap(exp => 
      exp.betTests?.map(bet => bet.multipointBetArea || 0) || [0]
    ));

    const bestRecentConductivity = Math.max(...recentExperiments.flatMap(exp =>
      exp.conductivityTests?.map(cond => cond.conductivity20kN || 0) || [0]
    ));

    // Get quick AI insights about recent trends
    const quickInsight = await AIInsightsService.analyzeWithAI(`
      Recent graphene production summary:
      - Total experiments to date: ${totalExperiments}
      - Total production: ${totalProduction._sum.output || 0}g
      - Recent 30-day experiments: ${recentExperiments.length}
      - Average recent yield: ${recentAvgYield.toFixed(2)}g
      - Best recent BET: ${bestRecentBET}m²/g
      - Best recent conductivity: ${bestRecentConductivity}S/cm
      
      Provide a 2-3 sentence executive summary of the current production status and any notable trends.
    `, 200);

    res.json({
      summary: {
        totalExperiments,
        totalProduction: totalProduction._sum.output || 0,
        recentExperiments: recentExperiments.length,
        avgRecentYield: recentAvgYield,
        bestRecentBET,
        bestRecentConductivity
      },
      quickInsight,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard insights error:', error);
    res.status(500).json({ 
      error: 'Failed to load AI insights dashboard',
      details: error.message 
    });
  }
}));

// Get correlation analysis between process variables and outcomes
router.get('/correlations', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const filters = extractFilters(req.query);
  
  try {
    const correlationAnalysis = await AIInsightsService.analyzeCorrelations(prisma, filters);
    
    res.json(correlationAnalysis);

  } catch (error) {
    console.error('Correlation analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze correlations',
      details: error.message 
    });
  }
}));

// Get yield and quality optimization recommendations
router.get('/optimization', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { minYield, minBET, minConductivity } = req.query;
  const filters = extractFilters(req.query);
  
  try {
    const targetMetrics = {};
    if (minYield) targetMetrics.minYield = parseFloat(minYield);
    if (minBET) targetMetrics.minBET = parseFloat(minBET);
    if (minConductivity) targetMetrics.minConductivity = parseFloat(minConductivity);

    const optimization = await AIInsightsService.optimizeYieldAndQuality(prisma, filters, targetMetrics);
    
    res.json(optimization);

  } catch (error) {
    console.error('Optimization analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to generate optimization recommendations',
      details: error.message 
    });
  }
}));

// Get production scaling analysis and recommendations
router.get('/scaling', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { targetOvenSize = '50L', targetProductionRate = '10' } = req.query;
  const filters = extractFilters(req.query);
  
  try {
    const scaling = await AIInsightsService.analyzeScaling(
      prisma,
      filters, 
      targetOvenSize, 
      parseFloat(targetProductionRate)
    );
    
    res.json(scaling);

  } catch (error) {
    console.error('Scaling analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze scaling requirements',
      details: error.message 
    });
  }
}));

// Get AI-suggested next experiments
router.get('/experiments', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { priorities = 'yield,quality' } = req.query;
  const filters = extractFilters(req.query);
  
  try {
    const priorityList = priorities.split(',').map(p => p.trim());
    const suggestions = await AIInsightsService.suggestNextExperiments(prisma, filters, priorityList);
    
    res.json(suggestions);

  } catch (error) {
    console.error('Experiment suggestions error:', error);
    res.status(500).json({ 
      error: 'Failed to generate experiment suggestions',
      details: error.message 
    });
  }
}));

// Quality metrics prediction for proposed conditions
router.post('/predictions', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { conditions } = req.body;
  
  try {
    // Validate required conditions
    if (!conditions || !conditions.species || !conditions.baseType) {
      return res.status(400).json({ 
        error: 'Missing required conditions: species and baseType are required' 
      });
    }

    // Get similar historical experiments for comparison
    const similarExperiments = await prisma.graphene.findMany({
      where: {
        species: conditions.species,
        baseType: conditions.baseType,
        output: { not: null }
      },
      include: {
        betTests: true,
        conductivityTests: true,
        ramanTests: true
      },
      take: 20
    });

    const prompt = `
Predict quality outcomes for proposed graphene production conditions:

PROPOSED CONDITIONS:
- Species: ${conditions.species}
- Base type: ${conditions.baseType}
- Base concentration: ${conditions.baseConcentration || 'not specified'}M
- Temperature max: ${conditions.tempMax || 'not specified'}°C
- Time: ${conditions.time || 'not specified'} minutes
- Grinding method: ${conditions.grindingMethod || 'not specified'}

SIMILAR HISTORICAL EXPERIMENTS (${similarExperiments.length} found):
${JSON.stringify(similarExperiments.slice(0, 8).map(exp => ({
  experimentNumber: exp.experimentNumber,
  yield: exp.output,
  baseConcentration: exp.baseConcentration,
  tempMax: exp.tempMax,
  time: exp.time,
  bestBET: Math.max(...(exp.betTests?.map(b => b.multipointBetArea || 0) || [0])),
  bestConductivity: Math.max(...(exp.conductivityTests?.map(c => c.conductivity20kN || 0) || [0]))
})), null, 2)}

PREDICTION TASKS:
1. Predict expected yield range based on similar conditions
2. Predict expected BET surface area range
3. Predict expected conductivity performance
4. Assess confidence level (high/medium/low) and explain reasoning
5. Identify key variables that could significantly impact results
6. Suggest parameter adjustments if predictions show suboptimal performance

Provide specific numerical ranges and confidence intervals where possible.
`;

    const prediction = await AIInsightsService.analyzeWithAI(prompt, 1000);

    res.json({
      proposedConditions: conditions,
      similarExperimentCount: similarExperiments.length,
      prediction,
      confidence: similarExperiments.length > 5 ? 'high' : 
                 similarExperiments.length > 2 ? 'medium' : 'low',
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ 
      error: 'Failed to generate predictions',
      details: error.message 
    });
  }
}));

// Custom AI analysis with user-provided prompt
router.post('/analyze', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { question, context = 'general' } = req.body;
  
  try {
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Get relevant data based on context
    let dataContext = '';
    switch (context) {
      case 'recent':
        const recentData = await prisma.graphene.findMany({
          where: {
            experimentDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          },
          include: { betTests: true, conductivityTests: true },
          take: 10
        });
        dataContext = `Recent experiments (last 30 days): ${JSON.stringify(recentData, null, 2)}`;
        break;
      
      case 'quality':
        const qualityData = await prisma.bET.findMany({
          where: { multipointBetArea: { not: null } },
          include: { grapheneRef: true },
          orderBy: { multipointBetArea: 'desc' },
          take: 10
        });
        dataContext = `Top quality results: ${JSON.stringify(qualityData, null, 2)}`;
        break;
        
      default:
        const summaryData = await prisma.graphene.aggregate({
          _count: true,
          _sum: { output: true },
          _avg: { output: true }
        });
        dataContext = `Production summary: ${JSON.stringify(summaryData, null, 2)}`;
    }

    const prompt = `
Context: Graphene production from hemp biochar analysis
${dataContext}

User Question: ${question}

Provide a comprehensive analysis addressing the user's question. Include specific data points, trends, and actionable insights where relevant.
`;

    const analysis = await AIInsightsService.analyzeWithAI(prompt, 1200);

    res.json({
      question,
      context,
      analysis,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Custom analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to perform custom analysis',
      details: error.message 
    });
  }
}));

// Force refresh of specific insights (clears cache)
router.post('/refresh', asyncHandler(async (req, res) => {
  const { type = 'all' } = req.body;
  
  try {
    switch (type) {
      case 'correlations':
        AIInsightsService.invalidateCache('correlations');
        break;
      case 'optimization':
        AIInsightsService.invalidateCache('optimization');
        break;
      case 'scaling':
        AIInsightsService.invalidateCache('scaling');
        break;
      case 'suggestions':
        AIInsightsService.invalidateCache('suggestions');
        break;
      case 'all':
      default:
        AIInsightsService.cache.clear();
        break;
    }

    res.json({
      message: `Cache cleared for: ${type}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cache refresh error:', error);
    res.status(500).json({ 
      error: 'Failed to refresh insights cache',
      details: error.message 
    });
  }
}));

export default router;