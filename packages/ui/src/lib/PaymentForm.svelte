<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
	import Button from './Button.svelte';
	import type { PaymentIntent } from '../types';

	// Local utility functions (since we can't import from web app)
	function formatCurrency(amount: number, currency: string = 'eur'): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency.toUpperCase(),
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	}

	function formatStripeError(error: any): string {
		if (!error) return 'An unknown error occurred';
		
		switch (error.type) {
			case 'card_error':
				switch (error.code) {
					case 'card_declined':
						return 'Your card was declined. Please try a different payment method.';
					case 'insufficient_funds':
						return 'Your card has insufficient funds.';
					case 'expired_card':
						return 'Your card has expired. Please use a different card.';
					case 'incorrect_cvc':
						return 'Your card\'s security code is incorrect.';
					case 'processing_error':
						return 'An error occurred while processing your card. Please try again.';
					case 'incorrect_number':
						return 'Your card number is incorrect.';
					default:
						return error.message || 'Your card was declined.';
				}
			case 'validation_error':
				return error.message || 'Please check your payment information.';
			case 'api_error':
				return 'A payment processing error occurred. Please try again.';
			default:
				return error.message || 'An error occurred while processing your payment.';
		}
	}

	interface Translations {
		total?: string;
		processing?: string;
		pay?: string;
		paymentSystemNotInitialized?: string;
		paymentFailed?: string;
		cardNumber?: string;
		expiryDate?: string;
		cvc?: string;
		cardholderName?: string;
		validationError?: string;
	}

	interface Props {
		// Required props
		amount: number;
		productId: string;
		sellerId: string;
		buyerId: string;
		clientSecret: string;
		stripe: Stripe | null;
		
		// Optional props
		currency?: string;
		showBillingAddress?: boolean;
		showCardholderName?: boolean;
		allowSaveCard?: boolean;
		loading?: boolean;
		disabled?: boolean;
		theme?: 'light' | 'dark' | 'auto';
		locale?: string;
		translations?: Translations;
		
		// Callbacks
		onPaymentSuccess?: (result: { paymentIntent: any; order?: any }) => Promise<void>;
		onPaymentError?: (error: string) => void;
		onValidationError?: (errors: Record<string, string>) => void;
		onProcessingChange?: (processing: boolean) => void;
	}

	let { 
		amount, 
		productId,
		sellerId,
		buyerId,
		clientSecret,
		stripe,
		currency = 'eur',
		showBillingAddress = false,
		showCardholderName = false,
		allowSaveCard = false,
		loading = false,
		disabled = false,
		theme = 'light',
		locale = 'en',
		translations = {},
		onPaymentSuccess,
		onPaymentError,
		onValidationError,
		onProcessingChange
	}: Props = $props();

	// State
	let paymentProcessing = $state(false);
	let validationErrors = $state<Record<string, string>>({});
	let elements: StripeElements | null = $state(null);
	let cardElement: StripeCardElement | null = $state(null);
	let formValid = $state(false);
	let cardholderName = $state('');
	let saveCard = $state(false);
	let mounted = $state(false);

	// Form elements
	let cardContainer: HTMLElement;
	let formElement: HTMLFormElement;

	// Initialize Stripe Elements
	async function initializeStripeElements() {
		if (!stripe || !clientSecret || mounted) return;

		try {
			// Create elements instance
			elements = stripe.elements({
				clientSecret,
				appearance: {
					theme: theme === 'auto' ? 'stripe' : theme,
					variables: {
						colorPrimary: '#3b82f6',
						colorBackground: theme === 'dark' ? '#1f2937' : '#ffffff',
						colorText: theme === 'dark' ? '#f9fafb' : '#374151',
						colorDanger: '#ef4444',
						fontFamily: 'system-ui, sans-serif',
						spacingUnit: '4px',
						borderRadius: '8px'
					}
				},
				locale: locale as any
			});

			// Create payment element (recommended) or card element
			cardElement = elements.create('payment', {
				layout: {
					type: 'tabs',
					defaultCollapsed: false
				},
				paymentMethodOrder: ['card', 'paypal', 'apple_pay', 'google_pay'],
				fields: {
					billingDetails: showBillingAddress ? {
						name: showCardholderName ? 'auto' : 'never',
						email: 'never',
						phone: 'never',
						address: {
							line1: 'auto',
							line2: 'auto',
							city: 'auto',
							state: 'auto',
							country: 'auto',
							postalCode: 'auto'
						}
					} : 'never'
				}
			});

			// Mount the element
			cardElement.mount(cardContainer);

			// Listen for changes
			cardElement.on('change', handleElementChange);
			cardElement.on('ready', handleElementReady);

			mounted = true;
		} catch (error) {
			console.error('Error initializing Stripe Elements:', error);
			onPaymentError?.(formatStripeError(error));
		}
	}

	// Handle element changes
	function handleElementChange(event: any) {
		formValid = event.complete && !event.error;
		
		if (event.error) {
			validationErrors.card = event.error.message;
		} else {
			delete validationErrors.card;
			validationErrors = { ...validationErrors };
		}

		onValidationError?.(validationErrors);
	}

	function handleElementReady() {
		console.log('Stripe Elements ready');
	}

	// Handle form submission
	async function handleSubmit(event: Event) {
		event.preventDefault();
		
		if (!stripe || !elements || !cardElement) {
			onPaymentError?.(translations.paymentSystemNotInitialized || 'Payment system not initialized');
			return;
		}

		// Validate amount
		if (amount < 50) { // 50 cents minimum
			onPaymentError?.('Amount must be at least €0.50');
			return;
		}

		if (!formValid) {
			onPaymentError?.(translations.validationError || 'Please complete all payment information');
			return;
		}

		paymentProcessing = true;
		onProcessingChange?.(true);

		try {
			// Confirm payment with Stripe
			const result = await stripe.confirmPayment({
				elements,
				confirmParams: {
					return_url: `${window.location.origin}/payment/success`,
					payment_method_data: {
						metadata: {
							productId,
							sellerId,
							buyerId
						}
					},
					...(showCardholderName && cardholderName ? {
						billing_details: {
							name: cardholderName
						}
					} : {})
				},
				redirect: 'if_required'
			});

			if (result.error) {
				// Payment failed
				onPaymentError?.(formatStripeError(result.error));
			} else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
				// Payment succeeded - now confirm with backend
				await confirmPaymentWithBackend(result.paymentIntent);
			}
		} catch (error) {
			console.error('Payment error:', error);
			onPaymentError?.(formatStripeError(error));
		} finally {
			paymentProcessing = false;
			onProcessingChange?.(false);
		}
	}

	// Confirm payment with backend
	async function confirmPaymentWithBackend(paymentIntent: any) {
		try {
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
				onPaymentSuccess?.({
					paymentIntent,
					order: result.orderId ? { id: result.orderId } : undefined
				});
			} else {
				onPaymentError?.(result.error || 'Payment confirmation failed');
			}
		} catch (error) {
			console.error('Backend confirmation error:', error);
			onPaymentError?.(translations.paymentFailed || 'Payment confirmation failed');
		}
	}

	// Lifecycle
	onMount(() => {
		initializeStripeElements();
	});

	onDestroy(() => {
		if (cardElement) {
			cardElement.destroy();
		}
	});

	// Reactive updates
	$effect(() => {
		if (stripe && clientSecret && !mounted) {
			initializeStripeElements();
		}
	});
