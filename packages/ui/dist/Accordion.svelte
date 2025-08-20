<script lang="ts">
  interface Props {
    items: Array<{
      title: string;
      content: string;
    }>;
    allowMultiple?: boolean;
  }

  let {
    items = [],
    allowMultiple = false
  }: Props = $props();

  let openItems = $state<Set<number>>(new Set());

  function toggle(index: number) {
    if (openItems.has(index)) {
      openItems.delete(index);
    } else {
      if (!allowMultiple) {
        openItems.clear();
      }
      openItems.add(index);
    }
    openItems = new Set(openItems);
  }
</script>

<div class="space-y-2">
  {#each items as item, index}
    <div class="border rounded-lg">
      <button
        class="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50"
        onclick={() => toggle(index)}
      >
        <span class="font-medium">{item.title}</span>
        <svg
          class="w-5 h-5 transform {openItems.has(index) ? 'rotate-180' : ''}"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {#if openItems.has(index)}
        <div class="px-4 pb-4 text-gray-600">
          {item.content}
        </div>
      {/if}
    </div>
  {/each}
</div>