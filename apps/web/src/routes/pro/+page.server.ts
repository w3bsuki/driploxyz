import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Database } from '@repo/database';
import { createLogger } from '$lib/utils/log';

const log = createLogger('pro-page');

export const load = (async ({ 
  url, 
  locals: { supabase, safeGetSession }
}) => {
  const { session, user } = await safeGetSession();
  
  // Parse query parameters
  const condition = url.searchParams.get('condition');
  const category = url.searchParams.get('category');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 24; // Products per page
  const offset = (page - 1) * limit;

  log.debug('Loading pro page', {
    condition: condition ?? undefined,
    category: category ?? undefined,
    page,
    userEmail: user?.email
  });

  try {
    // Build query for premium products (from pro/brand sellers)
    let query = supabase
      .from('products')
      .select(`
        id,
        title,
        price,
        condition,
        size,
        brand,
        description,
        created_at,
        updated_at,
        slug,
        seller_id,
        category_id,
        product_images (
          image_url,
          alt_text,
          sort_order
        ),
        profiles!seller_id (
          id,
          username,
          full_name,
          avatar_url,
          account_type,
          verified
        ),
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('is_active', true)
      .eq('is_sold', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (condition) {
      query = query.eq('condition', condition as Database['public']['Enums']['product_condition']);
    }

    if (category) {
      // Filter by main category (level 1 categories like Women, Men, Kids)
      query = query.eq('categories.slug', category);
    }

    const { data: allProducts, error: productsError } = await query;

    if (productsError) {
      log.error('Error loading pro products', productsError);
      throw error(500, 'Failed to load premium products');
    }

    // Filter products by seller account type
    const products = (allProducts || []).filter(product => {
      const accountType = product.profiles?.account_type;
      return accountType && ['pro', 'brand', 'premium'].includes(accountType);
    });

    // For pagination, we'll need a simple count since filtering is done client-side
    const totalCount = products.length;

    // Get user favorites if logged in
    let userFavorites: Record<string, boolean> = {};
    if (user) {
      const { data: favorites, error: favoritesError } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);

      if (favoritesError) {
        log.warn('Error loading user favorites', { error: String(favoritesError) });
      } else {
        userFavorites = (favorites || []).reduce((acc, fav) => {
          acc[fav.product_id] = true;
          return acc;
        }, {} as Record<string, boolean>);
      }
    }

    // Get available filter options
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .is('parent_id', null) // Only top-level categories
      .order('sort_order');

    if (categoriesError) {
      log.warn('Error loading categories for filters', { error: String(categoriesError) });
    }

    const availableConditions = [
      'brand_new_with_tags',
      'new_without_tags', 
      'like_new',
      'good',
      'fair'
    ];

    log.debug('Successfully loaded pro page data', {
      productCount: products?.length || 0,
      totalCount,
      filterCondition: condition ?? undefined,
      filterCategory: category ?? undefined
    });

    return {
      products: products || [],
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: totalCount > offset + limit,
      userFavorites,
      filters: {
        condition,
        category,
        availableConditions,
        availableCategories: categories || []
      },
      user,
      session
    };

  } catch (err) {
    log.error('Unexpected error in pro page load', err);
    throw error(500, 'Something went wrong loading premium products');
  }
}) satisfies PageServerLoad;