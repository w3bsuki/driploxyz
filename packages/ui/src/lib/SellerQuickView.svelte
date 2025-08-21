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
  <!-- Backdrop -->
  <div 
    class="fixed inset-0 bg-black/50 z-50 lg:backdrop-blur-sm"
    transition:fade={{ duration: 200 }}
    onclick={onClose}
  />
  
  <!-- Modal - Always centered like highlights -->
  <div 
    class="fixed inset-0 flex items-center justify-center z-50 p-4"
    transition:fly={{ y: 20, opacity: 0, duration: 200 }}
  >
    <div 
      class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      onclick={(e) => e.stopPropagation()}
    >
      
      <!-- Close button -->
      <button
        onclick={onClose}
        class="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
      >
        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <!-- Header - Centered like highlights -->
      <div class="px-6 pt-6 pb-4 text-center">
        <img 
          src={seller.avatar_url} 
          alt={seller.username}
          class="w-24 h-24 rounded-full border-3 border-gray-100 mx-auto mb-3 shadow-sm"
        />
        <h2 class="text-2xl font-bold text-gray-900">{seller.username}</h2>
        <p class="text-sm text-gray-500 mt-1">Member since {memberSince}</p>
        {#if seller.location}
          <p class="text-sm text-gray-600 flex items-center justify-center gap-1 mt-2">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {seller.location}
          </p>
        {/if}
        {#if seller.bio}
          <p class="text-sm text-gray-600 mt-3 max-w-sm mx-auto">{seller.bio}</p>
        {/if}
      </div>
      
      <!-- Stats - Clean grid -->
      <div class="grid grid-cols-3 gap-4 px-6 py-4 bg-gray-50">
        <div class="text-center">
          <p class="text-xl font-semibold text-gray-900">{seller.itemCount}</p>
          <p class="text-xs text-gray-500">Items</p>
        </div>
        <div class="text-center">
          <p class="text-xl font-semibold text-gray-900">{seller.totalSales || 0}</p>
          <p class="text-xs text-gray-500">Sales</p>
        </div>
        <div class="text-center">
          <p class="text-xl font-semibold text-gray-900">{seller.rating?.toFixed(1) || '5.0'}</p>
          <p class="text-xs text-gray-500">Rating</p>
        </div>
      </div>
      
      <!-- Recent Products (optional) -->
      {#if seller.recentProducts && seller.recentProducts.length > 0}
        <div class="px-6 py-4 flex-1 overflow-y-auto">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Recent listings</h3>
          <div class="grid grid-cols-3 gap-2">
            {#each seller.recentProducts.slice(0, 6) as product}
              <div class="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={product.image} 
                  alt={product.title}
                  class="w-full h-full object-cover"
                />
              </div>
            {/each}
          </div>
        </div>
      {/if}
      
      <!-- Actions - Primary CTA -->
      <div class="p-6 flex gap-3">
        <button
          onclick={() => {
            onViewProfile(seller.id);
            onClose();
          }}
          class="flex-1 py-3 px-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          View Full Profile
        </button>
        {#if onFollow}
          <button
            onclick={() => onFollow?.(seller.id)}
            class="py-3 px-6 rounded-xl font-medium transition-colors border
              {isFollowing 
                ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
                : 'border-black text-black hover:bg-gray-50'}"
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}

