<!--
  Wrapper for FavoriteButton that provides real-time functionality
  This bridges the UI package component with app-specific services
-->
<script lang="ts">
  import { FavoriteButton } from '@repo/ui';
  import {
    realtimeService,
    realtimeStore,
    favoritesStore,
    favoritesActions
  } from '$lib/utils/realtimeSetup';
  import { derived } from 'svelte/store';

  interface Props {
    product: any;
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

  // Create a derived store that combines favorites store with real-time counts
  const favoritesState = derived(
    [favoritesStore, realtimeStore],
    ([$favorites, $realtime]) => ({
      favorites: $favorites.favorites,
      favoriteCounts: {
        ...$favorites.favoriteCounts,
        // Merge real-time product metrics
        ...Object.fromEntries(
          Object.entries($realtime.metrics.productMetrics).map(
            ([productId, metrics]) => [productId, metrics.favorite_count]
          )
        )
      }
    })
  );

  // Subscribe to real-time updates for this product
  $effect(() => {
    if (realtimeService && product?.id) {
      realtimeService.subscribeToProduct(product.id);
    }

    return () => {
      if (realtimeService && product?.id) {
        realtimeService.unsubscribeFromProduct(product.id);
      }
    };
  });

  async function handleFavorite() {
    if (!product?.id) return;

    try {
      await favoritesActions.toggleFavorite(product.id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
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
  favoritesState={$favoritesState}
  {absolute}
  {customPosition}
/>