<script lang="ts">
	interface TimelineStep {
		key: string;
		label: string;
		timestamp?: string;
		isCompleted: boolean;
		isCurrent: boolean;
		icon: string;
		description?: string;
	}

	interface Props {
		currentStatus: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'disputed' | 'failed' | 'completed';
		createdAt: string;
		paidAt?: string;
		shippedAt?: string;
		deliveredAt?: string;
		cancelledAt?: string;
		trackingNumber?: string;
		className?: string;
	}

	let { 
		currentStatus, 
		createdAt,
		paidAt,
		shippedAt, 
		deliveredAt,
		cancelledAt,
		trackingNumber,
		className = ''
	}: Props = $props();

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const getTimelineSteps = $derived((): TimelineStep[] => {
		const baseSteps = [
			{
				key: 'pending',
				label: 'Order Placed',
				timestamp: createdAt,
				isCompleted: true,
				isCurrent: currentStatus === 'pending',
				icon: '📝',
				description: 'Your order has been created'
			},
			{
				key: 'paid',
				label: 'Payment Confirmed',
				timestamp: paidAt,
				isCompleted: ['paid', 'shipped', 'delivered', 'completed'].includes(currentStatus),
				isCurrent: currentStatus === 'paid',
				icon: '💳',
				description: 'Payment has been processed successfully'
			},
			{
				key: 'shipped',
				label: 'Shipped',
				timestamp: shippedAt,
				isCompleted: ['shipped', 'delivered', 'completed'].includes(currentStatus),
				isCurrent: currentStatus === 'shipped',
				icon: '📦',
				description: trackingNumber ? `Tracking: ${trackingNumber}` : 'Item is on its way'
			},
			{
				key: 'delivered',
				label: 'Delivered',
				timestamp: deliveredAt,
				isCompleted: ['delivered', 'completed'].includes(currentStatus),
				isCurrent: currentStatus === 'delivered',
				icon: '✅',
				description: 'Order has been delivered'
			}
		];

		// Handle special statuses
		if (currentStatus === 'cancelled') {
			return [
				baseSteps[0],
				{
					key: 'cancelled',
					label: 'Cancelled',
					timestamp: cancelledAt,
					isCompleted: true,
					isCurrent: true,
					icon: '❌',
					description: 'Order was cancelled'
				}
			];
		}

		if (currentStatus === 'failed') {
			return [
				baseSteps[0],
				{
					key: 'failed',
					label: 'Payment Failed',
					timestamp: cancelledAt,
					isCompleted: true,
					isCurrent: true,
					icon: '💥',
					description: 'Payment could not be processed'
				}
			];
		}

		if (currentStatus === 'disputed') {
			return [
				...baseSteps.slice(0, -1),
				{
					key: 'disputed',
					label: 'Disputed',
					timestamp: undefined,
					isCompleted: true,
					isCurrent: true,
					icon: '⚠️',
					description: 'Order is under dispute'
				}
			];
		}

		if (currentStatus === 'completed') {
			return [
				...baseSteps,
				{
					key: 'completed',
					label: 'Completed',
					timestamp: undefined,
					isCompleted: true,
					isCurrent: true,
					icon: '🎉',
					description: 'Order completed successfully'
				}
			];
		}

		return baseSteps;
	});
</script>

<div class={`order-timeline ${className}`}>
	<h3 class="text-lg font-semibold mb-4 text-[color:var(--text-primary)]">Order Progress</h3>
	
	<div class="relative">
		{#each getTimelineSteps as step, index (step.key)}
			<div class="flex items-start mb-6 last:mb-0">
				<!-- Timeline connector -->
				{#if index < getTimelineSteps.length - 1}
					<div class="absolute left-4 top-8 w-0.5 h-6 {step.isCompleted ? 'bg-[color:var(--status-success-border)]' : 'bg-[color:var(--border-subtle)]'}"></div>
				{/if}
				
				<!-- Step icon -->
				<div class="relative flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm
					{step.isCompleted ? 'bg-[color:var(--status-success-bg)] text-[color:var(--status-success-text)] border-2 border-[color:var(--status-success-border)]' : 
					 step.isCurrent ? 'bg-[color:var(--status-warning-bg)] text-[color:var(--status-warning-text)] border-2 border-[color:var(--status-warning-border)]' : 
					 'bg-[color:var(--surface-muted)] text-[color:var(--text-secondary)] border-2 border-[color:var(--border-subtle)]'}
				">
					{step.icon}
				</div>
				
				<!-- Step content -->
				<div class="ml-4 flex-1 min-w-0">
					<div class="flex items-center justify-between mb-1">
						<h4 class="text-sm font-medium {step.isCompleted || step.isCurrent ? 'text-[color:var(--text-primary)]' : 'text-[color:var(--text-secondary)]'}">
							{step.label}
						</h4>
						{#if step.timestamp}
							<time class="text-xs text-[color:var(--text-secondary)]">
								{formatDate(step.timestamp)}
							</time>
						{/if}
					</div>
					{#if step.description}
						<p class="text-sm text-[color:var(--text-secondary)]">
							{step.description}
						</p>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.order-timeline {
		background: var(--surface-base);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
	}
</style>