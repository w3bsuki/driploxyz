<!--
@component AdminDashboard - Main admin interface layout
Complete admin panel with user management, payouts, analytics and notifications
-->
<script lang="ts">
	import AdminUserBrowser from './AdminUserBrowser.svelte';
	import AdminPayoutDashboard from './AdminPayoutDashboard.svelte';
	import AdminNotificationCenter from './AdminNotificationCenter.svelte';
	import AdminAnalyticsPanel from './AdminAnalyticsPanel.svelte';
	import Badge from './Badge.svelte';
	import Button from './Button.svelte';

	interface Props {
		// Current active view
		activeView?: 'overview' | 'users' | 'payouts' | 'notifications' | 'analytics';
		
		// Admin user info
		adminUser?: {
			username: string;
			role: string;
			permissions: string[];
			country_access: string[];
		};
		
		// Quick stats for overview
		quickStats?: {
			pending_payouts: number;
			unread_notifications: number;
			new_users_today: number;
			total_revenue_today: number;
		};

		// Event handlers
		onViewChange: (view: string) => void;
		onLogout: () => void;
	}

	let { 
		activeView = 'overview',
		adminUser,
		quickStats,
		onViewChange,
		onLogout
	}: Props = $props();

	// Navigation items
	const navItems = [
		{
			id: 'overview',
			label: 'Overview',
			icon: '📊',
			description: 'Quick stats and summary'
		},
		{
			id: 'users',
			label: 'Users',
			icon: '👥',
			description: 'User management and profiles',
			badge: quickStats?.new_users_today || 0
		},
		{
			id: 'payouts',
			label: 'Payouts',
			icon: '💰',
			description: 'Payout requests and processing',
			badge: quickStats?.pending_payouts || 0,
			urgent: (quickStats?.pending_payouts || 0) > 0
		},
		{
			id: 'notifications',
			label: 'Notifications',
			icon: '🔔',
			description: 'System alerts and updates',
			badge: quickStats?.unread_notifications || 0,
			urgent: (quickStats?.unread_notifications || 0) > 5
		},
		{
			id: 'analytics',
			label: 'Analytics',
			icon: '📈',
			description: 'Revenue and performance metrics'
		}
	];

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency: 'GBP',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	};

	const getPermissionBadges = (permissions: string[]) => {
		const badges = [];
		if (permissions.includes('manage_payouts')) badges.push({ text: 'Payouts', variant: 'success' });
		if (permissions.includes('view_users')) badges.push({ text: 'Users', variant: 'primary' });
		if (permissions.includes('super_admin')) badges.push({ text: 'Super Admin', variant: 'danger' });
		return badges;
	};
</script>

