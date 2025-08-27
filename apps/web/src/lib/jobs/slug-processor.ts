/**
 * Background Slug Processor
 * 
 * This module handles background processing of product slug generation
 * to ensure SEO-friendly URLs are created without blocking user interactions.
 */

import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import type { Database } from '@repo/database';

/**
 * Initialize Supabase client with service role for background jobs
 */
function createServiceClient() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for background jobs');
  }
  
  return createClient<Database>(
    PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

/**
 * Process slug generation queue
 * This function should be called periodically (e.g., every 30 seconds)
 */
export async function processSlugQueue(): Promise<{
  processed: number;
  failed: number;
  error?: string;
}> {
  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase.rpc('process_slug_queue');
    
    if (error) {
      console.error('Error processing slug queue:', error);
      return { processed: 0, failed: 0, error: error.message };
    }
    
    const result = data?.[0] || { processed_count: 0, failed_count: 0 };
    
    if (result.processed_count > 0 || result.failed_count > 0) {
      console.log(`Slug processing: ${result.processed_count} processed, ${result.failed_count} failed`);
    }
    
    return {
      processed: result.processed_count,
      failed: result.failed_count
    };
    
  } catch (error) {
    console.error('Unexpected error in processSlugQueue:', error);
    return {
      processed: 0,
      failed: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate slug for a specific product (manual trigger)
 */
export async function generateProductSlug(productId: string): Promise<{
  success: boolean;
  slug?: string;
  error?: string;
}> {
  try {
    const supabase = createServiceClient();
    
    // Process the specific product
    const { data: success, error } = await supabase.rpc('process_product_slug', {
      p_product_id: productId
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    if (!success) {
      return { success: false, error: 'Failed to generate slug' };
    }
    
    // Get the generated slug
    const { data: product } = await supabase
      .from('products')
      .select('slug')
      .eq('id', productId)
      .single();
    
    return {
      success: true,
      slug: product?.slug || undefined
    };
    
  } catch (error) {
    console.error('Error generating product slug:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get queue status and statistics
 */
export async function getQueueStatus(): Promise<{
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  error?: string;
}> {
  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from('slug_processing_queue')
      .select('status')
      .order('created_at', { ascending: false });
    
    if (error) {
      return { pending: 0, processing: 0, completed: 0, failed: 0, error: error.message };
    }
    
    const stats = data?.reduce((acc, item) => {
      acc[item.status as keyof typeof acc]++;
      return acc;
    }, { pending: 0, processing: 0, completed: 0, failed: 0 }) || 
    { pending: 0, processing: 0, completed: 0, failed: 0 };
    
    return stats;
    
  } catch (error) {
    console.error('Error getting queue status:', error);
    return {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Backfill slugs for existing products
 * This can be used for migration or when introducing the slug system
 */
export async function backfillSlugs(batchSize = 50): Promise<{
  queued: number;
  error?: string;
}> {
  try {
    const supabase = createServiceClient();
    
    // Get products without slugs
    const { data: products, error } = await supabase
      .from('products')
      .select('id')
      .is('slug', null)
      .eq('is_active', true)
      .limit(batchSize);
    
    if (error) {
      return { queued: 0, error: error.message };
    }
    
    if (!products || products.length === 0) {
      return { queued: 0 };
    }
    
    // Queue all products for slug generation
    let queued = 0;
    for (const product of products) {
      try {
        await supabase.rpc('queue_slug_generation', { p_product_id: product.id });
        queued++;
      } catch (queueError) {
        console.warn(`Failed to queue product ${product.id}:`, queueError);
      }
    }
    
    console.log(`Queued ${queued} products for slug generation`);
    return { queued };
    
  } catch (error) {
    console.error('Error backfilling slugs:', error);
    return {
      queued: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Clean up completed queue items (housekeeping)
 */
export async function cleanupQueue(olderThanDays = 7): Promise<{
  deleted: number;
  error?: string;
}> {
  try {
    const supabase = createServiceClient();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const { data, error } = await supabase
      .from('slug_processing_queue')
      .delete()
      .eq('status', 'completed')
      .lt('updated_at', cutoffDate.toISOString())
      .select('id');
    
    if (error) {
      return { deleted: 0, error: error.message };
    }
    
    const deleted = data?.length || 0;
    if (deleted > 0) {
      console.log(`Cleaned up ${deleted} completed queue items`);
    }
    
    return { deleted };
    
  } catch (error) {
    console.error('Error cleaning up queue:', error);
    return {
      deleted: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}