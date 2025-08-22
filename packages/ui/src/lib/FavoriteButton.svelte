<script lang="ts">
  import type { Product } from './types.js';

  interface Props {
    product: Product;
    favorited?: boolean;
    onFavorite?: (product: Product) => void;
    addToFavoritesText?: string;
    removeFromFavoritesText?: string;
  }

  let { 
    product,
    favorited = false,
    onFavorite,
    addToFavoritesText = 'Add to favorites',
    removeFromFavoritesText = 'Remove from favorites'
  }: Props = $props();

  function handleFavorite(event: MouseEvent) {
    event.stopPropagation();
    onFavorite?.(product);
  }
</script>

{#if onFavorite}
  <button 
    onclick={handleFavorite}
    class="absolute top-2 right-2 p-3 bg-white/90 rounded-full hover:bg-white min-h-[44px] min-w-[44px]"
    aria-label={favorited ? removeFromFavoritesText : addToFavoritesText}
  >
    <svg 
      class="w-4 h-4 {favorited ? 'text-red-500 fill-current' : 'text-gray-600'}" 
      viewBox="0 0 20 20"
    >
      <path 
        fill-rule="evenodd" 
        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
        clip-rule="evenodd" 
      />
    </svg>
  </button>
{/if}