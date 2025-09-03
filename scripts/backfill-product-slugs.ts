#!/usr/bin/env tsx

/**
 * One-time script to backfill product slugs
 * Run with: npx tsx scripts/backfill-product-slugs.ts
 */

import { createClient } from '@supabase/supabase-js';
import { backfillProductSlugs, getProductsWithoutSlugsCount, getProductsWithoutSlugsSample } from '../apps/web/src/lib/utils/slug-backfill';

// Configuration - these should be set via environment variables
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key for full access

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('  - PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function main() {
  console.log('🚀 Product Slug Backfill Script');
  console.log('================================');
  
  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    // First, get a count of products without slugs
    console.log('\n📊 Analyzing products without slugs...');
    const count = await getProductsWithoutSlugsCount(supabase);
    console.log(`Found ${count} products without slugs`);
    
    if (count === 0) {
      console.log('✅ All products already have slugs! No backfill needed.');
      return;
    }
    
    // Show a sample of products that will be updated
    console.log('\n📋 Sample of products to be updated:');
    const sample = await getProductsWithoutSlugsSample(supabase, 5);
    sample.forEach((product, index) => {
      console.log(`  ${index + 1}. "${product.title}" (ID: ${product.id})`);
    });
    
    // Confirm before proceeding
    if (process.argv.includes('--dry-run')) {
      console.log('\n🔍 Dry run complete. Use --confirm to actually run the backfill.');
      return;
    }
    
    if (!process.argv.includes('--confirm')) {
      console.log('\n⚠️  To proceed with the backfill, run:');
      console.log('  npx tsx scripts/backfill-product-slugs.ts --confirm');
      console.log('\n  Or to see what would be updated without making changes:');
      console.log('  npx tsx scripts/backfill-product-slugs.ts --dry-run');
      return;
    }
    
    // Run the backfill
    console.log('\n🔄 Starting backfill process...');
    const stats = await backfillProductSlugs(supabase, {
      batchSize: 50,
      batchDelay: 200, // Slightly longer delay for safety
      verbose: true
    });
    
    // Report final results
    console.log('\n🎉 Backfill Complete!');
    console.log('====================');
    console.log(`✅ Processed: ${stats.processed} products`);
    console.log(`✅ Updated: ${stats.updated} products`);
    console.log(`⚠️  Skipped: ${stats.skipped} products`);
    console.log(`❌ Failed: ${stats.failed} products`);
    
    if (stats.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      console.log('====================');
      stats.errors.slice(0, 10).forEach((error, index) => {
        console.log(`${index + 1}. Product ID: ${error.id}`);
        console.log(`   Title: "${error.title}"`);
        console.log(`   Error: ${error.error}`);
        console.log();
      });
      
      if (stats.errors.length > 10) {
        console.log(`... and ${stats.errors.length - 10} more errors`);
      }
      
      // Save errors to file for later review
      const fs = await import('fs');
      const errorReport = {
        timestamp: new Date().toISOString(),
        stats,
        errors: stats.errors
      };
      
      const filename = `slug-backfill-errors-${Date.now()}.json`;
      fs.writeFileSync(filename, JSON.stringify(errorReport, null, 2));
      console.log(`\n📄 Detailed error report saved to: ${filename}`);
    }
    
    if (stats.updated > 0) {
      console.log('\n✨ Backfill successful! All products now have unique slugs.');
    }
    
  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }
}

// Handle script arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Product Slug Backfill Script

Usage:
  npx tsx scripts/backfill-product-slugs.ts [options]

Options:
  --confirm     Actually run the backfill (required for execution)
  --dry-run     Show what would be updated without making changes
  --help, -h    Show this help message

Environment Variables Required:
  PUBLIC_SUPABASE_URL          - Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY    - Your Supabase service role key

Examples:
  # Preview what would be updated
  npx tsx scripts/backfill-product-slugs.ts --dry-run
  
  # Actually run the backfill
  npx tsx scripts/backfill-product-slugs.ts --confirm
`);
  process.exit(0);
}

// Run the main function
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});