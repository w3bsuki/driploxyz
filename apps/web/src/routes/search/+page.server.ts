import type { PageServerLoad } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

export const load: PageServerLoad = async ({ url, locals }) => {
  const country = locals.country || 'BG';
  const query = url.searchParams.get('q') || '';
  const categorySlug = url.searchParams.get('category') || '';
  const subcategorySlug = url.searchParams.get('subcategory') || '';
  
  console.log('Search params:', { categorySlug, subcategorySlug, query });
  const minPrice = url.searchParams.get('min_price');
  const maxPrice = url.searchParams.get('max_price');
  const condition = url.searchParams.get('condition');
  const brand = url.searchParams.get('brand');
  const size = url.searchParams.get('size');
  const sortBy = url.searchParams.get('sort') || 'relevance';
  const onSale = url.searchParams.get('on_sale') === 'true';
  const freeShipping = url.searchParams.get('free_shipping') === 'true';

  // Show all products by default if no search criteria

  try {
    // First, get category IDs from slugs if provided
    let categoryIds: string[] = [];
    let mainCategoryId: string | null = null;
    let subcategoryId: string | null = null;

    if (categorySlug) {
      // Map common category slugs to their names for filtering
      const categoryMap: Record<string, string> = {
        'women': 'Women',
        'men': 'Men',
        'kids': 'Kids',
        'unisex': 'Unisex'
      };

      const categoryName = categoryMap[categorySlug] || categorySlug;
      
      // Check if this is a special Level 2 category request (accessories, shoes, bags)
      if (['accessories', 'shoes', 'bags'].includes(categorySlug.toLowerCase())) {
        const categoryNameMap: Record<string, string> = {
          'accessories': 'Accessories',
          'shoes': 'Shoes', 
          'bags': 'Bags'
        };
        
        const targetCategoryName = categoryNameMap[categorySlug.toLowerCase()];
        
        // Get all Level 2 categories with this name across all Level 1 parents
        const { data: level2Cats } = await locals.supabase
          .from('categories')
          .select('id')
          .eq('name', targetCategoryName)
          .eq('level', 2);
        
        if (level2Cats && level2Cats.length > 0) {
          // Get all Level 3 categories under these Level 2 categories
          const { data: level3Cats } = await locals.supabase
            .from('categories')
            .select('id')
            .in('parent_id', level2Cats.map(c => c.id))
            .eq('level', 3);
          
          if (level3Cats && level3Cats.length > 0) {
            categoryIds = level3Cats.map(c => c.id);
            console.log(`Found ${categoryIds.length} Level 3 categories for ${targetCategoryName}:`, categoryIds);
          }
        }
      } else {
        // Get main category ID (Level 1 - Men/Women/Kids/Unisex)
        const { data: mainCat } = await locals.supabase
          .from('categories')
          .select('id, name')
          .or(`slug.eq.${categorySlug},name.ilike.${categoryName}`)
          .eq('level', 1)  // Only get level 1 categories
          .single();
        
        if (mainCat) {
          mainCategoryId = mainCat.id;
          
          // Get all Level 2 categories (Clothing, Shoes, etc) under this Level 1
          const { data: level2Cats } = await locals.supabase
            .from('categories')
            .select('id')
            .eq('parent_id', mainCategoryId)
            .eq('level', 2);
          
          if (level2Cats) {
            // Get all Level 3 categories (actual product categories) under these Level 2
            const { data: level3Cats } = await locals.supabase
              .from('categories')
              .select('id')
              .in('parent_id', level2Cats.map(c => c.id))
              .eq('level', 3);
            
            if (level3Cats) {
              // Only include Level 3 category IDs for filtering products
              categoryIds = level3Cats.map(c => c.id);
            }
          }
        }
      }
    }

    if (subcategorySlug && mainCategoryId) {
      // Get specific subcategory within the main category
      const { data: subCat } = await locals.supabase
        .from('categories')
        .select('id')
        .ilike('name', `%${subcategorySlug}%`)
        .in('parent_id', categoryIds.length > 0 ? categoryIds : [mainCategoryId])
        .single();
      
      if (subCat) {
        subcategoryId = subCat.id;
        // For subcategory, only show products in that specific subcategory
        categoryIds = [subCat.id];
      }
    }

    // Build the products query with search
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

    // Apply category filter if we have category IDs
    if (categoryIds.length > 0) {
      productsQuery = productsQuery.in('category_id', categoryIds);
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
      console.error('Search error:', productsError);
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
          minPrice,
          maxPrice,
          condition,
          brand,
          size,
          sortBy
        }
      };
    }

    // Fetch all categories with hierarchy for navigation - ONLY Level 1 categories for pills
    const { data: allCategories } = await locals.supabase
      .from('categories')
      .select('id, name, slug, parent_id, level')
      .order('level', { ascending: true })
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
      categories: sortedLevel1 || [],
      categoryHierarchy,
      searchQuery: query,
      total: transformedProducts.length,
      filters: {
        category: categorySlug,
        subcategory: subcategorySlug,
        minPrice,
        maxPrice,
        condition,
        brand,
        size,
        sortBy
      }
    };

  } catch (error) {
    console.error('Search error:', error);
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