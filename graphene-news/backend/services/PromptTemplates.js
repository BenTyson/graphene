/**
 * Optimized prompt templates for different article types
 * Designed to minimize token usage while maximizing clarity
 */

export class PromptTemplates {
  /**
   * Get the appropriate prompt based on article category
   */
  static getPromptForCategory(category) {
    const prompts = {
      'RESEARCH_BREAKTHROUGH': this.researchPrompt(),
      'MARKET_ANALYSIS': this.marketPrompt(),
      'PATENTS': this.patentPrompt(),
      'COMPANY_NEWS': this.companyPrompt(),
      'APPLICATIONS': this.applicationPrompt(),
      'PRODUCTION_METHODS': this.productionPrompt(),
      'INDUSTRY_NEWS': this.generalPrompt(),
      'FUNDING_INVESTMENT': this.fundingPrompt()
    };

    return prompts[category] || this.generalPrompt();
  }

  /**
   * Research breakthrough articles
   */
  static researchPrompt() {
    return `You are translating cutting-edge research for business executives. In 100-150 words:
1. What breakthrough was achieved?
2. How does it improve on existing technology?
3. Timeline to commercialization?
4. Market opportunity size?
5. Relevance to energy storage/supercapacitors/hemp materials?

Focus on business impact, not scientific details.`;
  }

  /**
   * Market analysis articles
   */
  static marketPrompt() {
    return `You are a market analyst explaining trends to investors. In 100-150 words:
1. What market trend or opportunity is described?
2. Size and growth rate of the market?
3. Key players or competitors mentioned?
4. Investment implications?
5. Connection to graphene/energy storage markets?

Emphasize financial and strategic insights.`;
  }

  /**
   * Patent articles
   */
  static patentPrompt() {
    return `You are explaining a patent's business value. In 100-150 words:
1. What problem does this patent solve?
2. Commercial applications?
3. Competitive advantage it provides?
4. Licensing or partnership opportunities?
5. Relevance to electrodes/batteries/supercapacitors?

Focus on IP value and market positioning.`;
  }

  /**
   * Company news articles
   */
  static companyPrompt() {
    return `You are a business analyst covering company developments. In 100-150 words:
1. What is the company announcing?
2. Strategic importance of this move?
3. Impact on competitive landscape?
4. Partnership or acquisition opportunities?
5. Relevance to graphene/hemp supply chain?

Highlight business strategy implications.`;
  }

  /**
   * Application articles
   */
  static applicationPrompt() {
    return `You are explaining new product applications to product managers. In 100-150 words:
1. What new application is described?
2. Target market and customer base?
3. Performance advantages?
4. Cost-benefit analysis?
5. Fit with energy storage/supercapacitor applications?

Focus on practical implementation and ROI.`;
  }

  /**
   * Production methods articles
   */
  static productionPrompt() {
    return `You are explaining manufacturing advances to operations executives. In 100-150 words:
1. What production improvement is described?
2. Cost reduction or efficiency gains?
3. Scalability potential?
4. Equipment or investment requirements?
5. Applicability to graphene/hemp processing?

Emphasize operational and cost benefits.`;
  }

  /**
   * Funding/Investment articles
   */
  static fundingPrompt() {
    return `You are a venture analyst explaining investment news. In 100-150 words:
1. Who received funding and how much?
2. What will the funds be used for?
3. Investor rationale and market validation?
4. Competitive implications?
5. Relevance to energy storage/materials sector?

Focus on investment thesis and market signals.`;
  }

  /**
   * General/Industry news articles
   */
  static generalPrompt() {
    return `You are a business consultant explaining industry news. In 100-150 words:
1. What is the key development?
2. Why does it matter for business?
3. Opportunities or risks created?
4. Industry implications?
5. Connection to graphene/energy storage/hemp markets?

Provide clear business context and actionable insights.`;
  }

  /**
   * High-impact keyword focused prompt
   * Used when article contains priority keywords
   */
  static highImpactPrompt(keywords) {
    const keywordString = keywords.join(', ');
    return `This article discusses ${keywordString}. As a business strategist, explain in 100-150 words:
1. Direct relevance to ${keywordString} applications
2. Competitive advantages described
3. Implementation timeline and costs
4. Market opportunity specific to these technologies
5. Action items for a company in this space

Be specific about business opportunities in ${keywordString}.`;
  }

  /**
   * Get prompt based on article content and keywords
   */
  static getOptimalPrompt(article) {
    // Check for high-impact keywords first
    const highImpactKeywords = ['hemp', 'supercapacitor', 'energy storage', 'cathode', 'anode', 'electrode'];
    const foundKeywords = article.keywordTags?.filter(tag => 
      highImpactKeywords.some(keyword => tag.toLowerCase().includes(keyword))
    );

    // Use specialized prompt for high-impact articles
    if (foundKeywords && foundKeywords.length > 0) {
      return this.highImpactPrompt(foundKeywords);
    }

    // Otherwise use category-specific prompt
    return this.getPromptForCategory(article.category);
  }

  /**
   * Format article for token-efficient processing
   */
  static formatArticleForSummary(article) {
    // Create a concise representation focusing on key information
    const parts = [];

    // Always include title
    parts.push(`Title: ${article.title}`);

    // Include summary if available and substantial
    if (article.summary && article.summary.length > 50) {
      parts.push(`Summary: ${article.summary.substring(0, 300)}`);
    }

    // Include beginning of content if available
    if (article.content && article.content.length > 100) {
      const contentPreview = article.content
        .substring(0, 600)
        .replace(/\s+/g, ' ')
        .trim();
      parts.push(`Content: ${contentPreview}`);
    }

    // Add keywords for context
    if (article.keywordTags && article.keywordTags.length > 0) {
      parts.push(`Keywords: ${article.keywordTags.slice(0, 5).join(', ')}`);
    }

    return parts.join('\n\n');
  }
}