import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals: { safeGetSession, supabase }, depends, setHeaders }) => {
  const { session, user } = await safeGetSession();

  if (!session || !user) {
    error(401, 'Unauthorized');
  }

  // Set cache headers for dashboard data
  setHeaders({
    'cache-control': 'private, max-age=30, stale-while-revalidate=300'
  });

  // Add dependency tracking for granular invalidation
  depends('app:user-data', 'app:orders', 'app:sales');

  try {
    // Run all queries in parallel using Promise.allSettled for graceful error handling
    const [soldProductsResult, ordersResult] = await Promise.allSettled([
      // Get user's sold products
      supabase
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
        .order('sold_at', { ascending: false }),

      // Get orders
      supabase
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
        .order('created_at', { ascending: false })
    ]);

    // Extract results with error handling
    const soldProducts = soldProductsResult.status === 'fulfilled' && !soldProductsResult.value.error
      ? soldProductsResult.value.data || []
      : [];

    const orders = ordersResult.status === 'fulfilled' && !ordersResult.value.error
      ? ordersResult.value.data || []
      : [];

    // Get product details for orders (only if we have orders with product IDs)
    const productIds = orders.map(o => o.product_id).filter(Boolean);
    let orderProducts: { id: string; title: string; product_images: { image_url: string }[] }[] = [];

    if (productIds.length > 0) {
      const productDetailsResult = await supabase
        .from('products')
        .select(`
          id,
          title,
          product_images (image_url)
        `)
        .in('id', productIds);

      orderProducts = productDetailsResult.data || [];
    }

    // Calculate earnings summary
    const totalEarnings = orders.reduce((sum, order) => sum + (order.seller_net_amount || 0), 0);
    const pendingEarnings = orders.filter(o => o.status === 'delivered')
      .reduce((sum, order) => sum + (order.seller_net_amount || 0), 0);

    return {
      soldProducts: soldProducts.map(product => ({
        ...product,
        first_image: product.product_images?.[0]?.image_url || null
      })),
      orders: orders.map(order => {
        const product = orderProducts.find(p => p.id === order.product_id);
        return {
          ...order,
          product: product || null,
          product_image: product?.product_images?.[0]?.image_url || null
        };
      }),
      payouts: [], // No payouts table yet
      earnings: {
        total: totalEarnings,
        pending: pendingEarnings,
        paid: 0, // No payouts yet
        available: totalEarnings
      }
    };

  } catch (err) {
    console.error('Sales dashboard error:', err);
    error(500, 'Failed to load sales data');
  }
}) satisfies PageServerLoad;