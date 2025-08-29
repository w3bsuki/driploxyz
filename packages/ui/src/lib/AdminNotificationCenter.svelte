<!--
@component AdminNotificationCenter - Real-time admin notifications
Shows payout requests, user activity, system alerts with webhook integration
-->
<script lang="ts">
	import Button from './Button.svelte';
	import Badge from './Badge.svelte';

	interface Notification {
		id: string;
		type: 'payout_request' | 'user_signup' | 'high_value_sale' | 'suspicious_activity' | 'system_alert' | 'payment_failed';
		title: string;
		message: string;
		data?: any;
		priority: 'low' | 'normal' | 'high' | 'urgent';
		country_code?: string;
		user_id?: string;
		is_read: boolean;
		created_at: string;
		action_url?: string;
		action_label?: string;
	}

	interface NotificationStats {
		total_unread: number;
		by_priority: Record<string, number>;
		by_country: Record<string, number>;
		by_type: Record<string, number>;
	}

	interface Props {
		notifications?: Notification[];
		stats?: NotificationStats;
		loading?: boolean;
		realTimeEnabled?: boolean;
		onMarkRead: (notificationId: string) => Promise<void>;
		onMarkAllRead: () => Promise<void>;
		onRefresh: () => Promise<void>;
		onNavigate: (url: string) => void;
		onToggleRealTime: (enabled: boolean) => Promise<void>;
	}

	let { 
		notifications = [], 
		stats,
		loading = false,
		realTimeEnabled = false,
		onMarkRead,
		onMarkAllRead,
		onRefresh,
		onNavigate,
		onToggleRealTime
	}: Props = $props();

	// Filter state
	let typeFilter = $state('all');
	let priorityFilter = $state('all');
	let countryFilter = $state('all');
	let unreadOnly = $state(true);

	// Real-time connection status
	let connectionStatus = $state<'connected' | 'connecting' | 'disconnected'>('disconnected');

	// Filtered notifications
	const filteredNotifications = $derived(
		notifications
			.filter(notification => {
				if (unreadOnly && notification.is_read) return false;
				if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
				if (priorityFilter !== 'all' && notification.priority !== priorityFilter) return false;
				if (countryFilter !== 'all' && notification.country_code !== countryFilter) return false;
				return true;
			})
			.sort((a, b) => {
				// Sort by priority first, then by date
				const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
				const aPriority = priorityOrder[a.priority] || 0;
				const bPriority = priorityOrder[b.priority] || 0;
				
				if (aPriority !== bPriority) return bPriority - aPriority;
				
				return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
			})
	);

	const formatTimeAgo = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
		
		if (diffInMinutes < 1) return 'Just now';
		if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
		
		const diffInHours = Math.floor(diffInMinutes / 60);
		if (diffInHours < 24) return `${diffInHours}h ago`;
		
		const diffInDays = Math.floor(diffInHours / 24);
		if (diffInDays < 7) return `${diffInDays}d ago`;
		
		return date.toLocaleDateString('en-GB', { 
			day: '2-digit', 
			month: 'short',
			year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
		});
	};

	const getPriorityVariant = (priority: string) => {
		switch (priority) {
			case 'urgent': return 'danger';
			case 'high': return 'warning';
			case 'normal': return 'primary';
			case 'low': return 'secondary';
			default: return 'secondary';
		}
	};

	const getPriorityIcon = (priority: string) => {
		switch (priority) {
			case 'urgent': return '🚨';
			case 'high': return '⚠️';
			case 'normal': return 'ℹ️';
			case 'low': return '📝';
			default: return '📢';
		}
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case 'payout_request': return '💰';
			case 'user_signup': return '👋';
			case 'high_value_sale': return '🎉';
			case 'suspicious_activity': return '🔍';
			case 'system_alert': return '⚙️';
			case 'payment_failed': return '❌';
			default: return '📢';
		}
	};

	const handleNotificationClick = async (notification: Notification) => {
		// Mark as read if not already
		if (!notification.is_read) {
			await onMarkRead(notification.id);
		}
		
		// Navigate to action URL if available
		if (notification.action_url) {
			onNavigate(notification.action_url);
		}
	};

	const toggleRealTime = async () => {
		connectionStatus = 'connecting';
		try {
			await onToggleRealTime(!realTimeEnabled);
			connectionStatus = realTimeEnabled ? 'connected' : 'disconnected';
		} catch (error) {
			connectionStatus = 'disconnected';
			console.error('Failed to toggle real-time notifications:', error);
		}
	};
</script>

