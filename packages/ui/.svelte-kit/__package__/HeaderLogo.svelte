<script lang="ts">
  interface Props {
    animated?: boolean;
  }

  let { animated = false }: Props = $props();

  // Only animate if explicitly requested
  const clothingEmojis = ['👗', '👔', '👶', '🐕'];
  let currentEmojiIndex = $state(0);

  // Simplified animation - only if needed
  $effect(() => {
    if (!animated) return;
    
    const interval = setInterval(() => {
      currentEmojiIndex = (currentEmojiIndex + 1) % clothingEmojis.length;
    }, 3000); // Slower animation
    
    return () => clearInterval(interval);
  });
</script>

<a href="/" class="flex items-center">
  <span class="text-xl sm:text-2xl font-bold text-gray-900">Driplo</span>
  {#if animated}
    <span class="text-xl sm:text-2xl transition-all duration-300 hover:scale-110 ml-0.5 inline-block">
      {clothingEmojis[currentEmojiIndex]}
    </span>
  {:else}
    <span class="text-xl sm:text-2xl ml-0.5">👗</span>
  {/if}
</a>