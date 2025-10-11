<script lang="ts">
  interface Props {
    trends: string[];
    title?: string;
    onTrendClick: (trend: string) => void;
  }

  let { trends, title = 'Trending', onTrendClick }: Props = $props();
</script>

<div>
  <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h3>
  <div class="space-y-1">
    {#each trends as trend}
      <button
        onclick={() => onTrendClick(trend)}
        class="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-white/60 rounded-lg transition-colors flex items-center space-x-2"
      >
        <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <span>{trend}</span>
      </button>
    {/each}
  </div>
</div>