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

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  const { safeGetSession, supabase } = locals;
  const { session, user } = await safeGetSession();
  
  if (!session || !user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const orderId = params.id;
  const body = await request.json();
  const { status, tracking_number } = body;
  
  // First check if the user is the seller of this order
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('seller_id, buyer_id, status')
    .eq('id', orderId)
    .single();
    
  if (fetchError || !order) {
    return json({ error: 'Order not found' }, { status: 404 });
  }
  
  // Validate permissions based on status change
  const isSeller = order.seller_id === user.id;
  const isBuyer = order.buyer_id === user.id;
  
  // Status transition validation
  const validTransitions: Record<string, { roles: ('seller' | 'buyer')[], nextStatuses: string[] }> = {
    'pending': {
      roles: ['seller'],
      nextStatuses: ['processing', 'cancelled']
    },
    'processing': {
      roles: ['seller'],
      nextStatuses: ['shipped', 'cancelled']
    },
    'shipped': {
      roles: ['buyer', 'seller'],
      nextStatuses: ['delivered', 'cancelled']
    },
    'delivered': {
      roles: [],
      nextStatuses: [] // Final state
    },
    'cancelled': {
      roles: [],
      nextStatuses: [] // Final state
    }
  };
  
  const currentTransition = validTransitions[order.status];
  
  if (!currentTransition) {
    return json({ error: 'Invalid current status' }, { status: 400 });
  }
  
  // Check if user has permission for this transition
  const hasPermission = (isSeller && currentTransition.roles.includes('seller')) ||
                       (isBuyer && currentTransition.roles.includes('buyer'));
                       
  if (!hasPermission) {
    return json({ error: 'You do not have permission to update this order' }, { status: 403 });
  }
  
  // Check if the new status is valid
  if (status && !currentTransition.nextStatuses.includes(status)) {
    return json({ error: `Cannot transition from ${order.status} to ${status}` }, { status: 400 });
  }
  
  // Build update object
  const updateData: any = {};
  
  if (status) {
    updateData.status = status;
    updateData.updated_at = new Date().toISOString();
    
    // Set timestamp fields based on status
    if (status === 'shipped') {
      updateData.shipped_at = new Date().toISOString();
    } else if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }
  }
  
  if (tracking_number !== undefined) {
    // Only sellers can update tracking number
    if (!isSeller) {
      return json({ error: 'Only sellers can update tracking information' }, { status: 403 });
    }
    updateData.tracking_number = tracking_number;
  }
  
  // Update the order
  const { data: updatedOrder, error: updateError } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single();
    
  if (updateError) {
    console.error('Error updating order:', updateError);
    return json({ error: 'Failed to update order' }, { status: 500 });
  }
  
  // Create notification for the other party
  if (status === 'shipped' && isSeller) {
    // Notify buyer that order has shipped
    await supabase
      .from('notifications')
      .insert({
        user_id: order.buyer_id,
        type: 'order_shipped',
        title: 'Order Shipped',
        message: tracking_number 
          ? `Your order has been shipped! Tracking: ${tracking_number}`
          : 'Your order has been shipped!',
        metadata: { order_id: orderId, tracking_number }
      });
  } else if (status === 'delivered' && isBuyer) {
    // Notify seller that order was delivered
    await supabase
      .from('notifications')
      .insert({
        user_id: order.seller_id,
        type: 'order_delivered',
        title: 'Order Delivered',
        message: 'Your buyer has confirmed delivery!',
        metadata: { order_id: orderId }
      });
  }
  
  return json({ success: true, order: updatedOrder });
};