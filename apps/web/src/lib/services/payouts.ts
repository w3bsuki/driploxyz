import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

type Tables = Database['public']['Tables'];
type Payout = Tables['payouts']['Row'];
type PayoutInsert = Tables['payouts']['Insert'];

export interface PayoutMethod {
	type: 'revolut' | 'paypal' | 'card';
	details: string; // Revolut tag, PayPal email, or card details
	name?: string; // For display purposes
}

export class PayoutService {
	constructor(private supabase: SupabaseClient<Database>) {}

	/**
	 * Request a payout for a seller
	 */
	async requestPayout(sellerId: string, amount: number, payoutMethod: PayoutMethod): Promise<{ payout: Payout | null; error: Error | null }> {
		try {
			// Check seller's pending payout amount
			const { data: profile } = await this.supabase
				.from('profiles')
				.select('pending_payout, payout_method')
				.eq('id', sellerId)
				.single();

			if (!profile) {
				throw new Error('Seller profile not found');
			}

			if ((profile.pending_payout || 0) < amount) {
				throw new Error('Insufficient pending payout amount');
			}

			// Minimum payout threshold (e.g., 20 BGN)
			const MINIMUM_PAYOUT = 20;
			if (amount < MINIMUM_PAYOUT) {
				throw new Error(`Minimum payout amount is ${MINIMUM_PAYOUT} BGN`);
			}

			// Get transactions for this payout
			const { data: transactions } = await this.supabase
				.from('transactions')
				.select('id, seller_amount')
				.eq('seller_id', sellerId)
				.eq('payment_status', 'completed')
				.order('created_at', { ascending: true });

			// Calculate which transactions to include
			let totalAmount = 0;
			const transactionIds: string[] = [];
			
			for (const transaction of transactions || []) {
				if (totalAmount + transaction.seller_amount <= amount) {
					totalAmount += transaction.seller_amount;
					transactionIds.push(transaction.id);
				}
			}

			// Create payout record
			const payoutData: PayoutInsert = {
				seller_id: sellerId,
				amount: totalAmount,
				payout_method: payoutMethod,
				transaction_ids: transactionIds,
				status: 'pending'
			};

			const { data: payout, error } = await this.supabase
				.from('payouts')
				.insert(payoutData)
				.select()
				.single();

			if (error) throw error;

			// Update seller's pending payout
			await this.supabase
				.from('profiles')
				.update({
					pending_payout: (profile.pending_payout || 0) - totalAmount
				})
				.eq('id', sellerId);

			return { payout, error: null };
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
		}
		return { valid: true };
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