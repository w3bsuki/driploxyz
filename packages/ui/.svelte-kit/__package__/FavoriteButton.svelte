<script lang="ts">
  import type { Product } from '../types';
  import { browser } from '$app/environment';

  interface Props {
    product: Product;
    favorited?: boolean;
    onFavorite?: () => void;
    addToFavoritesText?: string;
    removeFromFavoritesText?: string;
    showCount?: boolean;
  }

  let { 
    product,
    favorited = false,
    onFavorite,
    addToFavoritesText = 'Add to favorites',
    removeFromFavoritesText = 'Remove from favorites',
    showCount = true
  }: Props = $props();

  let isLoading = $state(false);
  let currentFavorited = $state(favorited);
  let favoriteCount = $state(product.favorite_count || 0);
  let isProcessing = $state(false); // Additional guard

  // Update internal state when props change
  $effect(() => {
    currentFavorited = favorited;
  });

  // Initialize favorite count from product
  $effect(() => {
    favoriteCount = product.favorite_count || 0;
  });

  async function handleFavorite(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    
    // Triple protection against double clicks
    if (isLoading || isProcessing || !browser) {
      console.log(`[FAVORITE] Blocked: isLoading=${isLoading}, isProcessing=${isProcessing}`);
      return;
    }
    
    // Set both guards
    isLoading = true;
    isProcessing = true;
    
    console.log(`[FAVORITE] Starting: product=${product.id}, current state: favorited=${currentFavorited}, count=${favoriteCount}`);
    
    try {
      // Make direct API call - no more custom handlers to avoid confusion
      const response = await fetch(`/api/favorites/${product.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      console.log(`[FAVORITE] API response:`, result);
      
      // Update state from API response ONLY - no local calculation
      currentFavorited = result.favorited;
      favoriteCount = result.favoriteCount || 0;
      
      console.log(`[FAVORITE] Updated state: favorited=${currentFavorited}, count=${favoriteCount}`);
      
    } catch (error) {
      console.error('[FAVORITE] Error:', error);
      // Don't change any state on error
    } finally {
      // Always clear both guards
      isLoading = false;
      isProcessing = false;
    }
  }
</script>

<div class="absolute top-2 right-2 z-10">
  <button 
    onclick={handleFavorite}
    disabled={isLoading || isProcessing}
    class="group flex items-center gap-1 px-2 py-1.5 bg-white/95 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200/50 {(isLoading || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''} {currentFavorited ? 'bg-red-50/95 hover:bg-red-50 border-red-200/50' : ''}"
    aria-label={currentFavorited ? removeFromFavoritesText : addToFavoritesText}
  >
    <svg 
      class="w-4 h-4 transition-all duration-200 {currentFavorited ? 'text-red-600 fill-red-600' : 'text-gray-500 group-hover:text-red-500'}" 
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
      fill={currentFavorited ? 'currentColor' : 'none'}
    >
      <path 
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      />
    </svg>
    {#if showCount}
      <span class="text-xs font-semibold transition-all duration-200 {currentFavorited ? 'text-red-600' : 'text-gray-600'}">
        {favoriteCount > 999 ? `${Math.floor(favoriteCount/1000)}k` : favoriteCount}
      </span>
    {/if}
  </button>
</div>