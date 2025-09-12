/**
 * GrapheneFilter Service
 * Dedicated service for strict graphene content validation
 * Ensures only genuine graphene-related articles pass through
 */

export class GrapheneFilter {
  constructor() {
    // Comprehensive graphene terminology dictionary
    this.grapheneTerms = {
      // Core graphene terms (highest priority)
      core: [
        'graphene', 'single-layer graphene', 'multilayer graphene', 'few-layer graphene',
        'monolayer graphene', 'bilayer graphene', 'trilayer graphene'
      ],
      
      // Graphene variants and derivatives
      variants: [
        'graphene oxide', 'reduced graphene oxide', 'rgo', 'go',
        'epitaxial graphene', 'cvd graphene', 'chemical vapor deposition graphene',
        'pristine graphene', 'defect-free graphene', 'high-quality graphene',
        'functionalized graphene', 'chemically modified graphene',
        'graphene nanoplatelets', 'gnp', 'graphene nanosheets',
        'graphene quantum dots', 'gqds', 'graphene nanoflakes',
        'hydrogenated graphene', 'graphane', 'fluorinated graphene',
        'boron-doped graphene', 'nitrogen-doped graphene', 'doped graphene'
      ],
      
      // Graphene composites and materials
      composites: [
        'graphene composite', 'graphene-polymer composite', 'graphene nanocomposite',
        'graphene-metal composite', 'graphene-ceramic composite',
        'graphene reinforced', 'graphene enhanced', 'graphene based',
        'graphene incorporated', 'graphene modified'
      ],
      
      // Graphene applications and products
      applications: [
        'graphene electrode', 'graphene battery', 'graphene supercapacitor',
        'graphene sensor', 'graphene transistor', 'graphene coating',
        'graphene membrane', 'graphene filter', 'graphene catalyst',
        'graphene touchscreen', 'graphene display', 'graphene solar cell',
        'graphene thermal interface', 'graphene heat sink'
      ],
      
      // Manufacturing and processing
      processing: [
        'graphene production', 'graphene synthesis', 'graphene fabrication',
        'graphene manufacturing', 'graphene processing', 'graphene deposition',
        'graphene transfer', 'graphene growth', 'graphene exfoliation',
        'liquid phase exfoliation', 'mechanical exfoliation', 'thermal exfoliation'
      ]
    };

    // Minimum requirements for graphene relevance
    this.requirements = {
      minGrapheneMentions: 1,        // Must mention graphene at least once
      minRelevanceScore: 8.0,        // VERY STRICT - only clearly graphene-focused articles
      minGrapheneContextScore: 3.0,  // Graphene must be highly contextually relevant
      maxNonGrapheneRatio: 0.5       // Max 50% of content can be non-graphene related
    };

    // Weight multipliers for different term categories
    this.termWeights = {
      core: 3.0,         // Core graphene terms get highest weight
      variants: 2.5,     // Graphene variants are very important  
      composites: 2.0,   // Composites are important
      applications: 1.8, // Applications are relevant
      processing: 1.5    // Processing terms are moderately relevant
    };
  }

  /**
   * Main validation method - determines if article is graphene-relevant
   */
  async validateGrapheneRelevance(article) {
    try {
      const text = this.extractRelevantText(article);
      
      // Stage 1: Basic graphene keyword check
      const hasGrapheneTerms = this.hasRequiredGrapheneTerms(text);
      if (!hasGrapheneTerms.isValid) {
        return {
          isValid: false,
          reason: 'insufficient_graphene_mentions',
          details: hasGrapheneTerms.details,
          score: 0
        };
      }

      // Stage 2: Calculate graphene context score
      const contextScore = this.calculateGrapheneContextScore(text);
      if (contextScore < this.requirements.minGrapheneContextScore) {
        return {
          isValid: false,
          reason: 'low_graphene_context',
          details: { contextScore, required: this.requirements.minGrapheneContextScore },
          score: contextScore
        };
      }

      // Stage 3: Check content balance (not too much non-graphene content)
      const contentBalance = this.analyzeContentBalance(text);
      if (contentBalance.nonGrapheneRatio > this.requirements.maxNonGrapheneRatio) {
        return {
          isValid: false,
          reason: 'too_much_non_graphene_content',
          details: contentBalance,
          score: contextScore
        };
      }

      // Stage 4: Calculate final graphene relevance score
      const finalScore = this.calculateFinalGrapheneScore(text, contextScore, contentBalance);
      
      return {
        isValid: finalScore >= this.requirements.minRelevanceScore,
        reason: finalScore >= this.requirements.minRelevanceScore ? 'graphene_relevant' : 'low_final_score',
        details: {
          contextScore,
          contentBalance,
          finalScore,
          grapheneTerms: hasGrapheneTerms.details
        },
        score: finalScore
      };

    } catch (error) {
      console.error('Error in graphene validation:', error);
      return {
        isValid: false,
        reason: 'validation_error',
        details: { error: error.message },
        score: 0
      };
    }
  }

  /**
   * Extract relevant text from article for analysis
   */
  extractRelevantText(article) {
    const parts = [];
    
    // Title gets 3x weight (most important)
    if (article.title) {
      parts.push(article.title.repeat(3));
    }
    
    // Summary gets 2x weight
    if (article.summary) {
      parts.push(article.summary.repeat(2));
    }
    
    // Content gets normal weight (but limited to first 1000 chars)
    if (article.content) {
      parts.push(article.content.substring(0, 1000));
    }
    
    // Keywords get 2x weight
    if (article.keywordTags && article.keywordTags.length > 0) {
      parts.push(article.keywordTags.join(' ').repeat(2));
    }

    return parts.join(' ').toLowerCase();
  }

