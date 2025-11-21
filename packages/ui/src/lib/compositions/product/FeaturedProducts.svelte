<script lang="ts">
  import ProductCard from '../cards/ProductCard.svelte';
  import Button from '../../primitives/button/Button.svelte';
  import NewestListingsBanner from '../banners/NewestListingsBanner.svelte';
  import ProductCardSkeleton from '../../primitives/skeleton/ProductCardSkeleton.svelte';
  import type { Product } from '../../types/product';

  interface Translations {
    empty_noProducts: string;
    empty_startBrowsing: string;
    nav_sell: string;
    home_browseAll: string;
    home_itemCount: string;
    home_itemCountNew?: (inputs: { count: number }) => string;
    home_updatedMomentsAgo: string;
    product_size: string;
    trending_newSeller: string;
    seller_unknown: string;
    common_currency: string;
    product_addToFavorites: string;
    condition_brandNewWithTags?: string;
    condition_newWithoutTags?: string;
    condition_new: string;
    condition_likeNew: string;
    condition_good: string;
    condition_worn?: string;
    condition_fair: string;
    categoryTranslation?: (category: string) => string;
    banner_viewAll?: string;
  }

  interface Props {
    products: Product[];
    errors?: { products?: string };
      loading?: boolean; // Changed _loading to loading
    onProductClick: (product: Product) => void;
    onFavorite: (productId: string) => void;
    onBrowseAll?: () => void;
    onSellClick?: () => void;
    formatPrice?: (price: number) => string;
    translations: Translations;
    sectionTitle?: string;
      favoritesState?: { favorites: Record<string, boolean>; favoriteCounts: Record<string, number> }; // Typed favoritesState
    showCategoryTabs?: boolean;
    activeCategory?: 'fresh' | 'recent';
    onCategoryChange?: (category: 'fresh' | 'recent') => void;
    showViewAllButton?: boolean;
    onViewAll?: () => void;
    class?: string;
  }

  let { 
    products = [], 
    errors, 
      loading = false, // Changed _loading to loading
    onProductClick, 
    onFavorite, 
    onBrowseAll,
    onSellClick,
    formatPrice = (price: number) => `$${price.toFixed(2)}`,
    translations,
    sectionTitle = 'Newest listings', // Will be overridden by parent with proper translation
      favoritesState, // Typed favoritesState
    showCategoryTabs = false,
    activeCategory = 'fresh',
    onCategoryChange,
    showViewAllButton = false,
    onViewAll,
    class: className = ''
  }: Props = $props();
  
  // Derived states
  const hasProducts = $derived(products.length > 0);
  const hasErrors = $derived(!!errors?.products);
    const gridId = $derived(products[0]?.id ? `product-grid-${products[0]?.id}` : 'product-grid'); // Simplified gridId computation

  const sectionBaseClass = `
    pb-[var(--space-5)] sm:pb-[var(--space-6)]
  `.replace(/\s+/g, ' ').trim();

  const bannerWrapperClass = `
    px-[var(--space-3)] sm:px-[var(--space-4)] lg:px-[var(--space-6)]
    mb-[var(--space-1)]
  `.replace(/\s+/g, ' ').trim();

  const gridWrapperClass = `
    px-[var(--space-3)] sm:px-[var(--space-4)] lg:px-[var(--space-6)]
    grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
    gap-[var(--space-2)] sm:gap-[var(--space-3)]
  `.replace(/\s+/g, ' ').trim();

  const emptyStateClass = `
    px-[var(--space-3)] sm:px-[var(--space-4)] lg:px-[var(--space-6)]
    text-center py-[var(--space-10)]
  `.replace(/\s+/g, ' ').trim();
</script>

<!-- Product Grid Section with standardized spacing (tokens) -->
<section
  class={`${sectionBaseClass} ${className}`}
  aria-label={sectionTitle}
>
  <!-- Section Banner with proper container -->
  <div class={bannerWrapperClass}>
    <NewestListingsBanner
      heading={sectionTitle}
      copy={hasProducts ? `${products.length} ${translations.home_itemCount} • ${translations.home_updatedMomentsAgo}` : undefined}
      itemCount={hasProducts ? products.length : undefined}
      itemCountText={translations.home_itemCountNew ? translations.home_itemCountNew({ count: products.length }) : undefined}
      cta={showViewAllButton && hasProducts && onViewAll ? { label: translations.banner_viewAll ?? 'View All', action: onViewAll } : undefined}
      showCategoryTabs={showCategoryTabs && hasProducts}
      {activeCategory}
      onCategoryChange={onCategoryChange}
    />
  </div>
  
  
  <!-- Loading State -->
  {#if loading}
    <div
      class={gridWrapperClass}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading products"
    >
      {#each Array(10) as _, _i}
        <ProductCardSkeleton />
      {/each}
      <span class="sr-only">Loading products, please wait...</span>
    </div>
  <!-- Featured Products Grid - Mobile-First Responsive -->
  {:else if hasProducts}
    <div
      id={gridId}
      class={gridWrapperClass}
      role="list"
      aria-label="Product grid with {products.length} items"
    >
      {#each products as product, _index (product.id)}
        <article
          role="listitem"
          aria-setsize={products.length}
          aria-posinset={_index + 1}
        >
          <ProductCard 
            {product}
            onclick={() => onProductClick(product)}
            onFavorite={() => onFavorite(product.id)}
            favorited={favoritesState?.favorites[product.id] || false}
            {favoritesState}
            priority={_index < 6}
            index={_index}
            totalCount={products.length}
            translations={{
              size: translations.product_size,
              currency: translations.common_currency,
              addToFavorites: translations.product_addToFavorites,
              brandNewWithTags: translations.condition_brandNewWithTags,
              newWithoutTags: translations.condition_newWithoutTags,
              new: translations.condition_new,
              likeNew: translations.condition_likeNew,
              good: translations.condition_good,
              worn: translations.condition_worn,
              fair: translations.condition_fair,
              formatPrice: formatPrice,
              categoryTranslation: translations.categoryTranslation
            }}
          />
        </article>
      {/each}
    </div>
  {:else}
    <div
      class={emptyStateClass}
      role="status"
      aria-label="No products available"
    >
      <svg class="mx-auto h-12 w-12 text-[color:var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-7H5m14 14H5" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-[color:var(--text-primary)]">{translations.empty_noProducts}</h3>
      <p class="mt-1 text-sm text-[color:var(--text-secondary)]">{translations.empty_startBrowsing}</p>
      <div class="mt-6">
        <Button 
          variant="primary" 
          onclick={onSellClick}
        >
          {translations.nav_sell}
        </Button>
      </div>
    </div>
  {/if}

  <!-- Load More -->
  {#if hasProducts}
    <nav class="text-center mt-[var(--gutter-md)] sm:mt-[var(--gutter-lg)]" aria-label="Load more products">
      <Button
        variant="ghost"
        size="lg"
        class="text-[color:var(--text-secondary)]"
        onclick={onBrowseAll}
      >
        {translations.home_browseAll}
      </Button>
    </nav>
  {/if}
  
  <!-- Error Messages -->
  {#if hasErrors}
    <div 
      class="mt-4 p-4 rounded-md bg-[color:var(--status-error-bg)] border border-[color:var(--status-error-border)]"
      role="alert"
      aria-live="assertive"
    >
      <p class="text-sm" style="color: var(--status-error-text)">
        <span class="sr-only">Error: </span>
        {errors?.products}
      </p>
    </div>
  {/if}
</section>

