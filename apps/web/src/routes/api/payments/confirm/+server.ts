import { json } from '@sveltejs/kit';
import { createStripeService } from '$lib/services/stripe.js';
import { stripe } from '$lib/stripe/server.js';
import type { RequestHandler } from './$types.js';
import type { Database } from '@repo/database';
import { sendEmail, emailTemplates } from '$lib/email/resend';
import type { PaymentIntentConfirmParams } from '$lib/stripe/types.js';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Get current user session
		const { session } = await locals.safeGetSession();
		if (!session?.user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const { paymentIntentId } = await request.json();

		if (!paymentIntentId) {
			return json({ error: 'Payment intent ID is required' }, { status: 400 });
		}

		if (!stripe) {
			return json({ error: 'Stripe not configured' }, { status: 500 });
		}

		const stripeService = createStripeService(locals.supabase, stripe);
		
		const params: PaymentIntentConfirmParams = {
			paymentIntentId,
			buyerId: session.user.id
		};

		const result = await stripeService.confirmPaymentIntent(params);

		if (!result.success) {
			console.error('Error confirming payment:', result.error);
			return json({ error: result.error?.message || 'Failed to confirm payment' }, { status: 500 });
		}

		// Send confirmation emails (only if RESEND_API_KEY is configured)
		if (process.env.RESEND_API_KEY && result.order && result.transaction) {
			try {
				// Get product details for emails
				const { data: product } = await locals.supabase
					.from('products')
					.select('title')
					.eq('id', result.order.product_id)
					.single();

				// Get buyer email
				const { data: buyer } = await locals.supabase.auth.admin.getUserById(session.user.id);
				
				// Get seller details
				const { data: seller } = await locals.supabase
					.from('profiles')
					.select('username')
					.eq('id', result.order.seller_id)
					.single();
				
				if (buyer?.user?.email && product) {
					// Send order confirmation to buyer
					await sendEmail(buyer.user.email, emailTemplates.orderConfirmation({
						id: result.order.id,
						product: { title: product.title },
						total_amount: result.order.total_amount,
						seller: { username: seller?.username || 'Seller' }
					}));
				}
				
				// Send sold notification to seller
				const { data: sellerAuth } = await locals.supabase.auth.admin.getUserById(result.order.seller_id);
				if (sellerAuth?.user?.email && product) {
					await sendEmail(sellerAuth.user.email, emailTemplates.productSold({
						product: { title: product.title },
						amount: result.order.total_amount,
						commission: result.transaction.commission_amount * 100, // Convert to cents
						net_amount: result.transaction.seller_earnings * 100
					}));
				}
			} catch (emailError) {
				console.error('Error sending confirmation emails:', emailError);
				// Don't fail the payment confirmation for email errors
			}
		}
		
		return json({
			success: true,
			orderId: result.order?.id,
			transactionId: result.transaction?.id
		});
	} catch (error) {
		console.error('Error confirming payment:', error);
		return json({ error: 'Failed to confirm payment' }, { status: 500 });
	}
};