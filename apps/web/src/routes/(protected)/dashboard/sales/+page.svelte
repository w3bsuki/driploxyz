<script lang="ts">
  import { Button, OrderStatus, Tabs } from '@repo/ui';
  import type { PageData } from './$types';
  import * as i18n from '@repo/i18n';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  function formatDate(dateString: string | null | undefined) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function formatPrice(amount: number) {
    return `$${amount.toFixed(2)}`;
  }

  // Analytics data
  // Derived analytics metrics (treat as value, not callable)
  const analytics = $derived.by(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const thisMonthOrders = data.orders.filter(o => o.created_at && new Date(o.created_at) >= thisMonth);
    const lastMonthOrders = data.orders.filter(o => {
      if (!o.created_at) return false;
      const date = new Date(o.created_at);
      return date >= lastMonth && date < thisMonth;
    });
    
    const thisMonthEarnings = thisMonthOrders.reduce((sum, o) => sum + (o.seller_net_amount || 0), 0);
    const lastMonthEarnings = lastMonthOrders.reduce((sum, o) => sum + (o.seller_net_amount || 0), 0);
    
    const earningsGrowth = lastMonthEarnings > 0 
      ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings * 100)
      : thisMonthEarnings > 0 ? 100 : 0;
    
    return {
      thisMonthSales: thisMonthOrders.length,
      thisMonthEarnings,
      lastMonthSales: lastMonthOrders.length,
      lastMonthEarnings,
      salesGrowth: lastMonthOrders.length > 0 
        ? ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length * 100)
        : thisMonthOrders.length > 0 ? 100 : 0,
      earningsGrowth,
      averageOrderValue: data.orders.length > 0 
        ? data.orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / data.orders.length
        : 0
    };
  });

  const tabs = [
    { id: 'sold', label: i18n.sales_soldItems() },
    { id: 'earnings', label: i18n.dashboard_earnings() },
    { id: 'analytics', label: i18n.sales_analytics() }
  ];
</script>

