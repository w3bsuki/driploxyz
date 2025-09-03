<script lang="ts">
  interface Review {
    id: string | number
    rating: number
    comment: string
    created_at: string
    reviewer?: {
      id: string
      username: string
      avatar_url?: string
    }
    reviewer_name?: string
  }

  interface RatingSummary {
    averageRating: number
    totalReviews: number
  }

  interface Seller {
    id: string
    username: string
    full_name?: string
    avatar_url?: string
    rating?: number
    bio?: string
    created_at: string
    sales_count?: number
  }

  interface Props {
    seller: Seller
    ratingSummary?: RatingSummary | null
    reviews?: Review[]
    isOwner?: boolean
    onMessage?: () => void
  }

  let { seller, ratingSummary, reviews = [], isOwner = false, onMessage }: Props = $props()

  const displayName = $derived(seller?.full_name || seller?.username || 'Unknown Seller')
  const memberSince = $derived(
    !seller?.created_at 
      ? 'Recently joined' 
      : new Date(seller.created_at).toLocaleDateString('bg-BG', { 
          year: 'numeric', 
          month: 'long' 
        })
  );

  const displayRating = $derived(ratingSummary?.averageRating || seller?.rating || 0)
  const reviewCount = $derived(ratingSummary?.totalReviews || 0)
  
  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return '1 day ago'
    if (days < 30) return `${days} days ago`
    if (days < 365) return `${Math.floor(days / 30)} months ago`
    return `${Math.floor(days / 365)} years ago`
  }

  function renderStars(rating: number) {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating)
    }
    return stars
  }
</script>

{#if seller}
<div class="bg-surface-base p-4 border-b border-border-subtle">
  <!-- Seller Info -->
  <div class="flex items-start gap-3 mb-4">
    <!-- Avatar -->
    <div class="flex-shrink-0">
      {#if seller.avatar_url}
        <img 
          src={seller.avatar_url} 
          alt={displayName}
          class="w-12 h-12 rounded-full object-cover"
        />
      {:else}
        <div class="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center">
          <span class="text-lg font-semibold text-text-secondary">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>
      {/if}
    </div>

    <!-- Info -->
    <div class="flex-1">
      <h3 class="font-semibold text-text-primary">{displayName}</h3>
      <p class="text-sm text-text-secondary">Member since {memberSince}</p>
      
      <!-- Stats Row -->
      <div class="flex items-center gap-4 mt-2">
        {#if displayRating > 0}
          <div class="flex items-center gap-1">
            <div class="flex">
              {#each renderStars(Math.round(displayRating)) as filled}
                <svg class="w-4 h-4 {filled ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              {/each}
            </div>
            <span class="text-sm text-text-secondary">
              {displayRating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        {/if}
        
        {#if seller?.sales_count}
          <span class="text-sm text-text-secondary">
            {seller.sales_count} sales
          </span>
        {/if}
      </div>
    </div>

    <!-- Message Button -->
    {#if !isOwner && onMessage}
      <button
        class="px-4 py-2 rounded-lg border border-border-default bg-surface-base text-text-primary text-sm font-medium"
        onclick={onMessage}
        type="button"
      >
        Message
      </button>
    {/if}
  </div>

  <!-- Bio -->
  {#if seller?.bio}
    <p class="text-sm text-text-secondary mb-4">{seller.bio}</p>
  {/if}

  <!-- Recent Reviews -->
  {#if reviews.length > 0}
    <div>
      <h4 class="text-sm font-semibold text-text-primary mb-3">Recent Reviews</h4>
      <div class="space-y-3">
        {#each reviews.slice(0, 3) as review}
          <div class="bg-surface-subtle rounded-lg p-3">
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-2">
                <div class="flex">
                  {#each renderStars(review.rating) as filled}
                    <svg class="w-3 h-3 {filled ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  {/each}
                </div>
                <span class="text-xs text-text-secondary">{review.reviewer?.username || review.reviewer_name || 'Anonymous'}</span>
              </div>
              <span class="text-xs text-text-muted">{formatTimeAgo(review.created_at)}</span>
            </div>
            <p class="text-sm text-text-primary">{review.comment}</p>
          </div>
        {/each}
      </div>
      
      {#if reviews.length > 3}
        <button 
          class="mt-3 text-sm text-text-link font-medium"
          type="button"
        >
          View all {reviewCount} reviews
        </button>
      {/if}
    </div>
  {/if}
</div>
{/if}