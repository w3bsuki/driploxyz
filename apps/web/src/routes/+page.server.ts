import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';

// MANUAL PROMOTION SYSTEM
// Add product IDs here to promote them with crown badges 👑
// TODO: Replace with database is_promoted field when premium plans launch
const MANUALLY_PROMOTED_IDS: string[] = [
  // Add product IDs you want to promote, e.g.:
  // 'product-id-1',
  // 'product-id-2',
  // 'product-id-3'
];

export const load: PageServerLoad = async ({ url, locals: { supabase, country, safeGetSession }, setHeaders, depends }) => {
  // Mark dependencies for client-side invalidation
  depends('home:data');
  // Check if this is an auth callback that went to the wrong URL
  const code = url.searchParams.get('code');
  if (code) {
    const params = new URLSearchParams(url.searchParams);
    if (!params.has('next')) {
      params.set('next', '/onboarding');
    }
    throw redirect(303, `/auth/callback?${params.toString()}`);
  }
  
  // Handle missing Supabase configuration
  if (!supabase) {
    return {
      featuredProducts: [],
      categories: [],
      topSellers: [],
      errors: {
        products: 'Database not configured', 
        categories: 'Database not configured',
        sellers: 'Database not configured'
      }
    };
  }

  // Get current user session
  const { session } = await safeGetSession();
  const userId = session?.user?.id;

  try {
    // Optimized parallel queries - select only needed columns to minimize egress
    const [categoriesResult, topSellersResult, featuredResult] = await Promise.allSettled([
      // Get main categories only
      supabase
        .from('categories')
        .select('id, name, slug, sort_order')
        .is('parent_id', null)
        .order('sort_order')
        .limit(6),
      
      // Get sellers who have active listings
      supabase
        .from('profiles')
        .select(`
          id, 
          username, 
          avatar_url, 
          rating, 
          sales_count,
          products!products_seller_id_fkey!inner (
            id
          )
        `)
        .eq('products.is_active', true)
        .eq('products.is_sold', false)
        .order('sales_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(8),
      
      // Get featured products with images, categories, and favorite counts
      supabase
        .from('products')
        .select(`
          id,
          title,
          price,
          condition,
          size,
          location,
          created_at,
          seller_id,
          country_code,
          favorite_count,
          slug,
          product_images!inner (
            image_url
          ),
          categories (
            id,
            name,
            parent_id
          ),
          profiles!products_seller_id_fkey (
            username,
            avatar_url,
            account_type
          )
        `)
        .eq('is_active', true)
        .eq('is_sold', false)
        .eq('country_code', country || 'BG')
        .order('created_at', { ascending: false })
        .limit(12)
    ]);

    // Process results
    const categories = categoriesResult.status === 'fulfilled' ? (categoriesResult.value.data || []) : [];
    const topSellers = topSellersResult.status === 'fulfilled' ? (topSellersResult.value.data || []) : [];
    
    let featuredProducts: Array<{
      id: string;
      title: string;
      price: number;
      condition: string;
      size: string | null;
      location: string | null;
      created_at: string | null;
      seller_id: string;
      is_promoted: boolean;
      favorite_count: number;
      images: string[];
      product_images: string[];
      main_category_name?: string;
      seller?: { username: string | null };
    }> = [];
    if (featuredResult.status === 'fulfilled') {
      const { data: rawProducts } = featuredResult.value;
      if (rawProducts) {
        // Transform products for frontend
        featuredProducts = rawProducts.map((item, index) => {
          // AUTO PROMOTION: Promote newest listings (first 3 items since ordered by created_at DESC)
          // Later: Replace with database field when premium plans are active
          const isPromoted = index < 3 || MANUALLY_PROMOTED_IDS.includes(item.id);
          
          return {
            id: item.id,
            title: item.title,
            price: item.price,
            condition: item.condition,
            size: item.size,
            location: item.location,
            created_at: item.created_at,
            seller_id: item.seller_id,
            // Promote newest listings + any manually added IDs
            is_promoted: isPromoted,
            // Add favorite count
            favorite_count: item.favorite_count || 0,
            // Simplify image structure
            images: item.product_images?.map((img: { image_url: string }) => img.image_url) || [],
            product_images: item.product_images?.map((img: { image_url: string }) => img.image_url) || [],
            // Category info - avoid extra DB calls; fall back gracefully
            main_category_name: item.categories?.parent_id ? null : (item.categories?.name ?? null),
            category_name: item.categories?.name,
            subcategory_name: item.categories?.parent_id ? item.categories.name : null,
            // Seller info
            seller_name: item.profiles?.username,
            seller_avatar: item.profiles?.avatar_url,
            sellerAccountType: item.profiles?.account_type === 'brand' ? 'brand' : 
                              item.profiles?.account_type === 'pro' || item.profiles?.account_type === 'premium' ? 'pro' :
                              'new_seller'
          };
        });
      }
    }

    // Fetch user's favorites if logged in
    let userFavorites: Record<string, boolean> = {};
    if (userId && featuredProducts.length > 0) {
      const productIds = featuredProducts.map(p => p.id);
      const { data: favorites } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', userId)
        .in('product_id', productIds);
      
      if (favorites) {
        userFavorites = Object.fromEntries(
          favorites.map(f => [f.product_id, true])
        );
      }
    }

    // Cache headers for guests only to avoid caching personalized data
    if (!userId) {
      // Allow CDN/browser caching of data payload briefly
      setHeaders({ 'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' });
    }

    // Return critical data immediately, stream non-critical data
    return {
      // Critical data for initial render
      categories,
      country: country || 'BG',
      
      // Stream featured products (below the fold)
      featuredProducts: Promise.resolve(featuredProducts),
      
      // Stream non-critical data
      topSellers: Promise.resolve(topSellers),
      userFavorites: Promise.resolve(userFavorites),
      
      errors: {
        products: featuredResult.status === 'rejected' ? 'Failed to load' : null,
        categories: categoriesResult.status === 'rejected' ? 'Failed to load' : null,
        sellers: topSellersResult.status === 'rejected' ? 'Failed to load' : null
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
      errors: {
        products: 'Failed to load products',
        categories: 'Failed to load categories',
        sellers: 'Failed to load sellers'
      }
    };
  }
};
