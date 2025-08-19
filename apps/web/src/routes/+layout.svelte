<script lang="ts">
  import '../app.css';
  import '$lib/styles/cyrillic-typography.css';
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { browser, dev } from '$app/environment';
  import { user, session, profile, authLoading, setSupabaseClient } from '$lib/stores/auth';
  import { activeNotification, handleNotificationClick } from '$lib/stores/messageNotifications';
  import { activeFollowNotification, handleFollowNotificationClick } from '$lib/stores/followNotifications';
  import { MessageNotificationToast, FollowNotificationToast, CookieConsentBanner, LanguageSwitcher } from '@repo/ui';
  import { page } from '$app/stores';
  import EarlyBirdBanner from '$lib/components/EarlyBirdBanner.svelte';
  import { initializeLanguage } from '$lib/utils/language';
  import * as i18n from '@repo/i18n';
  import type { LayoutData } from './$types';
  import type { Snippet } from 'svelte';

  let { data, children }: { data: LayoutData; children?: Snippet } = $props();

  // Language initialization - Header component handles switching
  $effect(() => {
    if (browser) {
      // Use server language from SSR - never override
      initializeLanguage(data?.language);
    }
  });

  // Use $derived for reactive destructuring in Svelte 5
  const supabase = $derived(data?.supabase);
  const isAuthPage = $derived($page.route.id?.includes('(auth)'));

  // SSR-friendly auth initialization - sync server data to stores
  $effect(() => {
    
    // Always sync server data to stores
    user.set(data?.user || null);
    session.set(data?.session || null);  
    profile.set(data?.profile || null);
    if (data?.supabase) setSupabaseClient(data.supabase);
    authLoading.set(false);
  });

  onMount(async () => {
    if (!supabase) return;
    
    // Set up auth state listener for session changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (dev) console.log('Auth state changed:', event);
      
      // Update stores immediately for instant UI feedback
      if (event === 'SIGNED_IN' && newSession) {
        user.set(newSession.user);
        session.set(newSession);
      } else if (event === 'SIGNED_OUT') {
        user.set(null);
        session.set(null);
        profile.set(null);
      }
      
      // Invalidate and reload server data for consistency
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        await invalidate('supabase:auth');
      }
    });

    return () => authListener.subscription.unsubscribe();
  });
</script>

{#if !isAuthPage}
  <EarlyBirdBanner />
{/if}
{@render children?.()}

<!-- PRODUCTION-READY Cookie Consent -->
<CookieConsentBanner 
  onAccept={() => {
    if (browser) {
      window.dispatchEvent(new CustomEvent('cookieConsentUpdate', { detail: { accepted: true } }));
    }
  }}
  onDecline={() => {
    if (browser) {
      window.dispatchEvent(new CustomEvent('cookieConsentUpdate', { detail: { accepted: false } }));
      // Clear language cookie if declined
      document.cookie = 'locale=; path=/; max-age=0';
    }
  }}
/>

<!-- Language selector removed - handled by Header component -->

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