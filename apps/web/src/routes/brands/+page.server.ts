import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createLogger } from '$lib/utils/log';

const log = createLogger('brands-page');

export const load = (async ({ 
  url, 
  locals: { supabase, safeGetSession }
}) => {
  const { session, user } = await safeGetSession();
  
  // Parse query parameters
  const searchQuery = url.searchParams.get('q') || '';
  const category = url.searchParams.get('category') || '';
  const verifiedOnly = url.searchParams.get('verified') === 'true';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 24; // Brands per page
  const offset = (page - 1) * limit;

  log.debug('Loading brands showcase', { 
    searchQuery, 
    category, 
    verifiedOnly,
    page,
    userEmail: user?.email 
  });

  try {
    // Get brand profiles with their stats
    let brandsQuery = supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        avatar_url,
        bio,
        account_type,
        verified,
        created_at,
        location,
        social_links,
        followers_count,
        following_count,
        total_sales,
        rating,
        total_reviews,
        products!seller_id(count)
      `)
      .eq('account_type', 'brand')
      .eq('onboarding_completed', true)
      .not('username', 'is', null)
      .range(offset, offset + limit - 1)
      .order('total_sales', { ascending: false });

    if (verifiedOnly) {
      brandsQuery = brandsQuery.eq('verified', true);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      brandsQuery = brandsQuery.or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`);
    }

    const { data: brands, error: brandsError } = await brandsQuery;

    if (brandsError) {
      log.error('Error loading brands', brandsError);
      throw error(500, 'Failed to load brands');
    }

    // Get available categories from brands' products
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name');

    if (categoriesError) {
      log.warn('Error loading categories', categoriesError);
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('account_type', 'brand')
      .eq('onboarding_completed', true)
      .not('username', 'is', null);

    if (searchQuery.trim()) {
      countQuery = countQuery.or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`);
    }

    if (verifiedOnly) {
      countQuery = countQuery.eq('verified', true);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      log.warn('Error getting brands count', countError);
    }

    // Transform brands data
    const transformedBrands = (brands || []).map((brand, index) => {
      const productCount = Array.isArray(brand.products) ? brand.products[0]?.count || 0 : 0;
      
      return {
        id: brand.id,
        username: brand.username,
        full_name: brand.full_name,
        avatar_url: brand.avatar_url,
        bio: brand.bio,
        verified: brand.verified || false,
        created_at: brand.created_at,
        location: brand.location,
        instagram: brand?.social_links?.instagram,
        website: brand?.social_links?.website,
        
        // Stats
        followers_count: brand.followers_count || 0,
        following_count: brand.following_count || 0,
        total_sales: brand.total_sales || 0,
        average_rating: brand.rating || 0,
        total_reviews: brand.total_reviews || 0,
        products_count: productCount,
        
        // Ranking
        rank: offset + index + 1
      };
    });

    // Get featured/top brands for hero section
    const { data: featuredBrands, error: featuredError } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        avatar_url,
        bio,
        verified,
        total_sales,
        rating,
        total_reviews,
        followers_count
      `)
      .eq('account_type', 'brand')
      .eq('onboarding_completed', true)
      .not('username', 'is', null)
      .gte('total_sales', 10) // Minimum sales threshold
      .order('total_sales', { ascending: false })
      .limit(6);

    if (featuredError) {
      log.warn('Error loading featured brands', featuredError);
    }

    log.debug('Successfully loaded brands showcase', {
      brandsCount: transformedBrands.length,
      totalCount: count,
      searchQuery,
      verifiedOnly
    });

    return {
      brands: transformedBrands,
      featuredBrands: featuredBrands || [],
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
      hasMore: (count || 0) > offset + limit,
      searchQuery,
      verifiedOnly,
      category,
      availableCategories: categories || [],
      user,
      session
    };

  } catch (err) {
    log.error('Unexpected error in brands page load', err);
    throw error(500, 'Something went wrong loading the brands showcase');
  }
}) satisfies PageServerLoad;