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
  import type { User, Profile } from '@repo/ui/types';
  import * as i18n from '@repo/i18n';
  import { signOut, canSell } from '$lib/auth';
  import {
    notificationStore,
    notificationActions,
    messageToastActions
  } from '$lib/stores/notifications.svelte';
  import { unreadMessageCount as unreadMessageCountStore } from '$lib/stores/messageNotifications.svelte';
  import { RealtimeNotificationService } from '$lib/realtime/notifications';
  import { switchLanguage, languages } from '$lib/utils/language-switcher';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import type { Database } from '@repo/database';
  import type { LanguageTag } from '@repo/i18n';
  import { afterNavigate } from '$app/navigation';
  
  interface Props {
    supabase: SupabaseClient<Database> | null;
    showSearch?: boolean;
    initialLanguage?: LanguageTag;
    user?: User;
    profile?: Profile;
  }

  let {
    supabase,
    showSearch = false,
    initialLanguage,
    user: propsUser,
    profile: propsProfile
  }: Props = $props();
  
  // State management
  let mobileMenuOpen = $state(false);
  let signingOut = $state(false);
  let notificationService: RealtimeNotificationService | null = null;
  let NotificationPanel: any | null = $state(null);
  let notificationPanelLoaded = $state(false);
  
  // User-related derived state
  const currentUser = $derived(propsUser);
  const currentProfile = $derived(propsProfile);
  const isLoggedIn = $derived(!!currentUser);
  const userCanSell = $derived(canSell(currentProfile || null));
  const userDisplayName = $derived(
    currentProfile?.full_name || currentProfile?.username || 'User'
  );
  const initials = $derived(
    (currentProfile?.full_name?.split(' ') || []).map(n => n[0]).slice(0, 2).join('').toUpperCase() ||
    currentProfile?.username?.[0]?.toUpperCase() ||
    '?'
  );
  
  // Language handling - use $derived instead of $state assignment in $effect
  const currentLang = $derived(initialLanguage || i18n.getLocale());
  
  // Initialize language on mount
  $effect(() => {
    if (initialLanguage && initialLanguage !== i18n.getLocale()) {
      i18n.setLocale(initialLanguage as LanguageTag);
    }
  });
  
  // Update HTML lang attribute reactively
  $effect(() => {
    if (browser) {
      document.documentElement.lang = currentLang;
    }
  });

  async function handleSignOut() {
    signingOut = true;
    try {
      if (supabase) {
        await signOut(supabase);
      }
    } catch {
      signingOut = false;
    }
  }

  function closeMenus() {
    mobileMenuOpen = false;
  }

  // Auto-close on route change (mobile-first)
  if (browser) {
    afterNavigate(() => {
      closeMenus();
    });
  }

  // Check if notification service should be initialized
  const shouldInitNotifications = $derived(currentUser && supabase && !notificationService);

  // Initialize notification service when user logs in
  $effect(() => {
    if (shouldInitNotifications && currentUser) {
      notificationService = new RealtimeNotificationService(supabase as SupabaseClient<Database>, currentUser.id);
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
  
  // Translation objects - all derived for reactivity
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
    help: i18n.footer_help ? i18n.footer_help() : 'Help Center',
    privacy: i18n.footer_privacy ? i18n.footer_privacy() : 'Privacy',
    terms: i18n.footer_terms ? i18n.footer_terms() : 'Terms',
    returns: i18n.footer_returns ? i18n.footer_returns() : 'Returns',
    trustSafety: i18n.footer_trustSafety ? i18n.footer_trustSafety() : 'Trust & Safety',
    quickActionsLabel: i18n.common_quickActions ? i18n.common_quickActions() : 'Quick Actions',
    settingsLabel: i18n.nav_settings(),
    supportLabel: i18n.common_support ? i18n.common_support() : 'Support'
  });

  // Unread messages - derived from store
  const unreadMessages = $derived(unreadMessageCountStore());

  // Search function for quick results dropdown
  async function handleQuickSearch(_query: string) {
    return { data: [], error: null };
  }
</script>

<header
  class="bg-surface-base supports-[backdrop-filter]:backdrop-blur relative z-50 border-b border-border-subtle"
  aria-label="Site header"
>
  <div class="px-[length:var(--space-3)] sm:px-[length:var(--space-4)] lg:px-[length:var(--space-6)] safe-area">
      <!-- MOBILE LAYOUT: Compact, clean like Vinted -->
  <div class="flex sm:hidden items-center justify-between h-[length:var(--nav-height-mobile)]">
        <!-- Left: Hamburger + Logo -->
        <div class="flex items-center justify-start gap-0 h-[length:var(--touch-primary)]">
          <button
            onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
            class={[
              'inline-flex items-center justify-center',
              'h-[length:var(--touch-primary)] w-[length:var(--touch-primary)] -ml-2',
              'rounded-[length:var(--radius-md)]',
              'text-text-secondary hover:text-text-primary hover:bg-surface-subtle',
              'transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]'
            ]}
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
          <HeaderLogo size="lg" />
        </div>

        <!-- Right: Icons -->
        <div class="flex items-center justify-end gap-1">
          <!-- Discover Button -->
          <button
            onclick={() => {
              const event = new CustomEvent('openDiscover', { bubbles: true });
              document.dispatchEvent(event);
            }}
            class={[
              'inline-flex items-center justify-center',
              'h-9 w-9',
              'rounded-[length:var(--radius-md)]',
              'text-text-secondary hover:text-text-brand hover:bg-surface-subtle',
              'transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]'
            ]}
            aria-label="Discover top sellers and brands"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>

          {#if isLoggedIn}
            <!-- Notifications -->
            <div class="relative">
              <NotificationBell
                count={notificationStore.unreadCount}
                onclick={async () => {
                  if (!notificationPanelLoaded && !NotificationPanel) {
                    const module = await import('@repo/ui');
                    NotificationPanel = module.NotificationPanel;
                    notificationPanelLoaded = true;
                  }
                  notificationActions.togglePanel();
                }}
              />

              {#if notificationPanelLoaded && NotificationPanel}
                <NotificationPanel
                  notifications={notificationStore.notifications}
                  show={notificationStore.notificationPanelOpen}
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
              avatarSize="md"
              translations={userMenuTranslations}
            />
          {/if}

          {#if !isLoggedIn}
            <!-- Auth: Sign In Button -->
            <button
              onclick={async () => await goto('/login')}
              class={[
                'inline-flex items-center justify-center',
                'h-9 px-4',
                'rounded-[length:var(--radius-md)]',
                'bg-brand text-white font-medium text-sm',
                'hover:bg-brand-dark transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]'
              ]}
              type="button"
            >
              {i18n.auth_signIn()}
            </button>
            <!-- Auth: Sign Up Button (mobile) -->
            <Button href="/signup" variant="secondary" size="sm">
              {i18n.auth_signUp()}
            </Button>
          {/if}
        </div>
      </div>

      <!-- DESKTOP LAYOUT -->
      <div class="hidden sm:flex items-center justify-between h-[length:var(--nav-height)]">
        <!-- Left: Logo -->
        <div class="flex items-center">
          <HeaderLogo />
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center justify-end gap-[length:var(--space-2)]">
          <!-- Language + Theme -->
          <LanguageSwitcher
            currentLanguage={currentLang}
            {languages}
            onLanguageChange={switchLanguage}
            variant="dropdown"
          />
          <ThemeToggle size="sm" tooltip="Toggle theme" />

          <!-- Discover Button -->
          <button
            onclick={() => {
              const event = new CustomEvent('openDiscover', { bubbles: true });
              document.dispatchEvent(event);
            }}
            class={[
              'inline-flex items-center justify-center',
              'h-[length:var(--touch-standard)] w-[length:var(--touch-standard)]',
              'rounded-[length:var(--radius-md)]',
              'text-text-secondary hover:text-text-brand hover:bg-surface-subtle',
              'transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]'
            ]}
            aria-label="Discover top sellers and brands"
            title="Discover"
          >
            <svg class="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>

          {#if isLoggedIn}
            <!-- Notifications -->
            <div class="relative">
              <NotificationBell
                count={notificationStore.unreadCount}
                onclick={async () => {
                  if (!notificationPanelLoaded && !NotificationPanel) {
                    const module = await import('@repo/ui');
                    NotificationPanel = module.NotificationPanel;
                    notificationPanelLoaded = true;
                  }
                  notificationActions.togglePanel();
                }}
              />

              {#if notificationPanelLoaded && NotificationPanel}
                <NotificationPanel
                  notifications={notificationStore.notifications}
                  show={notificationStore.notificationPanelOpen}
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
            <!-- Auth: Sign in + Sign up -->
            <a
              href="/login"
              class={[
                'text-text-secondary hover:text-text-primary',
                'font-medium text-base',
                'rounded-[length:var(--radius-md)]',
                'px-[length:var(--header-link-padding-x)] py-[length:var(--header-link-padding-y)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]',
                'transition-colors'
              ]}
            >
              {i18n.auth_signIn()}
            </a>
            <Button href="/signup" variant="primary" size="sm">
              {i18n.auth_signUp()}
            </Button>
          {/if}
        </div>
      </div>

      <!-- Desktop Secondary: Nav or Search -->
      <div class="hidden sm:flex items-center justify-between py-[length:var(--space-2)]">
        {#if showSearch}
          <div class="w-full">
            <HeaderSearch
              placeholder={i18n.search_placeholder()}
              searchFunction={handleQuickSearch}
            />
          </div>
        {:else}
          <HeaderNav {isLoggedIn} canSell={userCanSell} translations={navTranslations} />
        {/if}
      </div>
  </div>

  <!-- Mobile Menu (shared across mobile/desktop logic) -->
  <MobileNavigationDialog
    id="mobile-navigation"
    isOpen={mobileMenuOpen}
    {isLoggedIn}
    user={currentUser}
    profile={currentProfile}
    categories={[]}
    {userDisplayName}
    {initials}
    canSell={userCanSell}
    unreadMessages={unreadMessages}
    unreadNotifications={notificationStore.unreadCount}
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
{#each notificationStore.messageToasts as toast (toast.id)}
  <MessageNotificationToast 
    show={true}
    sender={toast.sender}
    message={toast.message}
    product={toast.product}
    onDismiss={() => messageToastActions.remove(toast.id)}
  />
{/each}
