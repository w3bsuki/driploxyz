import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import { createStripeService } from './stripe.js';
import { validatePayoutMethod, validatePayoutAmount } from '$lib/utils/payments.js';
import type { PayoutMethod } from '$lib/stripe/types.js';

type Tables = Database['public']['Tables'];
type Payout = Tables['payouts']['Row'];
type PayoutInsert = Tables['payouts']['Insert'];

export class PayoutService {
	constructor(private supabase: SupabaseClient<Database>) {}

	/**
	 * Request a payout for a seller
	 */
	async requestPayout(sellerId: string, amount: number, payoutMethod: PayoutMethod): Promise<{ payout: Payout | null; error: Error | null }> {
		try {
			// Validate payout method and amount
			const methodValidation = validatePayoutMethod(payoutMethod);
			if (!methodValidation.valid) {
				throw new Error(methodValidation.error);
			}

			// For now, skip balance validation - just check basic amount
			const amountValidation = validatePayoutAmount(amount, amount + 1000);
			if (!amountValidation.valid) {
				throw new Error(amountValidation.error);
			}

			// Check seller's available balance
			const { data: profile } = await this.supabase
				.from('profiles')
				.select('*')
				.eq('id', sellerId)
				.single();

			// Create payout record
			const { data: payout, error } = await this.supabase
				.from('payouts')
				.insert({
					user_id: sellerId,
					amount,
					method: payoutMethod,
					status: 'pending'
				})
				.select()
				.single();

			if (error) throw error;

			return {
				payout,
				error: null
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
			.eq('user_id', sellerId)
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
				profiles!user_id(username, full_name)
			`)
			.eq('status', 'pending')
			.order('created_at', { ascending: true });
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
			status
		};

		if (status === 'processing') {
			updates.processed_at = new Date().toISOString();
		} else if (status === 'completed') {
			updates.processed_at = new Date().toISOString();
		}

		const { error } = await this.supabase
			.from('payouts')
			.update(updates)
			.eq('id', payoutId);

		if (error) throw error;

		// If payout completed, update seller's updated_at
		if (status === 'completed') {
			const { data: payout } = await this.supabase
				.from('payouts')
				.select('user_id')
				.eq('id', payoutId)
				.single();

			if (payout) {
				await this.supabase
					.from('profiles')
					.update({ updated_at: new Date().toISOString() })
					.eq('id', payout.user_id);
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
			.select('*')
			.eq('id', sellerId)
			.single();

		const { data: completedPayouts } = await this.supabase
			.from('payouts')
			.select('amount')
			.eq('user_id', sellerId)
			.eq('status', 'completed');

		const totalPaidOut = completedPayouts?.reduce((sum, payout) => sum + payout.amount, 0) || 0;

		return {
			totalEarnings: 0,
			pendingPayout: 0,
			totalPaidOut,
			lastPayoutAt: profile?.updated_at
		};
	}
}