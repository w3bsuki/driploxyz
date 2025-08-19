import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

type Tables = Database['public']['Tables'];
type Transaction = Tables['transactions']['Row'];
type TransactionInsert = Tables['transactions']['Insert'];

export class TransactionService {
	constructor(private supabase: SupabaseClient<Database>) {}

	/**
	 * Calculate commission and seller amount for a transaction
	 */
	calculateCommission(productPrice: number, shippingCost: number = 0, commissionRate: number = 0.05) {
		const totalAmount = productPrice + shippingCost;
		const commissionAmount = Math.round(productPrice * commissionRate * 100) / 100; // Round to 2 decimals
		const sellerAmount = Math.round((productPrice - commissionAmount + shippingCost) * 100) / 100;
		
		return {
			totalAmount,
			commissionAmount,
			sellerAmount,
			commissionRate
		};
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
			const { totalAmount, commissionAmount, sellerAmount, commissionRate } = 
				this.calculateCommission(params.productPrice, params.shippingCost || 0);

			const transactionData: TransactionInsert = {
				order_id: params.orderId,
				seller_id: params.sellerId,
				buyer_id: params.buyerId,
				product_id: params.productId,
				product_price: params.productPrice,
				shipping_cost: params.shippingCost || 0,
				total_amount: totalAmount,
				commission_rate: commissionRate,
				commission_amount: commissionAmount,
				seller_amount: sellerAmount,
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

			// Update order with transaction details
			await this.supabase
				.from('orders')
				.update({
					commission_amount: commissionAmount,
					seller_amount: sellerAmount,
					transaction_id: transaction.id
				})
				.eq('id', params.orderId);

			return { transaction, error: null };
		} catch (error) {
			console.error('Error creating transaction:', error);
			return { transaction: null, error: error as Error };
		}
	}

	/**
	 * Update seller's total earnings and pending payout
	 */
	private async updateSellerEarnings(sellerId: string, amount: number) {
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