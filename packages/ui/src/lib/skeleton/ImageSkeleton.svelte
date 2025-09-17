<script lang="ts">
  interface Props {
    class?: string;
    aspectRatio?: 'square' | 'video' | 'auto' | string;
    width?: string;
    height?: string;
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showIcon?: boolean;
  }
  
  let { 
    class: className = '',
    aspectRatio = 'auto',
    width,
    height,
    rounded = 'md',
    showIcon = true
  }: Props = $props();

  const getRoundedClass = () => {
    switch (rounded) {
      case 'none': return '';
      case 'sm': return 'rounded-sm';
      case 'md': return 'rounded-md';
      case 'lg': return 'rounded-lg';
      case 'xl': return 'rounded-xl';
      case 'full': return 'rounded-full';
      default: return 'rounded-md';
    }
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case 'video': return 'aspect-video';
      case 'auto': return '';
      default: return aspectRatio; // Custom aspect ratio class
    }
  };

  const getContainerStyles = () => {
    let styles = '';
    if (width) styles += `width: ${width}; `;
    if (height) styles += `height: ${height}; `;
    return styles;
  };
</script>

<div
  class="image-skeleton bg-[color:var(--surface-emphasis)] overflow-hidden relative shimmer {className} {getRoundedClass()} {getAspectRatioClass()}"
  style={getContainerStyles()}
  role="status"
  aria-label="Loading image..."
>
  {#if showIcon}
    <div class="absolute inset-0 flex items-center justify-center">
      <svg
        class="w-8 h-8 text-[color:var(--text-tertiary)] opacity-50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="1.5" 
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" 
        />
      </svg>
    </div>
  {/if}
</div>

<style>
  .image-skeleton {
    position: relative;
    min-height: 3rem; /* Ensure minimum height for icon visibility */
  }

  .shimmer {
    position: relative;
    overflow: hidden;
  }

  .shimmer::before {
    content: '';
    position: absolute;
    top: 0;
    left: -150%;
    width: 150%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 100%
    );
    animation: shimmer 2s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% {
      left: -150%;
    }
    100% {
      left: 150%;
    }
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .shimmer::before {
      animation: none;
    }
  }
</style>