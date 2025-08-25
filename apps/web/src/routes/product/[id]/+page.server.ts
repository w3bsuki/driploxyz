import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase, safeGetSession } }) => {
  const { session } = await safeGetSession();

  // Get main product with optimized query
  const { data: product, error: productError } = await supabase
    .from('products')
    .select(`
      id,
      title,
      description,
      price,
      condition,
      size,
      brand,
      color,
      material,
      location,
      is_active,
      is_sold,
      created_at,
      seller_id,
      category_id,
      product_images!product_id (
        id,
        image_url,
        sort_order
      ),
      categories!category_id (
        id,
        name,
        parent_id
      ),
      profiles!seller_id (
        id,
        username,
        avatar_url,
        rating,
        bio,
        created_at
      )
    `)
    .eq('id', params.id)
    .eq('is_active', true)
    .single();

  if (productError || !product) {
    throw error(404, 'Product not found');
  }

  // Check favorite status and fetch related data in parallel
  const [favoriteResult, similarResult, sellerResult] = await Promise.allSettled([
    // Check if user has favorited (only if authenticated)
    session?.user ? supabase
      .from('favorites')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('product_id', params.id)
      .maybeSingle() : Promise.resolve({ data: null }),
    
    // Get similar products (same category)
    supabase
      .from('products')
      .select(`
        id,
        title,
        price,
        condition,
        product_images!product_id (
          image_url
        )
      `)
      .eq('category_id', product.category_id!)
      .eq('is_active', true)
      .eq('is_sold', false)
      .neq('id', params.id)
      .limit(6),
    
    // Get other seller products
    supabase
      .from('products')
      .select(`
        id,
        title,
        price,
        condition,
        product_images!product_id (
          image_url
        )
      `)
      .eq('seller_id', product.seller_id!)
      .eq('is_active', true)
      .eq('is_sold', false)
      .neq('id', params.id)
      .limit(4)
  ]);

  const isFavorited = favoriteResult.status === 'fulfilled' && !!favoriteResult.value.data;
  const similarProducts = similarResult.status === 'fulfilled' ? similarResult.value.data || [] : [];
  const sellerProducts = sellerResult.status === 'fulfilled' ? sellerResult.value.data || [] : [];
  const isOwner = session?.user?.id === product.seller_id;

  return {
    product: {
      ...product,
      images: product.product_images?.map(img => img.image_url) || [],
      seller: product.profiles
    },
    similarProducts: similarProducts.map(p => ({
      ...p,
      images: p.product_images?.map(img => img.image_url) || []
    })),
    sellerProducts: sellerProducts.map(p => ({
      ...p,
      images: p.product_images?.map(img => img.image_url) || []
    })),
    isOwner,
    isFavorited,
    user: session?.user || null
  };
};