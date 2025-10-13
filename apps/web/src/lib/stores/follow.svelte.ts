/**
 * Follow Store - Svelte 5 Implementation
 */

interface FollowState {
  isLoading: boolean;
  error: string | null;
  following: Record<string, boolean>; // userId -> isFollowing
  followerCounts: Record<string, number>; // userId -> count
  followingCounts: Record<string, number>; // userId -> count
}

const initialState: FollowState = {
  isLoading: false,
  error: null,
  following: {},
  followerCounts: {},
  followingCounts: {}
};

export function createFollowStore() {
  let state = $state<FollowState>({ ...initialState });

  // Derived values
  const isLoading = $derived(state.isLoading);
  const error = $derived(state.error);
  const following = $derived(state.following);
  const followerCounts = $derived(state.followerCounts);
  const followingCounts = $derived(state.followingCounts);

  // Actions
  const actions = {
    /**
     * Toggle follow status for a user
     */
    async toggleFollow(followingId: string): Promise<boolean> {
      state = {
        ...state,
        isLoading: true,
        error: null
      };

      try {
        const response = await fetch('/api/followers/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ following_id: followingId })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to toggle follow');
        }

        // Update state optimistically
        const newFollowing = data.following;
        state = {
          ...state,
          isLoading: false,
          following: {
            ...state.following,
            [followingId]: newFollowing
          }
        };

        return data.following;

      } catch (error) {
        state = {
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to toggle follow'
        };
        return false;
      }
    },

    /**
     * Check if currently following a user
     */
    async checkFollowStatus(followingId: string): Promise<boolean> {
      try {
        const response = await fetch(`/api/followers/status?followingId=${followingId}`);
        const data = await response.json();

        if (response.ok) {
          state = {
            ...state,
            following: {
              ...state.following,
              [followingId]: data.isFollowing
            },
            followerCounts: {
              ...state.followerCounts,
              [followingId]: data.followerCount || 0
            }
          };
          return data.isFollowing;
        }
      } catch {
        // Silent error handling - follow status is not critical
      }

      return false;
    },

    /**
     * Load multiple follow statuses at once (for user lists)
     */
    async loadMultipleFollowStatuses(userIds: string[]): Promise<void> {
      if (userIds.length === 0) return;

      try {
        const promises = userIds.map(id => actions.checkFollowStatus(id));
        await Promise.all(promises);
      } catch {
        // Silent error handling - follow status is not critical
      }
    },

    /**
     * Get follow status from store (reactive)
     */
    isFollowing: (userId: string) => state.following[userId] || false,

    /**
     * Get follower count from store (reactive)
     */
    getFollowerCount: (userId: string) => state.followerCounts[userId] || 0,

    /**
     * Get following count from store (reactive)
     */
    getFollowingCount: (userId: string) => state.followingCounts[userId] || 0,

    /**
     * Update counts from real-time data
     */
    updateCounts(userId: string, followerCount: number, followingCount: number): void {
      state = {
        ...state,
        followerCounts: {
          ...state.followerCounts,
          [userId]: followerCount
        },
        followingCounts: {
          ...state.followingCounts,
          [userId]: followingCount
        }
      };
    },

    /**
     * Clear store state
     */
    clearState(): void {
      state = { ...initialState };
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
    // State getters (must be functions to maintain reactivity)
    get isLoading() { return isLoading; },
    get error() { return error; },
    get following() { return following; },
    get followerCounts() { return followerCounts; },
    get followingCounts() { return followingCounts; },
    // Actions
    ...actions
  };
}

// Create global instance
export const followStoreInstance = createFollowStore();