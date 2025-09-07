<script lang="ts">
  // @ts-nocheck
  import { onMount } from 'svelte';
  // @ts-ignore Typed via svelte compiler
  import ProductBreadcrumb from './ProductBreadcrumb.svelte';
  // @ts-ignore Typed via svelte compiler
  import ProductActionBar from './ProductActionBar.svelte';
  // @ts-ignore Typed via svelte compiler
  import ProductGallery from './ProductGallery.svelte';
  // @ts-ignore Typed via svelte compiler
  import ProductInfo from './ProductInfo.svelte';
  // @ts-ignore Typed via svelte compiler
  import SellerCard from './SellerCard.svelte';
  import * as i18n from '@repo/i18n';
  const m: any = i18n;
  
  interface ProductData {
    id: string;
    title: string;
    description: string | null;
    price: number;
    currency: string;
    brand?: string | null;
    condition: string;
    size?: string | null;
    color?: string | null;
    material?: string | null;
    images: string[];
    is_sold: boolean | null;
    favorite_count: number;
    view_count?: number; // added for UI usage
    categories?: { id?: string; name?: string; slug?: string; parent_id?: string | null };
    parent_category?: { name?: string; slug?: string } | null;
    seller: {
      id: string;
      username: string | null;
      full_name?: string | null;
      avatar_url?: string | null;
      rating?: number | null;
      bio?: string | null;
      created_at: string | null;
      sales_count?: number | null;
    };
  }

  interface ReviewData {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string | null;
    reviewer?: {
      id: string;
      username: string | null;
      avatar_url?: string | null;
    };
    reviewer_name?: string;
  }

  interface Props {
    product: ProductData;
    reviews?: ReviewData[];
    ratingSummary?: {
      averageRating: number;
      totalReviews: number;
    } | null;
    similarProducts?: any[];
    sellerProducts?: any[];
    isOwner?: boolean;
    isAuthenticated?: boolean;
    isFavorited?: boolean;
    onFavorite?: () => Promise<{favoriteCount: number, favorited: boolean} | undefined> | void;
    onMessage?: () => void;
    onBuyNow?: () => void;
    onMakeOffer?: () => void;
    onNavigate?: (url: string) => void;
    showQuickFacts?: boolean;
  }

  let { 
    product, 
    reviews = [], 
    ratingSummary, 
    similarProducts = [], 
    sellerProducts = [],
    isOwner = false,
    isAuthenticated = false,
    isFavorited = false,
    onFavorite,
    onMessage,
    onBuyNow,
    onMakeOffer,
    onNavigate,
    showQuickFacts = true
  }: Props = $props();

  // State management
  let isLiked = $state(isFavorited);
  let likeCount = $state(product?.favorite_count || 0);
  let scrollY = $state(0);
  let sellerExpanded = $state(false);

  // Scroll tracking for header visibility
  onMount(() => {
    function handleScroll() {
      scrollY = window.scrollY;
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });

  // Derived values
  const headerVisible = $derived(scrollY > 100);
  const displayName: string = $derived((product?.seller?.full_name ?? product?.seller?.username) ?? m.profile_anonymous());
  
  const breadcrumbCategory = $derived((() => {
    const c = product?.categories;
    if (!c || !c.slug) return null;
    return {
      id: (c.id ?? c.slug) as string,
      name: (c.name ?? '') as string,
      slug: c.slug as string,
      parent_id: (c.parent_id ?? null) as string | null
    };
  })());
  
  const breadcrumbParentCategory = $derived((() => {
    const p = product?.parent_category;
    if (!p || !p.slug) return null;
    return {
      id: p.slug as string,
      name: (p.name ?? '') as string,
      slug: p.slug as string,
      parent_id: null as string | null
    };
  })());

  const displayRating = $derived(ratingSummary?.averageRating || product?.seller?.rating || 0);
  const reviewCount = $derived(ratingSummary?.totalReviews || reviews.length || 0);
  
  // SellerCard data mapping
  const sellerStats = $derived({
    rating: displayRating,
    totalSales: product?.seller?.sales_count || 0,
    responseTime: 24,
    joinedDate: product?.seller?.created_at || new Date().toISOString(),
    verificationLevel: 'basic' as const,
    lastActive: 'recently'
  });

  // Handle favorite toggle
  async function toggleLike() {
    const previousLiked = isLiked;
    const previousCount = likeCount;
    
    // Optimistic update
    isLiked = !isLiked;
    likeCount += isLiked ? 1 : -1;
    
    if (onFavorite) {
      try {
        const result = await onFavorite();
        if (result && typeof result.favoriteCount === 'number' && typeof result.favorited === 'boolean') {
          // Reconcile with server response
          likeCount = result.favoriteCount;
          isLiked = result.favorited;
        }
      } catch (error) {
        // Revert optimistic update on error
        isLiked = previousLiked;
        likeCount = previousCount;
        console.error('Error toggling favorite:', error);
      }
    }
  }

  function handleBuyNow() {
    onBuyNow?.();
  }

  function viewProfile() {
    if (product?.seller) {
      const username = product.seller.username;
      const profileUrl = username ? `/profile/${username}` : `/profile/${product.seller.id}`;
      onNavigate?.(profileUrl);
    }
  }


  // Price formatting function
  function formatPrice(price: number): string {
    const locale = i18n.getLocale();
    
    if (locale === 'bg') {
      const roundedPrice = price % 1 === 0 ? Math.round(price) : price.toFixed(2);
      return `${roundedPrice}лв`;
    }
    
    if (locale === 'en') {
      try {
        return new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: 'GBP',
          minimumFractionDigits: price % 1 === 0 ? 0 : 2,
          maximumFractionDigits: 2
        }).format(price);
      } catch (error) {
        return `£${price}`;
      }
    }
    
    return `€${price}`;
  }

  function translateCondition(condition: string): string {
    const map: Record<string, string> = {
      brand_new_with_tags: m.product_newWithTags?.() ?? 'New with tags',
      brand_new_without_tags: m.sell_condition_newWithoutTags?.() ?? 'New without tags',
      like_new: m.product_likeNew?.() ?? 'Like new',
      good: m.product_good?.() ?? 'Good',
      worn: m.sell_condition_worn?.() ?? 'Worn',
      fair: m.product_fair?.() ?? 'Fair'
    };
    return map[condition] || condition;
  }
