import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals: { safeGetSession, supabase } }) => {
  const { session, user } = await safeGetSession();
  
  if (!session || !user) {
    throw error(401, 'Unauthorized');
  }

  try {
    // Get user's sold products with simplified query
    const { data: soldProducts, error: soldError } = await supabase
      .from('products')
      .select(`
        id,
        title,
        price,
        sold_at,
        product_images (image_url)
      `)
      .eq('seller_id', user.id)
      .eq('is_sold', true)
      .order('sold_at', { ascending: false });

    // Get orders with simplified query
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        product_id,
        buyer_id,
        total_amount,
        seller_net_amount,
        commission_rate,
        created_at,
        status
      `)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (soldError) {
      // Sold items fetch error - return empty array
    }
    
    if (ordersError) {
      // Orders fetch error - return empty array
    }

    // Get product details for orders
    const productIds = orders?.map(o => o.product_id).filter(Boolean) || [];
    let orderProducts: { id: string; title: string; product_images: { image_url: string }[] }[] = [];
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select(`
          id,
          title,
          product_images (image_url)
        `)
        .in('id', productIds);
      orderProducts = products || [];
    }

    // Calculate earnings summary
    const totalEarnings = orders?.reduce((sum, order) => sum + (order.seller_net_amount || 0), 0) || 0;
    const pendingEarnings = orders?.filter(o => o.status === 'delivered')
      .reduce((sum, order) => sum + (order.seller_net_amount || 0), 0) || 0;

    return {
      soldProducts: soldProducts?.map(product => ({
        ...product,
        first_image: product.product_images?.[0]?.image_url || null
      })) || [],
      orders: orders?.map(order => {
        const product = orderProducts.find(p => p.id === order.product_id);
        return {
          ...order,
          product: product || null,
          product_image: product?.product_images?.[0]?.image_url || null
        };
      }) || [],
      payouts: [], // No payouts table yet
      earnings: {
        total: totalEarnings,
        pending: pendingEarnings,
        paid: 0, // No payouts yet
        available: totalEarnings
      }
    };

  } catch {
    throw error(500, 'Failed to load sales data');
  }
}) satisfies PageServerLoad;