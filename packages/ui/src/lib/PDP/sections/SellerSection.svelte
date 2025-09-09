<script lang="ts">
  import Avatar from '../../Avatar.svelte';
  import Badge from '../../Badge.svelte';
  import Button from '../../Button.svelte';
  import * as i18n from '@repo/i18n';

  const m = i18n as any;

  interface Seller {
    id: string;
    username: string;
    avatar?: string;
    verified: boolean;
    rating: number;
    salesCount: number;
    joinedAt: string;
  }

  interface Props {
    seller: Seller;
    isOwner: boolean;
    onMessage?: () => void;
    onNavigate?: (url: string) => void;
    className?: string;
  }

  let { 
    seller, 
    isOwner, 
    onMessage, 
    onNavigate,
    className = '' 
  }: Props = $props();

  function handleViewProfile() {
    onNavigate?.(`/profile/${seller.username}`);
  }

  function handleMessage() {
    if (!isOwner) {
      onMessage?.();
    }
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };
</script>

<section class="seller-section {className}" id="seller-info">
  <div class="bg-white rounded-xl border border-gray-200 p-6">
    <div class="flex items-start justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-900">{m.product_seller()}</h2>
      {#if !isOwner}
        <button 
          class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          onclick={handleViewProfile}
        >
          {m.product_viewProfile()}
        </button>
      {/if}
    </div>

    <div class="flex items-center gap-4 mb-4">
      <Avatar 
        src={seller.avatar} 
        alt={seller.username}
        size="lg"
        fallback={seller.username.charAt(0).toUpperCase()}
      />
      
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1">
          <h3 class="font-medium text-gray-900">@{seller.username}</h3>
          {#if seller.verified}
            <Badge variant="success" size="sm">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              {m.seller_verified()}
            </Badge>
          {/if}
        </div>
        
        <div class="flex items-center gap-4 text-sm text-gray-600">
          <div class="flex items-center gap-1">
            <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
            <span>{formatRating(seller.rating)}</span>
          </div>
          
          <div class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <span>{seller.salesCount} {m.seller_sales()}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="text-sm text-gray-600 mb-4">
      {m.seller_memberFor()} {formatJoinDate(seller.joinedAt)}
    </div>

    {#if !isOwner}
      <div class="flex gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          class="flex-1"
          onclick={handleMessage}
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          {m.seller_message()}
        </Button>
        
        <Button 
          variant="primary" 
          size="sm" 
          class="flex-1"
          onclick={handleViewProfile}
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          {m.product_viewProfile()}
        </Button>
      </div>
    {/if}
  </div>
</section>

<style>
  .seller-section {
    @apply w-full;
  }
</style>