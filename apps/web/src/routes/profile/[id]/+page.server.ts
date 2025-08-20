import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ProfileService } from '$lib/services/profiles';

export const load: PageServerLoad = async ({ params, locals }) => {
  const { session } = await locals.safeGetSession();
  const profileService = new ProfileService(locals.supabase);
  
  // Get the profile by username (the [id] param is actually the username)
  const { data: profile, error: profileError } = await profileService.getProfileByUsername(params.id);
  
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

  return {
    profile: {
      ...profile,
      products_count: products?.length || 0,
      followers_count: 0, // TODO: implement followers
      following_count: 0  // TODO: implement following
    },
    products: productsWithImages,
    reviews: reviews || [],
    isOwnProfile,
    currentUser: session?.user || null
  };
};