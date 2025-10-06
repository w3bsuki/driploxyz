<!--
  FIXED AUTH PROVIDER - Svelte 5 Runes + Proper SSR Hydration

  CRITICAL FIXES:
  - Proper server-client state synchronization
  - Single source of truth for auth state
  - Eliminates race conditions during hydration
-->

<script lang="ts">
  import { browser } from '$app/environment';
  import { authStore } from './store.svelte';
  import { createBrowserSupabase } from './index';
  import type { AuthUser, AuthSession, Profile } from './index';

  interface Props {
    user: AuthUser | null;
    session: AuthSession | null;
    profile: Profile | null;
    children: import('svelte').Snippet;
  }

  let { user, session, profile, children }: Props = $props();

  // CRITICAL FIX: Initialize client-side Supabase and sync with server data
  $effect(() => {
    if (!browser) return;

    // Initialize auth store with server data FIRST
    authStore.setServerAuth(user, session, profile);

    // Initialize client-side listener if not already done
    if (!authStore.initialized) {
      const supabase = createBrowserSupabase();

      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        // Only log in development for debugging
        if (import.meta.env.DEV) {
          console.log('[AuthProvider] Auth state changed:', event, session?.user?.id);
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          authStore.handleAuthChange(session?.user ?? null, session);
        } else if (event === 'SIGNED_OUT') {
          authStore.handleAuthChange(null, null);
        }
      });

      // Set the client and mark as initialized
      authStore.setSupabaseClient(supabase);
      authStore.initialized = true;

      return () => {
        subscription.unsubscribe();
      };
    }
  });

  // CRITICAL FIX: Update store when server data changes (navigation, etc.)
  $effect(() => {
    if (!browser || !authStore.initialized) return;

    // Only update if server data differs from current client state
    const currentUserChanged = authStore.user?.id !== user?.id;
    const currentSessionChanged = authStore.session?.access_token !== session?.access_token;

    if (currentUserChanged || currentSessionChanged) {
      console.log('[AuthProvider] Server data changed, updating store');
      authStore.setServerAuth(user, session, profile);
    }
  });
</script>

{@render children()}