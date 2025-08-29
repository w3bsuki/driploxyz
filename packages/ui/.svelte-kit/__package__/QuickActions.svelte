<script lang="ts">
  import { scale, fly, fade } from 'svelte/transition';
  import { quintOut, elasticOut } from 'svelte/easing';

  interface Props {
    isFavorited?: boolean;
    isInCart?: boolean;
    shareCount?: number;
    favoriteCount?: number;
    onFavorite?: () => void;
    onShare?: () => void;
    onAddToCart?: () => void;
    onMessage?: () => void;
    position?: 'right' | 'left';
    showLabels?: boolean;
    class?: string;
  }

  let { 
    isFavorited = false,
    isInCart = false,
    shareCount = 0,
    favoriteCount = 0,
    onFavorite,
    onShare,
    onAddToCart,
    onMessage,
    position = 'right',
    showLabels = false,
    class: className = '' 
  }: Props = $props();

  let isExpanded = $state(false);
  let justFavorited = $state(false);
  let justShared = $state(false);

  function handleFavorite() {
    onFavorite?.();
    justFavorited = true;
    setTimeout(() => justFavorited = false, 1000);
  }

  function handleShare() {
    onShare?.();
    justShared = true;
    setTimeout(() => justShared = false, 1000);
  }

  function toggleExpanded() {
    isExpanded = !isExpanded;
  }

  const positionClasses = $derived(() => {
    return position === 'right' 
      ? 'right-4 items-end' 
      : 'left-4 items-start';
  });
</script>

<!-- Mobile Quick Actions (only visible on mobile) -->
<div class="lg:hidden fixed top-1/2 -translate-y-1/2 z-30 {positionClasses} {className}">
  <div class="flex flex-col gap-3">
    
    <!-- Main Action Button (Favorite) -->
    <button
      onclick={handleFavorite}
      class="relative w-14 h-14 bg-white rounded-full shadow-sm md:shadow-lg flex items-center justify-center transition-colors duration-200 hover:scale-110 active:scale-95
             {isFavorited ? 'bg-red-50 shadow-red-100' : 'hover:shadow-sm md:hover:shadow-xl'}"
      in:scale={{ duration: 300, easing: elasticOut }}
    >
      <!-- Heart Icon -->
      <svg 
        class="w-6 h-6 transition-colors duration-200 {isFavorited ? 'text-red-500 scale-110' : 'text-gray-700'}" 
        fill={isFavorited ? 'currentColor' : 'none'}
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
      </svg>

      <!-- Favorite Count Badge -->
      {#if favoriteCount > 0}
        <div 
          class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
          in:scale={{ duration: 200, easing: quintOut }}
        >
          {favoriteCount > 99 ? '99+' : favoriteCount}
        </div>
      {/if}

      <!-- Animation on favorite -->
      {#if justFavorited}
        <div 
          class="absolute inset-0 bg-red-500 rounded-full opacity-30"
          in:scale={{ duration: 300, easing: quintOut }}
          out:fade={{ duration: 200 }}
        ></div>
      {/if}
    </button>

    <!-- Share Button -->
    <button
      onclick={handleShare}
      class="relative w-12 h-12 bg-white rounded-full shadow-sm md:shadow-lg flex items-center justify-center transition-colors duration-200 hover:scale-110 active:scale-95 hover:shadow-sm md:hover:shadow-xl"
      in:fly={{ x: position === 'right' ? 20 : -20, duration: 300, delay: 100, easing: quintOut }}
    >
      <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326"/>
      </svg>

      <!-- Share animation -->
      {#if justShared}
        <div 
          class="absolute inset-0 bg-blue-500 rounded-full opacity-30"
          in:scale={{ duration: 300, easing: quintOut }}
          out:fade={{ duration: 200 }}
        ></div>
      {/if}
    </button>

    <!-- Add to Cart Button -->
    {#if onAddToCart}
      <button
        onclick={onAddToCart}
        class="relative w-12 h-12 bg-white rounded-full shadow-sm md:shadow-lg flex items-center justify-center transition-colors duration-200 hover:scale-110 active:scale-95 hover:shadow-sm md:hover:shadow-xl
               {isInCart ? 'bg-green-50 shadow-green-100' : ''}"
        in:fly={{ x: position === 'right' ? 20 : -20, duration: 300, delay: 200, easing: quintOut }}
      >
        {#if isInCart}
          <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        {:else}
          <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l1.5-6m4.5 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm9 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
          </svg>
        {/if}
      </button>
    {/if}

    <!-- Message Seller Button -->
    {#if onMessage}
      <button
        onclick={onMessage}
        class="w-12 h-12 bg-white rounded-full shadow-sm md:shadow-lg flex items-center justify-center transition-colors duration-200 hover:scale-110 active:scale-95 hover:shadow-sm md:hover:shadow-xl"
        in:fly={{ x: position === 'right' ? 20 : -20, duration: 300, delay: 300, easing: quintOut }}
        aria-label="Message seller"
      >
        <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
      </button>
    {/if}

    <!-- Labels (if enabled) -->
    {#if showLabels}
      <div 
        class="space-y-2 text-xs font-medium text-gray-600 {position === 'right' ? 'text-right mr-16' : 'text-left ml-16'}"
        in:fade={{ duration: 200, delay: 400 }}
      >
        <div>Favorite</div>
        <div>Share</div>
        {#if onAddToCart}<div>Add to cart</div>{/if}
        {#if onMessage}<div>Message</div>{/if}
      </div>
    {/if}
  </div>
</div>

<!-- Desktop Quick Actions Bar (subtle, top-right corner) -->
<div class="hidden lg:block fixed top-20 right-4 z-30">
  <div class="flex items-center gap-2 bg-white/90 md:backdrop-blur-xs rounded-full px-4 py-2 shadow-sm md:shadow-lg">
    <!-- Favorite -->
    <button
      onclick={handleFavorite}
      class="relative p-2 rounded-full transition-colors duration-200 hover:bg-gray-100 active:scale-95
             {isFavorited ? 'bg-red-50 text-red-500' : 'text-gray-600'}"
      title="Add to favorites"
    >
      <svg 
        class="w-5 h-5" 
        fill={isFavorited ? 'currentColor' : 'none'}
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
      </svg>
      
      {#if favoriteCount > 0}
        <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {favoriteCount}
        </span>
      {/if}
    </button>

    <!-- Share -->
    <button
      onclick={handleShare}
      class="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors duration-200 active:scale-95"
      title="Share product"
      aria-label="Share product"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326"/>
      </svg>
    </button>

    <!-- Divider -->
    <div class="w-px h-6 bg-gray-200"></div>

    <!-- Add to Cart -->
    {#if onAddToCart}
      <button
        onclick={onAddToCart}
        class="p-2 rounded-full transition-colors duration-200 active:scale-95
               {isInCart ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-100'}"
        title={isInCart ? 'In cart' : 'Add to cart'}
      >
        {#if isInCart}
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        {:else}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l1.5-6m4.5 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm9 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
          </svg>
        {/if}
      </button>
    {/if}

    <!-- Message -->
    {#if onMessage}
      <button
        onclick={onMessage}
        class="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors duration-200 active:scale-95"
        title="Message seller"
        aria-label="Message seller"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
      </button>
    {/if}
  </div>
</div>