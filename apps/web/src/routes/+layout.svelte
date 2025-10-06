<svelte:head>
  <link rel="canonical" href={data.seo?.canonicalHref} />
  {#each data.seo?.hreflangs || [] as hreflang}
    <link rel="alternate" hreflang={hreflang.hrefLang} href={hreflang.href} />
  {/each}
</svelte:head>

<script lang="ts">
  // import { ProductionCookieManager } from '$lib/cookies/production-cookie-system';
  import { UnifiedCookieConsent } from '@repo/ui';
  // eslint-disable-next-line no-restricted-imports -- App-specific composite component
  import Header from '$lib/components/Header.svelte';
  import '../app.css';
  // Deploy to driplo.xyz - force redeploy
  import { invalidate, preloadCode, goto } from '$app/navigation';
  import { browser, dev } from '$app/environment';
    // Consolidated auth system
  import AuthProvider from '$lib/auth/AuthProvider.svelte';
  import { getActiveNotification, messageNotifications, handleNotificationClick } from '$lib/stores/messageNotifications.svelte';
  import { activeFollowNotification, handleFollowNotificationClick } from '$lib/stores/followNotifications.svelte';
  import { activeOrderNotification, handleOrderNotificationClick, orderNotificationActions } from '$lib/stores/orderNotifications.svelte';
  import { MessageNotificationToast, FollowNotificationToast, Footer, OrderNotificationToast, TopProgress, CategorySearchBar } from '@repo/ui';
  import { ToastContainer } from '@repo/ui';
  import { ErrorBoundary } from '@repo/ui';
  // eslint-disable-next-line no-restricted-imports -- App-specific realtime error boundary
  import RealtimeErrorBoundary from '$lib/components/RealtimeErrorBoundary.svelte';
  // eslint-disable-next-line no-restricted-imports -- App-specific region modal
  import RegionSwitchModal from '$lib/components/RegionSwitchModal.svelte';
  import { page } from '$app/state';
  import { initializeLanguage, switchLanguage } from '$lib/utils/language-switcher';
  import * as i18n from '@repo/i18n';
  import type { LayoutData } from './$types';
  import type { Snippet } from 'svelte';
  import type { ProductWithImages } from '@repo/core/services';
  let headerContainer: HTMLDivElement | null = $state(null);

  let { data, children }: { data: LayoutData; children?: Snippet } = $props();
  
  // Region switch modal state
  let showRegionModal = $state(false);
  
  // Cookie consent handling - only invalidate auth for user-specific features
  function handleConsentChange() {
    // Only invalidate auth state for user-specific features (favorites, etc.)
    // Homepage content should be visible regardless of cookie acceptance
    if (browser) {
      // Immediate invalidation without delay to fix auth flow
      invalidate('supabase:auth');
      // Don't invalidate home:data - content should always be visible
    }
  }

  // Optimized route preloading - only preload when user shows intent
  $effect(() => {
    if (browser && document.readyState === 'complete') {
      // Use requestIdleCallback for better performance
      const preloadCriticalRoutes = () => {
        const criticalRoutes = ['/search', '/category/women', '/category/men'];

        criticalRoutes.forEach(async (route) => {
          try {
            // Only preload code, not data (data changes frequently)
            await preloadCode(route);
          } catch {
            // Preload failed, continue silently
          }
        });
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(preloadCriticalRoutes, { timeout: 2000 });
      } else {
        setTimeout(preloadCriticalRoutes, 1500);
      }
    }
  });

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
  const isAuthPage = $derived(page.route.id?.includes('(auth)'));
  const isSellPage = $derived(page.route.id?.includes('/sell'));
  const isOnboardingPage = $derived(page.route.id?.includes('/onboarding'));
  const isMessagesConversation = $derived(page.route.id?.includes('/messages') && (() => {
    try {
      return page.url.searchParams.has('conversation');
    } catch {
      // Handle prerendering context where searchParams is not available
      return false;
    }
  })());
  const isSearchPage = $derived(page.route.id?.includes('/search'));
  const isCategoryPage = $derived(page.route.id?.includes('/category'));
  const isProductPage = $derived(page.route.id?.includes('/product'));
  // const isHomePage = $derived(page.url.pathname === '/');
  
  // Show search in header on pages where users expect to search
  const shouldShowHeaderSearch = $derived(
    isSearchPage || isCategoryPage || isProductPage
  );

  // Sticky search visibility for different page types
  const shouldShowStickySearch = $derived(
    !isAuthPage && !isOnboardingPage && !isSellPage && isCategoryPage && !isSearchPage
  );

  // const shouldShowMainPageSearch = $derived(
  //   !isAuthPage && !isOnboardingPage && !isSellPage && isHomePage
  // );

  // Compact, shared sticky search settings for browse pages
  let stickySearchQuery = $state('');

  // Use real categories from database, with fallback to basic structure
  const mainCategoriesWithCounts = $derived.by(() => {
    if (data?.mainCategories && data.mainCategories.length > 0) {
      return data.mainCategories.map(cat => ({
        key: cat.slug,
        label: cat.name,
        icon: getIconForCategory(cat.slug),
        slug: cat.slug,
        name: cat.name,
        product_count: 0 // Will be updated with real counts later
      }));
    }

    // Fallback to basic categories if database is empty
    return [
      { key: 'women', label: i18n.category_women(), icon: '👗', slug: 'women', name: i18n.category_women(), product_count: 0 },
      { key: 'men', label: i18n.category_men(), icon: '👔', slug: 'men', name: i18n.category_men(), product_count: 0 },
      { key: 'kids', label: i18n.category_kids(), icon: '👶', slug: 'kids', name: i18n.category_kids(), product_count: 0 },
      { key: 'unisex', label: i18n.category_unisex(), icon: '🌍', slug: 'unisex', name: i18n.category_unisex(), product_count: 0 }
    ];
  });

  // Helper function to get icon for category
  function getIconForCategory(slug: string): string {
    const iconMap: Record<string, string> = {
      'women': '👗',
      'men': '👔',
      'kids': '👶',
      'unisex': '🌍',
      'clothing': '👕',
      'shoes': '👟',
      'bags': '👜',
      'accessories': '💍'
    };
    return iconMap[slug] || '📁';
  }
  const conditionFilters = [
    { key: 'brand_new_with_tags', label: i18n.sell_condition_brandNewWithTags(), shortLabel: i18n.sell_condition_brandNewWithTags() },
    { key: 'new_without_tags', label: i18n.sell_condition_newWithoutTags(), shortLabel: i18n.condition_new() },
    { key: 'like_new', label: i18n.condition_likeNew(), shortLabel: i18n.condition_likeNew() },
    { key: 'good', label: i18n.condition_good(), shortLabel: i18n.condition_good() }
  ];

  // Dropdown data for search components
  const dropdownCategories = $derived.by(() => {
    return mainCategoriesWithCounts.map(cat => ({
      id: cat.key,
      name: cat.label,
      slug: cat.key,
      emoji: cat.icon,
      level: 1,
      product_count: cat.product_count || 0,
      children: []
    }));
  });

  // Mock sellers data for dropdown - in production this would come from server
  const dropdownSellers = [
    {
      id: '1',
      username: 'kush3',
      full_name: 'Kush Store',
      avatar_url: '/avatars/1.png',
      total_products: 47,
      rating: 4.8,
      is_verified: true
    },
    {
      id: '2',
      username: 'indecisive_wear',
      full_name: 'Indecisive Wear',
      avatar_url: '/avatars/2.png',
      total_products: 23,
      rating: 4.9,
      is_verified: true
    },
    {
      id: '3',
      username: 'Tintin',
      full_name: 'Tintin Vintage',
      avatar_url: '/avatars/3.png',
      total_products: 156,
      rating: 4.7,
      is_verified: true
    }
  ];

  // Collections data for dropdown
  const dropdownCollections = [
    {
      key: 'trending',
      label: i18n.trending_now ? i18n.trending_now() : 'Trending Now',
      emoji: '🔥',
      product_count: 234
    },
    {
      key: 'new-arrivals',
      label: i18n.nav_newArrivals ? i18n.nav_newArrivals() : 'New Arrivals',
      emoji: '✨',
      product_count: 89
    },
    {
      key: 'vintage',
      label: i18n.category_vintage ? i18n.category_vintage() : 'Vintage',
      emoji: '🕰️',
      product_count: 312
    },
    {
      key: 'designer',
      label: i18n.category_designer ? i18n.category_designer() : 'Designer',
      emoji: '💎',
      product_count: 156
    }
  ];

  // Virtual categories for quick access (clothing, shoes, etc.) - unused
  // const virtualCategories = [
  //   {
  //     slug: 'clothing',
  //     name: i18n.category_clothing ? i18n.category_clothing() : 'Clothing',
  //     product_count: 145
  //   },
  //   {
  //     slug: 'shoes',
  //     name: i18n.category_shoesType ? i18n.category_shoesType() : 'Shoes',
  //     product_count: 89
  //   },
  //   {
  //     slug: 'bags',
  //     name: i18n.category_bagsType ? i18n.category_bagsType() : 'Bags',
  //     product_count: 67
  //   },
  //   {
  //     slug: 'accessories',
  //     name: i18n.category_accessoriesType ? i18n.category_accessoriesType() : 'Accessories',
  //     product_count: 123
  //   }
  // ];

  // Quick search for dropdown results in the shared sticky bar
  async function handleStickyQuickSearch(query: string) {
    if (!query?.trim() || !supabase) {
      return { data: [], error: null } as { data: ProductWithImages[]; error: string | null };
    }
    try {
      const { ProductService } = await import('@repo/core/services/products');
      const productService = new ProductService(supabase);
      return await productService.searchProducts(query, { limit: 6 });
    } catch {
      return { data: [], error: 'Search failed' } as { data: ProductWithImages[]; error: string | null };
    }
  }

  // Handlers for sticky search bar - using SvelteKit navigation
  async function handleStickySearch(query: string) {
    if (!query?.trim()) return;
    await goto(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  async function handleStickyCategorySelect(slug: string) {
    await goto(`/category/${slug}`);
  }

  async function handleStickyFilterChange(key: string, value: string | number | boolean) {
    let searchParams: URLSearchParams;
    try {
      searchParams = new URLSearchParams(page.url.searchParams);
    } catch {
      // Handle prerendering context where searchParams is not available
      searchParams = new URLSearchParams();
    }

    // Map UI keys to URL params
    switch (key) {
      case 'sortBy':
        searchParams.set('sort', String(value));
        break;
      case 'minPrice':
        searchParams.set('min_price', String(value));
        break;
      case 'maxPrice':
        searchParams.set('max_price', String(value));
        break;
      default:
        searchParams.set(key, String(value));
    }

    await goto(`/search?${searchParams.toString()}`);
  }

  async function handleStickyFilterRemove(key: string) {
    let searchParams: URLSearchParams;
    try {
      searchParams = new URLSearchParams(page.url.searchParams);
    } catch {
      // Handle prerendering context where searchParams is not available
      searchParams = new URLSearchParams();
    }

    switch (key) {
      case 'sortBy':
        searchParams.delete('sort');
        break;
      case 'minPrice':
        searchParams.delete('min_price');
        break;
      case 'maxPrice':
        searchParams.delete('max_price');
        break;
      default:
        searchParams.delete(key);
    }

    const query = searchParams.toString();
    await goto(query ? `/search?${query}` : '/search');
  }

  async function handleStickyClearAll() {
    await goto('/search');
  }
  // function handleStickyConditionFilter(condition: string) {
  //   if (!condition) return;
  //   if (typeof window !== 'undefined') {
  //     const url = new URL(window.location.origin + '/search');
  //     url.searchParams.set('condition', condition);
  //     window.location.href = url.toString();
  //   }
  // }
  // function handleStickyNavigateAll() {
  //   if (typeof window !== 'undefined') {
  //     window.location.href = '/search';
  //   }
  // }
  
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
  
  // Initialize performance optimizations and analytics on mount
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

  // Optimized auth state management - single listener with batched invalidations
  $effect(() => {
    if (!browser || !supabase) return;

    let invalidationTimeoutId: number | null = null;

    const batchedInvalidate = () => {
      if (invalidationTimeoutId) return; // Already scheduled
      invalidationTimeoutId = window.setTimeout(() => {
        invalidate('supabase:auth');
        invalidationTimeoutId = null;
      }, 100); // Batch multiple auth events within 100ms
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      // Only invalidate for events that actually change user state
      switch (event) {
        case 'SIGNED_IN':
        case 'SIGNED_OUT':
        case 'USER_UPDATED':
          batchedInvalidate();
          break;

        case 'TOKEN_REFRESHED':
          // Only invalidate if session actually changed
          if (newSession?.expires_at !== session?.expires_at) {
            batchedInvalidate();
          }
          break;

        case 'INITIAL_SESSION':
        case 'PASSWORD_RECOVERY':
        default:
          // No action needed for these events
          break;
      }
    });

    return () => {
      if (invalidationTimeoutId) {
        clearTimeout(invalidationTimeoutId);
      }
      authListener.subscription.unsubscribe();
    };
  });

  // Optimized session health monitoring - only for authenticated users
  $effect(() => {
    if (!browser || !session?.expires_at) return;

    // Calculate next check time more efficiently
    const expiresAt = new Date(session.expires_at * 1000).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    // Only monitor if session has significant time left
    if (timeUntilExpiry <= 0 || timeUntilExpiry > 24 * 60 * 60 * 1000) return;

    let timeoutId: number | null = null;

    // Smart scheduling - check closer to expiry
    if (timeUntilExpiry > 10 * 60 * 1000) {
      // More than 10 minutes - check in 5 minutes
      timeoutId = window.setTimeout(() => {
        // Session health will be re-evaluated on next effect run
      }, 5 * 60 * 1000);
    } else if (timeUntilExpiry > 2 * 60 * 1000) {
      // 2-10 minutes - check every minute
      timeoutId = window.setTimeout(() => {
        // Session health will be re-evaluated
      }, 60 * 1000);
    }
    // Less than 2 minutes - let auth listener handle refresh

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  });

  // Optimized order notifications - stable subscription with user ID check
  $effect(() => {
    if (!browser || !supabase) return;

    const currentUserId = user?.id;
    if (!currentUserId) return;

    // Subscribe with current user ID (won't re-run unless user actually changes)
    const unsubscribe = orderNotificationActions.subscribeToNotifications(supabase, currentUserId);

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  });
</script>

<!-- Global Toast Notifications -->
<ToastContainer position="top-right" limit={6} />

<ErrorBoundary name="AppLayout">
  {#if !isAuthPage && !isOnboardingPage && !isSellPage && !isMessagesConversation}
    <div class="sticky top-0 z-50" bind:this={headerContainer}>
      <Header user={data?.user} profile={data?.profile} showSearch={shouldShowHeaderSearch} />
    </div>
  {/if}

  {#if shouldShowStickySearch}
    <CategorySearchBar
      supabase={supabase}
      bind:searchValue={stickySearchQuery}
      megaMenuData={[]}
      mainCategories={mainCategoriesWithCounts}
      conditionFilters={conditionFilters}
      appliedFilters={{}}
      i18n={i18n}
      onSearch={handleStickySearch}
      onQuickSearch={handleStickyQuickSearch}
      onCategorySelect={handleStickyCategorySelect}
      onFilterChange={handleStickyFilterChange}
      onFilterRemove={handleStickyFilterRemove}
      onClearAllFilters={handleStickyClearAll}
      enableQuickResults={true}
      dropdownCategories={dropdownCategories}
      dropdownSellers={dropdownSellers}
      dropdownCollections={dropdownCollections}
    />
  {/if}

  <!-- Route progress just below header -->
  <TopProgress />

  <!-- Wrap everything with consolidated auth provider -->
  <AuthProvider user={data.user} session={data.session} profile={data.profile}>
    <!-- Wrap main content with realtime error boundary -->
    <RealtimeErrorBoundary>
      <main>
        {@render children?.()}
      </main>
    </RealtimeErrorBoundary>
  </AuthProvider>
</ErrorBoundary>

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

<!-- ToastContainer above already handles all notifications -->

<!-- Unified Cookie & Language Consent (handles everything) -->
<UnifiedCookieConsent
  initialShowBanner={data.shouldShowCookieConsent}
  onConsentChange={handleConsentChange}
/>

<!-- Global Message Notification Toast -->
{#if getActiveNotification()}
  <MessageNotificationToast
    show={true}
    sender={{
      id: getActiveNotification().senderId,
      username: getActiveNotification().senderName,
      avatar_url: getActiveNotification().senderAvatar
    }}
    message={getActiveNotification().message}
    product={getActiveNotification().isProductMessage ? {
      id: getActiveNotification().productId || '',
      title: getActiveNotification().productTitle || '',
      image: getActiveNotification().productImage || ''
    } : undefined}
    onReply={() => handleNotificationClick(getActiveNotification())}
    onDismiss={() => messageNotifications.setActiveNotification(null)}
  />
{/if}

<!-- Global Follow Notification Toast -->
{#if activeFollowNotification?.value}
  <FollowNotificationToast
    show={true}
    followerName={activeFollowNotification.value.followerName}
    followerUsername={activeFollowNotification.value.followerUsername}
    followerAvatar={activeFollowNotification.value.followerAvatar}
    onViewProfile={() => handleFollowNotificationClick(activeFollowNotification.value)}
    onDismiss={() => {}}
  />
{/if}

<!-- Global Order Notification Toast (Sales/Purchases) -->
{#if activeOrderNotification?.value}
  <OrderNotificationToast
    show={true}
    title={activeOrderNotification.value.title}
    message={activeOrderNotification.value.message}
    type={activeOrderNotification.value.type}
    onView={() => handleOrderNotificationClick(activeOrderNotification.value)}
    onDismiss={() => {}}
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

<!-- Overlay root is defined once in apps/web/src/app.html -->
