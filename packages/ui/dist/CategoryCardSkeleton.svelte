<script lang="ts">
  interface Props {
    class?: string;
  }
  
  let { class: className = '' }: Props = $props();
</script>

<div class="category-card-skeleton {className}">
  <!-- Image skeleton -->
  <div class="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
    <div class="skeleton-shimmer"></div>
  </div>
  
  <!-- Title skeleton -->
  <div class="mt-2 h-4 bg-gray-100 rounded w-3/4">
    <div class="skeleton-shimmer"></div>
  </div>
</div>

<style>
  .category-card-skeleton {
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

  @media (prefers-reduced-motion: reduce) {
    .category-card-skeleton {
      animation: none;
    }
    
    .skeleton-shimmer {
      animation: none;
      background: rgba(0, 0, 0, 0.05);
    }
  }
</style>