<script lang="ts">
  import { ProductionCookieManager } from '$lib/cookies/production-cookie-system';
  import UnifiedCookieConsent from '$lib/components/UnifiedCookieConsent.svelte';
  import '../app.css';
  // Deploy to driplo.xyz
  import '$lib/styles/cyrillic-typography.css';
  import { invalidate } from '$app/navigation';
  import { browser, dev } from '$app/environment';
  import { setupRoutePreloading } from '$lib/utils/route-splitting';
  import { initializePrefetch } from '$lib/utils/prefetch';
  import { user, session, profile, authLoading, setSupabaseClient } from '$lib/stores/auth';
  import { activeNotification, handleNotificationClick } from '$lib/stores/messageNotifications';
  import { activeFollowNotification, handleFollowNotificationClick } from '$lib/stores/followNotifications';
  import { activeOrderNotification, handleOrderNotificationClick, orderNotificationActions } from '$lib/stores/orderNotifications';
  import { MessageNotificationToast, FollowNotificationToast, LanguageSwitcher, ToastContainer } from '@repo/ui';
  import PageLoader from '$lib/components/PageLoader.svelte';
  import OrderNotificationToast from '$lib/components/OrderNotificationToast.svelte';
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
    if (dev) console.log('🌍 Client: Initializing language IMMEDIATELY with:', data.language);
    initializeLanguage(data.language);
    if (i18n.isAvailableLanguageTag(data.language)) {
      sessionStorage.setItem('selectedLocale', data.language);
    }
  }
  
  // Language initialization - Header component handles switching
  $effect(() => {
    if (browser && data) {
      if (dev) console.log('🌍 Client: Effect - checking language with server data:', data.language);
      
      // Only initialize if not already set correctly
      if (data.language && i18n.languageTag() !== data.language) {
        if (dev) console.log('🌍 Client: Language mismatch, setting to:', data.language);
        initializeLanguage(data.language);
        if (i18n.isAvailableLanguageTag(data.language)) {
          sessionStorage.setItem('selectedLocale', data.language);
        }
      }
      
      if (dev) console.log('🌍 Client: Final language set to:', i18n.languageTag());
    }
  });

  // Use $derived for reactive destructuring in Svelte 5 with safety checks
  const supabase = $derived(data && data.supabase ? data.supabase : null);
  const isAuthPage = $derived($page.route.id?.includes('(auth)'));
  
  // Initialize performance optimizations on mount
  $effect(() => {
    if (browser) {
      // Setup route preloading and prefetching
      setupRoutePreloading();
      initializePrefetch();
      
      // Critical resource hints for faster loading
      const preconnectUrls = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
      ];
      
      preconnectUrls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = url;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
      
      // DNS prefetch for external services (if used)
      const dnsPrefetchUrls = [
        '//api.stripe.com',
        '//js.stripe.com'
      ];
      
      dnsPrefetchUrls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = url;
        document.head.appendChild(link);
      });
    }
  });

  // SSR-friendly auth initialization - sync server data to stores
  $effect(() => {
    if (!data) return;
    
    // Always sync server data to stores
    user.set(data.user || null);
    session.set(data.session || null);  
    profile.set(data.profile || null);
    if (data.supabase) setSupabaseClient(data.supabase);
    authLoading.set(false);
  });

  // Set up auth state listener for session changes  
  $effect(() => {
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
          // Subscribe to order notifications for logged in user
          await orderNotificationActions.subscribeToNotifications(supabase, newSession.user.id);
        }
        return; // STOP HERE - no invalidation
      }
      
      // Update stores immediately for instant UI feedback
      if (event === 'SIGNED_IN' && newSession) {
        user.set(newSession.user);
        session.set(newSession);
        // Subscribe to order notifications for newly signed in user
        await orderNotificationActions.subscribeToNotifications(supabase, newSession.user.id);
        await invalidate('supabase:auth'); // Only invalidate on real sign in
      } else if (event === 'SIGNED_OUT') {
        user.set(null);
        session.set(null);
        profile.set(null);
        // Unsubscribe from notifications on sign out
        await orderNotificationActions.unsubscribe(supabase);
        await invalidate('supabase:auth'); // Only invalidate on real sign out
      }
    });

    // Subscribe to notifications if already logged in
    if (data?.user?.id) {
      orderNotificationActions.subscribeToNotifications(supabase, data.user.id);
    }

    // Cleanup function for $effect
    return () => {
      authListener.subscription.unsubscribe();
      if (data?.user?.id) {
        orderNotificationActions.unsubscribe(supabase);
      }
    };
  });
</script>

{#if !isAuthPage}
  <EarlyBirdBanner />
{/if}
{@render children?.()}

<!-- Toast Container -->
<ToastContainer />

<!-- Page Loader - iOS style centered spinner -->
<PageLoader />

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

<!-- Global Order Notification Toast (Sales/Purchases) -->
{#if $activeOrderNotification}
  <OrderNotificationToast
    show={true}
    title={$activeOrderNotification.title}
    message={$activeOrderNotification.message}
    type={$activeOrderNotification.type}
    onView={() => handleOrderNotificationClick($activeOrderNotification)}
    onDismiss={() => activeOrderNotification.set(null)}
  />
{/if}