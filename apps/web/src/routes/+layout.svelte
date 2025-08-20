<script lang="ts">
  import { ProductionCookieManager } from '$lib/cookies/production-cookie-system';
  import UnifiedCookieConsent from '$lib/components/UnifiedCookieConsent.svelte';
  import NavigationLoader from '$lib/components/NavigationLoader.svelte';
  import '../app.css';
  import '$lib/styles/cyrillic-typography.css';
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { browser, dev } from '$app/environment';
  import { user, session, profile, authLoading, setSupabaseClient } from '$lib/stores/auth';
  import { activeNotification, handleNotificationClick } from '$lib/stores/messageNotifications';
  import { activeFollowNotification, handleFollowNotificationClick } from '$lib/stores/followNotifications';
  import { MessageNotificationToast, FollowNotificationToast, CookieConsent, LanguageSwitcher, ToastContainer } from '@repo/ui';
  import { page } from '$app/stores';
  import EarlyBirdBanner from '$lib/components/EarlyBirdBanner.svelte';
  import { initializeLanguage } from '$lib/utils/language';
  import * as i18n from '@repo/i18n';
  import type { LayoutData } from './$types';
  import type { Snippet } from 'svelte';

  let { data, children }: { data: LayoutData; children?: Snippet } = $props();

  // CRITICAL: Initialize language IMMEDIATELY on mount, before any child components
  // This runs synchronously during component initialization
  if (browser && data?.language) {
    console.log('🌍 Client: Initializing language IMMEDIATELY with:', data.language);
    initializeLanguage(data.language);
    if (i18n.isAvailableLanguageTag(data.language)) {
      sessionStorage.setItem('selectedLocale', data.language);
    }
  }
  
  // Language initialization - Header component handles switching
  $effect(() => {
    if (browser) {
      console.log('🌍 Client: Effect - checking language with server data:', data?.language);
      
      // Only initialize if not already set correctly
      if (data?.language && i18n.languageTag() !== data.language) {
        console.log('🌍 Client: Language mismatch, setting to:', data.language);
        initializeLanguage(data.language);
        if (i18n.isAvailableLanguageTag(data.language)) {
          sessionStorage.setItem('selectedLocale', data.language);
        }
      }
      
      console.log('🌍 Client: Final language set to:', i18n.languageTag());
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
      
      // CRITICAL FIX: Don't invalidate on INITIAL_SESSION or TOKEN_REFRESHED
      // These happen during language switches and cause the page to reload
      if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
        // Just update stores, don't invalidate
        if (newSession) {
          user.set(newSession.user);
          session.set(newSession);
        }
        return; // STOP HERE - no invalidation
      }
      
      // Update stores immediately for instant UI feedback
      if (event === 'SIGNED_IN' && newSession) {
        user.set(newSession.user);
        session.set(newSession);
        await invalidate('supabase:auth'); // Only invalidate on real sign in
      } else if (event === 'SIGNED_OUT') {
        user.set(null);
        session.set(null);
        profile.set(null);
        await invalidate('supabase:auth'); // Only invalidate on real sign out
      }
    });

    return () => authListener.subscription.unsubscribe();
  });
</script>

{#if !isAuthPage}
  <EarlyBirdBanner />
{/if}
{@render children?.()}

<!-- Toast Container -->
<ToastContainer />

<NavigationLoader />

<!-- Unified Cookie & Language Consent (handles everything) -->
<UnifiedCookieConsent />

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