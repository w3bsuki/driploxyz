import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ProfileService } from '$lib/services/profiles';

export const load = (async ({ params, locals }) => {
  const { session } = await locals.safeGetSession();
  
  if (!session?.user) {
    redirect(303, '/login');
  }
  
  const profileService = new ProfileService(locals.supabase);
  
  // Get seller profile
  const { data: seller, error: sellerError } = await profileService.getProfile(params.sellerId);
  
  if (sellerError || !seller) {
    error(404, 'Seller not found');
  }
  
  // Get seller's active products
  const { data: products } = await locals.supabase
    .from('products')
    .select(`
      id,
      title,
      description,
      price,
      brand,
      size,
      condition,
      category_id,
      location,
      created_at,
      images:product_images(image_url)
    `)
    .eq('seller_id', params.sellerId)
    .eq('is_active', true)
    .eq('is_sold', false)
    .order('created_at', { ascending: false });
  
  // Transform products
  const productsWithImages = products?.map(product => ({
    ...product,
    images: product.images?.map(img => img.image_url) || [],
    sellerId: params.sellerId,
    sellerName: seller.username,
    sellerRating: seller.rating || 0
  })) || [];
  
  return {
    seller,
    products: productsWithImages,
    currentUser: session.user
  };
}) satisfies PageServerLoad;