import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createServices } from '$lib/services';

export const load: PageServerLoad = async ({ params, url, locals: { supabase } }) => {
  const { slug } = params;
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
    const subcategories = subcategoriesResult.status === 'fulfilled' ? subcategoriesResult.value.data || [] : [];

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
      console.error('Error loading category products:', productsError);
    }

    // Calculate pagination
    const totalPages = Math.ceil((total || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      category,
      breadcrumb,
      subcategories,
      products: products || [],
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
    console.error('Error loading category page:', err);
    throw error(500, 'Failed to load category');
  }
};