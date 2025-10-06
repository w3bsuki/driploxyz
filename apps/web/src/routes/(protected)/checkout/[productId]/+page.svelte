<script lang="ts">
	// import { page } from '$app/state'; // Currently unused
	import { goto } from '$app/navigation';
	import { getStripe } from '@repo/core/stripe';
	import { CheckoutSummary, Button, ErrorBoundary } from '@repo/ui';
	import type { Product } from '@repo/ui';
	import * as i18n from '@repo/i18n';

	interface Props {
		data: {
			product: Product;
		};
	}

	let { data }: Props = $props();
	let { product } = data;

	let stripe: any = $state(null);
	let elements: any = $state(null);
	let clientSecret = $state('');
	let loading = $state(false);
	let error = $state('');

	// Shipping and buyer protection fees (in cents)
	const shippingCost = 500; // €5.00
	const buyerProtectionFee = Math.round(product.price * 0.05) + 70; // 5% + €0.70 fixed fee
	// const totalAmount = product.price + shippingCost + buyerProtectionFee; // Currently unused

	// Initialize payment when component mounts
	$effect(() => {
		initializePayment();
	});

	async function initializePayment() {
		try {
			loading = true;
			
			// Initialize Stripe
			stripe = await getStripe();
			if (!stripe) {
				throw new Error('Failed to load Stripe');
			}

			// Create payment intent using our new API
			const response = await fetch('/api/checkout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					productId: product.id,
					selectedSize: null // Can be added later for size selection
				})
			});

			const data = await response.json();
			
			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Failed to create payment intent');
			}

			const { clientSecret: client_secret } = data;

			clientSecret = client_secret;

			// Initialize Stripe Elements
			elements = stripe.elements({
				clientSecret,
				appearance: {
					theme: 'stripe'
				}
			});

			// Wait for DOM to be ready, then mount payment element
			await new Promise(resolve => setTimeout(resolve, 100));
			
			const paymentElementContainer = document.getElementById('payment-element');
			if (paymentElementContainer) {
				const paymentElement = elements.create('payment');
				paymentElement.mount('#payment-element');
			} else {
				throw new Error('Payment element container not found');
			}

		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to initialize payment';
		} finally {
			loading = false;
		}
	}

	async function handlePaymentSuccess(paymentIntent: any) {
		try {
			// Confirm payment on server using our new API
			const response = await fetch('/api/checkout/confirm', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					paymentIntentId: paymentIntent.id
				})
			});

			const result = await response.json();
			
			if (result.success && result.order) {
				// Redirect to success page with order ID and payment intent
				await goto(`/payment/success?orderId=${result.order.id}&payment_intent=${paymentIntent.id}`);
			} else {
				error = result.message || i18n.checkout_paymentFailed();
			}
		} catch {
			// Payment initialization failed
			error = i18n.checkout_paymentFailed();
		}
	}

	// function handlePaymentError(errorMessage: string) {
	// 	error = errorMessage;
	// } // Currently unused

	async function handleSubmit(event: Event) {
		event.preventDefault();
		
		if (!stripe || !elements) {
			error = 'Payment system not initialized';
			return;
		}

		loading = true;
		error = '';

		try {
			const { error: submitError, paymentIntent } = await stripe.confirmPayment({
				elements,
				confirmParams: {
					return_url: `${window.location.origin}/payment/success`
				},
				redirect: 'if_required'
			});

			if (submitError) {
				error = submitError.message;
			} else if (paymentIntent?.status === 'succeeded') {
				await handlePaymentSuccess(paymentIntent);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Payment failed';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Checkout - {product.title} | Driplo</title>
</svelte:head>

<ErrorBoundary name="CheckoutPage">
	<div class="min-h-screen bg-gray-50 py-8">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="mb-8">
				<h1 class="text-2xl font-bold text-gray-900">Checkout</h1>
				<p class="text-gray-600 mt-2">Complete your purchase</p>
			</div>

			{#if loading && !clientSecret}
				<div class="text-center py-8">
					<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
					<p class="mt-2 text-gray-600">Initializing payment...</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<!-- Payment Form -->
					<ErrorBoundary name="CheckoutPaymentForm">
						<div class="space-y-6">
							<div class="bg-white rounded-lg shadow-xs p-6">
								<h2 class="text-lg font-semibold mb-4">Payment Details</h2>
								
								{#if error}
									<div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
										<p class="text-red-600 text-sm">{error}</p>
									</div>
								{/if}

								<form onsubmit={(e: SubmitEvent) => { e.preventDefault(); handleSubmit(e); }} class="space-y-6">
									<div id="payment-element" class="p-4 border border-gray-200 rounded-lg">
										<!-- Stripe Elements will be mounted here -->
									</div>

									<Button
										type="submit"
										disabled={loading || !clientSecret}
										class="w-full"
										variant="primary"
										data-testid="place-order-button"
									>
										{#if loading}
											Processing...
										{:else}
											Complete Purchase
										{/if}
									</Button>
								</form>
							</div>
						</div>
					</ErrorBoundary>

					<!-- Order Summary -->
					<ErrorBoundary name="CheckoutOrderSummary">
						<div>
							<CheckoutSummary
								{product}
								{shippingCost}
								serviceFee={buyerProtectionFee}
								currency="eur"
								translations={{
									orderSummary: 'Order Summary',
									subtotal: 'Subtotal',
									shipping: 'Shipping',
									serviceFee: 'Buyer Protection',
									total: 'Total'
								}}
							/>
						</div>
					</ErrorBoundary>
				</div>
			{/if}
		</div>
	</div>
</ErrorBoundary>