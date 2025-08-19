<script lang="ts">
  import { Button, Avatar } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  
  // Purchase data will come from Supabase
  const purchases: any[] = [];
  
  let activeTab = $state<'all' | 'to_review' | 'issues'>('all');
  let expandedOrders = $state<Set<string>>(new Set());
  
  function toggleOrderExpansion(orderId: string) {
    const newSet = new Set(expandedOrders);
    if (newSet.has(orderId)) {
      newSet.delete(orderId);
    } else {
      newSet.add(orderId);
    }
    expandedOrders = newSet;
  }
  
  function getStatusColor(status: string) {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function getStatusText(status: string) {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>Purchase History - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <Header />
  
  <!-- Page Header -->
  <div class="bg-white shadow-xs sticky top-14 sm:top-16 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">My Purchases</h1>
      </div>
      
      <!-- Tabs -->
      <div class="flex space-x-6 border-b -mb-px">
        <button
          onclick={() => activeTab = 'all'}
          class="py-2 px-1 border-b-2 text-sm font-medium transition-colors
            {activeTab === 'all' ? 'border-black text-gray-900' : 'border-transparent text-gray-500'}"
        >
          All Orders
        </button>
        <button
          onclick={() => activeTab = 'to_review'}
          class="py-2 px-1 border-b-2 text-sm font-medium transition-colors
            {activeTab === 'to_review' ? 'border-black text-gray-900' : 'border-transparent text-gray-500'}"
        >
          To Review
        </button>
        <button
          onclick={() => activeTab = 'issues'}
          class="py-2 px-1 border-b-2 text-sm font-medium transition-colors
            {activeTab === 'issues' ? 'border-black text-gray-900' : 'border-transparent text-gray-500'}"
        >
          Issues
        </button>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    {#if purchases.length > 0}
      <div class="space-y-4">
        {#each purchases as order}
          <div class="bg-white rounded-lg shadow-xs overflow-hidden">
            <!-- Order Header -->
            <div class="p-4 sm:p-6 border-b">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                <div>
                  <div class="flex items-center space-x-3 mb-2">
                    <h3 class="font-semibold text-gray-900">Order #{order.id}</h3>
                    <span class="inline-flex px-2 py-1 text-xs rounded-full {getStatusColor(order.status)}">
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600">Ordered on {formatDate(order.date)}</p>
                  {#if order.trackingNumber}
                    <p class="text-sm text-gray-600">Tracking: {order.trackingNumber}</p>
                  {/if}
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold text-gray-900">${order.total.toFixed(2)}</p>
                  <p class="text-sm text-gray-600">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            <!-- Order Items -->
            <div class="p-4 sm:p-6">
              {#each order.items as item, i}
                <div class="flex items-start space-x-4 {i > 0 ? 'mt-4 pt-4 border-t' : ''}">
                  <img 
                    src={item.image || ''} 
                    alt={item.title}
                    class="w-20 h-20 object-cover rounded-lg bg-gray-200"
                  />
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">{item.title}</h4>
                    <p class="text-sm text-gray-600">Size: {item.size} • ${item.price}</p>
                    <div class="flex items-center space-x-2 mt-2">
                      <Avatar src={item.sellerAvatar || ''} name={item.sellerName} size="xs" />
                      <a href="/profile/{item.sellerId}" class="text-sm text-gray-600 hover:text-gray-900">
                        {item.sellerName}
                      </a>
                    </div>
                  </div>
                  <div class="flex flex-col space-y-2">
                    <Button size="sm" variant="outline">Buy Again</Button>
                    {#if order.status === 'delivered' && !order.hasReview}
                      <Button size="sm" variant="outline">Leave Review</Button>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>

            <!-- Order Actions -->
            <div class="bg-gray-50 px-4 py-3 sm:px-6">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                <button
                  onclick={() => toggleOrderExpansion(order.id)}
                  class="text-sm text-gray-600 hover:text-gray-900 flex items-center"
                >
                  {expandedOrders.has(order.id) ? 'Hide' : 'Show'} Details
                  <svg 
                    class="w-4 h-4 ml-1 transition-transform {expandedOrders.has(order.id) ? 'rotate-180' : ''}" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div class="flex space-x-2">
                  {#if order.status === 'in_transit'}
                    <Button size="sm">Track Package</Button>
                  {:else if order.status === 'delivered'}
                    <Button size="sm" variant="outline">View Receipt</Button>
                    <Button size="sm" variant="outline">Report Issue</Button>
                  {/if}
                </div>
              </div>

              <!-- Expanded Details -->
              {#if expandedOrders.has(order.id)}
                <div class="mt-4 pt-4 border-t space-y-3">
                  <div class="grid sm:grid-cols-2 gap-4">
                    <div>
                      <h4 class="text-sm font-medium text-gray-900 mb-2">Delivery Address</h4>
                      <p class="text-sm text-gray-600">{order.shippingAddress}</p>
                    </div>
                    <div>
                      <h4 class="text-sm font-medium text-gray-900 mb-2">Payment Summary</h4>
                      <div class="space-y-1 text-sm">
                        <div class="flex justify-between">
                          <span class="text-gray-600">Subtotal</span>
                          <span>${(order.total - order.shipping).toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">Shipping</span>
                          <span>${order.shipping.toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between font-medium pt-1 border-t">
                          <span>Total</span>
                          <span>${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {#if order.status === 'in_transit' || order.status === 'delivered'}
                    <div>
                      <h4 class="text-sm font-medium text-gray-900 mb-2">Tracking Updates</h4>
                      <div class="bg-white rounded-lg p-3 space-y-2">
                        <div class="flex items-start space-x-3">
                          <div class="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                          <div class="flex-1">
                            <p class="text-sm font-medium">Order Placed</p>
                            <p class="text-xs text-gray-500">{formatDate(order.date)}</p>
                          </div>
                        </div>
                        {#if order.status === 'delivered'}
                          <div class="flex items-start space-x-3">
                            <div class="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                            <div class="flex-1">
                              <p class="text-sm font-medium">Delivered</p>
                              <p class="text-xs text-gray-500">{formatDate(order.deliveryDate)}</p>
                            </div>
                          </div>
                        {:else}
                          <div class="flex items-start space-x-3">
                            <div class="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                            <div class="flex-1">
                              <p class="text-sm font-medium">In Transit</p>
                              <p class="text-xs text-gray-500">Expected by {formatDate(order.deliveryDate)}</p>
                            </div>
                          </div>
                        {/if}
                      </div>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="bg-white rounded-lg shadow-xs p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No purchases yet</h3>
        <p class="text-gray-600 mb-4">Start shopping to see your order history here</p>
        <Button onclick={() => window.location.href = '/search'}>Browse Items</Button>
      </div>
    {/if}
  </div>
</div>