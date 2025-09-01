<script lang="ts">
  import { createTabs } from '@melt-ui/svelte';

  interface Props {
    tabs: Array<{ id: string; label: string; count?: number }>;
    activeTab: string;
    onTabChange: (tabId: string) => void;
    class?: string;
  }

  let { tabs, activeTab, onTabChange, class: className = '' }: Props = $props();

  // Create the tabs store with Melt UI for accessibility and keyboard navigation
  const {
    elements: { root, list, trigger },
    states: { value }
  } = createTabs({
    value: activeTab,
    onValueChange: ({ next }) => {
      onTabChange(next);
      return next;
    },
    orientation: 'horizontal',
    loop: false,
    activateOnFocus: false, // Require explicit selection for better mobile experience
  });

  // Sync external activeTab prop changes with melt store
  $effect(() => {
    if (activeTab !== $value) {
      $value = activeTab;
    }
  });
</script>

<!-- Use Melt UI for accessibility while maintaining the exact original styling -->
<div use:root class="tabgroup-root">
  <div 
    use:list 
    class="flex space-x-1 overflow-x-auto scroll-snap-type-x scroll-snap-type-mandatory pb-2 scrollbar-hide {className}"
  >
    {#each tabs as tab (tab.id)}
      <button
        use:trigger={tab.id}
        class="flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors scroll-snap-align-start min-h-[36px]
          {$value === tab.id 
            ? 'bg-black text-white' 
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}"
      >
        {tab.label}
        {#if tab.count !== undefined}
          <span class="ml-1.5 px-1.5 py-0.5 text-xs rounded-full
            {$value === tab.id 
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