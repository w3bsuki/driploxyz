<script lang="ts">
  import { 
    Button, 
    NotificationBell, 
    MessageNotificationToast, 
    LanguageSwitcher,
    HeaderLogo,
    HeaderUserMenu,
    HeaderNav,
    HeaderSearch,
    MobileNavigationDialog,
    ThemeToggle
  } from '@repo/ui';
  import type { User } from '@repo/ui/types';
  import * as i18n from '@repo/i18n';
  // Force fresh i18n import
  // Auth stores removed - using props directly
  import { signOut, canSell } from '$lib/auth';
  import { 
    notifications, 
    notificationPanelOpen, 
    messageToasts,
    unreadCount, 
    notificationActions,
    messageToastActions
  } from '$lib/stores/notifications';
  import { RealtimeNotificationService } from '$lib/services/realtimeNotifications';
  import { switchLanguage, languages } from '$lib/utils/language-switcher';
  import { browser } from '$app/environment';
  import { createBrowserSupabaseClient } from '$lib/supabase/client';
  import { afterNavigate } from '$app/navigation';
  import { ProductService } from '$lib/services/products';
  
  interface Props {
    showSearch?: boolean;
    minimal?: boolean;
    initialLanguage?: string;
    user?: User;
    profile?: Profile;
  }
  
  let { 
    showSearch = false, 
    minimal = false, 
    initialLanguage, 
    user: propsUser, 
    profile: propsProfile
  }: Props = $props();
  
  // Create supabase client when needed (browser only)
  const supabase = browser ? createBrowserSupabaseClient() : null;
  
  // Create product service for search functionality
  const productService = supabase ? new ProductService(supabase) : null;
  
  let mobileMenuOpen = $state(false);
  let signingOut = $state(false);
  let notificationService: RealtimeNotificationService | null = null;
  let NotificationPanel: any = $state(null);
  let notificationPanelLoaded = $state(false);
  
  // Use props data directly
  const currentUser = $derived(propsUser);
  const currentProfile = $derived(propsProfile);
  const isLoggedIn = $derived(!!currentUser);
  const userCanSell = $derived(canSell(currentProfile));
  const userDisplayName = $derived(
    currentProfile?.full_name || currentProfile?.username || 'User'
  );
  const initials = $derived(
    (currentProfile?.full_name?.split(' ') || []).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 
    currentProfile?.username?.[0]?.toUpperCase() || 
    '?'
  );
  
  // Language handling
  let currentLang = $state(initialLanguage || i18n.getLocale());
  
  $effect(() => {
    if (initialLanguage && initialLanguage !== i18n.getLocale()) {
      i18n.setLocale(initialLanguage);
      currentLang = initialLanguage;
    }
  });
  
  $effect(() => {
    const newLang = i18n.getLocale();
    if (newLang !== currentLang) {
      currentLang = newLang;
      // Update HTML lang attribute
      if (browser) {
        document.documentElement.lang = newLang;
      }
    }
  });

  async function handleSignOut() {
    signingOut = true;
    try {
      if (supabase) {
        await signOut(supabase);
      }
      // The signOut function handles the redirect
    } catch (error) {
      // Sign out error - reset loading state
      signingOut = false;
    }
  }

  function closeMenus() {
    mobileMenuOpen = false;
  }

  // Mobile-perfect behavior: auto-close on route change (official API)
  if (browser) {
    afterNavigate(() => {
      if (mobileMenuOpen) mobileMenuOpen = false;
    });
  }

  // Initialize notification service when user logs in
  $effect(() => {
    if (currentUser && supabase && !notificationService) {
      notificationService = new RealtimeNotificationService(supabase, currentUser.id);
      notificationService.initialize();
    } else if (!currentUser && notificationService) {
      notificationService.destroy();
      notificationService = null;
    }

    return () => {
      if (notificationService) {
        notificationService.destroy();
        notificationService = null;
      }
    };
  });
  
  // Translation objects
  const navTranslations = $derived({
    browse: i18n.menu_browse(),
    sell: i18n.nav_sell(),
    messages: i18n.nav_messages(),
    dashboard: i18n.profile_dashboard()
  });
  
  const userMenuTranslations = $derived({
    myProfile: i18n.nav_account(),
    orders: i18n.nav_orders(),
    favorites: i18n.nav_favorites(),
    startSelling: i18n.nav_startSelling(),
    settings: i18n.nav_settings(),
    signOut: i18n.auth_signOut(),
    signingOut: 'Signing out...'
  });
  
  const notificationTranslations = $derived({
    title: i18n.notifications_title(),
    unread: i18n.notifications_unread(),
    markAllRead: i18n.notifications_markAllRead(),
    noNotifications: i18n.notifications_noNotifications(),
    notifyWhenSomethingHappens: i18n.notifications_notifyWhenSomethingHappens(),
    viewAll: i18n.notifications_viewAll()
  });
  
  const mobileNavTranslations = $derived({
    sellItems: i18n.nav_sell(),
    myProfile: i18n.nav_profile(),
    startSelling: i18n.nav_startSelling(),
    settings: i18n.nav_settings(),
    signOut: i18n.auth_signOut(),
    signingOut: 'Signing out...',
    signIn: i18n.auth_signIn(),
    signUp: i18n.auth_signUp(),
    browseCategories: i18n.nav_browseCategories(),
    whatLookingFor: i18n.search_whatLookingFor ? i18n.search_whatLookingFor() : 'What are you looking for?',
    browseAll: i18n.search_all(),
    popularBrands: i18n.trending_brands ? i18n.trending_brands() : 'Popular Brands',
    newToday: i18n.filter_newToday ? i18n.filter_newToday() : 'New Today',
    orders: i18n.nav_orders(),
    favorites: i18n.nav_favorites(),
    categoryWomen: i18n.category_women(),
    categoryMen: i18n.category_men(),
    categoryKids: i18n.category_kids(),
    categoryUnisex: i18n.category_unisex(),
    help: 'Help Center',
    privacy: 'Privacy',
    terms: 'Terms',
    returns: 'Returns',
    trustSafety: 'Trust & Safety',
    quickActionsLabel: i18n.common_quickActions ? i18n.common_quickActions() : 'Quick Actions',
    settingsLabel: i18n.nav_settings(),
    supportLabel: i18n.common_support ? i18n.common_support() : 'Support'
  });

  // Search function for quick results dropdown
  async function handleQuickSearch(query: string) {
    if (!productService || !query.trim()) {
      return { data: [], error: null };
    }
    
    try {
      return await productService.searchProducts(query, { limit: 6 });
    } catch (error) {
      return { data: [], error: 'Search failed' };
    }
  }
