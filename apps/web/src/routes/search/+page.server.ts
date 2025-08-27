import type { PageServerLoad } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

/**
 * Get all descendant category IDs using a recursive CTE
 * This replaces multiple database queries with a single efficient query
 */
async function getCategoryDescendants(
  supabase: SupabaseClient<Database>,
  rootCategoryId: string
): Promise<string[]> {
  try {
    const { data, error } = await supabase.rpc('get_category_descendants', {
      root_category_id: rootCategoryId
    });
    
    if (error) {
      console.error('Error getting category descendants, using fallback:', error);
      return await getCategoryDescendantsFallback(supabase, rootCategoryId);
    }
    
    return data?.map((row: { id: string }) => row.id) || [rootCategoryId];
  } catch (fallbackError) {
    console.error('Database function not available, using fallback approach');
    return await getCategoryDescendantsFallback(supabase, rootCategoryId);
  }
}

/**
 * Fallback approach for getting category descendants - more efficient than original
 * Uses fewer queries by batching level lookups
 */
async function getCategoryDescendantsFallback(
  supabase: SupabaseClient<Database>,
  rootCategoryId: string
): Promise<string[]> {
  const categoryIds = [rootCategoryId];
  
  // Get Level 2 children
  const { data: level2 } = await supabase
    .from('categories')
    .select('id')
    .eq('parent_id', rootCategoryId)
    .eq('is_active', true);
  
  if (level2 && level2.length > 0) {
    const level2Ids = level2.map(c => c.id);
    categoryIds.push(...level2Ids);
    
    // Get Level 3 children in one query
    const { data: level3 } = await supabase
      .from('categories')
      .select('id')
      .in('parent_id', level2Ids)
      .eq('is_active', true);
    
    if (level3 && level3.length > 0) {
      categoryIds.push(...level3.map(c => c.id));
    }
  }
  
  return categoryIds;
}

/**
 * Find category by slug or name with efficient single query
 */
async function findCategoryBySlugOrName(
  supabase: SupabaseClient<Database>,
  slugOrName: string,
  level?: number,
  parentId?: string
): Promise<{ id: string; name: string; slug: string } | null> {
  let query = supabase
    .from('categories')
    .select('id, name, slug')
    .or(`slug.eq.${slugOrName},name.ilike.${slugOrName}`);
  
  if (level) {
    query = query.eq('level', level);
  }
  
  if (parentId) {
    query = query.eq('parent_id', parentId);
  }
  
  const { data, error } = await query.single();
  return error ? null : data;
}

