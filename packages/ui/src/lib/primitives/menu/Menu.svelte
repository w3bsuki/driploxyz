<script lang="ts">
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
    portal?: string | HTMLElement | null;
    gutter?: number;
    ariaLabel?: string;
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
    gutter = 8,
    ariaLabel = ''
  }: Props = $props();

  // Simple state management
  let triggerElement: HTMLElement | undefined = $state();
  let menuElement: HTMLElement | undefined = $state();
  let focusedIndex = $state(-1);

  // Toggle dropdown
  function toggleDropdown() {
    open = !open;
    onOpenChange?.(open);
    if (open) {
      focusedIndex = 0;
    }
  }

  // Close dropdown
  function closeDropdown() {
    open = false;
    onOpenChange?.(false);
    focusedIndex = -1;
  }

  // Handle item selection
  function handleItemSelect(item: MenuItemData) {
    if (item.disabled) return;
    item.onSelect?.();
    closeDropdown();
  }

  // Handle click outside
  function handleClickOutside(event: MouseEvent) {
    if (!triggerElement?.contains(event.target as HTMLElement) &&
        !menuElement?.contains(event.target as HTMLElement)) {
      closeDropdown();
    }
  }

  // Handle keyboard navigation
  function handleTriggerKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        toggleDropdown();
      }
    }
  }

  function handleMenuKeydown(event: KeyboardEvent) {
    const activeItems = items.filter(item => !item.disabled && !item.separator);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusedIndex = (focusedIndex + 1) % activeItems.length;
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusedIndex = focusedIndex <= 0 ? activeItems.length - 1 : focusedIndex - 1;
        break;
      case 'Escape':
        event.preventDefault();
        closeDropdown();
        triggerElement?.focus();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < activeItems.length) {
          const item = activeItems[focusedIndex];
          handleItemSelect(item);
        }
        break;
    }
  }

  // Set up global listeners
  $effect(() => {
    if (open) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleMenuKeydown);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleMenuKeydown);
    };
  });

  const defaultTriggerClasses = 'btn btn-ghost min-h-[44px] px-4 py-2 font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 transition-colors duration-200 inline-flex items-center justify-center';

  const defaultMenuClasses = 'menu';

  // If triggerClass is provided, use it directly without defaults to avoid btn styling conflicts
  const triggerClasses = $derived(triggerClass ? `${triggerClass} ${className}` : `${defaultTriggerClasses} ${className}`);
  const menuClasses = $derived(menuClass || defaultMenuClasses);

  // Calculate position based on positioning prop
  const menuStyle = $derived(() => {
    const baseStyles = 'z-50 min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2';

    const positionClasses = {
      'bottom-start': 'top-full left-0 mt-1',
      'bottom-end': 'top-full right-0 mt-1',
      'top-start': 'bottom-full left-0 mb-1',
      'top-end': 'bottom-full right-0 mb-1',
      'bottom': 'top-full left-1/2 transform -translate-x-1/2 mt-1',
      'top': 'bottom-full left-1/2 transform -translate-x-1/2 mb-1'
    };

    return `${baseStyles} ${positionClasses[positioning]}`;
  });
</script>

<!-- Trigger Button -->
<button
  bind:this={triggerElement}
  class="{triggerClasses} focus:!outline-none active:!outline-none"
  aria-haspopup="true"
  aria-expanded={open}
  aria-label={ariaLabel || undefined}
  style="outline: none !important; box-shadow: none !important;"
  onclick={toggleDropdown}
  onkeydown={handleTriggerKeydown}
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
{#if open}
  <div
    bind:this={menuElement}
    class="{menuClasses} {menuStyle}"
    role="menu"
    tabindex="-1"
  >
    <!-- Static Menu Items from Array -->
    {#each items.filter(item => !item.separator) as item, index (item.id)}
      <button
        class="menu-item relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
        disabled={item.disabled}
        role="menuitem"
        tabindex={index === focusedIndex ? 0 : -1}
        onclick={() => handleItemSelect(item)}
      >
        <div class="flex items-center gap-3 flex-1">
          {#if item.icon}
            <span class="w-4 h-4 text-gray-500">{item.icon}</span>
          {/if}
          <span>{item.label}</span>
        </div>
        {#if item.shortcut}
          <span class="text-xs text-gray-400 font-mono ml-auto">{item.shortcut}</span>
        {/if}
      </button>
    {/each}

    <!-- Separators -->
    {#each items.filter(item => item.separator) as item (item.id)}
      <div class="menu-separator px-1 py-1" role="separator">
        <div class="h-px bg-gray-200 my-1"></div>
      </div>
    {/each}

    <!-- Custom Menu Items via Snippet -->
    {#if children}
      {#if items.length > 0}
        <div class="menu-separator px-1 py-1" role="separator">
          <div class="h-px bg-gray-200 my-1"></div>
        </div>
      {/if}
      {@render children()}
    {/if}
  </div>
{/if}

<style>
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
    .menu-item {
      min-height: 44px;
      padding: 12px 16px;
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
    .menu-item {
      transition: none;
    }
  }
</style>