<div class="admin-notification-center">
	<!-- Header with Stats -->
	<div class="notification-header">
		<div class="header-info">
			<h2>Notification Center</h2>
			{#if stats}
				<div class="stats-summary">
					<Badge variant="danger">{stats.total_unread} unread</Badge>
					{#if stats.by_priority.urgent > 0}
						<Badge variant="danger">{stats.by_priority.urgent} urgent</Badge>
					{/if}
					{#if stats.by_priority.high > 0}
						<Badge variant="warning">{stats.by_priority.high} high</Badge>
					{/if}
				</div>
			{/if}
		</div>
		
		<div class="header-controls">
			<!-- Real-time toggle -->
			<div class="realtime-control">
				<button 
					class="realtime-toggle" 
					class:enabled={realTimeEnabled}
					onclick={toggleRealTime}
					disabled={connectionStatus === 'connecting'}
				>
					<span class="status-dot" class:connected={connectionStatus === 'connected'}></span>
					{#if connectionStatus === 'connecting'}
						Connecting...
					{:else if realTimeEnabled}
						Live Updates ON
					{:else}
						Live Updates OFF
					{/if}
				</button>
			</div>
			
			<Button variant="secondary" onclick={onRefresh} {loading}>
				🔄 Refresh
			</Button>
			
			{#if stats && stats.total_unread > 0}
				<Button variant="primary" onclick={onMarkAllRead}>
					Mark All Read
				</Button>
			{/if}
		</div>
	</div>

	<!-- Quick Stats -->
	{#if stats}
		<div class="quick-stats">
			<div class="stats-grid">
				<div class="stat-item">
					<span class="stat-label">By Type</span>
					<div class="stat-chips">
						{#each Object.entries(stats.by_type) as [type, count]}
							{#if count > 0}
								<span class="stat-chip">
									{getTypeIcon(type)} {count}
								</span>
							{/if}
						{/each}
					</div>
				</div>
				
				<div class="stat-item">
					<span class="stat-label">By Country</span>
					<div class="stat-chips">
						{#each Object.entries(stats.by_country) as [country, count]}
							{#if count > 0}
								<span class="stat-chip">
									{country === 'UK' ? '🇬🇧' : '🇧🇬'} {count}
								</span>
							{/if}
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Filters -->
	<div class="filters-section">
		<div class="filters">
			<label class="filter-toggle">
				<input type="checkbox" bind:checked={unreadOnly} />
				<span>Unread only</span>
			</label>
			
			<select bind:value={typeFilter} class="filter-select">
				<option value="all">All Types</option>
				<option value="payout_request">💰 Payout Requests</option>
				<option value="user_signup">👋 New Users</option>
				<option value="high_value_sale">🎉 High Value Sales</option>
				<option value="suspicious_activity">🔍 Suspicious Activity</option>
				<option value="system_alert">⚙️ System Alerts</option>
				<option value="payment_failed">❌ Payment Failed</option>
			</select>
			
			<select bind:value={priorityFilter} class="filter-select">
				<option value="all">All Priorities</option>
				<option value="urgent">🚨 Urgent</option>
				<option value="high">⚠️ High</option>
				<option value="normal">ℹ️ Normal</option>
				<option value="low">📝 Low</option>
			</select>
			
			<select bind:value={countryFilter} class="filter-select">
				<option value="all">All Countries</option>
				<option value="UK">🇬🇧 United Kingdom</option>
				<option value="BG">🇧🇬 Bulgaria</option>
			</select>
		</div>
	</div>

	<!-- Notifications List -->
	<div class="notifications-list">
		{#if loading}
			<div class="loading-state">
				<p>Loading notifications...</p>
			</div>
		{:else if filteredNotifications.length === 0}
			<div class="empty-state">
				<div class="empty-icon">🔔</div>
				<p class="empty-title">No notifications</p>
				<p class="empty-subtitle">
					{unreadOnly ? 'All caught up! No unread notifications.' : 'No notifications match your filters.'}
				</p>
			</div>
		{:else}
			{#each filteredNotifications as notification (notification.id)}
				<div 
					class="notification-item" 
					class:unread={!notification.is_read}
					class:urgent={notification.priority === 'urgent'}
					class:clickable={!!notification.action_url}
					onclick={() => handleNotificationClick(notification)}
				>
					<div class="notification-icon">
						{getTypeIcon(notification.type)}
					</div>
					
					<div class="notification-content">
						<div class="notification-header">
							<h4 class="notification-title">{notification.title}</h4>
							<div class="notification-meta">
								<Badge variant={getPriorityVariant(notification.priority)} size="sm">
									{getPriorityIcon(notification.priority)} {notification.priority}
								</Badge>
								{#if notification.country_code}
									<span class="country-indicator">
										{notification.country_code === 'UK' ? '🇬🇧' : '🇧🇬'}
									</span>
								{/if}
								<span class="notification-time">
									{formatTimeAgo(notification.created_at)}
								</span>
							</div>
						</div>
						
						<p class="notification-message">{notification.message}</p>
						
						{#if notification.action_label && notification.action_url}
							<div class="notification-action">
								<Button variant="secondary" size="sm">
									{notification.action_label}
								</Button>
							</div>
						{/if}
					</div>
					
					{#if !notification.is_read}
						<div class="unread-indicator"></div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>

	<!-- Webhook Status Footer -->
	<div class="webhook-status">
		<div class="webhook-info">
			<span class="webhook-label">Webhook Status:</span>
			<span class="webhook-status-indicator" class:connected={connectionStatus === 'connected'}>
				{connectionStatus}
			</span>
		</div>
		<div class="webhook-details">
			<span class="webhook-note">
				Real-time notifications powered by webhooks. 
				{realTimeEnabled ? 'Updates automatically' : 'Manual refresh required'}
			</span>
		</div>
	</div>
</div>

<style>
	@reference theme();

	.admin-notification-center {
		@apply flex flex-col gap-6;
	}

	.notification-header {
		@apply bg-white rounded-lg border p-6 flex items-center justify-between;
	}

	.header-info h2 {
		@apply text-2xl font-bold text-gray-900 mb-2;
	}

	.stats-summary {
		@apply flex gap-2 flex-wrap;
	}

	.header-controls {
		@apply flex items-center gap-3;
	}

	.realtime-control {
		@apply relative;
	}

	.realtime-toggle {
		@apply flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm hover:bg-gray-200 transition-colors disabled:opacity-50;
	}

	.realtime-toggle.enabled {
		@apply bg-green-100 border-green-300 text-green-800;
	}

	.status-dot {
		@apply w-2 h-2 rounded-full bg-gray-400;
	}

	.status-dot.connected {
		@apply bg-green-500 animate-pulse;
	}

	.quick-stats {
		@apply bg-white rounded-lg border p-4;
	}

	.stats-grid {
		@apply flex flex-col gap-3;
	}

	.stat-item {
		@apply flex flex-col gap-2;
	}

	.stat-label {
		@apply text-sm font-medium text-gray-700;
	}

	.stat-chips {
		@apply flex gap-2 flex-wrap;
	}

	.stat-chip {
		@apply inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-sm;
	}

	.filters-section {
		@apply bg-white rounded-lg border p-4;
	}

	.filters {
		@apply flex gap-3 flex-wrap items-center;
	}

	.filter-toggle {
		@apply flex items-center gap-2 text-sm cursor-pointer;
	}

	.filter-toggle input {
		@apply rounded;
	}

	.filter-select {
		@apply px-3 py-2 border border-gray-300 rounded-md text-sm;
	}

	.notifications-list {
		@apply bg-white rounded-lg border divide-y divide-gray-200 max-h-[70vh] overflow-auto;
	}

	.loading-state {
		@apply text-center py-8 text-gray-500;
	}

	.empty-state {
		@apply text-center py-12;
	}

	.empty-icon {
		@apply text-4xl mb-4;
	}

	.empty-title {
		@apply text-lg font-medium text-gray-900 mb-2;
	}

	.empty-subtitle {
		@apply text-gray-600;
	}

	.notification-item {
		@apply flex gap-4 p-4 hover:bg-gray-50 transition-colors relative;
	}

	.notification-item.unread {
		@apply bg-blue-50 border-l-4 border-l-blue-500;
	}

	.notification-item.urgent {
		@apply bg-red-50 border-l-4 border-l-red-500;
	}

	.notification-item.clickable {
		@apply cursor-pointer;
	}

	.notification-icon {
		@apply text-2xl flex-shrink-0 mt-1;
	}

	.notification-content {
		@apply flex-1 min-w-0;
	}

	.notification-header {
		@apply flex items-start justify-between gap-3 mb-2;
	}

	.notification-title {
		@apply font-semibold text-gray-900;
	}

	.notification-meta {
		@apply flex items-center gap-2 flex-shrink-0;
	}

	.country-indicator {
		@apply text-lg;
	}

	.notification-time {
		@apply text-sm text-gray-500;
	}

	.notification-message {
		@apply text-gray-700 mb-2;
	}

	.notification-action {
		@apply mt-3;
	}

	.unread-indicator {
		@apply absolute right-2 top-4 w-3 h-3 bg-blue-500 rounded-full;
	}

	.webhook-status {
		@apply bg-gray-50 rounded-lg border p-4 space-y-2;
	}

	.webhook-info {
		@apply flex items-center gap-2;
	}

	.webhook-label {
		@apply text-sm font-medium text-gray-700;
	}

	.webhook-status-indicator {
		@apply text-sm px-2 py-1 bg-gray-200 text-gray-600 rounded-md;
	}

	.webhook-status-indicator.connected {
		@apply bg-green-100 text-green-800;
	}

	.webhook-details {
		@apply text-sm text-gray-600;
	}
</style>