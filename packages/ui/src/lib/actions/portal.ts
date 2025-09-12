/**
 * Svelte action to portal an element to a different DOM container (default: document.body).
 * This avoids stacking-context issues (e.g., overlays rendering behind content).
 */
export function portal(
  node: HTMLElement,
  target?: HTMLElement | string
) {
  if (typeof document === 'undefined') {
    // SSR no-op
    return {
      update: () => {},
      destroy: () => {}
    };
  }

  const anchor = document.createComment('portal-anchor');
  const parent = node.parentNode;
  if (parent) {
    parent.insertBefore(anchor, node);
  }

  function resolveTarget(t?: HTMLElement | string): HTMLElement {
    if (!t) return document.body;
    if (typeof t === 'string') {
      return document.querySelector(t) ?? document.body;
    }
    return t;
  }

  let currentTarget: HTMLElement = resolveTarget(target);
  currentTarget.appendChild(node);

  function update(newTarget?: HTMLElement | string) {
    const next = resolveTarget(newTarget);
    if (next !== currentTarget) {
      currentTarget = next;
      currentTarget.appendChild(node);
    }
  }

  function destroy() {
    // If original parent still exists, restore DOM to original position
    if (anchor.parentNode) {
      anchor.parentNode.insertBefore(node, anchor);
      anchor.parentNode.removeChild(anchor);
      return;
    }

    // Otherwise, remove the node safely to avoid lingering overlays
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }

  return { update, destroy };
}


