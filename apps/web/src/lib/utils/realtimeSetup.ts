/**
 * Real-time setup utility
 * Initializes real-time services and connects them to stores
 * 
 * TODO: This file needs the realtime.svelte service to be created
 */

// import { initRealtimeService, realtimeStore } from '../services/realtime.svelte';
import { favoritesActions } from '../stores/favorites.svelte';
import { followStoreInstance as followActions } from '../stores/follow.svelte';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

export function setupRealtimeServices(_supabase: SupabaseClient<Database>) {
  // TODO: Temporarily disabled until realtime.svelte service is created
  console.warn('Realtime services temporarily disabled - service file missing');
  return null;
  
  /* TODO: Re-enable when realtime.svelte service is created
  // Initialize the real-time service
  const realtimeService = initRealtimeService(supabase);

  // Connect real-time updates to favorites store using effect
  $effect(() => {
    const state = realtimeStore.state;
    Object.entries(state.productMetrics).forEach(([productId, metrics]) => {
      favoritesActions.updateCounts(productId, metrics.favorite_count);
    });
  });

  // Connect real-time updates to follow store using effect
  $effect(() => {
    const state = realtimeStore.state;
    Object.entries(state.metrics.userMetrics).forEach(([userId, metrics]) => {
      followActions.updateCounts(userId, metrics.follower_count, metrics.following_count);
    });
  });

  return realtimeService;
  */
}

// Export services and stores for components to use
// export { realtimeService, realtimeStore } from '../services/realtime.svelte';
export { favoritesActions, favoritesStore } from '../stores/favorites.svelte';
export { followStoreInstance as followActions, followStoreInstance as followStore } from '../stores/follow.svelte';