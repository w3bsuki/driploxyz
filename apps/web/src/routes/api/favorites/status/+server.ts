import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServerSupabaseClient } from '$lib/supabase/server';

export const POST: RequestHandler = async ({ locals, request, cookies }) => {
  try {
    const supabase = createServerSupabaseClient({ cookies });
    const body = await request.json();
    const { productIds } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return json({ error: 'Product IDs array is required' }, { status: 400 });
    }

    // Get favorite counts for all products
    const { data: favoriteCounts, error: countError } = await supabase
      .from('favorites')
      .select('product_id')
      .in('product_id', productIds);

    if (countError) {
      console.error('Error getting favorite counts:', countError);
      return json({ error: 'Database error' }, { status: 500 });
    }

    // Count favorites per product
    const counts: Record<string, number> = {};
    productIds.forEach(id => {
      counts[id] = 0;
    });

    favoriteCounts?.forEach(favorite => {
      counts[favorite.product_id] = (counts[favorite.product_id] || 0) + 1;
    });

    // Get user's favorite status if authenticated
    const { session } = await locals.safeGetSession();
    const userFavorites: Record<string, boolean> = {};
    
    if (session?.user) {
      const { data: userFavoriteData, error: userFavoriteError } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', session.user.id)
        .in('product_id', productIds);

      if (userFavoriteError) {
        console.error('Error getting user favorites:', userFavoriteError);
      } else {
        productIds.forEach(id => {
          userFavorites[id] = false;
        });
        userFavoriteData?.forEach(favorite => {
          userFavorites[favorite.product_id] = true;
        });
      }
    } else {
      // Not authenticated, all false
      productIds.forEach(id => {
        userFavorites[id] = false;
      });
    }

    return json({
      counts,
      userFavorites
    });
  } catch (error) {
    console.error('Favorites status API error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};