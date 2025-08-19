import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types.js';
import { stripe } from '$lib/stripe/server.js';

type Tables = Database['public']['Tables'];
type SubscriptionPlan = Tables['subscription_plans']['Row'];
type UserSubscription = Tables['user_subscriptions']['Row'];
type UserSubscriptionInsert = Tables['user_subscriptions']['Insert'];

export class SubscriptionService {
	constructor(private supabase: SupabaseClient<Database>) {}

	/**
	 * Get all available subscription plans
	 */
	async getAvailablePlans() {
		return await this.supabase
			.from('subscription_plans')
			.select('*')
			.eq('is_active', true)
			.order('price_monthly', { ascending: true });
	}

	/**
	 * Get user's current subscriptions
	 */
	async getUserSubscriptions(userId: string) {
		return await this.supabase
			.from('user_subscriptions')
			.select(`
				*,
				subscription_plans(*)
			`)
			.eq('user_id', userId)
			.eq('status', 'active');
	}

	/**
	 * Check if user has active subscription for a plan type
	 */
	async hasActiveSubscription(userId: string, planType: 'premium' | 'brand'): Promise<boolean> {
		const { data } = await this.supabase
			.from('user_subscriptions')
			.select(`
				subscription_plans!inner(plan_type)
			`)
			.eq('user_id', userId)
			.eq('status', 'active')
			.eq('subscription_plans.plan_type', planType)
			.maybeSingle();

		return !!data;
	}

