import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import { paymentLogger } from '$lib/utils/log';

// Database types
type Tables = Database['public']['Tables'];
// TODO: Define transactions table in database schema
// type Transaction = Tables['transactions']['Row'];
type Order = Tables['orders']['Row'];

export interface PaymentCreateParams {
	productId: string;
	sellerId: string;
	buyerId: string;
	shippingAddress: {
		name: string;
		street: string;
		city: string;
		postalCode: string;
		country: string;
	};
	billingAddress?: {
		name: string;
		street: string;
		city: string;
		postalCode: string;
		country: string;
	};
}

export interface SubscriptionCreateParams {
	userId: string;
	planId: string;
	discountPercent?: number;
}

export interface PaymentIntentResult {
	paymentIntent?: Stripe.PaymentIntent;
	clientSecret?: string;
	error?: Error;
}

// Future transaction result type
// interface _TransactionResult {
// 	transaction?: Transaction;
// 	order?: Order;
// 	error?: Error;
// }

/**
 * Factory function to create Stripe service
 */
export function createStripeService(
	supabase: SupabaseClient<Database>,
	stripeInstance: Stripe
) {
	return new StripeService(supabase, stripeInstance);
}

/**
 * Stripe payment service
 */
export class StripeService {
	constructor(
		private supabase: SupabaseClient<Database>,
		private stripe: Stripe
	) {}

	/**
	 * Calculate payment amounts including fees and shipping
	 */
	calculatePaymentAmounts(productPriceCents: number): {
		productPrice: number;
		shippingCost: number;
		serviceFee: number;
		totalAmount: number;
	} {
		const shippingCost = 500; // €5.00 in cents
		const serviceFee = Math.round(productPriceCents * 0.05) + 70; // 5% + €0.70 fixed fee
		const totalAmount = productPriceCents + shippingCost + serviceFee;

		return {
			productPrice: productPriceCents,
			shippingCost,
			serviceFee,
			totalAmount
		};
	}

