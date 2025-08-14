<script lang="ts">
	import type { PaymentIntent } from './types.js';
	import Button from './Button.svelte';

	interface Props {
		amount: number;
		currency?: string;
		onPaymentSuccess?: (paymentIntent: PaymentIntent) => void;
		onPaymentError?: (error: string) => void;
		loading?: boolean;
	}

	let { 
		amount, 
		currency = 'eur',
		onPaymentSuccess,
		onPaymentError,
		loading = false 
	}: Props = $props();

	let paymentProcessing = $state(false);
	let cardElement: any = $state(null);
	let stripe: any = $state(null);
	let elements: any = $state(null);

	// Initialize Stripe Elements
	async function initializeStripe() {
		// This will be handled by the parent component
		// that imports Stripe client-side
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		
		if (!stripe || !elements) {
			onPaymentError?.('Payment system not initialized');
			return;
		}

		paymentProcessing = true;

		try {
			const { error, paymentIntent } = await stripe.confirmPayment({
				elements,
				confirmParams: {
					return_url: window.location.origin + '/payment/success'
				},
				redirect: 'if_required'
			});

			if (error) {
				onPaymentError?.(error.message);
			} else if (paymentIntent?.status === 'succeeded') {
				onPaymentSuccess?.(paymentIntent);
			}
		} catch (error) {
			onPaymentError?.(error instanceof Error ? error.message : 'Payment failed');
		} finally {
			paymentProcessing = false;
		}
	}

	const formatAmount = (amount: number, currency: string) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency.toUpperCase()
		}).format(amount / 100);
	};
</script>

<form on:submit={handleSubmit} class="space-y-6">
	<div class="bg-gray-50 p-4 rounded-lg">
		<div class="flex justify-between items-center">
			<span class="text-sm font-medium text-gray-600">Total</span>
			<span class="text-lg font-bold text-gray-900">
				{formatAmount(amount, currency)}
			</span>
		</div>
	</div>

	<div class="space-y-4">
		<div class="p-4 border border-gray-200 rounded-lg" id="card-element">
			<!-- Stripe Elements will be mounted here -->
		</div>
	</div>

	<Button
		type="submit"
		disabled={loading || paymentProcessing}
		class="w-full"
		variant="primary"
	>
		{#if paymentProcessing}
			Processing...
		{:else}
			Pay {formatAmount(amount, currency)}
		{/if}
	</Button>
</form>