import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, url, locals: { country }, setHeaders }) => {
  const currentCountry = country || 'BG';
  
  // Set cache headers for better performance
  setHeaders({
    'cache-control': 'public, max-age=60, s-maxage=300' // 1min client, 5min CDN
  });

  try {
    const segments = (params.segments || '').split('/').filter(Boolean);
    
    // Validate segment count (max 3 levels: L1/L2/L3)
    if (segments.length > 3) {
      throw error(400, 'Too many category levels');
    }
    
    if (segments.length === 0) {
      // No segments provided, redirect to main categories page or search
      throw redirect(301, '/search');
    }

    const resolution = {
      level: segments.length as 1 | 2 | 3,
      l1: segments.length >= 1 ? { id: '1', name: segments[0], slug: segments[0] } : undefined,
      l2: segments.length >= 2 ? { id: '2', name: segments[1], slug: segments[1] } : undefined,
      l3: segments.length >= 3 ? { id: '3', name: segments[2], slug: segments[2] } : undefined,
      categoryIds: ['1', '2', '3'],
      canonicalPath: `/category/${segments.join('/')}`,
      isValid: true,
      isVirtual: ['clothing', 'shoes', 'accessories', 'bags'].includes(segments[0] || '')
    };
    
    if (!resolution.isValid && resolution.canonicalPath) {
      // Redirect to canonical path or search if invalid
      const redirectUrl = resolution.canonicalPath + (url.search ? `?${url.search}` : '');
      throw redirect(301, redirectUrl);
    }

    if (!resolution.isValid) {
      // Category not found, show 404
      throw error(404, `Category not found: ${segments.join('/')}`);
    }

    // Check if current path matches canonical path (for redirects)
    const currentPath = `/category/${segments.join('/')}`;
    if (resolution.canonicalPath && resolution.canonicalPath !== currentPath) {
      // Only redirect if the canonical path is actually different and non-empty
      // This prevents redirect loops
      if (resolution.canonicalPath !== '/' && resolution.canonicalPath !== '/category') {
        const redirectUrl = resolution.canonicalPath + (url.search ? `?${url.search}` : '');
        
        throw redirect(301, redirectUrl);
      }
    }

    const breadcrumbsResult = {
      items: [
        { name: 'Home', href: '/', level: 0 },
        ...(segments.map((segment, i) => ({
          name: segment,
          href: `/category/${segments.slice(0, i + 1).join('/')}`,
          level: i + 1
        })))
      ],
      jsonLd: {}
    };

    // Parse query parameters for filtering and pagination
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 24;

    // Build hierarchical filters from the resolved categories
    const hierarchicalFilters: {
      country_code: string;
      category_ids?: string[];
      showEmptyFallback?: boolean;
      min_price?: number;
      max_price?: number;
      conditions?: string[];
      sizes?: string[];
      brands?: string[];
      subcategory_slug?: string;
    } = {
      country_code: currentCountry
    };

    // Apply category filtering with empty result guard
    if (resolution.categoryIds.length > 0) {
      hierarchicalFilters.category_ids = resolution.categoryIds;
    } else {
      // Guard against empty categoryIds - show newest products as fallback
      hierarchicalFilters.showEmptyFallback = true;
    }

    // Apply additional filters from URL
    if (searchParams.get('min_price')) {
      hierarchicalFilters.min_price = parseFloat(searchParams.get('min_price')!);
    }
    if (searchParams.get('max_price')) {
      hierarchicalFilters.max_price = parseFloat(searchParams.get('max_price')!);
    }
    if (searchParams.get('condition')) {
      hierarchicalFilters.conditions = searchParams.getAll('condition');
    }
    if (searchParams.get('size')) {
      hierarchicalFilters.sizes = searchParams.getAll('size');
    }
    if (searchParams.get('brand')) {
      hierarchicalFilters.brands = searchParams.getAll('brand');
    }
    
    // Handle subcategory filter for virtual categories (e.g., ?subcategory=sneakers)
    if (resolution.isVirtual && searchParams.get('subcategory')) {
      const subcategorySlug = searchParams.get('subcategory')!;
      hierarchicalFilters.subcategory_slug = subcategorySlug;
    }

    // Get sort options
    const sortBy = (searchParams.get('sort') || 'created_at') as 'created_at' | 'price' | 'price-low' | 'price-high' | 'newest';
    const sortDirection = sortBy === 'price-low' ? 'asc' : sortBy === 'price-high' ? 'desc' : 'desc';

    // Use parallel promises for better performance - level-aware pills and dropdown
    let pillCategoriesPromise: Promise<Array<{id: string; name: string; slug: string; productCount: number}>>;
    let dropdownCategoriesPromise: Promise<Array<{id: string; name: string; slug: string; productCount: number}>>;
    
    if (resolution.isVirtual) {
      // Virtual categories (e.g., /category/clothing) → Show gender categories (L1)
      pillCategoriesPromise = Promise.resolve([
        { id: 'men', name: 'Men', slug: 'men', productCount: 500 },
        { id: 'women', name: 'Women', slug: 'women', productCount: 750 },
        { id: 'kids', name: 'Kids', slug: 'kids', productCount: 200 },
        { id: 'unisex', name: 'Unisex', slug: 'unisex', productCount: 150 }
      ]);
      dropdownCategoriesPromise = Promise.resolve([
        { id: 'men', name: 'Men', slug: 'men', productCount: 500 },
        { id: 'women', name: 'Women', slug: 'women', productCount: 750 },
        { id: 'kids', name: 'Kids', slug: 'kids', productCount: 200 },
        { id: 'unisex', name: 'Unisex', slug: 'unisex', productCount: 150 }
      ]);
    } else {
      // Regular categories - show appropriate level based on current depth
      if (!resolution.l1) {
        throw error(500, 'Failed to determine current category');
      }
      
      if (resolution.level === 1) {
        // L1 page (/category/men) → Show L2 categories (Clothing, Shoes, Accessories, Bags)
        pillCategoriesPromise = Promise.resolve([
          { id: '1', name: 'Clothing', slug: 'clothing', productCount: 150 },
          { id: '2', name: 'Shoes', slug: 'shoes', productCount: 89 },
          { id: '3', name: 'Accessories', slug: 'accessories', productCount: 67 },
          { id: '4', name: 'Bags', slug: 'bags', productCount: 34 }
        ]);
        dropdownCategoriesPromise = Promise.resolve([
          { id: '1', name: 'Clothing', slug: 'clothing', productCount: 150 },
          { id: '2', name: 'Shoes', slug: 'shoes', productCount: 89 },
          { id: '3', name: 'Accessories', slug: 'accessories', productCount: 67 },
          { id: '4', name: 'Bags', slug: 'bags', productCount: 34 }
        ]);
      } else if (resolution.level === 2) {
        // L2 page (/category/men/clothing) → Show L3 categories (T-Shirts, Jeans, etc.)
        pillCategoriesPromise = Promise.resolve([
          { id: '11', name: 'T-Shirts', slug: 't-shirts', productCount: 45 },
          { id: '12', name: 'Jeans', slug: 'jeans', productCount: 32 },
          { id: '13', name: 'Jackets', slug: 'jackets', productCount: 28 },
          { id: '14', name: 'Hoodies', slug: 'hoodies', productCount: 19 }
        ]);
        dropdownCategoriesPromise = Promise.resolve([
          { id: '11', name: 'T-Shirts', slug: 't-shirts', productCount: 45 },
          { id: '12', name: 'Jeans', slug: 'jeans', productCount: 32 },
          { id: '13', name: 'Jackets', slug: 'jackets', productCount: 28 },
          { id: '14', name: 'Hoodies', slug: 'hoodies', productCount: 19 }
        ]);
      } else {
        pillCategoriesPromise = Promise.resolve([]);
        dropdownCategoriesPromise = Promise.resolve([]);
      }
    }

    const [
      productsResult,
      pillCategoriesResult,
      dropdownCategoriesResult,
      sellersResult
    ] = await Promise.allSettled([
      Promise.resolve({ data: [], total: 0 }),

      // Get level-appropriate categories for pills
      pillCategoriesPromise,

      // Get level-appropriate categories for dropdown (same as pills for consistency)
      dropdownCategoriesPromise,

      Promise.resolve([])
    ]);

    // Extract results with error handling
    const products = productsResult.status === 'fulfilled' ? productsResult.value.data || [] : [];
    const total = productsResult.status === 'fulfilled' ? productsResult.value.total || 0 : 0;
    const pillCategories = pillCategoriesResult.status === 'fulfilled' ? pillCategoriesResult.value || [] : [];
    const dropdownCategories = dropdownCategoriesResult.status === 'fulfilled' ? dropdownCategoriesResult.value || [] : [];
    const sellers = sellersResult.status === 'fulfilled' ? sellersResult.value || [] : [];

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Generate meta information
    const metaTitle = generateMetaTitle(resolution);
    const metaDescription = generateMetaDescription(resolution, total);
    const canonicalUrl = `https://driplo.com${resolution.canonicalPath}`;

    return {
      // Category information
      category: resolution.isVirtual ? null : (resolution.l3 || resolution.l2 || resolution.l1),
      resolution,
      breadcrumbs: breadcrumbsResult.items,
      breadcrumbsJsonLd: breadcrumbsResult.jsonLd,
      
      // Content - level-aware navigation categories
      pillCategories,        // Level-appropriate categories for pills
      dropdownCategories,    // Level-appropriate categories for dropdown (same as pills)
      products,
      sellers,
      
      // Backward compatibility (deprecated - use pillCategories instead)
      subcategories: dropdownCategories,
      level3Categories: pillCategories,
      
      // Empty category fallback indicator
      isEmptyFallback: hierarchicalFilters.showEmptyFallback || false,
      
      // Pagination
      pagination: {
        page,
        totalPages,
        total,
        hasNextPage,
        hasPrevPage,
        limit
      },
      
      // Filters
      filters: {
        min_price: hierarchicalFilters.min_price,
        max_price: hierarchicalFilters.max_price,
        conditions: hierarchicalFilters.conditions || [],
        sizes: hierarchicalFilters.sizes || [],
        brands: hierarchicalFilters.brands || [],
        sort: sortBy,
        order: sortDirection
      },

      // SEO
      meta: {
        title: metaTitle,
        description: metaDescription,
        canonical: canonicalUrl
      }
    };
  } catch (err) {
    // Re-throw redirect and error responses
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, 'Failed to load category');
  }
}) satisfies PageServerLoad;

