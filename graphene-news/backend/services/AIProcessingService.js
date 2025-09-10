import fetch from 'node-fetch';

export class AIProcessingService {
  constructor(prisma) {
    this.prisma = prisma;
    
    // Relevance scoring weights for graphene content - HEAVILY favor graphene
    this.relevanceFactors = {
      grapheneKeywords: 0.7,      // MASSIVE weight for direct graphene mentions
      materialScience: 0.1,       // Much lower weight for related materials
      industryContext: 0.15,      // Moderate weight for applications/market
      sourceReliability: 0.05     // Minimal weight for source credibility
    };

    // Comprehensive keyword dictionaries
    this.keywordDictionaries = {
      graphene: [
        'graphene', 'single-layer graphene', 'multilayer graphene', 'graphene oxide',
        'reduced graphene oxide', 'epitaxial graphene', 'cvd graphene', 'pristine graphene',
        'functionalized graphene', 'graphene nanoplatelets', 'graphene quantum dots'
      ],
      relatedMaterials: [
        'carbon nanotube', 'cnt', 'swcnt', 'mwcnt', 'carbon fiber', 'carbon black',
        'fullerene', 'buckyball', '2d material', 'tmdc', 'mos2', 'ws2', 'black phosphorus',
        'hexagonal boron nitride', 'h-bn', 'transition metal dichalcogenide'
      ],
      properties: [
        'conductivity', 'electrical conductivity', 'thermal conductivity', 'mechanical strength',
        'young modulus', 'tensile strength', 'flexibility', 'transparency', 'impermeability',
        'electron mobility', 'bandgap', 'work function', 'surface area', 'porosity'
      ],
      applications: [
        'battery', 'supercapacitor', 'solar cell', 'transistor', 'sensor', 'composite',
        'coating', 'membrane', 'filter', 'catalyst', 'electrode', 'touch screen',
        'flexible electronics', 'wearable', 'biomedical', 'drug delivery', 'neural interface'
      ],
      production: [
        'chemical vapor deposition', 'cvd', 'mechanical exfoliation', 'liquid phase exfoliation',
        'thermal reduction', 'electrochemical exfoliation', 'plasma enhanced', 'epitaxial growth',
        'roll-to-roll', 'scalable synthesis', 'industrial production', 'manufacturing'
      ],
      research: [
        'breakthrough', 'discovery', 'innovation', 'patent', 'publication', 'study', 'research',
        'experiment', 'characterization', 'analysis', 'synthesis', 'fabrication', 'development'
      ],
      industry: [
        'commercial', 'market', 'investment', 'funding', 'startup', 'company', 'business',
        'revenue', 'profit', 'cost', 'price', 'demand', 'supply', 'competitor', 'partnership'
      ]
    };
  }

  // Enhanced relevance scoring with AI-powered analysis
  async calculateRelevanceScore(article) {
    try {
      const text = this.prepareTextForAnalysis(article);
      
      // Calculate individual factor scores
      const grapheneScore = this.calculateGrapheneKeywordScore(text);
      const materialScore = this.calculateMaterialScienceScore(text);
      const industryScore = this.calculateIndustryContextScore(text);
      const sourceScore = await this.getSourceReliabilityScore(article.sourceId);

      // Weighted final score
      const relevanceScore = (
        grapheneScore * this.relevanceFactors.grapheneKeywords +
        materialScore * this.relevanceFactors.materialScience +
        industryScore * this.relevanceFactors.industryContext +
        sourceScore * this.relevanceFactors.sourceReliability
      );

      // Normalize to 0-10 scale
      const normalizedScore = Math.min(Math.max(relevanceScore, 0), 10);

      return parseFloat(normalizedScore.toFixed(2));

    } catch (error) {
      console.error('Error calculating relevance score:', error);
      return 5.0; // Default middle score
    }
  }

