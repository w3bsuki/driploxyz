<script lang="ts">
  import { shareProduct } from './product-utils';

  interface Props {
    title: string;
    onShare?: () => void;
  }

  let { title, onShare }: Props = $props();

  let showShareMenu = $state(false);

  function handleShare() {
    shareProduct({ title }, () => {
      showShareMenu = true;
      setTimeout(() => {
        showShareMenu = false;
      }, 2000);
    });
    onShare?.();
  }
</script>

<!-- Clean Instagram Header -->
<header class="bg-white border-b border-gray-200 sticky top-0 z-20">
  <div class="px-4 py-3">
    <nav class="flex items-center gap-4">
      <button 
        onclick={() => history.back()} 
        class="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg" 
        aria-label="Go back"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
        </svg>
      </button>
      <h1 class="flex-1 text-center text-sm font-medium text-gray-900 truncate">{title}</h1>
      <button 
        onclick={handleShare} 
        class="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative" 
        aria-label="Share"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
        </svg>
        {#if showShareMenu}
          <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded">
            Link copied!
          </div>
        {/if}
      </button>
    </nav>
  </div>
</header>