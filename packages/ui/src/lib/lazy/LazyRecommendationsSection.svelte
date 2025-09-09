<script lang="ts">
  import { lazyLoad } from '../../utils/lazyLoad';
  import type { ProductData } from '../types/product';

  interface Props {
    products: ProductData[];
    title?: string;
    maxProducts?: number;
    onNavigate?: (url: string) => void;
    formatPrice?: (price: number) => string;
    translateCondition?: (condition: string) => string;
    translations?: {
      similarItems?: () => string;
      viewProduct?: (title: string, price: string) => string;
    };
  }

  let { 
    products = [], 
    title,
    maxProducts = 8,
    onNavigate,
    formatPrice,
    translateCondition,
    translations = {}
  }: Props = $props();

  // Dynamic import state
  let RecommendationsSection: any = $state(null);
  let isLoading = $state(false);
  let shouldLoad = $state(false);
  
  // Early exit if no products to show
  const hasProducts = $derived(products.length > 0);

  // Load the section when it enters viewport
  async function loadSection() {
    if (RecommendationsSection || isLoading) return;
    
    isLoading = true;
    
    try {
      const module = await import('../PDP/sections/RecommendationsSection.svelte');
      RecommendationsSection = module.default;
    } catch (error) {
      console.error('Failed to load RecommendationsSection:', error);
    } finally {
      isLoading = false;
    }
  }

  // Trigger loading when section enters viewport
  function handleIntersection() {
    shouldLoad = true;
    loadSection();
  }
</script>

{#if hasProducts}
  <div use:lazyLoad={handleIntersection}>
    {#if RecommendationsSection}
      <RecommendationsSection 
        {products}
        {title}
        {maxProducts}
        {onNavigate}
        {formatPrice}
        {translateCondition}
        {translations}
      />
    {:else if shouldLoad || isLoading}
      <!-- Skeleton loading state -->
      <section class="recommendations-skeleton" aria-label="Loading similar products">
        <div class="skeleton-title"></div>
        <div class="skeleton-grid">
          {#each Array(4) as _}
            <div class="skeleton-card">
              <div class="skeleton-image"></div>
              <div class="skeleton-content">
                <div class="skeleton-text skeleton-name"></div>
                <div class="skeleton-text skeleton-price"></div>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {:else}
      <!-- Placeholder to maintain layout -->
      <div class="recommendations-placeholder" style="height: 300px;"></div>
    {/if}
  </div>
{/if}

<style>
  .recommendations-skeleton {
    margin-top: var(--space-6);
    
    @media (max-width: 640px) {
      margin-top: var(--space-5);
    }
  }
  
  .skeleton-title {
    height: var(--text-lg);
    width: 200px;
    background: linear-gradient(90deg, var(--surface-subtle) 25%, var(--surface-base) 50%, var(--surface-subtle) 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
    border-radius: var(--radius-sm);
    margin-bottom: var(--space-3);
  }
  
  .skeleton-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
    
    @media (max-width: 640px) {
      gap: var(--space-2);
    }
    
    @media (min-width: 700px) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
  
  .skeleton-card {
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--surface-base);
  }
  
  .skeleton-image {
    aspect-ratio: 4/5;
    background: linear-gradient(90deg, var(--surface-subtle) 25%, var(--surface-base) 50%, var(--surface-subtle) 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
  }
  
  .skeleton-content {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    
    @media (max-width: 640px) {
      padding: 0.5rem;
    }
  }
  
  .skeleton-text {
    background: linear-gradient(90deg, var(--surface-subtle) 25%, var(--surface-base) 50%, var(--surface-subtle) 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
    border-radius: var(--radius-sm);
  }
  
  .skeleton-name {
    height: 1rem;
    width: 80%;
  }
  
  .skeleton-price {
    height: 1rem;
    width: 60%;
  }
  
  .recommendations-placeholder {
    margin-top: var(--space-6);
    visibility: hidden;
  }
  
  @keyframes skeleton-loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
  
  /* Respect reduced motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .skeleton-title,
    .skeleton-image,
    .skeleton-text {
      animation: none;
      background: var(--surface-subtle);
    }
  }
</style>