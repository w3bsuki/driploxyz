<script lang="ts">
  import { Button } from '@repo/ui';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let stats = $state({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingPayouts: 0,
    thisWeekUsers: 0,
    thisWeekProducts: 0,
    thisWeekOrders: 0
  });

  let recentActivity = $state([]);
  let loading = $state(true);

  onMount(async () => {
    await Promise.all([
      loadStats(),
      loadRecentActivity()
    ]);
    loading = false;
  });

  async function loadStats() {
    try {
      // Get total users
      const { count: totalUsers } = await data.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total products
      const { count: totalProducts } = await data.supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get total orders
      const { count: totalOrders } = await data.supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Get total revenue (platform commission)
      const { data: transactions } = await data.supabase
        .from('transactions')
        .select('commission_amount')
        .eq('payment_status', 'completed');

      const totalRevenue = transactions?.reduce((sum, t) => sum + t.commission_amount, 0) || 0;

      // Get pending payouts
      const { count: pendingPayouts } = await data.supabase
        .from('payouts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get this week's data
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { count: thisWeekUsers } = await data.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      const { count: thisWeekProducts } = await data.supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      const { count: thisWeekOrders } = await data.supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      stats = {
        totalUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
        pendingPayouts: pendingPayouts || 0,
        thisWeekUsers: thisWeekUsers || 0,
        thisWeekProducts: thisWeekProducts || 0,
        thisWeekOrders: thisWeekOrders || 0
      };
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  async function loadRecentActivity() {
    try {
      // Get recent orders
      const { data: orders } = await data.supabase
        .from('orders')
        .select(`
          id, total_amount, status, created_at,
          profiles!buyer_id(username),
          products(title)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get recent payouts
      const { data: payouts } = await data.supabase
        .from('payouts')
        .select(`
          id, amount, status, requested_at,
          profiles!seller_id(username)
        `)
        .order('requested_at', { ascending: false })
        .limit(5);

      const activity = [
        ...(orders?.map(order => ({
          type: 'order',
          id: order.id,
          description: `Order for "${order.products?.title}" by ${order.profiles?.username}`,
          amount: order.total_amount,
          status: order.status,
          timestamp: order.created_at
        })) || []),
        ...(payouts?.map(payout => ({
          type: 'payout',
          id: payout.id,
          description: `Payout request from ${payout.profiles?.username}`,
          amount: payout.amount,
          status: payout.status,
          timestamp: payout.requested_at
        })) || [])
      ];

      // Sort by timestamp and take the 15 most recent
      recentActivity = activity
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 15);

    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  }

  function getActivityIcon(type: string) {
    switch (type) {
      case 'order': return '🛒';
      case 'payout': return '💳';
      default: return '📋';
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'paid': case 'completed': return 'text-green-600';
      case 'cancelled': case 'failed': return 'text-red-600';
      case 'processing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  }
</script>

<svelte:head>
  <title>Admin Dashboard - Driplo</title>
</svelte:head>

<div class="space-y-8">
  <!-- Header -->
  <div>
    <h1 class="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
    <p class="text-gray-600">Monitor your marketplace performance and manage operations</p>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="text-gray-500">Loading dashboard...</div>
    </div>
  {:else}
    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-lg shadow-xs border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Users</p>
            <p class="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
          <div class="text-3xl">👥</div>
        </div>
        <div class="mt-2 text-sm text-green-600">+{stats.thisWeekUsers} this week</div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-xs border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Products</p>
            <p class="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
          </div>
          <div class="text-3xl">📦</div>
        </div>
        <div class="mt-2 text-sm text-green-600">+{stats.thisWeekProducts} this week</div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-xs border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Orders</p>
            <p class="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
          <div class="text-3xl">🛒</div>
        </div>
        <div class="mt-2 text-sm text-green-600">+{stats.thisWeekOrders} this week</div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-xs border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Commission Revenue</p>
            <p class="text-2xl font-bold text-gray-900">{stats.totalRevenue.toFixed(2)} BGN</p>
          </div>
          <div class="text-3xl">💰</div>
        </div>
        <div class="mt-2 text-sm text-gray-600">5% commission rate</div>
      </div>
    </div>

    <!-- Action Items -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Pending Payouts Alert -->
      <div class="bg-white p-6 rounded-lg shadow-xs border">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Pending Payouts</h3>
          <span class="text-2xl">⚠️</span>
        </div>
        
        {#if stats.pendingPayouts > 0}
          <div class="space-y-2">
            <p class="text-2xl font-bold text-orange-600">{stats.pendingPayouts}</p>
            <p class="text-sm text-gray-600">Payout requests awaiting processing</p>
            <Button href="/admin/payouts" size="sm" class="w-full">
              Process Payouts
            </Button>
          </div>
        {:else}
          <div class="space-y-2">
            <p class="text-2xl font-bold text-green-600">0</p>
            <p class="text-sm text-gray-600">All payouts processed!</p>
            <Button href="/admin/payouts" variant="outline" size="sm" class="w-full">
              View Payouts
            </Button>
          </div>
        {/if}
      </div>

      <!-- Quick Actions -->
      <div class="bg-white p-6 rounded-lg shadow-xs border">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div class="space-y-3">
          <Button href="/admin/payouts" variant="outline" size="sm" class="w-full">
            💳 Manage Payouts
          </Button>
          <Button href="/admin/transactions" variant="outline" size="sm" class="w-full">
            📈 View Transactions
          </Button>
          <Button href="/admin/users" variant="outline" size="sm" class="w-full">
            👥 Manage Users
          </Button>
          <Button href="/admin/notifications" variant="outline" size="sm" class="w-full">
            🔔 View Notifications
          </Button>
        </div>
      </div>

      <!-- Platform Health -->
      <div class="bg-white p-6 rounded-lg shadow-xs border">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Platform Health</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">System Status</span>
            <span class="text-green-600 font-medium">🟢 Online</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Payment System</span>
            <span class="text-green-600 font-medium">🟢 Active</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Database</span>
            <span class="text-green-600 font-medium">🟢 Connected</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Storage</span>
            <span class="text-green-600 font-medium">🟢 Available</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-lg shadow-xs border">
      <div class="px-6 py-4 border-b">
        <h3 class="text-lg font-medium text-gray-900">Recent Activity</h3>
      </div>
      
      <div class="p-6">
        {#if recentActivity.length === 0}
          <p class="text-center text-gray-500 py-8">No recent activity</p>
        {:else}
          <div class="space-y-4">
            {#each recentActivity as activity}
              <div class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <span class="text-lg">{getActivityIcon(activity.type)}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">{activity.description}</p>
                  <div class="flex items-center space-x-4 mt-1">
                    <span class="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                    <span class="text-sm font-medium {getStatusColor(activity.status)}">
                      {activity.status}
                    </span>
                    <span class="text-sm font-medium text-gray-900">
                      {activity.amount} BGN
                    </span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>