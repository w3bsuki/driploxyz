<script lang="ts">
  import { BottomNav } from '@repo/ui';
  import { page } from '$app/stores';
  import * as i18n from '@repo/i18n';
  import type { LayoutServerData } from './$types';
  import type { Snippet } from 'svelte';

  let { data, children }: { data: LayoutServerData; children?: Snippet } = $props();

  // Determine if we should show bottom nav (exclude certain pages)
  const shouldShowBottomNav = $derived(
    !$page.route.id?.includes('/onboarding') &&
    !($page.route.id?.includes('/messages') && $page.url.searchParams.has('conversation'))
  );

  // TODO: Add proper unread message count from data
  const unreadMessageCount = $derived(0);
</script>

<!-- Protected pages container with proper bottom nav spacing -->
<div class="min-h-[100dvh] flex flex-col">
  <!-- Main content area -->
  <main class="flex-1 {shouldShowBottomNav ? 'pb-[calc(var(--touch-primary)+env(safe-area-inset-bottom))] sm:pb-0' : ''}">
    {@render children?.()}
  </main>

  <!-- Bottom Navigation - Mobile Only -->
  {#if shouldShowBottomNav}
    <BottomNav
      currentPath={$page.url.pathname}
      {unreadMessageCount}
      profileHref={data?.user?.id ? `/profile/${data.user.id}` : '/account'}
      isAuthenticated={!!data?.user}
      labels={{
        home: i18n.nav_home(),
        search: i18n.nav_search(),
        sell: i18n.nav_sell(),
        messages: i18n.nav_messages(),
        profile: i18n.nav_profile()
      }}
    />
  {/if}
</div>