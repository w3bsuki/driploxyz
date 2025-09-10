<script lang="ts">
  import SellerProfileCard from './SellerProfileCard.svelte';
  import SellerQuickView from './SellerQuickView.svelte';
  import type { Seller, Product } from './types/index';

  interface Props {
    sellers: Seller[];
    sellerProducts?: Record<string, Product[]>;
    onSellerClick?: (seller: Seller) => void;
    onViewAll?: () => void;
    loading?: boolean;
    title?: string;
    description?: string;
    class?: string;
  }

  let { 
    sellers = [],
    sellerProducts = {},
    onSellerClick,
    onViewAll,
    loading = false,
    title = 'Featured Sellers',
    description = '',
    class: className = '' 
  }: Props = $props();

  let selectedSeller = $state<Seller | null>(null);
  let showQuickView = $state(false);
  let scrollContainer = $state<HTMLElement>();
  let canScrollLeft = $state(false);
  let canScrollRight = $state(false);

  function handleSellerClick(seller: Seller) {
    selectedSeller = seller;
    showQuickView = true;
    onSellerClick?.(seller);
  }

  function closeQuickView() {
    showQuickView = false;
    setTimeout(() => {
      selectedSeller = null;
    }, 200);
  }

  function getSellerPreviews(sellerId: string): Product[] {
    return sellerProducts[sellerId] || [];
  }

  function scrollLeft() {
    if (scrollContainer) {
      const cardWidth = scrollContainer.querySelector('[data-seller-card]')?.clientWidth || 200;
      scrollContainer.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  }

  function scrollRight() {
    if (scrollContainer) {
      const cardWidth = scrollContainer.querySelector('[data-seller-card]')?.clientWidth || 200;
      scrollContainer.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  }

  function updateScrollButtons() {
    if (scrollContainer) {
      canScrollLeft = scrollContainer.scrollLeft > 0;
      canScrollRight = scrollContainer.scrollLeft < (scrollContainer.scrollWidth - scrollContainer.clientWidth);
    }
  }

  const displaySellers = $derived(sellers.filter(seller => 
    seller && seller.id && seller.username
  ));
</script>

<section class="w-full {className}">
  <!-- Header -->
  <div class="px-2 sm:px-4 lg:px-6 mb-3">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <h2 class="text-base font-normal text-gray-900 leading-tight">{title}</h2>
        {#if description}
          <p class="text-xs text-gray-500">{description}</p>
        {:else if displaySellers.length > 0}
          <p class="text-xs text-gray-500">
            {displaySellers.length} seller{displaySellers.length === 1 ? '' : 's'} • updated recently
          </p>
        {/if}
      </div>
      
      <div class="flex items-center gap-2">
        <!-- Scroll chevrons -->
        <div class="flex items-center gap-1">
          <button 
            class="w-8 h-8 rounded-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center" 
            onclick={scrollLeft}
            disabled={!canScrollLeft || loading}
          >
            <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            class="w-8 h-8 rounded-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center" 
            onclick={scrollRight}
            disabled={!canScrollRight || loading}
          >
            <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {#if onViewAll}
          <button class="text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:text-blue-700" onclick={onViewAll}>
            View All
          </button>
        {/if}
      </div>
    </div>
  </div>

  <!-- Sellers -->
  {#if loading}
    <div class="flex gap-2 sm:gap-3 px-2 sm:px-4 lg:px-6 overflow-x-hidden">
      {#each Array(3) as _}
        <div class="bg-white border border-gray-200 rounded-xl p-4 animate-pulse flex-shrink-0" style="width: calc(50vw - 8px);">
          <div class="flex flex-col items-center">
            <div class="w-14 h-14 bg-gray-200 rounded-full mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-12 mb-1"></div>
            <div class="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-16 mb-3"></div>
            <div class="grid grid-cols-3 gap-1 w-full mb-3">
              {#each Array(3) as _}
                <div class="aspect-square bg-gray-200 rounded-lg"></div>
              {/each}
            </div>
            <div class="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if displaySellers.length === 0}
    <div class="text-center py-8 px-2 sm:px-4 lg:px-6">
      <p class="text-gray-500">No sellers available</p>
    </div>
  {:else}
    <div bind:this={scrollContainer} class="flex gap-2 sm:gap-3 px-2 sm:px-4 lg:px-6 overflow-x-auto scrollbar-hide" onscroll={updateScrollButtons}>
      {#each displaySellers as seller}
        <div class="flex-shrink-0 snap-start" style="width: calc(50vw - 8px);" data-seller-card>
          <SellerProfileCard
            {seller}
            productPreviews={getSellerPreviews(seller.id)}
            onclick={() => handleSellerClick(seller)}
            class="h-full"
          />
        </div>
      {/each}
    </div>
  {/if}
</section>

{#if selectedSeller && showQuickView}
  <SellerQuickView
    seller={selectedSeller}
    isOpen={showQuickView}
    onClose={closeQuickView}
    onViewProfile={() => {
      closeQuickView();
      if (typeof window !== 'undefined') {
        window.location.href = `/profile/${selectedSeller.id}`;
      }
    }}
  />
{/if}