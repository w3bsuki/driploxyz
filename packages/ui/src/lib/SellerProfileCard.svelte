<script lang="ts">
  import Avatar from './Avatar.svelte';
  import ProBadge from './ProBadge.svelte';
  import BrandBadge from './BrandBadge.svelte';
  import type { Seller } from './types/index';
  import type { Product } from './types/product';
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

<!-- Ultrathink: Clean flat design card - no shadows, no scale, perfect spacing -->
<button
  class="w-full h-full bg-white border border-gray-200 rounded-xl p-4
         hover:border-gray-300 hover:bg-gray-50
         transition-all duration-200
         touch-manipulation focus-visible:outline-none focus-visible:ring-2
         focus-visible:ring-blue-500 focus-visible:ring-offset-2 {className}"
  onclick={onclick}
  type="button"
>
  <!-- Seller Info Section -->
  <div class="flex flex-col items-center mb-3">
    <!-- Avatar -->
    <div class="mb-2">
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
    </div>


    <!-- Username with badge -->
    <div class="mb-1 flex items-center justify-center gap-1.5">
      <span class="font-semibold text-[color:var(--gray-800)] text-base truncate max-w-[120px] text-center tracking-tight">
        {seller.username || 'seller'}
      </span>

      <!-- Account badges after username like Twitter/X -->
      {#if seller.account_type || hasVerifiedBadge}
        {#if seller.account_type === 'admin'}
          <!-- Keep admin text badge for authority -->
          <span class="inline-block px-1.5 py-0.5 text-[8px] font-bold rounded-full bg-red-600 text-white">
            {i18n.badge_admin()}
          </span>
        {:else if seller.account_type === 'brand'}
          <!-- Use new BrandBadge component -->
          <BrandBadge size="s" position="static" variant="black" />
        {:else if seller.account_type === 'pro'}
          <!-- Use new ProBadge component -->
          <ProBadge size="s" position="static" />
        {:else if seller.account_type === 'personal' || hasVerifiedBadge}
          <!-- Clean verified badge -->
          <div class="w-5 h-5 bg-black rounded-full flex items-center justify-center">
            <svg class="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        {/if}
      {/if}
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

  <!-- Ultrathink: Clean product previews - no gradients, no scale effects -->
  <div class="grid grid-cols-3 gap-2 mb-3">
    {#each previews as product}
      <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors">
        {#if (product.product_images && product.product_images[0]?.image_url) || product.images?.[0]}
          <img
            src={(product.product_images && product.product_images[0]?.image_url) || product.images?.[0]}
            alt={product.title}
            class="w-full h-full object-cover"
            loading="lazy"
          />
        {:else}
          <div class="w-full h-full bg-gray-150 flex items-center justify-center">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        {/if}
      </div>
    {/each}

    <!-- Fill remaining slots with clean placeholders -->
    {#each Array(3 - previews.length) as _}
      <div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 border-dashed">
        <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
    {/each}
  </div>

  <!-- Ultrathink: Clean Quick View button - no shadows -->
  <div class="w-full bg-gray-800 hover:bg-gray-900 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors duration-200 text-center">
    Quick View
  </div>
</button>