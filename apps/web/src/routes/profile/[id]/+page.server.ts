import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ProfileService } from '$lib/services/profiles';

export const load: PageServerLoad = async ({ params, locals }) => {
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

  // Get user's favorites/wishlist if it's their own profile
  let favorites: any[] = [];
  if (isOwnProfile) {
    const { data: userFavorites } = await locals.supabase
      .from('favorites')
      .select(`
        id,
        created_at,
        products!product_id (
          id,
          title,
          price,
          condition,
          is_sold,
          seller_id,
          product_images!inner (
            image_url
          ),
          profiles!products_seller_id_fkey (
            username,
            avatar_url
          )
        )
      `)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    
    if (userFavorites) {
      favorites = userFavorites
        .filter(f => f.products)
        .map(f => ({
          ...f.products,
          images: f.products.product_images?.map((img: any) => img.image_url) || [],
          seller_name: f.products.profiles?.username,
          seller_avatar: f.products.profiles?.avatar_url,
          favorited_at: f.created_at
        }));
    }
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

  // Get user's reviews
  const { data: reviews } = await locals.supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      reviewer:profiles!reviewer_id(
        id,
        username,
        avatar_url
      )
    `)
    .eq('reviewee_id', profile.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(5);

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
  if (session?.user && !isOwnProfile) {
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
      favorites_count: favorites.length,
      followers_count: followersCount || 0,
      following_count: followingCount || 0
    },
    products: productsWithImages,
    reviews: reviews || [],
    favorites,
    isOwnProfile,
    currentUser: session?.user || null,
    isFollowing
  };
};