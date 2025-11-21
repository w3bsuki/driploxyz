<!--
  Wrapper for FavoriteButton that provides real-time functionality
  This bridges the UI package component with app-specific services
-->
<script lang="ts">
  import { FavoriteButton } from '@repo/ui';
  import type { Database } from '@repo/database';
  import { favoritesStore, favoritesActions } from '$lib/utils/realtimeSetup';

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
  const favoritesState = $derived.by(() => ({
    favorites: favoritesStore.favorites,
    favoriteCounts: favoritesStore.favoriteCounts
  }));

  // Real-time updates are disabled until the service is implemented

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
  {favorited}
  onclick={onFavorite || handleFavorite}
  {showCount}
  count={favoritesState.favoriteCounts[product?.id ?? ''] ?? 0}
  {absolute}
  customPosition={customPosition ?? 'top-2 right-2'}
  label={favorited ? (removeFromFavoritesText ?? 'Remove from favorites') : (addToFavoritesText ?? 'Add to favorites')}
/>