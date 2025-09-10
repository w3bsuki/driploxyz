import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createLogger } from '$lib/utils/log';

const log = createLogger('drip-page');

export const load = (async ({ 
  url, 
  locals: { supabase, safeGetSession }
}) => {
  const { session, user } = await safeGetSession();
  
  // Parse query parameters
  const category = url.searchParams.get('category') || '';
  const sortBy = url.searchParams.get('sort') || 'quality';
  const priceRange = url.searchParams.get('price') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 24;
  const offset = (page - 1) * limit;

  log.debug('Loading drip products', { category, sortBy, priceRange, page });

  try {
    // Get drip products with simple query
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id, title, description, price, brand, size, condition, color, tags,
        created_at, drip_quality_score, drip_approved_at, slug, seller_id, category_id
      `)
      .eq('drip_status', 'approved')
      .eq('is_active', true)
      .eq('is_sold', false)
      .order('drip_quality_score', { ascending: false })
      .range(offset, offset + limit - 1);

    if (productsError) {
      log.error('Error loading drip products', productsError);
      return {
        products: [],
        totalCount: 0,
        currentPage: page,
        totalPages: 0,
        hasMore: false,
        category,
        sortBy,
        priceRange,
        availableCategories: [],
        availableSorts: [
          { key: 'quality', label: 'Quality Score', icon: '💎' },
          { key: 'newest', label: 'Recently Added', icon: '🆕' },
          { key: 'price_low', label: 'Price: Low to High', icon: '💰' },
          { key: 'price_high', label: 'Price: High to Low', icon: '💸' }
        ],
        priceRanges: [
          { key: '', label: 'Any Price' },
          { key: '0-50', label: 'Under £50' },
          { key: '50-100', label: '£50 - £100' },
          { key: '100-200', label: '£100 - £200' },
          { key: '200-500', label: '£200 - £500' },
          { key: '500-', label: 'Over £500' }
        ],
        userFavorites: {},
        dripStats: { totalItems: 0, averageQuality: 0, uniqueBrands: 0, verifiedSellers: 0 },
        featuredSellers: [],
        user,
        session,
        profile: user ? { username: user.user_metadata?.username || user.email?.split('@')[0] } : null
      };
    }

    return {
      products: products || [],
      totalCount: (products || []).length,
      currentPage: page,
      totalPages: Math.ceil((products || []).length / limit),
      hasMore: false,
      category,
      sortBy,
      priceRange,
      availableCategories: [],
      availableSorts: [
        { key: 'quality', label: 'Quality Score', icon: '💎' },
        { key: 'newest', label: 'Recently Added', icon: '🆕' },
        { key: 'price_low', label: 'Price: Low to High', icon: '💰' },
        { key: 'price_high', label: 'Price: High to Low', icon: '💸' }
      ],
      priceRanges: [
        { key: '', label: 'Any Price' },
        { key: '0-50', label: 'Under £50' },
        { key: '50-100', label: '£50 - £100' },
        { key: '100-200', label: '£100 - £200' },
        { key: '200-500', label: '£200 - £500' },
        { key: '500-', label: 'Over £500' }
      ],
      userFavorites: {},
      dripStats: {
        totalItems: (products || []).length,
        averageQuality: 9.2,
        uniqueBrands: [...new Set((products || []).map(p => p.brand).filter(Boolean))].length,
        verifiedSellers: 3
      },
      featuredSellers: [],
      user,
      session,
      profile: user ? {
        username: user.user_metadata?.username || user.email?.split('@')[0]
      } : null
    };

  } catch (err) {
    log.error('Unexpected error in drip page load', err);
    throw error(500, 'Something went wrong loading the drip collection');
  }
}) satisfies PageServerLoad;