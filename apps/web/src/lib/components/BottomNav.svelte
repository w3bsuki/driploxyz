<script lang="ts">
  import { page } from '$app/stores';
  import { unreadMessageCount } from '$lib/stores/messageNotifications';
  import * as i18n from '@repo/i18n';
  
  let currentPath = $derived($page.url.pathname);
  
  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };
</script>

<!-- Bottom Navigation - Mobile Only (Compact) -->
<nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe sm:hidden z-50">
  <div class="grid grid-cols-5">
    <!-- Home -->
    <a 
      href="/" 
      class="flex flex-col items-center py-2 px-1 min-h-[48px] {isActive('/') && currentPath === '/' ? 'text-black' : 'text-gray-500'}"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      <span class="text-[10px] mt-0.5">{i18n.nav_home()}</span>
    </a>
    
    <!-- Search -->
    <a 
      href="/search" 
      class="flex flex-col items-center py-2 px-1 min-h-[48px] {isActive('/search') ? 'text-black' : 'text-gray-500'}"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <span class="text-[10px] mt-0.5">{i18n.nav_search()}</span>
    </a>
    
    <!-- Sell (Center - Prominent, No Text) -->
    <a 
      href="/sell" 
      class="flex items-center justify-center py-1.5 min-h-[48px]"
    >
      <div class="bg-black text-white rounded-full p-2.5 shadow-lg transform {isActive('/sell') ? 'scale-105' : ''} transition-transform">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </div>
    </a>
    
    <!-- Inbox -->
    <a 
      href="/messages" 
      class="flex flex-col items-center py-2 px-1 min-h-[48px] {isActive('/messages') ? 'text-black' : 'text-gray-500'}"
    >
      <div class="relative">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <!-- Notification badge - only show when there are unread messages -->
        {#if $unreadMessageCount > 0}
          <span class="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        {/if}
      </div>
      <span class="text-[10px] mt-0.5">{i18n.nav_messages()}</span>
    </a>
    
    <!-- Profile -->
    <a 
      href="/profile/me" 
      class="flex flex-col items-center py-2 px-1 min-h-[48px] {isActive('/profile') || isActive('/dashboard') ? 'text-black' : 'text-gray-500'}"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span class="text-[10px] mt-0.5">{i18n.nav_profile()}</span>
    </a>
  </div>
</nav>

<style>
  /* Add padding for safe area on iOS devices */
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
</style>