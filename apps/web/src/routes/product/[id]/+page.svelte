<script lang="ts">
  import { 
    Button, 
    Avatar, 
    ProductCard,
    ProductGallery,
    ProductDetailSkeleton,
    ProductCardSkeleton,
    Breadcrumb,
    BundleBuilder,
    ConditionBadge
  } from '@repo/ui';
  import SEOMetaTags from '$lib/components/SEOMetaTags.svelte';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import * as i18n from '@repo/i18n';
  import { formatPrice } from '$lib/utils/price';
  import { createBrowserSupabaseClient } from '$lib/supabase/client';
  import { getProductUrl } from '$lib/utils/seo-urls';
  
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
  
  function getRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
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
  <!-- Compact Sticky Breadcrumb -->
  <div class="bg-white border-b border-gray-200 sticky top-0 z-20">
    <div class="max-w-7xl mx-auto px-3 py-2">
      <nav class="flex items-center gap-1.5 text-xs text-gray-500">
        <a href="/" class="hover:text-gray-900 transition-colors">Home</a>
        <span class="text-gray-400">/</span>
        {#if data.product.category_name}
          <a href="/search?category={data.product.category_name}" class="hover:text-gray-900 transition-colors">
            {getCategoryTranslation(data.product.category_name)}
          </a>
          <span class="text-gray-400">/</span>
        {/if}
        <span class="text-gray-700 font-medium truncate max-w-32">{data.product.title}</span>
      </nav>
    </div>
  </div>

  <div class="max-w-7xl mx-auto pb-24 lg:pb-8">
    <div class="lg:grid lg:grid-cols-2 lg:gap-6 lg:p-6">
      <!-- Left Column: Social Media Style Product Card -->
      <div class="bg-white lg:rounded-2xl lg:shadow-sm overflow-hidden">
        <!-- Seller Header (Instagram-style) -->
        <div class="border-b border-gray-100">
          <a 
            href="/profile/{data.product.seller_username || data.product.seller_id}" 
            class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <Avatar 
              src={data.product.seller_avatar} 
              alt={data.product.seller_name}
              size="sm"
              fallback={data.product.seller_name?.[0]?.toUpperCase() || 'S'}
            />
            <div class="flex-1">
              <p class="text-sm font-semibold text-gray-900">{data.product.seller_name}</p>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span>{data.sellerProducts?.length || 0} items</span>
                {#if data.product.seller_rating}
                  <span>•</span>
                  <div class="flex items-center gap-0.5">
                    <svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span>{data.product.seller_rating.toFixed(1)}</span>
                  </div>
                {/if}
                <span>•</span>
                <span>{getRelativeTime(data.product.created_at)}</span>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        <!-- Product Image -->
        <div class="aspect-square p-4 bg-gray-50">
          <ProductGallery
            images={productImages}
            title={data.product.title}
            condition={data.product.condition}
            class="w-full h-full"
            translations={{
              new: i18n.product_newWithTags(),
              likeNew: i18n.product_likeNewCondition(),
              good: i18n.product_goodCondition(),
              fair: i18n.product_fairCondition()
            }}
          />
        </div>

        <!-- Action Bar (Instagram-style) -->
        <div class="border-t border-gray-100">
          <div class="flex items-center justify-between px-4 py-3">
            <div class="flex items-center gap-3">
              <button 
                onclick={handleFavorite}
                disabled={!data.user}
                class="hover:scale-110 transition-transform"
                aria-label="{isFavorited ? 'Remove from favorites' : 'Add to favorites'}"
              >
                <svg 
                  class="w-6 h-6 {isFavorited ? 'text-red-500' : 'text-gray-700 hover:text-red-500'} transition-colors" 
                  fill={isFavorited ? 'currentColor' : 'none'} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>
              <button 
                onclick={handleShare}
                class="hover:scale-110 transition-transform" 
                aria-label="Share"
              >
                <svg class="w-6 h-6 text-gray-700 hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-4.056-4.424M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </button>
            </div>
            <span class="text-xs text-gray-500">{data.product.view_count || 0} views</span>
          </div>
        </div>

        <!-- Title and Price (Prominent) -->
        <div class="px-4 pb-3 border-b border-gray-100">
          <h1 class="text-lg font-bold text-gray-900 mb-1">{data.product.title}</h1>
          <div class="flex items-center justify-between">
            <p class="text-2xl font-black text-gray-900">{formatPrice(data.product.price)}</p>
            {#if data.product.is_sold}
              <span class="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">SOLD</span>
            {:else}
              <span class="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold">Available</span>
            {/if}
          </div>
        </div>

        <!-- Product Details Grid -->
        <div class="px-4 py-3">
          <div class="grid grid-cols-2 gap-3">
            {#if data.product.brand}
              <div class="bg-gray-50 rounded-lg px-3 py-2">
                <p class="text-xs text-gray-500 mb-0.5">Brand</p>
                <p class="text-sm font-semibold text-gray-900">{data.product.brand}</p>
              </div>
            {/if}
            {#if data.product.size}
              <div class="bg-gray-50 rounded-lg px-3 py-2">
                <p class="text-xs text-gray-500 mb-0.5">Size</p>
                <p class="text-sm font-semibold text-gray-900">{data.product.size}</p>
              </div>
            {/if}
            <div class="bg-gray-50 rounded-lg px-3 py-2">
              <p class="text-xs text-gray-500 mb-0.5">Condition</p>
              <p class="text-sm font-semibold text-gray-900">{conditionLabel}</p>
            </div>
            {#if data.product.color}
              <div class="bg-gray-50 rounded-lg px-3 py-2">
                <p class="text-xs text-gray-500 mb-0.5">Color</p>
                <p class="text-sm font-semibold text-gray-900">{data.product.color}</p>
              </div>
            {/if}
            <div class="bg-gray-50 rounded-lg px-3 py-2">
              <p class="text-xs text-gray-500 mb-0.5">Category</p>
              <p class="text-sm font-semibold text-gray-900">{getCategoryTranslation(data.product.category_name)}</p>
            </div>
            {#if data.product.location}
              <div class="bg-gray-50 rounded-lg px-3 py-2">
                <p class="text-xs text-gray-500 mb-0.5">Location</p>
                <p class="text-sm font-semibold text-gray-900">{data.product.location}</p>
              </div>
            {/if}
          </div>
        </div>

        <!-- Description -->
        {#if data.product.description}
          <div class="px-4 py-3 border-t border-gray-100">
            <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{data.product.description}</p>
          </div>
        {/if}

        <!-- Mobile Buy Button -->
        <div class="lg:hidden sticky bottom-0 bg-white border-t border-gray-200 p-3">
          {#if !data.product.is_sold && data.product.seller_id !== data.user?.id}
            <button 
              onclick={handleBuyNow}
              class="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              {i18n.product_buyNow()} • {formatPrice(data.product.price)}
            </button>
          {:else if data.product.is_sold}
            <button 
              disabled
              class="w-full bg-gray-200 text-gray-500 py-3 rounded-xl font-semibold cursor-not-allowed"
            >
              {i18n.product_sold()}
            </button>
          {/if}
        </div>
      </div>

      <!-- Right Column: Actions and Recommendations (Desktop) -->
      <div class="px-3 lg:px-0 mt-4 lg:mt-0">
        <!-- Desktop Buy Section -->
        <div class="hidden lg:block bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div class="flex items-center justify-between mb-3">
            <div>
              <p class="text-sm text-gray-500">Price</p>
              <p class="text-3xl font-black text-gray-900">{formatPrice(data.product.price)}</p>
            </div>
            {#if data.product.is_sold}
              <span class="px-4 py-2 bg-red-100 text-red-600 rounded-full text-sm font-semibold">SOLD</span>
            {:else}
              <span class="px-4 py-2 bg-green-100 text-green-600 rounded-full text-sm font-semibold">Available</span>
            {/if}
          </div>
          {#if !data.product.is_sold && data.product.seller_id !== data.user?.id}
            <button 
              onclick={handleBuyNow}
              class="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors mb-2"
            >
              {i18n.product_buyNow()}
            </button>
            <button 
              onclick={handleMakeOffer}
              class="w-full bg-white text-black border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              {i18n.product_makeOffer()}
            </button>
          {:else if data.product.is_sold}
            <button 
              disabled
              class="w-full bg-gray-200 text-gray-500 py-3 rounded-xl font-semibold cursor-not-allowed"
            >
              {i18n.product_sold()}
            </button>
          {/if}
        </div>
        <!-- Similar Products (moved here for desktop) -->
        {#if data.similarProducts && data.similarProducts.length > 0}
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4">
            <div class="flex justify-between items-center mb-3">
              <h2 class="font-semibold text-base">{i18n.product_youMightLike()}</h2>
              {#if data.similarProducts.length > 3}
                <span class="text-xs text-gray-500">{data.similarProducts.length} items</span>
              {/if}
            </div>
            <div class="grid grid-cols-2 gap-3">
              {#each data.similarProducts.slice(0, 4) as product}
                <a 
                  href={getProductUrl(product)}
                  class="bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors"
                >
                  <div class="aspect-square rounded overflow-hidden mb-2">
                    <img 
                      src={product.images?.[0]?.image_url || '/placeholder-product.svg'} 
                      alt={product.title}
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <p class="text-xs font-medium text-gray-900 truncate">{product.title}</p>
                  <p class="text-xs font-bold text-gray-900">{formatPrice(product.price)}</p>
                </a>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Mobile Similar products section - Horizontal scroll -->
    <div class="lg:hidden">
      {#if data.similarProducts && data.similarProducts.length > 0}
        <div class="bg-white border-t border-gray-200 px-4 py-3">
          <div class="flex justify-between items-center mb-3">
            <h2 class="font-semibold text-base">{i18n.product_youMightLike()}</h2>
            {#if data.similarProducts.length > 4}
              <span class="text-xs text-gray-500">{data.similarProducts.length} items</span>
            {/if}
          </div>
          <div class="flex gap-3 overflow-x-auto scrollbar-hide -mx-2 px-2 pb-1">
            {#each data.similarProducts as product}
              <div class="w-40 shrink-0">
                <ProductCard 
                  product={{
                    ...product,
                    images: (product.images || []).map(img => img.image_url),
                    sellerName: product.seller_name,
                    sellerRating: product.seller_rating,
                    sellerAvatar: product.seller_avatar
                  }}
                  onclick={() => goto(getProductUrl(product))}
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
      
      <!-- More from seller section - Horizontal scroll -->
      {#if data.sellerProducts && data.sellerProducts.length > 0}
        <div class="bg-white border-t border-gray-200 px-4 py-3">
          <div class="flex justify-between items-center mb-3">
            <h2 class="font-semibold text-base">More from {data.product.seller_name}</h2>
            <a href="/profile/{data.product.seller_username || data.product.seller_id}" class="text-xs text-gray-600 font-medium hover:text-gray-900">
              View all →
            </a>
          </div>
          <div class="flex gap-3 overflow-x-auto scrollbar-hide -mx-2 px-2 pb-1">
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
                  onclick={() => goto(getProductUrl(product))}
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
  
  <!-- Mobile bottom action bar - Fixed at bottom -->
  <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 py-2.5 z-30 safe-area-bottom">
    <div class="flex gap-2">
      <Button 
        variant="outline" 
        onclick={handleMakeOffer}
        class="flex-1"
        size="md"
      >
        {i18n.product_makeOffer()}
      </Button>
      <Button 
        variant="primary" 
        onclick={handleBuyNow}
        class="flex-1"
        size="md"
      >
        {i18n.product_buyNow()}
      </Button>
    </div>
  </div>
</div>

<style>
  .scrollbar-hide {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>

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