</script>

<header class="border-b border-[color:var(--border-subtle)] bg-[color:var(--surface-base)] supports-[backdrop-filter]:backdrop-blur">
  <div class="px-2 sm:px-4 lg:px-6 safe-area">
    <!-- Bar -->
    <div class="flex items-center justify-between h-14 sm:h-16">
      <!-- Left: Mobile Menu + Logo -->
      <div class="flex items-center gap-0">
        <button
          onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
          class="sm:hidden inline-flex items-center justify-center h-10 w-10 -ml-2 rounded-[var(--radius-md)] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--surface-subtle)] transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-haspopup="dialog"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {#if mobileMenuOpen}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            {:else}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            {/if}
          </svg>
        </button>

        <div>
          <HeaderLogo />
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center justify-end gap-2">
        <!-- Desktop: Language + Theme -->
        <div class="hidden sm:flex items-center gap-1">
          <LanguageSwitcher
            currentLanguage={currentLang}
            {languages}
            onLanguageChange={switchLanguage}
            variant="dropdown"
          />
          <ThemeToggle size="sm" tooltip="Toggle theme" />
        </div>

        

        {#if isLoggedIn}
          <!-- Notifications -->
          <div class="relative">
            <NotificationBell
              count={$unreadCount}
              onclick={async () => {
                if (!notificationPanelLoaded && !NotificationPanel) {
                  const module = await import('@repo/ui/lib/NotificationPanel.svelte');
                  NotificationPanel = module.default;
                  notificationPanelLoaded = true;
                }
                notificationActions.togglePanel();
              }}
              aria-label={notificationTranslations.title}
            />

            {#if notificationPanelLoaded && NotificationPanel}
              <NotificationPanel
                notifications={$notifications}
                show={$notificationPanelOpen}
                onMarkAsRead={notificationActions.markAsRead}
                onMarkAllAsRead={notificationActions.markAllAsRead}
                onClose={notificationActions.closePanel}
                translations={notificationTranslations}
              />
            {/if}
          </div>

          <!-- User Menu -->
          <HeaderUserMenu
            user={currentUser}
            profile={currentProfile}
            {userDisplayName}
            {initials}
            canSell={userCanSell}
            onSignOut={handleSignOut}
            onClose={closeMenus}
            {signingOut}
            translations={userMenuTranslations}
          />
        {:else}
          <!-- Auth: Sign in always visible; Sign up desktop-only -->
          <div class="flex items-center gap-2">
            <a
              href="/login"
              class="text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] font-medium text-sm sm:text-base rounded-[var(--radius-md)] px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)] transition-colors duration-[var(--duration-fast)]"
            >
              {i18n.auth_signIn()}
            </a>
            <Button href="/signup" variant="primary" size="sm" class="hidden sm:inline-flex">
              {i18n.auth_signUp()}
            </Button>
          </div>
        {/if}
      </div>
    </div>

    <!-- Desktop secondary: Nav or Search below the bar -->
    <div class="hidden sm:flex items-center justify-between py-2">
      {#if showSearch}
        <div class="w-full"><HeaderSearch placeholder={i18n.search_placeholder()} searchFunction={handleQuickSearch} /></div>
      {:else}
        <HeaderNav {isLoggedIn} canSell={userCanSell} translations={navTranslations} />
      {/if}
    </div>
  </div>

  <!-- Mobile Menu -->
  <MobileNavigationDialog
    id="mobile-navigation"
    isOpen={mobileMenuOpen}
      {isLoggedIn}
      user={currentUser}
      profile={currentProfile}
      {userDisplayName}
      {initials}
      canSell={userCanSell}
      currentLanguage={currentLang}
      {languages}
      {signingOut}
      onLanguageChange={switchLanguage}
      onSignOut={handleSignOut}
      onClose={closeMenus}
      onCategoryClick={(category) => {
        closeMenus();
        window.location.href = `/category/${category}`;
      }}
      translations={mobileNavTranslations}
    />
</header>


<!-- Message Toast Notifications -->
{#each $messageToasts as toast (toast.id)}
  <MessageNotificationToast 
    notification={toast}
    onClose={() => messageToastActions.remove(toast.id)}
  />
{/each}
