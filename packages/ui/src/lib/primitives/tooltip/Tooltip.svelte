<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ClassValue } from 'svelte/elements';

  interface TooltipPosition {
    side: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
  }

  /**
   * Tooltip component for contextual help and information.
   * 
   * @example
   * ```svelte
   * <Tooltip content="Help text" tooltipClass={{ 'bg-blue-500': isImportant }}>
   *   <button>Hover me</button>
   * </Tooltip>
   * ```
   */
  export interface TooltipProps {
    /**
     * Whether the tooltip is open
     */
    open?: boolean;

    /**
     * Callback when open state changes
     */
    onOpenChange?: (open: boolean) => void;

    /**
     * Tooltip content text
     */
    content: string;

    /**
     * Positioning for the tooltip
     * @default { side: 'top', align: 'center' }
     */
    positioning?: TooltipPosition;

    /**
     * Delay before showing tooltip on hover (ms)
     * @default 700
     */
    openDelay?: number;

    /**
     * Delay before hiding tooltip after leaving (ms)
     * @default 300
     */
    closeDelay?: number;


    /**
     * Whether to close when trigger loses focus
     * @default true
     */
    closeOnPointerDown?: boolean;

    /**
     * Whether tooltip is disabled
     * @default false
     */
    disabled?: boolean;

    /**
     * Custom CSS classes for trigger
     */
    triggerClass?: import('svelte/elements').ClassValue;

    /**
     * Custom CSS classes for tooltip content
     */
    tooltipClass?: import('svelte/elements').ClassValue;

    /**
     * Custom CSS classes for tooltip arrow
     */
    arrowClass?: import('svelte/elements').ClassValue;

    /**
     * Whether to force mobile behavior (always show on tap)
     * @default false
     */
    forceTouch?: boolean;

    /**
     * Trigger content (button, icon, etc.)
     */
    trigger?: Snippet;

    /**
     * Children content for slot-based usage
     */
    children?: Snippet;
  }
  
  type Props = TooltipProps;

  let {
    open = $bindable(false),
    onOpenChange,
    content,
    positioning = { side: 'top', align: 'center' },
    openDelay = 700,
    closeDelay = 300,
    closeOnPointerDown = true,
    disabled = false,
    triggerClass = '',
    tooltipClass = '',
    arrowClass = '',
    forceTouch = false,
    trigger,
    children
  }: Props = $props();

  // Simple state management
  let triggerElement: HTMLElement | undefined = $state();
  let tooltipElement: HTMLElement | undefined = $state();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  // Show tooltip
  function showTooltip() {
    if (disabled) return;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      open = true;
      onOpenChange?.(true);
    }, openDelay);
  }

  // Hide tooltip
  function hideTooltip() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      open = false;
      onOpenChange?.(false);
    }, closeDelay);
  }

  // Handle mouse events
  function handleMouseEnter() {
    showTooltip();
  }

  function handleMouseLeave() {
    hideTooltip();
  }

  // Handle touch events for mobile
  function handleTouchInteraction(event: Event) {
    event.preventDefault();
    open = !open;
    onOpenChange?.(open);
  }

  // Handle click events
  function handleClick(event: Event) {
    if (closeOnPointerDown) {
      open = false;
      onOpenChange?.(false);
    }
  }

  // Handle keyboard events
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      open = false;
      onOpenChange?.(false);
    }
  }

  // Check if we're on a touch device
  let isTouchDevice = $state(typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0));

  // Default styling classes
  const defaultTriggerClasses = 'inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 transition-all duration-150';

  const defaultTooltipClasses = 'tooltip z-50 px-3 py-2 text-xs font-medium text-white bg-[color:var(--gray-900)] border border-[color:var(--gray-800)] rounded-md shadow-lg max-w-xs break-words animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95';

  const defaultArrowClasses = 'fill-[color:var(--gray-900)]';

  const computedTriggerClasses = $derived(`${defaultTriggerClasses} ${triggerClass}`.trim());
  const computedTooltipClasses = $derived(`${defaultTooltipClasses} ${tooltipClass}`.trim());
  const computedArrowClasses = $derived(`${defaultArrowClasses} ${arrowClass}`.trim());

  // Calculate tooltip position
  const tooltipStyle = $derived(() => {
    const baseClasses = 'absolute z-50 pointer-events-none';

    const positionClasses = {
      'top': 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
      'bottom': 'top-full left-1/2 transform -translate-x-1/2 mt-2',
      'left': 'right-full top-1/2 transform -translate-y-1/2 mr-2',
      'right': 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    };

    const alignClasses = {
      'start': positioning.side === 'top' || positioning.side === 'bottom' ? 'left-0 transform -translate-x-0' : 'top-0 transform -translate-y-0',
      'center': 'left-1/2 transform -translate-x-1/2',
      'end': positioning.side === 'top' || positioning.side === 'bottom' ? 'right-0 transform -translate-x-0' : 'bottom-0 transform -translate-y-0'
    };

    return `${baseClasses} ${positionClasses[positioning.side]} ${positioning.align ? alignClasses[positioning.align] : ''}`;
  });
