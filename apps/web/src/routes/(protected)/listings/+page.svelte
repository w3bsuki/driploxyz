<script lang="ts">
  import { Button } from '@repo/ui';
  import type { PageData } from './$types';
  import * as i18n from '@repo/i18n';
  import { goto } from '$app/navigation';
  import { getProductUrl } from '$lib/utils/seo-urls';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  let activeTab = $state('all');
  
  const filteredListings = $derived.by(() => {
    const listings = data.listings ?? [];
    if (activeTab === 'all') return listings;
    if (activeTab === 'active') return listings.filter((l: any) => l.status === 'active' && !l.is_sold);
    if (activeTab === 'sold') return listings.filter((l: any) => !!l.is_sold);
    if (activeTab === 'draft') return listings.filter((l: any) => l.status === 'draft');
    return listings;
  });
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  const getStatusColor = (listing: { is_sold: boolean | null | undefined; status: string | null | undefined }) => {
    if (listing.is_sold) return 'bg-green-100 text-green-800';
    if ((listing.status ?? '') === 'active') return 'bg-blue-100 text-blue-800';
    if ((listing.status ?? '') === 'draft') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  const getStatusText = (listing: { is_sold: boolean | null | undefined; status: string | null | undefined }) => {
    if (listing.is_sold) return i18n.listings_sold();
    if ((listing.status ?? '') === 'active') return i18n.listings_active();
    if ((listing.status ?? '') === 'draft') return i18n.listings_draft();
    return listing.status ?? '';
  };
</script>

<svelte:head>
  <title>{i18n.listings_pageTitle()} - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">{i18n.listings_myListings()}</h1>
        <p class="text-gray-600 text-sm sm:text-base mt-1">{i18n.listings_manageProducts()}</p>
      </div>
      <div class="mt-4 sm:mt-0">
        <Button href="/sell" variant="primary">
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {i18n.listings_newListing()}
          </span>
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow-xs">
        <p class="text-sm text-gray-600">{i18n.listings_total()}</p>
  <p class="text-2xl font-bold text-gray-900">{data.stats?.total ?? 0}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-xs">
        <p class="text-sm text-gray-600">{i18n.listings_active()}</p>
  <p class="text-2xl font-bold text-blue-600">{data.stats?.active ?? 0}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-xs">
        <p class="text-sm text-gray-600">{i18n.listings_sold()}</p>
  <p class="text-2xl font-bold text-green-600">{data.stats?.sold ?? 0}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-xs">
        <p class="text-sm text-gray-600">{i18n.listings_draft()}</p>
  <p class="text-2xl font-bold text-yellow-600">{data.stats?.draft ?? 0}</p>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="bg-white rounded-lg shadow-xs mb-6">
      <nav class="flex space-x-8 px-6 py-4">
        <button
          onclick={() => activeTab = 'all'}
          class="text-sm font-medium {activeTab === 'all' 
            ? 'text-blue-600 border-b-2 border-blue-600 pb-2' 
            : 'text-gray-500 hover:text-gray-700'}"
        >
          {i18n.listings_all()} ({data.stats?.total ?? 0})
        </button>
        <button
          onclick={() => activeTab = 'active'}
          class="text-sm font-medium {activeTab === 'active' 
            ? 'text-blue-600 border-b-2 border-blue-600 pb-2' 
            : 'text-gray-500 hover:text-gray-700'}"
        >
          {i18n.listings_active()} ({data.stats?.active ?? 0})
        </button>
        <button
          onclick={() => activeTab = 'sold'}
          class="text-sm font-medium {activeTab === 'sold' 
            ? 'text-blue-600 border-b-2 border-blue-600 pb-2' 
            : 'text-gray-500 hover:text-gray-700'}"
        >
          {i18n.listings_sold()} ({data.stats?.sold ?? 0})
        </button>
        <button
          onclick={() => activeTab = 'draft'}
          class="text-sm font-medium {activeTab === 'draft' 
            ? 'text-blue-600 border-b-2 border-blue-600 pb-2' 
            : 'text-gray-500 hover:text-gray-700'}"
        >
          {i18n.listings_draft()} ({data.stats?.draft ?? 0})
        </button>
      </nav>
    </div>

    <!-- Listings Grid -->
  {#if filteredListings.length === 0}
      <div class="bg-white rounded-lg shadow-xs p-12 text-center">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">{i18n.listings_noListings()}</h3>
        <p class="text-gray-500 mb-4">{i18n.listings_getStarted()}</p>
        <Button href="/sell">{i18n.listings_createFirst()}</Button>
      </div>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {#each filteredListings as listing}
          <div class="relative">
            <a href={getProductUrl(listing as any)} class="block">
              <div class="bg-white rounded-lg shadow-xs overflow-hidden hover:shadow-md transition-shadow">
                <!-- Image -->
                <div class="aspect-square bg-gray-100">
                  {#if (listing as any).first_image || (listing as any).product_images?.[0]?.image_url}
                    <img
                      src={(listing as any).first_image || (listing as any).product_images?.[0]?.image_url || '/placeholder-product.svg'}
                      alt={listing.title}
                      class="w-full h-full object-cover"
                    />
                  {:else}
                    <div class="w-full h-full flex items-center justify-center">
                      <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  {/if}
                </div>
                
                <!-- Content -->
                <div class="p-4">
                  <div class="flex items-start justify-between mb-2">
                    <h3 class="text-sm font-medium text-gray-900 truncate flex-1 mr-2">{listing.title}</h3>
                    <span class="inline-flex px-2 py-1 text-xs rounded-full {getStatusColor(listing)} whitespace-nowrap">
                      {getStatusText(listing)}
                    </span>
                  </div>
                  
                  <p class="text-lg font-bold text-gray-900">{formatPrice(listing.price)}</p>
                  
                  {#if listing.category}
                    <p class="text-xs text-gray-500 mt-1">{listing.category.name}</p>
                  {/if}
                  
                  <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <span class="text-xs text-gray-500">
                      {(listing.created_at ? new Date(listing.created_at).toLocaleDateString() : '')}
                    </span>
                    <div class="flex space-x-2">
                      <button 
                        onclick={(e: MouseEvent) => { e.stopPropagation(); goto(`/product/${listing.id}/edit`); }} 
                        class="text-blue-600 hover:text-blue-800"
                        type="button"
                        aria-label="Edit listing"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>