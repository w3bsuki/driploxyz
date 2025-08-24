<script lang="ts">
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let searchQuery = $state('');
	let filterStatus = $state('all');

	let filteredListings = $derived(() => {
		let listings = data.listings;
		
		// Filter by search query
		if (searchQuery) {
			listings = listings.filter(listing => 
				listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				listing.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				listing.seller?.username?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}
		
		// Filter by status
		if (filterStatus !== 'all') {
			if (filterStatus === 'reported') {
				listings = listings.filter(listing => listing.is_reported === true);
			} else {
				listings = listings.filter(listing => listing.status === filterStatus);
			}
		}
		
		return listings;
	});

	function getStatusColor(status: string) {
		switch(status) {
			case 'active': return 'bg-green-100 text-green-800';
			case 'sold': return 'bg-gray-100 text-gray-800';
			case 'reserved': return 'bg-yellow-100 text-yellow-800';
			case 'inactive': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-8">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">Listings Management</h1>
			<p class="text-gray-600 mt-2">Monitor and manage all marketplace listings</p>
		</div>

		<!-- Stats Cards -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Total Listings</p>
				<p class="text-2xl font-bold text-gray-900">{data.stats.total}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Active</p>
				<p class="text-2xl font-bold text-green-600">{data.stats.active}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Sold</p>
				<p class="text-2xl font-bold text-gray-600">{data.stats.sold}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Reported</p>
				<p class="text-2xl font-bold text-red-600">{data.stats.reported}</p>
			</div>
		</div>

		<!-- Filters -->
		<div class="bg-white rounded-lg shadow p-4 mb-6">
			<div class="flex flex-col md:flex-row gap-4">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search by title, brand, or seller..."
					class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<select
					bind:value={filterStatus}
					class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="all">All Listings</option>
					<option value="active">Active</option>
					<option value="sold">Sold</option>
					<option value="reserved">Reserved</option>
					<option value="inactive">Inactive</option>
					<option value="reported">Reported</option>
				</select>
			</div>
		</div>

		<!-- Listings Table -->
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Listing
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Seller
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Price
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Status
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Stats
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Created
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each filteredListings as listing}
							<tr class="{listing.is_reported ? 'bg-red-50' : ''}">
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center">
										<div class="flex-shrink-0 h-10 w-10">
											{#if listing.images?.[0]}
												<img class="h-10 w-10 rounded-lg object-cover" src={listing.images[0]} alt="">
											{:else}
												<div class="h-10 w-10 rounded-lg bg-gray-300"></div>
											{/if}
										</div>
										<div class="ml-4">
											<div class="text-sm font-medium text-gray-900">
												{listing.title}
											</div>
											<div class="text-sm text-gray-500">
												{listing.brand || 'No brand'} • {listing.category}
											</div>
										</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-gray-900">
										{listing.seller?.username || 'Unknown'}
									</div>
									{#if listing.seller?.verified}
										<span class="text-xs text-green-600">✓ Verified</span>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm font-medium text-gray-900">
										£{listing.price}
									</div>
									{#if listing.original_price && listing.original_price > listing.price}
										<div class="text-xs text-gray-500 line-through">
											£{listing.original_price}
										</div>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getStatusColor(listing.status)}">
										{listing.status}
									</span>
									{#if listing.is_reported}
										<span class="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
											Reported
										</span>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									<div>Views: {listing.view_count || 0}</div>
									<div>Likes: {listing.like_count || 0}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{new Date(listing.created_at).toLocaleDateString()}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<button class="text-blue-600 hover:text-blue-900 mr-3">
										View
									</button>
									{#if listing.is_reported}
										<button class="text-red-600 hover:text-red-900">
											Review
										</button>
									{:else if listing.status === 'active'}
										<button class="text-yellow-600 hover:text-yellow-900">
											Deactivate
										</button>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>