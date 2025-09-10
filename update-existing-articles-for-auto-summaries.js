#!/usr/bin/env node

/**
 * Update Existing Articles for Automatic Summaries
 * Sets all existing clean graphene articles to PENDING status for automatic summary generation
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateExistingArticlesForAutoSummaries() {
  try {
    console.log('🔄 Updating existing articles for automatic summary generation...\n');
    
    // Get all existing articles
    const allArticles = await prisma.newsArticle.findMany({
      select: {
        id: true,
        title: true,
        summaryGenerated: true,
        summaryStatus: true,
        laymanSummary: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Found ${allArticles.length} total articles in database\n`);

    if (allArticles.length === 0) {
      console.log('✅ No articles found to update');
      return;
    }

    // Categorize articles
    const articlesWithSummaries = allArticles.filter(a => a.summaryGenerated && a.laymanSummary);
    const articlesWithoutSummaries = allArticles.filter(a => !a.summaryGenerated || !a.laymanSummary);
    
    console.log(`✅ Articles with existing summaries: ${articlesWithSummaries.length}`);
    console.log(`🔄 Articles needing summaries: ${articlesWithoutSummaries.length}\n`);

    if (articlesWithSummaries.length > 0) {
      console.log('📋 Articles with existing summaries:');
      articlesWithSummaries.forEach((article, i) => {
        console.log(`   ${i+1}. ${article.title.substring(0, 70)}... (${article.summaryStatus || 'legacy'})`);
      });
      console.log('');
    }

    if (articlesWithoutSummaries.length > 0) {
      console.log('🎯 Articles that will get automatic summaries:');
      articlesWithoutSummaries.forEach((article, i) => {
        console.log(`   ${i+1}. ${article.title.substring(0, 70)}...`);
      });
      console.log('');

      // Update articles without summaries to PENDING status
      console.log('🚀 Setting articles to PENDING status for automatic generation...');
      
      const updateResult = await prisma.newsArticle.updateMany({
        where: {
          id: {
            in: articlesWithoutSummaries.map(a => a.id)
          }
        },
        data: {
          summaryStatus: 'PENDING',
          summaryGenerated: false,
          summaryAttempts: 0,
          summaryError: null
        }
      });

      console.log(`✅ Updated ${updateResult.count} articles to PENDING status`);
    }

    // Also update existing articles with summaries to have proper status
    if (articlesWithSummaries.length > 0) {
      console.log('🔧 Updating existing summaries to have proper COMPLETED status...');
      
      const completedUpdateResult = await prisma.newsArticle.updateMany({
        where: {
          id: {
            in: articlesWithSummaries.map(a => a.id)
          }
        },
        data: {
          summaryStatus: 'COMPLETED',
          summaryGenerated: true,
          summaryGeneratedAt: new Date()
        }
      });

      console.log(`✅ Updated ${completedUpdateResult.count} existing summaries to COMPLETED status`);
    }

    // Final status check
    const finalStatus = await prisma.newsArticle.groupBy({
      by: ['summaryStatus'],
      _count: {
        summaryStatus: true
      }
    });

    console.log('\n📊 Final article status breakdown:');
    finalStatus.forEach(status => {
      console.log(`   ${status.summaryStatus}: ${status._count.summaryStatus} articles`);
    });

    console.log('\n🎉 Update completed successfully!');
    console.log('💡 Next steps:');
    console.log('   1. Run the SummaryService.processPendingSummaries() to generate summaries');
    console.log('   2. Check the frontend to see the new automatic summary statuses');
    console.log('   3. Monitor the console for automatic generation progress');

  } catch (error) {
    console.error('❌ Error updating articles:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Show usage information
console.log(`
🤖 Automatic Summary Setup Tool

This script will:
✅ Update existing articles to use the new automatic summary system
🔄 Set articles without summaries to PENDING status
✅ Ensure articles with summaries have COMPLETED status
📊 Show summary status breakdown

SAFETY:
  - Only updates status fields, no content is modified
  - Articles with existing summaries are preserved
  - New summary generation will be triggered automatically

`);

// Run the update
updateExistingArticlesForAutoSummaries().catch(console.error);