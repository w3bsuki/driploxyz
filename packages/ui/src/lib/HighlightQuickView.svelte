<script lang="ts">
  import type { Product } from '../types';

  interface Props {
    product: Product;
    onClose: () => void;
    onAddToCart?: (productId: string, selectedSize?: string) => void;
    onToggleFavorite?: (productId: string) => void;
    isFavorited?: boolean;
    isLoadingFavorite?: boolean;
  }

  let { 
    product, 
    onClose, 
    onAddToCart, 
    onToggleFavorite, 
    isFavorited = false, 
    isLoadingFavorite = false 
  }: Props = $props();

  let selectedSize = $state<string>('');
  let showSellerInfo = $state(false);
  let modalRef = $state<HTMLElement>();
  
  // Constants
  const ESCAPE_KEY = 'Escape';
  const TAB_KEY = 'Tab';
  
  // Derived states
  const hasMultipleSizes = $derived(product.sizes && product.sizes.length > 1);
  const requiresSizeSelection = $derived(product.sizes && product.sizes.length > 0);
  const canPurchase = $derived(!requiresSizeSelection || selectedSize);
  const sellerInitial = $derived(product.seller_name?.charAt(0).toUpperCase() || 'S');
  const formattedPrice = $derived(`£${product.price.toFixed(2)}`);
  const imageUrl = $derived(product.images?.[0] || '/placeholder-product.svg');
  
  // Auto-select single size
  $effect(() => {
    if (product.sizes?.length === 1 && !selectedSize) {
      selectedSize = product.sizes[0];
    }
  });
  
  // Focus trap and escape key handling
  $effect(() => {
    if (modalRef) {
      const focusableElements = modalRef.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      // Focus first element
      firstElement?.focus();
      
      function handleKeyDown(e: KeyboardEvent) {
        if (e.key === ESCAPE_KEY) {
          onClose();
        } else if (e.key === TAB_KEY) {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  });

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
  
  function toggleSellerInfo(e: MouseEvent) {
    e.stopPropagation();
    showSellerInfo = !showSellerInfo;
  }
  
  function handleAddToCart() {
    onAddToCart?.(product.id, selectedSize);
  }
  
  function handleToggleFavorite() {
    onToggleFavorite?.(product.id);
  }
</script>

<!-- Modal backdrop -->
<div
  class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
  onclick={handleBackdropClick}
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title-{product.id}"
  aria-describedby="modal-desc-{product.id}"
>
  <!-- Modal content -->
  <div 
    bind:this={modalRef}
    class="bg-white rounded-xl w-full max-w-72 p-3 shadow-xl"
    role="document"
  >
    <!-- Product image with close button -->
    <div class="aspect-square rounded-lg mb-3 relative overflow-hidden bg-gray-100">
      <img 
        src={imageUrl} 
        alt="{product.title} product image"
        class="w-full h-full object-cover"
        loading="eager"
      />
      
      <!-- Close button -->
      <button
        onclick={onClose}
        class="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        aria-label="Close product details"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <!-- Seller info button -->
      {#if product.seller_name}
        <button 
          onclick={toggleSellerInfo}
          class="absolute bottom-2 left-2 flex items-center gap-1.5 bg-white/95 md:backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors duration-200 {showSellerInfo ? 'px-2.5 py-1.5' : 'pr-2'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          aria-label="View seller information for {product.seller_name}"
          aria-expanded={showSellerInfo}
        >
          <div class="w-7 h-7 rounded-full border-2 border-white bg-gray-200 overflow-hidden flex-shrink-0">
            {#if product.seller_avatar}
              <img 
                src={product.seller_avatar} 
                alt="{product.seller_name} avatar" 
                class="w-full h-full object-cover"
              />
            {:else}
              <div class="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-500 font-semibold">
                {sellerInitial}
              </div>
            {/if}
          </div>
          <div 
            class="overflow-hidden transition-colors duration-200 {showSellerInfo ? 'max-w-40' : 'max-w-20'}"
            aria-hidden={!showSellerInfo}
          >
            {#if showSellerInfo}
              <div class="text-left">
                <p class="text-xs font-medium text-gray-900">{product.seller_name}</p>
                {#if product.seller_rating}
                  <div class="flex items-center gap-0.5">
                    <svg class="w-3 h-3 text-yellow-500 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                    <span class="text-xs text-gray-500" aria-label="Rating: {product.seller_rating} stars">
                      {product.seller_rating}
                    </span>
                  </div>
                {/if}
              </div>
            {:else}
              <span class="text-xs text-gray-900 font-medium whitespace-nowrap">{product.seller_name}</span>
            {/if}
          </div>
        </button>
      {/if}
    </div>

    <!-- Product info -->
    <h2 id="modal-title-{product.id}" class="font-semibold text-sm mb-1">
      {product.title}
    </h2>
    
    <div class="flex items-center justify-between mb-3">
      <p class="text-lg font-bold" aria-label="Price: {formattedPrice}">
        {formattedPrice}
      </p>
      {#if product.favorite_count && product.favorite_count > 0}
        <div class="flex items-center gap-1 text-xs text-gray-500">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
          </svg>
          <span aria-label="{product.favorite_count} people favorited this">
            {product.favorite_count}
          </span>
        </div>
      {/if}
    </div>

    <!-- Size selector -->
    {#if requiresSizeSelection}
      <fieldset class="mb-3">
        <legend class="text-xs text-gray-500 mb-1.5">
          Size {hasMultipleSizes ? '(required)' : ''}
        </legend>
        <div class="flex gap-1 flex-wrap" role="radiogroup" aria-required="true">
          {#each product.sizes as size}
            <button
              onclick={() => selectedSize = size}
              class="px-2 py-1 text-xs border rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black {selectedSize === size ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-gray-400'}"
              role="radio"
              aria-checked={selectedSize === size}
              aria-label="Size {size}"
            >
              {size}
            </button>
          {/each}
        </div>
      </fieldset>
    {/if}

    <!-- Description for screen readers -->
    <div id="modal-desc-{product.id}" class="sr-only">
      <p>Quick view for {product.title}</p>
      <p>Price: {formattedPrice}</p>
      {#if product.seller_name}
        <p>Sold by {product.seller_name}</p>
      {/if}
      {#if requiresSizeSelection}
        <p>Available sizes: {product.sizes.join(', ')}</p>
      {/if}
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <button 
        onclick={handleAddToCart}
        disabled={!canPurchase}
        class="flex-1 bg-black text-white text-sm py-2.5 px-4 rounded-lg font-medium transition-colors hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Buy {product.title} now{selectedSize ? ` in size ${selectedSize}` : ''}"
      >
        Buy Now
      </button>
      <button 
        onclick={handleToggleFavorite}
        disabled={isLoadingFavorite}
        class="p-2.5 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black {isLoadingFavorite ? 'opacity-50 cursor-wait' : ''} {isFavorited ? 'border-red-300 bg-red-50 text-red-600' : 'border-gray-300 hover:bg-gray-50'}"
        aria-label="{isFavorited ? 'Remove from' : 'Add to'} favorites"
        aria-pressed={isFavorited}
      >
        {#if isLoadingFavorite}
          <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="sr-only">Loading...</span>
        {:else}
          <svg class="w-4 h-4 transition-colors" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        {/if}
      </button>
    </div>
  </div>
</div>