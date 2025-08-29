import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { Database } from '@repo/database';

type Category = Database['public']['Tables']['categories']['Row'];

/**
 * Get category and all its descendants using direct SQL (more reliable than the buggy RPC function)
 */
async function getCategoryWithDescendants(supabase: any, categoryId: string): Promise<string[]> {
  // Get direct descendants (children and grandchildren)
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .or(`parent_id.eq.${categoryId},id.eq.${categoryId}`)
    .eq('is_active', true);
    
  if (error) {
    console.error('Error getting category descendants:', error);
    return [categoryId]; // Include at least the parent category
  }
  
  const level1Ids = data?.map((d: { id: string }) => d.id) || [categoryId];
  
  // Get grandchildren (level 3) if any level 2 categories were found
  const { data: grandchildren } = await supabase
    .from('categories')
    .select('id')
    .in('parent_id', level1Ids)
    .eq('is_active', true);
    
  const grandchildrenIds = grandchildren?.map((d: { id: string }) => d.id) || [];
  
  return [...level1Ids, ...grandchildrenIds];
}


/**
 * Build a proper 3-level hierarchy from flat category list
 */
function buildCategoryHierarchy(categories: Category[]) {
  const hierarchy: Record<string, any> = {};
  
  // Get Level 1 categories (Gender)
  const level1Cats = categories.filter(c => c.level === 1 && c.is_active);
  
  level1Cats.forEach(l1 => {
    // Get Level 2 categories (Product Types) under this Level 1
    const level2Cats = categories.filter(c => 
      c.level === 2 && 
      c.parent_id === l1.id && 
      c.is_active
    );
    
    hierarchy[l1.slug] = {
      id: l1.id,
      name: l1.name,
      slug: l1.slug,
      level2: {}
    };
    
    level2Cats.forEach(l2 => {
      // Get Level 3 categories (Specific Items) under this Level 2
      const level3Cats = categories.filter(c => 
        c.level === 3 && 
        c.parent_id === l2.id && 
        c.is_active
      );
      
      hierarchy[l1.slug].level2[l2.slug] = {
        id: l2.id,
        name: l2.name,
        slug: l2.slug,
        parentId: l2.parent_id,
        level3: level3Cats.map(l3 => ({
          id: l3.id,
          name: l3.name,
          slug: l3.slug,
          parentId: l3.parent_id
        }))
      };
    });
  });
  
  return hierarchy;
}

