import Parser from 'rss-parser';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { ImageCacheService } from './ImageCacheService.js';
import { SummaryService } from './SummaryService.js';

export class ContentAcquisitionService {
  constructor(prisma) {
    this.prisma = prisma;
    this.imageCache = new ImageCacheService();
    this.summaryService = new SummaryService(prisma);
    this.rssParser = new Parser({
      customFields: {
        feed: ['image'],
        item: ['media:content', 'media:thumbnail', 'enclosure']
      }
    });
  }

  // Main orchestration method
  async fetchAllContent() {
    console.log('Starting content acquisition cycle...');
    
    try {
      const activeSources = await this.getActiveSources();
      const results = {
        processed: 0,
        errors: 0,
        newArticles: 0
      };

      for (const source of activeSources) {
        try {
          console.log(`Processing source: ${source.name}`);
          
          // Check rate limiting
          if (await this.isRateLimited(source)) {
            console.log(`Skipping ${source.name} due to rate limiting`);
            continue;
          }

          let articles = [];
          
          switch (source.sourceType) {
            case 'RSS':
              articles = await this.fetchRSSContent(source);
              break;
            case 'API':
              articles = await this.fetchAPIContent(source);
              break;
            case 'WEB_SCRAPING':
              articles = await this.fetchScrapedContent(source);
              break;
            default:
              console.warn(`Unknown source type: ${source.sourceType}`);
              continue;
          }

          // Process each article
          for (const articleData of articles) {
            try {
              const processed = await this.processArticle(articleData, source);
              if (processed) {
                results.newArticles++;
              }
              results.processed++;
            } catch (error) {
              console.error(`Error processing article: ${articleData.title}`, error);
              results.errors++;
            }
          }

          // Update source last fetched time
          await this.updateSourceLastFetched(source.id);

        } catch (error) {
          console.error(`Error processing source ${source.name}:`, error);
          results.errors++;
          await this.logProcessingError(source.id, 'FETCH', error.message);
        }
      }

      console.log('Content acquisition cycle completed:', results);
      return results;

    } catch (error) {
      console.error('Error in content acquisition cycle:', error);
      throw error;
    }
  }

  // Get active news sources
  async getActiveSources() {
    return await this.prisma.newsSource.findMany({
      where: { isActive: true },
      orderBy: { reliabilityScore: 'desc' }
    });
  }

  // Check if source is rate limited
  async isRateLimited(source) {
    if (!source.rateLimit || !source.lastFetched) return false;
    
    const hoursSinceLastFetch = (Date.now() - new Date(source.lastFetched).getTime()) / (1000 * 60 * 60);
    return hoursSinceLastFetch < (1 / source.rateLimit);
  }

  // Fetch content from RSS feeds
  async fetchRSSContent(source) {
    try {
      console.log(`Fetching RSS from: ${source.url}`);
      
      const feed = await this.rssParser.parseURL(source.url);
      const articles = [];

      for (const item of feed.items.slice(0, 50)) { // Limit to 50 most recent
        const articleData = {
          title: item.title,
          summary: item.contentSnippet || item.summary,
          content: item.content,
          url: item.link,
          publishDate: new Date(item.pubDate || item.isoDate || Date.now()),
          author: item.creator || item['dc:creator'] || null,
          imageUrls: this.extractImagesFromRSSItem(item)
        };

        articles.push(articleData);
      }

      console.log(`Fetched ${articles.length} articles from RSS: ${source.name}`);
      return articles;

    } catch (error) {
      console.error(`RSS fetch error for ${source.name}:`, error);
      await this.logProcessingError(source.id, 'FETCH', error.message);
      return [];
    }
  }

  // Fetch content from APIs (NewsAPI, etc.)
  async fetchAPIContent(source) {
    try {
      // This would be customized based on the specific API
      // For now, implementing a generic approach
      
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'GrapheneNews/1.0',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const articles = [];

      // Generic API response handling - would need customization per API
      if (data.articles) {
        for (const item of data.articles.slice(0, 50)) {
          const articleData = {
            title: item.title,
            summary: item.description,
            content: item.content,
            url: item.url,
            publishDate: new Date(item.publishedAt || Date.now()),
            author: item.author,
            imageUrls: item.urlToImage ? [item.urlToImage] : []
          };

          articles.push(articleData);
        }
      }

      console.log(`Fetched ${articles.length} articles from API: ${source.name}`);
      return articles;

    } catch (error) {
      console.error(`API fetch error for ${source.name}:`, error);
      await this.logProcessingError(source.id, 'FETCH', error.message);
      return [];
    }
  }

