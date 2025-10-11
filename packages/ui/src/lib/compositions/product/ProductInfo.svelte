<script lang="ts">
  import * as i18n from '@repo/i18n';
  import Badge from '../../primitives/badge/Badge.svelte';
  import FavoriteButton from '../../compositions/buttons/FavoriteButton.svelte';
  import ConditionBadge from '../../primitives/badge/ConditionBadge.svelte';
  import DescriptionList from '../../compositions/description/DescriptionList.svelte';
  import DescriptionTerm from '../../compositions/description/DescriptionTerm.svelte';
  import DescriptionDetails from '../../compositions/description/DescriptionDetails.svelte';
  import type { ProductInfoProps, ProductAttribute, TabConfiguration } from '../../types/panels';

  type ConditionType = 'brand_new_with_tags' | 'new_without_tags' | 'like_new' | 'good' | 'worn' | 'fair';

  function isValidCondition(condition: string): condition is ConditionType {
    return ['brand_new_with_tags', 'new_without_tags', 'like_new', 'good', 'worn', 'fair'].includes(condition);
  }

  let {
    title,
    brand,
    size,
    color,
    material,
    condition,
    description,
    favoriteCount,
    isFavorited,
    onFavorite,
    showQuickFacts = true,
    category,
    productId,
    seller,
    showSellerRow = false
  }: ProductInfoProps = $props();

  // State management
  let activeTab = $state('shipping');
  let showSizeGuide = $state(false);
  let showFacts = $state(true);

  // Computed properties
  const attributes = $derived.by(() => {
    const list: ProductAttribute[] = [];

    if (condition) {
      list.push({ key: 'condition', label: 'Condition', value: condition, type: 'badge' });
    }
    if (brand) {
      list.push({ key: 'brand', label: 'Brand', value: brand, type: 'badge' });
    }
    if (size) {
      list.push({ key: 'size', label: 'Size', value: size, type: 'text' });
    }
    if (color) {
      list.push({ key: 'color', label: 'Color', value: color, type: 'text' });
    }
    if (material) {
      list.push({ key: 'material', label: 'Material', value: material, type: 'text' });
    }
    if (category) {
      list.push({ key: 'category', label: 'Category', value: category, type: 'text' });
    }

    return list;
  });

  const hasDescription = $derived(description && description.trim().length > 0);
  const hasAttributes = $derived(showQuickFacts && attributes.length > 0);
  const showSizeGuideButton = $derived.by(() => {
    if (!category || !size) return false;
    const normalized = category.toLowerCase();
    return ['clothing', 'shoes', 'accessories'].some(cat => normalized.includes(cat));
  });

  // Seller info
  const joinedYear = $derived(seller?.joinedAt ? new Date(seller.joinedAt).getFullYear() : null);
  const sellerDisplayName = $derived(seller?.username ? `@${seller.username}` : null);

  // Tab configuration (move description out of tabs into its own container)
  const tabs = $derived.by(() => {
    const base: TabConfiguration[] = [
      { id: 'shipping', label: 'Shipping', count: 3, show: true },
      { id: 'details', label: 'Details', count: attributes.length, show: hasAttributes },
      { id: 'returns', label: 'Returns', count: 1, show: true }
    ];

    return base.filter(tab => tab.show);
  });

  function handleSizeGuide() {
    showSizeGuide = true;
    // In a real app, this would open a modal or navigate to size guide
    
  }

  // Show details by default on all screens for now
</script>

