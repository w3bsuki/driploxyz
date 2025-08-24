import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Transaction, Product, Order } from '@repo/database';

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
	 * Create payment intent for product purchase
	 */
	async createPaymentIntent(params: PaymentCreateParams): Promise<PaymentIntentResult> {
		try {
			const { productId, buyerId, sellerId, shippingAddress, billingAddress } = params;

			// Get product details
			const { data: product, error: productError } = await this.supabase
				.from('products')
				.select('id, title, price, shipping_cost, status, seller_id, seller:profiles!seller_id(id, username, stripe_customer_id)')
				.eq('id', productId)
				.single();

			if (productError || !product) {
				return { error: new Error('Product not found') };
			}

			if (product.status !== 'active') {
				return { error: new Error('Product is not available') };
			}

			// Calculate total amount
			const productPrice = product.price;
			const shippingCost = product.shipping_cost || 0;
			const totalAmount = productPrice + shippingCost;
			
			// Stripe requires amount in cents
			const amountInCents = Math.round(totalAmount * 100);

			// Get or create Stripe customer for buyer
			const customer = await this.getOrCreateCustomerForUser(buyerId);
			if (!customer) {
				return { error: new Error('Failed to create customer') };
			}

			// Create payment intent
			const paymentIntent = await this.stripe.paymentIntents.create({
				amount: amountInCents,
				currency: 'bgn',
				customer: customer.id,
				description: `Purchase: ${product.title}`,
				metadata: {
					product_id: productId,
					buyer_id: buyerId,
					seller_id: sellerId,
					product_price: productPrice.toString(),
					shipping_cost: shippingCost.toString()
				},
				shipping: {
					name: shippingAddress.name,
					address: {
						line1: shippingAddress.street,
						city: shippingAddress.city,
						postal_code: shippingAddress.postalCode,
						country: shippingAddress.country
					}
				}
			});

			// Create pending transaction record
			const { error: transactionError } = await this.supabase
				.from('transactions')
				.insert({
					stripe_payment_intent_id: paymentIntent.id,
					buyer_id: buyerId,
					seller_id: sellerId,
					product_id: productId,
					amount: productPrice,
					shipping_cost: shippingCost,
					total_amount: totalAmount,
					currency: 'BGN',
					status: 'pending',
					payment_method: 'card'
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
	private async getOrCreateCustomerForUser(userId: string): Promise<Stripe.Customer | null> {
		try {
			// Get user profile
			const { data: profile } = await this.supabase
				.from('profiles')
				.select('stripe_customer_id, username')
				.eq('id', userId)
				.single();

			// Get user email from auth
			const { data: authData } = await this.supabase.auth.getUser();
			const email = authData?.user?.email;

			// If customer exists, return it
			if (profile?.stripe_customer_id) {
				try {
					const customer = await this.stripe.customers.retrieve(profile.stripe_customer_id);
					if (customer && !customer.deleted) {
						return customer as Stripe.Customer;
					}
				} catch (error) {
					console.error('Failed to retrieve existing customer:', error);
				}
			}

			// Create new customer
			const customer = await this.stripe.customers.create({
				email: email,
				name: profile?.username || undefined,
				metadata: {
					supabase_user_id: userId
				}
			});

			// Save customer ID to profile
			await this.supabase
				.from('profiles')
				.update({ stripe_customer_id: customer.id })
				.eq('id', userId);

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
				clientSecret: paymentIntent.client_secret || undefined
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
					id: subscription.items.data[0].id,
					price: newPrice.id
				}],
				proration_behavior: 'create_prorations'
			});

			// Update database
			await this.supabase
				.from('user_subscriptions')
				.update({ 
					plan_id: newPlanId,
					updated_at: new Date().toISOString()
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
					updated_at: new Date().toISOString()
				})
				.eq('id', metadata.user_id);

			// Update payment record
			await this.supabase
				.from('user_payments')
				.update({
					status: 'completed',
					completed_at: new Date().toISOString()
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
				completed_at: new Date().toISOString()
			})
			.eq('stripe_payment_intent_id', paymentIntent.id);

		// Mark product as sold
		await this.supabase
			.from('products')
			.update({
				status: 'sold',
				sold_at: new Date().toISOString(),
				buyer_id: metadata.buyer_id
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
				updated_at: new Date().toISOString()
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
		if (!invoice.subscription) return;
		
		const subscription = typeof invoice.subscription === 'string' 
			? await this.stripe.subscriptions.retrieve(invoice.subscription)
			: invoice.subscription;

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
			return customers.data[0];
		}

		// Create new customer
		return await this.stripe.customers.create({
			email: details.email,
			name: details.name,
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
		productId: string;
		productPrice: number;
		shippingCost: number;
		stripePaymentIntentId: string;
	}): Promise<{ transaction: Transaction | null; error: Error | null }> {
		const { data, error } = await this.supabase
			.from('transactions')
			.insert({
				order_id: params.orderId,
				seller_id: params.sellerId,
				buyer_id: params.buyerId,
				product_id: params.productId,
				amount: params.productPrice,
				shipping_cost: params.shippingCost,
				total_amount: params.productPrice + params.shippingCost,
				currency: 'BGN',
				status: 'pending',
				payment_method: 'card',
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
				...(status === 'completed' ? { completed_at: new Date().toISOString() } : {})
			})
			.eq('id', transactionId);

		return { success: !error, error };
	}
}