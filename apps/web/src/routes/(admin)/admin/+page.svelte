<script lang="ts">
  import type { PageData } from './$types';
  import * as i18n from '@repo/i18n';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  // Use data from server
  const stats = $derived(data.stats);
  const recentOrders = $derived(data.recentOrders);

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'paid': return 'bg-green-100/70 text-green-700';
      case 'shipped': return 'bg-zinc-100/70 text-zinc-700';
      case 'delivered': return 'bg-zinc-200/70 text-zinc-800';
      case 'cancelled': return 'bg-red-100/70 text-red-700';
      default: return 'bg-gray-100/70 text-[color:var(--text-secondary)]';
    }
  }

  // narrow helper for embedded profile-like
  function safeUsername(obj: unknown): string | undefined {
    if (obj && typeof obj === 'object' && 'username' in obj) {
      const u = (obj as Record<string, unknown>).username;
      return typeof u === 'string' ? u : undefined;
    }
    return undefined;
  }
</script>

<div class="space-y-6">
  <!-- Page Header -->
  <div>
    <h1 class="text-2xl font-bold text-[color:var(--text-primary)]">{i18n.admin_dashboard()}</h1>
    <p class="mt-1 text-sm text-[color:var(--text-tertiary)]">{i18n.admin_monitorMetrics()}</p>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white rounded-2xl border border-zinc-200 p-6 hover:border-zinc-300 transition-colors">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-[color:var(--text-tertiary)]">{i18n.admin_totalUsers()}</p>
          <p class="mt-2 text-3xl font-bold text-zinc-900">
            {stats.totalUsers.toLocaleString()}
          </p>
        </div>
        <div class="p-3 bg-zinc-100 rounded-xl">
          <svg class="w-6 h-6 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-zinc-200 p-6 hover:border-zinc-300 transition-colors">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-[color:var(--text-tertiary)]">{i18n.admin_totalProducts()}</p>
          <p class="mt-2 text-3xl font-bold text-zinc-900">
            {stats.totalProducts.toLocaleString()}
          </p>
        </div>
        <div class="p-3 bg-zinc-100 rounded-xl">
          <svg class="w-6 h-6 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-zinc-200 p-6 hover:border-zinc-300 transition-colors">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-[color:var(--text-tertiary)]">{i18n.admin_totalOrders()}</p>
          <p class="mt-2 text-3xl font-bold text-zinc-900">
            {stats.totalOrders.toLocaleString()}
          </p>
        </div>
        <div class="p-3 bg-zinc-100 rounded-xl">
          <svg class="w-6 h-6 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-zinc-200 p-6 hover:border-zinc-300 transition-colors">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-[color:var(--text-tertiary)]">{i18n.admin_totalRevenue()}</p>
          <p class="mt-2 text-3xl font-bold text-zinc-900">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>
        <div class="p-3 bg-zinc-100 rounded-xl">
          <svg class="w-6 h-6 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>
  </div>

  <!-- Recent Orders -->
  <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
    <div class="px-6 py-4 bg-gradient-to-r from-gray-50/50 to-transparent">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-[color:var(--text-primary)]">{i18n.admin_recentOrders()}</h2>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-gray-50/50 to-gray-100/50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{i18n.admin_orderId()}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{i18n.admin_buyer()}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{i18n.admin_seller()}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{i18n.admin_amount()}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{i18n.admin_status()}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{i18n.admin_date()}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#if recentOrders.length > 0}
            {#each recentOrders as order}
              <tr class="hover:bg-gray-50/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--text-primary)]">
                  #{order.id.slice(0, 8)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--text-primary)]">
                  {safeUsername(order.buyer) || 'Unknown'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--text-primary)]">
                  {safeUsername(order.seller) || 'Unknown'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-[color:var(--text-primary)]">
                  {formatCurrency(order.total_amount / 100)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class={`inline-flex px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${getStatusColor(order.status ?? 'pending')}`}>
                    {order.status ?? 'pending'}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.created_at ?? new Date().toISOString())}
                </td>
              </tr>
            {/each}
          {:else}
            <tr>
              <td colspan="6" class="px-6 py-8 text-center text-sm text-gray-500">
                {i18n.admin_noOrders()}
              </td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <a href="/admin/payouts" class="group bg-white rounded-2xl border border-zinc-200 p-6 hover:border-zinc-300 transition-colors flex items-center justify-center space-x-3">
      <div class="p-3 bg-zinc-100 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
        <svg class="w-6 h-6 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <span class="font-medium text-gray-700">{i18n.admin_managePayouts()}</span>
    </a>
    
    <a href="/" class="group bg-white rounded-2xl border border-zinc-200 p-6 hover:border-zinc-300 transition-colors flex items-center justify-center space-x-3">
      <div class="p-3 bg-zinc-100 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
        <svg class="w-6 h-6 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
      <span class="font-medium text-gray-700">{i18n.admin_viewMainSite()}</span>
    </a>
  </div>
</div>