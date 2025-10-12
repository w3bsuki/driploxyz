import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
// import { withTimeout } from '@repo/core/utils';

export const load = (async ({ url, locals, depends }) => {
  const { supabase, country, safeGetSession } = locals;

  depends('home:data');

  // Check if this is an auth callback that went to the wrong URL
  const code = url.searchParams.get('code');
  if (code) {
    const params = new URLSearchParams(url.searchParams);
    if (!params.has('next')) {
      params.set('next', '/onboarding');
    }
    redirect(303, `/auth/callback?${params.toString()}`);
  }

  // Handle missing Supabase configuration - return empty data for now
  if (!supabase) {
    return {
      featuredProducts: [],
      categories: [],
      topSellers: [],
      topBrands: [],
      country: country || 'BG',
      user: null,
      profile: null,
      errors: {
        products: 'Database not configured',
        categories: 'Database not configured',
        sellers: 'Database not configured',
        brands: 'Database not configured'
      }
    };
  }

  // Get current user session
  const { session } = await safeGetSession();

  try {
    // Fetch featured products (active products, ordered by creation date)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        title,
        price,
        brand,
        size,
        condition,
        is_active,
        status,
        seller_id,
        category_id,
        created_at,
        product_images (
          image_url,
          sort_order
        )
      `)
      .eq('is_active', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(12);

    // Fetch categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    // Fetch top sellers (profiles with sales)
    const { data: topSellers, error: sellersError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, rating, sales_count')
      .gt('sales_count', 0)
      .order('sales_count', { ascending: false })
      .limit(6);

    // Transform products to include images array
    const featuredProducts = (products || []).map((product) => ({
      ...product,
      images: (product.product_images || [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((img) => img.image_url)
    }));

    return {
      featuredProducts,
      categories: categories || [],
      topSellers: topSellers || [],
      topBrands: [],
      country: country || 'BG',
      user: session?.user || null,
      profile: null,
      errors: {
        products: productsError?.message || null,
        categories: categoriesError?.message || null,
        sellers: sellersError?.message || null,
        brands: null
      }
    };

  } catch (error) {
    if (dev) {
      console.error('Error loading homepage data:', error);
    }
    return {
      featuredProducts: [],
      categories: [],
      topSellers: [],
      topBrands: [],
      country: country || 'BG',
      user: session?.user || null,
      profile: null,
      errors: {
        products: 'Failed to load products',
        categories: 'Failed to load categories',
        sellers: 'Failed to load sellers',
        brands: 'Failed to load brands'
      }
    };
  }
}) satisfies PageServerLoad;