	/**
	 * Create payment intent for product purchase
	 */
	async createPaymentIntent(params: {
		amount: number;
		currency: string;
		productId: string;
		sellerId: string;
		buyerId: string;
		userEmail?: string;
		metadata?: Record<string, string>;
	}): Promise<PaymentIntentResult> {
		try {
			const { amount, currency, productId, sellerId, buyerId, userEmail, metadata = {} } = params;

			// Get product details
			const { data: product, error: productError } = await this.supabase
				.from('products')
				.select('id, title, price, seller_id, is_active, is_sold')
				.eq('id', productId)
				.single();

			if (productError || !product) {
				return { error: new Error('Product not found') };
			}

			if (!product.is_active || product.is_sold) {
				return { error: new Error('Product is not available') };
			}

			// Get or create Stripe customer for buyer
			const customer = await this.getOrCreateCustomerForUser(buyerId, userEmail);
			if (!customer) {
				return { error: new Error('Failed to create customer') };
			}

			// Validate total amount is positive
			const totalAmountInCurrency = amount / 100;
			if (totalAmountInCurrency <= 0) {
				return { error: new Error('Invalid amount: must be greater than 0') };
			}

			// Validate buyer is not seller (double check)
			if (buyerId === sellerId) {
				return { error: new Error('Buyer cannot be the same as seller') };
			}

			// Calculate the actual fees
			const calculation = this.calculatePaymentAmounts(amount);
			const shippingCostInCurrency = calculation.shippingCost / 100;
			const serviceFeeInCurrency = calculation.serviceFee / 100;
			const platformFeeInCurrency = totalAmountInCurrency * 0.10; // 10% platform fee
			const sellerNetAmountInCurrency = totalAmountInCurrency - platformFeeInCurrency;

			// Create pending order record first with required fields
			const { data: order, error: orderError } = await this.supabase
				.from('orders')
				.insert({
					buyer_id: buyerId,
					seller_id: sellerId,
					product_id: productId,
					total_amount: totalAmountInCurrency,
					status: 'pending',
					currency: currency.toUpperCase(),
					shipping_cost: shippingCostInCurrency,
					tax_amount: 0,
					service_fee: serviceFeeInCurrency,
					platform_fee: platformFeeInCurrency,
					seller_net_amount: sellerNetAmountInCurrency,
					commission_rate: 10.00,
					country_code: 'BG'
				})
				.select('id')
				.single();

			if (orderError) {
				paymentLogger.error('Order creation error', orderError, {
					productId,
					buyerId,
					sellerId
				});
				return { error: new Error(`Failed to create order: ${orderError.message}`) };
			}

			if (!order) {
				return { error: new Error('Failed to create order: no data returned') };
			}

			// Create payment intent
			const paymentIntent = await this.stripe.paymentIntents.create({
				amount,
				currency,
				customer: customer.id,
				description: `Purchase: ${product.title}`,
				metadata: {
					product_id: productId,
					buyer_id: buyerId,
					seller_id: sellerId,
					order_id: order.id,
					...metadata
				}
			});

			// TODO: Create pending transaction record with order_id
			// This requires the transactions table to be defined in the database schema
			/*
			const totalAmount = amount / 100;
			const { error: transactionError } = await this.supabase
				.from('transactions')
				.insert({
					order_id: order.id,
					stripe_payment_intent_id: paymentIntent.id,
					buyer_id: buyerId,
					seller_id: sellerId,
					amount_total: totalAmount,
					commission_amount: Math.round(totalAmount * 0.05 * 100) / 100,
					seller_earnings: Math.round(totalAmount * 0.95 * 100) / 100,
					currency: currency.toUpperCase(),
					payment_status: 'pending'
				});

			if (transactionError) {
				paymentLogger.error('Failed to create transaction record', transactionError, {
					orderId: order.id,
					paymentIntentId: paymentIntent.id
				});
			}
			*/

			return {
				paymentIntent,
				clientSecret: paymentIntent.client_secret || undefined
			};
		} catch (error) {
			paymentLogger.error('Error creating payment intent', error, {
				productId: params.productId,
				buyerId: params.buyerId,
				sellerId: params.sellerId
			});
			return { error: error as Error };
		}
	}

	/**
	 * Get or create Stripe customer for user
	 */
	private async getOrCreateCustomerForUser(userId: string, userEmail?: string): Promise<Stripe.Customer | null> {
		try {
			// Get user profile
			const { data: profile } = await this.supabase
				.from('profiles')
				.select('username')
				.eq('id', userId)
				.single();

			// Use provided email or fallback
			const email = userEmail || "";

			// Skip existing customer check since stripe_customer_id doesn't exist

			// Create new customer
			const customer = await this.stripe.customers.create({
				email: email || '',
				name: profile?.username || undefined,
				metadata: {
					supabase_user_id: userId
				}
			});

			// Note: not saving stripe_customer_id since column doesn't exist

			return customer;
		} catch (error) {
			paymentLogger.error('Error creating customer', error, {
				userId,
				userEmail
			});
			return null;
		}
	}

