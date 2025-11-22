# UI/UX Improvement Plan - Based on Reference App Audit

**Date:** November 23, 2025  
**Status:** Planning Phase  
**Priority:** High

---

## Executive Summary

After analyzing the reference e-commerce app screenshots, I've identified **15 key improvements** across 6 core areas that will significantly enhance our UI/UX to match modern e-commerce standards while maintaining our unique brand identity.

### Key Improvements Needed:
1. **Visual Hierarchy** - Better use of spacing, typography scale, and color contrast
2. **Product Cards** - More polished, image-focused cards with better metadata display
3. **Navigation** - Cleaner tab bar with better active states and iconography
4. **Cart Experience** - Enhanced cart UI with better item management
5. **Profile/Account** - More professional profile layouts with better stats display
6. **Product Details** - Improved detail pages with better image galleries and CTAs

---

## 📊 Reference App Analysis

### What They Do Well:

1. **Clean, Minimal Design**
   - Generous white space
   - Clear visual hierarchy
   - **Border radius - keep our current design token system**
   - Subtle shadows for depth

2. **Product Cards**
   - Large, high-quality product images
   - Clear pricing with strikethrough for discounts
   - Heart icon for favorites (top-right)
   - Minimal text overlay
   - Rounded corners on images and cards

3. **Typography**
   - Clear size hierarchy
   - Bold headings (600-700 weight)
   - Small, light metadata (400 weight)
   - Consistent line heights

