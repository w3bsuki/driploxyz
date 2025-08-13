<script lang="ts">
  import { Button, Avatar } from '@repo/ui';
  import { page } from '$app/stores';
  import { authState, displayName, userInitials, canSell } from '$lib/stores/auth';
  import { signOut } from '$lib/auth';
  
  interface Props {
    showSearch?: boolean;
    minimal?: boolean;
  }
  
  let { showSearch = false, minimal = false }: Props = $props();
  let mobileMenuOpen = $state(false);
  let userMenuOpen = $state(false);

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
</script>

<!-- Unified Header for all pages -->
<header class="bg-white shadow-sm sticky top-0 z-40">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-14 sm:h-16">
      <!-- Logo -->
      <a href="/" class="flex items-center">
        <span class="text-xl sm:text-2xl font-bold text-gray-900">Driplo</span>
      </a>
      
      <!-- Desktop Navigation -->
      <nav class="hidden sm:flex items-center space-x-6">
        <a href="/search" class="text-gray-600 hover:text-gray-900 font-medium">Browse</a>
        
        {#if $authState.user}
          <!-- Authenticated Navigation -->
          {#if $canSell}
            <a href="/sell" class="text-gray-600 hover:text-gray-900 font-medium">Sell</a>
          {/if}
          <a href="/messages" class="text-gray-600 hover:text-gray-900 font-medium">Messages</a>
          <a href="/dashboard" class="text-gray-600 hover:text-gray-900 font-medium">Dashboard</a>
          
          <!-- User Menu -->
          <div class="relative">
            <button
              onclick={() => userMenuOpen = !userMenuOpen}
              class="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <Avatar 
                name={$displayName} 
                src={$authState.profile?.avatar_url} 
                size="sm"
                fallback={$userInitials}
              />
              <span class="font-medium">{$displayName}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {#if userMenuOpen}
              <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <a href="/profile/me" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile
                </a>
                <a href="/orders" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Orders
                </a>
                <a href="/favorites" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Favorites
                </a>
                {#if !$canSell}
                  <a href="/become-seller" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Become a Seller
                  </a>
                {/if}
                <div class="border-t border-gray-100"></div>
                <a href="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Settings
                </a>
                <button
                  onclick={handleSignOut}
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            {/if}
          </div>
        {:else}
          <!-- Unauthenticated Navigation -->
          <div class="flex items-center space-x-2">
            <a href="/login" class="inline-flex items-center justify-center font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white text-gray-700 focus-visible:ring-gray-500 px-3 py-1.5 text-sm">
              Sign In
            </a>
            <a href="/signup" class="inline-flex items-center justify-center font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white focus-visible:ring-blue-500 px-3 py-1.5 text-sm">
              Sign Up
            </a>
          </div>
        {/if}
      </nav>
      
      <!-- Mobile Menu Button -->
      <button
        onclick={() => mobileMenuOpen = !mobileMenuOpen}
        class="sm:hidden p-2 text-gray-600 hover:text-gray-900"
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
    </div>
    
    <!-- Mobile Menu -->
    {#if mobileMenuOpen}
      <div class="sm:hidden border-t border-gray-200 bg-white">
        <div class="py-4">
          <nav class="space-y-1">
            <a href="/search" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 font-medium" onclick={closeMenus}>
              <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse
            </a>
            
            {#if $authState.user}
              <!-- Authenticated Mobile Menu -->
              {#if $canSell}
                <a href="/sell" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 font-medium" onclick={closeMenus}>
                  <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Sell
                </a>
              {/if}
              <a href="/messages" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 font-medium" onclick={closeMenus}>
                <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Messages
              </a>
              <a href="/dashboard" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 font-medium" onclick={closeMenus}>
                <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard
              </a>
              
              <div class="border-t border-gray-100 my-2"></div>
              
              <div class="px-4 py-3">
                <div class="flex items-center space-x-3">
                  <Avatar 
                    name={$displayName} 
                    src={$authState.profile?.avatar_url} 
                    size="md"
                    fallback={$userInitials}
                  />
                  <div>
                    <p class="font-medium text-gray-900">{$displayName}</p>
                    <p class="text-sm text-gray-500">{$authState.user?.email}</p>
                  </div>
                </div>
              </div>
              
              <div class="space-y-1">
                <a href="/profile/me" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50" onclick={closeMenus}>
                  <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </a>
                <a href="/orders" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50" onclick={closeMenus}>
                  <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Orders
                </a>
                <a href="/favorites" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50" onclick={closeMenus}>
                  <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Favorites
                </a>
                {#if !$canSell}
                  <a href="/become-seller" class="flex items-center px-4 py-3 text-blue-600 hover:bg-blue-50" onclick={closeMenus}>
                    <svg class="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Become a Seller
                  </a>
                {/if}
                <a href="/settings" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50" onclick={closeMenus}>
                  <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </a>
                
                <div class="border-t border-gray-100 mt-2 pt-2">
                  <button
                    onclick={handleSignOut}
                    class="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50"
                  >
                    <svg class="w-5 h-5 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            {:else}
              <!-- Unauthenticated Mobile Menu -->
              <div class="border-t border-gray-100 mt-2 pt-2 space-y-1">
                <a href="/login" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50" onclick={closeMenus}>
                  <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </a>
                <div class="px-4 pb-3">
                  <a href="/signup" class="flex items-center justify-center w-full px-4 py-3 bg-black text-white rounded-lg font-medium" onclick={closeMenus}>
                    Get Started
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