<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import * as i18n from '@repo/i18n';
  import { unreadMessageCount } from '$lib/stores/messageNotifications.svelte';
  import { BottomNav } from '@repo/ui';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  function handleCollectionClick(collection: { slug: string }) {
    goto(`/collection/${collection.slug}`);
  }
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta name="description" content={data.meta.description} />
  <link rel="canonical" href="https://driplo.com{data.meta.canonical}" />

  <!-- Open Graph -->
  <meta property="og:title" content={data.meta.title} />
  <meta property="og:description" content={data.meta.description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://driplo.com{data.meta.canonical}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.meta.title} />
  <meta name="twitter:description" content={data.meta.description} />
</svelte:head>

<div class="min-h-screen bg-[color:var(--surface-subtle)]" style="padding-top: var(--app-header-offset, 56px);">
  <!-- Page Header -->
  <div class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Breadcrumb -->
      <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-4">
        <button onclick={() => goto('/')} class="hover:text-gray-700 transition-colors">
          {i18n.nav_home()}
        </button>
        <span>•</span>
        <span class="text-gray-900 font-medium">Designer Collections</span>
      </nav>

      <!-- Page Info -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <span class="text-3xl">💎</span>
            <h1 class="text-3xl font-bold text-gray-900">Designer Collections</h1>
          </div>
          <p class="text-gray-600 mb-2 max-w-2xl">
            Discover curated designer collections and luxury fashion pieces
          </p>
          <div class="flex items-center gap-4 text-sm">
            <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              Designer Collections
            </span>
            <span class="text-gray-500">
              {data.collections.length} collections
            </span>
          </div>
        </div>

        <!-- Collection Actions -->
        <div class="flex items-center gap-2">
          <button
            onclick={() => goto('/drip')}
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Drip Collections
          </button>
          <button
            onclick={() => goto('/search')}
            class="px-4 py-2 bg-[color:var(--brand-primary)] text-[color:var(--text-inverse)] rounded-lg hover:bg-[color:var(--brand-primary)]/90 transition-colors"
          >
            Browse All
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Collections Grid -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    {#if data.collections.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {#each data.collections as collection}
          <button
            onclick={() => handleCollectionClick(collection)}
            class="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-lg transition-all text-left group"
          >
            <div class="flex items-center gap-3 mb-4">
              <span class="text-2xl">💎</span>
              <span class="font-semibold text-lg text-gray-900 group-hover:text-[color:var(--brand-primary)] transition-colors">
                {collection.name}
              </span>
            </div>

            {#if collection.description}
              <p class="text-gray-600 mb-4 line-clamp-3">
                {collection.description}
              </p>
            {/if}

            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">
                {collection.product_count} products
              </span>
              <span class="text-sm font-medium text-[color:var(--brand-primary)] bg-[color:var(--surface-brand-subtle)] px-3 py-1 rounded-full">
                Designer
              </span>
            </div>
          </button>
        {/each}
      </div>
    {:else}
      <!-- Empty State -->
      <div class="text-center py-16">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-3xl">💎</span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No designer collections yet</h3>
        <p class="text-gray-500 mb-6 max-w-md mx-auto">
          Designer collections are being curated. Check back soon for luxury fashion!
        </p>
        <div class="flex items-center justify-center gap-3">
          <button
            onclick={() => goto('/drip')}
            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Browse Drip Collections
          </button>
          <button
            onclick={() => goto('/search')}
            class="bg-[color:var(--brand-primary)] text-[color:var(--text-inverse)] px-6 py-3 rounded-lg font-medium hover:bg-[color:var(--brand-primary)]/90 transition-colors"
          >
            Explore All Products
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .line-clamp-3 {
    display: -webkit-box;
    line-clamp: 3;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>

<BottomNav
  currentPath={page.url.pathname}
  unreadMessageCount={unreadMessageCount()}
  profileHref={data.profile?.username ? `/profile/${data.profile.username}` : '/account'}
  labels={{
    home: i18n.nav_home(),
    search: i18n.nav_search(),
    sell: i18n.nav_sell(),
    messages: i18n.nav_messages(),
    profile: i18n.nav_profile()
  }}
/>