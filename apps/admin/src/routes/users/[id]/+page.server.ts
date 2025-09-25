import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async ({ params, locals }) => {
	const userId = params.id;

	// Get user details
	const { data: user, error: userError } = await locals.supabase
		.from('profiles')
		.select('*')
		.eq('id', userId)
		.single();

	if (userError || !user) {
		error(404, 'User not found');
	}

	// Get user's listings
	const { data: listings } = await locals.supabase
		.from('products')
		.select(`
			*,
			category:categories!products_category_id_fkey(name)
		`)
		.eq('seller_id', userId)
		.order('created_at', { ascending: false });

	// Get user's orders as buyer
	const { data: buyerOrders } = await locals.supabase
		.from('orders')
		.select(`
			*,
			product:products!orders_product_id_fkey(
				title,
				images,
				price
			),
			seller:profiles!orders_seller_id_fkey(
				username,
				avatar_url
			)
		`)
		.eq('buyer_id', userId)
		.order('created_at', { ascending: false });

	// Get user's orders as seller
	const { data: sellerOrders } = await locals.supabase
		.from('orders')
		.select(`
			*,
			product:products!orders_product_id_fkey(
				title,
				images,
				price
			),
			buyer:profiles!orders_buyer_id_fkey(
				username,
				avatar_url
			)
		`)
		.eq('seller_id', userId)
		.order('created_at', { ascending: false });

	// Get payout requests
	const { data: payoutRequests } = await locals.supabase
		.from('payout_requests')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false });

	// Calculate stats
	const totalListings = listings?.length || 0;
	const activeListings = listings?.filter(l => l.is_active && !l.is_sold).length || 0;
	const soldListings = listings?.filter(l => l.is_sold).length || 0;
	const totalPurchases = buyerOrders?.length || 0;
	const totalSales = sellerOrders?.length || 0;
	const completedSales = sellerOrders?.filter(o => o.status === 'delivered').length || 0;
	
	// Calculate total earnings
	const totalEarnings = sellerOrders
		?.filter(o => o.status === 'delivered')
		?.reduce((sum, order) => sum + (order.total_amount - (order.platform_fee || 0)), 0) || 0;

	// Calculate total payouts
	const totalPayouts = payoutRequests
		?.filter(p => p.status === 'completed')
		?.reduce((sum, payout) => sum + payout.amount, 0) || 0;

	const pendingPayouts = payoutRequests
		?.filter(p => p.status === 'pending')
		?.reduce((sum, payout) => sum + payout.amount, 0) || 0;

	return {
		user,
		listings: listings || [],
		buyerOrders: buyerOrders || [],
		sellerOrders: sellerOrders || [],
		payoutRequests: payoutRequests || [],
		stats: {
			totalListings,
			activeListings,
			soldListings,
			totalPurchases,
			totalSales,
			completedSales,
			totalEarnings: totalEarnings.toFixed(2),
			totalPayouts: totalPayouts.toFixed(2),
			pendingPayouts: pendingPayouts.toFixed(2),
			availableForPayout: (totalEarnings - totalPayouts - pendingPayouts).toFixed(2)
		}
	};
}) satisfies PageServerLoad;