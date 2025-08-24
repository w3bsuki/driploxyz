<script lang="ts">
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let activeTab = $state('listings');

	function getStatusColor(status: string) {
		switch(status) {
			case 'pending': return 'bg-yellow-100 text-yellow-800';
			case 'confirmed': return 'bg-blue-100 text-blue-800';
			case 'shipped': return 'bg-purple-100 text-purple-800';
			case 'delivered': return 'bg-green-100 text-green-800';
			case 'disputed': return 'bg-red-100 text-red-800';
			case 'canceled': return 'bg-gray-100 text-gray-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center justify-between">
				<div>
					<a href="/users" class="text-blue-600 hover:text-blue-800 mb-2 inline-block">← Back to Users</a>
					<h1 class="text-3xl font-bold text-gray-900">User Profile: {data.user.username}</h1>
					<p class="text-gray-600 mt-2">{data.user.full_name || 'No name provided'}</p>
				</div>
				<div class="flex items-center gap-4">
					{#if data.user.avatar_url}
						<img class="h-20 w-20 rounded-full" src={data.user.avatar_url} alt="Avatar">
					{:else}
						<div class="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
							<span class="text-2xl font-bold text-gray-600">
								{data.user.username?.charAt(0)?.toUpperCase() || '?'}
							</span>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- User Info Cards -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Account Status</p>
				<div class="mt-2">
					{#if data.user.role === 'banned'}
						<span class="px-2 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
							Banned
						</span>
					{:else if data.user.is_verified}
						<span class="px-2 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
							✓ Verified
						</span>
					{:else}
						<span class="px-2 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
							⚠ Unverified
						</span>
					{/if}
					{#if data.user.role === 'admin'}
						<span class="px-2 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800 ml-2">
							Admin
						</span>
					{/if}
				</div>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Account Type</p>
				<p class="text-xl font-bold text-gray-900 capitalize">
					{data.user.account_type || 'Individual'}
				</p>
				{#if data.user.country}
					<p class="text-sm text-gray-500">{data.user.country}</p>
				{/if}
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Contact</p>
				<p class="text-sm text-gray-900">{data.user.email || 'No email'}</p>
				{#if data.user.phone}
					<p class="text-sm text-gray-500">{data.user.phone}</p>
				{/if}
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Member Since</p>
				<p class="text-xl font-bold text-gray-900">
					{new Date(data.user.created_at).toLocaleDateString()}
				</p>
			</div>
		</div>

		<!-- Stats Cards -->
		<div class="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Total Listings</p>
				<p class="text-2xl font-bold text-blue-600">{data.stats.totalListings}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Active</p>
				<p class="text-2xl font-bold text-green-600">{data.stats.activeListings}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Sold</p>
				<p class="text-2xl font-bold text-purple-600">{data.stats.soldListings}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Purchases</p>
				<p class="text-2xl font-bold text-orange-600">{data.stats.totalPurchases}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Total Earned</p>
				<p class="text-2xl font-bold text-green-600">£{data.stats.totalEarnings}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Available</p>
				<p class="text-2xl font-bold text-yellow-600">£{data.stats.availableForPayout}</p>
			</div>
		</div>

		<!-- Tab Navigation -->
		<div class="bg-white rounded-lg shadow mb-8">
			<div class="border-b border-gray-200">
				<nav class="flex space-x-8 px-6">
					<button 
						onclick={() => activeTab = 'listings'}
						class="py-4 px-1 border-b-2 font-medium text-sm {activeTab === 'listings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}"
					>
						Listings ({data.listings.length})
					</button>
					<button 
						onclick={() => activeTab = 'purchases'}
						class="py-4 px-1 border-b-2 font-medium text-sm {activeTab === 'purchases' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}"
					>
						Purchases ({data.buyerOrders.length})
					</button>
					<button 
						onclick={() => activeTab = 'sales'}
						class="py-4 px-1 border-b-2 font-medium text-sm {activeTab === 'sales' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}"
					>
						Sales ({data.sellerOrders.length})
					</button>
					<button 
						onclick={() => activeTab = 'payouts'}
						class="py-4 px-1 border-b-2 font-medium text-sm {activeTab === 'payouts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}"
					>
						Payouts ({data.payoutRequests.length})
					</button>
				</nav>
			</div>

			<div class="p-6">
				{#if activeTab === 'listings'}
					<div class="space-y-4">
						{#each data.listings as listing}
							<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
								<div class="flex items-center">
									{#if listing.images?.[0]}
										<img class="h-16 w-16 rounded-lg object-cover" src={listing.images[0]} alt="">
									{:else}
										<div class="h-16 w-16 rounded-lg bg-gray-300"></div>
									{/if}
									<div class="ml-4">
										<h4 class="font-medium text-gray-900">{listing.title}</h4>
										<p class="text-sm text-gray-500">{listing.brand || ''} • {listing.category?.name || ''}</p>
										<p class="text-lg font-bold text-green-600">£{listing.price}</p>
									</div>
								</div>
								<div class="text-right">
									<div class="flex flex-col gap-2">
										{#if listing.is_sold}
											<span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
												Sold
											</span>
										{:else if listing.is_active}
											<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
												Active
											</span>
										{:else}
											<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
												Inactive
											</span>
										{/if}
										<a href="/listings/{listing.id}" class="text-blue-600 hover:text-blue-800 text-sm">
											View Details
										</a>
									</div>
								</div>
							</div>
						{/each}
						{#if data.listings.length === 0}
							<p class="text-gray-500 text-center py-8">No listings found</p>
						{/if}
					</div>
				{:else if activeTab === 'purchases'}
					<div class="space-y-4">
						{#each data.buyerOrders as order}
							<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
								<div class="flex items-center">
									{#if order.product?.images?.[0]}
										<img class="h-16 w-16 rounded-lg object-cover" src={order.product.images[0]} alt="">
									{:else}
										<div class="h-16 w-16 rounded-lg bg-gray-300"></div>
									{/if}
									<div class="ml-4">
										<h4 class="font-medium text-gray-900">{order.product?.title || 'Unknown Item'}</h4>
										<p class="text-sm text-gray-500">From: {order.seller?.username || 'Unknown'}</p>
										<p class="text-lg font-bold text-blue-600">£{order.total_amount}</p>
									</div>
								</div>
								<div class="text-right">
									<span class="px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(order.status)}">
										{order.status}
									</span>
									<p class="text-sm text-gray-500 mt-1">
										{new Date(order.created_at).toLocaleDateString()}
									</p>
								</div>
							</div>
						{/each}
						{#if data.buyerOrders.length === 0}
							<p class="text-gray-500 text-center py-8">No purchases found</p>
						{/if}
					</div>
				{:else if activeTab === 'sales'}
					<div class="space-y-4">
						{#each data.sellerOrders as order}
							<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
								<div class="flex items-center">
									{#if order.product?.images?.[0]}
										<img class="h-16 w-16 rounded-lg object-cover" src={order.product.images[0]} alt="">
									{:else}
										<div class="h-16 w-16 rounded-lg bg-gray-300"></div>
									{/if}
									<div class="ml-4">
										<h4 class="font-medium text-gray-900">{order.product?.title || 'Unknown Item'}</h4>
										<p class="text-sm text-gray-500">To: {order.buyer?.username || 'Unknown'}</p>
										<p class="text-lg font-bold text-green-600">£{order.total_amount}</p>
										{#if order.platform_fee}
											<p class="text-xs text-gray-400">Fee: £{order.platform_fee}</p>
										{/if}
									</div>
								</div>
								<div class="text-right">
									<span class="px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(order.status)}">
										{order.status}
									</span>
									<p class="text-sm text-gray-500 mt-1">
										{new Date(order.created_at).toLocaleDateString()}
									</p>
								</div>
							</div>
						{/each}
						{#if data.sellerOrders.length === 0}
							<p class="text-gray-500 text-center py-8">No sales found</p>
						{/if}
					</div>
				{:else if activeTab === 'payouts'}
					<div class="space-y-4">
						{#each data.payoutRequests as payout}
							<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
								<div>
									<h4 class="font-medium text-gray-900">£{payout.amount}</h4>
									<p class="text-sm text-gray-500">
										{payout.stripe_account_id || 'No Stripe account'}
									</p>
									<p class="text-xs text-gray-400">
										{new Date(payout.created_at).toLocaleDateString()}
									</p>
								</div>
								<div class="text-right">
									{#if payout.status === 'completed'}
										<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
											Completed
										</span>
									{:else if payout.status === 'pending'}
										<span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
											Pending
										</span>
									{:else}
										<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
											{payout.status}
										</span>
									{/if}
								</div>
							</div>
						{/each}
						{#if data.payoutRequests.length === 0}
							<p class="text-gray-500 text-center py-8">No payout requests found</p>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>