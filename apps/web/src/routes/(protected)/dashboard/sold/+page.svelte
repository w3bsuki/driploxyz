<script lang="ts">
  import { Button, SoldNotificationPanel, OrderStatus, OrderTimeline, OrderActions } from '@repo/ui';
  import type { PageData } from './$types';
  import { onMount } from 'svelte';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  // Orders state
  let orders = $state([]);
  let recentOrders = $state([]);
  let totalSoldAmount = $state(0);
  let totalEarnings = $state(0);
  let monthlyStats = $state({
    count: 0,
    revenue: 0,
    topCategory: '',
    avgPrice: 0
  });
  
  let loading = $state(true);
  let activeTab = $state<'all' | 'recent' | 'needs_shipping' | 'shipped' | 'completed'>('needs_shipping');
  
  onMount(async () => {
    await loadOrders();
    await loadStats();
    loading = false;
  });
  
  async function loadOrders() {
    const { data: orderData, error } = await data.supabase
      .from('orders')
      .select(`
        id,
        status,
        total_amount,
        shipping_cost,
        tracking_number,
        notes,
        created_at,
        updated_at,
        shipped_at,
        delivered_at,
        product:products (
          id,
          title,
          price,
          condition,
          size,
          images,
          category:categories(name)
        ),
        buyer:profiles!buyer_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('seller_id', data.user.id)
      .in('status', ['paid', 'shipped', 'delivered'])
      .order('created_at', { ascending: false });
    
    if (!error && orderData) {
      orders = orderData;
      
      // Get recent orders (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      recentOrders = orderData.filter(o => 
        new Date(o.created_at) > weekAgo
      );
      
      // Calculate totals
      totalSoldAmount = orderData.reduce((sum, o) => sum + Number(o.total_amount), 0);
      // Assuming 5% platform fee
      totalEarnings = orderData.reduce((sum, o) => sum + (Number(o.total_amount) * 0.95), 0);
    }
  }
  
  async function loadStats() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const { data: monthOrders, error } = await data.supabase
      .from('orders')
      .select(`
        total_amount,
        product:products!inner (
          category:categories(name)
        ),
        created_at
      `)
      .eq('seller_id', data.user.id)
      .in('status', ['paid', 'shipped', 'delivered'])
      .gte('created_at', firstDayOfMonth.toISOString());
    
    if (!error && monthOrders) {
      // Calculate monthly stats
      const count = monthOrders.length;
      const revenue = monthOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      const avgPrice = count > 0 ? revenue / count : 0;
      
      // Find top category
      const categoryCounts = monthOrders.reduce((acc, o) => {
        const category = o.product?.category?.name || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});
      
      const topCategory = Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
      
      monthlyStats = {
        count,
        revenue,
        avgPrice,
        topCategory
      };
    }
  }
  
  function getFilteredOrders() {
    switch (activeTab) {
      case 'recent':
        return recentOrders;
      case 'needs_shipping':
        return orders.filter(o => o.status === 'paid');
      case 'shipped':
        return orders.filter(o => o.status === 'shipped');
      case 'completed':
        return orders.filter(o => o.status === 'delivered');
      default:
        return orders;
    }
  }

  const handleOrderStatusChange = (orderId: string, newStatus: string) => {
    // Find and update the order in our data
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      orders[orderIndex].status = newStatus;
      orders[orderIndex].updated_at = new Date().toISOString();
      
      if (newStatus === 'shipped') {
        orders[orderIndex].shipped_at = new Date().toISOString();
      }
      
      // Force reactivity
      orders = [...orders];
    }
  };
  
  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  function timeAgo(date: string) {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(date);
  }
  
  function getStatusColor(status: string) {
    switch(status) {
      case 'pending_shipment': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<svelte:head>
  <title>Sold Products - Driplo Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Sold Products</h1>
          <p class="text-gray-600 text-sm sm:text-base mt-1">Track your sold items and earnings</p>
        </div>
        <a href="/dashboard/earnings">
          <Button variant="primary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            View Earnings
          </Button>
        </a>
      </div>
    </div>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg p-4 sm:p-6 shadow-xs border">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-600">Total Sales</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
            <p class="text-xs text-gray-500 mt-2">All time</p>
          </div>
          <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
      </div>
      
      <div class="bg-white rounded-lg p-4 sm:p-6 shadow-xs border">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-600">Total Revenue</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">€{totalSoldAmount.toFixed(0)}</p>
            <p class="text-xs text-gray-500 mt-2">Before fees</p>
          </div>
          <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      
      <div class="bg-white rounded-lg p-4 sm:p-6 shadow-xs border">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-600">This Month</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{monthlyStats.count}</p>
            <p class="text-xs text-green-600 mt-2">+€{monthlyStats.revenue.toFixed(0)} earned</p>
          </div>
          <svg class="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      </div>
      
      <div class="bg-white rounded-lg p-4 sm:p-6 shadow-xs border">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-600">Needs Shipping</p>
            <p class="text-2xl font-bold text-orange-600 mt-1">{orders.filter(o => o.status === 'paid').length}</p>
            <p class="text-xs text-gray-500 mt-2">Awaiting shipment</p>
          </div>
          <svg class="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      </div>
    </div>
    
    <!-- Recent Order Notifications -->
    {#if recentOrders.length > 0}
      <div class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-sm font-medium text-blue-800">
              Recent Sales ({recentOrders.length} this week)
            </h3>
            <div class="mt-2 text-sm text-blue-700">
              <p>You have {recentOrders.filter(o => o.status === 'paid').length} orders ready to ship.</p>
            </div>
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-4 sm:space-x-8">
        <button
          onclick={() => activeTab = 'needs_shipping'}
          class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
            {activeTab === 'needs_shipping' 
              ? 'border-orange-500 text-orange-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'}"
        >
          <span class="flex items-center gap-2">
            📦 Needs Shipping ({orders.filter(o => o.status === 'paid').length})
          </span>
        </button>
        <button
          onclick={() => activeTab = 'shipped'}
          class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
            {activeTab === 'shipped' 
              ? 'border-black text-gray-900' 
              : 'border-transparent text-gray-500 hover:text-gray-700'}"
        >
          Shipped ({orders.filter(o => o.status === 'shipped').length})
        </button>
        <button
          onclick={() => activeTab = 'completed'}
          class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
            {activeTab === 'completed' 
              ? 'border-black text-gray-900' 
              : 'border-transparent text-gray-500 hover:text-gray-700'}"
        >
          Completed ({orders.filter(o => o.status === 'delivered').length})
        </button>
        <button
          onclick={() => activeTab = 'all'}
          class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
            {activeTab === 'all' 
              ? 'border-black text-gray-900' 
              : 'border-transparent text-gray-500 hover:text-gray-700'}"
        >
          All Orders ({orders.length})
        </button>
      </nav>
    </div>
    
    <!-- Orders List -->
    {#if loading}
      <div class="flex justify-center items-center py-12">
        <div class="text-gray-500">Loading orders...</div>
      </div>
    {:else if getFilteredOrders().length === 0}
      <div class="bg-white rounded-lg shadow-xs border p-8 text-center">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <p class="text-gray-600">No orders in this category yet</p>
        <p class="text-sm text-gray-500 mt-1">Your orders will appear here</p>
      </div>
    {:else}
      <div class="space-y-4">
        {#each getFilteredOrders() as order}
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
                  <p class="text-sm text-green-600">€{(Number(order.total_amount) * 0.95).toFixed(2)} earnings</p>
                </div>
              </div>
            </div>

            <!-- Product & Buyer Details -->
            <div class="p-4 sm:p-6">
              <div class="flex items-start space-x-4">
                <img 
                  src={order.product.images?.[0] || '/placeholder.jpg'} 
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
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span class="text-sm text-gray-600">
                      Buyer: {order.buyer.username}
                      {#if order.buyer.full_name}({order.buyer.full_name}){/if}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Timeline & Actions -->
            <div class="border-t bg-gray-50">
              <div class="p-4 sm:p-6">
                <!-- Order Timeline -->
                <div class="mb-4">
                  <h4 class="text-sm font-medium text-gray-900 mb-3">Order Progress</h4>
                  <OrderTimeline {order} userType="seller" className="mb-4" />
                </div>

                <!-- Seller Actions -->
                {#if order.status === 'paid'}
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div class="text-sm text-orange-600 font-medium flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.084 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Action required: Ship this order
                    </div>
                    <div class="flex-1 max-w-xs">
                      <OrderActions 
                        {order} 
                        userType="seller" 
                        userId={data.user.id} 
                        onStatusChange={(newStatus) => handleOrderStatusChange(order.id, newStatus)}
                      />
                    </div>
                  </div>
                {:else}
                  <div class="flex justify-between items-center">
                    <div class="text-sm text-gray-500">
                      {#if order.status === 'shipped'}
                        Shipped on {formatDate(order.shipped_at)}
                      {:else if order.status === 'delivered'}
                        Completed on {formatDate(order.delivered_at || order.updated_at)}
                      {/if}
                    </div>
                    <div class="flex space-x-2">
                      <Button size="sm" variant="outline">View Details</Button>
                      {#if order.status === 'delivered'}
                        <Button size="sm" variant="outline">Request Review</Button>
                      {/if}
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
    
    <!-- Monthly Performance Chart -->
    <div class="mt-8 bg-white rounded-lg shadow-xs p-6">
      <h2 class="text-lg font-semibold mb-4">Sales Performance</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-3">Top Categories This Month</h3>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">{monthlyStats.topCategory}</span>
              <span class="text-sm font-medium">{monthlyStats.categorySales || 0} sales</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full" style="width: 65%"></div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-3">Sales Trend</h3>
          <div class="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
            <p class="text-gray-500 text-sm">Chart visualization coming soon</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>