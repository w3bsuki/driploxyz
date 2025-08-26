import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

type Tables = Database['public']['Tables'];

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

interface TransactionResult {
	transaction?: Transaction;
	order?: Order;
	error?: Error;
}

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

			// Create pending order record first
			const { data: order, error: orderError } = await this.supabase
				.from('orders')
				.insert({
					buyer_id: buyerId,
					seller_id: sellerId,
					product_id: productId,
					total_amount: amount / 100, // Convert from cents to currency units
					status: 'pending_payment'
				})
				.select('id')
				.single();

			if (orderError || !order) {
				return { error: new Error('Failed to create order') };
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

			// Create pending transaction record with order_id
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
				console.error('Failed to create transaction record:', transactionError);
			}

			return {
				paymentIntent,
				clientSecret: paymentIntent.client_secret || undefined
			};
		} catch (error) {
			console.error('Error creating payment intent:', error);
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
			console.error('Error creating customer:', error);
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
			const { userId, planId, discountPercent = 0 } = params;

			// Get current user's email directly from auth
			const { data: { user: currentUser } } = await this.supabase.auth.getUser();
			
			if (!currentUser?.email) {
				console.error('[Stripe] No authenticated user found');
				throw new Error('Please sign in to continue');
			}

			// Get plan details
			const { data: plan } = await this.supabase
				.from('subscription_plans')
				.select('id, name, plan_type, price_monthly, currency')
				.eq('id', planId)
				.single();

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

			console.log('[Stripe] Created one-time payment for account upgrade:', {
				paymentIntentId: paymentIntent.id,
				amount: amountInCents,
				planType: plan.plan_type,
				userId
			});

			// Return immediately with client secret - no bullshit!
			return {
				clientSecret: paymentIntent.client_secret || ''
			};

		} catch (error) {
			console.error('Error creating account upgrade payment:', error);
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
			console.error('Error canceling subscription:', error);
			return { success: false, error: error as Error };
		}
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
			console.error('Error updating subscription:', error);
			return { error: error as Error };
		}
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
		if (metadata.payment_type === 'one_time_upgrade') {
			// Update user profile with new account type
			await this.supabase
				.from('profiles')
				.update({
					account_type: metadata.plan_type as any,
					subscription_tier: metadata.plan_type as any,
					verified: true,
					processed_at: new Date().toISOString()
				})
				.eq('id', metadata.user_id);

			// Update payment record
			await this.supabase
				.from('user_payments')
				.update({
					status: 'completed',
					processed_at: new Date().toISOString()
				})
				.eq('stripe_payment_intent_id', paymentIntent.id);

			console.log('[Webhook] Account upgrade completed:', {
				userId: metadata.user_id,
				planType: metadata.plan_type
			});
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
		
		// Update transaction status
		await this.supabase
			.from('transactions')
			.update({
				status: 'completed',
				processed_at: new Date().toISOString()
			})
			.eq('stripe_payment_intent_id', paymentIntent.id);

		// Mark product as sold
		await this.supabase
			.from('products')
			.update({
				is_sold: true,
				sold_at: new Date().toISOString()
			})
			.eq('id', metadata.product_id);

		// Create order record
		await this.supabase
			.from('orders')
			.insert({
				buyer_id: metadata.buyer_id,
				seller_id: metadata.seller_id,
				product_id: metadata.product_id,
				transaction_id: paymentIntent.id,
				status: 'pending_shipment',
				total_amount: Number(metadata.product_price) + Number(metadata.shipping_cost)
			});
	}

	/**
	 * Handle payment failure
	 */
	private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
		const { metadata } = paymentIntent;
		
		if (metadata.payment_type === 'one_time_upgrade') {
			// Update payment record
			await this.supabase
				.from('user_payments')
				.update({
					status: 'failed',
					failed_at: new Date().toISOString()
				})
				.eq('stripe_payment_intent_id', paymentIntent.id);
		} else if (metadata.product_id) {
			// Update transaction status
			await this.supabase
				.from('transactions')
				.update({
					status: 'failed',
					failed_at: new Date().toISOString()
				})
				.eq('stripe_payment_intent_id', paymentIntent.id);
		}
	}

	/**
	 * Handle subscription update
	 */
	private async handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
		const { metadata } = subscription;
		
		await this.supabase
			.from('user_subscriptions')
			.update({
				status: subscription.status as any,
				current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
				current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
				processed_at: new Date().toISOString()
			})
			.eq('stripe_subscription_id', subscription.id);
	}

	/**
	 * Handle subscription cancellation
	 */
	private async handleSubscriptionCancellation(subscription: Stripe.Subscription): Promise<void> {
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
			.eq('id', subscription.metadata.supabase_user_id);
	}

	/**
	 * Handle invoice payment
	 */
	private async handleInvoicePayment(invoice: Stripe.Invoice): Promise<void> {
		const subscriptionId = (invoice as any).subscription;
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
	 * Create transaction record
	 */
	private async createTransaction(params: {
		orderId: string;
		sellerId: string;
		buyerId: string;
		productPrice: number;
		shippingCost: number;
		stripePaymentIntentId: string;
	}): Promise<{ transaction: Transaction | null; error: Error | null }> {
		const totalAmount = params.productPrice + params.shippingCost;
		const { data, error } = await this.supabase
			.from('transactions')
			.insert({
				order_id: params.orderId,
				seller_id: params.sellerId,
				buyer_id: params.buyerId,
				amount_total: totalAmount,
				commission_amount: Math.round(totalAmount * 0.05),
				seller_earnings: Math.round(totalAmount * 0.95),
				currency: 'BGN',
				status: 'pending',
				payment_status: 'pending',
				stripe_payment_intent_id: params.stripePaymentIntentId
			})
			.select()
			.single();

		return { transaction: data, error };
	}

	/**
	 * Update transaction status
	 */
	async updateTransactionStatus(
		transactionId: string,
		status: 'pending' | 'completed' | 'failed' | 'refunded'
	): Promise<{ success: boolean; error: Error | null }> {
		const { error } = await this.supabase
			.from('transactions')
			.update({ 
				status,
				...(status === 'completed' ? { processed_at: new Date().toISOString() } : {})
			})
			.eq('id', transactionId);

		return { success: !error, error };
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
		transaction?: Transaction;
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

			// Update order status
			const { data: order, error: orderError } = await this.supabase
				.from('orders')
				.update({
					status: 'paid',
					processed_at: new Date().toISOString()
				})
				.eq('id', metadata.order_id)
				.select()
				.single();

			if (orderError) {
				console.error('Error updating order:', orderError);
				return { success: false, error: new Error('Failed to update order') };
			}

			// Update transaction status
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
				console.error('Error updating transaction:', transactionError);
			}

			// Mark product as sold
			await this.supabase
				.from('products')
				.update({
					is_sold: true,
					sold_at: new Date().toISOString()
				})
				.eq('id', metadata.product_id);

			return {
				success: true,
				order,
				transaction
			};

		} catch (error) {
			console.error('Error confirming payment intent:', error);
			return { success: false, error: error as Error };
		}
	}
}
