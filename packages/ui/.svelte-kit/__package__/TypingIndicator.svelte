<script lang="ts">
  interface Props {
    show?: boolean;
    username?: string;
    class?: string;
  }

  let { 
    show = false,
    username = 'Someone',
    class: className = ''
  }: Props = $props();
</script>

{#if show}
  <div class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500 {className}">
    <div class="flex space-x-1">
      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s"></div>
      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
    </div>
    <span class="italic">{username} is typing...</span>
  </div>
{/if}

<style>
  .animate-bounce {
    animation: bounce 1.4s infinite ease-in-out both;
  }

  @keyframes bounce {
    0%, 80%, 100% { 
      transform: scale(0);
    } 40% { 
      transform: scale(1);
    }
  }
</style>