	/**
	 * Create Stripe subscription for user
	 */
	async createStripeSubscription(
		userId: string,
		planId: string,
		discountPercent: number = 0
	): Promise<{ subscriptionId?: string; clientSecret?: string; error?: Error }> {
		// Starting subscription creation
		try {
			// Get user email for Stripe customer
			const { data: profile } = await this.supabase
				.from('profiles')
				.select('username')
				.eq('id', userId)
				.single();

			if (!profile) {
				throw new Error('User profile not found');
			}

			// Get subscription plan details
			const { data: plan } = await this.supabase
				.from('subscription_plans')
				.select('*')
				.eq('id', planId)
				.single();

			// Retrieved plan data
			if (!plan) {
				throw new Error('Subscription plan not found');
			}

			// Calculate price with discount
			let price = plan.price_monthly;
			if (discountPercent > 0) {
				price = price * (1 - discountPercent / 100);
			}

			// Create Stripe customer
			const customer = await stripe.customers.create({
				metadata: {
					supabase_user_id: userId,
					username: profile.username
				}
			});
			// Customer created successfully

			// Create Stripe product first (separate from price)
			const stripeProduct = await stripe.products.create({
				name: plan.name,
				description: plan.description || undefined // Use undefined instead of null/empty string
			});
			// Product created successfully

			// Then create price using the product ID
			const priceAmount = Math.round(price * 100);
			const stripePrice = await stripe.prices.create({
				unit_amount: priceAmount, // Convert to cents
				currency: plan.currency.toLowerCase(),
				recurring: { interval: 'month' },
				product: stripeProduct.id
			});
			// Price created successfully

			// Create Stripe subscription
			const subscription = await stripe.subscriptions.create({
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
			// Subscription created successfully

			// Create subscription record in our database
			const subscriptionData: UserSubscriptionInsert = {
				user_id: userId,
				plan_id: planId,
				stripe_subscription_id: subscription.id,
				status: 'trialing', // Will be updated by webhook
				current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
				current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
				discount_percent: discountPercent
			};

			await this.supabase
				.from('user_subscriptions')
				.insert(subscriptionData);

			const invoice = subscription.latest_invoice as any;
			const paymentIntent = invoice?.payment_intent;
			
			// Payment intent and subscription setup completed

			return {
				subscriptionId: subscription.id,
				clientSecret: paymentIntent?.client_secret
			};

		} catch (error) {
			console.error('Error creating Stripe subscription:', error);
			return { error: error as Error };
		}
	}

	/**
	 * Cancel user subscription
	 */
	async cancelSubscription(userId: string, subscriptionId: string) {
		try {
			// Cancel in Stripe
			await stripe.subscriptions.update(subscriptionId, {
				cancel_at_period_end: true
			});

			// Update our database
			await this.supabase
				.from('user_subscriptions')
				.update({ status: 'canceled' })
				.eq('user_id', userId)
				.eq('stripe_subscription_id', subscriptionId);

			return { success: true };
		} catch (error) {
			console.error('Error canceling subscription:', error);
			return { error: error as Error };
		}
	}

	/**
	 * Handle Stripe webhook for subscription updates
	 */
	async handleStripeWebhook(event: any) {
		const subscription = event.data.object;
		const { supabase_user_id, plan_id } = subscription.metadata;

		if (!supabase_user_id || !plan_id) {
			console.warn('Missing metadata in subscription webhook');
			return;
		}

		const updates: any = {
			status: subscription.status,
			current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
			current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
			updated_at: new Date().toISOString()
		};

		// Handle trial end
		if (subscription.trial_end) {
			updates.trial_end = new Date(subscription.trial_end * 1000).toISOString();
		}

		await this.supabase
			.from('user_subscriptions')
			.update(updates)
			.eq('user_id', supabase_user_id)
			.eq('stripe_subscription_id', subscription.id);

		// Update user profile subscription tier
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
						subscription_expires_at: updates.current_period_end
					})
					.eq('id', supabase_user_id);

				// Reset premium boosts for premium users
				if (plan.plan_type === 'premium') {
					await this.supabase
						.from('profiles')
						.update({ premium_boosts_remaining: 10 })
						.eq('id', supabase_user_id);
				}
			}
		} else if (['canceled', 'past_due', 'unpaid'].includes(subscription.status)) {
			// Downgrade user
			await this.supabase
				.from('profiles')
				.update({
					subscription_tier: 'free',
					premium_boosts_remaining: 0,
					subscription_expires_at: null
				})
				.eq('id', supabase_user_id);
		}
	}

	/**
	 * Check if brand user can list products
	 */
	async canBrandUserListProducts(userId: string): Promise<boolean> {
		const { data: profile } = await this.supabase
			.from('profiles')
			.select('account_type, subscription_tier')
			.eq('id', userId)
			.single();

		if (!profile) return false;

		// Personal accounts can always list
		if (profile.account_type === 'personal') return true;

		// Brand accounts need active brand subscription
		if (profile.account_type === 'brand') {
			return profile.subscription_tier === 'brand';
		}

		return false;
	}

	/**
	 * Get subscription statistics for admin
	 */
	async getSubscriptionStats() {
		const { data: subscriptions } = await this.supabase
			.from('user_subscriptions')
			.select(`
				status,
				subscription_plans(plan_type, price_monthly)
			`);

		const stats = {
			totalSubscriptions: subscriptions?.length || 0,
			activeSubscriptions: subscriptions?.filter(s => s.status === 'active').length || 0,
			premiumUsers: subscriptions?.filter(s => 
				s.status === 'active' && s.subscription_plans?.plan_type === 'premium'
			).length || 0,
			brandUsers: subscriptions?.filter(s => 
				s.status === 'active' && s.subscription_plans?.plan_type === 'brand'
			).length || 0,
			monthlyRecurringRevenue: subscriptions
				?.filter(s => s.status === 'active')
				.reduce((sum, s) => sum + (s.subscription_plans?.price_monthly || 0), 0) || 0
		};

		return stats;
	}

	/**
	 * Apply discount campaign (e.g., 50% off for first 100 users)
	 */
	async applyEarlyBirdDiscount(userId: string): Promise<{ eligible: boolean; discountPercent: number }> {
		// Check how many users have used the early bird discount
		const { count } = await this.supabase
			.from('user_subscriptions')
			.select('*', { count: 'exact', head: true })
			.gt('discount_percent', 0);

		const EARLY_BIRD_LIMIT = 100;
		const DISCOUNT_PERCENT = 50;

		if ((count || 0) < EARLY_BIRD_LIMIT) {
			return { eligible: true, discountPercent: DISCOUNT_PERCENT };
		}

		return { eligible: false, discountPercent: 0 };
	}
}