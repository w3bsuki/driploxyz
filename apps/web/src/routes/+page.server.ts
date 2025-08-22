import type { PageServerLoad } from './$types';
import { createServices } from '$lib/services';
import { redirect } from '@sveltejs/kit';
import { cacheWarming } from '$lib/cache';

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
    // Direct parallel queries - simpler and more maintainable than RPC
    console.log('[HOMEPAGE] Loading homepage data...');
    
    const [categoriesResult, topSellersResult, promotedResult, featuredResult] = await Promise.allSettled([
      services.categories.getMainCategories(),
      services.profiles.getTopSellers(8),
      services.products.getPromotedProducts(8),
      supabase
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
        .limit(12)
    ]);

    // Process results
    const categories = categoriesResult.status === 'fulfilled' ? (categoriesResult.value.data || []) : [];
    const topSellers = topSellersResult.status === 'fulfilled' ? (topSellersResult.value.data || []) : [];
    const promotedProducts = promotedResult.status === 'fulfilled' ? (promotedResult.value.data || []) : [];
    
    let featuredProducts = [];
    if (featuredResult.status === 'fulfilled') {
      const { data: rawProducts } = featuredResult.value;
      if (rawProducts) {
        featuredProducts = rawProducts.map(item => ({
          ...item,
          // Keep product_images as is for the ProductCard component
          product_images: item.product_images || [],
          // Also provide images array for compatibility
          images: (item.product_images || []).map((img: any) => 
            typeof img === 'string' ? img : (img?.image_url || '')
          ).filter(Boolean),
          category_name: item.categories?.name,
          seller_name: item.profiles?.username,
          seller_rating: item.profiles?.rating,
          seller_avatar: item.profiles?.avatar_url
        }));
      }
    }

    return {
      promotedProducts,
      featuredProducts,
      categories,
      topSellers,
      errors: {
        promoted: promotedResult.status === 'rejected' ? 'Failed to load' : null,
        products: featuredResult.status === 'rejected' ? 'Failed to load' : null,
        categories: categoriesResult.status === 'rejected' ? 'Failed to load' : null,
        sellers: topSellersResult.status === 'rejected' ? 'Failed to load' : null
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