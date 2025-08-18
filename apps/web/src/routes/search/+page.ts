import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, url }) => {
  const { supabase } = await parent();

  const searchParams = url.searchParams;
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category');
  const minPrice = searchParams.get('min_price');
  const maxPrice = searchParams.get('max_price');
  const condition = searchParams.get('condition');
  const brand = searchParams.get('brand');
  const size = searchParams.get('size');

  // Build query for products
  let productsQuery = supabase
    .from('products')
    .select(`
      *,
      category:category_id (
        id,
        name,
        slug
      ),
      seller:seller_id (
        id,
        username,
        full_name,
        rating,
        avatar_url
      ),
      images:product_images (
        image_url,
        sort_order
      )
    `)
    .eq('is_sold', false)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Apply filters
  if (query) {
    productsQuery = productsQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`);
  }

  if (category) {
    productsQuery = productsQuery.eq('category.slug', category);
  }

  if (minPrice) {
    productsQuery = productsQuery.gte('price', parseFloat(minPrice));
  }

  if (maxPrice) {
    productsQuery = productsQuery.lte('price', parseFloat(maxPrice));
  }

  if (condition) {
    productsQuery = productsQuery.eq('condition', condition);
  }

  if (brand) {
    productsQuery = productsQuery.eq('brand', brand);
  }

  if (size) {
    productsQuery = productsQuery.eq('size', size);
  }

  const { data: products, error: productsError } = await productsQuery;

  // Fetch all categories for navigation
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (productsError) {
    console.error('Error fetching products:', productsError);
  }

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
  }

  return {
    products: products || [],
    categories: categories || [],
    searchQuery: query,
    filters: {
      category,
      minPrice,
      maxPrice,
      condition,
      brand,
      size
    }
  };
};