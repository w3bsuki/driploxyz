<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let searchQuery = $state('');
	let filterStatus = $state('all');
	let selectedListing = $state(null);
	let showRejectModal = $state(false);
	let showDeleteModal = $state(false);
	let rejectReason = $state('');
	let deleteReason = $state('');

	let filteredListings = $derived.by(() => {
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
			if (filterStatus === 'featured') {
				listings = listings.filter(listing => listing.is_featured === true);
			} else if (filterStatus === 'active') {
				listings = listings.filter(listing => listing.is_active === true && listing.is_sold === false);
			} else if (filterStatus === 'sold') {
				listings = listings.filter(listing => listing.is_sold === true);
			} else if (filterStatus === 'inactive') {
				listings = listings.filter(listing => listing.is_active === false);
			}
		}
		
		return listings;
	});

	function getStatusLabel(listing: any) {
		if (listing.is_sold) return 'Sold';
		if (!listing.is_active) return 'Inactive';
		if (listing.is_featured) return 'Featured';
		return 'Active';
	}
	
	function getStatusColor(listing: any) {
		if (listing.is_sold) return 'bg-gray-100 text-gray-800';
		if (!listing.is_active) return 'bg-red-100 text-red-800';
		if (listing.is_featured) return 'bg-purple-100 text-purple-800';
		return 'bg-green-100 text-green-800';
	}

	function openRejectModal(listing: any) {
		selectedListing = listing;
		showRejectModal = true;
	}

	function openDeleteModal(listing: any) {
		selectedListing = listing;
		showDeleteModal = true;
	}

	function closeModals() {
		selectedListing = null;
		showRejectModal = false;
		showDeleteModal = false;
		rejectReason = '';
		deleteReason = '';
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
					<option value="inactive">Inactive</option>
					<option value="featured">Featured</option>
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
							<tr class="{listing.is_featured ? 'bg-red-50' : ''}">
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
									<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getStatusColor(listing)}">
										{getStatusLabel(listing)}
									</span>
									{#if listing.is_featured}
										<span class="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
											Featured
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
									<div class="flex flex-col gap-1">
										<a href="/listings/{listing.id}" class="text-blue-600 hover:text-blue-900">
											View Details
										</a>
										{#if listing.is_sold}
											<span class="text-gray-400">Sold</span>
										{:else}
											{#if listing.is_active}
												<form method="POST" action="?/deactivateListing" use:enhance>
													<input type="hidden" name="listingId" value={listing.id} />
													<button type="submit" class="text-orange-600 hover:text-orange-900">
														Deactivate
													</button>
												</form>
											{:else}
												<form method="POST" action="?/activateListing" use:enhance>
													<input type="hidden" name="listingId" value={listing.id} />
													<button type="submit" class="text-green-600 hover:text-green-900">
														Activate
													</button>
												</form>
											{/if}
											{#if listing.is_featured}
												<form method="POST" action="?/unfeatureListing" use:enhance>
													<input type="hidden" name="listingId" value={listing.id} />
													<button type="submit" class="text-purple-600 hover:text-purple-900">
														Unfeature
													</button>
												</form>
											{:else}
												<form method="POST" action="?/featureListing" use:enhance>
													<input type="hidden" name="listingId" value={listing.id} />
													<button type="submit" class="text-purple-600 hover:text-purple-900">
														Feature
													</button>
												</form>
											{/if}
											<button 
												onclick={() => openRejectModal(listing)}
												class="text-red-600 hover:text-red-900"
											>
												Reject
											</button>
											<button 
												onclick={() => openDeleteModal(listing)}
												class="text-red-800 hover:text-red-900"
											>
												Delete
											</button>
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

<!-- Reject Listing Modal -->
{#if showRejectModal && selectedListing}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
		<div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
			<div class="mt-3">
				<h3 class="text-lg font-medium text-gray-900 mb-4">
					Reject Listing: {selectedListing.title}
				</h3>
				<form method="POST" action="?/rejectListing" use:enhance>
					<input type="hidden" name="listingId" value={selectedListing.id} />
					<div class="mb-4">
						<label for="rejectReason" class="block text-sm font-medium text-gray-700">
							Rejection Reason
						</label>
						<textarea
							id="rejectReason"
							name="reason"
							bind:value={rejectReason}
							rows="4"
							class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
							placeholder="Enter reason for rejecting this listing..."
							required
						></textarea>
					</div>
					<div class="flex gap-3">
						<button
							type="submit"
							class="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
						>
							Reject Listing
						</button>
						<button
							type="button"
							onclick={() => closeModals()}
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

<!-- Delete Listing Modal -->
{#if showDeleteModal && selectedListing}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
		<div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
			<div class="mt-3">
				<h3 class="text-lg font-medium text-red-900 mb-4">
					⚠️ Delete Listing: {selectedListing.title}
				</h3>
				<p class="text-sm text-red-600 mb-4">
					This action cannot be undone. The listing will be permanently removed.
				</p>
				<form method="POST" action="?/deleteListing" use:enhance>
					<input type="hidden" name="listingId" value={selectedListing.id} />
					<div class="mb-4">
						<label for="deleteReason" class="block text-sm font-medium text-gray-700">
							Deletion Reason
						</label>
						<textarea
							id="deleteReason"
							name="reason"
							bind:value={deleteReason}
							rows="4"
							class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
							placeholder="Enter reason for deleting this listing..."
							required
						></textarea>
					</div>
					<div class="flex gap-3">
						<button
							type="submit"
							class="flex-1 bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800"
						>
							Delete Permanently
						</button>
						<button
							type="button"
							onclick={() => closeModals()}
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