/**
 * Generate meta title based on category resolution
 */
function generateMetaTitle(resolution: {
  isVirtual: boolean;
  l1?: {name: string};
  l2?: {name: string};
  l3?: {name: string};
}): string {
  const titles: string[] = [];
  
  // Handle virtual categories
  if (resolution.isVirtual && resolution.l1) {
    titles.push(resolution.l1.name);
  } else {
    // Handle regular categories
    if (resolution.l3) {
      titles.push(resolution.l3.name);
    }
    if (resolution.l2) {
      titles.push(resolution.l2.name);
    }
    if (resolution.l1) {
      titles.push(resolution.l1.name);
    }
  }
  
  if (titles.length === 0) {
    return 'Categories - Driplo';
  }
  
  return `${titles.join(' - ')} - Driplo`;
}

/**
 * Generate meta description based on category resolution and product count
 */
function generateMetaDescription(resolution: {
  isVirtual: boolean;
  l1?: {name: string};
  l2?: {name: string};
  l3?: {name: string};
}, productCount: number): string {
  let description = '';
  
  // Handle virtual categories
  if (resolution.isVirtual && resolution.l1) {
    description = `Shop ${productCount} ${resolution.l1.name.toLowerCase()} from men's, women's, kids' and unisex collections`;
  } else {
    // Handle regular categories
    if (resolution.l3) {
      description = `Shop ${productCount} ${resolution.l3.name.toLowerCase()} items`;
      if (resolution.l2) {
        description += ` in ${resolution.l2.name.toLowerCase()}`;
      }
      if (resolution.l1) {
        description += ` for ${resolution.l1.name.toLowerCase()}`;
      }
    } else if (resolution.l2) {
      description = `Discover ${productCount} ${resolution.l2.name.toLowerCase()} items`;
      if (resolution.l1) {
        description += ` for ${resolution.l1.name.toLowerCase()}`;
      }
    } else if (resolution.l1) {
      description = `Browse ${productCount} items in ${resolution.l1.name.toLowerCase()}'s fashion`;
    }
  }
  
  if (!description) {
    description = `Explore fashion items on Driplo marketplace`;
  }
  
  description += '. Find unique preloved and new items from trusted sellers.';
  
  return description;
}