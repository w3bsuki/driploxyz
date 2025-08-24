import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

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

export const actions = {
	resolveDispute: async ({ request, locals }) => {
		const formData = await request.formData();
		const orderId = formData.get('orderId') as string;
		const resolution = formData.get('resolution') as string; // 'refund_buyer' or 'favor_seller'
		const adminNotes = formData.get('adminNotes') as string;

		try {
			// Update order status
			const { error: orderError } = await locals.supabase
				.from('orders')
				.update({
					status: 'resolved',
					dispute_resolution: resolution,
					admin_resolution_notes: adminNotes,
					resolved_at: new Date().toISOString()
				})
				.eq('id', orderId);

			if (orderError) {
				return fail(400, { message: 'Failed to resolve dispute' });
			}

			// If refunding buyer, handle refund logic here
			if (resolution === 'refund_buyer') {
				// TODO: Integrate with Stripe to process refund
				console.log(`Processing refund for order ${orderId}`);
			}

			return { success: true, message: 'Dispute resolved successfully' };
		} catch (error) {
			return fail(500, { message: 'Failed to process dispute resolution' });
		}
	},

	updateOrderStatus: async ({ request, locals }) => {
		const formData = await request.formData();
		const orderId = formData.get('orderId') as string;
		const status = formData.get('status') as string;
		const notes = formData.get('notes') as string;

		const { error } = await locals.supabase
			.from('orders')
			.update({
				status: status,
				admin_notes: notes,
				updated_at: new Date().toISOString()
			})
			.eq('id', orderId);

		if (error) {
			return fail(400, { message: 'Failed to update order status' });
		}

		return { success: true, message: 'Order status updated' };
	},

	cancelOrder: async ({ request, locals }) => {
		const formData = await request.formData();
		const orderId = formData.get('orderId') as string;
		const reason = formData.get('reason') as string;

		const { error } = await locals.supabase
			.from('orders')
			.update({
				status: 'canceled',
				cancellation_reason: reason,
				canceled_at: new Date().toISOString()
			})
			.eq('id', orderId);

		if (error) {
			return fail(400, { message: 'Failed to cancel order' });
		}

		// TODO: Process refund if payment was made
		return { success: true, message: 'Order canceled successfully' };
	},

	refundOrder: async ({ request, locals }) => {
		const formData = await request.formData();
		const orderId = formData.get('orderId') as string;
		const refundAmount = parseFloat(formData.get('refundAmount') as string);
		const reason = formData.get('reason') as string;

		try {
			// Update order with refund info
			const { error } = await locals.supabase
				.from('orders')
				.update({
					refund_amount: refundAmount,
					refund_reason: reason,
					refund_processed_at: new Date().toISOString(),
					status: 'refunded'
				})
				.eq('id', orderId);

			if (error) {
				return fail(400, { message: 'Failed to process refund' });
			}

			// TODO: Integrate with Stripe to process actual refund
			return { success: true, message: 'Refund processed successfully' };
		} catch (error) {
			return fail(500, { message: 'Failed to process refund' });
		}
	}
} satisfies Actions;