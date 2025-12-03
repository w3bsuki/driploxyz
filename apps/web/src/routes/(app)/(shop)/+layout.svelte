<script lang="ts">
  // Shop layout - wrap shop pages with shop-specific UI
  import { page } from '$app/state';
  import { pushState } from '$app/navigation';
  import { setContext } from 'svelte';
  import { BottomNav } from '@repo/ui';
  import * as i18n from '@repo/i18n';

  let { children } = $props();

  let showFilterDrawer = $state(false);

  // Sync with page state for back button support
  $effect(() => {
    if ((page.state as any).showFilterDrawer) {
      showFilterDrawer = true;
    } else {
      showFilterDrawer = false;
    }
  });

  // Context for pages to open/close filter drawer
  setContext('filterDrawer', {
    open: () => {
      pushState('', { showFilterDrawer: true });
      showFilterDrawer = true;
    },
    close: () => {
      if ((page.state as any).showFilterDrawer) {
        history.back();
      }
      showFilterDrawer = false;
    },
    get isOpen() {
      return showFilterDrawer;
    }
  });
</script>

<div class="shop-layout">
  <!-- Mobile bottom nav -->
  {#if page.url.pathname && page.url.pathname.startsWith('/')}
    <BottomNav 
      currentPath={page.url.pathname} 
      labels={{
        home: i18n.nav_home ? i18n.nav_home() : 'Home',
        search: i18n.nav_search ? i18n.nav_search() : 'Search',
        sell: i18n.nav_sell ? i18n.nav_sell() : 'Sell',
        messages: i18n.nav_messages ? i18n.nav_messages() : 'Messages',
        profile: i18n.nav_profile ? i18n.nav_profile() : 'Profile'
      }}
    />
  {/if}

  <!-- Shop header/nav could go here -->
  {@render children()}
  <!-- Shop footer could go here -->
</div>

