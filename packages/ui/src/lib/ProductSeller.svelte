<script lang="ts">
  import * as i18n from '@repo/i18n';
  const m: any = i18n;
  import Avatar from './Avatar.svelte';
  import Badge from './Badge.svelte';

  interface Seller {
    id: string;
    username: string;
    avatar?: string;
    verified?: boolean;
    rating: number;
    salesCount: number;
    joinedAt: string;
  }

  interface Props {
    seller: Seller;
    isOwner?: boolean;
    onMessage?: () => void;
    onNavigate?: (url: string) => void;
    className?: string;
    variant?: 'default' | 'compact';
  }

  let { 
    seller,
    isOwner = false,
    onMessage,
    onNavigate,
    className = '',
    variant = 'default'
  }: Props = $props();

  // Computed properties
  const memberDuration = $derived(() => {
    const joinedDate = new Date(seller.joinedAt);
    const now = new Date();
    const diffInMonths = (now.getFullYear() - joinedDate.getFullYear()) * 12 + 
                        (now.getMonth() - joinedDate.getMonth());
    
    if (diffInMonths < 1) return 'New member';
    if (diffInMonths < 12) return `${diffInMonths}mo`;
    const years = Math.floor(diffInMonths / 12);
    return `${years}y`;
  });

  const ratingDisplay = $derived(() => {
    if (seller.rating === 0) return { stars: 0, text: 'No ratings' };
    return {
      stars: seller.rating,
      text: `${seller.rating.toFixed(1)} ★`
    };
  });

  const salesDisplay = $derived(() => {
    if (seller.salesCount === 0) return 'New seller';
    if (seller.salesCount === 1) return '1 sale';
    if (seller.salesCount < 100) return `${seller.salesCount} sales`;
    if (seller.salesCount < 1000) return `${Math.floor(seller.salesCount / 10) * 10}+ sales`;
    return `${Math.floor(seller.salesCount / 100)}K+ sales`;
  });

  function handleProfileClick() {
    onNavigate?.(`/seller/${seller.username}`);
  }

  function handleMessageClick() {
    onMessage?.();
  }

  // Generate star array for rating display
  const stars = $derived(() => {
    const starArray = [];
    const fullStars = Math.floor(seller.rating);
    const hasHalfStar = seller.rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        starArray.push('full');
      } else if (i === fullStars && hasHalfStar) {
        starArray.push('half');
      } else {
        starArray.push('empty');
      }
    }
    
    return starArray;
  });
</script>