	/**
	 * Create ONE-TIME payment for account upgrade (NOT a subscription!)
	 * These are one-off payments for premium/brand accounts
	 */
	async createSubscription(params: SubscriptionCreateParams): Promise<{
		subscription?: Stripe.Subscription;
		clientSecret?: string;
		error?: Error;
	}> {
		try {
			const { userId, planId } = params;

			// Get current user's email directly from auth
			const { data: { user: currentUser } } = await this.supabase.auth.getUser();
			
			if (!currentUser?.email) {
				paymentLogger.error('No authenticated user found for subscription creation', new Error('User not authenticated'), {
					userId,
					planId
				});
				throw new Error('Please sign in to continue');
			}

			// TODO: Get plan details when subscription_plans table is available
			/*
			const { data: plan } = await this.supabase
				.from('subscription_plans')
				.select('id, name, plan_type, price_monthly, currency')
				.eq('id', planId)
				.single();
			*/

			// Temporary stub until subscription_plans table is implemented
			throw new Error('Subscription functionality is not currently available');

			/*
			// Rest of the subscription logic - disabled until database tables are available
			if (!plan) throw new Error('Plan not found');

			// Calculate final price with discount
			const finalPrice = plan.price_monthly * (1 - discountPercent / 100);
			const amountInCents = Math.round(finalPrice * 100);

			// Create or retrieve Stripe customer
			const customer = await this.getOrCreateCustomer(userId, {
				email: currentUser.email
			});

			// Create simple ONE-TIME payment intent (NOT a subscription!)
			const paymentIntent = await this.stripe.paymentIntents.create({
				amount: amountInCents,
				currency: plan.currency.toLowerCase(),
				customer: customer.id,
				description: `${plan.name} Account Upgrade (One-Time)`,
				metadata: {
					user_id: userId,
					plan_id: planId,
					plan_type: plan.plan_type,
					discount_percent: discountPercent.toString(),
					payment_type: 'one_time_upgrade'
				}
			});

			// Store payment record (webhook will update profile when payment succeeds)
			await this.supabase
				.from('user_payments')
				.insert({
					user_id: userId,
					stripe_payment_intent_id: paymentIntent.id,
					amount: finalPrice,
					currency: plan.currency,
					status: 'pending',
					plan_type: plan.plan_type,
					metadata: {
						plan_id: planId,
						discount_percent: discountPercent
					}
				});

			// Return immediately with client secret - no bullshit!
			return {
				clientSecret: paymentIntent.client_secret || ''
			};
			*/

		} catch (error) {
			paymentLogger.error('Error creating account upgrade payment', error, {
				userId: params.userId,
				planId: params.planId
			});
			return { error: error as Error };
		}
	}

	/**
	 * Cancel subscription
	 */
        async cancelSubscription(userId: string, subscriptionId: string): Promise<{
                success: boolean;
                error?: Error;
        }> {
                void userId;
                void subscriptionId;
                // TODO: Re-implement when subscription functionality is available
                return { success: false, error: new Error('Subscription cancellation functionality is not currently available') };

		/*
		try {
			// Cancel in Stripe (at period end)
			await this.stripe.subscriptions.update(subscriptionId, {
				cancel_at_period_end: true
			});

			// Update database
			await this.supabase
				.from('user_subscriptions')
				.update({ status: 'canceled' })
				.eq('user_id', userId)
				.eq('stripe_subscription_id', subscriptionId);

			return { success: true };
		} catch (error) {
			paymentLogger.error('Error canceling subscription', error, {
				userId,
				subscriptionId
			});
			return { success: false, error: error as Error };
		}
		*/
	}

	/**
	 * Update subscription plan
	 */
        async updateSubscription(params: {
                userId: string;
                subscriptionId: string;
                newPlanId: string;
        }): Promise<{
                subscription?: Stripe.Subscription;
                error?: Error;
        }> {
                void params;
                // TODO: Re-implement when subscription functionality is available
                return { error: new Error('Subscription update functionality is not currently available') };

		/*
		try {
			const { subscriptionId, newPlanId } = params;

			// Get new plan details
			const { data: newPlan } = await this.supabase
				.from('subscription_plans')
				.select('id, name, plan_type, price_monthly, currency')
				.eq('id', newPlanId)
				.single();
			if (!newPlan) throw new Error('New plan not found');

			// Get current subscription
			const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
			if (!subscription) throw new Error('Subscription not found');

			// Create new price for the plan
			const newPrice = await this.stripe.prices.create({
				unit_amount: Math.round(newPlan.price_monthly * 100),
				currency: newPlan.currency.toLowerCase(),
				recurring: { interval: 'month' },
				product_data: {
					name: newPlan.name
				}
			});

			// Update subscription with new price
			const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
				items: [{
					id: subscription.items.data[0]?.id || '',
					price: newPrice.id
				}],
				proration_behavior: 'create_prorations'
			});

			// Update database
			await this.supabase
				.from('user_subscriptions')
				.update({
					plan_id: newPlanId,
					processed_at: new Date().toISOString()
				})
				.eq('stripe_subscription_id', subscriptionId);

			return { subscription: updatedSubscription };
		} catch (error) {
			paymentLogger.error('Error updating subscription', error, {
				userId: params.userId,
				subscriptionId: params.subscriptionId,
				newPlanId: params.newPlanId
			});
			return { error: error as Error };
		}
		*/
	}

