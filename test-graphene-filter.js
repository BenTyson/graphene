#!/usr/bin/env node

/**
 * Test Graphene Filtering Improvements
 * Tests the new GrapheneFilter service against existing articles
 */

import { PrismaClient } from '@prisma/client';
import { GrapheneFilter } from './graphene-news/backend/services/GrapheneFilter.js';

const prisma = new PrismaClient();
const grapheneFilter = new GrapheneFilter();

async function testGrapheneFiltering() {
  try {
    console.log('🧪 Testing Graphene Filter Against Existing Articles\n');
    
    // Get all existing articles for testing
    const articles = await prisma.newsArticle.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        keywordTags: true,
        relevanceScore: true,
        url: true
      }
    });

    console.log(`Found ${articles.length} articles to test\n`);

    // Test each article with the new GrapheneFilter
    const results = [];
    let passCount = 0;
    let failCount = 0;

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`\n--- Testing Article ${i + 1}/${articles.length} ---`);
      console.log(`Title: ${article.title.substring(0, 80)}...`);
      console.log(`Current Relevance Score: ${article.relevanceScore}`);
      console.log(`Keywords: ${article.keywordTags?.join(', ') || 'None'}`);
      
      // Test with new GrapheneFilter
      const validation = await grapheneFilter.validateGrapheneRelevance(article);
      
      console.log(`\n🔍 GrapheneFilter Results:`);
      console.log(`   Status: ${validation.isValid ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   Reason: ${validation.reason}`);
      console.log(`   New Score: ${validation.score.toFixed(2)}`);
      
      if (!validation.isValid) {
        console.log(`   Details: ${JSON.stringify(validation.details, null, 2)}`);
        failCount++;
      } else {
        passCount++;
      }

      // Check if article actually contains graphene terms
      const articleText = [article.title, article.summary, article.content].join(' ').toLowerCase();
      const hasGraphene = articleText.includes('graphene');
      console.log(`   Contains "graphene": ${hasGraphene ? 'Yes' : 'No'}`);
      
      results.push({
        id: article.id,
        title: article.title,
        oldScore: article.relevanceScore,
        newScore: validation.score,
        passes: validation.isValid,
        reason: validation.reason,
        hasGraphene,
        shouldPass: hasGraphene // Simple expectation: should pass if has graphene
      });

      // Add delay to avoid overwhelming output
      if (i < articles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Generate summary report
    console.log('\n' + '='.repeat(80));
    console.log('📊 FILTERING RESULTS SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Articles Tested: ${articles.length}`);
    console.log(`✅ Passed New Filter: ${passCount} (${(passCount/articles.length*100).toFixed(1)}%)`);
    console.log(`❌ Failed New Filter: ${failCount} (${(failCount/articles.length*100).toFixed(1)}%)`);

    // Analyze accuracy
    const truePositives = results.filter(r => r.passes && r.hasGraphene).length;
    const trueNegatives = results.filter(r => !r.passes && !r.hasGraphene).length;
    const falsePositives = results.filter(r => r.passes && !r.hasGraphene).length;
    const falseNegatives = results.filter(r => !r.passes && r.hasGraphene).length;
    
    console.log('\n📈 ACCURACY METRICS:');
    console.log(`True Positives (Correctly passed graphene articles): ${truePositives}`);
    console.log(`True Negatives (Correctly rejected non-graphene): ${trueNegatives}`);
    console.log(`False Positives (Incorrectly passed non-graphene): ${falsePositives}`);
    console.log(`False Negatives (Incorrectly rejected graphene): ${falseNegatives}`);
    
    const accuracy = (truePositives + trueNegatives) / articles.length * 100;
    console.log(`Overall Accuracy: ${accuracy.toFixed(1)}%`);

    // Show problem articles
    if (falsePositives > 0) {
      console.log('\n❗ FALSE POSITIVES (Non-graphene articles that passed):');
      results.filter(r => r.passes && !r.hasGraphene).forEach(r => {
        console.log(`   - ${r.title.substring(0, 60)}... (Score: ${r.newScore.toFixed(2)})`);
      });
    }

    if (falseNegatives > 0) {
      console.log('\n❗ FALSE NEGATIVES (Graphene articles that failed):');
      results.filter(r => !r.passes && r.hasGraphene).forEach(r => {
        console.log(`   - ${r.title.substring(0, 60)}... (Score: ${r.newScore.toFixed(2)}, Reason: ${r.reason})`);
      });
    }

    // Show score improvements
    console.log('\n📊 SCORE COMPARISON:');
    const avgOldScore = results.reduce((sum, r) => sum + r.oldScore, 0) / results.length;
    const avgNewScore = results.reduce((sum, r) => sum + r.newScore, 0) / results.length;
    console.log(`Average Old Score: ${avgOldScore.toFixed(2)}`);
    console.log(`Average New Score: ${avgNewScore.toFixed(2)}`);
    console.log(`Score Change: ${(avgNewScore - avgOldScore).toFixed(2)}`);

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (accuracy < 85) {
      console.log('   - Filter accuracy could be improved');
      console.log('   - Consider adjusting GrapheneFilter requirements');
    }
    if (falseNegatives > 0) {
      console.log('   - Some graphene articles are being rejected');
      console.log('   - May need to expand graphene terminology dictionary');
    }
    if (falsePositives > 0) {
      console.log('   - Some non-graphene articles are passing');
      console.log('   - Consider stricter filtering requirements');
    }
    if (accuracy >= 90) {
      console.log('   ✅ Filter is performing excellently!');
      console.log('   ✅ Ready for production use');
    }

    console.log('\n✨ Test completed successfully!');

  } catch (error) {
    console.error('❌ Error during testing:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testGrapheneFiltering().catch(console.error);