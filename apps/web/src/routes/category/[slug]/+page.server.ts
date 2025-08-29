import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createServices } from '$lib/services';

export const load: PageServerLoad = async ({ params, url, locals: { supabase, country } }) => {
  const { slug } = params;
  const currentCountry = country || 'BG';
  const services = createServices(supabase, null); // No stripe needed for category viewing

  try {
    // Get category by slug first (required for other queries)
    const { data: category, error: categoryError } = await services.categories.getCategoryBySlug(slug);
    
    if (categoryError || !category) {
      throw error(404, 'Category not found');
    }

    // Parallel fetch breadcrumb and subcategories for performance
    const [breadcrumbResult, subcategoriesResult] = await Promise.allSettled([
      services.categories.getCategoryBreadcrumb(category.id),
      services.categories.getSubcategories(category.id)
    ]);
    
    const breadcrumb = breadcrumbResult.status === 'fulfilled' ? breadcrumbResult.value.data || [] : [];
    const directSubcategories = subcategoriesResult.status === 'fulfilled' ? subcategoriesResult.value.data || [] : [];
    
    // Get subcategories with product counts for quick pills
    let subcategoriesWithCounts: any[] = [];
    
    if (directSubcategories.length > 0) {
      // For each subcategory, get product count
      const subcategoryPromises = directSubcategories.map(async (subcat) => {
        // Get all descendant category IDs for this subcategory
        const { data: descendants } = await supabase
          .from('categories')
          .select('id')
          .or(`id.eq.${subcat.id},parent_id.eq.${subcat.id}`);
        
        const categoryIds = descendants?.map(d => d.id) || [subcat.id];
        
        // Count products in this subcategory and its children
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .in('category_id', categoryIds)
          .eq('is_active', true)
          .eq('is_sold', false)
          .eq('country_code', currentCountry);
        
        return {
          ...subcat,
          productCount: count || 0
        };
      });
      
      subcategoriesWithCounts = await Promise.all(subcategoryPromises);
      
      // Sort by product count (most products first)
      subcategoriesWithCounts.sort((a, b) => b.productCount - a.productCount);
    }

    // Get level 3 categories for dynamic pills (works for both level 1 and level 2 pages)
    let level3Categories: any[] = [];
    
    if (category.level === 2) {
      // Level 2 page: Get direct children (level 3)
      const { data: level3Data } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id')
        .eq('parent_id', category.id)
        .order('sort_order');
      
      if (level3Data && level3Data.length > 0) {
        // Get product counts for level 3 categories
        const level3Promises = level3Data.map(async (l3cat) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', l3cat.id)
            .eq('is_active', true)
            .eq('is_sold', false)
            .eq('country_code', currentCountry);
          
          return {
            ...l3cat,
            productCount: count || 0
          };
        });
        
        level3Categories = await Promise.all(level3Promises);
        level3Categories = level3Categories
          .filter(cat => cat.productCount > 0)
          .sort((a, b) => b.productCount - a.productCount);
      }
    } else if (category.level === 1 && directSubcategories.length > 0) {
      // Level 1 page: Get ALL level 3 categories under ALL level 2 children
      const level2Ids = directSubcategories.map(sub => sub.id);
      
      const { data: allLevel3Data } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id')
        .in('parent_id', level2Ids)
        .order('sort_order');
      
      if (allLevel3Data && allLevel3Data.length > 0) {
        // Get product counts for all level 3 categories
        const level3Promises = allLevel3Data.map(async (l3cat) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', l3cat.id)
            .eq('is_active', true)
            .eq('is_sold', false)
            .eq('country_code', currentCountry);
          
          return {
            ...l3cat,
            productCount: count || 0
          };
        });
        
        level3Categories = await Promise.all(level3Promises);
        level3Categories = level3Categories
          .filter(cat => cat.productCount > 0)
          .sort((a, b) => b.productCount - a.productCount);
      }
    }

    // Parse query parameters for filtering
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 24;
    const offset = (page - 1) * limit;

    // Get all descendant category IDs (including sub-subcategories)
    const { data: allDescendants } = await supabase
      .from('categories')
      .select('id, parent_id')
      .or(`id.eq.${category.id},parent_id.eq.${category.id}`);
    
    // Also get grandchildren categories (e.g., women-tshirts under women-clothing)
    const childIds = allDescendants?.filter(c => c.parent_id === category.id).map(c => c.id) || [];
    let grandchildIds: string[] = [];
    
    if (childIds.length > 0) {
      const { data: grandchildren } = await supabase
        .from('categories')
        .select('id')
        .in('parent_id', childIds);
      grandchildIds = grandchildren?.map(c => c.id) || [];
    }
    
    const categoryIds = [
      category.id,
      ...(allDescendants?.map(c => c.id) || []),
      ...grandchildIds
    ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
    
    // Build filters from query parameters
    const filters: any = {
      category_ids: categoryIds
    };

    if (searchParams.get('min_price')) {
      filters.min_price = parseFloat(searchParams.get('min_price')!);
    }
    if (searchParams.get('max_price')) {
      filters.max_price = parseFloat(searchParams.get('max_price')!);
    }
    if (searchParams.get('condition')) {
      filters.conditions = searchParams.getAll('condition');
    }
    if (searchParams.get('size')) {
      filters.sizes = searchParams.getAll('size');
    }
    if (searchParams.get('brand')) {
      filters.brands = searchParams.getAll('brand');
    }

    // Get sort options
    const sortBy = (searchParams.get('sort') || 'created_at') as any;
    const sortDirection = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

    // Get products in this category
    const { data: products, error: productsError, total } = await services.products.getProducts({
      filters,
      sort: { by: sortBy, direction: sortDirection },
      limit,
      offset
    });

    if (productsError) {
    }

    // Calculate pagination
    const totalPages = Math.ceil((total || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get ALL sellers who have products in this category (not limited by pagination)
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
      .eq('country_code', currentCountry)
      .not('seller_id', 'is', null);

    if (sellersError) {
    }

    // Process sellers to get unique list with item counts
    const sellersMap = new Map();
    if (categorySellers) {
      categorySellers.forEach(item => {
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
    }

    const sellers = Array.from(sellersMap.values())
      .sort((a, b) => {
        // Prioritize new sellers (1 item) first
        if (a.itemCount === 1 && b.itemCount > 1) return -1;
        if (b.itemCount === 1 && a.itemCount > 1) return 1;
        // Then sort by most recent activity
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });


    return {
      category,
      breadcrumb,
      subcategories: subcategoriesWithCounts,
      level3Categories,
      products: products || [],
      sellers, // Add sellers to the returned data
      pagination: {
        page,
        totalPages,
        total: total || 0,
        hasNextPage,
        hasPrevPage,
        limit
      },
      filters: {
        min_price: filters.min_price,
        max_price: filters.max_price,
        conditions: filters.conditions || [],
        sizes: filters.sizes || [],
        brands: filters.brands || [],
        sort: sortBy,
        order: sortDirection
      }
    };
  } catch (err) {
    throw error(500, 'Failed to load category');
  }
};