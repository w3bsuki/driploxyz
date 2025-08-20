<script lang="ts">
  import type { BreadcrumbItem } from './types.js';

  interface Props {
    items: BreadcrumbItem[];
    class?: string;
  }

  let { items, class: className = '' }: Props = $props();
</script>

<nav class="flex items-center space-x-2 text-sm {className}" aria-label="Breadcrumb">
  {#each items as item, index}
    {#if item.href && index < items.length - 1}
      <a 
        href={item.href} 
        class="text-gray-500 hover:text-gray-700 transition-colors"
      >
        {item.label}
      </a>
    {:else}
      <span class="text-gray-900 font-medium" aria-current="page">
        {item.label}
      </span>
    {/if}
    
    {#if index < items.length - 1}
      <svg 
        class="w-4 h-4 text-gray-400 shrink-0" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M9 5l7 7-7 7" 
        />
      </svg>
    {/if}
  {/each}
</nav>