<svelte:head>
  <link rel="canonical" href={data.seo?.canonicalHref} />
  {#each data.seo?.hreflangs || [] as hreflang (hreflang.href)}
    <link rel="alternate" hreflang={hreflang.hrefLang} href={hreflang.href} />
  {/each}
</svelte:head>

<script lang="ts">
  // import { ProductionCookieManager } from '$lib/cookies/production-cookie-system';
  import { UnifiedCookieConsent } from '@repo/ui';
  import Header from '$lib/components/layout/Header.svelte';
  import '../app.css';
  // Deploy to driplo.xyz - force redeploy
  import { invalidate, preloadCode, goto } from '$app/navigation';
  import { browser } from '$app/environment';
    // Consolidated auth system
  import AuthProvider from '$lib/auth/AuthProvider.svelte';
  import { getActiveNotification, messageNotifications, handleNotificationClick } from '$lib/stores/messageNotifications.svelte';
  import { activeFollowNotification, handleFollowNotificationClick } from '$lib/stores/followNotifications.svelte';
  import { activeOrderNotification, handleOrderNotificationClick, orderNotificationActions } from '$lib/stores/orderNotifications.svelte';
  import { MessageNotificationToast, FollowNotificationToast, Footer, OrderNotificationToast, TopProgress, CategorySearchBar, RegionSwitchModal, DiscoverModal } from '@repo/ui';
  import { ToastContainer } from '@repo/ui';
  import { ErrorBoundary } from '@repo/ui';
  import RealtimeErrorBoundary from '$lib/components/RealtimeErrorBoundary.svelte';
  import LocaleSwitcherBanner from '$lib/components/LocaleSwitcherBanner.svelte';
  import { COUNTRY_CONFIGS } from '$lib/country/constants';
  import { page } from '$app/state';
  import { initializeLanguage, switchLanguage } from '$lib/utils/language-switcher';
  import * as i18n from '@repo/i18n';
  import type { LanguageTag } from '@repo/i18n';
  import type { Snippet } from 'svelte';
  
  let headerContainer: HTMLDivElement | null = $state(null);

  let { data, children }: { data: any; children?: Snippet } = $props();
  
  // Region switch modal state
  let showRegionModal = $state(false);
  
  // Discover modal state
  let showDiscoverModal = $state(false);
  let discoverData = $state<{ topSellers: any[]; topBrands: any[] }>({ topSellers: [], topBrands: [] });
  let loadingDiscoverData = $state(false);
  
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
  
  // Fetch discover data (sellers and brands)
  async function fetchDiscoverData() {
    if (!browser || !supabase || loadingDiscoverData) return;
    
    loadingDiscoverData = true;
    try {
      const [sellersResult, brandsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, is_verified, rating')
          .eq('is_verified', true)
          .order('rating', { ascending: false, nullsFirst: false })
          .limit(12),
        supabase
          .from('brands')
          .select('id, name, slug, logo_url')
          .eq('is_verified', true)
          .limit(12)
      ]);
      
      discoverData = {
        topSellers: sellersResult.data || [],
        topBrands: (brandsResult.data || []).map((b: any) => ({
          ...b,
          avatar: b.logo_url,
          verified: true,
          trending: '🔥',
          items: 0
        }))
      };
    } catch (error) {
      console.error('Failed to fetch discover data:', error);
    } finally {
      loadingDiscoverData = false;
    }
  }
  
  // Listen for discover button click
  $effect(() => {
    if (!browser) return;
    
    const handleOpenDiscover = () => {
      showDiscoverModal = true;
      if (discoverData.topSellers.length === 0 && !loadingDiscoverData) {
        fetchDiscoverData();
      }
    };
    
    document.addEventListener('openDiscover', handleOpenDiscover);
    return () => document.removeEventListener('openDiscover', handleOpenDiscover);
  });

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

  // Get session, user and supabase from load function
  const { session, user, supabase } = $derived(data);

  // Auth state change listener - invalidate when session expires_at changes
  $effect(() => {
    if (browser && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: unknown, _session: unknown) => {
        // Type narrowing: check if _session has expires_at property
        const newSession = _session as { expires_at?: number } | null;
        if (newSession?.expires_at !== session?.expires_at) {
          invalidate('supabase:auth');
        }
      });

      return () => subscription.unsubscribe();
    }
  });
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

  let showLocaleBanner = $state(Boolean(data.shouldShowLocaleBanner));
  const suggestedLocale = $derived.by(() => (data?.suggestedLocale ?? data?.language ?? 'bg') as LanguageTag);
  import type { CountryCode } from '$lib/country/constants';
  const detectedCountryName = $derived.by(() => {
    const code = data?.detectedCountry as CountryCode | undefined;
    if (code && COUNTRY_CONFIGS[code]) {
      return COUNTRY_CONFIGS[code].name;
    }
    return null;
  });

  async function handleLocaleStay() {
    showLocaleBanner = false;
    if (!browser) return;
    try {
      await fetch('/api/locale/banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss' })
      });
    } catch {
      // Non-critical: failure to persist dismissal should not block UX
    }
  }

  async function handleLocaleSwitch() {
    const suggested = suggestedLocale as unknown;
    const targetLocale = typeof suggested === 'string' && suggested.length > 0
      ? (suggested as string)
      : (typeof data?.language === 'string' && data.language.length > 0 ? data.language : 'bg');
    if (!browser || !targetLocale) {
      return;
    }

    showLocaleBanner = false;

    try {
      await fetch('/api/locale/banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'switch', locale: targetLocale })
      });
    } catch {
      // Continue with client-side switch even if cookie API fails
    }

    await switchLanguage(targetLocale);
  }

  $effect(() => {
    showLocaleBanner = Boolean(data.shouldShowLocaleBanner);
  });

  // Use real categories from database, with fallback to basic structure
  const mainCategoriesWithCounts = $derived.by(() => {
    if (data?.mainCategories && data.mainCategories.length > 0) {
      return data.mainCategories.map((cat: { slug: string; name: string }) => ({
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
      { key: 'women', label: i18n.category_women(), icon: 'ðŸ‘—', slug: 'women', name: i18n.category_women(), product_count: 0 },
      { key: 'men', label: i18n.category_men(), icon: 'ðŸ‘”', slug: 'men', name: i18n.category_men(), product_count: 0 },
      { key: 'kids', label: i18n.category_kids(), icon: 'ðŸ‘¶', slug: 'kids', name: i18n.category_kids(), product_count: 0 },
      { key: 'unisex', label: i18n.category_unisex(), icon: 'ðŸŒ', slug: 'unisex', name: i18n.category_unisex(), product_count: 0 }
    ];
  });

  // Helper function to get icon for category
  function getIconForCategory(slug: string): string {
    const iconMap: Record<string, string> = {
      'women': 'ðŸ‘—',
      'men': 'ðŸ‘”',
      'kids': 'ðŸ‘¶',
      'unisex': 'ðŸŒ',
      'clothing': 'ðŸ‘•',
      'shoes': 'ðŸ‘Ÿ',
      'bags': 'ðŸ‘œ',
      'accessories': 'ðŸ’'
    };
    return iconMap[slug] || 'ðŸ“';
  }
  const conditionFilters = [
    { key: 'brand_new_with_tags', value: 'brand_new_with_tags', label: i18n.sell_condition_brandNewWithTags(), shortLabel: i18n.sell_condition_brandNewWithTags() },
    { key: 'new_without_tags', value: 'new_without_tags', label: i18n.sell_condition_newWithoutTags(), shortLabel: i18n.condition_new() },
    { key: 'like_new', value: 'like_new', label: i18n.condition_likeNew(), shortLabel: i18n.condition_likeNew() },
    { key: 'good', value: 'good', label: i18n.condition_good(), shortLabel: i18n.condition_good() }
  ];

  // Dropdown data for search components
  // Removed dropdown mock datasets (no longer passed to CategorySearchBar)

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
  async function handleStickyQuickSearch(query: string): Promise<{ data: any[]; error: string | null }> {
    if (!query?.trim() || !supabase) {
      return { data: [], error: null };
    }

    try {
      const { data: searchResults, error: searchError } = await supabase
        .rpc('search_products_fast', {
          query_text: query.trim(),
          result_limit: 6
        });

      if (searchError) {
        console.error('Search error:', searchError);
        return { data: [], error: searchError.message };
      }

      // Transform data to match SearchDropdown expected format
      const transformed = (searchResults || []).map((result: any) => ({
        ...result,
        images: result.first_image_url ? [{ image_url: result.first_image_url }] : []
      }));

      return { data: transformed, error: null };
    } catch (err) {
      console.error('Search failed:', err);
      return { data: [], error: 'Search failed' };
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

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: unknown, newSession: unknown) => {
      // Use secure authentication: validate with getUser() for security-sensitive events
      // Type narrowing for event
      const authEvent = event as string;
      switch (authEvent) {
        case 'SIGNED_IN':
        case 'SIGNED_OUT':
        case 'USER_UPDATED':
          // For security-sensitive events, verify with getUser()
          try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (!userError && user) {
              batchedInvalidate();
            }
          } catch (error) {
            console.warn('Auth validation failed:', error);
          }
          break;

        case 'TOKEN_REFRESHED':
          // For token refresh, only invalidate if we can validate the user
          try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (!userError && user && typeof (newSession as any)?.expires_at === 'number' && typeof (session as any)?.expires_at === 'number' && (newSession as any).expires_at !== (session as any).expires_at) {
              batchedInvalidate();
            }
          } catch (error) {
            console.warn('Token refresh validation failed:', error);
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
  <Header supabase={supabase} user={data?.user ?? undefined} profile={data?.profile ?? undefined} showSearch={shouldShowHeaderSearch} />
    </div>
  {/if}

  <LocaleSwitcherBanner
    show={showLocaleBanner}
    detectedCountry={detectedCountryName}
    suggestedLocale={suggestedLocale}
    currentLocale={(data?.language ?? 'bg') as LanguageTag}
    onSwitch={handleLocaleSwitch}
    onStay={handleLocaleStay}
  />

  {#if shouldShowStickySearch}
    <CategorySearchBar
      bind:searchValue={stickySearchQuery}
      megaMenuData={[]}
      mainCategories={mainCategoriesWithCounts}
      conditionFilters={conditionFilters}
      appliedFilters={{}}
      i18n={i18n as any}
      onSearch={handleStickySearch}
      onQuickSearch={handleStickyQuickSearch}
      onCategorySelect={handleStickyCategorySelect}
      onFilterChange={(key, value) => { void handleStickyFilterChange(key, value as any); }}
      onFilterRemove={handleStickyFilterRemove}
      onClearAllFilters={handleStickyClearAll}
      enableQuickResults={true}
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
      id: getActiveNotification()!.senderId,
      username: getActiveNotification()!.senderName,
      avatar_url: getActiveNotification()!.senderAvatar
    }}
    message={getActiveNotification()!.message}
    product={getActiveNotification()!.isProductMessage ? {
      id: getActiveNotification()!.productId || '',
      title: getActiveNotification()!.productTitle || '',
      image: getActiveNotification()!.productImage || ''
    } : undefined}
    onReply={() => handleNotificationClick(getActiveNotification()!)}
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
    onViewProfile={() => handleFollowNotificationClick(activeFollowNotification.value!)}
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
    onView={() => handleOrderNotificationClick(activeOrderNotification.value!)}
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

<!-- Discover Modal (Top Sellers & Brands) -->
<DiscoverModal
  open={showDiscoverModal}
  topSellers={discoverData.topSellers}
  topBrands={discoverData.topBrands}
  onClose={() => showDiscoverModal = false}
  onSellerClick={(seller) => {
    showDiscoverModal = false;
    goto(`/profile/${seller.username || seller.id}`);
  }}
  onBrandClick={(brand) => {
    showDiscoverModal = false;
    goto(`/search?brand=${encodeURIComponent(brand.name)}`);
  }}
  i18n={i18n}
/>

<!-- Geo-based Locale Suggestion -->
<!-- GeoLocaleSuggestion removed - using LocaleDetectionBanner via LocaleDetector instead -->

<!-- Overlay root is defined once in apps/web/src/app.html -->
