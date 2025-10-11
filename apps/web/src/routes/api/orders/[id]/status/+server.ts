import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { OrderService } from '@repo/core';

export const PATCH: RequestHandler = async (event) => {
	const { request, params, locals } = event;
	const supabase = locals.supabase;
	const orderService = new OrderService(supabase);

	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		error(401, 'Unauthorized');
	}

	if (!params.id) {
		error(400, 'Order ID is required');
	}

	try {
		const { status, tracking_number, notes } = await request.json();
		
		if (!status) {
			error(400, 'Status is required');
		}

		// Validate status
		const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'disputed', 'failed', 'completed'];
		if (!validStatuses.includes(status)) {
			error(400, 'Invalid status');
		}

		// Use OrderService to update status with full validation and side effects
		const { order: updatedOrder, error: updateError } = await orderService.updateOrderStatus({
			orderId: params.id,
			status,
			userId: user.id,
			trackingNumber: tracking_number,
			notes
		});

		if (updateError) {
			// Map service errors to appropriate HTTP errors
			if (updateError.message.includes('not found')) {
				error(404, updateError.message);
			}
			if (updateError.message.includes('Only the') || updateError.message.includes('Access denied')) {
				error(403, updateError.message);
			}
			if (updateError.message.includes('Invalid status transition') || updateError.message.includes('Invalid')) {
				error(400, updateError.message);
			}
			error(500, updateError.message);
		}

		return json({
			success: true,
			order: updatedOrder,
			message: `Order status updated to ${status} successfully`
		});

	} catch (err) {
		
		if (err instanceof Response) throw err;
		error(500, 'Internal server error');
	}
};