<script lang="ts">
  import { Button, OrderStatus, Input, toasts, RatingModal } from '@repo/ui';
  import type { PageData } from './$types';
  import * as i18n from '@repo/i18n';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { subscribeToOrderUpdates, orderUpdates, clearOrderUpdates } from '$lib/stores/orderSubscription';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  let activeTab = $state<'to_ship' | 'shipped' | 'incoming' | 'completed'>('to_ship');
  let selectedOrder = $state<any>(null);
  let trackingNumber = $state('');
  let showTrackingModal = $state(false);
  let showRatingModal = $state(false);
  let ratingOrder = $state<any>(null);
  let loading = $state(false);
  
  // Filter orders based on tab and user role
  const filteredOrders = $derived(() => {
    const userId = data.user?.id;
    
    switch (activeTab) {
      case 'to_ship':
        // Items seller needs to ship
        return data.orders?.filter(o => 
          o.seller_id === userId && 
          ['pending_shipment', 'processing'].includes(o.status)
        ) || [];
        
      case 'shipped':
        // Items seller has shipped
        return data.orders?.filter(o => 
          o.seller_id === userId && 
          ['shipped', 'in_transit'].includes(o.status)
        ) || [];
        
      case 'incoming':
        // Orders buyer is waiting for
        return data.orders?.filter(o => 
          o.buyer_id === userId && 
          ['pending_shipment', 'processing', 'shipped', 'in_transit'].includes(o.status)
        ) || [];
        
      case 'completed':
        // Completed orders for both
        return data.orders?.filter(o => 
          (o.seller_id === userId || o.buyer_id === userId) && 
          ['delivered', 'completed'].includes(o.status)
        ) || [];
        
      default:
        return [];
    }
  });
  
  // Count items needing action
  const actionCounts = $derived(() => {
    const userId = data.user?.id;
    const orders = data.orders || [];
    
    return {
      toShip: orders.filter(o => 
        o.seller_id === userId && 
        ['pending_shipment', 'processing'].includes(o.status)
      ).length,
      incoming: orders.filter(o => 
        o.buyer_id === userId && 
        ['pending_shipment', 'processing', 'shipped', 'in_transit'].includes(o.status)
      ).length
    };
  });
  
  async function updateOrderStatus(orderId: string, newStatus: string, tracking?: string) {
    loading = true;
    
    try {
      const updateData: any = { status: newStatus };
      if (tracking) {
        updateData.tracking_number = tracking;
      }
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        toasts.success('Order status updated successfully');
        
        // Update local data
        if (data.orders) {
          const index = data.orders.findIndex(o => o.id === orderId);
          if (index !== -1) {
            data.orders[index].status = newStatus;
            if (tracking) {
              data.orders[index].tracking_number = tracking;
            }
          }
        }
        
        showTrackingModal = false;
        trackingNumber = '';
        selectedOrder = null;
      } else {
        toasts.error('Failed to update order status');
      }
    } catch (error) {
      toasts.error('An error occurred while updating the order');
    } finally {
      loading = false;
    }
  }
  
  function openTrackingModal(order: any) {
    selectedOrder = order;
    trackingNumber = order.tracking_number || '';
    showTrackingModal = true;
  }
  
  async function markAsShipped() {
    if (!selectedOrder || !trackingNumber.trim()) {
      toasts.error('Please enter a tracking number');
      return;
    }
    
    await updateOrderStatus(selectedOrder.id, 'shipped', trackingNumber);
  }
  
  async function confirmDelivery(order: any) {
    if (confirm('Confirm that you have received this order?')) {
      await updateOrderStatus(order.id, 'delivered');
      // Show rating modal after confirming delivery
      ratingOrder = order;
      showRatingModal = true;
    }
  }
  
  function openRatingModal(order: any) {
    ratingOrder = order;
    showRatingModal = true;
  }
  
  async function handleRatingSuccess() {
    toasts.success('Thank you for your review!');
    // Reload orders to update the buyer_rated status
    location.reload();
  }
  
  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  function getTimeLeft(createdAt: string) {
    const created = new Date(createdAt);
    const deadline = new Date(created.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days
    const now = new Date();
    const hoursLeft = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (hoursLeft < 0) return 'Overdue';
    if (hoursLeft < 24) return `${hoursLeft} hours left`;
    return `${Math.floor(hoursLeft / 24)} days left`;
  }
  
  // Set up real-time subscriptions
  let unsubscribe: (() => void) | null = null;
  
  onMount(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Subscribe to order updates
    const supabase = $page.data.supabase;
    if (supabase && data.user?.id) {
      unsubscribe = subscribeToOrderUpdates(supabase, data.user.id);
      
      // Listen for order updates and refresh data
      const unsubscribeStore = orderUpdates.subscribe(updates => {
        if (updates.length > 0) {
          // Refresh orders when updates come in
          location.reload();
        }
      });
      
      return () => {
        unsubscribeStore();
        if (unsubscribe) unsubscribe();
        clearOrderUpdates();
      };
    }
  });