<svelte:head>
  <title>Sales Overview - Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Header with Breadcrumb -->
    <div class="mb-6">
      <nav class="flex items-center text-sm text-gray-500 mb-3">
        <a href="/dashboard" class="hover:text-gray-700 hover:underline">{i18n.breadcrumb_dashboard()}</a>
        <svg class="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-gray-900">{i18n.breadcrumb_sales()}</span>
      </nav>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">{i18n.sales_overview()}</h1>
      <p class="text-gray-600 text-sm sm:text-base mt-1">{i18n.sales_manageSoldItems()}</p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg p-4 shadow-sm">
        <p class="text-sm text-gray-600">{i18n.sales_totalEarnings()}</p>
        <p class="text-2xl font-bold text-green-600">{formatPrice(data.earnings.total)}</p>
      </div>
      <div class="bg-white rounded-lg p-4 shadow-sm">
        <p class="text-sm text-gray-600">{i18n.sales_available()}</p>
        <p class="text-2xl font-bold text-gray-900">{formatPrice(data.earnings.available)}</p>
      </div>
      <div class="bg-white rounded-lg p-4 shadow-sm">
        <p class="text-sm text-gray-600">{i18n.sales_itemsSold()}</p>
        <p class="text-2xl font-bold text-blue-600">{data.soldProducts.length}</p>
      </div>
      <div class="bg-white rounded-lg p-4 shadow-sm">
    <p class="text-sm text-gray-600">{i18n.sales_thisMonth()}</p>
  <p class="text-2xl font-bold text-purple-600">{analytics.thisMonthSales}</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-lg shadow-sm">
      <Tabs {tabs} value="sold" class="" panelClass="p-6">
        {#snippet children(activeTab)}
          {#if activeTab?.id === 'sold'}
            <!-- Sold Items -->
          {#if data.soldProducts.length === 0}
            <div class="text-center py-12">
              <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 class="text-lg font-medium text-gray-900 mb-2">{i18n.sales_noItemsSoldYet()}</h3>
              <p class="text-gray-500 mb-4">{i18n.sales_startSelling()}</p>
              <Button href="/sell">{i18n.sales_createFirstListing()}</Button>
            </div>
          {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each data.soldProducts as product}
                <div class="border border-gray-200 rounded-lg p-4">
                  {#if product.first_image}
                    <img src={product.first_image} alt={product.title} class="w-full h-32 object-cover rounded-lg mb-3" />
                  {:else}
                    <div class="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      <span class="text-gray-400">No image</span>
                    </div>
                  {/if}
                  <h3 class="font-medium text-gray-900 mb-1 truncate">{product.title}</h3>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-lg font-bold text-green-600">{formatPrice(product.price)}</span>
                    <span class="text-sm text-gray-500">Sold</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <span>Sold</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-2">{formatDate(product.sold_at)}</p>
                </div>
              {/each}
            </div>
          {/if}
          {:else if activeTab?.id === 'earnings'}
            <!-- Earnings -->
          <div class="space-y-6">
            <!-- Earnings Summary -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 class="font-medium text-green-800 mb-1">{i18n.sales_totalEarned()}</h3>
                <p class="text-2xl font-bold text-green-600">{formatPrice(data.earnings.total)}</p>
              </div>
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 class="font-medium text-blue-800 mb-1">{i18n.sales_availableBalance()}</h3>
                <p class="text-2xl font-bold text-blue-600">{formatPrice(data.earnings.available)}</p>
                <Button size="sm" class="mt-2" href="/dashboard/earnings">{i18n.sales_requestPayout()}</Button>
              </div>
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 class="font-medium text-gray-800 mb-1">{i18n.sales_paidOut()}</h3>
                <p class="text-2xl font-bold text-gray-600">{formatPrice(data.earnings.paid)}</p>
              </div>
            </div>

            <!-- Recent Orders -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">{i18n.sales_recentOrders()}</h3>
              {#if data.orders.length === 0}
                <p class="text-gray-500 text-center py-8">{i18n.sales_noOrdersYet()}</p>
              {:else}
                <div class="space-y-3">
                  {#each data.orders.slice(0, 10) as order}
                    <div class="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      {#if order.product_image}
                        <img src={order.product_image} alt="" class="w-12 h-12 object-cover rounded" />
                      {:else}
                        <div class="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <span class="text-xs text-gray-400">No img</span>
                        </div>
                      {/if}
                      <div class="flex-1">
                        <h4 class="font-medium text-gray-900">{order.product?.title || 'Unknown Product'}</h4>
                        <p class="text-sm text-gray-500">
                          {formatDate(order.created_at)}
                          {#if order.buyer_id}
                            <span class="mx-1">•</span>
                            <a 
                              href="/messages?conversation={order.buyer_id}__{order.product_id}"
                              class="text-blue-600 hover:text-blue-700"
                            >
                              {i18n.orders_messageBuyer()}
                            </a>
                          {/if}
                        </p>
                      </div>
                      <div class="text-right">
                        <p class="font-medium text-gray-900">{formatPrice(order.seller_net_amount || 0)}</p>
                        <OrderStatus status={order.status ?? 'pending'} />
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
          {:else if activeTab?.id === 'analytics'}
            <!-- Analytics -->
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-600 mb-2">{i18n.sales_thisMonthSales()}</h3>
                <p class="text-2xl font-bold text-gray-900">{analytics.thisMonthSales}</p>
                <div class="flex items-center mt-2">
                  {#if analytics.salesGrowth > 0}
                    <svg class="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span class="text-sm text-green-600">+{analytics.salesGrowth.toFixed(1)}%</span>
                  {:else if analytics.salesGrowth < 0}
                    <svg class="w-4 h-4 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                    <span class="text-sm text-red-600">{analytics.salesGrowth.toFixed(1)}%</span>
                  {:else}
                    <span class="text-sm text-gray-500">{i18n.sales_noChange()}</span>
                  {/if}
                </div>
              </div>

              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-600 mb-2">{i18n.sales_thisMonthEarnings()}</h3>
                <p class="text-2xl font-bold text-gray-900">{formatPrice(analytics.thisMonthEarnings)}</p>
                <div class="flex items-center mt-2">
                  {#if analytics.earningsGrowth > 0}
                    <svg class="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span class="text-sm text-green-600">+{analytics.earningsGrowth.toFixed(1)}%</span>
                  {:else if analytics.earningsGrowth < 0}
                    <svg class="w-4 h-4 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                    <span class="text-sm text-red-600">{analytics.earningsGrowth.toFixed(1)}%</span>
                  {:else}
                    <span class="text-sm text-gray-500">{i18n.sales_noChange()}</span>
                  {/if}
                </div>
              </div>

              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-600 mb-2">{i18n.sales_averageOrder()}</h3>
                <p class="text-2xl font-bold text-gray-900">{formatPrice(analytics.averageOrderValue)}</p>
                <p class="text-sm text-gray-500 mt-2">{i18n.sales_perSale()}</p>
              </div>

              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <h3 class="text-sm font-medium text-gray-600 mb-2">{i18n.sales_totalOrders()}</h3>
                <p class="text-2xl font-bold text-gray-900">{data.orders.length}</p>
                <p class="text-sm text-gray-500 mt-2">{i18n.sales_allTime()}</p>
              </div>
            </div>

            <!-- Performance Chart Placeholder -->
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">{i18n.sales_salesPerformance()}</h3>
              <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p class="text-gray-500">{i18n.sales_chartComingSoon()}</p>
              </div>
            </div>
          </div>
          {/if}
        {/snippet}
      </Tabs>
    </div>
  </div>
</div>