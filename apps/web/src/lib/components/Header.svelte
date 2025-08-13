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
      <div class="sm:hidden border-t border-gray-200 py-3">
        <nav class="space-y-2">
          <a href="/search" class="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium" onclick={closeMenus}>
            Browse
          </a>
          
          {#if $authState.user}
            <!-- Authenticated Mobile Menu -->
            {#if $canSell}
              <a href="/sell" class="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium" onclick={closeMenus}>
                Sell
              </a>
            {/if}
            <a href="/messages" class="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium" onclick={closeMenus}>
              Messages
            </a>
            <a href="/dashboard" class="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium" onclick={closeMenus}>
              Dashboard
            </a>
            
            <div class="border-t border-gray-200 pt-3 mt-3">
              <div class="flex items-center px-3 py-2 space-x-3">
                <Avatar 
                  name={$displayName} 
                  src={$authState.profile?.avatar_url} 
                  size="sm"
                  fallback={$userInitials}
                />
                <div>
                  <p class="font-medium text-gray-900">{$displayName}</p>
                  <p class="text-sm text-gray-500">{$authState.user?.email}</p>
                </div>
              </div>
              
              <div class="space-y-1 mt-3">
                <a href="/profile/me" class="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium" onclick={closeMenus}>
                  Profile
                </a>
                <a href="/orders" class="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium" onclick={closeMenus}>
                  Orders
                </a>
                <a href="/favorites" class="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium" onclick={closeMenus}>
                  Favorites
                </a>
                {#if !$canSell}
                  <a href="/become-seller" class="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium" onclick={closeMenus}>
                    Become a Seller
                  </a>
                {/if}
                <a href="/settings" class="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium" onclick={closeMenus}>
                  Settings
                </a>
                <button
                  onclick={handleSignOut}
                  class="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          {:else}
            <!-- Unauthenticated Mobile Menu -->
            <div class="border-t border-gray-200 pt-3 mt-3 space-y-2">
              <a href="/login" class="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium" onclick={closeMenus}>
                Sign In
              </a>
              <a href="/signup" class="block px-3 py-2 bg-black text-white rounded-lg text-center font-medium" onclick={closeMenus}>
                Sign Up
              </a>
            </div>
          {/if}
        </nav>
      </div>
    {/if}
  </div>
</header>