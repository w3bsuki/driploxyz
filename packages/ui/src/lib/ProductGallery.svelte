<script lang="ts">
  import * as i18n from '@repo/i18n';
  const m: any = i18n;
  import ConditionBadge from './ConditionBadge.svelte';
  import Tooltip from './primitives/tooltip/Tooltip.svelte';
  import { onMount } from 'svelte';
  
  type ConditionType = 'brand_new_with_tags' | 'new_without_tags' | 'like_new' | 'good' | 'worn' | 'fair';
  
  interface Props {
    images: string[];
    title?: string;
    isSold?: boolean;
    onImageSelect?: (index: number) => void;
    condition?: ConditionType;
    translations?: {
      brandNewWithTags?: string;
      newWithoutTags?: string;
      likeNew?: string;
      good?: string;
      worn?: string;
      fair?: string;
    };
  }

  let { 
    images = [], 
    title = '',
    isSold = false,
    onImageSelect,
    condition,
    translations = {}
  }: Props = $props();

  let selectedImage = $state(0);
  let isFullscreen = $state(false);
  let isZoomed = $state(false);
  let scale = $state(1);
  let translateX = $state(0);
  let translateY = $state(0);
  let isDragging = $state(false);
  
  // Touch and gesture handling
  let touchStartX = 0;
  let touchStartY = 0;
  let lastTouchDistance = 0;
  let lastTouchCenter = { x: 0, y: 0 };
  let velocity = 0;
  let lastTouchTime = 0;
  
  let mainImageRef: HTMLElement;
  let fullscreenRef = $state<HTMLElement>();
  let thumbnailsRef = $state<HTMLElement>();

  function selectImage(index: number) {
    if (index === selectedImage || index < 0 || index >= images.length) return;
    selectedImage = index;
    resetTransform();
    onImageSelect?.(index);
    
    // Scroll thumbnail into view
    if (thumbnailsRef && images.length > 1) {
      const thumbElement = thumbnailsRef.children[index] as HTMLElement;
      if (thumbElement) {
        thumbElement.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }
    }
  }

  function resetTransform() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    isZoomed = false;
    isDragging = false;
  }

  function getTouchDistance(touches: TouchList) {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }

  function getTouchCenter(touches: TouchList) {
    if (touches.length === 1) {
      return { x: touches[0].clientX, y: touches[0].clientY };
    } else if (touches.length === 2) {
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2
      };
    }
    return { x: 0, y: 0 };
  }

  function handleTouchStart(e: TouchEvent) {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    lastTouchTime = Date.now();
    velocity = 0;

    if (e.touches.length === 2) {
      lastTouchDistance = getTouchDistance(e.touches);
      lastTouchCenter = getTouchCenter(e.touches);
    }

    if (isZoomed && e.touches.length === 1) {
      isDragging = true;
    }
  }

  function handleTouchMove(e: TouchEvent) {
    e.preventDefault();
    
    if (e.touches.length === 2) {
      // Pinch zoom
      const distance = getTouchDistance(e.touches);
      const center = getTouchCenter(e.touches);
      
      if (lastTouchDistance > 0) {
        const scaleChange = distance / lastTouchDistance;
        const newScale = Math.min(Math.max(scale * scaleChange, 1), 4);
        
        if (newScale !== scale) {
          scale = newScale;
          isZoomed = scale > 1;
        }
      }
      
      lastTouchDistance = distance;
      lastTouchCenter = center;
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      
      if (isZoomed && isDragging) {
        // Pan when zoomed
        translateX = Math.min(Math.max(translateX + deltaX, -100), 100);
        translateY = Math.min(Math.max(translateY + deltaY, -100), 100);
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      } else if (!isZoomed && Math.abs(deltaX) > Math.abs(deltaY)) {
        // Swipe to change image (only when not zoomed)
        const now = Date.now();
        const timeDelta = now - lastTouchTime;
        if (timeDelta > 0) {
          velocity = deltaX / timeDelta;
        }
      }
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    e.preventDefault();
    
    if (e.touches.length === 0) {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      
      if (!isZoomed && absDeltaX > 50 && absDeltaX > absDeltaY) {
        // Swipe to change image
        if (deltaX > 0 && selectedImage > 0) {
          selectImage(selectedImage - 1);
        } else if (deltaX < 0 && selectedImage < images.length - 1) {
          selectImage(selectedImage + 1);
        }
      } else if (!isZoomed && absDeltaX < 10 && absDeltaY < 10) {
        // Tap to toggle fullscreen
        if (isFullscreen) {
          exitFullscreen();
        } else {
          enterFullscreen();
        }
      }
      
      isDragging = false;
      lastTouchDistance = 0;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (isFullscreen) {
      switch (e.key) {
        case 'Escape':
          exitFullscreen();
          break;
        case 'ArrowLeft':
          if (selectedImage > 0) selectImage(selectedImage - 1);
          break;
        case 'ArrowRight':
          if (selectedImage < images.length - 1) selectImage(selectedImage + 1);
          break;
        case 'r':
          resetTransform();
          break;
      }
    } else {
      switch (e.key) {
        case 'ArrowLeft':
          if (selectedImage > 0) selectImage(selectedImage - 1);
          break;
        case 'ArrowRight':
          if (selectedImage < images.length - 1) selectImage(selectedImage + 1);
          break;
        case 'Enter':
        case ' ':
          enterFullscreen();
          break;
      }
    }
  }

  function enterFullscreen() {
    isFullscreen = true;
    resetTransform();
    document.body.style.overflow = 'hidden';
    
    // Focus fullscreen element for keyboard navigation
    if (fullscreenRef) {
      fullscreenRef.focus();
    }
  }

  function exitFullscreen() {
    isFullscreen = false;
    resetTransform();
    document.body.style.overflow = '';
  }

  function handleDoubleTap(e: Event) {
    e.preventDefault();
    if (isZoomed) {
      resetTransform();
    } else {
      scale = 2;
      isZoomed = true;
    }
  }

  // Condition tooltip content
  const getConditionTooltip = (condition: ConditionType) => {
    const tooltipMap: Record<ConditionType, string> = {
      'brand_new_with_tags': m.condition_newWithTags?.() || 'Brand new with tags',
      'new_without_tags': m.sell_condition_newWithoutTags?.() || 'New without tags',
      'like_new': m.product_likeNew?.() || 'Like new',
      'good': m.sell_condition_good_desc?.() || 'Good condition',
      'worn': m.sell_condition_worn?.() || 'Worn but good',
      'fair': 'Fair condition'
    };
    return tooltipMap[condition] || `Condition: ${condition}`;
  };

  // Cleanup on unmount
  onMount(() => {
    return () => {
      document.body.style.overflow = '';
    };
  });
</script>

<!-- Main Gallery Container -->
<div 
  class="gallery-container" 
  role="region" 
  aria-label="Product images"
  onkeydown={handleKeyDown}
  tabindex="0"
>
  <!-- Main Image Display -->
  <div 
    class="main-image-container"
    bind:this={mainImageRef}
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
    ondblclick={handleDoubleTap}
    role="button"
    tabindex="0"
    aria-label={m.pdp_a11y_productImage?.({ index: selectedImage + 1, total: images.length }) || `Product image ${selectedImage + 1} of ${images.length}`}
  >
    {#if images.length > 0}
      <img 
        src={images[selectedImage]}
        alt={title || `Product image ${selectedImage + 1}`}
        class="main-image"
        loading={selectedImage === 0 ? "eager" : "lazy"}
        decoding="async"
        fetchpriority={selectedImage === 0 ? "high" : "low"}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
        style="transform: scale({scale}) translate({translateX}px, {translateY}px);"
      />
      
      <!-- Overlay Elements -->
      <div class="image-overlay">
        <!-- Condition Badge -->
        {#if condition}
          <div class="condition-badge-container">
            <Tooltip 
              content={getConditionTooltip(condition)}
              positioning={{ side: 'bottom', align: 'start' }}
              openDelay={600}
              closeDelay={200}
            >
              {#snippet trigger()}
                <ConditionBadge {condition} {translations} />
              {/snippet}
            </Tooltip>
          </div>
        {/if}
        
        <!-- Sold Badge -->
        {#if isSold}
          <div class="sold-badge">
            <span class="sold-text">{m.pdp_sold?.() || 'SOLD'}</span>
          </div>
        {/if}
        
        <!-- Image Counter -->
        {#if images.length > 1}
          <div class="image-counter">
            <span>{selectedImage + 1} / {images.length}</span>
          </div>
        {/if}
        
        <!-- Zoom Indicator -->
        {#if images.length > 0}
          <div class="zoom-indicator">
            <svg viewBox="0 0 24 24" class="zoom-icon">
              <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="11" y1="8" x2="11" y2="14" stroke="currentColor" stroke-width="2"/>
              <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
        {/if}
      </div>
      
      <!-- Navigation Arrows (Desktop) -->
      {#if images.length > 1}
        <div class="nav-arrows">
          <button 
            class="nav-arrow nav-arrow-left"
            onclick={() => selectImage(selectedImage - 1)}
            disabled={selectedImage === 0}
            aria-label="Previous image"
          >
            <svg viewBox="0 0 24 24" class="arrow-icon">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          
          <button 
            class="nav-arrow nav-arrow-right"
            onclick={() => selectImage(selectedImage + 1)}
            disabled={selectedImage === images.length - 1}
            aria-label="Next image"
          >
            <svg viewBox="0 0 24 24" class="arrow-icon">
              <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      {/if}
      
    {:else}
      <!-- No Images State -->
      <div class="no-images">
        <svg class="no-images-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21,15 16,10 5,21"/>
        </svg>
        <p class="no-images-text">{m.orders_noImage?.() || 'No image available'}</p>
      </div>
    {/if}
  </div>

  <!-- Thumbnail Strip -->
  {#if images.length > 1}
    <div class="thumbnails-container">
      <div class="thumbnails-strip" bind:this={thumbnailsRef}>
        {#each images as image, index}
          <button 
            class="thumbnail"
            class:thumbnail-active={selectedImage === index}
            onclick={() => selectImage(index)}
            aria-label={`View image ${index + 1}`}
          >
            <img 
              src={image}
              alt={`Thumbnail ${index + 1}`}
              class="thumbnail-image"
              loading="lazy"
            />
            <div class="thumbnail-overlay"></div>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<!-- Fullscreen Modal -->
{#if isFullscreen}
  <!-- Backdrop -->
  <div 
    class="fullscreen-backdrop"
    onclick={exitFullscreen}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === 'Escape' && exitFullscreen()}
    aria-label="Close fullscreen view"
  ></div>
  
  <!-- Fullscreen Content -->
  <div 
    class="fullscreen-content"
    bind:this={fullscreenRef}
    tabindex="0"
    role="dialog"
    aria-modal="true"
    aria-label="Fullscreen product image view"
  >
    <!-- Close Button -->
    <button class="fullscreen-close" onclick={exitFullscreen} aria-label="Close fullscreen">
      <svg viewBox="0 0 24 24" class="close-icon">
        <path d="M18 6l-12 12M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
    
    <!-- Fullscreen Image -->
    <div 
      class="fullscreen-image-container"
      ontouchstart={handleTouchStart}
      ontouchmove={handleTouchMove}
      ontouchend={handleTouchEnd}
      ondblclick={handleDoubleTap}
    >
      <img 
        src={images[selectedImage]}
        alt={title || `Product image ${selectedImage + 1}`}
        class="fullscreen-image"
        style="transform: scale({scale}) translate({translateX}px, {translateY}px);"
      />
    </div>
    
    <!-- Fullscreen Controls -->
    <div class="fullscreen-controls">
      <div class="fullscreen-counter">
        {selectedImage + 1} of {images.length}
      </div>
      
      {#if images.length > 1}
        <div class="fullscreen-nav">
          <button 
            class="fullscreen-nav-btn"
            onclick={() => selectImage(selectedImage - 1)}
            disabled={selectedImage === 0}
            aria-label="Previous image"
          >
            <svg viewBox="0 0 24 24" class="nav-icon">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          
          <button 
            class="fullscreen-nav-btn"
            onclick={() => selectImage(selectedImage + 1)}
            disabled={selectedImage === images.length - 1}
            aria-label="Next image"
          >
            <svg viewBox="0 0 24 24" class="nav-icon">
              <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      {/if}
      
      <button class="zoom-reset-btn" onclick={resetTransform} disabled={!isZoomed}>
        Reset Zoom
      </button>
    </div>
  </div>
{/if}

<style>
  .gallery-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    outline: none;
  }

  .main-image-container {
    position: relative;
    aspect-ratio: 4/5;
    overflow: hidden;
    border-radius: var(--radius-xl);
    background: var(--surface-subtle);
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
  }

  .main-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
  }

  .image-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .condition-badge-container {
    position: absolute;
    top: var(--space-3);
    left: var(--space-3);
    z-index: 20;
    pointer-events: auto;
  }

  .sold-badge {
    position: absolute;
    top: var(--space-3);
    left: var(--space-3);
    z-index: 30;
    background: var(--red-600);
    color: var(--red-50);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    backdrop-filter: blur(8px);
    box-shadow: var(--shadow-lg);
  }

  .sold-text {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-bold);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .image-counter {
    position: absolute;
    bottom: var(--space-3);
    right: var(--space-3);
    background: var(--gray-900);
    color: var(--gray-0);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-full);
    backdrop-filter: blur(8px);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  }

  .zoom-indicator {
    position: absolute;
    bottom: var(--space-3);
    left: var(--space-3);
    background: var(--gray-900);
    color: var(--gray-0);
    padding: var(--space-2);
    border-radius: var(--radius-full);
    backdrop-filter: blur(8px);
    opacity: 0.7;
  }

  .zoom-icon {
    width: 16px;
    height: 16px;
  }

  .nav-arrows {
    position: absolute;
    inset: 0;
    display: none;
    pointer-events: none;
  }

  .nav-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: var(--touch-icon);
    height: var(--touch-icon);
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    pointer-events: auto;
    box-shadow: var(--shadow-lg);
    backdrop-filter: blur(8px);
  }

  .nav-arrow:hover:not(:disabled) {
    background: var(--surface-hover);
    border-color: var(--border-strong);
    transform: translateY(-50%) scale(1.05);
  }

  .nav-arrow:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .nav-arrow-left {
    left: var(--space-4);
  }

  .nav-arrow-right {
    right: var(--space-4);
  }

  .arrow-icon {
    width: 20px;
    height: 20px;
    color: var(--text-strong);
  }

  .no-images {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: var(--space-3);
    color: var(--text-subtle);
  }

  .no-images-icon {
    width: var(--space-12);
    height: var(--space-12);
  }

  .no-images-text {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  }

  /* Thumbnails */
  .thumbnails-container {
    display: flex;
    gap: var(--space-2);
  }

  .thumbnails-strip {
    display: flex;
    gap: var(--space-2);
    overflow-x: auto;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: var(--space-1) 0;
  }

  .thumbnails-strip::-webkit-scrollbar {
    display: none;
  }

  .thumbnail {
    position: relative;
    flex-shrink: 0;
    width: 64px;
    height: 64px;
    border-radius: var(--radius-lg);
    border: 2px solid var(--border-subtle);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--surface-base);
  }

  .thumbnail:hover {
    border-color: var(--border-strong);
    transform: scale(1.05);
  }

  .thumbnail-active {
    border-color: var(--primary);
    box-shadow: 0 0 0 1px var(--primary);
  }

  .thumbnail-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumbnail-overlay {
    position: absolute;
    inset: 0;
    background: transparent;
    transition: background 0.2s;
  }

  .thumbnail:not(.thumbnail-active) .thumbnail-overlay {
    background: color-mix(in oklch, var(--gray-900) 20%, transparent);
  }

  /* Fullscreen Modal */
  .fullscreen-backdrop {
    position: fixed;
    inset: 0;
    background: var(--gray-900);
    z-index: 100;
    cursor: pointer;
  }

  .fullscreen-content {
    position: fixed;
    inset: 0;
    z-index: 101;
    display: flex;
    flex-direction: column;
    outline: none;
  }

  .fullscreen-close {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    z-index: 102;
    width: var(--touch-icon);
    height: var(--touch-icon);
    background: var(--gray-900);
    color: var(--gray-0);
    border: none;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(8px);
  }

  .fullscreen-close:hover {
    background: var(--gray-800);
    transform: scale(1.05);
  }

  .close-icon {
    width: 20px;
    height: 20px;
  }

  .fullscreen-image-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    touch-action: none;
  }

  .fullscreen-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
  }

  .fullscreen-controls {
    position: absolute;
    bottom: var(--space-6);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-6);
    background: var(--gray-900);
    color: var(--gray-0);
    border-radius: var(--radius-full);
    backdrop-filter: blur(8px);
  }

  .fullscreen-counter {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  }

  .fullscreen-nav {
    display: flex;
    gap: var(--space-2);
  }

  .fullscreen-nav-btn {
    width: var(--touch-standard);
    height: var(--touch-standard);
    background: transparent;
    border: 1px solid var(--gray-600);
    border-radius: var(--radius-md);
    color: var(--gray-0);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .fullscreen-nav-btn:hover:not(:disabled) {
    background: var(--gray-800);
    border-color: var(--gray-500);
  }

  .fullscreen-nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .nav-icon {
    width: 16px;
    height: 16px;
  }

  .zoom-reset-btn {
    padding: var(--space-2) var(--space-4);
    background: transparent;
    border: 1px solid var(--gray-600);
    border-radius: var(--radius-md);
    color: var(--gray-0);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all 0.2s;
  }

  .zoom-reset-btn:hover:not(:disabled) {
    background: var(--gray-800);
    border-color: var(--gray-500);
  }

  .zoom-reset-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* Responsive Design */
  @media (min-width: 640px) {
    .main-image-container {
      aspect-ratio: 3/4;
    }

    .thumbnail {
      width: 80px;
      height: 80px;
    }

    .nav-arrows {
      display: block;
    }

    .main-image-container:hover .nav-arrows {
      opacity: 1;
    }
  }

  @media (max-width: 480px) {
    /* Tighter spacing on compact mobile to maximize image area */
    .gallery-container {
      gap: var(--space-2);
    }

    .thumbnails-container {
      gap: var(--space-1);
    }

    .thumbnails-strip {
      gap: var(--space-1);
      padding: 0;
    }

    .thumbnail {
      width: 56px;
      height: 56px;
    }

    .fullscreen-controls {
      bottom: var(--space-4);
      padding: var(--space-2) var(--space-4);
    }

    .fullscreen-counter {
      font-size: var(--font-size-xs);
    }
  }

  /* On small screens, move badges out of overlay to page content */
  @media (max-width: 640px) {
    .condition-badge-container,
    .sold-badge {
      display: none;
    }
  }

  /* High contrast support */
  @media (prefers-contrast: high) {
    .nav-arrow {
      border-width: 2px;
    }

    .thumbnail {
      border-width: 3px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .main-image,
    .fullscreen-image,
    .nav-arrow,
    .thumbnail {
      transition: none;
    }
  }
</style>
