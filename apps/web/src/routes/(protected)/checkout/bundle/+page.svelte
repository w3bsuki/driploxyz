<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '@repo/ui';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { bundleItems } = data;

	function handleSubmit() {
		// Mock successful checkout
		goto('/payment/success');
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

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Bundle Items -->
			<div class="space-y-6">
				<div class="bg-white rounded-lg shadow-xs p-6">
					<h2 class="text-lg font-semibold mb-4">Bundle Items</h2>
					
					<div data-testid="bundle-items" class="space-y-4">
						{#each bundleItems as item}
							<div class="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
								<img src={item.image} alt={item.title} class="w-16 h-16 object-cover rounded" />
								<div class="flex-1">
									<h3 class="font-medium text-gray-900">{item.title}</h3>
									<p class="text-gray-600">€{item.price}</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Order Summary -->
			<div>
				<div class="bg-white rounded-lg shadow-xs p-6">
					<h2 class="text-lg font-semibold mb-4" data-testid="bundle-total">Bundle Total</h2>
					
					<div class="space-y-2">
						{#each bundleItems as item}
							<div class="flex justify-between">
								<span>{item.title}</span>
								<span>€{item.price}</span>
							</div>
						{/each}
						<div class="flex justify-between font-semibold text-lg pt-2 border-t">
							<span>Total</span>
							<span>€{bundleItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Checkout Button -->
		<div class="mt-8 text-center">
			<Button
				onclick={handleSubmit}
				variant="primary"
				class="w-full max-w-md"
			>
				Proceed to Payment
			</Button>
		</div>
	</div>
</div>