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

<div class="accordion-container {className}">
  {#each items as item, index}
    <div class="accordion-item">
      <button
        onclick={() => toggleItem(index)}
        class="accordion-trigger"
        aria-expanded={openItems.has(index)}
      >
        <div class="accordion-title-container">
          {#if item.icon}
            <div class="accordion-icon">
              <span>{item.icon}</span>
            </div>
          {/if}
          <h3 class="accordion-title">{item.title}</h3>
        </div>
        <div class="accordion-chevron {openItems.has(index) ? 'rotated' : ''}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </button>
      
      {#if openItems.has(index)}
        <div class="accordion-content">
          <div class="accordion-content-inner">
            {#each item.content.split('\n') as line}
              <p class="accordion-line">{line}</p>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .accordion-container {
    background: var(--surface-raised);
    border-radius: var(--radius-xl);
    overflow: hidden;
    border: 1px solid var(--border-subtle);
  }

  .accordion-item {
    border-bottom: 1px solid var(--border-subtle);
  }

  .accordion-item:last-child {
    border-bottom: none;
  }

  .accordion-trigger {
    width: 100%;
    padding: var(--space-5);
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: background-color var(--duration-fast);
    text-align: left;
  }

  .accordion-trigger:hover {
    background: var(--state-hover);
  }

  .accordion-trigger:focus {
    outline: none;
    background: var(--state-focus);
  }

  .accordion-title-container {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .accordion-icon {
    width: 32px;
    height: 32px;
    background: var(--primary);
    color: var(--primary-fg);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-sm);
    font-weight: var(--font-bold);
    flex-shrink: 0;
  }

  .accordion-title {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
  }

  .accordion-chevron {
    color: var(--text-secondary);
    transition: transform var(--duration-fast);
    flex-shrink: 0;
  }

  .accordion-chevron.rotated {
    transform: rotate(180deg);
  }

  .accordion-content {
    border-top: 1px solid var(--border-subtle);
    background: var(--surface-subtle);
  }

  .accordion-content-inner {
    padding: var(--space-5);
  }

  .accordion-line {
    margin: 0 0 var(--space-2) 0;
    color: var(--text-secondary);
    font-size: var(--text-base);
    line-height: 1.5;
  }

  .accordion-line:last-child {
    margin-bottom: 0;
  }

  /* Mobile optimizations */
  @media (max-width: 640px) {
    .accordion-trigger {
      padding: var(--space-4);
    }
    
    .accordion-content-inner {
      padding: var(--space-4);
    }
    
    .accordion-title {
      font-size: var(--text-base);
    }
  }
</style>