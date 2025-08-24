<!--
@component SalesHistory - Shows seller's recent sales with earnings
Lightweight display component with pagination
-->
<script lang="ts">
	import type { Database } from '@repo/database';
	import { Badge } from './Badge.svelte';
	import { Button } from './Button.svelte';

	type Order = Database['public']['Tables']['orders']['Row'];
	type Product = Database['public']['Tables']['products']['Row'];

	interface SaleRecord {
		order: Order;
		product: Product;
		earnings: number;
		commission: number;
	}

	interface Props {
		sales: SaleRecord[];
		loading?: boolean;
		hasMore?: boolean;
		onLoadMore?: () => void;
		showArchived?: boolean;
	}

	let { 
		sales, 
		loading = false, 
		hasMore = false, 
		onLoadMore,
		showArchived = false 
	}: Props = $props();

	const formatCurrency = (amount: number, currency: string = 'GBP') => {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency: currency
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'delivered':
				return { variant: 'success', text: 'Completed' };
			case 'shipped':
				return { variant: 'warning', text: 'Shipped' };
			case 'paid':
				return { variant: 'info', text: 'Processing' };
			default:
				return { variant: 'secondary', text: status };
		}
	};
</script>

<div class="sales-history">
	<div class="header">
		<h3>Sales History</h3>
		{#if !showArchived}
			<span class="text-sm text-gray-600">
				Showing sales from the last 30 days
			</span>
		{/if}
	</div>

	{#if loading && sales.length === 0}
		<!-- Loading skeleton -->
		<div class="space-y-4">
			{#each Array(3) as _}
				<div class="sale-item skeleton">
					<div class="h-4 w-32 bg-gray-200 rounded"></div>
					<div class="h-3 w-48 bg-gray-200 rounded mt-2"></div>
					<div class="h-3 w-24 bg-gray-200 rounded mt-1"></div>
				</div>
			{/each}
		</div>
	{:else if sales.length === 0}
		<!-- Empty state -->
		<div class="empty-state">
			<div class="empty-icon">📦</div>
			<h4>No sales yet</h4>
			<p>Your sales history will appear here once you start selling items.</p>
		</div>
	{:else}
		<!-- Sales list -->
		<div class="sales-list space-y-4">
			{#each sales as sale}
				<div class="sale-item">
					<div class="sale-header">
						<div class="product-info">
							<h4 class="product-title">{sale.product.title}</h4>
							<p class="sale-date">{formatDate(sale.order.created_at)}</p>
						</div>
						<Badge variant={getStatusBadge(sale.order.status).variant}>
							{getStatusBadge(sale.order.status).text}
						</Badge>
					</div>

					<div class="sale-details">
						<div class="financial-breakdown">
							<div class="breakdown-item">
								<span class="label">Sale Price:</span>
								<span class="value">
									{formatCurrency(sale.order.total_amount, sale.order.currency)}
								</span>
							</div>
							<div class="breakdown-item">
								<span class="label">Platform Fee (10%):</span>
								<span class="value text-red-600">
									-{formatCurrency(sale.commission, sale.order.currency)}
								</span>
							</div>
							<div class="breakdown-item total">
								<span class="label font-semibold">Your Earnings:</span>
								<span class="value font-semibold text-green-600">
									{formatCurrency(sale.earnings, sale.order.currency)}
								</span>
							</div>
						</div>

						{#if sale.order.tracking_number}
							<div class="tracking-info">
								<span class="text-sm text-gray-600">
									Tracking: {sale.order.tracking_number}
								</span>
							</div>
						{/if}

						{#if sale.order.notes}
							<div class="order-notes">
								<p class="text-sm text-gray-600">{sale.order.notes}</p>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<!-- Load more button -->
		{#if hasMore}
			<div class="load-more">
				<Button variant="secondary" on:click={onLoadMore} {loading}>
					{loading ? 'Loading...' : 'Load More Sales'}
				</Button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.sales-history {
		@apply bg-white rounded-lg border p-6;
	}

	.header {
		@apply flex justify-between items-center mb-6;
	}

	.header h3 {
		@apply text-xl font-semibold;
	}

	.sale-item {
		@apply bg-gray-50 rounded-lg p-4 space-y-3;
	}

	.sale-item.skeleton {
		@apply animate-pulse;
	}

	.sale-header {
		@apply flex justify-between items-start;
	}

	.product-info {
		@apply flex-1;
	}

	.product-title {
		@apply font-medium text-gray-900 line-clamp-1;
	}

	.sale-date {
		@apply text-sm text-gray-600 mt-1;
	}

	.sale-details {
		@apply space-y-3;
	}

	.financial-breakdown {
		@apply space-y-2;
	}

	.breakdown-item {
		@apply flex justify-between text-sm;
	}

	.breakdown-item.total {
		@apply border-t pt-2 mt-2;
	}

	.label {
		@apply text-gray-600;
	}

	.value {
		@apply text-gray-900;
	}

	.tracking-info, .order-notes {
		@apply border-t pt-2;
	}

	.empty-state {
		@apply text-center py-12 space-y-4;
	}

	.empty-icon {
		@apply text-4xl;
	}

	.empty-state h4 {
		@apply text-lg font-medium text-gray-900;
	}

	.empty-state p {
		@apply text-gray-600;
	}

	.load-more {
		@apply text-center mt-6;
	}

	.line-clamp-1 {
		@apply overflow-hidden;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
	}
</style>