/**
 * Auth Store with Svelte 5 Runes
 *
 * Modern implementation following established patterns from categories-cache.svelte.ts
 * Maintains compatibility with existing 37+ consumer files during migration.
 *
 * Benefits:
 * - Native Svelte 5 reactivity with $state/$derived
 * - Factory pattern for shared state
 * - Compatibility wrapper for gradual migration
 * - Better performance with selective reactivity
 */

import { browser } from '$app/environment';
import type { User, Session, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import type { AuthState } from '$lib/auth';
import { canSell as canSellHelper } from '$lib/auth';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthStoreState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  supabase: SupabaseClient<Database> | null;
}

/**
 * Create auth store with Svelte 5 runes
 * Uses factory pattern for shared state across components
 */
export function createAuthStore(): {
  // State getters
  get user(): User | null;
  get session(): Session | null;
  get profile(): Profile | null;
  get loading(): boolean;
  get supabase(): SupabaseClient<Database> | null;

  // Derived state
  get authState(): AuthState & { supabase: SupabaseClient<Database> | null };
  get isAuthenticated(): boolean;
  get isAdmin(): boolean;
  get isSeller(): boolean;
  get canSell(): boolean;
  get displayName(): string;
  get userInitials(): string;

  // Actions
  setAuthState: (user: User | null, session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setSupabaseClient: (client: SupabaseClient<Database> | null) => void;
  getSupabaseClient: () => SupabaseClient<Database> | null;
  clearAuth: () => void;

  // Storage helpers
  authStorage: {
    setRememberMe: (remember: boolean) => void;
    getRememberMe: () => boolean;
    clearRememberMe: () => void;
  };
} {
  // Core state using $state rune
  const state = $state<AuthStoreState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    supabase: null
  });

  // Derived computed values using $derived
  const authState = $derived({
    user: state.user,
    session: state.session,
    profile: state.profile,
    loading: state.loading,
    supabase: state.supabase
  });

  const isAuthenticated = $derived(!!state.user);

  const isAdmin = $derived(state.profile?.role === 'admin');

  const isSeller = $derived(!!state.profile?.onboarding_completed);

  const canSell = $derived(canSellHelper(state.profile));

  const displayName = $derived.by(() => {
    if (!state.profile) return 'Anonymous';
    return state.profile.username || state.profile.full_name || 'User';
  });

  const userInitials = $derived.by(() => {
    if (!state.profile) return '?';

    // Try full name first
    if (state.profile.full_name) {
      return state.profile.full_name
        .split(' ')
        .map((name: string) => name.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }

    // Fall back to username
    if (state.profile.username) {
      return state.profile.username.charAt(0).toUpperCase();
    }

    return '?';
  });

  // Actions
  function setAuthState(newUser: User | null, newSession: Session | null) {
    state.user = newUser;
    state.session = newSession;
  }

  function setProfile(newProfile: Profile | null) {
    state.profile = newProfile;
  }

  function setAuthLoading(loading: boolean) {
    state.loading = loading;
  }

  function setSupabaseClient(client: SupabaseClient<Database> | null) {
    state.supabase = client;
  }

  function getSupabaseClient(): SupabaseClient<Database> | null {
    return state.supabase;
  }

  function clearAuth() {
    state.user = null;
    state.session = null;
    state.profile = null;
    state.loading = false;
    state.supabase = null;
  }

  // Local storage helpers (browser only)
  const authStorage = {
    setRememberMe(remember: boolean) {
      if (!browser) return;
      try {
        if (remember) {
          localStorage.setItem('driplo_remember_me', 'true');
        } else {
          localStorage.removeItem('driplo_remember_me');
        }
      } catch (error) {
        // Storage failed, continue silently
      }
    },

    getRememberMe(): boolean {
      if (!browser) return false;
      try {
        return localStorage.getItem('driplo_remember_me') === 'true';
      } catch (error) {
        return false;
      }
    },

    clearRememberMe() {
      if (!browser) return;
      try {
        localStorage.removeItem('driplo_remember_me');
      } catch (error) {
        // Storage failed, continue silently
      }
    }
  };

  return {
    // State getters
    get user() { return state.user; },
    get session() { return state.session; },
    get profile() { return state.profile; },
    get loading() { return state.loading; },
    get supabase() { return state.supabase; },

    // Derived state
    get authState() { return authState; },
    get isAuthenticated() { return isAuthenticated; },
    get isAdmin() { return isAdmin; },
    get isSeller() { return isSeller; },
    get canSell() { return canSell; },
    get displayName() { return displayName; },
    get userInitials() { return userInitials; },

    // Actions
    setAuthState,
    setProfile,
    setAuthLoading,
    setSupabaseClient,
    getSupabaseClient,
    clearAuth,

    // Storage helpers
    authStorage
  };
}

// Global instance for shared state
let authStoreInstance: ReturnType<typeof createAuthStore> | null = null;

/**
 * Get or create the global auth store instance
 * This ensures all components share the same auth state
 */
export function getAuthStore() {
  if (!authStoreInstance) {
    authStoreInstance = createAuthStore();
  }
  return authStoreInstance;
}

// Export the global store instance
export const authStore = getAuthStore();