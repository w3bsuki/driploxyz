import type { PageServerLoad } from './$types';
import { createServices } from '$lib/services';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const services = createServices(supabase);

  try {
    // Load data in parallel for better performance
    const [
      { data: promotedProducts, error: promotedError },
      { data: featuredProducts, error: productsError },
      { data: categories, error: categoriesError },
      { data: topSellers, error: sellersError }
    ] = await Promise.all([
      // Get promoted products for highlights
      services.products.getPromotedProducts(8),
      // Get featured/recent products
      services.products.getProducts({
        sort: { by: 'created_at', direction: 'desc' },
        limit: 12
      }),
      // Get main categories
      services.categories.getMainCategories(),
      // Get top sellers
      services.profiles.getTopSellers(8)
    ]);

    return {
      promotedProducts: promotedProducts || [],
      featuredProducts: featuredProducts || [],
      categories: categories || [],
      topSellers: topSellers || [],
      errors: {
        promoted: promotedError,
        products: productsError,
        categories: categoriesError,
        sellers: sellersError
      }
    };
  } catch (error) {
    console.error('Error loading homepage data:', error);
    return {
      promotedProducts: [],
      featuredProducts: [],
      categories: [],
      topSellers: [],
      errors: {
        promoted: 'Failed to load promoted products',
        products: 'Failed to load products',
        categories: 'Failed to load categories',
        sellers: 'Failed to load sellers'
      }
    };
  }
};