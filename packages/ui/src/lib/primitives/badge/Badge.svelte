<script lang="ts">
  import type { BadgeVariant, BadgeSize } from '../../types';
  import { badgeVariants } from '../../utils/variants';

  interface Props {
    variant?: BadgeVariant;
    size?: BadgeSize;
    class?: string;
    children?: import('svelte').Snippet;
    href?: string;
  }

  let {
    variant = 'primary',
    size = 'md',
    class: className = '',
    children,
    href
  }: Props = $props();

  const classes = $derived(badgeVariants({ variant, size }, className));
</script>

<svelte:element
  this={href ? 'a' : 'span'}
  {href}
  class={classes}
>
  {@render children?.()}
</svelte:element>