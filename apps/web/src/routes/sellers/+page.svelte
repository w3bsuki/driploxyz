<script lang="ts">
  import { Avatar, Button, LoadingSpinner } from '@repo/ui';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let selectedSort = $state(data.sortBy || 'sales');
  let searchQuery = $state(data.searchQuery || '');
  let loading = $state(false);

  function handleSortChange(sortKey: string) {
    selectedSort = sortKey;
    applySorting();
  }

  async function applySorting() {
    loading = true;
    const url = new URL(page.url);
    url.searchParams.set('sort', selectedSort);
    if (searchQuery.trim()) {
      url.searchParams.set('q', searchQuery.trim());
    } else {
      url.searchParams.delete('q');
    }
    url.searchParams.delete('page'); // Reset to page 1 when sorting
    await goto(url.pathname + url.search, { invalidateAll: true });
    loading = false;
  }

  function handleSellerClick(seller: { username?: string; id: string }) {
    goto(`/profile/${seller.username || seller.id}`);
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  }

  function getBadgeColor(badge: 'brand' | 'pro' | 'verified' | 'free'): string {
    const colors: Record<'brand' | 'pro' | 'verified' | 'free', string> = {
      brand: 'bg-purple-100 text-purple-800',
      pro: 'bg-blue-100 text-blue-800', 
      verified: 'bg-green-100 text-green-800',
      free: 'bg-gray-100 text-gray-600'
    };
    return colors[badge] || colors.free;
  }

  function getBadgeText(badge: 'brand' | 'pro' | 'verified' | 'free'): string {
    const labels: Record<'brand' | 'pro' | 'verified' | 'free', string> = {
      brand: 'Brand',
      pro: 'Pro',
      verified: 'Verified', 
      free: 'Member'
    };
    return labels[badge] || labels.free;
  }

  function coerceBadge(badge: string): 'brand' | 'pro' | 'verified' | 'free' {
    if (badge === 'brand' || badge === 'pro' || badge === 'verified' || badge === 'free') return badge;
    return 'free';
  }

  function getRankingIcon(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈'; 
    if (rank === 3) return '🥉';
    return '';
  }

  async function loadMore() {
    if (data.hasMore && !loading) {
      loading = true;
      const url = new URL(page.url);
      url.searchParams.set('page', String(data.currentPage + 1));
      await goto(url.pathname + url.search, { invalidateAll: true });
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Seller Leaderboard - Driplo</title>
  <meta name="description" content="Discover top sellers and rising stars on Driplo's seller leaderboard" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white border-b border-gray-200">
    <div class="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Seller Leaderboard</h1>
          <p class="text-sm text-gray-500 mt-1">
            {data.totalCount} active sellers • Ranked by {data.availableSorts.find(s => s.key === data.sortBy)?.label.toLowerCase()}
          </p>
        </div>
        
        <!-- Search + Sort -->
        <div class="sticky top-0 sm:static z-40 flex flex-col sm:flex-row gap-2 w-full sm:w-auto bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 p-2 sm:p-0 rounded-lg">
          <div class="flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search sellers..."
              bind:value={searchQuery}
              onkeydown={(e) => e.key === 'Enter' && applySorting()}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div class="flex flex-wrap gap-2">
            {#each data.availableSorts as sort}
              <button
                onclick={() => handleSortChange(sort.key)}
                class="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors {
                  selectedSort === sort.key 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }"
                disabled={loading}
              >
                <span>{sort.icon}</span>
                <span>{sort.label}</span>
              </button>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-6">
    <!-- Mobile Bottom Sheet Trigger -->
    <div class="sm:hidden mb-3">
      <button
        onclick={() => (document.getElementById('seller-filters-sheet') as HTMLDialogElement)?.showModal()}
        class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm active:scale-[0.99] transition"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18M6 8h12M9 12h6M6 16h12M3 20h18" />
        </svg>
        Filters
      </button>
    </div>
    {#if loading}
      <div class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    {:else if data.sellers.length > 0}
      <!-- Leaderboard -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="divide-y divide-gray-100">
          {#each data.sellers as seller}
            <div class="p-4 hover:bg-gray-50 transition-colors">
              <div class="flex items-center gap-4">
                <!-- Rank -->
                <div class="flex-shrink-0 w-12 text-center">
                  <div class="text-lg font-bold text-gray-600">
                    {getRankingIcon(seller.rank) || seller.rank}
                  </div>
                </div>
                
                <!-- Avatar -->
                <div class="flex-shrink-0">
                  <Avatar
                    src={seller.avatar_url ?? undefined}
                    alt={(seller.full_name || seller.username || 'Seller') + "'s avatar"}
                    fallback={(seller.full_name?.charAt(0) || seller.username?.charAt(0) || 'S') ?? 'S'}
                    size="md"
                    class="ring-2 ring-white shadow-sm"
                  />
                </div>
                
                <!-- Seller Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="text-base font-semibold text-gray-900 truncate">
                      {seller.full_name || seller.username}
                    </h3>
                    {#if seller.username && seller.full_name}
                      <span class="text-sm text-gray-500">@{seller.username}</span>
                    {/if}
                    
                    <!-- Badge -->
                    <span class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full {getBadgeColor(coerceBadge(seller.badge))}">
                      {getBadgeText(coerceBadge(seller.badge))}
                    </span>
                    
                    {#if seller.verified}
                      <svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    {/if}
                  </div>
                  
                  {#if seller.bio}
                    <p class="text-sm text-gray-600 mb-2 line-clamp-1">{seller.bio}</p>
                  {/if}
                  
                  <!-- Stats -->
                  <div class="flex items-center gap-4 text-xs text-gray-500">
                    {#if seller.total_sales > 0}
                      <span class="flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                        </svg>
                        {seller.total_sales} sales
                      </span>
                    {/if}
                    
                    {#if seller.average_rating > 0}
                      <span class="flex items-center gap-1">
                        <svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {seller.average_rating.toFixed(1)} ({seller.total_reviews})
                      </span>
                    {/if}
                    
                    {#if seller.followers_count > 0}
                      <span class="flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {seller.followers_count} followers
                      </span>
                    {/if}
                    
                    {#if seller.products_count > 0}
                      <span class="flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {seller.products_count} items
                      </span>
                    {/if}
                    
                    <span class="text-gray-400">•</span>
                    <span>Joined {formatDate(String(seller.created_at))}</span>
                  </div>
                </div>
                
                <!-- Action -->
                <div class="flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onclick={() => handleSellerClick(seller)}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
      
      <!-- Load More / Pagination -->
      {#if data.hasMore}
        <div class="text-center mt-8">
          <Button
            onclick={loadMore}
            disabled={loading}
            class="px-8 py-2"
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      {/if}
      
      <!-- Pagination Info -->
      <div class="text-center mt-6 text-sm text-gray-500">
        Page {data.currentPage} of {data.totalPages} • {data.totalCount} sellers
      </div>
      
    {:else}
      <!-- Empty State -->
      <div class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No sellers found</h3>
        <p class="text-gray-500 mb-6">
          Active sellers will appear in the leaderboard as they join and start selling.
        </p>
        
        <Button onclick={() => goto('/')} variant="outline">
          Back to Home
        </Button>
      </div>
    {/if}
  </div>
</div>

<!-- Mobile Bottom Sheet (native dialog) -->
<dialog id="seller-filters-sheet" class="sm:hidden w-full max-w-none m-0 p-0 rounded-t-2xl backdrop:bg-black/40">
  <form method="dialog" class="w-full">
    <div class="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl p-4 flex items-center justify-between">
      <span class="text-sm font-semibold text-gray-800">Seller Filters</span>
      <button class="p-2 rounded-md hover:bg-gray-100" aria-label="Close" onclick={() => (document.getElementById('seller-filters-sheet') as HTMLDialogElement)?.close()}>
        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="p-4 space-y-4">
      <!-- Account type filter -->
      <fieldset class="space-y-2">
        <legend class="text-xs font-semibold text-gray-500 uppercase">Account Type</legend>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" class="px-3 py-2 rounded-lg border border-gray-200 text-sm" onclick={() => { const u = new URL(page.url); u.searchParams.delete('type'); goto(u.pathname + u.search, { invalidateAll: true }); }}>
            All
          </button>
          <button type="button" class="px-3 py-2 rounded-lg border border-gray-200 text-sm" onclick={() => { const u = new URL(page.url); u.searchParams.set('type', 'personal'); goto(u.pathname + u.search, { invalidateAll: true }); }}>
            Personal
          </button>
          <button type="button" class="px-3 py-2 rounded-lg border border-gray-200 text-sm" onclick={() => { const u = new URL(page.url); u.searchParams.set('type', 'pro'); goto(u.pathname + u.search, { invalidateAll: true }); }}>
            Pro
          </button>
          <button type="button" class="px-3 py-2 rounded-lg border border-gray-200 text-sm" onclick={() => { const u = new URL(page.url); u.searchParams.set('type', 'brand'); goto(u.pathname + u.search, { invalidateAll: true }); }}>
            Brand
          </button>
        </div>
      </fieldset>

      <!-- Verified toggle -->
      <div class="flex items-center justify-between">
        <label for="verified-checkbox" class="text-sm text-gray-700">Verified only</label>
        <input id="verified-checkbox" type="checkbox" checked={Boolean(page.url.searchParams.get('verified') === 'true')} onchange={(e) => { const u = new URL(page.url); const c = (e.target as HTMLInputElement).checked; if (c) u.searchParams.set('verified', 'true'); else u.searchParams.delete('verified'); goto(u.pathname + u.search, { invalidateAll: true }); }} />
      </div>
    </div>

    <div class="p-4">
      <button class="w-full px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold" onclick={() => (document.getElementById('seller-filters-sheet') as HTMLDialogElement)?.close()}>
        Done
      </button>
    </div>
  </form>
</dialog>

<style>
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 1;
  }
</style>