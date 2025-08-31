<script lang="ts">
  import type { Product } from '../types';
  import { browser } from '$app/environment';
  import Tooltip from './primitives/tooltip/Tooltip.svelte';

  interface Props {
    product: Product;
    favorited?: boolean;
    onFavorite?: () => void;
    addToFavoritesText?: string;
    removeFromFavoritesText?: string;
    showCount?: boolean;
    favoritesState?: { favoriteCounts: Record<string, number> };
    absolute?: boolean;
    customPosition?: string;
  }

  let { 
    product,
    favorited = false,
    onFavorite,
    addToFavoritesText = 'Add to favorites',
    removeFromFavoritesText = 'Remove from favorites',
    showCount = true,
    favoritesState,
    absolute = true,
    customPosition = ''
  }: Props = $props();

  let isLoading = $state(false);
  let currentFavorited = $state(favorited);
  let favoriteCount = $state(product.favorite_count || 0);

  $effect(() => {
    currentFavorited = favorited;
  });

  $effect(() => {
    // Use store count if available, otherwise fall back to product count
    favoriteCount = favoritesState?.favoriteCounts[product.id] ?? product.favorite_count ?? 0;
  });

  // Compute tooltip content based on state
  const tooltipContent = $derived(() => {
    if (isLoading) {
      return 'Updating favorites...';
    }
    return currentFavorited ? removeFromFavoritesText : addToFavoritesText;
  });

  async function handleFavorite(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    
    if (isLoading || !browser) return;
    
    isLoading = true;
    
    try {
      const response = await fetch(`/api/favorites/${product.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      currentFavorited = result.favorited;
      favoriteCount = result.favoriteCount || 0;
      
    } catch (error) {
      console.error('[FAVORITE] Error:', error);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="{absolute ? (customPosition || 'absolute top-2 right-2 z-10') : 'shrink-0'}">
  <Tooltip 
    content={tooltipContent()}
    positioning={{ side: 'bottom', align: 'center' }}
    openDelay={500}
    closeDelay={200}
    disabled={isLoading}
    forceTouch={true}
  >
    {#snippet trigger()}
      <button 
        onclick={handleFavorite}
        disabled={isLoading}
        class="group flex items-center gap-1 px-2 py-1.5 bg-white/95 md:backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200 shadow-sm hover:shadow-md border border-gray-200/50 {isLoading ? 'opacity-50 cursor-not-allowed' : ''} {currentFavorited ? 'bg-red-50/95 hover:bg-red-50 border-red-200/50' : ''}"
        aria-label={currentFavorited ? removeFromFavoritesText : addToFavoritesText}
      >
        <svg 
          class="w-4 h-4 transition-colors duration-200 {currentFavorited ? 'text-red-600 fill-red-600' : 'text-gray-500 group-hover:text-red-500'}" 
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
          <span class="text-xs font-semibold transition-colors duration-200 {currentFavorited ? 'text-red-600' : 'text-gray-500'}">
            {favoriteCount > 999 ? `${Math.floor(favoriteCount/1000)}k` : favoriteCount}
          </span>
        {/if}
      </button>
    {/snippet}
  </Tooltip>
</div>