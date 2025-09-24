<script lang="ts">
  import { Avatar, Button, LoadingSpinner } from '@repo/ui';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let searchQuery = $state(data.searchQuery || '');
  let selectedCategory = $state(data.category || '');
  let loading = $state(false);
  let verifiedOnly = $state(Boolean(page.url.searchParams.get('verified') === 'true'));

  function handleBrandClick(brand: { username?: string; id: string }) {
    goto(`/profile/${brand.username || brand.id}`);
  }

  // (no-op)

  async function handleSearch() {
    loading = true;
    const url = new URL(page.url);
    
    if (searchQuery.trim()) {
      url.searchParams.set('q', searchQuery.trim());
    } else {
      url.searchParams.delete('q');
    }
    
    if (selectedCategory) {
      url.searchParams.set('category', selectedCategory);
    } else {
      url.searchParams.delete('category');
    }
    
    if (verifiedOnly) {
      url.searchParams.set('verified', 'true');
    } else {
      url.searchParams.delete('verified');
    }

    // Reset to page 1 when searching
    url.searchParams.delete('page');
    
    await goto(url.pathname + url.search, { invalidateAll: true });
    loading = false;
  }

  function clearFilters() {
    searchQuery = '';
    selectedCategory = '';
    handleSearch();
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
  <title>Brand Showcase - Driplo</title>
  <meta name="description" content="Discover premium fashion brands and verified sellers on Driplo" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
    <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6">
      <div class="text-center mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Brand Showcase</h1>
        <p class="text-sm text-gray-500 mt-1">
          Discover {data.totalCount} verified fashion brands
        </p>
      </div>
      
      <!-- Search and Filters -->
      <div class="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto sticky top-0">
        <div class="flex-1">
          <input
            type="text"
            placeholder="Search brands..."
            bind:value={searchQuery}
            onkeydown={(e) => e.key === 'Enter' && handleSearch()}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div class="flex gap-2 items-center">
          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" bind:checked={verifiedOnly} onchange={handleSearch} />
            Verified only
          </label>

          <Button onclick={handleSearch} disabled={loading}>
            Search
          </Button>
          
          {#if searchQuery || selectedCategory}
            <Button variant="ghost" onclick={clearFilters}>
              Clear
            </Button>
          {/if}
        </div>
      </div>
      
      <!-- Active Filters -->
      {#if searchQuery || selectedCategory}
        <div class="flex justify-center items-center gap-2 mt-4">
          <span class="text-sm text-gray-500">Active filters:</span>
          {#if searchQuery}
            <span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              "{searchQuery}"
              <button onclick={() => { searchQuery = ''; handleSearch(); }} class="hover:bg-blue-200 rounded-full p-0.5" aria-label="Clear search query">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </span>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Featured Brands Hero -->
  {#if data.featuredBrands.length > 0 && !searchQuery && data.currentPage === 1}
    <div class="bg-gradient-to-br from-purple-50 to-pink-50 border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-8">
        <div class="text-center mb-6">
          <h2 class="text-lg font-semibold text-gray-900">Featured Brands</h2>
          <p class="text-sm text-gray-600 mt-1">Top performing brands on Driplo</p>
        </div>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {#each data.featuredBrands as brand}
            <button type="button" class="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left w-full" onclick={() => handleBrandClick(brand)} aria-label={`View ${brand.full_name || brand.username || 'brand'}`}>
              <div class="flex flex-col items-center text-center">
                <Avatar
                  src={brand.avatar_url ?? undefined}
                  alt={(brand.full_name || brand.username || 'Brand') + "'s avatar"}
                  fallback={(brand.full_name?.charAt(0) || brand.username?.charAt(0) || 'B') ?? 'B'}
                  size="lg"
                  class="mb-3 ring-2 ring-white shadow-sm"
                />
                
                <h3 class="font-medium text-gray-900 text-sm truncate w-full">
                  {brand.full_name || brand.username}
                </h3>
                
                {#if brand.verified}
                  <div class="flex items-center gap-1 mt-1">
                    <svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-xs text-blue-600">Verified</span>
                  </div>
                {/if}
                
                <div class="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>{brand.total_sales} sales</span>
                  {#if brand.rating > 0}
                    <span class="flex items-center gap-0.5">
                      <svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {brand.rating.toFixed(1)}
                    </span>
                  {/if}
                </div>
              </div>
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- Content -->
  <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6">
    {#if loading}
      <div class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    {:else if data.brands.length > 0}
      <!-- Brands Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {#each data.brands as brand}
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div class="p-6">
              <div class="flex items-start gap-4">
                <!-- Avatar -->
                <div class="flex-shrink-0">
                  <Avatar
                    src={brand.avatar_url ?? undefined}
                    alt={(brand.full_name || brand.username || 'Brand') + "'s avatar"}
                    fallback={(brand.full_name?.charAt(0) || brand.username?.charAt(0) || 'B') ?? 'B'}
                    size="lg"
                    class="ring-2 ring-white shadow-sm"
                  />
                </div>
                
                <!-- Brand Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="text-base font-semibold text-gray-900 truncate">
                      {brand.full_name || brand.username}
                    </h3>
                    {#if brand.verified}
                      <svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    {/if}
                  </div>
                  
                  {#if brand.username && brand.full_name}
                    <p class="text-sm text-gray-500 mb-2">@{brand.username}</p>
                  {/if}
                  
                  {#if brand.bio}
                    <p class="text-sm text-gray-600 mb-3 line-clamp-2">{brand.bio}</p>
                  {/if}
                  
                  <!-- Stats -->
                  <div class="grid grid-cols-2 gap-3 text-xs text-gray-500 mb-4">
                    <div class="flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                      </svg>
                      {brand.total_sales} sales
                    </div>
                    
                    {#if brand.average_rating > 0}
                      <div class="flex items-center gap-1">
                        <svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {brand.average_rating.toFixed(1)} ({brand.total_reviews})
                      </div>
                    {/if}
                    
                    <div class="flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {brand.followers_count} followers
                    </div>
                    
                    <div class="flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      {brand.products_count} items
                    </div>
                  </div>
                  
                  <!-- Action -->
                  <Button
                    size="sm"
                    variant="outline"
                    onclick={() => handleBrandClick(brand)}
                    class="w-full"
                  >
                    View Brand
                  </Button>
                </div>
              </div>
            </div>
          </div>
        {/each}
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
        Page {data.currentPage} of {data.totalPages} • {data.totalCount} brands
      </div>
      
    {:else}
      <!-- Empty State -->
      <div class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No brands found</h3>
        <p class="text-gray-500 mb-6">
          {searchQuery ? 
            'Try adjusting your search terms to find more brands.' : 
            'Verified fashion brands will appear here as they join Driplo.'}
        </p>
        
        {#if searchQuery}
          <Button onclick={clearFilters} variant="outline">
            Clear Search
          </Button>
        {:else}
          <Button onclick={() => goto('/search')} variant="outline">
            Browse All Products
          </Button>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>