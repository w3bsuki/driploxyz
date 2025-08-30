<script lang="ts">
  import { BundleBuilder } from '@repo/ui';
  import SEOMetaTags from '$lib/components/SEOMetaTags.svelte';
  import ProductHeader from '$lib/components/product/ProductHeader.svelte';
  import ProductImageSection from '$lib/components/product/ProductImageSection.svelte';
  import ProductActions from '$lib/components/product/ProductActions.svelte';
  import ProductDetails from '$lib/components/product/ProductDetails.svelte';
  import RelatedProducts from '$lib/components/product/RelatedProducts.svelte';
  import ProductActionBar from '$lib/components/product/ProductActionBar.svelte';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import * as i18n from '@repo/i18n';
  import { formatPrice } from '$lib/utils/price';
  import { createBrowserSupabaseClient } from '$lib/supabase/client';
  import { getConditionLabel } from '$lib/components/product/product-utils';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  let isFavorited = $state(data.isFavorited || false);
  let showBundleBuilder = $state(false);
  let isLiking = $state(false);
  let showShareMenu = $state(false);
  let viewCount = $state(data.product.view_count || 0);
  
  // Create Supabase client for bundle functionality
  const supabase = createBrowserSupabaseClient();
  
  const conditionLabel = $derived(getConditionLabel(data.product.condition));
  
  // Clean state management and handlers
  
  async function handleFavorite() {
    if (!data.user) {
      goto('/login');
      return;
    }
    
    // Optimistic UI update
    isLiking = true;
    const wasLiked = isFavorited;
    isFavorited = !isFavorited;
    
    try {
      const response = await fetch(`/api/favorites/${data.product.id}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        isFavorited = wasLiked; // Revert on error
        throw new Error('Failed to update favorite');
      } else {
        const result = await response.json();
        isFavorited = result.favorited;
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      isFavorited = wasLiked; // Revert on error
    } finally {
      isLiking = false;
    }
  }
  
  async function handleBuyNow() {
    if (!data.user) {
      goto('/login');
      return;
    }
    showBundleBuilder = true;
  }
  
  async function handleBundleConfirm(items: any[]) {
    // Close bundle builder
    showBundleBuilder = false;
    
    // If only one item, go to regular checkout
    if (items.length === 1) {
      const productId = typeof items[0].id === 'string' 
        ? items[0].id 
        : String(items[0].id);
      goto(`/checkout/${productId}`);
    } else {
      // Go to bundle checkout with items in state
      const bundleData = encodeURIComponent(JSON.stringify(items));
      goto(`/checkout/bundle?items=${bundleData}`);
    }
  }
  
  function handleBundleCancel() {
    showBundleBuilder = false;
  }
  
  function handleMessage() {
    if (!data.user) {
      goto('/login');
      return;
    }
    goto(`/messages?conversation=${data.product.seller_id}__${data.product.id}`);
  }
  
  function handleMakeOffer() {
    if (!data.user) {
      goto('/login');
      return;
    }
    goto(`/offer/${data.product.id}`);
  }
  
  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: data.product.title,
        text: `Check out ${data.product.title} on Driplo`,
        url: window.location.href
      });
    } else {
      showShareMenu = true;
      navigator.clipboard.writeText(window.location.href);
      setTimeout(() => {
        showShareMenu = false;
      }, 2000);
    }
  }
  
  function handleDoubleTap(event: Event) {
    // Double-tap to like (no animations per CLAUDE.md)
    event.preventDefault();
    if (!isFavorited && data.user) {
      handleFavorite();
    }
  }
</script>

<!-- SEO Meta Tags with structured data -->
<SEOMetaTags
  title="{data.product.title} - {formatPrice(data.product.price)}"
  description={data.product.description || `${data.product.title} - ${conditionLabel} condition, ${data.product.brand || ''} ${data.product.category_name || ''} available on Driplo`}
  url={$page.url.pathname}
  image={data.product.images?.[0] || '/og-default.jpg'}
  type="product"
  product={data.product}
  seller={data.seller}
  keywords={[
    data.product.brand,
    data.product.category_name,
    data.product.size,
    conditionLabel,
    'secondhand',
    'vintage',
    'preloved'
  ].filter(Boolean)}
/>

<!-- Professional Product Page -->
<div class="min-h-screen bg-gray-50">
  <ProductHeader 
    title={data.product.title}
    onShare={handleShare}
  />

  <!-- Product Content -->
  <div class="max-w-md mx-auto pb-20">
    <!-- Product Card -->
    <div class="bg-white shadow-sm">
      <ProductImageSection 
        product={data.product}
        sellerProducts={data.sellerProducts || []}
        onDoubleTap={handleDoubleTap}
        onMessageSeller={handleMessage}
      />

      <ProductActions
        {isFavorited}
        {isLiking}
        {viewCount}
        user={data.user}
        productId={data.product.id}
        {showShareMenu}
        onFavorite={handleFavorite}
        onMessage={handleMessage}
        onShare={handleShare}
        onBuyNow={handleBuyNow}
        isProductSold={data.product.is_sold}
      />
      
      <ProductDetails product={data.product} />
    </div>
    
    <RelatedProducts
      similarProducts={data.similarProducts}
      sellerProducts={data.sellerProducts}
      sellerName={data.product.seller_name}
      sellerUsername={data.product.seller_username}
      sellerId={data.product.seller_id}
    />
  </div>
  
  <ProductActionBar
    product={data.product}
    user={data.user}
    onMakeOffer={handleMakeOffer}
    onBuyNow={handleBuyNow}
  />
</div>


<!-- Bundle Builder Modal -->
{#if showBundleBuilder}
  <BundleBuilder
    sellerId={data.product.seller_id}
    sellerUsername={data.product.seller?.username || data.product.seller_username || 'seller'}
    sellerAvatar={data.product.seller_avatar}
    sellerRating={data.product.seller_rating}
    initialItem={{
      id: data.product.id,
      title: data.product.title,
      description: data.product.description,
      price: data.product.price,
      currency: 'EUR',
      images: data.product.images,
      seller_id: data.product.seller_id,
      category_id: data.product.category_id || '',
      category_name: data.product.category_name,
      brand: data.product.brand,
      size: data.product.size,
      condition: data.product.condition,
      sold: data.product.is_sold,
      created_at: data.product.created_at,
      updated_at: data.product.created_at,
      favorites_count: 0,
      views_count: data.product.view_count || 0,
      location: data.product.location,
      seller_name: data.product.seller_name,
      seller_avatar: data.product.seller_avatar,
      seller_rating: data.product.seller_rating
    }}
    onConfirm={handleBundleConfirm}
    onCancel={handleBundleCancel}
    open={showBundleBuilder}
    supabaseClient={supabase}
    translations={{
      bundle_title: i18n.bundle_title,
      bundle_subtitle: i18n.bundle_subtitle,
      bundle_shipTogether: i18n.bundle_shipTogether,
      bundle_savePerItem: i18n.bundle_savePerItem,
      bundle_yourBundle: i18n.bundle_yourBundle,
      bundle_item: i18n.bundle_item,
      bundle_items: i18n.bundle_items,
      bundle_justThisItem: i18n.bundle_justThisItem,
      bundle_addTwoItems: i18n.bundle_addTwoItems,
      bundle_addThreeItems: i18n.bundle_addThreeItems,
      bundle_addFiveItems: i18n.bundle_addFiveItems,
      bundle_saveAmount: i18n.bundle_saveAmount,
      bundle_addMoreFrom: i18n.bundle_addMoreFrom,
      bundle_noOtherItems: i18n.bundle_noOtherItems,
      bundle_showAll: i18n.bundle_showAll,
      bundle_itemsTotal: i18n.bundle_itemsTotal,
      bundle_shipping: i18n.bundle_shipping,
      bundle_serviceFee: i18n.bundle_serviceFee,
      bundle_youSave: i18n.bundle_youSave,
      bundle_total: i18n.bundle_total,
      bundle_continueToCheckout: i18n.bundle_continueToCheckout,
      bundle_checkoutItems: i18n.bundle_checkoutItems,
      bundle_quickOptions: i18n.bundle_quickOptions,
      bundle_loading: i18n.bundle_loading,
      bundle_saveOnShipping: i18n.bundle_saveOnShipping
    }}
  />
{/if}
