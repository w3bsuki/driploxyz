import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url, locals: { supabase, country } }) => {
  // Check if this is an auth callback that went to the wrong URL
  const code = url.searchParams.get('code');
  if (code) {
    const params = new URLSearchParams(url.searchParams);
    if (!params.has('next')) {
      params.set('next', '/onboarding');
    }
    throw redirect(303, `/auth/callback?${params.toString()}`);
  }
  
  // Handle missing Supabase configuration
  if (!supabase) {
    return {
      featuredProducts: [],
      categories: [],
      topSellers: [],
      errors: {
        products: 'Database not configured', 
        categories: 'Database not configured',
        sellers: 'Database not configured'
      }
    };
  }

  try {
    // Optimized parallel queries - select only needed columns to minimize egress
    const [categoriesResult, topSellersResult, featuredResult] = await Promise.allSettled([
      // Get main categories only
      supabase
        .from('categories')
        .select('id, name, slug, sort_order')
        .is('parent_id', null)
        .order('sort_order')
        .limit(6),
      
      // Get sellers who have active listings
      supabase
        .from('profiles')
        .select(`
          id, 
          username, 
          avatar_url, 
          rating, 
          sales_count,
          products!products_seller_id_fkey!inner (
            id
          )
        `)
        .eq('products.is_active', true)
        .eq('products.is_sold', false)
        .order('sales_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(8),
      
      // Get featured products with images and categories
      supabase
        .from('products')
        .select(`
          id,
          title,
          price,
          condition,
          size,
          location,
          created_at,
          seller_id,
          country_code,
          product_images!inner (
            image_url
          ),
          categories (
            id,
            name,
            parent_id
          ),
          profiles!products_seller_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('is_active', true)
        .eq('is_sold', false)
        .order('created_at', { ascending: false })
        .limit(12)
    ]);

    // Process results
    const categories = categoriesResult.status === 'fulfilled' ? (categoriesResult.value.data || []) : [];
    const topSellers = topSellersResult.status === 'fulfilled' ? (topSellersResult.value.data || []) : [];
    
    let featuredProducts = [];
    if (featuredResult.status === 'fulfilled') {
      const { data: rawProducts } = featuredResult.value;
      if (rawProducts) {
        // Get unique parent category IDs
        const parentIds = [...new Set(
          rawProducts
            .map(item => item.categories?.parent_id)
            .filter(Boolean)
        )];

        // Fetch parent categories if needed
        let parentCategories: Record<string, string> = {};
        if (parentIds.length > 0) {
          const { data: parents } = await supabase
            .from('categories')
            .select('id, name')
            .in('id', parentIds);
          
          if (parents) {
            parentCategories = Object.fromEntries(
              parents.map(p => [p.id, p.name])
            );
          }
        }

        // Transform products for frontend
        featuredProducts = rawProducts.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          condition: item.condition,
          size: item.size,
          location: item.location,
          created_at: item.created_at,
          seller_id: item.seller_id,
          // Simplify image structure
          images: item.product_images?.map((img: any) => img.image_url) || [],
          product_images: item.product_images?.map((img: any) => img.image_url) || [],
          // Category info
          category_name: parentCategories[item.categories?.parent_id] || item.categories?.name || 'Other',
          subcategory_name: item.categories?.parent_id ? item.categories.name : null,
          // Seller info
          seller_name: item.profiles?.username,
          seller_avatar: item.profiles?.avatar_url
        }));
      }
    }

    return {
      featuredProducts,
      categories,
      topSellers,
      country: country || 'BG', // Pass country to frontend
      errors: {
        products: featuredResult.status === 'rejected' ? 'Failed to load' : null,
        categories: categoriesResult.status === 'rejected' ? 'Failed to load' : null,
        sellers: topSellersResult.status === 'rejected' ? 'Failed to load' : null
      }
    };
    
  } catch (error) {
    console.error('Error loading homepage data:', error);
    return {
      featuredProducts: [],
      categories: [],
      topSellers: [],
      errors: {
        products: 'Failed to load products',
        categories: 'Failed to load categories',
        sellers: 'Failed to load sellers'
      }
    };
  }
};