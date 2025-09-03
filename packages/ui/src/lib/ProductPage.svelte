<script lang="ts">
  import { onMount } from 'svelte';
  import ProductBreadcrumb from './ProductBreadcrumb.svelte';
  import Tooltip from './primitives/tooltip/Tooltip.svelte';
  import { Accordion } from './primitives';
  import SellerCard from './SellerCard.svelte';
  import * as i18n from '@repo/i18n';
  
  interface ProductData {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    brand?: string;
    condition: string;
    size?: string;
    color?: string;
    material?: string;
    images: string[];
    is_sold: boolean;
    favorite_count: number;
    seller: {
      id: string;
      username: string;
      full_name?: string;
      avatar_url?: string;
      rating?: number;
      bio?: string;
      created_at: string;
      sales_count?: number;
    };
  }

  interface ReviewData {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    reviewer?: {
      id: string;
      username: string;
      avatar_url?: string;
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
    isOwner?: boolean;
    isAuthenticated?: boolean;
    isFavorited?: boolean;
    onFavorite?: () => void;
    onMessage?: () => void;
    onBuyNow?: () => void;
    onMakeOffer?: () => void;
  }

  let { 
    product, 
    reviews = [], 
    ratingSummary, 
    similarProducts = [], 
    isOwner = false,
    isAuthenticated = false,
    isFavorited = false,
    onFavorite,
    onMessage,
    onBuyNow,
    onMakeOffer
  }: Props = $props();

  // Perfect State Management
  let selectedImage = $state(0);
  let isLiked = $state(isFavorited);
  let likeCount = $state(product?.favorite_count || 0);
  let scrollY = $state(0);
  let showFullDescription = $state(false);
  let showSizeChart = $state(false);
  let showProfileModal = $state(false);

  // Perfect Helper Functions


  function selectImage(index: number) {
    selectedImage = index;
  }

  function toggleLike() {
    isLiked = !isLiked;
    likeCount += isLiked ? 1 : -1;
    
    // Perfect haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(isLiked ? [50, 30, 50] : [30]);
    }
    
    onFavorite?.();
  }

  function handleBuyNow() {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    onBuyNow?.();
  }

  function addToBag() {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    onBuyNow?.();
  }

  function toggleProfileModal() {
    showProfileModal = !showProfileModal;
  }

  function viewProfile() {
    // Navigate to seller profile page
    if (typeof window !== 'undefined') {
      window.location.href = `/profile/${product?.seller?.id}`;
    }
  }

  // Perfect Scroll Handling
  onMount(() => {
    function handleScroll() {
      scrollY = window.scrollY;
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });

  // Perfect Derived Values
  const headerVisible = $derived(scrollY > 100);
  const displayName = $derived(product?.seller?.full_name || product?.seller?.username || 'Unknown Seller');
  const memberSince = $derived(
    !product?.seller?.created_at 
      ? 'Recently joined' 
      : new Date(product.seller.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        })
  );
  const displayRating = $derived(ratingSummary?.averageRating || product?.seller?.rating || 0);
  const reviewCount = $derived(ratingSummary?.totalReviews || reviews.length || 0);
  
  // SellerCard data mapping
  const sellerStats = $derived({
    rating: displayRating,
    totalSales: product?.seller?.sales_count || 0,
    responseTime: 24, // Default - could be enhanced with real data later
    joinedDate: product?.seller?.created_at || new Date().toISOString(),
    verificationLevel: 'basic' as const, // Could be enhanced based on seller metrics
    lastActive: 'recently' // Default - could be enhanced with real data later
  });
  
  // Accordion data - formatted for Melt UI Accordion
  const accordionItems = $derived([
    {
      id: 'product-details',
      title: 'Product Details',
      content: `Brand: ${product?.brand || 'Not specified'}\nCondition: ${product?.condition ? translateCondition(product.condition) : 'Not specified'}${product?.size ? `\nSize: ${product.size}` : ''}${product?.color ? `\nColor: ${product.color}` : ''}${product?.material ? `\nMaterial: ${product.material}` : ''}`
    },
    {
      id: 'shipping-returns',
      title: 'Shipping & Returns',
      content: 'Free Shipping on orders over €75\nExpress Delivery: 1-2 days - €19\nStandard Delivery: 3-5 days - €9\nReturns: 30 days free returns'
    }
  ]);
  

  // Price formatting function
  function formatPrice(price: number): string {
    const locale = i18n.getLocale();
    
    // For Bulgarian, use simple format: "5лв"
    if (locale === 'bg') {
      const roundedPrice = price % 1 === 0 ? Math.round(price) : price.toFixed(2);
      return `${roundedPrice}лв`;
    }
    
    // For UK/English, use British pounds
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
    
    // Fallback
    return `€${price}`;
  }

  // Condition translation function
  function translateCondition(condition: string): string {
    const conditionMap: Record<string, () => string> = {
      'brand_new_with_tags': () => i18n.sell_condition_brandNewWithTags?.() || 'New with tags',
      'brand_new_without_tags': () => i18n.sell_condition_newWithoutTags?.() || 'New without tags', 
      'like_new': () => i18n.sell_condition_likeNew?.() || 'Like new',
      'good': () => i18n.sell_condition_good?.() || 'Good',
      'worn': () => i18n.sell_condition_worn?.() || 'Worn',
      'fair': () => i18n.sell_condition_fair?.() || 'Fair'
    };
    
    return conditionMap[condition]?.() || condition;
  }

