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

    // Check if already favorited
    const { data: existingFavorite } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('product_id', productId)
      .single();
    
    let isFavorited: boolean;
    
    if (existingFavorite) {
      // Remove favorite
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', session.user.id)
        .eq('product_id', productId);
      
      if (deleteError) {
        return error(500, { message: 'Failed to remove favorite' });
      }
      
      isFavorited = false;
    } else {
      // Add favorite
      const { error: insertError } = await supabase
        .from('favorites')
        .insert({
          user_id: session.user.id,
          product_id: productId
        });
      
      if (insertError) {
        return error(500, { message: 'Failed to add favorite' });
      }
      
      isFavorited = true;
    }

    // Get updated favorite count (trigger automatically handles count)
    const { data: updatedProduct } = await supabase
      .from('products')
      .select('favorite_count')
      .eq('id', productId)
      .single();

    return json({ 
      success: true, 
      isFavorited,
      favoriteCount: updatedProduct?.favorite_count || 0
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

    // Remove from favorites
    const { error: deleteError } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', session.user.id)
      .eq('product_id', productId);

    if (deleteError) {
      return error(500, { message: 'Failed to remove favorite' });
    }

    // Get updated favorite count (trigger automatically handles count)
    const { data: updatedProduct } = await supabase
      .from('products')
      .select('favorite_count')
      .eq('id', productId)
      .single();

    return json({ 
      success: true, 
      favoriteCount: updatedProduct?.favorite_count || 0
    });

  } catch (err) {
    console.error('Favorites remove API error:', err);
    return error(500, { message: 'Internal server error' });
  }
};