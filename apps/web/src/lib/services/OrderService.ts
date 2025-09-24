import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
// TransactionService is available if needed for future features

type Tables = Database['public']['Tables'];
type Order = Tables['orders']['Row'];
type OrderInsert = Tables['orders']['Insert'];
type OrderUpdate = Tables['orders']['Update'];
type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'disputed';

// Extended order type with joined data
interface OrderWithJoins extends Order {
	product?: {
		title: string;
	};
	buyer?: {
		username: string;
	};
	seller?: {
		username: string;
	};
}

interface ShippingAddress {
	street: string;
	city: string;
	state: string;
	zip: string;
	country: string;
	full_name: string;
	[key: string]: string | undefined;
}

interface CreateOrderParams {
	productId: string;
	buyerId: string;
	sellerId: string;
	totalAmount: number;
	shippingCost?: number;
	shippingAddress: ShippingAddress;
}

interface OrderStatusUpdateParams {
	orderId: string;
	status: OrderStatus;
	userId: string;
	trackingNumber?: string;
	notes?: string;
}

interface OrderFilterParams {
	userId: string;
	role: 'buyer' | 'seller';
	status?: OrderStatus;
	limit?: number;
	offset?: number;
}

export class OrderService {
	constructor(private supabase: SupabaseClient<Database>) {}

	/**
	 * Create a new order (typically called during checkout process)
	 */
	async createOrder(params: CreateOrderParams): Promise<{ order: Order | null; error: Error | null }> {
		try {
			// Validate product is available
			const { data: product, error: productError } = await this.supabase
				.from('products')
				.select('id, title, price, is_sold, is_active, seller_id')
				.eq('id', params.productId)
				.single();

			if (productError || !product) {
				return { order: null, error: new Error('Product not found') };
			}

			if (product.is_sold || !product.is_active) {
				return { order: null, error: new Error('Product is not available') };
			}

			if (product.seller_id === params.buyerId) {
				return { order: null, error: new Error('Cannot purchase your own product') };
			}

			// Create order with pending status
			const orderData: OrderInsert = {
				product_id: params.productId,
				buyer_id: params.buyerId,
				seller_id: params.sellerId,
				status: 'pending',
				total_amount: params.totalAmount,
				shipping_cost: params.shippingCost || 0,
				shipping_address: params.shippingAddress,
				buyer_rated: false,
				seller_rated: false,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			};

			const { data: order, error } = await this.supabase
				.from('orders')
				.insert(orderData)
				.select()
				.single();

			if (error) {
				return { order: null, error };
			}

			// Create initial transaction record (will be updated by webhooks)
			await this.supabase
				.from('transactions')
				.insert({
					order_id: order.id,
					buyer_id: params.buyerId,
					seller_id: params.sellerId,
					amount_total: params.totalAmount,
					stripe_payment_intent_id: '', // Will be updated by webhook
					status: 'pending'
				});

			return { order, error: null };
		} catch (error) {
			return { order: null, error: error as Error };
		}
	}

	/**
	 * Update order status with proper validation and side effects
	 */
	async updateOrderStatus(params: OrderStatusUpdateParams): Promise<{ order: Order | null; error: Error | null }> {
		try {
			// Get current order with related data
			const { data: order, error: orderError } = await this.supabase
				.from('orders')
				.select(`
					*,
					buyer:profiles!buyer_id(id, username, full_name),
					seller:profiles!seller_id(id, username, full_name),
					product:products(id, title, price)
				`)
				.eq('id', params.orderId)
				.single() as {
					data: Order & {
						buyer: { id: string; username: string | null; full_name: string | null };
						seller: { id: string; username: string | null; full_name: string | null };
						product: { id: string; title: string; price: number };
					} | null;
					error: Error | null;
				};

			if (orderError || !order) {
				return { order: null, error: new Error('Order not found') };
			}

			// Validate permissions and transitions
			const validationError = this.validateStatusUpdate(order, params.status, params.userId);
			if (validationError) {
				return { order: null, error: validationError };
			}

			// Prepare update data
			const updateData: OrderUpdate = {
				status: params.status,
				updated_at: new Date().toISOString()
			};

			// Add status-specific data
			if (params.status === 'shipped') {
				updateData.shipped_at = new Date().toISOString();
				if (params.trackingNumber) {
					updateData.tracking_number = params.trackingNumber;
				}
			} else if (params.status === 'delivered') {
				updateData.delivered_at = new Date().toISOString();
			} else if (params.status === 'cancelled') {
				updateData.cancelled_at = new Date().toISOString();
				if (params.notes) {
					updateData.cancelled_reason = params.notes;
				}
			}

			// Update order
			const { data: updatedOrder, error: updateError } = await this.supabase
				.from('orders')
				.update(updateData)
				.eq('id', params.orderId)
				.select()
				.single();

			if (updateError) {
				return { order: null, error: updateError };
			}

			// Handle side effects
			await this.handleStatusUpdateSideEffects(order, params.status, params);

			return { order: updatedOrder, error: null };
		} catch (error) {
			return { order: null, error: error as Error };
		}
	}

