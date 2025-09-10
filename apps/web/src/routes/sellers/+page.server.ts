import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createLogger } from '$lib/utils/log';

const log = createLogger('sellers-page');

export const load = (async ({ 
  url, 
  locals: { supabase, safeGetSession }
}) => {
  const { session, user } = await safeGetSession();
  
  // Parse query parameters
  const sortBy = url.searchParams.get('sort') || 'sales'; // sales, rating, followers, joined
  const accountType = url.searchParams.get('type') || ''; // '', 'personal', 'pro', 'brand'
  const verifiedOnly = url.searchParams.get('verified') === 'true';
  const searchQuery = url.searchParams.get('q')?.trim() || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 50; // Sellers per page
  const offset = (page - 1) * limit;

  log.debug('Loading sellers leaderboard', { 
    sortBy, 
    page, 
    searchQuery,
    accountType,
    verifiedOnly,
    userEmail: user?.email 
  });

  try {
    // Build base query for all sellers with stats
    let query = supabase
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
        total_sales_value,
        rating,
        total_reviews,
        products!seller_id(count)
      `)
      .not('username', 'is', null) // Only users with usernames (active sellers)
      .eq('onboarding_completed', true)
      .range(offset, offset + limit - 1);

    // Filters: account type and verification
    if (accountType === 'pro') {
      query = query.in('account_type', ['pro', 'premium']);
    } else if (accountType === 'brand') {
      query = query.eq('account_type', 'brand');
    } else if (accountType === 'personal') {
      query = query.or('account_type.is.null,account_type.eq.personal');
    }

    if (verifiedOnly) {
      query = query.eq('verified', true);
    }

    if (searchQuery) {
      query = query.or(
        `username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'sales':
        query = query.order('total_sales', { ascending: false });
        break;
      case 'rating':
        query = query
          .gte('total_reviews', 5) // Minimum reviews for rating ranking
          .order('rating', { ascending: false });
        break;
      case 'followers':
        query = query.order('followers_count', { ascending: false });
        break;
      case 'joined':
        query = query.order('created_at', { ascending: true });
        break;
      default:
        query = query.order('total_sales', { ascending: false });
    }

    const { data: sellers, error: sellersError } = await query;

    if (sellersError) {
      log.error('Error loading sellers', sellersError);
      throw error(500, 'Failed to load sellers');
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('username', 'is', null)
      .eq('onboarding_completed', true);

    if (searchQuery) {
      countQuery = countQuery.or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`);
    }
    if (accountType === 'pro') {
      countQuery = countQuery.in('account_type', ['pro', 'premium']);
    } else if (accountType === 'brand') {
      countQuery = countQuery.eq('account_type', 'brand');
    } else if (accountType === 'personal') {
      countQuery = countQuery.or('account_type.is.null,account_type.eq.personal');
    }
    if (verifiedOnly) {
      countQuery = countQuery.eq('verified', true);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      log.warn('Error getting sellers count', countError);
    }

    // Transform sellers data with ranking
    const sellersWithRanking = (sellers || []).map((seller, index) => {
      // Calculate product count from the nested query
      const productCount = Array.isArray(seller.products) ? seller.products[0]?.count || 0 : 0;
      
      return {
        id: seller.id,
        username: seller.username,
        full_name: seller.full_name,
        avatar_url: seller.avatar_url,
        bio: seller.bio,
        account_type: seller.account_type || 'personal',
        verified: seller.verified || false,
        created_at: seller.created_at,
        location: seller.location,
        instagram: seller?.social_links?.instagram,
        
        // Stats
        followers_count: seller.followers_count || 0,
        following_count: seller.following_count || 0,
        total_sales: seller.total_sales || 0,
        total_earnings: seller.total_sales_value || 0,
        average_rating: seller.rating || 0,
        total_reviews: seller.total_reviews || 0,
        products_count: productCount,
        
        // Ranking
        rank: offset + index + 1,
        
        // Badge calculation
        badge: seller.account_type === 'brand' ? 'brand' :
               seller.account_type === 'pro' || seller.account_type === 'premium' ? 'pro' :
               seller.verified ? 'verified' : 'free'
      };
    });

    log.debug('Successfully loaded sellers leaderboard', {
      sellersCount: sellersWithRanking.length,
      totalCount: count,
      sortBy,
      searchQuery,
      accountType,
      verifiedOnly
    });

    return {
      sellers: sellersWithRanking,
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
      hasMore: (count || 0) > offset + limit,
      sortBy,
      availableSorts: [
        { key: 'sales', label: 'Total Sales', icon: '💰' },
        { key: 'rating', label: 'Rating', icon: '⭐' },
        { key: 'followers', label: 'Followers', icon: '👥' },
        { key: 'joined', label: 'Newest', icon: '🆕' }
      ],
      searchQuery,
      accountType,
      verifiedOnly,
      user,
      session
    };

  } catch (err) {
    log.error('Unexpected error in sellers page load', err);
    throw error(500, 'Something went wrong loading the sellers leaderboard');
  }
}) satisfies PageServerLoad;