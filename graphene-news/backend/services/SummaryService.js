import OpenAI from 'openai';
import dotenv from 'dotenv';
import { PromptTemplates } from './PromptTemplates.js';

dotenv.config();

export class SummaryService {
  constructor(prisma) {
    this.prisma = prisma;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Configuration for cost optimization
    this.config = {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      maxInputTokens: parseInt(process.env.SUMMARY_MAX_TOKENS || '1000'),
      maxOutputTokens: parseInt(process.env.SUMMARY_OUTPUT_TOKENS || '150'),
      batchSize: parseInt(process.env.SUMMARY_BATCH_SIZE || '10'),
      monthlyLimit: parseFloat(process.env.SUMMARY_MONTHLY_LIMIT || '30'),
      enabled: process.env.SUMMARY_ENABLED === 'true'
    };

    // Cost tracking
    this.costPerInputToken = 0.00000015; // $0.15 per 1M tokens for gpt-4o-mini
    this.costPerOutputToken = 0.0000006;  // $0.60 per 1M tokens for gpt-4o-mini
    this.monthlyUsage = { input: 0, output: 0, cost: 0 };
  }

  /**
   * Generate a layman's summary for an article
   * @param {Object} article - Article object with title, summary, content
   * @returns {Object} Summary result with text and metadata
   */
  async generateSummary(article) {
    if (!this.config.enabled) {
      throw new Error('Summary generation is disabled');
    }

    // Check monthly limit
    if (this.monthlyUsage.cost >= this.config.monthlyLimit) {
      throw new Error(`Monthly cost limit of $${this.config.monthlyLimit} reached`);
    }

    try {
      // Use optimized prompt templates
      const systemPrompt = PromptTemplates.getOptimalPrompt(article);
      let articleText = PromptTemplates.formatArticleForSummary(article);
      
      // Count tokens (rough estimate: 1 token ≈ 4 characters)
      const estimatedInputTokens = Math.ceil((systemPrompt + articleText).length / 4);
      
      if (estimatedInputTokens > this.config.maxInputTokens) {
        // If still too long, use simplified formatting
        articleText = this.prepareArticleText(article);
      }

      // Generate summary using OpenAI with optimized prompts
      const completion = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a business analyst creating concise summaries for executives. Be specific and actionable.'
          },
          {
            role: 'user',
            content: `${systemPrompt}\n\nArticle:\n${articleText}`
          }
        ],
        max_tokens: this.config.maxOutputTokens,
        temperature: 0.3, // Lower temperature for more consistent summaries
      });

      const summary = completion.choices[0].message.content;
      const usage = completion.usage;

      // Track usage and costs
      this.trackUsage(usage);

      // Log for monitoring
      console.log(`Generated summary for: ${article.title}`);
      console.log(`Tokens used - Input: ${usage.prompt_tokens}, Output: ${usage.completion_tokens}`);
      console.log(`Cost: $${this.calculateCost(usage).toFixed(4)}`);

      return {
        summary,
        tokens: {
          input: usage.prompt_tokens,
          output: usage.completion_tokens,
          total: usage.total_tokens
        },
        cost: this.calculateCost(usage),
        model: this.config.model
      };

    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error(`Summary generation failed: ${error.message}`);
    }
  }

  /**
   * Generate summaries for multiple articles in batch (more efficient)
   * @param {Array} articles - Array of article objects
   * @returns {Array} Array of summary results
   */
  async generateBatchSummaries(articles) {
    const results = [];
    const batches = this.chunkArray(articles, this.config.batchSize);

    for (const batch of batches) {
      // Process batch in parallel for efficiency
      const batchPromises = batch.map(article => 
        this.generateSummary(article)
          .then(result => ({ articleId: article.id, success: true, ...result }))
          .catch(error => ({ articleId: article.id, success: false, error: error.message }))
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches to respect rate limits
      await this.delay(1000); // 1 second delay
    }

    return results;
  }

  /**
   * Prepare article text for summarization (optimize tokens)
   */
  prepareArticleText(article) {
    // Prioritize content, then summary, then truncate if needed
    let text = '';

    if (article.content) {
      text = article.content;
    } else if (article.summary) {
      text = article.summary;
    } else {
      text = article.title;
    }

    // Clean up text to save tokens
    text = text
      .replace(/\s+/g, ' ') // Remove excess whitespace
      .replace(/\n{3,}/g, '\n\n') // Limit line breaks
      .trim();

    // Focus on first part of article (most important info usually at beginning)
    const maxLength = this.config.maxInputTokens * 3; // Rough char estimate
    if (text.length > maxLength) {
      text = text.substring(0, maxLength);
      // Find last complete sentence
      const lastPeriod = text.lastIndexOf('.');
      if (lastPeriod > maxLength * 0.8) {
        text = text.substring(0, lastPeriod + 1);
      }
    }

    return text;
  }

  /**
   * Get optimized system prompt for layman summaries
   */
  getSystemPrompt() {
    return `You are an expert at explaining complex scientific articles to business professionals. 
Your task is to create a brief, clear summary that:
1. Explains technical concepts in simple business terms
2. Highlights practical applications and business implications
3. Focuses on relevance to energy storage, batteries, supercapacitors, hemp materials, and electrodes
4. Identifies potential business opportunities or market impacts
5. Keeps the summary under 150 words

Write in a professional but accessible tone. Avoid jargon. Focus on "what this means for business" rather than technical details.`;
  }

  /**
   * Calculate cost for API usage
   */
  calculateCost(usage) {
    const inputCost = (usage.prompt_tokens * this.costPerInputToken);
    const outputCost = (usage.completion_tokens * this.costPerOutputToken);
    return inputCost + outputCost;
  }

  /**
   * Track usage for monitoring and limits
   */
  trackUsage(usage) {
    this.monthlyUsage.input += usage.prompt_tokens;
    this.monthlyUsage.output += usage.completion_tokens;
    this.monthlyUsage.cost += this.calculateCost(usage);
  }

  /**
   * Get current usage statistics
   */
  getUsageStats() {
    return {
      ...this.monthlyUsage,
      limitRemaining: this.config.monthlyLimit - this.monthlyUsage.cost,
      percentUsed: (this.monthlyUsage.cost / this.config.monthlyLimit) * 100
    };
  }

  /**
   * Reset monthly usage (call this via cron job monthly)
   */
  resetMonthlyUsage() {
    this.monthlyUsage = { input: 0, output: 0, cost: 0 };
    console.log('Monthly usage reset');
  }

  /**
   * Utility: Chunk array for batch processing
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Utility: Delay function for rate limiting
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Process all pending summary generations for existing articles
   */
  async processPendingSummaries() {
    console.log('🔄 Processing pending summary generations...');
    
    try {
      // Find articles that need summaries
      const pendingArticles = await this.prisma.newsArticle.findMany({
        where: {
          OR: [
            { summaryStatus: 'PENDING' },
            { 
              AND: [
                { summaryStatus: 'FAILED' },
                { summaryAttempts: { lt: 3 } }
              ]
            }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: 20 // Process in batches to avoid overwhelming the API
      });

      console.log(`Found ${pendingArticles.length} articles needing summaries`);

      if (pendingArticles.length === 0) {
        console.log('✅ No pending summaries to process');
        return { processed: 0, successful: 0, failed: 0 };
      }

      // Process summaries with ContentAcquisitionService pattern
      let successful = 0;
      let failed = 0;

      for (const article of pendingArticles) {
        try {
          console.log(`🤖 Generating summary for: ${article.title.substring(0, 60)}...`);
          
          // Mark as generating
          await this.updateSummaryStatus(article.id, 'GENERATING');
          
          const result = await this.generateSummary(article);
          
          // Update with summary
          await this.updateArticleWithSummary(article.id, result.summary);
          
          successful++;
          console.log(`✅ Summary generated for article ${article.id}`);
          
          // Add delay to respect rate limits
          await this.delay(1000);
          
        } catch (error) {
          console.error(`❌ Failed to generate summary for article ${article.id}:`, error);
          await this.updateArticleWithSummaryError(article.id, error.message);
          failed++;
        }
      }

      const results = {
        processed: pendingArticles.length,
        successful,
        failed
      };

      console.log(`📊 Summary processing complete:`, results);
      return results;

    } catch (error) {
      console.error('❌ Error processing pending summaries:', error);
      throw error;
    }
  }

  /**
   * Update summary status
   */
  async updateSummaryStatus(articleId, status) {
    try {
      await this.prisma.newsArticle.update({
        where: { id: articleId },
        data: {
          summaryStatus: status,
          summaryAttempts: status === 'GENERATING' ? { increment: 1 } : undefined
        }
      });
    } catch (error) {
      console.error(`Error updating summary status for article ${articleId}:`, error);
    }
  }

  /**
   * Update article with generated summary
   */
  async updateArticleWithSummary(articleId, summary) {
    try {
      await this.prisma.newsArticle.update({
        where: { id: articleId },
        data: {
          laymanSummary: summary,
          summaryGenerated: true,
          summaryGeneratedAt: new Date(),
          summaryStatus: 'COMPLETED',
          summaryError: null
        }
      });
    } catch (error) {
      console.error(`Error updating article ${articleId} with summary:`, error);
    }
  }

  /**
   * Update article with summary error
   */
  async updateArticleWithSummaryError(articleId, errorMessage) {
    try {
      await this.prisma.newsArticle.update({
        where: { id: articleId },
        data: {
          summaryGenerated: false,
          summaryStatus: 'FAILED',
          summaryError: errorMessage
        }
      });
    } catch (error) {
      console.error(`Error updating article ${articleId} with summary error:`, error);
    }
  }

  /**
   * Check if summary generation should proceed based on article criteria
   * Since we now use mandatory graphene filtering, all articles are worthy of summaries
   */
  shouldGenerateSummary(article) {
    // Only if not already generated or failed
    if (article.summaryGenerated || article.summaryStatus === 'COMPLETED') {
      return false;
    }

    // Don't retry if already failed too many times
    if (article.summaryStatus === 'FAILED' && article.summaryAttempts >= 3) {
      return false;
    }

    // Skip if currently generating
    if (article.summaryStatus === 'GENERATING') {
      return false;
    }

    // All graphene articles that pass GrapheneFilter are worthy of summaries
    // since they've already been vetted for relevance
    return true;
  }
}