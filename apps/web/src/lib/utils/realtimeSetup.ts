/**
 * Real-time setup utility
 * Initializes real-time services and connects them to stores
 */

import { initRealtimeService, realtimeStore } from '$lib/services/realtime.svelte';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import { favoritesActions, favoritesStore } from '$lib/stores/favorites.svelte';
import { followStoreInstance as followActions, followStoreInstance as followStore } from '$lib/stores/follow.svelte';

export function setupRealtimeServices(supabase: SupabaseClient<Database>, userId?: string) {
  // Initialize the real-time service
  const realtimeService = initRealtimeService(supabase, userId);

  // The realtime service automatically updates the favorites and follow stores
  // via the imported store actions in the service itself.
  // Additional $effect connections can be added here if needed.

  return realtimeService;
}

// Export stores for components to use
export { favoritesActions, favoritesStore };
export { followActions, followStore };
export { realtimeStore };