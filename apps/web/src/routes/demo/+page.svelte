<script lang="ts">
  import { ProductQuickView, HighlightQuickView } from '@repo/ui';
  import type { Product } from '@repo/ui';

  let showProductQuickView = $state(false);
  let showHighlightQuickView = $state(false);
  
  const sampleProduct: Product = {
    id: '1',
    title: 'Vintage Denim Jacket',
    price: 45.99,
    images: ['/placeholder-product.svg'],
    seller_name: 'fashionista_123',
    seller_avatar: null,
    seller_rating: 4.8,
    sizes: ['S', 'M', 'L'],
    condition: 'excellent',
    brand: 'Levi\'s'
  };
</script>

<div class="min-h-screen bg-gray-50 p-8">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Modal Demo Page</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- ProductQuickView Demo -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">ProductQuickView Modal</h2>
        <button 
          onclick={() => showProductQuickView = true}
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Open ProductQuickView
        </button>
        <p class="text-sm text-gray-600 mt-2">
          This is the original product modal with full features.
        </p>
      </div>

      <!-- HighlightQuickView Demo -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">HighlightQuickView Modal</h2>
        <button 
          onclick={() => showHighlightQuickView = true}
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Open HighlightQuickView
        </button>
        <p class="text-sm text-gray-600 mt-2">
          This is the compact modal for promoted products (280px max width).
        </p>
      </div>
    </div>

    <div class="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 class="font-semibold mb-2">Testing Instructions:</h3>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li>Test both modals to see which one looks better</li>
        <li>Check seller avatar functionality in HighlightQuickView</li>
        <li>Verify "Buy Now" button vs "Add to Bag" button</li>
        <li>Check mobile responsiveness (280px max width for HighlightQuickView)</li>
        <li>Decide which modal to keep and which to delete</li>
      </ul>
    </div>
  </div>
</div>

<!-- Modals -->
{#if showProductQuickView}
  <ProductQuickView 
    product={sampleProduct}
    isOpen={showProductQuickView}
    onClose={() => showProductQuickView = false}
    onBuy={() => {
      console.log('Add to cart clicked');
      showProductQuickView = false;
    }}
    onToggleFavorite={() => console.log('Toggle favorite clicked')}
  />
{/if}

{#if showHighlightQuickView}
  <HighlightQuickView 
    product={sampleProduct}
    onClose={() => showHighlightQuickView = false}
    onAddToCart={() => {
      console.log('Buy now clicked');
      showHighlightQuickView = false;
    }}
    onToggleFavorite={() => console.log('Toggle favorite clicked')}
  />
{/if}