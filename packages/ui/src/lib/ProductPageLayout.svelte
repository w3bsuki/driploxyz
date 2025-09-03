<script lang="ts">
  interface Props {
    children?: any
  }
  
  let { children }: Props = $props()
</script>

<div class="product-page">
  <div class="product-container">
    {@render children?.()}
  </div>
</div>

<style>
  .product-page {
    min-height: 100vh;
    background-color: var(--surface-base);
  }

  .product-container {
    /* Mobile-first: no padding, full width, stacked layout */
    width: 100%;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 768px) {
    .product-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--space-8);
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: var(--space-12);
    }
  }
</style>