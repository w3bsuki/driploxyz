import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ProfileService } from '$lib/services/profiles';

export const load: PageServerLoad = async ({ params, locals }) => {
  const { session } = await locals.safeGetSession();
  const profileService = new ProfileService(locals.supabase);
  
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

  // Get user's products
  const { data: products } = await locals.supabase
    .from('products')
    .select(`
      id,
      title,
      price,
      images:product_images(image_url)
    `)
    .eq('seller_id', profile.id)
    .eq('is_active', true)
    .eq('is_sold', false)
    .order('created_at', { ascending: false });

  // Get user's reviews
  const { data: reviews } = await locals.supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      reviewer:profiles!reviews_reviewer_id_fkey(
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
      sold_listings: profile.sales_count || 0
    },
    products: productsWithImages,
    reviews: reviews || [],
    isOwnProfile,
    currentUser: session?.user || null,
    isFollowing
  };
};