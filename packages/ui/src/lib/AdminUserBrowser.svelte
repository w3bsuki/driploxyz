<!--
@component AdminUserBrowser - Comprehensive user management for admins
View users by country, search, filter, and manage accounts
-->
<script lang="ts">
	import Button from './Button.svelte';
	import Input from './Input.svelte';
	import Select from './Select.svelte';
	import Badge from './Badge.svelte';
	import AdminSecurityCheck from './AdminSecurityCheck.svelte';

	interface UserData {
		id: string;
		username: string;
		full_name: string;
		email: string;
		country_code: string;
		role: string;
		is_verified: boolean;
		subscription_tier: string;
		current_balance: number;
		total_sales_value: number;
		sales_count: number;
		purchases_count: number;
		last_active_at: string;
		created_at: string;
		auth_created_at: string;
		last_sign_in_at: string;
	}

	interface Props {
		users?: UserData[];
		loading?: boolean;
		onSearch: (query: string, filters: SearchFilters) => Promise<void>;
		onUserAction: (action: string, userId: string) => Promise<void>;
	}

	interface SearchFilters {
		country: string;
		status: string;
		subscription: string;
		dateRange: string;
	}

	let { 
		users = [], 
		loading = false,
		onSearch,
		onUserAction
	}: Props = $props();

	// Search and filter state
	let searchQuery = $state('');
	let filters = $state<SearchFilters>({
		country: 'all',
		status: 'all',
		subscription: 'all',
		dateRange: 'all'
	});

	// Security check state
	let securityCheckOpen = $state(false);
	let pendingAction = $state<{action: string, userId: string} | null>(null);

	// Pagination
	let currentPage = $state(1);
	let usersPerPage = 20;
	const totalPages = $derived(Math.ceil(users.length / usersPerPage));
	const paginatedUsers = $derived(
		users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage)
	);

	const formatCurrency = (amount: number, country: string) => {
		const currency = country === 'UK' ? 'GBP' : 'BGN';
		const locale = country === 'UK' ? 'en-GB' : 'bg-BG';
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return 'Never';
		return new Intl.DateTimeFormat('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(dateString));
	};

	const getStatusBadge = (user: UserData) => {
		if (!user.last_active_at) return { text: 'Inactive', variant: 'secondary' };
		
		const lastActive = new Date(user.last_active_at);
		const daysSince = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
		
		if (daysSince <= 1) return { text: 'Online', variant: 'success' };
		if (daysSince <= 7) return { text: 'Active', variant: 'primary' };
		if (daysSince <= 30) return { text: 'Recent', variant: 'warning' };
		return { text: 'Inactive', variant: 'secondary' };
	};

	const handleSearch = async () => {
		await onSearch(searchQuery, filters);
	};

	const handleUserAction = (action: string, userId: string) => {
		pendingAction = { action, userId };
		securityCheckOpen = true;
	};

	const handleSecurityConfirm = async (securityCode: string) => {
		if (!pendingAction) return;
		
		try {
			await onUserAction(pendingAction.action, pendingAction.userId);
			pendingAction = null;
			securityCheckOpen = false;
		} catch (error) {
			// Error will be handled by the security check component
			throw error;
		}
	};

	const handleSecurityClose = () => {
		securityCheckOpen = false;
		pendingAction = null;
	};
</script>

<div class="admin-user-browser">
	<!-- Search and Filters -->
	<div class="search-section">
		<div class="search-header">
			<h2>User Management</h2>
			<Badge variant="secondary">{users.length} users</Badge>
		</div>

		<div class="search-controls">
			<div class="search-input">
				<Input
					bind:value={searchQuery}
					placeholder="Search by username, email, or ID..."
					onkeydown={(e) => e.key === 'Enter' && handleSearch()}
				/>
				<Button variant="primary" onclick={handleSearch} {loading}>
					Search
				</Button>
			</div>

			<div class="filters">
				<Select
					bind:value={filters.country}
					options={[
						{ value: 'all', label: 'All Countries' },
						{ value: 'UK', label: '🇬🇧 United Kingdom' },
						{ value: 'BG', label: '🇧🇬 Bulgaria' }
					]}
					onchange={handleSearch}
				/>
				<Select
					bind:value={filters.status}
					options={[
						{ value: 'all', label: 'All Status' },
						{ value: 'active', label: 'Active (7 days)' },
						{ value: 'recent', label: 'Recent (30 days)' },
						{ value: 'inactive', label: 'Inactive' }
					]}
					onchange={handleSearch}
				/>
				<Select
					bind:value={filters.subscription}
					options={[
						{ value: 'all', label: 'All Plans' },
						{ value: 'free', label: 'Free' },
						{ value: 'premium', label: 'Premium' },
						{ value: 'pro', label: 'Pro' }
					]}
					onchange={handleSearch}
				/>
			</div>
		</div>
	</div>

	<!-- Users Table -->
	<div class="users-table-container">
		{#if loading}
			<div class="loading-state">
				<p>Loading users...</p>
			</div>
		{:else if paginatedUsers.length === 0}
			<div class="empty-state">
				<p>No users found matching your criteria</p>
			</div>
		{:else}
			<div class="users-table">
				<div class="table-header">
					<div class="col-user">User</div>
					<div class="col-activity">Activity</div>
					<div class="col-sales">Sales</div>
					<div class="col-balance">Balance</div>
					<div class="col-actions">Actions</div>
				</div>

				{#each paginatedUsers as user (user.id)}
					<div class="table-row">
						<div class="col-user">
							<div class="user-info">
								<div class="user-primary">
									<span class="username">@{user.username}</span>
									<span class="country-flag">
										{user.country_code === 'UK' ? '🇬🇧' : '🇧🇬'}
									</span>
									{#if user.is_verified}
										<Badge variant="success" size="sm">✓</Badge>
									{/if}
								</div>
								<div class="user-secondary">
									<span class="full-name">{user.full_name || 'No name set'}</span>
									<span class="email">{user.email}</span>
								</div>
								<div class="user-meta">
									<Badge variant={getStatusBadge(user).variant} size="sm">
										{getStatusBadge(user).text}
									</Badge>
									<span class="subscription">{user.subscription_tier || 'free'}</span>
								</div>
							</div>
						</div>

						<div class="col-activity">
							<div class="activity-info">
								<div class="activity-item">
									<span class="label">Joined:</span>
									<span class="value">{formatDate(user.auth_created_at)}</span>
								</div>
								<div class="activity-item">
									<span class="label">Last seen:</span>
									<span class="value">{formatDate(user.last_active_at)}</span>
								</div>
								<div class="activity-item">
									<span class="label">Last login:</span>
									<span class="value">{formatDate(user.last_sign_in_at)}</span>
								</div>
							</div>
						</div>

						<div class="col-sales">
							<div class="sales-info">
								<div class="sales-stats">
									<div class="stat">
										<span class="stat-value">{user.sales_count || 0}</span>
										<span class="stat-label">Sales</span>
									</div>
									<div class="stat">
										<span class="stat-value">{user.purchases_count || 0}</span>
										<span class="stat-label">Buys</span>
									</div>
								</div>
								<div class="sales-value">
									{formatCurrency(user.total_sales_value || 0, user.country_code)}
								</div>
							</div>
						</div>

						<div class="col-balance">
							<div class="balance-info">
								<div class="balance-amount">
									{formatCurrency(user.current_balance || 0, user.country_code)}
								</div>
								{#if user.current_balance > 0}
									<div class="pending-payout">
										<Badge variant="warning" size="sm">Pending payout</Badge>
									</div>
								{/if}
							</div>
						</div>

						<div class="col-actions">
							<div class="action-buttons">
								<Button 
									variant="secondary" 
									size="sm"
									onclick={() => handleUserAction('view_profile', user.id)}
								>
									View
								</Button>
								<Button 
									variant="secondary" 
									size="sm"
									onclick={() => handleUserAction('view_listings', user.id)}
								>
									Listings
								</Button>
								{#if user.current_balance > 0}
									<Button 
										variant="primary" 
										size="sm"
										onclick={() => handleUserAction('process_payout', user.id)}
									>
										Payout
									</Button>
								{/if}
								<Button 
									variant="danger" 
									size="sm"
									onclick={() => handleUserAction('suspend_user', user.id)}
								>
									Suspend
								</Button>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Pagination -->
			{#if totalPages > 1}
				<div class="pagination">
					<Button 
						variant="secondary" 
						disabled={currentPage <= 1}
						onclick={() => currentPage = Math.max(1, currentPage - 1)}
					>
						Previous
					</Button>
					<span class="page-info">
						Page {currentPage} of {totalPages}
					</span>
					<Button 
						variant="secondary" 
						disabled={currentPage >= totalPages}
						onclick={() => currentPage = Math.min(totalPages, currentPage + 1)}
					>
						Next
					</Button>
				</div>
			{/if}
		{/if}
	</div>
</div>

<!-- Security Check Modal -->
<AdminSecurityCheck
	isOpen={securityCheckOpen}
	operation={pendingAction?.action || 'unknown'}
	onClose={handleSecurityClose}
	onConfirm={handleSecurityConfirm}
/>

<style>
	@reference theme();
	
	.admin-user-browser {
		@apply flex flex-col gap-6;
	}

	.search-section {
		@apply bg-white rounded-lg border p-6 flex flex-col gap-4;
	}

	.search-header {
		@apply flex items-center justify-between;
	}

	.search-header h2 {
		@apply text-2xl font-bold text-gray-900;
	}

	.search-controls {
		@apply flex flex-col gap-4;
	}

	.search-input {
		@apply flex gap-3;
	}

	.search-input > :first-child {
		@apply flex-1;
	}

	.filters {
		@apply grid grid-cols-1 md:grid-cols-3 gap-3;
	}

	.users-table-container {
		@apply bg-white rounded-lg border;
	}

	.loading-state,
	.empty-state {
		@apply text-center py-12 text-gray-500;
	}

	.users-table {
		@apply divide-y divide-gray-200;
	}

	.table-header {
		@apply grid grid-cols-12 gap-4 p-4 bg-gray-50 font-medium text-sm text-gray-700;
	}

	.table-row {
		@apply grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors;
	}

	.col-user { @apply col-span-4; }
	.col-activity { @apply col-span-3; }
	.col-sales { @apply col-span-2; }
	.col-balance { @apply col-span-1; }
	.col-actions { @apply col-span-2; }

	.user-info {
		@apply flex flex-col gap-1;
	}

	.user-primary {
		@apply flex items-center gap-2;
	}

	.username {
		@apply font-semibold text-gray-900;
	}

	.country-flag {
		@apply text-lg;
	}

	.user-secondary {
		@apply flex flex-col gap-1;
	}

	.full-name {
		@apply block text-sm text-gray-800;
	}

	.email {
		@apply block text-sm text-gray-600;
	}

	.user-meta {
		@apply flex items-center gap-2;
	}

	.subscription {
		@apply text-xs text-gray-500 capitalize;
	}

	.activity-info {
		@apply flex flex-col gap-1;
	}

	.activity-item {
		@apply flex flex-col text-sm;
	}

	.label {
		@apply text-xs text-gray-500;
	}

	.value {
		@apply text-gray-900;
	}

	.sales-info {
		@apply flex flex-col gap-2;
	}

	.sales-stats {
		@apply flex gap-3;
	}

	.stat {
		@apply text-center;
	}

	.stat-value {
		@apply block text-lg font-semibold text-gray-900;
	}

	.stat-label {
		@apply text-xs text-gray-500;
	}

	.sales-value {
		@apply text-sm font-medium text-green-600;
	}

	.balance-info {
		@apply flex flex-col gap-1;
	}

	.balance-amount {
		@apply font-semibold text-gray-900;
	}

	.action-buttons {
		@apply flex flex-col gap-1;
	}

	.pagination {
		@apply flex items-center justify-center gap-4 p-4 border-t;
	}

	.page-info {
		@apply text-sm text-gray-600;
	}
</style>