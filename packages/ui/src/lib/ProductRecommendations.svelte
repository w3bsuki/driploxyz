<script lang="ts">
  interface Product {
    id: string
    title: string
    price: number
    condition?: string
    slug?: string
    images: string[]
    profiles?: {
      username: string
    }
    categories?: {
      slug: string
    }
  }

  interface Props {
    title: string
    products: Product[]
    currency?: string
  }

  let { title, products, currency = 'EUR' }: Props = $props()

  function formatPrice(price: number) {
    if (!price || price <= 0) return '€0'
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price)
  }

  function getProductUrl(product: Product) {
    if (product.slug && product.profiles?.username) {
      if (product.categories?.slug) {
        return `/product/${product.profiles.username}/${product.categories.slug}/${product.slug}`
      }
      return `/product/${product.profiles.username}/${product.slug}`
    }
    return `/product/${product.id}`
  }
</script>

{#if products?.length > 0}
  <div class="bg-surface-base py-6">
    <div class="px-4 mb-4">
      <h2 class="text-lg font-semibold text-text-primary">{title}</h2>
    </div>
    
    <div class="flex gap-3 overflow-x-auto px-4 scrollbar-hide">
      {#each products as product}
        <a 
          href={getProductUrl(product)}
          class="flex-shrink-0 w-40 group"
          data-sveltekit-preload-data="hover"
        >
          <!-- Product Image -->
          <div class="aspect-square w-full mb-2 overflow-hidden rounded-lg bg-surface-muted">
            {#if product.images?.[0]}
              <img 
                src={product.images[0]}
                alt={product.title || 'Product image'}
                class="w-full h-full object-cover"
                loading="lazy"
              />
            {:else}
              <div class="w-full h-full flex items-center justify-center">
                <svg class="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            {/if}
          </div>

          <!-- Product Info -->
          <div class="space-y-1">
            <h3 class="text-sm font-medium text-text-primary line-clamp-2 leading-tight">
              {product.title}
            </h3>
            
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-text-primary">
                {formatPrice(product.price)}
              </span>
              
              {#if product.condition}
                <span class="text-xs text-text-muted bg-surface-muted px-2 py-0.5 rounded">
                  {product.condition}
                </span>
              {/if}
            </div>
            
            {#if product.profiles?.username}
              <p class="text-xs text-text-secondary">
                by {product.profiles.username}
              </p>
            {/if}
          </div>
        </a>
      {/each}
    </div>
  </div>
{/if}

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .line-clamp-2 {
    /* Fallback */
    line-clamp: 2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>