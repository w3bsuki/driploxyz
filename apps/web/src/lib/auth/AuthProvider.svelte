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
  import type { AuthUser, AuthSession, Profile } from './index';

  interface Props {
    user: AuthUser | null;
    session: AuthSession | null;
    profile: Profile | null;
    children: import('svelte').Snippet;
  }

  let { user, session, profile, children }: Props = $props();

  // Check if server data differs from current client state
  const serverDataChanged = $derived(() => {
    if (!browser || !authStore.initialized) return false;
    
    const currentUserChanged = authStore.user?.id !== user?.id;
    const currentSessionChanged = authStore.session?.access_token !== session?.access_token;
    
    return currentUserChanged || currentSessionChanged;
  });

  // CRITICAL FIX: Initialize client-side Supabase and sync with server data
  $effect(() => {
    if (!browser) return;

    // Initialize auth store with server data FIRST
    authStore.setServerAuth(user, session, profile);

    // Initialize client-side listener if not already done
    if (!authStore.initialized) {
      authStore.initialize();
    }
  });

  // CRITICAL FIX: Update store when server data changes (navigation, etc.)
  $effect(() => {
    if (serverDataChanged()) {
      console.log('[AuthProvider] Server data changed, updating store');
      authStore.setServerAuth(user, session, profile);
    }
  });
</script>

{@render children()}