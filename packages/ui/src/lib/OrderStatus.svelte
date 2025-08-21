<script lang="ts">
	interface Props {
		status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'disputed';
		showIcon?: boolean;
		size?: 'sm' | 'md' | 'lg';
		className?: string;
	}

	let { 
		status, 
		showIcon = true, 
		size = 'md',
		className = ''
	}: Props = $props();

	const statusConfig = {
		pending: {
			label: 'Pending',
			icon: '⏳',
			bgColor: 'bg-yellow-100',
			textColor: 'text-yellow-800',
			borderColor: 'border-yellow-200'
		},
		paid: {
			label: 'Payment Received',
			icon: '💳',
			bgColor: 'bg-blue-100',
			textColor: 'text-blue-800',
			borderColor: 'border-blue-200'
		},
		shipped: {
			label: 'Shipped',
			icon: '📦',
			bgColor: 'bg-purple-100',
			textColor: 'text-purple-800',
			borderColor: 'border-purple-200'
		},
		delivered: {
			label: 'Delivered',
			icon: '✅',
			bgColor: 'bg-green-100',
			textColor: 'text-green-800',
			borderColor: 'border-green-200'
		},
		cancelled: {
			label: 'Cancelled',
			icon: '❌',
			bgColor: 'bg-gray-100',
			textColor: 'text-gray-800',
			borderColor: 'border-gray-200'
		},
		disputed: {
			label: 'Disputed',
			icon: '⚠️',
			bgColor: 'bg-red-100',
			textColor: 'text-red-800',
			borderColor: 'border-red-200'
		}
	};

	const config = $derived(statusConfig[status]);
	
	const sizeClasses = {
		sm: 'px-2 py-1 text-xs',
		md: 'px-3 py-1.5 text-sm',
		lg: 'px-4 py-2 text-base'
	};

	const classes = $derived(`
		inline-flex items-center gap-1.5 rounded-full border font-medium
		${config.bgColor} ${config.textColor} ${config.borderColor}
		${sizeClasses[size]}
		${className}
	`.trim());
</script>

<span class={classes}>
	{#if showIcon}
		<span class="leading-none">{config.icon}</span>
	{/if}
	{config.label}
</span>