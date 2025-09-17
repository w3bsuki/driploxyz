import type { PageServerLoad } from './$types';

export const load = (async ({ locals, parent }) => {
  // The parent layout already checks for admin access
  await parent();
  
  try {
    const supabase = locals.supabase;

  // Get pending payouts (delivered orders that haven't been paid out yet)
  const { data: pendingPayouts, error: payoutsError } = await supabase
    .from('transactions')
    .select(`
      id,
      order_id,
      seller_id,
      seller_earnings,
      commission_amount,
      currency,
      payout_status,
      payout_date,
      payout_reference,
      created_at,
      updated_at
    `)
    .in('payout_status', ['pending', 'processing'])
    .order('created_at', { ascending: false });

  if (payoutsError) {
    // Payouts fetch error - will return empty list
  }

  // Get order and seller details separately to avoid join issues
  const enrichedPayouts = [];
  if (pendingPayouts && pendingPayouts.length > 0) {
    for (const payout of pendingPayouts) {
      // Get order details
      const { data: order } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          delivered_at,
          product_id
        `)
        .eq('id', payout.order_id)
        .single();

      // Get product details
      let product = null;
      if (order?.product_id) {
        const { data: productData } = await supabase
          .from('products')
          .select('id, title, price, images')
          .eq('id', order.product_id)
          .single();
        product = productData;
      }

      // Get seller details
      const { data: seller } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', payout.seller_id)
        .single();

      enrichedPayouts.push({
        ...payout,
        orders: order ? { ...order, product } : null,
        seller
      });
    }
  }

  // Simple stats calculation (remove RPC call that doesn't exist)
  const stats = {
    totalPending: enrichedPayouts.filter(p => p.payout_status === 'pending').length,
    totalProcessing: enrichedPayouts.filter(p => p.payout_status === 'processing').length,
    totalAmount: enrichedPayouts.reduce((sum, p) => sum + Number(p.seller_earnings || 0), 0),
    totalCommission: enrichedPayouts.reduce((sum, p) => sum + Number(p.commission_amount || 0), 0)
  };

  return {
    pendingPayouts: enrichedPayouts,
    stats
  };
  } catch (error) {
    // Admin payouts page error - return safe defaults
    return {
      pendingPayouts: [],
      stats: {
        totalPending: 0,
        totalProcessing: 0,
        totalAmount: 0,
        totalCommission: 0
      }
    };
  }
}) satisfies PageServerLoad;