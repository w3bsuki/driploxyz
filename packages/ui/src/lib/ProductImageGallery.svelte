<script lang="ts">
  interface Props {
    images: string[]
    title: string
    isSold?: boolean
  }

  let { images, title, isSold = false }: Props = $props()

  let currentIndex = $state(0)
  let galleryElement: HTMLDivElement | undefined = $state()

  const imagesList = $derived(images?.length > 0 ? images : [])

  function goToImage(index: number) {
    currentIndex = index
    if (galleryElement) {
      const imageWidth = galleryElement.offsetWidth
      galleryElement.scrollLeft = imageWidth * index
    }
  }

  function handleTouchStart(e: TouchEvent) {
    if (!galleryElement) return
    const touch = e.touches[0]
    const startX = touch.clientX
    const startScrollLeft = galleryElement.scrollLeft

    function handleTouchMove(e: TouchEvent) {
      const touch = e.touches[0]
      const diff = startX - touch.clientX
      galleryElement!.scrollLeft = startScrollLeft + diff
    }

    function handleTouchEnd() {
      if (!galleryElement) return
      const imageWidth = galleryElement.offsetWidth
      const newIndex = Math.round(galleryElement.scrollLeft / imageWidth)
      currentIndex = Math.max(0, Math.min(newIndex, imagesList.length - 1))
      goToImage(currentIndex)
      
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }

    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
  }

  const mainImage = $derived(imagesList[currentIndex] || imagesList[0] || '')
</script>

<div class="image-gallery">
  <!-- Main Image Display -->
  <div class="main-image">
    {#if isSold}
      <div class="sold-overlay">
        <div class="sold-badge">
          <span class="sold-text">SOLD</span>
        </div>
      </div>
    {/if}

    {#if imagesList.length > 0}
      <div 
        bind:this={galleryElement}
        class="image-container"
        ontouchstart={handleTouchStart}
      >
        {#each imagesList as image, index}
          <img 
            src={image}
            alt={`${title} - Image ${index + 1}`}
            class="image"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        {/each}
      </div>
    {:else}
      <div class="empty-container" aria-label="No product images available">
        <svg class="empty-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke="currentColor" stroke-width="2" fill="none" d="M3 5a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H9l-4 4v-4H5a2 2 0 01-2-2V5z"/>
        </svg>
        <span class="empty-text">No images</span>
      </div>
    {/if}

    <!-- Image Counter -->
    {#if imagesList.length > 1}
      <div class="image-counter">
        <span class="counter-text">
          {currentIndex + 1} / {imagesList.length}
        </span>
      </div>
    {/if}
  </div>

  <!-- Image Thumbnails -->
  {#if imagesList.length > 1 && images?.length > 0}
    <div class="thumbnails">
      {#each imagesList as image, index}
        <button
          class="thumbnail {currentIndex === index ? 'thumbnail-active' : ''}"
          onclick={() => goToImage(index)}
          type="button"
          aria-label={`View image ${index + 1}`}
        >
          <img 
            src={image}
            alt={`${title} thumbnail ${index + 1}`}
            class="thumbnail-image"
            loading="lazy"
          />
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .image-gallery {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .main-image {
    position: relative;
    aspect-ratio: 1;
    background-color: var(--surface-base);
    border-radius: var(--radius-2xl);
    border: 1px solid var(--border-subtle);
    overflow: hidden;
    padding: var(--space-2);
  }

  .empty-container {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    color: var(--text-tertiary);
  }
  .empty-icon { width: 32px; height: 32px; }
  .empty-text { font-size: var(--text-xs); font-weight: var(--font-medium); }

  .image-container {
    display: flex;
    height: 100%;
    width: 100%;
    overflow-x: auto;
    scroll-behavior: smooth;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .image-container::-webkit-scrollbar {
    display: none;
  }

  .image {
    height: 100%;
    width: 100%;
    flex-shrink: 0;
    object-fit: contain;
    scroll-snap-align: start;
    border-radius: var(--radius-xl);
    background: var(--surface-subtle);
    border: 1px solid var(--border-subtle);
  }

  .sold-overlay {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.7);
  }

  .sold-badge {
    background-color: var(--surface-base);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-md);
  }

  .sold-text {
    font-weight: var(--font-bold);
    font-size: var(--text-lg);
    color: var(--text-primary);
  }

  .image-counter {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    background-color: rgba(0, 0, 0, 0.8);
    border-radius: var(--radius-full);
    padding: var(--space-1-5) var(--space-3);
  }

  .counter-text {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: white;
  }

  .thumbnails {
    display: flex;
    gap: var(--space-2);
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .thumbnails::-webkit-scrollbar {
    display: none;
  }

  .thumbnail {
    flex-shrink: 0;
    width: 60px;
    height: 60px;
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 2px solid var(--border-subtle);
    background: none;
    cursor: pointer;
    transition: border-color var(--duration-fast);
  }

  .thumbnail:hover {
    border-color: var(--border-emphasis);
  }

  .thumbnail-active {
    border-color: var(--primary);
  }

  .thumbnail-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
