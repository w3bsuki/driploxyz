<script lang="ts">
  import type { Product } from '../types';
  import { Tooltip } from './primitives/tooltip';

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
    if (product.is_sold) {
      return 'Sold – likes frozen';
    }
    if (isLoading) {
      return 'Updating favorites...';
    }
    return currentFavorited ? removeFromFavoritesText : addToFavoritesText;
  });

  async function handleFavorite(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    
    if (isLoading || typeof window === 'undefined' || product.is_sold) return;

    // If parent provided a handler, delegate to it to avoid duplicate requests
    if (onFavorite) {
      try {
        isLoading = true;
        await onFavorite();
      } finally {
        isLoading = false;
      }
      return;
    }
    
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
        disabled={isLoading || product.is_sold}
        class="group flex items-center gap-1 p-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)] transition-all duration-[var(--duration-fast)] {(isLoading || product.is_sold) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:scale-105 active:scale-95'}"
        aria-label={product.is_sold ? 'Sold – likes frozen' : (currentFavorited ? removeFromFavoritesText : addToFavoritesText)}
      >
        <svg 
          class="w-3.5 h-3.5 transition-all duration-[var(--duration-fast)] {product.is_sold ? 'text-[color:var(--text-disabled)]' : (currentFavorited ? 'text-[color:var(--status-error-solid)] fill-[color:var(--status-error-solid)] scale-110' : 'text-gray-600 group-hover:text-[color:var(--status-error-solid)] group-hover:scale-110')}"
          aria-hidden="true" 
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
          fill={currentFavorited ? 'currentColor' : 'none'}
        >
          <path 
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          />
        </svg>
        {#if showCount && favoriteCount > 0}
          <span class="text-xs font-medium transition-colors duration-[var(--duration-fast)] {currentFavorited ? 'text-[color:var(--status-error-solid)]' : 'text-[color:var(--text-muted)]'}">
            {favoriteCount > 999 ? `${Math.floor(favoriteCount/1000)}k` : favoriteCount}
          </span>
        {/if}
      </button>
    {/snippet}
  </Tooltip>
</div>