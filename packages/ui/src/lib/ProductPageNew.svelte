<script lang="ts">
  import { onMount } from 'svelte';
  import ProductBreadcrumb from './ProductBreadcrumb.svelte';
  import ProductActionBar from './ProductActionBar.svelte';
  import ProductGallery from './ProductGallery.svelte';
  import ProductInfo from './ProductInfo.svelte';
  import SellerCard from './SellerCard.svelte';
  import * as i18n from '@repo/i18n';
  
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
    imageInfoVariant?: 'chips' | 'inline' | 'none';
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
    imageInfoVariant = 'inline',
    showQuickFacts = true
  }: Props = $props();

  // State management
  let isLiked = $state(isFavorited);
  let likeCount = $state(product?.favorite_count || 0);
  let scrollY = $state(0);

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
  const displayName: string = $derived((product?.seller?.full_name ?? product?.seller?.username) ?? 'Unknown Seller');
  
  const breadcrumbCategory = $derived((() => {
    const c = product?.categories;
    if (!c || !c.slug) return null;
    return {
      id: (c.id ?? c.slug) as string,
      name: (c.name ?? 'Category') as string,
      slug: c.slug as string,
      parent_id: (c.parent_id ?? null) as string | null
    };
  })());
  
  const breadcrumbParentCategory = $derived((() => {
    const p = product?.parent_category;
    if (!p || !p.slug) return null;
    return {
      id: p.slug as string,
      name: (p.name ?? 'Category') as string,
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
    if (typeof window !== 'undefined') {
      const username = product?.seller?.username;
      window.location.href = username ? `/profile/${username}` : `/profile/${product?.seller?.id}`;
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
      brand_new_with_tags: 'New with tags',
      brand_new_without_tags: 'New without tags',
      like_new: 'Like new',
      good: 'Good',
      worn: 'Worn',
      fair: 'Fair'
    };
    return map[condition] || condition;
  }
</script>

<main class="product-page">
  <!-- Skip Links -->
  <a href="#product-info" class="skip-link">Skip to product details</a>
  <a href="#seller-info" class="skip-link">Skip to seller info</a>

  <!-- Fixed Header (appears on scroll) -->
  <header class="fixed-header {headerVisible ? 'visible' : 'hidden'}">
    <div class="header-content">
      <button 
        class="back-btn" 
        onclick={() => history.back()}
        aria-label="Go back to previous page"
        type="button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>
      
      <div class="header-info">
        <span class="header-brand">{product?.brand || ''}</span>
        <span class="header-title">{product?.title || ''}</span>
      </div>

      <div class="header-actions">
        <button 
          class="header-btn share-btn" 
          onclick={() => {
            const shareData = { title: product?.title || '', url: window.location.href };
            if (navigator.share) {
              navigator.share(shareData);
            } else {
              navigator.clipboard?.writeText(shareData.url);
            }
          }}
          aria-label="Share this product"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
          </svg>
        </button>
        
        <button 
          class="header-btn heart-btn {isLiked ? 'liked' : ''}" 
          onclick={toggleLike}
          aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isLiked}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
    </div>
  </header>

  <!-- Breadcrumb Navigation -->
  <ProductBreadcrumb
    category={breadcrumbCategory}
    parentCategory={breadcrumbParentCategory}
    productTitle={product?.title || 'Product'}
    onBack={() => history.back()}
  />

  <div class="content-container">
    <!-- Product Gallery -->
    <div class="gallery-section">
      <ProductGallery
        images={product?.images || []}
        title={product?.title || 'Product'}
        isSold={product?.is_sold || false}
      />
    </div>

    <!-- Product Information -->
    <div class="info-section" id="product-info">
      <ProductInfo
        title={product?.title || ''}
        condition={product?.condition}
        brand={product?.brand}
        size={product?.size}
        color={product?.color}
        material={product?.material}
        description={product?.description}
        favoriteCount={likeCount}
        isFavorited={isLiked}
        onFavorite={toggleLike}
        showQuickFacts={showQuickFacts}
      />
    </div>

    <!-- Seller Section -->
    {#if !isOwner}
      <div class="seller-section" id="seller-info">
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
    {:else}
      <div class="owner-info">
        <h3>Your Item</h3>
        <p>Listed by you</p>
      </div>
    {/if}

    <!-- Similar Products -->
    {#if similarProducts && similarProducts.length > 0}
      <div class="recommendations-section">
        <h3 class="section-title">Similar items</h3>
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
      </div>
    {/if}

    <!-- Reviews Section -->
    {#if reviews.length > 0}
      <div class="reviews-section">
        <div class="reviews-header">
          <h3>Reviews ({reviews.length})</h3>
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
                <span class="reviewer-name">{review.reviewer?.username || review.reviewer_name || 'Anonymous'}</span>
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
      </div>
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
    padding-bottom: 100px; /* Space for action bar */
  }

  /* Fixed Header */
  .fixed-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    background: var(--surface-base);
    border-bottom: 1px solid transparent;
    transform: translateY(-100%);
    transition: all 0.3s ease;
  }

  .fixed-header.visible {
    transform: translateY(0);
    border-bottom-color: var(--border-subtle);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4);
    height: 64px;
  }

  .back-btn,
  .header-btn {
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-btn:hover,
  .header-btn:hover {
    background: var(--surface-subtle);
  }

  .header-btn:focus-visible,
  .back-btn:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  .header-info {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    max-width: 200px;
  }

  .header-brand {
    display: block;
    font-size: var(--text-xs);
    color: var(--text-secondary);
    font-weight: var(--font-semibold);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .header-title {
    display: block;
    font-size: var(--text-sm);
    color: var(--text-primary);
    font-weight: var(--font-bold);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header-actions {
    display: flex;
    gap: var(--space-2);
  }

  .heart-btn.liked {
    color: var(--status-error-solid);
    background: var(--status-error-bg);
  }

  /* Content Layout */
  .content-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    padding: var(--space-4);
    max-width: 100%;
  }

  .gallery-section {
    width: 100%;
  }

  .info-section,
  .seller-section {
    width: 100%;
  }

  .owner-info {
    padding: var(--space-5);
    background: var(--surface-subtle);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-subtle);
  }

  .owner-info h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0 0 var(--space-2) 0;
  }

  .owner-info p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
  }

  /* Recommendations */
  .recommendations-section {
    margin-top: var(--space-6);
  }

  .section-title {
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
    color: var(--text-primary);
    margin: 0 0 var(--space-5) 0;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--space-4);
    width: 100%;
  }

  .product-card {
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
  }

  .product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border-color: var(--border-emphasis);
  }

  .product-card:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  .product-image {
    position: relative;
    aspect-ratio: 1;
    background: var(--surface-subtle);
    overflow: hidden;
  }

  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .condition-tag {
    position: absolute;
    top: var(--space-2);
    left: var(--space-2);
    background: var(--surface-base);
    color: var(--text-primary);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    border: 1px solid var(--border-subtle);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .product-details {
    padding: var(--space-3);
  }

  .product-name {
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0 0 var(--space-1) 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .product-price {
    font-size: var(--text-base);
    font-weight: var(--font-bold);
    color: var(--text-primary);
    margin: 0;
  }

  /* Reviews */
  .reviews-section {
    margin-top: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .reviews-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .reviews-header h3 {
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
    color: var(--text-primary);
    margin: 0;
  }

  .rating-summary {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .stars {
    display: flex;
    gap: var(--space-1);
  }

  .star {
    color: var(--surface-muted);
  }

  .star.filled {
    color: var(--warning);
  }

  .rating-summary span {
    font-size: var(--text-sm);
    color: var(--text-primary);
    font-weight: var(--font-semibold);
  }

  .reviews-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .review-card {
    background: var(--surface-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    border: 1px solid var(--border-subtle);
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
  }

  .reviewer-name {
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
  }

  .review-rating {
    display: flex;
    gap: var(--space-0-5);
  }

  .review-text {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: var(--leading-relaxed);
    margin: 0;
  }

  /* Skip Links */
  .skip-link {
    position: absolute;
    top: -9999px;
    left: -9999px;
    z-index: 999;
    background: var(--surface-base);
    color: var(--text-primary);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-lg);
    text-decoration: none;
    font-weight: var(--font-semibold);
    border: 2px solid var(--border-emphasis);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  .skip-link:focus {
    position: absolute;
    top: var(--space-4);
    left: var(--space-4);
  }

  /* Responsive Design */
  @media (min-width: 768px) {
    .content-container {
      max-width: 680px;
      margin: 0 auto;
      gap: var(--space-8);
      padding: var(--space-6);
    }

    .products-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--space-6);
    }
  }

  @media (max-width: 640px) {
    .content-container {
      padding: var(--space-3);
      gap: var(--space-5);
    }

    .products-grid {
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--space-3);
    }
  }

  /* Touch device optimizations */
  @media (pointer: coarse) {
    .back-btn,
    .header-btn {
      width: 44px;
      height: 44px;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .product-card {
      border: 2px solid ButtonText;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .fixed-header,
    .product-card,
    .back-btn,
    .header-btn {
      transition: none;
    }
  }
</style>