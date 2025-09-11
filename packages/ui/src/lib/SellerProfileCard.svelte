<script lang="ts">
  import Avatar from './Avatar.svelte';
  import NewSellerBadge from './NewSellerBadge.svelte';
  import type { Seller, Product } from './types/index';
  import * as i18n from '@repo/i18n';

  interface Props {
    seller: Seller;
    productPreviews?: Product[];
    onclick?: () => void;
    class?: string;
  }

  let { 
    seller, 
    productPreviews = [], 
    onclick,
    class: className = '' 
  }: Props = $props();

  // Get first 3 product previews
  const previews = $derived(productPreviews.slice(0, 3));
  
  // Format stats
  const itemCount = $derived(seller.total_products || 0);
  const rating = $derived(seller.average_rating || 0);
  const hasVerifiedBadge = $derived(seller.is_verified || false);
  
  // Image error state
  let imageError = $state(false);
  
  // Debug seller data (removed $effect to prevent infinite loops)
  
</script>

<button
  class="w-full bg-[color:var(--gray-50)] border border-[color:var(--gray-200)] rounded-xl p-5 
         hover:border-[color:var(--gray-300)] hover:shadow-md active:scale-[0.98] 
         transition-all duration-200 shadow-sm
         touch-manipulation focus-visible:outline-none focus-visible:ring-2 
         focus-visible:ring-blue-500 focus-visible:ring-offset-2 {className}"
  onclick={onclick}
  type="button"
>
  <!-- Seller Info Section -->
  <div class="flex flex-col items-center mb-3">
    <!-- Avatar -->
    <div class="mb-2 relative">
      <div class="w-14 h-14 rounded-full bg-gray-200 overflow-hidden border-2 border-[color:var(--gray-300)] shadow-sm">
        {#if seller.avatar_url && !imageError}
          <img 
            src={seller.avatar_url} 
            alt={seller.username || seller.full_name || 'Seller'}
            class="w-full h-full object-cover"
            loading="lazy"
            onerror={() => {
              console.log('Avatar failed to load:', seller.avatar_url);
              imageError = true;
            }}
          />
        {:else}
          <div class="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg">
            {(seller.username || seller.full_name || 'S').charAt(0).toUpperCase()}
          </div>
        {/if}
      </div>
      <!-- Account Badge - positioned bottom-right like verified badge -->
      {#if seller.account_type || hasVerifiedBadge}
        <div class="absolute -bottom-1 -right-1">
          {#if seller.account_type === 'admin'}
            <!-- Keep admin text badge for authority -->
            <span class="inline-block px-1.5 py-0.5 text-[8px] font-bold rounded-full shadow-sm bg-[oklch(0.55_0.25_25)] text-[oklch(1_0_0)] border border-white">
              {i18n.badge_admin()}
            </span>
          {:else if seller.account_type === 'brand'}
            <!-- White star on black background for brand accounts -->
            <div class="w-6 h-6 bg-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          {:else if seller.account_type === 'pro'}
            <!-- Gold crown for pro accounts -->
            <div class="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 6L9.5 10.5L4 8L8.5 14H15.5L20 8L14.5 10.5L12 6Z"/>
                <path d="M7 16H17V18C17 18.55 16.55 19 16 19H8C7.45 19 7 18.55 7 18V16Z"/>
              </svg>
            </div>
          {:else if seller.account_type === 'personal'}
            <!-- Green checkmark for personal accounts -->
            <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          {:else if hasVerifiedBadge}
            <!-- Verified badge (existing blue checkmark) -->
            <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          {/if}
        </div>
      {/if}
    </div>


    <!-- Username -->
    <div class="mb-1">
      <span class="font-semibold text-[color:var(--gray-800)] text-base truncate max-w-[140px] block text-center tracking-tight">
        @{seller.username || 'seller'}
      </span>
    </div>

    <!-- Stats -->
    <div class="flex items-center gap-2 text-xs text-gray-600 font-medium">
      {#if rating > 0}
        <div class="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
          <svg class="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span class="text-yellow-700">{rating.toFixed(1)}</span>
        </div>
      {/if}
      
      <div class="bg-gray-100 px-2 py-1 rounded-full">
        <span class="text-gray-700">{itemCount} items</span>
      </div>
    </div>
  </div>

  <!-- Product Previews -->
  <div class="grid grid-cols-3 gap-2 mb-3">
    {#each previews as product}
      <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors">
        {#if product.images?.[0]}
          <img 
            src={product.images[0]} 
            alt={product.title}
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        {:else}
          <div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        {/if}
      </div>
    {/each}
    
    <!-- Fill remaining slots with placeholder if needed -->
    {#each Array(3 - previews.length) as _}
      <div class="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border border-gray-200 border-dashed">
        <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
    {/each}
  </div>

  <!-- Quick View Button -->
  <div class="w-full bg-[color:var(--gray-800)] hover:bg-[color:var(--gray-900)] text-white py-2.5 px-4 rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200 text-center">
    Quick View
  </div>
</button>