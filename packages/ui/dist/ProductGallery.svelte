<script lang="ts">
  import { fly, fade, scale } from 'svelte/transition';
  import { cubicOut, quintOut } from 'svelte/easing';

  interface Props {
    images: string[];
    title: string;
    condition?: string;
    isAuthenticated?: boolean;
    class?: string;
    translations?: {
      new?: string;
      likeNew?: string;
      good?: string;
      fair?: string;
    };
  }

  let { 
    images, 
    title, 
    condition,
    isAuthenticated = false,
    class: className = '',
    translations = {
      new: 'New with tags',
      likeNew: 'Like new',
      good: 'Good condition',
      fair: 'Fair condition'
    }
  }: Props = $props();

  let selectedIndex = $state(0);
  let isZoomed = $state(false);
  let galleryRef: HTMLDivElement;
  let imageRef: HTMLImageElement;

  const selectedImage = $derived(images[selectedIndex] || '/placeholder-product.svg');
  
  const conditionColors = $derived({
    'new': 'bg-emerald-500 text-white',
    'like-new': 'bg-blue-500 text-white', 
    'good': 'bg-amber-500 text-white',
    'fair': 'bg-orange-500 text-white'
  }[condition || ''] || 'bg-gray-500 text-white');

  const conditionLabels = $derived({
    'new': translations.new || 'New with tags',
    'like-new': translations.likeNew || 'Like new',
    'good': translations.good || 'Good condition',
    'fair': translations.fair || 'Fair condition'
  }[condition || ''] || condition);

  function handleImageClick() {
    isZoomed = !isZoomed;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' && selectedIndex > 0) {
      selectedIndex--;
    } else if (event.key === 'ArrowRight' && selectedIndex < images.length - 1) {
      selectedIndex++;
    } else if (event.key === 'Escape') {
      isZoomed = false;
    }
  }

  function handleThumbnailClick(index: number) {
    selectedIndex = index;
  }


  // Mobile swipe handling
  let touchStartX = 0;
  let touchEndX = 0;

  function handleTouchStart(event: TouchEvent) {
    touchStartX = event.changedTouches[0].screenX;
  }

  function handleTouchEnd(event: TouchEvent) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
  }

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && selectedIndex < images.length - 1) {
        selectedIndex++;
      } else if (diff < 0 && selectedIndex > 0) {
        selectedIndex--;
      }
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div 
  class="relative h-full bg-white rounded-xl overflow-hidden {className}"
  bind:this={galleryRef}
>
  <!-- Main Image Container -->
  <div 
    class="relative h-full bg-gray-50 overflow-hidden cursor-zoom-{isZoomed ? 'out' : 'in'}"
    onclick={handleImageClick}
    ontouchstart={handleTouchStart}
    ontouchend={handleTouchEnd}
    role="button"
    tabindex="0"
    aria-label="Product image gallery - click to zoom"
  >
    {#key selectedIndex}
      <img 
        bind:this={imageRef}
        src={selectedImage}
        alt="{title} - Image {selectedIndex + 1}"
        class="w-full h-full object-contain transition-transform duration-300 ease-out
               {isZoomed ? 'scale-150' : 'scale-100'}"
        draggable="false"
      />
    {/key}

    <!-- Condition Badge -->
    {#if condition}
      <div class="absolute top-4 left-4 z-10">
        <span class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm {conditionColors}">
          {conditionLabels}
        </span>
      </div>
    {/if}

    <!-- Navigation Arrows (Desktop) -->
    {#if images.length > 1}
      <div class="hidden md:block">
        <!-- Previous -->
        {#if selectedIndex > 0}
          <button
            onclick={() => selectedIndex--}
            class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
            aria-label="Previous image"
          >
            <svg class="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
        {/if}

        <!-- Next -->
        {#if selectedIndex < images.length - 1}
          <button
            onclick={() => selectedIndex++}
            class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
            aria-label="Next image"
          >
            <svg class="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        {/if}
      </div>
    {/if}

    <!-- Image Counter -->
    {#if images.length > 1}
      <div class="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
        {selectedIndex + 1} / {images.length}
      </div>
    {/if}

    <!-- Zoom Indicator -->
    {#if isZoomed}
      <div class="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
        Click to zoom out • ESC to exit
      </div>
    {/if}
  </div>

  <!-- Thumbnail Strip -->
  {#if images.length > 1}
    <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/20 to-transparent">
      <div class="flex gap-2 overflow-x-auto scrollbar-hide">
        {#each images as image, index}
          <button
            onclick={() => handleThumbnailClick(index)}
            class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden ring-2 transition-all duration-200
                   {selectedIndex === index ? 'ring-white scale-105' : 'ring-transparent hover:ring-white/50'}"
            aria-label="View image {index + 1}"
          >
            <img 
              src={image} 
              alt="{title} thumbnail {index + 1}"
              class="w-full h-full object-cover"
            />
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .scrollbar-hide {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>