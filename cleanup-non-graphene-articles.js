#!/usr/bin/env node

/**
 * Database Cleanup Script - Remove Non-Graphene Articles
 * Removes old articles that don't meet the new strict graphene filtering standards
 */

import { PrismaClient } from '@prisma/client';
import { GrapheneFilter } from './graphene-news/backend/services/GrapheneFilter.js';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();
const grapheneFilter = new GrapheneFilter();

async function cleanupNonGrapheneArticles() {
  try {
    console.log('🧹 Starting Non-Graphene Article Cleanup\n');
    
    // First, get total count of existing articles
    const totalArticles = await prisma.newsArticle.count();
    console.log(`📊 Current database contains ${totalArticles} articles\n`);
    
    if (totalArticles === 0) {
      console.log('✅ Database is already empty. Nothing to clean up.');
      return;
    }

    // Ask for confirmation before proceeding
    console.log('⚠️  WARNING: This will permanently delete articles that don\'t meet graphene standards!');
    console.log('   - Articles without graphene mentions will be removed');
    console.log('   - Articles with low graphene relevance will be removed');
    console.log('   - Only genuinely graphene-focused articles will remain\n');

    // Create backup first (safety measure)
    console.log('💾 Creating backup of current articles...');
    const allArticles = await prisma.newsArticle.findMany({
      select: {
        id: true,
        title: true,
        summary: true,
        url: true,
        publishDate: true,
        relevanceScore: true,
        keywordTags: true,
        category: true,
        createdAt: true
      }
    });

    const backupFile = `article-backup-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    await fs.writeFile(backupFile, JSON.stringify(allArticles, null, 2));
    console.log(`✅ Backup saved to: ${backupFile}\n`);

    // Analyze all articles with GrapheneFilter
    console.log('🔍 Analyzing articles with GrapheneFilter...\n');
    
    const articlesToKeep = [];
    const articlesToRemove = [];
    let processed = 0;

    // Process in batches to avoid memory issues
    const BATCH_SIZE = 50;
    let skip = 0;

    while (skip < totalArticles) {
      const batch = await prisma.newsArticle.findMany({
        skip,
        take: BATCH_SIZE,
        select: {
          id: true,
          title: true,
          summary: true,
          content: true,
          keywordTags: true,
          url: true,
          relevanceScore: true
        }
      });

      if (batch.length === 0) break;

      for (const article of batch) {
        processed++;
        
        // Show progress
        if (processed % 10 === 0 || processed === totalArticles) {
          console.log(`   Processing ${processed}/${totalArticles} articles...`);
        }

        // Test with GrapheneFilter
        const validation = await grapheneFilter.validateGrapheneRelevance(article);
        
        if (validation.isValid) {
          articlesToKeep.push({
            id: article.id,
            title: article.title,
            score: validation.score,
            reason: validation.reason
          });
        } else {
          articlesToRemove.push({
            id: article.id,
            title: article.title,
            score: validation.score,
            reason: validation.reason
          });
        }
      }

      skip += BATCH_SIZE;
    }

    // Show analysis results
    console.log('\n' + '='.repeat(80));
    console.log('📊 CLEANUP ANALYSIS RESULTS');
    console.log('='.repeat(80));
    console.log(`Total Articles Analyzed: ${processed}`);
    console.log(`✅ Articles to KEEP (graphene-relevant): ${articlesToKeep.length} (${(articlesToKeep.length/processed*100).toFixed(1)}%)`);
    console.log(`❌ Articles to REMOVE (non-graphene): ${articlesToRemove.length} (${(articlesToRemove.length/processed*100).toFixed(1)}%)`);

    if (articlesToKeep.length > 0) {
      console.log('\n✅ ARTICLES TO KEEP (Sample):');
      articlesToKeep.slice(0, 5).forEach((article, i) => {
        console.log(`   ${i+1}. ${article.title.substring(0, 70)}... (Score: ${article.score.toFixed(2)})`);
      });
      if (articlesToKeep.length > 5) {
        console.log(`   ... and ${articlesToKeep.length - 5} more graphene articles`);
      }
    }

    if (articlesToRemove.length > 0) {
      console.log('\n❌ ARTICLES TO REMOVE (Sample):');
      articlesToRemove.slice(0, 5).forEach((article, i) => {
        console.log(`   ${i+1}. ${article.title.substring(0, 70)}... (Score: ${article.score.toFixed(2)}, Reason: ${article.reason})`);
      });
      if (articlesToRemove.length > 5) {
        console.log(`   ... and ${articlesToRemove.length - 5} more non-graphene articles`);
      }
    }

    // Final confirmation
    console.log('\n' + '⚠️'.repeat(40));
    console.log('FINAL CONFIRMATION REQUIRED');
    console.log('⚠️'.repeat(40));
    console.log(`This will DELETE ${articlesToRemove.length} articles permanently!`);
    console.log(`Only ${articlesToKeep.length} genuinely graphene-relevant articles will remain.`);
    console.log(`Backup saved at: ${backupFile}\n`);

    // For safety, require manual confirmation
    console.log('To proceed with cleanup, set CONFIRM_CLEANUP=true in environment or pass --confirm flag');
    const confirmFlag = process.argv.includes('--confirm');
    const confirmEnv = process.env.CONFIRM_CLEANUP === 'true';
    
    if (!confirmFlag && !confirmEnv) {
      console.log('\n❌ Cleanup cancelled - confirmation required');
      console.log('   Run with --confirm flag or set CONFIRM_CLEANUP=true to proceed');
      console.log('   Example: node cleanup-non-graphene-articles.js --confirm');
      return;
    }

    // Execute the cleanup
    console.log('\n🗑️  Starting article cleanup...');
    
    if (articlesToRemove.length > 0) {
      const removeIds = articlesToRemove.map(a => a.id);
      
      // Delete in batches to avoid database timeouts
      const DELETE_BATCH_SIZE = 100;
      let deletedCount = 0;
      
      for (let i = 0; i < removeIds.length; i += DELETE_BATCH_SIZE) {
        const batchIds = removeIds.slice(i, i + DELETE_BATCH_SIZE);
        
        const result = await prisma.newsArticle.deleteMany({
          where: {
            id: {
              in: batchIds
            }
          }
        });
        
        deletedCount += result.count;
        console.log(`   Deleted ${deletedCount}/${articlesToRemove.length} articles...`);
      }
      
      console.log(`✅ Successfully deleted ${deletedCount} non-graphene articles`);
    } else {
      console.log('✅ No articles to remove - database already clean!');
    }

    // Final verification
    const remainingCount = await prisma.newsArticle.count();
    console.log('\n' + '='.repeat(60));
    console.log('🎉 CLEANUP COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`Articles before cleanup: ${totalArticles}`);
    console.log(`Articles after cleanup: ${remainingCount}`);
    console.log(`Articles removed: ${totalArticles - remainingCount}`);
    console.log(`Cleanup efficiency: ${((totalArticles - remainingCount) / totalArticles * 100).toFixed(1)}%`);
    
    if (remainingCount > 0) {
      console.log('\n✅ Remaining articles are all graphene-relevant!');
      console.log('✅ Your news feed will now show only high-quality graphene content');
    } else {
      console.log('\n📰 Database is now clean - ready for fresh graphene articles!');
      console.log('💡 Run "npm run news:fetch" to populate with new graphene-filtered content');
    }

    console.log(`\n💾 Backup preserved at: ${backupFile}`);
    console.log('   (Keep this backup safe in case you need to restore any articles)');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Show usage if no confirmation
if (!process.argv.includes('--confirm') && process.env.CONFIRM_CLEANUP !== 'true') {
  console.log(`
🧹 Non-Graphene Article Cleanup Tool

This script will:
✅ Backup all existing articles to JSON file
🔍 Analyze each article with GrapheneFilter
❌ Remove articles that don't meet graphene standards
✅ Keep only genuinely graphene-relevant articles

USAGE:
  node cleanup-non-graphene-articles.js --confirm

SAFETY:
  - Creates automatic backup before cleanup
  - Shows detailed analysis before proceeding  
  - Requires explicit confirmation to prevent accidents

`);
}

// Run cleanup if confirmed
if (process.argv.includes('--confirm') || process.env.CONFIRM_CLEANUP === 'true') {
  cleanupNonGrapheneArticles().catch(console.error);
}