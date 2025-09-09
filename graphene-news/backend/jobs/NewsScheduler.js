import cron from 'node-cron';
import { ContentAcquisitionService } from '../services/ContentAcquisitionService.js';
import { AIProcessingService } from '../services/AIProcessingService.js';

export class NewsScheduler {
  constructor(prisma) {
    this.prisma = prisma;
    this.contentService = new ContentAcquisitionService(prisma);
    this.aiService = new AIProcessingService(prisma);
    this.jobs = new Map();
  }

  // Start all scheduled jobs
  start() {
    console.log('Starting news aggregation scheduler...');
    
    // Main content fetching job - every 2 hours
    this.scheduleContentFetching();
    
    // Source health monitoring - every 6 hours
    this.scheduleSourceHealthCheck();
    
    // Cleanup old articles - daily at 2 AM
    this.scheduleArticleCleanup();
    
    // Update source reliability scores - daily at 3 AM
    this.scheduleReliabilityUpdate();
    
    // Image cache cleanup - daily at 4 AM
    this.scheduleImageCleanup();

    // Batch summary generation - daily at 1 AM
    this.scheduleBatchSummaries();

    console.log('All news scheduler jobs started');
  }

  // Stop all scheduled jobs
  stop() {
    console.log('Stopping news aggregation scheduler...');
    
    this.jobs.forEach((job, name) => {
      job.destroy();
      console.log(\`Stopped job: \${name}\`);
    });
    
    this.jobs.clear();
    console.log('All news scheduler jobs stopped');
  }

  // Schedule content fetching every 2 hours
  scheduleContentFetching() {
    const job = cron.schedule('0 */2 * * *', async () => {
      console.log('Running scheduled content fetching...');
      
      try {
        const results = await this.contentService.fetchAllContent();
        console.log('Content fetching completed:', results);

        // Log the cycle results
        await this.logSchedulerRun('CONTENT_FETCH', 'SUCCESS', results);

      } catch (error) {
        console.error('Error in scheduled content fetching:', error);
        await this.logSchedulerRun('CONTENT_FETCH', 'ERROR', { error: error.message });
      }
    }, {
      scheduled: false,
      timezone: 'America/New_York'
    });

    this.jobs.set('contentFetching', job);
    job.start();
    console.log('Scheduled content fetching job (every 2 hours)');
  }

  // Schedule source health monitoring every 6 hours
  scheduleSourceHealthCheck() {
    const job = cron.schedule('0 */6 * * *', async () => {
      console.log('Running source health check...');
      
      try {
        const sources = await this.prisma.newsSource.findMany({
          where: { isActive: true },
          include: {
            _count: {
              select: { 
                articles: {
                  where: {
                    createdAt: {
                      gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                    }
                  }
                }
              }
            }
          }
        });

        const healthReport = {
          totalActiveSources: sources.length,
          healthySources: 0,
          staleSources: 0,
          inactiveSources: 0
        };

        for (const source of sources) {
          const hoursSinceLastFetch = source.lastFetched 
            ? (Date.now() - new Date(source.lastFetched).getTime()) / (1000 * 60 * 60)
            : 999;

          if (hoursSinceLastFetch > 48) {
            healthReport.staleSources++;
            console.warn(\`Stale source detected: \${source.name} (last fetch: \${source.lastFetched})\`);
          } else {
            healthReport.healthySources++;
          }

          // Auto-deactivate sources that haven't fetched successfully in over a week
          if (hoursSinceLastFetch > 168) { // 7 days
            await this.prisma.newsSource.update({
              where: { id: source.id },
              data: { isActive: false }
            });
            console.warn(\`Auto-deactivated stale source: \${source.name}\`);
            healthReport.inactiveSources++;
          }
        }

        console.log('Source health check completed:', healthReport);
        await this.logSchedulerRun('HEALTH_CHECK', 'SUCCESS', healthReport);

      } catch (error) {
        console.error('Error in source health check:', error);
        await this.logSchedulerRun('HEALTH_CHECK', 'ERROR', { error: error.message });
      }
    }, {
      scheduled: false,
      timezone: 'America/New_York'
    });

    this.jobs.set('healthCheck', job);
    job.start();
    console.log('Scheduled source health check job (every 6 hours)');
  }

  // Schedule article cleanup daily at 2 AM
  scheduleArticleCleanup() {
    const job = cron.schedule('0 2 * * *', async () => {
      console.log('Running article cleanup...');
      
      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90); // Keep articles for 90 days

        // Delete old articles with low relevance scores
        const deletedLowRelevance = await this.prisma.newsArticle.deleteMany({
          where: {
            AND: [
              { createdAt: { lt: cutoffDate } },
              { relevanceScore: { lt: 3.0 } }, // Low relevance threshold
              { viewCount: { lt: 5 } } // Low engagement threshold
            ]
          }
        });

        // Delete very old articles regardless of relevance
        const veryOldDate = new Date();
        veryOldDate.setDate(veryOldDate.getDate() - 365); // 1 year
        
        const deletedVeryOld = await this.prisma.newsArticle.deleteMany({
          where: { createdAt: { lt: veryOldDate } }
        });

        // Clean up orphaned bookmarks
        const deletedBookmarks = await this.prisma.userBookmark.deleteMany({
          where: {
            article: null
          }
        });

        const cleanupReport = {
          deletedLowRelevance: deletedLowRelevance.count,
          deletedVeryOld: deletedVeryOld.count,
          deletedBookmarks: deletedBookmarks.count
        };

        console.log('Article cleanup completed:', cleanupReport);
        await this.logSchedulerRun('CLEANUP', 'SUCCESS', cleanupReport);

      } catch (error) {
        console.error('Error in article cleanup:', error);
        await this.logSchedulerRun('CLEANUP', 'ERROR', { error: error.message });
      }
    }, {
      scheduled: false,
      timezone: 'America/New_York'
    });

    this.jobs.set('cleanup', job);
    job.start();
    console.log('Scheduled article cleanup job (daily at 2 AM)');
  }

  // Schedule reliability score updates daily at 3 AM
  scheduleReliabilityUpdate() {
    const job = cron.schedule('0 3 * * *', async () => {
      console.log('Running source reliability update...');
      
      try {
        const sources = await this.prisma.newsSource.findMany({
          include: {
            articles: {
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                }
              },
              select: {
                relevanceScore: true,
                viewCount: true
              }
            },
            _count: {
              select: { articles: true }
            }
          }
        });

        const updateReport = {
          sourcesUpdated: 0,
          averageReliabilityScore: 0
        };

        for (const source of sources) {
          if (source.articles.length === 0) continue;

          // Calculate reliability based on:
          // 1. Average relevance score of articles
          // 2. Average engagement (view count)
          // 3. Consistency of publishing
          const avgRelevance = source.articles.reduce((sum, article) => 
            sum + parseFloat(article.relevanceScore.toString()), 0) / source.articles.length;
          
          const avgViews = source.articles.reduce((sum, article) => 
            sum + article.viewCount, 0) / source.articles.length;

          // Normalize and weight the scores
          let reliabilityScore = (avgRelevance * 0.6) + (Math.min(avgViews / 10, 10) * 0.4);
          
          // Bonus for consistent publishing
          if (source.articles.length > 10) {
            reliabilityScore += 0.5;
          }

          // Cap at 10
          reliabilityScore = Math.min(reliabilityScore, 10);

          await this.prisma.newsSource.update({
            where: { id: source.id },
            data: { reliabilityScore: reliabilityScore }
          });

          updateReport.sourcesUpdated++;
          updateReport.averageReliabilityScore += reliabilityScore;
        }

        if (updateReport.sourcesUpdated > 0) {
          updateReport.averageReliabilityScore /= updateReport.sourcesUpdated;
        }

        console.log('Source reliability update completed:', updateReport);
        await this.logSchedulerRun('RELIABILITY_UPDATE', 'SUCCESS', updateReport);

      } catch (error) {
        console.error('Error in reliability update:', error);
        await this.logSchedulerRun('RELIABILITY_UPDATE', 'ERROR', { error: error.message });
      }
    }, {
      scheduled: false,
      timezone: 'America/New_York'
    });

    this.jobs.set('reliabilityUpdate', job);
    job.start();
    console.log('Scheduled reliability update job (daily at 3 AM)');
  }

  // Schedule image cache cleanup daily at 4 AM
  scheduleImageCleanup() {
    const job = cron.schedule('0 4 * * *', async () => {
      console.log('Running image cache cleanup...');
      
      try {
        // Clean up old cached images
        const cleanedCount = await this.contentService.cleanupImageCache();
        
        // Get current cache stats
        const stats = await this.contentService.getImageCacheStats();
        
        const cleanupReport = {
          cleanedImages: cleanedCount,
          remainingFiles: stats.fileCount,
          cacheSize: stats.totalSizeMB
        };

        console.log('Image cache cleanup completed:', cleanupReport);
        await this.logSchedulerRun('IMAGE_CLEANUP', 'SUCCESS', cleanupReport);

      } catch (error) {
        console.error('Error in image cache cleanup:', error);
        await this.logSchedulerRun('IMAGE_CLEANUP', 'ERROR', { error: error.message });
      }
    }, {
      scheduled: false,
      timezone: 'America/New_York'
    });

    this.jobs.set('imageCleanup', job);
    job.start();
    console.log('Scheduled image cache cleanup job (daily at 4 AM)');
  }

  // Schedule batch summary generation daily at 1 AM
  scheduleBatchSummaries() {
    const job = cron.schedule('0 1 * * *', async () => {
      console.log('Running batch summary generation...');
      
      try {
        // Find articles that need summaries (high-impact, not yet processed)
        const articlesToSummarize = await this.prisma.newsArticle.findMany({
          where: {
            AND: [
              { summaryGenerated: false },
              { summaryError: null }, // Don't retry failed ones automatically
              { relevanceScore: { gte: 5.0 } }, // High relevance only
              {
                OR: [
                  { keywordTags: { hasSome: ['hemp', 'supercapacitor', 'supercapacitors', 'energy storage', 'cathode', 'anode', 'electrode'] } },
                  { relevanceScore: { gte: 7.0 } } // Very high relevance
                ]
              },
              { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // Within last 7 days
            ]
          },
          orderBy: { relevanceScore: 'desc' },
          take: 20 // Limit batch size for cost control
        });

        if (articlesToSummarize.length === 0) {
          console.log('No articles need summarization');
          await this.logSchedulerRun('BATCH_SUMMARIES', 'SUCCESS', { articlesProcessed: 0 });
          return;
        }

        console.log(`Processing ${articlesToSummarize.length} articles for batch summarization`);

        // Use the content service's summary generation
        const results = await this.contentService.summaryService.generateBatchSummaries(articlesToSummarize);
        
        // Process results and update database
        let successCount = 0;
        let errorCount = 0;
        let totalCost = 0;

        for (const result of results) {
          if (result.success) {
            await this.contentService.updateArticleWithSummary(result.articleId, result.summary);
            successCount++;
            totalCost += result.cost || 0;
          } else {
            await this.contentService.updateArticleWithSummaryError(result.articleId, result.error);
            errorCount++;
          }
        }

        const batchReport = {
          articlesProcessed: articlesToSummarize.length,
          successCount,
          errorCount,
          totalCost: totalCost.toFixed(4),
          avgCostPerSummary: (totalCost / successCount).toFixed(4)
        };

        console.log('Batch summary generation completed:', batchReport);
        await this.logSchedulerRun('BATCH_SUMMARIES', 'SUCCESS', batchReport);

      } catch (error) {
        console.error('Error in batch summary generation:', error);
        await this.logSchedulerRun('BATCH_SUMMARIES', 'ERROR', { error: error.message });
      }
    }, {
      scheduled: false,
      timezone: 'America/New_York'
    });

    this.jobs.set('batchSummaries', job);
    job.start();
    console.log('Scheduled batch summary generation job (daily at 1 AM)');
  }

  // Manual trigger for content fetching (for testing or immediate updates)
  async triggerContentFetching() {
    console.log('Manually triggering content fetching...');
    
    try {
      const results = await this.contentService.fetchAllContent();
      await this.logSchedulerRun('MANUAL_FETCH', 'SUCCESS', results);
      return { success: true, results };
    } catch (error) {
      await this.logSchedulerRun('MANUAL_FETCH', 'ERROR', { error: error.message });
      throw error;
    }
  }

  // Get scheduler status and job information
  getStatus() {
    const jobStatuses = {};
    
    this.jobs.forEach((job, name) => {
      jobStatuses[name] = {
        name,
        running: !job.destroyed,
        lastRun: job.lastDate ? job.lastDate.toISOString() : null,
        nextRun: job.nextDate ? job.nextDate.toISOString() : null
      };
    });

    return {
      active: this.jobs.size > 0,
      totalJobs: this.jobs.size,
      jobs: jobStatuses
    };
  }

  // Log scheduler run results
  async logSchedulerRun(jobType, status, details) {
    try {
      // This could be extended to use a dedicated scheduler logs table
      console.log(\`Scheduler Log - \${jobType}: \${status}\`, details);
      
      // For now, we'll use the ContentProcessingLog table
      // In a production system, you might want a separate SchedulerLog table
      const sourceId = 'system'; // Would need to create a system source entry
      
      // Only log if we have a real source to reference
      // This could be improved with a dedicated logging system
    } catch (error) {
      console.error('Error logging scheduler run:', error);
    }
  }
}