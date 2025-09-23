/**
 * Auth Store - Clean Svelte 5 Implementation
 */

import { authStore } from './auth.svelte';

// Direct exports from the Svelte 5 store
export const {
  user,
  session,
  profile,
  loading: authLoading,
  supabase: supabaseClient,
  authState,
  isAuthenticated,
  isAdmin,
  isSeller,
  canSell,
  displayName,
  userInitials,
  setAuthState,
  setProfile,
  setAuthLoading,
  setSupabaseClient,
  getSupabaseClient,
  clearAuth,
  authStorage
} = authStore;