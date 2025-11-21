<script lang="ts">
  interface Props {
    show: boolean;
    soldAt?: string;
  }

  let { show, soldAt }: Props = $props();

  const formatSoldDate = (dateString?: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Sold today';
    if (diffInDays === 1) return 'Sold yesterday';
    if (diffInDays < 7) return `Sold ${diffInDays} days ago`;
    
    return `Sold ${date.toLocaleDateString()}`;
  };
</script>

{#if show}
  <div class="absolute inset-0 bg-[var(--modal-overlay-bg)] flex items-center justify-center z-10">
    <div class="bg-white rounded-lg p-3 sm:p-4 mx-4 text-center shadow-sm md:shadow-lg">
      <div class="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full mx-auto mb-2">
        <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </div>
      <p class="text-sm sm:text-base font-semibold text-gray-900 mb-1">SOLD</p>
      {#if soldAt}
        <p class="text-xs sm:text-sm text-gray-500">{formatSoldDate(soldAt)}</p>
      {/if}
    </div>
  </div>
{/if}