<script lang="ts">
  // No lifecycle imports needed - using $effect

  interface Props {
    subtitle?: string;
    size?: 'sm' | 'md' | 'lg';
  }

  let { subtitle, size = 'md' }: Props = $props();

  let isVisible = $state(true);
  let logoRef = $state<HTMLElement>();

  $effect(() => {
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

  // Tech startup typography using design system tokens - balanced with header elements
  const logoClasses = {
    sm: 'text-xl sm:text-2xl font-semibold leading-tight tracking-tight',
    md: 'text-xl sm:text-2xl md:text-3xl font-semibold leading-tight tracking-tight',
    lg: 'text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight tracking-tight'
  };

  const subtitleClasses = {
    sm: 'text-xs font-medium tracking-wide',
    md: 'text-sm font-medium tracking-wide',
    lg: 'text-base font-medium tracking-wide'
  };
</script>

<a
  href="/"
  class="flex {subtitle ? 'flex-col items-start' : 'items-center'} no-underline hover:no-underline group transition-opacity duration-200"
  bind:this={logoRef}
>
  <span class="{logoClasses[size]} text-[color:var(--text-primary)] group-hover:text-[color:var(--text-secondary)] transition-colors duration-200">
    driplo.
  </span>
  {#if subtitle}
    <span class="{subtitleClasses[size]} text-[color:var(--text-tertiary)] mt-0.5 uppercase">
      {subtitle}
    </span>
  {/if}
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
