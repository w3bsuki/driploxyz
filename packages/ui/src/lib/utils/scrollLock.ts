/**
 * Scroll lock utility for modals and overlays
 * Prevents body scroll when modal is open while maintaining scroll position
 */

interface ScrollLockState {
  overflow: string;
  paddingRight: string;
  scrollbarWidth: string;
}

let scrollLockCount = 0;
let originalBodyStyle: ScrollLockState | null = null;

/**
 * Get scrollbar width to prevent layout shift
 */
function getScrollbarWidth(): number {
  if (typeof document === 'undefined') return 0;

  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  (outer.style as any).msOverflowStyle = 'scrollbar';
  document.body.appendChild(outer);

  const inner = document.createElement('div');
  outer.appendChild(inner);

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  outer.parentNode?.removeChild(outer);

  return scrollbarWidth;
}

/**
 * Lock body scroll when modal is open
 */
export function lockScroll(): void {
  if (typeof document === 'undefined') return;

  scrollLockCount++;

  if (scrollLockCount === 1) {
    // Store original body styles
    originalBodyStyle = {
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
      scrollbarWidth: document.body.style.scrollbarWidth
    };

    const scrollbarWidth = getScrollbarWidth();

    // Apply scroll lock styles
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.scrollbarWidth = 'none';

    // Add data attribute for CSS targeting
    document.documentElement.setAttribute('data-scroll-locked', 'true');
  }
}

/**
 * Unlock body scroll when modal is closed
 */
export function unlockScroll(): void {
  if (typeof document === 'undefined') return;

  scrollLockCount = Math.max(0, scrollLockCount - 1);

  if (scrollLockCount === 0 && originalBodyStyle) {
    // Restore original body styles
    document.body.style.overflow = originalBodyStyle.overflow;
    document.body.style.paddingRight = originalBodyStyle.paddingRight;
    document.body.style.scrollbarWidth = originalBodyStyle.scrollbarWidth;

    // Remove data attribute
    document.documentElement.removeAttribute('data-scroll-locked');

    originalBodyStyle = null;
  }
}

/**
 * Check if scroll is currently locked
 */
export function isScrollLocked(): boolean {
  return scrollLockCount > 0;
}

/**
 * Force unlock scroll (emergency reset)
 */
export function forceUnlockScroll(): void {
  scrollLockCount = 0;
  if (typeof document !== 'undefined' && originalBodyStyle) {
    document.body.style.overflow = originalBodyStyle.overflow;
    document.body.style.paddingRight = originalBodyStyle.paddingRight;
    document.body.style.scrollbarWidth = originalBodyStyle.scrollbarWidth;
    document.documentElement.removeAttribute('data-scroll-locked');
    originalBodyStyle = null;
  }
}