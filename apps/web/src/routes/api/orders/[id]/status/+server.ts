import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServerSupabaseClient } from '$lib/supabase/server';

export const PATCH: RequestHandler = async ({ request, params, cookies }) => {
	const supabase = createServerSupabaseClient({ cookies } as any);
	
	const { data: { session }, error: sessionError } = await supabase.auth.getSession();
	
	if (sessionError || !session?.user) {
		throw error(401, 'Unauthorized');
	}

	if (!params.id) {
		throw error(400, 'Order ID is required');
	}

	try {
		const { status, tracking_number } = await request.json();
		
		if (!status) {
			throw error(400, 'Status is required');
		}

		// Validate status
		const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'disputed'];
		if (!validStatuses.includes(status)) {
			throw error(400, 'Invalid status');
		}

		// Get order details first to validate permissions
		const { data: order, error: orderError } = await supabase
			.from('orders')
			.select(`
				*,
				buyer:profiles!buyer_id(id, username, email),
				seller:profiles!seller_id(id, username, email),
				product:products(id, title)
			`)
			.eq('id', params.id)
			.single();

		if (orderError || !order) {
			throw error(404, 'Order not found');
		}

		// Permission checks based on status change
		const userId = session.user.id;
		if (status === 'shipped' && order.seller_id !== userId) {
			throw error(403, 'Only the seller can mark order as shipped');
		}
		if (status === 'delivered' && order.buyer_id !== userId) {
			throw error(403, 'Only the buyer can mark order as delivered');
		}

		// Status transition validation
		const validTransitions: Record<string, string[]> = {
			'pending': ['paid', 'cancelled'],
			'paid': ['shipped', 'cancelled', 'disputed'],
			'shipped': ['delivered', 'disputed'],
			'delivered': [], // No transitions allowed from delivered
			'cancelled': [],
			'disputed': ['cancelled', 'delivered']
		};

		if (!validTransitions[order.status]?.includes(status)) {
			throw error(400, `Invalid status transition from ${order.status} to ${status}`);
		}

		// Update order
		const updateData: any = {
			status,
			updated_at: new Date().toISOString()
		};

		// Add timestamps for specific statuses
		if (status === 'shipped') {
			updateData.shipped_at = new Date().toISOString();
			if (tracking_number) {
				updateData.tracking_number = tracking_number;
			}
		} else if (status === 'delivered') {
			updateData.delivered_at = new Date().toISOString();
		}

		const { data: updatedOrder, error: updateError } = await supabase
			.from('orders')
			.update(updateData)
			.eq('id', params.id)
			.select()
			.single();

		if (updateError) {
			throw error(500, 'Failed to update order');
		}

		// Create notifications for both buyer and seller
		const notifications = [];
		
		if (status === 'shipped') {
			// Notify buyer that order was shipped
			notifications.push({
				user_id: order.buyer_id,
				type: 'order_shipped',
				title: 'Your order has been shipped! 📦',
				message: `${order.seller.username} has shipped your order for "${order.product.title}"${tracking_number ? ` (Tracking: ${tracking_number})` : ''}`,
				order_id: order.id
			});
		} else if (status === 'delivered') {
			// Notify seller that order was delivered
			notifications.push({
				user_id: order.seller_id,
				type: 'order_delivered',
				title: 'Order delivered! 🎉',
				message: `Your sale of "${order.product.title}" has been marked as delivered by ${order.buyer.username}`,
				order_id: order.id
			});

			// Update transaction to mark payout as ready
			await supabase
				.from('transactions')
				.update({ 
					payout_status: 'pending',
					updated_at: new Date().toISOString()
				})
				.eq('order_id', order.id);
		}

		// Insert notifications
		if (notifications.length > 0) {
			await supabase.from('notifications').insert(notifications);
		}

		return json({
			success: true,
			order: updatedOrder
		});

	} catch (err) {
		console.error('Order status update error:', err);
		if (err instanceof Response) throw err;
		throw error(500, 'Internal server error');
	}
};