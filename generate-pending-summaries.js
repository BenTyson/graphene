#!/usr/bin/env node

/**
 * Generate Pending Summaries
 * Processes all pending automatic summary generation requests
 */

import { PrismaClient } from '@prisma/client';
import { SummaryService } from './graphene-news/backend/services/SummaryService.js';

const prisma = new PrismaClient();
const summaryService = new SummaryService(prisma);

async function generatePendingSummaries() {
  try {
    console.log('🤖 Starting automatic summary generation for pending articles...\n');
    
    // Check OpenAI configuration
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ Error: OPENAI_API_KEY not found in environment variables');
      console.log('💡 Please ensure your .env file contains a valid OpenAI API key');
      process.exit(1);
    }

    // Check summary service configuration
    if (!process.env.SUMMARY_ENABLED || process.env.SUMMARY_ENABLED !== 'true') {
      console.log('⚠️  Warning: SUMMARY_ENABLED is not set to true in environment');
      console.log('   Setting SUMMARY_ENABLED=true for this session...');
      process.env.SUMMARY_ENABLED = 'true';
    }

    // Check current status
    const statusCounts = await prisma.newsArticle.groupBy({
      by: ['summaryStatus'],
      _count: {
        summaryStatus: true
      }
    });

    console.log('📊 Current summary status:');
    statusCounts.forEach(status => {
      console.log(`   ${status.summaryStatus}: ${status._count.summaryStatus} articles`);
    });
    console.log('');

    // Check monthly usage to avoid exceeding limits
    const usageStats = summaryService.getUsageStats();
    console.log('💰 Current OpenAI usage:');
    console.log(`   Monthly cost: $${usageStats.cost.toFixed(4)} / $${summaryService.config.monthlyLimit}`);
    console.log(`   Usage: ${usageStats.percentUsed.toFixed(1)}%`);
    console.log(`   Remaining: $${usageStats.limitRemaining.toFixed(2)}\n`);

    // Estimate costs for pending summaries
    const pendingCount = statusCounts.find(s => s.summaryStatus === 'PENDING')?._count?.summaryStatus || 0;
    const estimatedCost = pendingCount * 0.002; // Roughly $0.002 per summary

    console.log(`📈 Estimated cost for ${pendingCount} pending summaries: $${estimatedCost.toFixed(3)}`);
    
    if (estimatedCost > usageStats.limitRemaining) {
      console.warn(`⚠️  Warning: Estimated cost ($${estimatedCost.toFixed(3)}) exceeds remaining budget ($${usageStats.limitRemaining.toFixed(3)})`);
      console.log('   Consider increasing SUMMARY_MONTHLY_LIMIT or process fewer articles');
    }
    console.log('');

    if (pendingCount === 0) {
      console.log('✅ No pending summaries to process');
      return;
    }

    // Start processing
    console.log('🚀 Starting summary generation...\n');
    const startTime = Date.now();

    const results = await summaryService.processPendingSummaries();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 AUTOMATIC SUMMARY GENERATION COMPLETED');
    console.log('='.repeat(60));
    console.log(`⏱️  Total time: ${duration} seconds`);
    console.log(`📊 Results: ${results.processed} processed, ${results.successful} successful, ${results.failed} failed`);
    
    if (results.successful > 0) {
      const avgTime = (parseFloat(duration) / results.successful).toFixed(1);
      console.log(`⚡ Average time per summary: ${avgTime} seconds`);
    }

    const successRate = results.processed > 0 ? (results.successful / results.processed * 100).toFixed(1) : 0;
    console.log(`📈 Success rate: ${successRate}%`);

    // Final status check
    const finalStatusCounts = await prisma.newsArticle.groupBy({
      by: ['summaryStatus'],
      _count: {
        summaryStatus: true
      }
    });

    console.log('\n📊 Final summary status:');
    finalStatusCounts.forEach(status => {
      console.log(`   ${status.summaryStatus}: ${status._count.summaryStatus} articles`);
    });

    // Show usage after processing
    const finalUsage = summaryService.getUsageStats();
    console.log('\n💰 Final OpenAI usage:');
    console.log(`   Monthly cost: $${finalUsage.cost.toFixed(4)} / $${summaryService.config.monthlyLimit}`);
    console.log(`   Usage: ${finalUsage.percentUsed.toFixed(1)}%`);
    console.log(`   Remaining: $${finalUsage.limitRemaining.toFixed(2)}`);

    const actualCost = finalUsage.cost - usageStats.cost;
    if (actualCost > 0) {
      console.log(`   Cost for this session: $${actualCost.toFixed(4)}`);
    }

    console.log('\n✨ All graphene articles now have automatic AI summaries!');
    console.log('🎯 Visit your news feed to see the business-friendly summaries');

    if (results.failed > 0) {
      console.log('\n⚠️  Some summaries failed to generate:');
      console.log('   - Check the console logs above for specific error details');
      console.log('   - Failed articles will be retried automatically on next run');
      console.log('   - Common causes: API rate limits, content too complex, network issues');
    }

  } catch (error) {
    console.error('❌ Error during summary generation:', error);
    
    // Check if it's an OpenAI API error
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      console.log('\n💡 This appears to be an OpenAI quota/rate limit error:');
      console.log('   - Check your OpenAI account billing and usage limits');
      console.log('   - Consider increasing your OpenAI account limits');
      console.log('   - The system will automatically retry failed summaries later');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Show usage information
console.log(`
🤖 Automatic Summary Generator

This script will:
✅ Process all articles with PENDING summary status
🔄 Generate business-friendly AI summaries automatically
💰 Respect cost limits and usage quotas
📊 Show detailed progress and results

REQUIREMENTS:
  - OPENAI_API_KEY must be set in .env file
  - SUMMARY_ENABLED=true in environment
  - Sufficient OpenAI account quota

`);

// Run the generator
generatePendingSummaries().catch(console.error);