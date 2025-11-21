<script lang="ts">
  import { Button } from '@repo/ui';
  // No lifecycle imports needed - using $effect
  // import { page } from '$app/state'; // Currently unused
  import { createBrowserSupabaseClient } from '$lib/supabase/client';
  import type { PageData } from './$types';
  import * as i18n from '@repo/i18n';
  import { invalidateAll } from '$app/navigation';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  
  const supabase = createBrowserSupabaseClient();
  
  type TransactionUI = {
    id: string;
    order_id: string;
    seller_id: string;
    seller_earnings: number;
    commission_amount: number;
    currency: string;
    payout_status: string | null;
    payout_date: string | null;
    payout_reference: string | null;
    created_at: string | null;
    updated_at: string | null;
    orders: {
      id: string;
      status: string | null;
      delivered_at: string | null;
      product_id: string;
      product: { id: string; title: string; price: number; images: string[] } | null;
    } | null;
    seller: { id: string; username: string | null; full_name: string | null; avatar_url: string | null; email?: string | null } | null;
  };

  let transactions = $state<TransactionUI[]>(data.pendingPayouts as unknown as TransactionUI[]);
  let loading = $state(false);
  let processing = $state<string | null>(null);
  let activeTab = $state<'pending' | 'processing' | 'completed'>('pending');

  $effect(() => {
    if (!supabase) return;

    // Subscribe to real-time transaction updates
    const subscription = supabase
      .channel('transactions')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        async () => {
          // Revalidate the page data and then refresh local state
          await invalidateAll();
          await loadTransactions();
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      subscription.unsubscribe();
    };
  });

  async function loadTransactions() {
    if (!supabase) return;
    loading = true;
    try {
      const { data: transactionData, error } = await supabase
        .from('transactions')
        .select(`
          id,
          order_id,
          seller_id,
          seller_earnings,
          commission_amount,
          currency,
          payout_status,
          payout_date,
          payout_reference,
          created_at,
          updated_at
        `)
        .in('payout_status', ['pending', 'processing'])
        .order('created_at', { ascending: false });

      if (!error && transactionData) {
        // Raw transaction rows do not include joins; normalize to UI shape
        transactions = (transactionData as any[]).map((t: any) => ({
          ...t,
          orders: null,
          seller: null
        })) as TransactionUI[];
      }
    } catch {
      // Transaction loading failed - error state handled by component
    }
    loading = false;
  }

  async function updatePayoutStatus(transactionId: string, status: 'processing' | 'completed' | 'failed', reference?: string) {
    if (!supabase) return;
    processing = transactionId;
    
    try {
      const updateData: {
        payout_status: string;
        updated_at: string;
        payout_date?: string;
        payout_reference?: string;
      } = {
        payout_status: status,
        updated_at: new Date().toISOString()
      };

      if (status === 'completed' || status === 'processing') {
        updateData.payout_date = new Date().toISOString();
        if (reference) {
          updateData.payout_reference = reference;
        }
      }

      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transactionId);

      if (error) throw error;

      // Create notification for the seller
      const transaction = transactions.find(t => t.id === transactionId);
      if (transaction) {
        let notificationMessage = '';
        if (status === 'completed') {
          notificationMessage = `Your payout of €${transaction.seller_earnings} has been processed!`;
        } else if (status === 'processing') {
          notificationMessage = `Your payout of €${transaction.seller_earnings} is being processed.`;
        } else if (status === 'failed') {
          notificationMessage = `Your payout of €${transaction.seller_earnings} failed. Please contact support.`;
        }

        await supabase.from('notifications').insert({
          user_id: transaction.seller_id,
          type: 'payout_processed',
          title: `Payout ${status}`,
          message: notificationMessage,
          order_id: transaction.order_id
        });
      }

      await loadTransactions();
    } catch {
      // Payout update failed
      alert('Failed to update payout status');
    } finally {
      processing = null;
    }
  }

  const filteredTransactions = $derived.by(() => {
    return transactions.filter(t => t.payout_status === activeTab);
  });

  function formatDate(dateString: string | null) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getPayoutStatusColor(status: string | null) {
    switch (status) {
      case 'pending': return 'bg-yellow-100/70 text-yellow-700 backdrop-blur-sm';
      case 'processing': return 'bg-[var(--surface-brand-strong)]/10/70 text-[color-mix(in_oklch,var(--brand-primary-strong)_90%,black_10%)] backdrop-blur-sm';
      case 'completed': return 'bg-green-100/70 text-green-700 backdrop-blur-sm';
      case 'failed': return 'bg-red-100/70 text-red-700 backdrop-blur-sm';
      default: return 'bg-gray-100/70 text-gray-700 backdrop-blur-sm';
    }
  }

  // Type-safe access helpers
  const firstImage = (images: string[] | undefined | null): string => images?.[0] || '/placeholder.jpg';
  const safe = {
    sellerName: (s: { full_name: string | null; username: string | null } | null) =>
      (s?.full_name || s?.username || 'Seller'),
    avatar: (s: { avatar_url: string | null } | null) => s?.avatar_url || '/placeholder-avatar.svg',
    email: (s: { email?: string | null } | null) => s?.email || '',
  };
