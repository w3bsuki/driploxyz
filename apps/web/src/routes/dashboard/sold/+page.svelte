<script lang="ts">
  import { Button, ProductCard, SoldNotificationPanel } from '@repo/ui';
  import * as i18n from '@repo/i18n';
  import Header from '$lib/components/Header.svelte';
  import type { PageData } from './$types';
  import { onMount } from 'svelte';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  // Sold products state
  let soldProducts = $state([]);
  let recentlySold = $state([]);
  let totalSoldAmount = $state(0);
  let totalEarnings = $state(0);
  let monthlyStats = $state({
    count: 0,
    revenue: 0,
    topCategory: '',
    avgPrice: 0
  });
  
  let loading = $state(true);
  let activeTab = $state<'all' | 'recent' | 'pending' | 'completed'>('recent');
  let selectedPeriod = $state<'week' | 'month' | 'year' | 'all'>('month');
  
  onMount(async () => {
    await loadSoldProducts();
    await loadStats();
    loading = false;
  });
  
  async function loadSoldProducts() {
    const { data: products, error } = await data.supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        orders!inner(
          id,
          buyer_id,
          total_amount,
          status,
          created_at,
          buyer:profiles!buyer_id(username, full_name, avatar_url)
        )
      `)
      .eq('seller_id', data.user.id)
      .eq('is_sold', true)
      .order('updated_at', { ascending: false });
    
    if (!error && products) {
      soldProducts = products;
      
      // Get recently sold (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      recentlySold = products.filter(p => 
        new Date(p.updated_at) > weekAgo
      );
      
      // Calculate totals
      totalSoldAmount = products.reduce((sum, p) => sum + Number(p.price), 0);
      totalEarnings = products.reduce((sum, p) => sum + (Number(p.price) * 0.95), 0); // After 5% fee
    }
  }
  
  async function loadStats() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const { data: monthProducts, error } = await data.supabase
      .from('products')
      .select(`
        price,
        category:categories(name),
        updated_at
      `)
      .eq('seller_id', data.user.id)
      .eq('is_sold', true)
      .gte('updated_at', firstDayOfMonth.toISOString());
    
    if (!error && monthProducts) {
      // Calculate monthly stats
      const count = monthProducts.length;
      const revenue = monthProducts.reduce((sum, p) => sum + Number(p.price), 0);
      const avgPrice = count > 0 ? revenue / count : 0;
      
      // Find top category
      const categoryCounts = monthProducts.reduce((acc, p) => {
        const category = p.category?.name || 'Uncategorized';
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
  
  function getFilteredProducts() {
    switch (activeTab) {
      case 'recent':
        return recentlySold;
      case 'pending':
        return soldProducts.filter(p => 
          p.orders?.some(o => o.status === 'pending_shipment')
        );
      case 'completed':
        return soldProducts.filter(p => 
          p.orders?.some(o => o.status === 'delivered')
        );
      default:
        return soldProducts;
    }
  }
  
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
  <Header />
  
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
      <div class="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-600">Total Sold</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{soldProducts.length}</p>
            <p class="text-xs text-gray-500 mt-2">All time</p>
          </div>
          <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
      </div>
      
      <div class="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-600">Total Revenue</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">${totalSoldAmount.toFixed(0)}</p>
            <p class="text-xs text-gray-500 mt-2">Before fees</p>
          </div>
          <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      
      <div class="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-600">This Month</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{monthlyStats.count}</p>
            <p class="text-xs text-green-600 mt-2">+${monthlyStats.revenue.toFixed(0)} earned</p>
          </div>
          <svg class="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      </div>
      
      <div class="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-600">Avg. Sale Price</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">${monthlyStats.avgPrice.toFixed(0)}</p>
            <p class="text-xs text-gray-500 mt-2">This month</p>
          </div>
          <svg class="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
      </div>
    </div>
    
    <!-- Recent Sold Notifications -->
    {#if recentlySold.length > 0}
      <div class="mb-6">
        <SoldNotificationPanel 
          soldProducts={recentlySold.slice(0, 3).map(p => ({
            id: p.id,
            title: p.title,
            price: p.price,
            soldAt: p.updated_at,
            buyerName: p.orders?.[0]?.buyer?.username || 'Unknown',
            image: p.images?.[0]?.image_url || '/placeholder-product.svg'
          }))}
        />
      </div>
    {/if}
    
    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-4 sm:space-x-8">
        <button
          onclick={() => activeTab = 'recent'}
          class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
            {activeTab === 'recent' 
              ? 'border-black text-gray-900' 
              : 'border-transparent text-gray-500 hover:text-gray-700'}"
        >
          Recently Sold ({recentlySold.length})
        </button>
        <button
          onclick={() => activeTab = 'all'}
          class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
            {activeTab === 'all' 
              ? 'border-black text-gray-900' 
              : 'border-transparent text-gray-500 hover:text-gray-700'}"
        >
          All Sold ({soldProducts.length})
        </button>
        <button
          onclick={() => activeTab = 'pending'}
          class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
            {activeTab === 'pending' 
              ? 'border-black text-gray-900' 
              : 'border-transparent text-gray-500 hover:text-gray-700'}"
        >
          Pending Shipment
        </button>
        <button
          onclick={() => activeTab = 'completed'}
          class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
            {activeTab === 'completed' 
              ? 'border-black text-gray-900' 
              : 'border-transparent text-gray-500 hover:text-gray-700'}"
        >
          Completed
        </button>
      </nav>
    </div>
    
    <!-- Products List -->
    {#if loading}
      <div class="flex justify-center items-center py-12">
        <div class="text-gray-500">Loading sold products...</div>
      </div>
    {:else if getFilteredProducts().length === 0}
      <div class="bg-white rounded-lg shadow-sm p-8 text-center">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <p class="text-gray-600">No products in this category yet</p>
        <p class="text-sm text-gray-500 mt-1">Your sold items will appear here</p>
      </div>
    {:else}
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each getFilteredProducts() as product}
                {@const order = product.orders?.[0]}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 flex-shrink-0">
                        <img 
                          class="h-10 w-10 rounded-lg object-cover" 
                          src={product.images?.[0]?.image_url || '/placeholder-product.svg'} 
                          alt={product.title}
                        />
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{product.title}</div>
                        <div class="text-xs text-gray-500">{product.category?.name || 'Uncategorized'}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{order?.buyer?.username || 'Unknown'}</div>
                    <div class="text-xs text-gray-500">{order?.buyer?.full_name || ''}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${product.price}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-green-600">${(product.price * 0.95).toFixed(2)}</div>
                    <div class="text-xs text-gray-500">After 5% fee</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(order?.status || 'pending')}">
                      {order?.status?.replace('_', ' ') || 'Pending'}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {timeAgo(product.updated_at)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex space-x-2">
                      <button class="text-blue-600 hover:text-blue-900">View</button>
                      {#if order?.status === 'pending_shipment'}
                        <button class="text-green-600 hover:text-green-900">Ship</button>
                      {/if}
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
    
    <!-- Monthly Performance Chart -->
    <div class="mt-8 bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-lg font-semibold mb-4">Sales Performance</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-3">Top Categories This Month</h3>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">{monthlyStats.topCategory}</span>
              <span class="text-sm font-medium">{Math.floor(Math.random() * 10 + 5)} sales</span>
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