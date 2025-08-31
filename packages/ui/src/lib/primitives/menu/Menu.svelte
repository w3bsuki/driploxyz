<script lang="ts">
  import { createDropdownMenu } from '@melt-ui/svelte';
  import type { Snippet } from 'svelte';

  interface MenuItemData {
    id: string;
    label: string;
    disabled?: boolean;
    separator?: boolean;
    onSelect?: () => void;
    icon?: string;
    shortcut?: string;
  }

  interface Props {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    items?: MenuItemData[];
    positioning?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'bottom' | 'top';
    loop?: boolean;
    trigger?: Snippet;
    children?: Snippet;
    class?: string;
    triggerClass?: string;
    menuClass?: string;
    portal?: string | HTMLElement;
    gutter?: number;
  }

  let {
    open = $bindable(false),
    onOpenChange,
    items = [],
    positioning = 'bottom-start',
    loop = true,
    trigger,
    children,
    class: className = '',
    triggerClass = '',
    menuClass = '',
    portal: portalTarget = null,
    gutter = 8
  }: Props = $props();

  const {
    elements: { 
      trigger: triggerElement, 
      menu: menuElement, 
      item: itemElement,
      separator: separatorElement
    },
    states: { open: menuOpen }
  } = createDropdownMenu({
    onOpenChange: onOpenChange ? (details: any) => {
      onOpenChange(details.next);
      return details.next;
    } : undefined,
    positioning: {
      placement: positioning,
      gutter,
      sameWidth: false,
      offset: { mainAxis: 0, crossAxis: -40 }
    },
    loop,
    preventScroll: false,
    escapeBehavior: 'close',
    closeOnOutsideClick: true,
    portal: portalTarget,
    forceVisible: false,
    openFocus: undefined,
    closeFocus: undefined,
    disableTransition: true
  });

  // Sync bindable open state
  $effect(() => {
    open = $menuOpen;
  });

  // Handle item selection
  const handleItemSelect = (item: MenuItemData) => {
    if (item.disabled) return;
    item.onSelect?.();
  };

  const defaultTriggerClasses = 'btn btn-ghost min-h-[44px] px-4 py-2 font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 transition-colors duration-200 inline-flex items-center justify-center';
  
  const defaultMenuClasses = 'menu bg-white';
  
  // If triggerClass is provided, use it directly without defaults to avoid btn styling conflicts
  const triggerClasses = $derived(triggerClass ? `${triggerClass} ${className}` : `${defaultTriggerClasses} ${className}`);
  const menuClasses = $derived(menuClass || defaultMenuClasses);
</script>

<!-- Trigger Button -->
<button 
  use:triggerElement
  class="{triggerClasses} focus:!outline-none active:!outline-none"
  aria-haspopup="true"
  aria-expanded={$menuOpen}
  style="outline: none !important; box-shadow: none !important;"
>
  {#if trigger}
    {@render trigger()}
  {:else}
    Menu
    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
    </svg>
  {/if}
</button>

<!-- Menu Content -->
{#if $menuOpen}
  <div 
    use:menuElement
    class={menuClasses}
    style="background-color: white !important;"
    role="menu"
    tabindex="-1"
  >
    <!-- Static Menu Items from Array -->
    {#each items as item (item.id)}
      {#if item.separator}
        <div class="menu-separator" role="separator"></div>
      {:else}
        <button
          use:itemElement
          class="menu-item"
          disabled={item.disabled}
          role="menuitem"
          onclick={() => handleItemSelect(item)}
        >
          <div class="flex items-center gap-3">
            {#if item.icon}
              <span class="w-4 h-4 text-gray-500">{item.icon}</span>
            {/if}
            <span>{item.label}</span>
          </div>
          {#if item.shortcut}
            <span class="text-xs text-gray-400 font-mono">{item.shortcut}</span>
          {/if}
        </button>
      {/if}
    {/each}

    <!-- Custom Menu Items via Snippet -->
    {#if children}
      {#if items.length > 0}
        <div class="menu-separator" role="separator"></div>
      {/if}
      {@render children()}
    {/if}
  </div>
{/if}

<style>
  /* Perfect dropdown animation - clean slide down from top */
  :global([data-side="bottom"][data-align="end"]) {
    transform-origin: top right !important;
  }

  /* Custom dropdown entrance animation */
  :global(.menu[data-side="bottom"][data-align="end"]) {
    animation: dropdown-slide-in 200ms cubic-bezier(0.16, 1, 0.3, 1) both !important;
  }

  @keyframes dropdown-slide-in {
    0% {
      opacity: 0;
      transform: translateY(-12px) scale(0.95);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Disable any conflicting Melt UI animations */
  :global([data-side="bottom"][data-align="end"] > *) {
    transition: none !important;
    animation: none !important;
  }

  /* Menu item hover states */
  .menu-item:hover:not(:disabled) {
    background-color: oklch(98% 0.01 250);
  }

  .menu-item:focus-visible {
    background-color: oklch(96% 0.02 250);
    outline: 2px solid oklch(60% 0.2 250);
    outline-offset: -2px;
  }

  /* Mobile-first responsive design */
  @media (max-width: 640px) {
    :global([data-menu-content]) {
      min-width: 14rem;
      max-width: calc(100vw - 2rem);
    }
    
    /* Ensure touch targets are at least 44px on mobile for primary actions */
    .menu-item {
      min-height: 44px;
      padding: 12px 16px;
    }
    
    /* Adjust font size for mobile readability */
    .menu-item {
      font-size: 16px;
      line-height: 1.5;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .menu-item:hover:not(:disabled) {
      background-color: oklch(85% 0.05 250);
      color: oklch(10% 0.02 250);
    }
    
    .menu-item:focus-visible {
      outline-width: 3px;
    }
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    :global([data-menu-content]) {
      animation: none;
    }
    
    .menu-item {
      transition: none;
    }
  }
</style>