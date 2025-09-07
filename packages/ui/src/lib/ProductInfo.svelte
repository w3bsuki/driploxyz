<script lang="ts">
  import * as i18n from '@repo/i18n';
  const m: any = i18n;
  import Badge from './Badge.svelte';

  interface Props {
    title: string;
    brand?: string;
    size?: string;
    color?: string;
    material?: string;
    description?: string;
    favoriteCount: number;
    isFavorited: boolean;
    onFavorite?: () => void;
    showQuickFacts?: boolean;
    category?: string;
  }

  let { 
    title,
    brand,
    size,
    color,
    material,
    description,
    favoriteCount,
    isFavorited,
    onFavorite,
    showQuickFacts = true,
    category
  }: Props = $props();

  let showFullDescription = $state(false);
  let detailsOpen = $state(false);
  let shippingOpen = $state(false);


  function toggleDescription() {
    showFullDescription = !showFullDescription;
  }

  // Size guide helper
  const showSizeGuide = $derived(() => {
    return !!(category && ['clothing', 'shoes', 'accessories'].some(cat => 
      category.toLowerCase().includes(cat)
    ) && size);
  });
</script>

<div class="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
  <!-- Title and Favorite Button -->
  <div class="flex items-start justify-between gap-3">
    <h1 class="text-xl md:text-2xl font-bold leading-tight flex-1">{title}</h1>
    
    <button 
      class="btn-icon btn-ghost flex items-center gap-1 text-gray-500 text-xs p-2 rounded-full transition-colors hover:text-red-500 hover:bg-gray-50 min-w-[44px] min-h-[44px] justify-center shrink-0"
      onclick={onFavorite}
      aria-label={isFavorited ? m.removeFavorite() : m.addFavorite()}
      type="button"
    >
      <svg class="size-5 {isFavorited ? 'text-red-500' : ''}" viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
  </div>

  <!-- Key Product Details -->
  <div class="flex gap-2 flex-wrap">
    {#if brand}
      <Badge variant="secondary" size="sm">{brand}</Badge>
    {/if}
    {#if size}
      <div class="flex items-center gap-2">
        <Badge variant="secondary" size="sm">{m.product_size()}: {size}</Badge>
        {#if showSizeGuide()}
          <button 
            class="text-blue-600 text-xs font-medium hover:text-blue-700 transition-colors border border-blue-200 hover:border-blue-300 rounded px-2 py-1 flex items-center gap-1"
            type="button" 
            aria-label={m.product_sizeGuide()}
          >
            <svg class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h4"/>
              <path d="M9 7V3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/>
              <path d="M12 8v5l3-3"/>
            </svg>
            {m.product_sizeGuide()}
          </button>
        {/if}
      </div>
    {:else if color}
      <Badge variant="secondary" size="sm">{color}</Badge>
    {/if}
    {#if material}
      <Badge variant="secondary" size="sm">{material}</Badge>
    {/if}
  </div>

  <!-- Description -->
  {#if description}
    <div class="flex flex-col gap-3">
      <div class="text-gray-700 leading-relaxed {showFullDescription ? '' : 'line-clamp-3'}">
        {description}
      </div>
      {#if description.length > 150}
        <button 
          class="text-blue-600 font-semibold text-sm text-left hover:text-blue-700 transition-colors"
          onclick={toggleDescription}
          type="button"
        >
          {showFullDescription ? m.product_showLess() : m.product_readMore()}
        </button>
      {/if}
    </div>
  {/if}

  <!-- Trust Signals -->
  <div class="border-t border-gray-200 pt-4 mt-2">
    <div class="bg-gray-50 rounded-lg p-4 flex flex-col sm:flex-row gap-3 sm:justify-between">
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <svg class="size-4 text-green-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4"/>
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12 s4.477 10 10 10z"/>
        </svg>
        <span>{m.pdp_authenticity()}</span>
      </div>
      
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <svg class="size-4 text-green-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <circle cx="12" cy="16" r="1"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span>{m.product_securePayments()}</span>
      </div>
      
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <svg class="size-4 text-green-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h4m6-6v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-6"/>
          <path d="M9 7V3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/>
          <path d="M12 8v5l3-3"/>
        </svg>
        <span>{m.product_returnPolicy()}</span>
      </div>
    </div>
  </div>

  <!-- Product Details Accordion -->
  {#if brand || size || color || material}
    <details class="border border-gray-200 rounded-lg overflow-hidden" bind:open={detailsOpen}>
      <summary class="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
        <span class="font-medium text-gray-900">{m.product_itemDetails()}</span>
        <svg class="size-5 text-gray-400 transition-transform {detailsOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </summary>
      <div class="p-4 bg-white space-y-3">
        {#if brand}
          <div class="flex justify-between">
            <span class="text-gray-600">{m.product_brand()}:</span>
            <span class="font-medium text-gray-900">{brand}</span>
          </div>
        {/if}
        {#if size}
          <div class="flex justify-between">
            <span class="text-gray-600">{m.product_size()}:</span>
            <span class="font-medium text-gray-900">{size}</span>
          </div>
        {/if}
        {#if color}
          <div class="flex justify-between">
            <span class="text-gray-600">{m.pdp_color()}:</span>
            <span class="font-medium text-gray-900">{color}</span>
          </div>
        {/if}
        {#if material}
          <div class="flex justify-between">
            <span class="text-gray-600">{m.pdp_material()}:</span>
            <span class="font-medium text-gray-900">{material}</span>
          </div>
        {/if}
      </div>
    </details>
  {/if}

  <!-- Shipping & Returns -->
  <details class="border border-gray-200 rounded-lg overflow-hidden" bind:open={shippingOpen}>
    <summary class="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
      <span class="font-medium text-gray-900">{m.product_shippingReturns()}</span>
      <svg class="size-5 text-gray-400 transition-transform {shippingOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <polyline points="6,9 12,15 18,9"/>
      </svg>
    </summary>
    <div class="p-4 bg-white space-y-3">
      <div class="flex items-start gap-2">
        <svg class="size-4 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="1" y="3" width="15" height="13"/>
          <polygon points="16,3 21,8 21,13 16,13"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
        <div>
          <p class="font-medium text-gray-900">{m.pdp_freeShipping()}</p>
          <p class="text-sm text-gray-600">{m.product_standardShipping()} 3-5 {m.product_businessDays()}</p>
        </div>
      </div>
      <div class="flex items-start gap-2">
        <svg class="size-4 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h4m6-6v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-6"/>
          <path d="M9 7V3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/>
          <path d="M12 8v5l3-3"/>
        </svg>
        <div>
          <p class="font-medium text-gray-900">{m.product_returnPolicy()}</p>
          <p class="text-sm text-gray-600">{m.product_originalCondition()}</p>
        </div>
      </div>
      <div class="flex items-start gap-2">
        <svg class="size-4 text-purple-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <div>
          <p class="font-medium text-gray-900">{m.product_driploProtection()}</p>
          <p class="text-sm text-gray-600">{m.product_securePayments()}</p>
        </div>
      </div>
    </div>
  </details>
</div>