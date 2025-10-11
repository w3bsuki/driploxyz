<script lang="ts">
  import MegaMenuCategories from './MegaMenuCategories.svelte';
  import MobileMenuSearch from './MobileMenuSearch.svelte';
  import Avatar from '../../primitives/avatar/Avatar.svelte';
  import LanguageSwitcher from '../../compositions/i18n/LanguageSwitcher.svelte';
  import ThemeToggle from '../../primitives/toggle/ThemeToggle.svelte';
  import { isBrowser } from '../../utils/runtime.js';
  import { portal } from '../../actions/portal';
  import * as i18n from '@repo/i18n';
  import type { CategoryWithChildren, CategoryBreadcrumb, MobileNavigationDialogProps } from './search/types';

  let {
    id,
    isOpen,
    isLoggedIn,
    user,
    profile,
    userDisplayName,
    initials,
    canSell,
    currentLanguage,
    languages,
    categories = [],
    onClose,
    onSignOut,
    onCategoryClick,
    onLanguageChange,
    signingOut = false,
    searchFunction,
    unreadMessages,
    unreadNotifications,
    translations = {
      sellItems: 'Sell Items',
      myProfile: 'My Profile',
      startSelling: 'Start Selling',
      settings: 'Settings',
      signOut: 'Sign Out',
      signingOut: 'Signing out...',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      browseCategories: 'Browse Categories',
      whatLookingFor: 'What are you looking for?',
      browseAll: 'Browse All',
      popularBrands: 'Popular Brands',
      newToday: 'New Today',
      orders: 'Orders',
      favorites: 'Favorites',
      categoryWomen: 'Women',
      categoryMen: 'Men',
      categoryKids: 'Kids',
      categoryUnisex: 'Unisex',
      help: 'Help Center',
      privacy: 'Privacy',
      terms: 'Terms',
      returns: 'Returns',
      trustSafety: 'Trust & Safety',
      searchPlaceholder: 'Search for items...',
      quickActionsLabel: 'Quick Actions',
      settingsLabel: 'Settings',
      supportLabel: 'Support'
    }
  }: MobileNavigationDialogProps = $props();

  // Category navigation state - now within the same menu
  let currentView = $state('main'); // 'main' | 'subcategory'
  let selectedMainCategory = $state<CategoryWithChildren | null>(null);
  let categoryBreadcrumb = $state<CategoryBreadcrumb[]>([]);

  // Dialog element reference
  let dialogElement = $state<HTMLDivElement | null>(null);

  // Simple escape key handling and body scroll lock
  $effect(() => {
    if (!isBrowser) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    if (isOpen) {
      document.body.classList.add('overflow-hidden');
      document.documentElement.classList.add('mobile-nav-open');
    } else {
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('mobile-nav-open');
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('mobile-nav-open');
    };
  });


  // Enhanced category click handler - now shows subcategories in same menu
  function handleCategoryClick(categorySlug: string, level: number = 1, path: string[] = [categorySlug]) {
    // Find the full category data
    const category = categories.find(cat => cat.slug === categorySlug);
    if (category && category.children && category.children.length > 0) {
      // Has subcategories - show them in the same menu
      selectedMainCategory = category;
      categoryBreadcrumb = [{ name: category.name, slug: category.slug }];
      currentView = 'subcategory';
    } else {
      // No subcategories - navigate directly
      onClose();
      window.location.href = `/category/${categorySlug}`;
    }
  }

  // Handle subcategory click - check for level 3 first
  function handleSubcategoryClick(subcategory: CategoryWithChildren) {
    if (subcategory.children && subcategory.children.length > 0) {
      // Has level 3 subcategories - show them
      selectedMainCategory = subcategory;
      categoryBreadcrumb = [...categoryBreadcrumb, { name: subcategory.name, slug: subcategory.slug }];
      currentView = 'subcategory'; // Keep same view type for level 3
    } else {
      // No more subcategories - navigate to category page
      closeMenu();
      window.location.href = `/category/${subcategory.slug}`;
    }
  }

  // Handle back navigation with breadcrumb support
  function handleBackToMain() {
    if (categoryBreadcrumb.length > 1) {
      // Go back one level in breadcrumb
      categoryBreadcrumb = categoryBreadcrumb.slice(0, -1);
      const parentCategory = categories.find(cat => cat.slug === categoryBreadcrumb[0].slug);
      selectedMainCategory = parentCategory || null;
    } else {
      // Go back to main menu
      currentView = 'main';
      selectedMainCategory = null;
      categoryBreadcrumb = [];
    }
  }

  // No backdrop handler needed - Vinted style menu

  // Simple close menu function
  function closeMenu() {
    // Reset all navigation state
    currentView = 'main';
    selectedMainCategory = null;
    categoryBreadcrumb = [];

    // Call parent close handler
    onClose();
  }

  // Handle search from mobile search component
  function handleSearch(query: string) {
    // Close menu and navigate to search
    closeMenu();
  }

  // Lightweight profile stats (tolerant to missing fields)
  const profileStats = $derived(() => {
    // Access profile fields directly since stats doesn't exist in Profile type
    const ratingRaw = typeof profile?.rating === 'number' ? profile.rating : 0;
    const rating = Number.isFinite(ratingRaw) ? ratingRaw : 0;
    const itemsSold = typeof profile?.total_sales === 'number' ? profile.total_sales : 0;
    const productsCount = (profile as { products_count?: number } | undefined)?.products_count;
    const listings = typeof productsCount === 'number' ? productsCount : 0;
    return { rating, itemsSold, listings };
  });

  function formatRating(r: number): string {
    if (!Number.isFinite(r)) return '0';
    const rounded = Math.round(r * 10) / 10;
    // Show integer ratings without trailing .0 (e.g., 0, 4)
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  }

  // Real category counts from props
  const categoryCounts = $derived(() => {
    const counts = {
      women: 0,
      men: 0,
      kids: 0,
      unisex: 0
    };

    if (categories && categories.length > 0) {
      categories.forEach(cat => {
        const slug = cat.slug.toLowerCase();
        if (slug === 'women') counts.women = cat.product_count || 0;
        else if (slug === 'men') counts.men = cat.product_count || 0;
        else if (slug === 'kids') counts.kids = cat.product_count || 0;
        else if (slug === 'unisex') counts.unisex = cat.product_count || 0;
      });
    }

    return counts;
  });

  // Format item count for display
  function formatItemCount(count: number): string {
    const itemsText = 'items'; // Fallback text since home_itemCount doesn't exist
    if (count === undefined || count === null || isNaN(count)) return `0 ${itemsText}`;
    if (count === 0) return `0 ${itemsText}`;
    if (count < 1000) return `${count} ${itemsText}`;
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k ${itemsText}`;
    return `${(count / 1000000).toFixed(1)}m ${itemsText}`;
  }
</script>

<!-- Mobile menu - Full screen overlay (always rendered for smooth transitions) -->
<div
  use:portal
  class="sm:hidden fixed inset-0 z-[99999] mobile-nav-dialog transition-all duration-300 ease-out {isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}"
  style="position: fixed; top: var(--app-header-offset, 56px); left: 0; right: 0; bottom: 0; z-index: 99999;"
  role="dialog"
  aria-label="Mobile navigation menu"
  {id}
  bind:this={dialogElement}
>
  <!-- Full-screen mobile menu panel -->
  <div
    class="h-full bg-white shadow-lg overflow-hidden transition-opacity transition-transform duration-300 ease-out {isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}"
  >
      <!-- Main content container -->
      <div class="h-full bg-white flex flex-col relative">

        <!-- Content area with scroll -->
        <div class="flex-1 overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch;">
          <div class="px-4 pt-6 pb-4 space-y-6">

          {#if isLoggedIn && user && profile}
            <!-- Enhanced User Profile Section -->
            <div class="bg-gray-50 rounded-lg p-3 border border-gray-200 relative">
              <!-- Notifications quick action (top-right) -->
              <a
                href="/notifications"
                onclick={closeMenu}
                aria-label="Notifications"
                class="absolute top-2 right-2 inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 text-gray-600"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {#if typeof unreadNotifications === 'number' && unreadNotifications > 0}
                  <span class="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotifications > 99 ? '99' : unreadNotifications}
                  </span>
                {/if}
              </a>
              <div class="flex items-center gap-3">
                <!-- User Avatar -->
                <Avatar
                  name={userDisplayName}
                  src={profile?.avatar_url || undefined}
                  size="md"
                  fallback={initials}
                  class="w-11 h-11"
                />

                <!-- User Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 min-w-0">
                    <div class="font-semibold text-gray-900 text-sm truncate">{userDisplayName}</div>
                    <div class="flex items-center gap-1 text-[11px] text-gray-600 flex-shrink-0">
                      <svg class="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{formatRating(profileStats().rating)}</span>
                    </div>
                  </div>
                  {#if profile?.username}
                    <div class="text-xs text-gray-500 truncate">@{profile.username}</div>
                  {/if}
                </div>
                </div>

                <!-- Quick actions: compact and aligned -->
                <div class="mt-3 grid grid-cols-2 gap-2">
                  <a
                    href="/account"
                    onclick={closeMenu}
                    class="inline-flex items-center justify-center min-h-[40px] px-3 text-sm font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-900"
                  >
                    <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {translations.myProfile || 'View Profile'}
                  </a>
                  <a
                    href="/messages"
                    onclick={closeMenu}
                    class="relative inline-flex items-center justify-center min-h-[40px] px-3 text-sm font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-900"
                  >
                    <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337 5.972 5.972 0 01-3.035 1.557 4.48 4.48 0 00.467-1.226c.233-1.162-.758-2.204-1.535-2.943C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                    Messages
                    {#if typeof unreadMessages === 'number' && unreadMessages > 0}
                      <span class="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadMessages > 99 ? '99' : unreadMessages}
                      </span>
                    {/if}
                  </a>
                </div>
              </div>
          {/if}

          <!-- Search Section -->
          {#if searchFunction}
            <div>
              <MobileMenuSearch
                placeholder={translations.searchPlaceholder}
                {searchFunction}
                onSearch={handleSearch}
                onClose={closeMenu}
                class="w-full"
              />
            </div>
          {/if}

          <!-- Categories Section - Dynamic View -->
          {#if currentView === 'main'}
            <!-- Main Categories -->
            <div>
              <h2 class="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2 px-2">
                {translations.browseCategories}
              </h2>
              <div class="space-y-2.5">
              <!-- Women Category -->
              <button
                onclick={() => handleCategoryClick('women', 1, ['women'])}
                class="w-full flex items-center justify-between py-2 px-3 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm rounded-lg transition-colors touch-manipulation min-h-[40px]"
                aria-label="Browse Women's items"
              >
                <div class="flex items-center gap-4">
                  <!-- Category Icon -->
                  <div class="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span class="text-2xl">👗</span>
                  </div>

                  <!-- Category Info -->
                  <div class="flex-1 text-left">
                    <div class="font-semibold text-gray-900 text-base">{translations.categoryWomen}</div>
                    <div class="text-sm text-gray-500">
                      {formatItemCount(categoryCounts().women)}
                    </div>
                  </div>
                </div>

                <!-- Arrow indicator -->
                <div class="flex-shrink-0 text-gray-400">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              <!-- Men Category -->
              <button
                onclick={() => handleCategoryClick('men', 1, ['men'])}
                class="w-full flex items-center justify-between py-2 px-3 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm rounded-lg transition-colors touch-manipulation min-h-[40px]"
                aria-label="Browse Men's items"
              >
                <div class="flex items-center gap-4">
                  <!-- Category Icon -->
                  <div class="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span class="text-2xl">👔</span>
                  </div>

                  <!-- Category Info -->
                  <div class="flex-1 text-left">
                    <div class="font-semibold text-gray-900 text-base">{translations.categoryMen}</div>
                    <div class="text-sm text-gray-500">
                      {formatItemCount(categoryCounts().men)}
                    </div>
                  </div>
                </div>

                <!-- Arrow indicator -->
                <div class="flex-shrink-0 text-gray-400">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              <!-- Kids Category -->
              <button
                onclick={() => handleCategoryClick('kids', 1, ['kids'])}
                class="w-full flex items-center justify-between py-2.5 px-3 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm rounded-lg transition-colors touch-manipulation min-h-[40px]"
                aria-label="Browse Kids items"
              >
                <div class="flex items-center gap-4">
                  <!-- Category Icon -->
                  <div class="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span class="text-2xl">👶</span>
                  </div>

                  <!-- Category Info -->
                  <div class="flex-1 text-left">
                    <div class="font-semibold text-gray-900 text-base">{translations.categoryKids}</div>
                    <div class="text-sm text-gray-500">
                      {formatItemCount(categoryCounts().kids)}
                    </div>
                  </div>
                </div>

                <!-- Arrow indicator -->
                <div class="flex-shrink-0 text-gray-400">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              <!-- Unisex Category -->
              <button
                onclick={() => handleCategoryClick('unisex', 1, ['unisex'])}
                class="w-full flex items-center justify-between p-3 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm rounded-lg transition-colors touch-manipulation min-h-[40px]"
                aria-label="Browse Unisex items"
              >
                <div class="flex items-center gap-4">
                  <!-- Category Icon -->
                  <div class="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span class="text-2xl">🌍</span>
                  </div>

                  <!-- Category Info -->
                  <div class="flex-1 text-left">
                    <div class="font-semibold text-gray-900 text-base">{translations.categoryUnisex}</div>
                    <div class="text-sm text-gray-500">
                      {formatItemCount(categoryCounts().unisex)}
                    </div>
                  </div>
                </div>

                <!-- Arrow indicator -->
                <div class="flex-shrink-0 text-gray-400">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
              </div>
            </div>

            <!-- Quick Actions Section -->
            <div>
              <h2 class="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2 px-2">{translations.quickActionsLabel}</h2>
              <div class="grid grid-cols-3 gap-2.5">
                <a
                  href="/search"
                  onclick={closeMenu}
                  class="flex flex-col items-center px-2.5 py-2.5 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm rounded-lg transition-colors touch-manipulation min-h-[40px]"
                >
                  <svg class="w-5 h-5 mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span class="text-xs font-medium text-gray-900 text-center">{translations.browseAll}</span>
                </a>

                <a
                  href="/brands"
                  onclick={closeMenu}
                  class="flex flex-col items-center px-2.5 py-2.5 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm rounded-lg transition-colors touch-manipulation min-h-[40px]"
                >
                  <svg class="w-5 h-5 mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span class="text-xs font-medium text-gray-900 text-center">{translations.popularBrands}</span>
                </a>

                <a
                  href="/new"
                  onclick={closeMenu}
                  class="flex flex-col items-center px-2.5 py-2.5 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm rounded-lg transition-colors touch-manipulation min-h-[40px]"
                >
                  <svg class="w-5 h-5 mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-xs font-medium text-gray-900 text-center">{translations.newToday}</span>
                </a>
              </div>

              {#if isLoggedIn}
                <div class="grid grid-cols-2 gap-3 mt-3">
                  <a
                    href="/orders"
                    onclick={closeMenu}
                    class="flex flex-col items-center px-2.5 py-2.5 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm rounded-lg transition-colors touch-manipulation min-h-[40px]"
                  >
                    <svg class="w-5 h-5 mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                    </svg>
                    <span class="text-xs font-medium text-gray-900 text-center">{translations.orders}</span>
                  </a>

                  <a
                    href="/favorites"
                    onclick={closeMenu}
                    class="flex flex-col items-center px-2.5 py-2.5 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm rounded-lg transition-colors touch-manipulation min-h-[40px]"
                  >
                    <svg class="w-5 h-5 mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span class="text-xs font-medium text-gray-900 text-center">{translations.favorites}</span>
                  </a>
                </div>
              {/if}
            </div>

            <!-- Settings Section -->
            <div>
              <h2 class="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2 px-2">{translations.settingsLabel}</h2>
              <div class="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                <!-- Language & Theme -->
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-900">Language & Theme</span>
                  <div class="flex items-center gap-2">
                    <LanguageSwitcher
                      currentLanguage={currentLanguage}
                      {languages}
                      onLanguageChange={onLanguageChange}
                      variant="compact"
                      class="text-xs"
                    />
                    <ThemeToggle size="sm" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Support Links -->
            <div>
              <h2 class="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2 px-2">Support</h2>
              <div class="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <a
                  href="/help"
                  onclick={closeMenu}
                  class="flex items-center px-3 py-3 text-gray-900 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0 touch-manipulation min-h-[36px]"
                >
                  <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-sm font-medium">{translations.help}</span>
                </a>

                <a
                  href="/privacy"
                  onclick={closeMenu}
                  class="flex items-center px-3 py-3 text-gray-900 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0 touch-manipulation min-h-[40px]"
                >
                  <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span class="text-sm font-medium">{translations.privacy}</span>
                </a>

                <a
                  href="/terms"
                  onclick={closeMenu}
                  class="flex items-center px-3 py-3 text-gray-900 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0 touch-manipulation min-h-[40px]"
                >
                  <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span class="text-sm font-medium">{translations.terms}</span>
                </a>
              </div>
            </div>

            <!-- Authentication Section -->
            {#if isLoggedIn}
              <!-- Sign Out -->
              <div class="pt-2">
                <button
                  onclick={() => { closeMenu(); onSignOut(); }}
                  disabled={signingOut}
                  class="w-full flex items-center justify-center px-4 py-3.5 text-red-600 hover:text-red-700 hover:bg-red-50 active:bg-red-100 rounded-xl transition-all duration-200 border border-red-200 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[40px]"
                >
                  {#if signingOut}
                    <svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="font-medium">{translations.signingOut}</span>
                  {:else}
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span class="font-medium">{translations.signOut}</span>
                  {/if}
                </button>
              </div>
            {:else}
              <!-- Sign In/Up -->
              <div class="pt-2">
                <div class="grid grid-cols-2 gap-4">
                  <a
                    href="/login"
                    onclick={closeMenu}
                    class="flex items-center justify-center px-4 py-3.5 text-gray-900 hover:text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300 touch-manipulation min-h-[40px]"
                  >
                    <span class="font-semibold">{translations.signIn}</span>
                  </a>
                  <a
                    href="/signup"
                    onclick={closeMenu}
                    class="flex items-center justify-center px-4 py-3.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 active:bg-gray-900 transition-all duration-200 touch-manipulation min-h-[40px]"
                  >
                    <span>{translations.signUp}</span>
                  </a>
                </div>
              </div>
            {/if}
          {:else if currentView === 'subcategory' && selectedMainCategory?.children}
            <!-- Subcategories View -->
            <div>
              <!-- Back Navigation -->
              <div class="flex items-center gap-3 mb-4">
                <button
                  onclick={handleBackToMain}
                  class="flex items-center justify-center min-w-[40px] min-h-[40px] rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors touch-manipulation"
                  aria-label="Back to main menu"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 class="text-lg font-semibold text-gray-900">
                  {selectedMainCategory.name}
                  {#if categoryBreadcrumb.length > 1}
                    <span class="text-gray-500"> / {categoryBreadcrumb[categoryBreadcrumb.length - 1].name}</span>
                  {/if}
                </h1>
              </div>

              <!-- Subcategories List -->
              <div class="space-y-3">
                {#each selectedMainCategory.children as subcategory}
                  <button
                    onclick={() => handleSubcategoryClick(subcategory)}
                  class="w-full flex items-center justify-between px-3 py-3 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm rounded-lg transition-colors touch-manipulation min-h-[40px]"
                  >
                    <div class="flex items-center gap-3">
                      <div class="text-left">
                        <div class="font-medium text-gray-900">{subcategory.name}</div>
                        <div class="text-sm text-gray-500">
                          {formatItemCount(subcategory.product_count || 0)}
                        </div>
                      </div>
                    </div>

                    <!-- Arrow for further subcategories -->
                    {#if subcategory.children && subcategory.children.length > 0}
                      <div class="flex-shrink-0 text-gray-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    {/if}
                  </button>
                {/each}
              </div>
            </div>
          {/if}

        </div>
      </div>
    </div>
  </div>
</div>
