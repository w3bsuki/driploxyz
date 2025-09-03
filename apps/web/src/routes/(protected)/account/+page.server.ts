import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
  const { session } = await locals.safeGetSession();
  
  if (!session?.user) {
    throw redirect(303, '/login');
  }

  // Get current user's profile
  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (!profile) {
    throw redirect(303, '/login');
  }

  // Get user's active listings
  const { data: listings } = await locals.supabase
    .from('products')
    .select(`
      id,
      title,
      price,
      condition,
      is_sold,
      status,
      created_at,
      slug,
      images:product_images!product_id(image_url),
      profiles!products_seller_id_fkey (
        username
      ),
      categories (
        slug
      )
    `)
    .eq('seller_id', session.user.id)
    .eq('is_active', true)
    .eq('country_code', locals.country || 'BG')
    .order('created_at', { ascending: false });

  // Get user's order history (as buyer)
  const { data: orders } = await locals.supabase
    .from('orders')
    .select(`
      id,
      status,
      total_amount,
      currency,
      created_at,
      shipped_at,
      delivered_at,
      product:products!product_id(
        id,
        title,
        price,
        images:product_images!product_id(image_url)
      ),
      seller:profiles!seller_id(
        id,
        username,
        avatar_url
      )
    `)
    .eq('buyer_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  // Get user's sales history (as seller)
  const { data: sales } = await locals.supabase
    .from('orders')
    .select(`
      id,
      status,
      total_amount,
      seller_net_amount,
      currency,
      created_at,
      shipped_at,
      delivered_at,
      product:products!product_id(
        id,
        title,
        price,
        images:product_images!product_id(image_url)
      ),
      buyer:profiles!buyer_id(
        id,
        username,
        avatar_url
      )
    `)
    .eq('seller_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  // Get user's favorites
  const { data: favorites } = await locals.supabase
    .from('favorites')
    .select(`
      id,
      created_at,
      product:products!product_id (
        id,
        title,
        price,
        condition,
        is_sold,
        images:product_images!product_id(image_url),
        seller:profiles!seller_id(
          username,
          avatar_url
        )
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  // Transform data
  const listingsWithImages = listings?.map(listing => ({
    ...listing,
    images: listing.images?.map(img => img.image_url) || []
  })) || [];

  const ordersWithImages = orders?.map(order => ({
    ...order,
    product: order.product ? {
      ...order.product,
      images: order.product.images?.map(img => img.image_url) || []
    } : null
  })) || [];

  const salesWithImages = sales?.map(sale => ({
    ...sale,
    product: sale.product ? {
      ...sale.product,
      images: sale.product.images?.map(img => img.image_url) || []
    } : null
  })) || [];

  const favoritesWithImages = favorites?.filter(f => f.product).map(favorite => ({
    ...favorite.product,
    images: favorite.product.images?.map(img => img.image_url) || [],
    seller_name: favorite.product.seller?.username,
    seller_avatar: favorite.product.seller?.avatar_url,
    favorited_at: favorite.created_at
  })) || [];

  return {
    profile,
    listings: listingsWithImages,
    orders: ordersWithImages,
    sales: salesWithImages,
    favorites: favoritesWithImages,
    currentUser: session.user
  };
}) satisfies PageServerLoad;