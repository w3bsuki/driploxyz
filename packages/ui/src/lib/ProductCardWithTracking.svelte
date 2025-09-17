<!--
  ProductCard with automatic view tracking
  Wraps the existing ProductCard with intersection observer
-->
<script lang="ts">
  import { trackView, type ViewTrackingOptions, type ViewTrackingData } from './utils/viewTracking.js';
  import ProductCard from './ProductCard.svelte';
  import type { Product } from './types/product';

  interface Props {
    product: Product;
    userId?: string;
    onView?: (data: ViewTrackingData) => void;
    viewTrackingOptions?: ViewTrackingOptions;
    // Pass through all ProductCard props
    [key: string]: any;
  }

  let {
    product,
    userId,
    onView,
    viewTrackingOptions,
    ...productCardProps
  }: Props = $props();

  // Default view handler - logs to console in development
  function handleView(data: ViewTrackingData) {
    // Call user-provided handler
    onView?.(data);

    // Default behavior - log in development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('[ViewTracking] Product viewed:', {
        productId: data.productId,
        userId: data.userId,
        timestamp: data.metadata?.timestamp
      });
    }
  }
</script>

<div
  use:trackView={{
    productId: product.id,
    userId,
    onView: handleView,
    options: viewTrackingOptions
  }}
  class="product-card-wrapper"
>
  <ProductCard {product} {...productCardProps} />
</div>

<style>
  .product-card-wrapper {
    /* Ensure the wrapper takes full dimensions for proper intersection detection */
    display: contents;
  }
</style>