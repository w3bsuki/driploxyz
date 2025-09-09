<script lang="ts">
  import ProductCard from '../../ProductCard.svelte';
  import * as i18n from '@repo/i18n';

  const m = i18n as any;

  interface Product {
    id: string;
    title: string;
    slug: string;
    price: number;
    condition: string;
    images: Array<{ url: string; alt_text?: string }>;
  }

  interface Props {
    title: string;
    products: Product[];
    onNavigate?: (url: string) => void;
    className?: string;
  }

  let { 
    title, 
    products, 
    onNavigate,
    className = '' 
  }: Props = $props();

  function handleProductClick(product: Product) {
    onNavigate?.(`/product/${product.slug}`);
  }
</script>

<section class="recommendations-section {className}" id="recommendations">
  <div class="mb-6">
    <h2 class="text-xl font-semibold text-[color:var(--text-primary)] mb-2">{title}</h2>
    <p class="text-[color:var(--text-secondary)]">Discover more products</p>
  </div>

  {#if products.length > 0}
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {#each products as product (product.id)}
        <div 
          class="cursor-pointer"
          onclick={() => handleProductClick(product)}
          role="button"
          tabindex="0"
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleProductClick(product);
            }
          }}
        >
          <ProductCard
            id={product.id}
            title={product.title}
            price={product.price}
            condition={product.condition}
            images={product.images}
            slug={product.slug}
            showQuickActions={false}
            class="h-full"
          />
        </div>
      {/each}
    </div>
  {:else}
    <div class="text-center py-12">
      <svg class="w-12 h-12 text-[color:var(--text-muted)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
      </svg>
      <p class="text-[color:var(--text-muted)]">{m.empty_noProducts()}</p>
    </div>
  {/if}
</section>

<style>
  .recommendations-section {
    @apply w-full;
  }
</style>
