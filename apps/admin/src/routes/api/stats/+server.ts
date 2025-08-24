import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	// Get total users count
	const { count: totalUsers } = await locals.supabase
		.from('profiles')
		.select('*', { count: 'exact', head: true });

	// Get active listings count
	const { count: activeListings } = await locals.supabase
		.from('listings')
		.select('*', { count: 'exact', head: true })
		.eq('status', 'active');

	// Get pending payouts count
	const { count: pendingPayouts } = await locals.supabase
		.from('payout_requests')
		.select('*', { count: 'exact', head: true })
		.eq('status', 'pending');

	// Get total revenue (sum of completed orders * 0.10 commission)
	const { data: revenueData } = await locals.supabase
		.from('orders')
		.select('total_amount')
		.eq('status', 'delivered');

	const totalRevenue = revenueData?.reduce((sum, order) => {
		return sum + (order.total_amount * 0.10); // 10% commission
	}, 0) || 0;

	return json({
		totalUsers: totalUsers || 0,
		activeListings: activeListings || 0,
		pendingPayouts: pendingPayouts || 0,
		totalRevenue: totalRevenue.toFixed(2)
	});
};