	/**
	 * Validate order status update permissions and transitions
	 */
	private validateStatusUpdate(order: Order, newStatus: OrderStatus, userId: string): Error | null {
		// Permission checks
		switch (newStatus) {
			case 'shipped':
				if (order.seller_id !== userId) {
					return new Error('Only the seller can mark order as shipped');
				}
				break;
			case 'delivered':
				if (order.buyer_id !== userId) {
					return new Error('Only the buyer can mark order as delivered');
				}
				break;
			case 'cancelled':
				// Both buyer and seller can cancel, with different rules
				if (order.buyer_id !== userId && order.seller_id !== userId) {
					return new Error('Only the buyer or seller can cancel an order');
				}
				break;
			case 'disputed':
				// Both buyer and seller can initiate disputes
				if (order.buyer_id !== userId && order.seller_id !== userId) {
					return new Error('Only the buyer or seller can dispute an order');
				}
				break;
		}

		// Status transition validation
		const validTransitions: Record<OrderStatus, OrderStatus[]> = {
			'pending': ['paid', 'cancelled'],
			'paid': ['shipped', 'cancelled', 'disputed'],
			'shipped': ['delivered', 'disputed'],
			'delivered': ['disputed'], // Can still dispute after delivery
			'cancelled': [], // Final state
			'disputed': ['cancelled', 'delivered'] // Admin can resolve disputes
		};

		const allowedTransitions = validTransitions[order.status as OrderStatus] || [];
		if (!allowedTransitions.includes(newStatus)) {
			return new Error(`Invalid status transition from ${order.status} to ${newStatus}`);
		}

		return null;
	}

	/**
	 * Handle side effects of status updates (inventory, notifications, etc.)
	 */
	private async handleStatusUpdateSideEffects(order: Order, newStatus: OrderStatus, params: OrderStatusUpdateParams) {
		interface NotificationData {
			user_id: string;
			type: string;
			title: string;
			message: string;
			order_id: string;
			category: string;
			priority: string;
			action_required?: boolean;
		}
		const notifications: NotificationData[] = [];

		switch (newStatus) {
			case 'shipped':
				// Notify buyer
				notifications.push({
					user_id: order.buyer_id,
					type: 'order_shipped',
					title: 'Your order has been shipped! 📦',
					message: `${(order as OrderWithJoins).seller?.username || 'Seller'} has shipped your order for "${(order as OrderWithJoins).product?.title || 'product'}"${params.trackingNumber ? ` (Tracking: ${params.trackingNumber})` : ''}`,
					order_id: order.id,
					category: 'purchases',
					priority: 'normal'
				});
				break;

			case 'delivered':
				// Notify seller
				notifications.push({
					user_id: order.seller_id,
					type: 'order_delivered',
					title: 'Order delivered! 🎉',
					message: `Your sale of "${(order as OrderWithJoins).product?.title || 'product'}" has been marked as delivered by ${(order as OrderWithJoins).buyer?.username || 'buyer'}`,
					order_id: order.id,
					category: 'sales',
					priority: 'normal'
				});

				// Update transaction status for payout eligibility
				await this.supabase
					.from('transactions')
					.update({
						payout_status: 'pending',
						updated_at: new Date().toISOString()
					})
					.eq('order_id', order.id);

				// Review capability is already enabled via buyer_rated/seller_rated flags
				// These are set to false by default and only changed when reviews are submitted
				break;

			case 'cancelled':
				// Restore product availability
				await this.supabase
					.from('products')
					.update({
						is_sold: false,
						sold_at: null,
						status: 'active'
					})
					.eq('id', order.product_id);

				// Update transaction status
				await this.supabase
					.from('transactions')
					.update({
						status: 'cancelled',
						updated_at: new Date().toISOString()
					})
					.eq('order_id', order.id);

				// Notify relevant party
				{
				const notifyUserId = params.userId === order.buyer_id ? order.seller_id : order.buyer_id;
				const cancelledBy = params.userId === order.buyer_id ? 'buyer' : 'seller';
				
				notifications.push({
					user_id: notifyUserId,
					type: 'order_cancelled',
					title: 'Order Cancelled',
					message: `Order for "${(order as OrderWithJoins).product?.title || 'product'}" has been cancelled by the ${cancelledBy}`,
					order_id: order.id,
					category: 'general',
					priority: 'high'
				});
				}
				break;

			case 'disputed': {
				// Notify both parties and admin
				const disputeInitiatedBy = params.userId === order.buyer_id ? 'buyer' : 'seller';
				const otherPartyId = params.userId === order.buyer_id ? order.seller_id : order.buyer_id;

				notifications.push({
					user_id: otherPartyId,
					type: 'order_disputed',
					title: 'Order Disputed ⚠️',
					message: `Order for "${(order as OrderWithJoins).product?.title || 'product'}" has been disputed. Please contact support.`,
					order_id: order.id,
					category: 'general',
					priority: 'urgent',
					action_required: true
				});

				// Create admin notification
				await this.supabase
					.from('admin_notifications')
					.insert({
						type: 'order_dispute',
						title: 'Order Dispute Reported',
						message: `Order ${order.id} for "${(order as OrderWithJoins).product?.title || 'product'}" has been disputed by the ${disputeInitiatedBy}`,
						data: {
							order_id: order.id,
							product_id: order.product_id,
							buyer_id: order.buyer_id,
							seller_id: order.seller_id,
							disputed_by: params.userId,
							dispute_reason: params.notes
						},
						priority: 'high',
						user_id: params.userId
					});
				break;
			}
		}

		// Insert notifications
		if (notifications.length > 0) {
			await this.supabase
				.from('notifications')
				.insert(notifications);
		}
	}

