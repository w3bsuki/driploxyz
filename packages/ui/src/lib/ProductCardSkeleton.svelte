<script lang="ts">
  interface Props {
    class?: string;
  }
  
  let { class: className = '' }: Props = $props();
</script>

<div class="product-card-skeleton {className}">
  <!-- Image skeleton -->
  <div class="relative aspect-square bg-gray-100 overflow-hidden rounded-lg">
    <div class="skeleton-shimmer"></div>
  </div>
  
  <!-- Content skeleton -->
  <div class="pt-2 space-y-0.5">
    <!-- Brand -->
    <div class="h-3 bg-gray-100 rounded w-16">
      <div class="skeleton-shimmer"></div>
    </div>
    
    <!-- Title -->
    <div class="h-4 bg-gray-100 rounded w-3/4">
      <div class="skeleton-shimmer"></div>
    </div>
    
    <!-- Size and condition -->
    <div class="h-3 bg-gray-100 rounded w-1/2">
      <div class="skeleton-shimmer"></div>
    </div>
    
    <!-- Price -->
    <div class="h-4 bg-gray-100 rounded w-1/3">
      <div class="skeleton-shimmer"></div>
    </div>
  </div>
</div>

<style>
  .product-card-skeleton {
    position: relative;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .skeleton-shimmer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      110deg,
      transparent 0%,
      transparent 40%,
      rgba(255, 255, 255, 0.7) 50%,
      rgba(255, 255, 255, 0.9) 55%,
      rgba(255, 255, 255, 0.7) 60%,
      transparent 70%,
      transparent 100%
    );
    animation: shimmer 1.5s ease-in-out infinite;
    transform: translateX(-100%);
    will-change: transform;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: .8;
    }
  }

  /* Accessibility and reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .product-card-skeleton {
      animation: none;
    }
    
    .skeleton-shimmer {
      animation: none;
      background: rgba(0, 0, 0, 0.05);
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .skeleton-shimmer {
      background: linear-gradient(
        110deg,
        transparent 0%,
        transparent 40%,
        rgba(0, 0, 0, 0.1) 50%,
        rgba(0, 0, 0, 0.15) 55%,
        rgba(0, 0, 0, 0.1) 60%,
        transparent 70%,
        transparent 100%
      );
    }
  }
</style>