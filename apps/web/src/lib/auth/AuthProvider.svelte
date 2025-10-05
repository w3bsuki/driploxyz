<!--
  CONSOLIDATED AUTH PROVIDER

  Initializes and manages client-side auth state for the entire app.
  Connects server-side auth data to client-side Svelte 5 runes store.
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

  // Initialize auth store with server data
  $effect(() => {
    if (browser) {
      authStore.setServerAuth(user, session, profile);

      // Initialize client-side auth listener
      if (!authStore.initialized) {
        authStore.initialize();
      }
    }
  });

  // Update store when server data changes
  $effect(() => {
    if (browser && authStore.initialized) {
      // Only update if the data is actually different
      if (authStore.user?.id !== user?.id || authStore.profile?.id !== profile?.id) {
        authStore.setServerAuth(user, session, profile);
      }
    }
  });
</script>

{@render children()}