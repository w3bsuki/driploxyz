<script lang="ts">
  import type { Product } from './types.js';
  import { browser } from '$app/environment';

  interface Props {
    product: Product;
    favorited?: boolean;
    onFavorite?: (product: Product) => void;
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

  // Update internal state when props change
  $effect(() => {
    currentFavorited = favorited;
  });

  $effect(() => {
    favoriteCount = product.favorite_count || 0;
  });

  async function handleFavorite(event: MouseEvent) {
    event.stopPropagation();
    
    if (isLoading || !browser) return;

    // If there's a custom onFavorite handler, use it
    if (onFavorite) {
      onFavorite(product);
      return;
    }

    // Otherwise, make API call
    isLoading = true;
    
    try {
      const response = await fetch(`/api/favorites/${product.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to update favorite');
      }

      const result = await response.json();
      currentFavorited = result.favorited;
      
      // Update favorite count based on action
      if (result.action === 'added') {
        favoriteCount++;
      } else if (result.action === 'removed') {
        favoriteCount = Math.max(0, favoriteCount - 1);
      }
      
    } catch (error) {
      console.error('Error updating favorite:', error);
      // Revert on error
      currentFavorited = !currentFavorited;
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="absolute top-2 right-2">
  <button 
    onclick={handleFavorite}
    disabled={isLoading}
    class="flex items-center gap-1 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-sm border border-white/20 min-h-[36px] {isLoading ? 'opacity-50 cursor-not-allowed' : ''}"
    aria-label={currentFavorited ? removeFromFavoritesText : addToFavoritesText}
  >
    <svg 
      class="w-4 h-4 transition-colors {currentFavorited ? 'text-red-500 fill-current' : 'text-gray-600'}" 
      viewBox="0 0 24 24"
    >
      <path 
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
    {#if showCount && favoriteCount > 0}
      <span class="text-xs font-medium text-gray-700 min-w-[12px]">
        {favoriteCount}
      </span>
    {/if}
  </button>
</div>