<script lang="ts">
  import '../app.css';
  import '$lib/styles/cyrillic-typography.css';
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { user, session, profile, authLoading, setSupabaseClient } from '$lib/stores/auth';
  import { activeNotification, handleNotificationClick } from '$lib/stores/messageNotifications';
  import { activeFollowNotification, handleFollowNotificationClick } from '$lib/stores/followNotifications';
  import { MessageNotificationToast, FollowNotificationToast } from '@repo/ui';
  import SimpleCookieConsent from '$lib/components/SimpleCookieConsent.svelte';
  import { page } from '$app/stores';
  import EarlyBirdBanner from '$lib/components/EarlyBirdBanner.svelte';
  import LocaleDetector from '$lib/components/LocaleDetector.svelte';
  import { initializeLanguage } from '$lib/utils/language';
  import * as i18n from '@repo/i18n';
  import type { LayoutData } from './$types';
  import type { Snippet } from 'svelte';

  // Initialize language immediately when browser is available
  if (browser) {
    initializeLanguage();
    // Set the lang attribute on the html element
    document.documentElement.lang = i18n.languageTag();
  }

  let { data, children }: { data: LayoutData; children?: Snippet } = $props();

  // Use $derived for reactive destructuring in Svelte 5
  const supabase = $derived(data?.supabase);
  const isAuthPage = $derived($page.route.id?.includes('(auth)'));

  // SSR-friendly auth initialization - no complex client-side logic
  $effect(() => {
    // Simply sync server data to stores without complex initialization
    if (data?.user !== undefined) user.set(data.user);
    if (data?.session !== undefined) session.set(data.session);  
    if (data?.profile !== undefined) profile.set(data.profile);
    if (data?.supabase) setSupabaseClient(data.supabase);
    authLoading.set(false);
  });

  onMount(async () => {
    if (!supabase) return;
    
    // Set up auth state listener for session changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Auth state changed:', event, newSession?.user?.email);
      
      // Invalidate all load functions that depend on auth
      // This ensures the page reloads with new session data
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        invalidate('supabase:auth');
      }
    });

    return () => authListener.subscription.unsubscribe();
  });
</script>

{#if !isAuthPage}
  <EarlyBirdBanner />
{/if}
{@render children?.()}

<!-- Removed ugly locale detection -->

<!-- Simple Cookie Consent Banner -->
<SimpleCookieConsent />

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