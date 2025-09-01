import { z } from 'zod';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler, RequestEvent } from '@sveltejs/kit';
import { createServices } from '$lib/services';
import { withAuth, withValidation, withCsrf, withRateLimit, respond, respondError, combine, commonSchemas, type AuthContext } from '$lib/server/api';

export const GET: RequestHandler = async ({ url, locals: { supabase, safeGetSession } }) => {
  try {
    const { session } = await safeGetSession();
    
    if (!session?.user) {
      return error(401, { message: 'Authentication required' });
    }

    const services = createServices(supabase);
    const productId = url.searchParams.get('productId');

    if (productId) {
      // Check if specific product is favorited
      const { isFavorited, error: checkError } = await services.favorites.isFavorited(
        session.user.id, 
        productId
      );

      if (checkError) {
        return error(500, { message: 'Failed to check favorite status' });
      }

      return json({ isFavorited });
    } else {
      // Get all user favorites
      const { data: favorites, error: favError } = await services.favorites.getUserFavorites(
        session.user.id
      );

      if (favError) {
        return error(500, { message: 'Failed to fetch favorites' });
      }

      return json({ favorites });
    }

  } catch (err) {
    console.error('Favorites API error:', err);
    return error(500, { message: 'Internal server error' });
  }
};

// POST and DELETE endpoints removed - use /api/favorites/[productId] for toggle operations
