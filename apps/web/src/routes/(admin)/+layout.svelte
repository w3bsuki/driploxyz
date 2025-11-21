<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { Button } from '@repo/ui';
  import type { LayoutData } from './$types';
  import type { Snippet } from 'svelte';
  import * as i18n from '@repo/i18n';

  interface Props {
    data: LayoutData;
    children?: Snippet;
  }

  let { data, children }: Props = $props();

  // Check if user is admin
  if (!data.user || data.profile?.role !== 'admin') {
    goto('/');
  }

  let mobileMenuOpen = $state(false);

  const navItems = [
    { href: '/admin', label: i18n.dashboard_overview(), icon: '📊' },
    { href: '/admin/payouts', label: i18n.admin_managePayouts(), icon: '💳' }
    // Transactions, Users, and Notifications pages to be implemented
  ];

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }
</script>

<svelte:head>
  <title>Admin Dashboard - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Admin Header -->
  <header class="bg-white border-b border-zinc-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-4">
          <!-- Mobile menu button -->
          <button
            onclick={toggleMobileMenu}
            class="lg:hidden p-2 rounded-xl text-[color:var(--text-tertiary)] hover:bg-gray-100/50 transition-colors"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {#if mobileMenuOpen}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              {:else}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              {/if}
            </svg>
          </button>
          
          <h1 class="text-lg sm:text-xl font-semibold text-zinc-900">
            {i18n.admin_driploAdmin()}
          </h1>
          <span class="hidden sm:inline-block px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">
            ADMIN
          </span>
        </div>
        
        <div class="flex items-center space-x-2 sm:space-x-4">
          <span class="hidden sm:inline text-sm text-[color:var(--text-tertiary)]">
            {data.profile?.username}
          </span>
          <Button href="/" variant="outline" size="sm" class="rounded-xl">
            <span class="hidden sm:inline">{i18n.admin_backToSite()}</span>
            <span class="sm:hidden">{i18n.admin_back()}</span>
          </Button>
        </div>
      </div>
    </div>
  </header>

  <!-- Mobile Navigation Dropdown -->
  {#if mobileMenuOpen}
    <div class="lg:hidden bg-white border-b border-zinc-200">
      <nav class="px-4 py-3 space-y-1">
        {#each navItems as item}
          <a
            href={item.href}
            onclick={() => mobileMenuOpen = false}
            class="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                   {page.url.pathname === item.href 
                     ? 'bg-zinc-900 text-white shadow-md'  
                     : 'text-[color:var(--text-secondary)] hover:bg-gray-100/50'}"
          >
            <span class="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        {/each}
      </nav>
    </div>
  {/if}

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
    <div class="lg:flex lg:gap-8">
      <!-- Desktop Sidebar Navigation -->
      <aside class="hidden lg:block w-64 shrink-0">
        <div class="bg-white rounded-2xl p-4 border border-zinc-200">
          <nav class="space-y-2">
            {#each navItems as item}
              <a
                href={item.href}
                class="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                       {page.url.pathname === item.href 
                         ? 'bg-zinc-900 text-white shadow-md transform scale-105'  
                         : 'text-[color:var(--text-secondary)] hover:bg-gray-100/50 hover:scale-102'}"
              >
                <span class="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            {/each}
          </nav>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 mt-6 lg:mt-0">
        {@render children?.()}
      </main>
    </div>
  </div>
</div>