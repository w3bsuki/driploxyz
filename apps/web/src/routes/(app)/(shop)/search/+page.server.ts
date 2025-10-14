import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { Database } from '@repo/database';
import { canonicalizeFilterUrl, buildCanonicalUrl, searchParamsToSegments } from '$lib/utils/filter-url';
import { withTimeout } from '$lib/server/utils';

type Category = Database['public']['Tables']['categories']['Row'];

// Type for search_products RPC result
interface SearchProductResult {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  condition: string;
  size: string;
  images: string[];
  created_at: string;
  seller_id: string;
  relevance_rank: number | null;
  slug?: string;
  location?: string;
  country_code?: string;
  category_id?: string;
  profiles?: {
    username: string;
    avatar_url: string;
    account_type: string;
  } | null;
  product_images?: Array<{ image_url: string }>;
  categories?: {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
    level: number;
  } | null;
}

interface CategoryHierarchyL3 {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

interface CategoryHierarchyL2 {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  level3: CategoryHierarchyL3[];
}

interface CategoryHierarchyL1 {
  id: string;
  name: string;
  slug: string;
  level2: Record<string, CategoryHierarchyL2>;
}

// Note: resolveCategoryIds function removed as search_products RPC
// now handles category filtering internally via filter_category parameter

/**
 * Build simple category hierarchy for UI
 */
function buildCategoryHierarchy(categories: Category[]): Record<string, CategoryHierarchyL1> {
  const hierarchy: Record<string, CategoryHierarchyL1> = {};
  const level1Map = new Map<string, CategoryHierarchyL1>();
  const level2Map = new Map<string, CategoryHierarchyL2>();

  // Build level 1 categories
  categories.filter(c => c.level === 1 && c.is_active).forEach(l1 => {
    const l1Data = {
      id: l1.id,
      name: l1.name,
      slug: l1.slug,
      level2: {}
    };
    hierarchy[l1.slug] = l1Data;
    level1Map.set(l1.id, l1Data);
  });

  // Build level 2 categories
  categories.filter(c => c.level === 2 && c.is_active).forEach(l2 => {
    const parent = level1Map.get(l2.parent_id!);
    if (parent) {
      const l2Data = {
        id: l2.id,
        name: l2.name,
        slug: l2.slug,
        parentId: l2.parent_id,
        level3: []
      };
      parent.level2[l2.slug] = l2Data;
      level2Map.set(l2.id, l2Data);
    }
  });

  // Build level 3 categories
  categories.filter(c => c.level === 3 && c.is_active).forEach(l3 => {
    const parent = level2Map.get(l3.parent_id!);
    if (parent) {
      parent.level3.push({
        id: l3.id,
        name: l3.name,
        slug: l3.slug,
        parentId: l3.parent_id
      });
    }
  });

  return hierarchy;
}

export const load = (async ({ url, locals, setHeaders, depends }) => {
  // Country filtering is now handled by the search_products RPC function
  // which uses the country_code column internally
  // const country = locals.country || 'BG';

  // Mark dependencies for intelligent invalidation
  depends('app:search');
  depends('app:products');
  depends('app:categories');
  
  // Check if this is a legacy category hierarchy pattern in search
  const searchParams = url.searchParams;
  const hasLegacyCategoryParams = searchParams.has('category') && (searchParams.has('subcategory') || searchParams.has('specific'));
  
  if (hasLegacyCategoryParams) {
    // Convert to new hierarchical route
    const result = searchParamsToSegments(searchParams);
    if (result.needsRedirect && result.canonicalPath) {
      const newUrl = result.canonicalPath + (result.searchParams.toString() ? `?${result.searchParams.toString()}` : '');
      redirect(301, newUrl);
    }
  }
  
  // Handle other legacy URL parameters and redirect if needed
  const urlResult = canonicalizeFilterUrl(url);
  if (urlResult.needsRedirect) {
    const canonicalUrl = buildCanonicalUrl(url, urlResult.canonical);
    redirect(301, canonicalUrl);
  }
  
  // Optimize cache headers for search pages - user-specific but cacheable for short periods
  // Search results are user-agnostic but contain filtering data that changes frequently
  const { user } = await locals.safeGetSession();
  setHeaders({
    'cache-control': user ? 'private, max-age=120, stale-while-revalidate=600' : 'public, max-age=120, s-maxage=300, stale-while-revalidate=600',
    'vary': 'Accept-Encoding, Authorization',
    'x-cache-strategy': 'search-page'
  });
  
  // Parse all URL parameters with performance optimizations
  const query = url.searchParams.get('q') || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  // Cursor-based pagination not used with RPC - using offset-based instead
  // const cursor = url.searchParams.get('cursor');
  const pageSize = 50; // Reasonable page size

  // Performance tracking
  const startTime = Date.now();
  
  // Category hierarchy parameters - canonical names only
  // Level 1: Gender (women/men/kids/unisex)
  const category = url.searchParams.get('category') || '';
  // Level 2: Product Type (clothing/shoes/bags/accessories)
  const subcategory = url.searchParams.get('subcategory') || '';
  // Level 3: Specific Item (t-shirts/dresses/sneakers/etc)
  const specific = url.searchParams.get('specific') || '';
  
  // Other filters
  const minPrice = url.searchParams.get('min_price');
  const maxPrice = url.searchParams.get('max_price');
  const condition = url.searchParams.get('condition');
  const brand = url.searchParams.get('brand');
  const size = url.searchParams.get('size');
  const sortBy = url.searchParams.get('sort') || 'relevance';

  try {
    // Check if Supabase client is available
    if (!locals.supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Simple parallel queries for categories and filtering
    const [categoriesResult, categoryCountsResult] = await Promise.all([
      // Query 1: Fetch all categories for hierarchy
      withTimeout(
        locals.supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('level')
          .order('sort_order'),
        2000,
        { data: [], error: null, count: null, status: 200, statusText: 'OK' }
      ),

      // Query 2: Get virtual category counts (simplified replacement)
      withTimeout(
        locals.supabase.rpc('get_virtual_category_counts'),
        2000,
        { data: [], error: null, count: null, status: 200, statusText: 'OK' }
      )
    ]);

    const { data: allCategories } = categoriesResult;
    const { data: categoryCountsData } = categoryCountsResult;

    // Resolve category slug for RPC function
    let categorySlug: string | null = null;
    if (specific && specific !== 'all') {
      categorySlug = specific;
    } else if (subcategory && subcategory !== 'all') {
      categorySlug = subcategory;
    } else if (category && category !== 'all') {
      categorySlug = category;
    }

    // ✅ OPTIMIZED: Using search_products RPC with full-text search
    // Performance: 10-100x faster than ILIKE queries
    // - GIN index on tsvector for instant lookups
    // - Weighted search: title(A) > brand(B) > description(C) > condition(D)
    // - ts_rank_cd relevance scoring when query provided
    // - Single query replaces multiple ILIKE filters
    const offset = (page - 1) * pageSize;
    
    // Call the RPC function - using type assertion since it's not in generated types yet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rpcResponse = await (locals.supabase.rpc as any)('search_products', {
      query_text: query?.trim() || '',
      filter_category: categorySlug,
      min_price: minPrice ? parseFloat(minPrice) : null,
      max_price: maxPrice ? parseFloat(maxPrice) : null,
      filter_size: size && size !== 'all' ? size : null,
      filter_condition: condition && condition !== 'all' ? condition : null,
      filter_brand: brand && brand !== 'all' ? brand : null,
      result_limit: pageSize,
      result_offset: offset
    });
    
    const searchResults = rpcResponse.data as SearchProductResult[] | null;
    const productsError = rpcResponse.error;

    // Transform RPC results to match the expected format
    // The RPC returns flat results, we need to enrich with profile data
    let products: SearchProductResult[] = searchResults || [];
    let count: number | null = null;

    // If we have results, fetch additional data (profiles) in parallel
    if (products.length > 0) {
      const productIds = products.map(p => p.id);
      const sellerIds = products.map(p => p.seller_id);

      // Fetch profiles and images in parallel
      const [profilesResult, imagesResult] = await Promise.all([
        locals.supabase
          .from('profiles')
          .select('id, username, avatar_url, account_type')
          .in('id', sellerIds),
        locals.supabase
          .from('product_images')
          .select('product_id, image_url')
          .in('product_id', productIds)
          .order('display_order')
      ]);

      const profilesMap = new Map(
        (profilesResult.data || []).map(p => 
          [p.id, { 
            username: p.username || '', 
            avatar_url: p.avatar_url || '', 
            account_type: p.account_type || '' 
          }]
        )
      );

      const imagesMap = new Map<string, string[]>();
      (imagesResult.data || []).forEach(img => {
        if (!imagesMap.has(img.product_id)) {
          imagesMap.set(img.product_id, []);
        }
        imagesMap.get(img.product_id)!.push(img.image_url);
      });

      // Enrich products with profile and image data
      products = products.map(product => {
        const profile = profilesMap.get(product.seller_id);
        const images = imagesMap.get(product.id) || [];
        
        return {
          ...product,
          profiles: profile || null,
          product_images: images.map(url => ({ image_url: url })),
          // Parse images JSON from RPC if it exists
          images: product.images || images,
          categories: product.category ? {
            id: product.id,
            name: product.category,
            slug: categorySlug || '',
            parent_id: null,
            level: 1
          } : null
        };
      });

      // For count, we'll need to run a separate count query
      // or accept that we don't have exact counts (common for large datasets)
      count = products.length === pageSize ? (page * pageSize) + 1 : products.length;
    }

    if (productsError) {
      if (dev) console.error('Products query error:', productsError);
      return {
        products: [],
        categories: [],
        categoryHierarchy: {},
        searchQuery: query,
        total: 0,
        error: 'Search failed. Please try again.',
        filters: {
          category: category,
          subcategory: subcategory,
          specific: specific,
          minPrice,
          maxPrice,
          condition,
          brand,
          size,
          sortBy
        }
      };
    }

    // Build simple 3-level hierarchy for UI
    const categoryHierarchy = allCategories ? buildCategoryHierarchy(allCategories as Category[]) : {};

    // Category hierarchy built successfully

    // Get Level 1 categories for pills
    const level1Categories = allCategories?.filter(c => c.level === 1) || [];
    
    // Sort by predefined order
    const categoryOrder = ['Women', 'Men', 'Kids', 'Unisex'];
    const sortedCategories = level1Categories.sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.name);
      const bIndex = categoryOrder.indexOf(b.name);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    // Optimized product transformation using efficient lookups
    const categoryLookup = new Map<string, Category>();
    allCategories?.forEach(cat => categoryLookup.set(cat.id, cat));

    const transformedProducts = (products || []).map((product: SearchProductResult) => {
      let mainCategoryName = '';
      let subcategoryName = '';
      let specificCategoryName = '';

      if (product.categories) {
        const category = product.categories;

        if (category.level === 1) {
          mainCategoryName = category.name;
        } else if (category.level === 2) {
          subcategoryName = category.name;
          const parentCat = categoryLookup.get(category.parent_id!);
          if (parentCat) mainCategoryName = parentCat.name;
        } else if (category.level === 3) {
          specificCategoryName = category.name;
          const parentCat = categoryLookup.get(category.parent_id!);
          if (parentCat) {
            subcategoryName = parentCat.name;
            const grandparentCat = categoryLookup.get(parentCat.parent_id!);
            if (grandparentCat) mainCategoryName = grandparentCat.name;
          }
        }
      }

      return {
        ...product,
        images: product.product_images?.map((img: { image_url: string }) => img.image_url) || product.images || [],
        seller: product.profiles ? {
          id: product.seller_id,
          username: product.profiles.username,
          avatar_url: product.profiles.avatar_url,
          account_type: product.profiles.account_type
        } : null,
        // Preserve seller username for URL generation
        seller_username: product.profiles?.username || null,
        category: product.categories || null,
        main_category_name: mainCategoryName || product.category || null,
        category_name: mainCategoryName || product.category || null, // For backward compatibility
        subcategory_name: subcategoryName || null,
        specific_category_name: specificCategoryName || null,
        // Include relevance rank from full-text search if query was provided
        relevance_rank: product.relevance_rank || null
      };
    });

    // Build virtual category product counts from the new function
    const categoryProductCounts: Record<string, number> = {};
    if (categoryCountsData) {
      categoryCountsData.forEach((row: { product_count: number; virtual_type: string }) => {
        categoryProductCounts[row.virtual_type] = row.product_count || 0;
      });
    }

    // Generate next cursor for pagination (using last product's created_at + id)
    const nextCursor = transformedProducts.length === pageSize && transformedProducts.length > 0
      ? Buffer.from(`${transformedProducts[transformedProducts.length - 1]?.created_at}:${transformedProducts[transformedProducts.length - 1]?.id}`).toString('base64')
      : null;

    // SvelteKit 2 streaming: Return critical data immediately, stream heavy data
    return {
      // Critical data for immediate render
      searchQuery: query,
      currentPage: page,
      pageSize,
      hasMore: transformedProducts.length === pageSize,
      nextCursor,

      // Essential search results - load immediately
      products: transformedProducts,

      // UI structure data - needed for layout
      categories: sortedCategories,

      // Stream heavy computed data
      categoryHierarchy: Promise.resolve().then(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
        return categoryHierarchy;
      }),

      categoryProductCounts: Promise.resolve().then(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
        return categoryProductCounts;
      }),

      // Performance and metadata
      total: count || 0,
      filters: {
        category: category,
        subcategory: subcategory,
        specific: specific,
        minPrice,
        maxPrice,
        condition,
        brand,
        size,
        sortBy
      },

      // Performance metrics
      _performance: Promise.resolve().then(() => ({
        loadTime: Date.now() - startTime,
        queryType: query ? 'search' : 'browse',
        resultCount: transformedProducts.length,
        cacheStatus: 'fresh' // Will be updated by cache layer
      }))
    };

  } catch (err) {
    if (dev) console.error('Search load error:', err);
    error(500, 'Failed to load search results');
  }
}) satisfies PageServerLoad;