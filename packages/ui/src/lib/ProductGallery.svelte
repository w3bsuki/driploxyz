<script lang="ts">
  interface Props {
    images: string[];
    title: string;
    isSold?: boolean;
    onImageSelect?: (index: number) => void;
  }

  let { 
    images = [], 
    title,
    isSold = false,
    onImageSelect
  }: Props = $props();

  let selectedImage = $state(0);

  function selectImage(index: number) {
    selectedImage = index;
    onImageSelect?.(index);
  }

  function handleKeyNavigation(event: KeyboardEvent, index: number) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectImage(index);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const newIndex = event.key === 'ArrowLeft' 
        ? (index > 0 ? index - 1 : images.length - 1)
        : (index < images.length - 1 ? index + 1 : 0);
      selectImage(newIndex);
    }
  }

  // Touch/swipe handling for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  
  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX;
  }
  
  function handleTouchEnd(e: TouchEvent) {
    touchEndX = e.changedTouches[0].clientX;
    handleSwipe();
  }
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && selectedImage < images.length - 1) {
        selectImage(selectedImage + 1);
      } else if (diff < 0 && selectedImage > 0) {
        selectImage(selectedImage - 1);
      }
    }
  }
</script>

<div class="gallery">
  <!-- Main Image Display -->
  <div 
    class="main-image-container"
    ontouchstart={handleTouchStart}
    ontouchend={handleTouchEnd}
    role="img"
    aria-label="{title} - Image {selectedImage + 1} of {images.length}"
  >
    {#if images.length > 0}
      <img 
        src={images[selectedImage]}
        alt="{title} - Image {selectedImage + 1} of {images.length}"
        class="main-image"
        loading="eager"
      />
    {:else}
      <div class="no-image">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21,15 16,10 5,21"/>
        </svg>
        <p>No images available</p>
      </div>
    {/if}
    
    <!-- Sold Badge -->
    {#if isSold}
      <div class="sold-badge">SOLD</div>
    {/if}
  </div>

  <!-- Image Navigation Dots (Mobile) -->
  {#if images.length > 1}
    <div class="nav-dots" role="tablist" aria-label="Product images">
      {#each images as _, index}
        <button 
          class="nav-dot {selectedImage === index ? 'active' : ''}"
          onclick={() => selectImage(index)}
          onkeydown={(e) => handleKeyNavigation(e, index)}
          role="tab"
          aria-selected={selectedImage === index}
          aria-label="View image {index + 1}"
          type="button"
        />
      {/each}
    </div>
  {/if}

  <!-- Thumbnail Strip (Desktop) -->
  {#if images.length > 1}
    <div class="thumbnails" role="tablist" aria-label="Product image thumbnails">
      {#each images as image, index}
        <button 
          class="thumbnail {selectedImage === index ? 'active' : ''}"
          onclick={() => selectImage(index)}
          onkeydown={(e) => handleKeyNavigation(e, index)}
          role="tab"
          aria-selected={selectedImage === index}
          aria-label="View image {index + 1}"
          type="button"
        >
          <img src={image} alt="Thumbnail {index + 1}" loading="lazy" />
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .gallery {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    width: 100%;
  }

  .main-image-container {
    position: relative;
    aspect-ratio: 4/5;
    background: var(--surface-base);
    border-radius: var(--radius-2xl);
    border: 1px solid var(--border-subtle);
    overflow: hidden;
    touch-action: pan-y pinch-zoom;
  }

  .main-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    background: var(--surface-subtle);
  }

  .no-image {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    color: var(--text-tertiary);
    background: var(--surface-subtle);
  }

  .no-image p {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    margin: 0;
  }

  .sold-badge {
    position: absolute;
    top: var(--space-4);
    left: var(--space-4);
    background: var(--status-error-solid);
    color: white;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    font-size: var(--text-sm);
    font-weight: var(--font-bold);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  /* Navigation Dots - Mobile First */
  .nav-dots {
    display: flex;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-2);
  }

  .nav-dot {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);
    border: none;
    background: var(--border-subtle);
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
  }

  .nav-dot.active {
    background: var(--text-primary);
    transform: scale(1.25);
  }

  .nav-dot:hover:not(.active) {
    background: var(--text-secondary);
  }

  .nav-dot:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  /* Thumbnails - Desktop */
  .thumbnails {
    display: none;
    gap: var(--space-3);
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: var(--space-1) 0;
  }

  .thumbnails::-webkit-scrollbar {
    display: none;
  }

  .thumbnail {
    width: 80px;
    height: 80px;
    border: 2px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: none;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.2s ease;
    padding: 0;
  }

  .thumbnail:hover {
    border-color: var(--border-emphasis);
    transform: scale(1.05);
  }

  .thumbnail.active {
    border-color: var(--text-primary);
    box-shadow: 0 0 0 1px var(--text-primary);
  }

  .thumbnail:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  .thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Responsive Design */
  @media (min-width: 768px) {
    .gallery {
      gap: var(--space-6);
    }

    .main-image-container {
      aspect-ratio: 3/4;
      max-width: 500px;
      margin: 0 auto;
    }

    .nav-dots {
      display: none;
    }

    .thumbnails {
      display: flex;
      justify-content: center;
    }
  }

  /* Touch device optimizations */
  @media (pointer: coarse) {
    .nav-dot {
      width: 12px;
      height: 12px;
    }
    
    .thumbnail {
      width: 90px;
      height: 90px;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .nav-dot,
    .thumbnail {
      border: 2px solid ButtonText;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .nav-dot,
    .thumbnail {
      transition: none;
    }
  }
</style>