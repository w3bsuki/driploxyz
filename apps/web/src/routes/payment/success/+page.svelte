<script lang="ts">
	import { page } from '$app/stores';
	import { Button, Card } from '@repo/ui';
	import { goto } from '$app/navigation';

	const paymentIntentId = $derived($page.url.searchParams.get('payment_intent'));

	function goToOrders() {
		goto('/dashboard/orders');
	}

	function continueShopping() {
		goto('/');
	}
</script>

<svelte:head>
	<title>Payment Successful | Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full">
		<Card class="text-center p-8">
			<!-- Success Icon -->
			<div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
				<svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
				</svg>
			</div>

			<h1 class="text-2xl font-bold text-gray-900 mb-2">
				Payment Successful!
			</h1>
			
			<p class="text-gray-600 mb-6">
				Thank you for your purchase. Your order has been confirmed and the seller has been notified.
			</p>

			{#if paymentIntentId}
				<div class="bg-gray-50 rounded-lg p-4 mb-6">
					<p class="text-sm text-gray-500 mb-1">Payment Reference</p>
					<p class="text-sm font-mono text-gray-900 break-all">
						{paymentIntentId}
					</p>
				</div>
			{/if}

			<div class="space-y-3">
				<Button
					on:click={goToOrders}
					variant="primary"
					class="w-full"
				>
					View Your Orders
				</Button>
				
				<Button
					on:click={continueShopping}
					variant="outline"
					class="w-full"
				>
					Continue Shopping
				</Button>
			</div>

			<div class="mt-6 pt-6 border-t border-gray-200">
				<p class="text-xs text-gray-500">
					You'll receive an email confirmation shortly with your order details.
				</p>
			</div>
		</Card>
	</div>
</div>