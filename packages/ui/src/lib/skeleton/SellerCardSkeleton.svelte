<script lang="ts">
  interface Props {
    class?: string;
  }
  
  let { class: className = '' }: Props = $props();
</script>

<div class="seller-card-skeleton {className}" role="status" aria-label="Loading seller profile...">
  <!-- Avatar skeleton -->
  <div class="relative w-16 h-16 bg-[color:var(--surface-emphasis)] rounded-full shimmer"></div>

  <!-- Content skeleton -->
  <div class="flex-1 space-y-1">
    <!-- Username -->
    <div class="h-4 bg-[color:var(--surface-emphasis)] rounded w-24 shimmer"></div>

    <!-- Stats -->
    <div class="flex gap-4">
      <div class="h-3 bg-[color:var(--surface-emphasis)] rounded w-16 shimmer"></div>
      <div class="h-3 bg-[color:var(--surface-emphasis)] rounded w-12 shimmer"></div>
    </div>

    <!-- Location -->
    <div class="h-3 bg-[color:var(--surface-emphasis)] rounded w-20 shimmer"></div>
  </div>
</div>

<style>
  .seller-card-skeleton {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
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