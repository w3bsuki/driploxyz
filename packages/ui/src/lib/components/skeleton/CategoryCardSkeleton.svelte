<script lang="ts">
  interface Props {
    class?: string;
  }
  
  let { class: className = '' }: Props = $props();
</script>

<div class="category-card-skeleton {className}">
  <!-- Image skeleton -->
  <div class="relative aspect-square bg-[color:var(--surface-emphasis)] rounded-lg"></div>
  
  <!-- Title skeleton -->
  <div class="mt-2 h-4 bg-[color:var(--surface-emphasis)] rounded w-3/4"></div>
</div>

<style>
  .category-card-skeleton {
    position: relative;
    /* No animations - instant skeleton display */
  }
</style>