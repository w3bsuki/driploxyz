import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url, locals: { supabase } }) => {
  const { sellerId } = params;
  const available = url.searchParams.get('available') === 'true';
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  try {
    // Build query
    let query = supabase
      .from('products')
      .select(`
        id,
        title,
        description,
        price,
        seller_id,
        category_id,
        brand_id,
        size,
        condition,
        is_sold,
        created_at,
        product_images (
          id,
          image_url,
          display_order
        ),
        categories (
          id,
          name
        ),
        brands (
          id,
          name
        )
      `)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter for available products only if requested
    if (available) {
      query = query.eq('is_sold', false);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('Error fetching seller products:', error);
      return json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    // Transform the data to match frontend expectations
    const transformedProducts = products?.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      seller_id: product.seller_id,
      category: product.categories?.name,
      brand: product.brands?.name,
      size: product.size,
      condition: product.condition,
      is_sold: product.is_sold,
      created_at: product.created_at,
      images: product.product_images
        ?.sort((a, b) => a.display_order - b.display_order)
        ?.map(img => img.image_url) || []
    })) || [];

    return json({
      products: transformedProducts,
      hasMore: products?.length === limit
    });

  } catch (error) {
    console.error('Error in seller products API:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};