  // Fetch content via web scraping
  async fetchScrapedContent(source) {
    try {
      console.log(`Web scraping from: ${source.url}`);
      
      // Check robots.txt compliance
      if (!await this.checkRobotsTxt(source)) {
        console.log(`Robots.txt disallows scraping for: ${source.url}`);
        return [];
      }

      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'GrapheneNews/1.0 (Research Bot)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      if (!response.ok) {
        throw new Error(`Scraping request failed: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const articles = [];

      // Generic article extraction - would need customization per site
      $('article, .article, .post, .news-item').each((i, element) => {
        if (i >= 20) return false; // Limit to 20 articles

        const $article = $(element);
        const titleEl = $article.find('h1, h2, h3, .title, .headline').first();
        const summaryEl = $article.find('.summary, .excerpt, .description, p').first();
        const linkEl = $article.find('a').first();
        const imageEl = $article.find('img').first();

        const title = titleEl.text().trim();
        const url = this.resolveUrl(linkEl.attr('href'), source.url);
        
        if (title && url) {
          const articleData = {
            title,
            summary: summaryEl.text().trim(),
            content: null, // Would need full page scraping
            url,
            publishDate: new Date(), // Would need better date extraction
            author: null,
            imageUrls: imageEl.attr('src') ? [this.resolveUrl(imageEl.attr('src'), source.url)] : []
          };

          articles.push(articleData);
        }
      });

      console.log(`Scraped ${articles.length} articles from: ${source.name}`);
      return articles;

    } catch (error) {
      console.error(`Web scraping error for ${source.name}:`, error);
      await this.logProcessingError(source.id, 'FETCH', error.message);
      return [];
    }
  }

  // Check robots.txt compliance
  async checkRobotsTxt(source) {
    try {
      const robotsUrl = new URL('/robots.txt', source.url).href;
      const response = await fetch(robotsUrl);
      
      if (!response.ok) return true; // If robots.txt doesn't exist, assume allowed
      
      const robotsTxt = await response.text();
      const lines = robotsTxt.split('\n');
      
      let userAgentSection = false;
      for (const line of lines) {
        const trimmed = line.trim().toLowerCase();
        
        if (trimmed.startsWith('user-agent:')) {
          const agent = trimmed.split(':')[1].trim();
          userAgentSection = agent === '*' || agent.includes('graphenenews');
        } else if (userAgentSection && trimmed.startsWith('disallow:')) {
          const path = trimmed.split(':')[1].trim();
          if (path === '/' || source.url.includes(path)) {
            return false; // Disallowed
          }
        }
      }
      
      return true; // Allowed
      
    } catch (error) {
      console.warn(`Error checking robots.txt for ${source.url}:`, error);
      return true; // Assume allowed on error
    }
  }

  // Process individual article
  async processArticle(articleData, source) {
    try {
      // Create content hash for deduplication
      const contentHash = this.createContentHash(articleData.title, articleData.url);
      
      // Check if article already exists
      const existingArticle = await this.prisma.newsArticle.findUnique({
        where: { contentHash }
      });

      if (existingArticle) {
        console.log(`Duplicate article found: ${articleData.title}`);
        return false; // Not a new article
      }

      // Calculate relevance score (will be enhanced with AI processing)
      const relevanceScore = await this.calculateBasicRelevanceScore(articleData);
      
      // Categorize content (basic implementation)
      const category = await this.categorizeContent(articleData);

      // Process and cache images
      let cachedImages = [];
      let allImageUrls = articleData.imageUrls || [];
      
      // If no images from RSS/API, try to extract from article URL
      if (allImageUrls.length === 0 && articleData.url) {
        try {
          const extractedImages = await this.imageCache.extractImagesFromUrl(articleData.url);
          allImageUrls = [...allImageUrls, ...extractedImages];
        } catch (error) {
          console.warn(`Failed to extract images from article URL: ${articleData.url}`, error);
        }
      }

      // Create new article first
      const newArticle = await this.prisma.newsArticle.create({
        data: {
          title: articleData.title.substring(0, 500), // Limit title length
          summary: articleData.summary?.substring(0, 1000) || null,
          content: articleData.content?.substring(0, 10000) || null,
          url: articleData.url,
          publishDate: articleData.publishDate,
          category,
          relevanceScore,
          contentHash,
          imageUrls: allImageUrls,
          keywordTags: await this.extractKeywords(articleData),
          author: articleData.author?.substring(0, 200) || null,
          readingTime: this.calculateReadingTime(articleData.content || articleData.summary || ''),
          sourceId: source.id
        }
      });

      // Cache images after article creation (async, non-blocking)
      if (allImageUrls.length > 0) {
        this.cacheArticleImagesAsync(newArticle.id, allImageUrls);
      }

      // Generate summary for high-impact articles (async, non-blocking)
      if (this.summaryService.shouldGenerateSummary(newArticle)) {
        this.generateSummaryAsync(newArticle.id, newArticle);
      }

      console.log(`Created new article: ${newArticle.title}`);
      return true;

    } catch (error) {
      console.error('Error processing article:', error);
      await this.logProcessingError(source.id, 'PARSE', error.message);
      throw error;
    }
  }

  // Create content hash for deduplication
  createContentHash(title, url) {
    const content = title + url;
    return crypto.createHash('md5').update(content).digest('hex');
  }

  // Enhanced relevance scoring with high-impact keywords
  async calculateBasicRelevanceScore(articleData) {
    let score = 0;
    const text = (articleData.title + ' ' + (articleData.summary || '') + ' ' + (articleData.content || '')).toLowerCase();

    // High-impact keywords for business relevance (huge boost)
    const highImpactKeywords = {
      'hemp': 20,
      'supercapacitor': 20,
      'supercapacitors': 20,
      'energy storage': 18,
      'cathode': 18,
      'anode': 18,
      'electrode': 15,
      'electrochemical': 15,
      'capacitor': 15,
      'battery storage': 15
    };

    // Graphene-specific keywords with weights
    const keywords = {
      'graphene': 10,
      'carbon nanotube': 8,
      '2d material': 8,
      'carbon fiber': 6,
      'nanomaterial': 6,
      'conductivity': 5,
      'semiconductor': 4,
      'battery': 4,
      'composite': 3,
      'research': 2,
      'breakthrough': 3,
      'patent': 2
    };

    // Check for high-impact keywords first
    let hasHighImpact = false;
    for (const [keyword, weight] of Object.entries(highImpactKeywords)) {
      if (text.includes(keyword)) {
        score += weight;
        hasHighImpact = true;
      }
    }

    // Add regular keywords
    for (const [keyword, weight] of Object.entries(keywords)) {
      if (text.includes(keyword)) {
        score += weight;
      }
    }

    // Bonus for multiple high-impact keyword matches
    if (hasHighImpact && text.includes('graphene')) {
      score += 5; // Extra bonus for graphene + high-impact combo
    }

    // Normalize score to 0-10 scale (adjusted for higher potential scores)
    return Math.min(score / 5, 10);
  }

  // Basic content categorization
  async categorizeContent(articleData) {
    const text = (articleData.title + ' ' + (articleData.summary || '')).toLowerCase();

    if (text.includes('breakthrough') || text.includes('discovery') || text.includes('research')) {
      return 'RESEARCH_BREAKTHROUGH';
    }
    if (text.includes('market') || text.includes('price') || text.includes('investment')) {
      return 'MARKET_ANALYSIS';
    }
    if (text.includes('patent') || text.includes('intellectual property')) {
      return 'PATENTS';
    }
    if (text.includes('company') || text.includes('startup') || text.includes('funding')) {
      return 'COMPANY_NEWS';
    }
    if (text.includes('application') || text.includes('use case') || text.includes('implementation')) {
      return 'APPLICATIONS';
    }
    if (text.includes('production') || text.includes('manufacturing') || text.includes('process')) {
      return 'PRODUCTION_METHODS';
    }
    
    return 'INDUSTRY_NEWS'; // Default category
  }

  // Extract keywords from content with high-impact keyword detection
  async extractKeywords(articleData) {
    const text = (articleData.title + ' ' + (articleData.summary || '') + ' ' + (articleData.content || '')).toLowerCase();
    const keywords = [];

    // High-impact business-relevant keywords
    const highImpactTerms = [
      'hemp', 'supercapacitor', 'supercapacitors', 'energy storage',
      'cathode', 'anode', 'electrode', 'electrochemical', 
      'capacitor', 'battery storage'
    ];

    // Common graphene-related terms
    const commonGrapheneTerms = [
      'graphene', 'carbon nanotube', '2d material', 'nanomaterial',
      'conductivity', 'semiconductor', 'battery', 'composite',
      'research', 'breakthrough', 'patent', 'manufacturing'
    ];

    // Check for high-impact keywords first (these are most important)
    for (const term of highImpactTerms) {
      if (text.includes(term)) {
        keywords.push(term);
      }
    }

    // Then add general graphene terms
    for (const term of commonGrapheneTerms) {
      if (text.includes(term)) {
        keywords.push(term);
      }
    }

    // Remove duplicates and return
    return [...new Set(keywords)];
  }

  // Calculate estimated reading time
  calculateReadingTime(content) {
    if (!content) return null;
    
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  // Extract images from RSS item
  extractImagesFromRSSItem(item) {
    const images = [];
    
    // Check various RSS image fields
    if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
      images.push(item['media:content'].$.url);
    }
    
    if (item['media:thumbnail'] && item['media:thumbnail'].$ && item['media:thumbnail'].$.url) {
      images.push(item['media:thumbnail'].$.url);
    }
    
    if (item.enclosure && item.enclosure.url) {
      images.push(item.enclosure.url);
    }

    // Extract images from content HTML
    if (item.content) {
      const $ = cheerio.load(item.content);
      $('img').each((i, img) => {
        const src = $(img).attr('src');
        if (src) images.push(src);
      });
    }

    return [...new Set(images)]; // Remove duplicates
  }

  // Resolve relative URLs
  resolveUrl(url, baseUrl) {
    if (!url) return null;
    
    try {
      return new URL(url, baseUrl).href;
    } catch (error) {
      return url;
    }
  }

  // Update source last fetched timestamp
  async updateSourceLastFetched(sourceId) {
    await this.prisma.newsSource.update({
      where: { id: sourceId },
      data: { lastFetched: new Date() }
    });
  }

  // Log processing errors
  async logProcessingError(sourceId, processType, errorMessage) {
    try {
      await this.prisma.contentProcessingLog.create({
        data: {
          sourceId,
          processType,
          status: 'FAILED',
          errorMessage
        }
      });
    } catch (error) {
      console.error('Error logging processing error:', error);
    }
  }

  // Async image caching (non-blocking)
  cacheArticleImagesAsync(articleId, imageUrls) {
    // Run in background without awaiting
    this.imageCache.processArticleImages(articleId, imageUrls)
      .then((cachedImages) => {
        if (cachedImages.length > 0) {
          console.log(`Cached ${cachedImages.length} images for article ${articleId}`);
          
          // Update article with cached image paths
          this.updateArticleWithCachedImages(articleId, cachedImages).catch(error => {
            console.error(`Error updating article ${articleId} with cached images:`, error);
          });
        }
      })
      .catch(error => {
        console.error(`Error caching images for article ${articleId}:`, error);
      });
  }

  // Update article with cached image information
  async updateArticleWithCachedImages(articleId, cachedImages) {
    try {
      // Extract cached paths for the imageUrls field
      const cachedPaths = cachedImages.map(img => img.cachedPath);
      
      await this.prisma.newsArticle.update({
        where: { id: articleId },
        data: {
          imageUrls: cachedPaths,
          // Store original URLs in a separate field if needed
          // originalImageUrls: cachedImages.map(img => img.originalUrl)
        }
      });
    } catch (error) {
      console.error(`Error updating article ${articleId} with cached images:`, error);
    }
  }

  // Clean up old cached images (to be called periodically)
  async cleanupImageCache() {
    try {
      return await this.imageCache.cleanupOldImages();
    } catch (error) {
      console.error('Error during image cache cleanup:', error);
      return 0;
    }
  }

  // Get image cache statistics
  async getImageCacheStats() {
    try {
      return await this.imageCache.getCacheStats();
    } catch (error) {
      console.error('Error getting image cache stats:', error);
      return null;
    }
  }

  // Async summary generation (non-blocking)
  generateSummaryAsync(articleId, articleData) {
    // Run in background without awaiting
    this.summaryService.generateSummary(articleData)
      .then(async (result) => {
        console.log(`Generated summary for article ${articleId}`);
        console.log(`Cost: $${result.cost.toFixed(4)}, Tokens: ${result.tokens.total}`);
        
        // Update article with generated summary
        await this.updateArticleWithSummary(articleId, result.summary);
      })
      .catch(async (error) => {
        console.error(`Error generating summary for article ${articleId}:`, error);
        
        // Update article with error status
        await this.updateArticleWithSummaryError(articleId, error.message);
      });
  }

  // Update article with generated summary
  async updateArticleWithSummary(articleId, summary) {
    try {
      await this.prisma.newsArticle.update({
        where: { id: articleId },
        data: {
          laymanSummary: summary,
          summaryGenerated: true,
          summaryError: null // Clear any previous errors
        }
      });
    } catch (error) {
      console.error(`Error updating article ${articleId} with summary:`, error);
    }
  }

  // Update article with summary error
  async updateArticleWithSummaryError(articleId, errorMessage) {
    try {
      await this.prisma.newsArticle.update({
        where: { id: articleId },
        data: {
          summaryGenerated: false,
          summaryError: errorMessage
        }
      });
    } catch (error) {
      console.error(`Error updating article ${articleId} with summary error:`, error);
    }
  }

  // Get summary service statistics for monitoring
  getSummaryStats() {
    try {
      return this.summaryService.getUsageStats();
    } catch (error) {
      console.error('Error getting summary stats:', error);
      return null;
    }
  }
}