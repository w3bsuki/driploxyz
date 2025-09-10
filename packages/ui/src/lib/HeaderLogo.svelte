<script lang="ts">
  import { onMount } from 'svelte';
  
  let isVisible = $state(true);
  let logoRef = $state<HTMLElement>();
  
  onMount(() => {
    if (!logoRef) return;
    
    // Simple visibility optimization - pause when page hidden
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  });
</script>

<a href="/" class="flex items-center no-underline hover:no-underline" bind:this={logoRef}>
  <span class="text-xl sm:text-2xl font-extrabold leading-none tracking-tight text-[color:var(--text-primary)]">Driplo</span>
  <span class="emoji-carousel text-xl sm:text-2xl ml-0.5">
    <span class="emoji-track {isVisible ? 'animate' : 'paused'}">
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
    /* Use transform for GPU acceleration */
    will-change: transform;
  }
  
  .emoji-track.animate {
    /* Move exactly one emoji height per step (4 emojis => 0%, -25%, -50%, -75%) */
    animation: emoji-slide 8s steps(4, end) infinite;
  }
  
  .emoji-track.paused {
    animation-play-state: paused;
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
