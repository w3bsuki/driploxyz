<script lang="ts">
  import { ProductionCookieManager } from '$lib/cookies/production-cookie-system';
  import UnifiedCookieConsent from '$lib/components/UnifiedCookieConsent.svelte';
  import Header from '$lib/components/Header.svelte';
  import '../app.css';
  // Deploy to driplo.xyz
  import '$lib/styles/cyrillic-typography.css';
  import { invalidate } from '$app/navigation';
  import { browser, dev } from '$app/environment';
  import { user, session, profile, authLoading, setSupabaseClient } from '$lib/stores/auth';
  import { activeNotification, handleNotificationClick } from '$lib/stores/messageNotifications';
  import { activeFollowNotification, handleFollowNotificationClick } from '$lib/stores/followNotifications';
  import { activeOrderNotification, handleOrderNotificationClick, orderNotificationActions } from '$lib/stores/orderNotifications';
  import { MessageNotificationToast, FollowNotificationToast, LanguageSwitcher, ToastContainer } from '@repo/ui';
  import OrderNotificationToast from '$lib/components/OrderNotificationToast.svelte';
  import RegionSwitchModal from '$lib/components/RegionSwitchModal.svelte';
  import { page } from '$app/stores';
  import EarlyBirdBanner from '$lib/components/EarlyBirdBanner.svelte';
  import { initializeLanguage } from '$lib/utils/language';
  import * as i18n from '@repo/i18n';
  import type { LayoutData } from './$types';
  import type { Snippet } from 'svelte';

  let { data, children }: { data: LayoutData; children?: Snippet } = $props();
  
  // Region switch modal state
  let showRegionModal = $state(false);

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
    if (browser && data?.language) {
      // Only initialize if language actually changed
      if (i18n.languageTag() !== data.language) {
        if (dev) console.log('🌍 Client: Language change detected, updating to:', data.language);
        initializeLanguage(data.language);
        if (i18n.isAvailableLanguageTag(data.language)) {
          sessionStorage.setItem('selectedLocale', data.language);
        }
      }
    }
  });

  // Use $derived for reactive destructuring in Svelte 5 with safety checks
  const supabase = $derived(data && data.supabase ? data.supabase : null);
  const isAuthPage = $derived($page.route.id?.includes('(auth)'));
  const isSellPage = $derived($page.route.id?.includes('/sell'));
  const isOnboardingPage = $derived($page.route.id?.includes('/onboarding'));
  const isMessagesConversation = $derived($page.route.id?.includes('/messages') && $page.url.searchParams.has('conversation'));
  
  // Check if we should show region prompt
  $effect(() => {
    if (browser && data.shouldPromptRegionSwitch && !showRegionModal) {
      // Delay showing modal to avoid UI flash
      setTimeout(() => {
        showRegionModal = true;
      }, 2000);
    }
  });
  
  // Initialize performance optimizations on mount
  $effect(() => {
    if (browser) {
      
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
    if (!supabase || !browser) return;
    
    // Set up auth state listener for session changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      
      // Skip initial session and token refresh - these are normal operations
      if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
        return;
      }
      
      // Only handle actual auth state changes
      if (event === 'SIGNED_IN' && newSession) {
        // For sign in, invalidate to get fresh profile data from server
        await invalidate('supabase:auth');
      } else if (event === 'SIGNED_OUT') {
        // For sign out, invalidate to clear server state
        await invalidate('supabase:auth');
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

{#if !isAuthPage && !isOnboardingPage && !isSellPage && !isMessagesConversation}
  <div class="sticky top-0 z-50">
    <EarlyBirdBanner />
    <Header user={data?.user} profile={data?.profile} />
  </div>
{/if}
<div>
  {@render children?.()}
</div>

<!-- Toast Container -->
<ToastContainer />

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

<!-- Region Switch Modal -->
<RegionSwitchModal
  show={showRegionModal}
  onClose={() => {
    showRegionModal = false;
    // Set cookie to not show again
    document.cookie = 'region_prompt_dismissed=true; max-age=2592000; path=/';
  }}
  onSwitch={() => {
    showRegionModal = false;
  }}
  detectedRegion={data.detectedRegion || 'BG'}
  currentRegion={data.region || 'BG'}
/>