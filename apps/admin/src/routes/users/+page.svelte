<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let searchQuery = $state('');
	let filterRole = $state('all');
	let filterGeo = $state('all');
	let selectedUser = $state(null);
	let showBanModal = $state(false);
	let banReason = $state('');

	let filteredUsers = $derived.by(() => {
		let users = data.users;
		
		// Filter by search query
		if (searchQuery) {
			users = users.filter(user => 
				user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				user.email?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}
		
		// Filter by role
		if (filterRole !== 'all') {
			if (filterRole === 'brand') {
				users = users.filter(user => user.account_type === 'brand');
			} else if (filterRole === 'admin') {
				users = users.filter(user => user.role === 'admin');
			} else if (filterRole === 'verified') {
				users = users.filter(user => user.is_verified === true);
			} else if (filterRole === 'banned') {
				users = users.filter(user => user.role === 'banned');
			}
		}

		// Filter by geography
		if (filterGeo !== 'all') {
			users = users.filter(user => user.country === filterGeo.toUpperCase());
		}
		
		return users;
	});

	function openBanModal(user: any) {
		selectedUser = user;
		showBanModal = true;
	}

	function closeBanModal() {
		selectedUser = null;
		showBanModal = false;
		banReason = '';
	}
</script>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-8">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">User Management</h1>
			<p class="text-gray-600 mt-2">Manage all users and their accounts</p>
		</div>

		<!-- Stats Cards -->
		<div class="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Total Users</p>
				<p class="text-2xl font-bold text-gray-900">{data.stats.total}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Verified</p>
				<p class="text-2xl font-bold text-green-600">{data.stats.verified}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Brands</p>
				<p class="text-2xl font-bold text-purple-600">{data.stats.brands}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Admins</p>
				<p class="text-2xl font-bold text-red-600">{data.stats.admins}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">UK Users</p>
				<p class="text-2xl font-bold text-blue-600">{data.stats.ukUsers}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">BG Users</p>
				<p class="text-2xl font-bold text-yellow-600">{data.stats.bgUsers}</p>
			</div>
		</div>

		<!-- Geo Store Buttons -->
		<div class="flex justify-center gap-4 mb-6">
			<button 
				onclick={() => filterGeo = 'all'}
				class="px-6 py-3 rounded-lg font-semibold transition-colors {filterGeo === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
			>
				🌍 All Stores
			</button>
			<button 
				onclick={() => filterGeo = 'uk'}
				class="px-6 py-3 rounded-lg font-semibold transition-colors {filterGeo === 'uk' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
			>
				🇬🇧 UK Store
			</button>
			<button 
				onclick={() => filterGeo = 'bg'}
				class="px-6 py-3 rounded-lg font-semibold transition-colors {filterGeo === 'bg' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
			>
				🇧🇬 BG Store
			</button>
		</div>

		<!-- Filters -->
		<div class="bg-white rounded-lg shadow p-4 mb-6">
			<div class="flex flex-col md:flex-row gap-4">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search by username, name or email..."
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
					<option value="banned">Banned Only</option>
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
									<div class="flex flex-col gap-1">
										{#if user.role === 'admin'}
											<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
												Admin
											</span>
										{:else if user.role === 'banned'}
											<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
												Banned
											</span>
										{:else if user.account_type === 'brand'}
											<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
												Brand
											</span>
										{:else}
											<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
												User
											</span>
										{/if}
										{#if user.country}
											<span class="px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-100 text-blue-800">
												{user.country}
											</span>
										{/if}
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									{#if user.is_verified}
										<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
											✓ Verified
										</span>
									{:else}
										<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
											⚠ Unverified
										</span>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									<div>Listings: {user._count_products?.[0]?.count || 0}</div>
									<div>Purchases: {user._count_orders_as_buyer?.[0]?.count || 0}</div>
									<div>Sales: {user._count_orders_as_seller?.[0]?.count || 0}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{new Date(user.created_at).toLocaleDateString()}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<div class="flex flex-col gap-2">
										<a href="/users/{user.id}" class="text-blue-600 hover:text-blue-900">
											View Profile
										</a>
										{#if user.role !== 'banned'}
											{#if user.is_verified}
												<form method="POST" action="?/unverifyUser" use:enhance>
													<input type="hidden" name="userId" value={user.id} />
													<button type="submit" class="text-orange-600 hover:text-orange-900">
														Unverify
													</button>
												</form>
											{:else}
												<form method="POST" action="?/verifyUser" use:enhance>
													<input type="hidden" name="userId" value={user.id} />
													<button type="submit" class="text-green-600 hover:text-green-900">
														Verify
													</button>
												</form>
											{/if}
											<button 
												onclick={() => openBanModal(user)}
												class="text-red-600 hover:text-red-900"
											>
												Ban User
											</button>
											{#if user.role !== 'admin'}
												<form method="POST" action="?/makeAdmin" use:enhance>
													<input type="hidden" name="userId" value={user.id} />
													<button type="submit" class="text-purple-600 hover:text-purple-900">
														Make Admin
													</button>
												</form>
											{:else}
												<form method="POST" action="?/removeAdmin" use:enhance>
													<input type="hidden" name="userId" value={user.id} />
													<button type="submit" class="text-gray-600 hover:text-gray-900">
														Remove Admin
													</button>
												</form>
											{/if}
										{:else}
											<form method="POST" action="?/unbanUser" use:enhance>
												<input type="hidden" name="userId" value={user.id} />
												<button type="submit" class="text-green-600 hover:text-green-900">
													Unban User
												</button>
											</form>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>

<!-- Ban User Modal -->
{#if showBanModal && selectedUser}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
		<div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
			<div class="mt-3">
				<h3 class="text-lg font-medium text-gray-900 mb-4">
					Ban User: {selectedUser.username}
				</h3>
				<form method="POST" action="?/banUser" use:enhance>
					<input type="hidden" name="userId" value={selectedUser.id} />
					<div class="mb-4">
						<label for="banReason" class="block text-sm font-medium text-gray-700">
							Ban Reason
						</label>
						<textarea
							id="banReason"
							name="reason"
							bind:value={banReason}
							rows="4"
							class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
							placeholder="Enter reason for banning this user..."
							required
						></textarea>
					</div>
					<div class="flex gap-3">
						<button
							type="submit"
							class="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
						>
							Ban User
						</button>
						<button
							type="button"
							onclick={() => closeBanModal()}
							class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}