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
		goto('/dashboard/order-management');
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

			{#if orderDetails && !loading}
				<div class="bg-white border border-gray-200 rounded-lg p-4 mb-6">
					<div class="flex items-center gap-4">
						{#if orderDetails.is_bundle}
							<div class="relative w-16 h-16">
								<div class="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
									<span class="text-2xl">📦</span>
								</div>
								<span class="absolute -top-2 -right-2 bg-primary-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
									{orderDetails.items_count || 1}
								</span>
							</div>
						{:else if orderDetails.product?.images?.[0]}
							<img
								src={orderDetails.product.images[0]}
								alt={orderDetails.product?.title}
								class="w-16 h-16 object-cover rounded-lg"
							/>
						{:else}
							<div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
								<svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
						{/if}
						
						<div class="flex-1">
							<h3 class="font-semibold text-gray-900">
								{#if orderDetails.is_bundle}
									Bundle Order ({orderDetails.items_count} items)
								{:else}
									{orderDetails.product?.title || 'Order'}
								{/if}
							</h3>
							<p class="text-sm text-gray-600">
								From: <span class="font-medium">@{orderDetails.seller?.username}</span>
							</p>
							<p class="text-lg font-bold text-green-600 mt-1">
								€{orderDetails.total_amount?.toFixed(2)}
							</p>
						</div>
					</div>
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
					TRACK YOUR ORDER
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