<script lang="ts">
  import { 
    Button, 
    Avatar, 
    ProductCard,
    ProductGallery,
    ProductDetailSkeleton,
    ProductCardSkeleton,
    Breadcrumb,
    BundleBuilder
  } from '@repo/ui';
  import SEOMetaTags from '$lib/components/SEOMetaTags.svelte';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import * as i18n from '@repo/i18n';
  import { formatPrice } from '$lib/utils/price';
  import { createBrowserSupabaseClient } from '$lib/supabase/client';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  let isFavorited = $state(data.isFavorited || false);
  let showFullDescription = $state(false);
  let showBundleBuilder = $state(false);
  
  // Create Supabase client for bundle functionality
  const supabase = createBrowserSupabaseClient();
  
  const productImages = $derived(
    data.product.images || []
  );
  
  // Create breadcrumb items
  const breadcrumbItems = $derived(() => {
    const items = [
      { label: i18n.nav_home(), href: '/' }
    ];
    
    // Add parent category (Men/Women/Kids)
    if (data.product.parent_category) {
      items.push({
        label: getCategoryTranslation(data.product.parent_category.name),
        href: `/category/${data.product.parent_category.id}`
      });
    }
    
    // Add current category if different from parent
    if (data.product.category_name && data.product.category_name !== data.product.parent_category?.name) {
      items.push({
        label: getCategoryTranslation(data.product.category_name),
        href: `/category/${data.product.category_id}`
      });
    }
    
    // Add product name (no href for current page)
    items.push({
      label: data.product.title
    });
    
    return items;
  });
  
  function getCategoryTranslation(categoryName: string) {
    const categoryMap: Record<string, () => string> = {
      // Level 1 - Gender categories
      'Women': () => i18n.category_women(),
      'Men': () => i18n.category_men(),
      'Kids': () => i18n.category_kids(),
      'Unisex': () => i18n.category_unisex(),
      
      // Level 2 - Product Types
      'Clothing': () => i18n.category_clothing(),
      'Shoes': () => i18n.category_shoesType(),
      'Accessories': () => i18n.category_accessoriesType(),
      'Bags': () => i18n.category_bagsType(),
      
      // Level 3 - Specific items (old Level 2)
      'Activewear': () => i18n.category_activewear(),
      'Boots': () => i18n.category_boots(),
      'Dresses': () => i18n.category_dresses(),
      'Flats': () => i18n.category_flats(),
      'Formal Shoes': () => i18n.category_formalShoes(),
      'Heels': () => i18n.category_heels(),
      'Hoodies': () => i18n.category_hoodies(),
      'Jackets': () => i18n.category_jackets(),
      'Jackets & Coats': () => i18n.category_jacketsCoats(),
      'Jeans': () => i18n.category_jeans(),
      'Jewelry': () => i18n.category_jewelry(),
      'Lingerie & Underwear': () => i18n.category_lingerie(),
      'Pants & Jeans': () => i18n.category_pantsJeans(),
      'Pants & Trousers': () => i18n.category_pantsTrousers(),
      'Sandals': () => i18n.category_sandals(),
      'Sandals & Slides': () => i18n.category_sandalsSlides(),
      'Shirts': () => i18n.category_shirts(),
      'Shirts & Blouses': () => i18n.category_shirtsBlouses(),
      'Shorts': () => i18n.category_shorts(),
      'Skirts': () => i18n.category_skirts(),
      'Sneakers': () => i18n.category_sneakers(),
      'Suits & Blazers': () => i18n.category_suitsBlazers(),
      'Sweaters & Hoodies': () => i18n.category_sweatersHoodies(),
      'Swimwear': () => i18n.category_swimwear(),
      'T-Shirts': () => i18n.category_tshirts(),
      'Tops & T-Shirts': () => i18n.category_topsTshirts(),
      'Underwear': () => i18n.category_underwear(),
      'Watches': () => i18n.category_watches(),
      
      // Level 3 - Accessory subcategories
      'Hats & Caps': () => i18n.category_hatsAndCaps(),
      'Belts': () => i18n.category_belts(),
      'Scarves': () => i18n.category_scarves(),
      'Sunglasses': () => i18n.category_sunglasses(),
      'Wallets': () => i18n.category_wallets(),
      'Hair Accessories': () => i18n.category_hairAccessories(),
      'Ties': () => i18n.category_ties(),
      'Cufflinks': () => i18n.category_cufflinks(),
      'Backpacks': () => i18n.category_backpacks()
    };
    return categoryMap[categoryName]?.() || categoryName;
  }
  
  const conditionLabel = $derived({
    'new': i18n.product_newWithTags(),
    'like-new': i18n.product_likeNewCondition(),
    'good': i18n.product_goodCondition(),
    'fair': i18n.product_fairCondition()
  }[data.product.condition] || data.product.condition);
  
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return i18n.product_today();
    if (diffInDays === 1) return i18n.product_yesterday();
    if (diffInDays < 7) return `${diffInDays} ${i18n.product_daysAgo()}`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} ${i18n.product_weeksAgo()}`;
    return `${Math.floor(diffInDays / 30)} ${i18n.product_monthsAgo()}`;
  }
  
  async function handleFavorite() {
    if (!data.user) {
      goto('/login');
      return;
    }
    
    try {
      const response = await fetch(`/api/favorites/${data.product.id}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to update favorite');
      }
      
      const result = await response.json();
      isFavorited = result.favorited;
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  }
  
  async function handleBuyNow() {
    if (!data.user) {
      goto('/login');
      return;
    }
    
    // Show bundle builder modal
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
  
  async function handleMessage() {
    if (!data.user) {
      goto('/login');
      return;
    }
    goto(`/messages?conversation=${data.product.seller_id}__${data.product.id}`);
  }
  
  async function handleMakeOffer() {
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
      navigator.clipboard.writeText(window.location.href);
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

<div class="min-h-screen bg-gray-50">
  <!-- Breadcrumb -->
  <div class="bg-white border-b border-gray-100">
    <div class="px-4 lg:px-8 py-2.5 max-w-7xl mx-auto">
      <Breadcrumb items={breadcrumbItems()} class="text-xs sm:text-sm" />
    </div>
  </div>
  
  <div class="lg:grid lg:grid-cols-2 lg:gap-6 max-w-7xl mx-auto bg-white">
    <!-- Gallery - Compact mobile view -->
    <div class="lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)]">
      <ProductGallery 
        images={productImages}
        title={data.product.title}
        condition={data.product.condition}
        isAuthenticated={!!data.user}
        class="w-full h-[50vh] sm:h-[60vh] lg:h-full"
        translations={{
          new: i18n.product_newWithTags(),
          likeNew: i18n.product_likeNewCondition(),
          good: i18n.product_goodCondition(),
          fair: i18n.product_fairCondition()
        }}
      />
    </div>
    
    <!-- Info section - Compact and mobile-optimized -->
    <div class="px-4 lg:px-6 py-4 lg:py-6 pb-24 lg:pb-8">
      <!-- Title and actions row -->
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex-1">
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900">{data.product.title}</h1>
          {#if data.product.brand}
            <p class="text-sm text-gray-600 mt-0.5">{data.product.brand}</p>
          {/if}
        </div>
        <div class="flex gap-1">
          <button
            onclick={handleFavorite}
            class="p-2 rounded-full hover:bg-gray-100 transition-colors {isFavorited ? 'text-red-500' : 'text-gray-400'}"
            aria-label="{isFavorited ? 'Remove from favorites' : 'Add to favorites'}"
          >
            <svg class="w-5 h-5" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
          <button
            onclick={handleShare}
            class="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
            aria-label="Share this product"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Price (Desktop only) -->
      <div class="hidden lg:block mb-4">
        <p class="text-2xl font-bold text-gray-900">{formatPrice(data.product.price)}</p>
      </div>
      
      <!-- Quick info badges -->
      <div class="flex flex-wrap gap-1.5 mb-4">
        {#if data.product.size}
          <span class="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {i18n.product_size()} {data.product.size}
          </span>
        {/if}
        <span class="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
          {conditionLabel}
        </span>
        {#if data.product.color}
          <span class="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {data.product.color}
          </span>
        {/if}
      </div>
      
      <!-- Seller section -->
      <div class="py-3 border-y border-gray-100 mb-4">
        <a href="/profile/{data.product.seller_username || data.product.seller_id}" class="flex items-center gap-3 hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors">
          <Avatar 
            src={data.product.seller_avatar} 
            alt={data.product.seller_name}
            size="sm"
            fallback={data.product.seller_name?.[0]?.toUpperCase() || 'S'}
          />
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm text-gray-900">{data.product.seller_name}</p>
            <div class="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
              {#if data.product.seller_rating}
                <span class="flex items-center gap-0.5">
                  <svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  {data.product.seller_rating.toFixed(1)}
                </span>
              {/if}
              {#if data.product.seller_sales_count}
                <span>{data.product.seller_sales_count} {i18n.seller_sales()}</span>
              {/if}
            </div>
          </div>
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
      
      <!-- Description -->
      {#if data.product.description}
        <div class="mb-4">
          <h3 class="font-medium text-sm text-gray-900 mb-2">{i18n.product_description()}</h3>
          <p class="text-gray-700 text-sm leading-6 whitespace-pre-wrap {!showFullDescription ? 'line-clamp-4' : ''}">
            {data.product.description}
          </p>
          {#if data.product.description.length > 200}
            <button 
              onclick={() => showFullDescription = !showFullDescription}
              class="text-xs font-medium text-gray-900 mt-2 underline"
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </button>
          {/if}
        </div>
      {/if}
      
      <!-- Item details -->
      <div class="space-y-2 text-xs py-3 border-t border-gray-100 mb-4">
        <div class="flex justify-between">
          <span class="text-gray-600">Category</span>
          <span class="text-gray-900">{getCategoryTranslation(data.product.category_name)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Listed</span>
          <span class="text-gray-900">{formatDate(data.product.created_at)}</span>
        </div>
        {#if data.product.view_count}
          <div class="flex justify-between">
            <span class="text-gray-600">Views</span>
            <span class="text-gray-900">{data.product.view_count}</span>
          </div>
        {/if}
      </div>
      
      <!-- Desktop action buttons -->
      <div class="hidden lg:flex gap-3">
        <Button 
          variant="outline" 
          onclick={handleMakeOffer}
          class="flex-1"
        >
          {i18n.product_makeOffer()}
        </Button>
        <Button 
          variant="primary" 
          onclick={handleBuyNow}
          class="flex-1"
        >
          {i18n.product_buyNow()}
        </Button>
      </div>
      
      <!-- Similar products -->
      {#if data.similarProducts && data.similarProducts.length > 0}
        <div class="mt-6">
          <h2 class="font-semibold text-sm mb-3">{i18n.product_youMightLike()}</h2>
          <div class="grid grid-cols-2 gap-2">
            {#each data.similarProducts.slice(0, 4) as product}
              <ProductCard 
                product={{
                  ...product,
                  images: (product.images || []).map(img => img.image_url),
                  sellerName: product.seller_name,
                  sellerRating: product.seller_rating,
                  sellerAvatar: product.seller_avatar
                }}
                onclick={() => goto(`/product/${product.id}`)}
                compact={true}
                translations={{
                  size: i18n.product_size(),
                  newSeller: i18n.trending_newSeller(),
                  unknownSeller: i18n.seller_unknown(),
                  currency: i18n.common_currency(),
                  addToFavorites: i18n.product_addToFavorites(),
                  formatPrice: (price: number) => formatPrice(price),
                  new: i18n.product_new(),
                  likeNew: i18n.product_likeNew(),
                  good: i18n.product_good(),
                  fair: i18n.product_fair(),
                  categoryTranslation: getCategoryTranslation
                }}
              />
            {/each}
          </div>
        </div>
      {/if}
      
      <!-- More from seller - Horizontal scroll -->
      {#if data.sellerProducts && data.sellerProducts.length > 0}
        <div class="mt-6 -mx-4 px-4">
          <div class="flex justify-between items-center mb-3">
            <h2 class="font-semibold text-sm">{i18n.product_moreFromSeller()} {data.product.seller_name}</h2>
            <a href="/profile/{data.product.seller_username || data.product.seller_id}" class="text-xs text-gray-600 font-medium">
              {i18n.product_viewAll()}
            </a>
          </div>
          <div class="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {#each data.sellerProducts as product}
              <div class="w-40 shrink-0">
                <ProductCard 
                  product={{
                    ...product,
                    images: (product.images || []).map(img => img.image_url),
                    sellerName: product.seller_name,
                    sellerRating: product.seller_rating,
                    sellerAvatar: product.seller_avatar
                  }}
                  onclick={() => goto(`/product/${product.id}`)}
                  compact={true}
                  translations={{
                    size: i18n.product_size(),
                    newSeller: i18n.trending_newSeller(),
                    unknownSeller: i18n.seller_unknown(),
                    currency: i18n.common_currency(),
                    addToFavorites: i18n.product_addToFavorites(),
                    formatPrice: (price: number) => formatPrice(price),
                    new: i18n.product_new(),
                    likeNew: i18n.product_likeNew(),
                    good: i18n.product_good(),
                    fair: i18n.product_fair(),
                    categoryTranslation: getCategoryTranslation
                  }}
                />
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Mobile bottom action bar - clean and compact -->
  <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-3 py-2.5 z-30 safe-area-bottom">
    <div class="flex gap-2">
      <Button 
        variant="outline" 
        onclick={handleMessage}
        class="px-3 py-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </Button>
      <Button 
        variant="outline" 
        onclick={handleMakeOffer}
        class="flex-1 py-2 text-sm"
      >
        {i18n.product_makeOffer()}
      </Button>
      <Button 
        variant="primary" 
        onclick={handleBuyNow}
        class="flex-1 py-2 font-semibold text-sm"
      >
        {i18n.product_buyNow()} {formatPrice(data.product.price)}
      </Button>
    </div>
  </div>
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