</script>

<form bind:this={formElement} onsubmit={handleSubmit} class="space-y-6">
	<!-- Payment Summary -->
	<div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
		<div class="flex justify-between items-center">
			<span class="text-sm font-medium text-[color:var(--text-muted)] dark:text-gray-300">
				{translations.total || 'Total'}
			</span>
			<span class="text-lg font-bold text-[color:var(--text-primary)] dark:text-gray-100">
				{formatCurrency(amount / 100, currency)}
			</span>
		</div>
	</div>

	<!-- Cardholder Name (if enabled) -->
	{#if showCardholderName}
		<div class="space-y-2">
			<label for="cardholder-name" class="block text-sm font-medium text-[color:var(--text-primary)] dark:text-gray-300">
				{translations.cardholderName || 'Cardholder Name'}
			</label>
			<input
				id="cardholder-name"
				type="text"
				bind:value={cardholderName}
				placeholder="Enter cardholder name"
				disabled={disabled || paymentProcessing}
				class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
				       bg-white dark:bg-gray-700 text-[color:var(--text-primary)] dark:text-gray-100
				       focus:ring-2 focus:ring-blue-500 focus:border-transparent
				       disabled:opacity-50 disabled:cursor-not-allowed"
			/>
		</div>
	{/if}

	<!-- Stripe Elements Container -->
	<div class="space-y-4">
		<div 
			bind:this={cardContainer}
			class="p-4 border border-gray-300 dark:border-gray-600 rounded-lg 
			       bg-white dark:bg-gray-700 min-h-30
			       transition-colors duration-200
			       {validationErrors.card ? 'border-red-500 dark:border-red-400' : ''}"
		>
			<!-- Stripe Elements will be mounted here -->
			{#if !mounted && stripe}
				<div class="flex items-center justify-center h-full">
					<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
					<span class="ml-2 text-sm text-[color:var(--text-muted)] dark:text-gray-400">
						Loading payment form...
					</span>
				</div>
			{:else if !stripe}
				<div class="flex items-center justify-center h-full">
					<span class="text-sm text-red-500 dark:text-red-400">
						Payment system not available
					</span>
				</div>
			{/if}
		</div>
		
		<!-- Error Messages -->
		{#if validationErrors.card}
			<p class="text-sm text-red-600 dark:text-red-400">
				{validationErrors.card}
			</p>
		{/if}
	</div>

	<!-- Save Payment Method Option -->
	{#if allowSaveCard}
		<div class="flex items-center">
			<input
				id="save-card"
				type="checkbox"
				bind:checked={saveCard}
				disabled={disabled || paymentProcessing}
				class="h-4 w-4 text-[color:var(--text-link)] focus:ring-blue-500 border-gray-300 rounded"
			/>
			<label for="save-card" class="ml-2 block text-sm text-[color:var(--text-primary)] dark:text-gray-300">
				Save this payment method for future purchases
			</label>
		</div>
	{/if}

	<!-- Submit Button -->
	<Button
		type="submit"
		disabled={disabled || loading || paymentProcessing || !formValid || !mounted}
		class="w-full {paymentProcessing ? 'animate-pulse' : ''}"
		variant="primary"
	>
		{#if paymentProcessing}
			<div class="flex items-center justify-center">
				<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
				{translations.processing || 'Processing...'}
			</div>
		{:else}
			{translations.pay || 'Pay'} {formatCurrency(amount / 100, currency)}
		{/if}
	</Button>

	<!-- Security Notice -->
	<div class="flex items-center justify-center text-xs text-[color:var(--text-muted)] dark:text-gray-400">
		<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
			      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
		</svg>
		Secured by Stripe
	</div>
</form>