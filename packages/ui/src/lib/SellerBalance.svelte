<!--
@component SellerBalance - Lightweight seller balance widget
Shows available balance, earnings, and payout button
-->
<script lang="ts">
	import type { Database } from '@repo/database';
	import { Button } from './Button.svelte';
	import { Badge } from './Badge.svelte';

	type SellerBalance = Database['public']['Tables']['seller_balances']['Row'];

	interface Props {
		balance: SellerBalance;
		loading?: boolean;
		onRequestPayout?: () => void;
	}

	let { balance, loading = false, onRequestPayout }: Props = $props();

	const formatCurrency = (amount: number, currency: string = 'GBP') => {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency: currency
		}).format(amount);
	};

	const canRequestPayout = $derived(balance?.available_balance && balance.available_balance >= 10);
</script>

<div class="seller-balance-widget">
	<div class="balance-header">
		<h3>Your Balance</h3>
		{#if balance?.last_payout_at}
			<span class="last-payout text-sm text-gray-600">
				Last payout: {new Date(balance.last_payout_at).toLocaleDateString()}
			</span>
		{/if}
	</div>

	<div class="balance-cards grid grid-cols-1 md:grid-cols-3 gap-4">
		<!-- Available Balance -->
		<div class="balance-card">
			<div class="card-header">
				<h4>Available</h4>
				<Badge variant="success">Ready to withdraw</Badge>
			</div>
			<div class="amount">
				{#if loading}
					<div class="skeleton h-8 w-24"></div>
				{:else}
					<span class="text-2xl font-bold text-green-600">
						{formatCurrency(balance?.available_balance || 0, balance?.currency)}
					</span>
				{/if}
			</div>
		</div>

		<!-- Pending Balance -->
		<div class="balance-card">
			<div class="card-header">
				<h4>Pending</h4>
				<Badge variant="warning">Being processed</Badge>
			</div>
			<div class="amount">
				{#if loading}
					<div class="skeleton h-8 w-24"></div>
				{:else}
					<span class="text-2xl font-bold text-orange-600">
						{formatCurrency(balance?.pending_balance || 0, balance?.currency)}
					</span>
				{/if}
			</div>
		</div>

		<!-- Total Earned -->
		<div class="balance-card">
			<div class="card-header">
				<h4>Total Earned</h4>
				<Badge variant="secondary">All time</Badge>
			</div>
			<div class="amount">
				{#if loading}
					<div class="skeleton h-8 w-24"></div>
				{:else}
					<span class="text-2xl font-bold text-blue-600">
						{formatCurrency(balance?.total_earned || 0, balance?.currency)}
					</span>
				{/if}
			</div>
		</div>
	</div>

	<!-- Payout Actions -->
	<div class="payout-actions mt-6">
		{#if canRequestPayout}
			<Button variant="primary" on:click={onRequestPayout} {loading}>
				Request Payout
			</Button>
			<p class="text-sm text-gray-600 mt-2">
				Minimum payout amount is £10.00
			</p>
		{:else}
			<Button variant="secondary" disabled>
				Request Payout
			</Button>
			<p class="text-sm text-red-600 mt-2">
				Minimum balance of £10.00 required for payout
			</p>
		{/if}
	</div>
</div>

<style>
	.seller-balance-widget {
		@apply bg-white rounded-lg border p-6;
	}

	.balance-header {
		@apply flex justify-between items-center mb-6;
	}

	.balance-header h3 {
		@apply text-xl font-semibold;
	}

	.balance-card {
		@apply bg-gray-50 rounded-lg p-4;
	}

	.card-header {
		@apply flex justify-between items-center mb-2;
	}

	.card-header h4 {
		@apply font-medium text-gray-700;
	}

	.amount {
		@apply mt-2;
	}

	.skeleton {
		@apply animate-pulse bg-gray-300 rounded;
	}

	.payout-actions {
		@apply border-t pt-4;
	}
</style>