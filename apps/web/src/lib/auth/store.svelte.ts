/**
 * CONSOLIDATED AUTH STORE - Svelte 5 Runes
 *
 * Modern, clean auth store using Svelte 5 runes.
 * Single source of truth for client-side auth state.
 */

import { browser } from '$app/environment';
import { goto, invalidate } from '$app/navigation';
import type {
  AuthUser,
  AuthSession,
  Profile,
  SupabaseAuthClient,
  AuthState
} from './index';
import {
  createBrowserSupabase,
  canSell,
  isAdmin,
  getDisplayName,
  getUserInitials,
  hasCompletedOnboarding
} from './index';

/**
 * Auth store state interface
 */
interface AuthStoreState {
  user: AuthUser | null;
  session: AuthSession | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
}

/**
 * Create auth store with Svelte 5 runes
 */
function createAuthStore() {
  // Core reactive state
  const state = $state<AuthStoreState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    initialized: false
  });

  // Supabase client (non-reactive)
  let supabase: SupabaseAuthClient | null = null;

  // Derived computed values
  const isAuthenticated = $derived(!!state.user && !!state.session);
  const isLoading = $derived(state.loading);
  const userCanSell = $derived(canSell(state.profile));
  const userIsAdmin = $derived(isAdmin(state.profile));
  const hasProfile = $derived(!!state.profile);
  const needsOnboarding = $derived(!!state.user && !hasCompletedOnboarding(state.profile));

  const displayName = $derived(getDisplayName(state.profile));
  const userInitials = $derived(getUserInitials(state.profile));

  // Combined auth state
  const authState = $derived<AuthState>({
    user: state.user,
    session: state.session,
    profile: state.profile,
    loading: state.loading
  });

  /**
   * Initialize the auth store and set up auth listener
   */
  function initialize() {
    if (!browser || state.initialized) return;

    try {
      supabase = createBrowserSupabase();

      // Set up auth state change listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: string, session: AuthSession | null) => {
          console.log('[Auth] State change:', event);

          // Use secure authentication: validate user with getUser() for security
          let validatedUser: AuthUser | null = null;

          if (session) {
            try {
              const { data: { user }, error: userError } = await (supabase?.auth.getUser() ?? Promise.resolve({ data: { user: null as any }, error: null }));
              if (!userError && user) {
                validatedUser = user;
              }
            } catch (error) {
              console.warn('[Auth] User validation failed:', error);
            }
          }

          state.session = session;
          state.user = validatedUser;

          // Handle auth events
          switch (event) {
            case 'SIGNED_IN':
              // Only proceed if user validation succeeded
              if (validatedUser) {
                await handleSignIn(session);
              } else {
                state.loading = false;
              }
              break;
            case 'SIGNED_OUT':
              handleSignOut();
              break;
            case 'TOKEN_REFRESHED':
              // Session updated, no additional action needed
              break;
            default:
              // For other events, just update loading state
              state.loading = false;
          }
        }
      );

      // Clean up listener on unmount
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
          subscription.unsubscribe();
        });
      }

      state.initialized = true;
      console.log('[Auth] Store initialized');
    } catch (error) {
      console.error('[Auth] Initialization failed:', error);
      state.loading = false;
    }
  }

  /**
   * Handle successful sign in
   */
  async function handleSignIn(_session: AuthSession | null) {
    // Use validated user from state instead of session.user for security
    const validatedUser = state.user;

    if (!validatedUser || !supabase) {
      state.loading = false;
      return;
    }

    try {
      // Fetch user profile using validated user ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', validatedUser.id)
        .single();

      state.profile = profile;
      state.loading = false;

      // Invalidate server-side data
      await invalidate('supabase:auth');

      // Check if user needs onboarding
      if (!hasCompletedOnboarding(profile)) {
        await goto('/onboarding');
      } else {
        // Redirect to intended destination or dashboard
        const redirectTo = sessionStorage.getItem('authRedirectTo') || '/dashboard';
        sessionStorage.removeItem('authRedirectTo');
        await goto(redirectTo);
      }
    } catch (error) {
      console.error('[Auth] Error loading profile after sign in:', error);
      state.loading = false;
    }
  }

  /**
   * Handle sign out
   */
  function handleSignOut() {
    state.user = null;
    state.session = null;
    state.profile = null;
    state.loading = false;

    // Clear any stored redirect
    sessionStorage.removeItem('authRedirectTo');

    // Invalidate server-side data
    invalidate('supabase:auth');
  }

  /**
   * Set auth state from server data (for SSR initialization)
   */
  function setServerAuth(user: AuthUser | null, session: AuthSession | null, profile: Profile | null) {
    state.user = user;
    state.session = session;
    state.profile = profile;
    state.loading = false;

    // Initialize client if not done already
    if (browser && !state.initialized) {
      initialize();
    }
  }

  /**
   * Update profile data
   */
  function setProfile(profile: Profile | null) {
    state.profile = profile;
  }

  /**
   * Set loading state
   */
  function setLoading(loading: boolean) {
    state.loading = loading;
  }

  /**
   * Get Supabase client instance
   */
  function getSupabase(): SupabaseAuthClient | null {
    if (!browser) return null;
    if (!supabase) {
      supabase = createBrowserSupabase();
    }
    return supabase;
  }

  /**
   * Sign in with email and password
   */
  async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const client = getSupabase();
    if (!client) {
      return { success: false, error: 'Client not available' };
    }

    try {
      state.loading = true;

      const { error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        state.loading = false;
        return { success: false, error: error.message };
      }

      // Success - auth state change listener will handle the rest
      return { success: true };
    } catch (error) {
      state.loading = false;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign in failed'
      };
    }
  }

  /**
   * Sign up with email and password
   */
  async function signUp(
    email: string,
    password: string,
    fullName: string
  ): Promise<{ success: boolean; error?: string }> {
    const client = getSupabase();
    if (!client) {
      return { success: false, error: 'Client not available' };
    }

    try {
      state.loading = true;

      const { error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        state.loading = false;
        return { success: false, error: error.message };
      }

      state.loading = false;
      return { success: true };
    } catch (error) {
      state.loading = false;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign up failed'
      };
    }
  }

  /**
   * Sign out
   */
  async function signOut(): Promise<void> {
    const client = getSupabase();
    if (!client) return;

    try {
      await client.auth.signOut();
      // Auth state change listener will handle cleanup
    } catch (error) {
      console.error('[Auth] Sign out error:', error);
      // Force cleanup even if API call fails
      handleSignOut();
    }
  }

  /**
   * Reset password
   */
  async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    const client = getSupabase();
    if (!client) {
      return { success: false, error: 'Client not available' };
    }

    try {
      const { error } = await client.auth.resetPasswordForEmail(email);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password reset failed'
      };
    }
  }

  // Return store interface
  return {
    // State getters
    get user() { return state.user; },
    get session() { return state.session; },
    get profile() { return state.profile; },
    get loading() { return state.loading; },
    get initialized() { return state.initialized; },

    // Derived state
    get authState() { return authState; },
    get isAuthenticated() { return isAuthenticated; },
    get isLoading() { return isLoading; },
    get canSell() { return userCanSell; },
    get isAdmin() { return userIsAdmin; },
    get hasProfile() { return hasProfile; },
    get needsOnboarding() { return needsOnboarding; },
    get displayName() { return displayName; },
    get userInitials() { return userInitials; },

    // Actions
    initialize,
    setServerAuth,
    setProfile,
    setLoading,
    getSupabase,

    // Auth operations
    signIn,
    signUp,
    signOut,
    resetPassword
  };
}

// Global store instance
let authStoreInstance: ReturnType<typeof createAuthStore> | null = null;

/**
 * Get the global auth store instance
 */
export function getAuthStore() {
  if (!authStoreInstance) {
    authStoreInstance = createAuthStore();
  }
  return authStoreInstance;
}

// Export default instance
export const authStore = getAuthStore();