<script lang="ts">
  interface Props {
    class?: string;
  }
  
  let { class: className = '' }: Props = $props();
</script>

<div class="seller-card-skeleton {className}">
  <!-- Avatar skeleton -->
  <div class="relative w-16 h-16 bg-gray-100 rounded-full overflow-hidden">
    <div class="skeleton-shimmer"></div>
  </div>
  
  <!-- Content skeleton -->
  <div class="flex-1 space-y-1">
    <!-- Username -->
    <div class="h-4 bg-gray-100 rounded w-24">
      <div class="skeleton-shimmer"></div>
    </div>
    
    <!-- Stats -->
    <div class="flex gap-4">
      <div class="h-3 bg-gray-100 rounded w-16">
        <div class="skeleton-shimmer"></div>
      </div>
      <div class="h-3 bg-gray-100 rounded w-12">
        <div class="skeleton-shimmer"></div>
      </div>
    </div>
    
    <!-- Location -->
    <div class="h-3 bg-gray-100 rounded w-20">
      <div class="skeleton-shimmer"></div>
    </div>
  </div>
</div>

<style>
  .seller-card-skeleton {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
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
    .seller-card-skeleton {
      animation: none;
    }
    
    .skeleton-shimmer {
      animation: none;
      background: rgba(0, 0, 0, 0.05);
    }
  }
</style>