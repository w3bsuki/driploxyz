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
    showToggle?: boolean;
    activeTab?: 'sellers' | 'brands';
    onToggle?: (tab: 'sellers' | 'brands') => void;
  }

  let { 
    sellers = [],
    sellerProducts = {},
    onSellerClick,
    onViewAll,
    loading = false,
    title = 'Featured Sellers',
    description = '',
    class: className = '',
    showToggle = false,
    activeTab = 'sellers',
    onToggle
  }: Props = $props();

  let selectedSeller = $state<any>(null);
  let showQuickView = $state(false);
  let scrollContainer = $state<HTMLElement>();
  let canScrollLeft = $state(false);
  let canScrollRight = $state(false);

  function handleSellerClick(seller: Seller) {
    // If parent provided a handler, delegate so the modal can render at page/layout level
    if (onSellerClick) {
      onSellerClick(seller);
      return;
    }
    // Fallback: open local quick view (used when no parent handler is passed)
    selectedSeller = seller;
    showQuickView = true;
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

  const displaySellers = $derived(
    sellers
      .filter((seller) => seller && seller.id && seller.username)
      .map((s) => ({
        ...s,
        avatar_url: s.avatar_url ?? ''
      })) as unknown as any[]
  );
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
        <!-- Custom header actions / optional toggle -->
        {#if showToggle}
          <div class="flex items-center mr-2">
            <div class="inline-flex p-0.5 rounded-full bg-gray-100 border border-gray-200">
              <button
                class="px-3 py-1.5 text-xs font-medium rounded-full {activeTab === 'brands' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-700'}"
                aria-pressed={activeTab === 'brands'}
                onclick={() => onToggle?.('brands')}
              >Brands</button>
              <button
                class="px-3 py-1.5 text-xs font-medium rounded-full {activeTab === 'sellers' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-700'}"
                aria-pressed={activeTab === 'sellers'}
                onclick={() => onToggle?.('sellers')}
              >Sellers</button>
            </div>
          </div>
        {/if}
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
        <div class="flex-shrink-0 snap-start w-1/2 sm:w-1/3 lg:w-1/4 xl:w-1/5" data-seller-card>
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

{#if !onSellerClick && selectedSeller && showQuickView}
  <SellerQuickView
    seller={selectedSeller as any}
    isOpen={showQuickView}
    onClose={closeQuickView}
  />
{/if}
