<script lang="ts">
	interface Props {
		orderId: string;
		status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'disputed' | 'failed' | 'completed';
		userRole: 'buyer' | 'seller';
		trackingNumber?: string;
		isLoading?: boolean;
		className?: string;
		// Callback props replacing event dispatcher
		onMarkShipped?: (data: { orderId: string; trackingNumber?: string }) => void;
		onMarkDelivered?: (data: { orderId: string }) => void;
		onCancelOrder?: (data: { orderId: string; reason?: string }) => void;
		onDisputeOrder?: (data: { orderId: string; reason?: string }) => void;
		onContactOtherParty?: (data: { orderId: string }) => void;
		onLeaveReview?: (data: { orderId: string }) => void;
	}

	let { 
		orderId,
		status, 
		userRole, 
		trackingNumber,
		isLoading = false,
		className = '',
		onMarkShipped,
		onMarkDelivered,
		onCancelOrder,
		onDisputeOrder,
		onContactOtherParty,
		onLeaveReview
	}: Props = $props();

	let showTrackingInput = $state(false);
	let trackingInput = $state('');
	let showCancelForm = $state(false);
	let cancelReason = $state('');
	let showDisputeForm = $state(false);
	let disputeReason = $state('');

	const handleMarkShipped = () => {
		onMarkShipped?.({ 
			orderId, 
			trackingNumber: trackingInput.trim() || undefined 
		});
		showTrackingInput = false;
		trackingInput = '';
	};

	const handleMarkDelivered = () => {
		onMarkDelivered?.({ orderId });
	};

	const handleCancelOrder = () => {
		onCancelOrder?.({ 
			orderId, 
			reason: cancelReason.trim() || undefined 
		});
		showCancelForm = false;
		cancelReason = '';
	};

	const handleDisputeOrder = () => {
		onDisputeOrder?.({ 
			orderId, 
			reason: disputeReason.trim() || undefined 
		});
		showDisputeForm = false;
		disputeReason = '';
	};

	const handleContactOtherParty = () => {
		onContactOtherParty?.({ orderId });
	};

	const handleLeaveReview = () => {
		onLeaveReview?.({ orderId });
	};

	// Determine available actions based on status and user role
	const availableActions = $derived.by(() => {
		const actions: string[] = [];

		// Always available: contact the other party
		actions.push('contact');

		switch (status) {
			case 'pending':
				// Both can cancel during pending
				actions.push('cancel');
				break;

			case 'paid':
				if (userRole === 'seller') {
					actions.push('markShipped');
				}
				if (userRole === 'buyer') {
					actions.push('cancel'); // Buyer can still cancel after payment
				}
				actions.push('dispute');
				break;

			case 'shipped':
				if (userRole === 'buyer') {
					actions.push('markDelivered');
				}
				actions.push('dispute');
				break;

			case 'delivered':
				// Both can leave reviews after delivery
				actions.push('leaveReview');
				actions.push('dispute');
				break;

			case 'completed':
				actions.push('leaveReview');
				break;

			case 'cancelled':
			case 'failed':
				// No actions available for cancelled/failed orders
				break;

			case 'disputed':
				// Only contact support/other party during disputes
				break;
		}

		return actions;
	});
</script>

