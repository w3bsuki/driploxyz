<script lang="ts">
  import { 
    Button, 
    Avatar, 
    ProductCard, 
    Card, 
    Breadcrumb,
    ProductGallery,
    SellerCard
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
  
  let selectedImageIndex = $state(0);
  let isFavorited = $state(false);
  
  const productImages = $derived(
    data.product.images?.map(img => img.image_url) || ['/placeholder-product.svg']
  );


  const sellerData = $derived({
    id: data.product.seller_id,
    name: data.product.seller_name || 'Unknown Seller',
    username: data.product.seller_name, // seller_name contains the username from profiles table
    avatar: data.product.seller_avatar,
    stats: {
      rating: data.product.seller_rating || null,
      totalSales: 234,
      responseTime: 2,
      joinedDate: '2022-01-15',
      verificationLevel: 'verified' as const,
      lastActive: new Date(Date.now() - 3600000).toISOString()
    }
  });
  
  // Map category names to translation keys
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
  
  const breadcrumbItems = $derived([
    { label: i18n.nav_home(), href: '/' },
    { label: getCategoryTranslation(data.product.category_name) || i18n.search_categories(), href: `/category/${data.product.category_id}` },
    { label: data.product.title }
  ]);
  
  const conditionLabel = $derived({
    'new': i18n.product_newWithTags(),
    'like-new': i18n.product_likeNewCondition(),
    'good': i18n.product_goodCondition(),
    'fair': i18n.product_fairCondition()
  }[data.product.condition] || data.product.condition);
  
  const conditionColor = $derived({
    'new': 'bg-green-500',
    'like-new': 'bg-blue-500',
    'good': 'bg-yellow-500',
    'fair': 'bg-orange-500'
  }[data.product.condition] || 'bg-gray-500');
  
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return i18n.product_today();
    if (diffInDays === 1) return i18n.product_yesterday();
    if (diffInDays < 7) return `${diffInDays}${i18n.product_daysAgo()}`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}${i18n.product_weeksAgo()}`;
    return `${Math.floor(diffInDays / 30)}${i18n.product_monthsAgo()}`;
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
  <title>{data.product.title} - ${data.product.price} | Driplo</title>
  <meta name="description" content={data.product.description} />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <Header />
  
  <!-- Breadcrumb -->
  <div class="bg-white/80 backdrop-blur-xl border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <Breadcrumb items={breadcrumbItems} />
    </div>
  </div>
  
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32 lg:pb-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- Left Column - Enhanced Gallery -->
      <div class="lg:col-span-7">
        <div class="sticky top-6">
          <div class="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <ProductGallery 
              images={productImages}
              title={data.product.title}
              condition={data.product.condition}
              isAuthenticated={true}
              class="h-[500px] lg:h-[650px] rounded-xl overflow-hidden"
              translations={{
                new: i18n.product_newWithTags(),
                likeNew: i18n.product_likeNewCondition(),
                good: i18n.product_goodCondition(),
                fair: i18n.product_fairCondition()
              }}
            />
          </div>
        </div>
      </div>
      
      <!-- Right Column - Premium Details -->
      <div class="lg:col-span-5">
        <div class="space-y-6">
          
          <!-- Product Header -->
          <div class="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <!-- Price and Favorite -->
            <div class="flex items-start justify-between mb-4">
              <div>
                <span class="text-3xl font-bold text-gray-900">
                  {formatPrice(data.product.price)}
                </span>
                {#if data.product.shipping_price}
                  <p class="text-sm text-gray-500 mt-1">
                    + {formatPrice(data.product.shipping_price)} {i18n.product_shipping().toLowerCase()}
                  </p>
                {:else}
                  <p class="text-sm text-green-600 mt-1">
                    {i18n.product_freeShipping()}
                  </p>
                {/if}
              </div>
              <button
                onclick={handleFavorite}
                class="p-3 rounded-full backdrop-blur-md bg-white/80 border border-white/20 transition-all duration-200 hover:bg-white/90 {isFavorited ? 'text-red-500' : 'text-gray-600'}"
              >
                <svg class="w-5 h-5" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>
            </div>

            <!-- Brand and Title -->
            <div class="mb-4">
              {#if data.product.brand}
                <p class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">{data.product.brand}</p>
              {/if}
              <h1 class="text-2xl font-bold text-gray-900 leading-tight">{data.product.title}</h1>
            </div>
            
            <!-- Essential Tags -->
            <div class="flex flex-wrap gap-2 mb-6">
              {#if data.product.size}
                <span class="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                  {i18n.product_size()} {data.product.size}
                </span>
              {/if}
              <span class="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                {conditionLabel}
              </span>
              {#if data.product.color}
                <span class="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                  {data.product.color}
                </span>
              {/if}
            </div>

            <!-- Description -->
            {#if data.product.description}
              <div class="mb-6">
                <p class="text-gray-600 leading-relaxed">{data.product.description}</p>
              </div>
            {/if}
            
            <!-- Desktop Actions -->
            <div class="hidden lg:flex gap-3">
              <Button 
                variant="outline" 
                onclick={handleMessage}
                class="flex-1 h-12 font-medium"
              >
                {i18n.seller_message()}
              </Button>
              <Button 
                variant="outline"
                onclick={handleMakeOffer}
                class="flex-1 h-12 font-medium"
              >
                {i18n.product_makeOffer()}
              </Button>
              <Button 
                variant="primary" 
                onclick={handleBuyNow}
                class="flex-1 h-12 font-medium bg-black hover:bg-gray-800"
              >
                {i18n.product_buyNow()}
              </Button>
            </div>
          </div>
          
          <!-- Product Details -->
          <div class="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 class="font-semibold text-gray-900 mb-4">{i18n.product_itemDetails()}</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center py-2">
                <span class="text-gray-600">{i18n.product_condition()}</span>
                <span class="font-medium text-gray-900">{conditionLabel}</span>
              </div>
              {#if data.product.brand}
                <div class="flex justify-between items-center py-2">
                  <span class="text-gray-600">{i18n.product_brand()}</span>
                  <span class="font-medium text-gray-900">{data.product.brand}</span>
                </div>
              {/if}
              {#if data.product.size}
                <div class="flex justify-between items-center py-2">
                  <span class="text-gray-600">{i18n.product_size()}</span>
                  <span class="font-medium text-gray-900">{data.product.size}</span>
                </div>
              {/if}
              {#if data.product.color}
                <div class="flex justify-between items-center py-2">
                  <span class="text-gray-600">{i18n.filter_color()}</span>
                  <span class="font-medium text-gray-900">{data.product.color}</span>
                </div>
              {/if}
              <div class="flex justify-between items-center py-2">
                <span class="text-gray-600">{i18n.product_shipping()}</span>
                <span class="font-medium text-gray-900">
                  {#if data.product.shipping_price}
                    {formatPrice(data.product.shipping_price)}
                  {:else}
                    {i18n.product_freeShippingLower()}
                  {/if}
                </span>
              </div>
              <div class="flex justify-between items-center py-2 border-t border-gray-200">
                <span class="text-gray-600">{i18n.product_postedTime()}</span>
                <span class="font-medium text-gray-900">{formatDate(data.product.created_at)}</span>
              </div>
            </div>
          </div>
          
          <!-- Seller Card -->
          <SellerCard 
            id={sellerData.id}
            name={sellerData.name}
            avatar={sellerData.avatar}
            stats={sellerData.stats}
            onFollow={() => console.log('Follow seller')}
            onMessage={handleMessage}
            onViewProfile={() => goto(`/profile/${sellerData.username || sellerData.id}`)}
            showFullStats={false}
            translations={{
              soldBy: i18n.seller_soldBy(),
              message: i18n.seller_message(),
              follow: i18n.seller_follow(),
              following: i18n.seller_following(),
              viewFullProfile: i18n.seller_viewFullProfile(),
              sales: i18n.seller_sales(),
              activeNow: i18n.seller_activeNow(),
              activeAgo: i18n.seller_activeAgo(),
              memberFor: i18n.seller_memberFor(),
              newMember: i18n.seller_newMember(),
              trustedSeller: i18n.seller_trustedSeller(),
              superstarSeller: i18n.seller_superstarSeller(),
              verified: i18n.seller_verified(),
              positiveReviews: i18n.seller_positiveReviews(),
              avgShipping: i18n.seller_avgShipping(),
              recentActivity: i18n.seller_recentActivity()
            }}
          />
          
          
          
        </div>
      </div>
    </div>
  </div>
  
  <!-- Mobile Bottom Action Bar -->
  <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 px-4 py-4 z-30 shadow-lg">
    <div class="flex items-center justify-between mb-4">
      <div>
        <p class="text-2xl font-bold text-gray-900">{formatPrice(data.product.price)}</p>
        <p class="text-sm text-gray-600">
          {#if data.product.shipping_price}
            + {formatPrice(data.product.shipping_price)} {i18n.product_shipping().toLowerCase()}
          {:else}
            {i18n.product_freeShipping()}
          {/if}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          onclick={handleFavorite}
          class="p-3 rounded-full backdrop-blur-md bg-white/80 border border-white/20 transition-all duration-200 {isFavorited ? 'text-red-500' : 'text-gray-600'}"
        >
          <svg class="w-5 h-5" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>
        <button
          onclick={handleShare}
          class="p-3 rounded-full backdrop-blur-md bg-white/80 border border-white/20 transition-all duration-200 text-gray-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="flex gap-3">
      <Button 
        variant="outline" 
        onclick={handleMessage}
        class="flex-1 h-12 font-medium"
      >
        {i18n.seller_message()}
      </Button>
      <Button 
        variant="outline" 
        onclick={handleMakeOffer}
        class="flex-1 h-12 font-medium"
      >
        {i18n.product_makeOffer()}
      </Button>
      <Button 
        variant="primary" 
        onclick={handleBuyNow}
        class="flex-1 h-12 font-medium bg-black hover:bg-gray-800"
      >
        {i18n.product_buyNow()}
      </Button>
    </div>
  </div>
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 lg:pb-8">
    
    <!-- Similar Products -->
    {#if data.similarProducts && data.similarProducts.length > 0}
      <div class="mt-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">{i18n.product_youMightLike()}</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {#each data.similarProducts.slice(0, 6) as product}
            <ProductCard 
              product={{
                ...product,
                images: product.images.map(img => img.image_url),
                sellerName: product.seller_name,
                sellerRating: product.seller_rating,
                sellerAvatar: product.seller_avatar
              }}
              onclick={() => goto(`/product/${product.id}`)}
              class="hover:shadow-lg transition-shadow"
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
                fair: i18n.product_fair()
              }}
            />
          {/each}
        </div>
      </div>
    {/if}
    
    <!-- More from Seller -->
    {#if data.sellerProducts && data.sellerProducts.length > 0}
      <div class="mt-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900">{i18n.product_moreFromSeller()} {data.product.seller_name}</h2>
          <a href="/profile/{data.product.seller_id}" class="text-sm text-blue-600 hover:underline">
            {i18n.product_viewAll()} →
          </a>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {#each data.sellerProducts.slice(0, 6) as product}
            <ProductCard 
              product={{
                ...product,
                images: product.images.map(img => img.image_url),
                sellerName: product.seller_name,
                sellerRating: product.seller_rating,
                sellerAvatar: product.seller_avatar
              }}
              onclick={() => goto(`/product/${product.id}`)}
              class="hover:shadow-lg transition-shadow"
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
                fair: i18n.product_fair()
              }}
            />
          {/each}
        </div>
      </div>
    {/if}
  </div>
  
</div>