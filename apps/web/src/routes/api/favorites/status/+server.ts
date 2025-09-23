import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
// import { createServerSupabaseClient } from '$lib/supabase/server'; // Unused - using locals.supabase

export const POST: RequestHandler = async ({ locals, request }) => {
  try {
    const supabase = locals.supabase;
    const body = await request.json();
    const { productIds } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return json({ error: 'Product IDs array is required' }, { status: 400 });
    }

    // Get favorite counts from products table (maintained by triggers)
    const { data: products, error: countError } = await supabase
      .from('products')
      .select('id, favorite_count')
      .in('id', productIds);

    if (countError) {
      
      return json({ error: 'Database error' }, { status: 500 });
    }

    // Map product IDs to their favorite counts
    const counts: Record<string, number> = {};
    productIds.forEach(id => {
      counts[id] = 0;
    });

    products?.forEach(product => {
      counts[product.id] = product.favorite_count || 0;
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
        // User favorites fetch error - return all as false
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
    
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};