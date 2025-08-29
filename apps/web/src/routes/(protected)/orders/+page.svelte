<script lang="ts">
  import { Button, Avatar, OrderStatus, OrderTimeline, OrderActions, ReviewModal } from '@repo/ui';
  import type { PageData } from './$types';
  import * as i18n from '@repo/i18n';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  let activeTab = $state<'all' | 'purchases' | 'sales' | 'to_review' | 'issues'>('all');
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

  // Combine and filter orders based on active tab
  const filteredOrders = $derived(() => {
    const allOrders = [...(data.buyerOrders || []), ...(data.sellerOrders || [])];
    
    switch (activeTab) {
      case 'purchases':
        return data.buyerOrders || [];
      case 'sales':
        return data.sellerOrders || [];
      case 'to_review':
        return (data.buyerOrders || []).filter(order => order.status === 'delivered');
      case 'issues':
        return allOrders.filter(order => ['disputed', 'cancelled'].includes(order.status));
      default:
        return allOrders;
    }
  });

  const handleOrderStatusChange = (orderId: string, newStatus: string) => {
    // Update order status via API
    fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
  };

  const openReviewModal = (order: any) => {
    selectedOrderForReview = order;
    reviewModalOpen = true;
  };

  const submitReview = async (reviewData: any) => {
    if (!selectedOrderForReview) return;
    
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: selectedOrderForReview.id,
        ...reviewData
      })
    });
    
    reviewModalOpen = false;
    selectedOrderForReview = null;
  };
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
  <div class="mb-8">
    <nav class="flex items-center text-sm text-gray-500 mb-3">
      <a href="/dashboard" class="hover:text-gray-700 hover:underline">{i18n.breadcrumb_dashboard()}</a>
      <svg class="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-gray-900">{i18n.breadcrumb_orders()}</span>
    </nav>
    <h1 class="text-2xl font-bold mb-2">{i18n.orders_title()}</h1>
    <p class="text-gray-600">{i18n.orders_subtitle()}</p>
  </div>

  <!-- Tabs -->
  <div class="border-b border-gray-200 mb-6">
    <nav class="flex gap-6">
      <button
        onclick={() => activeTab = 'all'}
        class="py-2 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'all' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}"
      >
        {i18n.orders_allOrders()}
      </button>
      <button
        onclick={() => activeTab = 'purchases'}
        class="py-2 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'purchases' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}"
      >
        {i18n.orders_purchases()} {#if data.buyerOrders?.length}({data.buyerOrders.length}){/if}
      </button>
      <button
        onclick={() => activeTab = 'sales'}
        class="py-2 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'sales' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}"
      >
        {i18n.orders_sales()} {#if data.sellerOrders?.length}({data.sellerOrders.length}){/if}
      </button>
      <button
        onclick={() => activeTab = 'to_review'}
        class="py-2 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'to_review' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}"
      >
        {i18n.orders_toReview()}
      </button>
      <button
        onclick={() => activeTab = 'issues'}
        class="py-2 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'issues' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}"
      >
        {i18n.orders_issues()}
      </button>
    </nav>
  </div>

  <!-- Orders List -->
  <div class="space-y-4">
    {#if filteredOrders().length === 0}
      <div class="text-center py-12">
        <p class="text-gray-500 mb-4">{i18n.orders_noOrdersFound()}</p>
        <Button href="/search">{i18n.orders_startShopping()}</Button>
      </div>
    {:else}
      {#each filteredOrders() as order (order.id)}
        {@const isPurchase = order.buyer_id === data.user?.id}
        {@const isExpanded = expandedOrders.has(order.id)}
        
        <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <!-- Order Header -->
          <button
            onclick={() => toggleOrderExpansion(order.id)}
            class="w-full p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start gap-4">
              <!-- Product Image -->
              {#if order.product?.first_image || order.product?.images?.[0]}
                <img
                  src={order.product.first_image || order.product.images[0]}
                  alt={order.product.title}
                  class="w-20 h-20 object-cover rounded-lg"
                />
              {:else}
                <div class="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span class="text-gray-400">{i18n.orders_noImage()}</span>
                </div>
              {/if}

              <!-- Order Details -->
              <div class="flex-1 text-left">
                <h3 class="font-semibold text-lg mb-1">
                  {order.product?.title || i18n.orders_unknownProduct()}
                </h3>
                <div class="flex items-center gap-4 text-sm text-gray-600">
                  <span>{isPurchase ? i18n.orders_seller() : i18n.orders_buyer()}: {isPurchase ? order.seller?.username : order.buyer?.username}</span>
                  <span>•</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
              </div>

              <!-- Price and Status -->
              <div class="text-right">
                <p class="text-xl font-semibold mb-2">${order.total_amount}</p>
                <OrderStatus status={order.status} />
              </div>

              <!-- Expand Icon -->
              <svg
                class="w-5 h-5 text-gray-400 transition-transform {isExpanded ? 'rotate-180' : ''}"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          <!-- Expanded Content -->
          {#if isExpanded}
            <div class="border-t border-gray-200 p-4 space-y-4">
              <!-- Order Timeline -->
              <OrderTimeline
                status={order.status}
                createdAt={order.created_at}
                shippedAt={order.shipped_at}
                deliveredAt={order.delivered_at}
              />

              <!-- Shipping Info -->
              {#if order.tracking_number}
                <div class="bg-gray-50 p-3 rounded-lg">
                  <p class="text-sm font-medium mb-1">{i18n.orders_trackingNumber()}</p>
                  <p class="text-sm text-gray-600">{order.tracking_number}</p>
                </div>
              {/if}

              <!-- Order Actions -->
              <div class="flex gap-2 flex-wrap">
                {#if isPurchase}
                  {#if order.status === 'delivered'}
                    <Button onclick={() => openReviewModal(order)} variant="secondary">
                      {i18n.orders_leaveReview()}
                    </Button>
                  {/if}
                  {#if order.status === 'pending' || order.status === 'processing'}
                    <Button onclick={() => handleOrderStatusChange(order.id, 'cancelled')} variant="danger">
                      {i18n.orders_cancelOrder()}
                    </Button>
                  {/if}
                  <!-- Message Seller button for buyers -->
                  <Button 
                    href={`/messages?conversation=${order.seller_id}__${order.product_id}`} 
                    variant="secondary"
                  >
                    {i18n.orders_messageSeller()}
                  </Button>
                {:else}
                  <OrderActions
                    order={order}
                    onStatusChange={handleOrderStatusChange}
                  />
                  <!-- Message Buyer button for sellers -->
                  <Button 
                    href={`/messages?conversation=${order.buyer_id}__${order.product_id}`}
                    variant="secondary"
                  >
                    {i18n.orders_messageBuyer()}
                  </Button>
                {/if}
                
                <Button href={`/product/${order.product?.id}`} variant="secondary">
                  {i18n.orders_viewProduct()}
                </Button>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>

  <!-- Review Modal -->
  {#if reviewModalOpen && selectedOrderForReview}
    <ReviewModal
      isOpen={reviewModalOpen}
      onClose={() => reviewModalOpen = false}
      onSubmit={submitReview}
      productTitle={selectedOrderForReview.product?.title}
    />
  {/if}
</div>