<script lang="ts">
  interface Props {
    class?: string;
  }
  
  let { class: className = '' }: Props = $props();
</script>

<div class="seller-card-skeleton {className}">
  <!-- Avatar skeleton -->
  <div class="relative w-16 h-16 bg-gray-200 rounded-full"></div>
  
  <!-- Content skeleton -->
  <div class="flex-1 space-y-1">
    <!-- Username -->
    <div class="h-4 bg-gray-200 rounded w-24"></div>
    
    <!-- Stats -->
    <div class="flex gap-4">
      <div class="h-3 bg-gray-200 rounded w-16"></div>
      <div class="h-3 bg-gray-200 rounded w-12"></div>
    </div>
    
    <!-- Location -->
    <div class="h-3 bg-gray-200 rounded w-20"></div>
  </div>
</div>

<style>
  .seller-card-skeleton {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    /* No animations - instant skeleton display */
  }
</style>