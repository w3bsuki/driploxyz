<script lang="ts">
  import '../app.css';
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { user, session, profile, authLoading } from '$lib/stores/auth';
  import type { LayoutData } from './$types';

  let { data }: { data: LayoutData } = $props();

  // Use $derived for reactive destructuring in Svelte 5
  const supabase = $derived(data?.supabase);

  // Initialize auth stores
  $effect(() => {
    if (data?.user !== undefined) {
      user.set(data.user);
    }
    if (data?.session !== undefined) {
      session.set(data.session);
    }
    authLoading.set(false);
  });

  onMount(() => {
    if (!supabase) return;
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      const currentSession = session.subscribe ? undefined : data?.session;
      if (newSession?.expires_at !== currentSession?.expires_at) {
        invalidate('supabase:auth');
      }
    });

    return () => authListener.subscription.unsubscribe();
  });
</script>

<slot />