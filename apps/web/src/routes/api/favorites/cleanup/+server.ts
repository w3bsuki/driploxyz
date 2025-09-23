import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServices } from '$lib/services';

/**
 * Cleanup endpoint for sold items in favorites
 * Can be called by a cron job or scheduled task
 */
export const POST: RequestHandler = async ({ locals: { supabase } }) => {
  try {
    const services = createServices(supabase);

    // Clean up favorites for products sold more than 1 hour ago
    const { removedCount, error: cleanupError } = await services.favorites.cleanupSoldFavorites();

    if (cleanupError) {
      
      return error(500, { message: 'Cleanup failed' });
    }

    return json({
      success: true,
      removedCount,
      message: `Cleaned up ${removedCount} sold items from favorites`
    });

  } catch (err) {
    
    return error(500, { message: 'Internal server error' });
  }
};

/**
 * Health check endpoint
 */
export const GET: RequestHandler = async () => {
  return json({
    message: 'Favorites cleanup endpoint is healthy',
    timestamp: new Date().toISOString()
  });
};