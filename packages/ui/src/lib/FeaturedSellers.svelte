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

  // Track selected seller for quick view
  let selectedSeller = $state<Seller | null>(null);
  let showQuickView = $state(false);
  
  // Scroll container reference
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

  // Get product previews for a seller
  function getSellerPreviews(sellerId: string): Product[] {
    return sellerProducts[sellerId] || [];
  }

  // Scroll functionality
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

  // Update scroll button states
  function updateScrollButtons() {
    if (scrollContainer) {
      canScrollLeft = scrollContainer.scrollLeft > 0;
      canScrollRight = scrollContainer.scrollLeft < (scrollContainer.scrollWidth - scrollContainer.clientWidth);
    }
  }

  // Handle view all action
  function handleViewAll() {
    onViewAll?.();
  }

  // Keyboard navigation for scroll buttons
  function handleScrollKeydown(e: KeyboardEvent, direction: 'left' | 'right') {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      direction === 'left' ? scrollLeft() : scrollRight();
    }
  }

  function handleViewAllKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleViewAll();
    }
  }

  // Production-ready data validation
  const displaySellers = $derived(sellers.filter(seller => 
    seller && 
    seller.id && 
    seller.username &&
    seller.username.trim().length > 0
  ));

  // Generate unique IDs for a11y
  const sectionId = $derived(`featured-sellers-${Math.random().toString(36).substr(2, 9)}`);
  const headingId = $derived(`${sectionId}-heading`);
</script>

<section class="w-full {className}" id={sectionId} aria-labelledby={headingId}>
  <!-- Section Header -->
  <div class="px-4 mb-4">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h2 id={headingId} class="text-lg font-medium text-gray-900 tracking-tight leading-tight">{title}</h2>
        {#if description}
          <p class="text-xs text-gray-500 font-normal mt-0.5" style="letter-spacing: -0.01em;">{description}</p>
        {:else if displaySellers.length > 0}
          <p class="text-xs text-gray-500 font-normal mt-0.5" style="letter-spacing: -0.01em;" aria-live="polite">
            {displaySellers.length} seller{displaySellers.length === 1 ? '' : 's'} • updated recently
          </p>
        {/if}
      </div>
      
      <div class="flex items-center gap-1.5">
        <!-- Scroll chevrons -->
        <div class="flex items-center gap-1" role="group" aria-label="Scroll sellers">
          <button 
            type="button" 
            class="w-8 h-8 rounded-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center" 
            onclick={scrollLeft}
            onkeydown={(e) => handleScrollKeydown(e, 'left')}
            disabled={!canScrollLeft || loading}
            aria-label="Scroll left to previous sellers"
          >
            <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            type="button" 
            class="w-8 h-8 rounded-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center" 
            onclick={scrollRight}
            onkeydown={(e) => handleScrollKeydown(e, 'right')}
            disabled={!canScrollRight || loading}
            aria-label="Scroll right to next sellers"
          >
            <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <!-- See All button -->
        {#if onViewAll}
          <button 
            type="button" 
            class="text-sm font-medium text-[oklch(0.6_0.25_250)] hover:text-[oklch(0.55_0.25_250)] focus:text-[oklch(0.55_0.25_250)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.6_0.25_250)] focus:ring-offset-1 rounded transition-all"
            onclick={handleViewAll}
            onkeydown={handleViewAllKeydown}
            aria-label="View all sellers"
          >
            View All
          </button>
        {/if}
      </div>
    </div>
  </div>

  <!-- Horizontal Scrolling Sellers -->
  {#if loading}
    <!-- Loading State -->
    <div class="flex gap-4 px-4 overflow-x-hidden" aria-label="Loading sellers" role="status">
      {#each Array(3) as _, index}
        <div 
          class="bg-white border border-gray-200 rounded-xl p-4 animate-pulse flex-shrink-0" 
          style="width: calc(50vw - 24px);"
          aria-label="Loading seller {index + 1}"
        >  
          <div class="flex flex-col items-center">
            <div class="w-14 h-14 bg-gray-200 rounded-full mb-2" aria-hidden="true"></div>
            <div class="h-3 bg-gray-200 rounded w-12 mb-1" aria-hidden="true"></div>
            <div class="h-4 bg-gray-200 rounded w-20 mb-2" aria-hidden="true"></div>
            <div class="h-3 bg-gray-200 rounded w-16 mb-3" aria-hidden="true"></div>
            <div class="grid grid-cols-3 gap-1 w-full mb-3" aria-hidden="true">
              {#each Array(3) as _}
                <div class="aspect-square bg-gray-200 rounded-lg"></div>
              {/each}
            </div>
            <div class="h-8 bg-gray-200 rounded w-full" aria-hidden="true"></div>
          </div>
        </div>
      {/each}
      <span class="sr-only">Loading sellers...</span>
    </div>
  {:else if !displaySellers || displaySellers.length === 0}
    <!-- Empty State -->
    <div class="text-center py-12 px-4" role="status" aria-live="polite">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No Sellers Available</h3>
      <p class="text-gray-500 text-sm">Check back later for featured sellers</p>
    </div>
  {:else}
    <!-- Horizontal Scrolling Sellers -->
    <div 
      bind:this={scrollContainer}
      class="flex gap-4 px-4 overflow-x-auto scrollbar-hide"
      role="region"
      aria-label="Featured sellers carousel"
      onscroll={updateScrollButtons}
    >
      {#each displaySellers as seller, index (seller.id)}
        <div 
          class="flex-shrink-0 snap-start"
          style="width: calc(50vw - 24px);"
          data-seller-card
        >
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

<!-- Seller Quick View Dialog -->
{#if selectedSeller && showQuickView}
  <SellerQuickView
    seller={selectedSeller}
    isOpen={showQuickView}
    onClose={closeQuickView}
    onViewProfile={() => {
      closeQuickView();
      // Use proper navigation instead of direct window.location
      if (typeof window !== 'undefined') {
        const profileUrl = `/profile/${selectedSeller.id}`;
        window.location.href = profileUrl;
      }
    }}
  />
{/if}