import { writable } from 'svelte/store';

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

export const followStore = writable<FollowState>(initialState);

export const followActions = {
  /**
   * Toggle follow status for a user
   */
  async toggleFollow(followingId: string): Promise<boolean> {
    followStore.update(state => ({
      ...state,
      isLoading: true,
      error: null
    }));

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

      // Update store state optimistically
      followStore.update(state => {
        const newFollowing = data.following;

        return {
          ...state,
          isLoading: false,
          following: {
            ...state.following,
            [followingId]: newFollowing
          }
          // Counts will be updated by real-time subscriptions
        };
      });

      return data.following;

    } catch (error) {
      followStore.update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to toggle follow'
      }));
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
        followStore.update(state => ({
          ...state,
          following: {
            ...state.following,
            [followingId]: data.isFollowing
          },
          followerCounts: {
            ...state.followerCounts,
            [followingId]: data.followerCount || 0
          }
        }));
        return data.isFollowing;
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }

    return false;
  },

  /**
   * Load multiple follow statuses at once (for user lists)
   */
  async loadMultipleFollowStatuses(userIds: string[]): Promise<void> {
    if (userIds.length === 0) return;

    try {
      const promises = userIds.map(id => this.checkFollowStatus(id));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error loading multiple follow statuses:', error);
    }
  },

  /**
   * Get follow status from store (local state)
   */
  isFollowing(userId: string): boolean {
    let isFollowing = false;
    followStore.subscribe(state => {
      isFollowing = state.following[userId] || false;
    })();
    return isFollowing;
  },

  /**
   * Get follower count from store (local state)
   */
  getFollowerCount(userId: string): number {
    let count = 0;
    followStore.subscribe(state => {
      count = state.followerCounts[userId] || 0;
    })();
    return count;
  },

  /**
   * Get following count from store (local state)
   */
  getFollowingCount(userId: string): number {
    let count = 0;
    followStore.subscribe(state => {
      count = state.followingCounts[userId] || 0;
    })();
    return count;
  },

  /**
   * Update counts from real-time data
   */
  updateCounts(userId: string, followerCount: number, followingCount: number): void {
    followStore.update(state => ({
      ...state,
      followerCounts: {
        ...state.followerCounts,
        [userId]: followerCount
      },
      followingCounts: {
        ...state.followingCounts,
        [userId]: followingCount
      }
    }));
  },

  /**
   * Clear store state
   */
  clearState(): void {
    followStore.set(initialState);
  },

  /**
   * Clear error
   */
  clearError(): void {
    followStore.update(state => ({
      ...state,
      error: null
    }));
  }
};