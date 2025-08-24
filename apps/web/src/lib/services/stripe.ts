import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import type { Stripe } from 'stripe';
import type {
	PaymentIntentCreateParams,
	PaymentIntentConfirmParams,
	SubscriptionCreateParams,
	PayoutParams,
	TransactionRecord,
	StripeWebhookEvent,
	PaymentCalculation
} from '$lib/stripe/types.js';

type Tables = Database['public']['Tables'];
type Profile = Tables['profiles']['Row'];
type Transaction = Tables['transactions']['Row'];
type Order = Tables['orders']['Row'];
type UserSubscription = Tables['user_subscriptions']['Row'];
type Payout = Tables['payouts']['Row'];

export class StripeService {
	constructor(private supabase: SupabaseClient<Database>, private stripe: Stripe) {
		if (!stripe) {
			throw new Error('Stripe instance is required');
		}
	}

	// =====================================
	// PAYMENT INTENTS (One-time payments)
	// =====================================

	/**
	 * Create a payment intent for product purchase
	 */
	async createPaymentIntent(params: PaymentIntentCreateParams): Promise<{
		paymentIntent?: Stripe.PaymentIntent;
		clientSecret?: string;
		error?: Error;
	}> {
		try {
			const { amount, currency, productId, sellerId, buyerId, metadata = {} } = params;

			// Validate minimum amount (50 cents)
			if (amount < 50) {
				throw new Error('Amount must be at least 50 cents');
			}

			// Get product details for validation
			const { data: product } = await this.supabase
				.from('products')
				.select('*')
				.eq('id', productId)
				.single();

			if (!product) {
				throw new Error('Product not found');
			}

			if (product.is_sold === true || product.status === 'sold') {
				throw new Error('Product is no longer available');
			}

			// Calculate fees and totals (product.price is in dollars, convert to cents)
			const productPriceCents = Math.round(product.price * 100);
			const calculation = this.calculatePaymentAmounts(productPriceCents);

			const paymentIntent = await this.stripe.paymentIntents.create({
				amount,
				currency: currency.toLowerCase(),
				automatic_payment_methods: { enabled: true },
				metadata: {
					productId,
					sellerId,
					buyerId,
					productPrice: productPriceCents.toString(),
					serviceFee: calculation.serviceFee.toString(),
					...metadata
				},
				description: `Purchase of ${product.title}`
				// Note: Stripe Connect features (application_fee_amount, transfer_data) 
				// removed until seller onboarding with Stripe Connect is implemented
			});

			return {
				paymentIntent,
				...(paymentIntent.client_secret ? { clientSecret: paymentIntent.client_secret } : {})
			};

		} catch (error) {
			console.error('Error creating payment intent:', error);
			return { error: error as Error };
		}
	}

	/**
	 * Confirm payment intent and process order
	 */
	async confirmPaymentIntent(params: PaymentIntentConfirmParams): Promise<{
		order?: Order;
		transaction?: Transaction;
		success: boolean;
		error?: Error;
	}> {
		try {
			const { paymentIntentId, buyerId } = params;

			// Retrieve the payment intent from Stripe
			const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

			if (paymentIntent.status !== 'succeeded') {
				return { success: false, error: new Error(`Payment status: ${paymentIntent.status}`) };
			}

			const { productId, sellerId, productPrice } = paymentIntent.metadata;
			if (!productId || !sellerId || !productPrice) {
				throw new Error('Invalid payment metadata');
			}

			// Verify product is still available
			const { data: product } = await this.supabase
				.from('products')
				.select('*')
				.eq('id', productId)
				.single();

			if (!product || product.is_sold === true || product.status === 'sold') {
				throw new Error('Product is no longer available');
			}

			// Calculate amounts (productPrice from metadata is in cents)
			const calculation = this.calculatePaymentAmounts(parseFloat(productPrice));

			// Create order
			const { data: order, error: orderError } = await this.supabase
				.from('orders')
				.insert({
					buyer_id: buyerId,
					seller_id: sellerId,
					product_id: productId,
					status: 'paid',
					total_amount: paymentIntent.amount / 100, // Convert from cents to dollars
					shipping_cost: calculation.shippingCost / 100, // Convert from cents to dollars
					tax_amount: 0,
					service_fee: calculation.serviceFee / 100, // Convert from cents to dollars
					notes: `Payment Intent: ${paymentIntentId}`,
					currency: 'EUR'
				})
				.select()
				.single();

			if (orderError) throw orderError;

			// Create transaction record
			const transaction = await this.createTransaction({
				orderId: order.id,
				sellerId,
				buyerId,
				productId,
				productPrice: parseFloat(productPrice) / 100, // Convert cents to dollars
				shippingCost: calculation.shippingCost / 100, // Convert cents to dollars
				stripePaymentIntentId: paymentIntentId
			});

			// Update product status
			await this.supabase
				.from('products')
				.update({ 
					is_sold: true, 
					status: 'sold',
					sold_at: new Date().toISOString() 
				})
				.eq('id', productId);

			// Send notifications
			await this.sendPaymentNotifications(order, product);

			return {
				order,
				transaction: transaction.transaction || undefined,
				success: true
			};

		} catch (error) {
			console.error('Error confirming payment intent:', error);
			return { success: false, error: error as Error };
		}
	}

