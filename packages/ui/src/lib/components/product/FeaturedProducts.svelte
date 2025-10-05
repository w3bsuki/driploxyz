<script lang="ts">
  import ProductCard from '../cards/ProductCard.svelte';
  import Button from '../ui/Button.svelte';
  import NewestListingsBanner from '../banners/home/NewestListingsBanner.svelte';
  import ProductCardSkeleton from '../skeleton/ProductCardSkeleton.svelte';
  import type { Product } from '../../types/product';

  interface Translations {
    empty_noProducts: string;
    empty_startBrowsing: string;
    nav_sell: string;
    home_browseAll: string;
    home_itemCount: string;
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
  }

  interface Props {
    products: Product[];
    errors?: { products?: string };
    loading?: boolean;
    onProductClick: (product: Product) => void;
    onFavorite: (productId: string) => void;
    onBrowseAll?: () => void;
    onSellClick?: () => void;
    formatPrice?: (price: number) => string;
    translations: Translations;
    sectionTitle?: string;
    favoritesState?: any;
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
    loading = false, 
    onProductClick, 
    onFavorite, 
    onBrowseAll,
    onSellClick,
    formatPrice = (price: number) => `$${price.toFixed(2)}`,
    translations,
    sectionTitle = 'Newest listings', // Will be overridden by parent with proper translation
    favoritesState,
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
  const gridId = $derived(() => {
    const firstProductId = products[0]?.id;
    return firstProductId ? `product-grid-${firstProductId}` : 'product-grid';
  });
</script>

<!-- Product Grid Section with standardized spacing (tokens) -->
<section
  class="pb-3 sm:pb-4 {className}"
  aria-label={sectionTitle}
>
  <!-- Section Banner with proper container -->
  <div class="px-2 sm:px-4 lg:px-6 mb-4 sm:mb-6">
    <NewestListingsBanner
      heading={sectionTitle}
      copy={hasProducts ? `${products.length} ${translations.home_itemCount} • ${translations.home_updatedMomentsAgo}` : undefined}
      itemCount={hasProducts ? products.length : undefined}
      cta={showViewAllButton && hasProducts && onViewAll ? { label: 'View All', action: onViewAll } : undefined}
      showCategoryTabs={showCategoryTabs && hasProducts}
      {activeCategory}
      onCategoryChange={onCategoryChange}
    />
  </div>
  
  
  <!-- Loading State -->
  {#if loading}
    <div
      class="px-2 sm:px-4 lg:px-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading products"
    >
      {#each Array(10) as _, i}
        <ProductCardSkeleton />
      {/each}
      <span class="sr-only">Loading products, please wait...</span>
    </div>
  <!-- Featured Products Grid - Mobile-First Responsive -->
  {:else if hasProducts}
    <div
      id={gridId}
      class="px-2 sm:px-4 lg:px-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
      role="list"
      aria-label="Product grid with {products.length} items"
    >
      {#each products as product, index}
        <article
          role="listitem"
          aria-setsize={products.length}
          aria-posinset={index + 1}
        >
          <ProductCard 
            {product}
            onclick={() => onProductClick(product)}
            onFavorite={() => onFavorite(product.id)}
            favorited={favoritesState?.favorites[product.id] || false}
            {favoritesState}
            priority={index < 6}
            {index}
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
      class="px-2 sm:px-4 lg:px-6 text-center py-12"
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

