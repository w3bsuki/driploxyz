<script lang="ts">
	interface Order {
		id: string;
		status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'disputed';
		created_at: string;
		updated_at?: string;
		shipped_at?: string;
		delivered_at?: string;
		tracking_number?: string;
	}

	interface Props {
		order: Order;
		userType: 'buyer' | 'seller';
		className?: string;
	}

	let { order, userType, className = '' }: Props = $props();

	const timelineSteps = [
		{
			key: 'paid',
			label: 'Payment Confirmed',
			icon: '💳',
			description: 'Order payment has been processed'
		},
		{
			key: 'shipped',
			label: 'Shipped',
			icon: '📦',
			description: 'Item has been shipped'
		},
		{
			key: 'delivered',
			label: 'Delivered',
			icon: '✅',
			description: 'Item has been delivered'
		}
	];

	// Filter cancelled/disputed orders
	const isCompleteFlow = $derived(!['cancelled', 'disputed'].includes(order.status));

	const getStepStatus = (stepKey: string) => {
		const statusOrder = ['paid', 'shipped', 'delivered'];
		const currentIndex = statusOrder.indexOf(order.status);
		const stepIndex = statusOrder.indexOf(stepKey);
		
		if (stepIndex <= currentIndex) return 'completed';
		if (stepIndex === currentIndex + 1 && order.status !== 'cancelled') return 'current';
		return 'pending';
	};

	const getStepDate = (stepKey: string) => {
		switch (stepKey) {
			case 'paid':
				return order.created_at;
			case 'shipped':
				return order.shipped_at;
			case 'delivered':
				return order.delivered_at;
			default:
				return null;
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};
</script>

<div class={`space-y-4 ${className}`}>
	{#if !isCompleteFlow}
		<div class="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed">
			{#if order.status === 'cancelled'}
				<span class="text-2xl">❌</span>
				<div>
					<p class="font-medium text-gray-900">Order Cancelled</p>
					<p class="text-sm text-gray-500">This order has been cancelled</p>
				</div>
			{:else if order.status === 'disputed'}
				<span class="text-2xl">⚠️</span>
				<div>
					<p class="font-medium text-gray-900">Order Disputed</p>
					<p class="text-sm text-gray-500">There is an active dispute for this order</p>
				</div>
			{/if}
		</div>
	{:else}
		<div class="relative">
			{#each timelineSteps as step, index (step.key)}
				{@const stepStatus = getStepStatus(step.key)}
				{@const stepDate = getStepDate(step.key)}
				
				<div class="relative flex items-start gap-4 {index < timelineSteps.length - 1 ? 'pb-6' : ''}">
					<!-- Timeline line -->
					{#if index < timelineSteps.length - 1}
						<div class="absolute left-6 top-12 bottom-0 w-0.5 {stepStatus === 'completed' ? 'bg-green-500' : 'bg-gray-200'}"></div>
					{/if}
					
					<!-- Step icon -->
					<div class="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 {
						stepStatus === 'completed' ? 'bg-green-500 border-green-500 text-white' :
						stepStatus === 'current' ? 'bg-blue-500 border-blue-500 text-white' :
						'bg-white border-gray-300 text-gray-400'
					}">
						<span class="text-lg">{step.icon}</span>
					</div>
					
					<!-- Step content -->
					<div class="flex-1 min-w-0">
						<div class="flex items-center justify-between">
							<h4 class="text-sm font-medium {stepStatus === 'completed' ? 'text-gray-900' : stepStatus === 'current' ? 'text-blue-900' : 'text-gray-500'}">
								{step.label}
							</h4>
							{#if stepDate}
								<span class="text-xs text-gray-500">{formatDate(stepDate)}</span>
							{/if}
						</div>
						
						<p class="text-sm {stepStatus === 'completed' ? 'text-gray-600' : 'text-gray-400'}">
							{step.description}
						</p>
						
						<!-- Additional info -->
						{#if step.key === 'shipped' && order.tracking_number && stepStatus === 'completed'}
							<p class="text-xs text-blue-600 mt-1">
								Tracking: {order.tracking_number}
							</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>