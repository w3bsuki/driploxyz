import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ params, locals }) => {
	const { id } = params;
	const { session } = await locals.safeGetSession();
	
	if (!session?.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Fetch order details - only if user is buyer or seller
	const { data: order, error } = await locals.supabase
		.from('orders')
		.select(`
			*,
			product:products (
				id,
				title,
				price,
				images,
				seller_id
			),
			seller:profiles!seller_id (
				id,
				username,
				avatar_url
			),
			buyer:profiles!buyer_id (
				id,
				username,
				avatar_url
			)
		`)
		.eq('id', id)
		.or(`buyer_id.eq.${session.user.id},seller_id.eq.${session.user.id}`)
		.single();

	if (error || !order) {
		return json({ error: 'Order not found' }, { status: 404 });
	}

	return json(order);
};