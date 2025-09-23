<script lang="ts">
  import type { BreadcrumbItem } from '../../types';

  interface Props {
    items: BreadcrumbItem[];
    class?: string;
  }

  let { items, class: className = '' }: Props = $props();
</script>

<nav class="flex items-center text-sm {className} overflow-hidden" aria-label="Breadcrumb">
  {#each items as item, index}
    {#if index > 0}
      <svg 
        class="w-3 h-3 text-gray-400 shrink-0 mx-1" 
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
    
    {#if item.href && index < items.length - 1}
      <a 
        href={item.href} 
        class="text-gray-500 hover:text-gray-900 truncate {index === items.length - 2 ? 'max-w-[80px]' : index === 0 ? 'max-w-[60px]' : 'max-w-[70px]'}"
        title={item.label}
      >
        {item.label}
      </a>
    {:else}
      <span class="text-gray-900 font-medium truncate max-w-[120px]" aria-current="page" title={item.label}>
        {item.label}
      </span>
    {/if}
  {/each}
</nav>