<!--
@component AdminPayoutDashboard - Real-time payout management interface
View, approve, reject, and manage seller payouts across countries
-->
<script lang="ts">
	import Button from './Button.svelte';
	import Badge from './Badge.svelte';
	import AdminSecurityCheck from './AdminSecurityCheck.svelte';
	import PayoutRequestModal from './PayoutRequestModal.svelte';

	interface PayoutRequest {
		id: string;
		user_id: string;
		username: string;
		full_name: string;
		user_email: string;
		country_code: string;
		amount: number;
		currency: string;
		status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
		status_display: string;
		payout_method: any;
		requested_at: string;
		reviewed_at: string | null;
		processed_at: string | null;
		admin_notes: string | null;
		rejection_reason: string | null;
		reference_number: string | null;
		requested_amount: number;
		net_amount: number;
	}

	interface PayoutStats {
		total_pending: number;
		total_amount_pending: number;
		completed_today: number;
		completed_amount_today: number;
		by_country: Record<string, {
			pending: number;
			pending_amount: number;
			completed: number;
			completed_amount: number;
		}>;
	}

	interface Props {
		payoutRequests?: PayoutRequest[];
		stats?: PayoutStats;
		loading?: boolean;
		onRefresh: () => Promise<void>;
		onApproveRequest: (requestId: string, notes?: string) => Promise<void>;
		onRejectRequest: (requestId: string, reason: string, notes?: string) => Promise<void>;
		onProcessPayout: (requestId: string, referenceNumber: string) => Promise<void>;
	}

	let { 
		payoutRequests = [], 
		stats,
		loading = false,
		onRefresh,
		onApproveRequest,
		onRejectRequest,
		onProcessPayout
	}: Props = $props();

	// Filter and sort state
	let statusFilter = $state('all');
	let countryFilter = $state('all');
	let sortBy = $state('requested_at');
	let sortOrder = $state<'asc' | 'desc'>('desc');

	// Security check state
	let securityCheckOpen = $state(false);
	let pendingAction = $state<{
		action: string;
		requestId: string;
		data?: any;
	} | null>(null);

	// Manual processing modal state
	let processingModalOpen = $state(false);
	let processingRequest = $state<PayoutRequest | null>(null);
	let processingReference = $state('');
	let processingNotes = $state('');

	// Rejection modal state
	let rejectionModalOpen = $state(false);
	let rejectionRequest = $state<PayoutRequest | null>(null);
	let rejectionReason = $state('');
	let rejectionNotes = $state('');

	// Filtered and sorted requests
	const filteredRequests = $derived(
		payoutRequests
			.filter(req => {
				if (statusFilter !== 'all' && req.status !== statusFilter) return false;
				if (countryFilter !== 'all' && req.country_code !== countryFilter) return false;
				return true;
			})
			.sort((a, b) => {
				const aVal = a[sortBy as keyof PayoutRequest];
				const bVal = b[sortBy as keyof PayoutRequest];
				const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
				return sortOrder === 'asc' ? comparison : -comparison;
			})
	);

	const formatCurrency = (amount: number, currency: string) => {
		return new Intl.NumberFormat(currency === 'GBP' ? 'en-GB' : 'bg-BG', {
			style: 'currency',
			currency,
			minimumFractionDigits: 2
		}).format(amount);
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return 'Not set';
		return new Intl.DateTimeFormat('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(dateString));
	};

	const getStatusVariant = (status: string) => {
		switch (status) {
			case 'pending': return 'warning';
			case 'approved': return 'primary';
			case 'processing': return 'secondary';
			case 'completed': return 'success';
			case 'rejected': return 'danger';
			default: return 'secondary';
		}
	};

	const handleQuickApprove = (request: PayoutRequest) => {
		pendingAction = {
			action: 'approve_payout',
			requestId: request.id,
			data: { amount: request.amount, username: request.username }
		};
		securityCheckOpen = true;
	};

	const handleReject = (request: PayoutRequest) => {
		rejectionRequest = request;
		rejectionModalOpen = true;
	};

	const handleProcess = (request: PayoutRequest) => {
		processingRequest = request;
		processingModalOpen = true;
	};

	const handleSecurityConfirm = async (securityCode: string) => {
		if (!pendingAction) return;
		
		try {
			if (pendingAction.action === 'approve_payout') {
				await onApproveRequest(pendingAction.requestId);
			}
			
			pendingAction = null;
			securityCheckOpen = false;
			await onRefresh();
		} catch (error) {
			throw error;
		}
	};

	const submitRejection = async () => {
		if (!rejectionRequest || !rejectionReason.trim()) return;
		
		try {
			await onRejectRequest(rejectionRequest.id, rejectionReason, rejectionNotes);
			rejectionModalOpen = false;
			rejectionRequest = null;
			rejectionReason = '';
			rejectionNotes = '';
			await onRefresh();
		} catch (error) {
			console.error('Failed to reject payout:', error);
		}
	};

	const submitProcessing = async () => {
		if (!processingRequest || !processingReference.trim()) return;
		
		try {
			await onProcessPayout(processingRequest.id, processingReference);
			processingModalOpen = false;
			processingRequest = null;
			processingReference = '';
			processingNotes = '';
			await onRefresh();
		} catch (error) {
			console.error('Failed to process payout:', error);
		}
	};
</script>

<div class="admin-payout-dashboard">
	<!-- Stats Overview -->
	{#if stats}
		<div class="stats-grid">
			<div class="stat-card primary">
				<div class="stat-icon">⏳</div>
				<div class="stat-content">
					<div class="stat-value">{stats.total_pending}</div>
					<div class="stat-label">Pending Requests</div>
				</div>
			</div>
			<div class="stat-card warning">
				<div class="stat-icon">💰</div>
				<div class="stat-content">
					<div class="stat-value">
						{formatCurrency(stats.total_amount_pending, 'GBP')}
					</div>
					<div class="stat-label">Amount Pending</div>
				</div>
			</div>
			<div class="stat-card success">
				<div class="stat-icon">✅</div>
				<div class="stat-content">
					<div class="stat-value">{stats.completed_today}</div>
					<div class="stat-label">Completed Today</div>
				</div>
			</div>
			<div class="stat-card success">
				<div class="stat-icon">🎯</div>
				<div class="stat-content">
					<div class="stat-value">
						{formatCurrency(stats.completed_amount_today, 'GBP')}
					</div>
					<div class="stat-label">Paid Out Today</div>
				</div>
			</div>
		</div>

		<!-- Country Breakdown -->
		<div class="country-stats">
			<h3>Country Breakdown</h3>
			<div class="country-grid">
				{#each Object.entries(stats.by_country) as [country, data]}
					<div class="country-card">
						<div class="country-header">
							<span class="country-flag">
								{country === 'UK' ? '🇬🇧' : '🇧🇬'}
							</span>
							<span class="country-name">{country}</span>
						</div>
						<div class="country-stats-grid">
							<div class="mini-stat">
								<span class="value">{data.pending}</span>
								<span class="label">Pending</span>
							</div>
							<div class="mini-stat">
								<span class="value">
									{formatCurrency(data.pending_amount, country === 'UK' ? 'GBP' : 'BGN')}
								</span>
								<span class="label">Amount</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Controls -->
	<div class="controls-section">
		<div class="controls-header">
			<h2>Payout Requests</h2>
			<Button variant="primary" onclick={onRefresh} {loading}>
				🔄 Refresh
			</Button>
		</div>

		<div class="filters">
			<select bind:value={statusFilter} class="filter-select">
				<option value="all">All Status</option>
				<option value="pending">Pending</option>
				<option value="approved">Approved</option>
				<option value="processing">Processing</option>
				<option value="completed">Completed</option>
				<option value="rejected">Rejected</option>
			</select>
			<select bind:value={countryFilter} class="filter-select">
				<option value="all">All Countries</option>
				<option value="UK">🇬🇧 United Kingdom</option>
				<option value="BG">🇧🇬 Bulgaria</option>
			</select>
			<select bind:value={sortBy} class="filter-select">
				<option value="requested_at">Request Date</option>
				<option value="amount">Amount</option>
				<option value="username">Username</option>
			</select>
			<button 
				class="sort-toggle"
				onclick={() => sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'}
			>
				{sortOrder === 'asc' ? '↑' : '↓'}
			</button>
		</div>
	</div>

	<!-- Requests Table -->
	<div class="requests-table-container">
		{#if loading}
			<div class="loading-state">
				<p>Loading payout requests...</p>
			</div>
		{:else if filteredRequests.length === 0}
			<div class="empty-state">
				<p>No payout requests found</p>
			</div>
		{:else}
			<div class="requests-table">
				<div class="table-header">
					<div class="col-user">User</div>
					<div class="col-amount">Amount</div>
					<div class="col-method">Method</div>
					<div class="col-status">Status</div>
					<div class="col-dates">Dates</div>
					<div class="col-actions">Actions</div>
				</div>

				{#each filteredRequests as request (request.id)}
					<div class="table-row" class:urgent={request.status === 'pending'}>
						<div class="col-user">
							<div class="user-info">
								<div class="user-primary">
									<span class="username">@{request.username}</span>
									<span class="country-flag">
										{request.country_code === 'UK' ? '🇬🇧' : '🇧🇬'}
									</span>
								</div>
								<div class="user-secondary">
									<span class="full-name">{request.full_name}</span>
									<span class="email">{request.user_email}</span>
								</div>
							</div>
						</div>

						<div class="col-amount">
							<div class="amount-info">
								<div class="main-amount">
									{formatCurrency(request.amount, request.currency)}
								</div>
								{#if request.net_amount !== request.amount}
									<div class="net-amount">
										Net: {formatCurrency(request.net_amount, request.currency)}
									</div>
								{/if}
							</div>
						</div>

						<div class="col-method">
							<div class="method-info">
								{#if request.payout_method?.type === 'revolut'}
									<Badge variant="primary" size="sm">Revolut</Badge>
									<span class="method-details">
										{request.payout_method.details.phone || request.payout_method.details.email}
									</span>
								{:else if request.payout_method?.type === 'bank_transfer'}
									<Badge variant="secondary" size="sm">Bank Transfer</Badge>
									<span class="method-details">
										{request.payout_method.details.account_holder}
									</span>
								{:else}
									<Badge variant="secondary" size="sm">Unknown</Badge>
								{/if}
							</div>
						</div>

						<div class="col-status">
							<div class="status-info">
								<Badge variant={getStatusVariant(request.status)}>
									{request.status_display}
								</Badge>
								{#if request.reference_number}
									<span class="reference">Ref: {request.reference_number}</span>
								{/if}
							</div>
						</div>

						<div class="col-dates">
							<div class="dates-info">
								<div class="date-item">
									<span class="date-label">Requested:</span>
									<span class="date-value">{formatDate(request.requested_at)}</span>
								</div>
								{#if request.reviewed_at}
									<div class="date-item">
										<span class="date-label">Reviewed:</span>
										<span class="date-value">{formatDate(request.reviewed_at)}</span>
									</div>
								{/if}
								{#if request.processed_at}
									<div class="date-item">
										<span class="date-label">Processed:</span>
										<span class="date-value">{formatDate(request.processed_at)}</span>
									</div>
								{/if}
							</div>
						</div>

						<div class="col-actions">
							<div class="action-buttons">
								{#if request.status === 'pending'}
									<Button 
										variant="success" 
										size="sm"
										onclick={() => handleQuickApprove(request)}
									>
										✅ Approve
									</Button>
									<Button 
										variant="danger" 
										size="sm"
										onclick={() => handleReject(request)}
									>
										❌ Reject
									</Button>
								{:else if request.status === 'approved'}
									<Button 
										variant="primary" 
										size="sm"
										onclick={() => handleProcess(request)}
									>
										💳 Process
									</Button>
								{:else if request.status === 'processing'}
									<Button variant="secondary" size="sm" disabled>
										Processing...
									</Button>
								{:else}
									<Button variant="secondary" size="sm" disabled>
										{request.status_display}
									</Button>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- Security Check Modal -->
<AdminSecurityCheck
	isOpen={securityCheckOpen}
	operation={pendingAction?.action || 'unknown'}
	onClose={() => securityCheckOpen = false}
	onConfirm={handleSecurityConfirm}
/>

<!-- Rejection Modal -->
{#if rejectionModalOpen && rejectionRequest}
	<div class="modal-backdrop" onclick={() => rejectionModalOpen = false}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>Reject Payout Request</h3>
			</div>
			<div class="modal-body">
				<p class="request-summary">
					Rejecting payout for <strong>@{rejectionRequest.username}</strong> - 
					{formatCurrency(rejectionRequest.amount, rejectionRequest.currency)}
				</p>
				<div class="form-group">
					<label for="rejection-reason">Rejection Reason (Required)</label>
					<select id="rejection-reason" bind:value={rejectionReason} required>
						<option value="">Select a reason...</option>
						<option value="insufficient_funds">Insufficient available funds</option>
						<option value="invalid_payout_method">Invalid payout method details</option>
						<option value="account_verification_required">Account verification required</option>
						<option value="suspicious_activity">Suspicious activity detected</option>
						<option value="duplicate_request">Duplicate request</option>
						<option value="other">Other (specify in notes)</option>
					</select>
				</div>
				<div class="form-group">
					<label for="rejection-notes">Additional Notes (Optional)</label>
					<textarea 
						id="rejection-notes" 
						bind:value={rejectionNotes} 
						placeholder="Additional details for the user..."
						rows="3"
					></textarea>
				</div>
			</div>
			<div class="modal-actions">
				<Button variant="secondary" onclick={() => rejectionModalOpen = false}>
					Cancel
				</Button>
				<Button 
					variant="danger" 
					onclick={submitRejection}
					disabled={!rejectionReason}
				>
					Reject Payout
				</Button>
			</div>
		</div>
	</div>
{/if}

<!-- Processing Modal -->
{#if processingModalOpen && processingRequest}
	<div class="modal-backdrop" onclick={() => processingModalOpen = false}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>Process Payout</h3>
			</div>
			<div class="modal-body">
				<p class="request-summary">
					Processing payout for <strong>@{processingRequest.username}</strong> - 
					{formatCurrency(processingRequest.amount, processingRequest.currency)}
				</p>
				<div class="form-group">
					<label for="processing-reference">Transaction Reference (Required)</label>
					<input 
						id="processing-reference"
						type="text"
						bind:value={processingReference}
						placeholder="e.g., REV-20240101-001, TXN-ABC123"
						required
					/>
					<small class="help-text">
						Enter the reference number from your payment processor
					</small>
				</div>
				<div class="form-group">
					<label for="processing-notes">Processing Notes (Optional)</label>
					<textarea 
						id="processing-notes" 
						bind:value={processingNotes} 
						placeholder="Internal processing notes..."
						rows="2"
					></textarea>
				</div>
			</div>
			<div class="modal-actions">
				<Button variant="secondary" onclick={() => processingModalOpen = false}>
					Cancel
				</Button>
				<Button 
					variant="primary" 
					onclick={submitProcessing}
					disabled={!processingReference.trim()}
				>
					Mark as Processed
				</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	@reference theme();
	
	.admin-payout-dashboard {
		@apply flex flex-col gap-6;
	}

	.stats-grid {
		@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4;
	}

	.stat-card {
		@apply bg-white rounded-lg border p-6 flex items-center gap-4;
	}

	.stat-card.primary { @apply border-blue-200 bg-blue-50; }
	.stat-card.warning { @apply border-yellow-200 bg-yellow-50; }
	.stat-card.success { @apply border-green-200 bg-green-50; }

	.stat-icon {
		@apply text-3xl;
	}

	.stat-value {
		@apply text-2xl font-bold text-gray-900;
	}

	.stat-label {
		@apply text-sm text-gray-600;
	}

	.country-stats {
		@apply bg-white rounded-lg border p-6 flex flex-col gap-4;
	}

	.country-stats h3 {
		@apply text-lg font-semibold text-gray-900;
	}

	.country-grid {
		@apply grid grid-cols-1 md:grid-cols-2 gap-4;
	}

	.country-card {
		@apply border rounded-lg p-4 flex flex-col gap-3;
	}

	.country-header {
		@apply flex items-center gap-2;
	}

	.country-flag {
		@apply text-lg;
	}

	.country-name {
		@apply font-medium text-gray-900;
	}

	.country-stats-grid {
		@apply grid grid-cols-2 gap-3;
	}

	.mini-stat {
		@apply text-center;
	}

	.mini-stat .value {
		@apply block text-lg font-semibold text-gray-900;
	}

	.mini-stat .label {
		@apply text-xs text-gray-500;
	}

	.controls-section {
		@apply bg-white rounded-lg border p-6 flex flex-col gap-4;
	}

	.controls-header {
		@apply flex items-center justify-between;
	}

	.controls-header h2 {
		@apply text-2xl font-bold text-gray-900;
	}

	.filters {
		@apply flex gap-3 flex-wrap;
	}

	.filter-select {
		@apply px-3 py-2 border border-gray-300 rounded-md text-sm;
	}

	.sort-toggle {
		@apply px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm hover:bg-gray-200 transition-colors;
	}

	.requests-table-container {
		@apply bg-white rounded-lg border;
	}

	.loading-state,
	.empty-state {
		@apply text-center py-12 text-gray-500;
	}

	.requests-table {
		@apply divide-y divide-gray-200;
	}

	.table-header {
		@apply grid grid-cols-12 gap-4 p-4 bg-gray-50 font-medium text-sm text-gray-700;
	}

	.table-row {
		@apply grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors;
	}

	.table-row.urgent {
		@apply border-l-4 border-l-yellow-400 bg-yellow-50;
	}

	.col-user { @apply col-span-3; }
	.col-amount { @apply col-span-2; }
	.col-method { @apply col-span-2; }
	.col-status { @apply col-span-2; }
	.col-dates { @apply col-span-2; }
	.col-actions { @apply col-span-1; }

	.user-info {
		@apply space-y-1;
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
		@apply space-y-1;
	}

	.full-name, .email {
		@apply block text-sm text-gray-600;
	}

	.amount-info {
		@apply space-y-1;
	}

	.main-amount {
		@apply font-semibold text-gray-900;
	}

	.net-amount {
		@apply text-sm text-gray-600;
	}

	.method-info {
		@apply space-y-1;
	}

	.method-details {
		@apply block text-sm text-gray-600 truncate;
	}

	.status-info {
		@apply space-y-1;
	}

	.reference {
		@apply block text-xs text-gray-500;
	}

	.dates-info {
		@apply space-y-1;
	}

	.date-item {
		@apply text-sm;
	}

	.date-label {
		@apply text-gray-500;
	}

	.date-value {
		@apply block text-gray-900;
	}

	.action-buttons {
		@apply space-y-1;
	}

	.modal-backdrop {
		@apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
	}

	.modal-content {
		@apply bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-auto;
	}

	.modal-header {
		@apply px-6 py-4 border-b;
	}

	.modal-header h3 {
		@apply text-lg font-semibold text-gray-900;
	}

	.modal-body {
		@apply px-6 py-4 space-y-4;
	}

	.request-summary {
		@apply text-sm text-gray-700 bg-gray-50 rounded-lg p-3;
	}

	.form-group {
		@apply space-y-2;
	}

	.form-group label {
		@apply block text-sm font-medium text-gray-700;
	}

	.form-group select,
	.form-group input,
	.form-group textarea {
		@apply w-full px-3 py-2 border border-gray-300 rounded-md text-sm;
	}

	.help-text {
		@apply text-xs text-gray-500;
	}

	.modal-actions {
		@apply px-6 py-4 border-t flex justify-end gap-3;
	}
</style>