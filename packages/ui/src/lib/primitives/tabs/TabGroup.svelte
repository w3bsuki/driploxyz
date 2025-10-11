<script lang="ts">
  interface Props {
    tabs: Array<{ id: string; label: string; count?: number }>;
    activeTab: string;
    onTabChange: (tabId: string) => void;
    class?: string;
  }

  let { tabs, activeTab, onTabChange, class: className = '' }: Props = $props();

  // Handle tab selection
  function handleTabClick(tabId: string) {
    onTabChange(tabId);
  }

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent, currentTabId: string) {
    const currentIndex = tabs.findIndex(tab => tab.id === currentTabId);
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    const nextTab = tabs[nextIndex];
    if (nextTab) {
      onTabChange(nextTab.id);
      // Focus the next tab button
      const nextButton = document.querySelector(`[data-tab-id="${nextTab.id}"]`) as HTMLButtonElement;
      nextButton?.focus();
    }
  }
</script>

<!-- Simple tab implementation with proper accessibility -->
<div class="tabgroup-root" role="tablist">
  <div
    class="flex space-x-1 overflow-x-auto scroll-snap-type-x scroll-snap-type-mandatory pb-2 scrollbarhide {className}"
  >
    {#each tabs as tab (tab.id)}
      <button
        data-tab-id={tab.id}
        type="button"
        role="tab"
        aria-selected={activeTab === tab.id}
        aria-controls={`tabpanel-${tab.id}`}
        tabindex={activeTab === tab.id ? 0 : -1}
        class="flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors scroll-snap-align-start min-h-[36px]
          {activeTab === tab.id
            ? 'bg-black text-white'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}"
        onclick={() => handleTabClick(tab.id)}
        onkeydown={(e) => handleKeydown(e, tab.id)}
      >
        {tab.label}
        {#if tab.count !== undefined}
          <span class="ml-1.5 px-1.5 py-0.5 text-xs rounded-full
            {activeTab === tab.id
              ? 'bg-white bg-opacity-20 text-white'
              : 'bg-gray-200 text-gray-500'}">
            {tab.count}
          </span>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  /* Ensure proper mobile touch targets */
  .tabgroup-root button {
    min-height: 36px;
  }

  /* Mobile-first responsive design */
  @media (max-width: 640px) {
    .tabgroup-root button {
      min-height: 44px; /* Larger touch targets on mobile */
      font-size: 16px; /* Prevent zoom on iOS */
    }
  }

  /* Focus styles for accessibility */
  .tabgroup-root button:focus-visible {
    outline: 2px solid oklch(60% 0.2 250);
    outline-offset: 2px;
    z-index: 1;
  }

  /* Respect prefers-reduced-motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .tabgroup-root button {
      transition: none;
    }
  }
</style>