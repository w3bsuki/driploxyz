<script lang="ts">
  import { Button, Avatar, OrderStatus, OrderTimeline, OrderActions, ReviewModal } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  import type { PageData } from './$types';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  let activeTab = $state<'all' | 'to_review' | 'issues'>('all');
  let expandedOrders = $state<Set<string>>(new Set());
  let reviewModalOpen = $state(false);
  let selectedOrderForReview = $state(null);
  
  function toggleOrderExpansion(orderId: string) {
    const newSet = new Set(expandedOrders);
    if (newSet.has(orderId)) {
      newSet.delete(orderId);
    } else {
      newSet.add(orderId);
    }
    expandedOrders = newSet;
  }
  
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Filter orders based on active tab
  const filteredOrders = $derived(() => {
    if (activeTab === 'to_review') {
      return data.orders.filter(order => order.status === 'delivered');
    } else if (activeTab === 'issues') {
      return data.orders.filter(order => ['disputed', 'cancelled'].includes(order.status));
    }
    return data.orders;
  });

  const handleOrderStatusChange = (orderId: string, newStatus: string) => {
    // Find and update the order in our data
    const orderIndex = data.orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      data.orders[orderIndex].status = newStatus;
      data.orders[orderIndex].updated_at = new Date().toISOString();
      
      if (newStatus === 'delivered') {
        data.orders[orderIndex].delivered_at = new Date().toISOString();
      }
      
      // Force reactivity
      data.orders = [...data.orders];
    }
  };
  
  const openReviewModal = (order: any) => {
    selectedOrderForReview = order;
    reviewModalOpen = true;
  };
  
  const handleReviewSubmit = async (rating: number, title: string, comment: string) => {
    if (!selectedOrderForReview) return;
    
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: selectedOrderForReview.id,
        rating,
        title,
        comment
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit review');
    }
    
    // Remove from to_review list
    const orderIndex = data.orders.findIndex(o => o.id === selectedOrderForReview.id);
    if (orderIndex !== -1) {
      data.orders[orderIndex].reviewed = true;
      data.orders = [...data.orders];
    }
  };
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
    {#if filteredOrders.length > 0}
      <div class="space-y-6">
        {#each filteredOrders as order}
          <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
            <!-- Order Header -->
            <div class="p-4 sm:p-6 border-b">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                <div>
                  <div class="flex items-center space-x-3 mb-2">
                    <h3 class="font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</h3>
                    <OrderStatus status={order.status} />
                  </div>
                  <p class="text-sm text-gray-600">Ordered on {formatDate(order.created_at)}</p>
                  {#if order.tracking_number}
                    <p class="text-sm text-gray-600">Tracking: {order.tracking_number}</p>
                  {/if}
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold text-gray-900">€{Number(order.total_amount).toFixed(2)}</p>
                  <p class="text-sm text-gray-600">1 item</p>
                </div>
              </div>
            </div>

            <!-- Product Details -->
            <div class="p-4 sm:p-6">
              <div class="flex items-start space-x-4">
                <img 
                  src={order.product.first_image || '/placeholder.jpg'} 
                  alt={order.product.title}
                  class="w-20 h-20 object-cover rounded-lg bg-gray-200"
                />
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">{order.product.title}</h4>
                  <p class="text-sm text-gray-600">
                    Size: {order.product.size || 'N/A'} • 
                    Condition: {order.product.condition} • 
                    €{Number(order.product.price).toFixed(2)}
                  </p>
                  <div class="flex items-center space-x-2 mt-2">
                    <Avatar 
                      src={order.seller.avatar_url || ''} 
                      name={order.seller.username} 
                      size="xs" 
                    />
                    <a 
                      href="/profile/{order.seller.id}" 
                      class="text-sm text-gray-600 hover:text-gray-900"
                    >
                      {order.seller.username}
                    </a>
                  </div>
                </div>
                <div class="flex flex-col space-y-2">
                  <Button size="sm" variant="outline" onclick={() => window.location.href = `/product/${order.product.id}`}>View Product</Button>
                  {#if order.status === 'delivered' && !order.reviewed}
                    <Button size="sm" variant="outline" onclick={() => openReviewModal(order)}>Leave Review</Button>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Order Timeline & Actions -->
            <div class="border-t">
              <div class="p-4 sm:p-6">
                <!-- Order Timeline -->
                <div class="mb-6">
                  <h4 class="text-sm font-medium text-gray-900 mb-3">Order Progress</h4>
                  <OrderTimeline {order} userType="buyer" />
                </div>

                <!-- Order Actions -->
                <div class="flex items-center justify-between">
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

                  <!-- Order Actions for Buyers -->
                  {#if order.status === 'shipped'}
                    <div class="flex-1 max-w-xs ml-4">
                      <OrderActions 
                        {order} 
                        userType="buyer" 
                        userId={data.user?.id || ''} 
                        onStatusChange={(newStatus) => handleOrderStatusChange(order.id, newStatus)}
                      />
                    </div>
                  {:else if order.status === 'delivered'}
                    <div class="flex space-x-2">
                      <Button size="sm" variant="outline">View Receipt</Button>
                      <Button size="sm" variant="outline">Report Issue</Button>
                    </div>
                  {/if}
                </div>

                <!-- Expanded Details -->
                {#if expandedOrders.has(order.id)}
                  <div class="mt-6 pt-6 border-t space-y-4">
                    <div class="grid sm:grid-cols-2 gap-6">
                      <div>
                        <h4 class="text-sm font-medium text-gray-900 mb-2">Delivery Address</h4>
                        {#if order.shipping_address}
                          {@const address = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address}
                          <p class="text-sm text-gray-600">
                            {address.line1}<br>
                            {#if address.line2}{address.line2}<br>{/if}
                            {address.city}, {address.postal_code}<br>
                            {address.country}
                          </p>
                        {:else}
                          <p class="text-sm text-gray-600">No shipping address on file</p>
                        {/if}
                      </div>
                      <div>
                        <h4 class="text-sm font-medium text-gray-900 mb-2">Payment Summary</h4>
                        <div class="space-y-1 text-sm">
                          <div class="flex justify-between">
                            <span class="text-gray-600">Subtotal</span>
                            <span>€{Number(order.total_amount - (order.shipping_cost || 0)).toFixed(2)}</span>
                          </div>
                          {#if order.shipping_cost}
                            <div class="flex justify-between">
                              <span class="text-gray-600">Shipping</span>
                              <span>€{Number(order.shipping_cost).toFixed(2)}</span>
                            </div>
                          {/if}
                          <div class="flex justify-between font-medium pt-1 border-t">
                            <span>Total</span>
                            <span>€{Number(order.total_amount).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="bg-white rounded-lg shadow-sm border p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {activeTab === 'all' ? 'No purchases yet' : 
           activeTab === 'to_review' ? 'No orders to review' :
           'No issues found'}
        </h3>
        <p class="text-gray-600 mb-4">
          {activeTab === 'all' ? 'Start shopping to see your order history here' :
           activeTab === 'to_review' ? 'Items ready for review will appear here' :
           'Orders with problems will appear here'}
        </p>
        {#if activeTab === 'all'}
          <Button onclick={() => window.location.href = '/search'}>Browse Items</Button>
        {/if}
      </div>
    {/if}
  </div>
</div>

<!-- Review Modal -->
<ReviewModal
  isOpen={reviewModalOpen}
  onClose={() => {
    reviewModalOpen = false;
    selectedOrderForReview = null;
  }}
  onSubmit={handleReviewSubmit}
  orderDetails={selectedOrderForReview ? {
    seller: selectedOrderForReview.seller?.username,
    product: selectedOrderForReview.product?.title
  } : undefined}
  userType="buyer"
/>