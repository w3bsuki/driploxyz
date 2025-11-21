<script lang="ts">
  interface Props {
    class?: string;
    showAvatar?: boolean;
    showImage?: boolean;
    lineCount?: number;
    variant?: 'default' | 'compact' | 'detailed';
  }
  
  let { 
    class: className = '',
    showAvatar = false,
    showImage = false,
    lineCount = 2,
    variant = 'default'
  }: Props = $props();

  // Generate array for text lines
  const textLines = Array(lineCount).fill(null);
</script>

<div class="list-item-skeleton {className} {variant}">
  <div class="flex items-center space-x-3 p-4">
    <!-- Avatar -->
    {#if showAvatar}
      <div class="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full"></div>
    {/if}

    <!-- Image (for product listings) -->
    {#if showImage}
      <div class="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-lg"></div>
    {/if}

    <!-- Content -->
    <div class="flex-1 min-w-0 space-y-2">
      {#each textLines as _, index}
        <div 
          class="h-4 bg-gray-200 rounded
            {index === 0 ? 'w-full' : ''}
            {index === 1 ? 'w-3/4' : ''}
            {index === 2 ? 'w-2/3' : ''}
            {index > 2 ? 'w-1/2' : ''}"
        ></div>
      {/each}
      
      {#if variant === 'detailed'}
        <!-- Additional details for detailed variant -->
        <div class="flex items-center space-x-2 mt-2">
          <div class="h-3 bg-gray-200 rounded w-16"></div>
          <div class="h-3 bg-gray-200 rounded w-12"></div>
        </div>
      {/if}
    </div>

    <!-- Action/Price -->
    <div class="flex-shrink-0">
      <div 
        class={{
          'bg-gray-200 rounded': true,
          'h-8 w-16': variant === 'compact',
          'h-10 w-20': variant !== 'compact'
        }}
      ></div>
    </div>
  </div>
</div>

<style>
  .list-item-skeleton {
    position: relative;
    border-radius: 0.5rem;
    background-color: white;
    /* No animations - instant skeleton display */
  }

  .list-item-skeleton.compact .flex {
    padding: 0.75rem;
  }
</style>