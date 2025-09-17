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
  import { invalidate, preloadCode, preloadData } from '$app/navigation';
  import { browser, dev } from '$app/environment';
  import { injectAnalytics } from '@vercel/analytics/sveltekit';
  // Auth stores removed - we use server data directly
  import { activeNotification, handleNotificationClick } from '$lib/stores/messageNotifications';
  import { activeFollowNotification, handleFollowNotificationClick } from '$lib/stores/followNotifications';
  import { activeOrderNotification, handleOrderNotificationClick, orderNotificationActions } from '$lib/stores/orderNotifications';
  import { MessageNotificationToast, FollowNotificationToast, LanguageSwitcher, ToastContainer, ToastProvider, Footer, ErrorBoundary, OrderNotificationToast, TopProgress, CategorySearchBar, MainPageSearchBar } from '@repo/ui';
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
  
  // Cookie consent handling - only invalidate auth for user-specific features
  function handleConsentChange(consent: any) {
    // Only invalidate auth state for user-specific features (favorites, etc.)
    // Homepage content should be visible regardless of cookie acceptance
    if (browser) {
      // Delay auth invalidation to avoid interfering with redirect/login flow
      // This prevents race conditions when users accept cookies and then try to login
      setTimeout(() => {
        invalidate('supabase:auth');
        // Don't invalidate home:data - content should always be visible
      }, 500);
    }
  }

  // Preload critical category routes for faster navigation
  $effect(() => {
    if (browser) {
      // Preload main category routes on app load for instant navigation
      const criticalRoutes = [
        '/search',
        '/search?category=women',
        '/search?category=men',
        '/search?category=kids'
      ];

      // Preload in background after initial render
      setTimeout(() => {
        criticalRoutes.forEach(async (route) => {
          try {
            await preloadCode(route);
            await preloadData(route);
          } catch (e) {
            // Preload failed, continue silently
          }
        });
      }, 1000);
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
  const isAuthPage = $derived($page.route.id?.includes('(auth)'));
  const isSellPage = $derived($page.route.id?.includes('/sell'));
  const isOnboardingPage = $derived($page.route.id?.includes('/onboarding'));
  const isMessagesConversation = $derived($page.route.id?.includes('/messages') && $page.url.searchParams.has('conversation'));
  const isSearchPage = $derived($page.route.id?.includes('/search'));
  const isCategoryPage = $derived($page.route.id?.includes('/category'));
  const isProductPage = $derived($page.route.id?.includes('/product'));
  const isHomePage = $derived($page.url.pathname === '/');
  
  // Show search in header on pages where users expect to search
  const shouldShowHeaderSearch = $derived(
    isSearchPage || isCategoryPage || isProductPage
  );

  // Sticky search visibility for different page types
  const shouldShowStickySearch = $derived(
    !isAuthPage && !isOnboardingPage && !isSellPage && isCategoryPage && !isSearchPage
  );

  const shouldShowMainPageSearch = $derived(
    !isAuthPage && !isOnboardingPage && !isSellPage && isHomePage
  );

  // Compact, shared sticky search settings for browse pages
  let stickySearchQuery = $state('');

  // Use real categories from database, with fallback to basic structure
  const mainCategoriesWithCounts = $derived(() => {
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
  const dropdownCategories = $derived(() => {
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

  // Virtual categories for quick access (clothing, shoes, etc.)
  const virtualCategories = [
    {
      slug: 'clothing',
      name: i18n.category_clothing ? i18n.category_clothing() : 'Clothing',
      product_count: 145
    },
    {
      slug: 'shoes',
      name: i18n.category_shoesType ? i18n.category_shoesType() : 'Shoes',
      product_count: 89
    },
    {
      slug: 'bags',
      name: i18n.category_bagsType ? i18n.category_bagsType() : 'Bags',
      product_count: 67
    },
    {
      slug: 'accessories',
      name: i18n.category_accessoriesType ? i18n.category_accessoriesType() : 'Accessories',
      product_count: 123
    }
  ];

  // Quick search for dropdown results in the shared sticky bar
  async function handleStickyQuickSearch(query: string) {
    if (!query?.trim() || !supabase) {
      return { data: [], error: null } as any;
    }
    try {
      const { ProductService } = await import('$lib/services/products');
      const productService = new ProductService(supabase);
      return await productService.searchProducts(query, { limit: 6 });
    } catch (error) {
      return { data: [], error: 'Search failed' } as any;
    }
  }

  // Handlers for sticky search bar
  function handleStickySearch(query: string) {
    if (!query?.trim()) return;
    if (typeof window !== 'undefined') {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  }
  function handleStickyCategorySelect(slug: string, _level: number = 1, _path: string[] = []) {
    if (typeof window !== 'undefined') {
      window.location.href = `/category/${slug}`;
    }
  }
  function handleStickyFilterChange(key: string, value: any) {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.origin + '/search');
    // Map UI keys to URL params
    switch (key) {
      case 'sortBy':
        url.searchParams.set('sort', String(value));
        break;
      case 'minPrice':
        url.searchParams.set('min_price', String(value));
        break;
      case 'maxPrice':
        url.searchParams.set('max_price', String(value));
        break;
      default:
        url.searchParams.set(key, String(value));
    }
    window.location.href = url.toString();
  }
  function handleStickyFilterRemove(key: string) {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.origin + '/search');
    switch (key) {
      case 'sortBy':
        url.searchParams.delete('sort');
        break;
      case 'minPrice':
        url.searchParams.delete('min_price');
        break;
      case 'maxPrice':
        url.searchParams.delete('max_price');
        break;
      default:
        url.searchParams.delete(key);
    }
    window.location.href = url.toString();
  }
  function handleStickyClearAll() {
    if (typeof window !== 'undefined') {
      window.location.href = '/search';
    }
  }
  function handleStickyConditionFilter(condition: string) {
    if (!condition) return;
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.origin + '/search');
      url.searchParams.set('condition', condition);
      window.location.href = url.toString();
    }
  }
  function handleStickyNavigateAll() {
    if (typeof window !== 'undefined') {
      window.location.href = '/search';
    }
  }
  
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
      // Initialize Vercel Analytics
      injectAnalytics({ mode: dev ? 'development' : 'production' });
      
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
<UnifiedCookieConsent onConsentChange={handleConsentChange} />

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

<!-- Overlay root is defined once in apps/web/src/app.html -->
