<script lang="ts">
  import { 
    Button, 
    Avatar, 
    ProductCard,
    ProductGallery,
    ProductDetailSkeleton,
    ProductCardSkeleton
  } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import * as i18n from '@repo/i18n';
  import { formatPrice } from '$lib/utils/price';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  let isFavorited = $state(false);
  let showFullDescription = $state(false);
  
  const productImages = $derived(
    data.product.images || []
  );
  
  function getCategoryTranslation(categoryName: string) {
    const categoryMap: Record<string, () => string> = {
      'Women': () => i18n.category_women(),
      'Men': () => i18n.category_men(),
      'Kids': () => i18n.category_kids(),
      'Pets': () => i18n.category_pets(),
      'Shoes': () => i18n.category_shoes(),
      'Bags': () => i18n.category_bags(),
      'Home': () => i18n.category_home(),
      'Beauty': () => i18n.category_beauty()
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
    isFavorited = !isFavorited;
  }
  
  async function handleBuyNow() {
    if (!data.user) {
      goto('/login');
      return;
    }
    goto(`/checkout/${data.product.id}`);
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

<svelte:head>
  <title>{data.product.title} - ${formatPrice(data.product.price)} | Driplo</title>
  <meta name="description" content={data.product.description} />
</svelte:head>

<div class="min-h-screen bg-white">
  <Header showSearch={true} />
  
  <!-- Breadcrumb -->
  <div class="px-4 lg:px-8 py-3 max-w-7xl mx-auto">
    <div class="flex items-center gap-2 text-sm text-gray-600">
      <a href="/" class="hover:text-black transition-colors">Home</a>
      <span>›</span>
      <a href="/category/{data.product.category_id}" class="hover:text-black transition-colors">
        {getCategoryTranslation(data.product.category_name)}
      </a>
      <span>›</span>
      <span class="text-black truncate max-w-[200px]">{data.product.title}</span>
    </div>
  </div>
  
  <div class="lg:grid lg:grid-cols-2 lg:gap-8 max-w-7xl mx-auto">
    <!-- Gallery - Highlight style with borders -->
    <div class="lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] px-4 lg:px-0">
      <ProductGallery 
        images={productImages}
        title={data.product.title}
        condition={data.product.condition}
        isAuthenticated={!!data.user}
        class="w-full h-[65vh] lg:h-full"
        translations={{
          new: i18n.product_newWithTags(),
          likeNew: i18n.product_likeNewCondition(),
          good: i18n.product_goodCondition(),
          fair: i18n.product_fairCondition()
        }}
      />
    </div>
    
    <!-- Info section - clean, no containers -->
    <div class="px-4 lg:px-8 py-6 lg:py-8 pb-32 lg:pb-8">
      <!-- Title on same row as wishlist/share buttons -->
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-xl font-semibold">{data.product.title}</h1>
        <div class="flex gap-2">
          <button
            onclick={handleFavorite}
            class="p-2.5 rounded-full hover:bg-gray-50 transition-all {isFavorited ? 'text-red-500' : 'text-gray-400'}"
            aria-label="{isFavorited ? 'Remove from favorites' : 'Add to favorites'}"
          >
            <svg class="w-6 h-6" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
          <button
            onclick={handleShare}
            class="p-2.5 rounded-full hover:bg-gray-50 transition-all text-gray-400"
            aria-label="Share this product"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Brand and price -->
      <div class="mb-4">
        {#if data.product.brand}
          <p class="text-sm text-gray-600 mb-1">{data.product.brand}</p>
        {/if}
        <div class="hidden lg:block">
          <p class="text-3xl font-bold">{formatPrice(data.product.price)}</p>
          {#if data.product.shipping_price}
            <p class="text-sm text-gray-600 mt-1">
              + {formatPrice(data.product.shipping_price)} shipping
            </p>
          {:else if data.product.shipping_price === 0}
            <p class="text-sm text-green-600 mt-1">Free shipping</p>
          {/if}
        </div>
      </div>
      
      <!-- Quick info chips -->
      <div class="flex flex-wrap gap-2 mb-5">
        {#if data.product.size}
          <span class="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm font-medium">
            Size {data.product.size}
          </span>
        {/if}
        <span class="px-3 py-1 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm font-medium">
          {conditionLabel}
        </span>
        {#if data.product.color}
          <span class="px-3 py-1 bg-purple-50 border border-purple-200 text-purple-800 rounded-lg text-sm font-medium">
            {data.product.color}
          </span>
        {/if}
      </div>
      
      <!-- Seller strip -->
      <div class="py-4 border-t border-gray-100 mb-5">
        <a href="/profile/{data.product.seller_username || data.product.seller_id}" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Avatar 
            src={data.product.seller_avatar} 
            alt={data.product.seller_name}
            size="md"
            fallback={data.product.seller_name?.[0] || '?'}
          />
          <div>
            <p class="font-semibold text-sm">{data.product.seller_name}</p>
            <div class="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
              {#if data.product.seller_rating}
                <span class="flex items-center gap-1">
                  <svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  {data.product.seller_rating.toFixed(1)}
                </span>
              {/if}
              {#if data.product.seller_sales_count}
                <span>• {data.product.seller_sales_count} sales</span>
              {/if}
            </div>
          </div>
        </a>
      </div>
      
      <!-- Description -->
      {#if data.product.description}
        <div class="mb-5">
          <h3 class="font-medium text-sm uppercase tracking-wide text-gray-500 mb-2">Description</h3>
          <p class="text-gray-600 text-sm leading-relaxed {!showFullDescription ? 'line-clamp-3' : ''}">
            {data.product.description}
          </p>
          {#if data.product.description.length > 150}
            <button 
              onclick={() => showFullDescription = !showFullDescription}
              class="text-sm text-black font-medium mt-2"
              aria-label="{showFullDescription ? 'Show less description' : 'Show more description'}"
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </button>
          {/if}
        </div>
      {/if}
      
      <!-- Item details -->
      <div class="space-y-2.5 text-sm mb-6 py-4 border-t border-gray-100">
        <div class="flex justify-between">
          <span class="text-gray-600">Category</span>
          <span>{getCategoryTranslation(data.product.category_name)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Listed</span>
          <span>{formatDate(data.product.created_at)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Views</span>
          {#if data.product.view_count}
            <span class="flex items-center gap-1">
              <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              {data.product.view_count} views
            </span>
          {:else}
            <span class="text-gray-500">No views data</span>
          {/if}
        </div>
      </div>
      
      <!-- Desktop action buttons -->
      <div class="hidden lg:flex gap-3">
        <Button 
          variant="outline" 
          onclick={handleMakeOffer}
          class="flex-1"
        >
          Make Offer
        </Button>
        <Button 
          variant="primary" 
          onclick={handleBuyNow}
          class="flex-1"
        >
          Buy Now
        </Button>
      </div>
      
      <!-- Similar products -->
      {#if data.similarProducts && data.similarProducts.length > 0}
        <div class="mt-12">
          <h2 class="font-semibold mb-4">You might also like</h2>
          <div class="grid grid-cols-2 gap-3">
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
      
      <!-- More from seller -->
      {#if data.sellerProducts && data.sellerProducts.length > 0}
        <div class="mt-8">
          <div class="flex justify-between items-center mb-4">
            <h2 class="font-semibold">More from {data.product.seller_name}</h2>
            <a href="/profile/{data.product.seller_username || data.product.seller_id}" class="text-sm text-black font-medium">
              View all →
            </a>
          </div>
          <div class="grid grid-cols-2 gap-3">
            {#each data.sellerProducts.slice(0, 4) as product}
              <ProductCard 
                product={{
                  ...product,
                  images: (product.images || []).map(img => img.image_url),
                  sellerName: product.seller_name,
                  sellerRating: product.seller_rating,
                  sellerAvatar: product.seller_avatar
                }}
                onclick={() => goto(`/product/${product.id}`)}
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
    </div>
  </div>
  
  <!-- Mobile bottom action bar - keep this perfect as is -->
  <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 z-30">
    <div class="flex items-center justify-between mb-3">
      <div>
        <p class="text-2xl font-bold">{formatPrice(data.product.price)}</p>
        <p class="text-xs text-gray-600">
          {#if data.product.shipping_price}
            + {formatPrice(data.product.shipping_price)} shipping
          {:else if data.product.shipping_price === 0}
            Free shipping
          {/if}
        </p>
      </div>
    </div>
    <div class="flex gap-2">
      <Button 
        variant="outline" 
        onclick={handleMessage}
        class="flex-1"
      >
        Message
      </Button>
      <Button 
        variant="outline" 
        onclick={handleMakeOffer}
        class="flex-1"
      >
        Offer
      </Button>
      <Button 
        variant="primary" 
        onclick={handleBuyNow}
        class="flex-1"
      >
        Buy Now
      </Button>
    </div>
  </div>
</div>