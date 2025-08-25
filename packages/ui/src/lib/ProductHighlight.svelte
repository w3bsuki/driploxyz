<script lang="ts">
  import type { Product } from './types.js';
  
  interface Props {
    product: Product;
    onProductClick?: (product: Product) => void;
    onBuy?: (productId: string, selectedSize?: string) => void;
    onToggleFavorite?: (productId: string) => void;
    isFavorite?: boolean;
    isLoadingFavorite?: boolean;
    currency?: string;
    formatPrice?: (price: number) => string;
    index?: number;
    totalCount?: number;
  }

  let { 
    product, 
    onProductClick,
    onBuy,
    onToggleFavorite,
    isFavorite = false,
    isLoadingFavorite = false,
    currency = '$', 
    formatPrice = (price: number) => `${currency}${price.toFixed(2)}`,
    index = 0,
    totalCount = 1
  }: Props = $props();
  
  // Derived states
  const imageUrl = $derived(
    product.images?.[0]?.image_url || 
    product.images?.[0] || 
    '/placeholder-product.svg'
  );
  
  const sellerInitial = $derived(
    product.seller_name?.charAt(0).toUpperCase() || 'S'
  );
  
  const formattedPrice = $derived(
    formatPrice(product.price)
  );
  
  function handleClick() {
    onProductClick?.(product);
  }
  
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }
</script>

<article 
  class="relative shrink-0 group"
  aria-label="Product: {product.title}"
>
  <button 
    onclick={handleClick}
    onkeydown={handleKeyDown}
    class="block w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/20 rounded-2xl transition-all"
    aria-label="View {product.title} - {formattedPrice}"
    aria-describedby="product-{product.id}-info"
    tabindex={index === 0 ? 0 : -1}
  >
    <div class="relative rounded-2xl shadow-sm bg-white p-1 group-hover:shadow-md transition-shadow">
      <div class="bg-gray-50/80 relative rounded-xl border border-gray-100 overflow-hidden">
        <!-- Product image -->
        <figure class="w-32 h-32 sm:w-40 sm:h-40 relative">
          <img 
            src={imageUrl} 
            alt="{product.title} product image"
            class="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
          
          <!-- Bottom info -->
          <figcaption class="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <!-- Seller avatar -->
            <div 
              class="w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm"
              aria-hidden="true"
            >
              <div class="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 font-medium">
                {sellerInitial}
              </div>
            </div>
            
            <!-- Price badge -->
            <div 
              class="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold px-2 py-1 rounded-lg shadow-sm"
              aria-label="Price"
            >
              {formattedPrice}
            </div>
          </figcaption>
        </figure>
      </div>
    </div>
    
    <!-- Title below -->
    <div class="mt-1.5 px-1 w-32 sm:w-40">
      <h3 class="text-xs text-gray-700 truncate">
        {product.title}
      </h3>
    </div>
  </button>
  
  <!-- Screen reader info -->
  <div id="product-{product.id}-info" class="sr-only">
    <p>Product {index + 1} of {totalCount}</p>
    {#if product.seller_name}
      <p>Sold by {product.seller_name}</p>
    {/if}
    {#if product.condition}
      <p>Condition: {product.condition}</p>
    {/if}
    {#if product.sizes?.length}
      <p>Available sizes: {product.sizes.join(', ')}</p>
    {/if}
  </div>
</article>

