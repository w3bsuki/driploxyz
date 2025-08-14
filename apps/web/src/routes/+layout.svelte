<script lang="ts">
  import '../app.css';
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { user, session, profile, authLoading, setSupabaseClient } from '$lib/stores/auth';
  import { activeNotification, handleNotificationClick } from '$lib/stores/messageNotifications';
  import { activeFollowNotification, handleFollowNotificationClick } from '$lib/stores/followNotifications';
  import { MessageNotificationToast, FollowNotificationToast } from '@repo/ui';
  import EarlyBirdBanner from '$lib/components/EarlyBirdBanner.svelte';
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
    if (data?.profile !== undefined) {
      profile.set(data.profile);
    }
    if (data?.supabase) {
      setSupabaseClient(data.supabase);
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

<EarlyBirdBanner />
<slot />

<!-- Global Message Notification Toast -->
{#if $activeNotification}
  <MessageNotificationToast
    show={true}
    sender={{
      id: $activeNotification.senderId,
      username: $activeNotification.senderName,
      avatar_url: $activeNotification.senderAvatar
    }}
    message={$activeNotification.message}
    product={$activeNotification.isProductMessage ? {
      id: $activeNotification.productId || '',
      title: $activeNotification.productTitle || '',
      image: $activeNotification.productImage || ''
    } : undefined}
    onReply={() => handleNotificationClick($activeNotification)}
    onDismiss={() => activeNotification.set(null)}
  />
{/if}

<!-- Global Follow Notification Toast -->
{#if $activeFollowNotification}
  <FollowNotificationToast
    show={true}
    followerName={$activeFollowNotification.followerName}
    followerUsername={$activeFollowNotification.followerUsername}
    followerAvatar={$activeFollowNotification.followerAvatar}
    onViewProfile={() => handleFollowNotificationClick($activeFollowNotification)}
    onDismiss={() => activeFollowNotification.set(null)}
  />
{/if}