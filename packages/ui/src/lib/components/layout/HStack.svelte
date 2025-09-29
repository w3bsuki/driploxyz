<script lang="ts">
  import type { Snippet } from 'svelte';

  type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  type Justify = 'start' | 'center' | 'end' | 'between';

  interface Props {
    as?: keyof HTMLElementTagNameMap;
    gap?: StackGap;
    align?: Align;
    justify?: Justify;
    wrap?: boolean;
    class?: string;
    children?: Snippet;
  }

  let {
    as = 'div',
    gap = 'sm',
    align = 'center',
    justify = 'start',
    wrap = false,
    class: className = '',
    children
  }: Props = $props();

  const gapClass: Record<StackGap, string> = {
    none: 'gap-0',
    xs: 'gap-[var(--space-2)]',
    sm: 'gap-[var(--space-3)]',
    md: 'gap-[var(--space-4)]',
    lg: 'gap-[var(--space-6)]',
    xl: 'gap-[var(--space-8)]'
  };

  const alignClass: Record<Align, string> = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  };

  const justifyClass: Record<Justify, string> = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between'
  };

  const classes = $derived(
    `flex flex-row ${wrap ? 'flex-wrap' : 'flex-nowrap'} ${gapClass[gap]} ${alignClass[align]} ${justifyClass[justify]} ${className}`.trim()
  );
</script>

<svelte:element this={as} class={classes} data-ui-stack data-orientation="horizontal">
  {@render children?.()}
</svelte:element>
