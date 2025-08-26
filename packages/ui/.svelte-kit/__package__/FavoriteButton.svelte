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
  let favoriteCount = $state(product.favorites_count || 0);

  // Update internal state when props change
  $effect(() => {
    currentFavorited = favorited;
  });

  $effect(() => {
    favoriteCount = product.favorites_count || 0;
  });

  async function handleFavorite(event: MouseEvent) {
    event.stopPropagation();
    
    if (isLoading || !browser) return;

    // If there's a custom onFavorite handler, use it
    if (onFavorite) {
      onFavorite();
      // Update local state optimistically
      currentFavorited = !currentFavorited;
      if (currentFavorited) {
        favoriteCount++;
      } else {
        favoriteCount = Math.max(0, favoriteCount - 1);
      }
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

<div class="absolute top-2 right-2 z-10">
  <button 
    onclick={handleFavorite}
    disabled={isLoading}
    class="group flex items-center gap-1 {showCount && favoriteCount > 0 ? 'px-2 py-1.5' : 'p-1.5'} bg-white/95 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200/50 {isLoading ? 'opacity-50 cursor-not-allowed' : ''} {currentFavorited ? 'bg-red-50/95 hover:bg-red-50 border-red-200/50' : ''}"
    aria-label={currentFavorited ? removeFromFavoritesText : addToFavoritesText}
  >
    <svg 
      class="w-4 h-4 transition-all duration-200 {currentFavorited ? 'text-red-500 fill-current' : 'text-gray-500 group-hover:text-red-400'}" 
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
    {#if showCount && favoriteCount > 0}
      <span class="text-xs font-semibold transition-all duration-200 {currentFavorited ? 'text-red-600' : 'text-gray-600'}">
        {favoriteCount > 999 ? `${Math.floor(favoriteCount/1000)}k` : favoriteCount}
      </span>
    {/if}
  </button>
</div>