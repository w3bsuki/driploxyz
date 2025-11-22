<script lang="ts">
  // Shop layout - wrap shop pages with shop-specific UI
  import { page } from '$app/state';
  import { goto, pushState } from '$app/navigation';
  import { setContext } from 'svelte';
  import { BottomNav, FilterDrawer } from '@repo/ui';
  import * as i18n from '@repo/i18n';

  let { children } = $props();

  let showFilterDrawer = $state(false);

  // Sync with page state for back button support
  $effect(() => {
    if ((page.state as any).showFilterDrawer) {
      showFilterDrawer = true;
    } else {
      showFilterDrawer = false;
    }
  });

  setContext('filterDrawer', {
    open: () => {
      pushState('', { showFilterDrawer: true });
    },
    close: () => {
      if ((page.state as any).showFilterDrawer) {
        history.back();
      } else {
        showFilterDrawer = false;
      }
    }
  });

  // Helper to get filters from URL
  function getFiltersFromUrl(url: URL) {
    return {
      brand: url.searchParams.get('brand') || null,
      condition: url.searchParams.get('condition') || null,
      size: url.searchParams.get('size') || null,
      minPrice: url.searchParams.get('min_price') || null,
      maxPrice: url.searchParams.get('max_price') || null,
      sortBy: url.searchParams.get('sort') || 'relevance'
    };
  }

  let currentFilters = $derived(getFiltersFromUrl(page.url));

  function handleApplyFilters(newFilters: Record<string, any>) {
    const params = new URLSearchParams(page.url.searchParams);
    
    // Update params
    if (newFilters.brand && newFilters.brand !== 'all') params.set('brand', newFilters.brand); else params.delete('brand');
    if (newFilters.condition && newFilters.condition !== 'all') params.set('condition', newFilters.condition); else params.delete('condition');
    if (newFilters.size && newFilters.size !== 'all') params.set('size', newFilters.size); else params.delete('size');
    if (newFilters.minPrice) params.set('min_price', newFilters.minPrice); else params.delete('min_price');
    if (newFilters.maxPrice) params.set('max_price', newFilters.maxPrice); else params.delete('max_price');
    if (newFilters.sortBy && newFilters.sortBy !== 'relevance') params.set('sort', newFilters.sortBy); else params.delete('sort');

    // Always navigate to search
    goto(`/search?${params.toString()}`);
    showFilterDrawer = false;
  }

  function clearAllFilters() {
    goto('/search');
    showFilterDrawer = false;
  }
  
  // Mock data for now - ideally this comes from a store or context
  const popularBrands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Gap', 'Levi\'s', 'North Face'];
  const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
</script>

<div class="shop-layout">
  <!-- Mobile bottom nav -->
  {#if page.url.pathname && page.url.pathname.startsWith('/')}
    <BottomNav 
      currentPath={page.url.pathname} 
      onFilterClick={() => showFilterDrawer = true}
      labels={{
        home: i18n.nav_home ? i18n.nav_home() : 'Home',
        search: i18n.nav_search ? i18n.nav_search() : 'Search',
        sell: i18n.nav_sell ? i18n.nav_sell() : 'Sell',
        filter: i18n.common_filter ? i18n.common_filter() : 'Filter',
        profile: i18n.nav_profile ? i18n.nav_profile() : 'Profile'
      }}
    />
  {/if}

  <!-- Shop header/nav could go here -->
  {@render children()}
  <!-- Shop footer could go here -->

  <!-- Filter Drawer (Global) - Moved to end to ensure it's on top -->
  <FilterDrawer
    isOpen={showFilterDrawer}
    onClose={() => {
      if ((page.state as any).showFilterDrawer) {
        history.back();
      } else {
        showFilterDrawer = false;
      }
    }}
    onApply={handleApplyFilters}
    onClear={clearAllFilters}
    currentFilters={currentFilters}
    previewCount={undefined} 
    brands={popularBrands}
    sizes={commonSizes}
  />
</div>

