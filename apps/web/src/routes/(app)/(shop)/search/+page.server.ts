import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { Database } from '@repo/database';
import { canonicalizeFilterUrl, buildCanonicalUrl, searchParamsToSegments } from '$lib/utils/filter-url';
import { withTimeout } from '$lib/server/utils';

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
  const sortBy = url.searchParams.get('sort') || 'relevance';

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
      const rpcResponse = await (locals.supabase.rpc as any)('search_products', {
        query_text: query?.trim() || '',
        filter_category: categorySlug,
        min_price: minPrice ? parseFloat(minPrice) : null,
        max_price: maxPrice ? parseFloat(maxPrice) : null,
        filter_size: size && size !== 'all' ? size : null,
        filter_condition: condition && condition !== 'all' ? condition : null,
        filter_brand: brand && brand !== 'all' ? brand : null,
        result_limit: pageSize,
        result_offset: offset,
        filter_country_code: locals.country || 'BG'
      });
      
      searchResults = rpcResponse.data as SearchProductResult[] | null;
      productsError = rpcResponse.error;
    } catch (rpcErr) {
      console.error('RPC search failed, falling back to standard query:', rpcErr);
      let queryBuilder = locals.supabase
        .from('products')
        .select('id, title, description, price, category, brand, condition, size, images, created_at, seller_id, slug, location, country_code')
        .eq('status', 'active')
        .range(offset, offset + pageSize - 1);

      if (query) {
        queryBuilder = queryBuilder.ilike('title', `%${query}%`);
      }
      
      const fallbackRes = await queryBuilder;
      if (fallbackRes.data) {
        searchResults = fallbackRes.data.map(p => ({
          ...(p as any),
          relevance_rank: 0,
          category_id: undefined,
          profiles: null,
          product_images: [],
          categories: null
        })) as unknown as SearchProductResult[];
      }
      productsError = fallbackRes.error;
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
        const images = imagesMap.get(product.id) || [];
        
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
          profiles: profile || null,
          product_images: images.map(url => ({ image_url: url })),
          images: product.images || images,
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

    const categoryHierarchy = allCategories ? buildCategoryHierarchy(allCategories as Category[]) : {};

    const level1Categories = allCategories?.filter(c => c.level === 1) || [];
    
    const categoryOrder = ['Women', 'Men', 'Kids', 'Unisex'];
    const sortedCategories = level1Categories.sort((a, b) => {
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

      if (product.main_category_name_resolved || product.subcategory_name_resolved || product.specific_category_name_resolved) {
        mainCategoryName = product.main_category_name_resolved || '';
        subcategoryName = product.subcategory_name_resolved || '';
        specificCategoryName = product.specific_category_name_resolved || '';
      } else if (product.categories) {
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
        seller_username: product.profiles?.username || null,
        category: product.categories || null,
        main_category_name: mainCategoryName || null,
        category_name: specificCategoryName || subcategoryName || mainCategoryName || null,
        subcategory_name: subcategoryName || null,
        specific_category_name: specificCategoryName || null,
        relevance_rank: product.relevance_rank || null
      };
    });

    const categoryProductCounts: Record<string, number> = {};
    if (categoryCountsData) {
      categoryCountsData.forEach((row: { product_count: number; virtual_type: string }) => {
        categoryProductCounts[row.virtual_type] = row.product_count || 0;
      });
    }

    const nextCursor = transformedProducts.length === pageSize && transformedProducts.length > 0
      ? Buffer.from(`${transformedProducts[transformedProducts.length - 1]?.created_at}:${transformedProducts[transformedProducts.length - 1]?.id}`).toString('base64')
      : null;

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
