import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import { createStripeService } from './stripe.js';
import { validatePayoutMethod, validatePayoutAmount } from '$lib/utils/payments.js';
import type { PayoutMethod } from '$lib/stripe/types.js';

type Tables = Database['public']['Tables'];
type Payout = Tables['payouts']['Row'];
type PayoutInsert = Tables['payouts']['Insert'];

// PayoutMethod is now imported from types

export class PayoutService {
	constructor(private supabase: SupabaseClient<Database>) {}

	/**
	 * Request a payout for a seller
	 */
	async requestPayout(sellerId: string, amount: number, payoutMethod: PayoutMethod): Promise<{ payout: Payout | null; error: Error | null }> {
		try {
			// Use centralized Stripe service for payout handling
			const stripeService = createStripeService(this.supabase);
			
			const result = await stripeService.requestPayout({
				sellerId,
				amount,
				payoutMethod
			});

			return {
				payout: result.payout || null,
				error: result.error || null
			};
		} catch (error) {
			console.error('Error requesting payout:', error);
			return { payout: null, error: error as Error };
		}
	}

	/**
	 * Get seller's payout history
	 */
	async getSellerPayouts(sellerId: string) {
		return await this.supabase
			.from('payouts')
			.select('*')
			.eq('seller_id', sellerId)
			.order('created_at', { ascending: false });
	}

	/**
	 * Get pending payouts for admin processing
	 */
	async getPendingPayouts() {
		return await this.supabase
			.from('payouts')
			.select(`
				*,
				profiles!seller_id(username, full_name, email)
			`)
			.eq('status', 'pending')
			.order('requested_at', { ascending: true });
	}

	/**
	 * Update payout status (admin only)
	 */
	async updatePayoutStatus(
		payoutId: string, 
		status: 'processing' | 'completed' | 'failed',
		processedBy: string,
		notes?: string
	) {
		const updates: any = {
			status,
			processed_by: processedBy,
			updated_at: new Date().toISOString()
		};

		if (status === 'processing') {
			updates.processed_at = new Date().toISOString();
		} else if (status === 'completed') {
			updates.completed_at = new Date().toISOString();
		}

		if (notes) {
			updates.notes = notes;
		}

		const { error } = await this.supabase
			.from('payouts')
			.update(updates)
			.eq('id', payoutId);

		if (error) throw error;

		// If payout completed, update seller's last payout date
		if (status === 'completed') {
			const { data: payout } = await this.supabase
				.from('payouts')
				.select('seller_id')
				.eq('id', payoutId)
				.single();

			if (payout) {
				await this.supabase
					.from('profiles')
					.update({ last_payout_at: new Date().toISOString() })
					.eq('id', payout.seller_id);
			}
		}

		return { success: true };
	}

	/**
	 * Validate payout method format
	 */
	validatePayoutMethod(method: PayoutMethod): { valid: boolean; error?: string } {
		// Use centralized validation utility
		return validatePayoutMethod(method);
	}

	/**
	 * Get seller's earnings summary
	 */
	async getSellerEarnings(sellerId: string) {
		const { data: profile } = await this.supabase
			.from('profiles')
			.select('total_earnings, pending_payout, last_payout_at')
			.eq('id', sellerId)
			.single();

		const { data: completedPayouts } = await this.supabase
			.from('payouts')
			.select('amount')
			.eq('seller_id', sellerId)
			.eq('status', 'completed');

		const totalPaidOut = completedPayouts?.reduce((sum, payout) => sum + payout.amount, 0) || 0;

		return {
			totalEarnings: profile?.total_earnings || 0,
			pendingPayout: profile?.pending_payout || 0,
			totalPaidOut,
			lastPayoutAt: profile?.last_payout_at
		};
	}
}