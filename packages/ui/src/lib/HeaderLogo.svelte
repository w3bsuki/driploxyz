<script lang="ts">
  // No props needed - pure CSS animation
</script>

<a href="/" class="flex items-center">
  <span class="text-xl sm:text-2xl font-extrabold leading-none tracking-tight text-[color:var(--text-primary)]">Driplo</span>
  <span class="emoji-carousel text-xl sm:text-2xl ml-0.5">
    <span class="emoji-track">
      <span>👗</span>
      <span>👔</span>
      <span>👶</span>
      <span>🐕</span>
    </span>
  </span>
</a>

<style>
  .emoji-carousel {
    display: inline-block;
    width: 1.2em;
    height: 1.2em;
    overflow: hidden;
    vertical-align: bottom;
    position: relative;
  }

  .emoji-track {
    display: flex;
    flex-direction: column;
    /* Move exactly one emoji height per step (4 emojis => 0%, -25%, -50%, -75%) */
    animation: emoji-slide 8s steps(4, end) infinite;
    /* Use transform for GPU acceleration */
    will-change: transform;
  }

  .emoji-track span {
    height: 1.2em;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes emoji-slide {
    0% { transform: translateY(0); }
    100% { transform: translateY(-75%); }
  }

  /* Respect prefers-reduced-motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .emoji-track {
      animation: none;
    }
    .emoji-track span:not(:first-child) {
      display: none;
    }
  }
</style>
