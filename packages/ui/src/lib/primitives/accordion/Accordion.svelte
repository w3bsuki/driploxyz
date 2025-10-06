<script lang="ts">
  import type { Snippet } from 'svelte';

  interface AccordionItem {
    id: string;
    title: string;
    content?: string;
    contentSnippet?: Snippet;
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

  // Track expanded items
  let expandedItems = $state<string[]>([]);

  // Toggle item expansion
  function toggleItem(itemId: string) {
    if (disabled) return;

    if (multiple) {
      // Multiple items can be expanded
      if (expandedItems.includes(itemId)) {
        expandedItems = expandedItems.filter(id => id !== itemId);
      } else {
        expandedItems = [...expandedItems, itemId];
      }
    } else {
      // Only one item can be expanded at a time
      expandedItems = expandedItems.includes(itemId) ? [] : [itemId];
    }
  }

  // Check if an item is expanded
  function isExpanded(itemId: string): boolean {
    return expandedItems.includes(itemId);
  }

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent, itemId: string) {
    const currentIndex = items.findIndex(item => item.id === itemId);
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }

    const nextButton = document.querySelector(`[data-accordion-trigger="${items[nextIndex].id}"]`) as HTMLButtonElement;
    nextButton?.focus();
  }
</script>

<div class="accordion {className}">
  {#each items as accordionItem (accordionItem.id)}
    <div class="accordion-item">
      <button
        data-accordion-trigger={accordionItem.id}
        type="button"
        class="accordion-trigger"
        class:expanded={isExpanded(accordionItem.id)}
        aria-expanded={isExpanded(accordionItem.id)}
        aria-controls={`accordion-content-${accordionItem.id}`}
        disabled={disabled}
        onclick={() => toggleItem(accordionItem.id)}
        onkeydown={(e) => handleKeydown(e, accordionItem.id)}
      >
        <span class="accordion-title">{accordionItem.title}</span>
        <svg
          class="accordion-chevron"
          class:rotated={isExpanded(accordionItem.id)}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          width="20"
          height="20"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <div
        id={`accordion-content-${accordionItem.id}`}
        class="accordion-content"
        class:expanded={isExpanded(accordionItem.id)}
        role="region"
        aria-labelledby={accordionItem.id}
        hidden={!isExpanded(accordionItem.id)}
      >
        <div class="accordion-content-inner">
          {#if accordionItem.contentSnippet}
            {@render accordionItem.contentSnippet()}
          {:else if accordionItem.content}
            {@html accordionItem.content}
          {/if}
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .accordion {
    width: 100%;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    background: var(--surface-base);
    overflow: hidden;
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
    min-height: var(--touch-primary);
  }

  .accordion-trigger:hover {
    background: var(--surface-subtle);
  }

  .accordion-trigger:focus-visible {
    outline: none;
    background: var(--surface-subtle);
    box-shadow: 0 0 0 2px var(--state-focus);
  }

  .accordion-trigger.expanded {
    background: var(--surface-muted);
  }

  .accordion-title {
    color: var(--text-primary);
    font-size: var(--text-base);
    font-weight: var(--font-medium);
    line-height: 1.6;
    margin: 0;
  }

  .accordion-chevron {
    color: var(--text-secondary);
    flex-shrink: 0;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .accordion-chevron.rotated {
    transform: rotate(180deg);
  }

  .accordion-content {
    overflow: hidden;
    transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 0;
  }

  .accordion-content.expanded {
    max-height: 1000px; /* Arbitrary large value */
  }

  .accordion-content-inner {
    color: var(--text-secondary);
    padding: 0 var(--space-4) var(--space-4);
    font-size: var(--text-sm);
    line-height: 1.6;
  }

  .accordion-content-inner :global(p) {
    margin-bottom: var(--space-3);
  }

  .accordion-content-inner :global(p:last-child) {
    margin-bottom: 0;
  }

  .accordion-content-inner :global(ul),
  .accordion-content-inner :global(ol) {
    margin-bottom: var(--space-3);
    padding-left: var(--space-5);
  }

  .accordion-content-inner :global(ul:last-child),
  .accordion-content-inner :global(ol:last-child) {
    margin-bottom: 0;
  }

  .accordion-content-inner :global(li) {
    margin-bottom: var(--space-1);
  }

  .accordion-content-inner :global(strong) {
    font-weight: var(--font-semibold);
    color: var(--text-primary);
  }

  .accordion-content-inner :global(code) {
    background: var(--surface-subtle);
    padding: var(--space-1) var(--space-1);
    border-radius: var(--radius-sm);
    font-family: monospace;
    font-size: var(--text-xs);
  }

  /* Respect prefers-reduced-motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .accordion-content,
    .accordion-chevron,
    .accordion-trigger {
      transition: none;
    }
  }
</style>