<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let searchQuery = $state('');
	let filterStatus = $state('all');
	let selectedOrder = $state(null);
	let showDisputeModal = $state(false);
	let showStatusModal = $state(false);
	let showRefundModal = $state(false);
	let disputeResolution = $state('');
	let adminNotes = $state('');
	let newStatus = $state('');
	let refundAmount = $state(0);
	let refundReason = $state('');

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
			case 'resolved': return 'bg-green-100 text-green-800';
			case 'canceled': return 'bg-gray-100 text-gray-800';
			case 'refunded': return 'bg-blue-100 text-blue-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	function openDisputeModal(order: any) {
		selectedOrder = order;
		refundAmount = order.total_amount || 0;
		showDisputeModal = true;
	}

	function openStatusModal(order: any) {
		selectedOrder = order;
		newStatus = order.status;
		showStatusModal = true;
	}

	function openRefundModal(order: any) {
		selectedOrder = order;
		refundAmount = order.total_amount || 0;
		showRefundModal = true;
	}

	function closeModals() {
		selectedOrder = null;
		showDisputeModal = false;
		showStatusModal = false;
		showRefundModal = false;
		disputeResolution = '';
		adminNotes = '';
		newStatus = '';
		refundReason = '';
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
									<div class="flex flex-col gap-1">
										<a href="/orders/{order.id}" class="text-blue-600 hover:text-blue-900">
											View Details
										</a>
										{#if order.status === 'disputed'}
											<button 
												onclick={() => openDisputeModal(order)}
												class="text-red-600 hover:text-red-900"
											>
												Resolve Dispute
											</button>
										{:else if order.status === 'pending' || order.status === 'confirmed'}
											<button 
												onclick={() => openStatusModal(order)}
												class="text-yellow-600 hover:text-yellow-900"
											>
												Update Status
											</button>
										{/if}
										{#if order.status === 'delivered' || order.status === 'shipped'}
											<button 
												onclick={() => openRefundModal(order)}
												class="text-orange-600 hover:text-orange-900"
											>
												Process Refund
											</button>
										{/if}
										{#if order.status === 'pending'}
											<form method="POST" action="?/cancelOrder" use:enhance>
												<input type="hidden" name="orderId" value={order.id} />
												<input type="hidden" name="reason" value="Admin cancellation" />
												<button type="submit" class="text-red-600 hover:text-red-900">
													Cancel Order
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

<!-- Dispute Resolution Modal -->
{#if showDisputeModal && selectedOrder}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
		<div class="relative top-10 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
			<div class="mt-3">
				<h3 class="text-lg font-medium text-gray-900 mb-4">
					🔧 Resolve Dispute - Order #{selectedOrder.id?.slice(0, 8)}
				</h3>
				<p class="text-sm text-gray-600 mb-4">
					Order Amount: <strong>£{selectedOrder.total_amount}</strong><br>
					Buyer: <strong>{selectedOrder.buyer?.username}</strong><br>
					Seller: <strong>{selectedOrder.seller?.username}</strong>
				</p>
				<form method="POST" action="?/resolveDispute" use:enhance>
					<input type="hidden" name="orderId" value={selectedOrder.id} />
					<div class="mb-4">
						<label class="block text-sm font-medium text-gray-700 mb-2">
							Resolution Decision
						</label>
						<div class="space-y-2">
							<label class="flex items-center">
								<input 
									type="radio" 
									name="resolution" 
									value="refund_buyer" 
									bind:group={disputeResolution}
									class="mr-2"
								/>
								Refund buyer - Process full refund (£{selectedOrder.total_amount})
							</label>
							<label class="flex items-center">
								<input 
									type="radio" 
									name="resolution" 
									value="favor_seller" 
									bind:group={disputeResolution}
									class="mr-2"
								/>
								Favor seller - No refund, close dispute
							</label>
						</div>
					</div>
					<div class="mb-4">
						<label for="adminNotes" class="block text-sm font-medium text-gray-700">
							Admin Notes
						</label>
						<textarea
							id="adminNotes"
							name="adminNotes"
							bind:value={adminNotes}
							rows="3"
							class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Explanation for the resolution decision..."
							required
						></textarea>
					</div>
					<div class="flex gap-3">
						<button
							type="submit"
							class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
							disabled={!disputeResolution}
						>
							Resolve Dispute
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

<!-- Update Status Modal -->
{#if showStatusModal && selectedOrder}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
		<div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
			<div class="mt-3">
				<h3 class="text-lg font-medium text-gray-900 mb-4">
					Update Order Status - #{selectedOrder.id?.slice(0, 8)}
				</h3>
				<form method="POST" action="?/updateOrderStatus" use:enhance>
					<input type="hidden" name="orderId" value={selectedOrder.id} />
					<div class="mb-4">
						<label for="status" class="block text-sm font-medium text-gray-700">
							New Status
						</label>
						<select
							id="status"
							name="status"
							bind:value={newStatus}
							class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						>
							<option value="pending">Pending</option>
							<option value="confirmed">Confirmed</option>
							<option value="shipped">Shipped</option>
							<option value="delivered">Delivered</option>
							<option value="canceled">Canceled</option>
						</select>
					</div>
					<div class="mb-4">
						<label for="notes" class="block text-sm font-medium text-gray-700">
							Admin Notes
						</label>
						<textarea
							id="notes"
							name="notes"
							bind:value={adminNotes}
							rows="3"
							class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Notes about this status change..."
						></textarea>
					</div>
					<div class="flex gap-3">
						<button
							type="submit"
							class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
						>
							Update Status
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

<!-- Process Refund Modal -->
{#if showRefundModal && selectedOrder}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
		<div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
			<div class="mt-3">
				<h3 class="text-lg font-medium text-gray-900 mb-4">
					💰 Process Refund - #{selectedOrder.id?.slice(0, 8)}
				</h3>
				<form method="POST" action="?/refundOrder" use:enhance>
					<input type="hidden" name="orderId" value={selectedOrder.id} />
					<div class="mb-4">
						<label for="refundAmount" class="block text-sm font-medium text-gray-700">
							Refund Amount (£)
						</label>
						<input
							id="refundAmount"
							name="refundAmount"
							type="number"
							step="0.01"
							max={selectedOrder.total_amount}
							bind:value={refundAmount}
							class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
						<p class="text-xs text-gray-500 mt-1">
							Maximum: £{selectedOrder.total_amount}
						</p>
					</div>
					<div class="mb-4">
						<label for="refundReason" class="block text-sm font-medium text-gray-700">
							Refund Reason
						</label>
						<textarea
							id="refundReason"
							name="reason"
							bind:value={refundReason}
							rows="3"
							class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Reason for processing this refund..."
							required
						></textarea>
					</div>
					<div class="flex gap-3">
						<button
							type="submit"
							class="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
						>
							Process Refund
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