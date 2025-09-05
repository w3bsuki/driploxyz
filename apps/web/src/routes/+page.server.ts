import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';

// MANUAL PROMOTION SYSTEM
// Add product IDs here to promote them with crown badges 👑
// Will be replaced with database is_promoted field when premium plans launch
const MANUALLY_PROMOTED_IDS: string[] = [
  // Add product IDs you want to promote, e.g.:
  // 'product-id-1',
  // 'product-id-2',
  // 'product-id-3'
];

export const load = (async ({ url, locals: { supabase, country, safeGetSession }, setHeaders, depends }) => {
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
      
      // Get featured products with images and category info
      supabase
        .from('products')
        .select(`
          id,
          title,
          price,
          condition,
          size,
          brand,
          location,
          created_at,
          seller_id,
          country_code,
          favorite_count,
          slug,
          category_id,
          product_images!inner (
            image_url
          ),
          profiles!products_seller_id_fkey (
            username,
            avatar_url,
            account_type
          ),
          categories (
            slug
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
      category_name?: string;
      subcategory_name?: string;
      seller?: { username: string | null };
      // Required for getProductUrl compatibility
      seller_username?: string | null;
      slug?: string | null;
      profiles?: { username?: string | null };
      categories?: { slug?: string | null };
    }> = [];
    if (featuredResult.status === 'fulfilled') {
      const { data: rawProducts } = featuredResult.value;
      if (rawProducts) {
        // Note: services would be used for category hierarchy if needed in future
        
        // Fetch all categories first for hierarchy resolution (same as search page)
        const { data: allCategories } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('level')
          .order('sort_order');

        // Transform products for frontend with proper category hierarchy
        featuredProducts = await Promise.all(rawProducts.map(async (item, index) => {
          // AUTO PROMOTION: Promote newest listings (first 3 items since ordered by created_at DESC)
          const isPromoted = index < 3 || MANUALLY_PROMOTED_IDS.includes(item.id);
          
          // Get category hierarchy for this product (same logic as search page)
          let main_category_name: string | undefined;
          let category_name: string | undefined;
          let subcategory_name: string | undefined;
          
          if (item.category_id && allCategories) {
            // Find the product's category
            const productCategory = allCategories.find(cat => cat.id === item.category_id);
            if (productCategory) {
              if (productCategory.level === 1) {
                main_category_name = productCategory.name;
                category_name = productCategory.name;
              } else if (productCategory.level === 2) {
                subcategory_name = productCategory.name;
                category_name = productCategory.name;
                // Find the parent (Level 1) category
                const parentCat = allCategories.find(cat => cat.id === productCategory.parent_id);
                if (parentCat) {
                  main_category_name = parentCat.name;
                }
              } else if (productCategory.level === 3) {
                category_name = productCategory.name;
                // Find the parent (Level 2) and grandparent (Level 1) categories
                const parentCat = allCategories.find(cat => cat.id === productCategory.parent_id);
                if (parentCat) {
                  subcategory_name = parentCat.name;
                  const grandparentCat = allCategories.find(cat => cat.id === parentCat.parent_id);
                  if (grandparentCat) {
                    main_category_name = grandparentCat.name;
                  }
                }
              }
            }
          }
          
          return {
            id: item.id,
            title: item.title,
            price: item.price,
            condition: item.condition,
            size: item.size,
            brand: item.brand,
            location: item.location,
            created_at: item.created_at,
            seller_id: item.seller_id,
            is_promoted: isPromoted,
            favorite_count: item.favorite_count || 0,
            images: item.product_images?.map((img: { image_url: string }) => img.image_url) || [],
            product_images: item.product_images?.map((img: { image_url: string }) => img.image_url) || [],
            // Use the hierarchy we just fetched
            main_category_name,
            category_name,
            subcategory_name,
            // Seller info - include both formats for compatibility
            seller_name: item.profiles?.username,
            seller_username: item.profiles?.username, // Required for getProductUrl
            seller_avatar: item.profiles?.avatar_url,
            sellerAccountType: item.profiles?.account_type === 'brand' ? 'brand' : 
                              item.profiles?.account_type === 'pro' || item.profiles?.account_type === 'premium' ? 'pro' :
                              'new_seller',
            // Include slug for SEO URLs
            slug: item.slug,
            // Include profiles format for getProductUrl compatibility
            profiles: { username: item.profiles?.username },
            categories: { slug: item.categories?.slug }
          };
        }));
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
}) satisfies PageServerLoad;
