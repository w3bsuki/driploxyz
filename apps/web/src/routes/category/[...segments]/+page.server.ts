import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createServices } from '$lib/services';
import { resolveCategoryPath, getCategoryBreadcrumbs } from '$lib/server/categories.remote';
import * as i18n from '@repo/i18n';

export const load = (async ({ params, url, locals: { supabase, country }, setHeaders }) => {
  const currentCountry = country || 'BG';
  const services = createServices(supabase, null);
  
  // Set cache headers for better performance
  setHeaders({
    'cache-control': 'public, max-age=60, s-maxage=300' // 1min client, 5min CDN
  });

  try {
    const segments = params.segments ? params.segments.split('/').filter(Boolean) : [];
    
    // Validate segment count (max 3 levels: L1/L2/L3)
    if (segments.length > 3) {
      throw error(400, 'Too many category levels');
    }
    
    if (segments.length === 0) {
      // No segments provided, redirect to main categories page or search
      throw redirect(301, '/search');
    }

    // Resolve category path using our server function
    const resolution = await resolveCategoryPath(segments, supabase);
    
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
        console.log('Redirecting from', currentPath, 'to', redirectUrl);
        throw redirect(301, redirectUrl);
      }
    }

    // Get breadcrumbs
    const breadcrumbsResult = await getCategoryBreadcrumbs(segments, supabase);

    // Parse query parameters for filtering and pagination
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 24;
    const offset = (page - 1) * limit;

    // Build hierarchical filters from the resolved categories
    const hierarchicalFilters: any = {
      country_code: currentCountry
    };

    // Apply category filtering
    if (resolution.categoryIds.length > 0) {
      hierarchicalFilters.category_ids = resolution.categoryIds;
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
    const sortBy = (searchParams.get('sort') || 'created_at') as any;
    const sortDirection = (searchParams.get('order') || 'desc') as 'asc' | 'desc';
    const sort = { by: sortBy, direction: sortDirection };

    // Use parallel promises for better performance
    let subcategoriesPromise: Promise<any[]>;
    let level3CategoriesPromise: Promise<any[]>;
    
    if (resolution.isVirtual) {
      // For virtual categories, get aggregated subcategories from all target categories
      subcategoriesPromise = getVirtualCategorySubcategories(services, resolution.virtualTargetCategories || [], currentCountry);
      level3CategoriesPromise = getVirtualCategoryLevel3Pills(services, supabase, resolution.virtualTargetCategories || [], currentCountry);
    } else {
      // Regular category handling
      const currentCategory = resolution.l3 || resolution.l2 || resolution.l1;
      
      if (!currentCategory) {
        throw error(500, 'Failed to determine current category');
      }
      
      subcategoriesPromise = getSubcategoriesWithCounts(services, currentCategory.id, currentCountry);
      level3CategoriesPromise = resolution.level < 3 ? getLevel3CategoriesForPills(services, supabase, currentCategory, currentCountry, resolution.level) : Promise.resolve([]);
    }

    const [
      productsResult,
      subcategoriesResult,
      level3CategoriesResult,
      sellersResult
    ] = await Promise.allSettled([
      // Get products using the resolved category IDs
      getProductsForCategories(supabase, resolution.categoryIds, hierarchicalFilters, sort, limit, offset),
      
      // Get subcategories (virtual or regular)
      subcategoriesPromise,
      
      // Get level 3 categories for pills (virtual or regular)
      level3CategoriesPromise,
      
      // Get sellers in this category
      getSellersInCategory(supabase, resolution.categoryIds, currentCountry)
    ]);

    // Extract results with error handling
    const products = productsResult.status === 'fulfilled' ? productsResult.value.data || [] : [];
    const total = productsResult.status === 'fulfilled' ? productsResult.value.total || 0 : 0;
    const subcategories = subcategoriesResult.status === 'fulfilled' ? subcategoriesResult.value || [] : [];
    const level3Categories = level3CategoriesResult.status === 'fulfilled' ? level3CategoriesResult.value || [] : [];
    const sellers = sellersResult.status === 'fulfilled' ? sellersResult.value || [] : [];

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Generate meta information
    const metaTitle = generateMetaTitle(resolution, i18n);
    const metaDescription = generateMetaDescription(resolution, total, i18n);
    const canonicalUrl = `https://driplo.com${resolution.canonicalPath}`;

    return {
      // Category information
      category: resolution.isVirtual ? null : (resolution.l3 || resolution.l2 || resolution.l1),
      resolution,
      breadcrumbs: breadcrumbsResult.items,
      breadcrumbsJsonLd: breadcrumbsResult.jsonLd,
      
      // Content
      subcategories,
      level3Categories,
      products,
      sellers,
      
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
    console.error('Category page load error:', err);
    
    // Re-throw redirect and error responses
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    throw error(500, 'Failed to load category');
  }
}) satisfies PageServerLoad;

