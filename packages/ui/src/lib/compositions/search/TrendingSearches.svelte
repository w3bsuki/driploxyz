<script lang="ts">
  import { TrendingUp } from 'lucide-svelte';

  interface Props {
    onSearch: (query: string) => void;
  }

  let { onSearch }: Props = $props();

  // Mock trending data - in a real app this would come from an API
  const trending = [
    'Vintage Nike',
    'Carhartt Jacket',
    'Levi\'s 501',
    'North Face Puffer',
    'Ralph Lauren',
    'Stussy',
    'Dickies 874',
    'Adidas Samba'
  ];
</script>

<div class="py-4">
  <div class="flex items-center gap-2 mb-3 px-1">
    <TrendingUp size={16} class="text-(--brand-primary)" />
    <h3 class="text-sm font-semibold text-(--text-secondary) uppercase tracking-wider">Trending Now</h3>
  </div>
  
  <div class="flex flex-wrap gap-2">
    {#each trending as term}
      <button
        onclick={() => onSearch(term)}
        class="px-4 py-2 rounded-full bg-(--surface-subtle) border border-(--border-subtle) text-(--text-primary) text-sm font-medium hover:border-(--brand-primary) hover:text-(--brand-primary) transition-colors"
      >
        {term}
      </button>
    {/each}
  </div>
</div>