	// =====================================
	// SUBSCRIPTIONS
	// =====================================

	/**
	 * Create a subscription for user
	 */
	async createSubscription(params: SubscriptionCreateParams): Promise<{
		subscription?: Stripe.Subscription;
		clientSecret?: string;
		error?: Error;
	}> {
		try {
			const { userId, planId, discountPercent = 0 } = params;

			// Get user profile
			const { data: profile } = await this.supabase
				.from('profiles')
				.select('username')
				.eq('id', userId)
				.single();

			// Get email from auth.users since profiles doesn't have email
			const { data: authUser } = await this.supabase
				.from('auth.users')
				.select('email')
				.eq('id', userId)
				.single();

			if (!profile && !authUser) throw new Error('User not found');
			
			const userEmail = authUser?.email || '';

			// Get subscription plan
			const { data: plan } = await this.supabase
				.from('subscription_plans')
				.select('*')
				.eq('id', planId)
				.single();

			if (!plan) throw new Error('Subscription plan not found');

			// Create or retrieve Stripe customer
			const customer = await this.getOrCreateCustomer(userId, {
				email: userEmail,
				name: profile?.username || 'User'
			});

			// Create Stripe product and price
			const stripeProduct = await this.stripe.products.create({
				name: plan.name,
				description: plan.description || undefined
			});

			const price = plan.price_monthly * (1 - discountPercent / 100);
			const stripePrice = await this.stripe.prices.create({
				unit_amount: Math.round(price * 100),
				currency: plan.currency.toLowerCase(),
				recurring: { interval: 'month' },
				product: stripeProduct.id
			});

			// Create subscription with immediate payment collection
			const subscription = await this.stripe.subscriptions.create({
				customer: customer.id,
				items: [{ price: stripePrice.id }],
				payment_behavior: 'default_incomplete',
				payment_settings: { save_default_payment_method: 'on_subscription' },
				expand: ['latest_invoice.payment_intent'],
				metadata: {
					supabase_user_id: userId,
					plan_id: planId,
					plan_type: plan.plan_type,
					discount_percent: discountPercent.toString()
				}
			});

			// Get the payment intent - it should be expanded
			let clientSecret: string | undefined;
			
			if (typeof subscription.latest_invoice === 'object' && subscription.latest_invoice !== null) {
				const invoice = subscription.latest_invoice as Stripe.Invoice;
				
				// Check if payment_intent is expanded
				if (typeof invoice.payment_intent === 'object' && invoice.payment_intent !== null) {
					const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
					clientSecret = paymentIntent.client_secret || undefined;
				} else if (typeof invoice.payment_intent === 'string') {
					// If not expanded, retrieve it separately
					const paymentIntent = await this.stripe.paymentIntents.retrieve(invoice.payment_intent);
					clientSecret = paymentIntent.client_secret || undefined;
				}
			}
			
			// If still no client secret, try getting the subscription again with expansion
			if (!clientSecret) {
				const expandedSub = await this.stripe.subscriptions.retrieve(subscription.id, {
					expand: ['latest_invoice.payment_intent']
				});
				
				if (typeof expandedSub.latest_invoice === 'object' && expandedSub.latest_invoice !== null) {
					const invoice = expandedSub.latest_invoice as Stripe.Invoice;
					if (typeof invoice.payment_intent === 'object' && invoice.payment_intent !== null) {
						const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
						clientSecret = paymentIntent.client_secret || undefined;
					}
				}
			}
			
			if (!clientSecret) {
				console.error('Failed to get client secret from subscription:', {
					subscriptionId: subscription.id,
					latestInvoice: subscription.latest_invoice
				});
				throw new Error('Unable to process payment. Please try again.');
			}

			// Create subscription record in database
			await this.supabase
				.from('user_subscriptions')
				.insert({
					user_id: userId,
					plan_id: planId,
					stripe_subscription_id: subscription.id,
					status: 'trialing',
					current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
					current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
					discount_percent: discountPercent
				});
			
			// Update user's profile account type
			await this.supabase
				.from('profiles')
				.update({ 
					account_type: plan.plan_type === 'brand' ? 'brand' : (plan.plan_type === 'premium' ? 'premium' : 'personal')
				})
				.eq('id', userId);

			return {
				subscription,
				clientSecret
			};

		} catch (error) {
			console.error('Error creating subscription:', error);
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

	// =====================================
	// PAYOUTS
	// =====================================

	/**
	 * Request payout for seller
	 */
	async requestPayout(params: PayoutParams): Promise<{
		payout?: Payout;
		error?: Error;
	}> {
		try {
			const { sellerId, amount, payoutMethod } = params;

			// Validate payout method
			const validation = this.validatePayoutMethod(payoutMethod);
			if (!validation.valid) {
				throw new Error(validation.error);
			}

			// Check seller's available balance
			const { data: profile } = await this.supabase
				.from('profiles')
				.select('pending_payout')
				.eq('id', sellerId)
				.single();

			if (!profile || (profile.pending_payout || 0) < amount) {
				throw new Error('Insufficient balance for payout');
			}

			// Minimum payout validation
			if (amount < 20) { // 20 BGN/EUR minimum
				throw new Error('Minimum payout amount is €20');
			}

			// Create payout record
			const { data: payout, error } = await this.supabase
				.from('payouts')
				.insert({
					seller_id: sellerId,
					amount,
					payout_method: payoutMethod,
					status: 'pending'
				})
				.select()
				.single();

			if (error) throw error;

			// Update seller's pending balance
			await this.supabase
				.from('profiles')
				.update({
					pending_payout: (profile.pending_payout || 0) - amount
				})
				.eq('id', sellerId);

			return { payout };

		} catch (error) {
			console.error('Error requesting payout:', error);
			return { error: error as Error };
		}
	}

	// =====================================
	// WEBHOOKS
	// =====================================

	/**
	 * Process Stripe webhook events
	 */
	async processWebhook(event: StripeWebhookEvent): Promise<{ success: boolean; error?: Error }> {
		try {
			switch (event.type) {
				case 'payment_intent.succeeded':
					await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
					break;

				case 'invoice.payment_succeeded':
					await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
					break;

				case 'customer.subscription.updated':
				case 'customer.subscription.deleted':
					await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
					break;

				default:
					console.log(`Unhandled event type: ${event.type}`);
			}

			return { success: true };

		} catch (error) {
			console.error('Error processing webhook:', error);
			return { success: false, error: error as Error };
		}
	}

	// =====================================
	// UTILITIES
	// =====================================

	/**
	 * Calculate payment amounts with fees
	 */
	public calculatePaymentAmounts(productPrice: number): PaymentCalculation {
		// Buyer Protection Fee: 5% + €0.70 fixed (similar to Vinted)
		const serviceFeeRate = 0.05; // 5% buyer protection
		const fixedFee = 70; // €0.70 in cents
		const shippingCost = 500; // €5.00 in cents
		const taxRate = 0; // Can be configured based on location

		const serviceFee = Math.round(productPrice * serviceFeeRate) + fixedFee;
		const taxAmount = Math.round(productPrice * taxRate);
		const totalAmount = productPrice + serviceFee + shippingCost + taxAmount;
		const sellerAmount = productPrice; // Seller gets full product price (we don't deduct fees from sellers)

		return {
			productPrice,
			serviceFee,
			shippingCost,
			taxAmount,
			totalAmount,
			sellerAmount,
			serviceFeeRate
		};
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
		try {
			// Convert productPrice from dollars to cents for calculation
			const productPriceCents = Math.round(params.productPrice * 100);
			const calculation = this.calculatePaymentAmounts(productPriceCents);

			const { data: transaction, error } = await this.supabase
				.from('transactions')
				.insert({
					order_id: params.orderId,
					seller_id: params.sellerId,
					buyer_id: params.buyerId,
					stripe_payment_intent_id: params.stripePaymentIntentId,
					amount_total: calculation.totalAmount / 100, // Convert cents to euros
					commission_amount: calculation.serviceFee / 100, // Convert cents to euros  
					seller_earnings: calculation.sellerAmount / 100, // Convert cents to euros
					currency: 'EUR',
					status: 'completed',
					product_price: params.productPrice,
					shipping_cost: params.shippingCost,
					payment_status: 'completed',
					processed_at: new Date().toISOString(),
					metadata: {
						productId: params.productId,
						serviceFeeRate: calculation.serviceFeeRate
					}
				})
				.select()
				.single();

			if (error) throw error;

			// Update seller earnings
			await this.updateSellerEarnings(params.sellerId, calculation.sellerAmount / 100);

			return { transaction, error: null };

		} catch (error) {
			console.error('Error creating transaction:', error);
			return { transaction: null, error: error as Error };
		}
	}

	/**
	 * Update seller earnings
	 */
	private async updateSellerEarnings(sellerId: string, amount: number): Promise<void> {
		const { data: profile } = await this.supabase
			.from('profiles')
			.select('total_earnings, pending_payout')
			.eq('id', sellerId)
			.single();

		if (profile) {
			await this.supabase
				.from('profiles')
				.update({
					total_earnings: (profile.total_earnings || 0) + amount,
					pending_payout: (profile.pending_payout || 0) + amount
				})
				.eq('id', sellerId);
		}
	}

	/**
	 * Validate payout method
	 */
	private validatePayoutMethod(method: any): { valid: boolean; error?: string } {
		if (!method?.type || !method?.details) {
			return { valid: false, error: 'Payout method type and details are required' };
		}

		switch (method.type) {
			case 'revolut':
				if (!method.details.startsWith('@')) {
					return { valid: false, error: 'Revolut tag must start with @' };
				}
				if (method.details.length < 3) {
					return { valid: false, error: 'Revolut tag too short' };
				}
				break;

			case 'paypal':
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(method.details)) {
					return { valid: false, error: 'Invalid PayPal email format' };
				}
				break;

			case 'card':
				if (method.details.length < 10) {
					return { valid: false, error: 'Card details too short' };
				}
				break;

			default:
				return { valid: false, error: 'Unsupported payout method type' };
		}

		return { valid: true };
	}

	/**
	 * Send payment notifications
	 */
	private async sendPaymentNotifications(order: Order, product: any): Promise<void> {
		// Create notification for seller
		await this.supabase
			.from('notifications')
			.insert({
				user_id: order.seller_id,
				type: 'sale',
				title: 'Product Sold!',
				message: `Your item "${product.title}" has been sold for €${(order.total_amount / 100).toFixed(2)}`,
				related_id: order.id,
				related_table: 'orders'
			});

		// Create notification for buyer
		await this.supabase
			.from('notifications')
			.insert({
				user_id: order.buyer_id,
				type: 'purchase',
				title: 'Purchase Confirmed!',
				message: `You successfully purchased "${product.title}"`,
				related_id: order.id,
				related_table: 'orders'
			});
	}

	// =====================================
	// WEBHOOK HANDLERS
	// =====================================

	private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
		// This is handled by the confirm endpoint, but we can add additional processing here
		console.log(`Payment intent succeeded: ${paymentIntent.id}`);
	}

