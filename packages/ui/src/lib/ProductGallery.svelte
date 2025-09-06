<script lang="ts">
  interface Props {
    images: string[];
    title?: string;
    isSold?: boolean;
    likeCount?: number;
    isLiked?: boolean;
    onLike?: () => void;
    onImageSelect?: (index: number) => void;
    seller?: {
      id: string;
      username: string | null;
      avatar_url?: string | null;
    };
  }

  let { 
    images = [], 
    title = '',
    isSold = false,
    likeCount = 0,
    isLiked = false,
    onLike,
    onImageSelect,
    seller
  }: Props = $props();

  let selectedImage = $state(0);
  let avatarExpanded = $state(false);

  function selectImage(index: number) {
    if (index === selectedImage) return;
    selectedImage = index;
    onImageSelect?.(index);
  }

  // Simple swipe handling
  let touchStartX = 0;
  
  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX;
  }
  
  function handleTouchEnd(e: TouchEvent) {
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartX - touchEndX;
    
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0 && selectedImage < images.length - 1) {
        selectImage(selectedImage + 1);
      } else if (deltaX < 0 && selectedImage > 0) {
        selectImage(selectedImage - 1);
      }
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft' && selectedImage > 0) {
      selectImage(selectedImage - 1);
    } else if (e.key === 'ArrowRight' && selectedImage < images.length - 1) {
      selectImage(selectedImage + 1);
    }
  }

  function handleAvatarClick() {
    if (seller?.username || seller?.id) {
      const profileUrl = seller.username ? `/profile/${seller.username}` : `/profile/${seller.id}`;
      if (typeof window !== 'undefined') {
        window.location.href = profileUrl;
      }
    }
  }

  function handleAvatarEnter() {
    avatarExpanded = true;
  }

  function handleAvatarLeave() {
    avatarExpanded = false;
  }
</script>

<div class="w-full" role="region" aria-label="Product images">
  <div 
    class="relative aspect-4/5 sm:aspect-3/4 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
    ontouchstart={handleTouchStart}
    ontouchend={handleTouchEnd}
    onkeydown={handleKeyDown}
    tabindex="0"
    role="img"
    aria-label="{title ? `${title} - ` : ''}Image {selectedImage + 1} of {images.length || 1}"
  >
    {#if images.length > 0}
      <img 
        src={images[selectedImage]}
        alt="{title ? `${title} - ` : ''}Image {selectedImage + 1} of {images.length}"
        class="w-full h-full object-contain bg-gray-50"
        loading="eager"
      />
      
      <!-- Seller Avatar (Top Left) -->
      {#if seller}
        <button 
          class="absolute top-4 left-4 rounded-full bg-white shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {avatarExpanded ? 'w-16 h-16' : 'w-12 h-12'}"
          onclick={handleAvatarClick}
          onmouseenter={handleAvatarEnter}
          onmouseleave={handleAvatarLeave}
          aria-label={`View ${seller.username || 'seller'}'s profile`}
          type="button"
        >
          {#if seller.avatar_url}
            <img 
              src={seller.avatar_url} 
              alt={seller.username || 'Seller'}
              class="rounded-full object-cover transition-all duration-300 {avatarExpanded ? 'w-14 h-14' : 'w-10 h-10'}"
            />
          {:else}
            <div class="rounded-full bg-gray-200 flex items-center justify-center transition-all duration-300 {avatarExpanded ? 'w-14 h-14' : 'w-10 h-10'}">
              <svg class="text-gray-500 transition-all duration-300 {avatarExpanded ? 'size-7' : 'size-5'}" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          {/if}
          
          <!-- Hover tooltip -->
          {#if avatarExpanded}
            <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full bg-black text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap opacity-90">
              {seller.username || 'View profile'}
            </div>
          {/if}
        </button>
      {/if}
      
      <!-- Like Button (Top Right) -->
      {#if onLike}
        <button 
          class="btn-icon btn-ghost absolute top-4 right-4 bg-white/95 backdrop-blur-sm shadow-lg rounded-full p-3 {isLiked ? 'text-red-500' : 'text-gray-600'} hover:scale-105 transition-transform"
          onclick={onLike}
          aria-label={isLiked ? `Remove from favorites` : `Add to favorites`}
          type="button"
        >
          <svg class="size-5" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      {/if}

      <!-- Image Counter -->
      {#if images.length > 1}
        <div class="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-sm font-medium pointer-events-none">
          {selectedImage + 1} / {images.length}
        </div>
      {/if}
      
    {:else}
      <div class="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
        <svg class="size-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21,15 16,10 5,21"/>
        </svg>
        <p class="mt-2 text-sm font-medium">No image available</p>
      </div>
    {/if}
    
    <!-- Sold Badge -->
    {#if isSold}
      <div class="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
        SOLD
      </div>
    {/if}

  </div>

  <!-- Navigation Dots -->
  {#if images.length > 1}
    <div class="flex justify-center gap-2 pt-4 pb-2" role="tablist" aria-label="Image navigation">
      {#each images as _, index}
        <button 
          class="btn-icon w-11 h-11 rounded-full flex items-center justify-center {selectedImage === index ? 'bg-blue-100' : 'hover:bg-gray-100'}"
          onclick={() => selectImage(index)}
          role="tab"
          aria-selected={selectedImage === index}
          aria-label="View image {index + 1}"
          type="button"
        >
          <div class="w-2 h-2 rounded-full {selectedImage === index ? 'bg-blue-600 scale-125' : 'bg-gray-300'} transition-all"></div>
        </button>
      {/each}
    </div>
  {/if}
</div>