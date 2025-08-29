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
  let isLiking = $state(false);
  let showShareMenu = $state(false);
  let viewCount = $state(data.product.view_count || 0);
  
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
    
    // Real Instagram-style time formatting
    if (diffInSeconds < 30) return 'now';
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w`;
    
    // For older posts, show actual date
    const months = Math.floor(diffInSeconds / 2592000);
    if (months < 12) return `${months}mo`;
    
    // Show actual date for posts older than 1 year
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  
  async function handleFavorite() {
    if (!data.user) {
      goto('/login');
      return;
    }
    
    // Instagram-style immediate feedback
    isLiking = true;
    const wasLiked = isFavorited;
    isFavorited = !isFavorited;
    
    try {
      const response = await fetch(`/api/favorites/${data.product.id}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to update favorite');
        isFavorited = wasLiked; // Revert on error
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
      // Show Instagram-style share menu
      showShareMenu = true;
      navigator.clipboard.writeText(window.location.href);
      // Auto-hide after 2 seconds
      setTimeout(() => {
        showShareMenu = false;
      }, 2000);
    }
  }
  
  function handleDoubleTap(event: Event) {
    // Instagram-style double-tap to like
    event.preventDefault();
    if (!isFavorited) {
      handleFavorite();
      // Show heart animation
      const heart = document.createElement('div');
      heart.innerHTML = '❤️';
      heart.className = 'fixed pointer-events-none text-6xl z-50 animate-ping';
      heart.style.left = '50%';
      heart.style.top = '50%';
      heart.style.transform = 'translate(-50%, -50%)';
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 1000);
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

<!-- Instagram-style App -->
<div class="min-h-screen bg-gray-100">
  <!-- Instagram-style Header -->
  <div class="bg-white border-b border-gray-200 sticky z-20 shadow-sm" style="top: var(--app-header-offset, 56px);">
    <div class="max-w-md mx-auto px-4 py-3">
      <nav class="flex items-center gap-3">
        <button onclick={() => history.back()} class="p-1 -m-1 hover:text-gray-900 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <span class="flex-1 text-center font-semibold text-gray-900 truncate">{data.product.title}</span>
        <button onclick={handleShare} class="p-1 -m-1 hover:text-gray-900 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
        </button>
      </nav>
    </div>
  </div>

  <!-- Instagram-style Post Feed -->
  <div class="max-w-md mx-auto pb-20">
    <!-- Social Post Card -->
    <div class="bg-white">
      
      <!-- Instagram-style Seller Header -->
      <div class="p-3">
        <a href="/profile/{data.product.seller_username || data.product.seller_id}" class="flex items-center gap-3">
          <Avatar 
            src={data.product.seller_avatar} 
            alt={data.product.seller_name}
            size="sm"
            fallback={data.product.seller_name?.[0]?.toUpperCase() || 'S'}
          />
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <p class="text-sm font-semibold text-gray-900">{data.product.seller_name}</p>
              {#if data.product.seller_rating >= 4.5}
                <svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.238.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              {/if}
            </div>
            <p class="text-xs text-gray-500">{data.product.location || 'Online'} • {getRelativeTime(data.product.created_at)}</p>
          </div>
          <button class="text-gray-500 hover:text-gray-700 p-1 -m-1">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
            </svg>
          </button>
        </a>
      </div>

      <!-- Instagram-style Framed Image -->
      <div class="bg-white p-4" ondblclick={handleDoubleTap}>
        <div class="aspect-square bg-black relative rounded-lg overflow-hidden shadow-lg">
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
          
          <!-- Price Tag Overlay -->
          <div class="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold">
            {formatPrice(data.product.price)}
          </div>
          
          <!-- Status Badge -->
          {#if data.product.is_sold}
            <div class="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
              SOLD
            </div>
          {:else}
            <div class="absolute top-3 left-3 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
              AVAILABLE
            </div>
          {/if}
        </div>
      </div>

      <!-- Instagram-style Action Bar -->
      <div class="p-3">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-4">
            <button 
              onclick={handleFavorite}
              disabled={!data.user || isLiking}
              class="p-1 -m-1 transition-all duration-200 {isLiking ? 'scale-125' : 'active:scale-95 hover:scale-105'}"
              aria-label="{isFavorited ? 'Remove from favorites' : 'Add to favorites'}"
            >
              <svg 
                class="w-7 h-7 {isFavorited ? 'text-red-500 drop-shadow-sm' : 'text-gray-900'} transition-all duration-200 {isLiking ? 'animate-pulse' : ''}" 
                fill={isFavorited ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                stroke-width="{isFavorited ? '0' : '2'}"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
            
            <button onclick={handleMessage} class="p-1 -m-1 transition-all duration-200 active:scale-95 hover:scale-105 hover:rotate-12">
              <svg class="w-7 h-7 text-gray-900 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </button>
            
            <button onclick={handleShare} class="p-1 -m-1 transition-all duration-200 active:scale-95 hover:scale-105 hover:-rotate-12 relative">
              <svg class="w-7 h-7 text-gray-900 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
              {#if showShareMenu}
                <div class="absolute -top-8 -left-8 bg-black text-white text-xs px-2 py-1 rounded-full animate-bounce">
                  Copied!
                </div>
              {/if}
            </button>
          </div>
          
          <!-- Quick Buy Button -->
          {#if !data.product.is_sold}
            <button onclick={handleBuyNow} class="px-4 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full hover:bg-blue-600 transition-colors">
              Buy Now
            </button>
          {/if}
        </div>
        
        <!-- Likes count with Instagram-style animation -->
        <p class="text-sm font-semibold text-gray-900 mb-2 transition-all duration-300">
          {#if viewCount > 0}
            <span class="hover:underline cursor-pointer">{viewCount.toLocaleString()} {viewCount === 1 ? 'like' : 'likes'}</span>
          {:else}
            Be the first to like this
          {/if}
        </p>
        
        <!-- Caption -->
        <div class="text-sm text-gray-900 leading-relaxed">
          <span class="font-semibold">{data.product.seller_name}</span>
          <span class="ml-2">{data.product.title}</span>
          {#if data.product.description}
            <p class="text-gray-700 mt-1 text-sm leading-relaxed">{data.product.description}</p>
          {/if}
        </div>
        
        <!-- Product details as hashtags with Instagram-style interactions -->
        <div class="flex flex-wrap gap-1 mt-3 text-sm">
          {#if data.product.brand}
            <span class="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-all active:scale-95">#{data.product.brand.toLowerCase().replace(/\s+/g, '')}</span>
          {/if}
          {#if data.product.size}
            <span class="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-all active:scale-95">#{data.product.size.toLowerCase().replace(/\s+/g, '')}</span>
          {/if}
          <span class="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-all active:scale-95">#{conditionLabel.toLowerCase().replace(/\s+/g, '')}</span>
          <span class="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-all active:scale-95">#{getCategoryTranslation(data.product.category_name).toLowerCase().replace(/\s+/g, '')}</span>
          <span class="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-all active:scale-95">#vintage</span>
          <span class="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-all active:scale-95">#thrifted</span>
          <span class="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-all active:scale-95">#sustainable</span>
        </div>
        
        <!-- Time since posted - Real Instagram style -->
        <p class="text-xs text-gray-400 mt-2 font-normal">{getRelativeTime(data.product.created_at)}</p>
      </div>
    </div>
    
    <!-- Similar Products - Instagram Stories Style -->
    {#if data.similarProducts && data.similarProducts.length > 0}
      <div class="bg-white mt-1 py-4 border-t border-gray-100">
        <div class="px-3 mb-3">
          <h3 class="font-semibold text-sm text-gray-900">You might also like</h3>
        </div>
        <div class="flex gap-4 overflow-x-auto scrollbar-hide px-3">
          {#each data.similarProducts.slice(0, 10) as product}
            <a href={getProductUrl(product)} class="shrink-0 transition-transform active:scale-95 hover:scale-105">
              <div class="w-20 h-20 rounded-2xl border-2 border-gray-200 overflow-hidden mb-2 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                <img 
                  src={product.images?.[0]?.image_url || '/placeholder-product.svg'} 
                  alt={product.title}
                  class="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                />
              </div>
              <p class="text-xs text-center text-gray-600 font-medium w-20 truncate">{formatPrice(product.price)}</p>
            </a>
          {/each}
        </div>
      </div>
    {/if}
    
    <!-- More from Seller - Instagram Stories Style -->
    {#if data.sellerProducts && data.sellerProducts.length > 0}
      <div class="bg-white mt-1 py-4 border-t border-gray-100">
        <div class="px-3 mb-3">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-sm text-gray-900">More from {data.product.seller_name}</h3>
            <a href="/profile/{data.product.seller_username || data.product.seller_id}" class="text-xs text-blue-600 font-medium hover:text-blue-700">
              View all
            </a>
          </div>
        </div>
        <div class="flex gap-4 overflow-x-auto scrollbar-hide px-3">
          {#each data.sellerProducts.slice(0, 10) as product}
            <a href={getProductUrl(product)} class="shrink-0 transition-transform active:scale-95 hover:scale-105">
              <div class="w-20 h-20 rounded-2xl border-2 border-gray-200 overflow-hidden mb-2 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                <img 
                  src={product.images?.[0]?.image_url || '/placeholder-product.svg'} 
                  alt={product.title}
                  class="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                />
              </div>
              <p class="text-xs text-center text-gray-600 font-medium w-20 truncate">{formatPrice(product.price)}</p>
            </a>
          {/each}
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Instagram-style Bottom Bar -->
  <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-bottom">
    <div class="max-w-md mx-auto px-4 py-3">
      {#if !data.product.is_sold && data.product.seller_id !== data.user?.id}
        <div class="flex gap-3">
          <button 
            onclick={handleMakeOffer}
            class="flex-1 min-h-[44px] bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 hover:scale-105 transition-all active:scale-95 shadow-md hover:shadow-lg"
          >
            💬 Make Offer
          </button>
          <button 
            onclick={handleBuyNow}
            class="flex-1 min-h-[44px] bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            🛍️ Buy {formatPrice(data.product.price)}
          </button>
        </div>
      {:else if data.product.is_sold}
        <button 
          disabled
          class="w-full min-h-[44px] bg-gray-100 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
        >
          Sold Out
        </button>
      {/if}
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
