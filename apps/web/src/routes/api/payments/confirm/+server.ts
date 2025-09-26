import { json } from '@sveltejs/kit';
import { createStripeService } from '$lib/services/stripe';
import { stripe } from '$lib/stripe/server';
import { enforceRateLimit } from '$lib/security/rate-limiter';
import type { RequestHandler } from './$types';
import { sendEmail, emailTemplates } from '$lib/email/resend';
import type { PaymentIntentConfirmParams } from '$lib/stripe/types';
import { paymentLogger } from '$lib/utils/log';

export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
	// Critical rate limiting for payment confirmation
	const rateLimitResponse = await enforceRateLimit(
		request, 
		getClientAddress, 
		'payment',
		`payment-confirm:${getClientAddress()}`
	);
	if (rateLimitResponse) return rateLimitResponse;
	
	try {
		// Get current user session
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) {
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
			buyerId: user.id
		};

		const result = await stripeService.confirmPaymentIntent(params);

		if (!result.success) {
			paymentLogger.error('Error confirming payment', result.error, {
				paymentIntentId,
				buyerId: params.buyerId
			});
			return json({ error: result.error?.message || 'Failed to confirm payment' }, { status: 500 });
		}

		// Send confirmation emails (only if RESEND_API_KEY is configured)
		if (process.env.RESEND_API_KEY && result.order) {
			try {
				// Get product details for emails
				const { data: product } = await locals.supabase
					.from('products')
					.select('title, price')
					.eq('id', result.order.product_id)
					.single();

				// Get buyer email
				const { data: buyer } = await locals.supabase.auth.admin.getUserById(user.id);
				
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
						product: { title: product.title, price: product.price ?? 0 },
						buyer: { username: buyer.user?.user_metadata?.username || 'Buyer' },
						seller: { username: seller?.username || 'Seller' },
						amount: result.order.total_amount,
						total_amount: result.order.total_amount
					}));
				}
				
				// Send sold notification to seller
				const { data: sellerAuth } = await locals.supabase.auth.admin.getUserById(result.order.seller_id);
				if (sellerAuth?.user?.email && product) {
					await sendEmail(sellerAuth.user.email, emailTemplates.productSold({
						product: { title: product.title },
						amount: result.order.total_amount,
						commission: 0, // TODO: Implement when transaction system is fully integrated
						net_amount: result.order.total_amount * 100 // Convert to cents
					}));
				}
			} catch (emailError) {
				paymentLogger.warn('Error sending confirmation emails', {
					orderId: result.order?.id,
					error: emailError instanceof Error ? emailError.message : String(emailError)
				});
				// Don't fail the payment confirmation for email errors
			}
		}
		
		return json({
			success: true,
			orderId: result.order?.id
			// transactionId: TODO - implement when transaction system is fully integrated
		});
	} catch (error) {
		paymentLogger.error('Error confirming payment', error, {
			userId: locals.session?.user?.id
		});
		return json({ error: 'Failed to confirm payment' }, { status: 500 });
	}
};