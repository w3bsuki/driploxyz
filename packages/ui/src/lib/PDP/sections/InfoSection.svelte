<script lang="ts">
  import ProductInfo from '../../ProductInfo.svelte';
  import TrustBadges from '../../TrustBadges.svelte';
  import type { ProductData, ProductPageEventHandlers } from '../../types/product';

  interface Props {
    product: ProductData;
    favoriteCount: number;
    isFavorited: boolean;
    onFavorite?: ProductPageEventHandlers['onFavorite'];
    showQuickFacts?: boolean;
    showTrustBadges?: boolean;
    className?: string;
  }

  let { 
    product,
    favoriteCount,
    isFavorited,
    onFavorite,
    showQuickFacts = true,
    showTrustBadges = false,
    className = ''
  }: Props = $props();

  // Handle favorite toggle
  async function handleFavorite() {
    if (onFavorite) {
      await onFavorite();
    }
  }
</script>

<section class="info-section {className}" id="product-info">
  <ProductInfo
    title={product.title || ''}
    brand={product.brand || undefined}
    size={product.size || undefined}
    color={product.color || undefined}
    material={product.material || undefined}
    description={product.description || undefined}
    favoriteCount={favoriteCount}
    isFavorited={isFavorited}
    onFavorite={handleFavorite}
    showQuickFacts={showQuickFacts}
    category={product.categories?.name || undefined}
  />
  
  {#if showTrustBadges}
    <div class="trust-badges-wrapper">
      <TrustBadges />
    </div>
  {/if}
</section>

<style>
  .info-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  
  .trust-badges-wrapper {
    border-top: 1px solid var(--border-subtle);
    padding-top: var(--space-4);
  }
  
  /* Desktop layout adjustments */
  @media (min-width: 1024px) {
    .info-section {
      background: var(--surface-base);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      padding: var(--space-4);
    }
  }
</style>