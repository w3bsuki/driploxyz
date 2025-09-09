<svelte:head>
  <link rel="canonical" href={data.seo?.canonicalHref} />
  {#each data.seo?.hreflangs || [] as hreflang}
    <link rel="alternate" hreflang={hreflang.hrefLang} href={hreflang.href} />
  {/each}
</svelte:head>

<script lang="ts">
  import { ProductionCookieManager } from '$lib/cookies/production-cookie-system';
  import { UnifiedCookieConsent } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  import '../app.css';
  // Deploy to driplo.xyz - force redeploy
  import { invalidate } from '$app/navigation';
  import { browser, dev } from '$app/environment';
  // Auth stores removed - we use server data directly
  import { activeNotification, handleNotificationClick } from '$lib/stores/messageNotifications';
  import { activeFollowNotification, handleFollowNotificationClick } from '$lib/stores/followNotifications';
  import { activeOrderNotification, handleOrderNotificationClick, orderNotificationActions } from '$lib/stores/orderNotifications';
  import { MessageNotificationToast, FollowNotificationToast, LanguageSwitcher, ToastContainer, ToastProvider, Footer, ErrorBoundary, OrderNotificationToast, TopProgress } from '@repo/ui';
  import RegionSwitchModal from '$lib/components/RegionSwitchModal.svelte';
  import { page } from '$app/stores';
  import { initializeLanguage, switchLanguage } from '$lib/utils/language-switcher';
  import * as i18n from '@repo/i18n';
  import type { LayoutData } from './$types';
  import type { Snippet } from 'svelte';
  let headerContainer: HTMLDivElement | null = $state(null);

  let { data, children }: { data: LayoutData; children?: Snippet } = $props();
  
  // Region switch modal state
  let showRegionModal = $state(false);

  // Language initialization - Header component handles switching
  $effect(() => {
    if (browser && data?.language) {
      // Only initialize if language actually changed
      if (i18n.getLocale() !== data.language) {
        // Language change detected
        initializeLanguage(data.language);
        if (i18n.isAvailableLanguageTag(data.language)) {
          sessionStorage.setItem('selectedLocale', data.language);
        }
      }
    }
  });

  // Get Supabase client from load function (following official pattern)
  const { supabase, session, user } = $derived(data);
  const isAuthPage = $derived($page.route.id?.includes('(auth)'));
  const isSellPage = $derived($page.route.id?.includes('/sell'));
  const isOnboardingPage = $derived($page.route.id?.includes('/onboarding'));
  const isMessagesConversation = $derived($page.route.id?.includes('/messages') && $page.url.searchParams.has('conversation'));
  const isSearchPage = $derived($page.route.id?.includes('/search'));
  
  // Check if we should show region prompt
  $effect(() => {
    if (browser && data.shouldPromptRegionSwitch && !showRegionModal) {
      // Delay showing modal to avoid UI flash
      setTimeout(() => {
        showRegionModal = true;
      }, 2000);
    }
  });

  // Dynamic header offset for sticky elements
  $effect(() => {
    if (!browser) return;
    const updateOffset = () => {
      const height = headerContainer?.offsetHeight || 0;
      // Fallback to 56px if header not present
      document.documentElement.style.setProperty('--app-header-offset', `${height || 56}px`);
    };
    updateOffset();
    const ro = new ResizeObserver(updateOffset);
    if (headerContainer) ro.observe(headerContainer);
    window.addEventListener('resize', updateOffset);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateOffset);
    };
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

  // Comprehensive auth state management following Supabase best practices
  $effect(() => {
    if (!browser || !supabase) return;
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      const sessionChanged = newSession?.expires_at !== session?.expires_at;

      switch (event) {
        case 'INITIAL_SESSION':
          // Initial session load - no action needed as layout already has the data
          break;
          
        case 'SIGNED_IN':
          // User successfully signed in - invalidate to refresh data
          setTimeout(() => invalidate('supabase:auth'), 50);
          break;
          
        case 'SIGNED_OUT':
          // User signed out - clear cached data and invalidate
          setTimeout(() => invalidate('supabase:auth'), 50);
          break;
          
        case 'TOKEN_REFRESHED':
          // Session tokens were refreshed
          if (sessionChanged) {
            setTimeout(() => invalidate('supabase:auth'), 50);
          }
          break;
          
        case 'USER_UPDATED':
          // User metadata was updated
          setTimeout(() => invalidate('supabase:auth'), 50);
          break;
          
        case 'PASSWORD_RECOVERY':
          // Password recovery initiated - no action needed
          break;
          
        default:
          // Unknown auth event - no action needed
          break;
      }
    });

    return () => authListener.subscription.unsubscribe();
  });

  // Session health monitoring for logged-in users
  $effect(() => {
    if (!browser || !session) return;
    
    let warningShown = false;
    
    const checkSessionHealth = () => {
      if (!session?.expires_at) return;
      
      const expiresAt = new Date(session.expires_at * 1000).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      
      // Warn if session expires in less than 5 minutes (single warning only)
      if (timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000 && !warningShown) {
        warningShown = true;
        // Session expiring soon - auth listener will handle refresh
      }
      
      // Session has expired - auth listener will handle refresh/signout
      if (timeUntilExpiry <= 0) {
        return;
      }
    };
    
    // Check immediately and then every minute
    checkSessionHealth();
    const interval = setInterval(checkSessionHealth, 60 * 1000);
    
    return () => clearInterval(interval);
  });

  // Initialize order notifications subscription for logged-in users
  $effect(() => {
    if (!browser || !supabase || !user?.id) return;
    
    // Subscribe to order notifications (sales, purchases, status updates)
    const unsubscribe = orderNotificationActions.subscribeToNotifications(supabase, user.id);
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  });
</script>

<ToastProvider>
  {#if !isAuthPage && !isOnboardingPage && !isSellPage && !isMessagesConversation}
    <div class="sticky top-0 z-50" bind:this={headerContainer}>
      <Header user={data?.user} profile={data?.profile} />
    </div>
  {/if}
  <!-- Route progress just below header -->
  <TopProgress />
  <ErrorBoundary>
    <div>
      {@render children?.()}
    </div>
  </ErrorBoundary>
</ToastProvider>

<!-- Footer -->
{#if !isAuthPage && !isOnboardingPage && !isSellPage && !isMessagesConversation}
  <Footer 
    currentLanguage={data?.language || 'en'}
    onLanguageChange={switchLanguage}
    translations={{
      company: 'Company',
      about: 'About Driplo',
      careers: 'Careers',
      press: 'Press',
      support: 'Support',
      help: 'Help Center',
      trustSafety: 'Trust & Safety',
      legal: 'Legal',
      privacy: 'Privacy Policy',
      terms: 'Terms & Conditions',
      cookies: 'Cookie Policy',
      returns: 'Return Policy',
      community: 'Community',
      blog: 'Blog',
      newsletter: 'Newsletter',
      followUs: 'Follow Us',
      madeWith: 'Made with',
      in: 'in',
      bulgaria: 'Bulgaria',
      allRightsReserved: 'All rights reserved.',
      newsletterPlaceholder: 'Enter your email',
      subscribe: 'Subscribe'
    }}
  />
{/if}

<!-- Note: ToastProvider above already handles all notifications -->

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

<!-- Geo-based Locale Suggestion -->
<!-- GeoLocaleSuggestion removed - using LocaleDetectionBanner via LocaleDetector instead -->
