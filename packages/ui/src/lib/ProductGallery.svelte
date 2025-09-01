<script lang="ts">
  import { fly, fade, scale } from 'svelte/transition';
  import { cubicOut, quintOut } from 'svelte/easing';

  interface Props {
    images: Array<{ image_url: string; alt_text?: string; id?: string }> | string[];
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
  let galleryRef: HTMLDivElement;
  let imageRef: HTMLImageElement;

  let selectedImage = $state('/placeholder-product.svg');
  
  $effect(() => {
    if (!images || !images[selectedIndex]) {
      selectedImage = '/placeholder-product.svg';
    } else {
      const image = images[selectedIndex];
      selectedImage = typeof image === 'string' ? image : image.image_url;
    }
  });
  
  const conditionColors = $derived(({
    'new': 'bg-emerald-500 text-white',
    'like-new': 'bg-blue-500 text-white', 
    'good': 'bg-amber-500 text-white',
    'fair': 'bg-orange-500 text-white'
  }[condition || ''] || 'bg-gray-500 text-white'));

  const conditionLabels = $derived(({
    'new': translations.new || 'New with tags',
    'like-new': translations.likeNew || 'Like new',
    'good': translations.good || 'Good condition',
    'fair': translations.fair || 'Fair condition'
  }[condition || ''] || condition));

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' && selectedIndex > 0) {
      selectedIndex--;
    } else if (event.key === 'ArrowRight' && images && selectedIndex < images.length - 1) {
      selectedIndex++;
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
    
    if (Math.abs(diff) > swipeThreshold && images) {
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
  class="relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden {className}"
  bind:this={galleryRef}
>
  <!-- Main Image Container with fixed aspect ratio -->
  <div 
    class="relative w-full h-full bg-gray-50"
    ontouchstart={handleTouchStart}
    ontouchend={handleTouchEnd}
  >
    {#key selectedIndex}
      <img 
        bind:this={imageRef}
        src={selectedImage}
        alt="{title} - Image {selectedIndex + 1}"
        class="absolute inset-0 w-full h-full object-cover"
        draggable="false"
        loading="eager"
        decoding="async"
      />
    {/key}

    <!-- Condition Badge -->
    {#if condition}
      <div class="absolute top-4 left-4 z-10">
        <span class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm md:shadow-lg md:backdrop-blur-xs {conditionColors}">
          {conditionLabels}
        </span>
      </div>
    {/if}

    <!-- Navigation Arrows (Desktop) -->
    {#if images && images.length > 1}
      <div class="hidden md:block">
        <!-- Previous -->
        {#if selectedIndex > 0}
          <button
            onclick={() => selectedIndex--}
            class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-sm md:shadow-lg flex items-center justify-center transition-colors duration-200 hover:scale-110 z-10"
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
            class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-sm md:shadow-lg flex items-center justify-center transition-colors duration-200 hover:scale-110 z-10"
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
    {#if images && images.length > 1}
      <div class="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium md:backdrop-blur-xs">
        {selectedIndex + 1} / {images?.length || 0}
      </div>
    {/if}

  </div>

  <!-- Thumbnail Strip -->
  {#if images && images.length > 1}
    <div class="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/20 to-transparent">
      <div class="flex gap-2 overflow-x-auto scroll-snap-type-x scroll-snap-type-mandatory scrollbar-hide">
        {#each images as image, index}
          <button
            onclick={() => handleThumbnailClick(index)}
            class="shrink-0 w-16 h-16 rounded-lg overflow-hidden ring-2 transition-colors duration-200 scroll-snap-align-start
                   {selectedIndex === index ? 'ring-white scale-105' : 'ring-transparent hover:ring-white/50'}"
            aria-label="View image {index + 1}"
          >
            <img 
              src={typeof image === 'string' ? image : image.image_url} 
              alt="{title} thumbnail {index + 1}"
              class="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              sizes="64px"
            />
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

