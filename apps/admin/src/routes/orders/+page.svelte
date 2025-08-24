<script lang="ts">
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let searchQuery = $state('');
	let filterStatus = $state('all');

	let filteredOrders = $derived.by(() => {
		let orders = data.orders;
		
		// Filter by search query
		if (searchQuery) {
			orders = orders.filter(order => 
				order.buyer?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				order.seller?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				order.product?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				order.id?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}
		
		// Filter by status
		if (filterStatus !== 'all') {
			orders = orders.filter(order => order.status === filterStatus);
		}
		
		return orders;
	});

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
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">📦 Orders</h1>
			<p class="text-gray-600 mt-2">Monitor and manage all marketplace orders</p>
		</div>

		<!-- Stats Cards -->
		<div class="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Total Orders</p>
				<p class="text-2xl font-bold text-gray-900">{data.stats.total}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Pending</p>
				<p class="text-2xl font-bold text-yellow-600">{data.stats.pending}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Shipped</p>
				<p class="text-2xl font-bold text-purple-600">{data.stats.shipped}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Delivered</p>
				<p class="text-2xl font-bold text-green-600">{data.stats.delivered}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Disputed</p>
				<p class="text-2xl font-bold text-red-600">{data.stats.disputed}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-4">
				<p class="text-sm text-gray-600">Total GMV</p>
				<p class="text-2xl font-bold text-blue-600">£{data.stats.gmv}</p>
			</div>
		</div>

		<!-- Filters -->
		<div class="bg-white rounded-lg shadow p-4 mb-6">
			<div class="flex flex-col md:flex-row gap-4">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search by order ID, buyer, seller, or item..."
					class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<select
					bind:value={filterStatus}
					class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="all">All Orders</option>
					<option value="pending">Pending</option>
					<option value="confirmed">Confirmed</option>
					<option value="shipped">Shipped</option>
					<option value="delivered">Delivered</option>
					<option value="disputed">Disputed</option>
					<option value="canceled">Canceled</option>
				</select>
			</div>
		</div>

		<!-- Orders Table -->
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Order ID
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Item
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Buyer
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Seller
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Amount
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Status
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Date
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each filteredOrders as order}
							<tr class="{order.status === 'disputed' ? 'bg-red-50' : ''}">
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
									#{order.id?.slice(0, 8)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center">
										<div class="flex-shrink-0 h-10 w-10">
											{#if order.product?.images?.[0]}
												<img class="h-10 w-10 rounded-lg object-cover" src={order.product.images[0]} alt="">
											{:else}
												<div class="h-10 w-10 rounded-lg bg-gray-300"></div>
											{/if}
										</div>
										<div class="ml-4">
											<div class="text-sm font-medium text-gray-900">
												{order.product?.title || 'Unknown Item'}
											</div>
											<div class="text-sm text-gray-500">
												{order.product?.brand || ''} {order.product?.category || ''}
											</div>
										</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-gray-900">
										{order.buyer?.username || 'Unknown'}
									</div>
									<div class="text-sm text-gray-500">
										{order.buyer?.full_name || ''}
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-gray-900">
										{order.seller?.username || 'Unknown'}
									</div>
									<div class="text-sm text-gray-500">
										{order.seller?.full_name || ''}
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm font-medium text-gray-900">
										£{order.total_amount || 0}
									</div>
									{#if order.platform_fee}
										<div class="text-xs text-gray-500">
											Fee: £{order.platform_fee}
										</div>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getStatusColor(order.status)}">
										{order.status}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{new Date(order.created_at).toLocaleDateString()}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<button class="text-blue-600 hover:text-blue-900 mr-3">
										View
									</button>
									{#if order.status === 'disputed'}
										<button class="text-red-600 hover:text-red-900">
											Resolve
										</button>
									{:else if order.status === 'pending'}
										<button class="text-yellow-600 hover:text-yellow-900">
											Process
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