	/**
	 * Process webhook event
	 */
	async processWebhook(event: Stripe.Event): Promise<void> {
		switch (event.type) {
			case 'payment_intent.succeeded':
				await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
				break;
				
			case 'payment_intent.payment_failed':
				await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
				break;
				
			case 'customer.subscription.created':
			case 'customer.subscription.updated':
				await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
				break;
				
			case 'customer.subscription.deleted':
				await this.handleSubscriptionCancellation(event.data.object as Stripe.Subscription);
				break;
				
			case 'invoice.payment_succeeded':
				await this.handleInvoicePayment(event.data.object as Stripe.Invoice);
				break;
		}
	}

	/**
	 * Handle successful payment
	 */
	private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
		const { metadata } = paymentIntent;
		
		// Check if this is an account upgrade payment
		if (metadata.payment_type === 'one_time_upgrade' && metadata.user_id) {
			// Update user profile with new account type
			await this.supabase
				.from('profiles')
				.update({
					account_type: metadata.plan_type as 'basic' | 'premium' | 'pro',
					subscription_tier: metadata.plan_type as 'basic' | 'premium' | 'pro',
					verified: true,
					processed_at: new Date().toISOString()
				})
				.eq('id', metadata.user_id);

			// TODO: Update payment record when user_payments table is available
			/*
			await this.supabase
				.from('user_payments')
				.update({
					status: 'completed',
					processed_at: new Date().toISOString()
				})
				.eq('stripe_payment_intent_id', paymentIntent.id);
			*/

		} else if (metadata.product_id) {
			// Handle product purchase
			await this.handleProductPurchaseSuccess(paymentIntent);
		}
	}

	/**
	 * Handle product purchase success
	 */
	private async handleProductPurchaseSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
		const { metadata } = paymentIntent;
		
		// TODO: Update transaction status when transactions table is implemented
		/*
		await this.supabase
			.from('transactions')
			.update({
				status: 'completed',
				processed_at: new Date().toISOString()
			})
			.eq('stripe_payment_intent_id', paymentIntent.id);
		*/

		// Mark product as sold
		if (metadata.product_id) {
			await this.supabase
				.from('products')
				.update({
					is_sold: true,
					sold_at: new Date().toISOString()
				})
				.eq('id', metadata.product_id as string);
		}

		// Create order record
		if (metadata.buyer_id && metadata.seller_id && metadata.product_id) {
			await this.supabase
				.from('orders')
				.insert({
					buyer_id: metadata.buyer_id as string,
					seller_id: metadata.seller_id as string,
					product_id: metadata.product_id as string,
					transaction_id: paymentIntent.id,
					status: 'paid',
					total_amount: Number(metadata.product_price) + Number(metadata.shipping_cost)
				});
		}
	}

	/**
	 * Handle payment failure
	 */
	private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
		const { metadata } = paymentIntent;
		
		if (metadata.payment_type === 'one_time_upgrade') {
			// TODO: Update payment record when user_payments table is available
			/*
			await this.supabase
				.from('user_payments')
				.update({
					status: 'failed',
					failed_at: new Date().toISOString()
				})
				.eq('stripe_payment_intent_id', paymentIntent.id);
			*/
		} else if (metadata.product_id) {
			// TODO: Update transaction status when transactions table is implemented
			/*
			await this.supabase
				.from('transactions')
				.update({
					status: 'failed',
					failed_at: new Date().toISOString()
				})
				.eq('stripe_payment_intent_id', paymentIntent.id);
			*/
		}
	}

	/**
	 * Handle subscription update
	 */
	private async handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
		// TODO: Re-implement when user_subscriptions table is available
		paymentLogger.info('Subscription update ignored - not implemented', {
			subscriptionId: subscription.id,
			status: subscription.status
		});

		/*
		// const { metadata: _metadata } = subscription; // Future metadata processing

		const periodStart = 'current_period_start' in subscription && typeof subscription.current_period_start === 'number'
			? new Date((subscription.current_period_start as number) * 1000).toISOString()
			: null;
		const periodEnd = 'current_period_end' in subscription && typeof subscription.current_period_end === 'number'
			? new Date((subscription.current_period_end as number) * 1000).toISOString()
			: null;

		await this.supabase
			.from('user_subscriptions')
			.update({
				status: subscription.status as 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid',
				current_period_start: periodStart,
				current_period_end: periodEnd,
				processed_at: new Date().toISOString()
			})
			.eq('stripe_subscription_id', subscription.id);
		*/
	}

	/**
	 * Handle subscription cancellation
	 */
	private async handleSubscriptionCancellation(subscription: Stripe.Subscription): Promise<void> {
		// TODO: Re-implement when user_subscriptions table is available
		paymentLogger.info('Subscription cancellation ignored - not implemented', {
			subscriptionId: subscription.id
		});

		/*
		await this.supabase
			.from('user_subscriptions')
			.update({
				status: 'canceled',
				canceled_at: new Date().toISOString()
			})
			.eq('stripe_subscription_id', subscription.id);

		// Update user profile
		await this.supabase
			.from('profiles')
			.update({
				account_type: 'personal',
				subscription_tier: 'free'
			})
			.eq('id', subscription.metadata.supabase_user_id as string);
		*/
	}

	/**
	 * Handle invoice payment
	 */
	private async handleInvoicePayment(invoice: Stripe.Invoice): Promise<void> {
		const subscriptionId = 'subscription' in invoice && invoice.subscription
			? invoice.subscription
			: null;
		if (!subscriptionId) return;

		const subscription = typeof subscriptionId === 'string'
			? await this.stripe.subscriptions.retrieve(subscriptionId)
			: subscriptionId;

		if (subscription) {
			await this.handleSubscriptionUpdate(subscription as Stripe.Subscription);
		}
	}

	/**
	 * Get or create Stripe customer
	 */
	private async getOrCreateCustomer(userId: string, details: {
		email?: string;
		name?: string;
	}): Promise<Stripe.Customer> {
		// First, try to find existing customer
		const customers = details.email ? await this.stripe.customers.list({
			email: details.email,
			limit: 1
		}) : { data: [] };

		if (customers.data.length > 0) {
			return customers.data[0]!;
		}

		// Create new customer
		return await this.stripe.customers.create({
			email: details.email || '',
			name: details.name || undefined,
			metadata: {
				supabase_user_id: userId
			}
		});
	}

	/**
	 * Create transaction record - Future transaction creation
	 */
	// private async _createTransaction(params: {
	// 	orderId: string;
	// 	sellerId: string;
	// 	buyerId: string;
	// 	productPrice: number;
	// 	shippingCost: number;
	// 	stripePaymentIntentId: string;
	// }): Promise<{ transaction: Transaction | null; error: Error | null }> {
	// 	const totalAmount = params.productPrice + params.shippingCost;
	// 	const { data, error } = await this.supabase
	// 		.from('transactions')
	// 		.insert({
	// 			order_id: params.orderId,
	// 			seller_id: params.sellerId,
	// 			buyer_id: params.buyerId,
	// 			amount_total: totalAmount,
	// 			commission_amount: Math.round(totalAmount * 0.05),
	// 			seller_earnings: Math.round(totalAmount * 0.95),
	// 			currency: 'BGN',
	// 			status: 'pending',
	// 			payment_status: 'pending',
	// 			stripe_payment_intent_id: params.stripePaymentIntentId
	// 		})
	// 		.select()
	// 		.single();

	// 	return { transaction: data, error };
	// }

	/**
	 * Update transaction status
	 */
	async updateTransactionStatus(
		transactionId: string,
		status: 'pending' | 'completed' | 'failed' | 'refunded'
	): Promise<{ success: boolean; error: Error | null }> {
		// TODO: Implement when transactions table is available
		/*
		const { error } = await this.supabase
			.from('transactions')
			.update({
				status,
				...(status === 'completed' ? { processed_at: new Date().toISOString() } : {})
			})
			.eq('id', transactionId);

		return { success: !error, error };
		*/

		paymentLogger.info('Transaction status update requested but not implemented', {
			transactionId,
			status
		});

		return { success: true, error: null };
	}

	/**
	 * Create notifications for order events
	 */
	private async createOrderNotifications(order: Order, orderType: 'single' | 'bundle'): Promise<void> {
		try {
			const orderTypeText = orderType === 'bundle' ? 'bundle order' : 'order';
			const itemsText = orderType === 'bundle' && order.items_count ? ` (${order.items_count} items)` : '';
			
			// Notification for buyer
			await this.supabase
				.from('admin_notifications')
				.insert({
					user_id: order.buyer_id,
					type: 'purchase',
					title: 'Order Confirmed 🎉',
					message: `Your ${orderTypeText}${itemsText} has been confirmed! The seller will ship within 3 days.`,
					order_id: order.id,
					category: 'purchases',
					priority: 'high',
					action_url: '/dashboard/order-management',
					data: {
						order_id: order.id,
						total_amount: order.total_amount,
						currency: order.currency || 'BGN',
						is_bundle: orderType === 'bundle',
						items_count: order.items_count || 1
					}
				});

			// Notification for seller
			await this.supabase
				.from('admin_notifications')
				.insert({
					user_id: order.seller_id,
					type: 'sale',
					title: 'New Sale! 💰',
					message: `You have a new ${orderTypeText}${itemsText}! Ship within 3 days to maintain your rating.`,
					order_id: order.id,
					category: 'sales',
					priority: 'urgent',
					action_required: true,
					action_url: '/dashboard/order-management',
					data: {
						order_id: order.id,
						total_amount: order.total_amount,
						seller_earnings: order.seller_net_amount || (order.total_amount * 0.9),
						currency: order.currency || 'BGN',
						is_bundle: orderType === 'bundle',
						items_count: order.items_count || 1,
						shipping_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
					}
				});
		} catch (error) {
			paymentLogger.warn('Error creating order notifications', {
				orderId: order.id,
				orderType,
				error: error instanceof Error ? error.message : String(error)
			});
			// Don't throw - notifications are not critical
		}
	}

	/**
	 * Confirm payment intent and process order
	 */
	async confirmPaymentIntent(params: {
		paymentIntentId: string;
		buyerId: string;
	}): Promise<{
		success: boolean;
		order?: Order;
		// transaction?: Transaction; // TODO: Define when transactions table is implemented
		error?: Error;
	}> {
		try {
			// Retrieve the payment intent from Stripe
			const paymentIntent = await this.stripe.paymentIntents.retrieve(params.paymentIntentId);

			if (!paymentIntent) {
				return { success: false, error: new Error('Payment intent not found') };
			}

			if (paymentIntent.status !== 'succeeded') {
				return { success: false, error: new Error('Payment has not succeeded yet') };
			}

			const { metadata } = paymentIntent;

			// Verify buyer matches
			if (metadata.buyer_id !== params.buyerId) {
				return { success: false, error: new Error('Unauthorized payment confirmation') };
			}

			// Check if this is a bundle order
			const isBundle = metadata.isBundle === 'true';
			const itemCount = parseInt(metadata.itemCount || '1');
			
			if (isBundle && metadata.itemIds) {
				// Handle bundle order confirmation
				const itemIds = metadata.itemIds.split(',');
				
				// Update order status (order was already created during payment intent creation)
				const { data: order, error: orderError } = await this.supabase
					.from('orders')
					.update({
						status: 'paid',
						processed_at: new Date().toISOString(),
						is_bundle: true,
						items_count: itemCount
					})
					.eq('id', metadata.order_id as string)
					.select()
					.single();

				if (orderError) {
					paymentLogger.error('Error updating bundle order', orderError, {
						orderId: metadata.order_id,
						paymentIntentId: params.paymentIntentId,
						bundleOrder: 'true'
					});
					return { success: false, error: new Error('Failed to update order') };
				}

				// Create order items for bundle
				const _orderItems = await Promise.all(
					itemIds.map(async (productId) => {
						const { data: product } = await this.supabase
							.from('products')
							.select('price, title')
							.eq('id', productId)
							.single();
						
						if (!metadata.order_id) {
							throw new Error(`Missing order_id in metadata for product ${productId}`);
						}
						
						return {
							order_id: metadata.order_id,
							product_id: productId,
							price: product?.price || 0,
							quantity: 1
						};
					})
				);

				// Insert order items
				await this.supabase
					.from('order_items')
					.insert(_orderItems);

				// Mark all products as sold
				await this.supabase
					.from('products')
					.update({
						is_sold: true,
						sold_at: new Date().toISOString()
					})
					.in('id', itemIds);

				// TODO: Mark bundle session as completed when bundle_sessions table is available
				/*
				if (metadata.bundleSessionId) {
					await this.supabase
						.from('bundle_sessions')
						.update({ completed: true })
						.eq('id', metadata.bundleSessionId);
				}
				*/

				// TODO: Update transaction status when transactions table is implemented
				/*
				const { data: transaction } = await this.supabase
					.from('transactions')
					.update({
						payment_status: 'completed',
						status: 'completed',
						processed_at: new Date().toISOString()
					})
					.eq('stripe_payment_intent_id', params.paymentIntentId)
					.select()
					.single();
				*/

				// Create notifications for both buyer and seller
				await this.createOrderNotifications(order, 'bundle');

				return {
					success: true,
					order,
					// transaction: transaction || undefined // TODO: Return when transactions implemented
				};
				
			} else {
				// Single product order (original logic)
				const { data: order, error: orderError } = await this.supabase
					.from('orders')
					.update({
						status: 'paid',
						processed_at: new Date().toISOString()
					})
					.eq('id', metadata.order_id as string)
					.select()
					.single();

				if (orderError) {
					paymentLogger.error('Error updating single order', orderError, {
						orderId: metadata.order_id,
						paymentIntentId: params.paymentIntentId,
						bundleOrder: 'false'
					});
					return { success: false, error: new Error('Failed to update order') };
				}

				// Create single order item
				if (!metadata.order_id || !metadata.product_id) {
					throw new Error('Missing order_id or product_id in metadata');
				}
				
				// TODO: Insert order item when order_items table is available
				/*
				await this.supabase
					.from('order_items')
					.insert({
						order_id: metadata.order_id,
						product_id: metadata.product_id,
						price: order.total_amount - (order.shipping_cost || 0) - (order.service_fee || 0),
						quantity: 1
					});
				*/

				// TODO: Update transaction status when transactions table is implemented
				/*
				const { data: transaction, error: transactionError } = await this.supabase
					.from('transactions')
					.update({
						payment_status: 'completed',
						status: 'completed',
						processed_at: new Date().toISOString()
					})
					.eq('stripe_payment_intent_id', params.paymentIntentId)
					.select()
					.single();

				if (transactionError) {
					paymentLogger.error('Error updating transaction', transactionError, {
						paymentIntentId: params.paymentIntentId,
						orderId: metadata.order_id
					});
				}
				*/

				// Mark product as sold
				await this.supabase
					.from('products')
					.update({
						is_sold: true,
						sold_at: new Date().toISOString()
					})
					.eq('id', metadata.product_id as string);

				// Create notifications for both buyer and seller
				await this.createOrderNotifications(order, 'single');

				return {
					success: true,
					order,
					// transaction: transaction || undefined // TODO: Return when transactions implemented
				};
			}

		} catch (error) {
			paymentLogger.error('Error confirming payment intent', error, {
				paymentIntentId: params.paymentIntentId,
				buyerId: params.buyerId
			});
			return { success: false, error: error as Error };
		}
	}
}
