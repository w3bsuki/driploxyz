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
  import CookieConsentPro from '$lib/components/CookieConsentPro.svelte';
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
      console.log('Auth state changed:', event, newSession?.user?.email);
      
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

<!-- GDPR Compliant Cookie Consent with Locale Detection -->
<CookieConsentPro 
  privacyUrl="/privacy"
  onLocaleChange={(locale) => {
    // Update the language globally
    i18n.setLanguageTag(locale);
    if (browser) {
      document.documentElement.lang = locale;
    }
    
    // Store preference if user is authenticated
    if (supabase && data?.user) {
      supabase.from('profiles')
        .update({ locale })
        .eq('id', data.user.id)
        .then(() => {});
    }
  }}
  onConsentChange={(consent) => {
    // Handle consent changes
    if (browser) {
      // Dispatch event for analytics tools to listen to
      window.dispatchEvent(new CustomEvent('cookieConsentUpdate', { detail: consent }));
      
      // If user rejected functional cookies, clear any existing locale cookie
      if (!consent.functional && browser) {
        document.cookie = 'locale=; path=/; max-age=0';
      }
    }
  }}
/>

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