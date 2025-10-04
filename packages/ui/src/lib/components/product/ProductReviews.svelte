<script lang="ts">
  import * as i18n from '@repo/i18n';
  const m: any = i18n;
  import Avatar from '../ui/Avatar.svelte';
  import Badge from '../badges/Badge.svelte';
  // No lifecycle imports needed - using $effect

  interface Review {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    reviewer: {
      username: string;
      avatar?: string;
      verified?: boolean;
    };
    helpful?: boolean;
    helpfulCount?: number;
    images?: string[];
  }

  interface ReviewSummary {
    averageRating: number;
    totalReviews: number;
    breakdown: Record<number, number>;
  }

  interface Props {
    productId: string;
    sellerId: string;
    reviews?: Review[];
    summary?: ReviewSummary;
    canReview?: boolean;
    onWriteReview?: () => void;
    onLoadMore?: () => Promise<Review[]>;
    className?: string;
    loading?: boolean;
    hasMore?: boolean;
    variant?: 'default' | 'compact';
  }

  let { 
    productId,
    sellerId,
    reviews = [],
    summary,
    canReview = false,
    onWriteReview,
    onLoadMore,
    className = '',
    loading = false,
    hasMore = false,
    variant = 'default'
  }: Props = $props();

  // State management
  let expandedReviews = $state(new Set<string>());
  let sortBy = $state<'recent' | 'helpful' | 'rating'>('recent');
  let filterRating = $state<number | null>(null);
  let selectedImageModal = $state<{ images: string[], index: number } | null>(null);
  let isLoadingMore = $state(false);

  // Computed properties
  const hasReviews = $derived(reviews.length > 0);
  const hasImages = $derived(reviews.some(review => review.images && review.images.length > 0));

  const sortedAndFilteredReviews = $derived(() => {
    let filtered = reviews;

    // Filter by rating if selected
    if (filterRating !== null) {
      filtered = filtered.filter(review => review.rating === filterRating);
    }

    // Sort reviews
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'helpful':
          return (b.helpfulCount || 0) - (a.helpfulCount || 0);
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return sorted;
  });

  // Generate star array for rating display
  function generateStars(rating: number) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('full');
      } else if (i === fullStars && hasHalfStar) {
        stars.push('half');
      } else {
        stars.push('empty');
      }
    }
    
    return stars;
  }

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return m.reviews_today?.() || 'Today';
    if (diffInDays === 1) return m.reviews_yesterday?.() || 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  }

  function getProgressWidth(count: number, total: number) {
    return total > 0 ? (count / total) * 100 : 0;
  }

  function toggleReviewExpansion(reviewId: string) {
    if (expandedReviews.has(reviewId)) {
      expandedReviews.delete(reviewId);
    } else {
      expandedReviews.add(reviewId);
    }
    expandedReviews = new Set(expandedReviews);
  }

  function openImageModal(images: string[], index: number) {
    selectedImageModal = { images, index };
  }

  function closeImageModal() {
    selectedImageModal = null;
  }

  async function handleLoadMore() {
    if (!onLoadMore || isLoadingMore || !hasMore) return;
    
    try {
      isLoadingMore = true;
      await onLoadMore();
    } catch (error) {
      
    } finally {
      isLoadingMore = false;
    }
  }

  // Keyboard handler for image modal
  function handleKeydown(e: KeyboardEvent) {
    if (!selectedImageModal) return;

    switch (e.key) {
      case 'Escape':
        closeImageModal();
        break;
      case 'ArrowLeft':
        if (selectedImageModal.index > 0) {
          selectedImageModal = {
            ...selectedImageModal,
            index: selectedImageModal.index - 1
          };
        }
        break;
      case 'ArrowRight':
        if (selectedImageModal.index < selectedImageModal.images.length - 1) {
          selectedImageModal = {
            ...selectedImageModal,
            index: selectedImageModal.index + 1
          };
        }
        break;
    }
  }

  $effect(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<div class="reviews-container reviews--{variant} {className}">
  {#if summary && hasReviews}
    <!-- Reviews Summary -->
    <div class="reviews-summary">
      <div class="summary-header">
        <h3 class="section-title">Customer Reviews</h3>
        {#if canReview}
          <button class="write-review-btn" onclick={onWriteReview}>
            <svg class="btn-icon" viewBox="0 0 20 20">
              <path fill="currentColor" d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
            Write Review
          </button>
        {/if}
      </div>

      <div class="summary-content">
        <div class="rating-overview">
          <div class="average-rating">
            <span class="rating-number">{summary.averageRating.toFixed(1)}</span>
            <div class="rating-stars large">
              {#each generateStars(summary.averageRating) as star}
                <svg class="star star--{star}" viewBox="0 0 20 20">
                  {#if star === 'full'}
                    <path fill="currentColor" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  {:else if star === 'half'}
                    <defs>
                      <linearGradient id="half-star-summary">
                        <stop offset="50%" stop-color="currentColor"/>
                        <stop offset="50%" stop-color="transparent"/>
                      </linearGradient>
                    </defs>
                    <path fill="url(#half-star-summary)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  {:else}
                    <path fill="none" stroke="currentColor" stroke-width="1" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  {/if}
                </svg>
              {/each}
            </div>
            <span class="review-count">{summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}</span>
          </div>

          <div class="rating-breakdown">
            {#each [5, 4, 3, 2, 1] as rating}
              <button
                class="breakdown-row"
                class:breakdown-row--active={filterRating === rating}
                onclick={() => filterRating = filterRating === rating ? null : rating}
                type="button"
                aria-label={filterRating === rating ? `Clear ${rating} star filter` : `Filter by ${rating} star reviews`}
              >
                <span class="rating-label">{rating} star{rating !== 1 ? 's' : ''}</span>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    style="width: {getProgressWidth(summary.breakdown[rating], summary.totalReviews)}%"
                  ></div>
                </div>
                <span class="count-label">{summary.breakdown[rating]}</span>
              </button>
            {/each}
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Controls -->
  {#if hasReviews}
    <div class="reviews-controls">
      <div class="control-group">
        <label class="control-label" for="sort-select">Sort by:</label>
        <select 
          id="sort-select"
          class="sort-select"
          bind:value={sortBy}
        >
          <option value="recent">Most recent</option>
          <option value="helpful">Most helpful</option>
          <option value="rating">Highest rated</option>
        </select>
      </div>

      {#if filterRating !== null}
        <button 
          class="clear-filter-btn"
          onclick={() => filterRating = null}
        >
          <svg class="clear-icon" viewBox="0 0 20 20">
            <path fill="currentColor" d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
          </svg>
          Clear {filterRating}-star filter
        </button>
      {/if}
    </div>

    <!-- Reviews List -->
    <div class="reviews-list">
      {#each sortedAndFilteredReviews() as review (review.id)}
        <article class="review-card">
          <div class="review-header">
            <div class="reviewer-info">
              <Avatar 
                src={review.reviewer.avatar} 
                alt={`${review.reviewer.username}'s avatar`}
                size="sm"
              />
              <div class="reviewer-details">
                <div class="reviewer-name-row">
                  <span class="reviewer-name">{review.reviewer.username}</span>
                  {#if review.reviewer.verified}
                    <Badge variant="success" size="sm">
                      <svg class="verified-icon" viewBox="0 0 16 16">
                        <path fill="currentColor" d="M16 8A8 8 0 11-1.83e-06 8 8 8 0 0116 8zm-3.97-3.03a.75.75 0 00-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 00-1.06 1.061L6.97 11.03a.75.75 0 001.079-.02l3.992-4.99a.75.75 0 00-.01-1.05z"/>
                      </svg>
                      Verified
                    </Badge>
                  {/if}
                </div>
                
                <div class="review-meta">
                  <div class="rating-stars small">
                    {#each generateStars(review.rating) as star}
                      <svg class="star star--{star}" viewBox="0 0 20 20">
                        {#if star === 'full'}
                          <path fill="currentColor" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        {:else}
                          <path fill="none" stroke="currentColor" stroke-width="1" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        {/if}
                      </svg>
                    {/each}
                  </div>
                  <span class="review-date">{formatTimeAgo(review.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="review-content">
            <!-- Review Text -->
            <div class="review-text-container">
              <p 
                class="review-text"
                class:review-text--expanded={expandedReviews.has(review.id)}
              >
                {review.comment}
              </p>
              
              {#if review.comment.length > 200}
                <button 
                  class="expand-btn"
                  onclick={() => toggleReviewExpansion(review.id)}
                >
                  {expandedReviews.has(review.id) ? 'Show less' : 'Show more'}
                </button>
              {/if}
            </div>
            
            <!-- Review Images -->
            {#if review.images && review.images.length > 0}
              <div class="review-images">
                {#each review.images as image, index}
                  <button 
                    class="review-image-btn"
                    onclick={() => openImageModal(review.images || [], index)}
                  >
                    <img 
                      src={image} 
                      alt="Review image {index + 1}"
                      class="review-image"
                      loading="lazy"
                    />
                    <div class="image-overlay">
                      <svg class="expand-icon" viewBox="0 0 20 20">
                        <path fill="currentColor" d="M3 4a1 1 0 011-1h3a1 1 0 000 2H6.414l1.793 1.793a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zM3 16a1 1 0 01-1-1v-3a1 1 0 112 0v1.586l1.793-1.793a1 1 0 011.414 1.414L5 13.586H7a1 1 0 110 2H4a1 1 0 01-1 0zM17 4a1 1 0 00-1-1h-3a1 1 0 100 2h1.586l-1.793 1.793a1 1 0 001.414 1.414L15 6.414V8a1 1 0 102 0V4zM17 16a1 1 0 001-1v-3a1 1 0 10-2 0v1.586l-1.793-1.793a1 1 0 00-1.414 1.414L15 13.586H13a1 1 0 100 2h3a1 1 0 001 0z"/>
                      </svg>
                    </div>
                  </button>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Review Actions -->
          <div class="review-actions">
            <button 
              class="helpful-btn"
              class:helpful-btn--active={review.helpful}
            >
              <svg class="helpful-icon" viewBox="0 0 20 20">
                <path fill="none" stroke="currentColor" stroke-width="1.5" d="M7 10v12l4-1.5 4 1.5V10M7 10L6.5 7.7c-.2-.6-.3-1.3-.3-2C6.2 3.5 8 1.8 9.8 1.8c1 0 1.8.9 1.8 2v3.4h4.5c1.2 0 2.2 1 2 2.2l-1 5.5c-.1.8-.8 1.4-1.6 1.4H7"/>
              </svg>
              <span>Helpful</span>
              {#if review.helpfulCount && review.helpfulCount > 0}
                <Badge variant="secondary" size="sm">{review.helpfulCount}</Badge>
              {/if}
            </button>
          </div>
        </article>
      {/each}

      <!-- Load More Button -->
      {#if hasMore}
        <div class="load-more-container">
          <button 
            class="load-more-btn"
            onclick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {#if isLoadingMore}
              <svg class="loading-spinner" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="50.27" stroke-dashoffset="50.27" opacity="0.3"/>
                <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="25.13" stroke-dashoffset="25.13"/>
              </svg>
              Loading...
            {:else}
              Load More Reviews
            {/if}
          </button>
        </div>
      {/if}
    </div>
  {:else}
    <!-- No Reviews State -->
    <div class="no-reviews">
      <div class="no-reviews-content">
        <div class="no-reviews-icon">
          <svg viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" stroke-width="2"/>
            <path d="M22 34c0-5.5 4.5-10 10-10s10 4.5 10 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <circle cx="25" cy="28" r="2" fill="currentColor"/>
            <circle cx="39" cy="28" r="2" fill="currentColor"/>
          </svg>
        </div>
        <h3 class="no-reviews-title">No reviews yet</h3>
        <p class="no-reviews-text">Be the first to share your thoughts about this product.</p>
        {#if canReview}
          <button class="write-review-btn primary" onclick={onWriteReview}>
            Write First Review
          </button>
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- Image Modal -->
{#if selectedImageModal}
  <button
    type="button"
    class="image-modal-backdrop"
    onclick={closeImageModal}
    aria-label="Close image modal"
  >
    <div
      class="image-modal-content"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          closeImageModal();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Review image viewer"
      tabindex="0"
    >
      <button class="modal-close" onclick={closeImageModal} aria-label="Close image modal">
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path fill="currentColor" d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
        </svg>
      </button>

      <img
        src={selectedImageModal.images[selectedImageModal.index]}
        alt="Review image {selectedImageModal.index + 1}"
        class="modal-image"
      />

      {#if selectedImageModal.images.length > 1}
        <div class="modal-nav">
          <button
            class="modal-nav-btn modal-nav-btn--prev"
            onclick={() => selectedImageModal && selectedImageModal.index > 0 && (selectedImageModal = { ...selectedImageModal, index: selectedImageModal.index - 1 })}
            disabled={selectedImageModal.index === 0}
            aria-label="Previous image"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path fill="currentColor" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
            </svg>
          </button>

          <span class="modal-counter">
            {selectedImageModal.index + 1} of {selectedImageModal.images.length}
          </span>

          <button
            class="modal-nav-btn modal-nav-btn--next"
            onclick={() => selectedImageModal && selectedImageModal.index < selectedImageModal.images.length - 1 && (selectedImageModal = { ...selectedImageModal, index: selectedImageModal.index + 1 })}
            disabled={selectedImageModal.index === selectedImageModal.images.length - 1}
            aria-label="Next image"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path fill="currentColor" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
            </svg>
          </button>
        </div>
      {/if}
    </div>
  </button>
{/if}

<style>
  .reviews-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  /* Compact variant adjustments */
  .reviews--compact .reviews-summary {
    padding: var(--space-4);
  }
  .reviews--compact .section-title {
    font-size: var(--font-size-lg);
  }
  .reviews--compact .rating-number {
    font-size: var(--font-size-2xl);
  }
  .reviews--compact .rating-overview {
    gap: var(--space-4);
  }
  .reviews--compact .rating-stars.large .star {
    width: 16px;
    height: 16px;
  }
  .reviews--compact .write-review-btn {
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-sm);
  }
  .reviews--compact .review-text {
    font-size: var(--font-size-sm);
  }

  /* Reviews Summary */
  .reviews-summary {
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    padding: var(--space-5);
  }

  .summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
  }

  .section-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--text-strong);
    margin: 0;
  }

  .write-review-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: var(--primary);
    color: var(--primary-fg);
    border: none;
    border-radius: var(--radius-lg);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all 0.2s;
  }

  .write-review-btn:hover {
    background: var(--primary-hover);
    transform: translateY(-1px);
  }

  .write-review-btn.primary {
    padding: var(--space-4) var(--space-6);
    font-size: var(--font-size-base);
  }

  .btn-icon {
    width: 16px;
    height: 16px;
  }

  .rating-overview {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--space-6);
    align-items: start;
  }

  .average-rating {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    text-align: center;
  }

  .rating-number {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--text-strong);
  }

  .review-count {
    font-size: var(--font-size-sm);
    color: var(--text-subtle);
  }

  /* Stars */
  .rating-stars {
    display: flex;
    gap: var(--space-1);
  }

  .rating-stars.large {
    gap: var(--space-2);
  }

  .rating-stars.small {
    gap: 2px;
  }

  .star {
    fill: var(--border-subtle);
    transition: fill 0.2s;
  }

  .star--full {
    fill: var(--warning);
  }

  .star--half {
    fill: var(--warning);
  }

  .rating-stars.large .star {
    width: 20px;
    height: 20px;
  }

  .rating-stars.small .star {
    width: 14px;
    height: 14px;
  }

  /* Rating Breakdown */
  .rating-breakdown {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .breakdown-row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: var(--space-3);
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-2);
    border-radius: var(--radius-md);
    transition: all 0.2s;
  }

  .breakdown-row:hover {
    background: var(--surface-hover);
  }

  .breakdown-row--active {
    background: var(--primary);
    color: var(--primary-fg);
  }

  .rating-label {
    font-size: var(--font-size-sm);
    color: var(--text-subtle);
    white-space: nowrap;
  }

  .breakdown-row--active .rating-label,
  .breakdown-row--active .count-label {
    color: var(--primary-fg);
  }

  .progress-bar {
    height: 8px;
    background: var(--surface-subtle);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--warning);
    transition: width 0.3s;
  }

  .count-label {
    font-size: var(--font-size-sm);
    color: var(--text-subtle);
    min-width: 20px;
    text-align: right;
  }

  /* Controls */
  .reviews-controls {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    flex-wrap: wrap;
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .control-label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--text-strong);
  }

  .sort-select {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    background: var(--surface-base);
    color: var(--text-strong);
    font-size: var(--font-size-sm);
    cursor: pointer;
  }

  .clear-filter-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--surface-subtle);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    color: var(--text-strong);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all 0.2s;
  }

  .clear-filter-btn:hover {
    background: var(--surface-hover);
  }

  .clear-icon {
    width: 14px;
    height: 14px;
  }

  /* Reviews List */
  .reviews-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .review-card {
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    padding: var(--space-4);
    transition: all 0.2s;
  }

  .review-card:hover {
    border-color: var(--border-strong);
    box-shadow: var(--shadow-sm);
  }

  .review-header {
    margin-bottom: var(--space-3);
  }

  .reviewer-info {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .reviewer-details {
    flex: 1;
    min-width: 0;
  }

  .reviewer-name-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-1);
  }

  .reviewer-name {
    font-weight: var(--font-weight-semibold);
    color: var(--text-strong);
    font-size: var(--font-size-sm);
  }

  .verified-icon {
    width: 12px;
    height: 12px;
  }

  .review-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .review-date {
    font-size: var(--font-size-xs);
    color: var(--text-subtle);
  }

  /* Review Content */
  .review-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .review-text-container {
    position: relative;
  }

  .review-text {
    margin: 0;
    line-height: var(--line-height-relaxed);
    color: var(--text-base);
    display: -webkit-box;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .review-text--expanded {
    display: block;
    -webkit-line-clamp: none;
    line-clamp: none;
  }

  .expand-btn {
    background: none;
    border: none;
    color: var(--primary);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    margin-top: var(--space-2);
    transition: color 0.2s;
  }

  .expand-btn:hover {
    color: var(--primary-hover);
  }

  /* Review Images */
  .review-images {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: var(--space-2);
    max-width: 400px;
  }

  .review-image-btn {
    position: relative;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: var(--radius-lg);
    overflow: hidden;
    aspect-ratio: 1;
    transition: all 0.2s;
  }

  .review-image-btn:hover {
    transform: scale(1.05);
  }

  .review-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-overlay {
    position: absolute;
    inset: 0;
    background: color-mix(in oklch, var(--gray-900) 0%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    opacity: 0;
  }

  .review-image-btn:hover .image-overlay {
    background: color-mix(in oklch, var(--gray-900) 20%, transparent);
    opacity: 1;
  }

  .expand-icon {
    width: 20px;
    height: 20px;
    color: var(--gray-0);
  }

  /* Review Actions */
  .review-actions {
    display: flex;
    gap: var(--space-2);
    padding-top: var(--space-2);
    border-top: 1px solid var(--border-subtle);
  }

  .helpful-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--surface-subtle);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    color: var(--text-subtle);
    font-size: var(--font-size-xs);
    cursor: pointer;
    transition: all 0.2s;
  }

  .helpful-btn:hover {
    background: var(--surface-hover);
    border-color: var(--border-strong);
  }

  .helpful-btn--active {
    background: var(--primary);
    color: var(--primary-fg);
    border-color: var(--primary);
  }

  .helpful-icon {
    width: 16px;
    height: 16px;
  }

  /* Load More */
  .load-more-container {
    display: flex;
    justify-content: center;
    padding-top: var(--space-4);
  }

  .load-more-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-6);
    background: var(--surface-subtle);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    color: var(--text-strong);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all 0.2s;
  }

  .load-more-btn:hover:not(:disabled) {
    background: var(--surface-hover);
  }

  .load-more-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .loading-spinner {
    width: 16px;
    height: 16px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* No Reviews State */
  .no-reviews {
    padding: var(--space-8) var(--space-6);
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
  }

  .no-reviews-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-3);
  }

  .no-reviews-icon {
    width: var(--space-16);
    height: var(--space-16);
    color: var(--text-subtle);
  }

  .no-reviews-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--text-strong);
    margin: 0;
  }

  .no-reviews-text {
    color: var(--text-subtle);
    margin: 0;
  }

  /* Image Modal */
  .image-modal-backdrop {
    position: fixed;
    inset: 0;
    background: var(--gray-900);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    padding: 0;
  }

  .image-modal-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    cursor: default;
  }

  .modal-close {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    z-index: 101;
    width: var(--touch-icon);
    height: var(--touch-icon);
    background: var(--gray-900);
    color: var(--gray-0);
    border: none;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(8px);
  }

  .modal-close:hover {
    background: var(--gray-800);
    transform: scale(1.05);
  }

  .modal-close svg {
    width: 20px;
    height: 20px;
  }

  .modal-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: var(--radius-xl);
  }

  .modal-nav {
    position: absolute;
    bottom: var(--space-6);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-6);
    background: var(--gray-900);
    color: var(--gray-0);
    border-radius: var(--radius-full);
    backdrop-filter: blur(8px);
  }

  .modal-nav-btn {
    width: var(--touch-standard);
    height: var(--touch-standard);
    background: transparent;
    border: 1px solid var(--gray-600);
    border-radius: var(--radius-md);
    color: var(--gray-0);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .modal-nav-btn:hover:not(:disabled) {
    background: var(--gray-800);
    border-color: var(--gray-500);
  }

  .modal-nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .modal-nav-btn svg {
    width: 16px;
    height: 16px;
  }

  .modal-counter {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .rating-overview {
      grid-template-columns: 1fr;
      gap: var(--space-4);
    }

    .summary-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-3);
    }

    .write-review-btn {
      align-self: stretch;
      justify-content: center;
    }

    .review-images {
      grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    }

    .reviews-controls {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-2);
    }

    .control-group {
      justify-content: space-between;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .review-card,
    .write-review-btn,
    .helpful-btn,
    .review-image-btn {
      transition: none;
    }

    .loading-spinner {
      animation: none;
    }
  }
</style>
