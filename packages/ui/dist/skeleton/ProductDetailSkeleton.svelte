<script lang="ts">
  interface Props {
    class?: string;
  }
  
  let { class: className = '' }: Props = $props();
</script>

<div class="product-detail-skeleton {className}">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Image Gallery Skeleton -->
    <div class="space-y-4">
      <!-- Main Image -->
      <div class="relative aspect-square bg-gray-200 rounded-lg"></div>
      
      <!-- Thumbnail Grid -->
      <div class="grid grid-cols-4 gap-2">
        {#each Array(4) as _}
          <div class="relative aspect-square bg-gray-200 rounded-md"></div>
        {/each}
      </div>
    </div>

    <!-- Product Info Skeleton -->
    <div class="space-y-6">
      <!-- Header -->
      <div class="space-y-4">
        <!-- Brand and favorites -->
        <div class="flex justify-between items-start">
          <div class="h-5 bg-gray-200 rounded w-24"></div>
          <div class="h-6 w-6 bg-gray-200 rounded"></div>
        </div>
        
        <!-- Title -->
        <div class="space-y-2">
          <div class="h-7 bg-gray-200 rounded w-3/4"></div>
          <div class="h-7 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        <!-- Price -->
        <div class="h-8 bg-gray-200 rounded w-1/3"></div>
      </div>

      <!-- Product Details -->
      <div class="space-y-4">
        <!-- Size and Condition -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="h-4 bg-gray-200 rounded w-12 mb-2"></div>
            <div class="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div>
            <div class="h-4 bg-gray-200 rounded w-16 mb-2"></div>
            <div class="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <div class="h-4 bg-gray-200 rounded w-20 mb-3"></div>
          <div class="h-4 bg-gray-200 rounded w-full"></div>
          <div class="h-4 bg-gray-200 rounded w-5/6"></div>
          <div class="h-4 bg-gray-200 rounded w-4/5"></div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <div class="h-12 bg-gray-200 rounded-lg w-full"></div>
        <div class="h-10 bg-gray-200 rounded-lg w-full"></div>
      </div>

      <!-- Seller Info -->
      <div class="border-t pt-6">
        <div class="flex items-center space-x-3">
          <div class="h-12 w-12 bg-gray-200 rounded-full"></div>
          <div class="space-y-2 flex-1">
            <div class="h-4 bg-gray-200 rounded w-32"></div>
            <div class="h-3 bg-gray-200 rounded w-24"></div>
          </div>
          <div class="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Related Products -->
  <div class="mt-12 pt-8 border-t">
    <div class="h-6 bg-gray-200 rounded w-40 mb-6"></div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      {#each Array(4) as _}
        <div class="space-y-2">
          <div class="relative aspect-square bg-gray-200 rounded-lg"></div>
          <div class="h-3 bg-gray-200 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .product-detail-skeleton {
    position: relative;
    /* No animations - instant skeleton display */
  }
</style>