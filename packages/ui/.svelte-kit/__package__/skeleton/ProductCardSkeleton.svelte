<script lang="ts">
  interface Props {
    class?: string;
  }
  
  let { class: className = '' }: Props = $props();
</script>

<div class="product-card-skeleton {className}">
  <!-- Image skeleton -->
  <div class="relative aspect-square bg-gray-200 rounded-lg"></div>
  
  <!-- Content skeleton -->
  <div class="pt-2 space-y-0.5">
    <!-- Brand -->
    <div class="h-3 bg-gray-200 rounded w-16"></div>
    
    <!-- Title -->
    <div class="h-4 bg-gray-200 rounded w-3/4"></div>
    
    <!-- Size and condition -->
    <div class="h-3 bg-gray-200 rounded w-1/2"></div>
    
    <!-- Price -->
    <div class="h-4 bg-gray-200 rounded w-1/3"></div>
  </div>
</div>

<style>
  .product-card-skeleton {
    position: relative;
    /* No animations - instant skeleton display */
  }
</style>