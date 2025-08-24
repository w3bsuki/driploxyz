<script lang="ts">
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	function getEventIcon(eventType: string) {
		switch(eventType) {
			case 'login': return '🔓';
			case 'logout': return '🔒';
			case 'permission_change': return '🔑';
			case 'failed_login': return '⚠️';
			case 'suspicious_activity': return '🚨';
			default: return '📝';
		}
	}

	function getEventColor(eventType: string) {
		switch(eventType) {
			case 'login': return 'text-green-600';
			case 'logout': return 'text-gray-600';
			case 'permission_change': return 'text-yellow-600';
			case 'failed_login': return 'text-orange-600';
			case 'suspicious_activity': return 'text-red-600';
			default: return 'text-gray-600';
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-8">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">🔐 Security</h1>
			<p class="text-gray-600 mt-2">Manage platform security and access control</p>
		</div>

		<!-- Security Stats -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Admin Users</p>
				<p class="text-2xl font-bold text-purple-600">{data.stats.totalAdmins}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Banned Users</p>
				<p class="text-2xl font-bold text-red-600">{data.stats.bannedUsers}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Reported Content</p>
				<p class="text-2xl font-bold text-orange-600">{data.stats.reportedContent}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Suspicious (24h)</p>
				<p class="text-2xl font-bold text-yellow-600">{data.stats.suspiciousActivities}</p>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
			<!-- Admin Users -->
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">Admin Users</h3>
				<div class="space-y-3">
					{#each data.adminUsers as admin}
						<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
							<div class="flex items-center">
								{#if admin.avatar_url}
									<img class="h-10 w-10 rounded-full" src={admin.avatar_url} alt="">
								{:else}
									<div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
										<span class="text-gray-600 font-medium">
											{admin.username?.charAt(0)?.toUpperCase() || '?'}
										</span>
									</div>
								{/if}
								<div class="ml-3">
									<p class="text-sm font-medium text-gray-900">{admin.username}</p>
									<p class="text-xs text-gray-500">{admin.full_name || 'No name'}</p>
								</div>
							</div>
							<button class="text-red-600 hover:text-red-900 text-sm font-medium">
								Revoke Access
							</button>
						</div>
					{/each}
					<button class="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
						+ Add Admin User
					</button>
				</div>
			</div>

			<!-- Reported Content -->
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">Reported Listings</h3>
				{#if data.reportedListings.length > 0}
					<div class="space-y-3">
						{#each data.reportedListings.slice(0, 5) as listing}
							<div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
								<div class="flex items-center">
									{#if listing.images?.[0]}
										<img class="h-10 w-10 rounded-lg object-cover" src={listing.images[0]} alt="">
									{:else}
										<div class="h-10 w-10 rounded-lg bg-gray-300"></div>
									{/if}
									<div class="ml-3">
										<p class="text-sm font-medium text-gray-900">{listing.title}</p>
										<p class="text-xs text-gray-500">by {listing.seller?.username || 'Unknown'}</p>
									</div>
								</div>
								<div class="flex gap-2">
									<button class="text-green-600 hover:text-green-900 text-sm font-medium">
										Approve
									</button>
									<button class="text-red-600 hover:text-red-900 text-sm font-medium">
										Remove
									</button>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-gray-500">No reported content</p>
				{/if}
			</div>
		</div>

		<!-- Recent Security Events -->
		<div class="bg-white rounded-lg shadow p-6 mb-8">
			<h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Security Events</h3>
			{#if data.recentEvents.length > 0}
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead>
							<tr>
								<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
								<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
								<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
								<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							{#each data.recentEvents as event}
								<tr>
									<td class="px-4 py-2 whitespace-nowrap">
										<span class="{getEventColor(event.event_type)}">
											{getEventIcon(event.event_type)} {event.event_type}
										</span>
									</td>
									<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
										{event.user_id || 'System'}
									</td>
									<td class="px-4 py-2 text-sm text-gray-500">
										{event.details || '-'}
									</td>
									<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
										{new Date(event.created_at).toLocaleString()}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<p class="text-gray-500">No recent security events</p>
			{/if}
		</div>

		<!-- Banned Users -->
		{#if data.bannedUsers.length > 0}
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">Banned Users</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each data.bannedUsers as user}
						<div class="p-4 border border-red-200 rounded-lg bg-red-50">
							<div class="flex items-center justify-between">
								<div>
									<p class="font-medium text-gray-900">{user.username}</p>
									<p class="text-sm text-gray-500">{user.full_name || 'No name'}</p>
									<p class="text-xs text-red-600 mt-1">Banned on {new Date(user.updated_at).toLocaleDateString()}</p>
								</div>
								<button class="text-green-600 hover:text-green-900 text-sm font-medium">
									Unban
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>