<script lang="ts">
  import type { Product } from './types.js';
  import Card from './Card.svelte';
  import SoldOverlay from './SoldOverlay.svelte';
  import Avatar from './Avatar.svelte';
  import OptimizedImage from './OptimizedImage.svelte';

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
      removeFromFavorites?: string;
      new?: string;
      likeNew?: string;
      good?: string;
      fair?: string;
      soldItem?: string;
      viewSellerProfile?: string;
      ratingOutOfFive?: string;
      conditionExcellent?: string;
      conditionVeryGood?: string;
      conditionGood?: string;
      conditionFair?: string;
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
      removeFromFavorites: 'Remove from favorites',
      new: 'New',
      likeNew: 'Like New',
      good: 'Good',
      fair: 'Fair',
      soldItem: 'Sold item',
      viewSellerProfile: 'View seller profile',
      ratingOutOfFive: 'out of 5 stars',
      conditionExcellent: 'Brand new with tags, never worn',
      conditionVeryGood: 'Excellent condition, barely used',
      conditionGood: 'Good condition with minor signs of wear',
      conditionFair: 'Well-worn but still functional'
    }
  }: Props = $props();
  
  let showSellerName = $state(false);
  let announceText = $state('');
  
  // Live region announcements for dynamic content
  function announceChange(text: string) {
    announceText = text;
    setTimeout(() => announceText = '', 1000);
  }

  function handleFavorite(event: MouseEvent) {
    event.stopPropagation();
    onFavorite?.(product);
    // Announce the state change to screen readers
    const action = favorited ? 'removed from' : 'added to';
    announceChange(`${product.title} ${action} favorites`);
  }

  function handleClick() {
    onclick?.(product);
  }

  const conditionColors = {
    'new': 'bg-success text-white shadow-xl backdrop-blur-sm',
    'like-new': 'bg-info text-white shadow-xl backdrop-blur-sm', 
    'good': 'bg-warning text-black shadow-xl backdrop-blur-sm',
    'fair': 'bg-accent-orange text-white shadow-xl backdrop-blur-sm'
  };
  
  const conditionLabels = {
    'new': translations.new || 'New',
    'like-new': translations.likeNew || 'Like New',
    'good': translations.good || 'Good',
    'fair': translations.fair || 'Fair'
  };
  
  const conditionDescriptions = {
    'new': translations.conditionExcellent || 'Brand new with tags, never worn',
    'like-new': translations.conditionVeryGood || 'Excellent condition, barely used',
    'good': translations.conditionGood || 'Good condition with minor signs of wear',
    'fair': translations.conditionFair || 'Well-worn but still functional'
  };
  
  // Generate comprehensive product summary for screen readers
  const productSummary = $derived(
    `${product.title}${product.brand ? `, by ${product.brand}` : ''}${product.size ? `, size ${product.size}` : ''}, condition ${conditionLabels[product.condition]}, priced at ${translations.formatPrice ? translations.formatPrice(product.price) : `${translations.currency}${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}`}${product.sellerName ? `, sold by ${product.sellerName}` : ''}${product.sellerRating !== undefined && product.sellerRating !== null ? `, seller rating ${product.sellerRating.toFixed(1)} ${translations.ratingOutOfFive || 'out of 5 stars'}` : ''}${product.is_sold ? `, ${translations.soldItem || 'sold item'}` : ''}`
  );
  
  // Enhanced alt text for product image
  const imageAltText = $derived(
    `${product.title}${product.brand ? ` by ${product.brand}` : ''}${product.category ? ` in ${product.category}` : ''} in ${conditionLabels[product.condition]} condition`
  );
  
  // Favorite button aria label based on state
  const favoriteAriaLabel = $derived(
    favorited 
      ? `${translations.removeFromFavorites || 'Remove from favorites'}: ${product.title}`
      : `${translations.addToFavorites || 'Add to favorites'}: ${product.title}`
  );
