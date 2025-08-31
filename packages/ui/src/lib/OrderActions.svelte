<script lang="ts">
	import { enhance } from '$app/forms';
	
	interface Order {
		id: string;
		status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'disputed';
		buyer_id: string;
		seller_id: string;
		tracking_number?: string;
	}

	interface Props {
		order: Order;
		userType: 'buyer' | 'seller';
		userId: string;
		onStatusChange?: (newStatus: string) => void;
		className?: string;
	}

	let { 
		order, 
		userType, 
		userId,
		onStatusChange,
		className = ''
	}: Props = $props();

	let isLoading = $state(false);
	let trackingNumber = $state(order.tracking_number || '');
	let showTrackingInput = $state(false);

	const canMarkAsShipped = $derived(
		userType === 'seller' && 
		userId === order.seller_id && 
		order.status === 'paid'
	);

	const canMarkAsDelivered = $derived(
		userType === 'buyer' && 
		userId === order.buyer_id && 
		order.status === 'shipped'
	);

	const updateOrderStatus = async (newStatus: string, extraData: any = {}) => {
		isLoading = true;
		
		try {
			const response = await fetch(`/api/orders/${order.id}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					status: newStatus,
					...extraData
				})
			});

			if (!response.ok) {
				throw new Error('Failed to update order status');
			}

			const result = await response.json();
			
			if (result.success) {
				onStatusChange?.(newStatus);
				showTrackingInput = false;
			}
		} catch (error) {
			console.error('Error updating order status:', error);
			alert('Failed to update order status. Please try again.');
		} finally {
			isLoading = false;
		}
	};

	const handleMarkAsShipped = () => {
		if (showTrackingInput) {
			updateOrderStatus('shipped', { tracking_number: trackingNumber });
		} else {
			showTrackingInput = true;
		}
	};

	const handleMarkAsDelivered = () => {
		updateOrderStatus('delivered');
	};
</script>

<div class={`space-y-3 ${className}`}>
	{#if canMarkAsShipped}
		{#if !showTrackingInput}
			<button
				onclick={handleMarkAsShipped}
				disabled={isLoading}
				class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
			>
				{#if isLoading}
					<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
				{:else}
					<span>📦</span>
				{/if}
				Mark as Shipped
			</button>
		{:else}
			<div class="space-y-2">
				<label for="tracking-number" class="block text-sm font-medium text-gray-900">
					Tracking Number (optional)
				</label>
				<input
					id="tracking-number"
					type="text"
					bind:value={trackingNumber}
					placeholder="Enter tracking number"
					class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
				<div class="flex gap-2">
					<button
						onclick={handleMarkAsShipped}
						disabled={isLoading}
						class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
					>
						{#if isLoading}
							<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						{:else}
							<span>✅</span>
						{/if}
						Confirm Shipped
					</button>
					<button
						onclick={() => showTrackingInput = false}
						disabled={isLoading}
						class="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors"
					>
						Cancel
					</button>
				</div>
			</div>
		{/if}
	{/if}

	{#if canMarkAsDelivered}
		<button
			onclick={handleMarkAsDelivered}
			disabled={isLoading}
			class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
		>
			{#if isLoading}
				<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
			{:else}
				<span>✅</span>
			{/if}
			Mark as Received
		</button>
	{/if}

	{#if order.status === 'delivered'}
		<div class="text-center py-4">
			<span class="inline-flex items-center gap-2 text-green-600 font-medium">
				<span>🎉</span>
				Order completed successfully!
			</span>
		</div>
	{/if}
</div>