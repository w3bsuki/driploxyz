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
    avatar: data.product.seller_avatar,
    stats: {
      rating: data.product.seller_rating || 4.8,
      totalSales: 234,
      responseTime: 2,
      joinedDate: '2022-01-15',
      verificationLevel: 'verified' as const,
      lastActive: new Date(Date.now() - 3600000).toISOString()
    }
  });
  
  const breadcrumbItems = $derived([
    { label: 'Home', href: '/' },
    { label: data.product.category_name || 'Category', href: `/category/${data.product.category_id}` },
    { label: data.product.title }
  ]);
  
  const conditionLabel = $derived({
    'new': 'New with tags',
    'like-new': 'Like new',
    'good': 'Good',
    'fair': 'Fair'
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
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return 'yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    return `${Math.floor(diffInDays / 30)}mo ago`;
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
  <div class="bg-white border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <Breadcrumb items={breadcrumbItems} />
    </div>
  </div>
  
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-32 lg:pb-6">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Left Column - Enhanced Gallery -->
      <div class="lg:col-span-7">
        <div class="sticky top-4">
          <div class="bg-white rounded-xl p-4">
            <ProductGallery 
              images={productImages}
              title={data.product.title}
              condition={data.product.condition}
              isAuthenticated={true}
              class="h-[500px] lg:h-[600px] rounded-lg overflow-hidden"
            />
          </div>
        </div>
      </div>
      
      <!-- Right Column - Premium Details -->
      <div class="lg:col-span-5">
        <div class="space-y-6">
          
          <!-- Product Header -->
          <div class="bg-white rounded-xl p-4">
            <div class="mb-3">
              {#if data.product.brand}
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{data.product.brand}</p>
              {/if}
              <h1 class="text-xl font-bold text-gray-900 leading-tight">{data.product.title}</h1>
            </div>
            
            <!-- Essential Tags -->
            <div class="flex flex-wrap gap-1.5 mb-4">
              {#if data.product.size}
                <span class="px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                  Size {data.product.size}
                </span>
              {/if}
              <span class="px-2 py-1 rounded text-xs font-medium {conditionColor} text-white">
                {conditionLabel}
              </span>
              {#if data.product.color}
                <span class="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                  {data.product.color}
                </span>
              {/if}
            </div>

            <!-- Description -->
            {#if data.product.description}
              <div class="mb-4">
                <p class="text-gray-600 text-sm leading-relaxed">{data.product.description}</p>
              </div>
            {/if}
            
            <!-- Desktop Actions -->
            <div class="hidden lg:flex gap-2">
              <Button 
                variant="outline" 
                onclick={handleMessage}
                class="flex-1 h-10 text-sm"
              >
                Message
              </Button>
              <Button 
                variant="outline"
                onclick={handleMakeOffer}
                class="flex-1 h-10 text-sm"
              >
                Make offer
              </Button>
              <Button 
                variant="primary" 
                onclick={handleBuyNow}
                class="flex-1 h-10 text-sm"
              >
                Buy now
              </Button>
            </div>
          </div>
          
          <!-- Product Details -->
          <div class="bg-white rounded-xl p-4">
            <h3 class="font-medium text-gray-900 mb-3 text-sm">Item details</h3>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-gray-500 text-sm">Condition</span>
                <span class="font-medium text-sm">{conditionLabel}</span>
              </div>
              {#if data.product.brand}
                <div class="flex justify-between items-center">
                  <span class="text-gray-500 text-sm">Brand</span>
                  <span class="font-medium text-sm">{data.product.brand}</span>
                </div>
              {/if}
              {#if data.product.size}
                <div class="flex justify-between items-center">
                  <span class="text-gray-500 text-sm">Size</span>
                  <span class="font-medium text-sm">{data.product.size}</span>
                </div>
              {/if}
              {#if data.product.color}
                <div class="flex justify-between items-center">
                  <span class="text-gray-500 text-sm">Color</span>
                  <span class="font-medium text-sm">{data.product.color}</span>
                </div>
              {/if}
              <div class="flex justify-between items-center">
                <span class="text-gray-500 text-sm">Shipping</span>
                <span class="font-medium text-sm">
                  {#if data.product.shipping_price}
                    ${data.product.shipping_price}
                  {:else}
                    Free
                  {/if}
                </span>
              </div>
              <div class="flex justify-between items-center border-t pt-2 mt-2">
                <span class="text-gray-500 text-sm">Posted</span>
                <span class="font-medium text-sm">{formatDate(data.product.created_at)}</span>
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
            onViewProfile={() => goto(`/profile/${sellerData.id}`)}
            showFullStats={false}
          />
          
          
          
        </div>
      </div>
    </div>
  </div>
  
  <!-- Mobile Bottom Action Bar -->
  <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-30">
    <div class="flex items-center justify-between mb-2">
      <div>
        <p class="text-2xl font-bold text-gray-900">${data.product.price}</p>
        <p class="text-sm text-gray-600">
          {#if data.product.shipping_price}
            + ${data.product.shipping_price} shipping
          {:else}
            Free shipping
          {/if}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          onclick={handleFavorite}
          class="p-2 rounded-full {isFavorited ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600'} transition-colors"
        >
          <svg class="w-5 h-5" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>
        <button
          onclick={handleShare}
          class="p-2 rounded-full bg-gray-100 text-gray-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="flex gap-2">
      <Button 
        variant="outline" 
        onclick={handleMessage}
        class="flex-1 h-11 text-sm font-medium"
      >
        Message
      </Button>
      <Button 
        variant="outline" 
        onclick={handleMakeOffer}
        class="flex-1 h-11 text-sm font-medium"
      >
        Make offer
      </Button>
      <Button 
        variant="primary" 
        onclick={handleBuyNow}
        class="flex-1 h-11 text-sm font-medium"
      >
        Buy now
      </Button>
    </div>
  </div>
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 lg:pb-8">
    
    <!-- Similar Products -->
    {#if data.similarProducts && data.similarProducts.length > 0}
      <div class="mt-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">You might also like</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {#each data.similarProducts.slice(0, 6) as product}
            <ProductCard 
              product={{
                ...product,
                images: product.images.map(img => img.image_url),
                sellerName: product.seller_name,
                sellerRating: product.seller_rating
              }}
              onclick={() => goto(`/product/${product.id}`)}
              class="hover:shadow-lg transition-shadow"
            />
          {/each}
        </div>
      </div>
    {/if}
    
    <!-- More from Seller -->
    {#if data.sellerProducts && data.sellerProducts.length > 0}
      <div class="mt-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900">More from {data.product.seller_name}</h2>
          <a href="/profile/{data.product.seller_id}" class="text-sm text-blue-600 hover:underline">
            View all →
          </a>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {#each data.sellerProducts.slice(0, 6) as product}
            <ProductCard 
              product={{
                ...product,
                images: product.images.map(img => img.image_url),
                sellerName: product.seller_name,
                sellerRating: product.seller_rating
              }}
              onclick={() => goto(`/product/${product.id}`)}
              class="hover:shadow-lg transition-shadow"
            />
          {/each}
        </div>
      </div>
    {/if}
  </div>
  
</div>