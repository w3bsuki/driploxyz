<script lang="ts">
  interface Props {
    unreadMessageCount?: number;
    currentPath: string;
    isNavigating?: boolean;
    navigatingTo?: string;
    profileHref?: string;
    labels?: {
      home: string;
      search: string;
      sell: string;
      messages: string;
      profile: string;
    };
    variant?: 'default' | 'flat' | 'ios';
    showLabels?: boolean;
  }
  
  let { 
    unreadMessageCount = 0, 
    currentPath, 
    isNavigating = false, 
    navigatingTo = '',
    profileHref = '/account',
    labels = {
      home: 'Home',
      search: 'Search', 
      sell: 'Sell',
      messages: 'Messages',
      profile: 'Profile'
    },
    variant = 'default',
    showLabels = false
  }: Props = $props();
  
  let clickedItem = $state<string | null>(null);
  
  function handleClick(item: NavItem) {
    clickedItem = item.href;
  }
  
  interface NavItem {
    href: string;
    label: string;
    icon: string;
    matchPath?: string;
    showBadge?: boolean;
    isSpecial?: boolean;
  }
  
  const navItems: NavItem[] = [
    {
      href: '/',
      label: labels.home,
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      matchPath: '/'
    },
    {
      href: '/search',
      label: labels.search,
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
    },
    {
      href: '/sell',
      label: labels.sell,
      icon: 'M12 4v16m8-8H4',
      isSpecial: true
    },
    {
      href: '/messages',
      label: labels.messages,
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      showBadge: true
    },
    {
      href: profileHref,
      label: labels.profile,
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      matchPath: profileHref.startsWith('/profile/') ? '/profile' : profileHref
    }
  ];
  
  function isActive(item: NavItem): boolean {
    const path = item.matchPath || item.href;
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  }
  
  function getItemClasses(item: NavItem): string {
    if (item.isSpecial) {
      return 'flex items-center justify-center py-1.5 min-h-[var(--touch-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--primary)] rounded-full';
    }
    const active = isActive(item);
    const isLoading = clickedItem === item.href || (isNavigating && navigatingTo === item.href);
    const base = variant === 'ios'
      ? 'flex items-center justify-center py-1 min-h-[44px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--primary)]'
      : 'flex items-center justify-center py-2 min-h-[var(--touch-primary)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--primary)]';
    const color = active
      ? 'text-[color:var(--text-primary)]'
      : isLoading
      ? 'text-[color:var(--text-primary)] opacity-70'
      : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]';
    const shape = variant === 'flat' ? '' : ' rounded-lg';
    return `${base}${shape} ${color}`.trim();
  }
  
  // Clear clicked state when navigation completes
  $effect(() => {
    if (!isNavigating && clickedItem) {
      // Give a small delay for visual feedback
      setTimeout(() => {
        clickedItem = null;
      }, 100);
    }
  });
</script>

<nav class="bottom-nav bottom-nav--{variant} fixed bottom-0 left-0 right-0 bg-[color:var(--surface-base)] shadow-sm md:shadow-lg pb-safe sm:hidden z-50 before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[color:var(--border-subtle)] before:to-transparent">
  <div class="grid grid-cols-5">
    {#each navItems as item}
      {@const isLoading = clickedItem === item.href || (isNavigating && navigatingTo === item.href)}
      <a 
        href={item.href}
        class={getItemClasses(item)}
        aria-label={item.label}
        aria-current={isActive(item) ? 'page' : undefined}
        onclick={() => handleClick(item)}
        data-sveltekit-preload-data="hover"
        data-sveltekit-preload-code="hover"
      >
        {#if variant === 'flat' || variant === 'ios'}
          <div class="relative flex flex-col items-center justify-center gap-0.5">
            <svg class="{variant === 'ios' ? 'w-[22px] h-[22px]' : 'w-[22px] h-[22px]'} {isActive(item) ? 'text-[color:var(--text-primary)]' : 'text-[color:var(--text-muted)]'} {isLoading ? 'opacity-50' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
            </svg>
            {#if showLabels}
              <span class="nav-label {isActive(item) ? 'text-[color:var(--text-primary)]' : 'text-[color:var(--text-muted)]'}">{item.label}</span>
            {/if}
            {#if item.showBadge && unreadMessageCount > 0}
              <span class="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full"></span>
            {/if}
            {#if isActive(item)}
              <span class="active-indicator"></span>
            {/if}
          </div>
        {:else}
          {#if item.isSpecial}
            <div class="bg-[color:var(--surface-inverse)] text-[color:var(--text-inverse)] rounded-full p-2.5 shadow-sm md:shadow-lg {isActive(item) ? 'scale-105' : ''} transition-transform duration-150 hover:scale-105 active:scale-95 relative">
              <svg class="w-5 h-5 {isLoading ? 'opacity-50' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
              </svg>
            </div>
          {:else}
            <div class="relative">
              <div class="rounded-full p-2 {isActive(item) ? 'bg-[color:var(--surface-muted)] text-[color:var(--text-primary)]' : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--surface-muted)]'} transition-colors duration-150">
                <svg class="w-5 h-5 transition-opacity duration-200 {isLoading ? 'opacity-50' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
                </svg>
              </div>
              {#if item.showBadge && unreadMessageCount > 0}
                <span class="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              {/if}
            </div>
          {/if}
        {/if}
      </a>
    {/each}
  </div>
</nav>

<style>
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
  /* Flat variant removes shadows and gradient border */
  .bottom-nav--flat {
    background: color-mix(in oklch, var(--surface-base) 95%, transparent);
    box-shadow: none;
  }
  .bottom-nav--flat::before { display: none; }
  .bottom-nav--flat { border-top: 1px solid var(--border-subtle); }

  /* iOS-styled tab bar variant */
  .bottom-nav--ios {
    background: color-mix(in oklch, var(--surface-base) 95%, transparent);
    box-shadow: none;
    border-top: 1px solid var(--border-subtle);
  }
  .bottom-nav--ios::before { display: none; }

  .nav-label {
    font-size: 10px;
    line-height: 1.1;
    margin-top: 2px;
    max-width: 56px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Active indicator dot under icon */
  .active-indicator {
    position: absolute;
    bottom: 4px;
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: var(--text-primary);
  }
</style>
