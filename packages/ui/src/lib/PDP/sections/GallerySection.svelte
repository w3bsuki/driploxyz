<script lang="ts">
  import ProductGallery from '../../ProductGallery.svelte';
  import type { ProductData } from '../../types';

  interface Props {
    product: ProductData;
    onImageSelect?: (index: number) => void;
  }

  let {
    product,
    onImageSelect = (index: number) => console.log('Image selected:', index)
  }: Props = $props();
</script>

<div class="gallery-section">
  <ProductGallery
    images={product?.images || []}
    title={product?.title || ''}
    isSold={product?.is_sold || false}
    {onImageSelect}
    condition={product?.condition as any}
  />
</div>

<style>
  .gallery-section {
    margin: 0;
  }
</style>