  // Enhanced content categorization
  async categorizeContent(article) {
    try {
      const text = this.prepareTextForAnalysis(article);
      const scores = {};

      // Calculate category scores
      scores.RESEARCH_BREAKTHROUGH = this.calculateCategoryScore(text, [
        ...this.keywordDictionaries.research,
        'breakthrough', 'discovery', 'novel', 'new method', 'first time',
        'unprecedented', 'significant improvement', 'major advance'
      ]);

      scores.INDUSTRY_NEWS = this.calculateCategoryScore(text, [
        ...this.keywordDictionaries.industry,
        'company', 'business', 'commercial', 'market', 'industry',
        'partnership', 'acquisition', 'merger', 'ipo'
      ]);

      scores.MARKET_ANALYSIS = this.calculateCategoryScore(text, [
        'market', 'analysis', 'forecast', 'trend', 'growth', 'demand',
        'supply', 'price', 'valuation', 'investment', 'revenue'
      ]);

      scores.APPLICATIONS = this.calculateCategoryScore(text, [
        ...this.keywordDictionaries.applications,
        'application', 'use case', 'implementation', 'deployment',
        'integration', 'prototype', 'demonstration'
      ]);

      scores.PRODUCTION_METHODS = this.calculateCategoryScore(text, [
        ...this.keywordDictionaries.production,
        'production', 'manufacturing', 'synthesis', 'fabrication',
        'process', 'method', 'technique', 'scalable', 'industrial'
      ]);

      scores.PATENTS = this.calculateCategoryScore(text, [
        'patent', 'intellectual property', 'ip', 'licensing',
        'patent application', 'patent grant', 'uspto', 'patent office'
      ]);

      scores.COMPANY_NEWS = this.calculateCategoryScore(text, [
        'company', 'startup', 'firm', 'corporation', 'enterprise',
        'funding', 'investment', 'series a', 'series b', 'vc'
      ]);

      scores.FUNDING_INVESTMENT = this.calculateCategoryScore(text, [
        'funding', 'investment', 'grant', 'venture capital', 'vc',
        'private equity', 'ipo', 'public offering', 'raise', 'round'
      ]);

      // Return category with highest score
      const bestCategory = Object.keys(scores).reduce((a, b) => 
        scores[a] > scores[b] ? a : b
      );

      return bestCategory;

    } catch (error) {
      console.error('Error categorizing content:', error);
      return 'INDUSTRY_NEWS'; // Default category
    }
  }

  // Generate intelligent summary
  async generateSummary(article) {
    try {
      const content = article.content || article.summary || '';
      
      if (!content || content.length < 200) {
        return article.summary; // Return original if too short
      }

      // Simple extractive summarization
      const sentences = this.extractSentences(content);
      const rankedSentences = this.rankSentencesByRelevance(sentences);
      
      // Take top 3-5 sentences based on content length
      const summaryLength = Math.min(Math.max(Math.floor(sentences.length * 0.3), 3), 5);
      const summarySentences = rankedSentences.slice(0, summaryLength);
      
      // Sort by original order and join
      const originalOrder = sentences.map((sentence, index) => ({ sentence, index }));
      const orderedSummary = summarySentences
        .map(sentence => originalOrder.find(item => item.sentence === sentence))
        .filter(item => item)
        .sort((a, b) => a.index - b.index)
        .map(item => item.sentence);

      return orderedSummary.join(' ').substring(0, 1000);

    } catch (error) {
      console.error('Error generating summary:', error);
      return article.summary;
    }
  }

  // Extract and rank keywords
  async extractKeywords(article) {
    try {
      const text = this.prepareTextForAnalysis(article);
      const keywords = new Set();

      // Extract from predefined dictionaries
      for (const [category, terms] of Object.entries(this.keywordDictionaries)) {
        for (const term of terms) {
          if (text.toLowerCase().includes(term.toLowerCase())) {
            keywords.add(term);
          }
        }
      }

      // Simple n-gram extraction for additional keywords
      const words = text.toLowerCase().split(/\W+/);
      const bigrams = [];
      
      for (let i = 0; i < words.length - 1; i++) {
        const bigram = words[i] + ' ' + words[i + 1];
        if (this.isRelevantBigram(bigram)) {
          bigrams.push(bigram);
        }
      }

      // Combine and limit keywords
      const allKeywords = [...keywords, ...bigrams];
      return allKeywords.slice(0, 20); // Limit to 20 keywords

    } catch (error) {
      console.error('Error extracting keywords:', error);
      return [];
    }
  }