	private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
		// Handle subscription payment success
		if (invoice.subscription) {
			console.log(`Subscription payment succeeded: ${invoice.subscription}`);
		}
	}

	private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
		const { supabase_user_id, plan_id } = subscription.metadata;

		if (!supabase_user_id || !plan_id) {
			console.warn('Missing metadata in subscription webhook');
			return;
		}

		// Update subscription record
		await this.supabase
			.from('user_subscriptions')
			.update({
				status: subscription.status as any,
				current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
				current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
				updated_at: new Date().toISOString()
			})
			.eq('user_id', supabase_user_id)
			.eq('stripe_subscription_id', subscription.id);

		// Update user profile based on subscription status
		if (subscription.status === 'active') {
			const { data: plan } = await this.supabase
				.from('subscription_plans')
				.select('plan_type')
				.eq('id', plan_id)
				.single();

			if (plan) {
				await this.supabase
					.from('profiles')
					.update({
						subscription_tier: plan.plan_type,
						subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString()
					})
					.eq('id', supabase_user_id);
			}
		} else if (['canceled', 'past_due', 'unpaid'].includes(subscription.status)) {
			// Downgrade user
			await this.supabase
				.from('profiles')
				.update({
					subscription_tier: 'free',
					subscription_expires_at: null
				})
				.eq('id', supabase_user_id);
		}
	}
}

// Export factory function - stripe instance must be passed from server-side code
export const createStripeService = (supabase: SupabaseClient<Database>, stripeInstance: Stripe) => {
	return new StripeService(supabase, stripeInstance);
};