</script>

<style>
  :global(.hide-scrollbar) {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  :global(.hide-scrollbar::-webkit-scrollbar) {
    display: none;
  }
</style>

<svelte:head>
  <title>Order Management - Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Header -->
    <div class="mb-6">
      <nav class="flex items-center text-sm text-gray-500 mb-3">
        <a href="/dashboard" class="hover:text-gray-700 hover:underline">Dashboard</a>
        <svg class="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-gray-900">Order Management</span>
      </nav>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Order Management</h1>
      <p class="text-gray-600 text-sm sm:text-base mt-1">Manage your shipments and track orders</p>
    </div>
    
    <!-- Stats Cards - Improved with better visual hierarchy -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <!-- Items to Ship - Primary action card -->
      <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 {actionCounts().toShip > 0 ? 'shadow-lg ring-2 ring-orange-300' : 'shadow-sm'}">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-orange-700 uppercase tracking-wide">{i18n.orders_itemsToShip()}</p>
            <p class="text-3xl font-bold text-orange-900 mt-1">{actionCounts().toShip}</p>
            {#if actionCounts().toShip > 0}
              <p class="text-xs text-orange-700 mt-1 font-medium animate-pulse">⚡ Action required</p>
            {:else}
              <p class="text-xs text-orange-600 mt-1">All caught up</p>
            {/if}
          </div>
          <div class="bg-white rounded-full p-3 shadow-sm">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>
      
      <!-- In Transit -->
      <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-gray-600 uppercase tracking-wide">In Transit</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{actionCounts().incoming}</p>
            <p class="text-xs text-gray-500 mt-1">On the way</p>
          </div>
          <div class="bg-blue-50 rounded-full p-3">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Delivered -->
      <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-gray-600 uppercase tracking-wide">Delivered</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">
              {data.orders?.filter(o => o.status === 'delivered').length || 0}
            </p>
            <p class="text-xs text-gray-500 mt-1">Completed</p>
          </div>
          <div class="bg-green-50 rounded-full p-3">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Total Orders -->
      <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-gray-600 uppercase tracking-wide">{i18n.orders_totalOrders()}</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{data.orders?.length || 0}</p>
            <p class="text-xs text-gray-500 mt-1">All time</p>
          </div>
          <div class="bg-gray-50 rounded-full p-3">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Tabs - Mobile Optimized -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
      <div class="border-b border-gray-100">
        <nav class="grid grid-cols-4 gap-0.5 p-1">
          <button
            onclick={() => activeTab = 'to_ship'}
            class="relative px-2 py-2.5 rounded-md font-medium text-xs sm:text-sm transition-all
              {activeTab === 'to_ship' 
                ? 'bg-gray-900 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
          >
            <span class="flex flex-col items-center justify-center gap-0.5">
              <svg class="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span class="block">{i18n.orders_ship()}</span>
              {#if actionCounts().toShip > 0}
                <span class="absolute -top-1 -right-1 {activeTab === 'to_ship' ? 'bg-white text-gray-900' : 'bg-orange-500 text-white'} text-[10px] rounded-full px-1.5 py-0.5 font-bold min-w-[18px] text-center">
                  {actionCounts().toShip}
                </span>
              {/if}
            </span>
          </button>
          
          <button
            onclick={() => activeTab = 'shipped'}
            class="px-2 py-2.5 rounded-md font-medium text-xs sm:text-sm transition-all
              {activeTab === 'shipped' 
                ? 'bg-gray-900 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
          >
            <span class="flex flex-col items-center justify-center gap-0.5">
              <svg class="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span class="block">{i18n.orders_shipped()}</span>
            </span>
          </button>
          
          <button
            onclick={() => activeTab = 'incoming'}
            class="relative px-2 py-2.5 rounded-md font-medium text-xs sm:text-sm transition-all
              {activeTab === 'incoming' 
                ? 'bg-gray-900 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
          >
            <span class="flex flex-col items-center justify-center gap-0.5">
              <svg class="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span class="block">{i18n.orders_myOrders()}</span>
              {#if actionCounts().incoming > 0}
                <span class="absolute -top-1 -right-1 {activeTab === 'incoming' ? 'bg-white text-gray-900' : 'bg-blue-500 text-white'} text-[10px] rounded-full px-1.5 py-0.5 font-bold min-w-[18px] text-center">
                  {actionCounts().incoming}
                </span>
              {/if}
            </span>
          </button>
          
          <button
            onclick={() => activeTab = 'completed'}
            class="px-2 py-2.5 rounded-md font-medium text-xs sm:text-sm transition-all
              {activeTab === 'completed' 
                ? 'bg-gray-900 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
          >
            <span class="flex flex-col items-center justify-center gap-0.5">
              <svg class="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="block">{i18n.orders_completed()}</span>
            </span>
          </button>
        </nav>
      </div>
      
      <div class="p-3 sm:p-6">
        {#if filteredOrders().length === 0}
          <div class="text-center py-12">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {#if activeTab === 'to_ship'}
                No items to ship
              {:else if activeTab === 'shipped'}
                No shipped items
              {:else if activeTab === 'incoming'}
                No incoming orders
              {:else}
                No completed orders
              {/if}
            </h3>
            <p class="text-gray-500">
              {#if activeTab === 'to_ship'}
                All caught up! Check back when you make a sale.
              {:else if activeTab === 'incoming'}
                Start shopping to see your orders here.
              {:else}
                {i18n.orders_noOrdersYet()}
              {/if}
            </p>
          </div>
        {:else}
          <div class="space-y-4">
            {#each filteredOrders() as order}
              {@const isSeller = order.seller_id === data.user?.id}
              
              <div class="border border-gray-200 rounded-xl hover:shadow-md transition-all p-5 bg-white">
                <div class="flex items-start gap-4">
                  <!-- Product/Bundle Image -->
                  {#if order.is_bundle && order.items_count > 1}
                    <!-- Bundle display -->
                    <div class="relative w-24 h-24">
                      <div class="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                        <span class="text-3xl">📦</span>
                      </div>
                      <span class="absolute -top-2 -right-2 bg-primary-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-sm">
                        {order.items_count}
                      </span>
                    </div>
                  {:else if order.product?.first_image || order.product?.images?.[0]}
                    <img
                      src={order.product.first_image || order.product.images[0]}
                      alt={order.product.title}
                      class="w-24 h-24 object-cover rounded-xl shadow-sm"
                    />
                  {:else}
                    <div class="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center">
                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  {/if}
                  
                  <!-- Order Details -->
                  <div class="flex-1">
                    <div class="flex justify-between items-start">
                      <div>
                        <h3 class="font-semibold text-lg text-gray-900">
                          {#if order.is_bundle && order.items_count > 1}
                            Bundle Order ({order.items_count} items)
                          {:else}
                            {order.product?.title || 'Unknown Product'}
                          {/if}
                        </h3>
                        <div class="flex items-center gap-3 mt-1">
                          <span class="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                            {order.id.slice(-8).toUpperCase()}
                          </span>
                          <span class="text-sm text-gray-600">
                            {isSeller ? 'To' : 'From'}: 
                            <a href="/user/{isSeller ? order.buyer?.username : order.seller?.username}" class="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                              @{isSeller ? order.buyer?.username : order.seller?.username}
                            </a>
                          </span>
                        </div>
                        {#if order.tracking_number}
                          <div class="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            {order.tracking_number}
                          </div>
                        {/if}
                      </div>
                      
                      <div class="text-right">
                        <p class="text-2xl font-bold text-gray-900">${order.total_amount}</p>
                        {#if order.is_bundle && order.items_count > 1}
                          <p class="text-xs text-green-600 font-medium">Saved ${((order.items_count - 1) * 5).toFixed(2)} on shipping</p>
                        {/if}
                        <div class="mt-1">
                          <OrderStatus status={order.status} />
                        </div>
                        {#if activeTab === 'to_ship'}
                          {@const timeLeft = getTimeLeft(order.created_at)}
                          <div class="mt-2 inline-flex items-center gap-1 text-xs font-medium {timeLeft === 'Overdue' ? 'text-red-600 bg-red-50' : 'text-orange-600 bg-orange-50'} px-2 py-1 rounded-md">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {timeLeft}
                          </div>
                        {/if}
                      </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex gap-2 mt-4">
                      {#if activeTab === 'to_ship' && isSeller}
                        <Button
                          onclick={() => openTrackingModal(order)}
                          size="sm"
                          variant="primary"
                        >
                          {i18n.orders_markAsShipped()}
                        </Button>
                        <Button
                          href="/messages/{order.buyer?.username}"
                          size="sm"
                          variant="outline"
                        >
                          Message Buyer
                        </Button>
                      {:else if activeTab === 'incoming' && !isSeller && order.status === 'shipped'}
                        <Button
                          onclick={() => confirmDelivery(order)}
                          size="sm"
                          variant="primary"
                        >
                          Confirm Receipt
                        </Button>
                        <Button
                          href="/messages/{order.seller?.username}"
                          size="sm"
                          variant="outline"
                        >
                          Message Seller
                        </Button>
                      {:else if activeTab === 'completed' && !isSeller && order.status === 'delivered' && !order.buyer_rated}
                        <Button
                          onclick={() => openRatingModal(order)}
                          size="sm"
                          variant="primary"
                        >
                          Leave Review
                        </Button>
                      {/if}
                      
                      <Button
                        href="/product/{order.product?.id}"
                        size="sm"
                        variant="outline"
                      >
                        View Product
                      </Button>
                    </div>
                    
                    <!-- Shipping Address (for sellers) -->
                    {#if activeTab === 'to_ship' && isSeller && order.shipping_address}
                      <div class="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <div class="flex items-center gap-2 mb-2">
                          <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p class="text-sm font-semibold text-gray-700">{i18n.orders_shipTo()}:</p>
                        </div>
                        <p class="text-sm text-gray-600 leading-relaxed">
                          <span class="font-medium">{order.shipping_address.name}</span><br/>
                          {order.shipping_address.street}<br/>
                          {order.shipping_address.city}, {order.shipping_address.postal_code}<br/>
                          {order.shipping_address.country}
                        </p>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<!-- Tracking Number Modal -->
{#if showTrackingModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Add Tracking Information</h3>
      
      <div class="space-y-4">
        <div>
          <label for="tracking" class="block text-sm font-medium text-gray-700 mb-1">
            Tracking Number
          </label>
          <Input
            id="tracking"
            bind:value={trackingNumber}
            placeholder="Enter tracking number"
            required
          />
          <p class="text-xs text-gray-500 mt-1">
            Enter the tracking number from your shipping provider
          </p>
        </div>
        
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p class="text-sm text-yellow-800">
            <strong>Important:</strong> Ship within 3 business days to maintain your seller rating.
          </p>
        </div>
      </div>
      
      <div class="flex space-x-3 mt-6">
        <Button
          onclick={() => showTrackingModal = false}
          variant="outline"
          class="flex-1"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onclick={markAsShipped}
          class="flex-1"
          disabled={loading || !trackingNumber.trim()}
        >
          {loading ? i18n.orders_updating() : i18n.orders_markAsShipped()}
        </Button>
      </div>
    </div>
  </div>
{/if}

<!-- Rating Modal -->
{#if showRatingModal && ratingOrder}
  <RatingModal
    bind:open={showRatingModal}
    orderId={ratingOrder.id}
    sellerName={ratingOrder.seller?.username || 'Seller'}
    productTitle={ratingOrder.product?.title || 'Product'}
    on:success={handleRatingSuccess}
  />
{/if}