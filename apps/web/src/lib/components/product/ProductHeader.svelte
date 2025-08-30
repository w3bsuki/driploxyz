<script lang="ts">
  import { shareProduct } from './product-utils';
  import { BUTTON_STYLES } from './product-constants';

  interface Props {
    title: string;
    onShare?: () => void;
  }

  let { title, onShare }: Props = $props();

  let showShareMenu = $state(false);

  function handleShare() {
    shareProduct({ title }, () => {
      showShareMenu = true;
      // Auto-hide after 2 seconds
      setTimeout(() => {
        showShareMenu = false;
      }, 2000);
    });
    onShare?.();
  }
</script>

<!-- Instagram-style Header -->
<div class="bg-white border-b border-gray-200 sticky z-20 shadow-sm" style="top: var(--app-header-offset, 56px);">
  <div class="max-w-md mx-auto px-4 py-3">
    <nav class="flex items-center gap-3">
      <button onclick={() => history.back()} class="{BUTTON_STYLES.iconMedium}" aria-label="Go back">
        <svg class="{BUTTON_STYLES.iconSize.medium}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <span class="flex-1 text-center font-semibold text-gray-900 truncate">{title}</span>
      <button onclick={handleShare} class="{BUTTON_STYLES.iconMedium} relative" aria-label="Share product">
        <svg class="{BUTTON_STYLES.iconSize.medium}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
        </svg>
        {#if showShareMenu}
          <div class="absolute -top-8 -left-8 bg-black text-white text-xs px-2 py-1 rounded-full">
            Copied!
          </div>
        {/if}
      </button>
    </nav>
  </div>
</div>