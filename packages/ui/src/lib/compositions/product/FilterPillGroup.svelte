<script lang="ts">
  import type { Snippet } from 'svelte';
  import { tick } from 'svelte';
  import { filter_ui_applied, filter_ui_removed, filter_modal_filter } from '@repo/i18n';
  import { filter_ui_filterOptionsAriaLabel, filter_ui_keyboardNavHelp } from '@repo/i18n';
  import type { FilterPillGroupProps, FilterOption } from '@repo/ui/types';

  let {
    value = $bindable(null),
    options,
    multiple = false,
    disabled = false,
    label,
    class: className = '',
    pillClass = '',
    activePillClass = '',
    onValueChange,
    children,
    announceChanges = true,
    announcementTemplate
  }: FilterPillGroupProps = $props();

  // Track current focused index for keyboard navigation
  let focusedIndex = $state(-1);
  let containerRef: HTMLDivElement = $state()!;
  let announcement = $state('');

  // Simple toggle group placeholder implementation
  let toggleValue = $state<string | string[] | undefined>(value ?? undefined);

  // Create dummy elements to match melt-ui interface
  function root(node: HTMLElement) {
    node.setAttribute('data-melt-toggle-group-root', '');
    node.setAttribute('role', 'group');
    return {};
  }

  const item = $derived({
    'data-melt-toggle-group-item': '',
    role: 'button'
  });

  // Helper function to check if a value is pressed
  function isPressed(itemValue: string) {
    return multiple ?
      (Array.isArray(toggleValue) ? toggleValue.includes(itemValue) : false) :
      toggleValue === itemValue;
  }

  // Simple toggle function
  function handleToggle(itemValue: string) {
    let newValue: any;
    const changedOption = options.find(opt => opt.value === itemValue);

    if (multiple) {
      const currentValues = Array.isArray(toggleValue) ? toggleValue : [];
      if (currentValues.includes(itemValue)) {
        newValue = currentValues.filter(v => v !== itemValue);
      } else {
        newValue = [...currentValues, itemValue];
      }
    } else {
      newValue = toggleValue === itemValue ? undefined : itemValue;
    }

    toggleValue = newValue;
    value = multiple ? (Array.isArray(newValue) ? newValue[0] || null : null) : (newValue || null);
    onValueChange?.(value);

    // Announce changes to screen readers
    if (announceChanges && changedOption) {
      const isActive = value !== null;
      if (announcementTemplate) {
        announcement = announcementTemplate(changedOption, isActive);
      } else {
        const statusText = isActive ? filter_ui_applied() : filter_ui_removed();
        announcement = `${changedOption.label} ${filter_modal_filter()} ${statusText}`;
      }
    }
  }

  // Sync external value with internal state
  $effect(() => {
    if (toggleValue !== value) {
      toggleValue = value ?? undefined;
    }
  });

  // Enhanced keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (disabled) return;
    
    const { key } = event;
    const currentIndex = focusedIndex;
    
    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        focusedIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        focusItemAtIndex(focusedIndex);
        break;
        
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        focusedIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        focusItemAtIndex(focusedIndex);
        break;
        
      case 'Home':
        event.preventDefault();
        focusedIndex = 0;
        focusItemAtIndex(0);
        break;
        
      case 'End':
        event.preventDefault();
        focusedIndex = options.length - 1;
        focusItemAtIndex(options.length - 1);
        break;
        
      case 'Enter':
      case ' ':
        if (currentIndex >= 0 && currentIndex < options.length) {
          event.preventDefault();
          const option = options[currentIndex];
          handleToggle(option.value);
        }
        break;
    }
  }
  
  // Focus management helper
  async function focusItemAtIndex(index: number) {
    await tick();
    if (containerRef) {
      const buttons = containerRef.querySelectorAll('[role="button"]');
      const targetButton = buttons[index] as HTMLButtonElement;
      if (targetButton) {
        targetButton.focus();
      }
    }
  }
  
  // Handle individual button focus
  function handleButtonFocus(index: number) {
    focusedIndex = index;
  }
  
  // Clear announcement after it's been read
  $effect(() => {
    if (announcement) {
      const timer = setTimeout(() => {
        announcement = '';
      }, 1000);
      return () => clearTimeout(timer);
    }
  });

  // Base classes following design tokens
  const basePillClasses = $derived(`
    shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 
    min-h-[var(--touch-standard)] rounded-full text-xs font-semibold 
    transition-all duration-[var(--duration-base)] 
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)] focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    hover:shadow-sm active:scale-95
    ${pillClass}
  `);
