<script lang="ts">
  interface Props {
    class?: string;
  }
  
  let { class: className = '' }: Props = $props();
</script>

<div class="product-card-skeleton {className}" role="status" aria-label="Loading product...">
  <!-- Image skeleton -->
  <div class="relative aspect-square bg-[color:var(--surface-emphasis)] rounded-lg shimmer"></div>

  <!-- Content skeleton -->
  <div class="pt-2 space-y-0.5">
    <!-- Brand -->
    <div class="h-3 bg-[color:var(--surface-emphasis)] rounded w-16 shimmer"></div>

    <!-- Title -->
    <div class="h-4 bg-[color:var(--surface-emphasis)] rounded w-3/4 shimmer"></div>

    <!-- Size and condition -->
    <div class="h-3 bg-[color:var(--surface-emphasis)] rounded w-1/2 shimmer"></div>

    <!-- Price -->
    <div class="h-4 bg-[color:var(--surface-emphasis)] rounded w-1/3 shimmer"></div>
  </div>
</div>

<style>
  .product-card-skeleton {
    position: relative;
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