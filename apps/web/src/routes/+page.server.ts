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
    // Test service calls one by one to identify the problematic one
    console.log('[HOMEPAGE] Testing categories service...');
    
    let categories = [];
    let categoriesError = null;
    
    try {
      const result = await services.categories.getMainCategories();
      categories = result.data || [];
      categoriesError = result.error;
      console.log('[HOMEPAGE] Categories loaded successfully:', categories.length);
    } catch (err) {
      console.error('Categories failed:', err);
      categoriesError = 'Failed to load categories';
    }

    console.log('[HOMEPAGE] Testing top sellers service...');
    let topSellers = [];
    let sellersError = null;
    
    try {
      const result = await services.profiles.getTopSellers(8);
      topSellers = result.data || [];
      sellersError = result.error;
      console.log('[HOMEPAGE] Top sellers loaded successfully:', topSellers.length);
    } catch (err) {
      console.error('Top sellers failed:', err);
      sellersError = 'Failed to load sellers';
    }

    console.log('[HOMEPAGE] Testing promoted products service...');
    let promotedProducts = [];
    let promotedError = null;
    
    try {
      const result = await services.products.getPromotedProducts(8);
      promotedProducts = result.data || [];
      promotedError = result.error;
      console.log('[HOMEPAGE] Promoted products loaded successfully:', promotedProducts.length);
    } catch (err) {
      console.error('Promoted products failed:', err);
      promotedError = 'Failed to load promoted products';
    }
    
    console.log('[HOMEPAGE] Loading featured products with safe fallback...');
    let featuredProducts = [];
    let productsError = null;
    
    try {
      // Use the same query structure as promoted products which works
      const { data: rawProducts, error: dbError } = await supabase
        .from('products')
        .select(`
          *,
          product_images (*),
          categories (name),
          profiles!products_seller_id_fkey (username, rating, avatar_url)
        `)
        .eq('is_active', true)
        .eq('is_sold', false)
        .order('created_at', { ascending: false })
        .limit(12);

      if (dbError) {
        console.error('Featured products DB error:', dbError);
        productsError = 'Database error';
        featuredProducts = [];
      } else if (rawProducts) {
        // Transform data exactly like promoted products
        featuredProducts = rawProducts.map(item => ({
          ...item,
          images: item.product_images || [],
          category_name: item.categories?.name,
          seller_name: item.profiles?.username,
          seller_rating: item.profiles?.rating,
          seller_avatar: item.profiles?.avatar_url
        }));
        console.log('[HOMEPAGE] Featured products loaded:', featuredProducts.length);
        console.log('[HOMEPAGE] First product sample:', {
          id: featuredProducts[0]?.id,
          title: featuredProducts[0]?.title,
          images: featuredProducts[0]?.images,
          product_images: rawProducts[0]?.product_images
        });
      }
    } catch (err) {
      console.error('Featured products error:', err);
      featuredProducts = [];
      productsError = 'Failed to load';
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