<div class={`order-actions ${className}`}>
	{#if availableActions.length > 0}
		<div class="flex flex-col sm:flex-row gap-3">
			{#each availableActions as action}
				{#if action === 'markShipped'}
					{#if showTrackingInput}
						<div class="flex flex-col gap-2 p-3 bg-[color:var(--surface-muted)] rounded-lg">
							<label for="tracking" class="text-sm font-medium text-[color:var(--text-primary)]">
								Add tracking number (optional):
							</label>
							<div class="flex gap-2">
								<input
									id="tracking"
									type="text"
									bind:value={trackingInput}
									placeholder="Enter tracking number"
									class="input flex-1"
									disabled={isLoading}
								/>
								<button
									onclick={handleMarkShipped}
									disabled={isLoading}
									class="btn btn-primary"
								>
									{isLoading ? 'Updating...' : 'Confirm'}
								</button>
								<button
									onclick={() => showTrackingInput = false}
									disabled={isLoading}
									class="btn btn-secondary"
								>
									Cancel
								</button>
							</div>
						</div>
					{:else}
						<button
							onclick={() => showTrackingInput = true}
							disabled={isLoading}
							class="btn btn-primary"
						>
							📦 Mark as Shipped
						</button>
					{/if}

				{:else if action === 'markDelivered'}
					<button
						onclick={handleMarkDelivered}
						disabled={isLoading}
						class="btn btn-primary"
					>
						✅ Mark as Delivered
					</button>

				{:else if action === 'cancel'}
					{#if showCancelForm}
						<div class="flex flex-col gap-2 p-3 bg-[color:var(--surface-muted)] rounded-lg">
							<label for="cancelReason" class="text-sm font-medium text-[color:var(--text-primary)]">
								Cancellation reason (optional):
							</label>
							<div class="flex flex-col gap-2">
								<textarea
									id="cancelReason"
									bind:value={cancelReason}
									placeholder="Why are you cancelling this order?"
									class="input min-h-[80px] resize-none"
									disabled={isLoading}
								></textarea>
								<div class="flex gap-2">
									<button
										onclick={handleCancelOrder}
										disabled={isLoading}
										class="btn btn-error flex-1"
									>
										{isLoading ? 'Cancelling...' : 'Confirm Cancellation'}
									</button>
									<button
										onclick={() => showCancelForm = false}
										disabled={isLoading}
										class="btn btn-secondary"
									>
										Back
									</button>
								</div>
							</div>
						</div>
					{:else}
						<button
							onclick={() => showCancelForm = true}
							disabled={isLoading}
							class="btn btn-error"
						>
							❌ Cancel Order
						</button>
					{/if}

				{:else if action === 'dispute'}
					{#if showDisputeForm}
						<div class="flex flex-col gap-2 p-3 bg-[color:var(--surface-muted)] rounded-lg">
							<label for="disputeReason" class="text-sm font-medium text-[color:var(--text-primary)]">
								Dispute reason:
							</label>
							<div class="flex flex-col gap-2">
								<textarea
									id="disputeReason"
									bind:value={disputeReason}
									placeholder="Please describe the issue with this order..."
									class="input min-h-[80px] resize-none"
									disabled={isLoading}
									required
								></textarea>
								<div class="flex gap-2">
									<button
										onclick={handleDisputeOrder}
										disabled={isLoading || !disputeReason.trim()}
										class="btn btn-warning flex-1"
									>
										{isLoading ? 'Submitting...' : 'Submit Dispute'}
									</button>
									<button
										onclick={() => showDisputeForm = false}
										disabled={isLoading}
										class="btn btn-secondary"
									>
										Back
									</button>
								</div>
							</div>
						</div>
					{:else}
						<button
							onclick={() => showDisputeForm = true}
							disabled={isLoading}
							class="btn btn-warning"
						>
							⚠️ Dispute Order
						</button>
					{/if}

				{:else if action === 'contact'}
					<button
						onclick={handleContactOtherParty}
						disabled={isLoading}
						class="btn btn-secondary"
					>
						💬 Contact {userRole === 'buyer' ? 'Seller' : 'Buyer'}
					</button>

				{:else if action === 'leaveReview'}
					<button
						onclick={handleLeaveReview}
						disabled={isLoading}
						class="btn btn-primary"
					>
						⭐ Leave Review
					</button>
				{/if}
			{/each}
		</div>

		{#if trackingNumber && (status === 'shipped' || status === 'delivered')}
			<div class="mt-4 p-3 bg-[color:var(--surface-muted)] rounded-lg">
				<p class="text-sm text-[color:var(--text-secondary)] mb-1">Tracking Number:</p>
				<p class="text-sm font-mono text-[color:var(--text-primary)]">{trackingNumber}</p>
			</div>
		{/if}
	{:else}
		<div class="text-center text-[color:var(--text-secondary)] py-4">
			{#if status === 'cancelled'}
				This order has been cancelled.
			{:else if status === 'failed'}
				This order payment failed.
			{:else if status === 'disputed'}
				This order is under dispute. Please contact support.
			{:else}
				No actions available for this order.
			{/if}
		</div>
	{/if}
</div>

<style>
	.order-actions {
		border-top: 1px solid var(--border-subtle);
		padding-top: var(--space-4);
		margin-top: var(--space-4);
	}

	.btn {
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-lg);
		font-weight: var(--font-medium);
		font-size: var(--text-sm);
		transition: background-color var(--duration-base) var(--ease-out), border-color var(--duration-base) var(--ease-out);
		min-height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		border: 1px solid transparent;
		cursor: pointer;
	}

	.btn-primary {
		background: var(--primary);
		color: var(--primary-fg);
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--primary-600);
	}

	.btn-secondary {
		background: var(--surface-muted);
		color: var(--text-primary);
		border: 1px solid var(--border-subtle);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--surface-emphasis);
	}

	.btn-error {
		background: var(--status-error-bg);
		color: var(--status-error-text);
		border: 1px solid var(--status-error-border);
	}

	.btn-error:hover:not(:disabled) {
		background: var(--red-600);
		color: var(--text-inverse);
	}

	.btn-warning {
		background: var(--status-warning-bg);
		color: var(--status-warning-text);
		border: 1px solid var(--status-warning-border);
	}

	.btn-warning:hover:not(:disabled) {
		background: var(--yellow-600);
		color: var(--text-inverse);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.input {
		width: 100%;
		padding: var(--space-3);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
		background: var(--surface-base);
		color: var(--text-primary);
		font-size: var(--text-base);
	}

	.input:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px var(--input-focus-ring);
	}
</style>