<script lang="ts">
  import { page, navigating } from '$app/stores';
  import * as i18n from '@repo/i18n';
  
  interface Props {
    unreadMessageCount?: number;
  }
  
  let { unreadMessageCount = 0 }: Props = $props();
  
  interface NavItem {
    href: string;
    label: string;
    icon: string;
    matchPath?: string;
    showBadge?: boolean;
    isSpecial?: boolean;
  }
  
  let currentPath = $derived($page.url.pathname);
  
  const navItems: NavItem[] = [
    {
      href: '/',
      label: i18n.nav_home(),
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      matchPath: '/'
    },
    {
      href: '/search',
      label: i18n.nav_search(),
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
    },
    {
      href: '/sell',
      label: i18n.nav_sell(),
      icon: 'M12 4v16m8-8H4',
      isSpecial: true
    },
    {
      href: '/messages',
      label: i18n.nav_messages(),
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      showBadge: true
    },
    {
      href: '/profile',
      label: i18n.nav_profile(),
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      matchPath: '/profile'
    }
  ];
  
  function isActive(item: NavItem): boolean {
    const path = item.matchPath || item.href;
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path) || (path === '/profile' && currentPath.startsWith('/dashboard'));
  }
  
  function getItemClasses(item: NavItem): string {
    if (item.isSpecial) {
      return 'flex items-center justify-center py-1.5 min-h-[48px]';
    }
    const active = isActive(item);
    const isNavigatingTo = $navigating && $navigating.to?.url.pathname === item.href;
    return `flex flex-col items-center py-2 px-1 min-h-[48px] transition-all duration-200 ${
      active ? 'text-gray-900' : isNavigatingTo ? 'text-gray-700 opacity-70' : 'text-gray-500 hover:text-gray-700'
    }`;
  }
</script>

<nav class="bottom-nav fixed bottom-0 left-0 right-0 bg-white shadow-lg pb-safe sm:hidden z-50 before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gray-200 before:to-transparent">
  <div class="grid grid-cols-5">
    {#each navItems as item}
      <a 
        href={item.href}
        class={getItemClasses(item)}
        aria-label={item.label}
        data-sveltekit-preload-data="hover"
        data-sveltekit-preload-code="hover"
      >
        {#if item.isSpecial}
          <div class="bg-gray-900 text-white rounded-full p-2.5 shadow-lg transform {isActive(item) ? 'scale-105' : ''} {$navigating && $navigating.to?.url.pathname === item.href ? 'opacity-70' : ''} transition-all duration-200 hover:bg-gray-800">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
            </svg>
          </div>
        {:else}
          <div class="relative">
            <svg class="w-5 h-5 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
            </svg>
            {#if item.showBadge && unreadMessageCount > 0}
              <span class="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
            {/if}
          </div>
          <span class="text-[10px] mt-0.5 font-medium transition-opacity duration-200">{item.label}</span>
        {/if}
      </a>
    {/each}
  </div>
</nav>

<style>
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
</style>