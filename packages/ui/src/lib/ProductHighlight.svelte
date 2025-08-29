<script lang="ts">
  import type { Product } from '../types';
  
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
    class="block w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/20 rounded-2xl transition-all pt-2"
    aria-label="View {product.title} - {formattedPrice}"
    aria-describedby="product-{product.id}-info"
    tabindex={index === 0 ? 0 : -1}
  >
    <div class="relative rounded-2xl shadow-sm bg-white p-1 group-hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
      <!-- PRO Badge - Outside frame, top center -->
      {#if product.is_promoted}
        <div class="absolute -top-1.5 left-1/2 -translate-x-1/2 z-10">
          <div class="bg-black text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg border border-white/20">
            PRO
          </div>
        </div>
      {/if}
      
      <div class="bg-gray-50/60 relative rounded-xl border border-gray-200/60 overflow-hidden backdrop-blur-sm">
        <!-- Product image -->
        <figure class="w-[calc((100vw-4.8rem)/3)] h-[calc((100vw-4.8rem)/3)] sm:w-32 sm:h-32 lg:w-36 lg:h-36 relative max-w-32">
          <img 
            src={imageUrl} 
            alt="{product.title} product image"
            class="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </figure>
      </div>
      
      <!-- Price badge - Bottom center like PRO badge -->
      <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 z-10">
        <div 
          class="bg-black text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg border border-white/20"
          aria-label="Price"
        >
          {formattedPrice}
        </div>
      </div>
    </div>
    
    <!-- Title only (no avatar) -->
    <div class="mt-2.5 px-1 w-[calc((100vw-4.8rem)/3)] sm:w-32 lg:w-36 max-w-32">
      <h3 class="text-xs text-gray-700 truncate text-center">
        {product.title}
      </h3>
    </div>
  </button>
  
  <!-- Screen reader info -->
  <div id="product-{product.id}-info" class="sr-only">
    <p>Product {index + 1} of {totalCount}</p>
    <p>Price: {formattedPrice}</p>
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

