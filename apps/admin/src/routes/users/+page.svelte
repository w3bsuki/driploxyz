<script lang="ts">
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let searchQuery = $state('');
	let filterRole = $state('all');

	let filteredUsers = $derived(() => {
		let users = data.users;
		
		// Filter by search query
		if (searchQuery) {
			users = users.filter(user => 
				user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}
		
		// Filter by role
		if (filterRole !== 'all') {
			if (filterRole === 'brand') {
				users = users.filter(user => user.account_type === 'brand');
			} else if (filterRole === 'admin') {
				users = users.filter(user => user.role === 'admin');
			} else if (filterRole === 'verified') {
				users = users.filter(user => user.verified === true);
			}
		}
		
		return users;
	});
</script>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-8">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">User Management</h1>
			<p class="text-gray-600 mt-2">Manage all users and their accounts</p>
		</div>

		<!-- Stats Cards -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Total Users</p>
				<p class="text-2xl font-bold text-gray-900">{data.stats.total}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Verified Users</p>
				<p class="text-2xl font-bold text-green-600">{data.stats.verified}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Brand Accounts</p>
				<p class="text-2xl font-bold text-purple-600">{data.stats.brands}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Admins</p>
				<p class="text-2xl font-bold text-red-600">{data.stats.admins}</p>
			</div>
		</div>

		<!-- Filters -->
		<div class="bg-white rounded-lg shadow p-4 mb-6">
			<div class="flex flex-col md:flex-row gap-4">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search by username or name..."
					class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<select
					bind:value={filterRole}
					class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="all">All Users</option>
					<option value="admin">Admins Only</option>
					<option value="brand">Brands Only</option>
					<option value="verified">Verified Only</option>
				</select>
			</div>
		</div>

		<!-- Users Table -->
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								User
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Role / Type
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Status
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Stats
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Joined
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each filteredUsers as user}
							<tr>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center">
										<div class="flex-shrink-0 h-10 w-10">
											{#if user.avatar_url}
												<img class="h-10 w-10 rounded-full" src={user.avatar_url} alt="">
											{:else}
												<div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
													<span class="text-gray-600 font-medium">
														{user.username?.charAt(0)?.toUpperCase() || '?'}
													</span>
												</div>
											{/if}
										</div>
										<div class="ml-4">
											<div class="text-sm font-medium text-gray-900">
												{user.username || 'No username'}
											</div>
											<div class="text-sm text-gray-500">
												{user.full_name || ''}
											</div>
										</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									{#if user.role === 'admin'}
										<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
											Admin
										</span>
									{:else if user.account_type === 'brand'}
										<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
											Brand
										</span>
									{:else}
										<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
											{user.role || 'User'}
										</span>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									{#if user.verified}
										<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
											Verified
										</span>
									{:else}
										<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
											Unverified
										</span>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									<div>Sales: {user.sales_count || 0}</div>
									<div>Rating: {user.rating || 'N/A'}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{new Date(user.created_at).toLocaleDateString()}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<button class="text-blue-600 hover:text-blue-900 mr-3">
										View
									</button>
									<button class="text-yellow-600 hover:text-yellow-900">
										Edit
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>