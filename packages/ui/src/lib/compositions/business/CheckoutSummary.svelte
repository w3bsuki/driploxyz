<script lang="ts">
	import type { Product } from '../../types/product';
	import Card from '../../compositions/cards/Card.svelte';

	interface Translations {
		orderSummary?: string;
		subtotal?: string;
		shipping?: string;
		serviceFee?: string;
		total?: string;
	}

	interface Props {
		product: Product;
		shippingCost?: number;
		serviceFee?: number;
		currency?: string;
		translations?: Translations;
	}

	let { 
		product, 
		shippingCost = 0,
		serviceFee = 0,
		currency = 'eur',
		translations = {}
	}: Props = $props();

	const subtotal = $derived(product.price);
	const total = $derived(subtotal + shippingCost + serviceFee);

	const formatAmount = (amount: number, currency: string) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency.toUpperCase()
		}).format(amount / 100);
	};
</script>

<Card class="p-6">
	<h3 class="text-lg font-semibold mb-4">{translations.orderSummary || 'Order Summary'}</h3>
	
	<div class="space-y-4">
		<!-- Product -->
		<div class="flex items-start space-x-3">
			{#if product.images?.[0]}
				<img 
					src={product.images[0]} 
					alt={product.title}
					class="w-16 h-16 object-cover rounded-lg"
				/>
			{/if}
			<div class="flex-1 min-w-0">
				<h4 class="text-sm font-medium text-gray-900 truncate">
					{product.title}
				</h4>
				<p class="text-sm text-gray-500 truncate">
					{product.description}
				</p>
			</div>
			<span class="text-sm font-medium text-gray-900">
				{formatAmount(product.price, currency)}
			</span>
		</div>

		<hr class="border-gray-200" />

		<!-- Costs breakdown -->
		<div class="space-y-2">
			<div class="flex justify-between text-sm">
				<span class="text-gray-500">{translations.subtotal || 'Subtotal'}</span>
				<span class="text-gray-900">{formatAmount(subtotal, currency)}</span>
			</div>
			
			{#if shippingCost > 0}
				<div class="flex justify-between text-sm">
					<span class="text-gray-500">{translations.shipping || 'Shipping'}</span>
					<span class="text-gray-900">{formatAmount(shippingCost, currency)}</span>
				</div>
			{/if}
			
			{#if serviceFee > 0}
				<div class="flex justify-between text-sm">
					<span class="text-gray-500">{translations.serviceFee || 'Service fee'}</span>
					<span class="text-gray-900">{formatAmount(serviceFee, currency)}</span>
				</div>
			{/if}
		</div>

		<hr class="border-gray-200" />

		<!-- Total -->
		<div class="flex justify-between">
			<span class="text-base font-semibold text-gray-900">{translations.total || 'Total'}</span>
			<span class="text-base font-semibold text-gray-900">
				{formatAmount(total, currency)}
			</span>
		</div>
	</div>
</Card>