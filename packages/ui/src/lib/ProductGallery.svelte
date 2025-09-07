<script lang="ts">
  import * as i18n from '@repo/i18n';
  const m: any = i18n;
  // @ts-ignore Svelte component modules
  import ConditionBadge from './ConditionBadge.svelte';
  // @ts-ignore Svelte component modules
  import Tooltip from './primitives/tooltip/Tooltip.svelte';
  
  type ConditionType = 'brand_new_with_tags' | 'new_without_tags' | 'like_new' | 'good' | 'worn' | 'fair';
  
  interface Props {
    images: string[];
    title?: string;
    isSold?: boolean;
    likeCount?: number;
    isLiked?: boolean;
    onLike?: () => void;
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
    likeCount = 0,
    isLiked = false,
    onLike,
    onImageSelect,
    condition,
    translations = {
      brandNewWithTags: 'BNWT',
      newWithoutTags: 'New',
      likeNew: 'Like New',
      good: 'Good',
      worn: 'Worn',
      fair: 'Fair'
    }
  }: Props = $props();

  let selectedImage = $state(0);

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

  // Tooltip content helpers
  const getConditionTooltip = (condition: ConditionType) => {
    const tooltipMap: Record<ConditionType, string> = {
      'brand_new_with_tags': m.condition_newWithTags(),
      'new_without_tags': m.sell_condition_newWithoutTags(),
      'like_new': m.product_likeNew(),
      'good': m.sell_condition_good_desc(),
      'worn': m.sell_condition_worn(),
      'fair': 'Fair'
    };
    return tooltipMap[condition] || `Condition: ${condition}`;
  };
</script>

<div class="w-full" role="region" aria-label="Product images">
  <div 
    class="relative aspect-4/5 sm:aspect-3/4 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
    ontouchstart={handleTouchStart}
    ontouchend={handleTouchEnd}
    onkeydown={handleKeyDown}
    role="img"
    aria-label={m.pdp_a11y_productImage({ index: selectedImage + 1, total: images.length || 1 })}
  >
    {#if images.length > 0}
      <img 
        src={images[selectedImage]}
        alt={m.pdp_a11y_productImage({ index: selectedImage + 1, total: images.length })}
        class="w-full h-full object-contain bg-gray-50"
        loading="eager"
      />
      
      <!-- Condition Badge (Top Left) -->
      {#if condition}
        <div class="absolute top-3 left-3 z-20">
          <Tooltip 
            content={getConditionTooltip(condition)}
            positioning={{ side: 'bottom', align: 'start' }}
            openDelay={600}
            closeDelay={200}
          >
            {#snippet trigger()}
              <ConditionBadge 
                {condition}
                {translations}
              />
            {/snippet}
          </Tooltip>
        </div>
      {/if}
      
      <!-- Like Button (Top Right) -->
      {#if onLike}
        <button 
          class="btn-icon btn-ghost absolute top-4 right-4 bg-white/95 backdrop-blur-sm shadow-lg rounded-full p-3 {isLiked ? 'text-red-500' : 'text-gray-600'} hover:scale-105 transition-transform"
          onclick={onLike}
          aria-label={isLiked ? m.removeFavorite() : m.addFavorite()}
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
        <p class="mt-2 text-sm font-medium">{m.orders_noImage()}</p>
      </div>
    {/if}
    
    <!-- Sold Badge -->
    {#if isSold}
      <div class="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide shadow-lg z-30">
        {m.pdp_sold()}
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