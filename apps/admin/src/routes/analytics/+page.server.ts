import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const now = new Date();
	const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
	const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

	// User growth over time
	const { data: newUsersToday } = await locals.supabase
		.from('profiles')
		.select('*', { count: 'exact', head: true })
		.gte('created_at', new Date().toISOString().split('T')[0]);

	const { data: newUsersWeek } = await locals.supabase
		.from('profiles')
		.select('*', { count: 'exact', head: true })
		.gte('created_at', sevenDaysAgo.toISOString());

	const { data: newUsersMonth } = await locals.supabase
		.from('profiles')
		.select('*', { count: 'exact', head: true })
		.gte('created_at', thirtyDaysAgo.toISOString());

	// Sales analytics
	const { data: salesThisMonth } = await locals.supabase
		.from('orders')
		.select('total_amount')
		.eq('status', 'delivered')
		.gte('created_at', thirtyDaysAgo.toISOString());

	const monthlyRevenue = salesThisMonth?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
	const monthlyCommission = monthlyRevenue * 0.10; // 10% commission

	// Top selling categories
	const { data: topCategories } = await locals.supabase
		.from('products')
		.select('category')
		.eq('status', 'sold')
		.limit(100);

	const categoryCount = topCategories?.reduce((acc: Record<string, number>, item) => {
		if (item.category) {
			acc[item.category] = (acc[item.category] || 0) + 1;
		}
		return acc;
	}, {}) || {};

	const topCategoriesList = Object.entries(categoryCount)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 5)
		.map(([category, count]) => ({ category, count }));

	// Top sellers
	const { data: topSellers } = await locals.supabase
		.from('orders')
		.select(`
			seller_id,
			total_amount,
			seller:profiles!orders_seller_id_fkey(
				username,
				avatar_url
			)
		`)
		.eq('status', 'delivered')
		.gte('created_at', thirtyDaysAgo.toISOString());

	const sellerRevenue = topSellers?.reduce((acc: Record<string, any>, order) => {
		const sellerId = order.seller_id;
		if (!acc[sellerId]) {
			acc[sellerId] = {
				username: order.seller?.username,
				avatar_url: order.seller?.avatar_url,
				revenue: 0,
				orders: 0
			};
		}
		acc[sellerId].revenue += order.total_amount || 0;
		acc[sellerId].orders += 1;
		return acc;
	}, {}) || {};

	const topSellersList = Object.values(sellerRevenue)
		.sort((a: any, b: any) => b.revenue - a.revenue)
		.slice(0, 5);

	// Platform metrics
	const { count: totalListings } = await locals.supabase
		.from('products')
		.select('*', { count: 'exact', head: true });

	const { count: activeListings } = await locals.supabase
		.from('products')
		.select('*', { count: 'exact', head: true })
		.eq('status', 'available');

	const { count: totalOrders } = await locals.supabase
		.from('orders')
		.select('*', { count: 'exact', head: true });

	const { count: completedOrders } = await locals.supabase
		.from('orders')
		.select('*', { count: 'exact', head: true })
		.eq('status', 'delivered');

	const conversionRate = totalListings > 0 ? ((completedOrders || 0) / totalListings * 100).toFixed(2) : '0';

	return {
		userGrowth: {
			today: newUsersToday || 0,
			week: newUsersWeek?.length || 0,
			month: newUsersMonth?.length || 0
		},
		revenue: {
			monthlyRevenue: monthlyRevenue.toFixed(2),
			monthlyCommission: monthlyCommission.toFixed(2),
			averageOrderValue: salesThisMonth?.length ? (monthlyRevenue / salesThisMonth.length).toFixed(2) : '0'
		},
		topCategories: topCategoriesList,
		topSellers: topSellersList,
		metrics: {
			totalListings: totalListings || 0,
			activeListings: activeListings || 0,
			totalOrders: totalOrders || 0,
			completedOrders: completedOrders || 0,
			conversionRate
		}
	};
};