import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import { createStripeService } from './stripe';
import { validatePayoutMethod, validatePayoutAmount } from '$lib/utils/payments';
import type { PayoutMethod } from '$lib/stripe/types';

type Tables = Database['public']['Tables'];
type Transaction = Tables['transactions']['Row'];
type TransactionUpdate = Tables['transactions']['Update'];

export class PayoutService {
	constructor(private supabase: SupabaseClient<Database>) {}

	/**
	 * Process payouts for completed transactions
	 */
	async processPayouts(sellerId: string): Promise<{ transactions: Transaction[] | null; error: Error | null }> {
		try {
			// Get completed transactions that haven't been paid out yet
			const { data: transactions, error } = await this.supabase
				.from('transactions')
				.select('*')
				.eq('seller_id', sellerId)
				.eq('status', 'completed')
				.is('payout_status', null)
				.order('created_at', { ascending: false });

			if (error) throw error;

			return {
				transactions: transactions || [],
				error: null
			};
		} catch (error) {
			console.error('Error processing payouts:', error);
			return { transactions: null, error: error as Error };
		}
	}

	/**
	 * Get seller's payout history
	 */
	async getSellerPayouts(sellerId: string) {
		return await this.supabase
			.from('transactions')
			.select('*')
			.eq('seller_id', sellerId)
			.not('payout_status', 'is', null)
			.order('payout_date', { ascending: false });
	}

	/**
	 * Get pending payouts for admin processing
	 */
	async getPendingPayouts() {
		return await this.supabase
			.from('transactions')
			.select(`
				*,
				profiles!seller_id(username, full_name)
			`)
			.eq('status', 'completed')
			.is('payout_status', null)
			.order('created_at', { ascending: true });
	}

	/**
	 * Update payout status (admin only)
	 */
	async updatePayoutStatus(
		transactionId: string, 
		status: 'processing' | 'completed' | 'failed',
		payoutReference?: string
	) {
		const updates: TransactionUpdate = {
			payout_status: status
		};

		if (status === 'processing') {
			updates.processed_at = new Date().toISOString();
		} else if (status === 'completed') {
			updates.payout_date = new Date().toISOString();
			updates.processed_at = new Date().toISOString();
			if (payoutReference) {
				updates.payout_reference = payoutReference;
			}
		}

		const { error } = await this.supabase
			.from('transactions')
			.update(updates)
			.eq('id', transactionId);

		if (error) throw error;

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
		// Get all completed transactions for this seller
		const { data: completedTransactions } = await this.supabase
			.from('transactions')
			.select('seller_earnings, payout_status, payout_date')
			.eq('seller_id', sellerId)
			.eq('status', 'completed');

		const totalEarnings = completedTransactions?.reduce((sum, txn) => sum + (txn.seller_earnings || 0), 0) || 0;
		const totalPaidOut = completedTransactions?.filter(txn => txn.payout_status === 'completed')
			.reduce((sum, txn) => sum + (txn.seller_earnings || 0), 0) || 0;
		const pendingPayout = totalEarnings - totalPaidOut;
		
		const lastPayout = completedTransactions?.filter(txn => txn.payout_date)
			.sort((a, b) => new Date(b.payout_date!).getTime() - new Date(a.payout_date!).getTime())[0];

		return {
			totalEarnings,
			pendingPayout,
			totalPaidOut,
			lastPayoutAt: lastPayout?.payout_date || null
		};
	}
}