import { Router } from 'express';
import asyncHandler from 'express-async-handler';

const router = Router();

// Get paginated news articles with filtering and search
router.get('/articles', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { 
    page = 1, 
    limit = 20, 
    category, 
    search, 
    source,
    startDate,
    endDate,
    sortBy = 'publishDate',
    sortOrder = 'desc'
  } = req.query;

  try {
    // Build where clause
    const where = {
      AND: []
    };

    if (category) {
      where.AND.push({ category });
    }

    if (source) {
      where.AND.push({ sourceId: source });
    }

    if (search) {
      where.AND.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { summary: { contains: search, mode: 'insensitive' } },
          { keywordTags: { has: search } }
        ]
      });
    }

    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
      where.AND.push({ publishDate: dateFilter });
    }

    // Remove empty AND array
    if (where.AND.length === 0) delete where.AND;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get articles with pagination
    const [articles, totalCount] = await Promise.all([
      prisma.newsArticle.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          source: {
            select: { name: true, sourceType: true }
          }
        }
      }),
      prisma.newsArticle.count({ where })
    ]);

    // Transform data for frontend
    const transformedArticles = articles.map(article => ({
      id: article.id,
      title: article.title,
      summary: article.summary,
      url: article.url,
      publishDate: article.publishDate,
      category: article.category,
      relevanceScore: parseFloat(article.relevanceScore.toString()),
      imageUrls: article.imageUrls,
      keywordTags: article.keywordTags,
      author: article.author,
      readingTime: article.readingTime,
      isBookmarked: article.isBookmarked,
      viewCount: article.viewCount,
      source: article.source,
      // Add automatic summary fields
      laymanSummary: article.laymanSummary,
      summaryGenerated: article.summaryGenerated,
      summaryError: article.summaryError,
      summaryStatus: article.summaryStatus,
      summaryGeneratedAt: article.summaryGeneratedAt,
      summaryAttempts: article.summaryAttempts
    }));

    const totalPages = Math.ceil(totalCount / take);

    res.json({
      success: true,
      data: {
        articles: transformedArticles,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching news articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news articles',
      message: error.message
    });
  }
}));

// Get latest headlines for dashboard widget
router.get('/headlines', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { limit = 5 } = req.query;

  try {
    const headlines = await prisma.newsArticle.findMany({
      take: parseInt(limit),
      orderBy: [
        { relevanceScore: 'desc' },
        { publishDate: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        url: true,
        publishDate: true,
        category: true,
        relevanceScore: true,
        imageUrls: true,
        source: {
          select: { name: true }
        }
      }
    });

    res.json({
      success: true,
      data: headlines.map(headline => ({
        ...headline,
        relevanceScore: parseFloat(headline.relevanceScore.toString())
      }))
    });

  } catch (error) {
    console.error('Error fetching headlines:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch headlines',
      message: error.message
    });
  }
}));

// Get news sources with health status
router.get('/sources', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  try {
    const sources = await prisma.newsSource.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });

    const sourcesWithHealth = sources.map(source => ({
      id: source.id,
      name: source.name,
      url: source.url,
      sourceType: source.sourceType,
      isActive: source.isActive,
      reliabilityScore: source.reliabilityScore ? parseFloat(source.reliabilityScore.toString()) : null,
      lastFetched: source.lastFetched,
      articlesCount: source._count.articles,
      healthStatus: getSourceHealthStatus(source)
    }));

    res.json({
      success: true,
      data: sourcesWithHealth
    });

  } catch (error) {
    console.error('Error fetching news sources:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news sources',
      message: error.message
    });
  }
}));

// Get article by ID with view tracking
router.get('/articles/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;

  try {
    // Increment view count and fetch article
    const article = await prisma.newsArticle.update({
      where: { id },
      data: {
        viewCount: { increment: 1 }
      },
      include: {
        source: {
          select: { name: true, sourceType: true, url: true }
        }
      }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...article,
        relevanceScore: parseFloat(article.relevanceScore.toString())
      }
    });

  } catch (error) {
    console.error('Error fetching article:', error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch article',
        message: error.message
      });
    }
  }
}));

// Toggle bookmark status
router.post('/articles/:id/bookmark', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  const { notes } = req.body;

  try {
    const article = await prisma.newsArticle.findUnique({
      where: { id },
      select: { isBookmarked: true }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    if (article.isBookmarked) {
      // Remove bookmark
      await Promise.all([
        prisma.userBookmark.deleteMany({
          where: { articleId: id }
        }),
        prisma.newsArticle.update({
          where: { id },
          data: { isBookmarked: false }
        })
      ]);

      res.json({
        success: true,
        message: 'Bookmark removed',
        isBookmarked: false
      });
    } else {
      // Add bookmark
      await Promise.all([
        prisma.userBookmark.create({
          data: {
            articleId: id,
            notes: notes || null
          }
        }),
        prisma.newsArticle.update({
          where: { id },
          data: { isBookmarked: true }
        })
      ]);

      res.json({
        success: true,
        message: 'Article bookmarked',
        isBookmarked: true
      });
    }

  } catch (error) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle bookmark',
      message: error.message
    });
  }
}));

