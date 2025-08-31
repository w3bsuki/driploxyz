export { default as Tooltip } from './Tooltip.svelte';

export interface TooltipPosition {
  side: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
}

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
   * Whether to close on escape key
   * @default true
   */
  closeOnEscape?: boolean;
  
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
}

// Re-export common types
export type { Snippet } from 'svelte';