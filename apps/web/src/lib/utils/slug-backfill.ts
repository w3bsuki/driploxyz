/**
 * Backfill utility for populating product slugs
 * Production-ready with batching and error handling
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { generateUniqueSlug } from './slug';

/**
 * Statistics for backfill operation
 */
export interface BackfillStats {
  processed: number;
  updated: number;
  failed: number;
  skipped: number;
  errors: Array<{ id: string; title: string; error: string }>;
}

/**
 * Configuration for backfill operation
 */
export interface BackfillConfig {
  /**
   * Number of products to process in each batch
   * @default 50
   */
  batchSize?: number;
  
  /**
   * Maximum length of generated slugs
   * @default 60
   */
  maxLength?: number;
  
  /**
   * Length of collision suffix
   * @default 6
   */
  collisionSuffixLength?: number;
  
  /**
   * Delay between batches in milliseconds
   * @default 100
   */
  batchDelay?: number;
  
  /**
   * Whether to update existing slugs or only fill empty ones
   * @default false
   */
  updateExisting?: boolean;
  
  /**
   * Whether to enable verbose logging
   * @default true
   */
  verbose?: boolean;
}

/**
 * Backfill slugs for products that don't have them
 */
export async function backfillProductSlugs(
  supabase: SupabaseClient,
  config: BackfillConfig = {}
): Promise<BackfillStats> {
  const {
    batchSize = 50,
    maxLength = 60,
    collisionSuffixLength = 6,
    batchDelay = 100,
    updateExisting = false,
    verbose = true
  } = config;
  
  const stats: BackfillStats = {
    processed: 0,
    updated: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };
  
  let offset = 0;
  let hasMore = true;
  
  if (verbose) {
    // Verbose logging placeholder - logging logic removed
  }
  
  while (hasMore) {
    try {
      // Build query based on whether we're updating existing slugs
      const query = supabase
        .from('products')
        .select('id, title, slug')
        .range(offset, offset + batchSize - 1)
        .order('created_at', { ascending: true });
        
      // Only get products without slugs if not updating existing
      if (!updateExisting) {
        query.or('slug.is.null,slug.eq.');
      }
      
      const { data: products, error: fetchError } = await query;
        
      if (fetchError) {
        if (verbose) {
          // Verbose error logging placeholder
        }
        throw new Error(`Failed to fetch products: ${fetchError.message}`);
      }
      
      if (!products || products.length === 0) {
        hasMore = false;
        break;
      }
      
      if (verbose) {
        // Verbose batch processing logging placeholder
      }
      
      // Process each product in the batch
      for (const product of products) {
        stats.processed++;
        
        try {
          // Skip if title is missing
          if (!product.title || product.title.trim().length === 0) {
            stats.skipped++;
            stats.errors.push({
              id: product.id,
              title: product.title || 'NO_TITLE',
              error: 'Product has no title'
            });
            continue;
          }
          
          // Skip if product already has a slug and we're not updating existing
          if (!updateExisting && product.slug && product.slug.trim().length > 0) {
            stats.skipped++;
            continue;
          }
          
          // Generate unique slug
          const result = await generateUniqueSlug(
            supabase, 
            product.title, 
            { 
              maxLength,
              collisionSuffixLength 
            }, 
            product.id
          );
          
          // Update the product with the new slug
          const { error: updateError } = await supabase
            .from('products')
            .update({ slug: result.slug })
            .eq('id', product.id);
            
          if (updateError) {
            stats.failed++;
            stats.errors.push({
              id: product.id,
              title: product.title,
              error: updateError.message
            });
            if (verbose) {
              // Verbose creation logging placeholder
            }
          } else {
            stats.updated++;
            if (verbose && stats.updated % 25 === 0) {
              // Verbose progress logging placeholder
            }
          }
          
        } catch (error) {
          stats.failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          stats.errors.push({
            id: product.id,
            title: product.title,
            error: errorMessage
          });
          if (verbose) {
            // Verbose error logging placeholder
          }
        }
      }
      
      offset += batchSize;
      
      // Add delay between batches to prevent overwhelming the database
      if (hasMore && batchDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, batchDelay));
      }
      
    } catch (error) {
      if (verbose) {
        console.error('[slug-backfill] batch failed', error);
      }

      // Add to failed count and continue with next batch
      stats.failed += batchSize;
      offset += batchSize;
    }
  }
  
  if (verbose) {
    console.log('Slug backfill complete', {
      processed: stats.processed,
      updated: stats.updated,
      failed: stats.failed,
      skipped: stats.skipped,
      errorCount: stats.errors.length
    });

    if (stats.errors.length > 0) {
      stats.errors.slice(0, 10).forEach(error => {
        console.error('[slug-backfill] sample error', error);
      });
      if (stats.errors.length > 10) {
        console.info(`[slug-backfill] ${stats.errors.length - 10} additional errors omitted`);
      }
    }
  }
  
  return stats;
}

