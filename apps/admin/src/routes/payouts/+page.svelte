<!--
Payout Management Page - Core admin functionality
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let selectedPayout = $state<any>(null);
	let showApproveModal = $state(false);
	let showRejectModal = $state(false);
	let showCompleteModal = $state(false);
	let transactionReference = $state('');

	const formatCurrency = (amount: number, currency: string = 'GBP') => {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency: currency
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'approved':
				return 'bg-blue-100 text-blue-800';
			case 'processing':
				return 'bg-purple-100 text-purple-800';
			case 'completed':
				return 'bg-green-100 text-green-800';
			case 'rejected':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const openApproveModal = (payout: any) => {
		selectedPayout = payout;
		showApproveModal = true;
	};

	const openCompleteModal = (payout: any) => {
		selectedPayout = payout;
		showCompleteModal = true;
	};
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="bg-white shadow rounded-lg p-6">
		<h1 class="text-2xl font-bold text-gray-900">Payout Management</h1>
		<p class="text-gray-600 mt-2">Review and process seller payout requests</p>
	</div>

	<!-- Stats Overview -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
		<div class="bg-white rounded-lg shadow p-6">
			<div class="text-sm font-medium text-gray-500">Pending Payouts</div>
			<div class="mt-2 text-3xl font-bold text-yellow-600">{data.stats?.pending_count || 0}</div>
			<div class="mt-1 text-sm text-gray-600">
				{formatCurrency(data.stats?.pending_amount || 0)}
			</div>
		</div>
		<div class="bg-white rounded-lg shadow p-6">
			<div class="text-sm font-medium text-gray-500">Processing</div>
			<div class="mt-2 text-3xl font-bold text-purple-600">{data.stats?.processing_count || 0}</div>
		</div>
		<div class="bg-white rounded-lg shadow p-6">
			<div class="text-sm font-medium text-gray-500">Completed Today</div>
			<div class="mt-2 text-3xl font-bold text-green-600">{data.stats?.completed_today || 0}</div>
		</div>
		<div class="bg-white rounded-lg shadow p-6">
			<div class="text-sm font-medium text-gray-500">Total Balance</div>
			<div class="mt-2 text-3xl font-bold text-gray-900">
				{formatCurrency(data.stats?.total_balance || 0)}
			</div>
		</div>
	</div>

	<!-- Success/Error Messages -->
	{#if form?.success}
		<div class="bg-green-50 border border-green-200 rounded-lg p-4">
			<div class="flex">
				<span class="text-green-400">✓</span>
				<div class="ml-3">
					<p class="text-sm font-medium text-green-800">{form.message}</p>
				</div>
			</div>
		</div>
	{/if}

	{#if form?.error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4">
			<div class="flex">
				<span class="text-red-400">✗</span>
				<div class="ml-3">
					<p class="text-sm font-medium text-red-800">{form.error}</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Payouts Table -->
	<div class="bg-white shadow rounded-lg overflow-hidden">
		<div class="px-6 py-4 border-b">
			<h2 class="text-lg font-semibold text-gray-900">Payout Requests</h2>
		</div>
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							User
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Amount
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Method
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Status
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Requested
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Balance
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each data.payouts || [] as payout}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4 whitespace-nowrap">
								<div>
									<div class="text-sm font-medium text-gray-900">{payout.username}</div>
									<div class="text-sm text-gray-500">{payout.user_id}</div>
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm font-semibold text-gray-900">
									{formatCurrency(payout.amount, payout.currency)}
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-900">
									{payout.payout_method?.type || 'Unknown'}
								</div>
								{#if payout.payout_method?.details}
									<div class="text-xs text-gray-500">
										{payout.payout_method.details.email || 
										 payout.payout_method.details.phone ||
										 payout.payout_method.details.account_number}
									</div>
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getStatusBadge(payout.status)}">
									{payout.status}
								</span>
								{#if payout.risk_level === 'HIGH_AMOUNT'}
									<span class="ml-2 text-red-600 text-xs">⚠️ High</span>
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-900">
									{formatDate(payout.requested_at)}
								</div>
								{#if payout.days_pending > 3}
									<div class="text-xs text-red-600">
										{payout.days_pending} days pending
									</div>
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-900">
									Available: {formatCurrency(payout.available_balance || 0)}
								</div>
								<div class="text-xs text-gray-500">
									Pending: {formatCurrency(payout.pending_balance || 0)}
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
								{#if payout.status === 'pending'}
									<button
										on:click={() => openApproveModal(payout)}
										class="text-green-600 hover:text-green-900 mr-3"
									>
										Approve
									</button>
									<button
										on:click={() => {
											selectedPayout = payout;
											showRejectModal = true;
										}}
										class="text-red-600 hover:text-red-900"
									>
										Reject
									</button>
								{:else if payout.status === 'approved'}
									<button
										on:click={() => openCompleteModal(payout)}
										class="text-blue-600 hover:text-blue-900"
									>
										Mark Complete
									</button>
								{:else}
									<span class="text-gray-400">No actions</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Approve Modal -->
{#if showApproveModal && selectedPayout}
	<div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 max-w-md w-full">
			<h3 class="text-lg font-medium text-gray-900 mb-4">Approve Payout</h3>
			<p class="text-sm text-gray-600 mb-4">
				Approve payout of {formatCurrency(selectedPayout.amount, selectedPayout.currency)} to {selectedPayout.username}?
			</p>
			<form method="POST" action="?/approve" use:enhance>
				<input type="hidden" name="payout_id" value={selectedPayout.payout_id} />
				<div class="mb-4">
					<label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
						Admin Notes (optional)
					</label>
					<textarea
						id="notes"
						name="notes"
						rows="3"
						class="w-full px-3 py-2 border border-gray-300 rounded-md"
						placeholder="Any notes about this approval..."
					></textarea>
				</div>
				<div class="flex justify-end gap-3">
					<button
						type="button"
						on:click={() => {
							showApproveModal = false;
							selectedPayout = null;
						}}
						class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
					>
						Approve Payout
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Complete Modal -->
{#if showCompleteModal && selectedPayout}
	<div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 max-w-md w-full">
			<h3 class="text-lg font-medium text-gray-900 mb-4">Complete Payout</h3>
			<p class="text-sm text-gray-600 mb-4">
				Mark payout of {formatCurrency(selectedPayout.amount, selectedPayout.currency)} as completed?
			</p>
			<form method="POST" action="?/complete" use:enhance>
				<input type="hidden" name="payout_id" value={selectedPayout.payout_id} />
				<div class="mb-4">
					<label for="reference" class="block text-sm font-medium text-gray-700 mb-2">
						Transaction Reference
					</label>
					<input
						id="reference"
						name="reference"
						type="text"
						bind:value={transactionReference}
						class="w-full px-3 py-2 border border-gray-300 rounded-md"
						placeholder="REVOLUT-123456 or BANK-REF-789"
						required
					/>
				</div>
				<div class="flex justify-end gap-3">
					<button
						type="button"
						on:click={() => {
							showCompleteModal = false;
							selectedPayout = null;
							transactionReference = '';
						}}
						class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
					>
						Mark as Completed
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}