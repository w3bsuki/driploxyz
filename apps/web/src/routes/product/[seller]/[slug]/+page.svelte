<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { ProductPageNew, SEOMetaTags } from '@repo/ui';
  import { buildProductUrl } from '$lib/utils/seo-urls.js';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  
  // Build canonical URL for this product
  const canonicalUrl = buildProductUrl({
    id: data.product.id,
    slug: data.product.slug!,
    seller_username: data.product.seller_username!,
    category_slug: data.product.category_slug
  });
  
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
  
  async function handleFavorite() {
    if (!data.user) {
      goto('/login');
      return;
    }
    
    try {
      const response = await fetch(`/api/favorites/${data.product.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Failed to toggle favorite
        return { favoriteCount: data.product.favorite_count, favorited: data.isFavorited };
      }
      
      const result = await response.json();
      return {
        favoriteCount: result.favoriteCount || data.product.favorite_count,
        favorited: result.favorited ?? !data.isFavorited
      };
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return { favoriteCount: data.product.favorite_count, favorited: data.isFavorited };
    }
  }

  // Generate SEO metadata
  const seoTitle = [
    data.product.brand,
    data.product.title,
    data.product.size && `Size ${data.product.size}`,
    data.product.condition
  ].filter(Boolean).join(' · ');
  
  const seoDescription = [
    data.product.description || `${data.product.title} by ${data.product.seller_name}`,
    data.product.brand && `Brand: ${data.product.brand}`,
    data.product.size && `Size: ${data.product.size}`,
    data.product.condition && `Condition: ${data.product.condition}`,
    `Price: €${data.product.price}`
  ].filter(Boolean).join(' · ').substring(0, 160);
  // A/B toggles via query params
  const imageInfoVariant = 'inline';
  const showQuickFacts = true;
</script>

<!-- SEO Meta Tags for perfect optimization -->
<SEOMetaTags
  title={seoTitle}
  description={seoDescription}
  url={canonicalUrl}
  image={data.product.images?.[0]}
  type="product"
  product={data.product}
  seller={data.product.seller}
  canonical={`https://driplo.xyz${canonicalUrl}`}
  preloadImages={data.product.images?.slice(0, 2) || []}
  enableImageOptimization={true}
/>

<!-- Product Page Component -->
<ProductPageNew 
  product={data.product}
  reviews={data.reviews || []}
  ratingSummary={data.ratingSummary}
  similarProducts={data.similarProducts || []}
  sellerProducts={data.sellerProducts || []}
  isOwner={data.isOwner}
  isAuthenticated={!!data.user}
  isFavorited={data.isFavorited || false}
  onFavorite={handleFavorite}
  onMessage={handleMessage}
  onBuyNow={handleBuyNow}
  imageInfoVariant={imageInfoVariant}
  showQuickFacts={showQuickFacts}
/>
