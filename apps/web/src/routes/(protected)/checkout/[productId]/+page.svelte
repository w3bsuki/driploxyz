<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getStripe } from '$lib/stripe/client.js';
	import { CheckoutSummary, PaymentForm, Button } from '@repo/ui';
	import type { Product, PaymentIntent } from '@repo/ui';
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

	// Shipping and service fees (in cents)
	const shippingCost = 500; // €5.00
	const serviceFee = Math.round(product.price * 0.03); // 3% service fee
	const totalAmount = product.price + shippingCost + serviceFee;

	onMount(async () => {
		await initializePayment();
	});

	async function initializePayment() {
		try {
			loading = true;
			
			// Initialize Stripe
			stripe = await getStripe();
			if (!stripe) {
				throw new Error('Failed to load Stripe');
			}

			// Create payment intent
			const response = await fetch('/api/payments/create-intent', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					amount: totalAmount,
					currency: 'eur',
					productId: product.id,
					sellerId: product.sellerId,
					metadata: {
						productTitle: product.title
					}
				})
			});

			const { client_secret, error: apiError } = await response.json();
			
			if (apiError) {
				throw new Error(apiError);
			}

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

	async function handlePaymentSuccess(paymentIntent: PaymentIntent) {
		// Confirm payment on server
		const response = await fetch('/api/payments/confirm', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				paymentIntentId: paymentIntent.id
			})
		});

		const result = await response.json();
		
		if (result.success) {
			// Redirect buyer to their purchases dashboard
			await goto('/dashboard/purchases?success=true');
		} else {
			error = i18n.checkout_paymentFailed();
		}
	}

	function handlePaymentError(errorMessage: string) {
		error = errorMessage;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		
		if (!stripe || !elements) {
			error = i18n.checkout_paymentSystemNotInitialized();
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
			error = err instanceof Error ? err.message : i18n.checkout_paymentFailed();
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>{i18n.checkout_checkout()} - {product.title} | Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="mb-8">
			<h1 class="text-2xl font-bold text-gray-900">{i18n.checkout_checkout()}</h1>
			<p class="text-gray-600 mt-2">{i18n.checkout_completePurchase()}</p>
		</div>

		{#if loading && !clientSecret}
			<div class="text-center py-8">
				<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
				<p class="mt-2 text-gray-600">{i18n.checkout_initializingPayment()}</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<!-- Payment Form -->
				<div class="space-y-6">
					<div class="bg-white rounded-lg shadow-xs p-6">
						<h2 class="text-lg font-semibold mb-4">{i18n.checkout_paymentDetails()}</h2>
						
						{#if error}
							<div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
								<p class="text-red-600 text-sm">{error}</p>
							</div>
						{/if}

						<form onsubmit={handleSubmit} class="space-y-6">
							<div id="payment-element" class="p-4 border border-gray-200 rounded-lg">
								<!-- Stripe Elements will be mounted here -->
							</div>

							<Button
								type="submit"
								disabled={loading || !clientSecret}
								class="w-full"
								variant="primary"
							>
								{#if loading}
									{i18n.checkout_processing()}
								{:else}
									{i18n.checkout_completePurchaseButton()}
								{/if}
							</Button>
						</form>
					</div>
				</div>

				<!-- Order Summary -->
				<div>
					<CheckoutSummary 
						{product}
						{shippingCost}
						serviceFee={serviceFee}
						currency="eur"
						translations={{
							orderSummary: i18n.checkout_orderSummary(),
							subtotal: i18n.checkout_subtotal(),
							shipping: i18n.checkout_shipping(),
							serviceFee: i18n.checkout_serviceFee(),
							total: i18n.checkout_total()
						}}
					/>
				</div>
			</div>
		{/if}
	</div>
</div>