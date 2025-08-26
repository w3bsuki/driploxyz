import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  const query = url.searchParams.get('q') || '';
  const limit = parseInt(url.searchParams.get('limit') || '5');
  
  if (!query.trim()) {
    return json({ products: [] });
  }

  try {
    const { data: products, error } = await locals.supabase
      .from('products')
      .select(`
        id,
        title,
        price,
        product_images (
          image_url
        )
      `)
      .eq('is_sold', false)
      .eq('is_active', true)
      .ilike('title', `%${query}%`)
      .limit(limit);

    if (error) throw error;

    const transformedProducts = (products || []).map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      image: p.product_images?.[0]?.image_url || null
    }));

    return json({ products: transformedProducts });
  } catch (error) {
    console.error('Search API error:', error);
    return json({ products: [], error: 'Search failed' }, { status: 500 });
  }
};