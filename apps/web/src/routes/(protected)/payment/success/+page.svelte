<script lang="ts">
	import { page } from '$app/stores';
	import { Button, Card } from '@repo/ui';
	import { goto } from '$app/navigation';
	import * as i18n from '@repo/i18n';
	import { onMount } from 'svelte';

	const orderId = $derived($page.url.searchParams.get('orderId'));
	const paymentIntentId = $derived($page.url.searchParams.get('payment_intent'));
	
	let orderDetails = $state(null);
	let loading = $state(true);

	onMount(async () => {
		if (orderId) {
			// Fetch order details
			const response = await fetch(`/api/orders/${orderId}`);
			if (response.ok) {
				orderDetails = await response.json();
			}
		}
		loading = false;
	});

	function goToOrders() {
		goto('/purchases');
	}

	function continueShopping() {
		goto('/');
	}
	
	function messageVendor() {
		if (orderDetails?.seller_id) {
			goto(`/messages/new?userId=${orderDetails.seller_id}&productId=${orderDetails.product_id}`);
		}
	}
</script>

<svelte:head>
	<title>{i18n.checkout_paymentSuccessful()} | Driplo</title>
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
				🎉 Purchase Successful!
			</h1>
			
			<p class="text-gray-600 mb-6">
				Your order has been confirmed and the seller has been notified.
			</p>

			{#if orderId}
				<div class="bg-gray-50 rounded-lg p-4 mb-6">
					<p class="text-sm text-gray-500 mb-1">Order ID</p>
					<p class="text-sm font-mono text-gray-900 break-all">
						{orderId.slice(0, 8).toUpperCase()}
					</p>
				</div>
			{/if}
			
			<!-- What happens next section -->
			<div class="bg-blue-50 rounded-lg p-4 mb-6 text-left">
				<h3 class="text-sm font-semibold text-blue-900 mb-2">What happens next?</h3>
				<ul class="space-y-2 text-sm text-blue-800">
					<li class="flex items-start">
						<span class="mr-2">📦</span>
						<span>The seller will package and ship your item within 2-3 business days</span>
					</li>
					<li class="flex items-start">
						<span class="mr-2">📧</span>
						<span>You'll receive tracking information once the item is shipped</span>
					</li>
					<li class="flex items-start">
						<span class="mr-2">✅</span>
						<span>Mark the order as received once you get your item</span>
					</li>
				</ul>
			</div>

			<div class="space-y-3">
				<Button
					onclick={goToOrders}
					variant="primary"
					class="w-full"
				>
					View My Purchases
				</Button>
				
				<Button
					onclick={messageVendor}
					variant="outline"
					class="w-full"
					disabled={!orderDetails}
				>
					Message Seller
				</Button>
				
				<Button
					onclick={continueShopping}
					variant="ghost"
					class="w-full"
				>
					Continue Shopping
				</Button>
			</div>

			<div class="mt-6 pt-6 border-t border-gray-200">
				<p class="text-xs text-gray-500">
					A confirmation email has been sent to your registered email address.
				</p>
			</div>
		</Card>
	</div>
</div>