/**
 * Get count of products without slugs
 */
export async function getProductsWithoutSlugsCount(
  supabase: SupabaseClient
): Promise<number> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .or('slug.is.null,slug.eq.');
    
  if (error) {
    throw new Error(`Failed to count products without slugs: ${error.message}`);
  }
  
  return count || 0;
}

/**
 * Get sample of products without slugs for preview
 */
export async function getProductsWithoutSlugsSample(
  supabase: SupabaseClient,
  limit: number = 10
): Promise<Array<{ id: string; title: string; slug: string | null }>> {
  const { data, error } = await supabase
    .from('products')
    .select('id, title, slug')
    .or('slug.is.null,slug.eq.')
    .limit(limit);
    
  if (error) {
    throw new Error(`Failed to get sample products: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Validate all existing slugs in the database
 */
export async function validateExistingSlugs(
  supabase: SupabaseClient,
  batchSize: number = 100
): Promise<{
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
  issues: Array<{ id: string; slug: string; issues: string[] }>;
}> {
  const result = {
    total: 0,
    valid: 0,
    invalid: 0,
    duplicates: 0,
    issues: [] as Array<{ id: string; slug: string; issues: string[] }>
  };
  
  const seenSlugs = new Map<string, string[]>(); // slug -> product IDs
  let offset = 0;
  let hasMore = true;
  
  
  
  while (hasMore) {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, slug')
      .not('slug', 'is', null)
      .neq('slug', '')
      .range(offset, offset + batchSize - 1)
      .order('created_at', { ascending: true });
      
    if (error) {
      throw new Error(`Failed to fetch products for validation: ${error.message}`);
    }
    
    if (!products || products.length === 0) {
      hasMore = false;
      break;
    }
    
    for (const product of products) {
      result.total++;
      
      if (!product.slug) continue;
      
      const issues: string[] = [];
      
      // Track slug usage for duplicate detection
      if (seenSlugs.has(product.slug)) {
        seenSlugs.get(product.slug)!.push(product.id);
      } else {
        seenSlugs.set(product.slug, [product.id]);
      }
      
      // Validate slug format
      if (product.slug.length < 3) {
        issues.push('Too short (less than 3 characters)');
      }
      
      if (product.slug.length > 100) {
        issues.push('Too long (more than 100 characters)');
      }
      
      if (!/^[a-z0-9-]+$/.test(product.slug)) {
        issues.push('Invalid characters (must be lowercase letters, numbers, and hyphens only)');
      }
      
      if (product.slug.startsWith('-') || product.slug.endsWith('-')) {
        issues.push('Starts or ends with hyphen');
      }
      
      if (product.slug.includes('--')) {
        issues.push('Contains consecutive hyphens');
      }
      
      if (issues.length > 0) {
        result.invalid++;
        result.issues.push({
          id: product.id,
          slug: product.slug,
          issues
        });
      } else {
        result.valid++;
      }
    }
    
    offset += batchSize;
    
    if (result.total % 500 === 0) {
      // Progress logging placeholder - logs removed
    }
  }
  
  // Check for duplicates
  for (const [slug, productIds] of seenSlugs) {
    if (productIds.length > 1) {
      result.duplicates++;
      result.issues.push({
        id: productIds.join(', '),
        slug,
        issues: [`Duplicate slug used by ${productIds.length} products`]
      });
    }
  }
  
  console.log('✅ Slug validation complete:', {
    total: result.total,
    valid: result.valid,
    invalid: result.invalid,
    duplicates: result.duplicates
  });
  
  return result;
}
