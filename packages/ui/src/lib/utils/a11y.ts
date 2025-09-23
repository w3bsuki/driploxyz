/**
 * Accessibility utilities for focus management, live regions, and keyboard navigation
 * Used across dialogs, modals, search dropdowns, and other interactive components
 */

/**
 * Creates a focus trap for modal dialogs and dropdowns
 * Traps tab navigation within the specified element
 * 
 * @param element - The element to trap focus within
 * @returns Cleanup function to remove the trap
 * 
 * @example
 * ```ts
 * // In a Svelte component
 * let dialogElement: HTMLElement;
 * let cleanupTrap: (() => void) | null = null;
 * 
 * function openDialog() {
 *   cleanupTrap = trapFocus(dialogElement);
 * }
 * 
 * function closeDialog() {
 *   cleanupTrap?.();
 * }
 * ```
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  function handleTabKey(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;
    
    if (event.shiftKey) {
      // Shift + Tab (backwards)
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        event.preventDefault();
      }
    } else {
      // Tab (forwards)
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        event.preventDefault();
      }
    }
  }
  
  // Focus first element immediately
  firstFocusable?.focus();
  
  // Add event listener
  document.addEventListener('keydown', handleTabKey);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Returns focus to a previously focused element
 * Used when closing dialogs, dropdowns, or other overlays
 * 
 * @param previousElement - Element that should regain focus
 * 
 * @example
 * ```ts
 * // Store reference when opening modal
 * const previouslyFocused = document.activeElement as HTMLElement;
 * 
 * // Return focus when closing
 * returnFocus(previouslyFocused);
 * ```
 */
export function returnFocus(previousElement: HTMLElement | null): void {
  if (previousElement && typeof previousElement.focus === 'function') {
    // Use setTimeout to ensure modal is completely closed first
    setTimeout(() => {
      previousElement.focus();
    }, 10);
  }
}

/**
 * Announces content to screen readers using a live region
 * Useful for dynamic content changes, search results, form validation
 * 
 * @param message - Message to announce
 * @param priority - 'polite' (default) or 'assertive' for urgency
 * 
 * @example
 * ```ts
 * // Announce search results
 * announceToScreenReader('5 products found', 'polite');
 * 
 * // Announce errors assertively
 * announceToScreenReader('Form submission failed', 'assertive');
 * ```
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.style.position = 'absolute';
  liveRegion.style.left = '-10000px';
  liveRegion.style.width = '1px';
  liveRegion.style.height = '1px';
  liveRegion.style.overflow = 'hidden';
  
  document.body.appendChild(liveRegion);
  
  // Set message after a brief delay to ensure screen readers pick it up
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 10);
  
  // Clean up after announcement
  setTimeout(() => {
    document.body.removeChild(liveRegion);
  }, 1000);
}

/**
 * Generates a unique ID for accessibility relationships
 * Used for aria-describedby, aria-labelledby, aria-controls, etc.
 * 
 * @param prefix - Prefix for the ID (e.g., 'search', 'dialog', 'error')
 * @returns Unique ID string
 * 
 * @example
 * ```ts
 * const searchId = generateA11yId('search'); // 'search-a11y-1234'
 * const errorId = generateA11yId('error');   // 'error-a11y-5678'
 * ```
 */
export function generateA11yId(prefix: string): string {
  return `${prefix}-a11y-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Checks if an element is visible to screen readers and users
 * Useful for determining if focus management should apply
 * 
 * @param element - Element to check
 * @returns Whether element is visible
 */
export function isElementVisible(element: HTMLElement): boolean {
  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length
  );
}

/**
 * Manages scroll locking for modal dialogs and overlays
 * Prevents background scrolling while maintaining scroll position
 * 
 * @param lock - Whether to lock or unlock scroll
 * 
 * @example
 * ```ts
 * // Lock scroll when opening modal
 * lockScroll(true);
 * 
 * // Unlock scroll when closing modal
 * lockScroll(false);
 * ```
 */
let originalOverflow = '';
let originalPaddingRight = '';

export function lockScroll(lock: boolean): void {
  const body = document.body;
  
  if (lock) {
    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Store original values
    originalOverflow = body.style.overflow;
    originalPaddingRight = body.style.paddingRight;
    
    // Apply lock
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
  } else {
    // Restore original values
    body.style.overflow = originalOverflow;
    body.style.paddingRight = originalPaddingRight;
  }
}

/**
 * Keyboard navigation handler for listbox/menu patterns
 * Handles Arrow keys, Home, End, Enter, Escape
 * 
 * @param event - Keyboard event
 * @param options - Navigation options
 * @returns Whether the event was handled
 * 
 * @example
 * ```ts
 * function handleKeyDown(event: KeyboardEvent) {
 *   const handled = handleKeyboardNavigation(event, {
 *     items: menuItems,
 *     activeIndex: currentIndex,
 *     onMove: (newIndex) => setCurrentIndex(newIndex),
 *     onSelect: (index) => selectItem(index),
 *     onEscape: () => closeMenu()
 *   });
 *   
 *   if (handled) {
 *     event.preventDefault();
 *   }
 * }
 * ```
 */
export interface KeyboardNavigationOptions {
  items: any[];
  activeIndex: number;
  onMove: (newIndex: number) => void;
  onSelect: (index: number) => void;
  onEscape?: () => void;
  loop?: boolean; // Whether to loop from last to first item
}

export function handleKeyboardNavigation(
  event: KeyboardEvent,
  options: KeyboardNavigationOptions
): boolean {
  const { items, activeIndex, onMove, onSelect, onEscape, loop = true } = options;
  
  switch (event.key) {
    case 'ArrowDown':
      if (activeIndex < items.length - 1) {
        onMove(activeIndex + 1);
      } else if (loop) {
        onMove(0);
      }
      return true;
      
    case 'ArrowUp':
      if (activeIndex > 0) {
        onMove(activeIndex - 1);
      } else if (loop) {
        onMove(items.length - 1);
      }
      return true;
      
    case 'Home':
      onMove(0);
      return true;
      
    case 'End':
      onMove(items.length - 1);
      return true;
      
    case 'Enter':
    case ' ':
      onSelect(activeIndex);
      return true;
      
    case 'Escape':
      onEscape?.();
      return true;
      
    default:
      return false;
  }
}