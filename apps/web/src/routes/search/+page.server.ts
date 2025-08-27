import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { buildCategoryHierarchy } from '$lib/categories/mapping';

/**
 * Get category and all its descendants using recursive CTE
 * This is much more efficient than building arrays manually
 */
async function getCategoryWithDescendants(supabase: any, categoryId: string) {
  const { data, error } = await supabase
    .rpc('get_category_descendants', { root_category_id: categoryId });
  
  if (error || !data) return [];
  return data.map((d: any) => d.id);
}

/**
 * Get categories by name across all genders (Level 2)
 */
async function getCategoriesAcrossGenders(supabase: any, categoryName: string) {
  const { data, error } = await supabase
    .rpc('get_products_by_category_name_across_genders', { category_name: categoryName });
  
  if (error || !data) return [];
  return data.map((d: any) => d.category_id);
}

export const load: PageServerLoad = async ({ url, locals }) => {
  const country = locals.country || 'BG';
  
  // Parse all URL parameters
  const query = url.searchParams.get('q') || '';
  
  // Category hierarchy parameters
  // Level 1: Gender (women/men/kids/unisex)
  const level1 = url.searchParams.get('category') || url.searchParams.get('level1') || '';
  // Level 2: Type (clothing/shoes/bags/accessories)
  const level2 = url.searchParams.get('subcategory') || url.searchParams.get('level2') || '';
  // Level 3: Specific item (t-shirts/dresses/sneakers/etc)
  const level3 = url.searchParams.get('specific') || url.searchParams.get('level3') || '';
  
  // Other filters
  const minPrice = url.searchParams.get('min_price');
  const maxPrice = url.searchParams.get('max_price');
  const condition = url.searchParams.get('condition');
  const brand = url.searchParams.get('brand');
  const size = url.searchParams.get('size');
  const sortBy = url.searchParams.get('sort') || 'relevance';

  try {
    let categoryIds: string[] = [];
    
    // Build category filter using database functions
    if (level1 && level1 !== 'all') {
      // Find Level 1 category
      const { data: l1Cat } = await locals.supabase
        .from('categories')
        .select('id, name, slug')
        .eq('slug', level1)
        .eq('level', 1)
        .eq('is_active', true)
        .single();
      
      if (l1Cat) {
        if (level2 && level2 !== 'all') {
          // Normalize Level 2 name
          const level2Name = level2.charAt(0).toUpperCase() + level2.slice(1).toLowerCase();
          
          // Find Level 2 under Level 1
          const { data: l2Cat } = await locals.supabase
            .from('categories')
            .select('id, name, slug')
            .eq('name', level2Name)
            .eq('parent_id', l1Cat.id)
            .eq('level', 2)
            .eq('is_active', true)
            .single();
          
          if (l2Cat) {
            if (level3 && level3 !== 'all') {
              // Find specific Level 3 categories
              const searchTerm = level3.replace(/-/g, ' ');
              const { data: l3Cats } = await locals.supabase
                .from('categories')
                .select('id')
                .ilike('name', `%${searchTerm}%`)
                .eq('parent_id', l2Cat.id)
                .eq('level', 3)
                .eq('is_active', true);
              
              if (l3Cats && l3Cats.length > 0) {
                categoryIds = l3Cats.map(c => c.id);
              } else {
                // No Level 3 match, use Level 2 and all children
                categoryIds = await getCategoryWithDescendants(locals.supabase, l2Cat.id);
              }
            } else {
              // Get Level 2 and all its descendants
              categoryIds = await getCategoryWithDescendants(locals.supabase, l2Cat.id);
            }
          } else {
            // Level 2 not found, use all of Level 1
            categoryIds = await getCategoryWithDescendants(locals.supabase, l1Cat.id);
          }
        } else {
          // No Level 2 specified, get all descendants of Level 1
          categoryIds = await getCategoryWithDescendants(locals.supabase, l1Cat.id);
        }
      }
    } else if (level2 && level2 !== 'all') {
      // Cross-gender Level 2 search (e.g., all "Clothing" across all genders)
      const level2Name = level2.charAt(0).toUpperCase() + level2.slice(1).toLowerCase();
      categoryIds = await getCategoriesAcrossGenders(locals.supabase, level2Name);
      
      // If Level 3 is specified, filter further
      if (level3 && level3 !== 'all' && categoryIds.length > 0) {
        const searchTerm = level3.replace(/-/g, ' ');
        const { data: l3Cats } = await locals.supabase
          .from('categories')
          .select('id')
          .ilike('name', `%${searchTerm}%`)
          .in('id', categoryIds)
          .eq('level', 3)
          .eq('is_active', true);
        
        if (l3Cats && l3Cats.length > 0) {
          categoryIds = l3Cats.map(c => c.id);
        }
      }
    } else if (level3 && level3 !== 'all') {
      // Direct Level 3 search across all categories
      const searchTerm = level3.replace(/-/g, ' ');
      const { data: l3Cats } = await locals.supabase
        .from('categories')
        .select('id')
        .ilike('name', `%${searchTerm}%`)
        .eq('level', 3)
        .eq('is_active', true);
      
      if (l3Cats && l3Cats.length > 0) {
        categoryIds = l3Cats.map(c => c.id);
      }
    }

    // Build the products query
    let productsQuery = locals.supabase
      .from('products')
      .select(`
        id,
        title,
        price,
        brand,
        size,
        condition,
        location,
        created_at,
        seller_id,
        category_id,
        country_code,
        product_images (
          image_url
        ),
        profiles!products_seller_id_fkey (
          username,
          avatar_url,
          account_type
        ),
        categories (
          id,
          name,
          slug,
          parent_id,
          level
        )
      `)
      .eq('is_sold', false)
      .eq('is_active', true)
      .eq('country_code', country);

    // Apply category filter
    if (categoryIds.length > 0) {
      productsQuery = productsQuery.in('category_id', categoryIds);
    }

    // Apply search query
    if (query && query.trim()) {
      productsQuery = productsQuery.ilike('title', `%${query}%`);
    }

    // Apply price filters
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        productsQuery = productsQuery.gte('price', min);
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        productsQuery = productsQuery.lte('price', max);
      }
    }

    // Apply other filters
    if (condition && condition !== 'all') {
      productsQuery = productsQuery.eq('condition', condition);
    }

    if (brand && brand !== 'all') {
      productsQuery = productsQuery.ilike('brand', `%${brand}%`);
    }

    if (size && size !== 'all') {
      productsQuery = productsQuery.eq('size', size);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        productsQuery = productsQuery.order('price', { ascending: true });
        break;
      case 'price-high':
        productsQuery = productsQuery.order('price', { ascending: false });
        break;
      case 'newest':
      default:
        productsQuery = productsQuery.order('created_at', { ascending: false });
        break;
    }

    // Execute query with limit
    productsQuery = productsQuery.limit(100);
    const { data: products, error: productsError } = await productsQuery;

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
          category: level1,
          subcategory: level2,
          specific: level3,
          minPrice,
          maxPrice,
          condition,
          brand,
          size,
          sortBy
        }
      };
    }

    // Fetch all categories for filters
    const { data: allCategories } = await locals.supabase
      .from('categories')
      .select('id, name, slug, parent_id, level')
      .eq('is_active', true)
      .order('level')
      .order('sort_order');

    // Build hierarchy for UI
    const categoryHierarchy = allCategories ? buildCategoryHierarchy(allCategories) : {};

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

    // Transform products for UI
    const transformedProducts = products?.map(product => ({
      ...product,
      images: product.product_images?.map((img: any) => img.image_url) || [],
      seller: product.profiles ? {
        id: product.seller_id,
        username: product.profiles.username,
        avatar_url: product.profiles.avatar_url,
        account_type: product.profiles.account_type
      } : null,
      category: product.categories || null
    })) || [];

    return {
      products: transformedProducts,
      categories: sortedCategories,
      categoryHierarchy,
      searchQuery: query,
      total: transformedProducts.length,
      filters: {
        category: level1,
        subcategory: level2,
        specific: level3,
        minPrice,
        maxPrice,
        condition,
        brand,
        size,
        sortBy
      }
    };

  } catch (err) {
    if (dev) console.error('Search error:', err);
    throw error(500, 'Failed to load search results');
  }
};