import type { PageServerLoad } from './$types';

export const load = (async ({ locals: { supabase } }) => {
  try {
    // Get dashboard statistics
    const [
      { count: totalUsers },
      { count: totalProducts },
      { count: totalOrders },
      { data: recentOrders }
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          buyer:buyer_id(username),
          seller:seller_id(username)
        `)
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    // Calculate revenue (sum of completed orders)
    const { data: revenue } = await supabase
      .from('orders')
      .select('total_amount')
      .in('status', ['paid', 'shipped', 'delivered']);
    
    const totalRevenue = revenue?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    return {
      stats: {
        totalUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        totalRevenue: totalRevenue / 100 // Convert from cents
      },
      recentOrders: recentOrders || []
    };
  } catch (error) {
    // Admin dashboard error - return default stats
    return {
      stats: {
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0
      },
      recentOrders: []
    };
  }
}) satisfies PageServerLoad;