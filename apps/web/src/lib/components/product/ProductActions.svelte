<script lang="ts">
  interface Props {
    isFavorited: boolean;
    isLiking: boolean;
    viewCount: number;
    hasUser: boolean;
    onFavorite: () => void;
    onMessage: () => void;
    onShare: () => void;
  }

  let { 
    isFavorited, 
    isLiking, 
    viewCount, 
    hasUser,
    onFavorite, 
    onMessage, 
    onShare
  }: Props = $props();

  function handleFavorite() {
    if (!hasUser) return;
    onFavorite();
  }

  function handleMessage() {
    if (!hasUser) return;
    onMessage();
  }

  function handleShare() {
    onShare();
  }
</script>

<!-- Actions Row -->
<div class="px-4 py-3 border-b border-gray-100">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <!-- Like -->
      <button 
        onclick={handleFavorite}
        disabled={!hasUser || isLiking}
        class="w-8 h-8 flex items-center justify-center {isLiking ? 'opacity-50' : ''}"
      >
        <svg 
          class="w-6 h-6 {isFavorited ? 'text-red-500' : 'text-gray-700'}" 
          fill={isFavorited ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          stroke-width="1.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
        </svg>
      </button>
      
      <!-- Message -->
      <button 
        onclick={handleMessage} 
        class="w-8 h-8 flex items-center justify-center"
      >
        <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"/>
        </svg>
      </button>
      
      <!-- Share -->
      <button 
        onclick={handleShare} 
        class="w-8 h-8 flex items-center justify-center"
      >
        <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0721.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
        </svg>
      </button>
    </div>
    
    {#if viewCount > 0}
      <span class="text-xs text-gray-500">{viewCount} views</span>
    {/if}
  </div>
</div>