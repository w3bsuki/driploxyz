import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServerSupabaseClient } from '$lib/supabase/server';
import { OrderService } from '$lib/services/OrderService';

export const PATCH: RequestHandler = async (event) => {
	const { request, params } = event;
	const supabase = createServerSupabaseClient(event);
	const orderService = new OrderService(supabase);
	
	const { data: { session }, error: sessionError } = await supabase.auth.getSession();
	
	if (sessionError || !session?.user) {
		throw error(401, 'Unauthorized');
	}

	if (!params.id) {
		throw error(400, 'Order ID is required');
	}

	try {
		const { status, tracking_number, notes } = await request.json();
		
		if (!status) {
			throw error(400, 'Status is required');
		}

		// Validate status
		const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'disputed', 'failed', 'completed'];
		if (!validStatuses.includes(status)) {
			throw error(400, 'Invalid status');
		}

		// Use OrderService to update status with full validation and side effects
		const { order: updatedOrder, error: updateError } = await orderService.updateOrderStatus({
			orderId: params.id,
			status,
			userId: session.user.id,
			trackingNumber: tracking_number,
			notes
		});

		if (updateError) {
			// Map service errors to appropriate HTTP errors
			if (updateError.message.includes('not found')) {
				throw error(404, updateError.message);
			}
			if (updateError.message.includes('Only the') || updateError.message.includes('Access denied')) {
				throw error(403, updateError.message);
			}
			if (updateError.message.includes('Invalid status transition') || updateError.message.includes('Invalid')) {
				throw error(400, updateError.message);
			}
			throw error(500, updateError.message);
		}

		return json({
			success: true,
			order: updatedOrder,
			message: `Order status updated to ${status} successfully`
		});

	} catch (err) {
		
		if (err instanceof Response) throw err;
		throw error(500, 'Internal server error');
	}
};