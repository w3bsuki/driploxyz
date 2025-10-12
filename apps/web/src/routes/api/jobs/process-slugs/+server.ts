import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { processSlugQueue, getQueueStatus, backfillSlugs, cleanupQueue } from '$lib/jobs/slug-processor';

/**
 * Background Job API for Slug Processing
 * 
 * This endpoint handles slug generation background jobs and can be called by:
 * - Cron jobs (e.g., Vercel Cron, GitHub Actions)
 * - Admin triggers
 * - Health check systems
 */

export const POST: RequestHandler = async ({ url }) => {
  const action = url.searchParams.get('action') || 'process';
  
  try {
    switch (action) {
      case 'process': {
        // Process items in the queue
        const result = await processSlugQueue();
        return json({
          success: true,
          action: 'process',
          ...result
        });
      }
      
      case 'status': {
        // Get queue status
        const status = await getQueueStatus();
        return json({
          success: true,
          action: 'status',
          ...status
        });
      }
      
      case 'backfill': {
        // Backfill slugs for existing products
        const batchSize = parseInt(url.searchParams.get('batch_size') || '50');
        const backfillResult = await backfillSlugs(batchSize);
        return json({
          success: true,
          action: 'backfill',
          ...backfillResult
        });
      }
      
      case 'cleanup': {
        // Clean up old completed items
        const olderThanDays = parseInt(url.searchParams.get('older_than_days') || '7');
        const cleanupResult = await cleanupQueue(olderThanDays);
        return json({
          success: true,
          action: 'cleanup',
          ...cleanupResult
        });
      }
      
      default:
        return json({
          success: false,
          error: `Unknown action: ${action}. Supported actions: process, status, backfill, cleanup`
        }, { status: 400 });
    }
  } catch (error) {
    
    return json({
      success: false,
      action,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};

export const GET: RequestHandler = async () => {
  // GET request returns queue status
  try {
    const status = await getQueueStatus();
    return json({
      success: true,
      action: 'status',
      ...status
    });
  } catch (error) {
    
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};