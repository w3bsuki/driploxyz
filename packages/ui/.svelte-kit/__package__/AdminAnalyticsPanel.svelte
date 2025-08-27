<!--
@component AdminAnalyticsPanel - Country-specific analytics and business metrics
Shows revenue, user growth, transaction volumes across UK/BG markets
-->
<script lang="ts">
	import Button from './Button.svelte';
	import Badge from './Badge.svelte';

	interface CountryMetrics {
		country_code: string;
		country_name: string;
		flag: string;
		currency: string;
		
		// User metrics
		total_users: number;
		active_users_30d: number;
		new_users_7d: number;
		new_users_30d: number;
		retention_rate_30d: number;
		
		// Revenue metrics
		total_revenue_30d: number;
		total_revenue_7d: number;
		avg_order_value: number;
		total_transactions_30d: number;
		conversion_rate: number;
		
		// Product metrics
		active_listings: number;
		total_listings_30d: number;
		sold_listings_30d: number;
		avg_listing_price: number;
		
		// Payout metrics
		pending_payouts: number;
		pending_payout_amount: number;
		completed_payouts_30d: number;
		completed_payout_amount_30d: number;
		
		// Growth metrics
		user_growth_rate: number;
		revenue_growth_rate: number;
		transaction_growth_rate: number;
	}

	interface PlatformSummary {
		total_revenue_30d: number;
		total_users: number;
		total_active_users: number;
		total_transactions: number;
		avg_revenue_per_user: number;
		platform_fee_earned: number;
		
		// Comparison metrics
		uk_vs_bg_revenue_ratio: number;
		uk_vs_bg_user_ratio: number;
		growth_trajectory: 'up' | 'down' | 'stable';
	}

	interface TimeseriesData {
		date: string;
		uk_revenue: number;
		bg_revenue: number;
		uk_users: number;
		bg_users: number;
		uk_transactions: number;
		bg_transactions: number;
	}

	interface Props {
		countryMetrics?: CountryMetrics[];
		platformSummary?: PlatformSummary;
		timeseriesData?: TimeseriesData[];
		loading?: boolean;
		timeRange?: '7d' | '30d' | '90d';
		onTimeRangeChange: (range: '7d' | '30d' | '90d') => Promise<void>;
		onRefresh: () => Promise<void>;
		onExport: (format: 'csv' | 'pdf') => Promise<void>;
	}

	let { 
		countryMetrics = [], 
		platformSummary,
		timeseriesData = [],
		loading = false,
		timeRange = '30d',
		onTimeRangeChange,
		onRefresh,
		onExport
	}: Props = $props();

	const formatCurrency = (amount: number, currency: string = 'GBP') => {
		const locale = currency === 'GBP' ? 'en-GB' : 'bg-BG';
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		}).format(amount);
	};

	const formatPercent = (value: number) => {
		return new Intl.NumberFormat('en-GB', {
			style: 'percent',
			minimumFractionDigits: 1,
			maximumFractionDigits: 1
		}).format(value / 100);
	};

	const formatNumber = (value: number) => {
		return new Intl.NumberFormat('en-GB', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(value);
	};

	const getGrowthVariant = (rate: number) => {
		if (rate > 10) return 'success';
		if (rate > 0) return 'primary';
		if (rate > -5) return 'warning';
		return 'danger';
	};

	const getGrowthIcon = (rate: number) => {
		if (rate > 5) return '📈';
		if (rate > 0) return '📊';
		if (rate > -5) return '📉';
		return '⚠️';
	};

	const handleTimeRangeChange = async (newRange: '7d' | '30d' | '90d') => {
		await onTimeRangeChange(newRange);
	};

	const handleExport = async (format: 'csv' | 'pdf') => {
		await onExport(format);
	};

	// Calculate country comparison
	const countryComparison = $derived(() => {
		if (countryMetrics.length !== 2) return null;
		
		const uk = countryMetrics.find(m => m.country_code === 'UK');
		const bg = countryMetrics.find(m => m.country_code === 'BG');
		
		if (!uk || !bg) return null;
		
		return {
			uk,
			bg,
			revenue_leader: uk.total_revenue_30d > bg.total_revenue_30d ? 'UK' : 'BG',
			user_leader: uk.total_users > bg.total_users ? 'UK' : 'BG',
			growth_leader: uk.user_growth_rate > bg.user_growth_rate ? 'UK' : 'BG'
		};
	});

	const timeRangeLabels = {
		'7d': 'Last 7 Days',
		'30d': 'Last 30 Days', 
		'90d': 'Last 90 Days'
	};
</script>

<div class="admin-analytics-panel">
	<!-- Header with Controls -->
	<div class="analytics-header">
		<div class="header-info">
			<h2>Analytics Dashboard</h2>
			<p class="header-subtitle">Real-time insights across UK and Bulgaria markets</p>
		</div>
		
		<div class="header-controls">
			<div class="time-range-selector">
				{#each Object.entries(timeRangeLabels) as [range, label]}
					<button 
						class="time-range-btn"
						class:active={timeRange === range}
						onclick={() => handleTimeRangeChange(range)}
						disabled={loading}
					>
						{label}
					</button>
				{/each}
			</div>
			
			<Button variant="secondary" onclick={onRefresh} {loading}>
				🔄 Refresh
			</Button>
			
			<div class="export-buttons">
				<Button variant="secondary" onclick={() => handleExport('csv')} disabled={loading}>
					📊 CSV
				</Button>
				<Button variant="secondary" onclick={() => handleExport('pdf')} disabled={loading}>
					📄 PDF
				</Button>
			</div>
		</div>
	</div>

	{#if loading}
		<div class="loading-state">
			<p>Loading analytics data...</p>
		</div>
	{:else}
		<!-- Platform Summary -->
		{#if platformSummary}
			<div class="platform-summary">
				<h3>Platform Overview</h3>
				<div class="summary-grid">
					<div class="summary-card primary">
						<div class="card-icon">💰</div>
						<div class="card-content">
							<div class="card-value">{formatCurrency(platformSummary.total_revenue_30d)}</div>
							<div class="card-label">Total Revenue ({timeRangeLabels[timeRange]})</div>
						</div>
					</div>
					
					<div class="summary-card success">
						<div class="card-icon">👥</div>
						<div class="card-content">
							<div class="card-value">{formatNumber(platformSummary.total_users)}</div>
							<div class="card-label">Total Users</div>
						</div>
					</div>
					
					<div class="summary-card info">
						<div class="card-icon">🔄</div>
						<div class="card-content">
							<div class="card-value">{formatNumber(platformSummary.total_transactions)}</div>
							<div class="card-label">Transactions ({timeRangeLabels[timeRange]})</div>
						</div>
					</div>
					
					<div class="summary-card warning">
						<div class="card-icon">💵</div>
						<div class="card-content">
							<div class="card-value">{formatCurrency(platformSummary.avg_revenue_per_user)}</div>
							<div class="card-label">Revenue per User</div>
						</div>
					</div>
					
					<div class="summary-card secondary">
						<div class="card-icon">🏦</div>
						<div class="card-content">
							<div class="card-value">{formatCurrency(platformSummary.platform_fee_earned)}</div>
							<div class="card-label">Platform Fees Earned</div>
						</div>
					</div>
					
					<div class="summary-card {platformSummary.growth_trajectory === 'up' ? 'success' : platformSummary.growth_trajectory === 'down' ? 'danger' : 'warning'}">
						<div class="card-icon">
							{platformSummary.growth_trajectory === 'up' ? '📈' : platformSummary.growth_trajectory === 'down' ? '📉' : '➡️'}
						</div>
						<div class="card-content">
							<div class="card-value">{platformSummary.growth_trajectory.toUpperCase()}</div>
							<div class="card-label">Growth Trend</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Country Metrics -->
		{#if countryMetrics.length > 0}
			<div class="country-metrics">
				<h3>Country Performance</h3>
				<div class="countries-grid">
					{#each countryMetrics as country (country.country_code)}
						<div class="country-card">
							<div class="country-header">
								<div class="country-info">
									<span class="country-flag">{country.flag}</span>
									<div class="country-details">
										<h4 class="country-name">{country.country_name}</h4>
										<span class="country-code">{country.country_code}</span>
									</div>
								</div>
								<Badge variant="primary">{country.currency}</Badge>
							</div>

							<div class="country-stats">
								<!-- Revenue Section -->
								<div class="stat-section">
									<h5 class="stat-section-title">💰 Revenue</h5>
									<div class="stat-grid">
										<div class="stat-item">
											<span class="stat-value">{formatCurrency(country.total_revenue_30d, country.currency)}</span>
											<span class="stat-label">30-day Revenue</span>
										</div>
										<div class="stat-item">
											<span class="stat-value">{formatCurrency(country.total_revenue_7d, country.currency)}</span>
											<span class="stat-label">7-day Revenue</span>
										</div>
										<div class="stat-item">
											<span class="stat-value">{formatCurrency(country.avg_order_value, country.currency)}</span>
											<span class="stat-label">Avg Order Value</span>
										</div>
										<div class="stat-item">
											<span class="stat-value growth" class:positive={country.revenue_growth_rate > 0} class:negative={country.revenue_growth_rate < 0}>
												{getGrowthIcon(country.revenue_growth_rate)} {formatPercent(country.revenue_growth_rate)}
											</span>
											<span class="stat-label">Growth Rate</span>
										</div>
									</div>
								</div>

								<!-- Users Section -->
								<div class="stat-section">
									<h5 class="stat-section-title">👥 Users</h5>
									<div class="stat-grid">
										<div class="stat-item">
											<span class="stat-value">{formatNumber(country.total_users)}</span>
											<span class="stat-label">Total Users</span>
										</div>
										<div class="stat-item">
											<span class="stat-value">{formatNumber(country.active_users_30d)}</span>
											<span class="stat-label">Active (30d)</span>
										</div>
										<div class="stat-item">
											<span class="stat-value">{formatNumber(country.new_users_30d)}</span>
											<span class="stat-label">New (30d)</span>
										</div>
										<div class="stat-item">
											<span class="stat-value">{formatPercent(country.retention_rate_30d)}</span>
											<span class="stat-label">Retention</span>
										</div>
									</div>
								</div>

								<!-- Products Section -->
								<div class="stat-section">
									<h5 class="stat-section-title">🛍️ Products</h5>
									<div class="stat-grid">
										<div class="stat-item">
											<span class="stat-value">{formatNumber(country.active_listings)}</span>
											<span class="stat-label">Active Listings</span>
										</div>
										<div class="stat-item">
											<span class="stat-value">{formatNumber(country.sold_listings_30d)}</span>
											<span class="stat-label">Sold (30d)</span>
										</div>
										<div class="stat-item">
											<span class="stat-value">{formatCurrency(country.avg_listing_price, country.currency)}</span>
											<span class="stat-label">Avg Listing Price</span>
										</div>
										<div class="stat-item">
											<span class="stat-value">{formatPercent(country.conversion_rate)}</span>
											<span class="stat-label">Conversion Rate</span>
										</div>
									</div>
								</div>

								<!-- Payouts Section -->
								<div class="stat-section">
									<h5 class="stat-section-title">💸 Payouts</h5>
									<div class="stat-grid">
										<div class="stat-item">
											<span class="stat-value pending">{formatNumber(country.pending_payouts)}</span>
											<span class="stat-label">Pending Requests</span>
										</div>
										<div class="stat-item">
											<span class="stat-value pending">{formatCurrency(country.pending_payout_amount, country.currency)}</span>
											<span class="stat-label">Pending Amount</span>
										</div>
										<div class="stat-item">
											<span class="stat-value">{formatNumber(country.completed_payouts_30d)}</span>
											<span class="stat-label">Completed (30d)</span>
										</div>
										<div class="stat-item">
											<span class="stat-value">{formatCurrency(country.completed_payout_amount_30d, country.currency)}</span>
											<span class="stat-label">Paid Out (30d)</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Country Comparison -->
		{#if countryComparison}
			<div class="country-comparison">
				<h3>Market Comparison</h3>
				<div class="comparison-grid">
					<div class="comparison-card">
						<div class="comparison-header">
							<span class="comparison-title">💰 Revenue Leader</span>
							<Badge variant="success">
								{countryComparison.revenue_leader === 'UK' ? '🇬🇧 UK' : '🇧🇬 BG'}
							</Badge>
						</div>
						<div class="comparison-details">
							<div class="comparison-item">
								<span class="comparison-country">🇬🇧 UK:</span>
								<span class="comparison-value">
									{formatCurrency(countryComparison.uk.total_revenue_30d, 'GBP')}
								</span>
							</div>
							<div class="comparison-item">
								<span class="comparison-country">🇧🇬 BG:</span>
								<span class="comparison-value">
									{formatCurrency(countryComparison.bg.total_revenue_30d, 'BGN')}
								</span>
							</div>
						</div>
					</div>

					<div class="comparison-card">
						<div class="comparison-header">
							<span class="comparison-title">👥 User Base Leader</span>
							<Badge variant="primary">
								{countryComparison.user_leader === 'UK' ? '🇬🇧 UK' : '🇧🇬 BG'}
							</Badge>
						</div>
						<div class="comparison-details">
							<div class="comparison-item">
								<span class="comparison-country">🇬🇧 UK:</span>
								<span class="comparison-value">{formatNumber(countryComparison.uk.total_users)} users</span>
							</div>
							<div class="comparison-item">
								<span class="comparison-country">🇧🇬 BG:</span>
								<span class="comparison-value">{formatNumber(countryComparison.bg.total_users)} users</span>
							</div>
						</div>
					</div>

					<div class="comparison-card">
						<div class="comparison-header">
							<span class="comparison-title">📈 Growth Leader</span>
							<Badge variant="warning">
								{countryComparison.growth_leader === 'UK' ? '🇬🇧 UK' : '🇧🇬 BG'}
							</Badge>
						</div>
						<div class="comparison-details">
							<div class="comparison-item">
								<span class="comparison-country">🇬🇧 UK:</span>
								<span class="comparison-value growth" class:positive={countryComparison.uk.user_growth_rate > 0}>
									{formatPercent(countryComparison.uk.user_growth_rate)}
								</span>
							</div>
							<div class="comparison-item">
								<span class="comparison-country">🇧🇬 BG:</span>
								<span class="comparison-value growth" class:positive={countryComparison.bg.user_growth_rate > 0}>
									{formatPercent(countryComparison.bg.user_growth_rate)}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.admin-analytics-panel {
		@apply space-y-6;
	}

	.analytics-header {
		@apply bg-white rounded-lg border p-6 flex items-start justify-between;
	}

	.header-info h2 {
		@apply text-2xl font-bold text-gray-900 mb-2;
	}

	.header-subtitle {
		@apply text-gray-600;
	}

	.header-controls {
		@apply flex items-center gap-4 flex-wrap;
	}

	.time-range-selector {
		@apply flex bg-gray-100 rounded-lg p-1;
	}

	.time-range-btn {
		@apply px-3 py-2 text-sm rounded-md transition-colors;
	}

	.time-range-btn.active {
		@apply bg-white text-blue-600 shadow-sm;
	}

	.export-buttons {
		@apply flex gap-2;
	}

	.loading-state {
		@apply text-center py-12 text-gray-500 bg-white rounded-lg border;
	}

	.platform-summary {
		@apply bg-white rounded-lg border p-6 space-y-4;
	}

	.platform-summary h3 {
		@apply text-xl font-bold text-gray-900;
	}

	.summary-grid {
		@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4;
	}

	.summary-card {
		@apply border rounded-lg p-4 flex items-center gap-3;
	}

	.summary-card.primary { @apply border-blue-200 bg-blue-50; }
	.summary-card.success { @apply border-green-200 bg-green-50; }
	.summary-card.info { @apply border-cyan-200 bg-cyan-50; }
	.summary-card.warning { @apply border-yellow-200 bg-yellow-50; }
	.summary-card.secondary { @apply border-gray-200 bg-gray-50; }
	.summary-card.danger { @apply border-red-200 bg-red-50; }

	.card-icon {
		@apply text-2xl;
	}

	.card-value {
		@apply text-lg font-bold text-gray-900;
	}

	.card-label {
		@apply text-sm text-gray-600;
	}

	.country-metrics {
		@apply bg-white rounded-lg border p-6 space-y-4;
	}

	.country-metrics h3 {
		@apply text-xl font-bold text-gray-900;
	}

	.countries-grid {
		@apply grid grid-cols-1 lg:grid-cols-2 gap-6;
	}

	.country-card {
		@apply border rounded-lg p-6 space-y-6;
	}

	.country-header {
		@apply flex items-center justify-between;
	}

	.country-info {
		@apply flex items-center gap-3;
	}

	.country-flag {
		@apply text-2xl;
	}

	.country-name {
		@apply text-lg font-semibold text-gray-900;
	}

	.country-code {
		@apply text-sm text-gray-500;
	}

	.country-stats {
		@apply space-y-4;
	}

	.stat-section {
		@apply space-y-3;
	}

	.stat-section-title {
		@apply text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2;
	}

	.stat-grid {
		@apply grid grid-cols-2 gap-3;
	}

	.stat-item {
		@apply text-center;
	}

	.stat-value {
		@apply block text-base font-semibold text-gray-900;
	}

	.stat-value.growth.positive {
		@apply text-green-600;
	}

	.stat-value.growth.negative {
		@apply text-red-600;
	}

	.stat-value.pending {
		@apply text-yellow-600;
	}

	.stat-label {
		@apply text-xs text-gray-500 mt-1 block;
	}

	.country-comparison {
		@apply bg-white rounded-lg border p-6 space-y-4;
	}

	.country-comparison h3 {
		@apply text-xl font-bold text-gray-900;
	}

	.comparison-grid {
		@apply grid grid-cols-1 md:grid-cols-3 gap-4;
	}

	.comparison-card {
		@apply border rounded-lg p-4 space-y-3;
	}

	.comparison-header {
		@apply flex items-center justify-between;
	}

	.comparison-title {
		@apply font-medium text-gray-900;
	}

	.comparison-details {
		@apply space-y-2;
	}

	.comparison-item {
		@apply flex items-center justify-between;
	}

	.comparison-country {
		@apply text-sm text-gray-600;
	}

	.comparison-value {
		@apply text-sm font-medium text-gray-900;
	}

	.comparison-value.growth.positive {
		@apply text-green-600;
	}
</style>