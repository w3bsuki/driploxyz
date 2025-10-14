<script lang="ts">
  import { ProductCard, Button, Banner } from '@repo/ui';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { getProductUrl } from '$lib/utils/seo-urls';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  import { mapProduct, type ProductUI } from '$lib/types/domain';

  // Normalize favorited products to ProductUI
  const favoritedProducts: ProductUI[] = $derived.by(() => (data.favoritedProducts || []).map(p => mapProduct(p as any)));
  
  // Price alerts will come from Supabase (future feature)
  const priceAlerts: { productId: string; targetPrice: number }[] = [];
  
  // Collections will come from Supabase (future feature)
  let collections = $state<{ id: string; name: string; count: number; image: string }[]>([]);
  
  let selectedCollection = $state<string | null>(null);
  let sortBy = $state('recently-added');
  let showCreateCollection = $state(false);
  let newCollectionName = $state('');
  let selectedItems = $state<Set<string>>(new Set());
  let isSelecting = $state(false);
  
  // Filtered and sorted products
  // Derived filtered/sorted favorite products (value, not function)
  const displayProducts: ProductUI[] = $derived.by(() => {
    let products: ProductUI[] = [...favoritedProducts];

    // Filter by collection if selected
    if (selectedCollection) {
      // Mock filtering - in real app would filter by collection membership
      products = products.slice(0, 8);
    }

    // Sort
    switch(sortBy) {
      case 'price-low':
        products = [...products].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products = [...products].sort((a, b) => b.price - a.price);
        break;
      case 'recently-added':
        products = [...products].sort((a, b) => {
          const aSrc = a.favoritedAt || a.createdAt || a.created_at;
          const bSrc = b.favoritedAt || b.createdAt || b.created_at;
          const aDate = aSrc ? new Date(aSrc).getTime() : 0;
          const bDate = bSrc ? new Date(bSrc).getTime() : 0;
          return bDate - aDate;
        });
        break;
    }

    return products;
  });
  
  async function toggleFavorite(productId: string) {
    try {
      const response = await fetch(`/api/favorites/${productId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // Refresh the page to show updated favorites
        window.location.reload();
      }
    } catch {
      // Error handling for favorite toggle
    }
  }
  
  function setPriceAlert(productId: string) {
    // TODO: Implement price alert functionality
    console.log('Setting price alert for product:', productId);
  }
  
  function createCollection() {
    if (newCollectionName.trim()) {

      collections = [...collections, {
        id: `col-${collections.length + 1}`,
        name: newCollectionName,
        count: 0,
        image: '/placeholder-product.svg'
      }];
      newCollectionName = '';
      showCreateCollection = false;
    }
  }
  
  function toggleItemSelection(productId: string) {
    const newSet = new Set(selectedItems);
    if (newSet.has(productId)) {
      newSet.delete(productId);
    } else {
      newSet.add(productId);
    }
    selectedItems = newSet;
  }
  
  function addToCollection() {
    
    selectedItems = new Set();
    isSelecting = false;
  }
</script>

<svelte:head>
  <title>Favorites - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  
  <!-- Page Header -->
  <div class="bg-white shadow-xs sticky top-14 sm:top-16 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">My Favorites</h1>
        <div class="flex items-center space-x-2">
          {#if isSelecting}
            <Button onclick={() => { isSelecting = false; selectedItems = new Set(); }} size="sm" variant="outline">
              Cancel
            </Button>
            <Button onclick={addToCollection} size="sm" disabled={selectedItems.size === 0}>
              Add to Collection ({selectedItems.size})
            </Button>
          {:else}
            <button
              onclick={() => isSelecting = true}
              class="p-2 text-gray-600 hover:text-gray-900"
              aria-label="Select items"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
            <select 
              bind:value={sortBy}
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="recently-added">Recently Added</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Collections -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">Collections</h2>
        <button 
          onclick={() => showCreateCollection = true}
          class="text-sm text-blue-600 hover:text-blue-800"
        >
          + New Collection
        </button>
      </div>
      
      <div class="flex space-x-3 overflow-x-auto pb-2">
        <button
          onclick={() => selectedCollection = null}
          class="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
            {selectedCollection === null ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          All ({favoritedProducts.length})
        </button>
        {#each collections as collection}
          <button
            onclick={() => selectedCollection = collection.id}
            class="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
              {selectedCollection === collection.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
          >
            {collection.name} ({collection.count})
          </button>
        {/each}
      </div>
    </div>

    <!-- Price Alerts Banner -->
    {#if priceAlerts.length > 0}
      <Banner variant="info" class="mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div>
              <p class="text-sm font-medium">Price alerts active</p>
              <p class="text-xs opacity-75">You have {priceAlerts.length} price alerts set</p>
            </div>
          </div>
          <Button size="sm" variant="outline">Manage</Button>
        </div>
      </Banner>
    {/if}

    <!-- Products Grid -->
  {#if displayProducts.length > 0}
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
  {#each displayProducts as product (product.id)}
          <div class="relative">
            {#if isSelecting}
              <div class="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedItems.has(product.id)}
                  onchange={() => toggleItemSelection(product.id)}
                  class="w-5 h-5 rounded-sm border-gray-300 text-black focus:ring-black"
                />
              </div>
            {/if}
            
            <ProductCard 
              {product}
              favorited={true}
              onFavorite={(p) => toggleFavorite(p.id)}
              onclick={() => !isSelecting && goto(getProductUrl(product))}
              class={isSelecting && selectedItems.has(product.id) ? 'ring-2 ring-black' : ''}
            />
            
            <!-- Quick Actions -->
            <div class="absolute top-2 right-2 flex flex-col space-y-1">
              <button
                onclick={(e: MouseEvent) => { e.stopPropagation(); toggleFavorite(product.id); }}
                class="p-1.5 bg-white rounded-full shadow-xs hover:shadow-md transition-shadow"
                aria-label="Remove from favorites"
              >
                <svg class="w-4 h-4 text-red-500 fill-current" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
              </button>
              {#if !priceAlerts.find(a => a.productId === product.id)}
                <button
                  onclick={(e: MouseEvent) => { e.stopPropagation(); setPriceAlert(product.id); }}
                  class="p-1.5 bg-white rounded-full shadow-xs hover:shadow-md transition-shadow"
                  aria-label="Set price alert"
                >
                  <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
              {/if}
            </div>
            
            <!-- Price Drop Badge -->
            {#if false && (product as any).originalPrice && (product as any).originalPrice > product.price}
              <div class="absolute bottom-14 left-2">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  -{Math.round((1 - product.price / (product as any).originalPrice) * 100)}%
                </span>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {:else}
      <div class="bg-white rounded-lg shadow-xs p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
        <p class="text-gray-600 mb-4">Items you favorite will appear here</p>
        <Button onclick={() => window.location.href = '/search'}>Discover Items</Button>
      </div>
    {/if}
  </div>

  <!-- Create Collection Modal -->
  {#if showCreateCollection}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 class="text-lg font-semibold mb-4">Create New Collection</h3>
        <input
          type="text"
          bind:value={newCollectionName}
          placeholder="Collection name"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-black focus:border-transparent"
        />
        <div class="flex space-x-2">
          <Button onclick={() => showCreateCollection = false} variant="outline" class="flex-1">
            Cancel
          </Button>
          <Button onclick={createCollection} class="flex-1" disabled={!newCollectionName.trim()}>
            Create
          </Button>
        </div>
      </div>
    </div>
  {/if}
</div>