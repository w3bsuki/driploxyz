import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		throw error(401, 'Unauthorized');
	}

	const supabase = locals.supabase;

	try {
		// Get user's purchases (orders where they are the buyer)
		const { data: orders, error: ordersError } = await supabase
			.from('orders')
			.select(`
				id,
				status,
				total_amount,
				shipping_cost,
				shipping_address,
				tracking_number,
				notes,
				created_at,
				updated_at,
				shipped_at,
				delivered_at,
				product:products (
					id,
					title,
					price,
					condition,
					size,
					images,
					seller_id,
					seller:profiles!seller_id (
						id,
						username,
						avatar_url,
						first_name,
						last_name
					)
				),
				seller:profiles!seller_id (
					id,
					username,
					avatar_url,
					first_name,
					last_name
				)
			`)
			.eq('buyer_id', user.id)
			.order('created_at', { ascending: false });

		if (ordersError) {
			console.error('Error fetching orders:', ordersError);
			throw error(500, 'Failed to load purchase history');
		}

		// Transform the data for easier use in the UI
		const transformedOrders = orders?.map(order => ({
			...order,
			product: {
				...order.product,
				first_image: order.product.images?.[0] || null
			}
		})) || [];

		// Get unread notifications for this user
		const { data: notifications } = await supabase
			.from('notifications')
			.select('*')
			.eq('user_id', user.id)
			.eq('read', false)
			.order('created_at', { ascending: false });

		return {
			orders: transformedOrders,
			unreadNotifications: notifications?.length || 0
		};

	} catch (err) {
		console.error('Error in purchases page load:', err);
		throw error(500, 'Failed to load purchase history');
	}
};