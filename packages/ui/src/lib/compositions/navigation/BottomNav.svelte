<script lang="ts">
  interface NavItem {
    id: string;
    href?: string;
    label: string;
    icon: string;
    matchPath?: string;
    showBadge?: boolean;
    badgeCount?: number;
    action?: () => void;
  }

  interface Props {
    currentPath: string;
    unreadMessageCount?: number;
    profileHref?: string;
    isAuthenticated?: boolean;
    onFilterClick?: () => void; // Keep for backwards compat, but deprecated
    labels?: {
      home: string;
      search: string;
      sell: string;
      messages: string;
      profile: string;
    };
  }

  let {
    currentPath,
    unreadMessageCount = 0,
    profileHref = '/account',
    isAuthenticated = false,
    onFilterClick, // deprecated
    labels = {
      home: 'Home',
      search: 'Search',
      sell: 'Sell',
      messages: 'Messages',
      profile: 'Profile'
    }
  }: Props = $props();

  // Navigation items
  const navItems = $derived<NavItem[]>([
    {
      id: 'home',
      href: '/',
      label: labels.home,
      icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
      matchPath: '/'
    },
    {
      id: 'search',
      href: '/search',
      label: labels.search,
      icon: 'm21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
    },
    {
      id: 'sell',
      href: '/sell',
      label: labels.sell,
      icon: 'M12 4.5v15m7.5-7.5h-15'
    },
    {
      id: 'messages',
      href: '/messages',
      label: labels.messages,
      icon: 'M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z',
      showBadge: true,
      badgeCount: unreadMessageCount
    },
    {
      id: 'profile',
      href: profileHref,
      label: labels.profile,
      icon: 'M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
      matchPath: profileHref.startsWith('/profile/') ? '/profile' : profileHref
    }
  ]);

  // Active state logic
  function isActive(item: NavItem): boolean {
    if (!item.href) return false;
    const path = item.matchPath || item.href;
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  }
</script>

<!-- Native mobile bottom navigation -->
<nav
  aria-label="Bottom navigation"
  data-bottom-nav
  class="fixed bottom-0 left-0 right-0 sm:hidden pointer-events-auto
         bg-surface-base border-t border-border-subtle
         pb-[env(safe-area-inset-bottom)] z-40"
>
  <div class="grid grid-cols-5">
    {#each navItems as item (item.id)}
      {@const active = isActive(item)}
      
      <a
        href={item.href}
        class="relative flex flex-col items-center justify-center gap-0.5
               min-h-14 py-1.5
               no-underline hover:no-underline touch-manipulation"
        data-sveltekit-preload-data="hover"
        aria-current={active ? 'page' : undefined}
        aria-label={item.label}
        title={item.label}
      >
        <!-- Icon -->
        <div class="relative">
          {#if item.id === 'sell'}
            <!-- Special sell button -->
            <div class="rounded-full p-1.5 bg-(--brand-primary) text-(--text-inverse)">
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="2.5"
              >
                <path d={item.icon} />
              </svg>
            </div>
          {:else}
            <svg
              class="w-5 h-5 {active ? 'text-text-primary' : 'text-text-tertiary'}"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="{active ? '2' : '1.5'}"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
            </svg>
          {/if}

          <!-- Badge for messages -->
          {#if item.showBadge && item.badgeCount && item.badgeCount > 0}
            <div
              class="absolute -top-1 -right-1.5 min-w-4 h-4 px-1
                     bg-status-error-solid text-text-inverse
                     text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {item.badgeCount > 99 ? '99+' : item.badgeCount}
            </div>
          {/if}
        </div>
        <!-- Label (hide for sell button) -->
        {#if item.id !== 'sell'}
          <span class="text-[10px] font-medium leading-none {active ? 'text-text-primary' : 'text-text-tertiary'}">
            {item.label}
          </span>
        {/if}
      </a>
    {/each}
  </div>
</nav>