/**
 * Get aggregated subcategories for virtual categories
 */
async function getVirtualCategorySubcategories(services: any, targetCategories: any[], _countryCode: string) {
  const allSubcategories: any[] = [];
  
  // Get subcategories from all target L2 categories
  for (const targetCategory of targetCategories) {
    const { data: subcategories, error } = await services.categories.getSubcategories(targetCategory.id);
    
    if (!error && subcategories?.length) {
      // Get product counts for each subcategory
      const subcategoriesWithCounts = await Promise.all(
        subcategories.map(async (subcat: any) => {
          const { count } = await services.categories.getHierarchicalProductCount(subcat.id);
          return {
            ...subcat,
            productCount: count,
            parentCategory: targetCategory.name // Add parent info for better organization
          };
        })
      );
      
      allSubcategories.push(...subcategoriesWithCounts);
    }
  }

  // Filter, deduplicate by name, and sort by product count
  const uniqueSubcategories = allSubcategories
    .filter((cat: any) => cat.productCount > 0)
    .reduce((acc: any[], current: any) => {
      // Avoid duplicates with same name (e.g., "Sneakers" from different genders)
      const existing = acc.find(item => item.name === current.name);
      if (!existing) {
        acc.push(current);
      } else {
        // Combine product counts if duplicate names
        existing.productCount += current.productCount;
      }
      return acc;
    }, [])
    .sort((a: any, b: any) => b.productCount - a.productCount);

  return uniqueSubcategories;
}

/**
 * Get level 3 categories for virtual category pills
 */
async function getVirtualCategoryLevel3Pills(services: any, supabase: any, targetCategories: any[], countryCode: string) {
  const allLevel3Categories: any[] = [];
  
  // Get L3 categories from all target L2 categories
  for (const targetCategory of targetCategories) {
    const { data: level3Data } = await services.categories.getSubcategories(targetCategory.id);
    if (level3Data?.length) {
      allLevel3Categories.push(...level3Data);
    }
  }

  // Get product counts using hierarchical count (includes all descendant products)
  if (allLevel3Categories.length > 0) {
    const categoriesWithCounts = await Promise.all(
      allLevel3Categories.map(async (l3cat: any) => {
        // Use hierarchical count for more accurate product counts
        const { count } = await services.categories.getHierarchicalProductCount(l3cat.id);
        return {
          ...l3cat,
          productCount: count || 0
        };
      })
    );

    // Deduplicate by name, combine counts, and sort
    const uniqueLevel3Categories = categoriesWithCounts
      .filter((cat: any) => cat.productCount > 0)
      .reduce((acc: any[], current: any) => {
        const existing = acc.find(item => item.name === current.name);
        if (!existing) {
          acc.push(current);
        } else {
          // Combine product counts for same category names across genders
          existing.productCount += current.productCount;
          // Keep the first slug for navigation
        }
        return acc;
      }, [])
      .sort((a: any, b: any) => b.productCount - a.productCount)
      .slice(0, 20); // Limit to 20 pills

    return uniqueLevel3Categories;
  }

  return [];
}

/**
 * Get products for multiple category IDs with hierarchical filtering
 */
