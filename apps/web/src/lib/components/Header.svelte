<script lang="ts">
  import { 
    Button, 
    Avatar, 
    NotificationBell, 
    NotificationPanel, 
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
  import { page } from '$app/stores';
  import { authState, displayName, userInitials, canSell } from '$lib/stores/auth';
  import { signOut, canSell as canSellHelper } from '$lib/auth';
  import { 
    notifications, 
    notificationPanelOpen, 
    messageToasts,
    unreadCount, 
    notificationActions,
    messageToastActions
  } from '$lib/stores/notifications';
  import { browser } from '$app/environment';
  import { RealtimeNotificationService } from '$lib/services/realtime-notifications';
  import { switchLanguage, languages } from '$lib/utils/language-switcher';
  
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
  let notificationService: RealtimeNotificationService | null = null;
  
  // Use props data if available, otherwise fall back to stores
  const currentUser = $derived(propsUser || $authState.user);
  const currentProfile = $derived(propsProfile || $authState.profile);
  const isLoggedIn = $derived(!!currentUser);
  const userCanSell = $derived(canSellHelper(currentProfile));
  const userDisplayName = $derived(currentProfile?.username || currentProfile?.full_name || 'User');
  const initials = $derived(currentProfile?.full_name?.split(' ').map(n => n[0].toUpperCase()).slice(0, 2).join('') || currentProfile?.username?.[0].toUpperCase() || '?');
  
  // Language - REACTIVE tracking with initial value from server
  let currentLang = $state(initialLanguage || i18n.languageTag());
  
  // Initialize language if provided from server
  $effect(() => {
    if (initialLanguage && initialLanguage !== i18n.languageTag()) {
      i18n.setLanguageTag(initialLanguage);
      currentLang = initialLanguage;
    }
  });
  
  // Update currentLang when language changes
  $effect(() => {
    const newLang = i18n.languageTag();
    if (newLang !== currentLang) {
      currentLang = newLang;
    }
  });
  
  // Animated emoji for logo
  let currentEmojiIndex = $state(0);
  
  // Cycle through emojis every 2 seconds
  $effect(() => {
    const interval = setInterval(() => {
      currentEmojiIndex = (currentEmojiIndex + 1) % 4;
    }, 2000);
    
    return () => clearInterval(interval);
  });

  async function handleSignOut() {
    try {
      if ($authState.supabase) {
        await signOut($authState.supabase);
      }
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  function closeMenus() {
    mobileMenuOpen = false;
    userMenuOpen = false;
  }

  // Initialize notification service
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
</script>

<!-- Unified Header for all pages -->
<header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
  <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Left: Mobile Menu + Logo -->
      <div class="flex items-center">
        <!-- Mobile Menu Button -->
        <button
          onclick={() => mobileMenuOpen = !mobileMenuOpen}
          class="sm:hidden p-1 text-gray-700 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50 mr-1"
          aria-label="Toggle menu"
        >
          {#if mobileMenuOpen}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          {:else}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          {/if}
        </button>
        
        <!-- Logo -->
        <HeaderLogo animated={true} emojiIndex={currentEmojiIndex} />
      </div>
      
      <!-- Center: Desktop Navigation or Search -->
      {#if showSearch}
        <HeaderSearch 
          placeholder={i18n.search_placeholder()}
        />
      {:else}
        <HeaderNav 
          {isLoggedIn}
          canSell={userCanSell}
          translations={{
            browse: i18n.menu_browse(),
            sell: i18n.nav_sell(),
            messages: i18n.nav_messages(),
            dashboard: i18n.profile_dashboard()
          }}
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
              onclick={() => notificationActions.togglePanel()}
            />
            
            <NotificationPanel 
              notifications={$notifications}
              show={$notificationPanelOpen}
              onMarkAsRead={notificationActions.markAsRead}
              onMarkAllAsRead={notificationActions.markAllAsRead}
              onClose={notificationActions.closePanel}
              translations={{
                title: i18n.notifications_title(),
                unread: i18n.notifications_unread(),
                markAllRead: i18n.notifications_markAllRead(),
                noNotifications: i18n.notifications_noNotifications(),
                notifyWhenSomethingHappens: i18n.notifications_notifyWhenSomethingHappens(),
                viewAll: i18n.notifications_viewAll()
              }}
            />
          </div>

          <!-- User Menu -->
          <div class="relative">
            <button
              onclick={() => userMenuOpen = !userMenuOpen}
              class="block rounded-full hover:ring-2 hover:ring-gray-200 transition-all"
              aria-label="User menu"
            >
              <Avatar 
                name={userDisplayName} 
                src={currentProfile?.avatar_url} 
                size="sm"
                fallback={initials}
                class="hover:scale-105 transition-all duration-200"
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
                  translations={{
                    myProfile: i18n.nav_profile(),
                    orders: i18n.nav_orders(),
                    favorites: i18n.nav_favorites(),
                    startSelling: i18n.nav_startSelling(),
                    settings: i18n.nav_settings(),
                    signOut: i18n.auth_signOut()
                  }}
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
      userDisplayName={userDisplayName}
      {initials}
      canSell={userCanSell}
      currentLanguage={currentLang}
      {languages}
      onLanguageChange={switchLanguage}
      onSignOut={handleSignOut}
      onClose={closeMenus}
      onCategoryClick={(category) => {
        closeMenus();
        window.location.href = `/category/${category}`;
      }}
      translations={{
        sellItems: i18n.nav_sell(),
        myProfile: i18n.nav_profile(),
        startSelling: i18n.nav_startSelling(),
        settings: i18n.nav_settings(),
        signOut: i18n.auth_signOut(),
        signIn: i18n.auth_signIn(),
        signUp: i18n.auth_signUp(),
        browseCategories: i18n.nav_browseCategories(),
        orders: i18n.nav_orders(),
        favorites: i18n.nav_favorites()
      }}
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