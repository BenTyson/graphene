import OpenAI from 'openai';

class AIInsightsService {
  constructor() {
    this.openai = null;
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
  }

  _getClient() {
    if (!this.openai) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return this.openai;
  }

  // Get cached result or null if expired/missing
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  // Set cache with timestamp
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Clear cache for keys matching pattern
  invalidateCache(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Core AI analysis method with knowledge base integration
  async analyzeWithAI(prompt, maxTokens = 1000, includeKnowledgeBase = true, prisma = null) {
    try {
      // Get knowledge base context if requested and prisma is available
      let knowledgeContext = '';
      if (includeKnowledgeBase && prisma) {
        knowledgeContext = await this.getRelevantKnowledgeContext(prompt, prisma);
      }

      const systemMessage = `You are an expert materials scientist specializing in graphene production optimization from hemp biochar. Analyze data patterns, identify correlations, and provide actionable insights for production optimization. Focus on practical recommendations backed by data.

${knowledgeContext ? `KNOWLEDGE BASE CONTEXT:
You have access to relevant research documents and findings. When applicable, reference this knowledge to enhance your analysis:

${knowledgeContext}

---END KNOWLEDGE BASE---

` : ''}When referencing knowledge base information, cite it as "According to research documents in the knowledge base..." or similar.`;

      const response = await this._getClient().chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.1 // Low temperature for consistent, factual analysis
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('AI analysis temporarily unavailable');
    }
  }

  // Get relevant knowledge base context for AI analysis
  async getRelevantKnowledgeContext(analysisPrompt, prisma, maxDocuments = 3) {
    try {
      // Extract key terms from the analysis prompt to find relevant documents
      const keyTerms = this.extractKeyTermsFromPrompt(analysisPrompt);
      
      // Search for relevant knowledge documents
      const relevantDocuments = await prisma.knowledgeDocument.findMany({
        where: {
          isActive: true,
          processingStatus: 'COMPLETED',
          OR: [
            { title: { contains: keyTerms.join(' '), mode: 'insensitive' } },
            { keywords: { hasSome: keyTerms } },
            { researchAreas: { hasSome: keyTerms } },
            { extractedText: { contains: keyTerms.join(' '), mode: 'insensitive' } }
          ]
        },
        orderBy: [
          { relevanceScore: 'desc' },
          { lastProcessedAt: 'desc' }
        ],
        take: maxDocuments,
        select: {
          id: true,
          title: true,
          documentType: true,
          authors: true,
          summary: true,
          keyFindings: true,
          relevanceScore: true
        }
      });

      if (relevantDocuments.length === 0) {
        return '';
      }

      // Format knowledge base context
      const contextSections = relevantDocuments.map(doc => {
        return `**${doc.title}** (${doc.documentType})${doc.authors?.length ? ` by ${doc.authors.join(', ')}` : ''}
Relevance Score: ${doc.relevanceScore}/10

Summary: ${doc.summary || 'Summary not available'}

Key Findings:
${doc.keyFindings?.map(finding => `• ${finding}`).join('\n') || '• Processing in progress'}

---`;
      }).join('\n\n');

      return `RELEVANT RESEARCH DOCUMENTS (${relevantDocuments.length} found):\n\n${contextSections}`;

    } catch (error) {
      console.error('Knowledge base context retrieval error:', error);
      return ''; // Fail gracefully - analysis can continue without knowledge base
    }
  }

  // Extract key terms from analysis prompt for document matching
  extractKeyTermsFromPrompt(prompt) {
    // Define graphene production related terms to look for
    const relevantTerms = [
      'graphene', 'biochar', 'hemp', 'carbon', 'conductivity', 'bet', 'surface area',
      'raman', 'temperature', 'yield', 'quality', 'optimization', 'production', 
      'synthesis', 'processing', 'scaling', 'characterization', 'grinding',
      'micronization', 'compound', 'batch', 'material', 'nanocarbon'
    ];

    const lowerPrompt = prompt.toLowerCase();
    const foundTerms = relevantTerms.filter(term => lowerPrompt.includes(term));
    
    // Add common synonyms and variations
    const expandedTerms = [...foundTerms];
    if (foundTerms.includes('graphene')) {
      expandedTerms.push('carbon', 'nanocarbon');
    }
    if (foundTerms.includes('conductivity')) {
      expandedTerms.push('electrical', 'conductive');
    }
    if (foundTerms.includes('bet')) {
      expandedTerms.push('surface area', 'porosity');
    }

    return [...new Set(expandedTerms)]; // Remove duplicates
  }

  // Analyze correlations between process variables and outcomes
  async analyzeCorrelations(prisma, filters = {}) {
    const cacheKey = `correlations_${JSON.stringify(filters)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Build where clause from filters
      const whereClause = this.buildWhereClause(filters);

      const includeClause = {
        biocharExperimentRef: true,
        biocharLotRef: true,
        betTests: true,
        conductivityTests: true,
        ramanTests: true,
        temTests: true
      };

      // Add compound batch and micronization data if requested
      if (filters.includeCompoundBatches) {
        includeClause.compoundBatches = {
          include: {
            micronizations: filters.includeMicronization
          }
        };
      }

      const grapheneData = await prisma.graphene.findMany({
        where: whereClause,
        include: includeClause,
        orderBy: { experimentDate: 'desc' }
      });

      // Prepare data for AI analysis
      const analysisData = grapheneData.map(exp => {
        const biochar = exp.biocharExperimentRef || {};
        const bestBET = exp.betTests?.length ? 
          Math.max(...exp.betTests.map(b => b.multipointBetArea || 0)) : null;
        const bestConductivity = exp.conductivityTests?.length ?
          Math.max(...exp.conductivityTests.map(c => c.conductivity20kN || 0)) : null;
        const bestRaman = exp.ramanTests?.length ?
          Math.min(...exp.ramanTests.map(r => r.integralTypADG1 || 999)) : null;

        // Process compound batch data if included
        let compoundBatchData = null;
        if (filters.includeCompoundBatches && exp.compoundBatches?.length > 0) {
          const compoundBatch = exp.compoundBatches[0].compoundBatch;
          const cbBestBET = compoundBatch.betTests?.length ?
            Math.max(...compoundBatch.betTests.map(b => b.multipointBetArea || 0)) : null;
          const cbBestConductivity = compoundBatch.conductivityTests?.length ?
            Math.max(...compoundBatch.conductivityTests.map(c => c.conductivity20kN || 0)) : null;
          const cbBestRaman = compoundBatch.ramanTests?.length ?
            Math.min(...compoundBatch.ramanTests.map(r => r.integralTypADG1 || 999)) : null;

          compoundBatchData = {
            batchNumber: compoundBatch.batchNumber,
            totalOutput: compoundBatch.totalOutput,
            betSurfaceArea: cbBestBET,
            conductivity20kN: cbBestConductivity,
            ramanDGRatio: cbBestRaman,
            micronizations: filters.includeMicronization ? 
              compoundBatch.micronizations?.map(m => ({
                recoveredAmount: m.recoveredAmount,
                grindPressure: m.grindPressure,
                dx50: m.dx50
              })) : null
          };
        }

        // Process micronization data if included
        let micronizationData = null;
        if (filters.includeMicronization && exp.micronizations?.length > 0) {
          micronizationData = exp.micronizations.map(m => ({
            micronizationNumber: m.micronizationNumber,
            recoveredAmount: m.recoveredAmount,
            grindPressure: m.grindPressure,
            dx50: m.dx50,
            recoveryRate: m.recoveredAmount && m.startingMaterialAmount ? 
              (m.recoveredAmount / m.startingMaterialAmount * 100) : null
          }));
        }

        return {
          experimentNumber: exp.experimentNumber,
          // Biochar inputs
          biocharTemp: biochar.temperature,
          biocharTime: biochar.time,
          biocharRawMaterial: biochar.rawMaterial,
          biocharReactor: biochar.reactor,
          // Graphene process
          species: exp.species,
          baseType: exp.baseType,
          baseAmount: exp.baseAmount,
          baseConcentration: exp.baseConcentration,
          grindingMethod: exp.grindingMethod,
          grindingTime: exp.grindingTime,
          tempMax: exp.tempMax,
          tempRate: exp.tempRate,
          time: exp.time,
          // Outcomes
          yield: exp.output,
          betSurfaceArea: bestBET,
          conductivity20kN: bestConductivity,
          ramanDGRatio: bestRaman, // Using integralTypADG1 as D/G ratio proxy
          density: exp.density,
          // Additional data when included
          compoundBatch: compoundBatchData,
          micronizations: micronizationData
        };
      });

      // Build analysis context based on included data
      let dataContext = 'graphene production experiments';
      let keyVariables = `
KEY VARIABLES:
- Biochar inputs: Temperature (°C), Time (hours), Raw material, Reactor type
- Graphene process: Species, Base type/amount/concentration, Grinding method/time, Temperature max/rate, Processing time
- Quality outcomes: Yield (g), BET surface area (m²/g), Conductivity at 20kN (S/cm), RAMAN D/G ratio`;

      if (filters.includeCompoundBatches) {
        dataContext += ' with compound batch data';
        keyVariables += `
- Compound batch metrics: Total output, batch-level BET/conductivity/RAMAN performance`;
      }

      if (filters.includeMicronization) {
        dataContext += ' including micronization processing';
        keyVariables += `
- Micronization data: Recovered amount, grind pressure, particle size (dx50), recovery rates`;
      }

      const prompt = `
Analyze the following ${dataContext} dataset of ${analysisData.length} experiments.
${keyVariables}

FILTER CRITERIA APPLIED:
${JSON.stringify(filters, null, 2)}

DATA SAMPLE:
${JSON.stringify(analysisData.slice(0, 8), null, 2)}

ANALYSIS TASKS:
1. Identify the TOP 5 strongest correlations between process variables and quality outcomes${filters.includeCompoundBatches ? ' (include compound batch performance)' : ''}
2. Find optimal parameter ranges for maximizing yield AND quality simultaneously${filters.includeMicronization ? ' while maintaining high recovery rates' : ''}
3. Identify any negative correlations or trade-offs to avoid
4. ${filters.includeCompoundBatches ? 'Compare individual experiment performance vs. compound batch outcomes' : 'Analyze scaling potential based on individual experiment data'}
5. ${filters.includeMicronization ? 'Examine micronization effects on final product quality and yield recovery' : 'Suggest specific parameter combinations to test next based on data gaps'}
6. Highlight any unusual patterns or outliers that warrant investigation

Provide actionable insights with specific numbers and ranges where possible.
`;

      const analysis = await this.analyzeWithAI(prompt, 1500, true, prisma);
      
      const result = {
        totalExperiments: analysisData.length,
        filters: filters,
        analysis: analysis,
        dataQuality: {
          withBET: analysisData.filter(d => d.betSurfaceArea).length,
          withConductivity: analysisData.filter(d => d.conductivity20kN).length,
          withRaman: analysisData.filter(d => d.ramanDGRatio).length,
          avgYield: analysisData.reduce((sum, d) => sum + (d.yield || 0), 0) / analysisData.length,
          withCompoundBatches: filters.includeCompoundBatches ? 
            analysisData.filter(d => d.compoundBatch).length : 0,
          withMicronizations: filters.includeMicronization ? 
            analysisData.filter(d => d.micronizations?.length > 0).length : 0
        },
        updatedAt: new Date().toISOString()
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Correlation analysis error:', error);
      throw error;
    }
  }

  // Build where clause from filter parameters
  buildWhereClause(filters = {}) {
    const whereClause = {};

    // Time range filter
    if (filters.timeRange) {
      whereClause.experimentDate = {
        gte: new Date(Date.now() - filters.timeRange * 24 * 60 * 60 * 1000)
      };
    }

    // Oven filter (assuming this maps to a field like ovenType)
    if (filters.oven) {
      whereClause.ovenType = filters.oven;
    }

    // Species filter
    if (filters.species) {
      whereClause.species = filters.species;
    }

    return whereClause;
  }

  // Generate yield and quality optimization recommendations
  async optimizeYieldAndQuality(prisma, filters = {}, targetMetrics = {}) {
    const cacheKey = `optimization_${JSON.stringify(filters)}_${JSON.stringify(targetMetrics)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Build where clause with filters
      const whereClause = this.buildWhereClause(filters);
      whereClause.output = { not: null };

      // Get top performing experiments
      const topYieldExperiments = await prisma.graphene.findMany({
        where: whereClause,
        include: {
          biocharExperimentRef: true,
          betTests: { orderBy: { multipointBetArea: 'desc' } },
          conductivityTests: { orderBy: { conductivity20kN: 'desc' } },
          ramanTests: { orderBy: { integralTypADG1: 'asc' } }
        },
        orderBy: { output: 'desc' },
        take: 20
      });

      const qualityWhereClause = { multipointBetArea: { not: null } };
      // Apply filters to the graphene reference
      if (Object.keys(whereClause).length > 1) { // More than just output filter
        qualityWhereClause.grapheneRef = {
          ...this.buildWhereClause(filters)
        };
      }

      const topQualityExperiments = await prisma.bET.findMany({
        where: qualityWhereClause,
        include: {
          grapheneRef: {
            include: {
              biocharExperimentRef: true,
              conductivityTests: true,
              ramanTests: true
            }
          }
        },
        orderBy: { multipointBetArea: 'desc' },
        take: 15
      });

      const analysisData = {
        topYield: topYieldExperiments.map(exp => {
          let compoundBatchData = null;
          if (filters.includeCompoundBatches && exp.compoundBatches?.length > 0) {
            const cb = exp.compoundBatches[0].compoundBatch;
            compoundBatchData = {
              batchNumber: cb.batchNumber,
              totalOutput: cb.totalOutput,
              betSurfaceArea: cb.betTests?.[0]?.multipointBetArea,
              conductivity: cb.conductivityTests?.[0]?.conductivity20kN
            };
          }

          let micronizationData = null;
          if (filters.includeMicronization && exp.micronizations?.length > 0) {
            micronizationData = {
              recoveredAmount: exp.micronizations[0].recoveredAmount,
              recoveryRate: exp.micronizations[0].recoveredAmount && exp.output ?
                (exp.micronizations[0].recoveredAmount / exp.output * 100) : null,
              dx50: exp.micronizations[0].dx50
            };
          }

          return {
            experimentNumber: exp.experimentNumber,
            yield: exp.output,
            conditions: {
              species: exp.species,
              baseType: exp.baseType,
              baseConcentration: exp.baseConcentration,
              grindingMethod: exp.grindingMethod,
              tempMax: exp.tempMax,
              time: exp.time
            },
            quality: {
              betSurfaceArea: exp.betTests[0]?.multipointBetArea,
              conductivity: exp.conductivityTests[0]?.conductivity20kN,
              ramanDG: exp.ramanTests[0]?.integralTypADG1
            },
            compoundBatch: compoundBatchData,
            micronization: micronizationData
          };
        }),
        topQuality: topQualityExperiments.map(bet => ({
          experimentNumber: bet.grapheneRef?.experimentNumber,
          betSurfaceArea: bet.multipointBetArea,
          yield: bet.grapheneRef?.output,
          conditions: {
            species: bet.grapheneRef?.species,
            baseType: bet.grapheneRef?.baseType,
            baseConcentration: bet.grapheneRef?.baseConcentration,
            grindingMethod: bet.grapheneRef?.grindingMethod,
            tempMax: bet.grapheneRef?.tempMax,
            time: bet.grapheneRef?.time
          }
        }))
      };

      let analysisScope = 'individual graphene experiments';
      if (filters.includeCompoundBatches) {
        analysisScope += ' with compound batch scaling data';
      }
      if (filters.includeMicronization) {
        analysisScope += ' including micronization processing';
      }

      const prompt = `
Analyze high-performance ${analysisScope} for optimization.

FILTER CRITERIA:
${JSON.stringify(filters, null, 2)}

TARGET METRICS:
- Yield: ${targetMetrics.minYield || 'maximize'} grams
- BET Surface Area: ${targetMetrics.minBET || 'maximize'} m²/g  
- Conductivity: ${targetMetrics.minConductivity || 'maximize'} S/cm at 20kN${filters.includeMicronization ? '\n- Micronization Recovery Rate: maximize %' : ''}

TOP YIELD EXPERIMENTS:
${JSON.stringify(analysisData.topYield.slice(0, 6), null, 2)}

TOP QUALITY EXPERIMENTS:
${JSON.stringify(analysisData.topQuality.slice(0, 6), null, 2)}

OPTIMIZATION TASKS:
1. Identify optimal parameter combinations achieving BOTH high yield (>4g) AND high quality (>1500 m²/g BET)${filters.includeMicronization ? ' with >80% recovery rate' : ''}
2. Find "sweet spot" ranges for key variables: species, base concentration, temperature, time, grinding method
3. ${filters.includeCompoundBatches ? 'Compare individual vs. compound batch performance - identify scaling advantages/disadvantages' : 'Calculate trade-offs: What yield reduction is expected for quality improvements?'}
4. ${filters.includeMicronization ? 'Analyze micronization impact on final product performance vs. processing losses' : 'Suggest 5 specific experimental conditions to test that could exceed current best results'}
5. Identify scaling considerations: Which conditions work best for larger batch sizes?
6. Provide specific recommendations for process optimization based on the full dataset

Focus on actionable parameter ranges and specific recommendations.
`;

      const analysis = await this.analyzeWithAI(prompt, 1500, true, prisma);

      const result = {
        filters,
        targetMetrics,
        topPerformers: {
          bestYield: topYieldExperiments[0],
          bestBET: topQualityExperiments[0]?.grapheneRef,
          bestBalanced: this.findBalancedPerformers(analysisData)
        },
        analysis: analysis,
        updatedAt: new Date().toISOString()
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Optimization analysis error:', error);
      throw error;
    }
  }

  // Find experiments with balanced yield and quality performance  
  findBalancedPerformers(analysisData) {
    return analysisData.topYield
      .filter(exp => exp.quality.betSurfaceArea && exp.yield)
      .map(exp => ({
        ...exp,
        balanceScore: (exp.yield / 6) * 0.4 + (exp.quality.betSurfaceArea / 2000) * 0.6
      }))
      .sort((a, b) => b.balanceScore - a.balanceScore)
      .slice(0, 3);
  }

  // Analyze production scaling patterns and recommendations
  async analyzeScaling(prisma, filters = {}, targetOvenSize, currentProductionRate) {
    const cacheKey = `scaling_${JSON.stringify(filters)}_${targetOvenSize}_${currentProductionRate}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Build where clause with filters
      const whereClause = this.buildWhereClause(filters);
      whereClause.output = { not: null };
      whereClause.quantity = { not: null };

      // Get experiments grouped by estimated batch sizes
      const allExperiments = await prisma.graphene.findMany({
        where: whereClause,
        include: {
          biocharExperimentRef: true,
          betTests: true,
          conductivityTests: true
        },
        orderBy: { quantity: 'desc' }
      });

      // Analyze batch size effects
      const batchAnalysis = this.analyzeBatchSizeEffects(allExperiments);

      const prompt = `
Analyze graphene production scaling from current lab-scale to industrial production.

CURRENT PRODUCTION DATA:
- Total experiments: ${allExperiments.length}
- Batch size range: ${Math.min(...allExperiments.map(e => e.quantity))}g to ${Math.max(...allExperiments.map(e => e.quantity))}g
- Target scaling: ${targetOvenSize} oven size, ${currentProductionRate} kg/month production rate

BATCH SIZE EFFECTS:
${JSON.stringify(batchAnalysis, null, 2)}

SCALING ANALYSIS TASKS:
1. Predict quality/yield changes when scaling from ${Math.max(...allExperiments.map(e => e.quantity))}g to larger batches
2. Identify critical parameters that may change behavior at scale (temperature uniformity, mixing, heat transfer)
3. Recommend pilot-scale experiments (intermediate sizes) to validate scaling
4. Estimate production capacity and quality consistency at target scale
5. Identify potential scaling risks and mitigation strategies

Provide specific recommendations for scaling timeline and intermediate validation steps.
`;

      const analysis = await this.analyzeWithAI(prompt, 1500, true, prisma);

      const result = {
        filters,
        targetOvenSize,
        currentProductionRate,
        batchSizeAnalysis: batchAnalysis,
        scalingRecommendations: analysis,
        updatedAt: new Date().toISOString()
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Scaling analysis error:', error);
      throw error;
    }
  }

  // Analyze how batch size affects outcomes
  analyzeBatchSizeEffects(experiments) {
    const sizeGroups = {
      small: experiments.filter(e => e.quantity <= 2),
      medium: experiments.filter(e => e.quantity > 2 && e.quantity <= 4),
      large: experiments.filter(e => e.quantity > 4)
    };

    return Object.entries(sizeGroups).map(([size, exps]) => ({
      batchSize: size,
      count: exps.length,
      avgYield: exps.reduce((sum, e) => sum + e.output, 0) / exps.length,
      avgYieldPerGram: exps.reduce((sum, e) => sum + (e.output / e.quantity), 0) / exps.length,
      qualityData: {
        withBET: exps.filter(e => e.betTests?.length > 0).length,
        avgBET: this.avgNonNull(exps.flatMap(e => e.betTests?.map(b => b.multipointBetArea) || []))
      }
    }));
  }

  // Helper method for averaging non-null values
  avgNonNull(values) {
    const filtered = values.filter(v => v != null);
    return filtered.length > 0 ? filtered.reduce((sum, v) => sum + v, 0) / filtered.length : null;
  }

  // Suggest next experiments based on current gaps and priorities
  async suggestNextExperiments(prisma, filters = {}, priorities = ['yield', 'quality', 'scaling']) {
    const cacheKey = `suggestions_${JSON.stringify(filters)}_${priorities.join('_')}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Analyze current experimental coverage
      const coverage = await this.analyzeExperimentalCoverage(prisma, filters);
      
      const prompt = `
Design optimal next experiments for graphene production optimization.

CURRENT EXPERIMENTAL COVERAGE:
${JSON.stringify(coverage, null, 2)}

PRIORITIES: ${priorities.join(', ')}

EXPERIMENT DESIGN TASKS:
1. Identify parameter combinations not yet tested that show high potential
2. Design experiments to fill critical gaps in the parameter space
3. Suggest validation experiments for promising conditions
4. Recommend scaling pilot experiments for production readiness
5. Propose systematic DOE (Design of Experiments) for the next 10 experiments

For each suggested experiment, provide:
- Specific parameter values
- Expected outcomes and rationale
- Risk assessment
- Learning objectives

Focus on high-impact experiments that advance multiple priorities simultaneously.
`;

      const analysis = await this.analyzeWithAI(prompt, 1500, true, prisma);

      const result = {
        filters,
        priorities,
        experimentalCoverage: coverage,
        suggestions: analysis,
        updatedAt: new Date().toISOString()
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Experiment suggestion error:', error);
      throw error;
    }
  }

  // Analyze current experimental parameter coverage
  async analyzeExperimentalCoverage(prisma, filters = {}) {
    const whereClause = this.buildWhereClause(filters);
    whereClause.output = { not: null };

    const experiments = await prisma.graphene.findMany({
      where: whereClause,
      include: { biocharExperimentRef: true }
    });

    const parameterRanges = {
      species: [...new Set(experiments.map(e => e.species).filter(Boolean))],
      baseTypes: [...new Set(experiments.map(e => e.baseType).filter(Boolean))],
      baseConcentrations: [...new Set(experiments.map(e => e.baseConcentration).filter(Boolean))].sort((a,b) => a-b),
      temperatures: [...new Set(experiments.map(e => e.tempMax).filter(Boolean))].sort((a,b) => a-b),
      grindingMethods: [...new Set(experiments.map(e => e.grindingMethod).filter(Boolean))]
    };

    return {
      totalExperiments: experiments.length,
      parameterRanges,
      gaps: this.identifyParameterGaps(experiments),
      recentTrends: this.analyzeRecentTrends(experiments)
    };
  }

  // Identify gaps in parameter space
  identifyParameterGaps(experiments) {
    // This would implement logic to find untested parameter combinations
    // For now, return a placeholder that shows the concept
    return {
      highTempLowConcentration: 'Few experiments with >900°C and <2M base concentration',
      species2Optimization: 'Limited Species 2 experiments with optimal grinding',
      scalingGaps: 'No experiments between 4-6g batch sizes'
    };
  }

  // Analyze recent experimental trends
  analyzeRecentTrends(experiments) {
    const recent = experiments
      .filter(e => e.experimentDate > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
      .sort((a, b) => new Date(b.experimentDate) - new Date(a.experimentDate));

    return {
      recentCount: recent.length,
      focusAreas: recent.slice(0, 10).map(e => e.species || 'Unknown'),
      avgRecentYield: recent.reduce((sum, e) => sum + (e.output || 0), 0) / recent.length
    };
  }

  // Invalidate cache when new data arrives
  onNewData(dataType) {
    switch (dataType) {
      case 'graphene':
        this.invalidateCache('correlations');
        this.invalidateCache('optimization');
        this.invalidateCache('suggestions');
        break;
      case 'bet':
      case 'conductivity':
      case 'raman':
      case 'tem':
        this.invalidateCache('correlations');
        this.invalidateCache('optimization');
        break;
      default:
        // Clear all cache on unknown data type
        this.cache.clear();
    }
  }
}

export default new AIInsightsService();