</script>

<!-- Trigger Element -->
<span
  bind:this={triggerElement}
  class={computedTriggerClasses}
  role="button"
  tabindex={disabled ? -1 : 0}
  aria-describedby={open ? 'tooltip-content' : undefined}
  aria-expanded={open}
  data-tooltip-trigger
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  onclick={handleClick}
  onkeydown={handleKeydown}
>
  {#if trigger}
    {@render trigger()}
  {:else if children}
    {@render children()}
  {/if}
</span>

<!-- Tooltip Content -->
{#if open && !disabled && content}
  <div
    bind:this={tooltipElement}
    id="tooltip-content"
    class={[
      computedTooltipClasses,
      {
        'tooltip-top': positioning.side === 'top',
        'tooltip-bottom': positioning.side === 'bottom',
        'tooltip-left': positioning.side === 'left',
        'tooltip-right': positioning.side === 'right'
      }
    ]}
    role="tooltip"
    data-tooltip-content
    data-side={positioning.side}
    data-align={positioning.align}
    style={tooltipStyle()}
  >
    <!-- Arrow -->
    <div
      class={[
        computedArrowClasses,
        {
          'arrow-top': positioning.side === 'top',
          'arrow-bottom': positioning.side === 'bottom',
          'arrow-left': positioning.side === 'left',
          'arrow-right': positioning.side === 'right'
        }
      ]}
      data-tooltip-arrow
    ></div>

    <!-- Content -->
    <span class="relative z-10">
      {content}
    </span>
  </div>
{/if}

<style>
  /* Arrow positioning */
  .arrow-top {
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
  }

  .arrow-bottom {
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
  }

  .arrow-left {
    position: absolute;
    right: -4px;
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
  }

  .arrow-right {
    position: absolute;
    left: -4px;
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
  }

  /* Arrow base styling */
  [data-tooltip-arrow] {
    width: 8px;
    height: 8px;
    border: 1px solid var(--gray-800);
    border-bottom: none;
    border-right: none;
    background: var(--gray-900);
  }

  /* Mobile-first responsive design */
  @media (max-width: 640px) {
    [data-tooltip-content] {
      max-width: calc(100vw - 2rem);
      font-size: 14px;
      padding: 8px 12px;
    }
  }

  /* Touch device optimizations */
  @media (pointer: coarse) {
    [data-tooltip-trigger] {
      min-width: var(--touch-standard);
      min-height: var(--touch-standard);
    }

    [data-tooltip-content] {
      font-size: 16px; /* Prevent zoom on iOS */
      padding: 12px 16px;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    [data-tooltip-content] {
      border: 2px solid;
      border-color: var(--gray-0);
    }

    [data-tooltip-arrow] {
      border-width: 2px;
      border-color: var(--gray-0);
    }
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    [data-tooltip-content] {
      animation: none;
    }
  }

  /* Focus visible improvements */
  @supports selector(:focus-visible) {
    [data-tooltip-trigger]:focus:not(:focus-visible) {
      outline: none;
      box-shadow: none;
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    [data-tooltip-content] {
      background-color: var(--gray-50);
      color: var(--gray-900);
      border-color: var(--gray-200);
    }

    [data-tooltip-arrow] {
      background-color: var(--gray-50);
      border-color: var(--gray-200);
    }
  }
</style>