import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createServices } from '$lib/services';

export const load: PageServerLoad = async ({ params, locals: { supabase, session } }) => {
  const services = createServices(supabase);

  // Get the product with images and seller info
  const { data: product, error: productError } = await services.products.getProduct(params.id);

  if (productError || !product) {
    throw error(404, 'Product not found');
  }

  // Get similar products from the same category
  const { data: similarProducts } = await services.products.getProducts({
    filters: {
      category_ids: product.category_id ? [product.category_id] : undefined
    },
    limit: 6
  });

  // Filter out the current product from similar products
  const filteredSimilar = similarProducts.filter(p => p.id !== params.id);

  // Get more products from the same seller
  const { data: sellerProducts } = await services.products.getSellerProducts(
    product.seller_id,
    { limit: 4 }
  );

  // Filter out the current product from seller products
  const filteredSellerProducts = sellerProducts.filter(p => p.id !== params.id);

  // Check if current user owns this product
  const isOwner = session?.user?.id === product.seller_id;

  return {
    product,
    similarProducts: filteredSimilar,
    sellerProducts: filteredSellerProducts,
    isOwner,
    user: session?.user || null
  };
};