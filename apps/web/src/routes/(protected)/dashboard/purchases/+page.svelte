<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Button } from '@repo/ui';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let showSuccessMessage = $state(false);

	onMount(() => {
		// Show success message if redirected from payment
		if ($page.url.searchParams.get('success') === 'true') {
			showSuccessMessage = true;
			setTimeout(() => {
				showSuccessMessage = false;
			}, 5000);
		}
	});

	function getStatusBadgeClass(status: string) {
		switch (status) {
			case 'paid':
				return 'bg-green-100 text-green-800';
			case 'shipped':
				return 'bg-blue-100 text-blue-800';
			case 'delivered':
				return 'bg-purple-100 text-purple-800';
			case 'cancelled':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="container mx-auto px-4 py-8">
	{#if showSuccessMessage}
		<div class="mb-6 rounded-lg bg-green-50 p-4 text-green-800">
			<div class="flex items-center">
				<svg class="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
				</svg>
				<span class="font-medium">Purchase successful!</span> Your order has been confirmed.
			</div>
		</div>
	{/if}

	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">My Purchases</h1>
		<p class="mt-2 text-gray-600">Track your orders and manage your purchases</p>
	</div>

	{#if data.purchases && data.purchases.length > 0}
		<div class="grid gap-6">
			{#each data.purchases as purchase}
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<div class="flex items-start justify-between">
						<div class="flex gap-4">
							{#if purchase.product.images?.[0]}
								<img
									src={purchase.product.images[0]}
									alt={purchase.product.title}
									class="h-24 w-24 rounded-lg object-cover"
								/>
							{/if}
							<div>
								<h3 class="text-lg font-semibold text-gray-900">
									{purchase.product.title}
								</h3>
								<p class="mt-1 text-sm text-gray-500">
									Order #{purchase.id.slice(0, 8)}
								</p>
								<p class="mt-1 text-sm text-gray-500">
									Purchased on {formatDate(purchase.created_at)}
								</p>
								<p class="mt-2 text-lg font-semibold text-gray-900">
									€{(purchase.total_amount / 100).toFixed(2)}
								</p>
							</div>
						</div>
						<div class="text-right">
							<span class={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(purchase.status)}`}>
								{purchase.status.toUpperCase()}
							</span>
							<div class="mt-4 flex gap-2">
								{#if purchase.status === 'paid'}
									<Button variant="outline" size="sm" href={`/messages/${purchase.seller_id}`}>
										Contact Seller
									</Button>
								{/if}
								{#if purchase.status === 'delivered'}
									<Button variant="primary" size="sm" href={`/review/${purchase.id}`}>
										Leave Review
									</Button>
								{/if}
								<Button variant="outline" size="sm" href={`/orders/${purchase.id}`}>
									View Details
								</Button>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="rounded-lg border border-gray-200 bg-white p-12 text-center">
			<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
			</svg>
			<h3 class="mt-4 text-lg font-medium text-gray-900">No purchases yet</h3>
			<p class="mt-2 text-sm text-gray-500">
				Start shopping to see your orders here
			</p>
			<div class="mt-6">
				<Button variant="primary" href="/">
					Browse Products
				</Button>
			</div>
		</div>
	{/if}
</div>