	/**
	 * Get orders for a user (buyer or seller)
	 */
	async getOrders(params: OrderFilterParams) {
		let query = this.supabase
			.from('orders')
			.select(`
				*,
				product:products(
					id, 
					title, 
					price,
					condition,
					size,
					product_images(image_url)
				),
				buyer:profiles!buyer_id(
					id, 
					username, 
					full_name, 
					avatar_url
				),
				seller:profiles!seller_id(
					id, 
					username, 
					full_name, 
					avatar_url
				),
				transaction:transactions(
					id,
					amount_total,
					commission_amount,
					seller_earnings,
					payout_status
				)
			`);

		if (params.role === 'buyer') {
			query = query.eq('buyer_id', params.userId);
		} else {
			query = query.eq('seller_id', params.userId);
		}

		if (params.status) {
			query = query.eq('status', params.status);
		}

		query = query.order('created_at', { ascending: false });

		if (params.limit) {
			query = query.limit(params.limit);
		}

		if (params.offset) {
			query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
		}

		return await query;
	}

	/**
	 * Get order by ID with full details
	 */
	async getOrderById(orderId: string, userId: string) {
		const { data: order, error } = await this.supabase
			.from('orders')
			.select(`
				*,
				product:products(
					id, 
					title, 
					price,
					condition,
					size,
					brand,
					color,
					material,
					product_images(image_url, alt_text)
				),
				buyer:profiles!buyer_id(*),
				seller:profiles!seller_id(*),
				transactions(*),
				reviews(*)
			`)
			.eq('id', orderId)
			.single();

		if (error || !order) {
			return { order: null, error: error || new Error('Order not found') };
		}

		// Verify user has permission to view this order
		if (order.buyer_id !== userId && order.seller_id !== userId) {
			return { order: null, error: new Error('Access denied') };
		}

		return { order, error: null };
	}

	/**
	 * Mark order as ready for review (after delivery confirmation period)
	 */
	async markOrderCompleted(orderId: string) {
		// This would be called by a cron job or after a waiting period
		const { data: order, error: orderError } = await this.supabase
			.from('orders')
			.select('*')
			.eq('id', orderId)
			.eq('status', 'delivered')
			.single();

		if (orderError || !order) {
			return { error: new Error('Order not found or not delivered') };
		}

		// Check if enough time has passed (e.g., 7 days after delivery)
		const deliveredAt = new Date(order.delivered_at!);
		const now = new Date();
		const daysSinceDelivery = (now.getTime() - deliveredAt.getTime()) / (1000 * 3600 * 24);

		if (daysSinceDelivery < 7) {
			return { error: new Error('Order completion period not yet reached') };
		}

		// Update order to completed status (we can extend the enum for this)
		await this.supabase
			.from('orders')
			.update({
				status: 'delivered', // Keep as delivered for now, can extend enum later
				updated_at: new Date().toISOString()
			})
			.eq('id', orderId);

		// Finalize transaction for payout
		await this.supabase
			.from('transactions')
			.update({
				payout_status: 'ready',
				updated_at: new Date().toISOString()
			})
			.eq('order_id', orderId);

		return { error: null };
	}

	/**
	 * Get order statistics for dashboard
	 */
	async getOrderStats(userId: string) {
		// Get buyer stats
		const { data: buyerStats } = await this.supabase
			.from('orders')
			.select('status')
			.eq('buyer_id', userId);

		// Get seller stats
		const { data: sellerStats } = await this.supabase
			.from('orders')
			.select('status, total_amount')
			.eq('seller_id', userId);

		const stats = {
			purchases: {
				total: buyerStats?.length || 0,
				pending: buyerStats?.filter(o => o.status === 'pending').length || 0,
				shipped: buyerStats?.filter(o => o.status === 'shipped').length || 0,
				delivered: buyerStats?.filter(o => o.status === 'delivered').length || 0
			},
			sales: {
				total: sellerStats?.length || 0,
				pending: sellerStats?.filter(o => o.status === 'pending').length || 0,
				toShip: sellerStats?.filter(o => o.status === 'paid').length || 0,
				shipped: sellerStats?.filter(o => o.status === 'shipped').length || 0,
				completed: sellerStats?.filter(o => o.status === 'delivered').length || 0,
				totalValue: sellerStats?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0
			}
		};

		return stats;
	}
}