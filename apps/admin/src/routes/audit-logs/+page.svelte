<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let searchQuery = $state('');
	let filterEventType = $state('all');

	let filteredLogs = $derived(() => {
		let logs = data.logs;
		
		// Filter by search query
		if (searchQuery) {
			logs = logs.filter(log => 
				log.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				log.event_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				log.ip_address?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}
		
		// Filter by event type
		if (filterEventType !== 'all') {
			logs = logs.filter(log => log.event_type === filterEventType);
		}
		
		return logs;
	});

	function getEventIcon(eventType: string) {
		const icons: Record<string, string> = {
			'login': '🔓',
			'logout': '🔒',
			'create': '➕',
			'update': '✏️',
			'delete': '🗑️',
			'permission_change': '🔑',
			'failed_login': '⚠️',
			'suspicious_activity': '🚨',
			'payment': '💳',
			'user_ban': '🚫',
			'user_unban': '✅',
			'report': '🚩',
			'export': '📤',
			'import': '📥'
		};
		return icons[eventType] || '📝';
	}

	function getEventColor(eventType: string) {
		const colors: Record<string, string> = {
			'login': 'bg-green-100 text-green-800',
			'logout': 'bg-gray-100 text-gray-800',
			'create': 'bg-blue-100 text-blue-800',
			'update': 'bg-yellow-100 text-yellow-800',
			'delete': 'bg-red-100 text-red-800',
			'permission_change': 'bg-purple-100 text-purple-800',
			'failed_login': 'bg-orange-100 text-orange-800',
			'suspicious_activity': 'bg-red-100 text-red-800',
			'payment': 'bg-green-100 text-green-800',
			'user_ban': 'bg-red-100 text-red-800',
			'user_unban': 'bg-green-100 text-green-800',
			'report': 'bg-orange-100 text-orange-800'
		};
		return colors[eventType] || 'bg-gray-100 text-gray-800';
	}

	function goToPage(page: number) {
		goto(`/audit-logs?page=${page}`);
	}
</script>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-8">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">📝 Audit Logs</h1>
			<p class="text-gray-600 mt-2">Complete activity log of all platform actions</p>
		</div>

		<!-- Stats for last 24 hours -->
		<div class="bg-white rounded-lg shadow p-6 mb-8">
			<h3 class="text-lg font-semibold text-gray-900 mb-4">Activity (Last 24 Hours)</h3>
			<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{#each Object.entries(data.eventStats) as [eventType, count]}
					<div class="text-center">
						<span class="text-2xl">{getEventIcon(eventType)}</span>
						<p class="text-sm font-medium text-gray-900 mt-1">{eventType}</p>
						<p class="text-lg font-bold text-gray-600">{count}</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- Filters -->
		<div class="bg-white rounded-lg shadow p-4 mb-6">
			<div class="flex flex-col md:flex-row gap-4">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search by user, event, details, or IP..."
					class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<select
					bind:value={filterEventType}
					class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="all">All Events</option>
					{#each data.eventTypes as eventType}
						<option value={eventType}>{eventType}</option>
					{/each}
				</select>
				<button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
					Export Logs
				</button>
			</div>
		</div>

		<!-- Logs Table -->
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Time
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Event
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								User
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Details
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								IP Address
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								User Agent
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each filteredLogs as log}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{new Date(log.created_at).toLocaleString()}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getEventColor(log.event_type)}">
										{getEventIcon(log.event_type)} {log.event_type}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									{#if log.user}
										<div class="flex items-center">
											{#if log.user.avatar_url}
												<img class="h-8 w-8 rounded-full" src={log.user.avatar_url} alt="">
											{:else}
												<div class="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
													<span class="text-xs text-gray-600 font-medium">
														{log.user.username?.charAt(0)?.toUpperCase() || '?'}
													</span>
												</div>
											{/if}
											<div class="ml-3">
												<p class="text-sm font-medium text-gray-900">{log.user.username}</p>
												<p class="text-xs text-gray-500">{log.user.full_name || ''}</p>
											</div>
										</div>
									{:else}
										<span class="text-sm text-gray-500">System</span>
									{/if}
								</td>
								<td class="px-6 py-4 text-sm text-gray-900">
									{log.details || '-'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{log.ip_address || '-'}
								</td>
								<td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
									{log.user_agent || '-'}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			
			<!-- Pagination -->
			{#if data.pagination.totalPages > 1}
				<div class="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
					<div class="flex-1 flex justify-between sm:hidden">
						<button
							onclick={() => goToPage(data.pagination.currentPage - 1)}
							disabled={data.pagination.currentPage === 1}
							class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
						>
							Previous
						</button>
						<button
							onclick={() => goToPage(data.pagination.currentPage + 1)}
							disabled={data.pagination.currentPage === data.pagination.totalPages}
							class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
						>
							Next
						</button>
					</div>
					<div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
						<div>
							<p class="text-sm text-gray-700">
								Showing <span class="font-medium">{(data.pagination.currentPage - 1) * data.pagination.limit + 1}</span> to
								<span class="font-medium">{Math.min(data.pagination.currentPage * data.pagination.limit, data.pagination.totalLogs)}</span> of
								<span class="font-medium">{data.pagination.totalLogs}</span> results
							</p>
						</div>
						<div>
							<nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
								<button
									onclick={() => goToPage(data.pagination.currentPage - 1)}
									disabled={data.pagination.currentPage === 1}
									class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
								>
									Previous
								</button>
								{#each Array(Math.min(5, data.pagination.totalPages)) as _, i}
									{@const pageNum = data.pagination.currentPage - 2 + i}
									{#if pageNum > 0 && pageNum <= data.pagination.totalPages}
										<button
											onclick={() => goToPage(pageNum)}
											class="relative inline-flex items-center px-4 py-2 border text-sm font-medium {pageNum === data.pagination.currentPage ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}"
										>
											{pageNum}
										</button>
									{/if}
								{/each}
								<button
									onclick={() => goToPage(data.pagination.currentPage + 1)}
									disabled={data.pagination.currentPage === data.pagination.totalPages}
									class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
								>
									Next
								</button>
							</nav>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>