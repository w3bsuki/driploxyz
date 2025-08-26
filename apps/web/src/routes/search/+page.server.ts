import type { PageServerLoad } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

export const load: PageServerLoad = async ({ url, locals }) => {
  const country = locals.country || 'BG';
  const query = url.searchParams.get('q') || '';
  const categorySlug = url.searchParams.get('category') || '';
  const subcategorySlug = url.searchParams.get('subcategory') || '';
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
        'unisex': 'Unisex',
        'shoes': 'Shoes',
        'bags': 'Bags',
        'accessories': 'Accessories',
        'home': 'Home',
        'beauty': 'Beauty',
        'pets': 'Pets'
      };

      const categoryName = categoryMap[categorySlug] || categorySlug;
      
      // Get main category ID
      const { data: mainCat } = await locals.supabase
        .from('categories')
        .select('id, name')
        .or(`slug.eq.${categorySlug},name.ilike.${categoryName}`)
        .is('parent_id', null)
        .single();
      
      if (mainCat) {
        mainCategoryId = mainCat.id;
        
        // Get all child categories of this main category
        const { data: childCats } = await locals.supabase
          .from('categories')
          .select('id')
          .eq('parent_id', mainCategoryId);
        
        if (childCats) {
          categoryIds = [mainCategoryId, ...childCats.map(c => c.id)];
          
          // Also get grandchildren (level 3 categories)
          const { data: grandchildCats } = await locals.supabase
            .from('categories')
            .select('id')
            .in('parent_id', childCats.map(c => c.id));
          
          if (grandchildCats) {
            categoryIds = [...categoryIds, ...grandchildCats.map(c => c.id)];
          }
        } else {
          categoryIds = [mainCategoryId];
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

    // Fetch all categories with hierarchy for navigation
    const { data: allCategories } = await locals.supabase
      .from('categories')
      .select('id, name, slug, parent_id')
      .order('parent_id', { ascending: true, nullsFirst: true })
      .order('name');

    // Build category hierarchy
    const mainCategories = allCategories?.filter(c => !c.parent_id) || [];
    const categoryHierarchy: any = {};
    
    mainCategories.forEach(mainCat => {
      const subcats = allCategories?.filter(c => c.parent_id === mainCat.id) || [];
      categoryHierarchy[mainCat.slug || mainCat.name.toLowerCase()] = {
        id: mainCat.id,
        name: mainCat.name,
        slug: mainCat.slug,
        subcategories: subcats.map(subcat => {
          // Get level 3 categories
          const level3 = allCategories?.filter(c => c.parent_id === subcat.id) || [];
          return {
            id: subcat.id,
            name: subcat.name,
            slug: subcat.slug,
            children: level3
          };
        })
      };
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
      categories: mainCategories || [],
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