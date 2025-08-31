<script lang="ts">
  interface AccordionItem {
    title: string;
    content: string;
    icon?: string;
  }
  
  interface Props {
    items: AccordionItem[];
    class?: string;
  }
  
  let { items, class: className = '' }: Props = $props();
  
  let openItems = $state<Set<number>>(new Set());
  
  function toggleItem(index: number) {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    openItems = newOpenItems;
  }
</script>

<div class="space-y-3 {className}">
  {#each items as item, index}
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onclick={() => toggleItem(index)}
        class="w-full px-6 py-3 text-left flex items-center justify-between hover:bg-gray-50"
      >
        <div class="flex items-center space-x-3">
          {#if item.icon}
            <div class="w-8 h-8 bg-black text-white rounded-sm flex items-center justify-center shrink-0">
              <span class="text-sm font-bold">{item.icon}</span>
            </div>
          {/if}
          <span class="font-bold text-black">{item.title}</span>
        </div>
        <div class="transform {openItems.has(index) ? 'rotate-180' : ''}">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {#if openItems.has(index)}
        <div class="px-6 pb-4 text-sm text-gray-500 border-t border-gray-100">
          <div class="pt-4">
            {item.content}
          </div>
        </div>
      {/if}
    </div>
  {/each}
</div>