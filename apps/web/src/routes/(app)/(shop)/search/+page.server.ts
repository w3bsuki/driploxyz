import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { Database } from '@repo/database';
import { canonicalizeFilterUrl, buildCanonicalUrl, searchParamsToSegments } from '$lib/utils/filter-url';
import { withTimeout } from '$lib/server/utils';
import { ProductDomainAdapter } from '@repo/core/services';

type Category = Database['public']['Tables']['categories']['Row'];

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

function buildCategoryHierarchy(categories: Category[]): Record<string, CategoryHierarchyL1> {
  const hierarchy: Record<string, CategoryHierarchyL1> = {};
  const level1Map = new Map<string, CategoryHierarchyL1>();
  const level2Map = new Map<string, CategoryHierarchyL2>();

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
  depends('app:search');
  depends('app:products');
  depends('app:categories');
  
  const searchParams = url.searchParams;
  const hasLegacyCategoryParams = searchParams.has('category') && (searchParams.has('subcategory') || searchParams.has('specific'));
  
  if (hasLegacyCategoryParams) {
    const result = searchParamsToSegments(searchParams);
    if (result.needsRedirect && result.canonicalPath) {
      const newUrl = result.canonicalPath + (result.searchParams.toString() ? `?${result.searchParams.toString()}` : '');
      redirect(301, newUrl);
    }
  }
  
  const urlResult = canonicalizeFilterUrl(url);
  if (urlResult.needsRedirect) {
    const canonicalUrl = buildCanonicalUrl(url, urlResult.canonical);
    redirect(301, canonicalUrl);
  }
  
  const { user } = await locals.safeGetSession();
  setHeaders({
    'cache-control': user ? 'private, max-age=120, stale-while-revalidate=600' : 'public, max-age=120, s-maxage=300, stale-while-revalidate=600',
    'vary': 'Accept-Encoding, Authorization',
    'x-cache-strategy': 'search-page'
  });
  
  const query = url.searchParams.get('q') || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = 50;

  const startTime = Date.now();
  
  const category = url.searchParams.get('category') || '';
  const subcategory = url.searchParams.get('subcategory') || '';
  const specific = url.searchParams.get('specific') || '';
  
  const minPrice = url.searchParams.get('min_price');
  const maxPrice = url.searchParams.get('max_price');
  const condition = url.searchParams.get('condition');
  const brand = url.searchParams.get('brand');
  const size = url.searchParams.get('size');
  const sortBy = url.searchParams.get('sort') || 'newest';

  try {
    if (!locals.supabase) {
      throw new Error('Supabase client not initialized');
    }

    const [categoriesResult, categoryCountsResult, topSellersResult] = await Promise.all([
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
      withTimeout(
        locals.supabase.rpc('get_virtual_category_counts'),
        2000,
        { data: [], error: null, count: null, status: 200, statusText: 'OK' }
      ),
      withTimeout(
        locals.supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, rating, sales_count')
          .gt('sales_count', 0)
          .order('sales_count', { ascending: false })
          .limit(10),
        2000,
        { data: [], error: null, count: null, status: 200, statusText: 'OK' }
      )
    ]);

    const { data: allCategories } = categoriesResult;
    const { data: categoryCountsData } = categoryCountsResult;
    const { data: topSellers } = topSellersResult;

    let categorySlug: string | null = null;
    if (specific && specific !== 'all') {
      categorySlug = specific;
    } else if (subcategory && subcategory !== 'all') {
      categorySlug = subcategory;
    } else if (category && category !== 'all') {
      categorySlug = category;
    }

    const offset = (page - 1) * pageSize;
    
    let searchResults: SearchProductResult[] | null = null;
    let productsError: any = null;

    try {
      // Use ProductDomainAdapter for consistent search logic
      const productAdapter = new ProductDomainAdapter(locals.supabase);
      
      // DEBUG: Phase 1 - Log search parameters
      console.log('[Search Server] Starting search with params:', {
        query,
        categorySlug,
        page,
        pageSize,
        offset,
        minPrice,
        maxPrice,
        condition,
        brand,
        size,
        sortBy
      });
      
      // Resolve category segments if needed
      let categoryIds: string[] | undefined = undefined;
      if (categorySlug) {
        // Simple resolution for now - find category by slug
        const { data: catData } = await locals.supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .single();
        
        if (catData) {
          categoryIds = [catData.id];
          console.log('[Search Server] Resolved category slug', categorySlug, 'to ID:', catData.id);
        } else {
          console.log('[Search Server] Could not resolve category slug:', categorySlug);
        }
      }

      const sortMap: Record<string, { by: 'created_at' | 'price' | 'popularity' | 'relevance'; direction: 'asc' | 'desc' }> = {
        'price-low': { by: 'price', direction: 'asc' },
        'price-high': { by: 'price', direction: 'desc' },
        'newest': { by: 'created_at', direction: 'desc' },
        'oldest': { by: 'created_at', direction: 'asc' },
        'popular': { by: 'popularity', direction: 'desc' },
        'relevance': { by: 'created_at', direction: 'desc' } // Fallback to newest for relevance as simple search doesn't support rank
      };

      const sortOptions = sortMap[sortBy] || sortMap.newest;

      const searchResult = await productAdapter.searchProductsWithFilters(query, {
        limit: pageSize,
        offset,
        // country_code: locals.country || 'BG', // Removed to match main page behavior
        category_ids: categoryIds,
        min_price: minPrice ? parseFloat(minPrice) : undefined,
        max_price: maxPrice ? parseFloat(maxPrice) : undefined,
        sizes: size && size !== 'all' ? [size] : undefined,
        conditions: condition && condition !== 'all' ? [condition] : undefined,
        brands: brand && brand !== 'all' ? [brand] : undefined,
        sort: sortOptions
      });

      // DEBUG: Phase 1 - Log search results
      console.log('[Search Server] ProductDomainAdapter returned:', {
        hasData: !!searchResult.data,
        dataLength: searchResult.data?.length,
        hasError: !!searchResult.error,
        error: searchResult.error,
        total: searchResult.total
      });

      if (searchResult.error) {
        console.error('[Search Server] Search error:', searchResult.error);
        throw searchResult.error;
      }

      // Map the results to the expected format
      // Note: ProductDomainAdapter returns products with nested categories, profiles, and product_images
      if (searchResult.data) {
        console.log('[Search Server] First raw product from adapter:', searchResult.data[0]);
        
        searchResults = searchResult.data.map((p: any) => ({
          ...p,
          // Ensure required fields are present
          relevance_rank: 0, // Adapter doesn't return rank yet
          category_id: p.category_id,
          // Keep the nested data from adapter (profiles, product_images, categories)
          // Don't overwrite them with null/empty values
        })) as unknown as SearchProductResult[];
        
        console.log('[Search Server] Mapped searchResults count:', searchResults.length);
        console.log('[Search Server] First product has product_images:', searchResults[0]?.product_images?.length);
        console.log('[Search Server] First product has categories:', !!searchResults[0]?.categories);
        console.log('[Search Server] First product has profiles:', !!searchResults[0]?.profiles);
      }
      
    } catch (err) {
      console.error('Search failed:', err);
      productsError = err;
    }

    let products: SearchProductResult[] = searchResults || [];
    let count: number | null = null;

    if (products.length > 0) {
      const productIds = products.map(p => p.id);
      const sellerIds = products.map(p => p.seller_id);

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

      const categoryById = new Map<string, Category>();
      (allCategories || []).forEach((cat: Category) => categoryById.set(cat.id, cat));
      const categoryByName = new Map<string, Category>();
      (allCategories || []).forEach((cat: Category) => categoryByName.set(cat.name.trim().toLowerCase(), cat));
      const categoryBySlug = new Map<string, Category>();
      (allCategories || []).forEach((cat: Category) => categoryBySlug.set(cat.slug.trim().toLowerCase(), cat));

      products = products.map(product => {
        const profile = profilesMap.get(product.seller_id);
        const refetchedImages = imagesMap.get(product.id) || [];
        
        // Use adapter's nested product_images if available, else use re-fetched images
        const adapterImages = (product as any).product_images;
        const hasAdapterImages = Array.isArray(adapterImages) && adapterImages.length > 0;
        const effectiveImages = hasAdapterImages 
          ? adapterImages.map((img: any) => img.image_url)
          : refetchedImages;
        
        // Use adapter's nested profiles if available, else use re-fetched profile
        const adapterProfile = (product as any).profiles;
        const effectiveProfile = adapterProfile || profile;
        
        let resolvedMain: string | null = null;
        let resolvedSub: string | null = null;
        let resolvedSpecific: string | null = null;
        let resolvedCategoryNode: Category | null = null;

        const rpcCategory = (product as any).categories as { id: string; name: string; slug: string; parent_id: string | null; level: number } | null | undefined;
        if (rpcCategory?.id && categoryById.has(rpcCategory.id)) {
          resolvedCategoryNode = categoryById.get(rpcCategory.id)!;
        } else if (rpcCategory?.slug) {
          const maybe = categoryBySlug.get(rpcCategory.slug.trim().toLowerCase());
          if (maybe) resolvedCategoryNode = maybe;
        }

        if (!resolvedCategoryNode && product.category) {
          const maybe = categoryByName.get(product.category.trim().toLowerCase());
          if (maybe) resolvedCategoryNode = maybe;
        }

        if (resolvedCategoryNode) {
          const node = resolvedCategoryNode;
          if (node.level === 3) {
            resolvedSpecific = node.name;
            const parent = node.parent_id ? categoryById.get(node.parent_id) : undefined;
            if (parent) {
              resolvedSub = parent.name;
              const grandparent = parent.parent_id ? categoryById.get(parent.parent_id) : undefined;
              if (grandparent) resolvedMain = grandparent.name;
            }
          } else if (node.level === 2) {
            resolvedSub = node.name;
            const parent = node.parent_id ? categoryById.get(node.parent_id) : undefined;
            if (parent) resolvedMain = parent.name;
          } else if (node.level === 1) {
            resolvedMain = node.name;
          }
        } else if (categorySlug) {
          const maybe = categoryBySlug.get(categorySlug.trim().toLowerCase());
          if (maybe) {
            if (maybe.level === 1) resolvedMain = maybe.name;
            if (maybe.level === 2) {
              resolvedSub = maybe.name; const parent = maybe.parent_id ? categoryById.get(maybe.parent_id) : undefined; if (parent) resolvedMain = parent.name;
            }
            if (maybe.level === 3) {
              resolvedSpecific = maybe.name; const parent = maybe.parent_id ? categoryById.get(maybe.parent_id) : undefined; if (parent) { resolvedSub = parent.name; const grandparent = parent.parent_id ? categoryById.get(parent.parent_id) : undefined; if (grandparent) resolvedMain = grandparent.name; }
            }
          }
        }

        return {
          ...product,
          profiles: effectiveProfile || null,
          product_images: effectiveImages.map((url: string) => ({ image_url: url })),
          images: product.images || effectiveImages,
          categories: resolvedCategoryNode ? {
            id: resolvedCategoryNode.id,
            name: resolvedCategoryNode.name,
            slug: resolvedCategoryNode.slug,
            parent_id: resolvedCategoryNode.parent_id,
            level: resolvedCategoryNode.level
          } : null,
          main_category_name_resolved: resolvedMain,
          subcategory_name_resolved: resolvedSub,
          specific_category_name_resolved: resolvedSpecific
        } as any;
      });

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
          category: category || null,
          subcategory: subcategory || null,
          specific: specific || null,
          minPrice: minPrice || null,
          maxPrice: maxPrice || null,
          condition: condition || null,
          brand: brand || null,
          size: size || null,
          sortBy: sortBy || 'relevance'
        }
      };
    }

    const categoryHierarchy = allCategories ? buildCategoryHierarchy(allCategories as Category[]) : {};

    const categoryProductCounts: Record<string, number> = {};
    if (categoryCountsData) {
      categoryCountsData.forEach((row: { product_count: number; virtual_type: string }) => {
        categoryProductCounts[row.virtual_type] = row.product_count || 0;
      });
    }

    const level1Categories = allCategories?.filter(c => c.level === 1) || [];
    
    const categoryOrder = ['Women', 'Men', 'Kids', 'Unisex'];
    const sortedCategories = level1Categories.map(cat => ({
      ...cat,
      product_count: categoryProductCounts[cat.slug] || 0
    })).sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.name);
      const bIndex = categoryOrder.indexOf(b.name);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    const categoryLookup = new Map<string, Category>();
    allCategories?.forEach(cat => categoryLookup.set(cat.id, cat));

    const transformedProducts = (products || []).map((product: SearchProductResult & any) => {
      let mainCategoryName = '';
      let subcategoryName = '';
      let specificCategoryName = '';
      let mainCategorySlug = '';
      let subcategorySlug = '';
      let specificCategorySlug = '';

      if (product.main_category_name_resolved || product.subcategory_name_resolved || product.specific_category_name_resolved) {
        mainCategoryName = product.main_category_name_resolved || '';
        subcategoryName = product.subcategory_name_resolved || '';
        specificCategoryName = product.specific_category_name_resolved || '';
        // We need to look up slugs for these names if possible, or rely on what we have
        // Since we don't have resolved slugs in the product object from the previous step easily available without re-lookup
        // Let's try to get them from the category object if it matches
        if (product.categories) {
           if (product.categories.level === 1) mainCategorySlug = product.categories.slug;
           if (product.categories.level === 2) subcategorySlug = product.categories.slug;
           if (product.categories.level === 3) specificCategorySlug = product.categories.slug;
        }
        
        // Fallback: try to find slugs from names using our lookups
        if (!mainCategorySlug && mainCategoryName) {
           const cat = Array.from(categoryLookup.values()).find(c => c.name === mainCategoryName && c.level === 1);
           if (cat) mainCategorySlug = cat.slug;
        }
        if (!subcategorySlug && subcategoryName) {
           const cat = Array.from(categoryLookup.values()).find(c => c.name === subcategoryName && c.level === 2);
           if (cat) subcategorySlug = cat.slug;
        }
        if (!specificCategorySlug && specificCategoryName) {
           const cat = Array.from(categoryLookup.values()).find(c => c.name === specificCategoryName && c.level === 3);
           if (cat) specificCategorySlug = cat.slug;
        }

      } else if (product.categories) {
        const category = product.categories;

        if (category.level === 1) {
          mainCategoryName = category.name;
          mainCategorySlug = category.slug;
        } else if (category.level === 2) {
          subcategoryName = category.name;
          subcategorySlug = category.slug;
          const parentCat = categoryLookup.get(category.parent_id!);
          if (parentCat) {
             mainCategoryName = parentCat.name;
             mainCategorySlug = parentCat.slug;
          }
        } else if (category.level === 3) {
          specificCategoryName = category.name;
          specificCategorySlug = category.slug;
          const parentCat = categoryLookup.get(category.parent_id!);
          if (parentCat) {
            subcategoryName = parentCat.name;
            subcategorySlug = parentCat.slug;
            const grandparentCat = categoryLookup.get(parentCat.parent_id!);
            if (grandparentCat) {
               mainCategoryName = grandparentCat.name;
               mainCategorySlug = grandparentCat.slug;
            }
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
        seller_username: product.profiles?.username || null,
        category: product.categories || null,
        main_category_name: mainCategoryName || null,
        category_name: specificCategoryName || subcategoryName || mainCategoryName || null,
        subcategory_name: subcategoryName || null,
        specific_category_name: specificCategoryName || null,
        main_category_slug: mainCategorySlug || null,
        subcategory_slug: subcategorySlug || null,
        specific_category_slug: specificCategorySlug || null,
        relevance_rank: product.relevance_rank || null
      };
    });

    const nextCursor = transformedProducts.length === pageSize && transformedProducts.length > 0
      ? Buffer.from(`${transformedProducts[transformedProducts.length - 1]?.created_at}:${transformedProducts[transformedProducts.length - 1]?.id}`).toString('base64')
      : null;

    // DEBUG: Phase 1 - Final return values
    console.log('[Search Server] Final return:', {
      productsCount: transformedProducts.length,
      hasMore: transformedProducts.length === pageSize,
      total: count || 0,
      firstProduct: transformedProducts[0] ? {
        id: transformedProducts[0].id,
        title: transformedProducts[0].title,
        imagesCount: transformedProducts[0].images?.length
      } : null
    });

    return {
      searchQuery: query,
      currentPage: page,
      pageSize,
      hasMore: transformedProducts.length === pageSize,
      nextCursor,
      products: transformedProducts,
      categories: sortedCategories,
      topSellers: topSellers || [],
      topBrands: [],
      categoryHierarchy: Promise.resolve().then(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
        return categoryHierarchy;
      }),
      categoryProductCounts: Promise.resolve().then(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
        return categoryProductCounts;
      }),
      total: count || 0,
      filters: {
        // Return null for empty strings to avoid filter matching issues
        category: category || null,
        subcategory: subcategory || null,
        specific: specific || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        condition: condition || null,
        brand: brand || null,
        size: size || null,
        sortBy: sortBy || 'relevance'
      },
      _performance: Promise.resolve().then(() => ({
        loadTime: Date.now() - startTime,
        queryType: query ? 'search' : 'browse',
        resultCount: transformedProducts.length,
        cacheStatus: 'fresh'
      }))
    };

  } catch (err) {
    if (dev) console.error('Search load error:', err);
    error(500, 'Failed to load search results');
  }
}) satisfies PageServerLoad;
