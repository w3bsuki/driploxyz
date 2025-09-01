/**
 * Navigation utilities that respect user preferences and accessibility
 */

/**
 * Scrolls to top of page or container with respect for user motion preferences
 * @param container - Optional container element to scroll within
 */
export function scrollToTop(container?: Element) {
  const target = container || document.documentElement;
  
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Instant scroll for users who prefer reduced motion
    if (container) {
      container.scrollTop = 0;
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  } else {
    // Smooth scroll for users who don't mind motion
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

/**
 * Scrolls an element into view with accessibility considerations
 * @param element - Element to scroll into view
 * @param options - Scroll options
 */
export function scrollIntoView(element: Element, options?: {
  block?: 'start' | 'center' | 'end' | 'nearest';
  inline?: 'start' | 'center' | 'end' | 'nearest';
  focus?: boolean;
}) {
  const { block = 'start', inline = 'nearest', focus = false } = options || {};
  
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior = prefersReducedMotion ? 'auto' : 'smooth';
  
  // Scroll element into view
  element.scrollIntoView({
    behavior,
    block,
    inline
  });
  
  // Optionally focus the element for better accessibility
  if (focus && 'focus' in element && typeof element.focus === 'function') {
    // Add a brief delay to ensure scroll completes
    setTimeout(() => {
      (element as HTMLElement).focus({ preventScroll: true });
    }, prefersReducedMotion ? 0 : 300);
  }
}

/**
 * Focuses an element and announces step progression to screen readers
 * @param element - Element to focus
 * @param announcement - Optional announcement text
 */
export function focusWithAnnouncement(element: HTMLElement, announcement?: string) {
  // Set focus
  element.focus({ preventScroll: false });
  
  // Make announcement to screen readers if provided
  if (announcement) {
    // Create temporary live region for announcement
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = announcement;
    
    document.body.appendChild(liveRegion);
    
    // Clean up after announcement
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);
  }
}

/**
 * Sets up step container with proper accessibility attributes for multi-step forms
 * @param container - Step container element
 * @param stepNumber - Current step number
 * @param totalSteps - Total number of steps
 * @param stepTitle - Title of the current step
 */
export function setupStepContainer(
  container: HTMLElement, 
  stepNumber: number, 
  totalSteps: number, 
  stepTitle: string
) {
  // Set ARIA attributes for step navigation
  container.setAttribute('role', 'region');
  container.setAttribute('aria-label', `Step ${stepNumber} of ${totalSteps}: ${stepTitle}`);
  container.setAttribute('tabindex', '-1');
  
  return container;
}

/**
 * Adds screen reader only text for better accessibility
 * @param text - Text to be announced to screen readers
 * @returns HTMLElement that can be inserted into DOM
 */
export function createScreenReaderText(text: string): HTMLElement {
  const element = document.createElement('span');
  element.textContent = text;
  element.className = 'sr-only';
  element.setAttribute('aria-live', 'polite');
  
  return element;
}