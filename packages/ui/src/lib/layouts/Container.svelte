<script lang="ts">
  import type { Snippet } from 'svelte';

  type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  type Align = 'start' | 'center' | 'end';

  interface Props {
    as?: keyof HTMLElementTagNameMap;
    size?: ContainerSize;
    padded?: boolean;
    align?: Align;
    class?: string;
    children?: Snippet;
  }

  let {
    as = 'div',
    size = 'xl',
    padded = true,
    align = 'center',
    class: className = '',
    children
  }: Props = $props();

  const maxWidthClass: Record<ContainerSize, string> = {
    xs: 'max-w-[min(100%,var(--container-xs))]',
    sm: 'max-w-[min(100%,var(--container-sm))]',
    md: 'max-w-[min(100%,var(--container-md))]',
    lg: 'max-w-[min(100%,var(--container-lg))]',
    xl: 'max-w-[min(100%,var(--container-xl))]',
    '2xl': 'max-w-[min(100%,var(--container-2xl))]',
    '3xl': 'max-w-[min(100%,var(--container-3xl))]',
    full: 'max-w-none'
  };

  const alignmentClass: Record<Align, string> = {
    start: 'ms-0 me-auto',
    center: 'mx-auto',
    end: 'ms-auto me-0'
  };

  const paddingClasses =
    'ps-[max(var(--layout-gutter-xs),var(--safe-area-left))] pe-[max(var(--layout-gutter-xs),var(--safe-area-right))] ' +
    'sm:ps-[max(var(--layout-gutter-sm),var(--safe-area-left))] sm:pe-[max(var(--layout-gutter-sm),var(--safe-area-right))] ' +
    'lg:ps-[max(var(--layout-gutter-lg),var(--safe-area-left))] lg:pe-[max(var(--layout-gutter-lg),var(--safe-area-right))]';

  const classes = $derived(
    `w-full ${alignmentClass[align]} ${maxWidthClass[size]} ${padded ? paddingClasses : ''} ${className}`.trim()
  );

  const blockPaddingStyle =
    'padding-block-start: var(--safe-area-top); padding-block-end: max(var(--layout-gutter-xs), var(--safe-area-bottom));';
</script>

<svelte:element
  this={as}
  class={classes}
  data-ui-container
  style={blockPaddingStyle}
>
  {@render children?.()}
</svelte:element>
