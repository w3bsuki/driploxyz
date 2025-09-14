/**
 * Real-time setup utility
 * Initializes real-time services and connects them to stores
 */

import { initRealtimeService, realtimeStore } from '../services/realtime';
import { favoritesActions } from '../stores/favorites-store';
import { followActions } from '../stores/follow-store';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

export function setupRealtimeServices(supabase: SupabaseClient<Database>) {
  // Initialize the real-time service
  const realtimeService = initRealtimeService(supabase);

  // Connect real-time updates to favorites store
  realtimeStore.subscribe(state => {
    Object.entries(state.metrics.productMetrics).forEach(([productId, metrics]) => {
      favoritesActions.updateCounts(productId, metrics.favorite_count, metrics.view_count);
    });
  });

  // Connect real-time updates to follow store
  realtimeStore.subscribe(state => {
    Object.entries(state.metrics.userMetrics).forEach(([userId, metrics]) => {
      followActions.updateCounts(userId, metrics.follower_count, metrics.following_count);
    });
  });

  return realtimeService;
}

// Export services and stores for components to use
export { realtimeService, realtimeStore } from '../services/realtime';
export { favoritesActions, favoritesStore } from '../stores/favorites-store';
export { followActions, followStore } from '../stores/follow-store';