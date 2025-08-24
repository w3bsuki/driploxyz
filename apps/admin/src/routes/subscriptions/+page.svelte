<script lang="ts">
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let searchQuery = $state('');
	let filterStatus = $state('all');

	let filteredSubscriptions = $derived.by(() => {
		let subs = data.subscriptions;
		
		// Filter by search query
		if (searchQuery) {
			subs = subs.filter(sub => 
				sub.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				sub.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				sub.plan?.name?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}
		
		// Filter by status
		if (filterStatus !== 'all') {
			subs = subs.filter(sub => sub.status === filterStatus);
		}
		
		return subs;
	});

	function getStatusColor(status: string) {
		switch(status) {
			case 'active': return 'bg-green-100 text-green-800';
			case 'canceled': return 'bg-red-100 text-red-800';
			case 'past_due': return 'bg-yellow-100 text-yellow-800';
			case 'trialing': return 'bg-blue-100 text-blue-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-8">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">💳 Subscriptions</h1>
			<p class="text-gray-600 mt-2">Manage user subscriptions and billing</p>
		</div>

		<!-- Stats Cards -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Total Subscriptions</p>
				<p class="text-2xl font-bold text-gray-900">{data.stats.total}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Active</p>
				<p class="text-2xl font-bold text-green-600">{data.stats.active}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Canceled</p>
				<p class="text-2xl font-bold text-red-600">{data.stats.canceled}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">MRR</p>
				<p class="text-2xl font-bold text-purple-600">£{data.stats.mrr}</p>
			</div>
		</div>

		<!-- Filters -->
		<div class="bg-white rounded-lg shadow p-4 mb-6">
			<div class="flex flex-col md:flex-row gap-4">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search by user or plan..."
					class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<select
					bind:value={filterStatus}
					class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="all">All Statuses</option>
					<option value="active">Active</option>
					<option value="canceled">Canceled</option>
					<option value="past_due">Past Due</option>
					<option value="trialing">Trialing</option>
				</select>
			</div>
		</div>

		<!-- Subscriptions Table -->
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								User
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Plan
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Status
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Price
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Next Billing
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#if filteredSubscriptions.length === 0}
							<tr>
								<td colspan="6" class="px-6 py-8 text-center text-gray-500">
									No subscriptions found
								</td>
							</tr>
						{:else}
							{#each filteredSubscriptions as subscription}
								<tr>
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="flex items-center">
											<div class="flex-shrink-0 h-10 w-10">
												{#if subscription.user?.avatar_url}
													<img class="h-10 w-10 rounded-full" src={subscription.user.avatar_url} alt="">
												{:else}
													<div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
														<span class="text-gray-600 font-medium">
															{subscription.user?.username?.charAt(0)?.toUpperCase() || '?'}
														</span>
													</div>
												{/if}
											</div>
											<div class="ml-4">
												<div class="text-sm font-medium text-gray-900">
													{subscription.user?.username || 'Unknown'}
												</div>
												<div class="text-sm text-gray-500">
													{subscription.user?.full_name || ''}
												</div>
											</div>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="text-sm font-medium text-gray-900">
											{subscription.plan?.name || 'Standard'}
										</div>
										<div class="text-sm text-gray-500">
											Monthly
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getStatusColor(subscription.status)}">
											{subscription.status}
										</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										£{subscription.plan?.price_gbp || 0}/mo
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'N/A'}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
										<button class="text-blue-600 hover:text-blue-900 mr-3">
											View
										</button>
										{#if subscription.status === 'active'}
											<button class="text-red-600 hover:text-red-900">
												Cancel
											</button>
										{:else if subscription.status === 'canceled'}
											<button class="text-green-600 hover:text-green-900">
												Reactivate
											</button>
										{/if}
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>