<div class="seller-card {className} seller-card--{variant}" class:seller-card--owner={isOwner}>
  <!-- Header with Avatar and Basic Info -->
  <div class="seller-header">
    <button 
      class="seller-profile-button"
      onclick={handleProfileClick}
      type="button"
    >
      <Avatar 
        src={seller.avatar} 
        alt={`${seller.username}'s profile`}
        size={variant === 'compact' ? 'md' : 'lg'}
        class="seller-avatar"
      />
      
      <div class="seller-info">
        <div class="seller-name-row">
          <span class="seller-name">{seller.username}</span>
          {#if seller.verified}
            <div class="verified-badge">
              <svg class="verified-icon" viewBox="0 0 20 20">
                <path fill="currentColor" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
          {/if}
        </div>
        
        <!-- Rating Stars (visible only if has rating) -->
        {#if seller.rating > 0}
          <div class="rating-display">
            <div class="stars">
              {#each stars() as star}
                <svg class="star star--{star}" viewBox="0 0 20 20">
                  {#if star === 'full'}
                    <path fill="currentColor" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  {:else if star === 'half'}
                    <defs>
                      <linearGradient id="half-star-{seller.id}">
                        <stop offset="50%" stop-color="currentColor"/>
                        <stop offset="50%" stop-color="transparent"/>
                      </linearGradient>
                    </defs>
                    <path fill="url(#half-star-{seller.id})" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  {:else}
                    <path fill="none" stroke="currentColor" stroke-width="1" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  {/if}
                </svg>
              {/each}
            </div>
            <span class="rating-text">{ratingDisplay().text}</span>
          </div>
        {/if}
      </div>
    </button>

    <!-- Message Button -->
    {#if !isOwner}
      <button 
        class="message-button"
        onclick={handleMessageClick}
        type="button"
      >
        <svg class="message-icon" viewBox="0 0 20 20">
          <path fill="currentColor" d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
          <path fill="currentColor" d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
        </svg>
        <span class="message-text">Message</span>
      </button>
    {/if}
  </div>

  <!-- Stats Section (only in default variant) -->
  {#if variant === 'default'}
    <div class="seller-stats">
      <div class="stat-item">
        <span class="stat-label">Sales</span>
        <span class="stat-value">{salesDisplay()}</span>
      </div>
      
      <div class="stat-item">
        <span class="stat-label">Member</span>
        <span class="stat-value">{memberDuration()}</span>
      </div>
      
      {#if seller.rating > 0}
        <div class="stat-item">
          <span class="stat-label">Rating</span>
          <span class="stat-value">{seller.rating.toFixed(1)} ★</span>
        </div>
      {/if}
    </div>

    <!-- Trust Indicators -->
    <div class="trust-section">
      <div class="trust-item">
        <div class="trust-icon trust-icon--secure">
          <svg viewBox="0 0 20 20">
            <path fill="currentColor" d="M10 2L3 7v3c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-7-5z"/>
          </svg>
        </div>
        <div class="trust-content">
          <div class="trust-title">Secure messaging</div>
          <div class="trust-desc">Chat safely through Driplo</div>
        </div>
      </div>
      
      <div class="trust-item">
        <div class="trust-icon trust-icon--fast">
          <svg viewBox="0 0 20 20">
            <path fill="currentColor" d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
            <path fill="currentColor" fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="trust-content">
          <div class="trust-title">Fast response</div>
          <div class="trust-desc">Usually responds within hours</div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .seller-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    transition: all 0.2s;
  }

  .seller-card:hover:not(.seller-card--owner) {
    border-color: var(--border-strong);
    box-shadow: var(--shadow-sm);
  }

  .seller-card--compact {
    padding: var(--space-3);
    gap: var(--space-2);
  }

  .seller-card--owner {
    background: var(--surface-subtle);
    border-color: var(--border-subtle);
  }

  /* Header */
  .seller-header {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    justify-content: space-between;
  }

  .seller-profile-button {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    padding: var(--space-1);
    border-radius: var(--radius-lg);
    transition: all 0.2s;
    flex: 1;
    min-width: 0;
  }

  .seller-profile-button:hover {
    background: var(--surface-hover);
  }

  .seller-profile-button:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  .seller-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .seller-name-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .seller-name {
    font-weight: var(--font-weight-semibold);
    color: var(--text-strong);
    font-size: var(--font-size-base);
    line-height: var(--line-height-tight);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .verified-badge {
    flex-shrink: 0;
    color: var(--primary);
  }

  .verified-icon {
    width: 16px;
    height: 16px;
  }

  /* Rating Display */
  .rating-display {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .stars {
    display: flex;
    gap: 1px;
  }

  .star {
    width: 12px;
    height: 12px;
    color: var(--border-subtle);
  }

  .star--full {
    color: var(--warning);
  }

  .star--half {
    color: var(--warning);
  }

  .rating-text {
    font-size: var(--font-size-xs);
    color: var(--text-subtle);
    font-weight: var(--font-weight-medium);
  }

  /* Message Button */
  .message-button {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--primary);
    color: var(--primary-fg);
    border: none;
    border-radius: var(--radius-lg);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
    min-height: var(--touch-compact);
  }

  .message-button:hover {
    background: var(--primary-hover);
    transform: translateY(-1px);
  }

  .message-button:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  .message-icon {
    width: 16px;
    height: 16px;
  }

  .message-text {
    font-size: var(--font-size-sm);
  }

  /* Stats Section */
  .seller-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: var(--space-2);
    padding: var(--space-3);
    background: var(--surface-subtle);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-subtle);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    text-align: center;
  }

  .stat-label {
    font-size: var(--font-size-xs);
    color: var(--text-subtle);
    font-weight: var(--font-weight-medium);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stat-value {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--text-strong);
  }

  /* Trust Section */
  .trust-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .trust-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .trust-icon {
    width: var(--space-6);
    height: var(--space-6);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .trust-icon--secure {
    background: var(--success);
    color: var(--surface-base);
  }

  .trust-icon--fast {
    background: var(--blue-600);
    color: var(--surface-base);
  }

  .trust-icon svg {
    width: 14px;
    height: 14px;
  }

  .trust-content {
    flex: 1;
    min-width: 0;
  }

  .trust-title {
    font-weight: var(--font-weight-medium);
    color: var(--text-strong);
    font-size: var(--font-size-xs);
    margin-bottom: 2px;
  }

  .trust-desc {
    color: var(--text-subtle);
    font-size: var(--font-size-xs);
    line-height: var(--line-height-relaxed);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .seller-header {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-2);
    }

    .seller-profile-button {
      padding: 0;
    }

    .message-button {
      width: 100%;
      justify-content: center;
    }

    .seller-stats {
      grid-template-columns: repeat(2, 1fr);
    }

    .trust-item {
      gap: var(--space-2);
    }

    .trust-icon {
      width: var(--space-5);
      height: var(--space-5);
    }

    .trust-icon svg {
      width: 12px;
      height: 12px;
    }
  }

  @media (max-width: 480px) {
    .seller-card {
      padding: var(--space-3);
    }

    .seller-stats {
      padding: var(--space-2);
    }

    .stat-item {
      gap: 2px;
    }
  }

  /* High contrast support */
  @media (prefers-contrast: high) {
    .seller-card {
      border-width: 2px;
    }

    .verified-badge {
      border: 1px solid var(--primary);
      border-radius: var(--radius-sm);
      padding: 1px;
    }

    .trust-icon {
      border: 2px solid currentColor;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .seller-card,
    .seller-profile-button,
    .message-button {
      transition: none;
    }

    .message-button:hover {
      transform: none;
    }
  }

  /* Print styles */
  @media print {
    .seller-card {
      background: transparent;
      border: 1px solid #ccc;
    }

    .message-button,
    .trust-section {
      display: none;
    }
  }
</style>