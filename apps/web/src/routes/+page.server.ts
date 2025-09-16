import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { withTimeout } from '@repo/utils';

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
      topBrands: [],
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
  const userId = session?.user?.id;

  try {
    // OPTIMIZED: Consolidated queries to eliminate redundant data fetching
    // Only 2 main queries instead of 5+ separate ones

    // Query 1: Categories (unchanged - already efficient)
    const categoriesPromise = withTimeout(
      supabase
        .from('categories')
        .select('id, name, slug, sort_order')
        .is('parent_id', null)
        .order('sort_order')
        .limit(6)
        .then(),
      2500,
      { data: [] } as any
    );

    // Query 2: CONSOLIDATED - Featured products with seller info in single query
    // This replaces separate featured, topSellers, and topBrands queries

    const consolidatedDataPromise = withTimeout(
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
          is_boosted,
          boosted_until,
          boost_priority,
          product_images!inner (
            image_url
          ),
          profiles!products_seller_id_fkey (
            id,
            username,
            full_name,
            avatar_url,
            account_type,
            subscription_tier,
            sales_count,
            followers_count,
            rating,
            bio,
            verified,
            monthly_views,
            weekly_sales_count
          ),
          categories (
            slug
          )
        `)
        .eq('is_active', true)
        .eq('is_sold', false)
        .eq('country_code', country || 'BG')
        .order('boost_priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50)
        .then(),
      3000,
      { data: [] } as any
    );


    // Query 3: Category product counts using RPC functions for real data
    const categoryCountsPromise = withTimeout(
      Promise.all([
        // Main category counts using RPC function
        supabase.rpc('get_category_product_counts', { p_country_code: country || 'BG' }),
        // Virtual category counts using RPC function
        supabase.rpc('get_virtual_category_counts', { p_country_code: country || 'BG' })
      ]),
      2500,
      [{ data: [] }, { data: [] }] as any
    );

    // OPTIMIZED: Now 3 queries for complete data
    const [categoriesResult, consolidatedResult, categoryCountsResult] = await Promise.all([
      categoriesPromise,
      consolidatedDataPromise,
      categoryCountsPromise
    ]);

    // Process consolidated results
    const categories = (categoriesResult as any).data || [];
    const allProductsWithSellers = (consolidatedResult as any).data || [];

    // Process category counts using real data from RPC functions
    let categoryProductCounts: Record<string, number> = {};
    let virtualCategoryCounts: Record<string, number> = {};

    if (categoryCountsResult && Array.isArray(categoryCountsResult)) {
      const [mainCountsResult, virtualCountsResult] = categoryCountsResult;

      // Process main category counts from RPC function
      if (mainCountsResult?.data) {
        mainCountsResult.data.forEach((row: any) => {
          if (row.category_level === 1) { // Only top-level categories
            categoryProductCounts[row.category_slug] = row.product_count || 0;
          }
        });
      }

      // Process virtual category counts from RPC function
      if (virtualCountsResult?.data) {
        virtualCountsResult.data.forEach((row: any) => {
          virtualCategoryCounts[row.category_type] = row.product_count || 0;
        });
      }
    }

    // Extract and deduplicate sellers/brands from product data
    const sellersMap = new Map();
    const brandsMap = new Map();

    allProductsWithSellers.forEach((product: any) => {
      if (product.profiles) {
        const seller = product.profiles;
        if (seller.account_type === 'brand' && seller.verified) {
          if (!brandsMap.has(seller.id)) {
            brandsMap.set(seller.id, {
              ...seller,
              products: []
            });
          }
          brandsMap.get(seller.id).products.push(product);
        } else if (seller.sales_count > 0 || seller.account_type === 'admin') {
          if (!sellersMap.has(seller.id)) {
            sellersMap.set(seller.id, {
              ...seller,
              products: []
            });
          }
          sellersMap.get(seller.id).products.push(product);
        }
      }
    });

    // Sort and limit extracted data
    const topSellers = Array.from(sellersMap.values())
      .sort((a, b) => b.sales_count - a.sales_count)
      .slice(0, 8);

    const topBrands = Array.from(brandsMap.values())
      .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
      .slice(0, 10);

    const sellers = topSellers.slice(0, 20); // Reuse sorted data

    // OPTIMIZED: Seller previews already available from consolidated query
    let sellerPreviews: Record<string, { id: string; title: string; price: number; seller_id: string; product_images: { image_url: string }[] }[]> = {};

    // Extract previews from already-fetched data (no additional query needed)
    [...topSellers, ...topBrands].forEach((seller: any) => {
      if (seller.products && seller.products.length > 0) {
        sellerPreviews[seller.id] = seller.products.slice(0, 3).map((product: any) => ({
          id: product.id,
          title: product.title,
          price: product.price,
          seller_id: product.seller_id,
          product_images: product.product_images || []
        }));
      }
    });
    
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
    {
      const rawProducts = allProductsWithSellers;
      if (rawProducts) {
        // Note: services would be used for category hierarchy if needed in future
        
        // Fetch all categories first for hierarchy resolution (same as search page)
        const { data: allCategories } = await withTimeout(
          supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('level')
            .order('sort_order')
            .then(),
          2000,
          { data: null }
        );

        // Transform products for frontend with proper category hierarchy
        featuredProducts = await Promise.all(rawProducts.map(async (item, index) => {
          // BOOST SYSTEM: Check if product is boosted and still active
          const isBoosted = item.is_boosted && item.boosted_until && new Date(item.boosted_until) > new Date();
          
          // LEGACY PROMOTION: Keep manual promotion for specific products
          const isPromoted = MANUALLY_PROMOTED_IDS.includes(item.id);
          
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
          
          // Determine seller account type and badges
          const sellerSubscriptionTier = item.profiles?.subscription_tier;
          const sellerAccountType = item.profiles?.account_type;
          
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
            // BOOST SYSTEM: Replace old promotion logic with boost system
            is_boosted: isBoosted,
            is_promoted: isPromoted, // Keep legacy promotion for specific products
            boosted_until: item.boosted_until,
            favorite_count: item.favorite_count || 0,
            images: item.product_images?.map((img: { image_url: string }) => img.image_url) || [],
            product_images: item.product_images?.map((img: { image_url: string }) => img.image_url) || [],
            // Use the hierarchy we just fetched
            main_category_name,
            category_name,
            subcategory_name,
            // Seller info - include both formats for compatibility with badge system
            seller_name: item.profiles?.username,
            seller_username: item.profiles?.username, // Required for getProductUrl
            seller_avatar: item.profiles?.avatar_url,
            seller_subscription_tier: sellerSubscriptionTier,
            sellerAccountType: sellerAccountType === 'brand' ? 'brand' : 
                              sellerAccountType === 'pro' || sellerAccountType === 'premium' ? 'pro' :
                              'new_seller',
            // Badge system: Determine what badges to show
            seller_badges: {
              is_pro: sellerSubscriptionTier === 'pro',
              is_brand: sellerSubscriptionTier === 'brand',
              is_verified: item.profiles?.verified || false
            },
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
      const { data: favorites } = await withTimeout(
        supabase
          .from('favorites')
          .select('product_id')
          .eq('user_id', userId)
          .in('product_id', productIds)
          .then(),
        1500,
        { data: null }
      );
      
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

      // Real category product counts for search pills
      categoryProductCounts,
      virtualCategoryCounts,

      // Stream featured products (below the fold)
      featuredProducts: Promise.resolve(featuredProducts),

      // Stream non-critical data
      topSellers: Promise.resolve(topSellers),
      topBrands: Promise.resolve(topBrands),
      sellers: Promise.resolve(sellers),
      userFavorites: Promise.resolve(userFavorites),

      // Stream seller product previews (server-side fetched)
      sellerPreviews: Promise.resolve(sellerPreviews),

      errors: {
        products: consolidatedResult.status === 'rejected' ? 'Failed to load' : null,
        categories: categoriesResult.status === 'rejected' ? 'Failed to load' : null,
        sellers: consolidatedResult.status === 'rejected' ? 'Failed to load' : null,
        brands: consolidatedResult.status === 'rejected' ? 'Failed to load' : null
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
      errors: {
        products: 'Failed to load products',
        categories: 'Failed to load categories',
        sellers: 'Failed to load sellers',
        brands: 'Failed to load brands'
      }
    };
  }
}) satisfies PageServerLoad;
