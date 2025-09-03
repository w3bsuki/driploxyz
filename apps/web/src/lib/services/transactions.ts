import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import { calculateCommission as calculateCommissionUtil } from '$lib/utils/payments';

type Tables = Database['public']['Tables'];
type Transaction = Tables['transactions']['Row'];
type TransactionInsert = Tables['transactions']['Insert'];

export class TransactionService {
	constructor(private supabase: SupabaseClient<Database>) {}

	/**
	 * Calculate commission and seller amount for a transaction
	 */
	calculateCommission(productPrice: number, shippingCost: number = 0, commissionRate: number = 0.05) {
		// Use centralized calculation utility
		return calculateCommissionUtil(productPrice, shippingCost, commissionRate);
	}

	/**
	 * Create a new transaction record when payment is successful
	 */
	async createTransaction(params: {
		orderId: string;
		sellerId: string;
		buyerId: string;
		productId: string;
		productPrice: number;
		shippingCost?: number;
		stripePaymentIntentId: string;
	}): Promise<{ transaction: Transaction | null; error: Error | null }> {
		try {
			const { totalAmount, commissionAmount, sellerAmount } = 
				this.calculateCommission(params.productPrice, params.shippingCost || 0);

			const transactionData: TransactionInsert = {
				order_id: params.orderId,
				seller_id: params.sellerId,
				buyer_id: params.buyerId,
				amount_total: totalAmount,
				commission_amount: commissionAmount,
				seller_earnings: sellerAmount,
				stripe_payment_intent_id: params.stripePaymentIntentId,
				payment_status: 'completed',
				processed_at: new Date().toISOString()
			};

			const { data: transaction, error } = await this.supabase
				.from('transactions')
				.insert(transactionData)
				.select()
				.single();

			if (error) throw error;

			// Update seller's earnings
			await this.updateSellerEarnings(params.sellerId, sellerAmount);

			// Update order with commission details (using correct columns)
			await this.supabase
				.from('orders')
				.update({
					platform_fee: commissionAmount,
					seller_net_amount: sellerAmount
				})
				.eq('id', params.orderId);

			return { transaction, error: null };
		} catch (error) {
			return { transaction: null, error: error as Error };
		}
	}

	/**
	 * Update seller's total earnings and pending payout
	 */
	private async updateSellerEarnings(sellerId: string, amount: number) {
		const { data: profile } = await this.supabase
			.from('profiles')
			.select('current_balance, total_sales_value')
			.eq('id', sellerId)
			.single();

		if (profile) {
			await this.supabase
				.from('profiles')
				.update({
					current_balance: (profile.current_balance || 0) + amount,
					total_sales_value: (profile.total_sales_value || 0) + amount
				})
				.eq('id', sellerId);
		}
	}

	/**
	 * Get seller's transaction history
	 */
	async getSellerTransactions(sellerId: string, limit: number = 50) {
		return await this.supabase
			.from('transactions')
			.select(`
				*,
				orders!inner(status),
				products!inner(title, price),
				profiles!buyer_id(username, avatar_url)
			`)
			.eq('seller_id', sellerId)
			.order('created_at', { ascending: false })
			.limit(limit);
	}

	/**
	 * Get platform's total commission
	 */
	async getPlatformCommissions(startDate?: string, endDate?: string) {
		let query = this.supabase
			.from('transactions')
			.select('commission_amount, created_at')
			.eq('payment_status', 'completed');

		if (startDate) {
			query = query.gte('created_at', startDate);
		}
		if (endDate) {
			query = query.lte('created_at', endDate);
		}

		return await query;
	}
}