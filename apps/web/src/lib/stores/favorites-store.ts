/**
 * Favorites Store - Clean Svelte 5 Implementation
 */

import { favoritesStoreInstance } from './favorites.svelte';

// Direct exports from the Svelte 5 store
export const {
  isLoading,
  error,
  favorites,
  favoriteCounts,
  toggleFavorite,
  checkFavoriteStatus,
  loadMultipleFavoriteStatuses,
  loadUserFavorites,
  removeFavorite,
  isFavorited,
  getFavoriteCount,
  updateCounts,
  clearState,
  clearError
} = favoritesStoreInstance;

interface LegacyFavoritesState {
  isLoading: boolean;
  error: string | null;
  favorites: Record<string, boolean>;
  favoriteCounts: Record<string, number>;
}

// Maintain legacy API compatibility
export const favoritesStore = {
  subscribe: (fn: (state: LegacyFavoritesState) => void) => {
    // Legacy subscribe compatibility - not recommended for new code
    return fn({
      isLoading: favoritesStoreInstance.isLoading,
      error: favoritesStoreInstance.error,
      favorites: favoritesStoreInstance.favorites,
      favoriteCounts: favoritesStoreInstance.favoriteCounts
    });
  }
};

export const favoritesActions = {
  toggleFavorite,
  checkFavoriteStatus,
  loadMultipleFavoriteStatuses,
  loadUserFavorites,
  removeFavorite,
  isFavorited,
  getFavoriteCount,
  updateCounts,
  clearState,
  clearError
};