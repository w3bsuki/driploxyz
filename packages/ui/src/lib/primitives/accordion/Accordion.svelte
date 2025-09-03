<script lang="ts">
  import { createAccordion, melt } from '@melt-ui/svelte';
  
  interface AccordionItem {
    id: string;
    title: string;
    content: string;
  }
  
  interface Props {
    items: AccordionItem[];
    multiple?: boolean;
    disabled?: boolean;
    class?: string;
  }
  
  let { 
    items = [],
    multiple = false,
    disabled = false,
    class: className = ''
  }: Props = $props();
  
  const {
    elements: { root, item, trigger, content },
    states: { value }
  } = createAccordion({
    multiple,
    disabled
  });
</script>

<div class="accordion {className}" use:melt={$root}>
  {#each items as accordionItem (accordionItem.id)}
    <div class="accordion-item" use:melt={$item(accordionItem.id)}>
      <button 
        class="accordion-trigger"
        use:melt={$trigger(accordionItem.id)}
        type="button"
      >
        <span class="accordion-title">{accordionItem.title}</span>
        <svg 
          class="accordion-chevron" 
          class:rotated={Array.isArray($value) ? $value.includes(accordionItem.id) : $value === accordionItem.id}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div 
        class="accordion-content"
        use:melt={$content(accordionItem.id)}
      >
        <div class="accordion-content-inner">
          {#each accordionItem.content.split('\n') as line}
            <p>{line}</p>
          {/each}
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .accordion {
    width: 100%;
  }
  
  .accordion-item {
    border-bottom: 1px solid var(--border-subtle);
  }
  
  .accordion-item:last-child {
    border-bottom: none;
  }
  
  .accordion-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: left;
    background: transparent;
    border: none;
    padding: var(--space-4);
    cursor: pointer;
    transition: background-color 0.2s ease;
    min-height: 44px;
  }
  
  .accordion-trigger:hover {
    background: var(--surface-subtle);
  }
  
  .accordion-trigger:focus {
    outline: none;
    background: var(--surface-subtle);
  }
  
  .accordion-title {
    color: var(--text-primary);
    font-size: var(--text-base);
    font-weight: var(--font-medium);
    margin: 0;
  }
  
  .accordion-chevron {
    color: var(--text-secondary);
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }
  
  .accordion-chevron.rotated {
    transform: rotate(180deg);
  }
  
  .accordion-content {
    overflow: hidden;
  }
  
  .accordion-content-inner {
    color: var(--text-secondary);
    padding: 0 var(--space-4) var(--space-4) var(--space-4);
    font-size: var(--text-sm);
    line-height: 1.5;
  }

  .accordion-content-inner p {
    margin: 0 0 var(--space-2) 0;
  }

  .accordion-content-inner p:last-child {
    margin-bottom: 0;
  }
</style>