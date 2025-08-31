<script lang="ts">
  import { slide, fly, fade } from 'svelte/transition';
  import { quintOut, cubicOut } from 'svelte/easing';
  import SizeSelector from './SizeSelector.svelte';
  import ConditionReport from './ConditionReport.svelte';
  import SellerCard from './SellerCard.svelte';
  import LiveActivity from './LiveActivity.svelte';

  interface Product {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    brand?: string;
    size?: string;
    color?: string;
    condition: string;
    description?: string;
    shipping?: {
      price: number;
      estimatedDays: number;
    };
  }

  interface Props {
    product: Product;
    sizes?: any[];
    seller?: any;
    selectedSize?: string;
    isVisible?: boolean;
    onBuyNow?: () => void;
    onMakeOffer?: () => void;
    onAddToCart?: () => void;
    onFavorite?: () => void;
    onShare?: () => void;
    onClose?: () => void;
    class?: string;
  }

  let { 
    product,
    sizes = [],
    seller,
    selectedSize = $bindable(),
    isVisible = false,
    onBuyNow,
    onMakeOffer,
    onAddToCart,
    onFavorite,
    onShare,
    onClose,
    class: className = '' 
  }: Props = $props();

  let sheetRef: HTMLDivElement;
  let isDragging = $state(false);
  let dragY = $state(0);
  let startY = $state(0);
  let currentSection = $state<'info' | 'condition' | 'seller'>('info');

  // Sheet height states
  let isExpanded = $state(false);
  let isFullscreen = $state(false);

  function handleTouchStart(event: TouchEvent) {
    isDragging = true;
    startY = event.touches[0].clientY;
    dragY = 0;
  }

  function handleTouchMove(event: TouchEvent) {
    if (!isDragging) return;
    
    const currentY = event.touches[0].clientY;
    const deltaY = currentY - startY;
    
    // Only allow pulling down, not up
    if (deltaY > 0) {
      dragY = deltaY;
    }
  }

  function handleTouchEnd() {
    if (!isDragging) return;
    
    isDragging = false;
    
    // Close sheet if dragged down more than 100px
    if (dragY > 100) {
      onClose?.();
    } else {
      dragY = 0;
    }
  }

  function toggleExpanded() {
    isExpanded = !isExpanded;
  }

  function toggleFullscreen() {
    isFullscreen = !isFullscreen;
  }

  const sheetHeight = $derived(() => {
    if (isFullscreen) return 'h-screen';
    if (isExpanded) return 'h-[85vh]';
    return 'h-[60vh]';
  });

  const transformStyle = $derived(() => {
    if (isDragging && dragY > 0) {
      return `transform: translateY(${dragY}px)`;
    }
    return '';
  });
</script>

