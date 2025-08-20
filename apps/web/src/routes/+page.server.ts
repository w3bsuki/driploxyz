import type { PageServerLoad } from './$types';
import { createServices } from '$lib/services';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
  // Check if this is an auth callback that went to the wrong URL
  const code = url.searchParams.get('code');
  if (code) {
    console.log('[HOME] Detected auth code in URL, redirecting to auth callback');
    // Preserve all query params and redirect to the proper callback URL
    const params = new URLSearchParams(url.searchParams);
    // Add next parameter if not present
    if (!params.has('next')) {
      params.set('next', '/onboarding');
    }
    throw redirect(303, `/auth/callback?${params.toString()}`);
  }
  // Handle missing Supabase configuration
  if (!supabase) {
    return {
      promotedProducts: [],
      featuredProducts: [],
      categories: [],
      topSellers: [],
      errors: {
        promoted: 'Database not configured',
        products: 'Database not configured', 
        categories: 'Database not configured',
        sellers: 'Database not configured'
      }
    };
  }

  const services = createServices(supabase, null); // No stripe needed for homepage

  try {
    // Load data in parallel but with error handling for each
    let promotedProducts = [];
    let promotedError = null;
    let featuredProducts = [];
    let productsError = null;
    let categories = [];
    let categoriesError = null;
    let topSellers = [];
    let sellersError = null;

    // Get promoted products with error handling
    try {
      const result = await services.products.getPromotedProducts(8);
      promotedProducts = result.data || [];
      promotedError = result.error;
    } catch (err) {
      console.error('Promoted products failed:', err);
      promotedError = 'Failed to load promoted products';
    }

    // Get featured products with error handling
    try {
      const result = await services.products.getProducts({
        sort: { by: 'created_at', direction: 'desc' },
        limit: 12
      });
      featuredProducts = result.data || [];
      productsError = result.error;
    } catch (err) {
      console.error('Featured products failed:', err);
      productsError = 'Failed to load products';
    }

    // Get categories with error handling
    try {
      const result = await services.categories.getMainCategories();
      categories = result.data || [];
      categoriesError = result.error;
    } catch (err) {
      console.error('Categories failed:', err);
      categoriesError = 'Failed to load categories';
    }

    // Get top sellers with error handling
    try {
      const result = await services.profiles.getTopSellers(8);
      topSellers = result.data || [];
      sellersError = result.error;
    } catch (err) {
      console.error('Top sellers failed:', err);
      sellersError = 'Failed to load sellers';
    }

    return {
      promotedProducts,
      featuredProducts,
      categories,
      topSellers,
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