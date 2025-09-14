<!--
  ProductCard with automatic view tracking
  Wraps the existing ProductCard with intersection observer
-->
<script lang="ts">
  import { trackView } from '$lib/utils/viewTracking.js';
  import ProductCard from './ProductCard.svelte';

  interface Props {
    product: any;
    supabase: any;
    userId?: string;
    viewTrackingOptions?: {
      threshold?: number;
      rootMargin?: string;
      debounceMs?: number;
    };
    // Pass through all ProductCard props
    [key: string]: any;
  }

  let {
    product,
    supabase,
    userId,
    viewTrackingOptions,
    ...productCardProps
  }: Props = $props();

  let cardElement: HTMLElement;
</script>

<div
  bind:this={cardElement}
  use:trackView={{
    productId: product.id,
    supabase,
    userId,
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