  /**
   * Check if article has minimum required graphene terms
   */
  hasRequiredGrapheneTerms(text) {
    let totalMentions = 0;
    const foundTerms = [];

    // Check each category of graphene terms
    for (const [category, terms] of Object.entries(this.grapheneTerms)) {
      for (const term of terms) {
        const matches = (text.match(new RegExp(term.toLowerCase(), 'g')) || []).length;
        if (matches > 0) {
          totalMentions += matches;
          foundTerms.push({ term, category, count: matches });
        }
      }
    }

    return {
      isValid: totalMentions >= this.requirements.minGrapheneMentions,
      details: {
        totalMentions,
        foundTerms,
        required: this.requirements.minGrapheneMentions
      }
    };
  }

  /**
   * Calculate how contextually relevant graphene is to the content
   */
  calculateGrapheneContextScore(text) {
    let score = 0;
    const sentences = text.split(/[.!?]+/).filter(s => s.length > 10);
    let grapheneSentenceCount = 0;

    // Analyze each sentence for graphene relevance
    for (const sentence of sentences) {
      let sentenceScore = 0;
      
      // Check for graphene terms in this sentence
      for (const [category, terms] of Object.entries(this.grapheneTerms)) {
        for (const term of terms) {
          if (sentence.includes(term.toLowerCase())) {
            sentenceScore += this.termWeights[category];
            grapheneSentenceCount++;
            break; // Only count one term per category per sentence
          }
        }
      }
      
      // Boost for sentences with multiple graphene concepts
      if (sentenceScore > 2) {
        sentenceScore *= 1.5;
      }
      
      score += sentenceScore;
    }

    // Normalize score based on text length and graphene density
    const grapheneDensity = grapheneSentenceCount / Math.max(sentences.length, 1);
    const normalizedScore = (score * grapheneDensity) / 10;
    
    return Math.min(normalizedScore, 10);
  }

  /**
   * Analyze the balance between graphene and non-graphene content
   */
  analyzeContentBalance(text) {
    const words = text.split(/\s+/);
    let grapheneWords = 0;
    let totalRelevantWords = 0;

    // Materials science terms that are OK if paired with graphene
    const materialsScienceTerms = [
      'materials', 'nanotechnology', 'carbon', 'electronic', 'properties',
      'synthesis', 'characterization', 'applications', 'device', 'performance'
    ];

    for (const word of words) {
      // Count graphene-related words
      let isGrapheneWord = false;
      for (const [category, terms] of Object.entries(this.grapheneTerms)) {
        if (terms.some(term => word.includes(term.toLowerCase()))) {
          grapheneWords++;
          totalRelevantWords++;
          isGrapheneWord = true;
          break;
        }
      }

      // Count materials science words (only relevant if graphene present)
      if (!isGrapheneWord && materialsScienceTerms.some(term => word.includes(term))) {
        totalRelevantWords++;
      }
    }

    const nonGrapheneRatio = totalRelevantWords > 0 ? 
      (totalRelevantWords - grapheneWords) / totalRelevantWords : 1;

    return {
      grapheneWords,
      totalRelevantWords,
      nonGrapheneRatio,
      grapheneRatio: grapheneWords / Math.max(totalRelevantWords, 1)
    };
  }

  /**
   * Calculate final graphene relevance score
   */
  calculateFinalGrapheneScore(text, contextScore, contentBalance) {
    let score = contextScore;

    // Boost for high graphene ratio in content
    if (contentBalance.grapheneRatio > 0.3) {
      score *= 1.3;
    }

    // Boost for graphene in title
    const titleCheck = this.hasRequiredGrapheneTerms(text.substring(0, 100));
    if (titleCheck.isValid) {
      score *= 1.4;
    }

    // Penalize if too much non-graphene content
    if (contentBalance.nonGrapheneRatio > 0.5) {
      score *= (1 - (contentBalance.nonGrapheneRatio - 0.5));
    }

    return Math.min(score, 10);
  }

  /**
   * Get comprehensive graphene statistics for an article
   */
  getGrapheneStats(article) {
    const text = this.extractRelevantText(article);
    const validation = this.validateGrapheneRelevance(article);
    
    return {
      isGrapheneRelevant: validation.isValid,
      grapheneScore: validation.score,
      validation: validation,
      recommendations: this.generateRecommendations(validation)
    };
  }

  /**
   * Generate recommendations for improving graphene relevance
   */
  generateRecommendations(validation) {
    const recommendations = [];

    if (!validation.isValid) {
      switch (validation.reason) {
        case 'insufficient_graphene_mentions':
          recommendations.push('Article needs more explicit graphene terminology');
          recommendations.push('Consider adding specific graphene variants or applications');
          break;
        case 'low_graphene_context':
          recommendations.push('Graphene mentions appear incidental rather than central to content');
          recommendations.push('Article should focus more on graphene-specific aspects');
          break;
        case 'too_much_non_graphene_content':
          recommendations.push('Too much content unrelated to graphene');
          recommendations.push('Consider filtering sources to be more graphene-specific');
          break;
        case 'low_final_score':
          recommendations.push('Overall graphene relevance too low for inclusion');
          recommendations.push('Source may not be graphene-focused enough');
          break;
      }
    }

    return recommendations;
  }

  /**
   * Batch validate multiple articles
   */
  async batchValidateArticles(articles) {
    const results = [];
    
    for (const article of articles) {
      const validation = await this.validateGrapheneRelevance(article);
      results.push({
        articleId: article.id,
        title: article.title,
        validation
      });
    }

    // Generate batch statistics
    const validCount = results.filter(r => r.validation.isValid).length;
    const stats = {
      total: results.length,
      valid: validCount,
      invalid: results.length - validCount,
      validationRate: validCount / results.length * 100
    };

    return { results, stats };
  }
}

export default GrapheneFilter;