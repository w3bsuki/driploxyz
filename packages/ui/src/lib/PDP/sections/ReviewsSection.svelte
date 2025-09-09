<script lang="ts">
  import RatingSummary from '../../RatingSummary.svelte';
  import ReviewDisplay from '../../ReviewDisplay.svelte';
  import Button from '../../Button.svelte';
  import * as i18n from '@repo/i18n';

  const m = i18n as any;

  interface Props {
    productId: string;
    sellerId: string;
    className?: string;
  }

  let { 
    productId, 
    sellerId,
    className = '' 
  }: Props = $props();

  // Mock data - in real implementation, this would come from server
  let reviews = $state([
    {
      id: '1',
      reviewer: { 
        id: 'user1',
        username: 'fashionista23', 
        full_name: 'Sarah Johnson',
        avatar_url: null 
      },
      rating: 5,
      title: 'Excellent quality!',
      comment: 'Perfect condition, exactly as described. Fast shipping and great communication!',
      image_urls: null,
      created_at: '2024-01-15',
      product: null
    },
    {
      id: '2', 
      reviewer: { 
        id: 'user2',
        username: 'stylequeen', 
        full_name: null,
        avatar_url: null 
      },
      rating: 4,
      title: null,
      comment: 'Love this piece! Seller was very responsive and item arrived quickly.',
      image_urls: null,
      created_at: '2024-01-10',
      product: null
    }
  ]);

  let ratingSummary = $state({
    averageRating: 4.5,
    totalReviews: 2,
    distribution: {
      5: 1,
      4: 1,
      3: 0,
      2: 0,
      1: 0
    }
  });

  let showAllReviews = $state(false);

  function toggleReviews() {
    showAllReviews = !showAllReviews;
  }

  function handleWriteReview() {
    // Navigate to review form or open modal
    console.log('Write review clicked');
  }
</script>

<section class="reviews-section {className}" id="reviews">
  <div class="bg-white rounded-xl border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900">{m.pdp_reviews()}</h2>
      <Button 
        variant="outline" 
        size="sm"
        onclick={handleWriteReview}
      >
        {m.pdp_writeReview()}
      </Button>
    </div>

    {#if ratingSummary.totalReviews > 0}
      <!-- Rating Summary -->
      <div class="mb-6">
        <RatingSummary 
          stats={ratingSummary}
        />
      </div>

      <!-- Reviews List -->
      <div class="space-y-4">
        {#each (showAllReviews ? reviews : reviews.slice(0, 2)) as review (review.id)}
          <ReviewDisplay
            {review}
          />
        {/each}
      </div>

      <!-- Show More/Less Button -->
      {#if reviews.length > 2}
        <div class="mt-4 text-center">
          <button 
            class="text-blue-600 hover:text-blue-700 font-medium text-sm"
            onclick={toggleReviews}
          >
            {showAllReviews ? m.product_showLess() : `Show all ${reviews.length} reviews`}
          </button>
        </div>
      {/if}
    {:else}
      <!-- No Reviews State -->
      <div class="text-center py-8">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">{m.profile_noReviewsYet()}</h3>
        <p class="text-gray-600 mb-4">Be the first to review this seller</p>
        <Button 
          variant="primary" 
          size="sm"
          onclick={handleWriteReview}
        >
          {m.pdp_writeReview()}
        </Button>
      </div>
    {/if}
  </div>
</section>

<style>
  .reviews-section {
    @apply w-full;
  }
</style>