<script lang="ts">
  import BuyBox from '../../BuyBox.svelte';
  import type { BuyBoxProduct, ProductPageEventHandlers } from '../../types';

  interface Props {
    product: BuyBoxProduct;
    isOwner: boolean;
    isAuthenticated: boolean;
    onBuyNow?: ProductPageEventHandlers['onBuyNow'];
    onMessage?: ProductPageEventHandlers['onMessage'];
    onMakeOffer?: ProductPageEventHandlers['onMakeOffer'];
    className?: string;
  }

  let {
    product,
    isOwner,
    isAuthenticated,
    onBuyNow,
    onMessage,
    onMakeOffer,
    className = ''
  }: Props = $props();
</script>

<div class="buybox-section {className}">
  <BuyBox
    {product}
    {isOwner}
    hasUser={isAuthenticated}
    {onBuyNow}
    {onMessage}
    {onMakeOffer}
    {className}
  />
</div>

<style>
  .buybox-section {
    display: none;
  }

  @media (min-width: 1024px) {
    .buybox-section {
      display: block;
      position: sticky;
      top: calc(var(--space-5) + 56px);
      align-self: start;
      z-index: 1;
    }
  }
</style>