export const load: PageServerLoad = async ({ url, locals }) => {
  const country = locals.country || 'BG';
  const query = url.searchParams.get('q') || '';
  const categorySlug = url.searchParams.get('category') || '';
  const subcategorySlug = url.searchParams.get('subcategory') || '';
  const specificSlug = url.searchParams.get('specific') || '';
  
  const minPrice = url.searchParams.get('min_price');
  const maxPrice = url.searchParams.get('max_price');
  const condition = url.searchParams.get('condition');
  const brand = url.searchParams.get('brand');
  const size = url.searchParams.get('size');
  const sortBy = url.searchParams.get('sort') || 'relevance';
  const onSale = url.searchParams.get('on_sale') === 'true';
  const freeShipping = url.searchParams.get('free_shipping') === 'true';

  try {
    // Initialize category filtering - single efficient approach
    let categoryIds: string[] = [];
    let targetCategory: { id: string; name: string; slug: string } | null = null;

    if (categorySlug) {
      // Map common category slugs to their names for filtering
      const categoryMap: Record<string, string> = {
        'women': 'Women',
        'men': 'Men', 
        'kids': 'Kids',
        'unisex': 'Unisex'
      };

      const categoryName = categoryMap[categorySlug] || categorySlug;
      
      // Check if this is a special Level 2 category request (accessories, shoes, bags, clothing)
      if (['accessories', 'shoes', 'bags', 'clothing'].includes(categorySlug.toLowerCase())) {
        const categoryNameMap: Record<string, string> = {
          'accessories': 'Accessories',
          'shoes': 'Shoes',
          'bags': 'Bags', 
          'clothing': 'Clothing'
        };
        
        const targetCategoryName = categoryNameMap[categorySlug.toLowerCase()];
        
        // Get all Level 2 categories with this name efficiently
        const { data: level2Categories } = await locals.supabase
          .from('categories')
          .select('id')
          .eq('name', targetCategoryName)
          .eq('level', 2)
          .eq('is_active', true);
        
        if (level2Categories && level2Categories.length > 0) {
          const level2Ids = level2Categories.map(c => c.id);
          
          // Get all their descendants in one batch query
          const { data: level3Categories } = await locals.supabase
            .from('categories')
            .select('id')
            .in('parent_id', level2Ids)
            .eq('level', 3)
            .eq('is_active', true);
          
          // Include both Level 2 and Level 3 categories
          categoryIds = [...level2Ids];
          if (level3Categories && level3Categories.length > 0) {
            categoryIds.push(...level3Categories.map(c => c.id));
          }
        }
      } else {
        // Find the main category (Level 1) efficiently
        targetCategory = await findCategoryBySlugOrName(locals.supabase, categoryName, 1);
        
        if (targetCategory) {
          // Get all descendants of this category using recursive CTE
          categoryIds = await getCategoryDescendants(locals.supabase, targetCategory.id);
        }
      }
    }

    // Handle subcategory filtering - more efficient approach
    if (subcategorySlug && targetCategory) {
      const subcategoryMap: Record<string, string> = {
        'clothing': 'Clothing',
        'shoes': 'Shoes',
        'accessories': 'Accessories',
        'bags': 'Bags'
      };
      
      const subcategoryName = subcategoryMap[subcategorySlug] || subcategorySlug;
      
      // Find the Level 2 category under the selected Level 1
      const subcategory = await findCategoryBySlugOrName(
        locals.supabase, 
        subcategoryName, 
        2, 
        targetCategory.id
      );
      
      if (subcategory) {
        // Get all descendants of this subcategory
        categoryIds = await getCategoryDescendants(locals.supabase, subcategory.id);
      }
    }
    
    // Handle specific category filtering - efficient single query
    if (specificSlug && categoryIds.length > 0) {
      // Find the specific category from our filtered set
      const { data: specificCategory } = await locals.supabase
        .from('categories')
        .select('id, name')
        .ilike('name', `%${specificSlug}%`)
        .in('id', categoryIds)
        .eq('level', 3)
        .single();
      
      if (specificCategory) {
        categoryIds = [specificCategory.id];
      }
    }

    // Build optimized products query
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
          parent_id
        )
      `)
      .eq('is_sold', false)
      .eq('is_active', true)
      .eq('country_code', country);

    // Apply category filter efficiently - use index-friendly approach
    if (categoryIds.length > 0) {
      if (categoryIds.length === 1) {
        // Single category - most efficient
        productsQuery = productsQuery.eq('category_id', categoryIds[0]);
      } else {
        // Multiple categories - still efficient with proper index
        productsQuery = productsQuery.in('category_id', categoryIds);
      }
    }

    // Apply search if query exists
    if (query && query.trim()) {
      // Use ilike for simple text search (works immediately)
      productsQuery = productsQuery.ilike('title', `%${query}%`);
    }

    // Apply filters
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

    if (condition) {
      productsQuery = productsQuery.eq('condition', condition);
    }

    if (brand) {
      productsQuery = productsQuery.ilike('brand', `%${brand}%`);
    }

    if (size) {
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

    // Limit results
    productsQuery = productsQuery.limit(100);

    const { data: products, error: productsError } = await productsQuery;
    

    if (productsError) {
      return {
        products: [],
        categories: [],
        categoryHierarchy: {},
        searchQuery: query,
        total: 0,
        error: 'Search failed. Please try again.',
        filters: {
          category: categorySlug,
          subcategory: subcategorySlug,
          specific: specificSlug,
          minPrice,
          maxPrice,
          condition,
          brand,
          size,
          sortBy
        }
      };
    }

    // Fetch categories efficiently - use single query with proper ordering
    const { data: allCategories } = await locals.supabase
      .from('categories')
      .select('id, name, slug, parent_id, level')
      .eq('is_active', true)
      .order('level', { ascending: true })
      .order('sort_order', { ascending: true, nullsLast: true })
      .order('name');

    // Get only Level 1 categories for the main pills
    const level1Categories = allCategories?.filter(c => c.level === 1) || [];
    
    // Sort Level 1 categories: Women, Men, Kids, Unisex (in that order)
    const categoryOrder = ['Women', 'Men', 'Kids', 'Unisex'];
    const sortedLevel1 = level1Categories.sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.name);
      const bIndex = categoryOrder.indexOf(b.name);
      if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    // Build category hierarchy for the sidebar/navigation
    const categoryHierarchy: any = {};
    
    // Add Level 1 categories (Women, Men, Kids, Unisex)
    sortedLevel1.forEach(mainCat => {
      const level2cats = allCategories?.filter(c => c.parent_id === mainCat.id && c.level === 2) || [];
      categoryHierarchy[mainCat.slug || mainCat.name.toLowerCase()] = {
        id: mainCat.id,
        name: mainCat.name,
        slug: mainCat.slug,
        subcategories: level2cats.map(subcat => {
          const level3 = allCategories?.filter(c => c.parent_id === subcat.id && c.level === 3) || [];
          return {
            id: subcat.id,
            name: subcat.name,
            slug: subcat.slug,
            children: level3
          };
        })
      };
    });
    
    // Add special Level 2 categories as separate main categories (Accessories, Shoes, Bags)
    const specialLevel2Categories = ['Accessories', 'Shoes', 'Bags'];
    specialLevel2Categories.forEach(categoryName => {
      const level2cats = allCategories?.filter(c => c.name === categoryName && c.level === 2) || [];
      if (level2cats.length > 0) {
        // Combine all Level 3 subcategories from all genders
        const allLevel3 = [];
        for (const level2cat of level2cats) {
          const level3 = allCategories?.filter(c => c.parent_id === level2cat.id && c.level === 3) || [];
          allLevel3.push(...level3);
        }
        
        categoryHierarchy[categoryName.toLowerCase()] = {
          id: `level2-${categoryName.toLowerCase()}`, // Special ID for Level 2 categories
          name: categoryName,
          slug: categoryName.toLowerCase(),
          subcategories: allLevel3.map(subcat => ({
            id: subcat.id,
            name: subcat.name,
            slug: subcat.slug
          }))
        };
      }
    });

    // Create a map for quick parent lookup
    const categoryMap = new Map();
    allCategories?.forEach(cat => {
      categoryMap.set(cat.id, cat);
    });

    // Transform products data for frontend - minimal processing
    const transformedProducts = (products || []).map((product: any) => {
      // Get category from the product data
      const productCategory = product.categories || categoryMap.get(product.category_id);
      
      // Function to find level 1 category (Men/Women/Kids/Unisex)
      const findLevel1Category = (category: any): any => {
        if (!category) return null;
        if (!category.parent_id) return category; // This is level 1
        const parent = categoryMap.get(category.parent_id);
        return findLevel1Category(parent); // Recursively find level 1
      };
      
      // Get the actual level 1 category
      const level1Category = findLevel1Category(productCategory);
      let subcategory = null;
      
      if (productCategory?.parent_id) {
        subcategory = productCategory;
      }
      
      return {
        id: product.id,
        title: product.title,
        price: Number(product.price),
        images: product.product_images?.map((img: any) => img.image_url).filter(Boolean) || [],
        product_images: product.product_images,
        brand: product.brand,
        size: product.size,
        condition: product.condition,
        category: {
          name: productCategory?.name,
          slug: productCategory?.slug
        },
        // Add proper category hierarchy - ALWAYS use level 1 for main_category_name
        main_category_name: level1Category?.name,
        category_name: productCategory?.name,
        subcategory_name: subcategory?.name,
        seller: {
          username: product.profiles?.username,
          avatar_url: product.profiles?.avatar_url
        },
        sellerAccountType: product.profiles?.account_type === 'brand' ? 'brand' : 
                          product.profiles?.account_type === 'pro' || product.profiles?.account_type === 'premium' ? 'pro' :
                          'new_seller',
        created_at: product.created_at,
        location: product.location
      };
    });

    return {
      products: transformedProducts,
      categories: allCategories || [],  // Pass ALL categories so client can build full hierarchy
      categoryHierarchy,
      searchQuery: query,
      total: transformedProducts.length,
      filters: {
        category: categorySlug,
        subcategory: subcategorySlug,
        specific: specificSlug,
        minPrice,
        maxPrice,
        condition,
        brand,
        size,
        sortBy
      }
    };

  } catch (error) {
    return {
      products: [],
      categories: [],
      searchQuery: query,
      total: 0,
      error: 'Search failed. Please try again.',
      categoryHierarchy: {},
      filters: {
        category: categorySlug,
        subcategory: subcategorySlug,
        specific: specificSlug,
        minPrice,
        maxPrice,
        condition,
        brand,
        size,
        sortBy
      }
    };
  }
};