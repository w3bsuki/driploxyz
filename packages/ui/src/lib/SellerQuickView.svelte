<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  
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
    recentProducts?: Array<{
      id: string;
      title: string;
      price: number;
      image: string;
    }>;
  }
  
  interface Props {
    seller: SellerData;
    isOpen: boolean;
    onClose: () => void;
    onViewProfile: (sellerId: string) => void;
    onFollow?: (sellerId: string) => void;
    isFollowing?: boolean;
  }
  
  let { 
    seller, 
    isOpen = $bindable(), 
    onClose,
    onViewProfile,
    onFollow,
    isFollowing = false
  }: Props = $props();
  
  
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
  
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

{#if isOpen}
  <!-- Backdrop with click to close -->
  <div 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
    transition:fade={{ duration: 200 }}
    onclick={onClose}
    role="button"
    tabindex="-1"
    aria-label="Close modal"
  >
    <!-- Modal - Always centered -->
    <div 
      class="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
      transition:fly={{ y: 20, opacity: 0, duration: 200 }}
    >
      <div 
        class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative pointer-events-auto"
        onclick={(e) => e.stopPropagation()}
      >
        
        <!-- Close button -->
        <button
          onclick={onClose}
          class="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-gray-100 transition-colors z-10"
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
          {#if seller.recentProducts && seller.recentProducts.length > 0}
            <div class="grid grid-cols-3 gap-2">
              {#each seller.recentProducts.slice(0, 9) as product}
                <div class="group cursor-pointer">
                  <div class="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-1">
                    <img 
                      src={product.image} 
                      alt={product.title}
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p class="text-xs font-semibold text-gray-900">${product.price}</p>
                </div>
              {/each}
            </div>
          {:else}
            <!-- Empty state or placeholder -->
            <div class="grid grid-cols-3 gap-2">
              {#each Array(6) as _}
                <div class="aspect-square rounded-lg bg-gray-100 animate-pulse"></div>
              {/each}
            </div>
            <p class="text-center text-sm text-gray-500 mt-4">Loading products...</p>
          {/if}
        </div>
      </div>
      
      <!-- Actions - Simplified -->
      <div class="p-4 border-t border-gray-100 flex gap-2">
        <button
          onclick={() => {
            onViewProfile(seller.id);
            onClose();
          }}
          class="flex-1 py-2.5 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
        >
          View Profile
        </button>
        {#if onFollow}
          <button
            onclick={() => onFollow?.(seller.id)}
            class="py-2.5 px-5 rounded-lg font-medium transition-colors border text-sm
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