async function getProductsForCategories(
  supabase: any, 
  categoryIds: string[], 
  filters: any, 
  sort: any, 
  limit: number, 
  offset: number
) {
  let query = supabase
    .from('products')
    .select(`
      id,
      title,
      description,
      price,
      brand,
      size,
      condition,
      location,
      created_at,
      seller_id,
      category_id,
      country_code,
      slug,
      product_images (
        image_url,
        display_order
      ),
      profiles!products_seller_id_fkey (
        username,
        avatar_url,
        account_type
      ),
      categories!inner (
        id,
        name,
        slug,
        parent_id,
        level
      )
    `, { count: 'exact' })
    .eq('is_sold', false)
    .eq('is_active', true)
    .eq('country_code', filters.country_code);

  // Apply category filter
  if (categoryIds.length > 0) {
    query = query.in('category_id', categoryIds);
  }

  // Apply additional filters
  if (filters.min_price) {
    query = query.gte('price', filters.min_price);
  }
  if (filters.max_price) {
    query = query.lte('price', filters.max_price);
  }
  if (filters.conditions?.length) {
    query = query.in('condition', filters.conditions);
  }
  if (filters.sizes?.length) {
    query = query.in('size', filters.sizes);
  }
  if (filters.brands?.length) {
    // Use ilike for brand filtering to handle partial matches
    const brandConditions = filters.brands.map((brand: string) => `brand.ilike.%${brand}%`).join(',');
    query = query.or(brandConditions);
  }
  
  // Apply subcategory filter for virtual categories (filter by L3 category slug)
  if (filters.subcategory_slug) {
    query = query.eq('categories.slug', filters.subcategory_slug);
  }

  // Apply sorting
  switch (sort.by) {
    case 'price-low':
      query = query.order('price', { ascending: true });
      break;
    case 'price-high':
      query = query.order('price', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Products query error:', error);
    return { data: [], total: 0 };
  }

  return { data: data || [], total: count || 0 };
}

/**
 * Get subcategories with hierarchical product counts
 */
async function getSubcategoriesWithCounts(services: any, categoryId: string, _countryCode: string) {
  const { data: subcategories, error } = await services.categories.getSubcategories(categoryId);
  
  if (error || !subcategories?.length) {
    return [];
  }

  // Get hierarchical product counts for each subcategory
  const subcategoriesWithCounts = await Promise.all(
    subcategories.map(async (subcat: any) => {
      const { count } = await services.categories.getHierarchicalProductCount(subcat.id);
      return {
        ...subcat,
        productCount: count
      };
    })
  );

  return subcategoriesWithCounts
    .filter((cat: any) => cat.productCount > 0)
    .sort((a: any, b: any) => b.productCount - a.productCount);
}

/**
 * Get level 3 categories for dynamic pills based on current category level
 */
async function getLevel3CategoriesForPills(services: any, _supabase: any, category: any, _countryCode: string, currentLevel: number) {
  let level3Categories: any[] = [];

  if (currentLevel === 2) {
    // Level 2 page: Get direct children (level 3)
    const { data: level3Data } = await services.categories.getSubcategories(category.id);
    level3Categories = level3Data || [];
  } else if (currentLevel === 1) {
    // Level 1 page: Get ALL level 3 categories under all level 2 children
    const { data: level2Categories } = await services.categories.getSubcategories(category.id);
    
    if (level2Categories?.length) {
      const level3Promises = level2Categories.map(async (l2cat: any) => {
        const { data: level3Data } = await services.categories.getSubcategories(l2cat.id);
        return level3Data || [];
      });
      
      const allLevel3Arrays = await Promise.all(level3Promises);
      level3Categories = allLevel3Arrays.flat();
    }
  }

  // Get product counts for level 3 categories
  if (level3Categories.length > 0) {
    const categoriesWithCounts = await Promise.all(
      level3Categories.map(async (l3cat: any) => {
        const { count } = await services.products.getCategoryProductCount(l3cat.id);
        return {
          ...l3cat,
          productCount: count
        };
      })
    );

    return categoriesWithCounts
      .filter((cat: any) => cat.productCount > 0)
      .sort((a: any, b: any) => b.productCount - a.productCount)
      .slice(0, 20); // Limit to 20 pills
  }

  return [];
}

/**
 * Get sellers who have products in these categories (hierarchical)
 */
async function getSellersInCategory(supabase: any, categoryIds: string[], countryCode: string) {
  try {
    if (categoryIds.length === 0) {
      return [];
    }

    // Get sellers for products in these categories
    const { data: categorySellers, error: sellersError } = await supabase
      .from('products')
      .select(`
        seller_id,
        seller:profiles!seller_id (
          id,
          username,
          avatar_url,
          created_at
        )
      `)
      .in('category_id', categoryIds)
      .eq('is_active', true)
      .eq('is_sold', false)
      .eq('country_code', countryCode)
      .not('seller_id', 'is', null);

    if (sellersError || !categorySellers) {
      return [];
    }

    // Process sellers to get unique list with item counts
    const sellersMap = new Map();
    categorySellers.forEach((item: any) => {
      if (item.seller_id && item.seller) {
        if (!sellersMap.has(item.seller_id)) {
          sellersMap.set(item.seller_id, {
            id: item.seller_id,
            username: item.seller.username || 'Unknown',
            avatar_url: item.seller.avatar_url || '/default-avatar.png',
            created_at: item.seller.created_at,
            itemCount: 0
          });
        }
        sellersMap.get(item.seller_id).itemCount++;
      }
    });

    return Array.from(sellersMap.values())
      .sort((a: any, b: any) => {
        // Prioritize new sellers (1 item) first
        if (a.itemCount === 1 && b.itemCount > 1) return -1;
        if (b.itemCount === 1 && a.itemCount > 1) return 1;
        // Then sort by most recent activity
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .slice(0, 15); // Limit to 15 sellers
  } catch (error) {
    console.error('Error getting sellers in category:', error);
    return [];
  }
}

/**
 * Generate meta title based on category resolution
 */
function generateMetaTitle(resolution: any, _i18n: any): string {
  const titles: string[] = [];
  
  // Handle virtual categories
  if (resolution.isVirtual && resolution.virtualCategory) {
    titles.push(resolution.virtualCategory.name);
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
function generateMetaDescription(resolution: any, productCount: number, _i18n: any): string {
  let description = '';
  
  // Handle virtual categories
  if (resolution.isVirtual && resolution.virtualCategory) {
    description = `Shop ${productCount} ${resolution.virtualCategory.name.toLowerCase()} from men's, women's, kids' and unisex collections`;
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