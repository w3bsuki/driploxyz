<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Button } from '@repo/ui';
  import type { LayoutData } from './$types';
  import type { Snippet } from 'svelte';

  interface Props {
    data: LayoutData;
    children?: Snippet;
  }

  let { data, children }: Props = $props();

  // Check if user is admin
  if (!data.user || data.profile?.role !== 'admin') {
    goto('/');
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/payouts', label: 'Payouts', icon: '💳' },
    { href: '/admin/transactions', label: 'Transactions', icon: '📈' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/notifications', label: 'Notifications', icon: '🔔' }
  ];
</script>

<svelte:head>
  <title>Admin Dashboard - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Admin Header -->
  <header class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-4">
          <h1 class="text-xl font-semibold text-gray-900">Driplo Admin</h1>
          <span class="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">ADMIN</span>
        </div>
        
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-600">Welcome, {data.profile?.full_name || data.profile?.username}</span>
          <Button href="/" variant="outline" size="sm">Back to Site</Button>
        </div>
      </div>
    </div>
  </header>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex gap-8">
      <!-- Sidebar Navigation -->
      <aside class="w-64 flex-shrink-0">
        <nav class="space-y-2">
          {#each navItems as item}
            <a
              href={item.href}
              class="flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                     {$page.url.pathname === item.href 
                       ? 'bg-black text-white' 
                       : 'text-gray-600 hover:bg-gray-100'}"
            >
              <span class="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          {/each}
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1">
        {@render children?.()}
      </main>
    </div>
  </div>
</div>