</script>

{#if label}
  <div class="mb-3">
    <h3 class="text-xs font-semibold text-[color:var(--text-tertiary)] uppercase tracking-wide px-1">
      {label}
    </h3>
  </div>
{/if}

<div 
  bind:this={containerRef}
  use:root 
  class="flex items-center gap-2 overflow-x-auto scrollbarhide pb-1 {className}"
  role="toolbar"
  aria-label={label || filter_ui_filterOptionsAriaLabel()}
  aria-orientation="horizontal"
  tabindex="-1"
  onkeydown={handleKeydown}
>
  {#each options as option, index (option.value)}
    {@const isActive = isPressed(option.value)}
    {@const activeClasses = isActive 
      ? (option.bgGradient 
          ? `${option.bgGradient} text-[var(--text-inverse)] shadow-md border-transparent ${activePillClass}` 
          : `bg-[color:var(--primary)] text-[color:var(--primary-fg)] shadow-md border-transparent ${activePillClass}`)
      : `bg-[color:var(--surface-base)] text-[color:var(--text-primary)] border border-[color:var(--border-default)] hover:border-[color:var(--border-emphasis)] hover:bg-[color:var(--surface-subtle)]`
    }
    
    <button
      data-value={option.value}
      class="{basePillClasses} {activeClasses}"
      tabindex={focusedIndex === index ? 0 : -1}
      aria-pressed={isActive}
      aria-label="{option.label} {filter_modal_filter()} {isActive ? filter_ui_applied() : filter_ui_removed()}"
      aria-describedby={`filter-help-${option.value}`}
      onfocus={() => handleButtonFocus(index)}
      onclick={() => handleToggle(option.value)}
    >
      {#if children}
        {@render children(option)}
      {:else}
        {#if option.icon}
          <span class="text-sm" aria-hidden="true">{option.icon}</span>
        {/if}
        {#if option.color && isActive}
          <span 
            class="w-1.5 h-1.5 rounded-full bg-current" 
            aria-hidden="true"
          ></span>
        {:else if option.color}
          <span 
            class="w-1.5 h-1.5 rounded-full"
            style="background-color: {option.color}"
            aria-hidden="true"
          ></span>
        {/if}
        <span>{option.shortLabel || option.label}</span>
      {/if}
    </button>
    
    <!-- Hidden help text for each filter -->
    <span 
      id="filter-help-{option.value}"
      class="sr-only"
    >
{filter_ui_keyboardNavHelp()}
    </span>
  {/each}
</div>

<!-- Live region for announcements -->
{#if announcement}
  <div 
    role="status" 
    aria-live="polite" 
    aria-atomic="true"
    class="sr-only"
  >
    {announcement}
  </div>
{/if}

<style>
  /* Smooth scroll behavior for horizontal scrolling */
  .overflow-x-auto {
    scroll-behavior: smooth;
  }
  
  /* Screen reader only text */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  /* Enhanced touch feedback for mobile */
  @media (hover: none) and (pointer: coarse) {
    button:active {
      transform: scale(0.95);
    }
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    button:focus-visible {
      outline: 3px solid currentColor;
      outline-offset: 2px;
    }
    
    button[aria-pressed="true"] {
      outline: 2px solid currentColor;
    }
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    button {
      transition: none;
    }
    
    button:active {
      transform: none;
    }
    
    .overflow-x-auto {
      scroll-behavior: auto;
    }
  }
</style>