<!-- Backdrop -->
{#if isVisible}
  <button 
    class="fixed inset-0 bg-black/50 z-40 lg:hidden bg-transparent border-0 cursor-default"
    onclick={onClose}
    aria-label="Close product sheet"
    tabindex="-1"
    in:fade={{ duration: 200 }}
    out:fade={{ duration: 200 }}
  ></button>
{/if}

<!-- Mobile Sheet -->
{#if isVisible}
  <div 
    bind:this={sheetRef}
    class="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-sm md:shadow-2xl z-50 lg:hidden {sheetHeight} {className}"
    style={transformStyle}
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
    in:slide={{ duration: 300, easing: quintOut }}
    out:slide={{ duration: 200, easing: cubicOut }}
  >
    <!-- Drag Handle -->
    <div class="flex justify-center py-3 border-b border-gray-100">
      <div class="w-12 h-1 bg-gray-300 rounded-full"></div>
    </div>

    <!-- Sheet Header -->
    <div class="sticky top-0 bg-white z-10 border-b border-gray-100">
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center gap-3">
          <button
            onclick={onClose}
            class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
            aria-label="Close product details"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          
          <!-- Quick Actions -->
          <div class="flex items-center gap-2">
            <button
              onclick={onShare}
              class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              aria-label="Share product"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326"/>
              </svg>
            </button>
            
            <button
              onclick={onFavorite}
              class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              aria-label="Add to favorites"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Expand/Fullscreen Toggle -->
        <div class="flex items-center gap-2">
          <button
            onclick={toggleExpanded}
            class="text-sm text-blue-600 font-medium"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
          
          <button
            onclick={toggleFullscreen}
            class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
            aria-label="Toggle fullscreen"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4a4 4 0 114 4H4zM20 8V4a4 4 0 10-4 4h4zM4 16v4a4 4 0 104-4H4zM20 16v4a4 4 0 01-4-4h4z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Sheet Content -->
    <div class="flex-1 overflow-y-auto">
      <!-- Product Header -->
      <div class="p-4 border-b border-gray-100">
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            {#if product.brand}
              <p class="text-sm font-medium text-gray-500 uppercase tracking-wide">{product.brand}</p>
            {/if}
            <h1 class="text-xl font-bold text-gray-900 leading-tight">{product.title}</h1>
          </div>
          
          <div class="text-right ml-4">
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-bold text-gray-900">${product.price}</span>
              {#if product.originalPrice && product.originalPrice > product.price}
                <span class="text-sm text-gray-500 line-through">${product.originalPrice}</span>
              {/if}
            </div>
            {#if product.shipping}
              <p class="text-xs text-gray-500 mt-1">
                {product.shipping.price > 0 ? `+$${product.shipping.price} shipping` : 'Free shipping'}
              </p>
            {/if}
          </div>
        </div>

        <!-- Quick Info Grid -->
        <div class="grid grid-cols-3 gap-2 text-center">
          {#if product.size}
            <div class="bg-gray-50 rounded-lg p-2">
              <p class="text-xs text-gray-500">Size</p>
              <p class="text-sm font-semibold">{product.size}</p>
            </div>
          {/if}
          {#if product.color}
            <div class="bg-gray-50 rounded-lg p-2">
              <p class="text-xs text-gray-500">Color</p>
              <p class="text-sm font-semibold">{product.color}</p>
            </div>
          {/if}
          <div class="bg-gray-50 rounded-lg p-2">
            <p class="text-xs text-gray-500">Condition</p>
            <p class="text-sm font-semibold capitalize">{product.condition}</p>
          </div>
        </div>
      </div>

      <!-- Section Navigation -->
      <div class="sticky top-16 bg-white z-10 border-b border-gray-100">
        <div class="flex">
          {#each ['info', 'condition', 'seller'] as section}
            <button
              onclick={() => currentSection = section}
              class="flex-1 py-3 px-4 text-sm font-medium capitalize transition-colors
                     {currentSection === section 
                       ? 'text-black border-b-2 border-black' 
                       : 'text-gray-500 hover:text-gray-900'}"
            >
              {section}
            </button>
          {/each}
        </div>
      </div>

      <!-- Section Content -->
      <div class="p-4 space-y-6">
        {#if currentSection === 'info'}
          <div in:fade={{ duration: 200 }}>
            <!-- Size Selector -->
            {#if sizes.length > 0}
              <SizeSelector 
                {sizes} 
                bind:selectedSize
                showStock={true}
                class="mb-6"
              />
            {/if}

            <!-- Live Activity -->
            <LiveActivity 
              productId={product.id}
              currentViewers={3}
              inCarts={1}
              totalViews={247}
              totalFavorites={32}
              recentActivity={[
                { id: '1', type: 'view', user: 'Sarah', timestamp: new Date(Date.now() - 300000).toISOString(), avatar: '/placeholder-avatar.jpg' },
                { id: '2', type: 'cart', user: 'Mike', timestamp: new Date(Date.now() - 600000).toISOString() },
                { id: '3', type: 'favorite', user: 'Emma', timestamp: new Date(Date.now() - 900000).toISOString() }
              ]}
              lastSold={{ amount: product.price + 5, date: new Date(Date.now() - 86400000 * 3).toISOString() }}
              class="mb-6"
            />

            <!-- Description -->
            {#if product.description}
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">Description</h3>
                <p class="text-gray-900 leading-relaxed">{product.description}</p>
              </div>
            {/if}
          </div>
        {/if}

        {#if currentSection === 'condition'}
          <div in:fade={{ duration: 200 }}>
            <ConditionReport 
              condition={product.condition}
              authenticatedBy="Driplo"
              description="This item has been carefully inspected and authenticated by our team."
            />
          </div>
        {/if}

        {#if currentSection === 'seller' && seller}
          <div in:fade={{ duration: 200 }}>
            <SellerCard 
              id={seller.id}
              name={seller.name}
              avatar={seller.avatar}
              stats={seller.stats}
              showFullStats={true}
              onFollow={() => {}}
              onMessage={() => {}}
              onViewProfile={() => {}}
            />
          </div>
        {/if}
      </div>

      <!-- Bottom Padding for Fixed Actions -->
      <div class="h-24"></div>
    </div>

    <!-- Fixed Action Buttons -->
    <div class="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div class="flex gap-3">
        <!-- Make Offer Button -->
        <button
          onclick={onMakeOffer}
          class="flex-1 bg-gray-100 text-gray-900 font-semibold py-3 px-4 rounded-xl transition-colors hover:bg-gray-200"
        >
          Make Offer
        </button>

        <!-- Buy Now Button -->
        <button
          onclick={onBuyNow}
          class="flex-2 bg-black text-white font-semibold py-3 px-6 rounded-xl transition-colors hover:bg-gray-800 disabled:opacity-50"
          disabled={sizes.length > 0 && !selectedSize}
        >
          {sizes.length > 0 && !selectedSize ? 'Select Size' : `Buy • $${product.price}`}
        </button>
      </div>

      <!-- Size Warning -->
      {#if sizes.length > 0 && !selectedSize}
        <p class="text-xs text-orange-600 mt-2 text-center">Please select a size to continue</p>
      {/if}
    </div>
  </div>
{/if}

<style>
  .flex-2 {
    flex: 2;
  }
</style>