</script>

<main class="ultimate-page">
  <!-- Ultimate Perfect Header -->
  <header class="ultimate-header {headerVisible ? 'visible' : 'hidden'}">
    <div class="header-content">
      <button class="icon-btn" onclick={() => history.back()}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>
      
      <div class="header-info">
        <span class="header-brand">{product?.brand || ''}</span>
        <span class="header-title">{product?.title || ''}</span>
      </div>

      <div class="header-actions">
        <Tooltip content="Share">
          <button 
            class="icon-btn" 
            onclick={() => navigator.share?.({ 
              title: product?.title || '',
              url: window.location.href 
            })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
            </svg>
          </button>
        </Tooltip>
        
        <Tooltip content={isLiked ? 'Remove from favorites' : 'Add to favorites'}>
          <button 
            class="icon-btn heart-btn {isLiked ? 'liked' : ''}" 
            onclick={toggleLike}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </Tooltip>
      </div>
    </div>
  </header>

  <!-- Reuse existing ProductBreadcrumb -->
  <ProductBreadcrumb
    category={product?.categories}
    parentCategory={product?.parent_category}
    productTitle={product?.title || 'Product'}
    onBack={() => history.back()}
  />


  <!-- Ultimate Perfect Gallery -->
  <section class="ultimate-gallery">
    <div class="main-display">
      <img 
        src={product?.images?.[selectedImage] || product?.images?.[0] || 'https://via.placeholder.com/400x500/f3f4f6/9ca3af?text=No+Image'} 
        alt="{product?.title || 'Product'}" 
        class="hero-image" 
        loading="eager"
      />
      
      <!-- Perfect Sold Badge -->
      {#if product?.is_sold}
        <div class="sold-badge">
          <span>SOLD</span>
        </div>
      {/if}

      <!-- Perfect Seller Avatar Only -->
      <Tooltip content={`Sold by ${displayName}`}>
        <button 
          class="seller-avatar-button" 
          onclick={toggleProfileModal}
        >
          <img src={product?.seller?.avatar_url || '/default-avatar.png'} alt={displayName} class="seller-avatar-overlay" />
        </button>
      </Tooltip>

      <!-- Perfect Floating Like -->
      <Tooltip content={`${likeCount} people love this`}>
        <button 
          class="floating-like {isLiked ? 'liked' : ''}" 
          onclick={toggleLike}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span class="like-count">{likeCount}</span>
        </button>
      </Tooltip>

      <!-- Perfect Image Navigation -->
      {#if product?.images && product.images.length > 1}
        <div class="image-nav">
          {#each product.images as _, index}
            <button 
              class="nav-dot {selectedImage === index ? 'active' : ''}"
              onclick={() => selectImage(index)}
            ></button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Perfect Thumbnail Strip -->
    {#if product?.images && product.images.length > 1}
      <div class="thumbnail-strip">
        {#each product.images as image, index}
          <button 
            class="thumb-btn {selectedImage === index ? 'active' : ''}"
            onclick={() => selectImage(index)}
          >
            <img src={image} alt="View {index + 1}" />
          </button>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Ultimate Perfect Content -->
  <section class="ultimate-content">
    <!-- SINGLE Product Info Container -->
    <div class="product-info-container">
      <!-- Header Row: Badge + Brand -->
      <div class="header-row">
        {#if product?.condition}
          <div class="condition-badge">{translateCondition(product.condition)}</div>
        {/if}
        <div class="favorites-inline">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span>{likeCount}</span>
        </div>
      </div>
      
      <!-- Product Title -->
      <h1 class="product-name">{product?.title || ''}</h1>
      
      <!-- Specs Row with Brand -->
      <div class="specs-inline">
        {#if product?.brand}
          <span class="spec-inline"><strong>Brand:</strong> {product.brand}</span>
        {/if}
        {#if product?.size}
          <span class="spec-inline"><strong>Size:</strong> {product.size}</span>
        {/if}
        {#if product?.color}
          <span class="spec-inline"><strong>Color:</strong> {product.color}</span>
        {/if}
        {#if product?.material}
          <span class="spec-inline"><strong>Material:</strong> {product.material}</span>
        {/if}
      </div>
      
      <!-- Description -->
      {#if product?.description}
        <div class="description-inline">
          <div class="description-text {showFullDescription ? 'expanded' : ''}">
            {product.description}
          </div>
          {#if product.description.length > 200}
            <button 
              class="show-more-btn" 
              onclick={() => showFullDescription = !showFullDescription}
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </button>
          {/if}
        </div>
      {/if}
      
      <!-- Product Details Accordion - positioned with description for better UX -->
      <div class="accordion-wrapper">
        <Accordion items={accordionItems} class="product-accordion" />
      </div>
    </div>

    <!-- Enhanced Mobile-First Seller Section -->
    <div class="seller-products-container">
      {#if !isOwner}
        <SellerCard 
          id={product?.seller?.id || ''}
          name={displayName}
          avatar={product?.seller?.avatar_url}
          stats={sellerStats}
          onMessage={onMessage}
          onViewProfile={viewProfile}
          class="mb-6"
          translations={{
            soldBy: 'Sold by',
            message: 'Message',
            viewFullProfile: 'View profile',
            sales: 'sales',
            memberFor: 'Member for',
            newMember: 'New member'
          }}
        />
      {:else}
        <!-- Owner view - simplified seller info -->
        <div class="owner-seller-info">
          <h3 class="text-lg font-semibold text-[color:var(--text-primary)] mb-2">Your Item</h3>
          <p class="text-sm text-[color:var(--text-secondary)]">Listed by you • {memberSince}</p>
        </div>
      {/if}

      <!-- Connected Products Section -->
      {#if similarProducts && similarProducts.length > 0}
        <div class="products-section">
          <div class="products-header">
            <h3 class="products-title">More from {displayName}</h3>
            <div class="products-count">{similarProducts.length} items</div>
          </div>
          
          <div class="products-scroll-container">
            <div class="products-scroll">
              {#each similarProducts.slice(0, 12) as similarProduct}
                <div 
                  class="product-card" 
                  role="button"
                  tabindex="0"
                  aria-label="View product: {similarProduct.title} - Price: {formatPrice(similarProduct.price || 0)}"
                  onclick={() => window.location.href = `/product/${similarProduct.id}`}
                  onkeydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      window.location.href = `/product/${similarProduct.id}`;
                    }
                  }}
                >
                  <div class="product-image">
                    <img 
                      src={similarProduct.images?.[0] || similarProduct.product_images?.[0]?.image_url || 'https://via.placeholder.com/160x200/f3f4f6/9ca3af?text=No+Image'} 
                      alt={similarProduct.title}
                      loading="lazy"
                    />
                    {#if similarProduct.condition}
                      <div class="condition-badge">{translateCondition(similarProduct.condition)}</div>
                    {/if}
                  </div>
                  <div class="product-info">
                    <p class="product-title">{similarProduct.title}</p>
                    <p class="product-price">{formatPrice(similarProduct.price || 0)}</p>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Perfect Reviews Section -->
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
                <div class="reviewer-info">
                  <span class="reviewer-name">{review.reviewer?.username || review.reviewer_name || 'Anonymous'}</span>
                </div>
                <div class="review-rating">
                  {#each Array(review.rating) as _}
                    <svg class="star filled" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 8.27l6.91-1.01L12 1z"/>
                    </svg>
                  {/each}
                </div>
              </div>
              <p class="review-text">{review.comment}</p>
            </div>
          {/each}
        </div>
      </div>
    {/if}

  </section>
</main>

<!-- Ultimate Perfect Action Bar -->
<div class="ultimate-action-bar">
  <div class="action-content">
    <div class="product-info-bottom">
      <div class="product-title-bottom">{product?.title || ''}</div>
      <div class="product-price-bottom">{formatPrice(product?.price || 0)}</div>
    </div>
    
    <div class="action-buttons">
      {#if !product?.is_sold && !isOwner}
        <button 
          class="message-btn-small" 
          onclick={onMessage}
        >
          Message
        </button>
        
        <button 
          class="buy-btn" 
          onclick={handleBuyNow}
        >
          Buy Now
        </button>
      {:else if product?.is_sold}
        <div class="sold-indicator">
          <span>SOLD</span>
        </div>
      {:else if isOwner}
        <div class="owner-indicator">
          <span>Your Item</span>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Perfect Profile Modal -->
{#if showProfileModal}
  <div class="profile-modal-overlay" onclick={toggleProfileModal}>
    <div class="profile-modal" onclick={(e) => e.stopPropagation()}>
      <div class="profile-modal-header">
        <div class="profile-avatar-large">
          <img src={product?.seller?.avatar_url || '/default-avatar.png'} alt={displayName} />
        </div>
        <div class="profile-info-large">
          <div class="profile-name-row">
            <h3>{displayName}</h3>
            <div class="verified-large">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 8.27l6.91-1.01L12 1z"/>
              </svg>
            </div>
          </div>
          <div class="profile-stats-large">
            {#if displayRating > 0}
              <div class="rating-large">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 8.27l6.91-1.01L12 1z"/>
                </svg>
                <span>{displayRating.toFixed(1)}</span>
              </div>
            {/if}
            <span>{reviewCount} reviews</span>
            <span>•</span>
            <span>{product?.seller?.sales_count || 0} sales</span>
            <span>•</span>
            <span>{memberSince}</span>
          </div>
          {#if product?.seller?.bio}
            <p class="profile-bio">{product.seller.bio}</p>
          {/if}
        </div>
      </div>
      <div class="profile-modal-actions">
        <button class="view-profile-btn" onclick={viewProfile}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          View Full Profile
        </button>
        {#if !isOwner}
          <button class="message-profile-btn" onclick={onMessage}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Message
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}


<style>
  .ultimate-page {
    min-height: 100vh;
    background: var(--surface-base);
    padding-bottom: 80px;
  }

  /* Ultimate Perfect Header */
  .ultimate-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid transparent;
    transform: translateY(-100%);
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .ultimate-header.visible {
    transform: translateY(0);
    border-bottom-color: var(--border-subtle);
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4);
    height: 64px;
  }

  .icon-btn {
    width: 44px;
    height: 44px;
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

  .icon-btn:hover {
    background: var(--surface-subtle);
    transform: scale(1.05);
  }

  .icon-btn:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  .header-info {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
  }

  .header-brand {
    display: block;
    font-size: var(--text-xs);
    color: var(--text-secondary);
    font-weight: var(--font-bold);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .header-title {
    display: block;
    font-size: var(--text-sm);
    color: var(--text-primary);
    font-weight: var(--font-black);
    margin-top: 1px;
  }

  .header-actions {
    display: flex;
    gap: var(--space-1);
  }

  .heart-btn.liked {
    color: var(--status-error-solid);
    background: var(--status-error-bg);
  }


  /* Perfect Seller Avatar Button */
  .seller-avatar-button {
    position: absolute;
    top: var(--space-4);
    left: var(--space-4);
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .seller-avatar-button:hover {
    transform: translateY(-2px) scale(1.05);
  }

  .seller-avatar-overlay {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-full);
    object-fit: cover;
    border: 3px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    background: var(--surface-base);
  }

  /* Ultimate Perfect Gallery */
  .ultimate-gallery {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    padding: 0 var(--space-4);
  }

  .main-display {
    position: relative;
    aspect-ratio: 3/4;
    background: var(--surface-base);
    overflow: hidden;
    border-radius: var(--radius-2xl);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    max-width: 100%;
  }

  /* Responsive aspect ratio adjustments */
  @media (max-width: 640px) {
    .main-display {
      aspect-ratio: 4/5; /* Slightly taller on mobile for better fit */
    }
  }

  .hero-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    border-radius: calc(var(--radius-2xl) - 2px);
    background: var(--surface-base);
  }

  .sold-badge {
    position: absolute;
    top: var(--space-4);
    left: var(--space-4);
    background: var(--status-error-solid);
    color: white;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    font-size: var(--text-sm);
    font-weight: var(--font-bold);
    text-transform: uppercase;
  }

  .floating-like {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    width: 48px;
    height: 48px;
    border: none;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(16px);
    border-radius: var(--radius-full);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-0-5);
  }

  .floating-like:hover {
    transform: scale(1.1);
    box-shadow: 0 16px 64px rgba(0, 0, 0, 0.18);
  }

  .floating-like.liked {
    color: var(--status-error-solid);
    background: var(--surface-base);
    transform: scale(1.15);
  }

  .like-count {
    font-size: var(--text-xs);
    font-weight: var(--font-bold);
    line-height: 1;
  }

  .image-nav {
    position: absolute;
    bottom: var(--space-6);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: var(--space-2);
    background: rgba(0, 0, 0, 0.5);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-full);
    backdrop-filter: blur(8px);
  }

  .nav-dot {
    width: 8px;
    height: 8px;
    border: none;
    background: rgba(255, 255, 255, 0.6);
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .nav-dot.active {
    background: white;
    transform: scale(1.5);
  }

  .thumbnail-strip {
    display: flex;
    gap: var(--space-3);
    padding: 0 var(--space-4);
    overflow-x: auto;
    scrollbar-width: none;
  }

  .thumbnail-strip::-webkit-scrollbar {
    display: none;
  }

  .thumb-btn {
    width: 80px;
    height: 80px;
    border: 2px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    overflow: hidden;
    background: var(--surface-base);
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .thumb-btn:hover {
    border-color: var(--border-emphasis);
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  .thumb-btn.active {
    border-color: var(--text-primary);
    transform: scale(1.1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  .thumb-btn img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: calc(var(--radius-xl) - 2px);
  }

  /* Typography-Driven Content Layout */
  .ultimate-content {
    padding: var(--space-4) var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    max-width: 100%;
    overflow-x: hidden;
  }

  /* Perfect Profile Header */
  .profile-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .seller-preview {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--surface-subtle);
    border-radius: var(--radius-xl);
    border: 1px solid var(--border-subtle);
  }

  .seller-avatar-btn {
    position: relative;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: var(--radius-xl);
    transition: all 0.3s ease;
    padding: 0;
  }

  .seller-avatar-btn:hover {
    transform: scale(1.05);
  }

  .seller-avatar-preview {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-xl);
    object-fit: cover;
    border: 2px solid var(--border-default);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .profile-indicator {
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 20px;
    height: 20px;
    background: var(--primary);
    border-radius: var(--radius-full);
    border: 2px solid var(--surface-base);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .seller-info-preview {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .seller-name-preview {
    font-size: var(--text-lg);
    font-weight: var(--font-bold);
    color: var(--text-primary);
  }

  .seller-stats-preview {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    flex-wrap: wrap;
  }

  .rating-mini {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    color: var(--warning);
  }

  .rating-mini span {
    color: var(--text-primary);
    font-weight: var(--font-semibold);
  }

  .sales-count {
    font-weight: var(--font-medium);
  }

  /* SINGLE Compact Product Info Container */
  .product-info-container {
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .header-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .condition-badge {
    background: var(--status-success-bg);
    color: var(--status-success-text);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    border: 1px solid var(--status-success-border);
    white-space: nowrap;
    display: inline-block;
  }

  .brand-name {
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: var(--tracking-widest);
  }

  .favorites-inline {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    margin-left: auto;
  }

  .product-name {
    font-size: var(--text-2xl);
    font-weight: var(--font-bold);
    color: var(--text-primary);
    line-height: var(--leading-tight);
    letter-spacing: var(--tracking-tight);
    margin: 0;
  }

  /* Duplicate removed - keeping only the first definition */

  .specs-inline {
    display: flex;
    gap: var(--space-4);
    flex-wrap: wrap;
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }

  .spec-inline {
    display: inline-flex;
    align-items: center;
  }

  .spec-inline strong {
    color: var(--text-primary);
    margin-right: var(--space-1);
  }

  .description-inline {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    border-top: 1px solid var(--border-subtle);
    padding-top: var(--space-4);
  }



  .description-text {
    font-size: var(--text-base);
    font-weight: var(--font-normal);
    color: var(--text-secondary);
    line-height: var(--leading-relaxed);
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .description-text.expanded {
    display: block;
    -webkit-line-clamp: unset;
  }

  .show-more-btn {
    margin-top: var(--space-3);
    background: none;
    border: none;
    color: var(--primary);
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    cursor: pointer;
    padding: var(--space-1) 0;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .show-more-btn:hover {
    color: var(--primary-600);
  }

  /* Accordion Wrapper */
  .accordion-wrapper {
    margin-top: var(--space-5);
    border-top: 1px solid var(--border-subtle);
    padding-top: var(--space-5);
  }

  /* Product Accordion Custom Styling */
  :global(.product-accordion) {
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    background: var(--surface-base);
  }

  /* Accordion Content Styling */
  .details-section {
    background: var(--surface-raised);
    border-radius: var(--radius-xl);
    padding: 0;
    margin-bottom: var(--space-5);
    overflow: hidden;
  }

  .accordion-item {
    border-bottom: 1px solid var(--border-subtle);
  }

  .accordion-item:last-child {
    border-bottom: none;
  }

  .accordion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-5);
    cursor: pointer;
    background: transparent;
    border: none;
    width: 100%;
    text-align: left;
    list-style: none;
    transition: background-color var(--duration-fast);
  }

  .accordion-header:hover {
    background: var(--state-hover);
  }

  .accordion-header h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
  }

  .accordion-chevron {
    transition: transform var(--duration-fast);
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  .accordion-item[open] .accordion-chevron {
    transform: rotate(180deg);
  }

  .accordion-content {
    padding: 0 var(--space-5) var(--space-5) var(--space-5);
  }

  .details-accordion {
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xl);
    overflow: hidden;
  }

  .detail-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    font-size: var(--text-base);
  }

  .detail-item span:first-child {
    color: var(--text-secondary);
    font-weight: var(--font-medium);
  }

  .detail-item span:last-child {
    color: var(--text-primary);
    font-weight: var(--font-semibold);
  }

  .shipping-options {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .shipping-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .shipping-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .shipping-label {
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
  }

  .shipping-desc {
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }

  /* Perfect Seller */
  .seller-section {
    display: flex;
    flex-direction: column;
  }

  .seller-card {
    background: var(--surface-subtle);
    border-radius: var(--radius-xl);
    padding: var(--space-6);
    border: 1px solid var(--border-subtle);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .seller-header {
    display: flex;
    gap: var(--space-4);
    align-items: flex-start;
  }

  .seller-avatar {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-xl);
    object-fit: cover;
    flex-shrink: 0;
  }

  .seller-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .seller-name-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .seller-name {
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
    color: var(--text-primary);
  }

  .verified-mini {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, var(--primary), var(--primary-600));
    border-radius: var(--radius-full);
    color: white;
  }

  .seller-stats {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    flex-wrap: wrap;
  }

  .rating-display {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    color: var(--warning);
  }

  .rating-display span {
    color: var(--text-primary);
    font-weight: var(--font-bold);
  }

  .message-btn {
    background: var(--text-primary);
    color: var(--surface-base);
    border: none;
    border-radius: var(--radius-lg);
    padding: var(--space-3) var(--space-4);
    font-size: var(--text-sm);
    font-weight: var(--font-bold);
    cursor: pointer;
    transition: all 0.2s ease;
    height: 40px;
    flex-shrink: 0;
  }

  .message-btn:hover {
    background: var(--text-secondary);
    transform: translateY(-1px);
  }

  .seller-about {
    font-size: var(--text-base);
    color: var(--text-secondary);
    line-height: var(--leading-relaxed);
    margin: 0;
  }


  /* Connected Seller + Products Container */
  .seller-products-container {
    background: var(--surface-base);
    padding: var(--space-4);
    border-radius: var(--radius-xl);
    border: 1px solid var(--border-subtle);
  }
  
  /* Owner view styling */
  .owner-seller-info {
    padding: var(--space-5);
    background: var(--surface-subtle);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-subtle);
    margin-bottom: var(--space-6);
  }

  .seller-header {
    padding: var(--space-4);
    background: var(--surface-base);
  }

  .seller-actions {
    display: flex;
    gap: var(--space-3);
    flex-shrink: 0;
    flex-wrap: wrap;
  }

  /* Mobile-first seller layout */
  @media (max-width: 640px) {
    .seller-info-row {
      gap: var(--space-4);
    }
    
    .seller-actions {
      gap: var(--space-2);
    }
  }

  .seller-info-row {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .seller-avatar {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    object-fit: cover;
    border: 1px solid var(--border-subtle);
  }

  .seller-details {
    flex: 1;
  }

  .seller-name-rating {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-1);
  }

  .seller-name {
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
  }

  .seller-rating {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    color: var(--warning);
  }

  .seller-rating span {
    font-size: var(--text-sm);
    color: var(--text-primary);
    font-weight: var(--font-medium);
  }

  .seller-stats {
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }

  .view-profile-btn,
  .message-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
    border: none;
    white-space: nowrap;
    min-height: 32px;
  }

  /* Mobile enhancements for buttons */
  @media (max-width: 640px) {
    .seller-header {
      padding: var(--space-3);
    }
    
    .seller-info-row {
      gap: var(--space-2);
    }
    
    .seller-actions {
      gap: var(--space-1);
      flex-shrink: 0;
    }
    
    .view-profile-btn,
    .message-btn {
      min-height: 28px;
      padding: var(--space-1);
      font-size: 11px;
      min-width: 50px;
      flex: none;
    }
  }

  .view-profile-btn:focus-visible,
  .message-btn:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  .view-profile-btn {
    background: var(--surface-base);
    color: var(--text-primary);
    border: 1px solid var(--border-default);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .view-profile-btn:hover {
    background: var(--surface-subtle);
    border-color: var(--text-primary);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .view-profile-btn:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .message-btn {
    background: var(--text-primary);
    color: var(--surface-base);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .message-btn:hover {
    background: var(--text-secondary);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .message-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .products-section {
    padding: var(--space-5);
  }

  .products-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-6);
    gap: var(--space-4);
  }

  .products-title {
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
    color: var(--text-primary);
    margin: 0;
    flex: 1;
  }

  .products-count {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--text-secondary);
    background: var(--surface-base);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    border: 1px solid var(--border-default);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    white-space: nowrap;
  }

  /* Mobile optimizations for products section */
  @media (max-width: 640px) {
    .products-section {
      padding: var(--space-5);
    }
    
    .products-header {
      margin-bottom: var(--space-4);
      flex-wrap: wrap;
    }
    
    .products-title {
      font-size: var(--text-lg);
    }
  }

  .products-scroll-container {
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    margin: 0 calc(-1 * var(--space-3));
    padding: var(--space-1) var(--space-3);
    scroll-behavior: smooth;
  }

  .products-scroll-container::-webkit-scrollbar {
    display: none;
  }

  .products-scroll {
    display: flex;
    gap: var(--space-4);
    padding: var(--space-2) 0 var(--space-4) 0;
  }

  .product-card {
    width: 160px;
    flex-shrink: 0;
    background: var(--surface-base);
    cursor: pointer;
    transition: all var(--duration-base) var(--ease-spring);
    border-radius: var(--radius-xl);
    border: 1px solid var(--border-subtle);
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  /* Mobile product card adjustments */
  @media (max-width: 640px) {
    .product-card {
      width: 140px;
    }
    
    .products-scroll {
      gap: var(--space-3);
    }
  }

  .product-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    border-color: var(--border-emphasis);
  }

  .product-card:active {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
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
    transition: all var(--duration-base) var(--ease-out);
  }

  .product-card:hover .product-image {
    background: var(--surface-muted);
  }

  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--duration-base) var(--ease-out);
  }

  .product-card:hover .product-image img {
    transform: scale(1.02);
  }

  .product-card .condition-badge {
    position: absolute;
    top: var(--space-2);
    left: var(--space-2);
    background: var(--surface-base);
    color: var(--status-success-text);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--border-subtle);
  }

  .product-info {
    padding: var(--space-4) var(--space-3);
    background: var(--surface-base);
  }

  .product-title {
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    line-height: var(--leading-tight);
    margin: 0 0 var(--space-2) 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: calc(var(--text-sm) * var(--leading-tight) * 2);
  }

  .product-price {
    font-size: var(--text-base);
    font-weight: var(--font-bold);
    color: var(--text-primary);
    margin: 0;
  }

  /* Mobile product info adjustments */
  @media (max-width: 640px) {
    .product-info {
      padding: var(--space-3);
    }
    
    .product-price {
      font-size: var(--text-sm);
    }
  }

  /* Perfect Reviews */
  .reviews-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
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
    gap: var(--space-5);
  }

  .review-card {
    background: var(--surface-subtle);
    border-radius: var(--radius-xl);
    padding: var(--space-5);
    border: 1px solid var(--border-subtle);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .reviewer-name {
    font-size: var(--text-base);
    font-weight: var(--font-bold);
    color: var(--text-primary);
  }

  .review-rating {
    display: flex;
    gap: var(--space-1);
  }

  .review-text {
    font-size: var(--text-base);
    color: var(--text-secondary);
    line-height: var(--leading-relaxed);
    margin: 0;
  }


  /* Ultimate Perfect Action Bar */
  .ultimate-action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 40;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(24px);
    border-top: 1px solid var(--border-subtle);
    padding: var(--space-4);
    padding-bottom: max(var(--space-4), env(safe-area-inset-bottom));
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.08);
  }

  .action-content {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    max-width: 640px;
    margin: 0 auto;
  }

  .product-info-bottom {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    flex: 1;
    min-width: 0;
  }

  .product-title-bottom {
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    line-height: var(--leading-tight);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .product-price-bottom {
    font-size: var(--text-lg);
    font-weight: var(--font-black);
    color: var(--text-primary);
    line-height: 1;
  }

  .action-buttons {
    display: flex;
    flex: 1;
    gap: var(--space-3);
  }

  .message-btn-small,
  .buy-btn {
    flex: 1;
    height: 44px;
    border: none;
    border-radius: var(--radius-lg);
    font-size: var(--text-base);
    font-weight: var(--font-bold);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .message-btn-small {
    background: var(--surface-subtle);
    color: var(--text-primary);
    border: 2px solid var(--border-default);
  }

  .message-btn-small:hover {
    border-color: var(--text-primary);
    background: var(--surface-muted);
    transform: translateY(-1px);
  }

  .buy-btn {
    background: var(--text-primary);
    color: var(--surface-base);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .buy-btn:hover {
    background: var(--text-secondary);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .sold-indicator,
  .owner-indicator {
    flex: 1;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-muted);
    border-radius: var(--radius-lg);
    color: var(--text-secondary);
    font-weight: var(--font-bold);
  }

  .sold-indicator {
    color: var(--status-error-text);
  }

  /* Perfect Profile Modal */
  .profile-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
    animation: fadeIn 0.3s ease;
  }

  .profile-modal {
    background: var(--surface-base);
    border-radius: var(--radius-2xl);
    padding: var(--space-6);
    max-width: 400px;
    width: 100%;
    border: 1px solid var(--border-default);
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.25);
    animation: slideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .profile-modal-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-5);
    margin-bottom: var(--space-6);
  }

  .profile-avatar-large {
    position: relative;
  }

  .profile-avatar-large img {
    width: 96px;
    height: 96px;
    border-radius: var(--radius-2xl);
    object-fit: cover;
    border: 3px solid var(--border-default);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  .profile-info-large {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    text-align: center;
  }

  .profile-name-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .profile-name-row h3 {
    font-size: var(--text-2xl);
    font-weight: var(--font-bold);
    color: var(--text-primary);
    margin: 0;
  }

  .verified-large {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, var(--primary), var(--primary-600));
    border-radius: var(--radius-full);
    color: white;
  }

  .profile-stats-large {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    flex-wrap: wrap;
    justify-content: center;
  }

  .rating-large {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    color: var(--warning);
  }

  .rating-large span {
    color: var(--text-primary);
    font-weight: var(--font-bold);
  }

  .profile-bio {
    font-size: var(--text-base);
    color: var(--text-secondary);
    line-height: var(--leading-relaxed);
    margin: 0;
    max-width: 320px;
  }

  .profile-modal-actions {
    display: flex;
    gap: var(--space-3);
    justify-content: center;
    flex-wrap: wrap;
  }

  .view-profile-btn,
  .message-profile-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    border: none;
    border-radius: var(--radius-lg);
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    min-width: 140px;
  }

  .view-profile-btn {
    background: var(--text-primary);
    color: var(--surface-base);
  }

  .view-profile-btn:hover {
    background: var(--text-secondary);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .message-profile-btn {
    background: var(--surface-subtle);
    color: var(--text-primary);
    border: 2px solid var(--border-default);
  }

  .message-profile-btn:hover {
    border-color: var(--text-primary);
    background: var(--surface-muted);
    transform: translateY(-1px);
  }


  /* Perfect Animations */
  @keyframes slideDown {
    from {
      height: 0;
      opacity: 0;
    }
    to {
      height: auto;
      opacity: 1;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(24px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Enhanced Mobile-First Responsive Design */
  @media (max-width: 480px) {
    .ultimate-gallery {
      padding: 0 var(--space-3);
    }
    
    .ultimate-content {
      padding: var(--space-4) var(--space-3);
      gap: var(--space-6);
    }
    
    .product-info-container {
      padding: var(--space-5);
    }
    
    .product-name {
      font-size: var(--text-xl);
      line-height: var(--leading-tight);
    }
  }

  @media (min-width: 640px) and (max-width: 1024px) {
    .ultimate-content {
      padding: var(--space-6) var(--space-5);
    }
  }

  @media (min-width: 768px) {
    .main-display {
      aspect-ratio: 4/5;
      max-width: 480px;
      margin: 0 auto;
    }

    .ultimate-content {
      padding: var(--space-8) var(--space-6);
      max-width: 680px;
      margin: 0 auto;
    }
    
    .ultimate-gallery {
      max-width: 680px;
      margin: 0 auto;
    }
  }

  /* Perfect Accessibility */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }

  @media (hover: none) {
    .icon-btn:hover,
    .floating-like:hover,
    .message-btn:hover,
    .buy-btn:hover {
      transform: none;
    }
  }
</style>