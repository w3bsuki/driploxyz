<script lang="ts">
  import { createSelect } from '@melt-ui/svelte';
  import type { Snippet } from 'svelte';

  interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    options: SelectOption[];
    value?: string | null;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    id?: string;
    onValueChange?: (value: string | null) => void;
    onBlur?: () => void;
    positioning?: 'top' | 'bottom' | 'left' | 'right';
    portal?: string | HTMLElement | null;
    class?: string;
    triggerClass?: string;
    menuClass?: string;
    optionClass?: string;
    children?: Snippet;
  }

  let {
    options = [],
    value = $bindable(null),
    placeholder = 'Select an option',
    disabled = false,
    required = false,
    name,
    id,
    onValueChange,
    onBlur,
    positioning = 'bottom',
    portal = 'body',
    class: className = '',
    triggerClass = '',
    menuClass = '',
    optionClass = '',
    children
  }: Props = $props();

  // Find selected option
  const selectedOption = $derived(
    value ? options.find(option => option.value === value) : null
  );

  const {
    elements: { trigger, menu, option },
    states: { open },
    helpers: { isSelected }
  } = createSelect({
    forceVisible: true,
    positioning: {
      placement:
        positioning === 'top'
          ? 'top'
          : positioning === 'left'
            ? 'left'
            : positioning === 'right'
              ? 'right'
              : 'bottom',
      gutter: 4,
      sameWidth: true
    },
    portal,
    onSelectedChange: ({ next }) => {
      const newValue = next ? (next.value as string) : null;
      value = newValue;
      onValueChange?.(newValue);
      return next;
    }
  });

  const optionAction = option as unknown as (
    node: HTMLElement,
    props: { value: string; label: string; disabled?: boolean }
  ) => void;

  // Sync initial value with Melt UI
  $effect(() => {
    if (value !== null) {
      const selectedOpt = options.find(opt => opt.value === value);
      if (selectedOpt && !$isSelected(value)) {
        // Set initial selection if not already selected
        const optionToSelect = { value: selectedOpt.value, label: selectedOpt.label };
        // Force the selection without triggering change callback
      }
    }
  });

  // Default CSS classes following design system
  const defaultTriggerClasses = 'input input-select relative w-full min-h-[var(--touch-primary)] px-[var(--input-padding)] py-0 text-[var(--input-font)] bg-[var(--input-bg)] border border-[var(--input-border)] rounded-[var(--input-radius)] focus:border-[var(--input-focus-border)] focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:ring-offset-0 focus:outline-none transition-colors duration-[var(--duration-fast)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between gap-2';
  
  const defaultMenuClasses = 'menu z-[var(--z-50)] max-h-60 w-full overflow-auto rounded-[var(--radius-md)] bg-[var(--surface-base)] border border-[var(--border-default)] shadow-[var(--shadow-lg)] py-1 focus:outline-none';
  
  const defaultOptionClasses = 'menu-item relative w-full cursor-pointer select-none px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-base)] text-[var(--text-primary)] hover:bg-[var(--state-hover)] focus:bg-[var(--state-active)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed min-h-[var(--touch-standard)] flex items-center transition-colors duration-[var(--duration-fast)]';

  // Computed classes
  const triggerClasses = $derived(`${defaultTriggerClasses} ${triggerClass} ${className}`);
  const menuClasses = $derived(`${defaultMenuClasses} ${menuClass}`);
  const optionClasses = $derived(`${defaultOptionClasses} ${optionClass}`);
</script>

<!-- Hidden input for form submission -->
{#if name}
  <input
    type="hidden"
    {name}
    value={value || ''}
    {required}
  />
{/if}

<!-- Select Trigger -->
<button
  use:trigger
  class={triggerClasses}
  {id}
  {disabled}
  aria-haspopup="listbox"
  aria-expanded={$open}
  type="button"
  onblur={onBlur}
>
  <span class="flex-1 text-left truncate">
    {#if selectedOption}
      {selectedOption.label}
    {:else}
      <span class="text-[var(--text-muted)]">{placeholder}</span>
    {/if}
  </span>
  
  <!-- Dropdown chevron icon -->
  <svg
    class="w-4 h-4 text-[var(--text-tertiary)] transition-transform duration-[var(--duration-fast)]"
    class:rotate-180={$open}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
  </svg>
</button>

<!-- Select Menu -->
{#if $open}
  <div
    use:menu
    class={menuClasses}
    role="listbox"
    tabindex="-1"
  >
    <!-- Options from props -->
    {#each options as opt (opt.value)}
      <button
        use:optionAction={{ value: opt.value, label: opt.label, disabled: opt.disabled }}
        class="{optionClasses} {$isSelected(opt.value) ? 'bg-[var(--state-active)] font-medium' : ''}"
        disabled={opt.disabled}
        role="option"
        aria-selected={$isSelected(opt.value)}
        type="button"
      >
        <span class="flex-1 text-left truncate">
          {opt.label}
        </span>
        
        <!-- Selected checkmark -->
        {#if $isSelected(opt.value)}
          <svg
            class="w-4 h-4 text-[var(--brand-primary)] ml-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        {/if}
      </button>
    {/each}

    <!-- Custom content via snippets -->
    {#if children}
      {#if options.length > 0}
        <div class="border-t border-[var(--border-subtle)] my-1" role="separator"></div>
      {/if}
      {@render children()}
    {/if}
  </div>
{/if}

<style>
  /* Menu animations */
  :global([data-melt-select-content]) {
    animation: menu-in var(--duration-fast) cubic-bezier(0, 0, 0.2, 1);
    transform-origin: var(--transform-origin, top);
  }

  @keyframes menu-in {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-4px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* Enhanced focus states for accessibility */
  .input-select:focus-visible {
    box-shadow: 0 0 0 2px var(--input-focus-ring);
  }

  .menu-item:focus-visible {
    background-color: var(--state-active);
    outline: 2px solid var(--state-focus);
    outline-offset: -2px;
  }

  /* Mobile-first responsive design */
  @media (max-width: var(--screen-sm)) {
    :global([data-melt-select-content]) {
      min-width: calc(100vw - 2rem);
      max-width: calc(100vw - 2rem);
    }
    
    /* Ensure touch targets are at least 44px on mobile */
    .menu-item {
      min-height: var(--touch-primary);
      padding: var(--space-3) var(--space-4);
    }
    
    /* Adjust font size for mobile readability */
    .menu-item {
      font-size: var(--text-base);
      line-height: var(--leading-normal);
    }
    
    /* Trigger button mobile optimization */
    .input-select {
      min-height: var(--touch-primary);
      font-size: var(--text-base); /* Prevents zoom on iOS */
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .menu-item:hover:not(:disabled) {
      background-color: var(--state-active);
      outline: 1px solid var(--state-focus);
    }
    
    .menu-item:focus-visible {
      outline-width: 3px;
    }
    
    .input-select:focus-visible {
      outline: 3px solid var(--state-focus);
      outline-offset: 2px;
    }
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    :global([data-melt-select-content]) {
      animation: none;
    }
    
    .menu-item,
    .input-select,
    svg {
      transition: none;
    }
  }

  /* Dark mode adjustments */
  @media (prefers-color-scheme: dark) {
    .menu-item:hover:not(:disabled) {
      background-color: var(--state-hover);
    }
    
    .menu-item:focus:not(:disabled) {
      background-color: var(--state-active);
    }
  }
</style>