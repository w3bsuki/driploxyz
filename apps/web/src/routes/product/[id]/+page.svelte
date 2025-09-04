<script lang="ts">
  import { goto } from '$app/navigation';
  import { ProductPage } from '@repo/ui';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  
  // Handle navigation and actions
  function handleMessage() {
    if (data.user) {
      goto(`/messages?seller=${data.product.seller_id}`);
    } else {
      goto('/login');
    }
  }
  
  function handleBuyNow() {
    if (data.user) {
      // Navigate to checkout or handle purchase
      goto(`/checkout?product=${data.product.id}`);
    } else {
      goto('/login');
    }
  }
  
  function handleFavorite() {
    if (!data.user) {
      goto('/login');
      return;
    }
    
    // Handle favoriting logic
    // This would typically call an API endpoint
    console.log('Toggle favorite for product:', data.product.id);
  }
  // A/B toggles via query params (legacy id route)
  const imageInfoVariant = 'inline';
  const showQuickFacts = true;
</script>

<ProductPage 
  product={data.product}
  reviews={data.reviews || []}
  ratingSummary={data.ratingSummary}
  similarProducts={data.sellerProducts || []}
  isOwner={data.user?.id === data.product.seller_id}
  isAuthenticated={!!data.user}
  isFavorited={data.isFavorited || false}
  onFavorite={handleFavorite}
  onMessage={handleMessage}
  onBuyNow={handleBuyNow}
  imageInfoVariant={imageInfoVariant}
  showQuickFacts={showQuickFacts}
/>
