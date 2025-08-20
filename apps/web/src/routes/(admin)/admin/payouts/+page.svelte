<script lang="ts">
  import { Button } from '@repo/ui';
  import { onMount } from 'svelte';
  import { PayoutService } from '$lib/services/payouts.js';
  import { NotificationService } from '$lib/services/notifications.js';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  
  let payouts = $state([]);
  let loading = $state(true);
  let processing = $state<string | null>(null);
  
  const payoutService = new PayoutService(data.supabase);
  const notificationService = new NotificationService(data.supabase);

  onMount(async () => {
    await loadPayouts();
    
    // Subscribe to real-time payout updates
    const subscription = data.supabase
      .channel('payouts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'payouts' }, 
        () => { loadPayouts(); }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  });

  async function loadPayouts() {
    loading = true;
    const { data: payoutData, error } = await payoutService.getPendingPayouts();
    if (!error && payoutData) {
      payouts = payoutData;
    }
    loading = false;
  }

  async function updatePayoutStatus(payoutId: string, status: 'processing' | 'completed' | 'failed', notes?: string) {
    processing = payoutId;
    
    try {
      await payoutService.updatePayoutStatus(payoutId, status, data.user.id, notes);
      await loadPayouts();
      
      // Create notification for status change
      const payout = payouts.find(p => p.id === payoutId);
      if (payout) {
        await notificationService.createNotification(
          `Payout ${status}`,
          `Payout of ${payout.amount} BGN has been ${status}`,
          'payout_update',
          status === 'failed' ? 'high' : 'medium',
          payoutId,
          'payouts'
        );
      }
    } catch (error) {
      console.error('Error updating payout:', error);
      alert('Failed to update payout status');
    } finally {
      processing = null;
    }
  }

  function formatPayoutMethod(method: any) {
    if (!method) return 'N/A';
    const { type, details, name } = method;
    const displayName = name ? ` (${name})` : '';
    return `${type.toUpperCase()}: ${details}${displayName}`;
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<svelte:head>
  <title>Payouts - Admin Dashboard</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-900">Payout Management</h1>
    <Button onclick={loadPayouts} variant="outline" disabled={loading}>
      {loading ? 'Loading...' : 'Refresh'}
    </Button>
  </div>

  <!-- Payout Statistics -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div class="bg-white p-6 rounded-lg shadow-xs border">
      <div class="text-sm font-medium text-gray-600">Pending Payouts</div>
      <div class="text-2xl font-bold text-yellow-600">{payouts.filter(p => p.status === 'pending').length}</div>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-xs border">
      <div class="text-sm font-medium text-gray-600">Processing</div>
      <div class="text-2xl font-bold text-blue-600">{payouts.filter(p => p.status === 'processing').length}</div>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-xs border">
      <div class="text-sm font-medium text-gray-600">Total Amount</div>
      <div class="text-2xl font-bold text-gray-900">
        {payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0).toFixed(2)} BGN
      </div>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-xs border">
      <div class="text-sm font-medium text-gray-600">Avg. Payout</div>
      <div class="text-2xl font-bold text-gray-900">
        {payouts.length > 0 ? (payouts.reduce((sum, p) => sum + p.amount, 0) / payouts.length).toFixed(2) : '0'} BGN
      </div>
    </div>
  </div>

  <!-- Payouts Table -->
  <div class="bg-white rounded-lg shadow-xs border overflow-hidden">
    <div class="px-6 py-4 border-b">
      <h2 class="text-lg font-medium text-gray-900">Pending Payouts</h2>
    </div>
    
    {#if loading}
      <div class="p-6 text-center text-gray-500">Loading payouts...</div>
    {:else if payouts.length === 0}
      <div class="p-6 text-center text-gray-500">No pending payouts</div>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout Method</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each payouts as payout}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {payout.profiles?.full_name || payout.profiles?.username}
                  </div>
                  <div class="text-sm text-gray-500">{payout.profiles?.email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{payout.amount} BGN</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{formatPayoutMethod(payout.payout_method)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(payout.status)}">
                    {payout.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(payout.requested_at).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {#if payout.status === 'pending'}
                    <Button 
                      onclick={() => updatePayoutStatus(payout.id, 'processing')}
                      disabled={processing === payout.id}
                      size="sm"
                    >
                      {processing === payout.id ? 'Processing...' : 'Start Processing'}
                    </Button>
                  {:else if payout.status === 'processing'}
                    <Button 
                      onclick={() => updatePayoutStatus(payout.id, 'completed')}
                      disabled={processing === payout.id}
                      size="sm"
                      variant="outline"
                    >
                      Mark Completed
                    </Button>
                    <Button 
                      onclick={() => updatePayoutStatus(payout.id, 'failed', 'Failed to process')}
                      disabled={processing === payout.id}
                      size="sm"
                      variant="outline"
                    >
                      Mark Failed
                    </Button>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>