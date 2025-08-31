import { z } from 'zod';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServices } from '$lib/services';
import { withAuth, withValidation, withCsrf, withRateLimit, respond, respondError, combine, commonSchemas } from '$lib/server/api';

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

// Validation schema for favorite operations
const favoriteSchema = z.object({
  productId: commonSchemas.id
});

export const POST: RequestHandler = combine(
  withRateLimit('favorites', 50, 60000), // 50 requests per minute
  withCsrf,
  withAuth,
  withValidation(favoriteSchema)
)(async (event, auth, validatedData) => {
  try {
    const { productId } = validatedData;

    // Verify product exists and is not user's own product
    const { data: product, error: productError } = await auth.supabase
      .from('products')
      .select('id, seller_id, title')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return respondError('Product not found', 404);
    }

    if (product.seller_id === auth.user.id) {
      return respondError('You cannot favorite your own product', 400);
    }

    // Check if already favorited
    const { data: existingFavorite } = await auth.supabase
      .from('favorites')
      .select('id')
      .eq('user_id', auth.user.id)
      .eq('product_id', productId)
      .single();
    
    let isFavorited: boolean;
    
    if (existingFavorite) {
      // Remove favorite
      const { error: deleteError } = await auth.supabase
        .from('favorites')
        .delete()
        .eq('user_id', auth.user.id)
        .eq('product_id', productId);
      
      if (deleteError) {
        return respondError('Failed to remove favorite', 500);
      }
      
      isFavorited = false;
    } else {
      // Add favorite
      const { error: insertError } = await auth.supabase
        .from('favorites')
        .insert({
          user_id: auth.user.id,
          product_id: productId
        });
      
      if (insertError) {
        return respondError('Failed to add favorite', 500);
      }
      
      isFavorited = true;
    }

    // Get updated favorite count
    const { data: updatedProduct } = await auth.supabase
      .from('products')
      .select('favorite_count')
      .eq('id', productId)
      .single();

    return respond({ 
      isFavorited,
      favoriteCount: updatedProduct?.favorite_count || 0
    });

  } catch (err) {
    console.error('Favorites toggle API error:', err);
    return respondError('Internal server error', 500);
  }
});

// Schema for DELETE query params
const deleteSchema = z.object({
  productId: commonSchemas.id
});

export const DELETE: RequestHandler = combine(
  withRateLimit('favorites', 50, 60000),
  withCsrf,
  withAuth
)(async (event, auth) => {
  try {
    const productId = event.url.searchParams.get('productId');
    
    const result = deleteSchema.safeParse({ productId });
    if (!result.success) {
      return respondError('Product ID is required', 400);
    }

    // Remove from favorites
    const { error: deleteError } = await auth.supabase
      .from('favorites')
      .delete()
      .eq('user_id', auth.user.id)
      .eq('product_id', result.data.productId);

    if (deleteError) {
      return respondError('Failed to remove favorite', 500);
    }

    // Get updated favorite count
    const { data: updatedProduct } = await auth.supabase
      .from('products')
      .select('favorite_count')
      .eq('id', result.data.productId)
      .single();

    return respond({ 
      success: true,
      favoriteCount: updatedProduct?.favorite_count || 0
    });

  } catch (err) {
    console.error('Favorites remove API error:', err);
    return respondError('Internal server error', 500);
  }
});
