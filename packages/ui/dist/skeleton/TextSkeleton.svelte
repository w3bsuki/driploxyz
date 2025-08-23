<script lang="ts">
  interface Props {
    class?: string;
    lines?: number;
    variant?: 'paragraph' | 'heading' | 'caption' | 'list';
    width?: 'full' | 'auto' | string;
  }
  
  let { 
    class: className = '',
    lines = 3,
    variant = 'paragraph',
    width = 'auto'
  }: Props = $props();

  // Generate different widths for realistic text flow
  const getLineWidth = (index: number, total: number) => {
    if (width === 'full') return 'w-full';
    if (typeof width === 'string' && width !== 'auto') return width;
    
    switch (variant) {
      case 'heading':
        return index === 0 ? 'w-3/4' : 'w-1/2';
      case 'caption':
        return 'w-2/3';
      case 'list':
        return 'w-5/6';
      default: // paragraph
        if (index === total - 1) return 'w-2/3'; // Last line shorter
        if (index === 0) return 'w-full'; // First line full
        return index % 3 === 0 ? 'w-5/6' : 'w-full'; // Vary line lengths
    }
  };

  const getLineHeight = () => {
    switch (variant) {
      case 'heading':
        return 'h-6';
      case 'caption':
        return 'h-3';
      case 'list':
        return 'h-4';
      default:
        return 'h-4';
    }
  };

  const getSpacing = () => {
    switch (variant) {
      case 'heading':
        return 'space-y-3';
      case 'caption':
        return 'space-y-1';
      case 'list':
        return 'space-y-2';
      default:
        return 'space-y-2';
    }
  };
</script>

<div class="text-skeleton {className} {getSpacing()}">
  {#each Array(lines) as _, index}
    <div 
      class="bg-gray-200 rounded {getLineHeight()} {getLineWidth(index, lines)}"
      role="presentation"
      aria-hidden="true"
    ></div>
  {/each}
</div>

<style>
  .text-skeleton {
    position: relative;
    /* No animations - instant skeleton display */
  }
</style>