<script lang="ts">
	interface Props {
		status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'disputed' | 'failed' | 'completed';
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
			bgColor: 'bg-[color:var(--status-warning-bg)]',
			textColor: 'text-[color:var(--status-warning-text)]',
			borderColor: 'border-[color:var(--status-warning-border)]'
		},
		paid: {
			label: 'Payment Received',
			icon: '💳',
			bgColor: 'bg-[color:var(--status-info-bg)]',
			textColor: 'text-[color:var(--status-info-text)]',
			borderColor: 'border-[color:var(--status-info-border)]'
		},
		shipped: {
			label: 'Shipped',
			icon: '📦',
			bgColor: 'bg-[color:var(--status-info-bg)]',
			textColor: 'text-[color:var(--status-info-text)]',
			borderColor: 'border-[color:var(--status-info-border)]'
		},
		delivered: {
			label: 'Delivered',
			icon: '✅',
			bgColor: 'bg-[color:var(--status-success-bg)]',
			textColor: 'text-[color:var(--status-success-text)]',
			borderColor: 'border-[color:var(--status-success-border)]'
		},
		cancelled: {
			label: 'Cancelled',
			icon: '❌',
			bgColor: 'bg-[color:var(--surface-muted)]',
			textColor: 'text-[color:var(--text-secondary)]',
			borderColor: 'border-[color:var(--border-subtle)]'
		},
		disputed: {
			label: 'Disputed',
			icon: '⚠️',
			bgColor: 'bg-[color:var(--status-error-bg)]',
			textColor: 'text-[color:var(--status-error-text)]',
			borderColor: 'border-[color:var(--status-error-border)]'
		},
		failed: {
			label: 'Failed',
			icon: '💥',
			bgColor: 'bg-[color:var(--status-error-bg)]',
			textColor: 'text-[color:var(--status-error-text)]',
			borderColor: 'border-[color:var(--status-error-border)]'
		},
		completed: {
			label: 'Completed',
			icon: '🎉',
			bgColor: 'bg-[color:var(--status-success-bg)]',
			textColor: 'text-[color:var(--status-success-text)]',
			borderColor: 'border-[color:var(--status-success-border)]'
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