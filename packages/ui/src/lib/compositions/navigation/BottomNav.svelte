<script lang="ts">
  interface NavItem {
    id: string;
    href?: string;
    label: string;
    icon: string;
    matchPath?: string;
    showBadge?: boolean;
    action?: () => void;
  }

  interface Props {
    currentPath: string;
    unreadMessageCount?: number;
    profileHref?: string;
    isAuthenticated?: boolean;
    onFilterClick?: () => void;
    labels?: {
      home: string;
      search: string;
      sell: string;
      filter: string;
      profile: string;
    };
  }

  let {
    currentPath,
    unreadMessageCount = 0,
    profileHref = '/account',
    isAuthenticated = false,
    onFilterClick,
    labels = {
      home: 'Home',
      search: 'Search',
      sell: 'Sell',
      filter: 'Filter',
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
      id: 'filter',
      action: onFilterClick,
      label: labels.filter,
      icon: 'M3 5h18M6 12h12M10 19h4'
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
      
      {#if item.href}
        <a
          href={item.href}
          class="relative flex flex-col items-center justify-center gap-0.5
                 min-h-12 py-1
                 no-underline hover:no-underline touch-manipulation
                 transition-colors duration-150"
          data-sveltekit-preload-data="hover"
          aria-current={active ? 'page' : undefined}
          aria-label={item.label}
          title={item.label}
        >
          <!-- Icon -->
          <div class="relative">
            {#if item.id === 'sell'}
              <!-- Special sell button -->
              <div class="rounded-full p-1.5 bg-(--brand-primary) text-(--text-inverse) transition-transform active:scale-95">
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
                class="w-5 h-5 transition-colors {active ? 'text-text-primary' : 'text-text-tertiary'}"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="{active ? '2' : '1.5'}"
              >
                <path d={item.icon} />
              </svg>
            {/if}

            <!-- Badge for messages only -->
            {#if item.showBadge && item.id === 'messages' && unreadMessageCount > 0}
              <div
                class="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-0.5
                       bg-status-error-solid text-text-inverse
                       text-[9px] font-semibold rounded-full flex items-center justify-center
                       ring-2 ring-surface-base"
              >
                {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
              </div>
            {/if}
          </div>
          <!-- Label (hide for sell button) -->
          {#if item.id !== 'sell'}
            <span class="text-(length:--text-xs) font-medium leading-none transition-colors {active ? 'text-text-primary' : 'text-text-tertiary'}">
              {item.label}
            </span>
          {/if}
        </a>
      {:else}
        <button
          type="button"
          onclick={item.action}
          class="relative flex flex-col items-center justify-center gap-0.5
                 min-h-12 py-1
                 bg-transparent border-none p-0 cursor-pointer
                 touch-manipulation
                 transition-colors duration-150"
          aria-label={item.label}
          title={item.label}
        >
          <!-- Icon -->
          <div class="relative">
            <svg
              class="w-5 h-5 transition-colors text-text-tertiary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="1.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
            </svg>
          </div>
          <!-- Label -->
          <span class="text-(length:--text-xs) font-medium leading-none transition-colors text-text-tertiary">
            {item.label}
          </span>
        </button>
      {/if}
    {/each}
  </div>
</nav>