<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { getStripe } from '$lib/stripe/client';
	import { Button } from '@repo/ui';

	let stripe: typeof import('@stripe/stripe-js').Stripe | null = $state(null);
	let elements: typeof import('@stripe/stripe-js').StripeElements | null = $state(null);
	let clientSecret = $state('');
	let loading = $state(false);
	let error = $state('');
	let bundleItems = $state<{ id: string; title: string; price: number; images?: string[]; brand?: string; size?: string }[]>([]);
	let bundleDetails = $state<{ itemsTotal: number; shippingCost: number; serviceFee: number; totalAmount: number } | null>(null);

	// Initialize bundle checkout when component mounts
	$effect(async () => {
		// Parse bundle items from URL
		const itemsParam = page.url.searchParams.get('items');
		if (!itemsParam) {
			error = 'No items specified';
			return;
		}

		try {
			bundleItems = JSON.parse(decodeURIComponent(itemsParam));
			if (!Array.isArray(bundleItems) || bundleItems.length === 0) {
				error = 'Invalid bundle data';
				return;
			}

			await initializePayment();
		} catch {
			error = 'Invalid bundle data';
		}
	});

	async function initializePayment() {
		try {
			loading = true;
			
			// Initialize Stripe
			stripe = await getStripe();
			if (!stripe) {
				throw new Error('Failed to load Stripe');
			}

			// Create payment intent for bundle
			const response = await fetch('/api/checkout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					bundleItems
				})
			});

			const data = await response.json();
			
			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Failed to create payment intent');
			}

			clientSecret = data.clientSecret;
			bundleDetails = data.bundleDetails;

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
				// Confirm payment on server
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
					// Redirect to success page with order ID
					await goto(`/payment/success?orderId=${result.order.id}&bundle=true`);
				} else {
					error = result.message || 'Payment confirmation failed';
				}
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Payment failed';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Bundle Checkout - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="mb-8">
			<h1 class="text-2xl font-bold text-gray-900">Bundle Checkout</h1>
			<p class="text-gray-600 mt-2">Complete your bundle purchase</p>
		</div>

		{#if loading && !clientSecret}
			<div class="text-center py-8">
				<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
				<p class="mt-2 text-gray-600">Initializing payment...</p>
			</div>
		{:else if bundleItems.length > 0}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<!-- Payment Form -->
				<div class="space-y-6">
					<div class="bg-white rounded-lg shadow-xs p-6">
						<h2 class="text-lg font-semibold mb-4">Payment Details</h2>
						
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
									Processing...
								{:else}
									Complete Bundle Purchase
								{/if}
							</Button>
						</form>
					</div>
				</div>

				<!-- Bundle Summary -->
				<div>
					<div class="bg-white rounded-lg shadow-xs p-6">
						<h2 class="text-lg font-semibold mb-4">Bundle Summary ({bundleItems.length} items)</h2>
						
						<!-- Bundle Items -->
						<div class="space-y-3 mb-6">
							{#each bundleItems as item}
								<div class="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
									<img 
										src={item.images?.[0] || '/placeholder-product.svg'} 
										alt={item.title}
										class="w-16 h-16 object-cover rounded-md"
									/>
									<div class="flex-1">
										<h3 class="text-sm font-medium text-gray-900">{item.title}</h3>
										<p class="text-sm text-gray-600">{item.brand || ''} • {item.size || ''}</p>
										<p class="text-sm font-semibold text-gray-900">€{item.price.toFixed(2)}</p>
									</div>
								</div>
							{/each}
						</div>

						<!-- Price Breakdown -->
						{#if bundleDetails}
							<div class="space-y-2 pt-4 border-t border-gray-200">
								<div class="flex justify-between text-sm">
									<span>Items Total</span>
									<span>€{bundleDetails.itemsTotal.toFixed(2)}</span>
								</div>
								<div class="flex justify-between text-sm">
									<span>Shipping (once for all)</span>
									<span>€{bundleDetails.shippingCost.toFixed(2)}</span>
								</div>
								<div class="flex justify-between text-sm">
									<span>Service Fee</span>
									<span>€{bundleDetails.serviceFee.toFixed(2)}</span>
								</div>
								{#if bundleItems.length > 1}
									<div class="flex justify-between text-sm text-green-600 font-medium">
										<span>You save on shipping</span>
										<span>€{((bundleItems.length - 1) * 5).toFixed(2)}</span>
									</div>
								{/if}
								<div class="flex justify-between text-lg font-bold pt-2 border-t">
									<span>Total</span>
									<span>€{bundleDetails.totalAmount.toFixed(2)}</span>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{:else}
			<div class="text-center py-8">
				<p class="text-gray-600">{error || 'No items in bundle'}</p>
			</div>
		{/if}
	</div>
</div>