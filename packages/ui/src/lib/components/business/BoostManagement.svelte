<script lang="ts">
  import type { Product } from '../../types/product';
  import Button from '../ui/Button.svelte';

  interface BoostStatus {
    canBoost: boolean;
    remainingCredits: number;
    usedThisMonth: number;
    nextResetDate: string;
    reason?: string;
  }

  interface UserProduct extends Product {
    // Don't override database fields - they come from Product with exact types
    // is_boosted, boosted_until, boost_priority are already in database/Product with correct types
  }

  interface Props {
    userProducts: UserProduct[];
    boostStatus: BoostStatus;
    onBoostProduct: (productId: string) => Promise<void>;
    onRemoveBoost: (productId: string) => Promise<void>;
    loading?: boolean;
    translations: {
      boost_management: string;
      remaining_credits: string;
      used_this_month: string;
      next_reset: string;
      boost_product: string;
      remove_boost: string;
      boosted_until: string;
      boost_expired: string;
      no_credits: string;
      requires_subscription: string;
      boost_success: string;
      boost_error: string;
      loading: string;
      no_products: string;
      create_listing: string;
    };
  }

  let {
    userProducts,
    boostStatus,
    onBoostProduct,
    onRemoveBoost,
    loading = false,
    translations
  }: Props = $props();

  let actionLoading = $state<Record<string, boolean>>({});

  async function handleBoostProduct(productId: string) {
    actionLoading[productId] = true;
    try {
      await onBoostProduct(productId);
    } finally {
      actionLoading[productId] = false;
    }
  }

  async function handleRemoveBoost(productId: string) {
    actionLoading[productId] = true;
    try {
      await onRemoveBoost(productId);
    } finally {
      actionLoading[productId] = false;
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  function isBoostActive(product: UserProduct): boolean {
    return Boolean(product.is_boosted) &&
           Boolean(product.boosted_until) &&
           product.boosted_until !== null &&
           new Date(product.boosted_until) > new Date();
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
    <div class="flex items-center gap-3 mb-4">
      <div class="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h2 class="text-xl font-bold text-gray-900">{translations.boost_management}</h2>
    </div>

    <!-- Boost Status -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-lg p-4 border border-purple-100">
        <div class="text-2xl font-bold text-purple-600">{boostStatus.remainingCredits}</div>
        <div class="text-sm text-gray-600">{translations.remaining_credits}</div>
      </div>
      <div class="bg-white rounded-lg p-4 border border-purple-100">
        <div class="text-2xl font-bold text-gray-900">{boostStatus.usedThisMonth}</div>
        <div class="text-sm text-gray-600">{translations.used_this_month}</div>
      </div>
      <div class="bg-white rounded-lg p-4 border border-purple-100">
        <div class="text-sm font-medium text-gray-900">{formatDate(boostStatus.nextResetDate)}</div>
        <div class="text-sm text-gray-600">{translations.next_reset}</div>
      </div>
    </div>

    <!-- Status Message -->
    {#if !boostStatus.canBoost && boostStatus.reason}
      <div class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p class="text-sm text-amber-700">{boostStatus.reason}</p>
      </div>
    {/if}
  </div>

  <!-- Products List -->
  {#if loading}
    <div class="text-center py-8">
      <div class="inline-block animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
      <p class="mt-2 text-gray-600">{translations.loading}</p>
    </div>
  {:else if userProducts.length === 0}
    <div class="text-center py-12 bg-gray-50 rounded-xl">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">{translations.no_products}</h3>
      <Button
        variant="primary"
        onclick={() => window.location.href = '/sell'}
      >
        {translations.create_listing}
      </Button>
    </div>
  {:else}
    <div class="space-y-4">
      {#each userProducts as product (product.id)}
        <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-start gap-4">
            <!-- Product Image -->
            <div class="flex-shrink-0">
              {#if product.images && product.images[0]}
                <img
                  src={product.images[0]}
                  alt={product.title}
                  class="w-20 h-20 object-cover rounded-lg border border-gray-100"
                />
              {:else}
                <div class="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              {/if}
            </div>

            <!-- Product Info -->
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-medium text-gray-900 truncate">{product.title}</h3>
              <p class="text-sm text-gray-600 mb-2">{product.brand} • ${product.price}</p>

              <!-- Boost Status -->
              {#if isBoostActive(product)}
                <div class="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-full mb-3">
                  <svg class="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span class="text-xs font-bold text-yellow-700">BOOSTED</span>
                </div>
                <p class="text-sm text-gray-500">
                  {translations.boosted_until} {formatDate(product.boosted_until!)}
                </p>
              {:else if product.is_boosted}
                <div class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full mb-3">
                  <span class="text-xs font-medium text-gray-600">{translations.boost_expired}</span>
                </div>
              {/if}
            </div>

            <!-- Action Button -->
            <div class="flex-shrink-0">
              {#if isBoostActive(product)}
                <Button
                  variant="outline"
                  size="sm"
                  onclick={() => handleRemoveBoost(product.id)}
                  disabled={actionLoading[product.id] || loading}
                >
                  {#if actionLoading[product.id]}
                    <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  {:else}
                    {translations.remove_boost}
                  {/if}
                </Button>
              {:else}
                <Button
                  variant="primary"
                  size="sm"
                  onclick={() => handleBoostProduct(product.id)}
                  disabled={!boostStatus.canBoost || actionLoading[product.id] || loading}
                >
                  {#if actionLoading[product.id]}
                    <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  {:else}
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {translations.boost_product}
                  {/if}
                </Button>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>