<!--
  Wrapper for FavoriteButton that provides real-time functionality
  This bridges the UI package component with app-specific services
-->
<script lang="ts">
  import { FavoriteButton } from '@repo/ui';
  import type { Database } from '@repo/database';
  import {
    realtimeService,
    realtimeStore,
    favoritesStore,
    favoritesActions
  } from '$lib/utils/realtimeSetup';

  type Product = Database['public']['Tables']['products']['Row'];

  interface Props {
    product: Product;
    favorited?: boolean;
    onFavorite?: () => void;
    addToFavoritesText?: string;
    removeFromFavoritesText?: string;
    showCount?: boolean;
    absolute?: boolean;
    customPosition?: string;
  }

  let {
    product,
    favorited = false,
    onFavorite,
    addToFavoritesText,
    removeFromFavoritesText,
    showCount = true,
    absolute = true,
    customPosition
  }: Props = $props();

  // Use Svelte 5 $derived for reactive state combination
  // This eliminates the need for derived stores and improves performance
  const favoritesState = $derived.by(() => {
    const favorites = favoritesStore;
    const realtime = realtimeStore;

    return {
      favorites: favorites.favorites,
      favoriteCounts: {
        ...favorites.favoriteCounts,
        // Merge real-time product metrics
        ...Object.fromEntries(
          Object.entries(realtime.metrics.productMetrics).map(
            ([productId, metrics]) => [productId, metrics.favorite_count]
          )
        )
      }
    };
  });

  // Subscribe to real-time updates for this product
  $effect(() => {
    if (realtimeService.instance && product?.id) {
      realtimeService.instance.subscribeToProduct(product.id);
    }

    return () => {
      if (realtimeService.instance && product?.id) {
        realtimeService.instance.unsubscribeFromProduct(product.id);
      }
    };
  });

  async function handleFavorite() {
    if (!product?.id) return;

    try {
      await favoritesActions.toggleFavorite(product.id);
    } catch {
      // Handle favorite toggle error silently
    }
  }
</script>

<FavoriteButton
  {product}
  {favorited}
  onFavorite={onFavorite || handleFavorite}
  {addToFavoritesText}
  {removeFromFavoritesText}
  {showCount}
  favoritesState={favoritesState}
  {absolute}
  {customPosition}
/>