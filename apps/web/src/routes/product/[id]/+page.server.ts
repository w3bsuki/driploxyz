import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createServices } from '$lib/services';

export const load: PageServerLoad = async ({ params, locals: { supabase, session } }) => {
  const services = createServices(supabase, null); // No stripe needed for product viewing

  // Get the main product first (required for other queries)
  const { data: product, error: productError } = await services.products.getProduct(params.id);

  if (productError || !product) {
    throw error(404, 'Product not found');
  }

  // Parallel fetch similar and seller products for performance
  const [similarResult, sellerResult] = await Promise.allSettled([
    services.products.getProducts({
      filters: {
        category_ids: product.category_id ? [product.category_id] : undefined
      },
      limit: 6
    }),
    services.products.getSellerProducts(
      product.seller_id,
      { limit: 4 }
    )
  ]);

  // Process similar products
  const similarProducts = similarResult.status === 'fulfilled' 
    ? (similarResult.value.data || []).filter(p => p.id !== params.id)
    : [];

  // Process seller products
  const sellerProducts = sellerResult.status === 'fulfilled'
    ? (sellerResult.value.data || []).filter(p => p.id !== params.id)
    : [];

  // Check if current user owns this product
  const isOwner = session?.user?.id === product.seller_id;

  return {
    product,
    similarProducts,
    sellerProducts,
    isOwner,
    user: session?.user || null
  };
};