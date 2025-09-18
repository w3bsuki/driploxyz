<script lang="ts">
  import { createToggleGroup } from '@melt-ui/svelte';
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
  let containerRef: HTMLDivElement;
  let announcement = $state('');

  // Create Melt UI toggle group with proper accessibility
  const {
    elements: { root, item },
    helpers: { isPressed },
    states: { value: toggleValue }
  } = createToggleGroup(multiple ? {
    type: 'multiple',
    defaultValue: value ? [value] : undefined,
    onValueChange: ({ next }) => {
      // Handle multiple selection mode
      const newValue = Array.isArray(next) ? next[0] || null : next || null;
      const changedOption = options.find(opt => opt.value === newValue);

      onValueChange?.(newValue);

      // Announce changes to screen readers
      if (announceChanges && changedOption) {
        const isActive = newValue !== null;
        if (announcementTemplate) {
          announcement = announcementTemplate(changedOption, isActive);
        } else {
          const statusText = isActive ? filter_ui_applied() : filter_ui_removed();
          announcement = `${changedOption.label} ${filter_modal_filter()} ${statusText}`;
        }
      }

      return next;
    },
    disabled
  } : {
    type: 'single',
    defaultValue: value ?? undefined,
    onValueChange: ({ next }) => {
      // Handle single selection mode
      const newValue = (typeof next === 'string' ? next : null) || null;
      const changedOption = options.find(opt => opt.value === newValue);

      onValueChange?.(newValue);

      // Announce changes to screen readers
      if (announceChanges && changedOption) {
        const isActive = newValue !== null;
        if (announcementTemplate) {
          announcement = announcementTemplate(changedOption, isActive);
        } else {
          const statusText = isActive ? filter_ui_applied() : filter_ui_removed();
          announcement = `${changedOption.label} ${filter_modal_filter()} ${statusText}`;
        }
      }

      return next;
    },
    disabled
  });
  
  // Sync external value with internal toggle group state  
  $effect(() => {
    // When value changes externally, update the toggle group's internal state
    if ($toggleValue !== value) {
      if (multiple) {
        toggleValue.set(value ? [value] : undefined);
      } else {
        toggleValue.set(value ?? undefined);
      }
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
          const newValue = $isPressed(option.value) ? null : option.value;
          if (multiple) {
            toggleValue.set(newValue ? [newValue] : undefined);
          } else {
            toggleValue.set(newValue ?? undefined);
          }
          onValueChange?.(newValue);
          
          // Announce the change
          if (announceChanges) {
            if (announcementTemplate) {
              announcement = announcementTemplate(option, newValue !== null);
            } else {
              const statusText = newValue !== null ? filter_ui_applied() : filter_ui_removed();
              announcement = `${option.label} ${filter_modal_filter()} ${statusText}`;
            }
          }
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
  class="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 {className}"
  role="toolbar"
  aria-label={label || filter_ui_filterOptionsAriaLabel()}
  aria-orientation="horizontal"
  tabindex="-1"
  onkeydown={handleKeydown}
>
  {#each options as option, index (option.value)}
    {@const isActive = $isPressed(option.value)}
    {@const activeClasses = isActive 
      ? (option.bgGradient 
          ? `${option.bgGradient} text-white shadow-md border-transparent ${activePillClass}` 
          : `bg-[color:var(--primary)] text-[color:var(--primary-fg)] shadow-md border-transparent ${activePillClass}`)
      : `bg-[color:var(--surface-base)] text-[color:var(--text-primary)] border border-[color:var(--border-default)] hover:border-[color:var(--border-emphasis)] hover:bg-[color:var(--surface-subtle)]`
    }
    
    <button
      use:item
      data-value={option.value}
      class="{basePillClasses} {activeClasses}"
      tabindex={focusedIndex === index ? 0 : -1}
      aria-pressed={isActive}
      aria-label="{option.label} {filter_modal_filter()} {isActive ? filter_ui_applied() : filter_ui_removed()}"
      aria-describedby={`filter-help-${option.value}`}
      onfocus={() => handleButtonFocus(index)}
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
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
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
