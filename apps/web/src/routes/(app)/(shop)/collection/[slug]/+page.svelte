<script lang="ts">
  import { goto } from '$app/navigation';
  import { ProductCard } from '@repo/ui';
  import type { Product } from '@repo/ui/types';
  import * as i18n from '@repo/i18n';
  import { favoritesActions, favoritesStore } from '$lib/stores/favorites.svelte';
  import { authPopupActions } from '$lib/stores/auth-popup.svelte';
  import { getProductUrl } from '$lib/utils/seo-urls';
  import type { PageData } from './$types';
  import type { BrandCollection } from '@repo/core';

  let { data }: { data: PageData } = $props();

  // Transform products for UI components
  const products = $derived<Product[]>(
    data.collection.products.map(product => ({
      id: product.id,
      title: product.title,
      price: product.price,
      currency: i18n.common_currency(),
      images: product.images || [],
      condition: product.condition as Product['condition'],
      seller_id: product.seller_id,
      category_id: '',
      size: undefined,
      brand: undefined,
      description: '',
      created_at: product.created_at,
      updated_at: product.updated_at,
      sold: false,
      favorite_count: 0,
      views_count: 0,
      category_name: '',
      main_category_name: '',
      subcategory_name: '',
      product_images: undefined,
      seller_name: '',
      seller_avatar: '',
      seller_rating: 0,
      is_promoted: false,
      slug: null
    }))
  );

  // Initialize favorites from server data
  $effect(() => {
    if (data.userFavorites) {
      // The favoritesStore with Svelte 5 runes doesn't have an update method
      // Load user favorites through the actions instead
      favoritesActions.loadUserFavorites();
    }
  });

  // Collection type display
  const collectionTypeLabel = $derived(
    data.collection.collection_type === 'designer'
      ? 'Designer Collection'
      : 'Drip Collection'
  );

  const collectionTypeEmoji = $derived(
    data.collection.collection_type === 'designer' ? '💎' : '🔥'
  );

  // Format price for display
  function formatPrice(price: number): string {
    const formatted = price % 1 === 0 ? price.toString() : price.toFixed(2);
    return `${formatted}${i18n.common_currency()}`;
  }

  function handleProductClick(product: Product) {
    if (!product.slug) {
      goto(`/product/${product.id}`);
      return;
    }
    goto(getProductUrl(product));
  }

  async function handleFavorite(productId: string) {
    if (!data.user) {
      authPopupActions.showForFavorite();
      return;
    }

    try {
      await favoritesActions.toggleFavorite(productId);
    } catch {
      // Failed to toggle favorite
    }
  }


  function handleRelatedCollectionClick(collection: BrandCollection) {
    goto(`/collection/${collection.slug}`);
  }

  // Pagination handlers
  function handlePreviousPage() {
    if (data.pagination.hasPrevious) {
      const newPage = data.pagination.currentPage - 1;
      goto(`/collection/${data.collection.slug}?page=${newPage}`, { replaceState: true });
    }
  }

  function handleNextPage() {
    if (data.pagination.hasMore) {
      const newPage = data.pagination.currentPage + 1;
      goto(`/collection/${data.collection.slug}?page=${newPage}`, { replaceState: true });
    }
  }
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta name="description" content={data.meta.description} />
  <link rel="canonical" href="https://driplo.com{data.meta.canonical}" />

  <!-- Open Graph -->
  <meta property="og:title" content={data.meta.title} />
  <meta property="og:description" content={data.meta.description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://driplo.com{data.meta.canonical}" />
  {#if data.meta.image}
    <meta property="og:image" content={data.meta.image} />
  {/if}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.meta.title} />
  <meta name="twitter:description" content={data.meta.description} />
  {#if data.meta.image}
    <meta name="twitter:image" content={data.meta.image} />
  {/if}
</svelte:head>

<div class="min-h-screen bg-[color:var(--surface-subtle)]" style="padding-top: var(--app-header-offset, 56px);">
  <!-- Collection Header -->
  <div class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Breadcrumb -->
      <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-4">
        <button onclick={() => goto('/')} class="hover:text-gray-700 transition-colors">
          {i18n.nav_home()}
        </button>
        <span>•</span>
        <span>Collections</span>
        <span>•</span>
        <span class="text-gray-900 font-medium">{data.collection.name}</span>
      </nav>

      <!-- Collection Info -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">{collectionTypeEmoji}</span>
            <h1 class="text-3xl font-bold text-gray-900">{data.collection.name}</h1>
          </div>

          {#if data.collection.description}
            <p class="text-gray-600 mb-2 max-w-2xl">{data.collection.description}</p>
          {/if}

          <div class="flex items-center gap-4 text-sm">
            <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {collectionTypeLabel}
            </span>
            <span class="text-gray-500">
              {data.collection.product_count} products
            </span>
          </div>
        </div>

        <!-- Collection Actions -->
        <div class="flex items-center gap-2">
          <button
            onclick={() => goto('/search')}
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Browse All
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Products Grid -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    {#if products.length > 0}
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {#each products as product}
          <ProductCard
            {product}
            onProductClick={() => handleProductClick(product)}
            onFavorite={() => handleFavorite(product.id)}
            isFavorited={favoritesStore?.favorites[product.id] || false}
            favoriteCount={favoritesStore?.favoriteCounts[product.id] || 0}
            {formatPrice}
            showCondition={true}
            showSeller={false}
            translations={{
              product_addToFavorites: i18n.product_addToFavorites(),
              condition_brandNewWithTags: i18n.sell_condition_brandNewWithTags(),
              condition_newWithoutTags: i18n.sell_condition_newWithoutTags(),
              condition_new: i18n.condition_new(),
              condition_likeNew: i18n.condition_likeNew(),
              condition_good: i18n.condition_good(),
              condition_worn: i18n.sell_condition_worn(),
              condition_fair: i18n.condition_fair(),
              seller_unknown: i18n.seller_unknown(),
              common_currency: i18n.common_currency()
            }}
          />
        {/each}
      </div>

      <!-- Pagination -->
      {#if data.pagination.totalPages > 1 || data.pagination.hasMore}
        <div class="flex justify-center items-center gap-2 py-8">
          <button
            onclick={handlePreviousPage}
            disabled={!data.pagination.hasPrevious}
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span class="px-4 py-2 text-sm text-gray-500">
            Page {data.pagination.currentPage}
          </span>

          <button
            onclick={handleNextPage}
            disabled={!data.pagination.hasMore}
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      {/if}
    {:else}
      <!-- Empty State -->
      <div class="text-center py-16">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl">{collectionTypeEmoji}</span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
        <p class="text-gray-500 mb-6 max-w-md mx-auto">
          This collection is currently being curated. Check back soon for amazing {data.collection.collection_type === 'designer' ? 'designer pieces' : 'streetwear finds'}!
        </p>
        <button
          onclick={() => goto('/search')}
          class="bg-[color:var(--brand-primary)] text-[color:var(--text-inverse)] px-6 py-3 rounded-lg font-medium hover:bg-[color:var(--brand-primary)]/90 transition-colors"
        >
          Explore All Products
        </button>
      </div>
    {/if}
  </div>

  <!-- Related Collections -->
  {#if data.relatedCollections.length > 0}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="border-t border-gray-200 pt-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">
          More {data.collection.collection_type === 'designer' ? 'Designer' : 'Drip'} Collections
        </h2>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {#each data.relatedCollections as collection}
            <button
              onclick={() => handleRelatedCollectionClick(collection)}
              class="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all text-left group"
            >
              <div class="flex items-center gap-2 mb-2">
                <span class="text-lg">
                  {collection.collection_type === 'designer' ? '💎' : '🔥'}
                </span>
                <span class="font-medium text-gray-900 group-hover:text-[color:var(--brand-primary)] transition-colors">
                  {collection.name}
                </span>
              </div>

              {#if collection.description}
                <p class="text-sm text-gray-500 mb-2 line-clamp-2">
                  {collection.description}
                </p>
              {/if}

              <div class="text-xs text-gray-400">
                {collection.product_count} products
              </div>
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>