</script>

<main class="product-page">
  <!-- Skip Links -->

  <!-- Fixed Header (on scroll) -->
  <header class="fixed-header {headerVisible ? 'visible' : ''}" aria-hidden={!headerVisible}>
    <div class="header-content container">
      <div class="header-left">
        <h1 class="header-title">{product?.title || ''}</h1>
        <div class="header-meta">
          {#if product?.brand}
            <span class="meta-item">{product.brand}</span>
          {/if}
          {#if product?.size}
            <span class="meta-item">{m.product_size()}: {product.size}</span>
          {/if}
          {#if product?.condition}
            <span class="meta-item">{translateCondition(product.condition)}</span>
          {/if}
        </div>
      </div>
      <div class="header-right">
        <button class="header-fav" type="button" onclick={toggleLike} aria-label={isLiked ? m.removeFavorite() : m.addFavorite()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span>{likeCount}</span>
        </button>
      </div>
    </div>
  </header>

  <div class="container">
    <nav class="breadcrumb-row" aria-label="Breadcrumb">
      <ProductBreadcrumb
        category={breadcrumbCategory}
        parentCategory={breadcrumbParentCategory}
        productTitle={product?.title || ''}
      />
    </nav>

    <!-- Unified product container -->
    <section class="product-shell" aria-labelledby="product-title">
      <div class="product-card">
        <div class="product-gallery">
          <ProductGallery
            images={product?.images || []}
            title={product?.title || ''}
            isSold={product?.is_sold || false}
            likeCount={likeCount}
            isLiked={isLiked}
            onLike={toggleLike}
            onImageSelect={(index: number) => console.log('Image selected:', index)}
            condition={product?.condition as any}
          />
        </div>
        <div class="product-content" id="product-info">
          <ProductInfo
            title={product?.title || ''}
            brand={product?.brand || undefined}
            size={product?.size || undefined}
            color={product?.color || undefined}
            material={product?.material || undefined}
            description={product?.description || undefined}
            favoriteCount={likeCount}
            isFavorited={isLiked}
            onFavorite={toggleLike}
            showQuickFacts={showQuickFacts}
            category={product?.categories?.name || undefined}
          />
        </div>
        <div class="product-seller">
          <SellerCard 
            id={product?.seller?.id || ''}
            name={displayName}
            avatar={product?.seller?.avatar_url || undefined}
            stats={sellerStats}
            onMessage={onMessage}
            onViewProfile={viewProfile}
            translations={{
              soldBy: 'Sold by',
              message: 'Message',
              viewFullProfile: 'View profile',
              sales: 'sales',
              memberFor: 'Member for',
              newMember: 'New member'
            }}
          />
        </div>
      </div>
    </section>

    <!-- Recommendations -->
    {#if similarProducts && similarProducts.length > 0}
      <section class="section-block">
        <h3 class="section-title">{m.pdp_similarItems()}</h3>
        <div class="products-grid">
          {#each similarProducts.slice(0, 8) as similarProduct}
            <a 
              class="product-card" 
              href={similarProduct.canonicalUrl || `/product/${similarProduct.id}`}
              aria-label="View product: {similarProduct.title} - Price: {formatPrice(similarProduct.price || 0)}"
            >
              <div class="product-image">
                <img 
                  src={similarProduct.images?.[0] || 'https://via.placeholder.com/160x200/f3f4f6/9ca3af?text=No+Image'} 
                  alt="{similarProduct.title}"
                  loading="lazy"
                />
                {#if similarProduct.condition}
                  <span class="condition-tag">{translateCondition(similarProduct.condition)}</span>
                {/if}
              </div>
              <div class="product-details">
                <h4 class="product-name">{similarProduct.title}</h4>
                <p class="product-price">{formatPrice(similarProduct.price || 0)}</p>
              </div>
            </a>
          {/each}
        </div>
      </section>
    {/if}

    <!-- Reviews -->
    {#if reviews.length > 0}
      <section class="section-block">
        <div class="reviews-header">
          <h3>{m.pdp_reviews()} ({reviews.length})</h3>
          {#if displayRating > 0}
            <div class="rating-summary">
              <div class="stars">
                {#each Array(5) as _, i}
                  <svg class="star {i < Math.floor(displayRating) ? 'filled' : ''}" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 8.27l6.91-1.01L12 1z"/>
                  </svg>
                {/each}
              </div>
              <span>{displayRating.toFixed(1)}</span>
            </div>
          {/if}
        </div>
        <div class="reviews-list">
          {#each reviews.slice(0, 3) as review}
            <div class="review-card">
              <div class="review-header">
                <span class="reviewer-name">{review.reviewer?.username || review.reviewer_name || m.profile_anonymous()}</span>
                <div class="review-rating">
                  {#each Array(review.rating) as _}
                    <svg class="star filled" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 8.27l6.91-1.01L12 1z"/>
                    </svg>
                  {/each}
                </div>
              </div>
              {#if review.comment}
                <p class="review-text">{review.comment}</p>
              {/if}
            </div>
          {/each}
        </div>
      </section>
    {/if}
  </div>
</main>

<!-- Action Bar -->
<ProductActionBar 
  price={product?.price || 0}
  isSold={product?.is_sold || false}
  isOwner={isOwner}
  isFavorited={isLiked}
  productTitle={product?.title}
  productImage={product?.images?.[0]}
  onBuyNow={handleBuyNow}
  onMessage={onMessage}
  onFavorite={toggleLike}
  onMakeOffer={onMakeOffer}
/>

<style>
  .product-page {
    min-height: 100vh;
    background: var(--surface-base);
    padding-bottom: 100px;
  }
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--space-4);
  }
  .breadcrumb-row {
    padding: var(--space-3) 0 var(--space-2);
  }
  .product-shell { 
    padding: 0;
    /* Mobile-first: add subtle background */
    background: var(--surface-base);
  }
  
  /* One true container - Mobile optimized */
  .product-card {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  
  .product-gallery {
    /* Keep gallery aligned with content */
    margin: 0;
  }
  
  .product-content,
  .product-seller { 
    padding: 0;
    /* Mobile: Ensure proper touch targets */
    position: relative;
  }
  /* Tablet optimizations */
  @media (min-width: 641px) and (max-width: 1023px) {
    .product-card {
      gap: var(--space-5);
      max-width: 600px;
      margin: 0 auto;
    }
    
    .product-gallery {
      margin: 0;
    }
  }
  
  /* Desktop layout */
  @media (min-width: 1024px) {
    .product-shell {
      background: var(--surface-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-2xl);
      padding: var(--space-5);
      box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    }
    
    .product-card {
      grid-template-columns: 1.1fr 0.9fr;
      gap: var(--space-5);
      max-width: none;
    }
    
    .product-gallery { 
      margin: 0; 
    }
    
    .product-content {
      background: var(--surface-base);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      padding: var(--space-4);
    }
    
    .product-seller {
      padding: 0;
    }
  }

  /* Enhanced Header for Mobile */
  .fixed-header { 
    position: fixed; 
    top: 0; 
    left: 0; 
    right: 0; 
    z-index: 50; 
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid transparent; 
    transform: translateY(-100%); 
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  
  .fixed-header.visible { 
    transform: translateY(0); 
    border-bottom-color: var(--border-subtle); 
    box-shadow: 0 4px 16px rgba(0,0,0,0.08); 
  }
  
  .header-content { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    padding: var(--space-3) 0;
    min-height: var(--touch-standard);
  }
  
  .header-left {
    flex: 1;
    min-width: 0;
  }
  
  .header-title { 
    font-size: var(--text-base); 
    font-weight: var(--font-semibold);
    line-height: 1.2;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .header-meta { 
    display: flex; 
    gap: var(--space-2); 
    color: var(--text-tertiary); 
    font-size: var(--text-xs);
    margin-top: var(--space-1);
  }
  
  .meta-item { 
    display: inline-flex; 
    align-items: center; 
    gap: 0.25rem;
    white-space: nowrap;
  }
  
  .header-fav { 
    display: flex; 
    gap: var(--space-1); 
    align-items: center; 
    border: none; 
    background: none; 
    color: var(--text-tertiary);
    padding: var(--space-2);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: var(--touch-compact);
    min-height: var(--touch-compact);
    justify-content: center;
  }
  
  .header-fav:hover {
    background: var(--surface-subtle);
    color: var(--text-secondary);
  }
  
  .header-fav:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  /* Mobile-optimized recommendations */
  .section-block { 
    margin-top: var(--space-6);
    
    /* Mobile: Better spacing */
    @media (max-width: 640px) {
      margin-top: var(--space-5);
    }
  }
  
  .section-title { 
    font-size: var(--text-lg); 
    font-weight: var(--font-semibold); 
    margin-bottom: var(--space-3);
    
    /* Mobile: Smaller title */
    @media (max-width: 640px) {
      font-size: var(--text-base);
      margin-bottom: var(--space-2);
    }
  }
  
  .products-grid { 
    display: grid; 
    grid-template-columns: repeat(2, minmax(0,1fr)); 
    gap: var(--space-3);
    
    /* Mobile: Smaller gap */
    @media (max-width: 640px) {
      gap: var(--space-2);
    }
  }
  
  @media (min-width: 700px) { 
    .products-grid { 
      grid-template-columns: repeat(4, minmax(0,1fr)); 
    } 
  }
  
  .products-grid .product-card { 
    display: block; 
    border: 1px solid var(--border-subtle); 
    border-radius: var(--radius-lg); 
    overflow: hidden; 
    background: var(--surface-base);
    transition: all 0.2s ease;
    cursor: pointer;
  }
  
  .products-grid .product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border-color: var(--border-emphasis);
  }
  
  .products-grid .product-card:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }
  
  .products-grid .product-image { 
    position: relative; 
    aspect-ratio: 4/5; 
    background: var(--surface-subtle); 
  }
  
  .products-grid .product-image img { 
    width: 100%; 
    height: 100%; 
    object-fit: cover; 
    transition: transform 0.2s ease;
  }
  
  .products-grid .product-card:hover .product-image img {
    transform: scale(1.02);
  }
  
  .products-grid .condition-tag { 
    position: absolute; 
    left: 0.5rem; 
    top: 0.5rem; 
    background: var(--surface-elevated); 
    border: 1px solid var(--border-subtle); 
    border-radius: var(--radius-md); 
    padding: 0.125rem 0.375rem; 
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .product-details { 
    padding: 0.75rem; 
    display: flex; 
    flex-direction: column;
    gap: var(--space-1);
    
    /* Mobile: More compact padding */
    @media (max-width: 640px) {
      padding: 0.5rem;
    }
  }
  
  .product-name { 
    font-size: var(--text-sm); 
    color: var(--text-primary); 
    overflow: hidden; 
    text-overflow: ellipsis; 
    white-space: nowrap;
    font-weight: var(--font-medium);
    line-height: 1.3;
    margin: 0;
  }
  
  .product-price { 
    font-size: var(--text-sm); 
    color: var(--text-primary);
    font-weight: var(--font-semibold);
    margin: 0;
  }
  
  /* Touch device optimizations */
  @media (hover: none) and (pointer: coarse) {
    .products-grid .product-card:hover {
      transform: none;
    }
    
    .products-grid .product-card:hover .product-image img {
      transform: none;
    }
    
    .header-fav:hover {
      background: none;
    }
  }
  
  /* Accessibility enhancements */
  @media (prefers-reduced-motion: reduce) {
    .fixed-header,
    .products-grid .product-card,
    .products-grid .product-image img,
    .header-fav {
      transition: none;
    }
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .fixed-header {
      background: var(--surface-base);
      backdrop-filter: none;
    }
    
    .products-grid .product-card,
    .products-grid .condition-tag {
      border-width: 2px;
    }
  }
</style>