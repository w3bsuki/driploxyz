<script lang="ts">
  import type { Product } from './types.js';
  import Card from './Card.svelte';
  import SoldOverlay from './SoldOverlay.svelte';
  import Avatar from './Avatar.svelte';

  interface Props {
    product: Product;
    onFavorite?: (product: Product) => void;
    onclick?: (product: Product) => void;
    favorited?: boolean;
    class?: string;
    translations?: {
      size?: string;
      newSeller?: string;
      unknownSeller?: string;
      currency?: string;
      addToFavorites?: string;
      new?: string;
      likeNew?: string;
      good?: string;
      fair?: string;
      formatPrice?: (price: number) => string;
    };
  }

  let { 
    product, 
    onFavorite, 
    onclick,
    favorited = false,
    class: className = '',
    translations = {
      size: 'Size',
      newSeller: 'New Seller',
      unknownSeller: 'Unknown Seller',
      currency: '$',
      addToFavorites: 'Add to favorites',
      new: 'New',
      likeNew: 'Like New',
      good: 'Good',
      fair: 'Fair'
    }
  }: Props = $props();

  function handleFavorite(event: MouseEvent) {
    event.stopPropagation();
    onFavorite?.(product);
  }

  function handleClick() {
    onclick?.(product);
  }

  const conditionColors = {
    'new': 'bg-white/90 backdrop-blur text-gray-900 border border-gray-200',
    'like-new': 'bg-white/90 backdrop-blur text-gray-900 border border-gray-200',
    'good': 'bg-white/90 backdrop-blur text-gray-900 border border-gray-200',
    'fair': 'bg-white/90 backdrop-blur text-gray-900 border border-gray-200'
  };
  
  const conditionLabels = {
    'new': translations.new || 'New',
    'like-new': translations.likeNew || 'Like New',
    'good': translations.good || 'Good',
    'fair': translations.fair || 'Fair'
  };
</script>

<Card class={`overflow-hidden ${className}`} padding={false} hover={true} onclick={handleClick}>
  <div class="relative">
    <img 
      src={product.images[0] || '/placeholder-product.svg'} 
      alt={product.title}
      class="w-full aspect-square object-cover"
    />
    
    <!-- Sold Overlay -->
    <SoldOverlay 
      show={product.is_sold || false} 
      soldAt={product.sold_at} 
    />
    
    <div class="absolute top-2 left-2 right-2 flex items-center justify-between">
      <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold shadow-sm {conditionColors[product.condition]}">
        {conditionLabels[product.condition] || product.condition}
      </span>
      
      {#if onFavorite}
        <button 
          onclick={handleFavorite}
          class="p-1.5 rounded-full bg-white/90 backdrop-blur shadow-sm hover:shadow-md transition-shadow"
          aria-label={translations.addToFavorites}
        >
          <svg 
            class="w-4 h-4 transition-colors {favorited ? 'text-red-500 fill-current' : 'text-gray-700 hover:text-red-500'}" 
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
    </div>
  </div>
  
  <div class="p-3">
    <div class="mb-3">
      <h3 class="font-medium text-sm text-gray-900 line-clamp-1">{product.title}</h3>
      {#if product.brand}
        <p class="text-xs text-gray-500 mt-0.5">{product.brand}</p>
      {/if}
    </div>
    
    <div class="space-y-2">
      {#if product.size}
        <p class="text-xs text-gray-600">{translations.size}: {product.size}</p>
      {/if}
      
      <div class="pt-2 border-t border-gray-100">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <Avatar 
              src={product.sellerAvatar} 
              name={product.sellerName} 
              size="xs" 
            />
            <div class="min-w-0">
              <span class="block truncate text-xs text-gray-600 font-medium">{product.sellerName || translations.unknownSeller}</span>
              {#if product.sellerRating !== undefined && product.sellerRating !== null}
                <div class="flex items-center gap-1 mt-1">
                  <svg class="w-3 h-3 text-amber-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span class="text-xs font-semibold text-amber-700">{product.sellerRating.toFixed(1)}</span>
                </div>
              {:else}
                <span class="inline-block text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold mt-1">
                  {translations.newSeller}
                </span>
              {/if}
            </div>
          </div>
          
          <div class="bg-gray-900 text-white px-2 py-1 rounded-lg flex-shrink-0">
            <span class="text-sm font-bold">{translations.formatPrice ? translations.formatPrice(product.price) : `${translations.currency}${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}`}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</Card>