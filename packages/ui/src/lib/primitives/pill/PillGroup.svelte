<script lang="ts">
  // Simple roving tabindex group for Pills, horizontal by default
  interface PillGroupProps {
    orientation?: 'horizontal' | 'vertical';
    class?: string;
    id?: string;
    ariaLabel?: string;
    children?: () => any;
  }

  let {
    orientation = 'horizontal',
    class: className = '',
    id,
    ariaLabel,
    children
  }: PillGroupProps = $props();

  let container: HTMLElement;

  const keyToDelta: Record<string, number> = {
    ArrowRight: 1,
    ArrowDown: 1,
    ArrowLeft: -1,
    ArrowUp: -1
  };

  function onKeydown(e: KeyboardEvent) {
    const horiz = orientation === 'horizontal';
    const isNavKey = horiz
      ? e.key === 'ArrowRight' || e.key === 'ArrowLeft'
      : e.key === 'ArrowDown' || e.key === 'ArrowUp';
    if (!isNavKey) return;

    e.preventDefault();
    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>('[data-pill]:not([disabled])')
    );
    if (!focusables.length) return;
    const currentIndex = focusables.findIndex((el) => el === document.activeElement);
    const delta = keyToDelta[e.key] ?? 0;
    const nextIndex = (currentIndex + delta + focusables.length) % focusables.length;
    focusables[nextIndex]?.focus();
  }
</script>

<div
  bind:this={container}
  role="toolbar"
  aria-label={ariaLabel}
  id={id}
  class={`inline-flex ${orientation === 'horizontal' ? 'flex-row flex-wrap gap-2' : 'flex-col gap-2'} ${className}`}
  tabindex={0}
  onkeydown={onKeydown}
>
  {@render children?.()}
  <!-- Consumers should ensure each direct child sets tabindex="0" by default; we rely on native focus of <button>/<a> -->
</div>

<!-- styling is provided by utility classes; no component-scoped style block to avoid PostCSS -->
