<script lang="ts">
  import type { BadgeVariant, BadgeSize } from '../../types';

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

  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  const variantClasses = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-800',
    secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
    error: 'bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200',
    success: 'bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200',
    warning: 'bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200',
    info: 'bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200',
    outline: 'border border-zinc-200 text-zinc-900 hover:bg-zinc-50',
    subtle: 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
  } as const satisfies Record<BadgeVariant, string>;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] leading-none',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  } as const satisfies Record<BadgeSize, string>;

  const classes = $derived(`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`);
</script>

<svelte:element
  this={href ? 'a' : 'span'}
  {href}
  class={classes}
>
  {@render children?.()}
</svelte:element>