import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServices } from '$lib/services';

export const GET: RequestHandler = async ({ locals: { supabase } }) => {
  console.log('[DEBUG_PAGE_LOAD] Starting diagnostic');
  
  try {
    if (!supabase) {
      return json({
        error: 'No Supabase instance found',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    const services = createServices(supabase);
    
    // Test each service individually
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    try {
      console.log('[DEBUG] Testing promoted products');
      const { data: promotedProducts, error: promotedError } = await services.products.getPromotedProducts(2);
      results.tests.promotedProducts = {
        success: !promotedError,
        error: promotedError?.message || null,
        count: promotedProducts?.length || 0
      };
    } catch (err) {
      results.tests.promotedProducts = {
        success: false,
        error: (err as Error).message,
        count: 0
      };
    }

    try {
      console.log('[DEBUG] Testing featured products');
      const { data: featuredProducts, error: productsError } = await services.products.getProducts({
        sort: { by: 'created_at', direction: 'desc' },
        limit: 2
      });
      results.tests.featuredProducts = {
        success: !productsError,
        error: productsError?.message || null,
        count: featuredProducts?.length || 0
      };
    } catch (err) {
      results.tests.featuredProducts = {
        success: false,
        error: (err as Error).message,
        count: 0
      };
    }

    try {
      console.log('[DEBUG] Testing categories');
      const { data: categories, error: categoriesError } = await services.categories.getMainCategories();
      results.tests.categories = {
        success: !categoriesError,
        error: categoriesError?.message || null,
        count: categories?.length || 0
      };
    } catch (err) {
      results.tests.categories = {
        success: false,
        error: (err as Error).message,
        count: 0
      };
    }

    try {
      console.log('[DEBUG] Testing top sellers');
      const { data: topSellers, error: sellersError } = await services.profiles.getTopSellers(2);
      results.tests.topSellers = {
        success: !sellersError,
        error: sellersError?.message || null,
        count: topSellers?.length || 0
      };
    } catch (err) {
      results.tests.topSellers = {
        success: false,
        error: (err as Error).message,
        count: 0
      };
    }

    return json(results);
  } catch (err) {
    console.error('[DEBUG_PAGE_LOAD] Fatal error:', err);
    return json({
      error: 'Fatal error during diagnostic',
      message: (err as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
};