export const load: PageServerLoad = async ({ url, locals, setHeaders }) => {
  const country = locals.country || 'BG';
  
  // Set cache headers for better performance
  setHeaders({
    'cache-control': 'public, max-age=60, s-maxage=120' // Cache for 1 min client, 2 min CDN
  });
  
  // Parse all URL parameters
  const query = url.searchParams.get('q') || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = 50; // Reasonable page size
  
  // Category hierarchy parameters - support both old and new param names
  // Level 1: Gender (women/men/kids/unisex)
  const level1 = url.searchParams.get('category') || url.searchParams.get('level1') || '';
  // Level 2: Product Type (clothing/shoes/bags/accessories)
  const level2 = url.searchParams.get('subcategory') || url.searchParams.get('level2') || '';
  // Level 3: Specific Item (t-shirts/dresses/sneakers/etc)
  const level3 = url.searchParams.get('specific') || url.searchParams.get('level3') || '';
  
  // Other filters
  const minPrice = url.searchParams.get('min_price');
  const maxPrice = url.searchParams.get('max_price');
  const condition = url.searchParams.get('condition');
  const brand = url.searchParams.get('brand');
  const size = url.searchParams.get('size');
  const sortBy = url.searchParams.get('sort') || 'relevance';

  try {
    // Fetch all categories first for hierarchy resolution
    const { data: allCategories } = await locals.supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('level')
      .order('sort_order');

    let categoryIds: string[] = [];
    
    // Build category filter using proper 3-level hierarchy with bulletproof error handling
    if (level1 && level1 !== 'all') {
      // First try to find Level 1 category by slug
      const { data: l1Cat, error: l1Error } = await locals.supabase
        .from('categories')
        .select('*')
        .eq('slug', level1)
        .eq('level', 1)
        .eq('is_active', true)
        .single();
      
      // If not found as Level 1, check if it's a Level 2 category name (like 'accessories')
      if (!l1Cat && !l1Error && (level1 === 'accessories' || level1 === 'clothing' || level1 === 'shoes' || level1 === 'bags')) {
        // Cross-gender Level 2 search - capitalize first letter to match database
        const capitalizedLevel1 = level1.charAt(0).toUpperCase() + level1.slice(1);
        const { data: l2Cats } = await locals.supabase
          .from('categories')
          .select('id')
          .eq('name', capitalizedLevel1)
          .eq('level', 2)
          .eq('is_active', true);
        
        if (l2Cats && l2Cats.length > 0) {
          // Get all descendants of all matching Level 2 categories
          const allCatIds: string[] = [];
          for (const cat of l2Cats) {
            const descendants = await getCategoryWithDescendants(locals.supabase, cat.id);
            allCatIds.push(...descendants);
          }
          categoryIds = [...new Set(allCatIds)]; // Remove duplicates
        }
      }
      
      else if (l1Cat) {
        if (level2 && level2 !== 'all') {
          // Find Level 2 under Level 1 by slug pattern
          const level2Slug = `${level1}-${level2}`;
          const { data: l2Cat } = await locals.supabase
            .from('categories')
            .select('*')
            .or(`slug.eq.${level2Slug},slug.eq.${level1}-${level2}-new`)
            .eq('parent_id', l1Cat.id)
            .eq('level', 2)
            .eq('is_active', true)
            .single();
          
          if (l2Cat) {
            if (level3 && level3 !== 'all') {
              // Find specific Level 3 category by slug
              const level3Slug = `${level1}-${level3}`;
              const { data: l3Cats } = await locals.supabase
                .from('categories')
                .select('id')
                .or(`slug.ilike.%${level3}%,name.ilike.%${level3.replace(/-/g, ' ')}%,name.eq.${level3.replace(/-/g, ' ').charAt(0).toUpperCase() + level3.replace(/-/g, ' ').slice(1)}`)
                .eq('parent_id', l2Cat.id)
                .eq('level', 3)
                .eq('is_active', true);
              
              if (l3Cats && l3Cats.length > 0) {
                categoryIds = l3Cats.map(c => c.id);
              } else {
                // No Level 3 match, use all children of Level 2
                categoryIds = await getCategoryWithDescendants(locals.supabase, l2Cat.id);
              }
            } else {
              // Get Level 2 and all its descendants
              categoryIds = await getCategoryWithDescendants(locals.supabase, l2Cat.id);
            }
          } else {
            // Level 2 not found, try direct match by name under Level 1
            const capitalizedLevel2Name = level2.replace(/-/g, ' ').charAt(0).toUpperCase() + level2.replace(/-/g, ' ').slice(1);
            const { data: l2CatByName } = await locals.supabase
              .from('categories')
              .select('*')
              .eq('name', capitalizedLevel2Name)
              .eq('parent_id', l1Cat.id)
              .eq('level', 2)
              .eq('is_active', true)
              .single();
              
            if (l2CatByName) {
              categoryIds = await getCategoryWithDescendants(locals.supabase, l2CatByName.id);
            } else {
              // Still no match, use all of Level 1
              categoryIds = await getCategoryWithDescendants(locals.supabase, l1Cat.id);
            }
          }
        } else {
          // No Level 2 specified, get all descendants of Level 1
          categoryIds = await getCategoryWithDescendants(locals.supabase, l1Cat.id);
        }
      }
    } else if (level2 && level2 !== 'all') {
      // Cross-gender Level 2 search (e.g., all "Clothing" across all genders)
      const capitalizedLevel2 = level2.replace(/-/g, ' ').charAt(0).toUpperCase() + level2.replace(/-/g, ' ').slice(1);
      const { data: l2Cats } = await locals.supabase
        .from('categories')
        .select('id')
        .eq('name', capitalizedLevel2)
        .eq('level', 2)
        .eq('is_active', true);
      
      if (l2Cats && l2Cats.length > 0) {
        // Get all descendants of all matching Level 2 categories
        const allCatIds: string[] = [];
        for (const cat of l2Cats) {
          const descendants = await getCategoryWithDescendants(locals.supabase, cat.id);
          allCatIds.push(...descendants);
        }
        categoryIds = [...new Set(allCatIds)]; // Remove duplicates
        
        // If Level 3 is specified, filter further
        if (level3 && level3 !== 'all') {
          const { data: l3Cats } = await locals.supabase
            .from('categories')
            .select('id')
            .or(`name.ilike.%${level3.replace(/-/g, ' ')}%,name.eq.${level3.replace(/-/g, ' ').charAt(0).toUpperCase() + level3.replace(/-/g, ' ').slice(1)}`)
            .in('parent_id', l2Cats.map(c => c.id))
            .eq('level', 3)
            .eq('is_active', true);
          
          if (l3Cats && l3Cats.length > 0) {
            categoryIds = l3Cats.map(c => c.id);
          }
        }
      }
    } else if (level3 && level3 !== 'all') {
      // Direct Level 3 search across all categories
      const { data: l3Cats } = await locals.supabase
        .from('categories')
        .select('id')
        .or(`name.ilike.%${level3.replace(/-/g, ' ')}%,name.eq.${level3.replace(/-/g, ' ').charAt(0).toUpperCase() + level3.replace(/-/g, ' ').slice(1)}`)
        .eq('level', 3)
        .eq('is_active', true);
      
      if (l3Cats && l3Cats.length > 0) {
        categoryIds = l3Cats.map(c => c.id);
      }
    }

    // Build the products query with proper category hierarchy
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
        categories!inner (
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
      const validConditions = ['brand_new_with_tags', 'new_without_tags', 'like_new', 'good', 'worn', 'fair'] as const;
      if (validConditions.includes(condition as any)) {
        productsQuery = productsQuery.eq('condition', condition as typeof validConditions[number]);
      }
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

    // Execute query with pagination
    const offset = (page - 1) * pageSize;
    productsQuery = productsQuery
      .range(offset, offset + pageSize - 1);
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

    // Build proper 3-level hierarchy for UI
    const categoryHierarchy = allCategories ? buildCategoryHierarchy(allCategories as Category[]) : {};

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

    // Transform products for UI with category hierarchy from joined data
    const transformedProducts = (products || []).map(product => {
      // Use the direct category information from the join and traverse up to find main category
      let mainCategoryName = '';
      let subcategoryName = '';
      let specificCategoryName = '';
      
      if (product.categories) {
        if (product.categories.level === 1) {
          mainCategoryName = product.categories.name;
        } else if (product.categories.level === 2) {
          subcategoryName = product.categories.name;
          // Find the parent (Level 1) category
          const parentCat = allCategories?.find(cat => cat.id === product.categories.parent_id);
          if (parentCat) {
            mainCategoryName = parentCat.name;
          }
        } else if (product.categories.level === 3) {
          specificCategoryName = product.categories.name;
          // Find the parent (Level 2) and grandparent (Level 1) categories
          const parentCat = allCategories?.find(cat => cat.id === product.categories.parent_id);
          if (parentCat) {
            subcategoryName = parentCat.name;
            const grandparentCat = allCategories?.find(cat => cat.id === parentCat.parent_id);
            if (grandparentCat) {
              mainCategoryName = grandparentCat.name;
            }
          }
        }
      }

      return {
        ...product,
        images: product.product_images?.map((img: any) => img.image_url) || [],
        seller: product.profiles ? {
          id: product.seller_id,
          username: product.profiles.username,
          avatar_url: product.profiles.avatar_url,
          account_type: product.profiles.account_type
        } : null,
        category: product.categories || null,
        // Add the level 1 category info for product cards
        main_category_name: mainCategoryName || null,
        category_name: mainCategoryName || null, // For backward compatibility
        subcategory_name: subcategoryName || null,
        specific_category_name: specificCategoryName || null
      };
    });

    return {
      products: transformedProducts,
      categories: sortedCategories,
      categoryHierarchy,
      searchQuery: query,
      total: transformedProducts.length,
      hasMore: transformedProducts.length === pageSize, // Simple check for more results
      currentPage: page,
      pageSize,
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