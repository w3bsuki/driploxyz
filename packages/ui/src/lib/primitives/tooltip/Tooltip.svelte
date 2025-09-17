<script lang="ts">
  import { createTooltip } from '@melt-ui/svelte';
  import type { Snippet } from 'svelte';

  interface TooltipPosition {
    side: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
  }

  interface Props {
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
    triggerClass?: string;
    
    /**
     * Custom CSS classes for tooltip content
     */
    tooltipClass?: string;
    
    /**
     * Custom CSS classes for tooltip arrow
     */
    arrowClass?: string;
    
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

  // Build proper placement string for Melt UI
  const buildPlacement = (pos: TooltipPosition) => {
    if (!pos.align || pos.align === 'center') {
      return pos.side;
    }
    return `${pos.side}-${pos.align}` as const;
  };

  const {
    elements: { 
      trigger: triggerElement, 
      content: contentElement, 
      arrow: arrowElement 
    },
    states: { open: tooltipOpen }
  } = createTooltip({
    positioning: {
      placement: buildPlacement(positioning)
    },
    openDelay,
    closeDelay,
    closeOnPointerDown,
    onOpenChange: onOpenChange ? (details: any) => {
      onOpenChange(details.next);
      return details.next;
    } : undefined,
    disableHoverableContent: forceTouch,
    group: undefined, // Allow multiple tooltips
    forceVisible: false
  });

  // Sync bindable open state
  $effect(() => {
    open = $tooltipOpen;
  });

  // Check if we're on a touch device (initialize once, browser-only)
  let isTouchDevice = $state(typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0));

  // Default styling classes following design system
  const defaultTriggerClasses = 'inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 transition-all duration-150';
  
  const defaultTooltipClasses = 'tooltip z-50 px-3 py-2 text-xs font-medium text-white bg-[color:var(--gray-900)] border border-[color:var(--gray-800)] rounded-md shadow-lg max-w-xs break-words animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95';
  
  const defaultArrowClasses = 'fill-[color:var(--gray-900)]';

  const computedTriggerClasses = $derived(`${defaultTriggerClasses} ${triggerClass}`.trim());
  const computedTooltipClasses = $derived(`${defaultTooltipClasses} ${tooltipClass}`.trim());
  const computedArrowClasses = $derived(`${defaultArrowClasses} ${arrowClass}`.trim());

  // Handle touch interactions for mobile
  const handleTouchInteraction = (event: Event) => {
    if (isTouchDevice || forceTouch) {
      event.preventDefault();
      $tooltipOpen = !$tooltipOpen;
    }
  };
</script>

<!-- Trigger Element -->
<span
  use:triggerElement
  class={computedTriggerClasses}
  role="button"
  tabindex={disabled ? -1 : 0}
  aria-describedby={$tooltipOpen ? 'tooltip-content' : undefined}
  aria-expanded={$tooltipOpen}
  data-tooltip-trigger
  onclick={isTouchDevice || forceTouch ? handleTouchInteraction : undefined}
  onkeydown={(e: KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && (isTouchDevice || forceTouch)) {
      e.preventDefault();
      handleTouchInteraction(e);
    }
  }}
>
  {#if trigger}
    {@render trigger()}
  {:else if children}
    {@render children()}
  {/if}
</span>

<!-- Tooltip Content -->
{#if $tooltipOpen && !disabled && content}
  <div
    use:contentElement
    id="tooltip-content"
    class={computedTooltipClasses}
    role="tooltip"
    data-tooltip-content
    data-side={positioning.side}
    data-align={positioning.align}
  >
    <!-- Arrow -->
    <div
      use:arrowElement
      class={computedArrowClasses}
      data-tooltip-arrow
    ></div>
    
    <!-- Content -->
    <span class="relative z-10">
      {content}
    </span>
  </div>
{/if}

<style>
  /* Positioning based on side for arrow */
  :global([data-tooltip-content][data-side="top"] [data-tooltip-arrow]) {
    bottom: -4px;
    transform: rotate(45deg);
  }

  :global([data-tooltip-content][data-side="bottom"] [data-tooltip-arrow]) {
    top: -4px;
    transform: rotate(45deg);
  }

  :global([data-tooltip-content][data-side="left"] [data-tooltip-arrow]) {
    right: -4px;
    transform: rotate(45deg);
  }

  :global([data-tooltip-content][data-side="right"] [data-tooltip-arrow]) {
    left: -4px;
    transform: rotate(45deg);
  }

  /* Arrow base styling */
  :global([data-tooltip-arrow]) {
    position: absolute;
    width: 8px;
    height: 8px;
    border: 1px solid var(--gray-800);
    border-bottom: none;
    border-right: none;
    background: var(--gray-900);
  }

  /* Mobile-first responsive design */
  @media (max-width: 640px) {
    :global([data-tooltip-content]) {
      max-width: calc(100vw - 2rem);
      font-size: 14px;
      padding: 8px 12px;
    }
  }

  /* Touch device optimizations */
  @media (pointer: coarse) {
    :global([data-tooltip-trigger]) {
      min-width: var(--touch-standard);
      min-height: var(--touch-standard);
    }
    
    :global([data-tooltip-content]) {
      font-size: 16px; /* Prevent zoom on iOS */
      padding: 12px 16px;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    :global([data-tooltip-content]) {
      border: 2px solid;
      border-color: var(--gray-0);
    }
    
    :global([data-tooltip-arrow]) {
      border-width: 2px;
      border-color: var(--gray-0);
    }
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    :global([data-tooltip-content]) {
      animation: none;
    }
  }

  /* Focus visible improvements */
  @supports selector(:focus-visible) {
    :global([data-tooltip-trigger]:focus:not(:focus-visible)) {
      outline: none;
      box-shadow: none;
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    :global([data-tooltip-content]) {
      background-color: var(--gray-50);
      color: var(--gray-900);
      border-color: var(--gray-200);
    }
    
    :global([data-tooltip-arrow]) {
      background-color: var(--gray-50);
      border-color: var(--gray-200);
    }
  }

  /* Animation improvements */
  :global([data-tooltip-content]) {
    transform-origin: var(--radix-tooltip-content-transform-origin);
    animation-duration: 150ms;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* State-based positioning adjustments */
  :global([data-tooltip-content][data-side="top"]) {
    margin-bottom: 6px;
  }

  :global([data-tooltip-content][data-side="bottom"]) {
    margin-top: 6px;
  }

  :global([data-tooltip-content][data-side="left"]) {
    margin-right: 6px;
  }

  :global([data-tooltip-content][data-side="right"]) {
    margin-left: 6px;
  }
</style>