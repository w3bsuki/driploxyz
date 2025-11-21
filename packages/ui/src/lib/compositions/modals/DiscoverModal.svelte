<script lang="ts">
import { fly, fade } from 'svelte/transition';
import { quintOut } from 'svelte/easing';

interface Seller {
  id: string;
  username: string;
  display_name?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  verified?: boolean;
  items?: number;
  product_count?: number;
  rating?: number;
}

interface Brand {
  id: string;
  name: string;
  avatar?: string | null;
  verified?: boolean;
  trending?: string;
  items: number;
}

interface Props {
  open?: boolean;
  topSellers?: Seller[];
  topBrands?: Brand[];
  onClose: () => void;
  onSellerClick?: (seller: Seller) => void;
  onBrandClick?: (brand: Brand) => void;
  onViewAllSellers?: () => void;
  i18n?: any;
}

let {
  open = false,
  topSellers = [],
  topBrands = [],
  onClose,
  onSellerClick,
  onBrandClick,
  onViewAllSellers,
  i18n
}: Props = $props();

let panelRef: HTMLDivElement | null = $state(null);
let activeTab = $state<'sellers' | 'brands'>('sellers');
let searchQuery = $state('');

// Filter sellers/brands based on search
const filteredSellers = $derived(
  searchQuery.trim() 
    ? topSellers.filter(s => 
        getSellerName(s).toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : topSellers
);

const filteredBrands = $derived(
  searchQuery.trim()
    ? topBrands.filter(b => 
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : topBrands
);

// Top 3 featured sellers
const featuredSellers = $derived(filteredSellers.slice(0, 3));
const regularSellers = $derived(filteredSellers.slice(3));

// Compute seller name
function getSellerName(seller: Seller): string {
  return seller.display_name || seller.full_name || seller.username || 'Unknown';
}

// Handle click outside
$effect(() => {
  if (typeof window === 'undefined' || !open) return;

  const handleClickOutside = (e: MouseEvent) => {
    if (panelRef && !panelRef.contains(e.target as Node)) {
      onClose();
    }
  };

  // Small delay to avoid immediate close on open
  const timer = setTimeout(() => {
    document.addEventListener('mousedown', handleClickOutside);
  }, 100);

  return () => {
    clearTimeout(timer);
    document.removeEventListener('mousedown', handleClickOutside);
  };
});

// Handle escape key
$effect(() => {
  if (typeof window === 'undefined' || !open) return;

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  document.addEventListener('keydown', handleEscape);

  return () => {
    document.removeEventListener('keydown', handleEscape);
  };
});

// Focus management
$effect(() => {
  if (typeof window === 'undefined' || !open || !panelRef) return;

  // Focus first interactive element
  const firstButton = panelRef.querySelector('button');
  if (firstButton) {
    // Small delay for transition
    setTimeout(() => firstButton.focus(), 150);
  }
});
</script>

{#if open}
  <!-- Backdrop for mobile -->
  <div
    role="button"
    tabindex="-1"
    class="fixed inset-0 bg-[var(--modal-overlay-bg)] z-40 md:hidden"
    onclick={onClose}
    onkeydown={(e) => e.key === 'Enter' && onClose()}
    transition:fade={{ duration: 200 }}
  ></div>

  <!-- Top-attached Dropdown Panel -->
  <div
    bind:this={panelRef}
    role="dialog"
    aria-modal="true"
    aria-labelledby="discover-panel-title"
    class="fixed top-[60px] left-0 right-0 z-40 bg-surface-base shadow-lg
           max-h-[calc(100vh-60px)] md:max-h-[600px] overflow-hidden flex flex-col
           md:left-auto md:right-4 md:w-[600px] lg:w-[700px] md:rounded-b-lg md:shadow-xl md:border md:border-t-0 md:border-border-subtle"
    in:fly={{ y: -20, duration: 300, easing: quintOut }}
    out:fly={{ y: -20, duration: 200, easing: quintOut }}
  >
      <!-- Header -->
      <div class="sticky top-0 bg-surface-base z-10">
        <div class="px-4 py-3 flex items-center justify-between border-b border-border-subtle">
          <div class="flex items-center gap-2">
            <svg class="w-6 h-6 text-text-brand" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <h2 id="discover-panel-title" class="text-lg font-bold text-text-primary">
              {i18n?.discover_title?.() || 'Discover'}
            </h2>
          </div>
          <button
            onclick={onClose}
            class="w-9 h-9 rounded-full hover:bg-surface-subtle transition-colors flex items-center justify-center text-text-secondary hover:text-text-primary"
            aria-label="Close"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-border-subtle px-4">
          <button
            onclick={() => activeTab = 'sellers'}
            class="flex-1 px-4 py-3 text-sm font-medium transition-colors relative
                   {activeTab === 'sellers' ? 'text-text-brand' : 'text-text-secondary hover:text-text-primary'}"
          >
            👥 {i18n?.discover_sellers?.() || 'Sellers'}
            {#if activeTab === 'sellers'}
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"></div>
            {/if}
          </button>
          <button
            onclick={() => activeTab = 'brands'}
            class="flex-1 px-4 py-3 text-sm font-medium transition-colors relative
                   {activeTab === 'brands' ? 'text-text-brand' : 'text-text-secondary hover:text-text-primary'}"
          >
            ⭐ {i18n?.discover_brands?.() || 'Brands'}
            {#if activeTab === 'brands'}
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"></div>
            {/if}
          </button>
        </div>

        <!-- Search Bar -->
        <div class="px-4 py-3">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              bind:value={searchQuery}
              placeholder={activeTab === 'sellers' ? (i18n?.search_sellers?.() || 'Search sellers...') : (i18n?.search_brands?.() || 'Search brands...')}
              class="w-full pl-10 pr-4 py-2 bg-surface-subtle border border-border-subtle rounded-lg 
                     text-text-primary placeholder:text-text-tertiary
                     focus:outline-none focus:ring-2 focus:ring-state-focus focus:border-border-emphasis"
            />
            {#if searchQuery}
              <button
                onclick={() => searchQuery = ''}
                class="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                aria-label="Clear search"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            {/if}
          </div>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto p-4 md:p-6">
        
        <!-- Sellers Tab -->
        {#if activeTab === 'sellers'}
          <!-- Featured Top 3 Sellers -->
          {#if featuredSellers.length > 0}
            <section class="mb-6">
              <h3 class="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                {i18n?.discover_featured?.() || 'Featured Sellers'}
              </h3>
              <div class="space-y-3">
                {#each featuredSellers as seller, index}
                  <div class="flex items-center gap-4 p-4 bg-surface-subtle hover:bg-surface-muted rounded-lg transition-colors border border-border-subtle">
                    <!-- Rank Badge -->
                    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary text-text-inverse font-bold flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                    
                    <!-- Avatar -->
                    <div class="relative flex-shrink-0">
                      {#if seller.avatar_url}
                        <img
                          src={seller.avatar_url}
                          alt={getSellerName(seller)}
                          class="w-12 h-12 rounded-full object-cover border-2 border-border-subtle"
                          onerror={(e) => { const target = e.target as HTMLImageElement; target.src = 'https://avatar.vercel.sh/' + seller.username; }}
                        />
                      {:else}
                        <div class="w-12 h-12 rounded-full bg-surface-brand-subtle flex items-center justify-center border-2 border-border-subtle">
                          <span class="text-brand-primary font-semibold text-lg">
                            {getSellerName(seller)[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      {/if}
                      {#if seller.verified}
                        <div class="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-status-success-bg rounded-full flex items-center justify-center border-2 border-surface-base">
                          <svg class="w-3 h-3 text-status-success-text" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                        </div>
                      {/if}
                    </div>
                    
                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <h4 class="font-semibold text-text-primary truncate">
                          {getSellerName(seller)}
                        </h4>
                      </div>
                      <p class="text-sm text-text-secondary">@{seller.username}</p>
                      <div class="flex items-center gap-3 mt-1">
                        {#if seller.rating}
                          <div class="flex items-center gap-1 text-xs text-text-secondary">
                            <svg class="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span class="font-medium">{seller.rating.toFixed(1)}</span>
                          </div>
                        {/if}
                        {#if seller.items || seller.product_count}
                          <span class="text-xs text-text-tertiary">
                            {seller.items || seller.product_count} items
                          </span>
                        {/if}
                      </div>
                    </div>
                    
                    <!-- CTA Button -->
                    <button
                      onclick={() => onSellerClick?.(seller)}
                      class="px-4 py-2 bg-brand-primary text-text-inverse text-sm font-medium rounded-lg hover:bg-brand-primary-emphasis transition-colors flex-shrink-0"
                    >
                      {i18n?.discover_viewProfile?.() || 'View Profile'}
                    </button>
                  </div>
                {/each}
              </div>
            </section>
          {/if}

          <!-- Regular Sellers Grid -->
          {#if regularSellers.length > 0}
            <section>
              <h3 class="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                {i18n?.discover_allSellers?.() || 'All Sellers'}
              </h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {#each regularSellers as seller}
                  <button
                    onclick={() => onSellerClick?.(seller)}
                    class="flex flex-col items-center p-4 bg-surface-subtle hover:bg-surface-muted rounded-lg border border-border-subtle hover:border-border-emphasis transition-all duration-200 group"
                  >
                    <div class="relative mb-3">
                      {#if seller.avatar_url}
                        <img
                          src={seller.avatar_url}
                          alt={getSellerName(seller)}
                          class="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
                          onerror={(e) => { const target = e.target as HTMLImageElement; target.src = 'https://avatar.vercel.sh/' + seller.username; }}
                        />
                      {:else}
                        <div class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-surface-brand-subtle flex items-center justify-center">
                          <span class="text-brand-primary font-semibold text-2xl">
                            {getSellerName(seller)[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      {/if}
                      {#if seller.verified}
                        <div class="absolute -bottom-1 -right-1 bg-surface-base rounded-full p-1">
                          <svg class="w-4 h-4 text-status-success-text" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                        </div>
                      {/if}
                    </div>
                    <span class="text-sm font-semibold text-text-primary group-hover:text-text-brand truncate w-full text-center mb-1">
                      {getSellerName(seller)}
                    </span>
                    <div class="flex items-center gap-2 text-xs text-text-secondary">
                      {#if seller.rating && seller.rating > 0}
                        <div class="flex items-center gap-1">
                          <svg class="w-3 h-3 text-status-warning-text" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span>{seller.rating.toFixed(1)}</span>
                        </div>
                        <span>•</span>
                      {/if}
                      <span>{seller.items || seller.product_count || 0} items</span>
                    </div>
                  </button>
                {/each}
              </div>
            </section>
          {/if}

          <!-- Empty State (Sellers) -->
          {#if featuredSellers.length === 0 && regularSellers.length === 0}
            <div class="text-center py-12">
              <svg class="w-16 h-16 mx-auto mb-4 text-text-disabled" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p class="text-text-secondary">
                {i18n?.discover_noSellers?.() || 'No sellers found'}
              </p>
            </div>
          {/if}
        
        <!-- Brands Tab -->
        {:else if activeTab === 'brands'}
          {#if filteredBrands.length > 0}
            <section>
              <h3 class="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                {i18n?.discover_topBrands?.() || 'Top Brands'}
              </h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {#each filteredBrands as brand}
                  <button
                    onclick={() => onBrandClick?.(brand)}
                    class="flex flex-col items-center p-4 bg-surface-subtle hover:bg-surface-muted rounded-lg border border-border-subtle hover:border-border-emphasis transition-all duration-200 group"
                  >
                    <div class="relative mb-3">
                      {#if brand.avatar}
                        <img
                          src={brand.avatar}
                          alt={brand.name}
                          class="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
                          onerror={(e) => { const target = e.target as HTMLImageElement; target.src = '/avatars/1.png'; }}
                        />
                      {:else}
                        <div class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-surface-brand-subtle flex items-center justify-center">
                          <span class="text-brand-primary font-semibold text-2xl">
                            {brand.name[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      {/if}
                      {#if brand.verified}
                        <div class="absolute -bottom-1 -right-1 bg-surface-base rounded-full p-1">
                          <svg class="w-4 h-4 text-status-success-text" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                        </div>
                      {/if}
                    </div>
                    <span class="text-sm font-semibold text-text-primary group-hover:text-text-brand truncate w-full text-center mb-1">
                      {brand.name}
                    </span>
                    <div class="flex items-center gap-2 text-xs text-text-secondary">
                      {#if brand.trending}
                        <span class="px-1.5 py-0.5 bg-status-success-bg text-status-success-text rounded font-medium">
                          {brand.trending}
                        </span>
                      {/if}
                      <span>{brand.items} items</span>
                    </div>
                  </button>
                {/each}
              </div>
            </section>
          {:else}
            <div class="text-center py-12">
              <svg class="w-16 h-16 mx-auto mb-4 text-text-disabled" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p class="text-text-secondary">
                {i18n?.discover_noBrands?.() || 'No brands found'}
              </p>
            </div>
          {/if}
        {/if}

      </div>
  </div>
{/if}
