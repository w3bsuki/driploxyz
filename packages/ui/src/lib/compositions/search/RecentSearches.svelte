<script lang="ts">
  import { onMount } from 'svelte';
  import { Clock, X } from 'lucide-svelte';

  interface Props {
    onSearch: (query: string) => void;
  }

  let { onSearch }: Props = $props();

  let recentSearches = $state<string[]>([]);

  onMount(() => {
    const stored = localStorage.getItem('recent_searches');
    if (stored) {
      try {
        recentSearches = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse recent searches', e);
      }
    }
  });

  function clearAll() {
    recentSearches = [];
    localStorage.removeItem('recent_searches');
  }

  function removeSearch(e: Event, term: string) {
    e.stopPropagation();
    recentSearches = recentSearches.filter(s => s !== term);
    localStorage.setItem('recent_searches', JSON.stringify(recentSearches));
  }

  function handleSelect(term: string) {
    onSearch(term);
  }
</script>

{#if recentSearches.length > 0}
  <div class="py-4">
    <div class="flex items-center justify-between mb-3 px-1">
      <h3 class="text-sm font-semibold text-(--text-secondary) uppercase tracking-wider">Recent</h3>
      <button 
        onclick={clearAll}
        class="text-sm text-(--brand-primary) hover:underline font-medium"
      >
        Clear all
      </button>
    </div>
    
    <div class="flex flex-col">
      {#each recentSearches as term}
        <button
          onclick={() => handleSelect(term)}
          class="flex items-center justify-between py-3 px-2 -mx-2 hover:bg-(--surface-subtle) rounded-lg group transition-colors text-left"
        >
          <div class="flex items-center gap-3 overflow-hidden">
            <Clock size={18} class="text-(--text-tertiary) shrink-0" />
            <span class="text-(--text-primary) truncate">{term}</span>
          </div>
          <div 
            role="button"
            tabindex="0"
            onclick={(e) => removeSearch(e, term)}
            onkeydown={(e) => e.key === 'Enter' && removeSearch(e, term)}
            class="p-1.5 rounded-full hover:bg-(--surface-muted) text-(--text-tertiary) hover:text-(--text-primary) transition-colors"
            aria-label="Remove search"
          >
            <X size={16} />
          </div>
        </button>
      {/each}
    </div>
  </div>
{/if}
