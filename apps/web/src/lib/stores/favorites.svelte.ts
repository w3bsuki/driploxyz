/**
 * Favorites Store - Svelte 5 Implementation
 */

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

export function createFavoritesStore() {
  let state = $state<FavoriteState>({ ...initialState });

  // Actions
  const actions = {
    /**
     * Toggle favorite status for a product
     */
    async toggleFavorite(productId: string): Promise<boolean> {
      state = {
        ...state,
        isLoading: true,
        error: null
      };

      try {
        const response = await fetch(`/api/favorites/${productId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to toggle favorite');
        }

        // Update state
        const newFavorited = data.favorited;
        const newCount = data.favoriteCount !== undefined ? data.favoriteCount : state.favoriteCounts[productId] || 0;

        state = {
          ...state,
          isLoading: false,
          favorites: {
            ...state.favorites,
            [productId]: newFavorited
          },
          favoriteCounts: {
            ...state.favoriteCounts,
            [productId]: newCount
          }
        };

        return data.favorited;

      } catch (error) {
        state = {
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to toggle favorite'
        };
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
          state = {
            ...state,
            favorites: {
              ...state.favorites,
              [productId]: data.isFavorited
            }
          };
          return data.isFavorited;
        }
      } catch (error) {
        // Silent error handling
      }

      return false;
    },

    /**
     * Load multiple favorite statuses at once (for product grids)
     */
    async loadMultipleFavoriteStatuses(productIds: string[]): Promise<void> {
      if (productIds.length === 0) return;

      try {
        const promises = productIds.map(id => actions.checkFavoriteStatus(id));
        await Promise.all(promises);
      } catch (error) {
        // Silent error handling
      }
    },

    /**
     * Get all user favorites
     */
    async loadUserFavorites(): Promise<any[]> {
      state = {
        ...state,
        isLoading: true,
        error: null
      };

      try {
        const response = await fetch('/api/favorites');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load favorites');
        }

        // Update favorites map
        const newFavorites: Record<string, boolean> = {};
        data.favorites?.forEach((fav: any) => {
          if (fav.products) {
            newFavorites[fav.products.id] = true;
          }
        });

        state = {
          ...state,
          isLoading: false,
          favorites: {
            ...state.favorites,
            ...newFavorites
          }
        };

        return data.favorites || [];

      } catch (error) {
        state = {
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load favorites'
        };
        return [];
      }
    },

    /**
     * Remove a product from favorites (uses same toggle endpoint)
     */
    async removeFavorite(productId: string): Promise<boolean> {
      return await actions.toggleFavorite(productId);
    },

    /**
     * Get favorite status from store (reactive getter)
     */
    isFavorited(productId: string): boolean {
      return state.favorites[productId] || false;
    },

    /**
     * Get favorite count from store (reactive getter)
     */
    getFavoriteCount(productId: string): number {
      return state.favoriteCounts[productId] || 0;
    },

    /**
     * Clear store state
     */
    clearState(): void {
      state = { ...initialState };
    },

    /**
     * Update counts from real-time data
     */
    updateCounts(productId: string, favoriteCount: number, _viewCount: number): void {
      state = {
        ...state,
        favoriteCounts: {
          ...state.favoriteCounts,
          [productId]: favoriteCount
        }
      };
    },

    /**
     * Clear error
     */
    clearError(): void {
      state = {
        ...state,
        error: null
      };
    }
  };

  return {
    // State getters that access reactive state
    get isLoading() { return state.isLoading; },
    get error() { return state.error; },
    get favorites() { return state.favorites; },
    get favoriteCounts() { return state.favoriteCounts; },
    // Actions
    ...actions
  };
}

// Create global instance
export const favoritesStoreInstance = createFavoritesStore();