<script lang="ts">
  import { ProductCard, LoadingSpinner, Button } from '@repo/ui';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import * as i18n from '@repo/i18n';
  import { favoritesActions, favoritesStore } from '$lib/stores/favorites.svelte';
  import { authPopupActions } from '$lib/stores/auth-popup.svelte';
  import type { PageData } from './$types';
  import type { Product } from '@repo/ui/types';
  import { mapProduct } from '$lib/types/domain';

  let { data }: { data: PageData } = $props();

  // Filter state
  let selectedCondition = $state(data.filters?.condition || '');
  let selectedCategory = $state(data.filters?.category || '');
  let loading = $state(false);

  // Transform server data to Product type using canonical mapper (no casts)
  const products = $derived.by<Product[]>(() => (data.products || []).map(mapProduct));

  function formatPrice(price: number): string {
    const formatted = price % 1 === 0 ? price.toString() : price.toFixed(2);
    return `£${formatted}`;
  }

  function handleProductClick(product: Product) {
    goto(`/product/${product.id}`);
  }

  async function handleFavorite(productId: string) {
    if (!data.user) {
      authPopupActions.showForFavorite();
      return;
    }
    await favoritesActions.toggleFavorite(productId);
  }

  function getFavoriteData(productId: string) {
    return {
      isFavorited: data.userFavorites[productId] || favoritesStore?.favorites?.[productId] || false,
      isLoading: favoritesStore.isLoading
    };
  }

  async function applyFilters() {
    loading = true;
    const url = new URL(page.url);
    
    // Update search params
    if (selectedCondition) {
      url.searchParams.set('condition', selectedCondition);
    } else {
      url.searchParams.delete('condition');
    }
    
    if (selectedCategory) {
      url.searchParams.set('category', selectedCategory);  
    } else {
      url.searchParams.delete('category');
    }
    
    // Reset to page 1 when filtering
    url.searchParams.delete('page');
    
    await goto(url.pathname + url.search, { invalidateAll: true });
    loading = false;
  }

  function clearFilters() {
    selectedCondition = '';
    selectedCategory = '';
    applyFilters();
  }

  function translateCondition(condition: string): string {
    const conditionMap: Record<string, string> = {
      'brand_new_with_tags': i18n.sell_condition_brandNewWithTags?.() || 'Brand new with tags',
      'new_without_tags': i18n.sell_condition_newWithoutTags?.() || 'New without tags', 
      'like_new': i18n.condition_likeNew?.() || 'Like new',
      'good': i18n.condition_good?.() || 'Good',
      'fair': i18n.condition_fair?.() || 'Fair'
    };
    return conditionMap[condition] || condition;
  }

  function translateCategory(categorySlug: string): string {
    const categoryMap: Record<string, string> = {
      'women': i18n.category_women?.() || 'Women',
      'men': i18n.category_men?.() || 'Men', 
      'kids': i18n.category_kids?.() || 'Kids'
    };
    return categoryMap[categorySlug] || categorySlug;
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
  <title>Premium Products - Driplo</title>
  <meta name="description" content="Discover premium fashion from verified pro sellers and brands on Driplo" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
    <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Premium Products</h1>
          <p class="text-sm text-gray-500 mt-1">
            {data.totalCount} premium items from verified sellers
          </p>
        </div>
        
        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-3 sm:items-center">
          <!-- Condition Filter -->
          <div class="min-w-[150px]">
            <label for="condition-select" class="block text-xs font-medium text-gray-700 mb-1">Condition</label>
            <select 
              id="condition-select"
              bind:value={selectedCondition}
              onchange={applyFilters}
              class="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--state-focus)] focus:border-zinc-500"
            >
              <option value="">All conditions</option>
              {#each data.filters?.availableConditions || [] as condition (condition)}
                <option value={condition}>{translateCondition(condition)}</option>
              {/each}
            </select>
          </div>
          
          <!-- Category Filter -->
          <div class="min-w-[150px]">
            <label for="category-select" class="block text-xs font-medium text-gray-700 mb-1">Category</label>
            <select 
              id="category-select"
              bind:value={selectedCategory}
              onchange={applyFilters}
              class="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--state-focus)] focus:border-zinc-500"
            >
              <option value="">All categories</option>
              {#each data.filters?.availableCategories || [] as category (category.slug)}
                <option value={category.slug}>{category.name}</option>
              {/each}
            </select>
          </div>
          
          {#if selectedCondition || selectedCategory}
            <Button
              variant="ghost"
              size="sm"
              onclick={clearFilters}
              class="text-gray-500 hover:text-gray-700"
            >
              Clear
            </Button>
          {/if}
        </div>
      </div>
      
      <!-- Active Filters -->
      {#if selectedCondition || selectedCategory}
        <div class="flex items-center gap-2 mt-4">
          <span class="text-sm text-gray-500">Active filters:</span>
          {#if selectedCondition}
            <span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-[var(--surface-brand-strong)]/10 text-[color-mix(in_oklch,var(--brand-primary-strong)_80%,black_20%)] rounded-full">
              {translateCondition(selectedCondition)}
              <button onclick={() => { selectedCondition = ''; applyFilters(); }} class="hover:bg-[var(--surface-brand-strong)]/20 rounded-full p-0.5" aria-label="Remove condition filter">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </span>
          {/if}
          {#if selectedCategory}
            <span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-zinc-100 text-zinc-800 rounded-full">
              {translateCategory(selectedCategory)}
              <button onclick={() => { selectedCategory = ''; applyFilters(); }} class="hover:bg-zinc-200 rounded-full p-0.5" aria-label="Remove category filter">
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

  <!-- Content -->
  <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6">
    <!-- Mobile Bottom Sheet Trigger -->
    <div class="sm:hidden mb-3">
      <button
        onclick={() => (document.getElementById('pro-filters-sheet') as HTMLDialogElement)?.showModal()}
        class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm active:scale-[0.99] transition"
        aria-label="Open premium filters"
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
    {:else if products.length > 0}
      <!-- Product Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {#each products as product (product.id)}
          <div class="relative">
            <!-- Pro Badge -->
            <div class="absolute top-2 right-2 z-10">
              <div class="bg-zinc-900 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                PRO
              </div>
            </div>
            
            <ProductCard
              {product}
              onclick={handleProductClick}
              onFavorite={handleFavorite}
              favorited={getFavoriteData(product.id).isFavorited}
              translations={{
                currency: '£',
                formatPrice
              }}
            />
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
        Page {data.currentPage} of {data.totalPages} • {data.totalCount} total items
      </div>
    {:else}
      <!-- Empty State -->
      <div class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No premium products found</h3>
        <p class="text-gray-500 mb-6">
          {selectedCondition || selectedCategory ? 
            'Try adjusting your filters to see more results.' : 
            'Premium products from verified sellers will appear here soon.'}
        </p>
        
        {#if selectedCondition || selectedCategory}
          <Button onclick={clearFilters} variant="outline">
            Clear Filters
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

<!-- Mobile Bottom Sheet (native dialog) -->
<dialog id="pro-filters-sheet" class="sm:hidden w-full max-w-none m-0 p-0 rounded-t-2xl backdrop:bg-black/40">
  <form method="dialog" class="w-full">
    <div class="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl p-4 flex items-center justify-between">
      <span class="text-sm font-semibold text-gray-800">Premium Filters</span>
      <button class="p-2 rounded-md hover:bg-gray-100" aria-label="Close" onclick={() => (document.getElementById('pro-filters-sheet') as HTMLDialogElement)?.close()}>
        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="p-4 space-y-4">
      <!-- Condition Filter -->
      <div>
        <label for="condition-select-mobile" class="block text-xs font-medium text-gray-700 mb-1">Condition</label>
        <select 
          id="condition-select-mobile"
          bind:value={selectedCondition}
          onchange={applyFilters}
          class="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--state-focus)] focus:border-zinc-500"
        >
          <option value="">All conditions</option>
          {#each data.filters?.availableConditions || [] as condition (condition)}
            <option value={condition}>{translateCondition(condition)}</option>
          {/each}
        </select>
      </div>

      <!-- Category Filter -->
      <div>
        <label for="category-select-mobile" class="block text-xs font-medium text-gray-700 mb-1">Category</label>
        <select 
          id="category-select-mobile"
          bind:value={selectedCategory}
          onchange={applyFilters}
          class="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--state-focus)] focus:border-zinc-500"
        >
          <option value="">All categories</option>
          {#each data.filters?.availableCategories || [] as category (category.slug)}
            <option value={category.slug}>{category.name}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="p-4">
      <button class="w-full px-4 py-3 rounded-xl bg-zinc-900 text-white text-sm font-semibold" onclick={() => (document.getElementById('pro-filters-sheet') as HTMLDialogElement)?.close()}>
        Done
      </button>
    </div>
  </form>
</dialog>