  // Detect and merge duplicate articles
  async detectDuplicates(article) {
    try {
      // Check for exact URL matches
      const exactMatch = await this.prisma.newsArticle.findUnique({
        where: { url: article.url }
      });
      
      if (exactMatch) {
        return { isDuplicate: true, duplicateId: exactMatch.id, type: 'exact' };
      }

      // Check for similar titles (fuzzy matching)
      const similarTitles = await this.prisma.newsArticle.findMany({
        where: {
          publishDate: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        select: { id: true, title: true }
      });

      for (const existing of similarTitles) {
        const similarity = this.calculateTextSimilarity(article.title, existing.title);
        if (similarity > 0.85) { // 85% similarity threshold
          return { isDuplicate: true, duplicateId: existing.id, type: 'similar' };
        }
      }

      return { isDuplicate: false };

    } catch (error) {
      console.error('Error detecting duplicates:', error);
      return { isDuplicate: false };
    }
  }

  // Helper methods

  prepareTextForAnalysis(article) {
    return [
      article.title || '',
      article.summary || '',
      article.content || ''
    ].join(' ').toLowerCase();
  }

  calculateGrapheneKeywordScore(text) {
    let score = 0;
    
    // Strict graphene-only focus - heavily weight direct graphene mentions
    const coreGrapheneTerms = this.keywordDictionaries.graphene;
    const relatedMaterialTerms = this.keywordDictionaries.relatedMaterials;
    
    // Core graphene terms get massive weight boost
    for (const term of coreGrapheneTerms) {
      const count = (text.match(new RegExp(term.toLowerCase(), 'g')) || []).length;
      score += count * 5; // 5x multiplier for direct graphene terms
    }
    
    // Related materials only count if graphene is present
    const hasGraphene = coreGrapheneTerms.some(term => 
      text.includes(term.toLowerCase())
    );
    
    if (hasGraphene) {
      for (const term of relatedMaterialTerms) {
        const count = (text.match(new RegExp(term.toLowerCase(), 'g')) || []).length;
        score += count * 1; // Normal weight for related terms
      }
    }
    
    // Penalty if no direct graphene mentions (critical requirement)
    if (!hasGraphene) {
      return 0; // Zero score if no graphene mentions
    }
    
    // Enhanced normalization with higher ceiling for graphene-rich content
    return Math.min(score / 3, 10); // Easier to reach high scores with graphene focus
  }

  calculateMaterialScienceScore(text) {
    let score = 0;
    const materialTerms = [
      ...this.keywordDictionaries.properties,
      ...this.keywordDictionaries.production
    ];

    for (const term of materialTerms) {
      if (text.includes(term.toLowerCase())) {
        score += 1;
      }
    }

    return Math.min(score / 3, 10); // Normalize to 0-10
  }

  calculateIndustryContextScore(text) {
    let score = 0;
    const industryTerms = [
      ...this.keywordDictionaries.applications,
      ...this.keywordDictionaries.industry
    ];

    for (const term of industryTerms) {
      if (text.includes(term.toLowerCase())) {
        score += 1;
      }
    }

    return Math.min(score / 3, 10); // Normalize to 0-10
  }

  async getSourceReliabilityScore(sourceId) {
    try {
      const source = await this.prisma.newsSource.findUnique({
        where: { id: sourceId },
        select: { reliabilityScore: true }
      });

      return source?.reliabilityScore 
        ? parseFloat(source.reliabilityScore.toString()) 
        : 5.0; // Default middle score
    } catch (error) {
      console.error('Error getting source reliability:', error);
      return 5.0;
    }
  }

  calculateCategoryScore(text, keywords) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    return score;
  }

  extractSentences(text) {
    return text.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20); // Filter out very short sentences
  }

  rankSentencesByRelevance(sentences) {
    const scoredSentences = sentences.map(sentence => ({
      sentence,
      score: this.calculateSentenceRelevance(sentence)
    }));

    return scoredSentences
      .sort((a, b) => b.score - a.score)
      .map(item => item.sentence);
  }

  calculateSentenceRelevance(sentence) {
    let score = 0;
    const text = sentence.toLowerCase();

    // High-value keywords get more points
    const highValueTerms = [
      'graphene', 'breakthrough', 'discovery', 'research', 'study',
      'development', 'application', 'performance', 'efficiency'
    ];

    for (const term of highValueTerms) {
      if (text.includes(term)) score += 2;
    }

    // Position bias - earlier sentences often more important
    if (sentence.length > 50 && sentence.length < 200) score += 1;

    return score;
  }

  isRelevantBigram(bigram) {
    const relevantPrefixes = [
      'graphene', 'carbon', 'nano', 'material', 'electronic', 'quantum',
      'thermal', 'electrical', 'mechanical', 'chemical', 'optical'
    ];

    return relevantPrefixes.some(prefix => 
      bigram.startsWith(prefix) && bigram.length > prefix.length + 2
    );
  }

  calculateTextSimilarity(text1, text2) {
    // Simple Jaccard similarity for duplicate detection
    const words1 = new Set(text1.toLowerCase().split(/\W+/));
    const words2 = new Set(text2.toLowerCase().split(/\W+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  // Process article with AI enhancements
  async processArticleWithAI(article) {
    try {
      console.log(`AI processing article: ${article.title}`);

      // Check for duplicates first
      const duplicateCheck = await this.detectDuplicates(article);
      if (duplicateCheck.isDuplicate) {
        console.log(`Duplicate detected: ${article.title}`);
        return { processed: false, reason: 'duplicate' };
      }

      // Calculate enhanced relevance score
      const relevanceScore = await this.calculateRelevanceScore(article);
      
      // Skip articles with very low relevance
      if (relevanceScore < 2.0) {
        console.log(`Low relevance article skipped: ${article.title} (score: ${relevanceScore})`);
        return { processed: false, reason: 'low_relevance' };
      }

      // Enhanced categorization
      const category = await this.categorizeContent(article);

      // Generate improved summary
      const enhancedSummary = await this.generateSummary(article);

      // Extract keywords
      const keywords = await this.extractKeywords(article);

      return {
        processed: true,
        enhancements: {
          relevanceScore,
          category,
          summary: enhancedSummary,
          keywords
        }
      };

    } catch (error) {
      console.error('Error in AI processing:', error);
      throw error;
    }
  }
}