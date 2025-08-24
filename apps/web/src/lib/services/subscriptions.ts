import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import { createStripeService } from './stripe.js';
import type { SubscriptionCreateParams } from '$lib/stripe/types.js';

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
			.select('id, plan_type, name, description, price_monthly, price_yearly, features, is_active')
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
				id, user_id, plan_id, status, created_at, current_period_start, current_period_end,
				subscription_plans(id, plan_type, name, price_monthly, features)
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
		stripeInstance: any,
		discountAmount: number = 0,
		discountCode: string = ''
	): Promise<{ subscriptionId?: string; clientSecret?: string; error?: Error }> {
		try {
			if (!stripeInstance) {
				return { error: new Error('Stripe instance required') };
			}
			
			// Get plan to calculate discount percent from amount
			const { data: plan } = await this.supabase
				.from('subscription_plans')
				.select('price_monthly')
				.eq('id', planId)
				.single();
				
			if (!plan) {
				return { error: new Error('Plan not found') };
			}
			
			const discountPercent = plan.price_monthly > 0 && discountAmount > 0
				? Math.round((discountAmount / plan.price_monthly) * 100)
				: 0;
			
			const stripeService = createStripeService(this.supabase, stripeInstance);
			
			const params: SubscriptionCreateParams = {
				userId,
				planId,
				discountPercent
			};

			const result = await stripeService.createSubscription(params);

			if (result.error) {
				return { error: result.error };
			}

			return {
				subscriptionId: result.subscription?.id,
				clientSecret: result.clientSecret
			};
		} catch (error) {
			console.error('Error creating Stripe subscription:', error);
			return { error: error as Error };
		}
	}

	/**
	 * Cancel user subscription
	 */
	async cancelSubscription(userId: string, subscriptionId: string, stripeInstance: any) {
		try {
			if (!stripeInstance) {
				return { error: new Error('Stripe instance required'), success: false };
			}
			
			const stripeService = createStripeService(this.supabase, stripeInstance);
			return await stripeService.cancelSubscription(userId, subscriptionId);
		} catch (error) {
			console.error('Error canceling subscription:', error);
			return { error: error as Error, success: false };
		}
	}

	/**
	 * Handle Stripe webhook for subscription updates
	 */
	async handleStripeWebhook(event: any, stripeInstance: any) {
		try {
			if (!stripeInstance) {
				return { success: false, error: new Error('Stripe instance required') };
			}
			
			const stripeService = createStripeService(this.supabase, stripeInstance);
			return await stripeService.processWebhook(event);
		} catch (error) {
			console.error('Error handling subscription webhook:', error);
			return { success: false, error: error as Error };
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