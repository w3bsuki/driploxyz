<script lang="ts">
  import { Button, Avatar, ProductCard, type Product } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  import type { PageData } from './$types';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  // Calculate stats from real data
  const stats = $derived(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const activeListings = data.products?.filter(p => p.status === 'active' && !p.is_sold) || [];
    const thisMonthOrders = data.orders?.filter(o => new Date(o.created_at) >= thisMonth) || [];
    const allTimeOrders = data.orders || [];
    
    const totalRevenue = allTimeOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const monthlyRevenue = thisMonthOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    
    return {
      totalRevenue,
      monthlyRevenue,
      totalSales: allTimeOrders.length,
      monthlySales: thisMonthOrders.length,
      activeListings: activeListings.length,
      totalViews: data.products?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0,
      monthlyViews: Math.floor(Math.random() * 3000), // Mock for now
      conversionRate: activeListings.length > 0 ? (allTimeOrders.length / activeListings.length * 100) : 0
    };
  });
  
  // Recent orders from real data
  const recentOrders = $derived(() => {
    return (data.orders || [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(order => ({
        id: order.id,
        productTitle: order.product?.title || 'Unknown Product',
        buyerName: order.buyer?.full_name || order.buyer?.username || 'Unknown Buyer',
        price: Number(order.total_amount),
        status: order.status,
        date: order.created_at
      }));
  });
  
  // Active listings from real data
  const activeListings = $derived(() => {
    return (data.products || [])
      .filter(p => p.status === 'active' && !p.is_sold)
      .slice(0, 6)
      .map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: Number(product.price),
        images: product.images?.map(img => img.image_url) || ['/placeholder-product.svg'],
        brand: product.brand,
        size: product.size,
        condition: product.condition as any,
        category: product.category?.name || 'Uncategorized',
        sellerId: product.seller_id,
        sellerName: data.profile?.username || data.profile?.full_name || '',
        sellerRating: 4.8,
        createdAt: product.created_at,
        location: product.location || 'Unknown'
      }));
  });
  
  let activeTab = $state<'overview' | 'listings' | 'orders' | 'analytics' | 'settings'>('overview');
  
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending_shipment': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
</script>