<div class="product-info">
  <!-- Title inside summary card -->
  <!-- Seller Info moved below description and attributes -->

  <!-- Summary Card: Title + Description (single column) -->
  <section class="summary-card" aria-labelledby="summary-heading">
    <h2 id="summary-heading" class="visually-hidden">Product summary</h2>
    {#if condition || brand || size}
      <div class="meta-inline" aria-label="Quick facts">
        {#if condition}
          <ConditionBadge condition={condition} />
        {/if}
        {#if brand}
          <span class="meta-sep">•</span>
          <Badge variant="secondary" size="sm">{brand}</Badge>
        {/if}
        {#if size}
          <span class="meta-sep">•</span>
          <span class="meta-size">Size {size}</span>
        {/if}
      </div>
    {/if}

    <h1 class="title">{title}</h1>
    {#if description && description.trim().length > 0}
      <p class="summary-desc">{description}</p>
    {/if}

    {#if !seller}
      <div class="summary-actions">
        <FavoriteButton 
          product={{ favorite_count: favoriteCount, id: productId }}
          favorited={isFavorited}
          onFavorite={onFavorite}
          absolute={false}
        />
      </div>
    {/if}
  </section>

  <!-- Facts Card: Condition, Size, Color, Brand, Material, Category -->
  {#if attributes.length > 0}
    <section class="facts-card" aria-labelledby="facts-heading">
      <h2 id="facts-heading" class="visually-hidden">Product details</h2>
      <DescriptionList>
        {#each attributes as attr}
          <DescriptionTerm>{attr.label}</DescriptionTerm>
          <DescriptionDetails>
            {#if attr.key === 'condition' && isValidCondition(attr.value)}
              <ConditionBadge condition={attr.value} />
            {:else}
              {attr.value}
            {/if}
          </DescriptionDetails>
        {/each}
      </DescriptionList>
    </section>
  {/if}

  <!-- Seller Info (optional; disabled by default to avoid duplication) -->
  {#if showSellerRow && seller}
    <div class="seller-row seller-card">
      <div class="seller-info">
        <div class="seller-avatar">
          {#if seller.avatar}
            <img src={seller.avatar} alt={seller.username} class="avatar-image" />
          {:else}
            <div class="avatar-placeholder">
              <svg viewBox="0 0 20 20" class="avatar-icon">
                <path fill="currentColor" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
              </svg>
            </div>
          {/if}
        </div>
        <div class="seller-details">
          <div class="seller-name">{sellerDisplayName}</div>
          {#if joinedYear}
            <div class="seller-joined">Joined {joinedYear}</div>
          {/if}
        </div>
      </div>
      <FavoriteButton 
        product={{ favorite_count: favoriteCount, id: productId }}
        favorited={isFavorited}
        onFavorite={onFavorite}
        absolute={false}
      />
    </div>
  {/if}

  <!-- Tab Navigation -->
  {#if tabs.length > 0}
    <div class="tabs-section">
      <div class="tab-nav" role="tablist">
        {#each tabs as tab}
          <button 
            class="tab-button"
            class:tab-button--active={activeTab === tab.id}
            onclick={() => activeTab = tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls="panel-{tab.id}"
            id="tab-{tab.id}"
          >
            <span class="tab-label">{tab.label}</span>
            {#if tab.count > 0}
              <Badge variant="subtle" size="xs" class="tab-count">{tab.count}</Badge>
            {/if}
          </button>
        {/each}
      </div>

      <div class="tab-content">
        <!-- Details Panel -->
        {#if activeTab === 'details' && hasAttributes}
          <div 
            class="tab-panel"
            id="panel-details"
            role="tabpanel"
            aria-labelledby="tab-details"
          >
            <div class="details-content">
              <div class="details-list">
                {#each attributes as attr}
                  <div class="detail-row">
                    <span class="detail-label">{attr.label}</span>
                    <span class="detail-value">{attr.value}</span>
                  </div>
                {/each}
              </div>
              
              {#if showSizeGuideButton}
                <button class="size-guide-button" onclick={handleSizeGuide}>
                  <svg viewBox="0 0 20 20" class="size-guide-icon">
                    <path fill="currentColor" d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zM2 15a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z"/>
                  </svg>
                  <span>Size Guide</span>
                  <svg viewBox="0 0 20 20" class="external-icon">
                    <path fill="currentColor" d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                    <path fill="currentColor" d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                  </svg>
                </button>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Description panel removed: description is shown in its own card above -->

        <!-- Shipping Panel -->
        {#if activeTab === 'shipping'}
          <div 
            class="tab-panel"
            id="panel-shipping"
            role="tabpanel"
            aria-labelledby="tab-shipping"
          >
            <div class="shipping-content">
              <div class="shipping-options">
                <div class="shipping-option">
                  <div class="shipping-icon">
                    <svg viewBox="0 0 20 20">
                      <path fill="currentColor" d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                      <path fill="currentColor" d="M3 4a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1H3zM6 4a1 1 0 011-1h8a1 1 0 011 1v5H6V4z"/>
                      <path fill="currentColor" d="M16 10h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v-5zM1 10h2v5H2a1 1 0 01-1-1v-3a1 1 0 011-1z"/>
                    </svg>
                  </div>
                  <div class="shipping-details">
                    <div class="shipping-title">Free Standard Shipping</div>
                    <div class="shipping-desc">Orders over €50 • 3-5 business days</div>
                  </div>
                  <div class="shipping-price">Free</div>
                </div>

                <div class="shipping-option">
                  <div class="shipping-icon">
                    <svg viewBox="0 0 20 20">
                      <path fill="currentColor" d="M13 7H7v6h6V7z"/>
                      <path fill="currentColor" fill-rule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2H3V5a2 2 0 012-2h2V2zM3 9v6a2 2 0 002 2h10a2 2 0 002-2V9H3z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div class="shipping-details">
                    <div class="shipping-title">Express Delivery</div>
                    <div class="shipping-desc">Next business day • Order before 2 PM</div>
                  </div>
                  <div class="shipping-price">€9.99</div>
                </div>

                <div class="shipping-option">
                  <div class="shipping-icon">
                    <svg viewBox="0 0 20 20">
                      <path fill="currentColor" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"/>
                      <path fill="currentColor" d="M9 12l2 2 4-4"/>
                    </svg>
                  </div>
                  <div class="shipping-details">
                    <div class="shipping-title">30-Day Returns</div>
                    <div class="shipping-desc">Free returns & exchanges</div>
                  </div>
                  <div class="shipping-badge">
                    <Badge variant="success" size="xs">Included</Badge>
                  </div>
                </div>
              </div>

              <div class="shipping-note">
                <svg viewBox="0 0 20 20" class="note-icon">
                  <path fill="currentColor" fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                </svg>
                <p class="note-text">
                  All items are shipped securely with tracking information. 
                  Delivery times may vary based on location and availability.
                </p>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- Size Guide Modal (placeholder) -->
{#if showSizeGuide}
  <div
    class="modal-backdrop"
    onclick={(e) => e.target === e.currentTarget && (showSizeGuide = false)}
    role="presentation"
  >
    <div
      class="modal-content"
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
      tabindex="-1"
    >
      <div class="modal-header">
        <h2 id="size-guide-title" class="modal-title">Size Guide</h2>
        <button class="modal-close" onclick={() => showSizeGuide = false} type="button" aria-label="Close size guide">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path fill="currentColor" d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <p>Size guide content would go here for {category} items.</p>
        <p>Selected size: {size}</p>
      </div>
    </div>
  </div>
{/if}

<style>
  .product-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    line-height: var(--line-height-tight);
    color: var(--text-strong);
    margin: 0;
    flex: 1;
  }


  /* Seller Row - Beautiful Styling */
  .seller-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-4);
    background: var(--surface-subtle);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    transition: all 0.2s ease;
  }

  .seller-row:hover {
    border-color: var(--border-strong);
  }

  .seller-info {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex: 1;
    min-width: 0;
  }

  .seller-avatar {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 2px 8px color-mix(in oklch, var(--shadow) 12%, transparent);
    border: 2px solid var(--surface-base);
    transition: transform 0.2s ease;
  }

  .seller-avatar:hover {
    transform: scale(1.05);
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--primary) 0%, color-mix(in oklch, var(--primary) 80%, var(--secondary)) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-fg);
  }

  .avatar-icon {
    width: 20px;
    height: 20px;
  }

  .seller-details {
    flex: 1;
    min-width: 0;
  }

  .seller-name {
    display: flex;
    align-items: center;
    gap: var(--space-1-5);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--text-strong);
    margin-bottom: var(--space-0-5);
    line-height: 1.3;
  }


  .seller-joined {
    font-size: var(--font-size-xs);
    color: var(--text-subtle);
    font-weight: var(--font-weight-normal);
  }



  .summary-actions { margin-top: var(--space-3); }

  /* Summary (title + description) */
  .summary-card {
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    padding: var(--space-4);
  }
  .summary-card .title { margin: 0 0 var(--space-2) 0; color: var(--text-strong); }
  .summary-desc {
    margin: 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
    color: var(--text-base);
    font-weight: var(--font-weight-normal);
  }

  .meta-inline {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
    margin-bottom: var(--space-2);
  }
  .meta-sep { color: var(--text-subtle); }
  .meta-size { font-size: var(--font-size-sm); color: var(--text-strong); }

  .visually-hidden {
    position: absolute !important;
    height: 1px; width: 1px;
    overflow: hidden;
    clip: rect(1px, 1px, 1px, 1px);
    white-space: nowrap;
  }





  /* Removed separate desc-card: description now in summary-card */

  .facts-card {
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    padding: var(--space-5);
  }
  /* facts use DescriptionList with Tailwind utilities */







  /* Tabs Section */
  .tabs-section {
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    overflow: hidden;
  }

  .tab-nav {
    display: flex;
    background: var(--surface-subtle);
    border-bottom: 1px solid var(--border-subtle);
    overflow-x: auto;
  }


  .tab-button {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-subtle);
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
    position: relative;
    min-height: var(--touch-standard);
  }

  .tab-button:hover {
    color: var(--text-strong);
    background: var(--surface-hover);
  }

  .tab-button--active {
    color: var(--primary);
    background: var(--surface-base);
  }

  .tab-button--active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--primary);
  }

  .tab-label {
    font-size: var(--font-size-sm);
  }


  .tab-content {
    padding: var(--space-4);
  }

  .tab-panel {
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Details Content */
  .details-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .details-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--border-subtle);
  }

  .detail-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .detail-label {
    color: var(--text-subtle);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-sm);
  }

  .detail-value {
    color: var(--text-strong);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-sm);
  }

  .size-guide-button {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--surface-subtle);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    color: var(--text-strong);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all 0.2s;
  }

  .size-guide-button:hover {
    background: var(--surface-hover);
    border-color: var(--border-strong);
    color: var(--primary);
  }

  .size-guide-icon,
  .external-icon {
    width: 16px;
    height: 16px;
  }



  /* Shipping Content */
  .shipping-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .shipping-options {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .shipping-option {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-3);
    background: var(--surface-subtle);
    border-radius: var(--radius-lg);
    transition: all 0.2s;
  }

  .shipping-option:hover {
    background: var(--surface-hover);
  }

  .shipping-icon {
    width: var(--space-8);
    height: var(--space-8);
    background: var(--primary);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .shipping-icon svg {
    width: 18px;
    height: 18px;
    color: var(--primary-fg);
  }

  .shipping-details {
    flex: 1;
    min-width: 0;
  }

  .shipping-title {
    font-weight: var(--font-weight-semibold);
    color: var(--text-strong);
    font-size: var(--font-size-sm);
    margin-bottom: var(--space-1);
  }

  .shipping-desc {
    color: var(--text-subtle);
    font-size: var(--font-size-xs);
    line-height: var(--line-height-relaxed);
  }

  .shipping-price {
    font-weight: var(--font-weight-bold);
    color: var(--success);
    font-size: var(--font-size-sm);
    align-self: center;
  }

  .shipping-badge {
    align-self: center;
  }

  .shipping-note {
    display: flex;
    gap: var(--space-2);
    padding: var(--space-3);
    background: var(--surface-subtle);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-subtle);
  }

  .note-icon {
    width: 18px;
    height: 18px;
    color: var(--text-subtle);
    flex-shrink: 0;
    margin-top: 2px;
  }

  .note-text {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--text-subtle);
    line-height: var(--line-height-relaxed);
  }

  /* Modal Styles */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: color-mix(in oklch, var(--gray-900) 50%, transparent);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
    border: none;
    cursor: pointer;
  }

  .modal-content {
    background: var(--surface-base);
    border-radius: var(--radius-xl);
    border: 1px solid var(--border-subtle);
    box-shadow: var(--shadow-2xl);
    max-width: 500px;
    width: 100%;
    max-height: 80vh;
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--border-subtle);
  }

  .modal-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--text-strong);
    margin: 0;
  }

  .modal-close {
    width: var(--touch-standard);
    height: var(--touch-standard);
    background: none;
    border: none;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-subtle);
  }

  .modal-close:hover {
    background: var(--surface-hover);
    color: var(--text-strong);
  }

  .modal-close svg {
    width: 18px;
    height: 18px;
  }

  .modal-body {
    padding: var(--space-5);
    color: var(--text-base);
    line-height: var(--line-height-relaxed);
  }

  /* Responsive Design */
  @media (max-width: 768px) {

    .seller-row {
      gap: var(--space-3);
    }

    .seller-avatar {
      width: var(--space-7);
      height: var(--space-7);
    }

    .seller-name {
      font-size: var(--font-size-xs);
    }

    .seller-joined {
      font-size: var(--font-size-xs);
    }


    .summary-card { padding: var(--space-4); }
    
    
    .tab-nav {
      padding: 0 var(--space-2);
    }
    
    .tab-button {
      padding: var(--space-2) var(--space-3);
    }
    
    .tab-content {
      padding: var(--space-3);
    }

    .shipping-option {
      flex-direction: column;
      text-align: center;
      gap: var(--space-2);
    }

    .shipping-icon {
      align-self: center;
    }
  }

  /* Small Mobile: tighten rhythm further */
  @media (max-width: 480px) {
    .product-info { gap: var(--space-3); }
    .summary-card,
    .facts-card { padding: var(--space-3); }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .tab-panel {
      animation: none;
    }
    
    .tab-button,
    .shipping-option,
    .size-guide-button {
      transition: none;
    }
  }
</style>
