<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { isBrowser } from './utils/runtime.js';
  
  interface SellerProduct {
    id: string;
    title: string;
    price: number;
    image: string;
  }
  
  interface SellerData {
    id: string;
    username: string;
    avatar_url: string;
    itemCount: number;
    created_at?: string;
    bio?: string;
    location?: string;
    totalSales?: number;
    rating?: number;
    recentProducts?: SellerProduct[];
  }
  
  interface Props {
    seller: SellerData;
    isOpen: boolean;
    onClose: () => void;
    onFollow?: (sellerId: string) => void;
    isFollowing?: boolean;
  }
  
  let { 
    seller, 
    isOpen = $bindable(), 
    onClose,
    onFollow,
    isFollowing = false
  }: Props = $props();
  
  let loadingProducts = $state(false);
  let sellerProducts = $state<SellerProduct[]>([]);
  let fetchError = $state<string | null>(null);
  
  
  // Close on escape key
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }
  
  // Calculate member since
  const memberSince = $derived.by(() => {
    if (!seller.created_at) return 'New seller';
    const date = new Date(seller.created_at);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  });

  // Fetch seller products when dialog opens
  async function fetchSellerProducts() {
    if (!isBrowser || loadingProducts) return;
    
    loadingProducts = true;
    fetchError = null;
    
    try {
      const response = await fetch(`/api/sellers/${seller.id}/products?limit=9&available=true`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Map API response to component format
      sellerProducts = (data.products || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
        image: (p.images && p.images.length > 0) ? p.images[0] : '/placeholder-product.svg'
      }));
      
      console.log(`Successfully fetched ${sellerProducts.length} products for seller ${seller.id}`);
      
    } catch (error) {
      console.error('Failed to fetch seller products:', error);
      fetchError = error instanceof Error ? error.message : 'Failed to load products';
      sellerProducts = [];
    } finally {
      loadingProducts = false;
    }
  }

  // Effect to fetch products when dialog opens
  $effect(() => {
    if (isOpen && seller.id) {
      // Check if we need to fetch products
      const hasRecentProducts = seller.recentProducts && seller.recentProducts.length > 0;
      const hasFetchedProducts = sellerProducts.length > 0;
      
      // Only skip fetching if we have recent products OR we already successfully fetched
      if (!hasRecentProducts && !hasFetchedProducts && !loadingProducts) {
        console.log('Fetching products for seller:', seller.id);
        fetchSellerProducts();
      }
    }
  });

  // Use provided recentProducts or fetched products
  const displayProducts = $derived(seller.recentProducts || sellerProducts);
  
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

{#if isOpen}
  <!-- Backdrop with click to close -->
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm"
    style="z-index: var(--z-max, 999999)"
    transition:fade={{ duration: 200 }}
    onclick={onClose}
    onkeydown={(e) => e.key === 'Escape' && onClose()}
    role="button"
    tabindex="-1"
    aria-label="Close modal"
  >
    <!-- Modal - Always centered -->
    <div 
      class="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
      style="z-index: calc(var(--z-max, 999999) + 1)"
      transition:fly={{ y: 20, opacity: 0, duration: 200 }}
    >
      <div
        class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative pointer-events-auto"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.key === 'Escape' && e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        tabindex="-1"
      >
        
        <!-- Close button -->
        <button
          onclick={onClose}
          class="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-gray-100 transition-colors z-20"
          aria-label="Close"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      
      <!-- Compact Header with Avatar and Stats -->
      <div class="p-6 pb-3">
        <div class="flex items-start gap-4">
          <!-- Avatar -->
          <img 
            src={seller.avatar_url} 
            alt={seller.username}
            class="w-16 h-16 rounded-full border-2 border-gray-100 shadow-sm"
          />
          
          <!-- Info -->
          <div class="flex-1">
            <h2 class="text-xl font-bold text-gray-900">{seller.username}</h2>
            <p class="text-sm text-gray-500">Since {memberSince}</p>
            {#if seller.location}
              <p class="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {seller.location}
              </p>
            {/if}
          </div>
          
          <!-- Quick Stats -->
          <div class="text-right">
            <div class="text-lg font-semibold text-gray-900">{seller.itemCount}</div>
            <div class="text-xs text-gray-500">items</div>
          </div>
        </div>
        
        {#if seller.bio}
          <p class="text-sm text-gray-600 mt-3">{seller.bio}</p>
        {/if}
        
        <!-- Compact Stats Bar -->
        <div class="flex justify-around mt-4 pt-3 border-t border-gray-100">
          <div class="text-center">
            <p class="text-sm font-semibold text-gray-900">{seller.totalSales || 0}</p>
            <p class="text-xs text-gray-500">Sales</p>
          </div>
          <div class="text-center">
            <p class="text-sm font-semibold text-gray-900">⭐ {seller.rating?.toFixed(1) || '5.0'}</p>
            <p class="text-xs text-gray-500">Rating</p>
          </div>
          <div class="text-center">
            <p class="text-sm font-semibold text-gray-900">{seller.itemCount === 1 ? 'New' : 'Active'}</p>
            <p class="text-xs text-gray-500">Seller</p>
          </div>
        </div>
      </div>
      
      <!-- Products Section - Always show even if empty -->
      <div class="flex-1 overflow-y-auto">
        <div class="px-6 pb-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Active listings</h3>
          {#if loadingProducts}
            <!-- Loading state -->
            <div class="grid grid-cols-3 gap-2">
              {#each Array(6) as _}
                <div class="aspect-square rounded-lg bg-gray-100 animate-pulse"></div>
              {/each}
            </div>
            <p class="text-center text-sm text-gray-500 mt-4">Loading products...</p>
          {:else if fetchError}
            <!-- Error state -->
            <div class="text-center py-8">
              <div class="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-sm text-gray-500 mb-2">Failed to load listings</p>
              <button 
                onclick={fetchSellerProducts}
                class="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Try again
              </button>
            </div>
          {:else if displayProducts && displayProducts.length > 0}
            <div class="grid grid-cols-3 gap-2">
              {#each displayProducts.slice(0, 9) as product}
                <div class="group cursor-pointer">
                  <div class="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-1">
                    <img 
                      src={product.image} 
                      alt={product.title}
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  </div>
                  <p class="text-xs font-semibold text-gray-900">£{typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</p>
                </div>
              {/each}
            </div>
          {:else}
            <!-- Empty state -->
            <div class="text-center py-8">
              <div class="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p class="text-sm text-gray-500">No active listings</p>
            </div>
          {/if}
        </div>
      </div>
      
      <!-- Actions - Only Follow button, no redirect -->
      <div class="p-4 border-t border-gray-100 flex gap-2">
        {#if onFollow}
          <button
            onclick={() => onFollow?.(seller.id)}
            class="flex-1 py-2.5 px-5 rounded-lg font-medium transition-colors border text-sm
              {isFollowing 
                ? 'border-gray-200 text-gray-600 hover:bg-gray-50' 
                : 'border-gray-300 text-black hover:bg-gray-50'}"
          >
            {isFollowing ? '✓ Following' : 'Follow'}
          </button>
        {/if}
      </div>
      </div>
    </div>
  </div>
{/if}