<svelte:head>
  <title>Seller Dashboard - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <Header />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Welcome Section -->
    <div class="mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, {data.profile?.username || data.profile?.full_name || 'User'}!</h1>
      <p class="text-gray-600 text-sm sm:text-base mt-1">Here's what's happening with your shop today.</p>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <a href="/sell">
        <Button variant="primary" class="w-full">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Listing
        </Button>
      </a>
      <a href="/dashboard/sold">
        <Button variant="outline" class="w-full">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Sold Items
        </Button>
      </a>
      <a href="/dashboard/earnings">
        <Button variant="outline" class="w-full">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Earnings
        </Button>
      </a>
      <a href="/dashboard/upgrade">
        <Button variant="outline" class="w-full bg-linear-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-800 hover:from-yellow-100 hover:to-orange-100">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Upgrade
        </Button>
      </a>
      <Button variant="outline" class="w-full">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Analytics
      </Button>
      <Button variant="outline" class="w-full">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Settings
      </Button>
    </div>

    <!-- Balance Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <div class="bg-white rounded-lg p-4 sm:p-6 shadow-xs">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-600">Available Balance</p>
            <p class="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">${stats().totalRevenue.toFixed(2)}</p>
            <p class="text-xs sm:text-sm text-gray-500 mt-2">Total earned</p>
          </div>
          <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      
      <div class="bg-white rounded-lg p-4 sm:p-6 shadow-xs">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-600">This Month's Sales</p>
            <p class="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats().monthlySales}</p>
            <p class="text-xs sm:text-sm text-green-600 mt-2">+12% from last month</p>
          </div>
          <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
        <button
          onclick={() => activeTab = 'overview'}
          class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
            {activeTab === 'overview' 
              ? 'border-black text-gray-900' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        >
          Overview
        </button>
        <button
          onclick={() => activeTab = 'listings'}
          class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
            {activeTab === 'listings' 
              ? 'border-black text-gray-900' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        >
          Listings ({stats().activeListings})
        </button>
        <button
          onclick={() => activeTab = 'orders'}
          class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
            {activeTab === 'orders' 
              ? 'border-black text-gray-900' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        >
          Orders
        </button>
        <button
          onclick={() => activeTab = 'analytics'}
          class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
            {activeTab === 'analytics' 
              ? 'border-black text-gray-900' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        >
          Analytics
        </button>
        <button
          onclick={() => activeTab = 'settings'}
          class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
            {activeTab === 'settings' 
              ? 'border-black text-gray-900' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        >
          Settings
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    {#if activeTab === 'overview'}
      <!-- Stats Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg shadow-xs">
          <p class="text-sm text-gray-600">Total Revenue</p>
          <p class="text-xl sm:text-2xl font-bold text-gray-900">${stats().totalRevenue.toFixed(0)}</p>
          <p class="text-xs text-gray-500 mt-1">All time</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-xs">
          <p class="text-sm text-gray-600">Active Listings</p>
          <p class="text-xl sm:text-2xl font-bold text-gray-900">{stats().activeListings}</p>
          <p class="text-xs text-gray-500 mt-1">Currently live</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-xs">
          <p class="text-sm text-gray-600">Total Views</p>
          <p class="text-xl sm:text-2xl font-bold text-gray-900">{stats().monthlyViews}</p>
          <p class="text-xs text-gray-500 mt-1">This month</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-xs">
          <p class="text-sm text-gray-600">Conversion Rate</p>
          <p class="text-xl sm:text-2xl font-bold text-gray-900">{stats().conversionRate.toFixed(1)}%</p>
          <p class="text-xs text-gray-500 mt-1">Views to sales</p>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="bg-white rounded-lg shadow-xs mb-6">
        <div class="p-4 sm:p-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold">Recent Orders</h2>
            <button onclick={() => activeTab = 'orders'} class="text-sm text-blue-600 hover:underline">View all</button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              {#each recentOrders() as order}
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-900">{order.productTitle}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{order.buyerName}</td>
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">${order.price}</td>
                  <td class="px-4 py-3">
                    <span class="inline-flex px-2 py-1 text-xs rounded-full {getStatusColor(order.status)}">
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-500">{timeAgo(order.date)}</td>
                  <td class="px-4 py-3">
                    <Button size="sm" variant="outline">View</Button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Active Listings Preview -->
      <div>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Your Active Listings</h2>
          <button onclick={() => activeTab = 'listings'} class="text-sm text-blue-600 hover:underline">View all</button>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {#each activeListings() as product}
            <div class="group cursor-pointer">
              <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                <img src={product.images[0]} alt={product.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <p class="text-xs sm:text-sm font-medium truncate">{product.title}</p>
              <p class="text-sm font-bold">${product.price}</p>
            </div>
          {/each}
        </div>
      </div>

    {:else if activeTab === 'listings'}
      <div class="bg-white rounded-lg shadow-xs">
        <div class="p-4 sm:p-6 border-b border-gray-200">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <h2 class="text-lg font-semibold">Manage Listings</h2>
            <div class="flex space-x-2 w-full sm:w-auto">
              <input 
                type="search" 
                placeholder="Search listings..."
                class="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <Button size="sm">Filter</Button>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4 sm:p-6">
          {#each activeListings() as product}
            <div class="relative group">
              <ProductCard {product} onclick={() => window.location.href = `/product/${product.id}`} />
              <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button aria-label="Edit product" class="p-1 bg-white rounded-full shadow-lg">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>

    {:else if activeTab === 'orders'}
      <div class="bg-white rounded-lg shadow-xs">
        <div class="p-4 sm:p-6 border-b border-gray-200">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <h2 class="text-lg font-semibold">Order Management</h2>
            <div class="flex space-x-2">
              <select class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>All Orders</option>
                <option>Pending Shipment</option>
                <option>Shipped</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
              <Button size="sm" variant="outline">Export</Button>
            </div>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              {#each [...recentOrders(), ...recentOrders()] as order}
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-900">#{order.id}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{order.productTitle}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{order.buyerName}</td>
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">${order.price}</td>
                  <td class="px-4 py-3">
                    <span class="inline-flex px-2 py-1 text-xs rounded-full {getStatusColor(order.status)}">
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-500">{timeAgo(order.date)}</td>
                  <td class="px-4 py-3">
                    <div class="flex space-x-2">
                      <Button size="sm" variant="outline">View</Button>
                      {#if order.status === 'pending_shipment'}
                        <Button size="sm">Ship</Button>
                      {/if}
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

    {:else if activeTab === 'analytics'}
      <div class="space-y-6">
        <!-- Performance Chart -->
        <div class="bg-white rounded-lg shadow-xs p-4 sm:p-6">
          <h2 class="text-lg font-semibold mb-4">Performance Overview</h2>
          <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p class="text-gray-500">Chart will be implemented with a charting library</p>
          </div>
        </div>

        <!-- Top Products -->
        <div class="bg-white rounded-lg shadow-xs p-4 sm:p-6">
          <h2 class="text-lg font-semibold mb-4">Top Performing Products</h2>
          <div class="space-y-4">
            {#each activeListings().slice(0, 5) as product, i}
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <span class="text-sm font-medium text-gray-500">#{i + 1}</span>
                  <img src={product.images[0]} alt={product.title} class="w-10 h-10 rounded-sm object-cover" />
                  <div>
                    <p class="text-sm font-medium text-gray-900">{product.title}</p>
                    <p class="text-xs text-gray-500">{Math.floor(Math.random() * 100)} views</p>
                  </div>
                </div>
                <p class="text-sm font-bold">${product.price}</p>
              </div>
            {/each}
          </div>
        </div>

        <!-- Traffic Sources -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-lg shadow-xs p-4 sm:p-6">
            <h2 class="text-lg font-semibold mb-4">Traffic Sources</h2>
            <div class="space-y-3">
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>Search</span>
                  <span>45%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full" style="width: 45%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>Direct</span>
                  <span>30%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-green-600 h-2 rounded-full" style="width: 30%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>Social</span>
                  <span>25%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-purple-600 h-2 rounded-full" style="width: 25%"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-xs p-4 sm:p-6">
            <h2 class="text-lg font-semibold mb-4">Customer Demographics</h2>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Age 18-24</span>
                <span class="text-sm font-medium">32%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Age 25-34</span>
                <span class="text-sm font-medium">45%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Age 35-44</span>
                <span class="text-sm font-medium">18%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Age 45+</span>
                <span class="text-sm font-medium">5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    {:else if activeTab === 'settings'}
      <div class="max-w-2xl">
        <div class="bg-white rounded-lg shadow-xs p-4 sm:p-6 mb-6">
          <h2 class="text-lg font-semibold mb-4">Shop Settings</h2>
          <div class="space-y-4">
            <div>
              <label for="shop-name" class="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
              <input id="shop-name" type="text" value={data.profile?.username || ''} class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label for="shop-description" class="block text-sm font-medium text-gray-700 mb-1">Shop Description</label>
              <textarea id="shop-description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Tell buyers about your shop..."></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Vacation Mode</label>
              <div class="flex items-center space-x-3">
                <button aria-label="Toggle vacation mode" class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1"></span>
                </button>
                <span class="text-sm text-gray-600">Your shop is currently active</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-xs p-4 sm:p-6 mb-6">
          <h2 class="text-lg font-semibold mb-4">Shipping Settings</h2>
          <div class="space-y-4">
            <div>
              <label for="processing-time" class="block text-sm font-medium text-gray-700 mb-1">Processing Time</label>
              <select id="processing-time" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>1-2 business days</option>
                <option>3-5 business days</option>
                <option>1 week</option>
              </select>
            </div>
            <div>
              <label for="shipping-price" class="block text-sm font-medium text-gray-700 mb-1">Default Shipping Price</label>
              <input id="shipping-price" type="number" value="8.99" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-xs p-4 sm:p-6">
          <h2 class="text-lg font-semibold mb-4">Payment Settings</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
              <div class="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                <span class="text-sm">**** **** **** 1234</span>
                <Button size="sm" variant="outline">Change</Button>
              </div>
            </div>
            <div>
              <label for="payout-schedule" class="block text-sm font-medium text-gray-700 mb-1">Payout Schedule</label>
              <select id="payout-schedule" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <Button size="lg" class="w-full">Save Settings</Button>
        </div>
      </div>
    {/if}
  </div>
</div>