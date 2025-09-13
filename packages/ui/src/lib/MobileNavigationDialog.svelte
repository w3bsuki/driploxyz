<script lang="ts">
  import MegaMenuCategories from './MegaMenuCategories.svelte';
  import MobileMenuSearch from './MobileMenuSearch.svelte';
  import Avatar from './Avatar.svelte';
  import LanguageSwitcher from './LanguageSwitcher.svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  import { portal } from './actions/portal';
  import { browser } from '$app/environment';
  import type { Database } from '@repo/database';

  type Category = Database['public']['Tables']['categories']['Row'];

  interface CategoryWithChildren extends Category {
    children?: CategoryWithChildren[];
    product_count?: number;
  }

  interface Props {
    id?: string;
    isOpen: boolean;
    isLoggedIn: boolean;
    user?: any;
    profile?: any;
    userDisplayName?: string;
    initials?: string;
    canSell?: boolean;
    currentLanguage: string;
    languages: any[];
    categories?: CategoryWithChildren[]; // Real category data
    onClose: () => void;
    onSignOut: () => void;
    onCategoryClick: (category: string, level?: number, path?: string[]) => void;
    onLanguageChange: (lang: string) => void;
    signingOut?: boolean;
    searchFunction?: (query: string) => Promise<{ data: any[]; error: string | null }>;
    translations?: {
      sellItems?: string;
      myProfile?: string;
      startSelling?: string;
      settings?: string;
      signOut?: string;
      signingOut?: string;
      signIn?: string;
      signUp?: string;
      browseCategories?: string;
      whatLookingFor?: string;
      browseAll?: string;
      popularBrands?: string;
      newToday?: string;
      orders?: string;
      favorites?: string;
      categoryWomen?: string;
      categoryMen?: string;
      categoryKids?: string;
      categoryUnisex?: string;
      help?: string;
      privacy?: string;
      terms?: string;
      returns?: string;
      trustSafety?: string;
      searchPlaceholder?: string;
    };
  }

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
      searchPlaceholder: 'Search for items...'
    }
  }: Props = $props();

  // Category navigation state - now within the same menu
  let currentView = $state('main'); // 'main' | 'subcategory'
  let selectedMainCategory = $state(null);
  let categoryBreadcrumb = $state([]);

  // Enhanced menu state management with proper cleanup
  $effect(() => {
    if (!browser) return;

    if (isOpen) {
      // Add body scroll lock when menu opens
      document.body.classList.add('overflow-hidden');
      document.documentElement.classList.add('overflow-hidden');

      // Add escape key handler
      function handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
          closeMenu();
        }
      }

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        // Always cleanup scroll lock on cleanup
        document.body.classList.remove('overflow-hidden');
        document.documentElement.classList.remove('overflow-hidden');
      };
    } else {
      // Remove body scroll lock when menu closes
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('overflow-hidden');
    }
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
  function handleSubcategoryClick(subcategory) {
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
      selectedMainCategory = parentCategory;
    } else {
      // Go back to main menu
      currentView = 'main';
      selectedMainCategory = null;
      categoryBreadcrumb = [];
    }
  }

  // Handle backdrop clicks to close menu
  function handleBackdropClick(e: MouseEvent) {
    // Always close when clicking on backdrop - it should only be the backdrop layer
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
  }

  // Enhanced close menu function with cleanup
  function closeMenu() {
    // Reset all navigation state
    currentView = 'main';
    selectedMainCategory = null;
    categoryBreadcrumb = [];

    // Force cleanup body scroll lock immediately
    if (browser) {
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('overflow-hidden');
    }

    // Call parent close handler
    onClose();
  }

  // Handle search from mobile search component
  function handleSearch(query: string) {
    // Close menu and navigate to search
    closeMenu();
  }

  // Navigation stats for user profile
  const userStats = $derived(() => {
    if (!profile?.stats) return null;
    return {
      itemsSold: profile.stats.items_sold || 0,
      rating: profile.stats.average_rating,
      memberSince: profile.created_at ? new Date(profile.created_at).getFullYear().toString() : undefined
    };
  });

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
    if (count === undefined || count === null || isNaN(count)) return '0 items';
    if (count === 0) return '0 items';
    if (count < 1000) return `${count} items`;
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k items`;
    return `${(count / 1000000).toFixed(1)}m items`;
  }
</script>

{#if isOpen}
  <!-- Mobile menu with backdrop -->
  <div
    use:portal
    class="sm:hidden fixed inset-0 z-[100]"
    role="dialog"
    aria-modal="true"
    aria-label="Mobile navigation menu"
    {id}
  >
    <!-- Backdrop overlay -->
    <div
      class="fixed inset-0 bg-black/20 transition-opacity duration-300 {isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}"
      onclick={handleBackdropClick}
    ></div>

    <!-- Slide-down mobile menu panel -->
    <div
      class="fixed top-[56px] left-0 right-0 bg-white border-b border-gray-200 shadow-lg max-h-[calc(100vh-56px)] overflow-hidden transform transition-transform duration-300 ease-out {isOpen ? 'translate-y-0' : '-translate-y-full'}"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Main content container -->
      <div class="h-full bg-white flex flex-col">
      <!-- Content area with scroll -->
      <div class="flex-1 overflow-y-auto overscroll-contain">
        <div class="px-4 pt-6 pb-4 space-y-6">

          {#if isLoggedIn && user && profile}
            <!-- Enhanced User Profile Section -->
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <div class="flex items-center space-x-4">
                <!-- User Avatar -->
                <Avatar
                  name={userDisplayName}
                  src={profile?.avatar_url}
                  size="lg"
                  fallback={initials}
                  class="ring-2 ring-white shadow-sm"
                />

                <!-- User Info -->
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-gray-900 text-lg truncate">{userDisplayName}</div>
                  {#if userStats}
                    <div class="flex items-center gap-3 mt-1 text-sm text-gray-600">
                      {#if userStats.rating}
                        <div class="flex items-center gap-1">
                          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span>{userStats.rating.toFixed(1)}</span>
                        </div>
                      {/if}
                      {#if userStats.memberSince}
                        <span>Member since {userStats.memberSince}</span>
                      {/if}
                    </div>
                  {/if}
                </div>

                <!-- Profile actions -->
                <div class="flex flex-col gap-2">
                  {#if canSell}
                    <a
                      href="/sell"
                      onclick={closeMenu}
                      class="px-3 py-2 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-colors touch-manipulation text-center"
                    >
                      {translations.sellItems}
                    </a>
                  {:else}
                    <a
                      href="/start-selling"
                      onclick={closeMenu}
                      class="px-3 py-2 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-colors touch-manipulation text-center"
                    >
                      {translations.startSelling}
                    </a>
                  {/if}
                </div>
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
              <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 px-2">
                {translations.browseCategories}
              </h2>
              <div class="space-y-3">
              <!-- Women Category -->
              <button
                onclick={() => handleCategoryClick('women', 1, ['women'])}
                class="w-full flex items-center justify-between p-3 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm rounded-lg transition-colors touch-manipulation min-h-[40px]"
                aria-label="Browse Women's items"
              >
                <div class="flex items-center gap-4">
                  <!-- Category Icon -->
                  <div class="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span class="text-2xl">👗</span>
                  </div>

                  <!-- Category Info -->
                  <div class="flex-1 text-left">
                    <div class="font-semibold text-gray-900 text-base">{translations.categoryWomen}</div>
                    <div class="text-sm text-gray-500">
                      {formatItemCount(categoryCounts.women)}
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
                class="w-full flex items-center justify-between p-3 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm rounded-lg transition-colors touch-manipulation min-h-[40px]"
                aria-label="Browse Men's items"
              >
                <div class="flex items-center gap-4">
                  <!-- Category Icon -->
                  <div class="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span class="text-2xl">👔</span>
                  </div>

                  <!-- Category Info -->
                  <div class="flex-1 text-left">
                    <div class="font-semibold text-gray-900 text-base">{translations.categoryMen}</div>
                    <div class="text-sm text-gray-500">
                      {formatItemCount(categoryCounts.men)}
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
                class="w-full flex items-center justify-between p-3 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm rounded-lg transition-colors touch-manipulation min-h-[40px]"
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
                      {formatItemCount(categoryCounts.kids)}
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
                      {formatItemCount(categoryCounts.unisex)}
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
              <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 px-2">Quick Actions</h2>
              <div class="grid grid-cols-3 gap-3">
                <a
                  href="/search"
                  onclick={closeMenu}
                  class="flex flex-col items-center p-3 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm rounded-lg transition-colors touch-manipulation min-h-[40px]"
                >
                  <svg class="w-5 h-5 mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span class="text-xs font-medium text-gray-900 text-center">{translations.browseAll}</span>
                </a>

                <a
                  href="/brands"
                  onclick={closeMenu}
                  class="flex flex-col items-center p-3 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm rounded-lg transition-colors touch-manipulation min-h-[40px]"
                >
                  <svg class="w-5 h-5 mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span class="text-xs font-medium text-gray-900 text-center">Популярни</span>
                </a>

                <a
                  href="/new"
                  onclick={closeMenu}
                  class="flex flex-col items-center p-3 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm rounded-lg transition-colors touch-manipulation min-h-[40px]"
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
                    class="flex flex-col items-center p-3 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm rounded-lg transition-colors touch-manipulation min-h-[40px]"
                  >
                    <svg class="w-5 h-5 mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                    </svg>
                    <span class="text-xs font-medium text-gray-900 text-center">{translations.orders}</span>
                  </a>

                  <a
                    href="/favorites"
                    onclick={closeMenu}
                    class="flex flex-col items-center p-3 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm rounded-lg transition-colors touch-manipulation min-h-[40px]"
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
              <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 px-2">Settings</h2>
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
              <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 px-2">Support</h2>
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
                  class="flex items-center px-3 py-3 text-gray-900 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0 touch-manipulation min-h-[36px]"
                >
                  <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span class="text-sm font-medium">{translations.privacy}</span>
                </a>

                <a
                  href="/terms"
                  onclick={closeMenu}
                  class="flex items-center px-3 py-3 text-gray-900 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0 touch-manipulation min-h-[36px]"
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
                  class="w-full flex items-center justify-center px-4 py-4 text-red-600 hover:text-red-700 hover:bg-red-50 active:bg-red-100 rounded-xl transition-all duration-200 border border-red-200 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px]"
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
                    class="flex items-center justify-center px-4 py-4 text-gray-900 hover:text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300 touch-manipulation min-h-[44px]"
                  >
                    <span class="font-semibold">{translations.signIn}</span>
                  </a>
                  <a
                    href="/signup"
                    onclick={closeMenu}
                    class="flex items-center justify-center px-4 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 active:bg-gray-900 transition-all duration-200 touch-manipulation min-h-[44px]"
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
                  class="flex items-center justify-center min-w-[36px] min-h-[36px] rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors touch-manipulation"
                  aria-label="Back to main menu"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 class="text-lg font-semibold text-gray-900">
                  {selectedMainCategory.name}
                </h1>
              </div>

              <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 px-2">
                {selectedMainCategory.name} Categories
              </h2>

              <!-- "View All" button for main category -->
              <div class="mb-4">
                <button
                  onclick={() => handleSubcategoryClick(selectedMainCategory)}
                  class="w-full flex items-center justify-between p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors touch-manipulation min-h-[40px]"
                >
                  <div class="flex items-center gap-3">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span class="font-semibold">View All {selectedMainCategory.name}</span>
                  </div>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <!-- Subcategories List -->
              <div class="space-y-2">
                {#each selectedMainCategory.children as subcategory}
                  <button
                    onclick={() => handleSubcategoryClick(subcategory)}
                    class="w-full flex items-center justify-between p-3 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm rounded-lg transition-colors touch-manipulation min-h-[36px]"
                  >
                    <div class="flex items-center gap-3">
                      <span class="text-sm font-medium text-gray-900">{subcategory.name}</span>
                      {#if subcategory.product_count !== undefined && subcategory.product_count > 0}
                        <span class="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                          {subcategory.product_count}
                        </span>
                      {/if}
                    </div>
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Safe area bottom padding -->
          <div class="h-8"></div>
        </div>
      </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Prevent scrolling on body when menu is open */
  :global(body.overflow-hidden),
  :global(html.overflow-hidden) {
    overflow: hidden !important;
    position: fixed !important;
    width: 100% !important;
  }

  /* Safe area support for devices with notches */
  .safe-area-top {
    padding-top: env(safe-area-inset-top);
  }

  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }

  /* Enhanced touch targets */
  button, a {
    -webkit-tap-highlight-color: transparent;
    -webkit-user-select: none;
    user-select: none;
  }

  /* iOS Safari specific fixes */
  @supports (-webkit-touch-callout: none) {
    button, a {
      -webkit-touch-callout: none;
    }
  }

  /* Smooth scrolling for mobile */
  .overflow-y-auto {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    overscroll-behavior: contain;
  }

  /* Prevent zoom on inputs */
  input, select, textarea {
    font-size: 16px;
  }

  /* Better backdrop filter support */
  @supports (backdrop-filter: blur(4px)) {
    .backdrop-blur-sm {
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
  }
</style>