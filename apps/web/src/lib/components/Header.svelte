<script lang="ts">
  import { 
    Button, 
    Avatar, 
    NotificationBell, 
    MessageNotificationToast, 
    LanguageSwitcher,
    HeaderLogo,
    HeaderUserMenu,
    HeaderNav,
    HeaderSearch,
    MobileNavigation
  } from '@repo/ui';
  import type { User, Profile } from '@repo/ui/types';
  import * as i18n from '@repo/i18n';
  import { authState } from '$lib/stores/auth';
  import { signOut, canSell } from '$lib/auth';
  import { 
    notifications, 
    notificationPanelOpen, 
    messageToasts,
    unreadCount, 
    notificationActions,
    messageToastActions
  } from '$lib/stores/notifications';
  import { RealtimeNotificationService } from '$lib/services/realtime-notifications';
  import { switchLanguage, languages } from '$lib/utils/language-switcher';
  import { browser } from '$app/environment';
  
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
  
  let mobileMenuOpen = $state(false);
  let userMenuOpen = $state(false);
  let signingOut = $state(false);
  let notificationService: RealtimeNotificationService | null = null;
  let NotificationPanel: any = null;
  let notificationPanelLoaded = $state(false);
  
  // Use props data if available (SSR), otherwise fall back to stores (client)
  const currentUser = $derived(propsUser || $authState.user);
  const currentProfile = $derived(propsProfile || $authState.profile);
  const isLoggedIn = $derived(!!currentUser);
  const userCanSell = $derived(canSell(currentProfile));
  const userDisplayName = $derived(
    currentProfile?.full_name || currentProfile?.username || 'User'
  );
  const initials = $derived(
    currentProfile?.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 
    currentProfile?.username?.[0]?.toUpperCase() || 
    '?'
  );
  
  // Language handling
  let currentLang = $state(initialLanguage || i18n.languageTag());
  
  $effect(() => {
    if (initialLanguage && initialLanguage !== i18n.languageTag()) {
      i18n.setLanguageTag(initialLanguage);
      currentLang = initialLanguage;
    }
  });
  
  $effect(() => {
    const newLang = i18n.languageTag();
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
      if ($authState.supabase) {
        await signOut($authState.supabase);
      }
      // The signOut function handles the redirect
    } catch (error) {
      console.error('Sign out error:', error);
      signingOut = false;
    }
  }

  function closeMenus() {
    mobileMenuOpen = false;
    userMenuOpen = false;
  }

  // Initialize notification service when user logs in
  $effect(() => {
    const unsubscribe = authState.subscribe(state => {
      if (state.user && state.supabase && !notificationService) {
        notificationService = new RealtimeNotificationService(state.supabase, state.user.id);
        notificationService.initialize();
      } else if (!state.user && notificationService) {
        notificationService.destroy();
        notificationService = null;
      }
    });

    return () => {
      unsubscribe();
      if (notificationService) {
        notificationService.destroy();
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
    myProfile: i18n.nav_profile(),
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
    orders: i18n.nav_orders(),
    favorites: i18n.nav_favorites(),
    categoryWomen: i18n.category_women(),
    categoryMen: i18n.category_men(),
    categoryKids: i18n.category_kids(),
    categoryPets: i18n.category_pets()
  });
</script>

<header class="bg-white border-b border-gray-200 shadow-sm">
  <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Left: Mobile Menu + Logo -->
      <div class="flex items-center">
        <!-- Mobile Menu Button -->
        <button
          onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
          class="sm:hidden p-1 text-gray-700 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50 mr-1"
          aria-label="Toggle menu"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {#if mobileMenuOpen}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            {:else}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            {/if}
          </svg>
        </button>
        
        <!-- Logo -->
        <HeaderLogo />
      </div>
      
      <!-- Center: Desktop Navigation or Search -->
      {#if showSearch}
        <HeaderSearch placeholder={i18n.search_placeholder()} />
      {:else}
        <HeaderNav 
          {isLoggedIn}
          canSell={userCanSell}
          translations={navTranslations}
        />
      {/if}
      
      <!-- Right: Auth/Account -->
      <div class="flex items-center gap-1.5 sm:gap-2">
        <!-- Desktop Language Switcher -->
        <div class="hidden sm:block mr-2">
          <LanguageSwitcher
            currentLanguage={currentLang}
            {languages}
            onLanguageChange={switchLanguage}
            variant="dropdown"
          />
        </div>
        
        {#if isLoggedIn}
          <!-- Notifications -->
          <div class="relative">
            <NotificationBell 
              count={$unreadCount}
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
              <svelte:component 
                this={NotificationPanel}
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
          <div class="relative">
            <button
              onclick={() => (userMenuOpen = !userMenuOpen)}
              class="block rounded-full hover:ring-2 hover:ring-gray-200 transition-all"
              aria-label="User menu"
            >
              <Avatar 
                name={userDisplayName} 
                src={currentProfile?.avatar_url} 
                size="sm"
                fallback={initials}
              />
            </button>
            
            {#if userMenuOpen}
              <!-- Click outside to close -->
              <button 
                class="fixed inset-0 z-40" 
                onclick={closeMenus}
                aria-label="Close menu"
              ></button>
              
              <div class="relative z-50">
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
              </div>
            {/if}
          </div>
        {:else}
          <!-- Auth Buttons -->
          <div class="flex items-center gap-2">
            <a href="/login" class="text-gray-700 hover:text-gray-900 font-medium text-sm sm:text-base">
              {i18n.auth_signIn()}
            </a>
            <Button href="/signup" variant="primary" size="sm">
              {i18n.auth_signUp()}
            </Button>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Mobile Menu -->
  {#if mobileMenuOpen}
    <MobileNavigation 
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
  {/if}
</header>

<!-- Message Toast Notifications -->
{#each $messageToasts as toast (toast.id)}
  <MessageNotificationToast 
    notification={toast}
    onClose={() => messageToastActions.remove(toast.id)}
  />
{/each}