// Get category statistics
router.get('/stats/categories', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  try {
    const categoryStats = await prisma.newsArticle.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      _avg: {
        relevanceScore: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    });

    const formattedStats = categoryStats.map(stat => ({
      category: stat.category,
      articleCount: stat._count.category,
      avgRelevanceScore: stat._avg.relevanceScore ? parseFloat(stat._avg.relevanceScore.toString()) : 0
    }));

    res.json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category statistics',
      message: error.message
    });
  }
}));

// Refresh news from all active sources
router.post('/refresh', asyncHandler(async (req, res) => {
  try {
    console.log('🔄 Manual news refresh initiated');
    
    // Import and initialize the content acquisition service
    const { ContentAcquisitionService } = await import('../../graphene-news/backend/services/ContentAcquisitionService.js');
    const contentService = new ContentAcquisitionService(req.app.locals.prisma);
    
    // Fetch new content from all active sources
    const results = await contentService.fetchAllContent();
    
    console.log(`✅ News refresh completed: ${results.newArticles} new articles, ${results.processed} sources processed, ${results.errors} errors`);
    
    res.json({
      success: true,
      message: `News refresh completed successfully`,
      data: {
        newArticles: results.newArticles,
        sourcesProcessed: results.processed,
        errors: results.errors
      }
    });

  } catch (error) {
    console.error('❌ Error during news refresh:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh news content',
      message: error.message
    });
  }
}));

// Get image cache statistics
router.get('/admin/image-cache/stats', asyncHandler(async (req, res) => {
  try {
    const { ContentAcquisitionService } = await import('../../graphene-news/backend/services/ContentAcquisitionService.js');
    const contentService = new ContentAcquisitionService(req.app.locals.prisma);
    
    const stats = await contentService.getImageCacheStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching image cache stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch image cache statistics',
      message: error.message
    });
  }
}));

// Manual image cache cleanup
router.post('/admin/image-cache/cleanup', asyncHandler(async (req, res) => {
  try {
    const { ContentAcquisitionService } = await import('../../graphene-news/backend/services/ContentAcquisitionService.js');
    const contentService = new ContentAcquisitionService(req.app.locals.prisma);
    
    const cleanedCount = await contentService.cleanupImageCache();
    const stats = await contentService.getImageCacheStats();
    
    res.json({
      success: true,
      message: 'Image cache cleanup completed',
      data: {
        cleanedImages: cleanedCount,
        currentStats: stats
      }
    });
  } catch (error) {
    console.error('Error during manual image cache cleanup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup image cache',
      message: error.message
    });
  }
}));

// Generate summary for a specific article
router.post('/articles/:id/generate-summary', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the article
    const article = await req.app.locals.prisma.newsArticle.findUnique({
      where: { id },
      include: { source: true }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Check if summary already exists
    if (article.summaryGenerated && article.laymanSummary) {
      return res.json({
        success: true,
        data: {
          summary: article.laymanSummary,
          cached: true
        }
      });
    }

    // Generate new summary
    const { ContentAcquisitionService } = await import('../../graphene-news/backend/services/ContentAcquisitionService.js');
    const contentService = new ContentAcquisitionService(req.app.locals.prisma);
    
    const result = await contentService.summaryService.generateSummary(article);
    
    // Update article with summary
    await contentService.updateArticleWithSummary(id, result.summary);
    
    res.json({
      success: true,
      data: {
        summary: result.summary,
        cost: result.cost,
        tokens: result.tokens,
        cached: false
      }
    });

  } catch (error) {
    console.error('Error generating article summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate summary',
      message: error.message
    });
  }
}));

