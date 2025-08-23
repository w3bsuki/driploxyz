<script lang="ts">
  interface Props {
    tabs: Array<{ id: string; label: string; count?: number }>;
    activeTab: string;
    onTabChange: (tabId: string) => void;
    class?: string;
  }

  let { tabs, activeTab, onTabChange, class: className = '' }: Props = $props();
</script>

<div class="flex space-x-1 overflow-x-auto pb-2 {className}">
  {#each tabs as tab}
    <button
      onclick={() => onTabChange(tab.id)}
      class="flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
        {activeTab === tab.id 
          ? 'bg-black text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
    >
      {tab.label}
      {#if tab.count !== undefined}
        <span class="ml-1.5 px-1.5 py-0.5 text-xs rounded-full
          {activeTab === tab.id 
            ? 'bg-white bg-opacity-20 text-white' 
            : 'bg-gray-200 text-gray-600'}">
          {tab.count}
        </span>
      {/if}
    </button>
  {/each}
</div>