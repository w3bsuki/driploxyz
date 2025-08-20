<script lang="ts">
  import { Button, Avatar, NotificationBell, NotificationPanel, MessageNotificationToast, LanguageSwitcher } from '@repo/ui';
  import * as i18n from '@repo/i18n';
  import { page } from '$app/stores';
  import { authState, displayName, userInitials, canSell } from '$lib/stores/auth';
  import { signOut } from '$lib/auth';
  import { 
    notifications, 
    notificationPanelOpen, 
    messageToasts,
    unreadCount, 
    notificationActions,
    messageToastActions
  } from '$lib/stores/notifications';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { RealtimeNotificationService } from '$lib/services/realtime-notifications';
  import { ProductionLocaleManager } from '$lib/cookies/production-cookie-system';
  
  interface Props {
    showSearch?: boolean;
    minimal?: boolean;
  }
  
  let { showSearch = false, minimal = false }: Props = $props();
  let mobileMenuOpen = $state(false);
  let userMenuOpen = $state(false);
  let notificationService: RealtimeNotificationService | null = null;
  
  // Language
  const localeManager = ProductionLocaleManager.getInstance();
  let currentLang = $state(i18n.languageTag());
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'bg', name: 'Български', flag: '🇧🇬' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ua', name: 'Українська', flag: '🇺🇦' }
  ];
  
  async function switchLanguage(lang: string) {
    try {
      await localeManager.setLocale(lang, false);
    } catch (e) {
      console.error('Language switch failed:', e);
      alert('Please accept functional cookies to save your language preference');
    }
  }
  
  // Animated emoji for logo
  const clothingEmojis = ['👗', '👔', '👶', '🐕'];
  let currentEmojiIndex = $state(0);
  
  // Cycle through emojis every 2 seconds
  $effect(() => {
    const interval = setInterval(() => {
      currentEmojiIndex = (currentEmojiIndex + 1) % clothingEmojis.length;
    }, 2000);
    
    return () => clearInterval(interval);
  });

  async function handleSignOut() {
    try {
      if ($authState.supabase) {
        await signOut($authState.supabase);
      }
      // Redirect will happen automatically via auth state change
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  function closeMenus() {
    mobileMenuOpen = false;
    userMenuOpen = false;
  }

  // Initialize language and notification service
  onMount(() => {
    // Initialize locale
    if (browser) {
      currentLang = localeManager.initializeClient();
    }
    
    // Subscribe to auth state for notifications
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

<style>
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(-2px); }
    100% { opacity: 1; transform: translateY(0); }
  }
</style>

<!-- Unified Header for all pages -->
<header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
  <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-14 sm:h-16">
      <!-- Left: Mobile Menu + Logo -->
      <div class="flex items-center space-x-0.5 sm:space-x-4">
        <!-- Mobile Menu Button -->
        <button
          onclick={() => mobileMenuOpen = !mobileMenuOpen}
          class="sm:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200"
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
        
        <!-- Logo with Animated Emoji -->
        <a href="/" class="flex items-center space-x-1">
          <span class="text-lg sm:text-2xl font-bold text-gray-900">Driplo</span>
          <span 
            class="text-lg sm:text-xl transition-all duration-300 hover:scale-110"
            style="display: inline-block; animation: fadeIn 0.3s ease-in-out;"
          >
            {clothingEmojis[currentEmojiIndex]}
          </span>
        </a>
      </div>
      
      <!-- Center: Desktop Navigation -->
      <nav class="hidden sm:flex items-center space-x-6">
        <a href="/search" class="text-gray-600 hover:text-gray-900 font-medium">{i18n.menu_browse()}</a>
        {#if $authState.user}
          {#if $canSell}
            <a href="/sell" class="text-gray-600 hover:text-gray-900 font-medium">{i18n.nav_sell()}</a>
          {/if}
          <a href="/messages" class="text-gray-600 hover:text-gray-900 font-medium">{i18n.nav_messages()}</a>
          <a href="/dashboard" class="text-gray-600 hover:text-gray-900 font-medium">{i18n.profile_dashboard()}</a>
        {/if}
      </nav>
      
      <!-- Right: Auth/Account -->
      <div class="flex items-center space-x-2">
        <!-- Desktop Language Switcher -->
        <div class="hidden sm:block mr-2">
          <LanguageSwitcher
            currentLanguage={currentLang}
            {languages}
            onLanguageChange={switchLanguage}
            variant="dropdown"
          />
        </div>
        
        {#if $authState.user}
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
            <Avatar 
              name={$displayName} 
              src={$authState.profile?.avatar_url} 
              size="sm"
              fallback={$userInitials}
              onclick={() => userMenuOpen = !userMenuOpen}
              class="hover:bg-gray-50 hover:scale-105 transition-all duration-200 border-2 border-transparent hover:border-gray-200"
            />
            
            {#if userMenuOpen}
              <div class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                <!-- User Info Header -->
                <div class="px-4 py-3 border-b border-gray-100">
                  <div class="flex items-center space-x-3">
                    <Avatar 
                      name={$displayName} 
                      src={$authState.profile?.avatar_url} 
                      size="sm"
                      fallback={$userInitials}
                    />
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-gray-900 truncate text-sm">{$displayName}</p>
                      <p class="text-xs text-gray-500 truncate">{$authState.user?.email}</p>
                    </div>
                  </div>
                </div>
                
                <!-- Menu Items -->
                <div class="py-1">
                  <a href="/profile/me" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onclick={closeMenus}>
                    <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {i18n.profile_myProfile()}
                  </a>
                  <a href="/orders" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onclick={closeMenus}>
                    <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {i18n.profile_orders()}
                  </a>
                  <a href="/favorites" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onclick={closeMenus}>
                    <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {i18n.profile_favorites()}
                  </a>
                  {#if !$canSell}
                    <a href="/become-seller" class="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors" onclick={closeMenus}>
                      <svg class="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {i18n.profile_startSelling()}
                    </a>
                  {/if}
                </div>
                
                <div class="border-t border-gray-100 pt-1">
                  <a href="/settings" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onclick={closeMenus}>
                    <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.50 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {i18n.profile_settings()}
                  </a>
                  <button
                    onclick={handleSignOut}
                    class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg class="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {i18n.auth_signOut()}
                  </button>
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <!-- Sign In/Up Buttons -->
          <div class="flex items-center space-x-2">
            <a href="/login" class="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-white/20">
              {i18n.auth_signIn()}
            </a>
            <a href="/signup" class="px-3 py-1.5 text-sm font-medium bg-black/80 text-white rounded-lg hover:bg-black backdrop-blur-xs">
              {i18n.auth_signUp()}
            </a>
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Mobile Menu -->
    {#if mobileMenuOpen}
      <div class="sm:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-xl z-50">
        <div class="px-3 py-3">
          <nav class="space-y-3">
            {#if $authState.user}
              <!-- User Profile Section - Compact -->
              <div class="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <div class="flex items-center space-x-3">
                  <Avatar 
                    name={$displayName} 
                    src={$authState.profile?.avatar_url} 
                    size="sm"
                    fallback={$userInitials}
                  />
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-gray-900 truncate text-sm">{$displayName}</p>
                  </div>
                </div>
              </div>
              
              <!-- Categories - Compact Grid -->
              <div class="grid grid-cols-4 gap-2">
                <a href="/category/women" class="bg-pink-50 rounded-lg p-2 hover:bg-pink-100 transition-colors min-h-[44px] flex flex-col items-center justify-center border border-pink-200/50" onclick={closeMenus}>
                  <span class="text-lg mb-0.5">👗</span>
                  <span class="text-xs font-medium text-gray-700">{i18n.category_women()}</span>
                </a>
                <a href="/category/men" class="bg-blue-50 rounded-lg p-2 hover:bg-blue-100 transition-colors min-h-[44px] flex flex-col items-center justify-center border border-blue-200/50" onclick={closeMenus}>
                  <span class="text-lg mb-0.5">👔</span>
                  <span class="text-xs font-medium text-gray-700">{i18n.category_men()}</span>
                </a>
                <a href="/category/kids" class="bg-yellow-50 rounded-lg p-2 hover:bg-yellow-100 transition-colors min-h-[44px] flex flex-col items-center justify-center border border-yellow-200/50" onclick={closeMenus}>
                  <span class="text-lg mb-0.5">👶</span>
                  <span class="text-xs font-medium text-gray-700">{i18n.category_kids()}</span>
                </a>
                <a href="/category/pets" class="bg-green-50 rounded-lg p-2 hover:bg-green-100 transition-colors min-h-[44px] flex flex-col items-center justify-center border border-green-200/50" onclick={closeMenus}>
                  <span class="text-lg mb-0.5">🐕</span>
                  <span class="text-xs font-medium text-gray-700">{i18n.category_pets()}</span>
                </a>
              </div>
              
              <!-- Essential Actions Only -->
              <div class="space-y-2">
                {#if $canSell}
                  <a href="/sell" class="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px]" onclick={closeMenus}>
                    <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span class="font-medium text-sm">{i18n.menu_sellItems()}</span>
                  </a>
                {/if}
                
                <a href="/profile/me" class="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px]" onclick={closeMenus}>
                  <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span class="font-medium text-sm">{i18n.profile_myProfile()}</span>
                </a>
                
                <a href="/orders" class="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px]" onclick={closeMenus}>
                  <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span class="font-medium text-sm">{i18n.profile_orders()}</span>
                </a>
                
                <a href="/favorites" class="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px]" onclick={closeMenus}>
                  <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span class="font-medium text-sm">{i18n.profile_favorites()}</span>
                </a>
                
                {#if !$canSell}
                  <a href="/become-seller" class="flex items-center px-3 py-2.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors min-h-[44px] bg-blue-25" onclick={closeMenus}>
                    <svg class="w-4 h-4 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="font-semibold text-sm">{i18n.profile_startSelling()}</span>
                  </a>
                {/if}
              </div>
              
              <!-- Language Switcher -->
              <div class="pt-2 border-t border-gray-200">
                <div class="px-3 py-2">
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{i18n.nav_settings()}</p>
                  <LanguageSwitcher
                    currentLanguage={currentLang}
                    {languages}
                    onLanguageChange={switchLanguage}
                    variant="inline"
                    class="w-full"
                  />
                </div>
              </div>
              
              <!-- Sign Out -->
              <div class="pt-2 border-t border-gray-200">
                <button
                  onclick={handleSignOut}
                  class="flex items-center w-full px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[44px]"
                >
                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span class="font-semibold text-sm">{i18n.auth_signOut()}</span>
                </button>
              </div>
              
            {:else}
              <!-- Logged Out Menu - Ultra Compact -->
              <div class="space-y-3">
                <!-- Categories Grid -->
                <div class="grid grid-cols-4 gap-2">
                  <a href="/category/women" class="bg-pink-50 rounded-lg p-2 hover:bg-pink-100 transition-colors min-h-[44px] flex flex-col items-center justify-center border border-pink-200/50" onclick={closeMenus}>
                    <span class="text-lg mb-0.5">👗</span>
                    <span class="text-xs font-medium text-gray-700">{i18n.category_women()}</span>
                  </a>
                  <a href="/category/men" class="bg-blue-50 rounded-lg p-2 hover:bg-blue-100 transition-colors min-h-[44px] flex flex-col items-center justify-center border border-blue-200/50" onclick={closeMenus}>
                    <span class="text-lg mb-0.5">👔</span>
                    <span class="text-xs font-medium text-gray-700">{i18n.category_men()}</span>
                  </a>
                  <a href="/category/kids" class="bg-yellow-50 rounded-lg p-2 hover:bg-yellow-100 transition-colors min-h-[44px] flex flex-col items-center justify-center border border-yellow-200/50" onclick={closeMenus}>
                    <span class="text-lg mb-0.5">👶</span>
                    <span class="text-xs font-medium text-gray-700">{i18n.category_kids()}</span>
                  </a>
                  <a href="/category/pets" class="bg-green-50 rounded-lg p-2 hover:bg-green-100 transition-colors min-h-[44px] flex flex-col items-center justify-center border border-green-200/50" onclick={closeMenus}>
                    <span class="text-lg mb-0.5">🐕</span>
                    <span class="text-xs font-medium text-gray-700">{i18n.category_pets()}</span>
                  </a>
                </div>
                
                <!-- Language Switcher for logged out users -->
                <div class="px-3 py-2">
                  <LanguageSwitcher
                    currentLanguage={currentLang}
                    {languages}
                    onLanguageChange={switchLanguage}
                    variant="inline"
                    class="w-full"
                  />
                </div>
                
                <!-- Authentication - Compact -->
                <div class="grid grid-cols-2 gap-2">
                  <a href="/login" class="flex items-center justify-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] border border-gray-200" onclick={closeMenus}>
                    <span class="font-semibold text-sm">{i18n.auth_signIn()}</span>
                  </a>
                  <a href="/signup" class="flex items-center justify-center px-3 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors min-h-[44px]" onclick={closeMenus}>
                    <span class="text-sm">{i18n.auth_signUp()}</span>
                  </a>
                </div>
              </div>
            {/if}
          </nav>
        </div>
      </div>
    {/if}
  </div>
</header>

<!-- Message Toast Notifications -->
{#each $messageToasts as toast (toast.id)}
  <MessageNotificationToast 
    show={true}
    sender={toast.sender}
    message={toast.message}
    product={toast.product}
    onReply={() => window.location.href = `/messages?conversation=${toast.sender.id}`}
    onDismiss={() => messageToastActions.remove(toast.id)}
  />
{/each}