import { writable } from 'svelte/store';

interface FavoriteState {
  isLoading: boolean;
  error: string | null;
  favorites: Record<string, boolean>; // productId -> isFavorited
  favoriteCounts: Record<string, number>; // productId -> count
}

const initialState: FavoriteState = {
  isLoading: false,
  error: null,
  favorites: {},
  favoriteCounts: {}
};

export const favoritesStore = writable<FavoriteState>(initialState);

export const favoritesActions = {
  /**
   * Toggle favorite status for a product
   */
  async toggleFavorite(productId: string): Promise<boolean> {
    favoritesStore.update(state => ({
      ...state,
      isLoading: true,
      error: null
    }));

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to toggle favorite');
      }

      // Update store state
      favoritesStore.update(state => ({
        ...state,
        isLoading: false,
        favorites: {
          ...state.favorites,
          [productId]: data.isFavorited
        },
        favoriteCounts: {
          ...state.favoriteCounts,
          [productId]: data.favoriteCount
        }
      }));

      return data.isFavorited;

    } catch (error) {
      favoritesStore.update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to toggle favorite'
      }));
      return false;
    }
  },

  /**
   * Check if a product is favorited
   */
  async checkFavoriteStatus(productId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/favorites?productId=${productId}`);
      const data = await response.json();

      if (response.ok) {
        favoritesStore.update(state => ({
          ...state,
          favorites: {
            ...state.favorites,
            [productId]: data.isFavorited
          }
        }));
        return data.isFavorited;
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
    
    return false;
  },

  /**
   * Load multiple favorite statuses at once (for product grids)
   */
  async loadMultipleFavoriteStatuses(productIds: string[]): Promise<void> {
    if (productIds.length === 0) return;

    try {
      // Check each product individually (could be optimized with batch endpoint)
      const promises = productIds.map(id => this.checkFavoriteStatus(id));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error loading multiple favorite statuses:', error);
    }
  },

  /**
   * Get all user favorites
   */
  async loadUserFavorites(): Promise<any[]> {
    favoritesStore.update(state => ({
      ...state,
      isLoading: true,
      error: null
    }));

    try {
      const response = await fetch('/api/favorites');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load favorites');
      }

      // Update favorites map
      const favorites: Record<string, boolean> = {};
      data.favorites?.forEach((fav: any) => {
        if (fav.products) {
          favorites[fav.products.id] = true;
        }
      });

      favoritesStore.update(state => ({
        ...state,
        isLoading: false,
        favorites: {
          ...state.favorites,
          ...favorites
        }
      }));

      return data.favorites || [];

    } catch (error) {
      favoritesStore.update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load favorites'
      }));
      return [];
    }
  },

  /**
   * Remove a product from favorites
   */
  async removeFavorite(productId: string): Promise<boolean> {
    favoritesStore.update(state => ({
      ...state,
      isLoading: true,
      error: null
    }));

    try {
      const response = await fetch(`/api/favorites?productId=${productId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove favorite');
      }

      // Update store state
      favoritesStore.update(state => ({
        ...state,
        isLoading: false,
        favorites: {
          ...state.favorites,
          [productId]: false
        },
        favoriteCounts: {
          ...state.favoriteCounts,
          [productId]: data.favoriteCount
        }
      }));

      return true;

    } catch (error) {
      favoritesStore.update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to remove favorite'
      }));
      return false;
    }
  },

  /**
   * Get favorite status from store (local state)
   */
  isFavorited(productId: string): boolean {
    let isFav = false;
    favoritesStore.subscribe(state => {
      isFav = state.favorites[productId] || false;
    })();
    return isFav;
  },

  /**
   * Get favorite count from store (local state)
   */
  getFavoriteCount(productId: string): number {
    let count = 0;
    favoritesStore.subscribe(state => {
      count = state.favoriteCounts[productId] || 0;
    })();
    return count;
  },

  /**
   * Clear store state
   */
  clearState(): void {
    favoritesStore.set(initialState);
  },

  /**
   * Clear error
   */
  clearError(): void {
    favoritesStore.update(state => ({
      ...state,
      error: null
    }));
  }
};