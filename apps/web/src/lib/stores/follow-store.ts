/**
 * Follow Store - Clean Svelte 5 Implementation
 */

import { followStoreInstance } from './follow.svelte';

// Direct exports from the Svelte 5 store
export const {
  isLoading,
  error,
  following,
  followerCounts,
  followingCounts,
  toggleFollow,
  checkFollowStatus,
  loadMultipleFollowStatuses,
  isFollowing,
  getFollowerCount,
  getFollowingCount,
  updateCounts,
  clearState,
  clearError
} = followStoreInstance;

interface LegacyFollowState {
  isLoading: boolean;
  error: string | null;
  following: Record<string, boolean>;
  followerCounts: Record<string, number>;
  followingCounts: Record<string, number>;
}

// Maintain legacy API compatibility
export const followStore = {
  subscribe: (fn: (state: LegacyFollowState) => void) => {
    // Legacy subscribe compatibility - not recommended for new code
    return fn({
      isLoading: followStoreInstance.isLoading,
      error: followStoreInstance.error,
      following: followStoreInstance.following,
      followerCounts: followStoreInstance.followerCounts,
      followingCounts: followStoreInstance.followingCounts
    });
  }
};

export const followActions = {
  toggleFollow,
  checkFollowStatus,
  loadMultipleFollowStatuses,
  isFollowing,
  getFollowerCount,
  getFollowingCount,
  updateCounts,
  clearState,
  clearError
};