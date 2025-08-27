<!-- 
  SEO-Friendly Product Page
  This page handles all SEO-friendly product URLs and displays the product using the same component
  as the original product page for consistency.
-->

<script lang="ts">
  import ProductPage from '../product/[id]/+page.svelte';
  import type { PageData } from './$types';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
</script>

<!-- Use the existing product page component to maintain consistency -->
<ProductPage {data} />