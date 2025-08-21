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
  
  let modalElement: HTMLDivElement;
  let startY = 0;
  let currentY = 0;
  let isDragging = false;
  
  // Handle swipe down to close on mobile
  function handleTouchStart(e: TouchEvent) {
    startY = e.touches[0].clientY;
    isDragging = true;
  }
  
  function handleTouchMove(e: TouchEvent) {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    if (diff > 0 && modalElement) {
      modalElement.style.transform = `translateY(${diff}px)`;
    }
  }
  
  function handleTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    
    const diff = currentY - startY;
    if (diff > 100) {
      onClose();
    } else if (modalElement) {
      modalElement.style.transform = 'translateY(0)';
    }
  }
  
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
  
  <!-- Modal -->
  <div 
    bind:this={modalElement}
    class="fixed bottom-0 left-0 right-0 lg:fixed lg:inset-0 lg:flex lg:items-center lg:justify-center z-50 pointer-events-none"
    transition:fly={{ y: 300, duration: 300 }}
  >
    <div 
      class="bg-white rounded-t-2xl lg:rounded-2xl w-full lg:max-w-md pointer-events-auto lg:m-4 max-h-[85vh] lg:max-h-[600px] overflow-hidden flex flex-col"
      ontouchstart={handleTouchStart}
      ontouchmove={handleTouchMove}
      ontouchend={handleTouchEnd}
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Drag handle for mobile -->
      <div class="lg:hidden w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-2"></div>
      
      <!-- Header -->
      <div class="px-6 pt-4 lg:pt-6 pb-4 border-b border-gray-100">
        <div class="flex items-center gap-4">
          <img 
            src={seller.avatar_url} 
            alt={seller.username}
            class="w-20 h-20 rounded-full border-2 border-gray-200"
          />
          <div class="flex-1">
            <h2 class="text-xl font-bold text-gray-900">{seller.username}</h2>
            <p class="text-sm text-gray-500">Member since {memberSince}</p>
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
        </div>
        
        {#if seller.bio}
          <p class="text-sm text-gray-600 mt-3">{seller.bio}</p>
        {/if}
      </div>
      
      <!-- Stats -->
      <div class="px-6 py-4 flex justify-around border-b border-gray-100">
        <div class="text-center">
          <p class="text-2xl font-bold text-gray-900">{seller.itemCount}</p>
          <p class="text-xs text-gray-500">Active items</p>
        </div>
        {#if seller.totalSales !== undefined}
          <div class="text-center">
            <p class="text-2xl font-bold text-gray-900">{seller.totalSales}</p>
            <p class="text-xs text-gray-500">Sales</p>
          </div>
        {/if}
        {#if seller.rating !== undefined}
          <div class="text-center">
            <p class="text-2xl font-bold text-gray-900">{seller.rating.toFixed(1)}</p>
            <p class="text-xs text-gray-500">Rating</p>
          </div>
        {/if}
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
      
      <!-- Actions -->
      <div class="px-6 py-4 flex gap-3 border-t border-gray-100">
        {#if onFollow}
          <button
            onclick={() => onFollow?.(seller.id)}
            class="flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors
              {isFollowing 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                : 'bg-black text-white hover:bg-gray-800'}"
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        {/if}
        <button
          onclick={() => {
            onViewProfile(seller.id);
            onClose();
          }}
          class="flex-1 py-2.5 px-4 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          View Profile
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Smooth transitions for swipe */
  div {
    transition: transform 0.2s ease-out;
  }
</style>