<div class="admin-dashboard">
	<!-- Header -->
	<header class="dashboard-header">
		<div class="header-content">
			<div class="header-left">
				<div class="logo-section">
					<span class="logo">🏪</span>
					<div class="brand-info">
						<h1 class="brand-name">Driplo Admin</h1>
						<p class="brand-subtitle">Multi-country marketplace management</p>
					</div>
				</div>
			</div>

			<div class="header-right">
				{#if adminUser}
					<div class="admin-info">
						<div class="admin-details">
							<span class="admin-name">@{adminUser.username}</span>
							<div class="admin-meta">
								<Badge variant="secondary">{adminUser.role}</Badge>
								{#each getPermissionBadges(adminUser.permissions) as badge}
									<Badge variant={badge.variant} size="sm">{badge.text}</Badge>
								{/each}
							</div>
							<div class="country-access">
								Access: {adminUser.country_access.map(c => c === 'UK' ? '🇬🇧 UK' : '🇧🇬 BG').join(', ')}
							</div>
						</div>
						<Button variant="danger" size="sm" onclick={onLogout}>
							Logout
						</Button>
					</div>
				{/if}
			</div>
		</div>
	</header>

	<!-- Navigation -->
	<nav class="dashboard-nav">
		<div class="nav-content">
			{#each navItems as item}
				<button
					class="nav-item"
					class:active={activeView === item.id}
					class:urgent={item.urgent}
					onclick={() => onViewChange(item.id)}
				>
					<span class="nav-icon">{item.icon}</span>
					<div class="nav-text">
						<span class="nav-label">{item.label}</span>
						<span class="nav-description">{item.description}</span>
					</div>
					{#if item.badge && item.badge > 0}
						<Badge variant={item.urgent ? 'danger' : 'primary'} size="sm">
							{item.badge}
						</Badge>
					{/if}
				</button>
			{/each}
		</div>
	</nav>

	<!-- Main Content -->
	<main class="dashboard-main">
		{#if activeView === 'overview'}
			<!-- Overview Dashboard -->
			<div class="overview-content">
				<div class="overview-header">
					<h2>Admin Dashboard Overview</h2>
					<p class="overview-subtitle">
						Real-time insights across your multi-country marketplace
					</p>
				</div>

				{#if quickStats}
					<div class="quick-stats-grid">
						<div class="quick-stat-card primary">
							<div class="stat-icon">💰</div>
							<div class="stat-content">
								<div class="stat-value">{formatCurrency(quickStats.total_revenue_today)}</div>
								<div class="stat-label">Revenue Today</div>
							</div>
						</div>

						<div class="quick-stat-card success">
							<div class="stat-icon">👥</div>
							<div class="stat-content">
								<div class="stat-value">{quickStats.new_users_today}</div>
								<div class="stat-label">New Users Today</div>
							</div>
						</div>

						<div class="quick-stat-card {quickStats.pending_payouts > 0 ? 'warning' : 'secondary'}">
							<div class="stat-icon">⏳</div>
							<div class="stat-content">
								<div class="stat-value">{quickStats.pending_payouts}</div>
								<div class="stat-label">Pending Payouts</div>
							</div>
							{#if quickStats.pending_payouts > 0}
								<div class="stat-action">
									<Button variant="warning" size="sm" onclick={() => onViewChange('payouts')}>
										Review
									</Button>
								</div>
							{/if}
						</div>

						<div class="quick-stat-card {quickStats.unread_notifications > 5 ? 'danger' : 'info'}">
							<div class="stat-icon">🔔</div>
							<div class="stat-content">
								<div class="stat-value">{quickStats.unread_notifications}</div>
								<div class="stat-label">Notifications</div>
							</div>
							{#if quickStats.unread_notifications > 0}
								<div class="stat-action">
									<Button variant={quickStats.unread_notifications > 5 ? 'danger' : 'primary'} size="sm" onclick={() => onViewChange('notifications')}>
										View
									</Button>
								</div>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Quick Actions -->
				<div class="quick-actions">
					<h3>Quick Actions</h3>
					<div class="actions-grid">
						<button class="action-card" onclick={() => onViewChange('payouts')}>
							<div class="action-icon">💸</div>
							<div class="action-content">
								<h4>Process Payouts</h4>
								<p>Review and approve seller payouts</p>
							</div>
						</button>

						<button class="action-card" onclick={() => onViewChange('users')}>
							<div class="action-icon">👤</div>
							<div class="action-content">
								<h4>Manage Users</h4>
								<p>View and manage user accounts</p>
							</div>
						</button>

						<button class="action-card" onclick={() => onViewChange('analytics')}>
							<div class="action-icon">📊</div>
							<div class="action-content">
								<h4>View Analytics</h4>
								<p>Check performance metrics</p>
							</div>
						</button>

						<button class="action-card" onclick={() => onViewChange('notifications')}>
							<div class="action-icon">⚡</div>
							<div class="action-content">
								<h4>System Status</h4>
								<p>Check alerts and notifications</p>
							</div>
						</button>
					</div>
				</div>
			</div>
		{:else if activeView === 'users'}
			<AdminUserBrowser
				users={[]}
				onSearch={async () => {}}
				onUserAction={async () => {}}
			/>
		{:else if activeView === 'payouts'}
			<AdminPayoutDashboard
				payoutRequests={[]}
				onRefresh={async () => {}}
				onApproveRequest={async () => {}}
				onRejectRequest={async () => {}}
				onProcessPayout={async () => {}}
			/>
		{:else if activeView === 'notifications'}
			<AdminNotificationCenter
				notifications={[]}
				onMarkRead={async () => {}}
				onMarkAllRead={async () => {}}
				onRefresh={async () => {}}
				onNavigate={() => {}}
				onToggleRealTime={async () => {}}
			/>
		{:else if activeView === 'analytics'}
			<AdminAnalyticsPanel
				countryMetrics={[]}
				onTimeRangeChange={async () => {}}
				onRefresh={async () => {}}
				onExport={async () => {}}
			/>
		{/if}
	</main>
</div>

<style>
	.admin-dashboard {
		@apply min-h-screen bg-gray-50;
	}

	.dashboard-header {
		@apply bg-white border-b border-gray-200 sticky top-0 z-40;
	}

	.header-content {
		@apply max-w-7xl mx-auto px-4 py-4 flex items-center justify-between;
	}

	.header-left {
		@apply flex items-center;
	}

	.logo-section {
		@apply flex items-center gap-3;
	}

	.logo {
		@apply text-3xl;
	}

	.brand-name {
		@apply text-xl font-bold text-gray-900;
	}

	.brand-subtitle {
		@apply text-sm text-gray-600;
	}

	.header-right {
		@apply flex items-center gap-4;
	}

	.admin-info {
		@apply flex items-center gap-4;
	}

	.admin-details {
		@apply text-right;
	}

	.admin-name {
		@apply block font-semibold text-gray-900;
	}

	.admin-meta {
		@apply flex items-center gap-2 justify-end my-1;
	}

	.country-access {
		@apply text-xs text-gray-600;
	}

	.dashboard-nav {
		@apply bg-white border-b border-gray-200 sticky top-16 z-30;
	}

	.nav-content {
		@apply max-w-7xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto;
	}

	.nav-item {
		@apply flex items-center gap-3 px-4 py-3 rounded-lg text-left whitespace-nowrap transition-colors border border-transparent;
	}

	.nav-item:hover {
		@apply bg-gray-50 border-gray-200;
	}

	.nav-item.active {
		@apply bg-blue-50 border-blue-200 text-blue-800;
	}

	.nav-item.urgent {
		@apply border-red-200 bg-red-50;
	}

	.nav-item.urgent.active {
		@apply bg-red-100 border-red-300 text-red-900;
	}

	.nav-icon {
		@apply text-xl;
	}

	.nav-text {
		@apply flex-1 min-w-0;
	}

	.nav-label {
		@apply block font-medium;
	}

	.nav-description {
		@apply block text-xs text-gray-600;
	}

	.dashboard-main {
		@apply max-w-7xl mx-auto px-4 py-6;
	}

	.overview-content {
		@apply space-y-8;
	}

	.overview-header {
		@apply text-center;
	}

	.overview-header h2 {
		@apply text-3xl font-bold text-gray-900 mb-2;
	}

	.overview-subtitle {
		@apply text-gray-600;
	}

	.quick-stats-grid {
		@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
	}

	.quick-stat-card {
		@apply bg-white rounded-lg border p-6 flex items-center gap-4;
	}

	.quick-stat-card.primary { @apply border-blue-200 bg-blue-50; }
	.quick-stat-card.success { @apply border-green-200 bg-green-50; }
	.quick-stat-card.warning { @apply border-yellow-200 bg-yellow-50; }
	.quick-stat-card.danger { @apply border-red-200 bg-red-50; }
	.quick-stat-card.info { @apply border-cyan-200 bg-cyan-50; }
	.quick-stat-card.secondary { @apply border-gray-200 bg-gray-50; }

	.stat-icon {
		@apply text-3xl;
	}

	.stat-content {
		@apply flex-1;
	}

	.stat-value {
		@apply text-2xl font-bold text-gray-900;
	}

	.stat-label {
		@apply text-sm text-gray-600;
	}

	.quick-actions {
		@apply bg-white rounded-lg border p-6;
	}

	.quick-actions h3 {
		@apply text-xl font-bold text-gray-900 mb-4;
	}

	.actions-grid {
		@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4;
	}

	.action-card {
		@apply flex flex-col items-center gap-3 p-6 border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50 transition-colors text-center;
	}

	.action-icon {
		@apply text-3xl;
	}

	.action-content h4 {
		@apply font-semibold text-gray-900;
	}

	.action-content p {
		@apply text-sm text-gray-600;
	}
</style>