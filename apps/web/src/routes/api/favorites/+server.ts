import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServices } from '$lib/services';

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

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
  try {
    const { session } = await safeGetSession();
    
    if (!session?.user) {
      return error(401, { message: 'Authentication required' });
    }

    const { productId } = await request.json();

    if (!productId) {
      return error(400, { message: 'Product ID is required' });
    }

    // Verify product exists and is not user's own product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, seller_id, title')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return error(404, { message: 'Product not found' });
    }

    if (product.seller_id === session.user.id) {
      return error(400, { message: 'You cannot favorite your own product' });
    }

    const services = createServices(supabase);

    // Toggle favorite status
    const { isFavorited, error: toggleError } = await services.favorites.toggleFavorite(
      session.user.id,
      productId
    );

    if (toggleError) {
      return error(500, { message: 'Failed to toggle favorite' });
    }

    // Get updated favorite count
    const { count } = await services.favorites.getProductFavoriteCount(productId);

    return json({ 
      success: true, 
      isFavorited,
      favoriteCount: count
    });

  } catch (err) {
    console.error('Favorites toggle API error:', err);
    return error(500, { message: 'Internal server error' });
  }
};

export const DELETE: RequestHandler = async ({ url, locals: { supabase, safeGetSession } }) => {
  try {
    const { session } = await safeGetSession();
    
    if (!session?.user) {
      return error(401, { message: 'Authentication required' });
    }

    const productId = url.searchParams.get('productId');

    if (!productId) {
      return error(400, { message: 'Product ID is required' });
    }

    const services = createServices(supabase);

    // Remove from favorites
    const { success, error: removeError } = await services.favorites.removeFromFavorites(
      session.user.id,
      productId
    );

    if (removeError) {
      return error(500, { message: 'Failed to remove favorite' });
    }

    // Get updated favorite count
    const { count } = await services.favorites.getProductFavoriteCount(productId);

    return json({ 
      success, 
      favoriteCount: count
    });

  } catch (err) {
    console.error('Favorites remove API error:', err);
    return error(500, { message: 'Internal server error' });
  }
};