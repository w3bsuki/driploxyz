<script lang="ts">
  import { Button, Input } from '@repo/ui';
  import { onMount } from 'svelte';
  import { PayoutService } from '$lib/services/payouts.js';
  import { TransactionService } from '$lib/services/transactions.js';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let earnings = $state({
    totalEarnings: 0,
    pendingPayout: 0,
    totalPaidOut: 0,
    lastPayoutAt: null
  });

  let transactions = $state([]);
  let payouts = $state([]);
  let loading = $state(true);
  let showPayoutModal = $state(false);
  let payoutAmount = $state('');
  let requesting = $state(false);

  const payoutService = new PayoutService(data.supabase);
  const transactionService = new TransactionService(data.supabase);

  onMount(async () => {
    await Promise.all([
      loadEarnings(),
      loadTransactions(),
      loadPayouts()
    ]);
    loading = false;
  });

  async function loadEarnings() {
    const earningsData = await payoutService.getSellerEarnings(data.user.id);
    earnings = earningsData;
  }

  async function loadTransactions() {
    const { data: transactionData, error } = await transactionService.getSellerTransactions(data.user.id, 20);
    if (!error && transactionData) {
      transactions = transactionData;
    }
  }

  async function loadPayouts() {
    const { data: payoutData, error } = await payoutService.getSellerPayouts(data.user.id);
    if (!error && payoutData) {
      payouts = payoutData;
    }
  }

  async function requestPayout() {
    if (!data.profile?.payout_method) {
      alert('Please set up your payout method in profile settings first');
      return;
    }

    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount < 20) {
      alert('Minimum payout amount is 20 BGN');
      return;
    }

    if (amount > earnings.pendingPayout) {
      alert('Insufficient pending payout amount');
      return;
    }

    requesting = true;
    try {
      const { error } = await payoutService.requestPayout(
        data.user.id,
        amount,
        data.profile.payout_method
      );

      if (error) {
        alert('Failed to request payout: ' + error.message);
      } else {
        alert('Payout requested successfully! We will process it within 2-3 business days.');
        showPayoutModal = false;
        payoutAmount = '';
        await Promise.all([loadEarnings(), loadPayouts()]);
      }
    } catch (error) {
      alert('Failed to request payout');
    } finally {
      requesting = false;
    }
  }

  function formatPayoutMethod(method: any) {
    if (!method) return 'Not set';
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
  <title>Earnings - Dashboard</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-8">
  <div>
    <h1 class="text-3xl font-bold text-gray-900">Your Earnings</h1>
    <p class="text-gray-600">Track your sales, earnings, and manage payouts</p>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="text-gray-500">Loading earnings...</div>
    </div>
  {:else}
    <!-- Earnings Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-lg shadow-sm border">
        <div class="text-sm font-medium text-gray-600">Total Earnings</div>
        <div class="text-2xl font-bold text-gray-900">{earnings.totalEarnings.toFixed(2)} BGN</div>
        <div class="text-xs text-gray-500 mt-1">After 5% platform fee</div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-sm border">
        <div class="text-sm font-medium text-gray-600">Available for Payout</div>
        <div class="text-2xl font-bold text-green-600">{earnings.pendingPayout.toFixed(2)} BGN</div>
        <div class="text-xs text-gray-500 mt-1">Minimum 20 BGN</div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-sm border">
        <div class="text-sm font-medium text-gray-600">Total Paid Out</div>
        <div class="text-2xl font-bold text-blue-600">{earnings.totalPaidOut.toFixed(2)} BGN</div>
        <div class="text-xs text-gray-500 mt-1">Processed payouts</div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-sm border">
        <div class="text-sm font-medium text-gray-600">Last Payout</div>
        <div class="text-lg font-medium text-gray-900">
          {earnings.lastPayoutAt ? new Date(earnings.lastPayoutAt).toLocaleDateString() : 'Never'}
        </div>
        <div class="text-xs text-gray-500 mt-1">Most recent</div>
      </div>
    </div>

    <!-- Payout Request -->
    <div class="bg-white p-6 rounded-lg shadow-sm border">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-medium text-gray-900">Request Payout</h2>
        <Button 
          onclick={() => showPayoutModal = true}
          disabled={earnings.pendingPayout < 20}
        >
          Request Payout
        </Button>
      </div>
      
      <div class="text-sm text-gray-600">
        <p>• Minimum payout amount: 20 BGN</p>
        <p>• Processing time: 2-3 business days</p>
        <p>• Payout method: {formatPayoutMethod(data.profile?.payout_method)}</p>
        {#if !data.profile?.payout_method}
          <p class="text-red-600 mt-2">⚠️ Please set up your payout method in <a href="/profile/edit" class="underline">profile settings</a> first</p>
        {/if}
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="bg-white rounded-lg shadow-sm border">
      <div class="px-6 py-4 border-b">
        <h2 class="text-lg font-medium text-gray-900">Recent Sales</h2>
      </div>
      
      {#if transactions.length === 0}
        <div class="p-6 text-center text-gray-500">No sales yet</div>
      {:else}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Earnings</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each transactions as transaction}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{transaction.products?.title}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{transaction.profiles?.username}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{transaction.product_price} BGN</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-green-600">{transaction.seller_amount} BGN</div>
                    <div class="text-xs text-gray-500">-{transaction.commission_amount} BGN commission</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(transaction.payment_status)}">
                      {transaction.payment_status}
                    </span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>

    <!-- Payout History -->
    <div class="bg-white rounded-lg shadow-sm border">
      <div class="px-6 py-4 border-b">
        <h2 class="text-lg font-medium text-gray-900">Payout History</h2>
      </div>
      
      {#if payouts.length === 0}
        <div class="p-6 text-center text-gray-500">No payouts yet</div>
      {:else}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processed</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each payouts as payout}
                <tr>
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
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payout.completed_at ? new Date(payout.completed_at).toLocaleDateString() : '-'}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- Payout Request Modal -->
{#if showPayoutModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Request Payout</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Amount (BGN)</label>
          <Input
            bind:value={payoutAmount}
            type="number"
            min="20"
            max={earnings.pendingPayout}
            step="0.01"
            placeholder="Minimum 20 BGN"
          />
          <div class="text-xs text-gray-500 mt-1">
            Available: {earnings.pendingPayout.toFixed(2)} BGN
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Payout Method</label>
          <div class="text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">
            {formatPayoutMethod(data.profile?.payout_method)}
          </div>
        </div>
      </div>
      
      <div class="flex space-x-3 mt-6">
        <Button
          onclick={() => showPayoutModal = false}
          variant="outline"
          class="flex-1"
          disabled={requesting}
        >
          Cancel
        </Button>
        <Button
          onclick={requestPayout}
          class="flex-1"
          disabled={requesting || !payoutAmount}
        >
          {requesting ? 'Requesting...' : 'Request Payout'}
        </Button>
      </div>
    </div>
  </div>
{/if}