4. **Color Usage**
   - Bright blue primary (#2196F3 or similar)
   - Black text for headings
   - Gray for metadata (#6B7280)
   - Red for discounts
   - White backgrounds

5. **Navigation**
   - Bottom tab bar with icons + labels
   - Active state highlighted in blue
   - Consistent icon sizes
   - 5 main tabs (Home, Shopping, Cart, Favorites, Profile)

6. **Spacing**
   - 12-16px card padding
   - 8px gaps between elements
   - 16-20px screen padding
   - Consistent grid layouts (2-column on mobile)

---

## 🎯 Improvement Priorities

### Phase 1: Foundation (Week 1-2)

#### 1.1 Update Design Tokens ✅ (Keep existing radius values)

**Add/Update (respecting current design system):**
```css
/* Product Card Specific Tokens */
/* Note: Keep existing --radius-* tokens from DESIGN_TOKENS_REFERENCE.md */
--product-card-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
--product-card-shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.12);
--product-card-padding: 12px;
--product-card-gap: 8px;

/* Enhanced Primary Blue (optional - can keep existing brand colors) */
--brand-primary-blue: #2196F3;
--brand-primary-blue-hover: #1976D2;
--brand-primary-blue-light: #E3F2FD;

/* Better Grays (complement existing tokens) */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-600: #6B7280;
--gray-900: #111827;

/* Enhanced Spacing */
--space-safe-bottom: 88px; /* For bottom nav */
```

#### 1.2 Product Card Redesign 🎨

**Current Issues:**
- Images not prominent enough
- Too much text competing for attention
- Inconsistent favorite button placement
- Shadow too subtle

**Improvements (keeping current border radius):**

**File:** `packages/ui/src/lib/compositions/cards/ProductCard.svelte`

```svelte
<script lang="ts">
  // Enhanced product card with better visual hierarchy
  interface Props {
    product: Product;
    onFavorite?: (id: string) => void;
    onClick?: (product: Product) => void;
    isFavorited?: boolean;
    showBadge?: boolean;
    variant?: 'default' | 'compact' | 'large';
  }
  
  let { 
    product, 
    onFavorite, 
    onClick,
    isFavorited = false,
    showBadge = true,
    variant = 'default'
  }: Props = $props();
  
  const hasDiscount = $derived(
    product.original_price && product.original_price > product.price
  );
  
  const discountPercent = $derived(
    hasDiscount 
      ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
      : 0
  );
</script>

<article 
  class="product-card product-card--{variant}"
  onclick={() => onClick?.(product)}
>
  <!-- Image Container -->
  <div class="product-card__image-wrapper">
    <img 
      src={product.images?.[0] || '/placeholder-product.svg'}
      alt={product.title}
      class="product-card__image"
      loading="lazy"
    />
    
    <!-- Favorite Button - Top Right -->
    <button
      class="product-card__favorite"
      class:product-card__favorite--active={isFavorited}
      onclick={(e) => {
        e.stopPropagation();
        onFavorite?.(product.id);
      }}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg class="w-5 h-5" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
    
    <!-- Discount Badge - Top Left -->
    {#if hasDiscount && showBadge}
      <div class="product-card__badge product-card__badge--discount">
        {discountPercent}% OFF
      </div>
    {/if}
    
    <!-- Condition Badge - Bottom Left -->
    {#if product.condition && showBadge}
      <div class="product-card__badge product-card__badge--condition">
        {product.condition}
      </div>
    {/if}
  </div>
  
  <!-- Content -->
  <div class="product-card__content">
    <!-- Category Tag -->
    {#if product.category_name}
      <span class="product-card__category">
        {product.category_name}
      </span>
    {/if}
    
    <!-- Title -->
    <h3 class="product-card__title">
      {product.title}
    </h3>
    
    <!-- Metadata -->
    {#if product.brand || product.size}
      <p class="product-card__metadata">
        {#if product.brand}
          <span>{product.brand}</span>
        {/if}
        {#if product.brand && product.size}
          <span class="product-card__separator">•</span>
        {/if}
        {#if product.size}
          <span>Size {product.size}</span>
        {/if}
      </p>
    {/if}
    
    <!-- Price -->
    <div class="product-card__price-row">
      <span class="product-card__price">
        ${product.price.toFixed(2)}
      </span>
      {#if hasDiscount}
        <span class="product-card__original-price">
          ${product.original_price!.toFixed(2)}
        </span>
      {/if}
    </div>
  </div>
</article>

<style>
  .product-card {
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: var(--radius-xl, 8px); /* Use existing design token */
    overflow: hidden;
    box-shadow: var(--product-card-shadow);
    transition: all 0.2s ease;
    cursor: pointer;
  }
  
  .product-card:hover {
    box-shadow: var(--product-card-shadow-hover);
    transform: translateY(-2px);
  }
  
  /* Image Section */
  .product-card__image-wrapper {
    position: relative;
    aspect-ratio: 1 / 1;
    background: var(--gray-100);
    overflow: hidden;
  }
  
  .product-card__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  .product-card:hover .product-card__image {
    transform: scale(1.05);
  }
  
  /* Favorite Button */
  .product-card__favorite {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: none;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 2;
  }
  
  .product-card__favorite svg {
    color: var(--gray-600);
    transition: color 0.2s ease;
  }
  
  .product-card__favorite:hover {
    background: var(--gray-50);
    transform: scale(1.1);
  }
  
  .product-card__favorite--active svg {
    color: #EF4444;
    fill: currentColor;
  }
  
  /* Badges */
  .product-card__badge {
    position: absolute;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    z-index: 1;
  }
  
  .product-card__badge--discount {
    top: 8px;
    left: 8px;
    background: #EF4444;
    color: white;
  }
  
  .product-card__badge--condition {
    bottom: 8px;
    left: 8px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    backdrop-filter: blur(4px);
  }
  
  /* Content Section */
  .product-card__content {
    padding: var(--product-card-padding);
    display: flex;
    flex-direction: column;
    gap: var(--product-card-gap);
  }
  
  .product-card__category {
    font-size: 11px;
    color: var(--gray-600);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  }
  
  .product-card__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--gray-900);
    line-height: 1.4;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  .product-card__metadata {
    font-size: 12px;
    color: var(--gray-600);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .product-card__separator {
    color: var(--gray-300);
  }
  
  .product-card__price-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }
  
  .product-card__price {
    font-size: 16px;
    font-weight: 700;
    color: var(--gray-900);
  }
  
  .product-card__original-price {
    font-size: 13px;
    color: var(--gray-600);
    text-decoration: line-through;
  }
  
  /* Variants */
  .product-card--compact {
    border-radius: var(--radius-lg, 6px); /* Use existing token */
  }
  
  .product-card--compact .product-card__content {
    padding: 8px;
  }
  
  .product-card--large .product-card__image-wrapper {
    aspect-ratio: 4 / 5;
  }
</style>
```

---

### Phase 2: Navigation & Layout (Week 3)

#### 2.1 Enhanced Bottom Navigation 📱

**File:** `packages/ui/src/lib/compositions/navigation/BottomNav.svelte`

**Improvements:**
1. Larger icons (24px)
2. Blue active state
3. Better spacing
4. Badge support for cart/messages
5. Smooth transitions

```svelte
<nav class="bottom-nav">
  <a 
    href="/"
    class="bottom-nav__item"
    class:bottom-nav__item--active={currentPath === '/'}
  >
    <svg class="bottom-nav__icon" viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
    <span class="bottom-nav__label">Home</span>
  </a>
  
  <a 
    href="/search"
    class="bottom-nav__item"
    class:bottom-nav__item--active={currentPath.startsWith('/search')}
  >
    <svg class="bottom-nav__icon" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
    <span class="bottom-nav__label">Shopping</span>
  </a>
  
  <a 
    href="/cart"
    class="bottom-nav__item"
    class:bottom-nav__item--active={currentPath === '/cart'}
  >
    <div class="bottom-nav__icon-wrapper">
      <svg class="bottom-nav__icon" viewBox="0 0 24 24">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {#if cartCount > 0}
        <span class="bottom-nav__badge">{cartCount}</span>
      {/if}
    </div>
    <span class="bottom-nav__label">Cart</span>
  </a>
  
  <!-- ... similar for Favorites and Profile -->
</nav>

<style>
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    background: white;
    border-top: 1px solid var(--gray-200);
    padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
    z-index: 50;
  }
  
  .bottom-nav__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    text-decoration: none;
    color: var(--gray-600);
    transition: color 0.2s ease;
  }
  
  .bottom-nav__item--active {
    color: var(--brand-primary-blue);
  }
  
  .bottom-nav__icon-wrapper {
    position: relative;
  }
  
  .bottom-nav__icon {
    width: 24px;
    height: 24px;
    stroke: currentColor;
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  
  .bottom-nav__label {
    font-size: 11px;
    font-weight: 500;
  }
  
  .bottom-nav__badge {
    position: absolute;
    top: -4px;
    right: -8px;
    min-width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--brand-primary-blue);
    color: white;
    font-size: 10px;
    font-weight: 600;
    border-radius: 9px;
    padding: 0 4px;
  }
</style>
```

#### 2.2 Home Page Hero Banner 🎨

**Add promotional banner component:**

**File:** `packages/ui/src/lib/compositions/banners/PromoBanner.svelte`

```svelte
<script lang="ts">
  interface Props {
    title: string;
    subtitle: string;
    discount?: string;
    imageUrl: string;
    ctaText?: string;
    onCtaClick?: () => void;
  }
  
  let { 
    title,
    subtitle,
    discount = '',
    imageUrl,
    ctaText = 'Shop Now',
    onCtaClick
  }: Props = $props();
</script>

<div class="promo-banner">
  <div class="promo-banner__content">
    <div class="promo-banner__text">
      {#if discount}
        <span class="promo-banner__badge">{discount}</span>
      {/if}
      <h2 class="promo-banner__title">{title}</h2>
      <p class="promo-banner__subtitle">{subtitle}</p>
      <button class="promo-banner__cta" onclick={onCtaClick}>
        {ctaText}
      </button>
    </div>
    <div class="promo-banner__image">
      <img src={imageUrl} alt={title} />
    </div>
  </div>
  
  <!-- Carousel Dots -->
  <div class="promo-banner__dots">
    <span class="promo-banner__dot promo-banner__dot--active"></span>
    <span class="promo-banner__dot"></span>
    <span class="promo-banner__dot"></span>
  </div>
</div>

<style>
  .promo-banner {
    background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
    border-radius: var(--radius-2xl, 12px); /* Use existing token */
    padding: 24px;
    margin: 16px;
    position: relative;
    overflow: hidden;
  }
  
  .promo-banner__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  
  .promo-banner__text {
    flex: 1;
    color: white;
  }
  
  .promo-banner__badge {
    display: inline-block;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    padding: 4px 12px;
    border-radius: var(--radius-full, 9999px); /* Use existing token */
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .promo-banner__title {
    font-size: 28px;
    font-weight: 800;
    margin: 8px 0;
    line-height: 1.2;
  }
  
  .promo-banner__subtitle {
    font-size: 14px;
    opacity: 0.9;
    margin: 4px 0 16px;
  }
  
  .promo-banner__cta {
    background: white;
    color: #667EEA;
    border: none;
    padding: 10px 20px;
    border-radius: var(--radius-full, 9999px); /* Use existing token */
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  
  .promo-banner__cta:hover {
    transform: scale(1.05);
  }
  
  .promo-banner__image {
    width: 120px;
    height: 120px;
    flex-shrink: 0;
  }
  
  .promo-banner__image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: var(--radius-lg, 6px); /* Use existing token */
  }
  
  .promo-banner__dots {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 16px;
  }
  
  .promo-banner__dot {
    width: 6px;
    height: 6px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 3px;
    transition: all 0.3s ease;
  }
  
  .promo-banner__dot--active {
    width: 20px;
    background: white;
  }
</style>
```

---

### Phase 3: Cart & Checkout (Week 4)

#### 3.1 Enhanced Cart Page 🛒

**File:** `apps/web/src/routes/(protected)/cart/+page.svelte`

**Key Improvements:**
1. Item images larger and more prominent
2. Quantity controls with +/- buttons
3. Delete button (trash icon)
4. Subtotal breakdown
5. Promo code input
6. Fixed checkout button

```svelte
<div class="cart-page">
  <header class="cart-header">
    <button class="cart-header__back" onclick={() => history.back()}>
      <svg>...</svg>
    </button>
    <h1 class="cart-header__title">My Cart</h1>
    <button class="cart-header__menu">
      <svg>...</svg>
    </button>
  </header>
  
  <div class="cart-items">
    {#each cartItems as item}
      <div class="cart-item">
        <img src={item.image} alt={item.title} class="cart-item__image" />
        <div class="cart-item__details">
          <h3 class="cart-item__title">{item.title}</h3>
          <p class="cart-item__category">{item.category}</p>
          <p class="cart-item__price">${item.price}</p>
        </div>
        <div class="cart-item__actions">
          <button class="cart-item__delete">
            <svg>...</svg> <!-- Trash icon -->
          </button>
          <div class="cart-item__quantity">
            <button>-</button>
            <span>{item.quantity}</span>
            <button>+</button>
          </div>
        </div>
      </div>
    {/each}
  </div>
  
  <!-- Promo Code -->
  <div class="cart-promo">
    <input 
      type="text" 
      placeholder="Enter Promo Code"
      class="cart-promo__input"
    />
    <button class="cart-promo__button">Apply</button>
  </div>
  
  <!-- Summary -->
  <div class="cart-summary">
    <div class="cart-summary__row">
      <span>Amount</span>
      <span>${subtotal}</span>
    </div>
    <div class="cart-summary__row">
      <span>Tax Fee</span>
      <span>${tax}</span>
    </div>
    <div class="cart-summary__row cart-summary__row--discount">
      <span>Discount</span>
      <span class="text-green-600">-${discount}</span>
    </div>
    <div class="cart-summary__row cart-summary__row--total">
      <span>Total</span>
      <span>${total}</span>
    </div>
  </div>
  
  <!-- Fixed Checkout Button -->
  <div class="cart-checkout">
    <button class="cart-checkout__button">
      Checkout
    </button>
  </div>
</div>
```

---

### Phase 4: Profile & Account (Week 5)

#### 4.1 Enhanced Profile Page 👤

**File:** `apps/web/src/routes/(app)/(account)/profile/[id]/+page.svelte`

**Improvements:**
1. Instagram-style profile header
2. Grid stats (Posts, Followers, Following)
3. Edit Profile button (for own profile)
4. Follow/Message buttons (for other profiles)
5. Tab navigation (Posts, Reviews, About)
6. Grid product layout

```svelte
<div class="profile-page">
  <!-- Header -->
  <header class="profile-header">
    <div class="profile-header__row">
      <Avatar src={profile.avatar} size="xl" />
      
      <div class="profile-stats">
        <div class="profile-stat">
          <span class="profile-stat__value">{activeListings}</span>
          <span class="profile-stat__label">Posts</span>
        </div>
        <button class="profile-stat" onclick={showFollowers}>
          <span class="profile-stat__value">{followers}</span>
          <span class="profile-stat__label">Followers</span>
        </button>
        <button class="profile-stat" onclick={showFollowing}>
          <span class="profile-stat__value">{following}</span>
          <span class="profile-stat__label">Following</span>
        </button>
      </div>
    </div>
    
    <!-- Name & Bio -->
    <div class="profile-info">
      <h1 class="profile-info__name">{profile.username}</h1>
      {#if profile.bio}
        <p class="profile-info__bio">{profile.bio}</p>
      {/if}
    </div>
    
    <!-- Actions -->
    {#if isOwnProfile}
      <button class="profile-action profile-action--primary">
        Edit Profile
      </button>
    {:else}
      <div class="profile-actions">
        <button class="profile-action profile-action--primary">
          Follow
        </button>
        <button class="profile-action profile-action--secondary">
          Message
        </button>
      </div>
    {/if}
  </header>
  
  <!-- Tabs -->
  <div class="profile-tabs">
    <button class="profile-tab" class:profile-tab--active={activeTab === 'posts'}>
      <svg>...</svg>
    </button>
    <button class="profile-tab" class:profile-tab--active={activeTab === 'reviews'}>
      <svg>...</svg>
    </button>
    <button class="profile-tab" class:profile-tab--active={activeTab === 'about'}>
      <svg>...</svg>
    </button>
  </div>
  
  <!-- Product Grid -->
  <div class="profile-grid">
    {#each products as product}
      <a href="/product/{product.id}" class="profile-grid__item">
        <img src={product.image} alt={product.title} />
      </a>
    {/each}
  </div>
</div>

<style>
  .profile-header {
    padding: 16px;
    background: white;
  }
  
  .profile-header__row {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 12px;
  }
  
  .profile-stats {
    flex: 1;
    display: flex;
    justify-content: space-around;
  }
  
  .profile-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }
  
  .profile-stat__value {
    font-size: 18px;
    font-weight: 700;
    color: var(--gray-900);
  }
  
  .profile-stat__label {
    font-size: 12px;
    color: var(--gray-600);
  }
  
  .profile-info__name {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .profile-info__bio {
    font-size: 13px;
    line-height: 1.4;
    color: var(--gray-900);
  }
  
  .profile-action {
    width: 100%;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .profile-action--primary {
    background: var(--brand-primary-blue);
    color: white;
    border: none;
  }
  
  .profile-action--secondary {
    background: var(--gray-100);
    color: var(--gray-900);
    border: 1px solid var(--gray-200);
  }
  
  .profile-tabs {
    display: flex;
    border-bottom: 1px solid var(--gray-200);
  }
  
  .profile-tab {
    flex: 1;
    padding: 12px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
  }
  
  .profile-tab--active {
    border-bottom-color: var(--gray-900);
  }
  
  .profile-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
    background: var(--gray-200);
  }
  
  .profile-grid__item {
    aspect-ratio: 1;
    background: white;
  }
  
  .profile-grid__item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
```

---

### Phase 5: Product Details (Week 6)

#### 5.1 Enhanced Product Detail Page 📦

**Key Improvements:**
1. Image carousel with dots
2. Size selector with visual buttons
3. Better product info layout
4. Reviews section with star ratings
5. "Other details" table
6. Dual CTAs (Buy Now + Add to Cart)

**File:** `apps/web/src/routes/(app)/(shop)/product/[seller]/[slug]/+page.svelte`

Add these components:

```svelte
<!-- Size Selector -->
<div class="size-selector">
  <h3 class="size-selector__title">Select Size</h3>
  <div class="size-selector__options">
    {#each sizes as size}
      <button 
        class="size-selector__option"
        class:size-selector__option--active={selectedSize === size}
        onclick={() => selectedSize = size}
      >
        {size}
      </button>
    {/each}
  </div>
</div>

<!-- Reviews Summary -->
<div class="reviews-summary">
  <div class="reviews-summary__header">
    <div class="reviews-summary__rating">
      <span class="reviews-summary__score">4.8</span>
      <div class="reviews-summary__stars">
        {#each [1,2,3,4,5] as star}
          <svg class="star star--filled">...</svg>
        {/each}
      </div>
      <span class="reviews-summary__count">986 reviews</span>
    </div>
  </div>
  
  <div class="reviews-summary__breakdown">
    {#each [5,4,3,2,1] as rating}
      <div class="rating-bar">
        <span>{rating}</span>
        <div class="rating-bar__track">
          <div class="rating-bar__fill" style="width: {getRatingPercent(rating)}%"></div>
        </div>
      </div>
    {/each}
  </div>
</div>

<!-- Product Details Table -->
<div class="product-details">
  <h3 class="product-details__title">Other details</h3>
  <table class="product-details__table">
    <tr>
      <td class="product-details__label">Key</td>
      <td class="product-details__value">Value</td>
    </tr>
    <tr>
      <td class="product-details__label">Fabrics</td>
      <td class="product-details__value">Cotton, Gold pins</td>
    </tr>
    <tr>
      <td class="product-details__label">Machine Wash</td>
      <td class="product-details__value">No</td>
    </tr>
    <tr>
      <td class="product-details__label">Iron</td>
      <td class="product-details__value">Yes</td>
    </tr>
  </table>
</div>

<!-- Dual CTAs -->
<div class="product-ctas">
  <button class="product-cta product-cta--primary">
    <svg>...</svg> Buy Now
  </button>
  <button class="product-cta product-cta--secondary">
    <svg>...</svg> Add to Cart
  </button>
</div>
```

---

## 🎨 Design System Updates

### Color Palette Enhancement

```css
/* Update app.css or global.css */
:root {
  /* Primary Blue (like reference app) */
  --primary-50: #E3F2FD;
  --primary-100: #BBDEFB;
  --primary-200: #90CAF9;
  --primary-300: #64B5F6;
  --primary-400: #42A5F5;
  --primary-500: #2196F3; /* Main */
  --primary-600: #1E88E5;
  --primary-700: #1976D2;
  --primary-800: #1565C0;
  --primary-900: #0D47A1;
  
  /* Red for discounts */
  --red-500: #EF4444;
  --red-600: #DC2626;
  
  /* Green for success */
  --green-500: #10B981;
  --green-600: #059669;
}
```

### Typography Scale

```css
:root {
  /* Headings */
  --font-size-h1: 28px;
  --font-size-h2: 24px;
  --font-size-h3: 20px;
  
  /* Body */
  --font-size-base: 14px;
  --font-size-sm: 12px;
  --font-size-xs: 11px;
  
  /* Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;
}
```

---

## 📱 Responsive Guidelines

### Mobile-First Breakpoints

```css
/* Mobile: 375px - 767px */
.product-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
}

/* Tablet: 768px - 1023px */
@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding: 24px;
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    padding: 32px;
  }
}
```

---

## ✅ Implementation Checklist

### Week 1-2: Foundation
- [ ] Add complementary design tokens (keep existing radius values)
- [ ] Enhance existing ProductCard component (not rebuild)
- [ ] Add ProductCard stories in Storybook
- [ ] Test ProductCard improvements on Home page
- [ ] Add hover states and animations

### Week 3: Navigation
- [ ] Redesign BottomNav component
- [ ] Add badge support for cart/messages
- [ ] Create PromoBanner component
- [ ] Integrate banner on Home page
- [ ] Add carousel functionality

### Week 4: Cart
- [ ] Redesign cart page layout
- [ ] Add quantity controls
- [ ] Implement promo code section
- [ ] Add fixed checkout button
- [ ] Test cart flow end-to-end

### Week 5: Profile
- [ ] Redesign profile header
- [ ] Add stats grid (Posts/Followers/Following)
- [ ] Implement tab navigation
- [ ] Add product grid layout
- [ ] Create followers/following modals

### Week 6: Product Details
- [ ] Add size selector component
- [ ] Create reviews summary section
- [ ] Add product details table
- [ ] Implement dual CTAs
- [ ] Add image carousel

### Week 7: Polish & Testing
- [ ] Add loading states
- [ ] Implement error states
- [ ] Add micro-interactions
- [ ] Test on real devices
- [ ] Optimize images
- [ ] Performance audit
- [ ] Accessibility audit

---

## 🎯 Success Metrics

### Visual Quality
- [ ] Maintain existing border radius system from design tokens
- [ ] Enhanced shadow depth (2-8px elevation for cards)
- [ ] Optional: Blue primary color integration (keep existing brand if preferred)
- [ ] Typography hierarchy clearly visible
- [ ] 2-column grid maintained on mobile/tablet

### User Experience
- [ ] Touch targets minimum 44x44px
- [ ] Smooth transitions (200-300ms)
- [ ] Loading states for all async actions
- [ ] Clear feedback for all interactions

### Performance
- [ ] Images lazy-loaded
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse score > 90

---

## 📚 Resources

1. **Design Tokens:** `DESIGN_TOKENS_REFERENCE.md`
2. **Component Library:** `packages/ui/src/lib/`
3. **Storybook:** Run `pnpm storybook` in packages/ui
4. **Figma:** [Link to design system]

---

## 🔄 Review & Iteration

**Weekly Reviews:**
- Design review: Tuesdays 2pm
- Code review: Thursdays 10am
- User testing: Fridays (biweekly)

**Feedback Loop:**
1. Implement feature
2. Create PR with screenshots
3. Get design approval
4. Merge to staging
5. User test
6. Iterate based on feedback

---

**Last Updated:** November 23, 2025  
**Next Review:** November 30, 2025
