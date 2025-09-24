<script lang="ts">
	import { page } from '$app/state';
	import { Button, Card } from '@repo/ui';
	import { goto } from '$app/navigation';
	import * as i18n from '@repo/i18n';
	import { createBrowserSupabaseClient } from '$lib/supabase/client';
	import type { Database } from '@repo/database';

	const orderId = $derived(page.url.searchParams.get('orderId'));
	// const paymentIntentId = $derived(page.url.searchParams.get('payment_intent'));

	let orderDetails: Database['public']['Tables']['orders']['Row'] & { product?: { title: string; images: { image_url: string }[] } } | null = $state(null);
	let loading = $state(true);
	const supabase = createBrowserSupabaseClient();

	// Fetch order details when component mounts
	$effect(async () => {
		if (orderId) {
			// Fetch complete order details with product and seller info
			const { data: order, error } = await supabase
				.from('orders')
				.select(`
					*,
					products!orders_product_id_fkey (
						id,
						title,
						price,
						product_images (
							image_url,
							display_order
						)
					),
					profiles!orders_seller_id_fkey (
						id,
						username,
						avatar_url
					),
					order_items (
						id,
						product_id,
						price
					)
				`)
				.eq('id', orderId)
				.single();

			if (!error && order) {
				orderDetails = order;
			}
		}
		loading = false;
	});

	function goToOrderManagement() {
		goto('/dashboard/order-management');
	}

	function continueShopping() {
		goto('/');
	}
	
	function messageVendor() {
		if (orderDetails?.profiles) {
			goto(`/messages/${orderDetails.profiles.username}`);
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

			{#if loading}
				<div class="flex justify-center py-8">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
				</div>
			{:else if orderDetails}
				<!-- Product Details -->
				<div class="bg-gray-50 rounded-lg p-4 mb-4">
					<div class="flex items-start gap-4">
						{#if orderDetails.is_bundle && orderDetails.items_count > 1}
							<!-- Bundle display -->
							<div class="relative w-20 h-20">
								<div class="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
									<span class="text-2xl">📦</span>
								</div>
								<span class="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
									{orderDetails.items_count}
								</span>
							</div>
						{:else if orderDetails.products?.product_images?.[0]}
							<img
								src={orderDetails.products.product_images[0].image_url}
								alt={orderDetails.products.title}
								class="w-20 h-20 object-cover rounded-lg"
							/>
						{:else}
							<div class="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
								<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
						{/if}
						
						<div class="flex-1 text-left">
							<h3 class="font-semibold text-gray-900">
								{#if orderDetails.is_bundle && orderDetails.items_count > 1}
									Bundle Order ({orderDetails.items_count} items)
								{:else}
									{orderDetails.products?.title || 'Product'}
								{/if}
							</h3>
							<p class="text-sm text-gray-600 mt-1">
								Sold by: <span class="font-medium">@{orderDetails.profiles?.username || 'seller'}</span>
							</p>
							<p class="text-lg font-bold text-gray-900 mt-2">
								{orderDetails.currency || 'BGN'} {orderDetails.total_amount?.toFixed(2) || '0.00'}
							</p>
						</div>
					</div>
				</div>
				
				<!-- Order Reference -->
				<div class="bg-gray-50 rounded-lg p-4 mb-6">
					<p class="text-sm text-gray-500 mb-1">Order ID</p>
					<p class="text-sm font-mono text-gray-900 break-all">
						{orderId?.slice(-8).toUpperCase() || ''}
					</p>
				</div>
			{/if}
			
			<!-- What happens next section -->
			<div class="bg-blue-50 rounded-lg p-4 mb-6 text-left">
				<h3 class="text-sm font-semibold text-blue-900 mb-2">What happens next?</h3>
				<ul class="space-y-2 text-sm text-blue-800">
					<li class="flex items-start">
						<span class="mr-2">📦</span>
						<span>The seller has 3 days to ship your item</span>
					</li>
					<li class="flex items-start">
						<span class="mr-2">📧</span>
						<span>You'll receive tracking information once shipped</span>
					</li>
					<li class="flex items-start">
						<span class="mr-2">✅</span>
						<span>Confirm receipt once you receive your item</span>
					</li>
				</ul>
			</div>

			<div class="space-y-3">
				<Button
					onclick={goToOrderManagement}
					variant="primary"
					class="w-full"
					size="lg"
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