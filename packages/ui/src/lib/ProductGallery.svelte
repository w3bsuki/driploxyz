<script lang="ts">
  import { createDialog, melt } from '@melt-ui/svelte';
  import { Avatar } from '.';
  import { getWebVitalsTracker, trackImageLoadStart, trackImageLoadEnd, trackImageError } from './utils/performance';

  interface ImageVariant {
    image_url: string;
    alt_text?: string;
    id?: string;
    width?: number;
    height?: number;
    placeholder?: string;
  }

  interface Props {
    images: Array<ImageVariant> | string[];
    title: string;
    condition?: string;
    isSold?: boolean;
    seller?: {
      name?: string;
      username?: string;
      avatar?: string;
      rating?: number;
    };
    createdAt?: string;
    isAuthenticated?: boolean;
    class?: string;
    onDoubleTap?: () => void;
    translations?: {
      new?: string;
      likeNew?: string;
      good?: string;
      fair?: string;
    };
    preloadFirstImage?: boolean;
    enableLQIP?: boolean;
    sizes?: string;
    aspectRatio?: number;
    hideZoomIndicator?: boolean;
  }

  let { 
    images, 
    title, 
    condition,
    isSold = false,
    seller,
    createdAt,
    isAuthenticated = false,
    class: className = '',
    onDoubleTap,
    translations = {
      new: 'New with tags',
      likeNew: 'Like new',
      good: 'Good condition',
      fair: 'Fair condition'
    },
    preloadFirstImage = true,
    enableLQIP = true,
    sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
    aspectRatio = 1,
    hideZoomIndicator = false
  }: Props = $props();

  let selectedIndex = $state(0);
  let galleryRef: HTMLDivElement;
  let imageRef: HTMLImageElement = $state();

  // Advanced gallery state
  let isZoomed = $state(false);
  let zoomLevel = $state(1);
  let panX = $state(0);
  let panY = $state(0);
  let isDragging = $state(false);
  let touchStartX = $state(0);
  let touchStartY = $state(0);

  // Melt UI Dialog for fullscreen view
  const {
    elements: { trigger, portalled, overlay, content, close },
    states: { open }
  } = createDialog({
    preventScroll: true,
    closeOnOutsideClick: true,
    onOpenChange: ({ next }) => {
      if (!next) {
        resetZoom();
      }
      return next;
    }
  });

  let selectedImage = $state('/placeholder-product.svg');
  let selectedImageData = $state<ImageVariant | string | null>(null);
  let imageLoadingStates = $state<Record<number, 'loading' | 'loaded' | 'error'>>({}); 
  let imageDimensions = $state<Record<string, { width: number; height: number }>>({}); 
  let imageLoadStartTimes = $state<Record<string, number>>({});
  
  $effect(() => {
    if (!images || !images[selectedIndex]) {
      selectedImage = '/placeholder-product.svg';
      selectedImageData = null;
    } else {
      const image = images[selectedIndex];
      selectedImage = typeof image === 'string' ? image : image.image_url;
      selectedImageData = image;
    }
  });

  // Generate responsive image sources
  function generateImageSources(imageUrl: string): { srcset: string; sizes: string } {
    // For Supabase storage, we can generate different sizes
    if (imageUrl.includes('supabase')) {
      const baseUrl = imageUrl.split('?')[0];
      const srcset = [
        `${baseUrl}?width=300&quality=75 300w`,
        `${baseUrl}?width=600&quality=80 600w`, 
        `${baseUrl}?width=900&quality=85 900w`,
        `${baseUrl}?width=1200&quality=90 1200w`
      ].join(', ');
      return { srcset, sizes };
    }
    
    // Fallback for other image sources
    return { srcset: imageUrl, sizes: '100vw' };
  }

  // Generate LQIP (Low Quality Image Placeholder)
  function generateLQIP(imageUrl: string): string {
    if (!enableLQIP) return '';
    
    // For Supabase, generate a very small, low quality version
    if (imageUrl.includes('supabase')) {
      return `${imageUrl.split('?')[0]}?width=20&quality=20&blur=10`;
    }
    
    return '';
  }

  // Handle image load events for performance monitoring
  function handleImageLoad(index: number, event: Event) {
    imageLoadingStates[index] = 'loaded';
    
    const img = event.target as HTMLImageElement;
    const imageKey = typeof images[index] === 'string' ? images[index] as string : (images[index] as ImageVariant).image_url;
    
    imageDimensions[imageKey] = {
      width: img.naturalWidth,
      height: img.naturalHeight
    };

    // Track image load performance
    const startTime = imageLoadStartTimes[imageKey];
    if (startTime) {
      trackImageLoadEnd(imageKey, startTime, img);
      delete imageLoadStartTimes[imageKey];
    }

    // Report LCP candidate for performance monitoring
    if (index === 0) {
      try {
        performance.mark('gallery-first-image-loaded');
        const tracker = getWebVitalsTracker();
        tracker.markImageAsLCP(imageKey);
      } catch (e) {
        // Silently fail if performance API unavailable
      }
    }
  }

  function handleImageError(index: number) {
    imageLoadingStates[index] = 'error';
    
    const imageKey = typeof images[index] === 'string' ? images[index] as string : (images[index] as ImageVariant).image_url;
    const startTime = imageLoadStartTimes[imageKey];
    if (startTime) {
      trackImageError(imageKey, startTime);
      delete imageLoadStartTimes[imageKey];
    }
  }

  function handleImageLoadStart(index: number) {
    imageLoadingStates[index] = 'loading';
    
    const imageKey = typeof images[index] === 'string' ? images[index] as string : (images[index] as ImageVariant).image_url;
    imageLoadStartTimes[imageKey] = trackImageLoadStart(imageKey);
  }
  
  const conditionColors = $derived(({
    'new': 'bg-[color:var(--condition-new)] text-white',
    'like-new': 'bg-[color:var(--condition-like-new)] text-white', 
    'good': 'bg-[color:var(--condition-good)] text-white',
    'fair': 'bg-[color:var(--condition-fair)] text-white'
  }[condition || ''] || 'bg-[color:var(--text-muted)] text-white'));

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

  // Zoom and pan functions
  function resetZoom() {
    zoomLevel = 1;
    panX = 0;
    panY = 0;
    isZoomed = false;
  }

  function handleZoom(delta: number, clientX: number, clientY: number, rect: DOMRect) {
    const factor = delta > 0 ? 1.2 : 0.8;
    const newZoom = Math.min(Math.max(zoomLevel * factor, 1), 4);
    
    if (newZoom === 1) {
      resetZoom();
      return;
    }

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const zoomRatio = newZoom / zoomLevel;
    panX = (panX + (centerX - mouseX)) * zoomRatio - (centerX - mouseX);
    panY = (panY + (centerY - mouseY)) * zoomRatio - (centerY - mouseY);
    
    zoomLevel = newZoom;
    isZoomed = newZoom > 1;
  }

  // Enhanced touch handling with zoom support
  let touchStartTime = 0;
  let lastTap = 0;
  
  function handleAdvancedTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
      touchStartTime = Date.now();
      isDragging = true;
    }
  }

  function handleAdvancedTouchMove(event: TouchEvent) {
    if (!isDragging || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    if (isZoomed && $open) {
      // Pan when zoomed in fullscreen
      panX += deltaX * 0.5;
      panY += deltaY * 0.5;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      event.preventDefault();
    }
  }

  function handleAdvancedTouchEnd(event: TouchEvent) {
    if (!isDragging) return;
    isDragging = false;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const touchDuration = Date.now() - touchStartTime;

    // Handle double tap for favorites
    const now = Date.now();
    const timeDiff = now - lastTap;
    
    if (timeDiff < 300 && timeDiff > 0 && distance < 10) {
      // Double tap detected
      event.preventDefault();
      onDoubleTap?.();
      lastTap = 0;
      return;
    }
    lastTap = now;

    // Handle swipe navigation (only when not zoomed)
    if (!isZoomed && distance > 50 && Math.abs(deltaX) > Math.abs(deltaY) && images) {
      if (deltaX > 0 && selectedIndex > 0) {
        selectedIndex--;
      } else if (deltaX < 0 && selectedIndex < images.length - 1) {
        selectedIndex++;
      }
    }
  }

  // Wheel zoom in fullscreen
  function handleWheel(event: WheelEvent) {
    if (!$open) return;
    event.preventDefault();
    
    const rect = (event.currentTarget as Element).getBoundingClientRect();
    handleZoom(-event.deltaY, event.clientX, event.clientY, rect);
  }

  // Utility functions
  function getRelativeTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}m ago`;
  }

  const sellerDisplayName = $derived(seller?.name || seller?.username || 'Seller');
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Seller Strip -->
{#if seller}
  <div class="px-4 py-3 border-b border-[color:var(--border-subtle)]">
    <div class="flex items-center gap-3">
      <Avatar 
        src={seller.avatar} 
        alt={sellerDisplayName}
        size="sm"
        fallback={sellerDisplayName?.[0]?.toUpperCase() || 'S'}
      />
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-[color:var(--text-primary)]">{sellerDisplayName}</span>
          {#if seller.rating && seller.rating >= 4.5}
            <div class="w-4 h-4 bg-[color:var(--brand-primary)] rounded-full flex items-center justify-center">
              <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </div>
          {/if}
        </div>
        {#if createdAt}
          <span class="text-xs text-[color:var(--text-tertiary)]">{getRelativeTime(createdAt)}</span>
        {/if}
      </div>
    </div>
  </div>
{/if}

<div 
  class="relative bg-[color:var(--surface-base)] overflow-hidden {className}"
  bind:this={galleryRef}
>
  <!-- Main Image Container -->
  <div 
    class="aspect-square relative overflow-hidden bg-[color:var(--surface-muted)]"
    ontouchstart={handleAdvancedTouchStart}
    ontouchmove={handleAdvancedTouchMove}
    ontouchend={handleAdvancedTouchEnd}
    ontouchcancel={() => isDragging = false}
    onkeydown={handleKeydown}
    role="button"
    tabindex="0"
    aria-label="Product gallery. Double tap to favorite, swipe to navigate, tap to view fullscreen"
  >
    {#if images && images.length > 0}
      {@const currentImage = selectedImageData}
      {@const imageUrl = typeof currentImage === 'string' ? currentImage : currentImage?.image_url || selectedImage}
      {@const imageSources = generateImageSources(imageUrl)}
      {@const lqipSrc = generateLQIP(imageUrl)}
      {@const imageDims = imageDimensions[imageUrl]}
      
      <div 
        class="relative w-full h-full bg-[color:var(--surface-muted)]"
        style="aspect-ratio: {aspectRatio}"
      >
        <!-- LQIP Background -->
        {#if enableLQIP && lqipSrc}
          <img 
            src={lqipSrc}
            alt=""
            class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 {imageLoadingStates[selectedIndex] === 'loaded' ? 'opacity-0' : 'opacity-100'}"
            loading="eager"
            draggable="false"
            aria-hidden="true"
          />
        {/if}
        
        <!-- Main Image -->
        <img 
          bind:this={imageRef}
          src={imageUrl}
          srcset={imageSources.srcset}
          sizes={imageSources.sizes}
          alt="{title} - Image {selectedIndex + 1}"
          class="relative w-full h-full object-cover select-none transition-opacity duration-300 {imageLoadingStates[selectedIndex] === 'loaded' ? 'opacity-100' : 'opacity-0'}"
          loading={selectedIndex === 0 && preloadFirstImage ? 'eager' : 'lazy'}
          fetchpriority={selectedIndex === 0 ? 'high' : 'low'}
          draggable="false"
          width={imageDims?.width || (typeof currentImage === 'object' && currentImage?.width) || undefined}
          height={imageDims?.height || (typeof currentImage === 'object' && currentImage?.height) || undefined}
          use:melt={$trigger}
          onload={(e) => handleImageLoad(selectedIndex, e)}
          onerror={() => handleImageError(selectedIndex)}
          onloadstart={() => handleImageLoadStart(selectedIndex)}
        />
        
        <!-- Loading Spinner -->
        {#if imageLoadingStates[selectedIndex] === 'loading'}
          <div class="absolute inset-0 flex items-center justify-center bg-[color:var(--surface-muted)]">
            <div class="w-6 h-6 border-2 border-[color:var(--brand-primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        {/if}
        
        <!-- Error State -->
        {#if imageLoadingStates[selectedIndex] === 'error'}
          <div class="absolute inset-0 flex flex-col items-center justify-center bg-[color:var(--surface-muted)] text-[color:var(--text-muted)]">
            <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span class="text-xs">Failed to load image</span>
          </div>
        {/if}
      </div>
    {:else}
      <div class="w-full h-full flex items-center justify-center text-[color:var(--text-muted)]">
        <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>
    {/if}

    <!-- Navigation Arrows -->
    {#if images && images.length > 1}
      <button 
        onclick={() => selectedIndex > 0 ? selectedIndex-- : null}
        class="absolute left-2 top-1/2 -translate-y-1/2 w-[--touch-icon] h-[--touch-icon] bg-black/50 text-white rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity disabled:opacity-30"
        aria-label="Previous image"
        disabled={selectedIndex === 0}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      
      <button 
        onclick={() => selectedIndex < images.length - 1 ? selectedIndex++ : null}
        class="absolute right-2 top-1/2 -translate-y-1/2 w-[--touch-icon] h-[--touch-icon] bg-black/50 text-white rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity disabled:opacity-30"
        aria-label="Next image"
        disabled={selectedIndex === images.length - 1}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>

      <!-- Image indicator dots -->
      <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
        {#each images as _, index}
          <button
            onclick={() => selectedIndex = index}
            class="w-2 h-2 rounded-full transition-colors duration-200 {index === selectedIndex ? 'bg-white' : 'bg-white/50'}"
            aria-label="Go to image {index + 1}"
            aria-current={index === selectedIndex ? 'true' : undefined}
          />
        {/each}
      </div>
    {/if}
    
    <!-- Condition Badge -->
    {#if condition}
      <div class="absolute top-4 left-4 z-10">
        <span class="inline-flex items-center px-3 py-1.5 rounded-[--radius-lg] text-sm font-semibold backdrop-blur-sm {conditionColors}">
          {conditionLabels}
        </span>
      </div>
    {/if}

    <!-- Sold overlay -->
    {#if isSold}
      <div class="absolute top-4 left-4 bg-[color:var(--status-error-solid)] text-white px-3 py-1.5 rounded-[--radius-lg] text-xs font-semibold backdrop-blur-sm">
        SOLD
      </div>
    {/if}

    <!-- Zoom indicator -->
    {#if images && images.length > 0 && !hideZoomIndicator}
      <div class="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded-[--radius-md] text-xs font-medium backdrop-blur-sm">
        <svg class="w-3 h-3 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        Tap to zoom
      </div>
    {/if}
  </div>

  <!-- Thumbnail strip for multiple images -->
  {#if images && images.length > 1}
    <div class="p-2 flex gap-2 overflow-x-auto scrollbar-none">
      {#each images as image, index}
        {@const thumbImageUrl = typeof image === 'string' ? image : image.image_url}
        {@const thumbSources = generateImageSources(thumbImageUrl)}
        {@const thumbLQIP = generateLQIP(thumbImageUrl)}
        
        <button
          onclick={() => selectedIndex = index}
          class="relative flex-shrink-0 w-12 h-12 rounded-[--radius-md] overflow-hidden border-2 transition-colors duration-200 {index === selectedIndex ? 'border-[color:var(--brand-primary)]' : 'border-transparent'}"
          aria-label="View image {index + 1}"
          aria-current={index === selectedIndex ? 'true' : undefined}
        >
          <!-- Thumbnail LQIP -->
          {#if enableLQIP && thumbLQIP}
            <img 
              src={thumbLQIP}
              alt=""
              class="absolute inset-0 w-full h-full object-cover transition-opacity duration-200 {imageLoadingStates[index] === 'loaded' ? 'opacity-0' : 'opacity-100'}"
              loading="eager"
              draggable="false"
              aria-hidden="true"
            />
          {/if}
          
          <img 
            src={thumbImageUrl}
            srcset={thumbSources.srcset.replace(/\d+w/g, '96w')}
            sizes="96px"
            alt="{title} - thumbnail {index + 1}"
            class="relative w-full h-full object-cover transition-opacity duration-200 {imageLoadingStates[index] === 'loaded' ? 'opacity-100' : 'opacity-0'}"
            loading={index < 4 ? 'eager' : 'lazy'}
            draggable="false"
            onload={(e) => handleImageLoad(index, e)}
            onerror={() => handleImageError(index)}
            onloadstart={() => handleImageLoadStart(index)}
          />
        </button>
      {/each}
    </div>
  {/if}
</div>

<!-- Fullscreen Modal -->
<div use:melt={$portalled}>
  {#if $open}
    <div use:melt={$overlay} class="fixed inset-0 z-50 bg-black/90"></div>
    <div
      use:melt={$content}
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      onwheel={handleWheel}
      ontouchstart={handleAdvancedTouchStart}
      ontouchmove={handleAdvancedTouchMove}
      ontouchend={handleAdvancedTouchEnd}
    >
      <!-- Close button -->
      <button
        use:melt={$close}
        class="absolute top-4 right-4 w-[--touch-icon] h-[--touch-icon] bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
        aria-label="Close fullscreen"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <!-- Fullscreen image -->
      {#if true}
        {@const fullscreenImageUrl = typeof selectedImageData === 'string' ? selectedImageData : selectedImageData?.image_url || selectedImage}
        {@const fullscreenSources = generateImageSources(fullscreenImageUrl)}
        
        <div class="relative max-w-full max-h-full">
          <img
            src={fullscreenImageUrl}
            srcset={fullscreenSources.srcset}
            sizes="100vw"
            alt={title}
            class="max-w-full max-h-full object-contain select-none transition-transform duration-200"
            style="transform: scale({zoomLevel}) translate({panX}px, {panY}px)"
            loading="eager"
            fetchpriority="high"
            draggable="false"
          />
        </div>
      {/if}

      <!-- Fullscreen navigation -->
      {#if images && images.length > 1}
        <button 
          onclick={() => selectedIndex > 0 ? selectedIndex-- : null}
          class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors disabled:opacity-30"
          aria-label="Previous image"
          disabled={selectedIndex === 0}
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        
        <button 
          onclick={() => selectedIndex < images.length - 1 ? selectedIndex++ : null}
          class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors disabled:opacity-30"
          aria-label="Next image"
          disabled={selectedIndex === images.length - 1}
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>

        <!-- Fullscreen indicators -->
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {#each images as _, index}
            <button
              onclick={() => selectedIndex = index}
              class="w-3 h-3 rounded-full transition-colors duration-200 {index === selectedIndex ? 'bg-white' : 'bg-white/50'}"
              aria-label="Go to image {index + 1}"
              aria-current={index === selectedIndex ? 'true' : undefined}
            />
          {/each}
        </div>
      {/if}

      <!-- Zoom controls -->
      {#if isZoomed}
        <div class="absolute bottom-4 right-4 flex gap-2">
          <button
            onclick={resetZoom}
            class="w-[--touch-icon] h-[--touch-icon] bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            aria-label="Reset zoom"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"/>
            </svg>
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .scrollbar-none {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
</style>