</script>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  /* Enhanced focus indicators for accessibility */
  :global(.product-card-container:focus) {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
  
  :global(.product-card-button:focus) {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    border-radius: 6px;
  }
</style>

<Card 
  class={`overflow-hidden group ${className}`}
  padding={false} 
  hover={true} 
  onclick={handleClick}
>
  <div class="relative overflow-hidden">
    <!-- Image with hover scale animation -->
    <div class="transform transition-transform duration-300 ease-out group-hover:scale-105 will-change-transform">
      <OptimizedImage 
        src={product.images[0] || '/placeholder-product.svg'} 
        alt={imageAltText}
        aspectRatio="square"
        loading="lazy"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
    </div>
    
    <!-- Sold Overlay -->
    <SoldOverlay 
      show={product.is_sold || false} 
      soldAt={product.sold_at} 
    />
    
    <!-- Seller Avatar Bottom Left on Image - Mobile-optimized with 44px touch target -->
    <div class="absolute bottom-1 left-1 sm:bottom-2 sm:left-2">
      <button 
        class="flex items-center bg-white/90 backdrop-blur-sm rounded-full shadow-xs transition-all duration-300 ease-out cursor-pointer transform hover:scale-105 hover:shadow-lg hover:bg-white/95 active:scale-95 will-change-transform touch-manipulation min-w-[44px] min-h-[44px] product-card-button {showSellerName ? 'pr-3 sm:pr-4' : ''}"
        onmouseenter={() => showSellerName = true}
        onmouseleave={() => showSellerName = false}
        onclick={(e) => e.stopPropagation()}
        aria-label={`${translations.viewSellerProfile || 'View seller profile'} for ${product.sellerName || translations.unknownSeller}`}
        aria-describedby="seller-info-{product.id}"
      >
        <div class="p-1.5 transform transition-transform duration-200 ease-out hover:scale-110 will-change-transform">
          <Avatar 
            src={product.sellerAvatar} 
            name={product.sellerName} 
            size="sm"
            onclick={(e) => e.stopPropagation()}
          />
        </div>
        {#if showSellerName}
          <span 
            class="text-xs font-medium text-gray-700 ml-2 whitespace-nowrap animate-in slide-in-from-left-2 duration-200"
            id="seller-info-{product.id}"
            role="text"
          >
            {product.sellerName || translations.unknownSeller}
            {#if product.sellerRating !== undefined && product.sellerRating !== null}
              <span class="text-amber-600 ml-1" aria-label="{product.sellerRating.toFixed(1)} {translations.ratingOutOfFive || 'out of 5 stars'}">★{product.sellerRating.toFixed(1)}</span>
              <span class="sr-only">{translations.ratingOutOfFive || 'out of 5 stars'}</span>
            {/if}
          </span>
        {/if}
      </button>
    </div>
    
    <!-- Condition Badge Bottom Right on Image - Mobile-optimized spacing -->
    <div class="absolute bottom-2 right-2 sm:bottom-3 sm:right-3">
      <span 
        class="inline-flex items-center px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs sm:text-xs font-extrabold uppercase tracking-wide {conditionColors[product.condition]} leading-none transform transition-all duration-200 ease-out hover:scale-105 hover:shadow-lg will-change-transform"
        role="text"
        aria-label="{conditionLabels[product.condition]}: {conditionDescriptions[product.condition]}"
      >
        {conditionLabels[product.condition] || product.condition}
        <span class="sr-only">: {conditionDescriptions[product.condition]}</span>
      </span>
    </div>
    
  </div>
  
  <div class="p-4 sm:p-3 space-y-2.5 sm:space-y-1.5 transform transition-all duration-200 ease-out group-hover:translate-y-[-1px] will-change-transform">
    <!-- Top Row: Category and Wishlist - Mobile optimized spacing -->
    <div class="flex items-center justify-between min-h-[24px]">
      {#if product.category}
        <span 
          class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider"
          role="text"
          aria-label="Category: {product.category}"
        >
          {product.category}
          <span class="sr-only">category</span>
        </span>
      {:else}
        <span></span>
      {/if}
      
      {#if onFavorite}
        <button 
          onclick={handleFavorite}
          class="flex items-center justify-center min-w-[44px] min-h-[44px] p-2 hover:bg-gray-100 rounded-full transition-all duration-200 ease-out -mr-2 touch-manipulation transform hover:scale-110 active:scale-95 will-change-transform product-card-button"
          aria-label={favoriteAriaLabel}
          aria-pressed={favorited ? 'true' : 'false'}
          type="button"
        >
          <svg 
            class="w-5 h-5 transition-all duration-300 ease-out transform {favorited ? 'text-red-500 fill-current scale-110' : 'text-gray-400 hover:text-red-500 hover:scale-105'} will-change-transform" 
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
    
    <!-- Product Title - Mobile optimized sizing -->
    <h2 class="font-semibold text-base sm:text-sm text-gray-900 leading-tight line-clamp-2 sm:truncate">{product.title}</h2>
    
    <!-- Subcategory, Brand and Size - Mobile optimized spacing -->
    <div class="text-sm sm:text-xs text-gray-500 truncate leading-relaxed" role="text">
      {#if product.subcategory}
        <span class="uppercase">{product.subcategory}</span>
        <span class="sr-only">category</span>
      {/if}
      {#if product.subcategory && (product.brand || product.size)}<span class="mx-1.5" aria-hidden="true">•</span>{/if}
      {#if product.brand}
        <span class="font-medium text-gray-600">{product.brand}</span>
        <span class="sr-only">brand</span>
      {/if}
      {#if product.brand && product.size}<span class="mx-1.5" aria-hidden="true">•</span>{/if}
      {#if product.size}
        <span>{translations.size || 'Size'} {product.size}</span>
      {/if}
    </div>
    
    <!-- Price - Mobile optimized -->
    <div class="pt-1.5">
      <span 
        class="text-xl sm:text-lg font-extrabold text-gray-900"
        role="text"
        aria-label="Price: {translations.formatPrice ? translations.formatPrice(product.price) : `${translations.currency}${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}`}"
      >
        {translations.formatPrice ? translations.formatPrice(product.price) : `${translations.currency}${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}`}
      </span>
    </div>
  </div>
</Card>

<!-- ARIA live region for announcements -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {announceText}
</div>