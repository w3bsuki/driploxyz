import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Fetch all orders with buyer and seller info
	const { data: orders, error } = await locals.supabase
		.from('orders')
		.select(`
			*,
			buyer:profiles!orders_buyer_id_fkey(
				username,
				avatar_url,
				full_name
			),
			seller:profiles!orders_seller_id_fkey(
				username,
				avatar_url,
				full_name
			),
			product:products!orders_product_id_fkey(
				title,
				brand,
				category:categories!products_category_id_fkey(name)
			)
		`)
		.order('created_at', { ascending: false })
		.limit(100);

	if (error) {
		console.error('Error fetching orders:', error);
	}

	// Get stats
	const { count: totalOrders } = await locals.supabase
		.from('orders')
		.select('*', { count: 'exact', head: true });

	const { count: pendingOrders } = await locals.supabase
		.from('orders')
		.select('*', { count: 'exact', head: true })
		.eq('status', 'pending');

	const { count: shippedOrders } = await locals.supabase
		.from('orders')
		.select('*', { count: 'exact', head: true })
		.eq('status', 'shipped');

	const { count: deliveredOrders } = await locals.supabase
		.from('orders')
		.select('*', { count: 'exact', head: true })
		.eq('status', 'delivered');

	const { count: disputedOrders } = await locals.supabase
		.from('orders')
		.select('*', { count: 'exact', head: true })
		.eq('status', 'disputed');

	// Calculate total GMV
	const { data: gmvData } = await locals.supabase
		.from('orders')
		.select('total_amount')
		.neq('status', 'canceled');

	const totalGMV = gmvData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

	return {
		orders: orders || [],
		stats: {
			total: totalOrders || 0,
			pending: pendingOrders || 0,
			shipped: shippedOrders || 0,
			delivered: deliveredOrders || 0,
			disputed: disputedOrders || 0,
			gmv: totalGMV.toFixed(2)
		}
	};
};