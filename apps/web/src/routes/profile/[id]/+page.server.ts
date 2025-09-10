import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ProfileService } from '$lib/services/profiles';

export const load = (async ({ params, locals }) => {
  const { session } = await locals.safeGetSession();
  const profileService = new ProfileService(locals.supabase);
  
  // Handle special "me" case - redirect to current user's profile
  if (params.id === 'me') {
    if (!session?.user) {
      throw redirect(303, '/login');
    }
    // Get current user's profile to get their username
    const { data: currentUserProfile } = await locals.supabase
      .from('profiles')
      .select('username')
      .eq('id', session.user.id)
      .single();
    
    if (currentUserProfile?.username) {
      throw redirect(303, `/profile/${currentUserProfile.username}`);
    } else {
      throw redirect(303, `/profile/${session.user.id}`);
    }
  }
  
  // Check if the ID is a UUID or username
  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id);
  
  let profile: any;
  let profileError: string | null;
  
  if (isUUID) {
    // Get profile by UUID
    const result = await profileService.getProfile(params.id);
    profile = result.data;
    profileError = result.error;
  } else {
    // Get profile by username
    const result = await profileService.getProfileByUsername(params.id);
    profile = result.data;
    profileError = result.error;
  }
  
  if (profileError || !profile) {
    throw error(404, 'User not found');
  }

  // Check if this is the current user's profile
  const isOwnProfile = session?.user?.id === profile.id;
  
  // Redirect users viewing their own profile to account page
  if (isOwnProfile) {
    throw redirect(303, '/account');
  }


  // Get user's products (filtered by region)
  const { data: products } = await locals.supabase
    .from('products')
    .select(`
      id,
      title,
      price,
      images:product_images!product_id(image_url)
    `)
    .eq('seller_id', profile.id)
    .eq('is_active', true)
    .eq('is_sold', false)
    .eq('country_code', locals.country || 'BG')
    .order('created_at', { ascending: false });

  // Get user's reviews with full details
  const { data: reviews, count: totalReviewCount } = await locals.supabase
    .from('reviews')
    .select(`
      id,
      rating,
      title,
      comment,
      image_urls,
      created_at,
      reviewer:profiles!reviewer_id(
        id,
        username,
        full_name,
        avatar_url
      ),
      product:products(
        id,
        title,
        product_images(image_url)
      ),
      order:orders(
        id,
        created_at,
        total_amount
      )
    `, { count: 'exact' })
    .eq('reviewee_id', profile.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(10);

  // Get rating distribution for statistics
  const { data: ratingDistribution } = await locals.supabase
    .from('reviews')
    .select('rating')
    .eq('reviewee_id', profile.id)
    .eq('is_public', true);

  // Calculate rating stats
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingDistribution?.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating as keyof typeof distribution]++;
    }
  });

  const reviewStats = {
    averageRating: profile.rating || 0,
    totalReviews: profile.review_count || 0,
    distribution
  };

  // Transform products to include first image URL
  const productsWithImages = products?.map(product => ({
    ...product,
    images: product.images?.map(img => img.image_url) || []
  })) || [];

  // Get live follower and following counts
  const { count: followersCount } = await locals.supabase
    .from('followers')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profile.id);

  const { count: followingCount } = await locals.supabase
    .from('followers')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profile.id);

  // Check if current user is following this profile
  let isFollowing = false;
  if (session?.user) {
    const { isFollowing: followStatus } = await profileService.isFollowing(
      session.user.id,
      profile.id
    );
    isFollowing = followStatus;
  }

  return {
    profile: {
      ...profile,
      products_count: products?.length || 0,
      active_listings: products?.length || 0,
      sold_listings: profile.sales_count || 0,
      followers_count: followersCount || 0,
      following_count: followingCount || 0
    },
    products: productsWithImages,
    reviews: reviews || [],
    reviewStats,
    totalReviewCount: totalReviewCount || 0,
    currentUser: session?.user || null,
    isFollowing
  };
}) satisfies PageServerLoad;