// Get summary usage statistics
router.get('/admin/summary-stats', asyncHandler(async (req, res) => {
  try {
    const { ContentAcquisitionService } = await import('../../graphene-news/backend/services/ContentAcquisitionService.js');
    const contentService = new ContentAcquisitionService(req.app.locals.prisma);
    
    const usageStats = contentService.getSummaryStats();
    
    // Get database stats
    const [totalArticles, summarizedArticles, erroredArticles] = await Promise.all([
      req.app.locals.prisma.newsArticle.count(),
      req.app.locals.prisma.newsArticle.count({ where: { summaryGenerated: true } }),
      req.app.locals.prisma.newsArticle.count({ where: { summaryError: { not: null } } })
    ]);

    res.json({
      success: true,
      data: {
        usage: usageStats,
        database: {
          totalArticles,
          summarizedArticles,
          erroredArticles,
          summarizationRate: ((summarizedArticles / totalArticles) * 100).toFixed(1)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching summary stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch summary statistics',
      message: error.message
    });
  }
}));

// Bulk generate summaries for high-impact articles
router.post('/admin/bulk-summarize', asyncHandler(async (req, res) => {
  try {
    const { limit = 10, forceRegenerate = false } = req.body;

    // Find articles that need summaries
    const whereCondition = {
      AND: [
        forceRegenerate ? {} : { summaryGenerated: false },
        { relevanceScore: { gte: 5.0 } },
        {
          OR: [
            { keywordTags: { hasSome: ['hemp', 'supercapacitor', 'supercapacitors', 'energy storage', 'cathode', 'anode', 'electrode'] } },
            { relevanceScore: { gte: 7.0 } }
          ]
        }
      ]
    };

    const articles = await req.app.locals.prisma.newsArticle.findMany({
      where: whereCondition,
      orderBy: { relevanceScore: 'desc' },
      take: parseInt(limit),
      include: { source: true }
    });

    if (articles.length === 0) {
      return res.json({
        success: true,
        message: 'No articles need summarization',
        data: { processed: 0, errors: 0, cost: 0 }
      });
    }

    // Generate summaries
    const { ContentAcquisitionService } = await import('../../graphene-news/backend/services/ContentAcquisitionService.js');
    const contentService = new ContentAcquisitionService(req.app.locals.prisma);
    
    const results = await contentService.summaryService.generateBatchSummaries(articles);
    
    // Process results
    let successCount = 0;
    let errorCount = 0;
    let totalCost = 0;

    for (const result of results) {
      if (result.success) {
        await contentService.updateArticleWithSummary(result.articleId, result.summary);
        successCount++;
        totalCost += result.cost || 0;
      } else {
        await contentService.updateArticleWithSummaryError(result.articleId, result.error);
        errorCount++;
      }
    }

    res.json({
      success: true,
      message: 'Bulk summarization completed',
      data: {
        processed: articles.length,
        successful: successCount,
        errors: errorCount,
        totalCost: totalCost.toFixed(4),
        avgCostPerSummary: successCount > 0 ? (totalCost / successCount).toFixed(4) : '0.0000'
      }
    });

  } catch (error) {
    console.error('Error during bulk summarization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform bulk summarization',
      message: error.message
    });
  }
}));

// Get comprehensive system monitoring information
router.get('/admin/system-monitor', asyncHandler(async (req, res) => {
  try {
    const { ContentAcquisitionService } = await import('../../graphene-news/backend/services/ContentAcquisitionService.js');
    const contentService = new ContentAcquisitionService(req.app.locals.prisma);
    
    // Get various system metrics
    const [
      articleStats,
      summaryStats,
      recentActivity,
      processingLogs,
      imageCacheStats
    ] = await Promise.all([
      // Article statistics
      req.app.locals.prisma.newsArticle.groupBy({
        by: ['category'],
        _count: true,
        orderBy: { _count: 'desc' }
      }),
      
      // Summary statistics
      req.app.locals.prisma.newsArticle.aggregate({
        _count: {
          id: true,
          laymanSummary: true
        },
        where: {
          summaryGenerated: true
        }
      }),

      // Recent activity (last 24 hours)
      req.app.locals.prisma.newsArticle.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Processing logs (last 10)
      req.app.locals.prisma.contentProcessingLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { source: true }
      }),

      // Image cache stats
      contentService.getImageCacheStats()
    ]);

    // Get usage stats from summary service
    const usageStats = contentService.getSummaryStats();

    res.json({
      success: true,
      data: {
        articles: {
          total: articleStats.reduce((sum, cat) => sum + cat._count, 0),
          byCategory: articleStats,
          summarized: summaryStats._count.laymanSummary || 0,
          recent24h: recentActivity
        },
        summaries: {
          usage: usageStats,
          totalGenerated: summaryStats._count.laymanSummary || 0
        },
        imageCache: imageCacheStats,
        recentActivity: processingLogs.map(log => ({
          type: log.processType,
          status: log.status,
          source: log.source?.name || 'System',
          timestamp: log.createdAt,
          error: log.errorMessage
        })),
        systemHealth: {
          timestamp: new Date().toISOString(),
          status: 'operational'
        }
      }
    });

  } catch (error) {
    console.error('Error fetching system monitor data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system monitoring data',
      message: error.message
    });
  }
}));

// Helper function to determine source health status
function getSourceHealthStatus(source) {
  if (!source.isActive) return 'inactive';
  
  if (!source.lastFetched) return 'never_fetched';
  
  const hoursSinceLastFetch = (Date.now() - new Date(source.lastFetched).getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceLastFetch > 48) return 'stale';
  if (hoursSinceLastFetch > 24) return 'warning';
  
  const reliabilityScore = source.reliabilityScore ? parseFloat(source.reliabilityScore.toString()) : 0;
  if (reliabilityScore < 0.5) return 'low_reliability';
  
  return 'healthy';
}

export default router;