</script>

<svelte:head>
  <title>Payouts - Admin Dashboard</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">{i18n.admin_payoutManagement()}</h1>
      <p class="text-gray-600 text-sm mt-1">{i18n.admin_trackProcessPayouts()}</p>
    </div>
    <Button onclick={loadTransactions} variant="outline" disabled={loading}>
      {loading ? i18n.admin_loading() : i18n.admin_refresh()}
    </Button>
  </div>

  <!-- Payout Statistics -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div class="bg-white p-6 rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-colors">
      <div class="text-sm font-medium text-gray-600">{i18n.admin_pendingPayouts()}</div>
      <div class="text-2xl font-bold text-zinc-900">{transactions.filter(t => t.payout_status === 'pending').length}</div>
    </div>
    <div class="bg-white p-6 rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-colors">
      <div class="text-sm font-medium text-gray-600">{i18n.admin_processing()}</div>
      <div class="text-2xl font-bold text-zinc-900">{transactions.filter(t => t.payout_status === 'processing').length}</div>
    </div>
    <div class="bg-white p-6 rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-colors">
      <div class="text-sm font-medium text-gray-600">Total Pending Amount</div>
      <div class="text-2xl font-bold text-zinc-900">
        €{transactions.filter(t => t.payout_status === 'pending').reduce((sum, t) => sum + Number(t.seller_earnings), 0).toFixed(2)}
      </div>
    </div>
    <div class="bg-white p-6 rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-colors">
      <div class="text-sm font-medium text-gray-600">Platform Commission</div>
      <div class="text-2xl font-bold text-zinc-900">
        €{transactions.filter(t => t.payout_status === 'pending').reduce((sum, t) => sum + Number(t.commission_amount), 0).toFixed(2)}
      </div>
    </div>
  </div>

  <!-- Tabs -->
  <div class="bg-white rounded-2xl border border-zinc-200 p-2 mb-6">
    <nav class="flex space-x-2">
      <button
        onclick={() => activeTab = 'pending'}
        class="px-6 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-colors
          {activeTab === 'pending' 
            ? 'bg-zinc-900 text-white shadow-sm' 
            : 'text-gray-600 hover:bg-gray-100/50'}"
      >
        Pending ({transactions.filter(t => t.payout_status === 'pending').length})
      </button>
      <button
        onclick={() => activeTab = 'processing'}
        class="px-6 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-colors
          {activeTab === 'processing' 
            ? 'bg-zinc-900 text-white shadow-sm' 
            : 'text-gray-600 hover:bg-gray-100/50'}"
      >
        Processing ({transactions.filter(t => t.payout_status === 'processing').length})
      </button>
    </nav>
  </div>

  <!-- Transactions List -->
  {#if loading}
    <div class="bg-white rounded-2xl border border-zinc-200 p-8 text-center">
      <div class="text-gray-500">Loading transactions...</div>
    </div>
  {:else if filteredTransactions.length === 0}
    <div class="bg-white rounded-2xl border border-zinc-200 p-8 text-center">
      <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <p class="text-gray-600">No {activeTab} payouts</p>
      <p class="text-sm text-gray-500 mt-1">Payouts will appear here when ready for processing</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each filteredTransactions as transaction (transaction.id)}
        <div class="bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:border-zinc-300 transition-colors">
          <div class="p-6">
            <div class="flex items-start justify-between">
              <!-- Seller & Product Info -->
              <div class="flex items-start space-x-4 flex-1">
                <img
                  src={safe.avatar(transaction.seller as any)}
                  alt={safe.sellerName(transaction.seller as any)}
                  class="w-12 h-12 rounded-full object-cover"
                />
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <h3 class="font-medium text-gray-900">
                      {safe.sellerName(transaction.seller as any)}
                    </h3>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getPayoutStatusColor(transaction.payout_status)}">
                      {transaction.payout_status || 'unknown'}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mb-1">{safe.email(transaction.seller as any)}</p>
                  
                  <!-- Product Info -->
                  <div class="flex items-center space-x-3 mt-3">
                    {#if transaction.orders?.product}
                      <img
                        src={firstImage((transaction.orders.product as any)?.images)}
                        alt={(transaction.orders.product as any)?.title || ''}
                        class="w-8 h-8 rounded object-cover"
                      />
                    {:else}
                      <img src="/placeholder.jpg" alt="" class="w-8 h-8 rounded object-cover" />
                    {/if}
                    <div>
                      <p class="text-sm font-medium text-gray-900">{(transaction.orders?.product as any)?.title || 'Product'}</p>
                      <div class="flex items-center space-x-2">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {transaction.orders?.status || 'delivered'}
                        </span>
                        <span class="text-xs text-gray-500">Order #{transaction.order_id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Amount & Actions -->
              <div class="text-right ml-4">
                <div class="mb-3">
                  <p class="text-lg font-bold text-gray-900">€{Number(transaction.seller_earnings).toFixed(2)}</p>
                  <p class="text-sm text-gray-500">Commission: €{Number(transaction.commission_amount).toFixed(2)}</p>
                  <p class="text-xs text-gray-500 mt-1">
                    {transaction.orders?.status === 'delivered'
                      ? `Delivered ${formatDate(transaction.orders?.delivered_at || null)}`
                      : `Created ${formatDate(transaction.created_at || null)}`}
                  </p>
                </div>

                <!-- Action Buttons -->
                <div class="space-y-2">
                  {#if transaction.payout_status === 'pending'}
                    <Button 
                      onclick={() => updatePayoutStatus(transaction.id, 'processing')}
                      disabled={processing === transaction.id}
                      size="sm"
                    >
                      {processing === transaction.id ? 'Processing...' : 'Start Processing'}
                    </Button>
                  {:else if transaction.payout_status === 'processing'}
                    <Button 
                      onclick={() => updatePayoutStatus(transaction.id, 'completed', 'MANUAL_PAYOUT_' + Date.now())}
                      disabled={processing === transaction.id}
                      size="sm"
                      variant="outline"
                    >
                      {processing === transaction.id ? 'Processing...' : 'Mark Completed'}
                    </Button>
                    <Button 
                      onclick={() => updatePayoutStatus(transaction.id, 'failed')}
                      disabled={processing === transaction.id}
                      size="sm"
                      variant="outline"
                    >
                      Mark Failed
                    </Button>
                  {/if}
                  
                  {#if transaction.payout_reference}
                    <p class="text-xs text-gray-500">
                      Ref: {transaction.payout_reference}
                    </p>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>